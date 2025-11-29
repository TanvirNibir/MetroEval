"""
Peer Review Matching Service
Intelligently matches students for peer review based on skill levels
"""
from app.models import User, Submission, PeerReview, Feedback
from typing import List
import random
from bson import ObjectId

class PeerMatchingService:
    """Service for intelligent peer review matching"""
    
    def __init__(self):
        self.peers_per_submission = 2  # Number of peers to assign
    
    def match_peers(self, submission_id, submitter_id, course_id, department: str = None) -> List:
        """
        Very simple matching:
        - Take all other students (optionally same department)
        - Skip anyone who already has a PeerReview for this submission
        - Return up to `peers_per_submission` reviewer IDs

        This makes behavior predictable for small setups: with two students,
        each new submission will assign the *other* student as reviewer.
        """
        import logging
        logger = logging.getLogger(__name__)

        try:
            submission_obj_id = ObjectId(submission_id) if isinstance(submission_id, str) else submission_id
        except Exception as e:
            logger.warning(f"Error parsing submission id {submission_id}: {e}")
            return []

        # Resolve submitter id to ObjectId
        try:
            submitter_obj_id = ObjectId(submitter_id) if isinstance(submitter_id, str) else submitter_id
        except Exception as e:
            logger.warning(f"Error parsing submitter id {submitter_id}: {e}")
            return []

        # Base query: all students except the submitter
        query = User.objects(role='student', id__ne=submitter_obj_id)

        # Prefer same department if provided
        if department:
            query = query.filter(department=department)

        students = list(query)

        # If department filter yields nobody, fall back to all other students
        if not students:
            students = list(User.objects(role='student', id__ne=submitter_obj_id))

        if not students:
            return []

        selected_ids: List[str] = []
        for student in students:
            if len(selected_ids) >= self.peers_per_submission:
                break

            # Skip if this student already has a PeerReview for this submission
            existing = PeerReview.objects(
                submission_id=submission_obj_id,
                reviewer_id=student.id
            ).first()
            if existing:
                continue

            selected_ids.append(str(student.id))

        return selected_ids

