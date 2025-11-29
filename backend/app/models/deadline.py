"""Deadline model"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ReferenceField
from datetime import datetime

class Deadline(Document):
    """Assignment deadlines"""
    meta = {'collection': 'deadlines'}
    
    course_id = ReferenceField('Course', required=True)
    title = StringField(required=True, max_length=200)
    description = StringField()
    due_date = DateTimeField(required=True)
    reminder_sent = BooleanField(default=False)
    created_by = ReferenceField('User', required=True)
    created_at = DateTimeField(default=datetime.utcnow)

