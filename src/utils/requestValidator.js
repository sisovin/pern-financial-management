/**
 * Request Validator Utility
 * 
 * A flexible validation utility for Express request data.
 * Supports various data types and validation rules.
 */

/**
 * Validates a request body against a schema
 * @param {Object} data - The request data to validate (usually req.body, req.query, or req.params)
 * @param {Object} schema - The validation schema defining field types and constraints
 * @returns {Object} - { error, value } where error is null if validation passes
 */
export const validateRequest = (data, schema) => {
  const errors = {};
  const validatedData = {};

  // Check each field against the schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip validation for undefined optional fields
    if (value === undefined && !rules.required) {
      continue;
    }

    // Type validation
    if (value !== undefined && rules.type) {
      let isValid = true;
      let parsedValue = value;

      switch (rules.type) {
        case 'string':
          isValid = typeof value === 'string';
          break;
          
        case 'number':
          if (typeof value === 'number') {
            isValid = !isNaN(value);
          } else if (typeof value === 'string') {
            const parsed = Number(value);
            isValid = !isNaN(parsed);
            parsedValue = parsed;
          } else {
            isValid = false;
          }
          break;
          
        case 'integer':
          if (typeof value === 'number') {
            isValid = Number.isInteger(value);
          } else if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            isValid = !isNaN(parsed) && parsed.toString() === value;
            parsedValue = parsed;
          } else {
            isValid = false;
          }
          break;
          
        case 'boolean':
          if (typeof value === 'boolean') {
            isValid = true;
          } else if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') {
              parsedValue = true;
              isValid = true;
            } else if (value.toLowerCase() === 'false') {
              parsedValue = false;
              isValid = true;
            } else {
              isValid = false;
            }
          } else {
            isValid = false;
          }
          break;
          
        case 'date':
          if (value instanceof Date) {
            isValid = !isNaN(value.getTime());
          } else if (typeof value === 'string') {
            const date = new Date(value);
            isValid = !isNaN(date.getTime());
            parsedValue = date;
          } else {
            isValid = false;
          }
          break;
          
        case 'array':
          if (Array.isArray(value)) {
            isValid = true;
            // If itemType is provided, validate each item in the array
            if (rules.itemType) {
              const itemErrors = [];
              value.forEach((item, index) => {
                const itemValidation = validateSingleValue(item, rules.itemType);
                if (!itemValidation.isValid) {
                  itemErrors.push(`Item at index ${index}: ${itemValidation.error}`);
                }
              });
              if (itemErrors.length > 0) {
                errors[field] = itemErrors;
                continue;
              }
            }
          } else if (typeof value === 'string' && rules.parseJson) {
            try {
              const parsed = JSON.parse(value);
              isValid = Array.isArray(parsed);
              parsedValue = parsed;
            } catch (e) {
              isValid = false;
            }
          } else {
            isValid = false;
          }
          break;
          
        case 'object':
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            isValid = true;
          } else if (typeof value === 'string' && rules.parseJson) {
            try {
              const parsed = JSON.parse(value);
              isValid = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
              parsedValue = parsed;
            } catch (e) {
              isValid = false;
            }
          } else {
            isValid = false;
          }
          break;
          
        case 'email':
          isValid = typeof value === 'string' && validateEmail(value);
          break;
          
        case 'uuid':
          isValid = typeof value === 'string' && validateUUID(value);
          break;
          
        case 'enum':
          isValid = rules.values && rules.values.includes(value);
          if (!isValid) {
            errors[field] = `${field} must be one of: ${rules.values.join(', ')}`;
            continue;
          }
          break;
          
        default:
          isValid = true;
      }

      if (!isValid) {
        errors[field] = `${field} must be a valid ${rules.type}`;
        continue;
      }

      // Update with parsed value if applicable
      value = parsedValue;
    }

    // Length validation (for strings and arrays)
    if (value !== undefined && rules.minLength !== undefined) {
      if ((typeof value === 'string' || Array.isArray(value)) && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters long`;
        continue;
      }
    }

    if (value !== undefined && rules.maxLength !== undefined) {
      if ((typeof value === 'string' || Array.isArray(value)) && value.length > rules.maxLength) {
        errors[field] = `${field} cannot exceed ${rules.maxLength} characters`;
        continue;
      }
    }

    // Range validation (for numbers)
    if (value !== undefined && rules.min !== undefined) {
      if (typeof value === 'number' && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
        continue;
      }
    }

    if (value !== undefined && rules.max !== undefined) {
      if (typeof value === 'number' && value > rules.max) {
        errors[field] = `${field} cannot exceed ${rules.max}`;
        continue;
      }
    }

    // Pattern validation (for strings)
    if (value !== undefined && rules.pattern) {
      if (typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
        errors[field] = rules.patternMessage || `${field} format is invalid`;
        continue;
      }
    }

    // Custom validation function
    if (value !== undefined && rules.validate) {
      const customValidation = rules.validate(value);
      if (customValidation !== true) {
        errors[field] = customValidation || `${field} is invalid`;
        continue;
      }
    }

    // Add to validated data if field passed all validations
    validatedData[field] = value;
  }

  // Return validation result
  if (Object.keys(errors).length > 0) {
    return { error: errors, value: data };
  }

  return { error: null, value: validatedData };
};

/**
 * Helper function to validate a single value against a type
 * @param {any} value - The value to validate
 * @param {string} type - The expected type
 * @returns {Object} - { isValid, error }
 */
const validateSingleValue = (value, type) => {
  switch (type) {
    case 'string':
      return { isValid: typeof value === 'string', error: 'must be a string' };
    case 'number':
      return { isValid: typeof value === 'number' && !isNaN(value), error: 'must be a number' };
    case 'boolean':
      return { isValid: typeof value === 'boolean', error: 'must be a boolean' };
    case 'object':
      return { 
        isValid: typeof value === 'object' && value !== null && !Array.isArray(value),
        error: 'must be an object'
      };
    case 'array':
      return { isValid: Array.isArray(value), error: 'must be an array' };
    case 'email':
      return { isValid: typeof value === 'string' && validateEmail(value), error: 'must be a valid email' };
    case 'uuid':
      return { isValid: typeof value === 'string' && validateUUID(value), error: 'must be a valid UUID' };
    default:
      return { isValid: true, error: null };
  }
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
const validateEmail = (email) => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
};

/**
 * Validate UUID format
 * @param {string} uuid - The UUID to validate
 * @returns {boolean} - Whether the UUID is valid
 */
const validateUUID = (uuid) => {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(uuid);
};