import { Request, Response } from 'express';
import { validateCreateTaskInput, validateUpdateTaskInput } from '../validations/task.validation.js';
import * as taskService from '../services/task.service.js';
import { MilestoneNotFoundError, TaskNotFoundError } from '../services/task.service.js';
import { CreateTaskInput, UpdateTaskInput } from '../types/task.types.js';

/**
 * Handles POST /api/v1/milestones/:milestoneId/tasks
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
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

    const validation = validateCreateTaskInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const task = await taskService.createTask(userId, milestoneId, req.body as CreateTaskInput);

    res.status(201).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: unknown) {
    if (error instanceof MilestoneNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Task Controller] Error creating task:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while creating the task.',
    });
  }
};

/**
 * Handles GET /api/v1/milestones/:milestoneId/tasks
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
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

    const tasks = await taskService.getTasksByMilestone(userId, milestoneId);

    res.status(200).json({
      status: 'success',
      data: {
        tasks,
      },
    });
  } catch (error: unknown) {
    if (error instanceof MilestoneNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Task Controller] Error fetching tasks:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while fetching tasks.',
    });
  }
};

/**
 * Handles PATCH /api/v1/tasks/:taskId
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
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

    const validation = validateUpdateTaskInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const task = await taskService.updateTask(userId, taskId, req.body as UpdateTaskInput);

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: unknown) {
    if (error instanceof TaskNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Task Controller] Error updating task:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while updating the task.',
    });
  }
};

/**
 * Handles DELETE /api/v1/tasks/:taskId
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
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

    await taskService.deleteTask(userId, taskId);

    res.status(200).json({
      status: 'success',
      message: 'Task successfully deleted.',
    });
  } catch (error: unknown) {
    if (error instanceof TaskNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Task Controller] Error deleting task:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while deleting the task.',
    });
  }
};

/**
 * Handles PATCH /api/v1/tasks/:taskId/complete
 */
export const completeTask = async (req: Request, res: Response): Promise<void> => {
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

    const task = await taskService.completeTask(userId, taskId, true);

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: unknown) {
    if (error instanceof TaskNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Task Controller] Error completing task:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while completing the task.',
    });
  }
};

/**
 * Handles PATCH /api/v1/tasks/:taskId/uncomplete
 */
export const uncompleteTask = async (req: Request, res: Response): Promise<void> => {
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

    const task = await taskService.completeTask(userId, taskId, false);

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: unknown) {
    if (error instanceof TaskNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Task Controller] Error uncompleting task:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while uncompleting the task.',
    });
  }
};
