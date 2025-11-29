"""Bookmark API routes"""
from flask import request, current_app
from flask_login import login_required, current_user
from typing import Dict, Any, Optional
from mongoengine.errors import DoesNotExist

from app.models import Bookmark, Submission, Resource, Flashcard
from app.utils.response_utils import success_response, error_response, not_found_response
from . import api_v1

bp = api_v1  # reuse blueprint namespace

# Constants for input validation
MAX_NOTES_LENGTH = 1000
MAX_EXTRA_DATA_SIZE = 10000


def _serialize_bookmark(bookmark: Bookmark) -> Dict[str, Any]:
    """Convert bookmark document to dict with related info."""
    item = {
        'id': str(bookmark.id),
        'type': bookmark.bookmark_type,
        'notes': bookmark.notes or '',
        'created_at': bookmark.created_at.isoformat() if bookmark.created_at else None,
    }

    if bookmark.submission_id:
        try:
            try:
                submission = bookmark.submission_id
            except (DoesNotExist, AttributeError, TypeError):
                submission = None
            
            if submission:
                course_title = 'Submission'
                try:
                    if submission.course_id:
                        course_title = getattr(submission.course_id, 'name', 'Submission')
                except (DoesNotExist, AttributeError):
                    pass
                
                item.update({
                    'title': getattr(submission, 'assignment_title', 'Submission') or 'Submission',
                    'subtitle': course_title,
                    'link': f"/submissions/{submission.id}" if hasattr(submission, 'id') else '',
                    'metadata': {
                        'status': getattr(submission, 'status', 'unknown') or 'unknown',
                        'submission_type': getattr(submission, 'submission_type', 'unknown') or 'unknown',
                    },
                })
            else:
                item.update({
                    'title': 'Deleted Submission',
                    'subtitle': 'Submission',
                    'link': '',
                    'metadata': {},
                })
        except Exception as e:
            current_app.logger.error(f"Error serializing submission bookmark: {str(e)}", exc_info=True)
            item.update({
                'title': 'Submission (Error loading)',
                'subtitle': 'Submission',
                'link': '',
                'metadata': {},
            })
    elif bookmark.resource_id:
        try:
            try:
                resource = bookmark.resource_id
            except (DoesNotExist, AttributeError, TypeError):
                resource = None
            
            if resource:
                item.update({
                    'title': getattr(resource, 'title', 'Resource') or 'Resource',
                    'subtitle': (getattr(resource, 'category', None) or getattr(resource, 'resource_type', None) or 'Resource'),
                    'link': getattr(resource, 'url', '') or '',
                    'metadata': {
                        'resource_type': getattr(resource, 'resource_type', 'unknown') or 'unknown',
                        'tags': getattr(resource, 'tags', []) or [],
                    },
                })
            else:
                item.update({
                    'title': 'Deleted Resource',
                    'subtitle': 'Resource',
                    'link': '',
                    'metadata': {},
                })
        except Exception as e:
            current_app.logger.error(f"Error serializing resource bookmark: {str(e)}", exc_info=True)
            item.update({
                'title': 'Resource (Error loading)',
                'subtitle': 'Resource',
                'link': '',
                'metadata': {},
            })
    elif bookmark.flashcard_id:
        try:
            # Safely get flashcard reference - it might be deleted
            # Accessing a deleted reference can raise DoesNotExist
            try:
                flashcard = bookmark.flashcard_id
            except (DoesNotExist, AttributeError, TypeError):
                flashcard = None
            
            if flashcard is None:
                # Reference exists but flashcard was deleted
                item.update({
                    'title': 'Deleted Flashcard',
                    'subtitle': 'Flashcard',
                    'link': '',
                    'flashcard_id': None,
                    'metadata': {},
                })
            else:
                try:
                    # Try to access flashcard properties
                    flashcard_id = str(flashcard.id) if hasattr(flashcard, 'id') and flashcard.id else None
                    front_text = getattr(flashcard, 'front', None)
                    back_text = getattr(flashcard, 'back', None)
                    
                    # Safely process front text
                    if front_text and isinstance(front_text, str):
                        front_display = front_text.strip()[:120] if front_text.strip() else 'Flashcard'
                        front_meta = front_text[:80]
                    else:
                        front_display = 'Flashcard'
                        front_meta = ''
                    
                    # Safely process back text
                    if back_text and isinstance(back_text, str):
                        back_meta = back_text[:80]
                    else:
                        back_meta = ''
                    
                    item.update({
                        'title': front_display,
                        'subtitle': 'Flashcard',
                        'link': '',
                        'flashcard_id': flashcard_id,
                        'metadata': {
                            'front': front_meta,
                            'back': back_meta,
                        },
                    })
                except (AttributeError, TypeError, ValueError) as e:
                    # Flashcard exists but properties are inaccessible
                    current_app.logger.warning(f"Could not access flashcard properties: {str(e)}")
                    try:
                        flashcard_id = str(flashcard.id) if hasattr(flashcard, 'id') else None
                    except:
                        flashcard_id = None
                    item.update({
                        'title': 'Flashcard (Inaccessible)',
                        'subtitle': 'Flashcard',
                        'link': '',
                        'flashcard_id': flashcard_id,
                        'metadata': {},
                    })
        except Exception as e:
            # Handle any other errors accessing flashcard reference
            current_app.logger.error(f"Error serializing flashcard bookmark: {str(e)}", exc_info=True)
            item.update({
                'title': 'Flashcard (Error loading)',
                'subtitle': 'Flashcard',
                'link': '',
                'flashcard_id': None,
                'metadata': {},
            })
    elif bookmark.extra_data:
        item.update({
            'title': bookmark.extra_data.get('title') or 'Saved conversation',
            'subtitle': bookmark.extra_data.get('subtitle', ''),
            'metadata': bookmark.extra_data,
            'link': bookmark.extra_data.get('link', ''),
        })
    else:
        item['title'] = 'Bookmark'
        item['subtitle'] = ''
        item['link'] = ''

    return item


