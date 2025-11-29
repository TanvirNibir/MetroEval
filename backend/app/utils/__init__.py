"""Utility functions"""
from .auth_utils import normalize_email, is_metropolia_email, load_user
from .dept_utils import get_current_department, get_or_create_department_course
from .db_utils import init_db
from .model_utils import (
    to_object_id, get_user_by_id, get_submission_by_id,
    get_course_by_id, get_feedback_by_id, get_peer_review_by_id
)
from .validation import validate_required_fields, validate_email, validate_string_length
from .response_utils import (
    success_response, error_response, not_found_response,
    forbidden_response
)

__all__ = [
    'normalize_email', 'is_metropolia_email', 'load_user',
    'get_current_department', 'get_or_create_department_course',
    'init_db', 'to_object_id', 'get_user_by_id', 'get_submission_by_id',
    'get_course_by_id', 'get_feedback_by_id', 'get_peer_review_by_id',
    'validate_required_fields', 'validate_email', 'validate_string_length',
    'success_response', 'error_response', 'not_found_response',
    'forbidden_response'
]
