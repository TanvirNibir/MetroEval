"""Notification model"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ReferenceField
from datetime import datetime

class Notification(Document):
    """User notifications"""
    meta = {'collection': 'notifications'}
    
    user_id = ReferenceField('User', required=True)
    title = StringField(required=True, max_length=200)
    message = StringField(required=True)
    notification_type = StringField(max_length=50)  # 'feedback', 'review', 'deadline', 'announcement'
    related_id = StringField()  # ID of related submission, feedback, etc. (as string for flexibility)
    is_read = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

