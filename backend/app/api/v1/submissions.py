"""Submission routes"""
from typing import Dict, Any
from flask import request, current_app
from flask_login import login_required, current_user
import os
from app.models import (
    Submission,
    Feedback,
    Course,
    SubmissionFile,
    Notification,
    User,
    PeerReview,
    SubmissionVersion,
)
from app.utils.dept_utils import get_current_department, get_or_create_department_course
from app.utils.model_utils import get_course_by_id, get_submission_by_id, get_user_by_id
from app.utils.response_utils import success_response, error_response, not_found_response, forbidden_response
from app.utils.validation import validate_required_fields
from app.config import DEFAULT_DEPARTMENT, MAX_FILE_SIZE
from app.services import ai_service, peer_matching_service
from app.exceptions.api_exceptions import ValidationError

from . import api_v1

bp = api_v1  # Use the v1 API blueprint

@bp.route('/submit', methods=['POST'])
@login_required
def submit_assignment() -> Dict[str, Any]:
    """Submit an assignment for AI review"""
    try:
        data = request.json or {}
        submission_department = data.get('department') or get_current_department()
        course_id = data.get('course_id')
        
        if not course_id:
            course = get_or_create_department_course(submission_department)
            course_id = course.id
        
        files_data = [f for f in data.get('files', []) if f.get('filename') and f.get('content')]
        content = data.get('content', '')
        
        # Validate file sizes
        for file_data in files_data:
            file_content = file_data.get('content', '')
            # Rough estimate: each character is ~1 byte, but base64 encoding increases size
            # Check if content looks like base64 (ends with = or ==)
            if len(file_content) > MAX_FILE_SIZE * 2:  # Allow some overhead for encoding
                return error_response(f'File {file_data.get("filename", "unknown")} exceeds maximum size of {MAX_FILE_SIZE // (1024*1024)}MB', 400)
        
        # Validate content size
        if len(content) > MAX_FILE_SIZE:
            return error_response(f'Content exceeds maximum size of {MAX_FILE_SIZE // (1024*1024)}MB', 400)
        
        if files_data:
            combined_content = "\n\n".join([
                f"=== FILE: {f.get('filename', 'unnamed')} ===\n{f.get('content', '')}"
                for f in files_data
            ])
        else:
            combined_content = content
        
        if not combined_content and not files_data:
            return error_response('Please provide either file(s) or content', 400)
        
        if not combined_content.strip():
            return error_response('Submission content cannot be empty', 400)
        
        course_obj = get_course_by_id(course_id)
        if not course_obj:
            return not_found_response('Course')
        
        saved_files = []
        submission_files = []
        for file_data in files_data:
            filename = file_data.get('filename', 'unnamed')
            file_ext = os.path.splitext(filename)[1][1:] if '.' in filename else ''
            submission_file = SubmissionFile(
                filename=filename,
                file_content=file_data.get('content', ''),
                file_type=file_ext
            )
            submission_files.append(submission_file)
            saved_files.append({
                'filename': filename,
                'content': file_data.get('content', ''),
                'file_type': file_ext
            })
        
        # Validate and sanitize assignment title
        assignment_title = data.get('title', 'Untitled Assignment').strip()
        if not assignment_title:
            assignment_title = 'Untitled Assignment'
        if len(assignment_title) > 200:  # Match model max_length
            assignment_title = assignment_title[:200]
        
        submission = Submission(
            user_id=current_user,
            course_id=course_obj,
            assignment_title=assignment_title,
            content=combined_content or 'No content provided',
            task_description=(data.get('task_description', '') or '').strip(),
            submission_type=data.get('type', 'code') or 'code',
            status='submitted',
            files=submission_files
        )
        submission.save()
        
        # Ensure course_id is valid before matching peers
        peers = []
        peers_info = []
        if course_obj:
            peers = peer_matching_service.match_peers(
                str(submission.id), str(current_user.id), str(course_obj.id), submission_department
            )

        # Create peer reviews for matched peers
        for peer_id in peers:
            reviewer = get_user_by_id(peer_id)
            if reviewer:
                peer_review = PeerReview(
                    submission_id=submission,
                    reviewer_id=reviewer,
                    status='pending'
                )
                peer_review.save()

                peers_info.append({
                    'id': str(reviewer.id),
                    'name': reviewer.name,
                    'email': reviewer.email,
                })
                
                notification = Notification(
                    user_id=reviewer,
                    title='New Peer Review Assigned',
                    message=f'You have been assigned to review: {submission.assignment_title}',
                    notification_type='review',
                    related_id=str(submission.id)
                )
                notification.save()

        # Fallback: if matching didn't find any peers (e.g., only one student in the system),
        # optionally assign self-review if enabled in config
        if not peers:
            from app.config import ALLOW_SELF_REVIEW
            if ALLOW_SELF_REVIEW:
                existing_self_review = PeerReview.objects(
                    submission_id=submission,
                    reviewer_id=current_user
                ).first()
                if not existing_self_review:
                    self_review = PeerReview(
                        submission_id=submission,
                        reviewer_id=current_user,
                        status='pending'
                    )
                    self_review.save()
                    peers.append(str(current_user.id))
                    peers_info.append({
                        'id': str(current_user.id),
                        'name': current_user.name,
                        'email': current_user.email,
                    })
        
        feedback_text = None
        if data.get('generate_feedback', False):
            feedback_text = ai_service.generate_feedback(
                content=submission.content,
                task_description=submission.task_description,
                submission_type=submission.submission_type,
                files=saved_files
            )
            
            scores_dict = {
                'correctness': ai_service.score_correctness(submission.content),
                'quality': ai_service.score_quality(submission.content),
                'completeness': ai_service.score_completeness(submission.content)
            }
            ai_feedback = Feedback(
                submission_id=submission,
                reviewer_id=None,
                feedback_text=feedback_text,
                feedback_type='ai'
            )
            ai_feedback.set_scores(scores_dict)
            ai_feedback.save()
            
            notification = Notification(
                user_id=current_user,
                title='Feedback Generated',
                message=f'AI feedback has been generated for your submission: {submission.assignment_title}',
                notification_type='feedback',
                related_id=str(submission.id)
            )
            notification.save()
        
        return success_response({
            'submission_id': str(submission.id),
            'feedback': feedback_text,
            'peers_assigned': len(peers),
            'peers': peers_info,
        })
    except ValidationError as e:
        return error_response(e.message, 400, getattr(e, 'errors', None))
    except Exception as e:
        current_app.logger.error(f"Failed to submit assignment: {str(e)}", exc_info=True)
        return error_response('Failed to submit assignment. Please try again.', 500)

