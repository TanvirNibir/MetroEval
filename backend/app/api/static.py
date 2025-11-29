"""Static file serving and React app routes"""
from flask import Blueprint, send_from_directory, jsonify, redirect, url_for, current_app
from app.config import project_root
import os

bp = Blueprint('static', __name__)

# Serve React build files and static assets
@bp.route('/static/react/<path:path>')
def serve_react(path):
    # Point to static/react in project root
    react_build_dir = os.path.join(project_root, 'static', 'react')
    return send_from_directory(react_build_dir, path)

# Serve Vite build assets (JS/CSS) from the React build directory
@bp.route('/assets/<path:path>')
def serve_react_assets(path):
    react_assets_dir = os.path.join(project_root, 'static', 'react', 'assets')
    if not os.path.exists(react_assets_dir):
        return jsonify({'error': 'Assets directory not found'}), 404
    try:
        return send_from_directory(react_assets_dir, path)
    except Exception as e:
        current_app.logger.warning(f"Error serving asset {path}: {str(e)}")
        return jsonify({'error': 'Asset not found'}), 404

@bp.route('/vite.svg')
def serve_vite_svg():
    react_build_dir = os.path.join(project_root, 'static', 'react')
    return send_from_directory(react_build_dir, 'vite.svg')

# Serve static CSS and JS files from static directory
@bp.route('/static/<path:path>')
def serve_static(path):
    """Serve static files from the static directory"""
    static_dir = os.path.join(project_root, 'static')
    return send_from_directory(static_dir, path)

# React routes - serve index.html for client-side routing (must be last)
@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def serve_react_app(path):
    # Skip API routes (they're handled by specific routes above)
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Skip static files (they're handled by static folder or specific routes)
    if path.startswith('static/'):
        # Let Flask handle static files through its static_folder
        return jsonify({'error': 'Static file not found'}), 404
    
    # Serve React app for all other routes (client-side routing)
    react_build_dir = os.path.join(project_root, 'static', 'react')
    index_path = os.path.join(react_build_dir, 'index.html')
    
    # If React build doesn't exist, return error message
    if not os.path.exists(index_path):
        return jsonify({
            'error': 'React frontend not built',
            'message': 'Please run "npm run build" in the frontend directory first',
            'instructions': '1. cd frontend\n2. npm install\n3. npm run build'
        }), 503
    
    # Serve React index.html (this enables client-side routing)
    return send_from_directory(react_build_dir, 'index.html')
