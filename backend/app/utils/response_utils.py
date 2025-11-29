"""Response utility functions"""
from flask import jsonify
from typing import Any, Dict, Optional


def success_response(data: Any = None, message: Optional[str] = None) -> Dict:
    """Create a standardized success response"""
    response = {'success': True}
    if message:
        response['message'] = message
    if data is not None:
        if isinstance(data, dict):
            response.update(data)
        else:
            response['data'] = data
    return jsonify(response)


def error_response(message: str, status_code: int = 400, errors: Optional[Dict] = None) -> tuple:
    """Create a standardized error response"""
    response = {'success': False, 'error': message}
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code


def not_found_response(resource: str = 'Resource') -> tuple:
    """Create a standardized not found response"""
    return error_response(f'{resource} not found', 404)


def forbidden_response(message: str = 'Forbidden') -> tuple:
    """Create a standardized forbidden response"""
    return error_response(message, 403)

