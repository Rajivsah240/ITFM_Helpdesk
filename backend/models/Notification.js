const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['new_ticket', 'assigned', 'action_update', 'resolved', 'reassign_request', 'reassigned', 'critical']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  ticket: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ticket'
  },
  ticketId: {
    type: String
  },
  forUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  forRole: {
    type: String,
    enum: ['admin', 'engineer', null],
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
NotificationSchema.index({ forUser: 1, read: 1 });
NotificationSchema.index({ forRole: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

// Auto-delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', NotificationSchema);
