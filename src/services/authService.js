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
 * @throws {Error} If login validation or authentication fails
 */
export async function loginUser(emailOrUsername, password) {
  // Basic input validation within the service
  if (!emailOrUsername || typeof emailOrUsername !== 'string') {
    logger.warn('Login failed: Missing or invalid emailOrUsername');
    throw new Error('Email/username is required');
  }
  
  if (!password || typeof password !== 'string') {
    logger.warn('Login failed: Missing or invalid password');
    throw new Error('Password is required');
  }
  
  // Trim inputs to prevent whitespace issues
  emailOrUsername = emailOrUsername.trim();
  
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
  
  // Check for account lockout (if implemented)
  if (user.loginAttempts >= 5) {
    const lockoutTime = new Date(user.lockoutUntil || 0);
    const currentTime = new Date();
    
    if (lockoutTime > currentTime) {
      logger.warn('Login failed: account locked', { 
        userId: user.id, 
        email: user.email,
        lockoutUntil: lockoutTime
      });
      throw new Error('Account is temporarily locked. Please try again later.');
    }
  }
  
  // Verify password
  try {
    const isValidPassword = await verifyPassword(user.password, password);
    if (!isValidPassword) {
      // Increment failed login attempts (if implemented)
      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: { 
      //     loginAttempts: (user.loginAttempts || 0) + 1,
      //     lockoutUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null
      //   }
      // });
      
      logger.warn('Login failed: invalid password', { 
        userId: user.id, 
        email: user.email 
      });
      throw new Error('Invalid password');
    }
    
    // Reset login attempts on successful login (if implemented)
    // if (user.loginAttempts > 0) {
    //   await prisma.user.update({
    //     where: { id: user.id },
    //     data: { 
    //       loginAttempts: 0,
    //       lockoutUntil: null
    //     }
    //   });
    // }
  } catch (error) {
    if (error.message === 'Invalid password') {
      throw error; // Re-throw the specific error
    }
    
    logger.error('Password verification error', {
      userId: user.id,
      error: error.message,
      stack: error.stack
    });
    throw new Error('Authentication failed');
  }
  
  // Check if 2FA is required
  if (user.twoFactorEnabled) {
    // Return partial auth indicating 2FA is required
    logger.info('Login requires 2FA verification', { 
      userId: user.id, 
      email: user.email 
    });
    
    return {
      requiresTwoFactor: true,
      userId: user.id,
      // Don't provide tokens yet - they'll be provided after 2FA verification
    };
  }
  
  // Generate tokens
  try {
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
  } catch (error) {
    logger.error('Error generating auth tokens', {
      userId: user.id,
      error: error.message,
      stack: error.stack
    });
    throw new Error('Authentication failed');
  }
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

// Add these functions after the existing functions

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - User's refresh token
 * @returns {Object} New tokens
 */
export async function refreshUserToken(refreshToken) {
  try {
    // Verify the refresh token and extract user ID
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.userId;
    
    logger.info('Token refresh attempt', { userId });
    
    // Check if token exists in Redis
    if (redisClient && isConnected) {
      const storedToken = await redisClient.get(`refresh_token:${userId}`);
      
      if (!storedToken || storedToken !== refreshToken) {
        logger.warn('Token refresh failed: Invalid refresh token', { userId });
        throw new Error('Invalid refresh token');
      }
    }
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true
      },
      include: {
        roles: true
      }
    });
    
    if (!user) {
      logger.warn('Token refresh failed: User not found', { userId });
      throw new Error('User not found');
    }
    
    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Update refresh token in Redis
    if (redisClient && isConnected) {
      await redisClient.set(
        `refresh_token:${userId}`, 
        newRefreshToken,
        { EX: 60 * 60 * 24 * 7 } // 7 days
      );
    }
    
    logger.info('Token refreshed successfully', { userId });
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    logger.error('Error refreshing token', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Request password reset
 * @param {string} email - User's email
 * @returns {Object} Success message
 */
export async function requestPasswordResetService(email) {
  try {
    logger.info('Password reset request', { email });
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
        isDeleted: false,
        isActive: true
      }
    });
    
    if (!user) {
      // Don't reveal user existence, but log the issue
      logger.warn('Password reset requested for non-existent user', { email });
      return { success: true }; // Return success even if user doesn't exist for security
    }
    
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before storing it
    const hashedToken = await hashPassword(resetToken);
    
    // Store token in database
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: hashedToken,
        expires: new Date(Date.now() + 3600000) // 1 hour
      },
      create: {
        userId: user.id,
        token: hashedToken,
        expires: new Date(Date.now() + 3600000) // 1 hour
      }
    });
    
    // Send email with reset link (assumed email service exists)
    // emailService.sendPasswordReset(user.email, `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&userId=${user.id}`);
    
    logger.info('Password reset token generated', { userId: user.id, email });
    
    return { 
      success: true,
      message: "If your email exists in our system, you will receive a password reset link."
    };
  } catch (error) {
    logger.error('Error requesting password reset', {
      email,
      error: error.message,
      stack: error.stack
    });
    throw new Error('Failed to process password reset request');
  }
}

/**
 * Reset password with token
 * @param {string} userId - User ID
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Object} Success message
 */
