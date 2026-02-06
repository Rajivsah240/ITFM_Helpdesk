const DutyRoster = require('../models/DutyRoster');
const { SHIFT_TYPES } = require('../models/DutyRoster');

// @desc    Get all duty rosters
// @route   GET /api/duty-roster
// @access  Private (Admin, Engineer)
exports.getAllRosters = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.weekStartDate = { $gte: new Date(startDate) };
      query.weekEndDate = { $lte: new Date(endDate) };
    }
    
    const rosters = await DutyRoster.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ weekStartDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await DutyRoster.countDocuments(query);
    
    res.json({
      rosters,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching rosters:', error);
    res.status(500).json({ message: 'Server error while fetching rosters' });
  }
};

// @desc    Get single duty roster by ID
// @route   GET /api/duty-roster/:id
// @access  Private
exports.getRosterById = async (req, res) => {
  try {
    const roster = await DutyRoster.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('engineers.engineerId', 'name email phone');
    
    if (!roster) {
      return res.status(404).json({ message: 'Roster not found' });
    }
    
    res.json(roster);
  } catch (error) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ message: 'Server error while fetching roster' });
  }
};

// @desc    Get roster for a specific week
// @route   GET /api/duty-roster/week/:date
// @access  Private
exports.getRosterByWeek = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    
    const roster = await DutyRoster.findOne({
      weekStartDate: { $lte: date },
      weekEndDate: { $gte: date },
      status: 'published'
    })
      .populate('createdBy', 'name email')
      .populate('engineers.engineerId', 'name email phone');
    
    if (!roster) {
      return res.status(404).json({ message: 'No roster found for this week' });
    }
    
    res.json(roster);
  } catch (error) {
    console.error('Error fetching roster by week:', error);
    res.status(500).json({ message: 'Server error while fetching roster' });
  }
};

// @desc    Get current week roster
// @route   GET /api/duty-roster/current
// @access  Private
exports.getCurrentRoster = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const roster = await DutyRoster.findOne({
      weekStartDate: { $lte: today },
      weekEndDate: { $gte: today },
      status: 'published'
    })
      .populate('createdBy', 'name email')
      .populate('engineers.engineerId', 'name email phone');
    
    if (!roster) {
      return res.status(404).json({ message: 'No roster found for current week' });
    }
    
    res.json(roster);
  } catch (error) {
    console.error('Error fetching current roster:', error);
    res.status(500).json({ message: 'Server error while fetching current roster' });
  }
};

// @desc    Create new duty roster
// @route   POST /api/duty-roster
// @access  Private (Admin only)
exports.createRoster = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, title, engineers, status } = req.body;
    
    // Validate dates
    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);
    
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    // Check for overlapping published rosters
    const existingRoster = await DutyRoster.findOne({
      $or: [
        {
          weekStartDate: { $lte: end },
          weekEndDate: { $gte: start }
        }
      ],
      status: 'published'
    });
    
    if (existingRoster && status === 'published') {
      return res.status(400).json({ 
        message: 'A published roster already exists for this date range' 
      });
    }
    
    const roster = new DutyRoster({
      weekStartDate: start,
      weekEndDate: end,
      title,
      engineers: engineers || [],
      status: status || 'draft',
      createdBy: req.user._id
    });
    
    await roster.save();
    
    const populatedRoster = await DutyRoster.findById(roster._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedRoster);
  } catch (error) {
    console.error('Error creating roster:', error);
    res.status(500).json({ message: 'Server error while creating roster' });
  }
};

// @desc    Update duty roster
// @route   PUT /api/duty-roster/:id
// @access  Private (Admin only)
exports.updateRoster = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, title, engineers, status } = req.body;
    
    const roster = await DutyRoster.findById(req.params.id);
    
    if (!roster) {
      return res.status(404).json({ message: 'Roster not found' });
    }
    
    // Update fields
    if (weekStartDate) roster.weekStartDate = new Date(weekStartDate);
    if (weekEndDate) roster.weekEndDate = new Date(weekEndDate);
    if (title) roster.title = title;
    if (engineers) roster.engineers = engineers;
    if (status) roster.status = status;
    
    roster.updatedBy = req.user._id;
    
    await roster.save();
    
    const populatedRoster = await DutyRoster.findById(roster._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    res.json(populatedRoster);
  } catch (error) {
    console.error('Error updating roster:', error);
    res.status(500).json({ message: 'Server error while updating roster' });
  }
};

// @desc    Delete duty roster
// @route   DELETE /api/duty-roster/:id
// @access  Private (Admin only)
exports.deleteRoster = async (req, res) => {
  try {
    const roster = await DutyRoster.findById(req.params.id);
    
    if (!roster) {
      return res.status(404).json({ message: 'Roster not found' });
    }
    
    await DutyRoster.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Roster deleted successfully' });
  } catch (error) {
    console.error('Error deleting roster:', error);
    res.status(500).json({ message: 'Server error while deleting roster' });
  }
};

