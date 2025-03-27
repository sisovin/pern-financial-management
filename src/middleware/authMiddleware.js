// JWT & Role-Based Access (RBAC)
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';
import { logger } from "../utils/logger.js";

/**
 * Authenticate user using JWT
 */
export const authenticate = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: No token provided', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    return res.status(401).json({ error: true, message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    logger.warn('Authentication failed: Invalid or expired token', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    return res.status(401).json({ error: true, message: 'Invalid or expired token' });
  }
  
  // Add user info to request object
  req.user = decoded;
  
  logger.debug('User authenticated successfully', {
    userId: decoded.userId,
    path: req.path,
    method: req.method
  });
  
  next();
};

/**
 * Check if user has required roles
 * @param {string[]} requiredRoles - Array of role names that are allowed
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authorization failed: No authenticated user', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      return res.status(401).json({ error: true, message: 'Authentication required' });
    }
    
    // Check if user has any of the allowed roles
    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    
    if (!hasRole) {
      logger.warn('Authorization failed: Insufficient roles', {
        userId: req.user.userId,
        userRoles: req.user.roles,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method
      });
      return res.status(403).json({ error: true, message: 'Access denied' });
    }
    
    logger.debug('User authorized successfully', {
      userId: req.user.userId,
      userRoles: req.user.roles,
      requiredRoles: allowedRoles,
      path: req.path
    });
    
    next();
  };
};

/**
 * Check if user has specific permissions
 * @param {string[]} requiredPermissions - Array of permission names required
 */
export const hasPermissions = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Must be authenticated first
      if (!req.user) {
        logger.warn('Permission check failed: No authenticated user', {
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        return res.status(401).json({ error: true, message: 'Authentication required' });
      }
      
      // Get user with roles and permissions
      const user = await prisma.user.findUnique({
        where: { 
          id: req.user.userId,
          isDeleted: false,
          isActive: true
        },
        include: {
          roles: {
            include: {
              permissions: true
            }
          }
        }
      });
      
      if (!user) {
        logger.warn('Permission check failed: User not found', {
          userId: req.user.userId,
          path: req.path,
          method: req.method
        });
        return res.status(404).json({ error: true, message: 'User not found' });
      }
      
      // Extract all permission names the user has through roles
      const userPermissions = user.roles.flatMap(role => 
        role.permissions.map(permission => permission.name)
      );
      
      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        logger.warn('Permission check failed: Insufficient permissions', {
          userId: user.id,
          userPermissions,
          requiredPermissions,
          path: req.path,
          method: req.method
        });
        return res.status(403).json({
          error: true,
          message: 'You do not have all required permissions'
        });
      }
      
      logger.debug('User has required permissions', {
        userId: user.id,
        requiredPermissions,
        path: req.path
      });
      
      next();
    } catch (error) {
      logger.error('Permission check error', {
        userId: req.user?.userId,
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      
      res.status(500).json({ error: true, message: 'Internal server error' });
    }
  };
};