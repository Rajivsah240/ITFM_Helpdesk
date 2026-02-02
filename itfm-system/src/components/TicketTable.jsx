import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin,
  Monitor,
  Clock,
  User,
} from 'lucide-react';

const severityConfig = {
  1: { label: 'Critical', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  2: { label: 'High', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  3: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700', icon: Info },
};

const statusConfig = {
  raised: { label: 'Raised', color: 'bg-slate-100 text-slate-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  inProgress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
};

export default function TicketTable({ tickets, onRowClick, showAssignee = true }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-1">No tickets found</h3>
        <p className="text-slate-500">There are no tickets matching this criteria.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Asset ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Call Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Problem Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Severity
              </th>
              {showAssignee && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assigned To
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Raised
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket, index) => {
              const status = statusConfig[ticket.status];
              const severity = ticket.severity ? severityConfig[ticket.severity] : null;
              const SeverityIcon = severity?.icon;

              return (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onRowClick && onRowClick(ticket)}
                  className={`hover:bg-slate-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm font-medium text-blue-800">
                      {ticket.id}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{ticket.assetId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-700">{ticket.callType}</span>
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className="text-sm text-slate-700 truncate" title={ticket.problemDescription}>
                      {ticket.problemDescription}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{ticket.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {severity ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${severity.color}`}>
                        <SeverityIcon className="w-3 h-3" />
                        {severity.label}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  {showAssignee && (
                    <td className="px-4 py-4">
                      {ticket.assignedToName ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{ticket.assignedToName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Unassigned</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {formatDate(ticket.timestamps.raised)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
