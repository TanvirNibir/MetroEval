"""Department utility functions"""
from flask_login import current_user
from app.models import Course, User
from app.config import DEFAULT_DEPARTMENT

def get_current_department():
    """Get current user's department or default"""
    if current_user.is_authenticated and getattr(current_user, 'department', None):
        return current_user.department
    return DEFAULT_DEPARTMENT

def _department_code_prefix(department):
    """Generate department code prefix"""
    sanitized = ''.join(ch for ch in department.upper() if ch.isalnum())
    return sanitized[:4] or 'GEN'

def get_or_create_department_course(department):
    """Get or create a course for a department"""
    course = Course.objects(department=department).first()
    if course:
        return course
    
    prefix = _department_code_prefix(department)
    code = f'GEN-{prefix}'
    suffix = 1
    while Course.objects(code=code).first():
        code = f'GEN-{prefix}{suffix}'
        suffix += 1
    
    course = Course(
        name=f'{department} Learning Studio',
        code=code,
        department=department
    )
    course.save()
    return course
