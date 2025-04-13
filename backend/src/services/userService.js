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

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferencesData - User preferences data
 * @returns {Object} Updated user preferences
 */
export async function updateUserPreferences(userId, preferencesData) {
  try {
    logger.info('Updating user preferences', { userId });
    
    // Find the user first to make sure they exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true
      }
    });
    
    if (!existingUser) {
      logger.warn('User preferences update failed: User not found', { userId });
      throw new Error('User not found');
    }
    
    // Check if user preferences record exists
    let userPreferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });
    
    if (userPreferences) {
      // Update existing preferences
      userPreferences = await prisma.userPreferences.update({
        where: { userId },
        data: preferencesData
      });
    } else {
      // Create preferences if they don't exist
      userPreferences = await prisma.userPreferences.create({
        data: {
          userId,
          ...preferencesData
        }
      });
    }
    
    logger.info('User preferences updated successfully', { userId });
    
    return userPreferences;
  } catch (error) {
    logger.error('Error updating user preferences', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} Success message
 */
export async function changeUserPassword(userId, currentPassword, newPassword) {
  try {
    logger.info('Password change attempt', { userId });
    
    // Find user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true
      }
    });
    
    if (!user) {
      logger.warn('Password change failed: User not found', { userId });
      throw new Error('User not found');
    }
    
    // Verify current password
    const isValidPassword = await verifyPassword(user.password, currentPassword);
    if (!isValidPassword) {
      logger.warn('Password change failed: Invalid current password', { userId });
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    logger.info('Password changed successfully', { userId });
    
    return { 
      success: true,
      message: "Password has been changed successfully"
    };
  } catch (error) {
    logger.error('Error changing password', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Update user financial profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Financial profile data
 * @returns {Object} Updated financial profile
 */
export async function updateFinancialProfile(userId, profileData) {
  try {
    logger.info('Updating financial profile', { userId });
    
    // Find the user first to make sure they exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true
      }
    });
    
    if (!existingUser) {
      logger.warn('Financial profile update failed: User not found', { userId });
      throw new Error('User not found');
    }
    
    // Check if financial profile record exists
    let financialProfile = await prisma.financialProfile.findUnique({
      where: { userId }
    });
    
    if (financialProfile) {
      // Update existing profile
      financialProfile = await prisma.financialProfile.update({
        where: { userId },
        data: profileData
      });
    } else {
      // Create profile if it doesn't exist
      financialProfile = await prisma.financialProfile.create({
        data: {
          userId,
          ...profileData
        }
      });
    }
    
    logger.info('Financial profile updated successfully', { userId });
    
    return financialProfile;
  } catch (error) {
    logger.error('Error updating financial profile', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Update user account settings
 * @param {string} userId - User ID
 * @param {Object} settingsData - Account settings data
 * @returns {Object} Updated account settings
 */
export async function updateUserAccountSettings(userId, settingsData) {
  try {
    logger.info('Updating account settings', { userId });
    
    // Find the user first to make sure they exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true
      }
    });
    
    if (!existingUser) {
      logger.warn('Account settings update failed: User not found', { userId });
      throw new Error('User not found');
    }
    
    // Extract user-table settings from settings data
    const userSettings = {};
    if (settingsData.twoFactorEnabled !== undefined) {
      userSettings.twoFactorEnabled = settingsData.twoFactorEnabled;
    }
    
    // Extract user preferences settings
    const preferencesSettings = {};
    const preferencesFields = ['accountPrivacy', 'loginNotifications', 'dataSharing', 'emailNotificationFrequency'];
    
    preferencesFields.forEach(field => {
      if (settingsData[field] !== undefined) {
        preferencesSettings[field] = settingsData[field];
      }
    });
    
    // Perform updates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user table settings if needed
      let user = existingUser;
      if (Object.keys(userSettings).length > 0) {
        user = await tx.user.update({
          where: { id: userId },
          data: userSettings,
          select: {
            id: true,
            username: true,
            email: true,
            twoFactorEnabled: true,
            isActive: true,
            updatedAt: true
          }
        });
      }
      
      // Update user preferences if needed
      let preferences = null;
      if (Object.keys(preferencesSettings).length > 0) {
        // Check if preferences record exists
        const existingPreferences = await tx.userPreferences.findUnique({
          where: { userId }
        });
        
        if (existingPreferences) {
          preferences = await tx.userPreferences.update({
            where: { userId },
            data: preferencesSettings
          });
        } else {
          preferences = await tx.userPreferences.create({
            data: {
              userId,
              ...preferencesSettings
            }
          });
        }
      } else {
        // If no preference fields to update, just retrieve existing preferences
        preferences = await tx.userPreferences.findUnique({
          where: { userId }
        });
      }
      
      // Handle security questions if provided
      if (settingsData.securityQuestions !== undefined) {
        // This would require implementing a security questions table
        // For now, we'll just log that we received them
        logger.info('Security questions provided but not implemented', { 
          userId, 
          questionCount: settingsData.securityQuestions.length 
        });
      }
      
      return { user, preferences };
    });
    
    logger.info('Account settings updated successfully', { userId });
    
    return {
      ...result.user,
      preferences: result.preferences
    };
  } catch (error) {
    logger.error('Error updating account settings', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get user activities with filters
 * @param {string} userId - User ID
 * @param {Object} filters - Activity filters
 * @returns {Array} Filtered activities
 */
export async function getUserActivities(userId, filters) {
  try {
    logger.info('Getting user activities with filters', { 
      userId,
      filters: Object.keys(filters)
    });
    
    // Prepare filter conditions for Prisma
    const whereConditions = {
      userId,
      isDeleted: false
    };
    
    // Add date range filter if provided
    if (filters.startDate !== undefined && filters.startDate !== null) {
      whereConditions.date = {
        ...(whereConditions.date || {}),
        gte: new Date(filters.startDate)
      };
    }
    
    if (filters.endDate !== undefined && filters.endDate !== null) {
      whereConditions.date = {
        ...(whereConditions.date || {}),
        lte: new Date(filters.endDate)
      };
    }
    
    // Add amount range filter if provided
    if (filters.minAmount !== undefined && filters.minAmount !== null) {
      whereConditions.amount = {
        ...(whereConditions.amount || {}),
        gte: filters.minAmount
      };
    }
    
    if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
      whereConditions.amount = {
        ...(whereConditions.amount || {}),
        lte: filters.maxAmount
      };
    }
    
    // Add transaction type filter if provided and not 'ALL'
    if (filters.transactionType && filters.transactionType !== 'ALL') {
      whereConditions.categories = {
        some: {
          type: filters.transactionType
        }
      };
    }
    
    // Add category filter if provided
    if (filters.categories && filters.categories.length > 0) {
      whereConditions.categories = {
        ...(whereConditions.categories || {}),
        some: {
          name: {
            in: filters.categories
          }
        }
      };
    }
    
    // Prepare ordering
    const orderBy = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.date = 'desc'; // Default sorting
    }
    
    // Query the transactions
    const transactions = await prisma.transaction.findMany({
      where: whereConditions,
      include: {
        categories: true
      },
      orderBy
    });
    
    logger.info('Retrieved filtered activities', { 
      userId, 
      count: transactions.length 
    });
    
    return transactions;
  } catch (error) {
    logger.error('Error getting user activities', {
      userId,
      filters,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}