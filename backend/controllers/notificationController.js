const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { forUser: req.user._id },
        { forRole: req.user.role }
      ]
    })
      .populate('ticket', 'ticketId status')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      $or: [
        { forUser: req.user._id },
        { forRole: req.user.role }
      ],
      read: false
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check authorization
    const isForUser = notification.forUser?.toString() === req.user._id.toString();
    const isForRole = notification.forRole === req.user.role;

    if (!isForUser && !isForRole) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this notification'
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { forUser: req.user._id },
          { forRole: req.user.role }
        ],
        read: false
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check authorization
    const isForUser = notification.forUser?.toString() === req.user._id.toString();
    const isForRole = notification.forRole === req.user.role;

    if (!isForUser && !isForRole) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this notification'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({
      $or: [
        { forUser: req.user._id },
        { forRole: req.user.role }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (err) {
    next(err);
  }
};
