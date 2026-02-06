import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, Download, 
  Users, MapPin, Phone, Search, Filter, Loader2, AlertCircle,
  Sun, Moon, Building2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as dutyRosterService from '../services/dutyRosterService';

export default function RosterView({ selectedRoster, onBack }) {
  const { isDark } = useTheme();
  const [roster, setRoster] = useState(selectedRoster || null);
  const [loading, setLoading] = useState(!selectedRoster);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  const shiftTypes = isDark ? dutyRosterService.SHIFT_TYPES_DARK : dutyRosterService.SHIFT_TYPES;

  // Fetch current week roster if no roster is selected
  const fetchCurrentRoster = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dutyRosterService.getCurrentRoster();
      setRoster(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No roster available for the current week');
      } else {
        setError('Failed to fetch roster');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedRoster) {
      fetchCurrentRoster();
    }
  }, [selectedRoster, fetchCurrentRoster]);

  // Get dates array
  const getDatesArray = (startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  // Get shift for a specific date
  const getShiftForDate = (engineer, date) => {
    const shift = engineer.shifts?.find(
      s => new Date(s.date).toDateString() === new Date(date).toDateString()
    );
    return shift?.shiftType || 'G-Shift';
  };

  // Format date
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

  // Check if date is today
  const isToday = (date) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  // Check if it's a weekend
  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  // Filter engineers
  const filteredEngineers = roster?.engineers?.filter(engineer => {
    const matchesSearch = engineer.engineerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         engineer.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'all' || engineer.department === filterDepartment;
    const matchesLocation = filterLocation === 'all' || engineer.location === filterLocation;
    return matchesSearch && matchesDept && matchesLocation;
  }) || [];

  // Get unique locations
  const locations = [...new Set(roster?.engineers?.map(e => e.location) || [])];

  // Export to CSV (basic implementation)
  const handleExport = () => {
    if (!roster) return;
    
    const dates = getDatesArray(roster.weekStartDate, roster.weekEndDate);
    const headers = ['#', 'Engineer Name', 'Job Role', 'Location', 'Contact No.', ...dates.map(d => formatDate(d))];
    
    let csvContent = headers.join(',') + '\n';
    
    filteredEngineers.forEach((eng, idx) => {
      const row = [
        idx + 1,
        `"${eng.engineerName}"`,
        `"${eng.jobRole}"`,
        `"${eng.location}"`,
        eng.contactNo,
        ...dates.map(d => getShiftForDate(eng, d))
      ];
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `duty_roster_${formatDate(roster.weekStartDate)}_to_${formatDate(roster.weekEndDate)}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-white' : 'text-slate-800'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !roster) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <AlertCircle className="w-16 h-16 mb-4 text-yellow-500" />
        <p className="text-lg">{error || 'No roster available'}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const dates = getDatesArray(roster.weekStartDate, roster.weekEndDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-dark-hover text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {roster.title || 'Duty Roster'}
              </h2>
              <p className={`flex items-center gap-2 mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Calendar className="w-4 h-4" />
                {formatDateFull(roster.weekStartDate)} to {formatDateFull(roster.weekEndDate)}
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search engineers..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                isDark ? 'bg-dark-input border-dark-border text-white placeholder-slate-500' : 'bg-white border-slate-200'
              }`}
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
              isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Departments</option>
            <option value="ITFM">ITFM</option>
            <option value="Software Development">Software Development</option>
          </select>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
              isDark ? 'bg-dark-input border-dark-border text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shift Legend */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Shift Timings
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(shiftTypes).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{
                backgroundColor: value.color,
                color: value.textColor
              }}
            >
              <span className="font-semibold">{key}</span>
              <span className="opacity-80">→</span>
              <span>{value.timing}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr 
                className="text-white"
                style={{ backgroundColor: '#ef4444' }}
              >
                <th className="px-3 py-3 text-left text-xs font-bold border border-red-600" style={{ minWidth: '40px' }}>
                  Count
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold border border-red-600" style={{ minWidth: '180px' }}>
                  Engineer Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold border border-red-600" style={{ minWidth: '180px' }}>
                  Job Role
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold border border-red-600" style={{ minWidth: '120px' }}>
                  Location
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold border border-red-600" style={{ minWidth: '110px' }}>
                  Contact No.
                </th>
                {dates.map((date, idx) => (
                  <th 
                    key={idx} 
                    className={`px-2 py-3 text-center text-xs font-bold border border-red-600 ${
                      isToday(date) ? 'bg-yellow-400 text-yellow-900' : ''
                    }`}
                    style={{ minWidth: '70px' }}
                  >
                    <div>{formatDate(date)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Group by department */}
              {['ITFM', 'Software Development'].map(dept => {
                const deptEngineers = filteredEngineers.filter(e => e.department === dept);
                if (deptEngineers.length === 0) return null;

                return (
                  <>
                    {/* Department separator row */}
                    <tr key={`sep-${dept}`}>
                      <td colSpan={5 + dates.length} className="h-4"></td>
                    </tr>
                    {/* Department engineers */}
                    {deptEngineers.map((engineer, idx) => (
                      <tr 
                        key={engineer._id || idx}
                        className={`hover:opacity-90 transition-opacity ${
                          idx % 2 === 0 
                            ? isDark ? 'bg-dark-elevated' : 'bg-white' 
                            : isDark ? 'bg-dark-hover' : 'bg-slate-50'
                        }`}
                      >
                        <td className={`px-3 py-2.5 text-sm font-medium border ${isDark ? 'border-dark-border text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                          {idx + 1}
                        </td>
                        <td className={`px-3 py-2.5 text-sm font-semibold border ${isDark ? 'border-dark-border text-white' : 'border-slate-200 text-slate-800'}`}>
                          {engineer.engineerName}
                        </td>
                        <td className={`px-3 py-2.5 text-xs border ${isDark ? 'border-dark-border text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                          {engineer.jobRole}
                        </td>
                        <td className={`px-3 py-2.5 text-xs border ${isDark ? 'border-dark-border text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                          {engineer.location}
                        </td>
                        <td className={`px-3 py-2.5 text-xs font-mono border ${isDark ? 'border-dark-border text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                          {engineer.contactNo}
                        </td>
                        {dates.map((date, dateIdx) => {
                          const shiftType = getShiftForDate(engineer, date);
                          const shiftStyle = shiftTypes[shiftType] || shiftTypes['G-Shift'];
                          const isTodayCell = isToday(date);
                          
                          return (
                            <td 
                              key={dateIdx}
                              className={`px-2 py-2.5 text-center text-xs font-bold border ${
                                isTodayCell ? 'ring-2 ring-yellow-400 ring-inset' : ''
                              }`}
                              style={{
                                backgroundColor: shiftStyle.color,
                                color: shiftStyle.textColor,
                                borderColor: isDark ? '#2a2d31' : '#e2e8f0'
                              }}
                            >
                              {shiftType}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                );
              })}

              {filteredEngineers.length === 0 && (
                <tr>
                  <td 
                    colSpan={5 + dates.length} 
                    className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    No engineers found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {filteredEngineers.length}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Total Engineers
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <Building2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {filteredEngineers.filter(e => e.department === 'ITFM').length}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                ITFM Engineers
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Building2 className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {filteredEngineers.filter(e => e.department === 'Software Development').length}
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Software Developers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
