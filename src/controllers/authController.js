// Auth logic (JWT, Argon2, Redis, 2FA)
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  requestPasswordResetService,
  resetPasswordService,
  verifyEmailService,
  getUserProfileService,
  updateUserProfileService,
} from "../services/authService.js";
import { logger } from "../utils/logger.js";
import {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateProfileUpdate,
  ValidationError,
} from "../validators/authValidator.js";

/**
 * Register controller
 */
export async function register(req, res) {
  try {
    // Validate and sanitize inputs
    const validData = validateRegistration(req.body);
    
    logger.debug('Registration attempt with validated data', { 
      email: validData.email
    });
    
    const newUser = await registerUser(validData);
    
    logger.info('User registered successfully', {
      userId: newUser.id,
      email: validData.email,
      username: validData.username,
      ip: req.ip
    });
    
    res.status(201).json({
      error: false,
      message: 'User registered successfully',
      data: newUser
    });
  } catch (error) {
    // Handle ValidationError separately
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: error.fieldErrors
      });
    }
    
    // Handle other errors
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
    // Validate and sanitize inputs
    const validData = validateLogin(req.body);
    
    logger.debug('Login attempt with validated data', { 
      emailOrUsername: validData.email 
    });
    
    const loginResult = await loginUser(validData.email, validData.password);
    
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
    // Handle ValidationError separately
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: error.fieldErrors
      });
    }
    
    // Handle other errors
    logger.error('Login error', {
      emailOrUsername: req.body?.email,
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

// Add these functions after your existing controllers

/**
 * Refresh token controller
 */
export async function refreshToken(req, res) {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      logger.info("Token refresh failed: No refresh token provided", {
        ip: req.ip,
      });
      return res.status(401).json({
        error: true,
        message: "Refresh token is required",
      });
    }

    const tokens = await refreshUserToken(refreshToken);

    // Set new refresh token in HTTP-only cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info("Token refreshed successfully", { ip: req.ip });

    res.status(200).json({
      error: false,
      message: "Token refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    logger.error("Token refresh error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });

    if (
      error.message === "Invalid refresh token" ||
      error.message === "User not found" ||
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      // Clear the invalid refresh token
      res.clearCookie("refreshToken");

      return res.status(401).json({
        error: true,
        message: "Invalid or expired refresh token",
      });
    }

    res.status(500).json({
      error: true,
      message: "Failed to refresh token",
    });
  }
}

/**
 * Request password reset controller
 */
export async function requestPasswordReset(req, res) {
  try {
    // Validate and sanitize inputs
    const validData = validatePasswordResetRequest(req.body);
    
    const result = await requestPasswordResetService(validData.email);
    
    res.status(200).json({
      error: false,
      message: result.message || 'If your email exists in our system, you will receive a password reset link.'
    });
  } catch (error) {
    // Handle ValidationError separately
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: error.fieldErrors
      });
    }
    
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
    // Validate and sanitize inputs
    const validData = validatePasswordReset(req.body);
    
    const result = await resetPasswordService(
      validData.userId, 
      validData.token, 
      validData.newPassword
    );
    
    res.status(200).json({
      error: false,
      message: result.message || 'Password has been reset successfully'
    });
  } catch (error) {
    // Handle ValidationError separately
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: error.fieldErrors
      });
    }
    
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
    // Validate and sanitize inputs
    const validData = validateEmailVerification(req.body);
    
    const result = await verifyEmailService(validData.userId, validData.token);
    
    res.status(200).json({
      error: false,
      message: result.message || 'Email has been verified successfully'
    });
  } catch (error) {
    // Handle ValidationError separately
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: error.fieldErrors
      });
    }
    
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
    
    // Validate and sanitize profile update data
    const validData = validateProfileUpdate(req.body);
    
    logger.debug('User profile update request with validated data', { 
      userId, 
      fields: Object.keys(validData)
    });
    
    const updatedProfile = await updateUserProfileService(userId, validData);
    
    logger.info('User profile updated successfully', { userId, ip: req.ip });
    
    res.status(200).json({
      error: false,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    // Handle ValidationError separately
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors: error.fieldErrors
      });
    }
    
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

/**
 * Logout controller
 */
export async function logout(req, res) {
  try {
    const userId = req.user.userId;

    logger.debug("Logout attempt", { userId, ip: req.ip });

    await logoutUser(userId);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    logger.info("User logged out successfully", { userId, ip: req.ip });

    res.status(200).json({
      error: false,
      message: "Logout successful",
    });
  } catch (error) {
    // Replace console.error with logger
    logger.error("Logout error", {
      userId: req.user?.userId,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });

    res.status(500).json({
      error: true,
      message: "Logout failed",
    });
  }
}