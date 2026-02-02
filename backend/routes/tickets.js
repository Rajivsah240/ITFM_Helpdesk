const express = require('express');
const { body } = require('express-validator');
const {
  getTickets,
  getTicket,
  createTicket,
  assignTicket,
  updateStatus,
  addActionLog,
  requestReassign,
  handleReassignRequest,
  getStats
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Ticket creation validation
const createTicketValidation = [
  body('assetId').trim().notEmpty().withMessage('Asset ID is required'),
  body('callType')
    .isIn(['hardware', 'software', 'network', 'access', 'other'])
    .withMessage('Invalid call type'),
  body('problemDescription')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Problem description must be at least 10 characters'),
  body('location').trim().notEmpty().withMessage('Location is required')
];

// Stats route (admin only)
router.get('/stats', authorize('admin'), getStats);

// Main ticket routes
router.route('/')
  .get(getTickets)
  .post(createTicketValidation, createTicket);

router.route('/:id')
  .get(getTicket);

// Ticket assignment (admin only)
router.put(
  '/:id/assign',
  authorize('admin'),
  body('engineerId').notEmpty().withMessage('Engineer ID is required'),
  assignTicket
);

// Status update (admin and engineer)
router.put(
  '/:id/status',
  authorize('admin', 'engineer'),
  body('status')
    .isIn(['open', 'assigned', 'in-progress', 'resolved'])
    .withMessage('Invalid status'),
  updateStatus
);

// Add action log (admin and engineer)
router.post(
  '/:id/logs',
  authorize('admin', 'engineer'),
  body('action').trim().notEmpty().withMessage('Action is required'),
  addActionLog
);

// Reassignment request (engineer only)
router.post(
  '/:id/reassign-request',
  authorize('engineer'),
  [
    body('engineerId').notEmpty().withMessage('Engineer ID is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required')
  ],
  requestReassign
);

// Handle reassignment request (admin only)
router.put(
  '/:id/reassign-request',
  authorize('admin'),
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be approve or reject'),
  handleReassignRequest
);

module.exports = router;
