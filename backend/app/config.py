"""
Application configuration and constants
"""
import os

# Project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Department Options
DEPARTMENT_OPTIONS = [
    {'value': 'General Studies', 'label': 'General Studies'},
    {'value': 'Engineering & Computer Science', 'label': 'Engineering & Computer Science'},
    {'value': 'Business & Economics', 'label': 'Business & Economics'},
    {'value': 'Design & Creative Arts', 'label': 'Design & Creative Arts'},
    {'value': 'Health & Life Sciences', 'label': 'Health & Life Sciences'},
    {'value': 'Social Sciences & Humanities', 'label': 'Social Sciences & Humanities'}
]

DEFAULT_DEPARTMENT = DEPARTMENT_OPTIONS[0]['value']
ALLOWED_EMAIL_DOMAIN = '@metropolia.fi'

# API Constants
API_PREFIX = '/api'
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# File Upload Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_FILE_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'gif', 'webp',
    'pdf', 'doc', 'docx',
    'txt', 'md',
    'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json',
    'zip', 'rar'
}

# Peer Review Constants
DEFAULT_PEERS_PER_SUBMISSION = 2
MIN_PEERS_PER_SUBMISSION = 1
MAX_PEERS_PER_SUBMISSION = 5
ALLOW_SELF_REVIEW = os.getenv('ALLOW_SELF_REVIEW', 'false').lower() == 'true'  # Allow students to review their own submissions (for testing/small setups)

# Flashcard Constants
DEFAULT_FLASHCARD_COUNT = 25
MAX_FLASHCARD_COUNT = 100

# Quiz Constants
DEFAULT_QUIZ_TIME_LIMIT = 20  # minutes
DEFAULT_QUIZ_QUESTIONS = 25

