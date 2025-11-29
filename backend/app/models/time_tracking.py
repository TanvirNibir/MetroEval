"""Time tracking model"""
from mongoengine import Document, StringField, IntField, DateTimeField, ReferenceField
from datetime import datetime

class TimeTracking(Document):
    """Time spent on assignments"""
    meta = {'collection': 'time_tracking'}
    
    user_id = ReferenceField('User', required=True)
    submission_id = ReferenceField('Submission')
    start_time = DateTimeField(required=True)
    end_time = DateTimeField()
    duration_seconds = IntField()  # Total time in seconds
    activity_type = StringField(max_length=50)  # 'submission', 'review', 'practice'

