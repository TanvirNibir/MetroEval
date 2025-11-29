"""Error handling middleware"""
from flask import jsonify, request
from app.exceptions.api_exceptions import APIException, ValidationError, NotFoundError, UnauthorizedError

def register_error_handlers(app):
    """Register error handlers for the Flask app"""
    
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        """Handle custom API exceptions"""
        response = jsonify({
            'success': False,
            'error': error.message,
            'code': error.code
        })
        response.status_code = error.status_code
        return response
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle validation errors"""
        response = jsonify({
            'success': False,
            'error': error.message,
            'errors': getattr(error, 'errors', None)
        })
        response.status_code = 400
        return response
    
    @app.errorhandler(NotFoundError)
    def handle_not_found(error):
        """Handle not found errors"""
        response = jsonify({
            'success': False,
            'error': error.message or 'Resource not found'
        })
        response.status_code = 404
        return response
    
    @app.errorhandler(UnauthorizedError)
    def handle_unauthorized(error):
        """Handle unauthorized errors"""
        response = jsonify({
            'success': False,
            'error': error.message or 'Unauthorized'
        })
        response.status_code = 401
        return response
    
    @app.errorhandler(404)
    def handle_404(error):
        """Handle 404 errors"""
        if request.path.startswith('/api/'):
            return jsonify({
                'success': False,
                'error': 'API endpoint not found'
            }), 404
        return error
    
    @app.errorhandler(500)
    def handle_500(error):
        """Handle 500 errors"""
        import traceback
        error_details = traceback.format_exc()
        app.logger.error(f'Server error: {error}\n{error_details}', exc_info=True)
        if request.path.startswith('/api/'):
            # In development/testing, return more details
            is_debug = app.config.get('ENV') in ('development', 'testing') or app.config.get('DEBUG')
            if is_debug:
                return jsonify({
                    'success': False,
                    'error': f'Internal server error: {str(error)}',
                    'details': error_details if app.config.get('DEBUG') else None
                }), 500
            # In production, return generic error
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
        return error
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Handle all other exceptions"""
        import traceback
        error_details = traceback.format_exc()
        app.logger.error(f'Unhandled exception: {error}\n{error_details}', exc_info=True)
        if request.path.startswith('/api/'):
            # In development/testing, return more details
            is_debug = app.config.get('ENV') in ('development', 'testing') or app.config.get('DEBUG')
            if is_debug:
                return jsonify({
                    'success': False,
                    'error': f'An unexpected error occurred: {str(error)}',
                    'details': error_details if app.config.get('DEBUG') else None
                }), 500
            # In production, return generic error
            return jsonify({
                'success': False,
                'error': 'An unexpected error occurred'
            }), 500
        raise error
