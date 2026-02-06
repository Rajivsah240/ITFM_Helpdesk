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

// Get engineers with current availability from roster
export const getEngineersWithAvailability = async () => {
  const response = await api.get('/users/engineers/availability');
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

// Get current user profile
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update current user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Request account deletion
export const requestDeletion = async (reason) => {
  const response = await api.post('/users/deletion-request', { reason });
  return response.data;
};

// Cancel deletion request
export const cancelDeletionRequest = async () => {
  const response = await api.delete('/users/deletion-request');
  return response.data;
};

// Get all deletion requests (admin only)
export const getDeletionRequests = async () => {
  const response = await api.get('/users/deletion-requests');
  return response.data;
};

// Approve deletion request (admin only)
export const approveDeletion = async (userId) => {
  const response = await api.post(`/users/${userId}/approve-deletion`);
  return response.data;
};

// Reject deletion request (admin only)
export const rejectDeletion = async (userId) => {
  const response = await api.post(`/users/${userId}/reject-deletion`);
  return response.data;
};
