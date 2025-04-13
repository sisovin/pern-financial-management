// JWT helper functions
import jwt from 'jsonwebtoken';
import '../config/dotenv.js';
import { logger } from "./logger.js";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

// Validate secrets are set
if (!accessTokenSecret || !refreshTokenSecret) {
  logger.error('JWT secrets not configured properly', {
    accessTokenSet: !!accessTokenSecret,
    refreshTokenSet: !!refreshTokenSecret
  });
  throw new Error('JWT configuration error: Token secrets not set');
}

/**
 * Generate access token
 * @param {Object} user - User data to include in token payload
 * @returns {string} JWT access token
 */
export function generateAccessToken(user) {
  try {
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        roles: user.roles.map(role => role.name)
      },
      accessTokenSecret,
      { expiresIn: '1h' }
    );
    
    logger.debug('Access token generated', { userId: user.id });
    return token;
  } catch (error) {
    logger.error('Failed to generate access token', {
      userId: user?.id,
      error: error.message,
      stack: error.stack
    });
    throw new Error('Authentication failed: Could not generate token');
  }
}

/**
 * Generate refresh token
 * @param {Object} user - User data to include in token payload
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(user) {
  try {
    const token = jwt.sign(
      { userId: user.id },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );
    
    logger.debug('Refresh token generated', { userId: user.id });
    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token', {
      userId: user?.id,
      error: error.message,
      stack: error.stack
    });
    throw new Error('Authentication failed: Could not generate refresh token');
  }
}

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    logger.debug('Access token verified successfully', { 
      userId: decoded.userId 
    });
    return decoded;
  } catch (error) {
    // Log detailed error with appropriate level based on error type
    if (error.name === 'TokenExpiredError') {
      logger.info('Access token expired', { error: error.message });
    } else {
      logger.warn('Access token verification failed', {
        error: error.message,
        name: error.name
      });
    }
    return null;
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key to verify with
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('JWT verification error', { 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, refreshTokenSecret);
    logger.debug('Refresh token verified successfully', { 
      userId: decoded.userId 
    });
    return decoded;
  } catch (error) {
    // Log detailed error with appropriate level based on error type
    if (error.name === 'TokenExpiredError') {
      logger.info('Refresh token expired', { error: error.message });
    } else {
      logger.warn('Refresh token verification failed', {
        error: error.message,
        name: error.name
      });
    }
    return null;
  }
}