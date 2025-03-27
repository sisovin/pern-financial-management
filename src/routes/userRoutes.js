import express from 'express';
import * as userController from '../controllers/userController.js';
// Authentication middleware should be implemented
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Admin
 */
router.get(
  '/',
  authenticate, 
  authorize('ADMIN'),
  userController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin or Self
 */
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin or Self
 */
router.put(
  '/:id',
  authenticate,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  userController.softDeleteUser
);

/**
 * @route   DELETE /api/users/:id/hard
 * @desc    Hard delete user
 * @access  Admin
 */
router.delete(
  '/:id/hard',
  authenticate,
  authorize('ADMIN'),
  userController.hardDeleteUser
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate/deactivate user
 * @access  Admin
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  userController.setUserActiveStatus
);

export default router;