const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
  try {
    let query;

    // Role-based filtering
    if (req.user.role === 'admin') {
      // Admin sees all tickets
      query = Ticket.find();
    } else if (req.user.role === 'engineer') {
      // Engineer sees assigned tickets
      query = Ticket.find({ assignedTo: req.user._id });
    } else {
      // User sees their own tickets
      query = Ticket.find({ raisedBy: req.user._id });
    }

    const tickets = await query
      .populate('raisedBy', 'name employeeId department')
      .populate('assignedTo', 'name employeeId')
      .populate('reassignRequest.requestedTo', 'name employeeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('raisedBy', 'name employeeId department email phone')
      .populate('assignedTo', 'name employeeId')
      .populate('reassignRequest.requestedTo', 'name employeeId')
      .populate('actionLogs.performedBy', 'name employeeId');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check access - only ticket owner, assigned engineer, or admin
    if (
      req.user.role !== 'admin' &&
      ticket.raisedBy._id.toString() !== req.user._id.toString() &&
      ticket.assignedTo?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    const { assetId, callType, problemDescription, location, severity } = req.body;

    // Generate ticket ID
    const ticketId = await Ticket.generateTicketId();

    const ticket = await Ticket.create({
      ticketId,
      assetId,
      callType,
      problemDescription,
      location,
      severity: severity || 'medium',
      raisedBy: req.user._id,
      actionLogs: [{
        action: 'Ticket created',
        performedBy: req.user._id,
        details: `Ticket raised for ${callType}`
      }]
    });

    // Populate for response
    await ticket.populate('raisedBy', 'name employeeId department');

    // Create notification for admins
    await Notification.create({
      type: 'new_ticket',
      title: 'New Ticket Raised',
      message: `Ticket ${ticket.ticketId} raised by ${req.user.name}`,
      ticket: ticket._id,
      forRole: 'admin'
    });

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign ticket to engineer
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin
exports.assignTicket = async (req, res, next) => {
  try {
    const { engineerId } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    const engineer = await User.findOne({ 
      _id: engineerId, 
      role: 'engineer',
      isActive: true 
    });

    if (!engineer) {
      return res.status(404).json({
        success: false,
        error: 'Engineer not found'
      });
    }

    ticket.assignedTo = engineer._id;
    ticket.status = 'assigned';
    ticket.actionLogs.push({
      action: 'Ticket assigned',
      performedBy: req.user._id,
      details: `Assigned to ${engineer.name} (${engineer.employeeId})`
    });

    // Clear any pending reassign request
    ticket.reassignRequest = undefined;

    await ticket.save();

    await ticket.populate('raisedBy', 'name employeeId department');
    await ticket.populate('assignedTo', 'name employeeId');

    // Create notification for engineer
    await Notification.create({
      type: 'assigned',
      title: 'New Ticket Assigned',
      message: `Ticket ${ticket.ticketId} has been assigned to you`,
      ticket: ticket._id,
      forUser: engineer._id
    });

    // Notify ticket raiser
    await Notification.create({
      type: 'action_update',
      title: 'Ticket Assigned',
      message: `Your ticket ${ticket.ticketId} has been assigned to ${engineer.name}`,
      ticket: ticket._id,
      forUser: ticket.raisedBy._id
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'assigned', 'in-progress', 'resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      ticket.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this ticket'
      });
    }

    ticket.status = status;
    
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    }

    ticket.actionLogs.push({
      action: `Status changed to ${status}`,
      performedBy: req.user._id,
      details: `Ticket status updated`
    });

    await ticket.save();

    await ticket.populate('raisedBy', 'name employeeId department');
    await ticket.populate('assignedTo', 'name employeeId');

    // Notify ticket raiser
    await Notification.create({
      type: status === 'resolved' ? 'resolved' : 'action_update',
      title: status === 'resolved' ? 'Ticket Resolved' : 'Ticket Updated',
      message: `Your ticket ${ticket.ticketId} status is now: ${status}`,
      ticket: ticket._id,
      forUser: ticket.raisedBy._id
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add action log to ticket
// @route   POST /api/tickets/:id/logs
// @access  Private
exports.addActionLog = async (req, res, next) => {
  try {
    const { action, details } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      ticket.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this ticket'
      });
    }

    ticket.actionLogs.push({
      action,
      performedBy: req.user._id,
      details
    });

    await ticket.save();

    await ticket.populate('raisedBy', 'name employeeId department');
    await ticket.populate('assignedTo', 'name employeeId');
    await ticket.populate('actionLogs.performedBy', 'name employeeId');

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request reassignment
// @route   POST /api/tickets/:id/reassign-request
// @access  Private/Engineer
exports.requestReassign = async (req, res, next) => {
  try {
    const { engineerId, reason } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Must be assigned to current user
    if (ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the assigned engineer can request reassignment'
      });
    }

    const newEngineer = await User.findOne({
      _id: engineerId,
      role: 'engineer',
      isActive: true
    });

    if (!newEngineer) {
      return res.status(404).json({
        success: false,
        error: 'Requested engineer not found'
      });
    }

    ticket.reassignRequest = {
      requested: true,
      requestedBy: req.user._id,
      requestedTo: newEngineer._id,
      reason,
      status: 'pending',
      requestedAt: new Date()
    };

    ticket.actionLogs.push({
      action: 'Reassignment requested',
      performedBy: req.user._id,
      details: `Requested reassignment to ${newEngineer.name}`
    });

    await ticket.save();

    await ticket.populate('raisedBy', 'name employeeId department');
    await ticket.populate('assignedTo', 'name employeeId');
    await ticket.populate('reassignRequest.requestedTo', 'name employeeId');

    // Notify admin
    await Notification.create({
      type: 'reassign_request',
      title: 'Reassignment Request',
      message: `${req.user.name} requested reassignment for ticket ${ticket.ticketId}`,
      ticket: ticket._id,
      forRole: 'admin'
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle reassign request (approve/reject)
// @route   PUT /api/tickets/:id/reassign-request
// @access  Private/Admin
exports.handleReassignRequest = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use approve or reject'
      });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'name employeeId')
      .populate('reassignRequest.requestedTo', 'name employeeId');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    if (!ticket.reassignRequest || ticket.reassignRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'No pending reassignment request'
      });
    }

    const previousEngineer = ticket.assignedTo;
    const newEngineer = ticket.reassignRequest.requestedTo;

    if (action === 'approve') {
      ticket.assignedTo = newEngineer._id;
      ticket.reassignRequest.status = 'approved';

      ticket.actionLogs.push({
        action: 'Reassignment approved',
        performedBy: req.user._id,
        details: `Reassigned from ${previousEngineer.name} to ${newEngineer.name}`
      });

      // Notify new engineer
      await Notification.create({
        type: 'reassigned',
        title: 'Ticket Reassigned to You',
        message: `Ticket ${ticket.ticketId} has been reassigned to you`,
        ticket: ticket._id,
        forUser: newEngineer._id
      });

      // Notify previous engineer
      await Notification.create({
        type: 'action_update',
        title: 'Reassignment Approved',
        message: `Your reassignment request for ${ticket.ticketId} was approved`,
        ticket: ticket._id,
        forUser: previousEngineer._id
      });
    } else {
      ticket.reassignRequest.status = 'rejected';

      ticket.actionLogs.push({
        action: 'Reassignment rejected',
        performedBy: req.user._id,
        details: 'Reassignment request was rejected by admin'
      });

      // Notify engineer
      await Notification.create({
        type: 'action_update',
        title: 'Reassignment Rejected',
        message: `Your reassignment request for ${ticket.ticketId} was rejected`,
        ticket: ticket._id,
        forUser: previousEngineer._id
      });
    }

    await ticket.save();

    await ticket.populate('raisedBy', 'name employeeId department');
    await ticket.populate('assignedTo', 'name employeeId');

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const assignedTickets = await Ticket.countDocuments({ status: 'assigned' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    
    const pendingReassignments = await Ticket.countDocuments({
      'reassignRequest.status': 'pending'
    });

    // Get tickets by severity
    const bySeverity = await Ticket.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Get tickets by call type
    const byCallType = await Ticket.aggregate([
      { $group: { _id: '$callType', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalTickets,
        byStatus: {
          open: openTickets,
          assigned: assignedTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets
        },
        pendingReassignments,
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCallType: byCallType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (err) {
    next(err);
  }
};
