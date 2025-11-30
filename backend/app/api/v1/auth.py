"""Authentication routes"""
from flask import request, current_app
from flask_login import login_user, logout_user
from werkzeug.security import check_password_hash
from app.models import User
from app.utils.auth_utils import normalize_email, is_metropolia_email, hash_password
from app.utils.response_utils import success_response, error_response
from app.utils.validation import validate_required_fields, validate_string_length, validate_password
from app.utils.security_utils import log_security_event, sanitize_input
from app.config import DEFAULT_DEPARTMENT
from app.exceptions.api_exceptions import ValidationError

from . import api_v1
from app.middleware.security_middleware import limiter

bp = api_v1  # Use the v1 API blueprint

@bp.route('/login', methods=['POST'])
@limiter.limit("5 per 15 minutes")  # 5 login attempts per 15 minutes per IP
def login():
    """Handle login form submission"""
    try:
        data = request.json if request.is_json else request.form.to_dict()
        email = normalize_email(data.get('email'))
        password = data.get('password')
        ip_address = request.remote_addr or request.headers.get('X-Forwarded-For', 'unknown')
        
        if not email or not password:
            return error_response('Email and password are required', 400)
        
        if not is_metropolia_email(email):
            log_security_event('invalid_email_domain', {'email': email}, ip_address=ip_address)
            return error_response('Only @metropolia.fi emails can sign in', 403)
        
        user = User.objects(email__iexact=email).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            return success_response({
                'role': user.role,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'name': user.name,
                    'role': user.role,
                    'department': user.department
                }
            })
        
        # Log failed login attempt
        log_security_event('failed_login', {'email': email}, 
                          user_id=str(user.id) if user else None, 
                          ip_address=ip_address)
        return error_response('Invalid credentials', 401)
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}", exc_info=True)
        # Don't expose internal error details to client
        return error_response('Login failed. Please try again.', 500)

@bp.route('/register', methods=['POST'])
@limiter.limit("100 per hour")  # 100 registrations per hour per IP
def register():
    """Handle registration form submission"""
    import traceback
    try:
        # Get request data
        data = request.json if request.is_json else request.form.to_dict()
        
        # Validate required fields
        email = normalize_email(data.get('email'))
        password = data.get('password')
        name = data.get('name')
        role = data.get('role', 'student')
        department = data.get('department', DEFAULT_DEPARTMENT)
        
        if not email or not password or not name:
            return error_response('Email, password, and name are required', 400)
        
        if not is_metropolia_email(email):
            return error_response('Registration requires a @metropolia.fi email', 400)
        
        # Validate password strength
        is_valid, password_error = validate_password(password)
        if not is_valid:
            return error_response(password_error, 400)
        
        # Sanitize name input
        name = sanitize_input(name.strip())
        if not validate_string_length(name, min_length=2, max_length=100):
            return error_response('Name must be between 2 and 100 characters', 400)
        
        # Check if user already exists
        try:
            existing_user = User.objects(email__iexact=email).first()
            if existing_user:
                return error_response('Email already registered', 400)
        except Exception as check_error:
            current_app.logger.warning(f"Error checking existing user: {traceback.format_exc()}")
            # Continue - might be a connection issue, but we'll try to create anyway
        
        # Generate password hash using utility function
        try:
            password_hash = hash_password(password)
        except ValueError as e:
            current_app.logger.error(f"Failed to hash password during registration: {str(e)}")
            return error_response('Failed to process registration. Please try again.', 500)
        
        # Create and save user
        try:
            user = User(
                email=email,
                password_hash=password_hash,
                name=name.strip(),
                role=role,
                department=department
            )
            user.save()
        except Exception as save_error:
            error_details = traceback.format_exc()
            current_app.logger.error(f"Error saving user: {error_details}")
            # Check if it's a duplicate key error (race condition)
            error_str = str(save_error).lower()
            if 'duplicate' in error_str or 'e11000' in error_str:
                return error_response('Email already registered', 400)
            current_app.logger.error(f"Failed to create user account: {error_details}")
            return error_response('Failed to create user account. Please try again.', 500)
        
        # Login the user
        try:
            login_user(user, remember=True)
        except Exception as login_error:
            error_details = traceback.format_exc()
            current_app.logger.warning(f"User created but login failed: {error_details}")
            # Continue anyway - user can login manually
        
        return success_response({
            'role': user.role,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'department': user.department
            }
        })
    except ValidationError as e:
        return error_response(e.message, 400, getattr(e, 'errors', None))
    except Exception as e:
        error_details = traceback.format_exc()
        current_app.logger.error(f"Registration error: {error_details}")
        # Don't expose internal error details to client
        return error_response('Registration failed. Please try again.', 500)

@bp.route('/logout')
def logout():
    """Handle logout"""
    try:
        from flask_login import current_user
        if current_user.is_authenticated:
            logout_user()
        return success_response(message='Logged out successfully')
    except Exception as e:
        current_app.logger.error(f"Logout failed: {str(e)}", exc_info=True)
        return error_response('Logout failed. Please try again.', 500)
