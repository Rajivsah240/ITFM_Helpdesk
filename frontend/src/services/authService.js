import api from './api';

// Register new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get current user profile
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Update user details
export const updateDetails = async (data) => {
  const response = await api.put('/auth/updatedetails', data);
  return response.data;
};

// Update password
export const updatePassword = async (data) => {
  const response = await api.put('/auth/updatepassword', data);
  return response.data;
};
