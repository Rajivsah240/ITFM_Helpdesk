const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  getEngineers,
  getEngineersWithAvailability,
  createUser,
  updateUser,
  deleteUser,
  getWorkload,
  getProfile,
  updateProfile,
  requestDeletion,
  cancelDeletionRequest,
  getDeletionRequests,
  approveDeletion,
  rejectDeletion
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User creation validation
const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['user', 'engineer', 'admin'])
    .withMessage('Invalid role'),
  body('department').trim().notEmpty().withMessage('Department is required')
];

// Profile routes (accessible by all authenticated users)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/deletion-request', requestDeletion);
router.delete('/deletion-request', cancelDeletionRequest);

// Engineer routes (accessible by admin)
router.get('/engineers', authorize('admin'), getEngineers);
router.get('/engineers/availability', authorize('admin'), getEngineersWithAvailability);
router.get('/workload', authorize('admin'), getWorkload);

// Deletion request management (admin only)
router.get('/deletion-requests', authorize('admin'), getDeletionRequests);
router.post('/:id/approve-deletion', authorize('admin'), approveDeletion);
router.post('/:id/reject-deletion', authorize('admin'), rejectDeletion);

// User management routes (admin only)
router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUserValidation, createUser);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
