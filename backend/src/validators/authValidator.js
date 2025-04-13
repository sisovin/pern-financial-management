/**
 * Auth input validation module
 * Centralizes all validation logic for authentication-related inputs
 */
import { logger } from "../utils/logger.js";

// Validation error class for structured error responses
export class ValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Validate registration inputs
 * @param {Object} data - Registration data
 * @param {string} data.username - Username
 * @param {string} data.email - Email
 * @param {string} data.password - Password
 * @param {string} [data.firstName] - First name (optional)
 * @param {string} [data.lastName] - Last name (optional)
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
export function validateRegistration(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate username
  if (!data.username) {
    errors.username = 'Username is required';
  } else if (data.username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  } else if (data.username.length > 30) {
    errors.username = 'Username cannot exceed 30 characters';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
    errors.username = 'Username can only contain letters, numbers, underscores and hyphens';
  } else {
    sanitized.username = data.username.trim();
  }
  
  // Validate email
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  } else {
    sanitized.email = data.email.trim().toLowerCase();
  }
  
  // Validate password
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (data.password.length > 100) {
    errors.password = 'Password cannot exceed 100 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  } else {
    sanitized.password = data.password;
  }
  
  // Validate optional fields
  if (data.firstName !== undefined) {
    if (typeof data.firstName !== 'string') {
      errors.firstName = 'First name must be a string';
    } else if (data.firstName.trim().length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    } else {
      sanitized.firstName = data.firstName.trim();
    }
  }
  
  if (data.lastName !== undefined) {
    if (typeof data.lastName !== 'string') {
      errors.lastName = 'Last name must be a string';
    } else if (data.lastName.trim().length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    } else {
      sanitized.lastName = data.lastName.trim();
    }
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    logger.warn('Registration validation failed', { 
      fieldErrors: errors,
      providedData: {
        username: data.username ? '[REDACTED]' : undefined,
        email: data.email ? '[REDACTED]' : undefined,
        hasPassword: !!data.password
      }
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate login inputs
 * @param {Object} data - Login data
 * @param {string} data.email - Email or username
 * @param {string} data.password - Password
 * @returns {Object} - Validated data
 * @throws {ValidationError} - If validation fails
 */
export function validateLogin(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate email/username (either format allowed)
  if (!data.email) {
    errors.email = 'Email or username is required';
  } else {
    sanitized.email = data.email.trim();
  }
  
  // Validate password (minimal validation for login)
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length > 100) {
    errors.password = 'Invalid password format';
  } else {
    sanitized.password = data.password;
  }
  
  if (Object.keys(errors).length > 0) {
    logger.warn('Login validation failed', { 
      fieldErrors: errors,
      providedEmail: data.email ? '[REDACTED]' : undefined,
      hasPassword: !!data.password
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate password reset request
 * @param {Object} data - Reset request data
 * @param {string} data.email - Email address
 * @returns {Object} - Validated data
 * @throws {ValidationError} - If validation fails
 */
export function validatePasswordResetRequest(data) {
  const errors = {};
  const sanitized = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  } else {
    sanitized.email = data.email.trim().toLowerCase();
  }
  
  if (Object.keys(errors).length > 0) {
    logger.warn('Password reset request validation failed', { 
      fieldErrors: errors,
      providedEmail: data.email ? '[REDACTED]' : undefined
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate password reset (with token)
 * @param {Object} data - Reset data
 * @param {string} data.userId - User ID
 * @param {string} data.token - Reset token
 * @param {string} data.newPassword - New password
 * @returns {Object} - Validated data
 * @throws {ValidationError} - If validation fails
 */
export function validatePasswordReset(data) {
  const errors = {};
  const sanitized = {};
  
  if (!data.userId) {
    errors.userId = 'User ID is required';
  } else {
    sanitized.userId = data.userId;
  }
  
  if (!data.token) {
    errors.token = 'Reset token is required';
  } else {
    sanitized.token = data.token;
  }
  
  if (!data.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (data.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters long';
  } else if (data.newPassword.length > 100) {
    errors.newPassword = 'Password cannot exceed 100 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
    errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  } else {
    sanitized.newPassword = data.newPassword;
  }
  
  if (Object.keys(errors).length > 0) {
    logger.warn('Password reset validation failed', { 
      fieldErrors: errors,
      hasUserId: !!data.userId,
      hasToken: !!data.token,
      hasNewPassword: !!data.newPassword
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate email verification
 * @param {Object} data - Verification data
 * @param {string} data.userId - User ID
 * @param {string} data.token - Verification token
 * @returns {Object} - Validated data
 * @throws {ValidationError} - If validation fails
 */
export function validateEmailVerification(data) {
  const errors = {};
  const sanitized = {};
  
  if (!data.userId) {
    errors.userId = 'User ID is required';
  } else {
    sanitized.userId = data.userId;
  }
  
  if (!data.token) {
    errors.token = 'Verification token is required';
  } else {
    sanitized.token = data.token;
  }
  
  if (Object.keys(errors).length > 0) {
    logger.warn('Email verification validation failed', { 
      fieldErrors: errors,
      hasUserId: !!data.userId,
      hasToken: !!data.token
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate profile update data
 * @param {Object} data - Profile data
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
export function validateProfileUpdate(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate email if provided
  if (data.email !== undefined) {
    if (!data.email) {
      errors.email = 'Email cannot be empty';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    } else {
      sanitized.email = data.email.trim().toLowerCase();
    }
  }
  
  // Validate username if provided
  if (data.username !== undefined) {
    if (!data.username) {
      errors.username = 'Username cannot be empty';
    } else if (data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (data.username.length > 30) {
      errors.username = 'Username cannot exceed 30 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores and hyphens';
    } else {
      sanitized.username = data.username.trim();
    }
  }
  
  // Validate name fields if provided
  if (data.firstName !== undefined) {
    if (typeof data.firstName !== 'string') {
      errors.firstName = 'First name must be a string';
    } else if (data.firstName.trim().length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    } else {
      sanitized.firstName = data.firstName.trim();
    }
  }
  
  if (data.lastName !== undefined) {
    if (typeof data.lastName !== 'string') {
      errors.lastName = 'Last name must be a string';
    } else if (data.lastName.trim().length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    } else {
      sanitized.lastName = data.lastName.trim();
    }
  }
  
  // Validate phone if provided
  if (data.phone !== undefined) {
    if (data.phone && typeof data.phone !== 'string') {
      errors.phone = 'Phone must be a string';
    } else if (data.phone && data.phone.length > 20) {
      errors.phone = 'Phone number is too long';
    } else {
      sanitized.phone = data.phone ? data.phone.trim() : data.phone;
    }
  }
  
  // Validate address fields if provided
  if (data.address !== undefined) {
    sanitized.address = data.address ? data.address.trim() : data.address;
  }
  
  if (data.city !== undefined) {
    if (data.city && data.city.length > 50) {
      errors.city = 'City name is too long';
    } else {
      sanitized.city = data.city ? data.city.trim() : data.city;
    }
  }
  
  if (data.state !== undefined) {
    if (data.state && data.state.length > 50) {
      errors.state = 'State name is too long';
    } else {
      sanitized.state = data.state ? data.state.trim() : data.state;
    }
  }
  
  if (data.country !== undefined) {
    if (data.country && data.country.length > 50) {
      errors.country = 'Country name is too long';
    } else {
      sanitized.country = data.country ? data.country.trim() : data.country;
    }
  }
  
  if (data.zipCode !== undefined) {
    if (data.zipCode && data.zipCode.length > 20) {
      errors.zipCode = 'Zip code is too long';
    } else {
      sanitized.zipCode = data.zipCode ? data.zipCode.trim() : data.zipCode;
    }
  }
  
  // If no valid fields provided at all
  if (Object.keys(sanitized).length === 0) {
    logger.warn('Profile update validation failed: No valid fields provided');
    throw new ValidationError('At least one valid field must be provided for update');
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    logger.warn('Profile update validation failed', { 
      fieldErrors: errors,
      providedFields: Object.keys(data)
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}