// @desc    Update engineer shift in roster
// @route   PATCH /api/duty-roster/:id/engineer/:engineerIndex/shift
// @access  Private (Admin only)
exports.updateEngineerShift = async (req, res) => {
  try {
    const { date, shiftType } = req.body;
    const { id, engineerIndex } = req.params;
    
    const roster = await DutyRoster.findById(id);
    
    if (!roster) {
      return res.status(404).json({ message: 'Roster not found' });
    }
    
    if (!roster.engineers[engineerIndex]) {
      return res.status(404).json({ message: 'Engineer not found in roster' });
    }
    
    // Find and update the shift for the specific date
    const shiftDate = new Date(date);
    const existingShiftIndex = roster.engineers[engineerIndex].shifts.findIndex(
      s => s.date.toDateString() === shiftDate.toDateString()
    );
    
    if (existingShiftIndex !== -1) {
      roster.engineers[engineerIndex].shifts[existingShiftIndex].shiftType = shiftType;
    } else {
      roster.engineers[engineerIndex].shifts.push({ date: shiftDate, shiftType });
    }
    
    roster.updatedBy = req.user._id;
    await roster.save();
    
    res.json(roster);
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ message: 'Server error while updating shift' });
  }
};

// @desc    Add engineer to roster
// @route   POST /api/duty-roster/:id/engineer
// @access  Private (Admin only)
exports.addEngineerToRoster = async (req, res) => {
  try {
    const { engineerId, engineerName, jobRole, department, location, contactNo, shifts } = req.body;
    
    const roster = await DutyRoster.findById(req.params.id);
    
    if (!roster) {
      return res.status(404).json({ message: 'Roster not found' });
    }
    
    roster.engineers.push({
      engineerId,
      engineerName,
      jobRole,
      department: department || 'ITFM',
      location,
      contactNo,
      shifts: shifts || []
    });
    
    roster.updatedBy = req.user._id;
    await roster.save();
    
    res.json(roster);
  } catch (error) {
    console.error('Error adding engineer:', error);
    res.status(500).json({ message: 'Server error while adding engineer' });
  }
};

// @desc    Remove engineer from roster
// @route   DELETE /api/duty-roster/:id/engineer/:engineerIndex
// @access  Private (Admin only)
exports.removeEngineerFromRoster = async (req, res) => {
  try {
    const roster = await DutyRoster.findById(req.params.id);
    
    if (!roster) {
      return res.status(404).json({ message: 'Roster not found' });
    }
    
    const engineerIndex = parseInt(req.params.engineerIndex);
    
    if (!roster.engineers[engineerIndex]) {
      return res.status(404).json({ message: 'Engineer not found in roster' });
    }
    
    roster.engineers.splice(engineerIndex, 1);
    roster.updatedBy = req.user._id;
    await roster.save();
    
    res.json(roster);
  } catch (error) {
    console.error('Error removing engineer:', error);
    res.status(500).json({ message: 'Server error while removing engineer' });
  }
};

// @desc    Get shift types configuration
// @route   GET /api/duty-roster/shift-types
// @access  Private
exports.getShiftTypes = async (req, res) => {
  try {
    res.json(SHIFT_TYPES);
  } catch (error) {
    console.error('Error fetching shift types:', error);
    res.status(500).json({ message: 'Server error while fetching shift types' });
  }
};

// @desc    Publish roster
// @route   PATCH /api/duty-roster/:id/publish
// @access  Private (Admin only)
exports.publishRoster = async (req, res) => {
  try {
    const roster = await DutyRoster.findById(req.params.id);
    
    if (!roster) {
      return res.status(404).json({ message: 'Roster not found' });
    }
    
    // Check for existing published roster in this date range
    const existingPublished = await DutyRoster.findOne({
      _id: { $ne: roster._id },
      weekStartDate: { $lte: roster.weekEndDate },
      weekEndDate: { $gte: roster.weekStartDate },
      status: 'published'
    });
    
    if (existingPublished) {
      return res.status(400).json({ 
        message: 'Another roster is already published for this date range' 
      });
    }
    
    roster.status = 'published';
    roster.updatedBy = req.user._id;
    await roster.save();
    
    res.json(roster);
  } catch (error) {
    console.error('Error publishing roster:', error);
    res.status(500).json({ message: 'Server error while publishing roster' });
  }
};

// @desc    Clone roster to new week
// @route   POST /api/duty-roster/:id/clone
// @access  Private (Admin only)
exports.cloneRoster = async (req, res) => {
  try {
    const { newStartDate } = req.body;
    
    const sourceRoster = await DutyRoster.findById(req.params.id);
    
    if (!sourceRoster) {
      return res.status(404).json({ message: 'Source roster not found' });
    }
    
    const start = new Date(newStartDate);
    const daysDiff = (sourceRoster.weekEndDate - sourceRoster.weekStartDate) / (1000 * 60 * 60 * 24);
    const end = new Date(start);
    end.setDate(end.getDate() + daysDiff);
    
    // Clone engineers with adjusted shift dates
    const clonedEngineers = sourceRoster.engineers.map(eng => ({
      engineerId: eng.engineerId,
      engineerName: eng.engineerName,
      jobRole: eng.jobRole,
      department: eng.department,
      location: eng.location,
      contactNo: eng.contactNo,
      shifts: eng.shifts.map(shift => {
        const originalDayOffset = Math.floor(
          (new Date(shift.date) - sourceRoster.weekStartDate) / (1000 * 60 * 60 * 24)
        );
        const newDate = new Date(start);
        newDate.setDate(newDate.getDate() + originalDayOffset);
        return {
          date: newDate,
          shiftType: shift.shiftType
        };
      })
    }));
    
    const newRoster = new DutyRoster({
      weekStartDate: start,
      weekEndDate: end,
      engineers: clonedEngineers,
      status: 'draft',
      createdBy: req.user._id
    });
    
    await newRoster.save();
    
    res.status(201).json(newRoster);
  } catch (error) {
    console.error('Error cloning roster:', error);
    res.status(500).json({ message: 'Server error while cloning roster' });
  }
};
