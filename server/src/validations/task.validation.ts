import { ValidationResult } from './mission.validation.js';

/**
 * Validates request body for creating a task
 */
export const validateCreateTaskInput = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const payload = data as Record<string, unknown>;

  // 1. Validate title
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
    errors.push('title is required and must be a non-empty string');
  }

  // 2. Validate points (optional, default 1 in schema)
  if (payload.points !== undefined && payload.points !== null) {
    if (typeof payload.points !== 'number' || !Number.isInteger(payload.points) || payload.points <= 0) {
      errors.push('points must be a positive integer greater than 0');
    }
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

/**
 * Validates request body for updating a task
 */
export const validateUpdateTaskInput = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const payload = data as Record<string, unknown>;

  const hasTitle = payload.title !== undefined;
  const hasDescription = payload.description !== undefined;
  const hasPoints = payload.points !== undefined;

  if (!hasTitle && !hasDescription && !hasPoints) {
    errors.push('At least one field (title, description, points) must be provided for update');
  }

  // 1. Validate title if provided
  if (hasTitle) {
    if (typeof payload.title !== 'string' || payload.title.trim() === '') {
      errors.push('title must be a non-empty string');
    }
  }

  // 2. Validate points if provided
  if (hasPoints) {
    if (typeof payload.points !== 'number' || !Number.isInteger(payload.points) || payload.points <= 0) {
      errors.push('points must be a positive integer greater than 0');
    }
  }

  // 3. Validate description if provided
  if (hasDescription && payload.description !== null && typeof payload.description !== 'string') {
    errors.push('description must be a string or null');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
