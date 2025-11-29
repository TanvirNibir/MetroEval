"""
Performance Prediction Service
Predicts student performance and identifies at-risk students
"""
from app.models import User, Submission, Feedback
from typing import Dict, List
from bson import ObjectId
try:
    from sklearn.linear_model import LinearRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

class PerformancePredictor:
    """Service for predicting student performance"""
    
    def __init__(self):
        if SKLEARN_AVAILABLE:
            self.model = LinearRegression()
        self._trained = False
    
    def predict_all_students(self) -> List[Dict]:
        """Predict performance for all students"""
        # Limit to avoid processing too many students at once
        students = User.objects(role='student').limit(500)
        predictions = []
        
        for student in students:
            prediction = self.predict_student(str(student.id))
            predictions.append({
                'student_id': str(student.id),
                'student_name': student.name,
                'predicted_score': prediction['predicted_score'],
                'risk_level': prediction['risk_level'],
                'factors': prediction['factors'],
                'recommendations': prediction['recommendations']
            })
        
        # Sort by risk level (high risk first)
        predictions.sort(key=lambda x: {'high': 0, 'medium': 1, 'low': 2}[x['risk_level']])
        
        return predictions
    
    def predict_student(self, user_id) -> Dict:
        """Predict performance for a single student"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            student = User.objects(id=ObjectId(user_id)).first() if isinstance(user_id, str) else User.objects(id=user_id).first()
        except Exception as e:
            logger.warning(f"Error loading student {user_id}: {e}")
            student = None
        
        if not student:
            return self._default_prediction()
        
        submissions = Submission.objects(user_id=student).limit(100)
        
        if not submissions:
            return {
                'predicted_score': 0.5,
                'risk_level': 'medium',
                'factors': ['No submissions yet'],
                'recommendations': ['Start submitting assignments regularly']
            }
        
        # Calculate features
        features = self._extract_features(student, submissions)
        
        # Simple prediction based on features
        predicted_score = self._calculate_prediction(features)
        
        # Determine risk level
        risk_level = 'low'
        if predicted_score < 0.5:
            risk_level = 'high'
        elif predicted_score < 0.7:
            risk_level = 'medium'
        
        # Identify factors
        factors = []
        if features['avg_score'] < 0.6:
            factors.append('Low average scores on submissions')
        if features['submission_count'] < 3:
            factors.append('Few submissions')
        if features['peer_feedback_quality'] < 0.5:
            factors.append('Low-quality peer feedback received')
        if features['improvement_trend'] < 0:
            factors.append('Declining performance trend')
        
        # Generate recommendations
        recommendations = self._generate_recommendations(features, risk_level)
        
        return {
            'predicted_score': predicted_score,
            'risk_level': risk_level,
            'factors': factors if factors else ['Performance looks good'],
            'recommendations': recommendations
        }
    
    def _extract_features(self, student: User, submissions: List[Submission]) -> Dict:
        """Extract features for prediction"""
        features = {
            'skill_level': student.skill_level,
            'submission_count': len(submissions),
            'avg_score': 0.0,
            'improvement_trend': 0.0,
            'peer_feedback_quality': 0.0,
            'completion_rate': 0.0
        }
        
        if not submissions:
            return features
        
        # Calculate average scores
        scores = []
        for submission in submissions:
            feedbacks = submission.feedbacks
            for feedback in feedbacks:
                fb_scores = feedback.get_scores()
                if fb_scores:
                    avg = sum(fb_scores.values()) / len(fb_scores)
                    scores.append(avg)
        
        if scores:
            features['avg_score'] = sum(scores) / len(scores)
            
            # Calculate improvement trend (comparing first half vs second half)
            mid = len(scores) // 2
            if mid > 0:
                first_half = scores[:mid]
                second_half = scores[mid:]
                first_avg = sum(first_half) / len(first_half)
                second_avg = sum(second_half) / len(second_half)
                features['improvement_trend'] = second_avg - first_avg
        
        # Calculate peer feedback quality (average of peer feedback scores)
        # Get all submissions by this student, then get peer feedbacks for those submissions
        student_submissions = Submission.objects(user_id=student).limit(100)
        submission_ids = [s.id for s in student_submissions]
        peer_feedbacks = Feedback.objects(feedback_type='peer', submission_id__in=submission_ids).limit(100)
        
        if peer_feedbacks:
            peer_scores = []
            for fb in peer_feedbacks:
                fb_scores = fb.get_scores()
                if fb_scores:
                    peer_scores.append(sum(fb_scores.values()) / len(fb_scores))
            if peer_scores:
                features['peer_feedback_quality'] = sum(peer_scores) / len(peer_scores)
        
        # Completion rate (submissions with feedback vs total)
        completed = len([s for s in submissions if s.feedbacks])
        features['completion_rate'] = completed / len(submissions) if submissions else 0
        
        return features
    
    def _calculate_prediction(self, features: Dict) -> float:
        """Calculate predicted score from features"""
        # Weighted combination of features
        prediction = (
            0.3 * features['skill_level'] +
            0.3 * features['avg_score'] +
            0.2 * min(1.0, features['submission_count'] / 5) +
            0.1 * max(0, features['improvement_trend'] + 0.5) +
            0.1 * features['completion_rate']
        )
        
        return max(0.0, min(1.0, prediction))
    
    def _generate_recommendations(self, features: Dict, risk_level: str) -> List[str]:
        """Generate recommendations based on features and risk level"""
        recommendations = []
        
        if risk_level == 'high':
            recommendations.append('⚠️ Student may need additional support')
            recommendations.append('Schedule a meeting to discuss challenges')
        
        if features['submission_count'] < 3:
            recommendations.append('Encourage more regular submissions')
        
        if features['avg_score'] < 0.6:
            recommendations.append('Focus on fundamental concepts')
            recommendations.append('Provide additional learning resources')
        
        if features['improvement_trend'] < -0.1:
            recommendations.append('Performance is declining - investigate causes')
        
        if features['peer_feedback_quality'] < 0.5:
            recommendations.append('Review peer feedback quality')
        
        if not recommendations:
            recommendations.append('Continue current learning approach')
        
        return recommendations
    
    def _default_prediction(self) -> Dict:
        """Return default prediction when student not found"""
        return {
            'predicted_score': 0.5,
            'risk_level': 'medium',
            'factors': ['Insufficient data'],
            'recommendations': ['Collect more submission data']
        }

