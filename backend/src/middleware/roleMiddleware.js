import { PrismaClient } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { logger } from "../utils/logger.js"; // Fixed path

const prisma = new PrismaClient();

/**
 * Middleware to check if a user has at least one of the specified roles
 * @param {string[]} allowedRoles - Array of role names that are permitted
 */
export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user exists in the request (set by authentication middleware)
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError('Authentication required');
      }

      // Get user with their roles
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          roles: true
        }
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Check if the user has at least one of the allowed roles
      const hasAllowedRole = user.roles.some(role => 
        allowedRoles.includes(role.name)
      );

      if (!hasAllowedRole) {
        const currentRoles = user.roles.map(role => role.name).join(', ');
        throw new ForbiddenError(
          `Access denied: Requires one of [${allowedRoles.join(', ')}] roles. Current roles: [${currentRoles || 'none'}]`
        );
      }

      // User has required role, proceed to the next middleware
      next();
    } catch (error) {
      logger.error(`Role check failed: ${error.message}`);
      // Pass error to error handling middleware
      next(error);
    }
  };
};

/**
 * Middleware to check if a user has specific permissions
 * @param {string[]} requiredPermissions - Array of permission names that are required
 */
export const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Check if user exists in the request
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError('Authentication required');
      }

      // Get user with roles and their permissions
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          roles: {
            include: {
              permissions: true
            }
          }
        }
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Flatten all permissions from all roles
      const userPermissions = user.roles.flatMap(role => 
        role.permissions.map(permission => permission.name)
      );

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        throw new ForbiddenError(
          `Access denied: Missing required permissions [${requiredPermissions.join(', ')}]`
        );
      }

      // User has all required permissions, proceed
      next();
    } catch (error) {
      logger.error(`Permission check failed: ${error.message}`);
      // Pass error to error handling middleware
      next(error);
    }
  };
};