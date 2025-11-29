"""Flashcard model"""
from mongoengine import Document, StringField, IntField, FloatField, DateTimeField, ReferenceField
from datetime import datetime

class Flashcard(Document):
    """Flashcard system"""
    meta = {'collection': 'flashcards'}
    
    user_id = ReferenceField('User', required=True)
    front = StringField(required=True)  # Question or term
    back = StringField(required=True)  # Answer or definition
    category = StringField(max_length=100)
    difficulty = IntField(default=1)  # 1-5
    last_reviewed = DateTimeField()
    review_count = IntField(default=0)
    mastery_level = FloatField(default=0.0)  # 0.0 to 1.0
    created_at = DateTimeField(default=datetime.utcnow)

