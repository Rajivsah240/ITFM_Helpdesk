const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  performedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ReassignRequestSchema = new mongoose.Schema({
  requested: {
    type: Boolean,
    default: false
  },
  requestedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  requestedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

const TicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  assetId: {
    type: String,
    required: [true, 'Please add an asset ID'],
    trim: true
  },
  callType: {
    type: String,
    required: [true, 'Please add a call type'],
    enum: ['hardware', 'software', 'network', 'access', 'other']
  },
  problemDescription: {
    type: String,
    required: [true, 'Please add a problem description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  raisedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'resolved'],
    default: 'open'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  actionLogs: [ActionLogSchema],
  reassignRequest: ReassignRequestSchema,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate ticket ID before save
TicketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Static method to generate ticket ID
TicketSchema.statics.generateTicketId = async function() {
  const count = await this.countDocuments();
  return `TKT-${String(count + 1).padStart(4, '0')}`;
};

// Index for faster queries
TicketSchema.index({ status: 1 });
TicketSchema.index({ raisedBy: 1 });
TicketSchema.index({ assignedTo: 1 });
// ticketId index already created by unique: true

module.exports = mongoose.model('Ticket', TicketSchema);
