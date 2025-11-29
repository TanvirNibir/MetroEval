"""Quiz models"""
from mongoengine import Document, StringField, IntField, BooleanField, FloatField, DateTimeField, ListField, ReferenceField, DictField
from datetime import datetime

class Quiz(Document):
    """Quiz/Test system"""
    meta = {'collection': 'quizzes'}
    
    title = StringField(required=True, max_length=200)
    description = StringField()
    questions = ListField(DictField(), required=True)  # List of question dicts
    question_count = IntField(required=True)
    time_limit_minutes = IntField(required=True)  # Time limit in minutes
    course_id = ReferenceField('Course')
    created_by = ReferenceField('User', required=True)
    department = StringField(default='General Studies', max_length=100)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    
    def get_questions(self):
        """Get questions list"""
        return self.questions or []
    
    def set_questions(self, questions_list):
        """Store questions list"""
        self.questions = questions_list or []
        self.question_count = len(self.questions)

class QuizAttempt(Document):
    """Student quiz attempts"""
    meta = {'collection': 'quiz_attempts'}
    
    quiz_id = ReferenceField('Quiz', required=True)
    user_id = ReferenceField('User', required=True)
    answers = DictField()  # Dict of student answers
    score = FloatField()  # Final score (0.0 to 1.0)
    started_at = DateTimeField(required=True)
    submitted_at = DateTimeField()
    time_spent_seconds = IntField()  # Time spent in seconds
    is_completed = BooleanField(default=False)
    
    def get_answers(self):
        """Get answers dict"""
        return self.answers or {}
    
    def set_answers(self, answers_dict):
        """Store answers dict"""
        self.answers = answers_dict or {}

