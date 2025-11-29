"""Custom exception classes"""
from .api_exceptions import (
    APIException,
    ValidationError,
    NotFoundError,
    UnauthorizedError
)

__all__ = [
    'APIException',
    'ValidationError',
    'NotFoundError',
    'UnauthorizedError'
]
