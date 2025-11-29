"""Announcement model"""
from mongoengine import Document, StringField, BooleanField, DateTimeField, ReferenceField
from datetime import datetime

class Announcement(Document):
    """Announcements board"""
    meta = {'collection': 'announcements'}
    
    course_id = ReferenceField('Course')
    title = StringField(required=True, max_length=200)
    content = StringField(required=True)
    priority = StringField(default='normal', max_length=20)  # 'low', 'normal', 'high', 'urgent'
    created_by = ReferenceField('User', required=True)
    is_pinned = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

