import { 
  getUsers as getUsersService,
  getUserById as getUserByIdService,
  createUser as createUserService,
  updateUser as updateUserService,
  softDeleteUser as softDeleteUserService,
  hardDeleteUser as hardDeleteUserService,
  setUserActiveStatus as setUserActiveStatusService
} from "../services/userService.js";
import { logger } from "../utils/logger.js";
import { prisma } from "../config/db.js";
import { ValidationError } from "../validators/authValidator.js";

/**
 * Get system stats for admin dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getDashboardStats(req, res) {
  try {
    logger.debug('Admin dashboard stats request', { 
      adminId: req.user.id,
      ip: req.ip
    });
    
    // Run queries in parallel for better performance
    const [
      usersCount,
      activeUsersCount,
      newUsersThisMonth,
      transactionsCount,
      transactionsThisMonth,
      categoriesCount
    ] = await Promise.all([
      // Total users count
      prisma.user.count({
        where: { isDeleted: false }
      }),
      
      // Active users count
      prisma.user.count({
        where: { 
          isDeleted: false,
          isActive: true
        }
      }),
      
      // New users this month
      prisma.user.count({
        where: {
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().setDate(1)) // First day of current month
          }
        }
      }),
      
      // Total transactions count
      prisma.transaction.count({
        where: { isDeleted: false }
      }),
      
      // Transactions this month
      prisma.transaction.count({
        where: {
          isDeleted: false,
          date: {
            gte: new Date(new Date().setDate(1)) // First day of current month
          }
        }
      }),
      
      // Categories count
      prisma.category.count({
        where: { isDeleted: false }
      })
    ]);
    
    logger.info('Admin dashboard stats retrieved successfully', { 
      adminId: req.user.id,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      data: {
        users: {
          total: usersCount,
          active: activeUsersCount,
          newThisMonth: newUsersThisMonth
        },
        transactions: {
          total: transactionsCount,
          thisMonth: transactionsThisMonth
        },
        categories: categoriesCount
      }
    });
  } catch (error) {
    logger.error('Error retrieving admin dashboard stats', {
      adminId: req.user.id,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
}

/**
 * Manage users - get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function manageUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const includeDeleted = req.query.includeDeleted === 'true';
    
    logger.debug('Admin users list request', { 
      adminId: req.user.id,
      page,
      limit,
      includeDeleted,
      ip: req.ip
    });
    
    const result = await getUsersService(page, limit, includeDeleted);
    
    logger.info('Admin users list retrieved successfully', { 
      adminId: req.user.id,
      count: result.users.length,
      totalCount: result.pagination.total,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      data: result
    });
  } catch (error) {
    logger.error('Error retrieving admin users list', {
      adminId: req.user.id,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve users list'
    });
  }
}

/**
 * Get detailed information about a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getUserDetails(req, res) {
  try {
    const { userId } = req.params;
    
    logger.debug('Admin user details request', { 
      adminId: req.user.id,
      targetUserId: userId,
      ip: req.ip
    });
    
    // Get user with extended information
    const user = await prisma.user.findUnique({
      where: { 
        id: userId
      },
      include: {
        roles: true,
        userData: true,
        adminData: true,
        passwordReset: {
          select: {
            expires: true,
            createdAt: true
          }
        },
        emailVerification: {
          select: {
            expires: true,
            createdAt: true
          }
        },
        transactions: {
          where: { isDeleted: false },
          select: {
            id: true,
            amount: true,
            date: true,
            description: true,
            categories: {
              select: {
                name: true,
                type: true
              }
            }
          },
          take: 5,
          orderBy: {
            date: 'desc'
          }
        },
        savingGoals: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            targetAmount: true,
            currentAmount: true,
            deadline: true,
            isAchieved: true
          }
        }
      }
    });
    
    if (!user) {
      logger.warn('Admin user details not found', { 
        adminId: req.user.id,
        targetUserId: userId,
        ip: req.ip
      });
      
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Create stats for the user
    const transactionsCount = await prisma.transaction.count({
      where: { 
        userId,
        isDeleted: false
      }
    });
    
    const savingGoalsCount = await prisma.savingGoal.count({
      where: { 
        userId,
        isDeleted: false
      }
    });
    
    // For security, don't return sensitive information
    const { password, ...userWithoutPassword } = user;
    
    // Convert user to a plain object
    const userObject = JSON.parse(JSON.stringify(userWithoutPassword));
    
    // Add computed stats
    userObject.stats = {
      transactionsCount,
      savingGoalsCount,
      accountAgeInDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    };
    
    logger.info('Admin user details retrieved successfully', { 
      adminId: req.user.id,
      targetUserId: userId,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      data: userObject
    });
  } catch (error) {
    logger.error('Error retrieving admin user details', {
      adminId: req.user.id,
      userId: req.params.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve user details'
    });
  }
}

/**
 * Create a new user (by admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function createUser(req, res) {
  try {
    const userData = req.body;
    
    logger.debug('Admin create user request', { 
      adminId: req.user.id,
      email: userData.email,
      username: userData.username,
      roles: userData.roles,
      ip: req.ip
    });
    
    // Basic validation
    if (!userData.username || !userData.email || !userData.password) {
      return res.status(400).json({
        error: true,
        message: 'Username, email, and password are required'
      });
    }
    
    // Create the user
    const newUser = await createUserService(userData);
    
    logger.info('Admin created user successfully', { 
      adminId: req.user.id,
      newUserId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      ip: req.ip
    });
    
    res.status(201).json({
      error: false,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    logger.error('Error in admin user creation', {
      adminId: req.user.id,
      email: req.body?.email,
      username: req.body?.username,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message.includes('already exists') || error.code === 'P2002') {
      return res.status(409).json({
        error: true,
        message: 'User with this email or username already exists'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to create user'
    });
  }
}

/**
 * Update a user's information (by admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    logger.debug('Admin update user request', { 
      adminId: req.user.id,
      targetUserId: userId,
      fields: Object.keys(updateData),
      ip: req.ip
    });
    
    // Check if user exists
    const existingUser = await getUserByIdService(userId);
    
    if (!existingUser) {
      logger.warn('Admin update user failed: User not found', { 
        adminId: req.user.id,
        targetUserId: userId,
        ip: req.ip
      });
      
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Perform the update
    const updatedUser = await updateUserService(userId, updateData);
    
    logger.info('Admin updated user successfully', { 
      adminId: req.user.id,
      targetUserId: userId,
      fields: Object.keys(updateData),
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error in admin user update', {
      adminId: req.user.id,
      targetUserId: req.params.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message.includes('already exists') || error.code === 'P2002') {
      return res.status(409).json({
        error: true,
        message: 'Email or username already exists'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to update user'
    });
  }
}

/**
 * Soft delete a user (by admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function softDeleteUser(req, res) {
  try {
    const { userId } = req.params;
    
    logger.debug('Admin soft delete user request', { 
      adminId: req.user.id,
      targetUserId: userId,
      ip: req.ip
    });
    
    // Check if user exists
    const existingUser = await getUserByIdService(userId);
    
    if (!existingUser) {
      logger.warn('Admin soft delete failed: User not found', { 
        adminId: req.user.id,
        targetUserId: userId,
        ip: req.ip
      });
      
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Perform the soft delete
    await softDeleteUserService(userId);
    
    logger.info('Admin soft deleted user successfully', { 
      adminId: req.user.id,
      targetUserId: userId,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      message: 'User has been soft deleted'
    });
  } catch (error) {
    logger.error('Error in admin soft delete user', {
      adminId: req.user.id,
      targetUserId: req.params.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to soft delete user'
    });
  }
}

/**
 * Hard delete a user (by admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function hardDeleteUser(req, res) {
  try {
    const { userId } = req.params;
    
    logger.warn('Admin hard delete user request', { 
      adminId: req.user.id,
      targetUserId: userId,
      ip: req.ip
    });
    
    // Perform the hard delete
    await hardDeleteUserService(userId);
    
    logger.info('Admin hard deleted user successfully', { 
      adminId: req.user.id,
      targetUserId: userId,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      message: 'User has been permanently deleted'
    });
  } catch (error) {
    logger.error('Error in admin hard delete user', {
      adminId: req.user.id,
      targetUserId: req.params.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to permanently delete user'
    });
  }
}

/**
 * Activate or deactivate a user (by admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function setUserActiveStatus(req, res) {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    logger.debug('Admin change user active status request', { 
      adminId: req.user.id,
      targetUserId: userId,
      isActive,
      ip: req.ip
    });
    
    // Validate isActive parameter
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: true,
        message: 'isActive must be a boolean value'
      });
    }
    
    // Check if user exists
    const existingUser = await getUserByIdService(userId);
    
    if (!existingUser) {
      logger.warn('Admin change user status failed: User not found', { 
        adminId: req.user.id,
        targetUserId: userId,
        ip: req.ip
      });
      
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Perform the status update
    const updatedUser = await setUserActiveStatusService(userId, isActive);
    
    logger.info('Admin changed user active status successfully', { 
      adminId: req.user.id,
      targetUserId: userId,
      previousStatus: existingUser.isActive,
      newStatus: isActive,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      message: `User has been ${isActive ? 'activated' : 'deactivated'}`,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error in admin change user active status', {
      adminId: req.user.id,
      targetUserId: req.params.userId,
      isActive: req.body.isActive,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to change user active status'
    });
  }
}

/**
 * Get role management data for admin panel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getRolesAndPermissions(req, res) {
  try {
    logger.debug('Admin roles and permissions request', { 
      adminId: req.user.id,
      ip: req.ip
    });
    
    // Get all roles with their permissions
    const roles = await prisma.role.findMany({
      where: { isDeleted: false },
      include: {
        permissions: {
          where: { isDeleted: false }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });
    
    // Get all permissions
    const permissions = await prisma.permission.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: {
            roles: true
          }
        }
      }
    });
    
    logger.info('Admin roles and permissions retrieved successfully', { 
      adminId: req.user.id,
      rolesCount: roles.length,
      permissionsCount: permissions.length,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      data: {
        roles,
        permissions
      }
    });
  } catch (error) {
    logger.error('Error retrieving admin roles and permissions', {
      adminId: req.user.id,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve roles and permissions'
    });
  }
}

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function createRole(req, res) {
  try {
    const { name, description, permissions } = req.body;
    
    logger.debug('Admin create role request', { 
      adminId: req.user.id,
      roleName: name,
      ip: req.ip
    });
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: true,
        message: 'Role name is required'
      });
    }
    
    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });
    
    if (existingRole) {
      logger.warn('Admin create role failed: Role already exists', { 
        adminId: req.user.id,
        roleName: name,
        ip: req.ip
      });
      
      return res.status(409).json({
        error: true,
        message: 'Role with this name already exists'
      });
    }
    
    // Create role transaction to handle permissions
    const role = await prisma.$transaction(async (tx) => {
      // Create role
      const newRole = await tx.role.create({
        data: {
          name,
          description
        }
      });
      
      // Connect permissions if provided
      if (permissions && permissions.length > 0) {
        // Connect existing permissions
        await tx.role.update({
          where: { id: newRole.id },
          data: {
            permissions: {
              connect: permissions.map(permId => ({ id: permId }))
            }
          },
          include: {
            permissions: true
          }
        });
      }
      
      return newRole;
    });
    
    // Fetch the role with permissions for response
    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        permissions: true
      }
    });
    
    logger.info('Admin created role successfully', { 
      adminId: req.user.id,
      roleId: role.id,
      roleName: name,
      ip: req.ip
    });
    
    res.status(201).json({
      error: false,
      message: 'Role created successfully',
      data: roleWithPermissions
    });
  } catch (error) {
    logger.error('Error in admin create role', {
      adminId: req.user.id,
      roleName: req.body?.name,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to create role'
    });
  }
}

/**
 * Create a new permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function createPermission(req, res) {
  try {
    const { name, description } = req.body;
    
    logger.debug('Admin create permission request', { 
      adminId: req.user.id,
      permissionName: name,
      ip: req.ip
    });
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: true,
        message: 'Permission name is required'
      });
    }
    
    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name }
    });
    
    if (existingPermission) {
      logger.warn('Admin create permission failed: Permission already exists', { 
        adminId: req.user.id,
        permissionName: name,
        ip: req.ip
      });
      
      return res.status(409).json({
        error: true,
        message: 'Permission with this name already exists'
      });
    }
    
    // Create permission
    const permission = await prisma.permission.create({
      data: {
        name,
        description
      }
    });
    
    logger.info('Admin created permission successfully', { 
      adminId: req.user.id,
      permissionId: permission.id,
      permissionName: name,
      ip: req.ip
    });
    
    res.status(201).json({
      error: false,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    logger.error('Error in admin create permission', {
      adminId: req.user.id,
      permissionName: req.body?.name,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to create permission'
    });
  }
}

/**
 * Update role permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function updateRolePermissions(req, res) {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;
    
    logger.debug('Admin update role permissions request', { 
      adminId: req.user.id,
      roleId,
      permissionsCount: permissions?.length,
      ip: req.ip
    });
    
    // Validate permissions array
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        error: true,
        message: 'Permissions must be provided as an array'
      });
    }
    
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });
    
    if (!role) {
      logger.warn('Admin update role permissions failed: Role not found', { 
        adminId: req.user.id,
        roleId,
        ip: req.ip
      });
      
      return res.status(404).json({
        error: true,
        message: 'Role not found'
      });
    }
    
    // Update role permissions
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissions.map(permId => ({ id: permId }))
        }
      },
      include: {
        permissions: true
      }
    });
    
    logger.info('Admin updated role permissions successfully', { 
      adminId: req.user.id,
      roleId,
      roleName: role.name,
      permissionsCount: updatedRole.permissions.length,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      message: 'Role permissions updated successfully',
      data: updatedRole
    });
  } catch (error) {
    logger.error('Error in admin update role permissions', {
      adminId: req.user.id,
      roleId: req.params.roleId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to update role permissions'
    });
  }
}

/**
 * Get admin audit logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.query.userId;
    const action = req.query.action;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    logger.debug('Admin audit logs request', { 
      adminId: req.user.id,
      page,
      limit,
      userId,
      action,
      startDate,
      endDate,
      ip: req.ip
    });
    
    // Build query filters
    const whereConditions = {};
    
    if (userId) {
      whereConditions.userId = userId;
    }
    
    if (action) {
      whereConditions.action = action;
    }
    
    if (startDate || endDate) {
      whereConditions.timestamp = {};
      
      if (startDate) {
        whereConditions.timestamp.gte = startDate;
      }
      
      if (endDate) {
        whereConditions.timestamp.lte = endDate;
      }
    }
    
    // This assumes you have an AuditLog model in your Prisma schema
    // If not, you would need to implement this model first
    const skip = (page - 1) * limit;
    
    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereConditions,
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.auditLog.count({
        where: whereConditions
      })
    ]);
    
    logger.info('Admin audit logs retrieved successfully', { 
      adminId: req.user.id,
      count: logs.length,
      totalCount,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      data: {
        logs,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error retrieving admin audit logs', {
      adminId: req.user.id,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve audit logs'
    });
  }
}