import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import ActionLogger from '../components/ActionLogger';
import {
  ChevronDown,
  ChevronUp,
  Monitor,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  AlertCircle,
  Info,
  Wrench,
  CheckCircle,
} from 'lucide-react';

const severityConfig = {
  1: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  2: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
  3: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Info },
};

const statusConfig = {
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  inProgress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
};

export default function EngineerDashboard() {
  const { getTicketsByEngineer, addActionLog, resolveTicket } = useTickets();
  const { user } = useAuth();
  const [expandedTicket, setExpandedTicket] = useState(null);

  const myTickets = getTicketsByEngineer(user.id);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddAction = (ticketId, description) => {
    addActionLog(ticketId, description, user);
  };

  const handleResolve = (ticketId) => {
    const result = resolveTicket(ticketId);
    if (!result.success) {
      alert(result.error);
    } else {
      setExpandedTicket(null);
    }
  };

  if (myTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">All Caught Up!</h2>
        <p className="text-slate-500">You have no tickets assigned to you at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">My Assigned Tickets</h2>
          <p className="text-sm text-slate-500">Tickets requiring your attention</p>
        </div>
        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
          {myTickets.length} tickets
        </span>
      </div>

      <div className="space-y-4">
        {myTickets.map((ticket) => {
          const isExpanded = expandedTicket === ticket.id;
          const severity = severityConfig[ticket.severity];
          const status = statusConfig[ticket.status];
          const SeverityIcon = severity?.icon;

          return (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden ticket-card shadow-sm"
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-blue-800" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800">{ticket.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        {severity && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${severity.color}`}>
                            <SeverityIcon className="w-3 h-3" />
                            {severity.label}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{ticket.problemDescription}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Monitor className="w-4 h-4" />
                          {ticket.assetId}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {ticket.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Raised by</p>
                      <p className="text-sm font-medium text-slate-700">{ticket.raisedByName}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-slate-100">
                      {/* Ticket Details */}
                      <div className="p-5 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Call Type</p>
                          <p className="text-sm font-medium text-slate-800">{ticket.callType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Raised</p>
                          <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.timestamps.raised)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Assigned</p>
                          <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.timestamps.assigned)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">In Progress</p>
                          <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                            {ticket.timestamps.inProgress ? (
                              <>
                                <Clock className="w-3 h-3" />
                                {formatDate(ticket.timestamps.inProgress)}
                              </>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action Logger */}
                      <div className="p-5">
                        <ActionLogger
                          ticket={ticket}
                          onAddAction={(description) => handleAddAction(ticket.id, description)}
                          onResolve={() => handleResolve(ticket.id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
