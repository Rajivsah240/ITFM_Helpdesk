import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import StatusStepper from '../components/StatusStepper';
import {
  Plus,
  Ticket,
  Monitor,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';

const callTypes = [
  'Hardware Issue',
  'Software Issue',
  'Network Issue',
  'Access Issue',
  'Other',
];

export default function UserDashboard({ activeView }) {
  const { createTicket, getTicketsByUser } = useTickets();
  const { user } = useAuth();
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [formData, setFormData] = useState({
    assetId: '',
    callType: '',
    problemDescription: '',
    location: '',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const myTickets = getTicketsByUser(user.id);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.assetId || !formData.callType || !formData.problemDescription || !formData.location) {
      setError('All fields are required');
      return;
    }
    createTicket(formData, user);
    setFormData({ assetId: '', callType: '', problemDescription: '', location: '' });
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const renderRaiseQuery = () => (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Raise a Query</h2>
              <p className="text-sm text-slate-500">Submit a new IT support ticket</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-green-50 border-b border-green-100"
            >
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Ticket submitted successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Asset ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Asset ID *
            </label>
            <div className="relative">
              <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                placeholder="e.g., ASSET-PC-101"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Call Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Call Type *
            </label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                name="callType"
                value={formData.callType}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all appearance-none bg-white"
              >
                <option value="">Select call type</option>
                {callTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Building A, Floor 2, Room 201"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Problem Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-blue-800/25"
          >
            <Send className="w-5 h-5" />
            Submit Ticket
          </button>
        </form>
      </motion.div>
    </div>
  );

  const renderMyTickets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">My Tickets</h2>
          <p className="text-sm text-slate-500">Track the status of your submitted tickets</p>
        </div>
        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
          {myTickets.length} tickets
        </span>
      </div>

      {myTickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-1">No tickets yet</h3>
          <p className="text-slate-500">You haven't raised any tickets yet.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {myTickets.map((ticket) => {
            const isExpanded = expandedTicket === ticket.id;
            return (
              <motion.div
                key={ticket.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Card Header */}
                <div
                  onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-blue-800" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-800">{ticket.id}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'resolved'
                              ? 'bg-green-100 text-green-700'
                              : ticket.status === 'inProgress'
                              ? 'bg-purple-100 text-purple-700'
                              : ticket.status === 'assigned'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.status === 'inProgress' ? 'In Progress' : 
                             ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{ticket.problemDescription}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content - Status Stepper */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-slate-100 p-5">
                        {/* Ticket Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Asset ID</p>
                            <p className="text-sm font-medium text-slate-800">{ticket.assetId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Call Type</p>
                            <p className="text-sm font-medium text-slate-800">{ticket.callType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Location</p>
                            <p className="text-sm font-medium text-slate-800">{ticket.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                            <p className="text-sm font-medium text-slate-800">
                              {ticket.assignedToName || 'Pending Assignment'}
                            </p>
                          </div>
                        </div>

                        {/* Status Stepper */}
                        <div>
                          <h4 className="font-medium text-slate-800 mb-4">Ticket Progress</h4>
                          <StatusStepper ticket={ticket} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {activeView === 'raise' && renderRaiseQuery()}
        {activeView === 'mytickets' && renderMyTickets()}
      </motion.div>
    </AnimatePresence>
  );
}
