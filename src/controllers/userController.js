import * as userService from '../services/userService.js';
import { logger } from "../utils/logger.js";

/**
 * Get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const includeDeleted = req.query.includeDeleted === 'true';
    
    logger.debug('Request to get users list', { 
      page, 
      limit, 
      includeDeleted,
      requestId: req.id,
      ip: req.ip
    });
    
    const result = await userService.getUsers(page, limit, includeDeleted);
    
    logger.info('Successfully retrieved users list', { 
      count: result.users.length,
      total: result.pagination.total,
      page, 
      limit,
      requestId: req.id
    });
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error retrieving users list', {
      error: error.message,
      stack: error.stack,
      page: req.query.page,
      limit: req.query.limit,
      includeDeleted: req.query.includeDeleted,
      requestId: req.id,
      ip: req.ip
    });
    next(error);
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.debug('Request to get user by ID', { 
      userId: id,
      requestId: req.id,
      ip: req.ip
    });
    
    const user = await userService.getUserById(id);
    
    if (!user) {
      logger.info('User not found', { 
        userId: id,
        requestId: req.id
      });
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    logger.info('Successfully retrieved user', { 
      userId: id,
      requestId: req.id
    });
    
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error retrieving user by ID', {
      userId: req.params.id,
      error: error.message,
      stack: error.stack,
      requestId: req.id,
      ip: req.ip
    });
    next(error);
  }
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    
    logger.debug('Request to create new user', { 
      email: userData.email,
      username: userData.username,
      requestId: req.id,
      ip: req.ip
    });
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      logger.info('User creation validation failed: missing required fields', {
        hasUsername: !!userData.username,
        hasEmail: !!userData.email,
        hasPassword: !!userData.password,
        requestId: req.id
      });
      
      return res.status(400).json({ 
        error: true, 
        message: 'Username, email, and password are required' 
      });
    }
    
    // Normalize the roles format if necessary
    if (userData.roles && !Array.isArray(userData.roles) && typeof userData.roles === 'object') {
      if (userData.roles.name) {
        // If roles is an object with name property, convert to array
        userData.roles = [userData.roles.name];
        logger.debug('Normalized roles format', { 
          roles: userData.roles,
          requestId: req.id 
        });
      }
    }
    
    const newUser = await userService.createUser(userData);
    
    logger.info('User created successfully', { 
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      requestId: req.id
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    // Handle duplicate key violations
    if (error.code === 'P2002') {
      logger.warn('User creation failed: duplicate entry', {
        email: req.body.email,
        username: req.body.username,
        field: error.meta?.target?.[0],
        requestId: req.id,
        ip: req.ip
      });
      
      return res.status(409).json({ 
        error: true, 
        message: `User with this ${error.meta.target[0]} already exists` 
      });
    }
    
    logger.error('Error creating user', {
      email: req.body?.email,
      username: req.body?.username,
      error: error.message,
      stack: error.stack,
      requestId: req.id,
      ip: req.ip
    });
    
    next(error);
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    logger.debug('Request to update user', { 
      userId: id,
      fields: Object.keys(updateData).join(', '),
      requestId: req.id,
      ip: req.ip
    });
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      logger.info('User update failed: user not found', { 
        userId: id,
        requestId: req.id
      });
      
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    const updatedUser = await userService.updateUser(id, updateData);
    
    logger.info('User updated successfully', { 
      userId: id,
      fields: Object.keys(updateData).join(', '),
      requestId: req.id
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    // Handle duplicate key violations
    if (error.code === 'P2002') {
      logger.warn('User update failed: duplicate entry', {
        userId: req.params.id,
        field: error.meta?.target?.[0],
        requestId: req.id,
        ip: req.ip
      });
      
      return res.status(409).json({ 
        error: true, 
        message: `User with this ${error.meta.target[0]} already exists` 
      });
    }
    
    logger.error('Error updating user', {
      userId: req.params.id,
      error: error.message,
      stack: error.stack,
      requestId: req.id,
      ip: req.ip
    });
    
    next(error);
  }
};

/**
 * Soft delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const softDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.debug('Request to soft delete user', { 
      userId: id,
      requestId: req.id,
      ip: req.ip
    });
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      logger.info('Soft delete failed: user not found', { 
        userId: id,
        requestId: req.id
      });
      
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    await userService.softDeleteUser(id);
    
    logger.info('User soft deleted successfully', { 
      userId: id,
      email: existingUser.email,
      username: existingUser.username,
      requestId: req.id
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'User has been soft deleted' 
    });
  } catch (error) {
    logger.error('Error soft deleting user', {
      userId: req.params.id,
      error: error.message,
      stack: error.stack,
      requestId: req.id,
      ip: req.ip
    });
    
    next(error);
  }
};

/**
 * Hard delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const hardDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.warn('Request to hard delete user', { 
      userId: id,
      requestedBy: req.user?.userId,
      requestId: req.id,
      ip: req.ip
    });
    
    await userService.hardDeleteUser(id);
    
    logger.info('User hard deleted successfully', { 
      userId: id,
      requestedBy: req.user?.userId,
      requestId: req.id
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'User has been permanently deleted' 
    });
  } catch (error) {
    if (error.code === 'P2025') {
      logger.info('Hard delete failed: user not found', { 
        userId: req.params.id,
        requestId: req.id
      });
      
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    logger.error('Error hard deleting user', {
      userId: req.params.id,
      error: error.message,
      stack: error.stack,
      requestId: req.id,
      ip: req.ip
    });
    
    next(error);
  }
};

/**
 * Activate/deactivate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const setUserActiveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    logger.debug('Request to change user active status', { 
      userId: id,
      isActive,
      requestId: req.id,
      ip: req.ip
    });
    
    if (typeof isActive !== 'boolean') {
      logger.info('Status change validation failed: invalid input type', {
        userId: id,
        isActiveType: typeof isActive,
        requestId: req.id
      });
      
      return res.status(400).json({ 
        error: true, 
        message: 'isActive field must be a boolean' 
      });
    }
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      logger.info('Status change failed: user not found', { 
        userId: id,
        requestId: req.id
      });
      
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    const updatedUser = await userService.setUserActiveStatus(id, isActive);
    
    logger.info('User active status changed successfully', { 
      userId: id,
      previousStatus: existingUser.isActive,
      newStatus: isActive,
      requestId: req.id
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error('Error changing user active status', {
      userId: req.params.id,
      isActive: req.body?.isActive,
      error: error.message,
      stack: error.stack,
      requestId: req.id,
      ip: req.ip
    });
    
    next(error);
  }
};