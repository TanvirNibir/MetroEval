"""Custom API exception classes"""

class APIException(Exception):
    """Base exception for API errors"""
    
    def __init__(self, message: str, status_code: int = 500, code: str = None):
        self.message = message
        self.status_code = status_code
        self.code = code or self.__class__.__name__
        super().__init__(self.message)


class ValidationError(APIException):
    """Exception raised for validation errors"""
    
    def __init__(self, message: str, errors: dict = None):
        self.errors = errors
        super().__init__(message, status_code=400, code='VALIDATION_ERROR')


class NotFoundError(APIException):
    """Exception raised when resource is not found"""
    
    def __init__(self, message: str = 'Resource not found'):
        super().__init__(message, status_code=404, code='NOT_FOUND')


class UnauthorizedError(APIException):
    """Exception raised for unauthorized access"""
    
    def __init__(self, message: str = 'Unauthorized'):
        super().__init__(message, status_code=401, code='UNAUTHORIZED')


