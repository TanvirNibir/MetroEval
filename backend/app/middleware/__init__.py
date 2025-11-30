"""Middleware for request/response processing"""
from .cors_middleware import setup_cors
from .error_handler import register_error_handlers
from .auth_middleware import setup_auth
from .security_middleware import setup_rate_limiting, setup_security_headers

__all__ = ['setup_cors', 'register_error_handlers', 'setup_auth', 'setup_rate_limiting', 'setup_security_headers']
