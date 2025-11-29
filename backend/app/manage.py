"""
CLI management script for Flask application
Usage: python -m app.manage <command>
"""
from flask.cli import FlaskGroup
from app import create_app

# Create Flask CLI group
cli = FlaskGroup(create_app=create_app)

@cli.command()
def init_db():
    """Initialize the database"""
    from app.core.database import init_db
    init_db()
    print("Database initialized!")

@cli.command()
def seed():
    """Seed the database with sample data"""
    import sys
    import os
    # Add backend directory to path
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    from backend.scripts.seed_data import seed_data
    seed_data()

@cli.command()
def runserver():
    """Run the development server"""
    import os
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)

if __name__ == '__main__':
    cli()

