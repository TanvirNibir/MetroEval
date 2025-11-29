/**
 * Submissions feature API calls
 */
import api from '../../services/api';

export const submitAssignment = (submissionData) => {
  return api.post('/v1/submit', submissionData);
};

export const getSubmissions = () => {
  return api.get('/v1/submissions');
};

export const getSubmission = (id) => {
  return api.get(`/v1/submission/${id}`);
};

export const generateFeedback = (submissionId) => {
  return api.post('/v1/generate-feedback', { submission_id: submissionId });
};

export const getPeerReviews = () => {
  return api.get('/v1/peer-reviews');
};

export const submitPeerReview = (reviewId, feedback) => {
  return api.post(`/v1/peer-review/${reviewId}/submit`, { feedback });
};

