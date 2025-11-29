"""User model"""
from mongoengine import Document, StringField, FloatField, DateTimeField
from datetime import datetime

class User(Document):
    """User model"""
    meta = {'collection': 'users'}
    
    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    name = StringField(required=True, max_length=100)
    role = StringField(required=True, max_length=20)  # 'student' or 'teacher'
    skill_level = FloatField(default=0.5)  # 0.0 to 1.0
    department = StringField(default='General Studies', max_length=100)
    created_at = DateTimeField(default=datetime.utcnow)
    theme_preference = StringField(default='light', max_length=20)  # 'light', 'dark', 'auto'
    avatar_url = StringField(max_length=200000)  # Allow inline data URLs or remote paths
    
    def is_authenticated(self):
        return True
    
    def is_active(self):
        return True
    
    def is_anonymous(self):
        return False
    
    def get_id(self):
        return str(self.id)