@bp.route('/submissions')
@login_required
def get_submissions() -> Dict[str, Any]:
    """Get user's submissions"""
    try:
        if current_user.role == 'teacher':
            department_filter = request.args.get('department')
            if department_filter:
                users_in_dept = User.objects(department=department_filter, role='student').only('id')
                user_ids = [u.id for u in users_in_dept]
                submissions = Submission.objects(user_id__in=user_ids).limit(500)
            else:
                teacher_department = current_user.department
                if teacher_department:
                    users_in_dept = User.objects(department=teacher_department, role='student').only('id')
                    user_ids = [u.id for u in users_in_dept]
                    submissions = Submission.objects(user_id__in=user_ids).limit(500)
                else:
                    student_users = User.objects(role='student').only('id')
                    user_ids = [u.id for u in student_users]
                    submissions = Submission.objects(user_id__in=user_ids).limit(500)
        else:
            submissions = Submission.objects(user_id=current_user).limit(100)
        
        return success_response([{
            'id': str(s.id),
            'title': s.assignment_title,
            'type': s.submission_type,
            'status': s.status,
            'created_at': s.created_at.isoformat() if s.created_at else None,
            'user_name': s.user_id.name if s.user_id else 'Unknown',
            'department': getattr(s.user_id, 'department', DEFAULT_DEPARTMENT) if s.user_id else DEFAULT_DEPARTMENT,
            'content': s.content if current_user.role == 'teacher' else ''
        } for s in submissions])
    except Exception as e:
        current_app.logger.error(f"Failed to fetch submissions: {str(e)}", exc_info=True)
        return error_response('Failed to fetch submissions. Please try again.', 500)

