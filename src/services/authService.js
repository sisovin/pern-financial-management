// Authentication service
import { prisma } from "../config/db.js";
import { hashPassword, verifyPassword } from "../utils/argon2.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { redisClient, isConnected } from "../config/redis.js"; 
import { logger } from "../utils/logger.js";

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Created user (without password)
 */
export async function registerUser(userData) {
  const { username, email, password, firstName, lastName } = userData;
  
  logger.info('User registration attempt', { email, username });
  
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ],
      isDeleted: false
    }
  });
  
  if (existingUser) {
    logger.warn('Registration failed: user already exists', { 
      email, 
      username,
      existingEmail: existingUser.email,
      existingUsername: existingUser.username
    });
    throw new Error('User with this email or username already exists');
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Get default user role
  const userRole = await prisma.role.findFirst({
    where: { name: 'USER' }
  });
  
  if (!userRole) {
    logger.error('Registration failed: default user role not found');
    throw new Error('Default user role not found');
  }
  
  try {
    // Create user with transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          roles: {
            connect: [{ id: userRole.id }]
          }
        },
        include: {
          roles: true
        }
      });
      
      // Create user data only if firstName and lastName are provided
      if (firstName && lastName) {
        await tx.userData.create({
          data: {
            userId: newUser.id,
            firstName,
            lastName
          }
        });
      }
      
      return newUser;
    });
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    logger.info('User registered successfully', { 
      userId: user.id, 
      email, 
      username 
    });
    
    return userWithoutPassword;
  } catch (error) {
    logger.error('Error creating user during registration', {
      email,
      username,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Login a user
 * @param {string} emailOrUsername - User's email or username
 * @param {string} password - User's password
 * @returns {Object} User tokens and profile
 */
export async function loginUser(emailOrUsername, password) {
  logger.info('Login attempt', { emailOrUsername });
  
  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ],
      isDeleted: false,
      isActive: true
    },
    include: {
      roles: true,
      userData: true
    }
  });
  
  if (!user) {
    logger.warn('Login failed: user not found', { emailOrUsername });
    throw new Error('User not found');
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(user.password, password);
  if (!isValidPassword) {
    logger.warn('Login failed: invalid password', { 
      userId: user.id, 
      email: user.email 
    });
    throw new Error('Invalid password');
  }
  
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Store refresh token in Redis with user ID as key
  if (redisClient && isConnected) {
    try {
      await redisClient.set(
        `refresh_token:${user.id}`, 
        refreshToken,
        { EX: 60 * 60 * 24 * 7 } // 7 days
      );
      logger.debug('Refresh token stored in Redis', { userId: user.id });
    } catch (error) {
      logger.error('Error storing refresh token in Redis', {
        userId: user.id,
        error: error.message,
        stack: error.stack
      });
      // Don't fail login if Redis fails - just log the error
    }
  } else {
    logger.warn('Redis not connected, refresh token not stored', { userId: user.id });
  }
  
  // Don't return the password
  const { password: _, ...userWithoutPassword } = user;
  
  logger.info('User logged in successfully', { 
    userId: user.id, 
    email: user.email 
  });
  
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
}

/**
 * Logout a user
 * @param {string} userId - User ID
 */
export async function logoutUser(userId) {
  logger.info('User logout attempt', { userId });
  
  if (redisClient && isConnected) {
    try {
      await redisClient.del(`refresh_token:${userId}`);
      logger.debug('Refresh token removed from Redis', { userId });
    } catch (error) {
      logger.error('Error removing refresh token from Redis', {
        userId,
        error: error.message,
        stack: error.stack
      });
    }
  } else {
    logger.warn('Redis not connected, refresh token not removed', { userId });
  }
  
  logger.info('User logged out successfully', { userId });
  return { success: true };
}