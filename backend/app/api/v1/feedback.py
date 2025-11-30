"""Feedback generation routes"""
from flask import request, current_app
from flask_login import login_required, current_user
from typing import Dict, Any
from app.models import Submission, Feedback, PeerReview, Notification, User
from app.utils.model_utils import get_submission_by_id, get_user_by_id
from app.utils.response_utils import success_response, error_response, not_found_response, forbidden_response
from app.utils.validation import validate_required_fields
from app.services import ai_service, peer_matching_service
from app.exceptions.api_exceptions import ValidationError

from . import api_v1
from app.middleware.security_middleware import limiter

bp = api_v1

@bp.route('/feedback')
@login_required
def feedback_page() -> Any:
    """Separate feedback page - redirect to React app"""
    from flask import redirect, url_for
    return redirect(url_for('static_routes.serve_react_app'))

@bp.route('/generate-feedback', methods=['POST'])
@login_required
@limiter.limit("10 per hour")  # Limit AI feedback generation to prevent abuse
def generate_feedback() -> Dict[str, Any]:
    """Generate fresh feedback for a submission"""
    try:
        data = request.json or {}
        submission_id = data.get('submission_id')
        
        if not submission_id:
            return error_response('submission_id is required', 400)
        
        submission = get_submission_by_id(submission_id)
        if not submission:
            return not_found_response('Submission')
        
        # Check authorization - ensure user_id exists before comparing
        if current_user.role != 'teacher' and (not submission.user_id or str(submission.user_id.id) != str(current_user.id)):
            return forbidden_response('You do not have permission to generate feedback for this submission')
        
        files = submission.files or []
        files_data = [{
            'filename': f.filename,
            'content': f.file_content,
            'file_type': f.file_type
        } for f in files]
        
        feedback_text = ai_service.generate_feedback(
            content=submission.content,
            task_description=submission.task_description or '',
            submission_type=submission.submission_type,
            files=files_data
        )
        
        existing_feedback = Feedback.objects(
            submission_id=submission,
            feedback_type='ai',
            reviewer_id=None
        ).first()
        
        if existing_feedback:
            existing_feedback.delete()
        
        existing_peer_reviews = PeerReview.objects(submission_id=submission).count()
        
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
        
        peers_assigned = 0
        if existing_peer_reviews == 0:
            try:
                submitter = submission.user_id
                submitter_department = submitter.department if submitter else None
                
                # Ensure required IDs exist before calling match_peers
                peers = []
                if not submission.user_id or not submission.course_id:
                    current_app.logger.warning(f"Submission {submission.id} missing user_id or course_id, skipping peer matching")
                else:
                    peers = peer_matching_service.match_peers(
                        str(submission.id), str(submission.user_id.id),
                        str(submission.course_id.id), submitter_department
                    )
                
                # If no peers matched and self-review is enabled, create self-review
                from app.config import ALLOW_SELF_REVIEW
                if not peers:
                    if ALLOW_SELF_REVIEW and submission.user_id:
                        peers = [str(submission.user_id.id)]
                
                for peer_id in peers:
                    reviewer = get_user_by_id(peer_id)
                    if reviewer:
                        # Skip if this would be a self-review and it's not allowed
                        if not ALLOW_SELF_REVIEW and str(reviewer.id) == str(submission.user_id.id):
                            continue
                            
                        peer_review = PeerReview(
                            submission_id=submission,
                            reviewer_id=reviewer,
                            status='pending'
                        )
                        peer_review.save()
                        
                        notification = Notification(
                            user_id=reviewer,
                            title='New Peer Review Assigned',
                            message=f'You have been assigned to review: {submission.assignment_title}',
                            notification_type='review',
                            related_id=str(submission.id)
                        )
                        notification.save()
                        peers_assigned += 1
            except Exception as e:
                from flask import current_app
                current_app.logger.warning(f"Failed to assign peers for submission {submission.id}: {e}")
        
        return success_response({
            'feedback': feedback_text,
            'fresh': True,
            'from_gemini': ai_service.use_gemini,
            'peers_assigned': peers_assigned
        })
    except ValidationError as e:
        return error_response(e.message, 400, getattr(e, 'errors', None))
    except Exception as e:
        current_app.logger.error(f"Failed to generate feedback: {str(e)}", exc_info=True)
        return error_response('Failed to generate feedback. Please try again.', 500)
