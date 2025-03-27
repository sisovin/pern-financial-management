import { prisma } from '../config/db.js';
import { hashPassword } from "../utils/argon2.js";
import { logger } from "../utils/logger.js";

/**
 * Get all users with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {boolean} includeDeleted - Whether to include soft-deleted users
 * @returns {Promise<Object>} Users and pagination info
 */
export const getUsers = async (page = 1, limit = 10, includeDeleted = false) => {
  try {
    logger.debug('Getting users list', { page, limit, includeDeleted });
    
    const skip = (page - 1) * limit;
    const whereCondition = includeDeleted ? {} : { isDeleted: false };
    
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true,
          twoFactorEnabled: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            select: {
              name: true
            }
          },
          userData: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereCondition })
    ]);
    
    logger.info('Retrieved users list successfully', { 
      count: users.length, 
      total: totalCount,
      page, 
      limit 
    });
    
    return {
      users,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    logger.error('Error retrieving users list', {
      error: error.message,
      stack: error.stack,
      page,
      limit,
      includeDeleted
    });
    throw new Error(`Failed to retrieve users: ${error.message}`);
  }
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const getUserById = async (id) => {
  try {
    logger.debug('Getting user by ID', { userId: id });
    
    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            name: true
          }
        },
        userData: true
      }
    });
    
    if (user) {
      logger.info('User retrieved successfully', { userId: id });
    } else {
      logger.warn('User not found', { userId: id });
    }
    
    return user;
  } catch (error) {
    logger.error('Error retrieving user', {
      userId: id,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  try {
    logger.debug('Creating new user', { 
      email: userData.email,
      username: userData.username 
    });
    
    const { password, roles = ['USER'], ...userDataWithoutPassword } = userData;
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Process roles
    let roleConnections;
    
    // Handle both array and object formats for roles
    if (Array.isArray(roles)) {
      roleConnections = roles.map(role => ({
        where: { name: typeof role === 'string' ? role : role.name },
        create: { name: typeof role === 'string' ? role : role.name }
      }));
    } else if (roles && typeof roles === 'object') {
      // If roles is an object with name property
      roleConnections = [{
        where: { name: roles.name },
        create: { name: roles.name }
      }];
    } else {
      // Default to USER role
      roleConnections = [{
        where: { name: 'USER' },
        create: { name: 'USER' }
      }];
    }
    
    // Create user with transactions to ensure data integrity
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          ...userDataWithoutPassword,
          password: hashedPassword,
          roles: {
            connectOrCreate: roleConnections
          }
        },
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true,
          createdAt: true,
          roles: {
            select: {
              name: true
            }
          }
        }
      });
      
      return newUser;
    });
    
    logger.info('User created successfully', { 
      userId: user.id, 
      email: user.email,
      username: user.username
    });
    
    return user;
  } catch (error) {
    logger.error('Error creating user', {
      email: userData?.email,
      username: userData?.username,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Update user data
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (id, updateData) => {
  try {
    logger.debug('Updating user', { 
      userId: id,
      fields: Object.keys(updateData).join(', ')
    });
    
    const { password, roles, userData, ...otherUserData } = updateData;
    
    // Start building the update data object
    const updateObject = { ...otherUserData };
    
    // If password is provided, hash it
    if (password) {
      updateObject.password = await hashPassword(password);
      logger.debug('Password included in update', { userId: id });
    }
    
    // Process user data if provided
    const userDataUpdateOperation = userData 
      ? {
          upsert: {
            create: userData,
            update: userData
          }
        }
      : undefined;
    
    // Process roles if provided
    const rolesUpdateOperation = roles && roles.length > 0
      ? {
          set: [],
          connect: roles.map(role => ({ name: role }))
        }
      : undefined;
    
    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateObject,
        userData: userDataUpdateOperation,
        roles: rolesUpdateOperation
      },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        twoFactorEnabled: true,
        updatedAt: true,
        roles: {
          select: {
            name: true
          }
        },
        userData: true
      }
    });
    
    logger.info('User updated successfully', { 
      userId: id,
      email: updatedUser.email,
      username: updatedUser.username
    });
    
    return updatedUser;
  } catch (error) {
    logger.error('Error updating user', {
      userId: id,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

/**
 * Soft delete a user
 * @param {string} id - User ID
 * @returns {Promise<Object>} Operation result
 */
export const softDeleteUser = async (id) => {
  try {
    logger.debug('Soft deleting user', { userId: id });
    
    const user = await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
      select: {
        id: true,
        email: true,
        username: true
      }
    });
    
    logger.info('User soft deleted successfully', { 
      userId: id,
      email: user.email,
      username: user.username
    });
    
    return user;
  } catch (error) {
    logger.error('Error soft deleting user', {
      userId: id,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to soft delete user: ${error.message}`);
  }
};

/**
 * Hard delete a user (complete removal)
 * @param {string} id - User ID
 * @returns {Promise<Object>} Operation result
 */
export const hardDeleteUser = async (id) => {
  try {
    // First get the user info for logging
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, username: true }
    });
    
    logger.warn('Hard deleting user', { 
      userId: id,
      email: user?.email,
      username: user?.username
    });
    
    const result = await prisma.user.delete({
      where: { id }
    });
    
    logger.info('User hard deleted successfully', { 
      userId: id,
      email: user?.email,
      username: user?.username
    });
    
    return result;
  } catch (error) {
    logger.error('Error hard deleting user', {
      userId: id,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to hard delete user: ${error.message}`);
  }
};

/**
 * Activate or deactivate a user
 * @param {string} id - User ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Updated user
 */
export const setUserActiveStatus = async (id, isActive) => {
  try {
    logger.debug('Changing user active status', { 
      userId: id, 
      isActive
    });
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });
    
    logger.info('User active status changed successfully', { 
      userId: id,
      email: user.email,
      username: user.username,
      isActive: user.isActive
    });
    
    return user;
  } catch (error) {
    logger.error('Error changing user active status', {
      userId: id,
      isActive,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to change user active status: ${error.message}`);
  }
};