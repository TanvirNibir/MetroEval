"""
Database models for AFPRS - MongoDB (MongoEngine)
"""
from .user import User
from .course import Course
from .submission import Submission, SubmissionFile
from .feedback import Feedback
from .peer_review import PeerReview
from .submission_version import SubmissionVersion
from .bookmark import Bookmark
from .draft import Draft
from .feedback_reaction import FeedbackReaction
from .time_tracking import TimeTracking
from .submission_template import SubmissionTemplate
from .resource import Resource
from .notification import Notification
from .deadline import Deadline
from .announcement import Announcement
from .flashcard import Flashcard
from .weekly_challenge import WeeklyChallenge, ChallengeSubmission
from .practice_submission import PracticeSubmission
from .quiz import Quiz, QuizAttempt

__all__ = [
    'User',
    'Course',
    'Submission',
    'SubmissionFile',
    'Feedback',
    'PeerReview',
    'SubmissionVersion',
    'Bookmark',
    'Draft',
    'FeedbackReaction',
    'TimeTracking',
    'SubmissionTemplate',
    'Resource',
    'Notification',
    'Deadline',
    'Announcement',
    'Flashcard',
    'WeeklyChallenge',
    'ChallengeSubmission',
    'PracticeSubmission',
    'Quiz',
    'QuizAttempt',
]

