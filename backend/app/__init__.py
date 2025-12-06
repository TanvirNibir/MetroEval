"""
MetroEval - Metropolia University of Applied Sciences
AI-Powered Feedback & Peer Review System
Application Factory
"""
import os
import secrets
from flask import Flask
from flask_login import LoginManager
import warnings

warnings.filterwarnings(
    "ignore",
    category=FutureWarning,
    module="google.api_core._python_version_support",
)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Get project root (two levels up from this file)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_app(config_name: str = 'development'):
    """Create and configure Flask application"""
    
    app = Flask(
        __name__,
        instance_path=os.path.join(project_root, 'instance'),
        static_folder=os.path.join(project_root, 'static')
    )
    
    # Load configuration - SECRET_KEY handling
    secret_key = os.environ.get('SECRET_KEY')
    if not secret_key:
        if config_name == 'production':
            raise ValueError(
                "SECRET_KEY environment variable must be set in production. "
                "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )
        # Generate a secure random key for development/testing
        # This ensures each development instance has a unique key
        secret_key = secrets.token_urlsafe(32)
        import warnings
        warnings.warn(
            f"SECRET_KEY not set. Generated a random key for {config_name} mode. "
            "Set SECRET_KEY environment variable for production deployment!",
            UserWarning
        )
    app.config['SECRET_KEY'] = secret_key
    app.config['ENV'] = config_name
    app.config['TESTING'] = config_name == 'testing'
    
    # Security configuration
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max request size
    app.config['SESSION_COOKIE_SECURE'] = config_name == 'production'  # HTTPS only in production
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
    
    # Initialize extensions
    login_manager = LoginManager()
    login_manager.init_app(app)
    
    # Import and setup database
    try:
        from app.core.database import init_db
        
        # Only initialize DB if not in testing mode
        if os.environ.get('FLASK_ENV') != 'testing' and not app.config.get('TESTING'):
            try:
                init_db()
            except Exception as db_error:
                # Log but don't crash - app can start without DB connection
                import warnings
                warnings.warn(f"Database initialization failed: {db_error}. App will continue without database.")
    except ImportError as import_error:
        # If database module can't be imported, log but continue
        import warnings
        warnings.warn(f"Could not import database module: {import_error}. App will continue.")
    
    # Setup middleware
    from app.middleware import (
        setup_cors, register_error_handlers, setup_auth,
        setup_rate_limiting, setup_security_headers
    )
    setup_cors(app)
    setup_auth(app, login_manager)
    setup_rate_limiting(app)
    setup_security_headers(app)
    register_error_handlers(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Context processor for templates
    from flask_login import current_user
    from app.config import DEFAULT_DEPARTMENT, DEPARTMENT_OPTIONS
    
    @app.context_processor
    def inject_department_context():
        """Inject department context into templates"""
        current_dept = DEFAULT_DEPARTMENT
        if current_user.is_authenticated and getattr(current_user, 'department', None):
            current_dept = current_user.department
        return {
            'department_options': DEPARTMENT_OPTIONS,
            'global_current_department': current_dept
        }
    
    return app


def register_blueprints(app):
    """Register all route blueprints"""
    # Register API v1 blueprint (contains all v1 routes)
    from app.api.v1 import api_v1
    app.register_blueprint(api_v1)
    
    # Register static routes
    from app.api import static
    app.register_blueprint(static.bp)

