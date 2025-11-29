"""Bookmark model"""
from datetime import datetime

from mongoengine import (
    DateTimeField,
    DictField,
    Document,
    ReferenceField,
    StringField,
)


class Bookmark(Document):
    """Bookmarks/Favorites for submissions, resources, flashcards, tutor chats"""

    meta = {'collection': 'bookmarks'}

    user_id = ReferenceField('User', required=True)
    submission_id = ReferenceField('Submission')
    resource_id = ReferenceField('Resource')
    flashcard_id = ReferenceField('Flashcard')
    bookmark_type = StringField(
        required=True,
        max_length=20,
        choices=('submission', 'resource', 'flashcard', 'tutor-chat'),
    )
    notes = StringField()
    extra_data = DictField()
    created_at = DateTimeField(default=datetime.utcnow)

