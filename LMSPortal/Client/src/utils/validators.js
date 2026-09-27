/**
 * Standard Form Validation Utilities for NOVA LMS
 */

export const validateEmail = (email) => {
  if (!email || !String(email).trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validatePassword = (password, { minLength = 6 } = {}) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  return null;
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${fieldName} is required.`;
  }
  return null;
};

export const validateUrl = (url, { required = false } = {}) => {
  if (!url || !String(url).trim()) {
    return required ? 'URL is required.' : null;
  }
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Please enter a valid web URL.';
  }
};

export const validateNumber = (value, { min = null, max = null, fieldName = 'Value' } = {}) => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} is required.`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number.`;
  }
  if (min !== null && num < min) {
    return `${fieldName} cannot be less than ${min}.`;
  }
  if (max !== null && num > max) {
    return `${fieldName} cannot exceed ${max}.`;
  }
  return null;
};

/**
 * Validates a form state object against a map of rule definitions
 * @param {Object} data - Key-value pair form state
 * @param {Object} rules - Map of field name to validator function(s)
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.entries(rules).forEach(([field, validator]) => {
    const value = data[field];
    if (typeof validator === 'function') {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    } else if (Array.isArray(validator)) {
      for (const fn of validator) {
        const error = fn(value);
        if (error) {
          errors[field] = error;
          isValid = false;
          break;
        }
      }
    }
  });

  return { isValid, errors };
};

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateUrl,
  validateNumber,
  validateForm,
};
