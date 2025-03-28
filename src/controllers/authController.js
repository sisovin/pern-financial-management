// Auth logic (JWT, Argon2, Redis, 2FA)
import { registerUser, loginUser, logoutUser, refreshUserToken, requestPasswordResetService, resetPasswordService, verifyEmailService, getUserProfileService, updateUserProfileService } from '../services/authService.js';
import { logger } from "../utils/logger.js";

/**
 * Register controller
 */
export async function register(req, res) {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    logger.debug('Registration attempt', { email, username });
    
    // Validate required fields
    if (!username || !email || !password) {
      logger.info('Registration validation failed: missing required fields', {
        hasUsername: !!username,
        hasEmail: !!email,
        hasPassword: !!password,
        ip: req.ip
      });
      
      return res.status(400).json({ 
        error: true, 
        message: 'Username, email and password are required' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.info('Registration validation failed: invalid email format', {
        email,
        ip: req.ip
      });
      
      return res.status(400).json({ 
        error: true, 
        message: 'Invalid email format' 
      });
    }
    
    // Password strength validation
    if (password.length < 8) {
      logger.info('Registration validation failed: password too short', {
        passwordLength: password.length,
        ip: req.ip
      });
      
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    const newUser = await registerUser({
      username,
      email,
      password,
      firstName,
      lastName
    });
    
    logger.info('User registered successfully', {
      userId: newUser.id,
      email,
      username,
      ip: req.ip
    });
    
    res.status(201).json({
      error: false,
      message: 'User registered successfully',
      data: newUser
    });
  } catch (error) {
    // Replace console.error with logger
    logger.error('Registration error', {
      email: req.body?.email,
      username: req.body?.username,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: true,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Registration failed'
    });
  }
}

/**
 * Login controller
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    logger.debug('Login attempt', { email, ip: req.ip });

    if (!email || !password) {
      logger.info('Login validation failed: missing credentials', {
        hasEmail: !!email,
        hasPassword: !!password,
        ip: req.ip
      });
      
      return res.status(400).json({
        error: true,
        message: "Email and password are required",
      });
    }
    
    const loginResult = await loginUser(email, password);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    logger.info('User logged in successfully', {
      userId: loginResult.user.id,
      email: loginResult.user.email,
      ip: req.ip
    });
    
    res.status(200).json({
      error: false,
      message: 'Login successful',
      data: {
        user: loginResult.user,
        accessToken: loginResult.accessToken
      }
    });
  } catch (error) {
    // Replace console.error with logger
    logger.error('Login error', {
      email: req.body?.email,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Login failed'
    });
  }
}

/**
 * Logout controller
 */
export async function logout(req, res) {
  try {
    const userId = req.user.userId;
    
    logger.debug('Logout attempt', { userId, ip: req.ip });
    
    await logoutUser(userId);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    logger.info('User logged out successfully', { userId, ip: req.ip });
    
    res.status(200).json({
      error: false,
      message: 'Logout successful'
    });
  } catch (error) {
    // Replace console.error with logger
    logger.error('Logout error', {
      userId: req.user?.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Logout failed'
    });
  }
}

// Add these functions after your existing controllers

/**
 * Refresh token controller
 */
export async function refreshToken(req, res) {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      logger.info('Token refresh failed: No refresh token provided', { ip: req.ip });
      return res.status(401).json({
        error: true,
        message: 'Refresh token is required'
      });
    }
    
    const tokens = await refreshUserToken(refreshToken);
    
    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    logger.info('Token refreshed successfully', { ip: req.ip });
    
    res.status(200).json({
      error: false,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message === 'Invalid refresh token' || 
        error.message === 'User not found' ||
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError') {
      
      // Clear the invalid refresh token
      res.clearCookie('refreshToken');
      
      return res.status(401).json({
        error: true,
        message: 'Invalid or expired refresh token'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to refresh token'
    });
  }
}

/**
 * Request password reset controller
 */
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      logger.info('Password reset request failed: No email provided', { ip: req.ip });
      return res.status(400).json({
        error: true,
        message: 'Email is required'
      });
    }
    
    const result = await requestPasswordResetService(email);
    
    res.status(200).json({
      error: false,
      message: result.message || 'If your email exists in our system, you will receive a password reset link.'
    });
  } catch (error) {
    logger.error('Password reset request error', {
      email: req.body?.email,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    res.status(500).json({
      error: true,
      message: 'Failed to process password reset request'
    });
  }
}

/**
 * Reset password controller
 */
export async function resetPassword(req, res) {
  try {
    const { userId, token, newPassword } = req.body;
    
    if (!userId || !token || !newPassword) {
      logger.info('Password reset failed: Missing required fields', {
        hasUserId: !!userId,
        hasToken: !!token,
        hasNewPassword: !!newPassword,
        ip: req.ip
      });
      
      return res.status(400).json({
        error: true,
        message: 'User ID, token, and new password are required'
      });
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      logger.info('Password reset failed: Password too short', {
        passwordLength: newPassword.length,
        ip: req.ip
      });
      
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    const result = await resetPasswordService(userId, token, newPassword);
    
    res.status(200).json({
      error: false,
      message: result.message || 'Password has been reset successfully'
    });
  } catch (error) {
    logger.error('Password reset error', {
      userId: req.body?.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        error: true,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to reset password'
    });
  }
}

/**
 * Verify email controller
 */
export async function verifyEmail(req, res) {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      logger.info('Email verification failed: Missing required fields', {
        hasUserId: !!userId,
        hasToken: !!token,
        ip: req.ip
      });
      
      return res.status(400).json({
        error: true,
        message: 'User ID and token are required'
      });
    }
    
    const result = await verifyEmailService(userId, token);
    
    res.status(200).json({
      error: false,
      message: result.message || 'Email has been verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error', {
      userId: req.body?.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        error: true,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to verify email'
    });
  }
}

// Add these functions to your authController.js file

/**
 * Get user profile controller
 */
export async function getUserProfile(req, res) {
  try {
    // Add explicit check and debug logging for user ID
    if (!req.user || !req.user.id) {
      logger.error("User profile fetch error: Missing user ID in request", {
        user: req.user,
        headers: {
          authorization: req.headers.authorization
            ? "Bearer xx...xx"
            : undefined,
        },
      });
      return res.status(401).json({
        error: true,
        message: "Authentication required",
      });
    }

    const userId = req.user.id;

    logger.debug("User profile request", { userId, ip: req.ip });

    const userProfile = await getUserProfileService(userId);

    logger.info("User profile fetched successfully", { userId, ip: req.ip });

    res.status(200).json({
      error: false,
      message: "User profile fetched successfully",
      data: userProfile,
    });
  } catch (error) {
    logger.error("User profile fetch error", {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });

    if (error.message === "User not found") {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    res.status(500).json({
      error: true,
      message: "Failed to fetch user profile",
    });
  }
}

/**
 * Update user profile controller
 */
export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    
    logger.debug('User profile update request', { userId, ip: req.ip });
    
    // Validate data
    if (profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        logger.info('Profile update validation failed: invalid email format', {
          email: profileData.email,
          userId,
          ip: req.ip
        });
        
        return res.status(400).json({ 
          error: true, 
          message: 'Invalid email format' 
        });
      }
    }
    
    const updatedProfile = await updateUserProfileService(userId, profileData);
    
    logger.info('User profile updated successfully', { userId, ip: req.ip });
    
    res.status(200).json({
      error: false,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    logger.error('User profile update error', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    if (error.message.includes('already in use')) {
      return res.status(409).json({
        error: true,
        message: error.message
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Failed to update profile'
    });
  }
}