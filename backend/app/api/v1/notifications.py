"""Notification API routes"""
from flask import Response, stream_with_context, current_app
from flask_login import login_required, current_user
from app.models import Notification
from app.utils.response_utils import success_response, error_response, not_found_response
from typing import Dict, Any
from . import api_v1
import json
import time

bp = api_v1


def serialize_notification(notification: Notification) -> Dict[str, Any]:
    """Serialize a notification document"""
    return {
        'id': str(notification.id),
        'title': notification.title,
        'message': notification.message,
        'type': notification.notification_type,
        'related_id': notification.related_id,
        'is_read': notification.is_read,
        'created_at': notification.created_at.isoformat() if notification.created_at else None,
    }


@bp.route('/notifications', methods=['GET'])
@login_required
def get_notifications() -> Dict[str, Any]:
    """Fetch the current user's notifications"""
    try:
        notifications = (
            Notification.objects(user_id=current_user)
            .order_by('-created_at')
            .limit(50)
        )
        return success_response([serialize_notification(n) for n in notifications])
    except Exception as exc:
        current_app.logger.error(f"Failed to load notifications: {exc}", exc_info=True)
        return error_response('Failed to load notifications. Please try again.', 500)


@bp.route('/notification/<notification_id>/read', methods=['POST'])
@login_required
def mark_notification_read(notification_id: str) -> Dict[str, Any]:
    """Mark a single notification as read"""
    try:
        notification = Notification.objects(id=notification_id, user_id=current_user).first()
        if not notification:
            return not_found_response('Notification')

        if not notification.is_read:
            notification.is_read = True
            notification.save()

        return success_response({'id': str(notification.id), 'is_read': True})
    except Exception as e:
        current_app.logger.error(f"Failed to mark notification as read: {str(e)}", exc_info=True)
        return error_response('Failed to mark notification as read. Please try again.', 500)


@bp.route('/notifications/read-all', methods=['POST'])
@login_required
def mark_all_notifications_read() -> Dict[str, Any]:
    """Mark all notifications as read"""
    try:
        Notification.objects(user_id=current_user, is_read=False).update(set__is_read=True)
        return success_response({'updated': True})
    except Exception as exc:
        current_app.logger.error(f"Failed to mark notifications as read: {exc}", exc_info=True)
        return error_response('Failed to mark notifications as read. Please try again.', 500)


@bp.route('/notifications/stream', methods=['GET'])
@login_required
def notifications_stream() -> Response:
    """Simple Server-Sent Events endpoint for future live updates."""

    def event_stream():
        # Inform client to retry after disconnects
        yield 'retry: 10000\n\n'
        while True:
            # Heartbeat comment to keep connection alive
            yield ': keep-alive\n\n'
            time.sleep(25)

    response = Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream'
    )
    response.headers['Cache-Control'] = 'no-cache'
    return response

