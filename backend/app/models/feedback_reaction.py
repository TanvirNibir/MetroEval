"""Feedback reaction model"""
from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime

class FeedbackReaction(Document):
    """Reactions to feedback (helpful, confusing, etc.)"""
    meta = {'collection': 'feedback_reactions'}
    
    feedback_id = ReferenceField('Feedback', required=True)
    user_id = ReferenceField('User', required=True)
    reaction_type = StringField(required=True, max_length=20)  # 'helpful', 'confusing', 'thanks', etc.
    created_at = DateTimeField(default=datetime.utcnow)

