/**
 * User input validation module
 * Handles validation for user-related operations beyond authentication
 */
import { logger } from "../utils/logger.js";
import { ValidationError } from "./authValidator.js";

/**
 * Validate user preferences
 * @param {Object} data - User preferences data
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
export function validateUserPreferences(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate currency preference
  if (data.currency !== undefined) {
    if (!data.currency) {
      errors.currency = 'Currency cannot be empty if provided';
    } else if (typeof data.currency !== 'string') {
      errors.currency = 'Currency must be a string';
    } else if (data.currency.trim().length > 3) {
      errors.currency = 'Currency code must be 3 characters or less';
    } else {
      sanitized.currency = data.currency.trim().toUpperCase();
    }
  }
  
  // Validate language preference
  if (data.language !== undefined) {
    if (!data.language) {
      errors.language = 'Language cannot be empty if provided';
    } else if (typeof data.language !== 'string') {
      errors.language = 'Language must be a string';
    } else if (data.language.trim().length > 10) {
      errors.language = 'Language code is too long';
    } else {
      sanitized.language = data.language.trim().toLowerCase();
    }
  }
  
  // Validate theme preference
  if (data.theme !== undefined) {
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(data.theme)) {
      errors.theme = 'Theme must be one of: light, dark, system';
    } else {
      sanitized.theme = data.theme;
    }
  }
  
  // Validate notification preferences
  if (data.notifications !== undefined) {
    if (typeof data.notifications !== 'boolean') {
      errors.notifications = 'Notifications setting must be a boolean';
    } else {
      sanitized.notifications = data.notifications;
    }
  }
  
  // Validate email notifications preference
  if (data.emailNotifications !== undefined) {
    if (typeof data.emailNotifications !== 'boolean') {
      errors.emailNotifications = 'Email notifications setting must be a boolean';
    } else {
      sanitized.emailNotifications = data.emailNotifications;
    }
  }
  
  // Validate date format preference
  if (data.dateFormat !== undefined) {
    const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
    if (!validDateFormats.includes(data.dateFormat)) {
      errors.dateFormat = 'Invalid date format';
    } else {
      sanitized.dateFormat = data.dateFormat;
    }
  }
  
  // Validate time format preference
  if (data.timeFormat !== undefined) {
    const validTimeFormats = ['12h', '24h'];
    if (!validTimeFormats.includes(data.timeFormat)) {
      errors.timeFormat = 'Time format must be 12h or 24h';
    } else {
      sanitized.timeFormat = data.timeFormat;
    }
  }
  
  // If no valid fields provided at all
  if (Object.keys(sanitized).length === 0) {
    logger.warn('User preferences validation failed: No valid fields provided');
    throw new ValidationError('At least one valid preference must be provided for update');
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    logger.warn('User preferences validation failed', { 
      fieldErrors: errors,
      providedFields: Object.keys(data)
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate user financial profile
 * @param {Object} data - Financial profile data
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
export function validateFinancialProfile(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate monthly income
  if (data.monthlyIncome !== undefined) {
    if (isNaN(Number(data.monthlyIncome)) || Number(data.monthlyIncome) < 0) {
      errors.monthlyIncome = 'Monthly income must be a valid non-negative number';
    } else {
      sanitized.monthlyIncome = Number(data.monthlyIncome);
    }
  }
  
  // Validate monthly budget
  if (data.monthlyBudget !== undefined) {
    if (isNaN(Number(data.monthlyBudget)) || Number(data.monthlyBudget) < 0) {
      errors.monthlyBudget = 'Monthly budget must be a valid non-negative number';
    } else {
      sanitized.monthlyBudget = Number(data.monthlyBudget);
    }
  }
  
  // Validate savings target
  if (data.savingsTarget !== undefined) {
    if (isNaN(Number(data.savingsTarget)) || Number(data.savingsTarget) < 0) {
      errors.savingsTarget = 'Savings target must be a valid non-negative number';
    } else {
      sanitized.savingsTarget = Number(data.savingsTarget);
    }
  }
  
  // Validate risk tolerance
  if (data.riskTolerance !== undefined) {
    const validRiskLevels = ['low', 'medium', 'high'];
    if (!validRiskLevels.includes(data.riskTolerance)) {
      errors.riskTolerance = 'Risk tolerance must be one of: low, medium, high';
    } else {
      sanitized.riskTolerance = data.riskTolerance;
    }
  }
  
  // Validate financial goals
  if (data.financialGoals !== undefined) {
    if (!Array.isArray(data.financialGoals)) {
      errors.financialGoals = 'Financial goals must be an array';
    } else {
      // Sanitize each goal
      const validGoals = [];
      let hasError = false;
      
      for (let i = 0; i < data.financialGoals.length; i++) {
        const goal = data.financialGoals[i];
        
        if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
          errors.financialGoals = `Goal at index ${i} is invalid`;
          hasError = true;
          break;
        }
        
        validGoals.push(goal.trim());
      }
      
      if (!hasError) {
        sanitized.financialGoals = validGoals;
      }
    }
  }
  
  // If no valid fields provided at all
  if (Object.keys(sanitized).length === 0) {
    logger.warn('Financial profile validation failed: No valid fields provided');
    throw new ValidationError('At least one valid field must be provided for update');
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    logger.warn('Financial profile validation failed', { 
      fieldErrors: errors,
      providedFields: Object.keys(data)
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate user activity filters
 * @param {Object} data - Activity filter data
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
export function validateActivityFilters(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate start date
  if (data.startDate !== undefined) {
    if (!data.startDate) {
      sanitized.startDate = null; // Allow clearing the start date
    } else {
      const dateObj = new Date(data.startDate);
      if (isNaN(dateObj.getTime())) {
        errors.startDate = 'Start date must be a valid date';
      } else {
        sanitized.startDate = dateObj.toISOString();
      }
    }
  }
  
  // Validate end date
  if (data.endDate !== undefined) {
    if (!data.endDate) {
      sanitized.endDate = null; // Allow clearing the end date
    } else {
      const dateObj = new Date(data.endDate);
      if (isNaN(dateObj.getTime())) {
        errors.endDate = 'End date must be a valid date';
      } else {
        sanitized.endDate = dateObj.toISOString();
      }
    }
  }
  
  // Validate category filters
  if (data.categories !== undefined) {
    if (!Array.isArray(data.categories)) {
      errors.categories = 'Categories must be an array';
    } else {
      sanitized.categories = data.categories.filter(cat => 
        cat && typeof cat === 'string' && cat.trim().length > 0
      ).map(cat => cat.trim());
    }
  }
  
  // Validate transaction type filter
  if (data.transactionType !== undefined) {
    const validTypes = ['ALL', 'INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT'];
    if (!data.transactionType || !validTypes.includes(data.transactionType.toUpperCase())) {
      errors.transactionType = 'Transaction type must be one of: ALL, INCOME, EXPENSE, TRANSFER, INVESTMENT';
    } else {
      sanitized.transactionType = data.transactionType.toUpperCase();
    }
  }
  
  // Validate amount range
  if (data.minAmount !== undefined) {
    if (data.minAmount === null) {
      sanitized.minAmount = null;
    } else if (isNaN(Number(data.minAmount))) {
      errors.minAmount = 'Minimum amount must be a valid number';
    } else {
      sanitized.minAmount = Number(data.minAmount);
    }
  }
  
  if (data.maxAmount !== undefined) {
    if (data.maxAmount === null) {
      sanitized.maxAmount = null;
    } else if (isNaN(Number(data.maxAmount))) {
      errors.maxAmount = 'Maximum amount must be a valid number';
    } else {
      sanitized.maxAmount = Number(data.maxAmount);
    }
  }
  
  // Check if min is greater than max
  if (sanitized.minAmount !== undefined && sanitized.maxAmount !== undefined) {
    if (sanitized.minAmount !== null && sanitized.maxAmount !== null && 
        sanitized.minAmount > sanitized.maxAmount) {
      errors.minAmount = 'Minimum amount cannot be greater than maximum amount';
    }
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    logger.warn('Activity filters validation failed', { 
      fieldErrors: errors,
      providedFields: Object.keys(data)
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate user password change
 * @param {Object} data - Password change data
 * @returns {Object} - Validated data
 * @throws {ValidationError} - If validation fails
 */
