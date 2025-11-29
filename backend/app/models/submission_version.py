"""Submission version model"""
from mongoengine import Document, StringField, IntField, DateTimeField, ReferenceField
from datetime import datetime

class SubmissionVersion(Document):
    """Revision history for submissions"""
    meta = {'collection': 'submission_versions'}
    
    submission_id = ReferenceField('Submission', required=True)
    content = StringField(required=True)
    version_number = IntField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    note = StringField(max_length=500)  # Optional note about this version

