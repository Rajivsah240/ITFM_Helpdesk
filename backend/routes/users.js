const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  getEngineers,
  createUser,
  updateUser,
  deleteUser,
  getWorkload
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

// Engineer routes (accessible by admin)
router.get('/engineers', authorize('admin'), getEngineers);
router.get('/workload', authorize('admin'), getWorkload);

// User management routes (admin only)
router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUserValidation, createUser);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
