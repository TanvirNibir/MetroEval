"""
WSGI entry point for production servers (Gunicorn, uWSGI, etc.)
"""
import os

# Set FLASK_ENV to production if not set
if not os.environ.get('FLASK_ENV'):
    os.environ['FLASK_ENV'] = 'production'

from app import create_app

app = create_app('production')

if __name__ == "__main__":
    app.run()

