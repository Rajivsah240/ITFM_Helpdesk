const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllRosters,
  getRosterById,
  getRosterByWeek,
  getCurrentRoster,
  createRoster,
  updateRoster,
  deleteRoster,
  updateEngineerShift,
  addEngineerToRoster,
  removeEngineerFromRoster,
  getShiftTypes,
  publishRoster,
  cloneRoster
} = require('../controllers/dutyRosterController');

// All routes require authentication
router.use(protect);

// Get shift types configuration - accessible by all authenticated users
router.get('/shift-types', getShiftTypes);

// Get current week roster - accessible by all authenticated users
router.get('/current', getCurrentRoster);

// Get roster by specific week date - accessible by all authenticated users
router.get('/week/:date', getRosterByWeek);

// Get all rosters - accessible by all authenticated users
router.get('/', getAllRosters);

// Get single roster by ID - accessible by all authenticated users
router.get('/:id', getRosterById);

// Admin only routes
router.post('/', authorize('admin'), createRoster);
router.put('/:id', authorize('admin'), updateRoster);
router.delete('/:id', authorize('admin'), deleteRoster);

// Engineer management in roster - Admin only
router.post('/:id/engineer', authorize('admin'), addEngineerToRoster);
router.delete('/:id/engineer/:engineerIndex', authorize('admin'), removeEngineerFromRoster);
router.patch('/:id/engineer/:engineerIndex/shift', authorize('admin'), updateEngineerShift);

// Publish roster - Admin only
router.patch('/:id/publish', authorize('admin'), publishRoster);

// Clone roster to new week - Admin only
router.post('/:id/clone', authorize('admin'), cloneRoster);

module.exports = router;
