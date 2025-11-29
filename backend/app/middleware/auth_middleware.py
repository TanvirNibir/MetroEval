"""Authentication middleware"""
from flask import request, jsonify, redirect, url_for
from flask_login import LoginManager
from app.utils.auth_utils import load_user

def setup_auth(app, login_manager: LoginManager):
    """Setup authentication for the Flask app"""
    
    @login_manager.user_loader
    def load_user_callback(user_id):
        """Load user by ID for Flask-Login"""
        return load_user(user_id)
    
    login_manager.login_view = 'static_routes.serve_react_app'
    
    @login_manager.unauthorized_handler
    def unauthorized():
        """Handle unauthorized access - return JSON for API requests"""
        if request.path.startswith('/api/'):
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        # For non-API routes, redirect to React app
        return redirect(url_for('static_routes.serve_react_app'))
