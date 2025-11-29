"""Resource model"""
from mongoengine import Document, StringField, FloatField, IntField, DateTimeField, ReferenceField
from datetime import datetime

class Resource(Document):
    """Resource library items"""
    meta = {'collection': 'resources'}
    
    title = StringField(required=True, max_length=200)
    description = StringField()
    content = StringField()
    resource_type = StringField(max_length=50)  # 'tutorial', 'example', 'documentation', 'video'
    url = StringField(max_length=500)
    category = StringField(max_length=100)
    tags = StringField(max_length=500)  # Comma-separated tags
    created_by = ReferenceField('User')
    rating = FloatField(default=0.0)
    view_count = IntField(default=0)
    department = StringField(default='All Departments', max_length=100)
    created_at = DateTimeField(default=datetime.utcnow)

