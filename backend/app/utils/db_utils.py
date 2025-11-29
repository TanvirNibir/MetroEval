"""Database utility functions"""
from app.models import User, Course
from app.config import DEFAULT_DEPARTMENT
from app.utils.auth_utils import hash_password

def init_db():
    """Initialize database collections and default data"""
    course = Course.objects(code='GEN101').first()
    if not course:
        course = Course(
            name='Interdisciplinary Foundations',
            code='GEN101',
            department=DEFAULT_DEPARTMENT
        )
        course.save()
    
    admin = User.objects(email='admin@metropolia.fi').first()
    if not admin:
        try:
            password_hash = hash_password('admin123')
        except ValueError:
            # If password hashing fails during init, log and skip admin creation
            import logging
            logger = logging.getLogger(__name__)
            logger.error("Failed to create admin user: password hashing failed")
            return
        
        admin = User(
            email='admin@metropolia.fi',
            password_hash=password_hash,
            name='Admin User',
            role='teacher'
        )
        admin.save()
