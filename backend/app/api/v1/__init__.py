"""API v1 blueprints"""
from flask import Blueprint

api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Import all route modules to register them (this ensures routes are registered)
from . import (
    auth,
    users,
    submissions,
    feedback,
    peer_reviews,
    teacher,
    flashcards,
    tutor,
    bookmarks,
    notifications,
)