@bp.route('/bookmarks', methods=['GET'])
@login_required
def list_bookmarks() -> Dict[str, Any]:
    """Return current user's bookmarks."""
    try:
        bookmarks = Bookmark.objects(user_id=current_user).order_by('-created_at').limit(100)
        data = []
        for bookmark in bookmarks:
            try:
                serialized = _serialize_bookmark(bookmark)
                data.append(serialized)
            except Exception as e:
                # Log error for individual bookmark but continue processing others
                current_app.logger.error(f"Error serializing bookmark {bookmark.id}: {str(e)}", exc_info=True)
                # Add a fallback entry for this bookmark
                data.append({
                    'id': str(bookmark.id),
                    'type': bookmark.bookmark_type or 'unknown',
                    'title': 'Error loading bookmark',
                    'subtitle': '',
                    'link': '',
                    'notes': bookmark.notes or '',
                    'created_at': bookmark.created_at.isoformat() if bookmark.created_at else None,
                    'metadata': {},
                })
        return success_response({'data': data})
    except Exception as e:
        current_app.logger.error(f"Failed to list bookmarks: {str(e)}", exc_info=True)
        return error_response('Failed to load bookmarks. Please try again.', 500)


@bp.route('/bookmarks', methods=['POST'])
@login_required
def create_bookmark() -> Dict[str, Any]:
    """Create a bookmark for a submission or resource."""
    try:
        payload = request.get_json(silent=True) or {}
        bookmark_type = (payload.get('type') or payload.get('bookmark_type') or '').strip().lower()
        notes = (payload.get('notes') or '').strip()
        
        # Input validation
        if len(notes) > MAX_NOTES_LENGTH:
            return error_response(f'Notes too long. Maximum length is {MAX_NOTES_LENGTH} characters.', 400)

        valid_types = {'submission', 'resource', 'flashcard', 'tutor-chat'}
        if bookmark_type not in valid_types:
            return error_response('Bookmark type must be submission, resource, flashcard, or tutor-chat', 400)

        if bookmark_type == 'submission':
            submission_id = payload.get('submission_id')
            if not submission_id:
                return error_response('submission_id is required for submission bookmarks', 400)
            submission = Submission.objects(id=submission_id, user_id=current_user).first()
            if not submission:
                return not_found_response('Submission')
            existing = Bookmark.objects(user_id=current_user, submission_id=submission).first()
            if existing:
                return success_response({'info': 'Already bookmarked', 'data': _serialize_bookmark(existing)})
            bookmark = Bookmark(
                user_id=current_user,
                submission_id=submission,
                bookmark_type='submission',
                notes=notes,
            )
        elif bookmark_type == 'resource':
            resource_id = payload.get('resource_id')
            if not resource_id:
                return error_response('resource_id is required for resource bookmarks', 400)
            resource = Resource.objects(id=resource_id).first()
            if not resource:
                return not_found_response('Resource')
            # Note: Resources are typically public, but add access check if needed
            # For now, allow bookmarking any resource
            existing = Bookmark.objects(user_id=current_user, resource_id=resource).first()
            if existing:
                return success_response({'info': 'Already bookmarked', 'data': _serialize_bookmark(existing)})
            bookmark = Bookmark(
                user_id=current_user,
                resource_id=resource,
                bookmark_type='resource',
                notes=notes,
            )
        elif bookmark_type == 'flashcard':
            flashcard_id = payload.get('flashcard_id')
            if not flashcard_id:
                return error_response('flashcard_id is required for flashcard bookmarks', 400)
            flashcard = Flashcard.objects(id=flashcard_id, user_id=current_user).first()
            if not flashcard:
                return not_found_response('Flashcard')
            existing = Bookmark.objects(user_id=current_user, flashcard_id=flashcard).first()
            if existing:
                return success_response({'info': 'Already bookmarked', 'data': _serialize_bookmark(existing)})
            bookmark = Bookmark(
                user_id=current_user,
                flashcard_id=flashcard,
                bookmark_type='flashcard',
                notes=notes,
            )
        else:  # tutor-chat
            conversation = payload.get('conversation', '').strip()
            title = (payload.get('title') or conversation.splitlines()[0:1][0] if conversation else 'Tutor chat').strip()
            
            # Validate extra_data size
            extra_data = {
                'title': title[:120],
                'subtitle': payload.get('subtitle', 'AI Tutor conversation')[:200],
                'conversation': conversation[:5000],
                'highlight': payload.get('highlight', '')[:240],
            }
            
            import json
            extra_data_size = len(json.dumps(extra_data))
            if extra_data_size > MAX_EXTRA_DATA_SIZE:
                return error_response(f'Extra data too large. Maximum size is {MAX_EXTRA_DATA_SIZE} bytes.', 400)
            
            bookmark = Bookmark(
                user_id=current_user,
                bookmark_type='tutor-chat',
                notes=notes or title,
                extra_data=extra_data,
            )

        bookmark.save()
        return success_response({'data': _serialize_bookmark(bookmark)})
    except Exception as e:
        current_app.logger.error(f"Failed to create bookmark: {str(e)}", exc_info=True)
        return error_response('Failed to create bookmark. Please try again.', 500)


@bp.route('/bookmark/<bookmark_id>/delete', methods=['POST'])
@login_required
def delete_bookmark(bookmark_id: str) -> Dict[str, Any]:
    """Delete a bookmark."""
    try:
        bookmark = Bookmark.objects(id=bookmark_id, user_id=current_user).first()
        if not bookmark:
            return not_found_response('Bookmark')
        bookmark.delete()
        return success_response({'message': 'Bookmark removed', 'id': bookmark_id})
    except Exception as e:
        current_app.logger.error(f"Failed to delete bookmark: {str(e)}", exc_info=True)
        return error_response('Failed to delete bookmark. Please try again.', 500)

