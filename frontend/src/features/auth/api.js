/**
 * Auth feature API calls
 */
import api from '../../services/api';

export const login = (email, password) => {
  return api.post('/v1/login', { email, password });
};

export const register = (userData) => {
  return api.post('/v1/register', userData);
};

export const logout = () => {
  return api.get('/v1/logout');
};

