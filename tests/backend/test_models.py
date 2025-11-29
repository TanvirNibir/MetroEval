"""
Tests for database models
"""
import pytest
from datetime import datetime
from bson import ObjectId
from app.models import User, Course, Submission, Feedback, PeerReview

class TestUserModel:
    """Test User model"""
    
    def test_create_user(self, client):
        """Test creating a user"""
        with client.application.app_context():
            User.objects(email='modeltest@metropolia.fi').delete()
            
            user = User(
                email='modeltest@metropolia.fi',
                password_hash='hashed_password',
                name='Model Test User',
                role='student',
                department='General Studies'
            )
            user.save()
            
            assert user.id is not None
            assert user.email == 'modeltest@metropolia.fi'
            assert user.name == 'Model Test User'
            assert user.role == 'student'
            assert user.is_authenticated() is True
            assert user.is_active() is True
            assert user.is_anonymous() is False
            assert user.get_id() == str(user.id)
    
    def test_user_relationships(self, client, test_user):
        """Test user relationships"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(code='GEN101').first()
            if not course:
                course = Course(
                    name='Interdisciplinary Foundations',
                    code='GEN101',
                    department='General Studies'
                )
                course.save()
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Test Assignment',
                content='Test content',
                submission_type='code',
                status='submitted'
            )
            submission.save()
            
            # Test relationship using MongoEngine
            user_submissions = Submission.objects(user_id=user).all()
            assert len(user_submissions) >= 1
            assert user_submissions[0].assignment_title == 'Test Assignment'

class TestCourseModel:
    """Test Course model"""
    
    def test_create_course(self, client):
        """Test creating a course"""
        with client.application.app_context():
            Course.objects(code='TEST101').delete()
            
            course = Course(
                name='Test Course',
                code='TEST101',
                department='Engineering & Computer Science'
            )
            course.save()
            
            assert course.id is not None
            assert course.name == 'Test Course'
            assert course.code == 'TEST101'
            assert course.department == 'Engineering & Computer Science'

class TestSubmissionModel:
    """Test Submission model"""
    
    def test_create_submission(self, client, test_user):
        """Test creating a submission"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(code='GEN101').first()
            if not course:
                course = Course(
                    name='Interdisciplinary Foundations',
                    code='GEN101',
                    department='General Studies'
                )
                course.save()
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Test Submission',
                content='Submission content',
                task_description='Task description',
                submission_type='essay',
                status='submitted'
            )
            submission.save()
            
            assert submission.id is not None
            assert submission.assignment_title == 'Test Submission'
            assert submission.submission_type == 'essay'
            assert submission.status == 'submitted'
            assert str(submission.user_id.id) == str(user.id)

class TestFeedbackModel:
    """Test Feedback model"""
    
    def test_create_feedback(self, client, test_user, test_teacher):
        """Test creating feedback"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            teacher = User.objects(id=ObjectId(test_teacher)).first()
            
            assert user is not None, "test_user fixture failed - user is None"
            assert teacher is not None, "test_teacher fixture failed - teacher is None"
            
            course = Course.objects(code='GEN101').first()
            if not course:
                course = Course(
                    name='Interdisciplinary Foundations',
                    code='GEN101',
                    department='General Studies'
                )
                course.save()
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Test Assignment',
                content='Test content',
                submission_type='code',
                status='submitted'
            )
            submission.save()
            
            feedback = Feedback(
                submission_id=submission,
                reviewer_id=teacher,
                feedback_text='Great work!',
                feedback_type='peer'
            )
            feedback.set_scores({
                'correctness': 0.9,
                'quality': 0.8,
                'completeness': 0.85
            })
            feedback.save()
            
            assert feedback.id is not None
            assert feedback.feedback_text == 'Great work!'
            assert feedback.feedback_type == 'peer'
            scores = feedback.get_scores()
            assert scores['correctness'] == 0.9
            assert scores['quality'] == 0.8
            assert scores['completeness'] == 0.85
