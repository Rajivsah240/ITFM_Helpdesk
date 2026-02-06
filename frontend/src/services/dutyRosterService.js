import api from './api';

// Get all duty rosters with optional filters
export const getAllRosters = async (params = {}) => {
  const response = await api.get('/duty-roster', { params });
  return response.data;
};

// Get single roster by ID
export const getRosterById = async (id) => {
  const response = await api.get(`/duty-roster/${id}`);
  return response.data;
};

// Get roster for specific week
export const getRosterByWeek = async (date) => {
  const response = await api.get(`/duty-roster/week/${date}`);
  return response.data;
};

// Get current week roster
export const getCurrentRoster = async () => {
  const response = await api.get('/duty-roster/current');
  return response.data;
};

// Create new roster
export const createRoster = async (rosterData) => {
  const response = await api.post('/duty-roster', rosterData);
  return response.data;
};

// Update roster
export const updateRoster = async (id, rosterData) => {
  const response = await api.put(`/duty-roster/${id}`, rosterData);
  return response.data;
};

// Delete roster
export const deleteRoster = async (id) => {
  const response = await api.delete(`/duty-roster/${id}`);
  return response.data;
};

// Add engineer to roster
export const addEngineerToRoster = async (rosterId, engineerData) => {
  const response = await api.post(`/duty-roster/${rosterId}/engineer`, engineerData);
  return response.data;
};

// Remove engineer from roster
export const removeEngineerFromRoster = async (rosterId, engineerIndex) => {
  const response = await api.delete(`/duty-roster/${rosterId}/engineer/${engineerIndex}`);
  return response.data;
};

// Update engineer shift
export const updateEngineerShift = async (rosterId, engineerIndex, shiftData) => {
  const response = await api.patch(
    `/duty-roster/${rosterId}/engineer/${engineerIndex}/shift`,
    shiftData
  );
  return response.data;
};

// Get shift types configuration
export const getShiftTypes = async () => {
  const response = await api.get('/duty-roster/shift-types');
  return response.data;
};

// Publish roster
export const publishRoster = async (id) => {
  const response = await api.patch(`/duty-roster/${id}/publish`);
  return response.data;
};

// Clone roster to new week
export const cloneRoster = async (id, newStartDate) => {
  const response = await api.post(`/duty-roster/${id}/clone`, { newStartDate });
  return response.data;
};

// Shift type configuration (client-side fallback)
export const SHIFT_TYPES = {
  'G-Shift': { name: 'General Shift', timing: '9:30 AM to 5:45 PM', color: '#e8f5e9', textColor: '#2e7d32' },
  'A-Shift': { name: 'Morning Shift', timing: '6 AM to 2 PM', color: '#fff3e0', textColor: '#e65100' },
  'B-Shift': { name: 'Evening Shift', timing: '2 PM to 10 PM', color: '#fce4ec', textColor: '#c2185b' },
  'NRMT': { name: 'NRMT Shift', timing: '8 AM to 4:45 PM', color: '#e3f2fd', textColor: '#1565c0' },
  'Township': { name: 'Township Shift', timing: '9:30 AM to 5:45 PM', color: '#f3e5f5', textColor: '#7b1fa2' },
  'WO': { name: 'Week Off', timing: 'Off Day', color: '#f5f5f5', textColor: '#616161' },
  'LV': { name: 'Leave', timing: 'On Leave', color: '#ffeb3b', textColor: '#f57f17' },
  'H': { name: 'Holiday', timing: 'Holiday', color: '#ff5722', textColor: '#ffffff' }
};

// Dark mode shift colors
export const SHIFT_TYPES_DARK = {
  'G-Shift': { name: 'General Shift', timing: '9:30 AM to 5:45 PM', color: '#1b5e20', textColor: '#a5d6a7' },
  'A-Shift': { name: 'Morning Shift', timing: '6 AM to 2 PM', color: '#e65100', textColor: '#ffcc80' },
  'B-Shift': { name: 'Evening Shift', timing: '2 PM to 10 PM', color: '#880e4f', textColor: '#f48fb1' },
  'NRMT': { name: 'NRMT Shift', timing: '8 AM to 4:45 PM', color: '#0d47a1', textColor: '#90caf9' },
  'Township': { name: 'Township Shift', timing: '9:30 AM to 5:45 PM', color: '#4a148c', textColor: '#ce93d8' },
  'WO': { name: 'Week Off', timing: 'Off Day', color: '#424242', textColor: '#bdbdbd' },
  'LV': { name: 'Leave', timing: 'On Leave', color: '#f9a825', textColor: '#fff59d' },
  'H': { name: 'Holiday', timing: 'Holiday', color: '#bf360c', textColor: '#ffccbc' }
};

export default {
  getAllRosters,
  getRosterById,
  getRosterByWeek,
  getCurrentRoster,
  createRoster,
  updateRoster,
  deleteRoster,
  addEngineerToRoster,
  removeEngineerFromRoster,
  updateEngineerShift,
  getShiftTypes,
  publishRoster,
  cloneRoster,
  SHIFT_TYPES,
  SHIFT_TYPES_DARK
};
