import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Check, X, User, Mail, Phone, Building2,
  AlertTriangle, Calendar, Clock, Loader2, RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as userService from '../services/userService';
import toast from 'react-hot-toast';

export default function DeletionRequests() {
  const { isDark } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await userService.getDeletionRequests();
      setRequests(response.data || []);
    } catch (err) {
      toast.error('Failed to fetch deletion requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    if (!confirm(`Are you sure you want to approve deletion for ${userName}? This will deactivate their account.`)) {
      return;
    }

    try {
      setProcessing(userId);
      await userService.approveDeletion(userId);
      toast.success(`Account for ${userName} has been deactivated`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve deletion');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId, userName) => {
    if (!confirm(`Are you sure you want to reject deletion request for ${userName}?`)) {
      return;
    }

    try {
      setProcessing(userId);
      await userService.rejectDeletion(userId);
      toast.success(`Deletion request for ${userName} has been rejected`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject deletion');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-purple-500/20', text: 'text-purple-500', label: 'Admin' },
      engineer: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Engineer' },
      user: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'User' }
    };
    return badges[role] || badges.user;
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Account Deletion Requests
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-dark-hover text-slate-400' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pending deletion requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-dark-elevated border-dark-border' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 font-semibold">
                      {request.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {request.name}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadge(request.role).bg} ${getRoleBadge(request.role).text}`}>
                        {getRoleBadge(request.role).label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Mail className="w-4 h-4" />
                        {request.email}
                      </div>
                      <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Phone className="w-4 h-4" />
                        {request.phone}
                      </div>
                      <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Building2 className="w-4 h-4" />
                        {request.department}
                      </div>
                      <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Calendar className="w-4 h-4" />
                        Requested: {formatDate(request.deletionRequestDate)}
                      </div>
                    </div>

                    {/* Reason */}
                    {request.deletionReason && (
                      <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Reason for deletion:
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {request.deletionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(request._id, request.name)}
                      disabled={processing === request._id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processing === request._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id, request.name)}
                      disabled={processing === request._id}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        isDark 
                          ? 'bg-dark-hover hover:bg-dark-card text-slate-300' 
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
