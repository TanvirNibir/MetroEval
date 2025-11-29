"""Business logic services layer"""
from .ai_service import AIService
from .peer_matching_service import PeerMatchingService
from .performance_predictor_service import PerformancePredictor

# Create singleton instances (one instance shared across the application)
ai_service = AIService()
peer_matching_service = PeerMatchingService()
performance_predictor_service = PerformancePredictor()

__all__ = [
    'AIService',
    'PeerMatchingService',
    'PerformancePredictor',
    'ai_service',
    'peer_matching_service',
    'performance_predictor_service',
]
