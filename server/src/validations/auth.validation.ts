import { ValidationResult } from './mission.validation.js';

// Basic email regex pattern for format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates registration request payload
 */
export const validateRegisterInput = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const payload = data as Record<string, unknown>;

  // 1. Validate email
  if (!payload.email || typeof payload.email !== 'string' || payload.email.trim() === '') {
    errors.push('email is required and cannot be empty');
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.push('email must be a valid email address');
  }

  // 2. Validate password
  if (!payload.password || typeof payload.password !== 'string') {
    errors.push('password is required and must be a string');
  } else if (payload.password.length < 6) {
    errors.push('password must be at least 6 characters long');
  }

  // 3. Validate name (optional)
  if (payload.name !== undefined && payload.name !== null && typeof payload.name !== 'string') {
    errors.push('name must be a string if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates login request payload
 */
export const validateLoginInput = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const payload = data as Record<string, unknown>;

  // 1. Validate email
  if (!payload.email || typeof payload.email !== 'string' || payload.email.trim() === '') {
    errors.push('email is required and cannot be empty');
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.push('email must be a valid email address');
  }

  // 2. Validate password
  if (!payload.password || typeof payload.password !== 'string' || payload.password === '') {
    errors.push('password is required and cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
