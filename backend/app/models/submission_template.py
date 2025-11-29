"""Submission template model"""
from mongoengine import Document, StringField, BooleanField, IntField, DateTimeField, ReferenceField, DictField
from datetime import datetime

class SubmissionTemplate(Document):
    """Templates for common assignment types"""
    meta = {'collection': 'submission_templates'}
    
    name = StringField(required=True, max_length=200)
    description = StringField()
    template_content = StringField(required=True)
    submission_type = StringField(required=True, max_length=50)
    file_templates = DictField()  # JSON object of file templates
    created_by = ReferenceField('User')
    is_public = BooleanField(default=True)
    usage_count = IntField(default=0)
    department = StringField(default='All Departments', max_length=100)
    created_at = DateTimeField(default=datetime.utcnow)

