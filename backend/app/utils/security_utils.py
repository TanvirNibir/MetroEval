"""Security utility functions for input sanitization and password validation"""
import re
import bleach
from typing import Tuple, Optional

# Password requirements
MIN_PASSWORD_LENGTH = 12
REQUIRE_UPPERCASE = True
REQUIRE_LOWERCASE = True
REQUIRE_NUMBER = True
REQUIRE_SPECIAL = True

# Allowed HTML tags for markdown content (very restrictive)
ALLOWED_HTML_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote']
ALLOWED_HTML_ATTRIBUTES = {}

def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength according to security requirements.
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"
    
    errors = []
    
    if REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
        errors.append("at least one uppercase letter")
    
    if REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
        errors.append("at least one lowercase letter")
    
    if REQUIRE_NUMBER and not re.search(r'\d', password):
        errors.append("at least one number")
    
    if REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("at least one special character (!@#$%^&*(),.?\":{}|<>)")
    
    if errors:
        return False, f"Password must contain: {', '.join(errors)}"
    
    # Check for common weak passwords
    common_passwords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome']
    if password.lower() in common_passwords:
        return False, "Password is too common. Please choose a stronger password"
    
    return True, None


def sanitize_input(text: str, allow_html: bool = False) -> str:
    """
    Sanitize user input to prevent XSS attacks.
    
    Args:
        text: Input text to sanitize
        allow_html: If True, allow safe HTML tags (for markdown content)
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    if allow_html:
        # Allow only safe HTML tags for markdown rendering
        return bleach.clean(
            text,
            tags=ALLOWED_HTML_TAGS,
            attributes=ALLOWED_HTML_ATTRIBUTES,
            strip=True
        )
    else:
        # Strip all HTML tags
        return bleach.clean(text, tags=[], strip=True)


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    if not filename:
        return "file"
    
    # Remove path components
    filename = filename.replace('..', '').replace('/', '').replace('\\', '')
    
    # Remove any remaining dangerous characters
    filename = re.sub(r'[<>:"|?*]', '', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    
    return filename or "file"


def log_security_event(event_type: str, details: dict, user_id: Optional[str] = None, ip_address: Optional[str] = None):
    """
    Log security-related events for monitoring and auditing.
    
    Args:
        event_type: Type of security event (e.g., 'failed_login', 'rate_limit_exceeded')
        details: Additional event details
        user_id: User ID if applicable
        ip_address: IP address of the request
    """
    import json
    import logging
    from datetime import datetime
    
    log_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'user_id': user_id,
        'ip_address': ip_address,
        'details': details
    }
    
    # Try to use Flask's logger, fallback to standard logging
    try:
        from flask import current_app
        if current_app:
            current_app.logger.warning(f"SECURITY_EVENT: {json.dumps(log_data)}")
            return
    except (RuntimeError, AttributeError):
        pass
    
    # Fallback to standard logging
    logger = logging.getLogger(__name__)
    logger.warning(f"SECURITY_EVENT: {json.dumps(log_data)}")

