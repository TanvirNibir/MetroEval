"""Flashcard API routes"""
from flask import request, current_app
from flask_login import login_required, current_user
from typing import Dict, Any
from app.models import Flashcard
from app.utils.response_utils import success_response, error_response
from app.services.ai_service import ai_service
from app.config import DEFAULT_FLASHCARD_COUNT
from . import api_v1

bp = api_v1  # Use the v1 API blueprint

@bp.route('/flashcards', methods=['GET'])
@login_required
def get_flashcards() -> Dict[str, Any]:
    """Get user's flashcards"""
    try:
        flashcards = Flashcard.objects(user_id=current_user).limit(100)
        return success_response([{
            'id': str(f.id),
            'front': f.front,
            'back': f.back,
            'category': f.category or 'general',
            'difficulty': f.difficulty,
            'mastery_level': f.mastery_level,
            'review_count': f.review_count,
            'last_reviewed': f.last_reviewed.isoformat() if f.last_reviewed else None,
            'created_at': f.created_at.isoformat() if f.created_at else None,
        } for f in flashcards])
    except Exception as e:
        current_app.logger.error(f"Failed to fetch flashcards: {str(e)}", exc_info=True)
        return error_response('Failed to fetch flashcards. Please try again.', 500)

@bp.route('/flashcards', methods=['POST'])
@login_required
def create_flashcard() -> Dict[str, Any]:
    """Create a new flashcard"""
    try:
        data = request.json if request.is_json else request.form.to_dict()
        
        front = data.get('front', '').strip()
        back = data.get('back', '').strip()
        category = data.get('category', 'general').strip() or 'general'
        
        if not front or not back:
            return error_response('Both front and back are required', 400)
        
        flashcard = Flashcard(
            user_id=current_user,
            front=front,
            back=back,
            category=category,
            mastery_level=0.0,
            review_count=0
        )
        flashcard.save()
        
        return success_response({
            'id': str(flashcard.id),
            'front': flashcard.front,
            'back': flashcard.back,
            'category': flashcard.category,
            'mastery_level': flashcard.mastery_level,
            'review_count': flashcard.review_count,
        })
    except Exception as e:
        current_app.logger.error(f"Failed to create flashcard: {str(e)}", exc_info=True)
        return error_response('Failed to create flashcard. Please try again.', 500)

@bp.route('/flashcards/generate', methods=['POST'])
@login_required
def generate_flashcards_endpoint() -> Dict[str, Any]:
    """Generate flashcards using AI - always generates exactly 25 flashcards"""
    try:
        data = request.json if request.is_json else request.form.to_dict()
        topic = data.get('topic', '').strip()
        
        if not topic:
            return error_response('Topic is required', 400)
        
        # Always generate exactly DEFAULT_FLASHCARD_COUNT (25) flashcards using AI
        current_app.logger.info(f"Generating {DEFAULT_FLASHCARD_COUNT} flashcards for topic: {topic}")
        generated_flashcards = ai_service.generate_flashcards(topic, count=DEFAULT_FLASHCARD_COUNT)
        
        if not generated_flashcards:
            return error_response('AI service failed to generate flashcards. Please try again.', 500)
        
        if len(generated_flashcards) < DEFAULT_FLASHCARD_COUNT:
            current_app.logger.warning(f"Only {len(generated_flashcards)} flashcards generated, expected {DEFAULT_FLASHCARD_COUNT}")
        
        # Create flashcards in database
        created_flashcards = []
        for card_data in generated_flashcards:
            if not card_data.get('front') or not card_data.get('back'):
                continue  # Skip invalid flashcards
            flashcard = Flashcard(
                user_id=current_user,
                front=card_data.get('front', ''),
                back=card_data.get('back', ''),
                category=card_data.get('category', topic.lower()),
                mastery_level=0.0,
                review_count=0
            )
            flashcard.save()
            created_flashcards.append({
                'id': str(flashcard.id),
                'front': flashcard.front,
                'back': flashcard.back,
                'category': flashcard.category,
            })
        
        current_app.logger.info(f"Successfully created {len(created_flashcards)} flashcards in database")
        
        return success_response({
            'count': len(created_flashcards),
            'expected_count': DEFAULT_FLASHCARD_COUNT,
            'flashcards': created_flashcards,
            'topic': topic
        })
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        current_app.logger.error(f"Error generating flashcards: {error_details}")
        return error_response('Failed to generate flashcards. Please try again.', 500)

