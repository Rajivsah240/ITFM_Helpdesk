const User = require('../models/User');
const DutyRoster = require('../models/DutyRoster');
const { SHIFT_TYPES } = require('../models/DutyRoster');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all engineers
// @route   GET /api/users/engineers
// @access  Private/Admin
exports.getEngineers = async (req, res, next) => {
  try {
    const engineers = await User.find({ role: 'engineer', isActive: true })
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: engineers.length,
      data: engineers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get engineers with current availability from roster
// @route   GET /api/users/engineers/availability
// @access  Private/Admin
exports.getEngineersWithAvailability = async (req, res, next) => {
  try {
    // Get all active engineers
    const engineers = await User.find({ role: 'engineer', isActive: true })
      .select('-password')
      .sort({ name: 1 });

    // Get current date and time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;
    
    // Create today's date string for comparison (YYYY-MM-DD format)
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Shift timings in minutes from midnight
    const shiftTimings = {
      'G-Shift': { start: 9 * 60 + 30, end: 17 * 60 + 45 },    // 9:30 AM to 5:45 PM
      'A-Shift': { start: 6 * 60, end: 14 * 60 },               // 6 AM to 2 PM
      'B-Shift': { start: 14 * 60, end: 22 * 60 },              // 2 PM to 10 PM
      'NRMT': { start: 8 * 60, end: 16 * 60 + 45 },             // 8 AM to 4:45 PM
      'Township': { start: 9 * 60 + 30, end: 17 * 60 + 45 },    // 9:30 AM to 5:45 PM
      'WO': null,                                                 // Week Off
      'LV': null,                                                 // Leave
      'H': null                                                   // Holiday
    };

    // Find the roster that covers today (use date string comparison to avoid timezone issues)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentRoster = await DutyRoster.findOne({
      weekStartDate: { $lte: new Date(todayString + 'T23:59:59.999Z') },
      weekEndDate: { $gte: new Date(todayString + 'T00:00:00.000Z') },
      status: 'published'
    }).populate('engineers.engineerId', 'name email');

    // Create a map of engineer availability
    const availabilityMap = new Map();

    if (currentRoster) {
      for (const rosterEngineer of currentRoster.engineers) {
        if (rosterEngineer.engineerId) {
          const engineerId = rosterEngineer.engineerId._id.toString();
          
          // Find today's shift for this engineer (compare date strings to avoid timezone issues)
          const todayShift = rosterEngineer.shifts.find(shift => {
            const shiftDate = new Date(shift.date);
            const shiftDateString = `${shiftDate.getUTCFullYear()}-${String(shiftDate.getUTCMonth() + 1).padStart(2, '0')}-${String(shiftDate.getUTCDate()).padStart(2, '0')}`;
            return shiftDateString === todayString;
          });

          if (todayShift) {
            const shiftType = todayShift.shiftType;
            const timing = shiftTimings[shiftType];
            const shiftInfo = SHIFT_TYPES[shiftType];
            
            let isOnDuty = false;
            let isWorkingToday = false;
            
            if (timing) {
              isWorkingToday = true;
              isOnDuty = currentTimeInMinutes >= timing.start && currentTimeInMinutes <= timing.end;
            }

            availabilityMap.set(engineerId, {
              shiftType,
              shiftName: shiftInfo?.name || shiftType,
              shiftTiming: shiftInfo?.timing || '',
              isOnDuty,
              isWorkingToday,
              location: rosterEngineer.location
            });
          }
        }
      }
    }

    // Enrich engineers with availability data
    const engineersWithAvailability = engineers.map(engineer => {
      const availability = availabilityMap.get(engineer._id.toString());
      return {
        ...engineer.toObject(),
        availability: availability || {
          shiftType: null,
          shiftName: 'Not in roster',
          shiftTiming: '',
          isOnDuty: false,
          isWorkingToday: false,
          location: engineer.location || ''
        }
      };
    });

    // Sort: On-duty first, then working today but not on duty, then others
    engineersWithAvailability.sort((a, b) => {
      if (a.availability.isOnDuty && !b.availability.isOnDuty) return -1;
      if (!a.availability.isOnDuty && b.availability.isOnDuty) return 1;
      if (a.availability.isWorkingToday && !b.availability.isWorkingToday) return -1;
      if (!a.availability.isWorkingToday && b.availability.isWorkingToday) return 1;
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({
      success: true,
      count: engineersWithAvailability.length,
      data: engineersWithAvailability,
      hasRoster: !!currentRoster
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // Generate employee ID
    const employeeId = await User.generateEmployeeId();

    const user = await User.create({
      employeeId,
      name,
      email,
      password,
      role,
      department,
      phone
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      department: req.body.department,
      phone: req.body.phone,
      isActive: req.body.isActive
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get engineer workload
// @route   GET /api/users/workload
// @access  Private/Admin
exports.getWorkload = async (req, res, next) => {
  try {
    const Ticket = require('../models/Ticket');
    
    const engineers = await User.find({ role: 'engineer', isActive: true })
      .select('_id employeeId name department');

    const workload = await Promise.all(
      engineers.map(async (engineer) => {
        const ticketCount = await Ticket.countDocuments({
          assignedTo: engineer._id,
          status: { $ne: 'resolved' }
        });

        return {
          id: engineer._id,
          employeeId: engineer.employeeId,
          name: engineer.name,
          department: engineer.department,
          activeTickets: ticketCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: workload
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, designation, location } = req.body;

    // Fields that can be updated by user
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (department) fieldsToUpdate.department = department;
    if (designation) fieldsToUpdate.designation = designation;
    
    // Location only for engineers
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role === 'engineer' && location) {
      fieldsToUpdate.location = location;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request account deletion
// @route   POST /api/users/deletion-request
// @access  Private
exports.requestDeletion = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        deletionRequested: true,
        deletionRequestDate: new Date(),
        deletionReason: reason || 'No reason provided'
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Deletion request submitted. Awaiting admin approval.',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel account deletion request
// @route   DELETE /api/users/deletion-request
// @access  Private
exports.cancelDeletionRequest = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        deletionRequested: false,
        deletionRequestDate: null,
        deletionReason: null
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Deletion request cancelled.',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all deletion requests (Admin only)
// @route   GET /api/users/deletion-requests
// @access  Private/Admin
exports.getDeletionRequests = async (req, res, next) => {
  try {
    const users = await User.find({ deletionRequested: true })
      .select('-password')
      .sort({ deletionRequestDate: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve deletion request (Admin only)
// @route   POST /api/users/:id/approve-deletion
// @access  Private/Admin
exports.approveDeletion = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.deletionRequested) {
      return res.status(400).json({
        success: false,
        error: 'No deletion request found for this user'
      });
    }

    // Soft delete - deactivate the user
    user.isActive = false;
    user.deletionRequested = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account has been deactivated.',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject deletion request (Admin only)
// @route   POST /api/users/:id/reject-deletion
// @access  Private/Admin
exports.rejectDeletion = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.deletionRequested = false;
    user.deletionRequestDate = null;
    user.deletionReason = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Deletion request has been rejected.',
      data: user
    });
  } catch (err) {
    next(err);
  }
};
