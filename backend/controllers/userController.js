const User = require('../models/User');

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
