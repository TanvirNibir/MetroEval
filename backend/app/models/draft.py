"""Draft model"""
from mongoengine import Document, StringField, DateTimeField, ReferenceField, DictField
from datetime import datetime

class Draft(Document):
    """Draft submissions (auto-saved)"""
    meta = {'collection': 'drafts'}
    
    user_id = ReferenceField('User', required=True)
    assignment_title = StringField(max_length=200)
    content = StringField()
    task_description = StringField()
    submission_type = StringField(max_length=50)
    files_data = DictField()  # JSON object of files
    last_saved = DateTimeField(default=datetime.utcnow)

