// JWT & Role-Based Access (RBAC)
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { prisma } from "../config/db.js";
import { logger } from "../utils/logger.js";

/**
 * Authenticate user using JWT
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Authentication failed: No token provided", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res
        .status(401)
        .json({ error: true, message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      logger.warn("Authentication failed: Invalid or expired token", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res
        .status(401)
        .json({ error: true, message: "Invalid or expired token" });
    }

    // Add user info to request object - Map properties for consistency
    req.user = {
      id: decoded.userId, // This is needed for your controllers
      userId: decoded.userId, // Keep this for backward compatibility
      email: decoded.email,
      roles: decoded.roles || [],
    };

    logger.debug("User authenticated successfully", {
      userId: decoded.userId,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    // This shouldn't be reached normally since verifyAccessToken handles errors,
    // but it's good to have as a fallback
    logger.error("Unexpected authentication error", {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(401).json({ error: true, message: "Authentication failed" });
  }
};

/**
 * Check if user has required roles
 * @param {string[]} requiredRoles - Array of role names that are allowed
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn("Authorization failed: No authenticated user", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res
        .status(401)
        .json({ error: true, message: "Authentication required" });
    }

    // Check if user has any of the allowed roles
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      logger.warn("Authorization failed: Insufficient roles", {
        userId: req.user.id,
        userRoles: req.user.roles,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({ error: true, message: "Access denied" });
    }

    logger.debug("User authorized successfully", {
      userId: req.user.id,
      userRoles: req.user.roles,
      requiredRoles: allowedRoles,
      path: req.path,
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
        logger.warn("Permission check failed: No authenticated user", {
          path: req.path,
          method: req.method,
          ip: req.ip,
        });
        return res
          .status(401)
          .json({ error: true, message: "Authentication required" });
      }

      // Get user with roles and permissions
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
          isDeleted: false,
          isActive: true,
        },
        include: {
          roles: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!user) {
        logger.warn("Permission check failed: User not found", {
          userId: req.user.id,
          path: req.path,
          method: req.method,
        });
        return res.status(404).json({ error: true, message: "User not found" });
      }

      // Extract all permission names the user has through roles
      const userPermissions = user.roles.flatMap((role) =>
        role.permissions.map((permission) => permission.name)
      );

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.warn("Permission check failed: Insufficient permissions", {
          userId: user.id,
          userPermissions,
          requiredPermissions,
          path: req.path,
          method: req.method,
        });
        return res.status(403).json({
          error: true,
          message: "You do not have all required permissions",
        });
      }

      logger.debug("User has required permissions", {
        userId: user.id,
        requiredPermissions,
        path: req.path,
      });

      next();
    } catch (error) {
      logger.error("Permission check error", {
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
      });

      res.status(500).json({ error: true, message: "Internal server error" });
    }
  };
};

export const validateTransaction = (req, res, next) => {
  const { type, amount, description } = req.body;
  const errors = [];

  // Validate transaction type
  if (!type) {
    errors.push("Transaction type is required");
  } else if (!["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
    errors.push("Transaction type must be INCOME, EXPENSE, or TRANSFER");
  }

  // Validate amount
  if (!amount) {
    errors.push("Transaction amount is required");
  } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    errors.push("Transaction amount must be a positive number");
  }

  // Validate description
  if (!description) {
    errors.push("Transaction description is required");
  } else if (description.length < 3 || description.length > 100) {
    errors.push("Transaction description must be between 3 and 100 characters");
  }

  // If there are errors, return a 400 response
  if (errors.length > 0) {
    logger.warn("Transaction validation failed", {
      errors,
      body: req.body,
      userId: req.user?.id,
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // If everything is valid, proceed to the controller
  next();
};