@bp.route('/submission/<submission_id>')
@login_required
def get_submission(submission_id: str) -> Dict[str, Any]:
    """Get detailed submission with feedback"""
    try:
        submission = get_submission_by_id(submission_id)
        if not submission:
            return not_found_response('Submission')
        
        # Check authorization - ensure user_id exists before comparing
        if current_user.role != 'teacher' and (not submission.user_id or str(submission.user_id.id) != str(current_user.id)):
            return forbidden_response('You do not have permission to view this submission')
        
        feedbacks = Feedback.objects(submission_id=submission).limit(20)
        peer_reviews = PeerReview.objects(submission_id=submission).limit(20)
        files = submission.files or []
        
        return success_response({
            'submission': {
                'id': str(submission.id),
                'title': submission.assignment_title,
                'content': submission.content,
                'task_description': submission.task_description or '',
                'type': submission.submission_type,
                'status': submission.status,
                'created_at': submission.created_at.isoformat() if submission.created_at else None,
                'user_name': submission.user_id.name if submission.user_id else 'Unknown',
                'files': [{
                    'id': str(i),
                    'filename': f.filename,
                    'content': f.file_content,
                    'file_type': f.file_type
                } for i, f in enumerate(files)]
            },
            'feedbacks': [{
                'id': str(f.id),
                'text': f.feedback_text,
                'scores': f.get_scores(),
                'type': f.feedback_type,
                'reviewer_name': f.reviewer_id.name if f.reviewer_id else 'AI Assistant'
            } for f in feedbacks],
            'peer_reviews': [{
                'id': str(pr.id),
                'reviewer_name': pr.reviewer_id.name if pr.reviewer_id else 'Unknown',
                'status': pr.status
            } for pr in peer_reviews]
        })
    except Exception as e:
        current_app.logger.error(f"Failed to fetch submission: {str(e)}", exc_info=True)
        return error_response('Failed to fetch submission. Please try again.', 500)


@bp.route('/submission/<submission_id>/versions')
@login_required
def get_submission_versions(submission_id: str) -> Dict[str, Any]:
    """
    Get version history for a submission.

    NOTE: Version saving is not yet implemented in the frontend/backend workflow,
    so this currently returns an empty list unless versions are created elsewhere.
    """
    try:
        submission = get_submission_by_id(submission_id)
        if not submission:
            # If submission no longer exists, just return an empty list
            return success_response([])

        # Authorization: same rules as get_submission
        if current_user.role != 'teacher' and (
            not submission.user_id or str(submission.user_id.id) != str(current_user.id)
        ):
            # For versions, don't error loudly – just return no versions
            return success_response([])

        versions = SubmissionVersion.objects(submission_id=submission).order_by('-version_number').limit(50)

        data = [
            {
                'id': str(v.id),
                'version_number': v.version_number,
                'content': v.content or '',
                'created_at': v.created_at.isoformat() if v.created_at else None,
                'note': v.note or '',
            }
            for v in versions
        ]

        return success_response(data)
    except Exception as e:
        current_app.logger.error(f"Failed to fetch submission versions: {str(e)}", exc_info=True)
        # Return empty list rather than breaking the modal
        return success_response([])


@bp.route('/submission/<submission_id>/save-version', methods=['POST'])
@login_required
def save_submission_version(submission_id: str) -> Dict[str, Any]:
    """Save a new version of a submission"""
    try:
        submission = get_submission_by_id(submission_id)
        if not submission:
            return not_found_response('Submission')

        # Authorization: only the submission owner can save versions
        if not submission.user_id or str(submission.user_id.id) != str(current_user.id):
            return forbidden_response('You can only save versions of your own submissions')

        data = request.json or {}
        note = data.get('note', '').strip()[:500]  # Max 500 chars

        # Get the highest version number for this submission
        existing_versions = SubmissionVersion.objects(submission_id=submission).order_by('-version_number').limit(1)
        next_version = 1
        if existing_versions:
            next_version = existing_versions[0].version_number + 1

        # Create new version
        version = SubmissionVersion(
            submission_id=submission,
            content=submission.content or '',
            version_number=next_version,
            note=note
        )
        version.save()

        return success_response({
            'id': str(version.id),
            'version_number': version.version_number,
            'created_at': version.created_at.isoformat() if version.created_at else None,
            'note': version.note or '',
        })
    except Exception as e:
        current_app.logger.error(f"Failed to save submission version: {str(e)}", exc_info=True)
        return error_response('Failed to save version. Please try again.', 500)
