"""CORS middleware for handling cross-origin requests"""
from flask import request, jsonify
import os

def get_allowed_origins():
    """Get allowed CORS origins from environment variables"""
    # Default to localhost for development
    default_origins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000'
    ]
    
    # Get from environment variable (comma-separated)
    env_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
    if env_origins:
        # Split by comma and strip whitespace
        origins = [origin.strip() for origin in env_origins.split(',') if origin.strip()]
        # In production, only use environment variable origins
        if os.environ.get('FLASK_ENV') == 'production':
            return origins
        # In development, combine with defaults
        return list(set(default_origins + origins))
    
    return default_origins

def setup_cors(app):
    """Setup CORS headers for the Flask app"""
    allowed_origins = get_allowed_origins()
    
    @app.after_request
    def after_request(response):
        """Add CORS headers to all responses"""
        origin = request.headers.get('Origin')
        
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, X-CSRFToken'
        
        return response
    
    @app.before_request
    def handle_preflight():
        """Handle OPTIONS requests for CORS preflight"""
        if request.method == 'OPTIONS':
            response = jsonify({})
            origin = request.headers.get('Origin')
            
            if origin in allowed_origins:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, X-CSRFToken'
            
            return response
