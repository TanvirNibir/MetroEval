"""Database configuration and initialization"""
from mongoengine import connect
import os

def get_db_config():
    """Get database configuration from environment variables"""
    return {
        'host': os.environ.get('MONGODB_HOST', 'localhost'),
        'port': int(os.environ.get('MONGODB_PORT', 27017)),
        'db': os.environ.get('MONGODB_DB', 'afprs'),
        'uri': os.environ.get('MONGODB_URI', None)
    }

def init_db():
    """Initialize database connection and create default data"""
    config = get_db_config()
    
    if config['uri']:
        uri = config['uri']
    else:
        uri = f'mongodb://{config["host"]}:{config["port"]}/{config["db"]}'
    
    # Connect with uuidRepresentation to avoid deprecation warnings
    connect(host=uri, alias='default', uuidRepresentation='standard')
    
    from app.utils.db_utils import init_db as init_default_data
    init_default_data()
    
    return True

def get_db():
    """Get database connection (for consistency with other ORMs)"""
    return None

