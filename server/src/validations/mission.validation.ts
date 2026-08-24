export interface CreateMilestoneInput {
  title: string;
  description?: string;
}

export interface CreateMissionInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  milestones: CreateMilestoneInput[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates the incoming request body for creating a mission.
 * Ensures required fields, valid dates, date chronological order,
 * and exact milestone count.
 * (userId is not expected in the request body as it is derived from the authenticated JWT)
 */
export const validateCreateMissionInput = (data: unknown): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const payload = data as Record<string, unknown>;

  // 1. Validate title
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
    errors.push('title is required and must be a non-empty string');
  }

  // 2. Validate startDate
  let validStartDate: Date | null = null;
  if (!payload.startDate || typeof payload.startDate !== 'string') {
    errors.push('startDate is required and must be a valid ISO date string');
  } else {
    const timestamp = Date.parse(payload.startDate);
    if (isNaN(timestamp)) {
      errors.push('startDate must be a valid date');
    } else {
      validStartDate = new Date(timestamp);
    }
  }

  // 3. Validate endDate
  let validEndDate: Date | null = null;
  if (!payload.endDate || typeof payload.endDate !== 'string') {
    errors.push('endDate is required and must be a valid ISO date string');
  } else {
    const timestamp = Date.parse(payload.endDate);
    if (isNaN(timestamp)) {
      errors.push('endDate must be a valid date');
    } else {
      validEndDate = new Date(timestamp);
    }
  }

  // 4. Validate startDate < endDate
  if (validStartDate && validEndDate && validStartDate >= validEndDate) {
    errors.push('startDate must be before endDate');
  }

  // 5. Validate milestones array
  if (!Array.isArray(payload.milestones)) {
    errors.push('milestones is required and must be an array of exactly 6 items');
  } else if (payload.milestones.length !== 6) {
    errors.push(`milestones must contain exactly 6 items, received ${payload.milestones.length}`);
  } else {
    // 6. Validate each milestone title
    payload.milestones.forEach((milestone: unknown, index: number) => {
      if (!milestone || typeof milestone !== 'object') {
        errors.push(`Milestone at position ${index + 1} must be an object`);
        return;
      }

      const m = milestone as Record<string, unknown>;
      if (!m.title || typeof m.title !== 'string' || m.title.trim() === '') {
        errors.push(`Milestone at position ${index + 1} must have a non-empty title`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