@bp.route('/flashcard/<flashcard_id>/review', methods=['POST'])
@login_required
def review_flashcard(flashcard_id: str) -> Dict[str, Any]:
    """Update flashcard mastery level after review"""
    try:
        flashcard = Flashcard.objects(id=flashcard_id, user_id=current_user).first()
        if not flashcard:
            return error_response('Flashcard not found', 404)
        
        data = request.json if request.is_json else request.form.to_dict()
        correct = data.get('correct', False)
        
        # Update mastery level based on review
        # Simple algorithm: increase by 0.1 if correct, decrease by 0.1 if incorrect
        if correct:
            flashcard.mastery_level = min(1.0, flashcard.mastery_level + 0.1)
        else:
            flashcard.mastery_level = max(0.0, flashcard.mastery_level - 0.1)
        
        flashcard.review_count = (flashcard.review_count or 0) + 1
        from datetime import datetime
        flashcard.last_reviewed = datetime.utcnow()
        flashcard.save()
        
        return success_response({
            'id': str(flashcard.id),
            'mastery_level': flashcard.mastery_level,
            'review_count': flashcard.review_count,
        })
    except Exception as e:
        current_app.logger.error(f"Failed to update flashcard: {str(e)}", exc_info=True)
        return error_response('Failed to update flashcard. Please try again.', 500)

@bp.route('/flashcard/<flashcard_id>/verify-answer', methods=['POST'])
@login_required
def verify_flashcard_answer(flashcard_id: str) -> Dict[str, Any]:
    """Verify user's answer against flashcard using AI"""
    try:
        flashcard = Flashcard.objects(id=flashcard_id, user_id=current_user).first()
        if not flashcard:
            return error_response('Flashcard not found', 404)
        
        data = request.json if request.is_json else request.form.to_dict()
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return error_response('Answer is required', 400)
        
        current_app.logger.debug(f"Verifying answer for flashcard {flashcard_id}")
        
        # Use AI service to verify answer
        try:
            verification_result = ai_service.verify_flashcard_answer(
                correct_answer=flashcard.back or '',
                user_answer=user_answer,
                question=flashcard.front or ''
            )
            
            current_app.logger.debug(f"Verification result: {verification_result}")
            return success_response(verification_result)
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            current_app.logger.error(f"Error in verify_flashcard_answer endpoint: {e}")
            current_app.logger.debug(f"Error details: {error_details}")
            return error_response('Failed to verify answer. Please try again.', 500)
    except Exception as e:
        current_app.logger.error(f"Failed to verify answer: {str(e)}", exc_info=True)
        return error_response('Failed to verify answer. Please try again.', 500)


@bp.route('/flashcards/<flashcard_id>', methods=['DELETE'])
@login_required
def delete_flashcard(flashcard_id: str) -> Dict[str, Any]:
    """Delete a flashcard belonging to the current user"""
    try:
        flashcard = Flashcard.objects(id=flashcard_id, user_id=current_user).first()
        if not flashcard:
            return not_found_response('Flashcard')
        flashcard.delete()
        return success_response({'message': 'Flashcard deleted', 'id': flashcard_id})
    except Exception as e:
        current_app.logger.error(f"Failed to delete flashcard: {str(e)}", exc_info=True)
        return error_response('Failed to delete flashcard. Please try again.', 500)

