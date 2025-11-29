"""Authentication utility functions"""
from flask_login import LoginManager
from bson import ObjectId
from app.models import User
from app.config import ALLOWED_EMAIL_DOMAIN
from werkzeug.security import generate_password_hash

def normalize_email(email):
    """Return a stripped, lowercase email string (or empty string)."""
    return email.strip().lower() if email else ''

def is_metropolia_email(email):
    """Check if the provided email belongs to the Metropolia domain."""
    return normalize_email(email).endswith(ALLOWED_EMAIL_DOMAIN)

def load_user(user_id):
    """Load user by ID for Flask-Login"""
    from app.utils.model_utils import get_user_by_id
    return get_user_by_id(user_id)

def hash_password(password: str) -> str:
    """
    Generate a secure password hash using pbkdf2:sha256.
    Raises ValueError if password hashing fails.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
        
    Raises:
        ValueError: If password hashing fails
    """
    try:
        return generate_password_hash(password, method='pbkdf2:sha256')
    except (ValueError, TypeError) as e:
        # Try fallback method
        try:
            return generate_password_hash(password, method='pbkdf2')
        except (ValueError, TypeError):
            # If both methods fail, raise error instead of using insecure fallback
            raise ValueError(f"Failed to hash password: {str(e)}") from e