export async function resetPasswordService(userId, token, newPassword) {
  try {
    logger.info('Password reset attempt', { userId });
    
    // Find reset token record
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { userId }
    });
    
    if (!resetRecord) {
      logger.warn('Password reset failed: No reset request found', { userId });
      throw new Error('Invalid or expired reset token');
    }
    
    // Check if token has expired
    if (resetRecord.expires < new Date()) {
      logger.warn('Password reset failed: Token expired', { userId });
      throw new Error('Reset token has expired');
    }
    
    // Verify token
    const isValidToken = await verifyPassword(resetRecord.token, token);
    if (!isValidToken) {
      logger.warn('Password reset failed: Invalid token', { userId });
      throw new Error('Invalid reset token');
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    // Delete reset token
    await prisma.passwordReset.delete({
      where: { userId }
    });
    
    // Invalidate all refresh tokens for the user
    if (redisClient && isConnected) {
      await redisClient.del(`refresh_token:${userId}`);
    }
    
    logger.info('Password reset successful', { userId });
    
    return { 
      success: true,
      message: "Password has been reset successfully"
    };
  } catch (error) {
    logger.error('Error resetting password', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Verify user email
 * @param {string} userId - User ID
 * @param {string} token - Verification token
 * @returns {Object} Success message
 */
export async function verifyEmailService(userId, token) {
  try {
    logger.info('Email verification attempt', { userId });
    
    // Find verification record
    const verificationRecord = await prisma.emailVerification.findUnique({
      where: { userId }
    });
    
    if (!verificationRecord) {
      logger.warn('Email verification failed: No verification request found', { userId });
      throw new Error('Invalid or expired verification token');
    }
    
    // Check if token has expired
    if (verificationRecord.expires < new Date()) {
      logger.warn('Email verification failed: Token expired', { userId });
      throw new Error('Verification token has expired');
    }
    
    // Verify token
    const isValidToken = await verifyPassword(verificationRecord.token, token);
    if (!isValidToken) {
      logger.warn('Email verification failed: Invalid token', { userId });
      throw new Error('Invalid verification token');
    }
    
    // Update user's email verification status
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });
    
    // Delete verification record
    await prisma.emailVerification.delete({
      where: { userId }
    });
    
    logger.info('Email verification successful', { userId });
    
    return { 
      success: true,
      message: "Email has been verified successfully"
    };
  } catch (error) {
    logger.error('Error verifying email', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Add these functions to your authService.js file

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Object} User profile data
 */
export async function getUserProfileService(userId) {
  try {
    logger.info('Fetching user profile', { userId });
    
    // Find user and include their profile data
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true
      },
      include: {
        roles: true,
        userData: true
      }
    });
    
    if (!user) {
      logger.warn('User profile fetch failed: User not found', { userId });
      throw new Error('User not found');
    }
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    logger.info('User profile fetched successfully', { userId });
    
    return userWithoutPassword;
  } catch (error) {
    logger.error('Error fetching user profile', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Updated profile data
 * @returns {Object} Updated user profile
 */
export async function updateUserProfileService(userId, profileData) {
  try {
    logger.info('Updating user profile', { userId });
    
    const { firstName, lastName, phone, address, city, state, country, zipCode, email, username } = profileData;
    
    // Find the user first to make sure they exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true
      }
    });
    
    if (!existingUser) {
      logger.warn('User profile update failed: User not found', { userId });
      throw new Error('User not found');
    }
    
    // Prepare the update operation
    const updates = [];
    
    // Update user data if any of those fields are provided
    if (firstName || lastName || phone || address || city || state || country || zipCode) {
      // Check if userData exists
      const existingUserData = await prisma.userData.findUnique({
        where: { userId }
      });
      
      if (existingUserData) {
        // Update existing user data
        updates.push(
          prisma.userData.update({
            where: { userId },
            data: {
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(phone && { phone }),
              ...(address && { address }),
              ...(city && { city }),
              ...(state && { state }),
              ...(country && { country }),
              ...(zipCode && { zipCode })
            }
          })
        );
      } else {
        // Create user data if it doesn't exist
        updates.push(
          prisma.userData.create({
            data: {
              userId,
              firstName: firstName || '',
              lastName: lastName || '',
              ...(phone && { phone }),
              ...(address && { address }),
              ...(city && { city }),
              ...(state && { state }),
              ...(country && { country }),
              ...(zipCode && { zipCode })
            }
          })
        );
      }
    }
    
    // Update user if email or username are provided
    if (email || username) {
      // Check if email already exists (if trying to change it)
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email,
            id: { not: userId },
            isDeleted: false
          }
        });
        
        if (emailExists) {
          logger.warn('User profile update failed: Email already in use', { userId, email });
          throw new Error('Email already in use by another account');
        }
      }
      
      // Check if username already exists (if trying to change it)
      if (username && username !== existingUser.username) {
        const usernameExists = await prisma.user.findFirst({
          where: {
            username,
            id: { not: userId },
            isDeleted: false
          }
        });
        
        if (usernameExists) {
          logger.warn('User profile update failed: Username already in use', { userId, username });
          throw new Error('Username already in use by another account');
        }
      }
      
      updates.push(
        prisma.user.update({
          where: { id: userId },
          data: {
            ...(email && { email }),
            ...(username && { username })
          }
        })
      );
    }
    
    // Execute all updates in a transaction
    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }
    
    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        userData: true
      }
    });
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    logger.info('User profile updated successfully', { userId });
    
    return userWithoutPassword;
  } catch (error) {
    logger.error('Error updating user profile', {
      userId,
      profileData,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}