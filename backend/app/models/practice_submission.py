"""Practice submission model"""
from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime

class PracticeSubmission(Document):
    """Practice mode submissions (not graded)"""
    meta = {'collection': 'practice_submissions'}
    
    user_id = ReferenceField('User', required=True)
    title = StringField(required=True, max_length=200)
    content = StringField(required=True)
    submission_type = StringField(required=True, max_length=50)
    feedback_received = StringField()  # AI feedback for practice
    department = StringField(default='General Studies', max_length=100)
    created_at = DateTimeField(default=datetime.utcnow)

