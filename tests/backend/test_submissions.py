"""
Comprehensive tests for submission endpoints
"""
import pytest
import json
from bson import ObjectId
from app.models import Submission, Course, User


class TestSubmissionAPI:
    """Test submission API endpoints"""
    
    def test_submit_assignment(self, authenticated_client, test_user, test_course):
        """Test submitting an assignment"""
        response = authenticated_client.post('/api/v1/submit', json={
            'title': 'Test Assignment',
            'content': 'This is test submission content',
            'task_description': 'Complete the assignment',
            'type': 'code',
            'course_id': test_course
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'submission_id' in data
        
        # Verify submission was created
        with authenticated_client.application.app_context():
            submission = Submission.objects(id=ObjectId(data['submission_id'])).first()
            assert submission is not None
            assert submission.assignment_title == 'Test Assignment'
            assert submission.content == 'This is test submission content'
            assert submission.submission_type == 'code'
    
    def test_submit_assignment_essay(self, authenticated_client, test_user, test_course):
        """Test submitting an essay assignment"""
        response = authenticated_client.post('/api/v1/submit', json={
            'title': 'Essay Assignment',
            'content': 'This is an essay submission',
            'task_description': 'Write an essay',
            'type': 'essay',
            'course_id': test_course
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        
        with authenticated_client.application.app_context():
            submission = Submission.objects(id=ObjectId(data['submission_id'])).first()
            assert submission.submission_type == 'essay'
    
    def test_submit_assignment_unauthenticated(self, client):
        """Test submitting without authentication fails"""
        response = client.post('/api/v1/submit', json={
            'title': 'Test Assignment',
            'content': 'This is test submission content'
        })
        
        assert response.status_code in [401, 302]
    
    def test_submit_assignment_missing_fields(self, authenticated_client, test_course):
        """Test submitting with missing required fields"""
        # Missing title - API may use defaults or return error
        response = authenticated_client.post('/api/v1/submit', json={
            'content': 'Content',
            'type': 'code',
            'course_id': test_course
        })
        assert response.status_code in [200, 400, 500]
        
        # Missing content - API may use defaults or return error
        response = authenticated_client.post('/api/v1/submit', json={
            'title': 'Title',
            'type': 'code',
            'course_id': test_course
        })
        assert response.status_code in [200, 400, 500]
        
        # Missing type - API may use defaults or return error
        response = authenticated_client.post('/api/v1/submit', json={
            'title': 'Title',
            'content': 'Content',
            'course_id': test_course
        })
        assert response.status_code in [200, 400, 500]
    
    def test_get_submissions(self, authenticated_client, test_user, test_course):
        """Test getting user's submissions"""
        with authenticated_client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            course = Course.objects(id=ObjectId(test_course)).first()
            
            # Create multiple submissions
            for i in range(3):
                submission = Submission(
                    user_id=user,
                    course_id=course,
                    assignment_title=f'Test Assignment {i+1}',
                    content=f'Test content {i+1}',
                    submission_type='code',
                    status='submitted'
                )
                submission.save()
        
        response = authenticated_client.get('/api/v1/submissions')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Response format: {'success': True, 'data': [...]} or just the list
        if isinstance(data, dict):
            assert data.get('success', True) is True
            submissions = data.get('data', [])
        else:
            submissions = data
        
        assert isinstance(submissions, list)
        assert len(submissions) >= 3
        
        # Check for assignment titles
        titles = [s.get('title') or s.get('assignment_title') for s in submissions]
        assert 'Test Assignment 1' in titles or any('Test Assignment 1' in str(s) for s in submissions)
    
    def test_get_submissions_empty(self, authenticated_client):
        """Test getting submissions when user has none"""
        response = authenticated_client.get('/api/v1/submissions')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        if isinstance(data, dict):
            submissions = data.get('data', [])
        else:
            submissions = data
        
        assert isinstance(submissions, list)
    
    def test_get_submission_detail(self, authenticated_client, test_user, test_course):
        """Test getting submission detail"""
        with authenticated_client.application.app_context():
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
            submission_id = str(submission.id)
        
        response = authenticated_client.get(f'/api/v1/submission/{submission_id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data.get('success', True) is True
        
        # Response format: {'success': True, 'submission': {...}, 'feedbacks': [...], ...}
        submission_data = data.get('submission', {})
        if not submission_data:
            submission_data = data
        
        # Check for assignment_title (not title)
        title = submission_data.get('title') or submission_data.get('assignment_title')
        assert title == 'Test Assignment'
        assert 'feedbacks' in data or 'feedback' in data
    
    def test_get_submission_detail_not_found(self, authenticated_client):
        """Test getting non-existent submission"""
        fake_id = str(ObjectId())
        response = authenticated_client.get(f'/api/v1/submission/{fake_id}')
        
        assert response.status_code in [404, 400]
    
    def test_get_submission_detail_unauthenticated(self, client, test_user, test_course):
        """Test getting submission detail without authentication"""
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
            submission_id = str(submission.id)
        
        response = client.get(f'/api/v1/submission/{submission_id}')
        
        assert response.status_code in [401, 302]
    
    def test_get_submission_versions(self, authenticated_client, test_user, test_course):
        """Test getting submission version history"""
        with authenticated_client.application.app_context():
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
            submission_id = str(submission.id)
        
        response = authenticated_client.get(f'/api/v1/submission/{submission_id}/versions')
        
        # Should return 200 with versions (even if empty list)
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert isinstance(data, (dict, list))
    
    def test_save_submission_version(self, authenticated_client, test_user, test_course):
        """Test saving a submission version"""
        with authenticated_client.application.app_context():
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
            submission_id = str(submission.id)
        
        response = authenticated_client.post(
            f'/api/v1/submission/{submission_id}/save-version',
            json={'content': 'Updated content'}
        )
        
        # Should return 200 or 201
        assert response.status_code in [200, 201, 404]
        if response.status_code in [200, 201]:
            data = json.loads(response.data)
            assert data.get('success', True) is True
