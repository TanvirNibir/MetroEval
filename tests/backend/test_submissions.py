"""
Tests for submission endpoints
"""
import pytest
import json
from bson import ObjectId
from app.models import Submission, Course, User

class TestSubmissionAPI:
    """Test submission API endpoints"""
    
    def test_submit_assignment(self, authenticated_client, test_user):
        """Test submitting an assignment"""
        with authenticated_client.application.app_context():
            # Get or create a course
            course = Course.objects(code='GEN101').first()
            if not course:
                course = Course(
                    name='Interdisciplinary Foundations',
                    code='GEN101',
                    department='General Studies'
                )
                course.save()
            course_id = str(course.id)
        
        response = authenticated_client.post('/api/v1/submit', json={
            'title': 'Test Assignment',
            'content': 'This is test submission content',
            'task_description': 'Complete the assignment',
            'type': 'code',
            'course_id': course_id
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
    
    def test_submit_assignment_unauthenticated(self, client):
        """Test submitting without authentication"""
        response = client.post('/api/v1/submit', json={
            'title': 'Test Assignment',
            'content': 'This is test submission content'
        })
        
        assert response.status_code == 401 or response.status_code == 302
    
    def test_get_submissions(self, authenticated_client, test_user):
        """Test getting user's submissions"""
        with authenticated_client.application.app_context():
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
        assert len(submissions) >= 1
        # Check for assignment_title (not title)
        assert any(s.get('title') == 'Test Assignment' or s.get('assignment_title') == 'Test Assignment' for s in submissions)
    
    def test_get_submission_detail(self, authenticated_client, test_user):
        """Test getting submission detail"""
        with authenticated_client.application.app_context():
            user = User.objects(id=ObjectId(test_user)).first()
            assert user is not None, "test_user fixture failed - user is None"
            
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
        assert submission_data.get('title') == 'Test Assignment' or submission_data.get('assignment_title') == 'Test Assignment'
        assert 'feedbacks' in data
