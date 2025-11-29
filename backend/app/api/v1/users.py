"""User profile and management routes"""
from flask import request
from flask_login import login_required, current_user
from app.models import User
from app.utils.auth_utils import normalize_email, is_metropolia_email, hash_password
from app.utils.response_utils import success_response, error_response
from app.utils.validation import validate_string_length, validate_email
from app.config import DEFAULT_DEPARTMENT, DEPARTMENT_OPTIONS
import base64

from . import api_v1

bp = api_v1

@bp.route('/user/profile', methods=['GET'])
@login_required
def get_user_profile():
    """Get current user's profile information"""
    try:
        return success_response({
            'id': str(current_user.id),
            'email': current_user.email,
            'name': current_user.name,
            'role': current_user.role,
            'department': current_user.department or DEFAULT_DEPARTMENT,
            'skill_level': getattr(current_user, 'skill_level', None),
            'created_at': current_user.created_at.isoformat() if hasattr(current_user, 'created_at') and current_user.created_at else None,
            'theme_preference': getattr(current_user, 'theme_preference', 'light') or 'light',
            'avatar_url': getattr(current_user, 'avatar_url', None)
        })
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Failed to fetch profile: {str(e)}", exc_info=True)
        return error_response('Failed to fetch profile. Please try again.', 500)

@bp.route('/user/profile', methods=['PUT'])
@login_required
def update_user_profile():
    """Update current user's profile"""
    try:
        data = request.json or {}
        
        if 'name' in data:
            if not validate_string_length(data['name'], min_length=2, max_length=100):
                return error_response('Name must be between 2 and 100 characters', 400)
            current_user.name = data['name'].strip()
        
        if 'email' in data:
            new_email = normalize_email(data['email'])
            if not validate_email(new_email):
                return error_response('Invalid email address', 400)
            if not is_metropolia_email(new_email):
                return error_response('Email must be a @metropolia.fi address', 400)
            existing_user = User.objects(email__iexact=new_email).first()
            if existing_user and str(existing_user.id) != str(current_user.id):
                return error_response('Email already registered', 400)
            current_user.email = new_email
        
        if 'password' in data and data['password']:
            if not validate_string_length(data['password'], min_length=6):
                return error_response('Password must be at least 6 characters', 400)
            try:
                password_hash = hash_password(data['password'])
            except ValueError as e:
                current_app.logger.error(f"Failed to hash password: {str(e)}")
                return error_response('Failed to update password. Please try again.', 500)
            current_user.password_hash = password_hash
        
        if 'department' in data:
            current_user.department = data['department']
        
        if 'skill_level' in data:
            try:
                skill_level = float(data['skill_level'])
                if 0.0 <= skill_level <= 1.0:
                    current_user.skill_level = skill_level
            except (ValueError, TypeError):
                return error_response('Skill level must be a number between 0.0 and 1.0', 400)
        
        if 'theme_preference' in data:
            if data['theme_preference'] in ['light', 'dark', 'auto']:
                current_user.theme_preference = data['theme_preference']
        
        if 'avatar_url' in data:
            current_user.avatar_url = data['avatar_url']
        
        current_user.save()
        
        return success_response({
            'profile': {
                'id': str(current_user.id),
                'email': current_user.email,
                'name': current_user.name,
                'role': current_user.role,
                'department': current_user.department or DEFAULT_DEPARTMENT,
                'skill_level': getattr(current_user, 'skill_level', None),
                'created_at': current_user.created_at.isoformat() if hasattr(current_user, 'created_at') and current_user.created_at else None,
                'theme_preference': getattr(current_user, 'theme_preference', 'light') or 'light',
                'avatar_url': getattr(current_user, 'avatar_url', None)
            }
        }, message='Profile updated successfully')
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Failed to update profile: {str(e)}", exc_info=True)
        return error_response('Failed to update profile. Please try again.', 500)

@bp.route('/user/department', methods=['POST'])
@login_required
def update_user_department():
    """Update the current user's preferred department"""
    try:
        data = request.json or {}
        department = data.get('department', DEFAULT_DEPARTMENT)
        valid_departments = {opt['value'] for opt in DEPARTMENT_OPTIONS}
        if department not in valid_departments:
            return error_response('Invalid department', 400)
        
        current_user.department = department
        current_user.save()
        return success_response({'department': department})
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Failed to update department: {str(e)}", exc_info=True)
        return error_response('Failed to update department. Please try again.', 500)

@bp.route('/user/avatar', methods=['POST'])
@login_required
def upload_avatar():
    """Upload user avatar image"""
    try:
        if 'avatar' not in request.files:
            return error_response('No file provided', 400)
        
        file = request.files['avatar']
        if file.filename == '':
            return error_response('No file selected', 400)
        
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if file_ext not in allowed_extensions:
            return error_response('Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP', 400)
        
        file.seek(0, 2)  # SEEK_END
        file_size = file.tell()
        file.seek(0)
        if file_size > 5 * 1024 * 1024:
            return error_response('File too large. Maximum size is 5MB', 400)
        
        file_data = file.read()
        base64_data = base64.b64encode(file_data).decode('utf-8')
        data_url = f'data:image/{file_ext};base64,{base64_data}'
        
        current_user.avatar_url = data_url
        current_user.save()
        
        return success_response({'avatar_url': data_url}, message='Avatar uploaded successfully')
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Failed to upload avatar: {str(e)}", exc_info=True)
        return error_response('Failed to upload avatar. Please try again.', 500)
