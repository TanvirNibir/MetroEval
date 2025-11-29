"""Teacher-specific routes"""
from flask import request, current_app
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from typing import Dict, Any
from app.models import User, Submission, Feedback, PeerReview
from app.services import performance_predictor_service, ai_service
from app.utils.response_utils import success_response, error_response, forbidden_response
from app.config import DEPARTMENT_OPTIONS

from . import api_v1

bp = api_v1


@bp.route('/teacher/progress/<department>')
@login_required
def get_department_progress(department: str) -> Dict[str, Any]:
    """Get progress analytics for a department (teachers only)"""
    try:
        if current_user.role != 'teacher':
            return forbidden_response('Only teachers can access department progress')
        
        # Validate department parameter
        valid_departments = {opt['value'] for opt in DEPARTMENT_OPTIONS}
        if department not in valid_departments:
            return error_response('Invalid department', 400)
        
        # Optimize query - use only() to limit fields fetched
        users_in_dept = User.objects(department=department, role='student').only('id')
        user_ids = [u.id for u in users_in_dept]
        # Limit submissions to avoid loading too many
        submissions = list(Submission.objects(user_id__in=user_ids).limit(1000))
        
        total_submissions = len(submissions)
        # Filter out None user_ids before counting unique students
        unique_students = len(set(str(s.user_id.id) for s in submissions if s.user_id))
        
        submission_ids = [s.id for s in submissions]
        # Limit feedbacks and peer reviews to avoid loading too much data
        feedbacks = list(Feedback.objects(submission_id__in=submission_ids).limit(500))
        peer_reviews = list(PeerReview.objects(submission_id__in=submission_ids).limit(500))
        
        total_score = 0
        score_count = 0
        for fb in feedbacks:
            scores = fb.get_scores()
            if scores:
                values = list(scores.values())
                if values:
                    total_score += sum(values) / len(values)
                    score_count += 1
        
        avg_score = (total_score / score_count * 100) if score_count > 0 else 0
        
        status_counts = {}
        for sub in submissions:
            status_counts[sub.status] = status_counts.get(sub.status, 0) + 1
        
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_submissions = [s for s in submissions if s.created_at >= week_ago]
        
        return success_response({
            'department': department,
            'total_submissions': total_submissions,
            'unique_students': unique_students,
            'total_feedbacks': len(feedbacks),
            'total_peer_reviews': len(peer_reviews),
            'completed_peer_reviews': len([pr for pr in peer_reviews if pr.status == 'completed']),
            'pending_peer_reviews': len([pr for pr in peer_reviews if pr.status == 'pending']),
            'average_score': round(avg_score, 2),
            'status_breakdown': status_counts,
            'recent_submissions': len(recent_submissions),
        })
    except Exception as e:
        current_app.logger.error(f"Failed to fetch department progress: {str(e)}", exc_info=True)
        return error_response('Failed to fetch department progress. Please try again.', 500)


@bp.route('/performance-prediction')
@login_required
def get_performance_prediction() -> Dict[str, Any]:
    """Get performance predictions for students"""
    try:
        if current_user.role != 'teacher':
            return forbidden_response('Only teachers can access performance predictions')
        
        predictions = performance_predictor_service.predict_all_students()
        return success_response(predictions)
    except Exception as e:
        current_app.logger.error(f"Failed to fetch performance predictions: {str(e)}", exc_info=True)
        return error_response('Failed to fetch performance predictions. Please try again.', 500)


@bp.route('/plagiarism-check', methods=['POST'])
@login_required
def check_plagiarism() -> Dict[str, Any]:
    """Check submission for plagiarism"""
    try:
        if current_user.role != 'teacher':
            return forbidden_response('Only teachers can check for plagiarism')
        
        data = request.json or {}
        content = data.get('content', '')
        
        if not content:
            return error_response('Content is required', 400)
        
        # Validate content size
        from app.config import MAX_FILE_SIZE
        if len(content) > MAX_FILE_SIZE:
            return error_response(f'Content too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB', 400)
        
        result = ai_service.check_plagiarism(content)
        return success_response(result)
    except Exception as e:
        current_app.logger.error(f"Failed to check plagiarism: {str(e)}", exc_info=True)
        return error_response('Failed to check plagiarism. Please try again.', 500)
