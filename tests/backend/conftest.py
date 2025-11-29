"""
Pytest configuration and fixtures
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
os.environ['SECRET_KEY'] = 'test-secret-key'
os.environ['MONGODB_URI'] = os.environ.get('TEST_MONGODB_URI', 'mongodb://localhost:27017/test_afprs')

# Import after setting environment
sys.path.insert(0, os.path.join(backend_dir, 'app'))

from app import create_app
from app.models import User, Course, Submission, Feedback, PeerReview
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
    test_db_uri = os.environ.get('TEST_MONGODB_URI', 'mongodb://localhost:27017/test_afprs')
    monkeypatch.setenv('MONGODB_URI', test_db_uri)
    monkeypatch.setenv('FLASK_ENV', 'testing')
    monkeypatch.setenv('SECRET_KEY', 'test-secret-key')
    
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['WTF_CSRF_ENABLED'] = False
    
    # Connect to test database with uuidRepresentation to avoid deprecation warnings
    try:
        connect(host=test_db_uri, alias='default', uuidRepresentation='standard')
    except Exception:
        # If connection fails, tests will need MongoDB running
        pytest.skip("MongoDB not available. Set TEST_MONGODB_URI or start MongoDB.")
    
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
        except Exception:
            pass
    
    # Disconnect after test
    try:
        disconnect()
    except Exception:
        pass


@pytest.fixture
def test_user(client):
    """Create a test user"""
    with app.app_context():
        # Delete existing user if exists
        User.objects(email='test@metropolia.fi').delete()
        
        try:
            password_hash = generate_password_hash('password123', method='pbkdf2:sha256')
        except (ValueError, TypeError, AttributeError):
            try:
                password_hash = generate_password_hash('password123', method='pbkdf2')
            except (ValueError, TypeError, AttributeError):
                import hashlib
                password_hash = hashlib.sha256('password123'.encode()).hexdigest()
        
        user = User(
            email='test@metropolia.fi',
            password_hash=password_hash,
            name='Test User',
            role='student',
            department='General Studies'
        )
        user.save()
        return str(user.id)


@pytest.fixture
def test_teacher(client):
    """Create a test teacher user"""
    with app.app_context():
        User.objects(email='teacher@metropolia.fi').delete()
        
        try:
            password_hash = generate_password_hash('password123', method='pbkdf2:sha256')
        except (ValueError, TypeError, AttributeError):
            try:
                password_hash = generate_password_hash('password123', method='pbkdf2')
            except (ValueError, TypeError, AttributeError):
                import hashlib
                password_hash = hashlib.sha256('password123'.encode()).hexdigest()
        
        teacher = User(
            email='teacher@metropolia.fi',
            password_hash=password_hash,
            name='Test Teacher',
            role='teacher',
            department='General Studies'
        )
        teacher.save()
        return str(teacher.id)


@pytest.fixture
def authenticated_client(client, test_user):
    """Create an authenticated test client"""
    with app.app_context():
        user = User.objects(id=ObjectId(test_user)).first()
        if not user:
            try:
                password_hash = generate_password_hash('password123', method='pbkdf2:sha256')
            except (ValueError, TypeError, AttributeError):
                try:
                    password_hash = generate_password_hash('password123', method='pbkdf2')
                except (ValueError, TypeError, AttributeError):
                    import hashlib
                    password_hash = hashlib.sha256('password123'.encode()).hexdigest()
            
            user = User(
                email='test@metropolia.fi',
                password_hash=password_hash,
                name='Test User',
                role='student',
                department='General Studies'
            )
            user.save()
        
        # Login through the API endpoint
        client.post('/api/v1/login', data={
            'email': user.email,
            'password': 'password123'
        }, follow_redirects=True)
    
    return client
