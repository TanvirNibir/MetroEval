"""
Pytest configuration and fixtures for backend tests
"""
import pytest
import os
import sys
import warnings
from werkzeug.security import generate_password_hash
from mongoengine import disconnect, connect
from bson import ObjectId

# Suppress MongoEngine uuidRepresentation deprecation warnings
warnings.filterwarnings('ignore', category=DeprecationWarning, module='mongoengine')
warnings.filterwarnings('ignore', message='.*uuidRepresentation.*', category=DeprecationWarning)

# Add backend directory to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
backend_dir = os.path.join(project_root, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Change to backend directory for imports
original_cwd = os.getcwd()
os.chdir(backend_dir)

# Set test environment before importing app
os.environ['FLASK_ENV'] = 'testing'
os.environ['SECRET_KEY'] = 'test-secret-key-for-testing-only'
os.environ['MONGODB_URI'] = os.environ.get('TEST_MONGODB_URI', 'mongodb://localhost:27017/test_metroeval')

# Import after setting environment
sys.path.insert(0, os.path.join(backend_dir, 'app'))

from app import create_app
from app.models import (
    User, Course, Submission, Feedback, PeerReview, 
    Flashcard, Bookmark, Notification, Resource
)
from app.core.database import init_db

app = create_app('testing')

# Change back to original directory
os.chdir(original_cwd)


@pytest.fixture(scope='function')
def client(monkeypatch):
    """Create a test client for the Flask app"""
    # Disconnect any existing connections
    try:
        disconnect()
    except Exception:
        pass
    
    # Set environment variables for testing
    test_db_uri = os.environ.get('TEST_MONGODB_URI', 'mongodb://localhost:27017/test_metroeval')
    monkeypatch.setenv('MONGODB_URI', test_db_uri)
    monkeypatch.setenv('FLASK_ENV', 'testing')
    monkeypatch.setenv('SECRET_KEY', 'test-secret-key-for-testing-only')
    
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key-for-testing-only'
    app.config['WTF_CSRF_ENABLED'] = False
    
    # Connect to test database
    try:
        connect(host=test_db_uri, alias='default', uuidRepresentation='standard')
    except Exception as e:
        pytest.skip(f"MongoDB not available: {e}. Set TEST_MONGODB_URI or start MongoDB.")
    
    # Initialize database
    with app.app_context():
        try:
            init_db()
        except Exception:
            pass
    
    # Create test client
    with app.test_client() as test_client:
        yield test_client
    
    # Cleanup - drop all collections
    with app.app_context():
        try:
            User.drop_collection()
            Course.drop_collection()
            Submission.drop_collection()
            Feedback.drop_collection()
            PeerReview.drop_collection()
            Flashcard.drop_collection()
            Bookmark.drop_collection()
            Notification.drop_collection()
            Resource.drop_collection()
        except Exception:
            pass
    
    # Disconnect after test
    try:
        disconnect()
    except Exception:
        pass


@pytest.fixture
def test_user(client):
    """Create a test student user"""
    with app.app_context():
        # Delete existing user if exists
        User.objects(email='test@metropolia.fi').delete()
        
        password_hash = generate_password_hash('Password1234!', method='pbkdf2:sha256')
        
        user = User(
            email='test@metropolia.fi',
            password_hash=password_hash,
            name='Test User',
            role='student',
            department='General Studies',
            skill_level=0.5
        )
        user.save()
        return str(user.id)


@pytest.fixture
def test_teacher(client):
    """Create a test teacher user"""
    with app.app_context():
        User.objects(email='teacher@metropolia.fi').delete()
        
        password_hash = generate_password_hash('Password1234!', method='pbkdf2:sha256')
        
        teacher = User(
            email='teacher@metropolia.fi',
            password_hash=password_hash,
            name='Test Teacher',
            role='teacher',
            department='Engineering & Computer Science',
            skill_level=0.9
        )
        teacher.save()
        return str(teacher.id)


@pytest.fixture
def test_course(client):
    """Create a test course"""
    with app.app_context():
        Course.objects(code='TEST101').delete()
        
        course = Course(
            name='Test Course',
            code='TEST101',
            department='General Studies'
        )
        course.save()
        return str(course.id)


@pytest.fixture
def authenticated_client(client, test_user):
    """Create an authenticated test client (student)"""
    with app.app_context():
        user = User.objects(id=ObjectId(test_user)).first()
        if not user:
            password_hash = generate_password_hash('Password1234!', method='pbkdf2:sha256')
            user = User(
                email='test@metropolia.fi',
                password_hash=password_hash,
                name='Test User',
                role='student',
                department='General Studies'
            )
            user.save()
        
        # Login through the API endpoint
        response = client.post('/api/v1/login', data={
            'email': user.email,
            'password': 'Password1234!'
        }, follow_redirects=True)
        
        assert response.status_code == 200
    
    return client


@pytest.fixture
def authenticated_teacher_client(client, test_teacher):
    """Create an authenticated test client (teacher)"""
    with app.app_context():
        teacher = User.objects(id=ObjectId(test_teacher)).first()
        if not teacher:
            password_hash = generate_password_hash('Password1234!', method='pbkdf2:sha256')
            teacher = User(
                email='teacher@metropolia.fi',
                password_hash=password_hash,
                name='Test Teacher',
                role='teacher',
                department='Engineering & Computer Science'
            )
            teacher.save()
        
        # Login through the API endpoint
        response = client.post('/api/v1/login', data={
            'email': teacher.email,
            'password': 'Password1234!'
        }, follow_redirects=True)
        
        assert response.status_code == 200
    
    return client


@pytest.fixture
def test_submission(client, test_user, test_course):
    """Create a test submission"""
    with app.app_context():
        user = User.objects(id=ObjectId(test_user)).first()
        course = Course.objects(id=ObjectId(test_course)).first()
        
        submission = Submission(
            user_id=user,
            course_id=course,
            assignment_title='Test Assignment',
            content='Test submission content',
            task_description='Complete this assignment',
            submission_type='code',
            status='submitted'
        )
        submission.save()
        return str(submission.id)
