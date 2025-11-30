"""
Minimal test WSGI to debug import issues
"""
import sys
import os

print("=== WSGI Test Start ===", file=sys.stderr)
print(f"Python path: {sys.path}", file=sys.stderr)
print(f"Current dir: {os.getcwd()}", file=sys.stderr)
print(f"__file__: {__file__}", file=sys.stderr)

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
print(f"Backend dir: {backend_dir}", file=sys.stderr)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
    print(f"Added {backend_dir} to path", file=sys.stderr)

print("Attempting to import app...", file=sys.stderr)
try:
    from app import create_app
    print("✓ Successfully imported create_app", file=sys.stderr)
    
    print("Attempting to create app...", file=sys.stderr)
    app = create_app('production')
    print("✓ Successfully created app", file=sys.stderr)
    
except Exception as e:
    import traceback
    error_msg = f"ERROR: {e}\n{traceback.format_exc()}"
    print(error_msg, file=sys.stderr)
    # Create a minimal app that shows the error
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    def error():
        return f"<h1>Error during app initialization</h1><pre>{error_msg}</pre>", 500

if __name__ == "__main__":
    app.run()

