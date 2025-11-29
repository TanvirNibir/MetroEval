"""
Tests for authentication endpoints
"""
import pytest
import json
from werkzeug.security import check_password_hash
from bson import ObjectId
from app.models import User

class TestRegistration:
    """Test user registration"""
    
    def test_register_new_user_form_data(self, client):
        """Test registration with form data"""
        response = client.post('/api/v1/register', data={
            'email': 'newuser@metropolia.fi',
            'password': 'password123',
            'name': 'New User',
            'role': 'student',
            'department': 'General Studies'
        }, follow_redirects=True)
        
        # Check response
        if response.status_code != 200:
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.data.decode()}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.data.decode()}"
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['role'] == 'student'
        
        # Verify user was created
        with client.application.app_context():
            user = User.objects(email='newuser@metropolia.fi').first()
            assert user is not None
            assert user.name == 'New User'
            assert user.role == 'student'
            assert check_password_hash(user.password_hash, 'password123')
    
    def test_register_new_user_json(self, client):
        """Test registration with JSON data"""
        response = client.post('/api/v1/register', 
            json={
                'email': 'newuser2@metropolia.fi',
                'password': 'password123',
                'name': 'New User 2',
                'role': 'teacher',
                'department': 'Engineering & Computer Science'
            },
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['role'] == 'teacher'
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email"""
        # test_user is now an ID, but email is still 'test@metropolia.fi'
        response = client.post('/api/v1/register', data={
            'email': 'test@metropolia.fi',
            'password': 'password123',
            'name': 'Another User',
            'role': 'student',
            'department': 'General Studies'
        })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'already registered' in data.get('error', '').lower()
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields"""
        # Missing email
        response = client.post('/api/v1/register', data={
            'password': 'password123',
            'name': 'Test User'
        })
        assert response.status_code == 400
        
        # Missing password
        response = client.post('/api/v1/register', data={
            'email': 'test@metropolia.fi',
            'name': 'Test User'
        })
        assert response.status_code == 400
        
        # Missing name
        response = client.post('/api/v1/register', data={
            'email': 'test@metropolia.fi',
            'password': 'password123'
        })
        assert response.status_code == 400

    def test_register_rejects_non_metropolia_email(self, client):
        """Ensure registration blocks non-Metropolia domains"""
        response = client.post('/api/v1/register', data={
            'email': 'outsider@gmail.com',
            'password': 'password123',
            'name': 'Outside User',
            'role': 'student',
            'department': 'General Studies'
        })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert '@metropolia.fi' in data['error']

class TestLogin:
    """Test user login"""
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        # test_user is now an ID, need to check email differently
        response = client.post('/api/v1/login', data={
            'email': 'test@metropolia.fi',
            'password': 'password123'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['role'] == 'student'
    
    def test_login_invalid_email(self, client):
        """Test login with invalid email"""
        response = client.post('/api/v1/login', data={
            'email': 'nonexistent@metropolia.fi',
            'password': 'password123'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with invalid password"""
        # test_user is now an ID, email is still 'test@metropolia.fi'
        response = client.post('/api/v1/login', data={
            'email': 'test@metropolia.fi',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False

    def test_login_rejects_non_metropolia_email(self, client):
        """Ensure login blocks non-Metropolia domains"""
        response = client.post('/api/v1/login', data={
            'email': 'outsider@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 403
        data = json.loads(response.data)
        assert data['success'] is False
        assert '@metropolia.fi' in data['error']

class TestLogout:
    """Test user logout"""
    
    def test_logout_authenticated(self, authenticated_client):
        """Test logout when authenticated"""
        response = authenticated_client.get('/api/v1/logout')
        # Logout might redirect or return success
        assert response.status_code in [200, 302]
    
    def test_logout_unauthenticated(self, client):
        """Test logout when not authenticated"""
        response = client.get('/api/v1/logout')
        # Logout endpoint returns 200 (success) even if not authenticated
        # This is acceptable behavior - logging out when not logged in is harmless
        assert response.status_code == 200