export function validatePasswordChange(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate current password
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  } else {
    sanitized.currentPassword = data.currentPassword;
  }
  
  // Validate new password
  if (!data.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (data.newPassword.length < 8) {
    errors.newPassword = 'New password must be at least 8 characters long';
  } else if (data.newPassword.length > 100) {
    errors.newPassword = 'New password cannot exceed 100 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
    errors.newPassword = 'New password must contain at least one uppercase letter, one lowercase letter, and one number';
  } else {
    sanitized.newPassword = data.newPassword;
  }
  
  // Validate password confirmation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Password confirmation is required';
  } else if (data.newPassword && data.confirmPassword !== data.newPassword) {
    errors.confirmPassword = 'Password confirmation must match the new password';
  } else if (data.newPassword) {
    sanitized.confirmPassword = data.confirmPassword;
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    logger.warn('Password change validation failed', { 
      fieldErrors: errors,
      hasCurrentPassword: !!data.currentPassword,
      hasNewPassword: !!data.newPassword,
      hasConfirmPassword: !!data.confirmPassword
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}

/**
 * Validate account settings
 * @param {Object} data - Account settings data
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
export function validateAccountSettings(data) {
  const errors = {};
  const sanitized = {};
  
  // Validate 2FA setting
  if (data.twoFactorEnabled !== undefined) {
    if (typeof data.twoFactorEnabled !== 'boolean') {
      errors.twoFactorEnabled = 'Two-factor authentication setting must be a boolean';
    } else {
      sanitized.twoFactorEnabled = data.twoFactorEnabled;
    }
  }
  
  // Validate account privacy
  if (data.accountPrivacy !== undefined) {
    const validPrivacySettings = ['public', 'private', 'friends'];
    if (!validPrivacySettings.includes(data.accountPrivacy)) {
      errors.accountPrivacy = 'Account privacy must be one of: public, private, friends';
    } else {
      sanitized.accountPrivacy = data.accountPrivacy;
    }
  }
  
  // Validate login notification setting
  if (data.loginNotifications !== undefined) {
    if (typeof data.loginNotifications !== 'boolean') {
      errors.loginNotifications = 'Login notifications setting must be a boolean';
    } else {
      sanitized.loginNotifications = data.loginNotifications;
    }
  }
  
  // Validate data sharing preferences
  if (data.dataSharing !== undefined) {
    if (typeof data.dataSharing !== 'boolean') {
      errors.dataSharing = 'Data sharing setting must be a boolean';
    } else {
      sanitized.dataSharing = data.dataSharing;
    }
  }
  
  // Validate email notification frequency
  if (data.emailNotificationFrequency !== undefined) {
    const validFrequencies = ['daily', 'weekly', 'monthly', 'never'];
    if (!validFrequencies.includes(data.emailNotificationFrequency)) {
      errors.emailNotificationFrequency = 'Email notification frequency must be one of: daily, weekly, monthly, never';
    } else {
      sanitized.emailNotificationFrequency = data.emailNotificationFrequency;
    }
  }
  
  // Validate security questions (if implemented)
  if (data.securityQuestions !== undefined) {
    if (!Array.isArray(data.securityQuestions)) {
      errors.securityQuestions = 'Security questions must be an array';
    } else if (data.securityQuestions.length > 0) {
      const validatedQuestions = [];
      let hasError = false;
      
      for (let i = 0; i < data.securityQuestions.length; i++) {
        const question = data.securityQuestions[i];
        
        if (!question || typeof question !== 'object') {
          errors.securityQuestions = `Question at index ${i} is invalid`;
          hasError = true;
          break;
        }
        
        if (!question.question || typeof question.question !== 'string' || question.question.trim().length === 0) {
          errors.securityQuestions = `Question text at index ${i} is invalid`;
          hasError = true;
          break;
        }
        
        if (!question.answer || typeof question.answer !== 'string' || question.answer.trim().length === 0) {
          errors.securityQuestions = `Answer at index ${i} is invalid`;
          hasError = true;
          break;
        }
        
        validatedQuestions.push({
          question: question.question.trim(),
          answer: question.answer.trim()
        });
      }
      
      if (!hasError) {
        sanitized.securityQuestions = validatedQuestions;
      }
    } else {
      sanitized.securityQuestions = [];
    }
  }
  
  // If no valid fields provided at all
  if (Object.keys(sanitized).length === 0) {
    logger.warn('Account settings validation failed: No valid fields provided');
    throw new ValidationError('At least one valid setting must be provided for update');
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    logger.warn('Account settings validation failed', { 
      fieldErrors: errors,
      providedFields: Object.keys(data)
    });
    throw new ValidationError('Validation failed', errors);
  }
  
  return sanitized;
}