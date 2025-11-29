"""CORS middleware for handling cross-origin requests"""
from flask import request, jsonify

ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000'
]

def setup_cors(app):
    """Setup CORS headers for the Flask app"""
    
    @app.after_request
    def after_request(response):
        """Add CORS headers to all responses"""
        origin = request.headers.get('Origin')
        
        if origin in ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept'
        
        return response
    
    @app.before_request
    def handle_preflight():
        """Handle OPTIONS requests for CORS preflight"""
        if request.method == 'OPTIONS':
            response = jsonify({})
            origin = request.headers.get('Origin')
            
            if origin in ALLOWED_ORIGINS:
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Credentials'] = 'true'
                response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept'
            
            return response
