"""Model utility functions for common database operations"""
from typing import Optional, Union
from bson import ObjectId
from bson.errors import InvalidId
from app.models import User, Submission, Course, Feedback, PeerReview


def to_object_id(value: Union[str, ObjectId]) -> Optional[ObjectId]:
    """Convert string to ObjectId, return ObjectId as-is, or None if invalid"""
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, str):
        try:
            return ObjectId(value)
        except (InvalidId, ValueError):
            return None
    return None


def get_user_by_id(user_id: Union[str, ObjectId]) -> Optional[User]:
    """Get user by ID with proper error handling"""
    obj_id = to_object_id(user_id)
    if not obj_id:
        return None
    try:
        return User.objects(id=obj_id).first()
    except Exception:
        return None


def get_submission_by_id(submission_id: Union[str, ObjectId]) -> Optional[Submission]:
    """Get submission by ID with proper error handling"""
    obj_id = to_object_id(submission_id)
    if not obj_id:
        return None
    try:
        return Submission.objects(id=obj_id).first()
    except Exception:
        return None


def get_course_by_id(course_id: Union[str, ObjectId]) -> Optional[Course]:
    """Get course by ID with proper error handling"""
    obj_id = to_object_id(course_id)
    if not obj_id:
        return None
    try:
        return Course.objects(id=obj_id).first()
    except Exception:
        return None


def get_feedback_by_id(feedback_id: Union[str, ObjectId]) -> Optional[Feedback]:
    """Get feedback by ID with proper error handling"""
    obj_id = to_object_id(feedback_id)
    if not obj_id:
        return None
    try:
        return Feedback.objects(id=obj_id).first()
    except Exception:
        return None


def get_peer_review_by_id(review_id: Union[str, ObjectId]) -> Optional[PeerReview]:
    """Get peer review by ID with proper error handling"""
    obj_id = to_object_id(review_id)
    if not obj_id:
        return None
    try:
        return PeerReview.objects(id=obj_id).first()
    except Exception:
        return None

