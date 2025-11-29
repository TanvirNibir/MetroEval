"""Course model"""
from mongoengine import Document, StringField, DateTimeField
from datetime import datetime

class Course(Document):
    """Course model"""
    meta = {'collection': 'courses'}
    
    name = StringField(required=True, max_length=200)
    code = StringField(required=True, unique=True, max_length=50)
    department = StringField(default='General Studies', max_length=100)
    created_at = DateTimeField(default=datetime.utcnow)

