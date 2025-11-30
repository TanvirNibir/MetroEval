"""Security middleware for rate limiting and security headers"""
from flask import request, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
import os

# Initialize rate limiter (will be configured in setup function)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=os.environ.get('REDIS_URL', 'memory://')  # Use Redis in production
)

def setup_rate_limiting(app):
    """Setup rate limiting for the Flask app"""
    # Disable rate limiting in test mode
    if app.config.get('TESTING'):
        limiter.enabled = False
    else:
        # Configure rate limiter
        limiter.init_app(app)
    
    # Note: Specific rate limits are applied using @limiter.limit() decorator
    # on individual routes. See auth.py, feedback.py, tutor.py for examples.
    
    return limiter


def setup_security_headers(app):
    """Setup security headers using Flask-Talisman"""
    # Configure Talisman with security headers
    talisman_config = {
        'force_https': os.environ.get('FLASK_ENV') == 'production',
        'strict_transport_security': True,
        'strict_transport_security_max_age': 31536000,  # 1 year
        'content_security_policy': {
            'default-src': "'self'",
            'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",  # Needed for React
            'style-src': "'self' 'unsafe-inline'",
            'img-src': "'self' data: https:",
            'font-src': "'self' data:",
            'connect-src': "'self'",
        },
        'content_security_policy_nonce_in': ['script-src'],
        'frame_options': 'SAMEORIGIN',
        'x_content_type_options': 'nosniff',
        'x_xss_protection': True,
    }
    
    # Only apply strict CSP in production
    if os.environ.get('FLASK_ENV') != 'production':
        talisman_config['content_security_policy'] = None
    
    Talisman(app, **talisman_config)
    
    # Additional custom headers
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

