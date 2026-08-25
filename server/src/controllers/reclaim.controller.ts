import { Request, Response } from 'express';
import * as reclaimService from '../services/reclaim.service.js';
import {
  InvalidReclaimStateError,
  ReclaimLogNotFoundError,
  RecoveryTaskNotFoundError,
} from '../services/reclaim.service.js';
import { MilestoneNotFoundError } from '../services/task.service.js';
import { validateCreateRecoveryTaskInput } from '../validations/reclaim.validation.js';
import { CreateRecoveryTaskInput } from '../types/reclaim.types.js';

/**
 * Handles POST /api/v1/milestones/:milestoneId/reclaim
 */
export const startReclaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Authentication required.' });
      return;
    }

    const { milestoneId } = req.params;
    if (!milestoneId || typeof milestoneId !== 'string') {
      res.status(400).json({ status: 'fail', message: 'milestoneId parameter is required.' });
      return;
    }

    const result = await reclaimService.startReclaim(userId, milestoneId);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof MilestoneNotFoundError) {
      res.status(404).json({ status: 'fail', message: error.message });
      return;
    }
    if (error instanceof InvalidReclaimStateError) {
      res.status(400).json({ status: 'fail', message: error.message });
      return;
    }

    console.error('[Reclaim Controller] Error starting reclaim:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while starting reclaim.',
    });
  }
};

/**
 * Handles GET /api/v1/milestones/:milestoneId/reclaim
 */
export const getReclaimStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Authentication required.' });
      return;
    }

    const { milestoneId } = req.params;
    if (!milestoneId || typeof milestoneId !== 'string') {
      res.status(400).json({ status: 'fail', message: 'milestoneId parameter is required.' });
      return;
    }

    const result = await reclaimService.getReclaimStatus(userId, milestoneId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof MilestoneNotFoundError || error instanceof ReclaimLogNotFoundError) {
      res.status(404).json({ status: 'fail', message: error.message });
      return;
    }

    console.error('[Reclaim Controller] Error getting reclaim status:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while fetching reclaim status.',
    });
  }
};

/**
 * Handles POST /api/v1/milestones/:milestoneId/reclaim/tasks
 */
export const createRecoveryTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Authentication required.' });
      return;
    }

    const { milestoneId } = req.params;
    if (!milestoneId || typeof milestoneId !== 'string') {
      res.status(400).json({ status: 'fail', message: 'milestoneId parameter is required.' });
      return;
    }

    const validation = validateCreateRecoveryTaskInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const task = await reclaimService.createRecoveryTask(userId, milestoneId, req.body as CreateRecoveryTaskInput);

    res.status(201).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: unknown) {
    if (error instanceof MilestoneNotFoundError || error instanceof ReclaimLogNotFoundError) {
      res.status(404).json({ status: 'fail', message: error.message });
      return;
    }
    if (error instanceof InvalidReclaimStateError) {
      res.status(400).json({ status: 'fail', message: error.message });
      return;
    }

    console.error('[Reclaim Controller] Error creating recovery task:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while creating recovery task.',
    });
  }
};

/**
 * Handles PATCH /api/v1/reclaim/tasks/:taskId/complete
 */
export const completeRecoveryTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Authentication required.' });
      return;
    }

    const { taskId } = req.params;
    if (!taskId || typeof taskId !== 'string') {
      res.status(400).json({ status: 'fail', message: 'taskId parameter is required.' });
      return;
    }

    const result = await reclaimService.completeRecoveryTask(userId, taskId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof RecoveryTaskNotFoundError) {
      res.status(404).json({ status: 'fail', message: error.message });
      return;
    }

    console.error('[Reclaim Controller] Error completing recovery task:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while completing recovery task.',
    });
  }
};
