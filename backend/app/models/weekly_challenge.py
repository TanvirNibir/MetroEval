"""Weekly challenge models"""
from mongoengine import Document, StringField, BooleanField, FloatField, IntField, DateTimeField, ReferenceField
from datetime import datetime

class WeeklyChallenge(Document):
    """Weekly challenges/competitions"""
    meta = {'collection': 'weekly_challenges'}
    
    title = StringField(required=True, max_length=200)
    description = StringField(required=True)
    challenge_type = StringField(max_length=50)  # 'coding', 'essay', 'review'
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    is_active = BooleanField(default=True)
    created_by = ReferenceField('User', required=True)
    department = StringField(default='All Departments', max_length=100)
    created_at = DateTimeField(default=datetime.utcnow)

class ChallengeSubmission(Document):
    """Submissions to weekly challenges"""
    meta = {'collection': 'challenge_submissions'}
    
    challenge_id = ReferenceField('WeeklyChallenge', required=True)
    user_id = ReferenceField('User', required=True)
    submission_id = ReferenceField('Submission')
    score = FloatField()
    rank = IntField()
    submitted_at = DateTimeField(default=datetime.utcnow)

