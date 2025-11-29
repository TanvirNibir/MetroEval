"""Feedback model"""
from mongoengine import Document, StringField, DateTimeField, ReferenceField, DictField
from datetime import datetime

class Feedback(Document):
    """Feedback model"""
    meta = {'collection': 'feedbacks'}
    
    submission_id = ReferenceField('Submission', required=True)
    reviewer_id = ReferenceField('User')  # None for AI feedback
    feedback_text = StringField(required=True)
    scores = DictField()  # JSON object: {"correctness": 0.8, "quality": 0.7, ...}
    feedback_type = StringField(required=True, max_length=20)  # 'ai' or 'peer'
    created_at = DateTimeField(default=datetime.utcnow)
    
    def get_scores(self):
        """Get scores dict"""
        return self.scores or {}
    
    def set_scores(self, scores_dict):
        """Store scores dict"""
        self.scores = scores_dict or {}

