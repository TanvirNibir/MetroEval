/**
 * Learning feature API calls
 */
import api from '../../services/api';

export const getFlashcards = () => {
  return api.get('/v1/flashcards');
};

export const getResources = () => {
  return api.get('/v1/resources');
};

export const getTemplates = () => {
  return api.get('/v1/templates');
};

export const chatWithTutor = (message) => {
  return api.post('/v1/tutor/chat', { message });
};

