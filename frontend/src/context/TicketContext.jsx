import { createContext, useContext, useState, useCallback } from 'react';
import * as ticketService from '../services/ticketService';
import * as notificationService from '../services/notificationService';

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch all tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTickets();
      if (response.success) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single ticket
  const fetchTicket = useCallback(async (id) => {
    try {
      const response = await ticketService.getTicket(id);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  }, []);

  // Create new ticket
  const createTicket = async (ticketData) => {
    try {
      const response = await ticketService.createTicket(ticketData);
      if (response.success) {
        setTickets(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to create ticket' };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create ticket';
      return { success: false, error: message };
    }
  };

  // Assign ticket to engineer
  const assignTicket = async (ticketId, engineerId) => {
    try {
      const response = await ticketService.assignTicket(ticketId, engineerId);
      if (response.success) {
        setTickets(prev =>
          prev.map(t => (t._id === ticketId ? response.data : t))
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to assign ticket' };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to assign ticket';
      return { success: false, error: message };
    }
  };

  // Update ticket status
  const updateStatus = async (ticketId, status) => {
    try {
      const response = await ticketService.updateTicketStatus(ticketId, status);
      if (response.success) {
        setTickets(prev =>
          prev.map(t => (t._id === ticketId ? response.data : t))
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to update status' };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update status';
      return { success: false, error: message };
    }
  };

  // Start progress (shortcut for status update)
  const startProgress = async (ticketId) => {
    return updateStatus(ticketId, 'in-progress');
  };

  // Add action log
  const addActionLog = async (ticketId, action, details) => {
    try {
      const response = await ticketService.addActionLog(ticketId, action, details);
      if (response.success) {
        setTickets(prev =>
          prev.map(t => (t._id === ticketId ? response.data : t))
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to add action log' };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add action log';
      return { success: false, error: message };
    }
  };

  // Resolve ticket
  const resolveTicket = async (ticketId) => {
    return updateStatus(ticketId, 'resolved');
  };

  // Request reassignment
  const requestReassign = async (ticketId, engineerId, reason) => {
    try {
      const response = await ticketService.requestReassign(ticketId, engineerId, reason);
      if (response.success) {
        setTickets(prev =>
          prev.map(t => (t._id === ticketId ? response.data : t))
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to request reassignment' };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to request reassignment';
      return { success: false, error: message };
    }
  };

  // Handle reassignment request
  const handleReassign = async (ticketId, action) => {
    try {
      const response = await ticketService.handleReassignRequest(ticketId, action);
      if (response.success) {
        setTickets(prev =>
          prev.map(t => (t._id === ticketId ? response.data : t))
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to handle reassignment' };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to handle reassignment';
      return { success: false, error: message };
    }
  };

  // Fetch ticket statistics
  const fetchStats = async () => {
    try {
      const response = await ticketService.getTicketStats();
      if (response.success) {
        setStats(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  };

  // Notification functions
  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.success ? response.data.count : 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Filter functions (computed from local state)
  const getTicketsByUser = (userId) => {
    return tickets.filter(ticket => ticket.raisedBy?._id === userId);
  };

  const getTicketsByEngineer = (engineerId) => {
    return tickets.filter(
      ticket => ticket.assignedTo?._id === engineerId && ticket.status !== 'resolved'
    );
  };

  const getUnassignedTickets = () => {
    return tickets.filter(ticket => ticket.status === 'open');
  };

  const getActiveTickets = () => {
    return tickets.filter(
      ticket => ticket.status === 'assigned' || ticket.status === 'in-progress'
    );
  };

  const getReassignRequests = () => {
    return tickets.filter(
      ticket => ticket.reassignRequest?.requested && ticket.reassignRequest?.status === 'pending'
    );
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        notifications,
        loading,
        stats,
        fetchTickets,
        fetchTicket,
        createTicket,
        assignTicket,
        updateStatus,
        startProgress,
        addActionLog,
        resolveTicket,
        requestReassign,
        handleReassign,
        fetchStats,
        fetchNotifications,
        getUnreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        getTicketsByUser,
        getTicketsByEngineer,
        getUnassignedTickets,
        getActiveTickets,
        getReassignRequests,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
