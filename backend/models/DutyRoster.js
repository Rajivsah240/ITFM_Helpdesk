const mongoose = require('mongoose');

// Shift configuration with timings
const SHIFT_TYPES = {
  'G-Shift': { name: 'General Shift', timing: '9:30 AM to 5:45 PM', color: '#e8f5e9' },
  'A-Shift': { name: 'Morning Shift', timing: '6 AM to 2 PM', color: '#fff3e0' },
  'B-Shift': { name: 'Evening Shift', timing: '2 PM to 10 PM', color: '#fce4ec' },
  'NRMT': { name: 'NRMT Shift', timing: '8 AM to 4:45 PM', color: '#e3f2fd' },
  'Township': { name: 'Township Shift', timing: '9:30 AM to 5:45 PM', color: '#f3e5f5' },
  'WO': { name: 'Week Off', timing: 'Off Day', color: '#f5f5f5' },
  'LV': { name: 'Leave', timing: 'On Leave', color: '#ffeb3b' },
  'H': { name: 'Holiday', timing: 'Holiday', color: '#ff5722' }
};

const shiftEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  shiftType: {
    type: String,
    enum: Object.keys(SHIFT_TYPES),
    required: true,
    default: 'G-Shift'
  }
}, { _id: false });

const engineerRosterSchema = new mongoose.Schema({
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow manual entries for non-registered engineers
  },
  engineerName: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['ITFM', 'Software Development'],
    default: 'ITFM'
  },
  location: {
    type: String,
    required: true
  },
  contactNo: {
    type: String,
    required: true
  },
  shifts: [shiftEntrySchema]
}, { _id: true });

const dutyRosterSchema = new mongoose.Schema({
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: false  // Auto-generated if not provided
  },
  engineers: [engineerRosterSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient querying by date range
dutyRosterSchema.index({ weekStartDate: 1, weekEndDate: 1 });
dutyRosterSchema.index({ status: 1 });

// Static method to get shift types
dutyRosterSchema.statics.getShiftTypes = function() {
  return SHIFT_TYPES;
};

// Generate title from dates
dutyRosterSchema.pre('save', function(next) {
  // Always set title to "Duty Roster"
  this.title = 'Duty Roster';
  next();
});

module.exports = mongoose.model('DutyRoster', dutyRosterSchema);
module.exports.SHIFT_TYPES = SHIFT_TYPES;
