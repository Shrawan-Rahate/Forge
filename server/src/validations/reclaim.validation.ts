import { ValidationResult } from './mission.validation.js';

/**
 * Validates request body for creating a recovery task
 */
export const validateCreateRecoveryTaskInput = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const payload = data as Record<string, unknown>;

  // 1. Validate title
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
    errors.push('title is required and must be a non-empty string');
  }

  // 2. Validate points (required positive integer > 0)
  if (payload.points === undefined || payload.points === null) {
    errors.push('points is required');
  } else if (typeof payload.points !== 'number' || !Number.isInteger(payload.points) || payload.points <= 0) {
    errors.push('points must be a positive integer greater than 0');
  }

  // 3. Validate description (optional)
  if (payload.description !== undefined && payload.description !== null && typeof payload.description !== 'string') {
    errors.push('description must be a string if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
