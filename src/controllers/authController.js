// Auth logic (JWT, Argon2, Redis, 2FA)
import { registerUser, loginUser, logoutUser } from '../services/authService.js';
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