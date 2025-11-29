"""AI Tutor routes"""
from flask import request, current_app
from flask_login import login_required
from typing import Dict, List, Any

from app.utils.response_utils import success_response, error_response
from app.services.ai_service import ai_service
from app.config import MAX_FILE_SIZE
from . import api_v1

bp = api_v1

# Constants for input validation
MAX_QUESTION_LENGTH = 2000
MAX_CONTEXT_LENGTH = 5000
MAX_HISTORY_ENTRIES = 12
MAX_HISTORY_ENTRY_LENGTH = 1000


@bp.route('/tutor/chat', methods=['POST'])
@login_required
def tutor_chat() -> Dict[str, Any]:
    """Handle AI tutor chat messages"""
    try:
        data = request.get_json(silent=True) or {}
        question = (data.get('question') or data.get('prompt') or data.get('message') or '').strip()
        context = (data.get('context') or '').strip()
        history = data.get('history') or []

        # Input validation
        if not question:
            return error_response('Please provide a question for the tutor.', 400)
        
        if len(question) > MAX_QUESTION_LENGTH:
            return error_response(f'Question too long. Maximum length is {MAX_QUESTION_LENGTH} characters.', 400)
        
        if len(context) > MAX_CONTEXT_LENGTH:
            return error_response(f'Context too long. Maximum length is {MAX_CONTEXT_LENGTH} characters.', 400)

        # Validate and sanitize history
        sanitized_history = []
        if isinstance(history, list):
            if len(history) > MAX_HISTORY_ENTRIES:
                history = history[-MAX_HISTORY_ENTRIES:]  # Take last N entries
            
            for entry in history:
                if isinstance(entry, dict):
                    role = entry.get('role', '')
                    text = (entry.get('text') or entry.get('content') or '').strip()
                    
                    # Limit entry length
                    if len(text) > MAX_HISTORY_ENTRY_LENGTH:
                        text = text[:MAX_HISTORY_ENTRY_LENGTH]
                    
                    sanitized_history.append({
                        'role': str(role)[:50],  # Limit role length
                        'text': text
                    })

        result = ai_service.chat_with_tutor(question=question, context=context, history=sanitized_history)
        if not result or 'response' not in result:
            current_app.logger.warning("AI tutor returned empty result")
            return error_response('AI tutor was unable to respond. Please try again.', 500)

        return success_response({
            'response': result['response']
        })
    except Exception as e:
        current_app.logger.error(f"Error in tutor chat: {str(e)}", exc_info=True)
        return error_response('Failed to process tutor chat. Please try again.', 500)

