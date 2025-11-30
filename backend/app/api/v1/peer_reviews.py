"""Peer review routes"""
from flask import request, current_app
from flask_login import login_required, current_user
from datetime import datetime
from typing import Dict, Any, List
from app.models import PeerReview, Feedback, Submission, User
from app.utils.model_utils import get_peer_review_by_id, get_submission_by_id
from app.utils.response_utils import success_response, error_response, not_found_response, forbidden_response
from app.config import MAX_FILE_SIZE

from . import api_v1

bp = api_v1

@bp.route('/peer-reviews')
@login_required
def get_peer_reviews() -> Dict[str, Any]:
    """Get peer reviews assigned to current user"""
    try:
        # Only return reviews explicitly assigned to current user
        # Security: Removed global fallback that exposed all peer reviews
        reviews = list(PeerReview.objects(reviewer_id=current_user).order_by('-assigned_at').limit(50))
        
        # Pre-fetch related submissions to avoid N+1 queries
        submission_ids = [r.submission_id.id for r in reviews if r.submission_id]
        submissions = {str(s.id): s for s in Submission.objects(id__in=submission_ids).only('id', 'assignment_title', 'content', 'submission_type', 'user_id')}
        
        # Pre-fetch users to avoid N+1 queries
        user_ids = [s.user_id.id for s in submissions.values() if s.user_id]
        users = {str(u.id): u for u in User.objects(id__in=user_ids).only('id', 'name')}
        
        result = []
        for r in reviews:
            submission = submissions.get(str(r.submission_id.id)) if r.submission_id else None
            user = users.get(str(submission.user_id.id)) if submission and submission.user_id else None
            
            result.append({
                'id': str(r.id),
                'submission_id': str(r.submission_id.id) if r.submission_id else None,
                'submission_title': submission.assignment_title if submission else 'Unknown',
                'submission_content': submission.content[:500] if submission and submission.content else '',
                'submission_type': submission.submission_type if submission else 'unknown',
                'status': r.status,
                'submitted_by': user.name if user else 'Unknown',
                'assigned_at': r.assigned_at.isoformat() if r.assigned_at else None,
                'completed_at': r.completed_at.isoformat() if r.completed_at else None
            })
        
        return success_response(result)
    except Exception as e:
        current_app.logger.error(f"Failed to fetch peer reviews: {str(e)}", exc_info=True)
        return error_response('Failed to fetch peer reviews. Please try again.', 500)

@bp.route('/peer-review/<review_id>/submit', methods=['POST'])
@login_required
def submit_peer_review(review_id: str) -> Dict[str, Any]:
    """Submit peer review feedback"""
    try:
        review = get_peer_review_by_id(review_id)
        if not review:
            return not_found_response('Peer review')

        # Security: Proper authorization check - only assigned reviewer can submit
        if not review.reviewer_id or str(review.reviewer_id.id) != str(current_user.id):
            return forbidden_response('You are not assigned to review this submission')
        
        # Prevent reviewing already completed reviews
        if review.status == 'completed':
            return error_response('This peer review has already been completed', 400)
        
        # Prevent reviewing own submission (unless self-review is enabled)
        submission = review.submission_id
        if submission and submission.user_id:
            is_own_submission = str(submission.user_id.id) == str(current_user.id)
            if is_own_submission:
                from app.config import ALLOW_SELF_REVIEW
                if not ALLOW_SELF_REVIEW:
                    return forbidden_response('You cannot review your own submission')
        
        data = request.json or {}
        feedback_text = data.get('feedback', '')
        
        if not feedback_text.strip():
            return error_response('Feedback text is required', 400)
        
        # Sanitize feedback text (allow HTML for markdown formatting)
        from app.utils.security_utils import sanitize_input
        feedback_text = sanitize_input(feedback_text.strip(), allow_html=True)
        
        # Validate minimum feedback length
        if len(feedback_text.strip()) < 10:
            return error_response('Feedback must be at least 10 characters long', 400)
        
        # Validate feedback size
        if len(feedback_text) > MAX_FILE_SIZE:
            return error_response(f'Feedback too long. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB', 400)
        
        # Create Feedback record (this is the source of truth for feedback text)
        feedback = Feedback(
            submission_id=review.submission_id,
            reviewer_id=current_user,
            feedback_text=feedback_text,
            feedback_type='peer'
        )
        feedback.set_scores(data.get('scores', {}))
        feedback.save()
        
        # Update PeerReview status (don't duplicate feedback_text - fetch from Feedback when needed)
        review.status = 'completed'
        review.completed_at = datetime.utcnow()
        review.save()
        
        return success_response(message='Peer review submitted successfully')
    except Exception as e:
        current_app.logger.error(f"Failed to submit peer review: {str(e)}", exc_info=True)
        return error_response('Failed to submit peer review. Please try again.', 500)

@bp.route('/peer-review/<review_id>/delete', methods=['DELETE'])
@login_required
def delete_peer_review(review_id: str) -> Dict[str, Any]:
    """Delete a peer review (teachers only)"""
    try:
        if current_user.role != 'teacher':
            return forbidden_response('Only teachers can delete peer reviews')
        
        review = get_peer_review_by_id(review_id)
        if not review:
            return not_found_response('Peer review')
        
        feedback = Feedback.objects(
            submission_id=review.submission_id,
            reviewer_id=review.reviewer_id,
            feedback_type='peer'
        ).first()
        
        if feedback:
            feedback.delete()
        
        review.delete()
        
        return success_response(message='Peer review deleted successfully')
    except Exception as e:
        current_app.logger.error(f"Failed to delete peer review: {str(e)}", exc_info=True)
        return error_response('Failed to delete peer review. Please try again.', 500)

