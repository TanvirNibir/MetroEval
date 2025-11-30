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

# Set FLASK_ENV to production if not set
if not os.environ.get('FLASK_ENV'):
    os.environ['FLASK_ENV'] = 'production'

# Now import and create the app
try:
    from app import create_app
    app = create_app('production')
except Exception as e:
    # Log the error for debugging
    import traceback
    import sys
    error_msg = f"Error creating app: {e}\n{traceback.format_exc()}"
    print(error_msg, file=sys.stderr)
    print(error_msg, file=sys.stdout)
    # Re-raise to see the error in logs
    raise

if __name__ == "__main__":
    app.run()

