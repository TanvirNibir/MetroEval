"""
Comprehensive tests for database models
"""
import pytest
from datetime import datetime
from bson import ObjectId
from app.models import (
    User, Course, Submission, Feedback, PeerReview,
    Flashcard, Bookmark, Notification
)


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
            assert user.department == 'General Studies'
            assert user.is_authenticated() is True
            assert user.is_active() is True
            assert user.is_anonymous() is False
            assert user.get_id() == str(user.id)
            assert user.skill_level == 0.5  # Default value
            assert user.theme_preference == 'light'  # Default value
    
    def test_user_default_values(self, client):
        """Test user default values"""
        with client.application.app_context():
            User.objects(email='defaulttest@metropolia.fi').delete()
            
            user = User(
                email='defaulttest@metropolia.fi',
                password_hash='hash',
                name='Default Test',
                role='student'
            )
            user.save()
            
            assert user.department == 'General Studies'
            assert user.skill_level == 0.5
            assert user.theme_preference == 'light'
            assert user.created_at is not None
    
    def test_user_relationships(self, client, test_user, test_course):
        """Test user relationships with submissions"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
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
            assert str(user_submissions[0].user_id.id) == str(user.id)
    
    def test_user_unique_email(self, client):
        """Test user email must be unique"""
        with client.application.app_context():
            User.objects(email='unique@metropolia.fi').delete()
            
            user1 = User(
                email='unique@metropolia.fi',
                password_hash='hash1',
                name='User 1',
                role='student'
            )
            user1.save()
            
            # Try to create another user with same email
            user2 = User(
                email='unique@metropolia.fi',
                password_hash='hash2',
                name='User 2',
                role='student'
            )
            
            with pytest.raises(Exception):  # Should raise NotUniqueError
                user2.save()


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
    
    def test_course_relationships(self, client, test_course, test_user):
        """Test course relationships with submissions"""
        with client.application.app_context():
            course = Course.objects(id=ObjectId(test_course)).first()
            user = User.objects(id=ObjectId(test_user)).first()
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Course Assignment',
                content='Content',
                submission_type='essay',
                status='submitted'
            )
            submission.save()
            
            course_submissions = Submission.objects(course_id=course).all()
            assert len(course_submissions) >= 1
            assert course_submissions[0].course_id.id == course.id


class TestSubmissionModel:
    """Test Submission model"""
    
    def test_create_submission(self, client, test_user, test_course):
        """Test creating a submission"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
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
            assert str(submission.course_id.id) == str(course.id)
            assert submission.is_practice is False
            assert submission.created_at is not None
            assert submission.updated_at is not None
    
    def test_submission_with_files(self, client, test_user, test_course):
        """Test submission with embedded files"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
            from app.models.submission import SubmissionFile
            
            file1 = SubmissionFile(
                filename='test.py',
                file_content='print("hello")',
                file_type='py'
            )
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Multi-file Submission',
                content='Main content',
                submission_type='code',
                status='submitted',
                files=[file1]
            )
            submission.save()
            
            assert len(submission.files) == 1
            assert submission.files[0].filename == 'test.py'
            assert submission.files[0].file_type == 'py'
    
    def test_submission_practice_mode(self, client, test_user, test_course):
        """Test practice mode submission"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Practice Submission',
                content='Practice content',
                submission_type='code',
                status='submitted',
                is_practice=True
            )
            submission.save()
            
            assert submission.is_practice is True
            assert submission.status == 'submitted'


class TestFeedbackModel:
    """Test Feedback model"""
    
    def test_create_feedback(self, client, test_user, test_teacher, test_course):
        """Test creating feedback"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            teacher = User.objects(id=ObjectId(test_teacher)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
            assert user is not None
            assert teacher is not None
            
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
    
    def test_feedback_ai_type(self, client, test_user, test_course):
        """Test AI-generated feedback"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
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
                reviewer_id=user,  # Can be same user for AI feedback
                feedback_text='AI generated feedback',
                feedback_type='ai'
            )
            feedback.save()
            
            assert feedback.feedback_type == 'ai'


class TestPeerReviewModel:
    """Test PeerReview model"""
    
    def test_create_peer_review(self, client, test_user, test_course):
        """Test creating a peer review"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Review Assignment',
                content='Content to review',
                submission_type='code',
                status='submitted'
            )
            submission.save()
            
            peer_review = PeerReview(
                submission_id=submission,
                reviewer_id=user,
                status='pending'
            )
            peer_review.save()
            
            assert peer_review.id is not None
            assert peer_review.status == 'pending'
            assert str(peer_review.submission_id.id) == str(submission.id)
            assert str(peer_review.reviewer_id.id) == str(user.id)
    
    def test_peer_review_statuses(self, client, test_user, test_course):
        """Test peer review status transitions"""
        with client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
            submission = Submission(
                user_id=user,
                course_id=course,
                assignment_title='Review Assignment',
                content='Content',
                submission_type='code',
                status='submitted'
            )
            submission.save()
            
            review = PeerReview(
                submission_id=submission,
                reviewer_id=user,
                status='pending'
            )
            review.save()
            
            # Update status
            review.status = 'completed'
            review.feedback_text = 'Good work!'
            review.save()
            
            assert review.status == 'completed'
            assert review.feedback_text == 'Good work!'
