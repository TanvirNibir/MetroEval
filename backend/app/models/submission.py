"""Submission models"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField
from datetime import datetime

class SubmissionFile(EmbeddedDocument):
    """Embedded document for submission files"""
    filename = StringField(required=True, max_length=255)
    file_content = StringField(required=True)
    file_type = StringField(max_length=50)  # 'java', 'py', 'cpp', etc.
    created_at = DateTimeField(default=datetime.utcnow)

class Submission(Document):
    """Submission model"""
    meta = {'collection': 'submissions'}
    
    user_id = ReferenceField('User', required=True)
    course_id = ReferenceField('Course', required=True)
    assignment_title = StringField(required=True, max_length=200)
    content = StringField(required=True)  # Main content or combined content
    task_description = StringField()  # Original task/assignment description from teacher
    submission_type = StringField(required=True, max_length=50)  # 'code', 'essay', 'report'
    status = StringField(default='submitted', max_length=50)  # 'submitted', 'reviewed', 'graded', 'practice'
    is_practice = BooleanField(default=False)  # True for practice mode submissions
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    files = ListField(EmbeddedDocumentField(SubmissionFile))

