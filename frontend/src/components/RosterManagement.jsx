import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Plus, Trash2, Save, Eye, Copy, Send, X, 
  ChevronLeft, ChevronRight, Users, Clock, MapPin, Phone,
  Edit2, Check, AlertCircle, Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as dutyRosterService from '../services/dutyRosterService';
import * as userService from '../services/userService';

const SHIFT_OPTIONS = Object.keys(dutyRosterService.SHIFT_TYPES);

const JOB_ROLES = [
  'ITFM Incharge',
  'DC Engineer', 
  'ITFM Asset Manager',
  'ITFM Helpdesk Coordinator',
  'ITFM Shift Engineer',
  'ITFM Network Engineer',
  'ITFM Office Boy',
  'ITFM Helpdesk Engineer',
  'Asset Performance Engineer',
  'Software Developer',
  'IBM BAW Developer'
];

const LOCATIONS = [
  'Numaligarh',
  'NRL-Siliguri',
  'NRL Ghy-Co.',
  'NRL-Delhi',
  'NRL-Paradip',
  'Delhi Office'
];

const DEPARTMENTS = ['ITFM', 'Software Development'];

export default function RosterManagement({ onViewRoster }) {
  const { isDark } = useTheme();
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Registered users (engineers)
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Current editing roster
  const [currentRoster, setCurrentRoster] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // New roster form
  const [showNewRosterForm, setShowNewRosterForm] = useState(false);
  const [newRosterData, setNewRosterData] = useState({
    weekStartDate: '',
    weekEndDate: '',
    title: ''
  });

  const shiftTypes = isDark ? dutyRosterService.SHIFT_TYPES_DARK : dutyRosterService.SHIFT_TYPES;

  // Fetch all rosters
  const fetchRosters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dutyRosterService.getAllRosters();
      setRosters(response.rosters || []);
    } catch (err) {
      setError('Failed to fetch rosters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch registered users (all users including engineers)
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getUsers();
      // Extract users array from response.data and filter to engineers/admins
      const users = response?.data || response || [];
      setRegisteredUsers(users.filter(u => u.role === 'engineer' || u.role === 'admin'));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchRosters();
    fetchUsers();
  }, [fetchRosters, fetchUsers]);

  // Get dates array for the roster
  const getDatesArray = (startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  // Create new roster with all registered engineers
  const handleCreateRoster = async () => {
    if (!newRosterData.weekStartDate || !newRosterData.weekEndDate) {
      setError('Please select start and end dates');
      return;
    }

    if (registeredUsers.length === 0) {
      setError('No registered engineers found. Please add engineers to the system first.');
      return;
    }

    try {
      setSaving(true);
      
      // Generate default shifts for each engineer based on dates
      const dates = getDatesArray(newRosterData.weekStartDate, newRosterData.weekEndDate);
      
      // Build engineers array with all registered users
      const engineersWithShifts = registeredUsers.map(user => {
        const shifts = dates.map(date => {
          const dayOfWeek = date.getDay();
          // Weekend = WO, else G-Shift
          return {
            date: date.toISOString(),
            shiftType: (dayOfWeek === 0 || dayOfWeek === 6) ? 'WO' : 'G-Shift'
          };
        });
        
        // Determine department based on engineerType
        const department = user.engineerType === 'Software Developer' ? 'Software Development' : 'ITFM';
        
        return {
          engineerId: user._id,
          engineerName: user.name,
          jobRole: user.designation || user.engineerType || 'ITFM Engineer',
          department: department,
          location: user.location || 'Numaligarh',
          contactNo: user.phone || 'N/A',
          shifts
        };
      });

      const roster = await dutyRosterService.createRoster({
        ...newRosterData,
        engineers: engineersWithShifts,
        status: 'draft'
      });
      
      setRosters([roster, ...rosters]);
      setCurrentRoster(roster);
      setIsEditing(true);
      setShowNewRosterForm(false);
      setNewRosterData({ weekStartDate: '', weekEndDate: '', title: '' });
      setSuccess(`Roster created with ${registeredUsers.length} engineers`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create roster');
    } finally {
      setSaving(false);
    }
  };



  // Update shift for an engineer
  const handleShiftChange = async (engineerIndex, dateIndex, newShift) => {
    const dates = getDatesArray(currentRoster.weekStartDate, currentRoster.weekEndDate);
    const date = dates[dateIndex];

    // Update local state immediately for responsiveness
    const updatedEngineers = [...currentRoster.engineers];
    const engineerShifts = [...updatedEngineers[engineerIndex].shifts];
    
    const existingShiftIdx = engineerShifts.findIndex(
      s => new Date(s.date).toDateString() === date.toDateString()
    );
    
    if (existingShiftIdx !== -1) {
      engineerShifts[existingShiftIdx] = { ...engineerShifts[existingShiftIdx], shiftType: newShift };
    } else {
      engineerShifts.push({ date: date.toISOString(), shiftType: newShift });
    }
    
    updatedEngineers[engineerIndex] = { ...updatedEngineers[engineerIndex], shifts: engineerShifts };
    setCurrentRoster({ ...currentRoster, engineers: updatedEngineers });

    // Save to backend
    try {
      await dutyRosterService.updateEngineerShift(currentRoster._id, engineerIndex, {
        date: date.toISOString(),
        shiftType: newShift
      });
    } catch (err) {
      console.error('Failed to update shift:', err);
      // Revert on error
      fetchRosters();
    }
  };

  // Remove engineer from roster
  const handleRemoveEngineer = async (engineerIndex) => {
    if (!confirm('Are you sure you want to remove this engineer from the roster?')) return;

    try {
      const updatedRoster = await dutyRosterService.removeEngineerFromRoster(
        currentRoster._id,
        engineerIndex
      );
      setCurrentRoster(updatedRoster);
      setSuccess('Engineer removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove engineer');
    }
  };

  // Save roster
  const handleSaveRoster = async () => {
    try {
      setSaving(true);
      await dutyRosterService.updateRoster(currentRoster._id, currentRoster);
      fetchRosters();
      setSuccess('Roster saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save roster');
    } finally {
      setSaving(false);
    }
  };

  // Publish roster
  const handlePublishRoster = async () => {
    if (!confirm('Are you sure you want to publish this roster? It will be visible to all users.')) return;

    try {
      setSaving(true);
      const updatedRoster = await dutyRosterService.publishRoster(currentRoster._id);
      setCurrentRoster(updatedRoster);
      fetchRosters();
      setSuccess('Roster published successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish roster');
    } finally {
      setSaving(false);
    }
  };

  // Clone roster
  const handleCloneRoster = async (roster) => {
    const newStartDate = prompt('Enter new start date (YYYY-MM-DD):');
    if (!newStartDate) return;

    try {
      setSaving(true);
      const clonedRoster = await dutyRosterService.cloneRoster(roster._id, newStartDate);
      setRosters([clonedRoster, ...rosters]);
      setSuccess('Roster cloned successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clone roster');
    } finally {
      setSaving(false);
    }
  };

  // Delete roster
  const handleDeleteRoster = async (roster) => {
    if (!confirm('Are you sure you want to delete this roster?')) return;

    try {
      await dutyRosterService.deleteRoster(roster._id);
      setRosters(rosters.filter(r => r._id !== roster._id));
      if (currentRoster?._id === roster._id) {
        setCurrentRoster(null);
        setIsEditing(false);
      }
      setSuccess('Roster deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete roster');
    }
  };

  // Get shift for a specific date
  const getShiftForDate = (engineer, date) => {
    const shift = engineer.shifts?.find(
      s => new Date(s.date).toDateString() === new Date(date).toDateString()
    );
    return shift?.shiftType || 'G-Shift';
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  };

  const formatDateFull = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get day name
  const getDayName = (date) => {
    return new Date(date).toLocaleDateString('en-GB', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-white' : 'text-slate-800'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Duty Roster Management
          </h2>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Create and manage weekly duty rosters for ITFM team
          </p>
        </div>
        <button
          onClick={() => setShowNewRosterForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Roster
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* New Roster Form Modal */}
      {showNewRosterForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-xl shadow-xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Create New Roster
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={newRosterData.weekStartDate}
                  onChange={(e) => setNewRosterData({ ...newRosterData, weekStartDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                    isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={newRosterData.weekEndDate}
                  onChange={(e) => setNewRosterData({ ...newRosterData, weekEndDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                    isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewRosterForm(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-dark-hover text-white hover:bg-dark-elevated' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoster}
                disabled={saving}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roster List */}
        <div className={`lg:col-span-1 p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            All Rosters
          </h3>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {rosters.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No rosters created yet
              </p>
            ) : (
              rosters.map((roster) => (
                <div
                  key={roster._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentRoster?._id === roster._id
                      ? 'bg-blue-500 text-white'
                      : isDark 
                        ? 'hover:bg-dark-hover' 
                        : 'hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    setCurrentRoster(roster);
                    setIsEditing(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${
                        currentRoster?._id === roster._id ? 'text-white' : isDark ? 'text-white' : 'text-slate-800'
                      }`}>
                        {formatDateFull(roster.weekStartDate)}
                      </p>
                      <p className={`text-xs ${
                        currentRoster?._id === roster._id ? 'text-blue-100' : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        to {formatDateFull(roster.weekEndDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      roster.status === 'published'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : roster.status === 'archived'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {roster.status}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewRoster?.(roster);
                      }}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloneRoster(roster);
                      }}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      title="Clone"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoster(roster);
                      }}
                      className="p-1.5 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Roster Editor */}
        <div className={`lg:col-span-3 p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
          {!currentRoster ? (
            <div className={`flex flex-col items-center justify-center h-64 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Calendar className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a roster to edit or create a new one</p>
            </div>
          ) : (
            <>
              {/* Editor Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {currentRoster.title || `Roster: ${formatDateFull(currentRoster.weekStartDate)} - ${formatDateFull(currentRoster.weekEndDate)}`}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentRoster.engineers?.length || 0} engineers • Status: {currentRoster.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveRoster}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  {currentRoster.status === 'draft' && (
                    <button
                      onClick={handlePublishRoster}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      Publish
                    </button>
                  )}
                </div>
              </div>

              {/* Shift Legend */}
              <div className={`flex flex-wrap gap-2 mb-4 p-3 rounded-lg ${isDark ? 'bg-dark-elevated' : 'bg-slate-50'}`}>
                {SHIFT_OPTIONS.map(shift => (
                  <div
                    key={shift}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: shiftTypes[shift].color,
                      color: shiftTypes[shift].textColor
                    }}
                  >
                    <span>{shift}</span>
                    <span className="opacity-75">({shiftTypes[shift].timing})</span>
                  </div>
                ))}
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className={isDark ? 'bg-dark-elevated' : 'bg-slate-50'}>
                      <th className={`px-3 py-2 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        #
                      </th>
                      <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[150px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Engineer Name
                      </th>
                      <th className={`px-3 py-2 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Job Role
                      </th>
                      <th className={`px-3 py-2 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Location
                      </th>
                      <th className={`px-3 py-2 text-left text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Contact
                      </th>
                      {getDatesArray(currentRoster.weekStartDate, currentRoster.weekEndDate).map((date, idx) => (
                        <th key={idx} className={`px-2 py-2 text-center text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <div>{formatDate(date)}</div>
                          <div className="text-[10px] font-normal opacity-75">{getDayName(date)}</div>
                        </th>
                      ))}
                      <th className={`px-2 py-2 text-center text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Group by department */}
                    {['ITFM', 'Software Development'].map(dept => {
                      const deptEngineers = currentRoster.engineers?.filter(e => e.department === dept) || [];
                      if (deptEngineers.length === 0) return null;
                      
                      return (
                        <React.Fragment key={dept}>
                          {/* Department Header */}
                          <tr className={isDark ? 'bg-dark-hover/50' : 'bg-blue-50'}>
                            <td colSpan={100} className={`px-3 py-2 text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                              {dept}
                            </td>
                          </tr>
                          {/* Engineers in department */}
                          {deptEngineers.map((engineer, deptIdx) => {
                            const globalIdx = currentRoster.engineers.findIndex(e => e === engineer);
                            return (
                              <tr key={engineer._id || deptIdx} className={`border-b ${isDark ? 'border-dark-border' : 'border-slate-100'}`}>
                                <td className={`px-3 py-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {deptIdx + 1}
                                </td>
                                <td className={`px-3 py-2 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {engineer.engineerName}
                                </td>
                                <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {engineer.jobRole}
                                </td>
                                <td className={`px-3 py-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {engineer.location}
                                </td>
                                <td className={`px-3 py-2 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {engineer.contactNo}
                                </td>
                                {getDatesArray(currentRoster.weekStartDate, currentRoster.weekEndDate).map((date, dateIdx) => {
                                  const shiftType = getShiftForDate(engineer, date);
                                  return (
                                    <td key={dateIdx} className="px-1 py-1">
                                      <select
                                        value={shiftType}
                                        onChange={(e) => handleShiftChange(globalIdx, dateIdx, e.target.value)}
                                        className="w-full px-1 py-1 text-xs font-medium rounded cursor-pointer border-0 focus:ring-2 focus:ring-blue-500"
                                        style={{
                                          backgroundColor: shiftTypes[shiftType]?.color || '#f5f5f5',
                                          color: shiftTypes[shiftType]?.textColor || '#333'
                                        }}
                                      >
                                        {SHIFT_OPTIONS.map(opt => (
                                          <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                      </select>
                                    </td>
                                  );
                                })}
                                <td className="px-2 py-2 text-center">
                                  <button
                                    onClick={() => handleRemoveEngineer(globalIdx)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    
                    {(!currentRoster.engineers || currentRoster.engineers.length === 0) && (
                      <tr>
                        <td colSpan={100} className={`px-3 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          No engineers in this roster. Create a new roster to auto-populate with registered engineers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
