import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';

export default function AssignModal({ ticket, engineers, onAssign, onClose }) {
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [severity, setSeverity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEngineer || !severity) return;

    const engineer = engineers.find((e) => e.id === selectedEngineer);
    onAssign(ticket.id, engineer.id, engineer.name, parseInt(severity));
    onClose();
  };

  const severityOptions = [
    { value: 1, label: 'Critical', desc: 'System down, business impact', icon: AlertTriangle, color: 'border-red-300 bg-red-50' },
    { value: 2, label: 'High', desc: 'Major functionality affected', icon: AlertCircle, color: 'border-orange-300 bg-orange-50' },
    { value: 3, label: 'Medium', desc: 'Minor issue, workaround exists', icon: Info, color: 'border-yellow-300 bg-yellow-50' },
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Assign Ticket</h2>
              <p className="text-sm text-slate-500">{ticket.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Ticket Info */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Asset ID</p>
                <p className="font-medium text-slate-800">{ticket.assetId}</p>
              </div>
              <div>
                <p className="text-slate-500">Call Type</p>
                <p className="font-medium text-slate-800">{ticket.callType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Problem</p>
                <p className="font-medium text-slate-800">{ticket.problemDescription}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Engineer Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assign to Engineer *
              </label>
              <div className="space-y-2">
                {engineers.map((engineer) => (
                  <label
                    key={engineer.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedEngineer === engineer.id
                        ? 'border-blue-800 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="engineer"
                      value={engineer.id}
                      checked={selectedEngineer === engineer.id}
                      onChange={(e) => setSelectedEngineer(e.target.value)}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-800" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{engineer.name}</p>
                      <p className="text-xs text-slate-500">{engineer.department}</p>
                    </div>
                    {selectedEngineer === engineer.id && (
                      <Check className="w-5 h-5 text-blue-800" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Set Severity *
              </label>
              <div className="space-y-2">
                {severityOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        severity === String(option.value)
                          ? `${option.color} border-2`
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={option.value}
                        checked={severity === String(option.value)}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="sr-only"
                      />
                      <Icon className={`w-5 h-5 ${
                        option.value === 1 ? 'text-red-600' :
                        option.value === 2 ? 'text-orange-600' : 'text-yellow-600'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{option.label}</p>
                        <p className="text-xs text-slate-500">{option.desc}</p>
                      </div>
                      {severity === String(option.value) && (
                        <Check className="w-5 h-5 text-blue-800" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedEngineer || !severity}
                className="flex-1 py-2.5 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Ticket
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
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
