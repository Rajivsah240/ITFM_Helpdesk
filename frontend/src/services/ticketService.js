import api from './api';

// Get all tickets (filtered by role on backend)
export const getTickets = async () => {
  const response = await api.get('/tickets');
  return response.data;
};

// Get single ticket
export const getTicket = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

// Create new ticket
export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

// Assign ticket to engineer
export const assignTicket = async (ticketId, engineerId) => {
  const response = await api.put(`/tickets/${ticketId}/assign`, { engineerId });
  return response.data;
};

// Update ticket status
export const updateTicketStatus = async (ticketId, status) => {
  const response = await api.put(`/tickets/${ticketId}/status`, { status });
  return response.data;
};

// Add action log to ticket
export const addActionLog = async (ticketId, action, details) => {
  const response = await api.post(`/tickets/${ticketId}/logs`, { action, details });
  return response.data;
};

// Request ticket reassignment
export const requestReassign = async (ticketId, engineerId, reason) => {
  const response = await api.post(`/tickets/${ticketId}/reassign-request`, {
    engineerId,
    reason
  });
  return response.data;
};

// Handle reassignment request (admin)
export const handleReassignRequest = async (ticketId, action) => {
  const response = await api.put(`/tickets/${ticketId}/reassign-request`, { action });
  return response.data;
};

// Get ticket statistics
export const getTicketStats = async () => {
  const response = await api.get('/tickets/stats');
  return response.data;
};
