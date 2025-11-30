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

# IMPORTANT: Set environment variables BEFORE importing create_app
# This ensures they're available when create_app checks for them
if not os.environ.get('SECRET_KEY'):
    os.environ['SECRET_KEY'] = '4e99c9c2686b81e8e17f44430b5838e914be9e4a6c9ae1593b30745848039d59'
    import warnings
    warnings.warn("SECRET_KEY not set in environment, using fallback. Please set it via Render dashboard.")

# Set other critical env vars if not set
if not os.environ.get('MONGODB_URI'):
    os.environ['MONGODB_URI'] = 'mongodb+srv://tanvirnibir_db_user:Modern2004%40@cluster0.thxhvub.mongodb.net/afprs?retryWrites=true&w=majority&appName=Cluster0'

if not os.environ.get('GOOGLE_API_KEY'):
    os.environ['GOOGLE_API_KEY'] = 'AIzaSyD6BC7dutJero4--Zw5xw5ZmtQfAh6UIgo'

if not os.environ.get('CORS_ALLOWED_ORIGINS'):
    os.environ['CORS_ALLOWED_ORIGINS'] = 'https://metroeval-frontend.onrender.com'

# Debug: Print environment variables (without sensitive values)
import sys
print("=== Environment Variables Check ===", file=sys.stderr)
print(f"SECRET_KEY: {'SET' if os.environ.get('SECRET_KEY') else 'NOT SET'}", file=sys.stderr)
print(f"MONGODB_URI: {'SET' if os.environ.get('MONGODB_URI') else 'NOT SET'}", file=sys.stderr)
print(f"FLASK_ENV: {os.environ.get('FLASK_ENV', 'NOT SET')}", file=sys.stderr)

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

