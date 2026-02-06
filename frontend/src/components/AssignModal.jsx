import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, AlertTriangle, AlertCircle, Info, Check, Clock, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AssignModal({ ticket, engineers, onAssign, onClose, title = 'Assign Ticket' }) {
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [severity, setSeverity] = useState(ticket.severity || '');
  const { isDark } = useTheme();
  const isReassign = title.toLowerCase().includes('reassign');

  // Group engineers by availability
  const onDutyEngineers = engineers.filter(e => e.availability?.isOnDuty);
  const workingTodayEngineers = engineers.filter(e => e.availability?.isWorkingToday && !e.availability?.isOnDuty);
  const otherEngineers = engineers.filter(e => !e.availability?.isWorkingToday);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEngineer) return;
    if (!isReassign && !severity) return;

    const engineer = engineers.find((e) => e._id === selectedEngineer);
    if (isReassign) {
      onAssign(ticket._id, engineer._id, engineer.name);
    } else {
      onAssign(ticket._id, engineer._id, engineer.name, severity);
    }
    onClose();
  };

  const severityOptions = [
    { value: 'critical', label: 'Critical', desc: 'System down, business impact', icon: AlertTriangle, color: isDark ? 'border-red-700 bg-red-900/30' : 'border-red-300 bg-red-50' },
    { value: 'high', label: 'High', desc: 'Major functionality affected', icon: AlertCircle, color: isDark ? 'border-orange-700 bg-orange-900/30' : 'border-orange-300 bg-orange-50' },
    { value: 'medium', label: 'Medium', desc: 'Minor issue, workaround exists', icon: Info, color: isDark ? 'border-yellow-700 bg-yellow-900/30' : 'border-yellow-300 bg-yellow-50' },
    { value: 'low', label: 'Low', desc: 'Low priority, non-urgent', icon: Info, color: isDark ? 'border-dark-border bg-dark-elevated' : 'border-slate-300 bg-slate-50' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${isDark ? 'bg-dark-card' : 'bg-white'}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ticket.ticketId}</p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-hover' : 'hover:bg-slate-100'}`}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>
          </div>

          {/* Ticket Info */}
          <div className={`px-6 py-4 border-b ${isDark ? 'bg-dark-elevated border-dark-border' : 'bg-slate-50 border-slate-100'}`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Asset ID</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.assetId}</p>
              </div>
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Call Type</p>
                <p className={`font-medium capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.callType}</p>
              </div>
              <div className="col-span-2">
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Problem</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.problemDescription}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Engineer Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isReassign ? 'Reassign to Engineer *' : 'Assign to Engineer *'}
              </label>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {/* On Duty Engineers */}
                {onDutyEngineers.length > 0 && (
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 px-2 py-1 text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Currently On Duty
                    </div>
                    {onDutyEngineers.map((engineer) => (
                      <EngineerOption 
                        key={engineer._id} 
                        engineer={engineer} 
                        selected={selectedEngineer === engineer._id}
                        onSelect={setSelectedEngineer}
                        isDark={isDark}
                        status="on-duty"
                      />
                    ))}
                  </div>
                )}

                {/* Working Today but not on duty */}
                {workingTodayEngineers.length > 0 && (
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 px-2 py-1 text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      <Clock className="w-3 h-3" />
                      Working Today (Different Shift)
                    </div>
                    {workingTodayEngineers.map((engineer) => (
                      <EngineerOption 
                        key={engineer._id} 
                        engineer={engineer} 
                        selected={selectedEngineer === engineer._id}
                        onSelect={setSelectedEngineer}
                        isDark={isDark}
                        status="working-today"
                      />
                    ))}
                  </div>
                )}

                {/* Other Engineers */}
                {otherEngineers.length > 0 && (
                  <div className="space-y-2">
                    {(onDutyEngineers.length > 0 || workingTodayEngineers.length > 0) && (
                      <div className={`flex items-center gap-2 px-2 py-1 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Other Engineers
                      </div>
                    )}
                    {otherEngineers.map((engineer) => (
                      <EngineerOption 
                        key={engineer._id} 
                        engineer={engineer} 
                        selected={selectedEngineer === engineer._id}
                        onSelect={setSelectedEngineer}
                        isDark={isDark}
                        status="other"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Severity Selection - only for new assignments */}
            {!isReassign && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Set Severity *
                </label>
                <div className="space-y-2">
                  {severityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        severity === option.value
                          ? `${option.color} border-2`
                          : isDark ? 'border-dark-border hover:border-dark-hover' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={option.value}
                        checked={severity === option.value}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="sr-only"
                      />
                      <Icon className={`w-5 h-5 ${
                        option.value === 'critical' ? 'text-red-500' :
                        option.value === 'high' ? 'text-orange-500' : 
                        option.value === 'medium' ? 'text-yellow-500' : 'text-slate-500'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{option.label}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{option.desc}</p>
                      </div>
                      {severity === option.value && (
                        <Check className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedEngineer || (!isReassign && !severity)}
                className="flex-1 py-2.5 bg-blue-500 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReassign ? 'Reassign Ticket' : 'Assign Ticket'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                  isDark ? 'bg-dark-elevated text-slate-300 hover:bg-dark-hover' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Engineer Option Component
function EngineerOption({ engineer, selected, onSelect, isDark, status }) {
  const availability = engineer.availability;
  
  const getStatusBadge = () => {
    if (status === 'on-duty') {
      return (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
          isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
        }`}>
          On Duty
        </span>
      );
    }
    if (status === 'working-today') {
      return (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
          isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
        }`}>
          {availability?.shiftName}
        </span>
      );
    }
    if (availability?.shiftType === 'WO' || availability?.shiftType === 'LV' || availability?.shiftType === 'H') {
      return (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
          isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
        }`}>
          {availability?.shiftName}
        </span>
      );
    }
    return null;
  };

  return (
    <label
      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
        selected
          ? isDark ? 'border-blue-500 bg-blue-500/20' : 'border-blue-500 bg-blue-50'
          : status === 'on-duty'
            ? isDark ? 'border-green-700/50 bg-green-900/10 hover:border-green-600' : 'border-green-200 bg-green-50/50 hover:border-green-300'
            : isDark ? 'border-dark-border hover:border-dark-hover' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <input
        type="radio"
        name="engineer"
        value={engineer._id}
        checked={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="sr-only"
      />
      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
        status === 'on-duty'
          ? isDark ? 'bg-green-500/20' : 'bg-green-100'
          : isDark ? 'bg-blue-500/20' : 'bg-blue-100'
      }`}>
        <User className={`w-5 h-5 ${
          status === 'on-duty'
            ? isDark ? 'text-green-400' : 'text-green-600'
            : isDark ? 'text-blue-400' : 'text-blue-500'
        }`} />
        {status === 'on-duty' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-dark-card" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{engineer.name}</p>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{engineer.department}</p>
          {availability?.shiftTiming && status !== 'other' && (
            <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Clock className="w-3 h-3" />
              {availability.shiftTiming}
            </span>
          )}
          {availability?.location && (
            <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <MapPin className="w-3 h-3" />
              {availability.location}
            </span>
          )}
        </div>
      </div>
      {selected && (
        <Check className={`w-5 h-5 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
      )}
    </label>
  );
}