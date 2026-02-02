import api from './api';

// Get all notifications for current user
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

// Mark single notification as read
export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

// Delete single notification
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// Clear all notifications
export const clearAll = async () => {
  const response = await api.delete('/notifications');
  return response.data;
};
