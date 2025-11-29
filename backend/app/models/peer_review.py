"""Peer review model"""
from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime

class PeerReview(Document):
    """Peer review model"""
    meta = {'collection': 'peer_reviews'}
    
    submission_id = ReferenceField('Submission', required=True)
    reviewer_id = ReferenceField('User', required=True)
    status = StringField(default='pending', max_length=20)  # 'pending', 'completed', 'skipped'
    feedback_text = StringField()
    assigned_at = DateTimeField(default=datetime.utcnow)
    completed_at = DateTimeField()

