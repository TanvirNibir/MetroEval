"""
WSGI entry point for production servers (Gunicorn, uWSGI, etc.)
This file is at the project root to work with Render deployment
"""
import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Now import and create the app
from app import create_app

app = create_app('production')

if __name__ == "__main__":
    app.run()

