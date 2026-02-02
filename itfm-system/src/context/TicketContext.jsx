import { createContext, useContext, useState } from 'react';

const TicketContext = createContext(null);

// Initial mock tickets
const initialTickets = [
  {
    id: 'TKT-001',
    assetId: 'ASSET-PC-101',
    callType: 'Hardware Issue',
    problemDescription: 'Monitor not displaying properly, flickering screen',
    location: 'Building A, Floor 2, Room 201',
    raisedBy: 'EMP004',
    raisedByName: 'Mike Smith',
    status: 'raised',
    severity: null,
    assignedTo: null,
    assignedToName: null,
    actionLogs: [],
    timestamps: {
      raised: '2026-02-01T09:30:00',
      assigned: null,
      inProgress: null,
      resolved: null,
    },
  },
  {
    id: 'TKT-002',
    assetId: 'ASSET-PR-045',
    callType: 'Network Issue',
    problemDescription: 'Unable to connect to network printer',
    location: 'Building B, Floor 1, Room 105',
    raisedBy: 'EMP005',
    raisedByName: 'Sarah Johnson',
    status: 'assigned',
    severity: 2,
    assignedTo: 'EMP002',
    assignedToName: 'John Engineer',
    actionLogs: [],
    timestamps: {
      raised: '2026-02-01T10:15:00',
      assigned: '2026-02-01T11:00:00',
      inProgress: null,
      resolved: null,
    },
  },
  {
    id: 'TKT-003',
    assetId: 'ASSET-SRV-002',
    callType: 'Software Issue',
    problemDescription: 'Email client crashing on startup',
    location: 'Building A, Floor 3, Room 302',
    raisedBy: 'EMP004',
    raisedByName: 'Mike Smith',
    status: 'inProgress',
    severity: 1,
    assignedTo: 'EMP003',
    assignedToName: 'Jane Engineer',
    actionLogs: [
      {
        id: 'LOG-001',
        description: 'Initiated remote diagnostic session',
        timestamp: '2026-02-01T14:30:00',
        engineerId: 'EMP003',
        engineerName: 'Jane Engineer',
      },
    ],
    timestamps: {
      raised: '2026-02-01T08:00:00',
      assigned: '2026-02-01T08:45:00',
      inProgress: '2026-02-01T14:30:00',
      resolved: null,
    },
  },
];

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(initialTickets);

  const generateTicketId = () => {
    const maxId = tickets.reduce((max, ticket) => {
      const num = parseInt(ticket.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `TKT-${String(maxId + 1).padStart(3, '0')}`;
  };

  const createTicket = (ticketData, user) => {
    const newTicket = {
      id: generateTicketId(),
      assetId: ticketData.assetId,
      callType: ticketData.callType,
      problemDescription: ticketData.problemDescription,
      location: ticketData.location,
      raisedBy: user.id,
      raisedByName: user.name,
      status: 'raised',
      severity: null,
      assignedTo: null,
      assignedToName: null,
      actionLogs: [],
      timestamps: {
        raised: new Date().toISOString(),
        assigned: null,
        inProgress: null,
        resolved: null,
      },
    };
    setTickets([...tickets, newTicket]);
    return newTicket;
  };

  const assignTicket = (ticketId, engineerId, engineerName, severity) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            assignedTo: engineerId,
            assignedToName: engineerName,
            severity: severity,
            status: 'assigned',
            timestamps: {
              ...ticket.timestamps,
              assigned: new Date().toISOString(),
            },
          };
        }
        return ticket;
      })
    );
  };

  const startProgress = (ticketId) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId && ticket.status === 'assigned') {
          return {
            ...ticket,
            status: 'inProgress',
            timestamps: {
              ...ticket.timestamps,
              inProgress: new Date().toISOString(),
            },
          };
        }
        return ticket;
      })
    );
  };

  const addActionLog = (ticketId, description, engineer) => {
    const logId = `LOG-${Date.now()}`;
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const newLog = {
            id: logId,
            description,
            timestamp: new Date().toISOString(),
            engineerId: engineer.id,
            engineerName: engineer.name,
          };
          
          // If this is the first action log and status is 'assigned', move to 'inProgress'
          const newStatus = ticket.status === 'assigned' ? 'inProgress' : ticket.status;
          const newTimestamps = ticket.status === 'assigned' 
            ? { ...ticket.timestamps, inProgress: new Date().toISOString() }
            : ticket.timestamps;
          
          return {
            ...ticket,
            status: newStatus,
            timestamps: newTimestamps,
            actionLogs: [...ticket.actionLogs, newLog],
          };
        }
        return ticket;
      })
    );
  };

  const resolveTicket = (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };
    if (ticket.actionLogs.length === 0) {
      return {
        success: false,
        error: 'Cannot resolve ticket without at least one action log entry',
      };
    }
    setTickets(
      tickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'resolved',
            timestamps: {
              ...t.timestamps,
              resolved: new Date().toISOString(),
            },
          };
        }
        return t;
      })
    );
    return { success: true };
  };

  const getTicketsByUser = (userId) => {
    return tickets.filter((ticket) => ticket.raisedBy === userId);
  };

  const getTicketsByEngineer = (engineerId) => {
    return tickets.filter(
      (ticket) => ticket.assignedTo === engineerId && ticket.status !== 'resolved'
    );
  };

  const getUnassignedTickets = () => {
    return tickets.filter((ticket) => ticket.status === 'raised');
  };

  const getActiveTickets = () => {
    return tickets.filter(
      (ticket) => ticket.status === 'assigned' || ticket.status === 'inProgress'
    );
  };

  const getEngineerWorkload = () => {
    const workload = {};
    tickets.forEach((ticket) => {
      if (ticket.assignedTo && ticket.status !== 'resolved') {
        if (!workload[ticket.assignedTo]) {
          workload[ticket.assignedTo] = {
            name: ticket.assignedToName,
            count: 0,
          };
        }
        workload[ticket.assignedTo].count++;
      }
    });
    return workload;
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        createTicket,
        assignTicket,
        startProgress,
        addActionLog,
        resolveTicket,
        getTicketsByUser,
        getTicketsByEngineer,
        getUnassignedTickets,
        getActiveTickets,
        getEngineerWorkload,
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