@bp.route('/submission/<submission_id>/peer-reviews')
@login_required
def get_submission_peer_reviews(submission_id: str) -> Dict[str, Any]:
    """Get all peer reviews for a submission (teachers can see all)"""
    try:
        submission = get_submission_by_id(submission_id)
        if not submission:
            return not_found_response('Submission')
        
        # Check authorization - ensure user_id exists before comparing
        if current_user.role != 'teacher' and (not submission.user_id or str(submission.user_id.id) != str(current_user.id)):
            return forbidden_response('You do not have permission to view peer reviews for this submission')
        
        peer_reviews = PeerReview.objects(submission_id=submission).limit(20)
        
        # Pre-fetch reviewers to avoid N+1 queries
        reviewer_ids = [pr.reviewer_id.id for pr in peer_reviews if pr.reviewer_id]
        reviewers = {str(u.id): u for u in User.objects(id__in=reviewer_ids).only('id', 'name')}
        
        # Pre-fetch feedback text from Feedback model (source of truth)
        peer_review_ids = [str(pr.id) for pr in peer_reviews]
        feedbacks = Feedback.objects(
            submission_id=submission,
            feedback_type='peer'
        ).only('reviewer_id', 'feedback_text')
        # Map reviewer_id to feedback_text for completed reviews
        feedback_map = {}
        for fb in feedbacks:
            if fb.reviewer_id:
                feedback_map[str(fb.reviewer_id.id)] = fb.feedback_text[:500] if fb.feedback_text else ''
        
        return success_response([{
            'id': str(pr.id),
            'reviewer_id': str(pr.reviewer_id.id) if pr.reviewer_id else None,
            'reviewer_name': reviewers.get(str(pr.reviewer_id.id)).name if pr.reviewer_id and str(pr.reviewer_id.id) in reviewers else 'Unknown',
            'status': pr.status,
            'feedback_text': feedback_map.get(str(pr.reviewer_id.id), '') if pr.reviewer_id else '',  # Fetch from Feedback model
            'assigned_at': pr.assigned_at.isoformat() if pr.assigned_at else None,
            'completed_at': pr.completed_at.isoformat() if pr.completed_at else None,
        } for pr in peer_reviews])
    except Exception as e:
        current_app.logger.error(f"Failed to fetch peer reviews: {str(e)}", exc_info=True)
        return error_response('Failed to fetch peer reviews. Please try again.', 500)

@bp.route('/submissions/peer-reviews/batch', methods=['POST'])
@login_required
def get_batch_peer_reviews() -> Dict[str, Any]:
    """Get peer reviews for multiple submissions in one request (for teacher view)"""
    try:
        if current_user.role != 'teacher':
            return forbidden_response('Only teachers can access batch peer reviews')
        
        data = request.json or {}
        submission_ids = data.get('submission_ids', [])
        
        if not submission_ids or not isinstance(submission_ids, list):
            return error_response('submission_ids array is required', 400)
        
        if len(submission_ids) > 100:  # Limit to prevent abuse
            return error_response('Maximum 100 submissions per request', 400)
        
        # Convert to ObjectIds
        from bson import ObjectId
        from bson.errors import InvalidId
        try:
            obj_ids = [ObjectId(sid) for sid in submission_ids]
        except (InvalidId, ValueError) as e:
            return error_response(f'Invalid submission ID format: {str(e)}', 400)
        
        # Get all peer reviews for these submissions
        peer_reviews = PeerReview.objects(submission_id__in=obj_ids).limit(500)
        
        # Pre-fetch reviewers
        reviewer_ids = [pr.reviewer_id.id for pr in peer_reviews if pr.reviewer_id]
        reviewers = {str(u.id): u for u in User.objects(id__in=reviewer_ids).only('id', 'name')}
        
        # Pre-fetch feedback text from Feedback model
        feedbacks = Feedback.objects(
            submission_id__in=obj_ids,
            feedback_type='peer'
        ).only('submission_id', 'reviewer_id', 'feedback_text')
        feedback_map = {}
        for fb in feedbacks:
            if fb.submission_id and fb.reviewer_id:
                key = f"{str(fb.submission_id.id)}_{str(fb.reviewer_id.id)}"
                feedback_map[key] = fb.feedback_text[:500] if fb.feedback_text else ''
        
        # Group by submission_id
        result = {}
        for pr in peer_reviews:
            sub_id = str(pr.submission_id.id) if pr.submission_id else None
            if not sub_id:
                continue
                
            if sub_id not in result:
                result[sub_id] = []
            
            reviewer_key = f"{sub_id}_{str(pr.reviewer_id.id)}" if pr.reviewer_id else None
            result[sub_id].append({
                'id': str(pr.id),
                'reviewer_id': str(pr.reviewer_id.id) if pr.reviewer_id else None,
                'reviewer_name': reviewers.get(str(pr.reviewer_id.id)).name if pr.reviewer_id and str(pr.reviewer_id.id) in reviewers else 'Unknown',
                'status': pr.status,
                'feedback_text': feedback_map.get(reviewer_key, '') if reviewer_key else '',
                'assigned_at': pr.assigned_at.isoformat() if pr.assigned_at else None,
                'completed_at': pr.completed_at.isoformat() if pr.completed_at else None,
            })
        
        return success_response(result)
    except Exception as e:
        current_app.logger.error(f"Failed to fetch batch peer reviews: {str(e)}", exc_info=True)
        return error_response('Failed to fetch batch peer reviews. Please try again.', 500)
