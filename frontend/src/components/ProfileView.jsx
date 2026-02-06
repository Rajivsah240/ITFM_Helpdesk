import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Building2, MapPin, Briefcase, Hash,
  Edit2, Save, X, AlertTriangle, Trash2, Check, Loader2,
  Shield, Calendar, Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import toast from 'react-hot-toast';

const LOCATIONS = [
  'Numaligarh',
  'NRL-Siliguri',
  'NRL Ghy-Co.',
  'NRL-Delhi',
  'NRL-Paradip',
  'Delhi Office'
];

export default function ProfileView({ onClose }) {
  const { isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setProfile(response.data);
      setEditData({
        name: response.data.name,
        phone: response.data.phone,
        department: response.data.department,
        designation: response.data.designation,
        location: response.data.location || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateProfile(editData);
      await fetchProfile();
      if (refreshUser) refreshUser();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      setSaving(true);
      await userService.requestDeletion(deleteReason);
      await fetchProfile();
      setShowDeleteConfirm(false);
      setDeleteReason('');
      toast.success('Deletion request submitted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit deletion request');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setSaving(true);
      await userService.cancelDeletionRequest();
      await fetchProfile();
      toast.success('Deletion request cancelled');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel deletion request');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-purple-500/20', text: 'text-purple-500', label: 'Administrator' },
      engineer: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Engineer' },
      user: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'User' }
    };
    return badges[role] || badges.user;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`w-full max-w-2xl p-8 rounded-2xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-dark-card' : 'bg-white'}`}
      >
        {/* Header */}
        <div className={`relative p-6 ${isDark ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-slate-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">
                {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {profile?.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadge(profile?.role).bg} ${getRoleBadge(profile?.role).text}`}>
                  {getRoleBadge(profile?.role).label}
                </span>
                {profile?.engineerType && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    profile.engineerType === 'Software Developer'
                      ? 'bg-purple-500/20 text-purple-500'
                      : 'bg-green-500/20 text-green-500'
                  }`}>
                    {profile.engineerType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Deletion Request Warning */}
          {profile?.deletionRequested && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Account Deletion Requested
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
                  Your request to delete this account is pending admin approval.
                  Requested on: {formatDate(profile.deletionRequestDate)}
                </p>
                <button
                  onClick={handleCancelDeletion}
                  disabled={saving}
                  className="mt-2 text-sm text-amber-500 hover:text-amber-600 font-medium"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}

          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                        isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                        isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={editData.department}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                        isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Designation */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={editData.designation}
                      onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                        isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Location (for engineers) */}
                {profile?.role === 'engineer' && (
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Work Location
                    </label>
                    <div className="relative">
                      <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <select
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none ${
                          isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
                        }`}
                      >
                        <option value="">Select Location</option>
                        {LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      name: profile.name,
                      phone: profile.phone,
                      department: profile.department,
                      designation: profile.designation,
                      location: profile.location || ''
                    });
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isDark ? 'bg-dark-hover text-white hover:bg-dark-elevated' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileField
                  icon={<Hash className="w-4 h-4" />}
                  label="Employee ID"
                  value={profile?.employeeId}
                  isDark={isDark}
                />
                <ProfileField
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={profile?.email}
                  isDark={isDark}
                />
                <ProfileField
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone"
                  value={profile?.phone}
                  isDark={isDark}
                />
                <ProfileField
                  icon={<Building2 className="w-4 h-4" />}
                  label="Department"
                  value={profile?.department}
                  isDark={isDark}
                />
                <ProfileField
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Designation"
                  value={profile?.designation}
                  isDark={isDark}
                />
                {profile?.location && (
                  <ProfileField
                    icon={<MapPin className="w-4 h-4" />}
                    label="Location"
                    value={profile?.location}
                    isDark={isDark}
                  />
                )}
                <ProfileField
                  icon={<Calendar className="w-4 h-4" />}
                  label="Member Since"
                  value={formatDate(profile?.createdAt)}
                  isDark={isDark}
                />
                <ProfileField
                  icon={<Shield className="w-4 h-4" />}
                  label="Account Status"
                  value={profile?.isActive ? 'Active' : 'Inactive'}
                  isDark={isDark}
                  valueClass={profile?.isActive ? 'text-green-500' : 'text-red-500'}
                />
              </div>

              {/* Delete Account Section */}
              {!profile?.deletionRequested && profile?.role !== 'admin' && (
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-dark-border' : 'border-slate-200'}`}>
                  <h3 className={`font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Danger Zone
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Once you request account deletion, it will be reviewed by the administrator. Your account will be deactivated upon approval.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Request Account Deletion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className={`w-full max-w-md p-6 rounded-xl ${isDark ? 'bg-dark-elevated' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Request Account Deletion
                  </h3>
                </div>

                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Are you sure you want to request account deletion? This action requires admin approval.
                </p>

                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Reason (Optional)
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Please provide a reason for deleting your account..."
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none ${
                      isDark ? 'bg-dark-input border-dark-border text-white placeholder-slate-500' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteReason('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      isDark ? 'bg-dark-hover text-white hover:bg-dark-card' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRequest}
                    disabled={saving}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Submit Request
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Profile Field Component
function ProfileField({ icon, label, value, isDark, valueClass = '' }) {
  return (
    <div className={`p-3 rounded-lg ${isDark ? 'bg-dark-elevated' : 'bg-slate-50'}`}>
      <div className={`flex items-center gap-2 text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {icon}
        {label}
      </div>
      <p className={`font-medium ${valueClass || (isDark ? 'text-white' : 'text-slate-800')}`}>
        {value || '-'}
      </p>
    </div>
  );
}
