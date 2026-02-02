import api from './api';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Get single user
export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Get all engineers
export const getEngineers = async () => {
  const response = await api.get('/users/engineers');
  return response.data;
};

// Get engineer workload
export const getWorkload = async () => {
  const response = await api.get('/users/workload');
  return response.data;
};

// Create user (admin only)
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Update user (admin only)
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
