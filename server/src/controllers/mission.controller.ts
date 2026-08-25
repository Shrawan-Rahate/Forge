import { Request, Response } from 'express';
import { validateCreateMissionInput, CreateMissionInput } from '../validations/mission.validation.js';
import * as missionService from '../services/mission.service.js';
import { UserNotFoundError, MissionNotFoundError } from '../services/mission.service.js';

/**
 * Controller to handle POST /api/v1/missions
 * Protected route: derives user identity from req.user.userId
 */
export const createMission = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Ensure authenticated user is present
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        status: 'fail',
        message: 'Authentication required. User not identified.',
      });
      return;
    }

    // 2. Validate request body
    const validation = validateCreateMissionInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    // 3. Delegate creation to service using the authenticated userId
    const mission = await missionService.createMission(userId, req.body as CreateMissionInput);

    // 4. Return 201 Created with mission payload
    res.status(201).json({
      status: 'success',
      data: {
        mission,
      },
    });
  } catch (error: unknown) {
    if (error instanceof UserNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Mission Controller] Error creating mission:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while creating the mission.',
    });
  }
};

/**
 * Controller to handle GET /api/v1/missions/:missionId/progress
 */
export const getMissionProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        status: 'fail',
        message: 'Authentication required. User not identified.',
      });
      return;
    }

    const { missionId } = req.params;
    if (!missionId || typeof missionId !== 'string') {
      res.status(400).json({
        status: 'fail',
        message: 'missionId parameter is required.',
      });
      return;
    }

    const progressData = await missionService.getMissionProgress(userId, missionId);

    res.status(200).json({
      status: 'success',
      data: progressData,
    });
  } catch (error: unknown) {
    if (error instanceof MissionNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Mission Controller] Error calculating mission progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while calculating mission progress.',
    });
  }
};

/**
 * Controller to handle GET /api/v1/missions/:missionId/state
 */
export const getMissionState = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        status: 'fail',
        message: 'Authentication required. User not identified.',
      });
      return;
    }

    const { missionId } = req.params;
    if (!missionId || typeof missionId !== 'string') {
      res.status(400).json({
        status: 'fail',
        message: 'missionId parameter is required.',
      });
      return;
    }

    const stateData = await missionService.evaluateAndGetMissionState(userId, missionId);

    res.status(200).json({
      status: 'success',
      data: stateData,
    });
  } catch (error: unknown) {
    if (error instanceof MissionNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Mission Controller] Error evaluating mission state:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while evaluating mission state.',
    });
  }
};

/**
 * Controller to handle GET /api/v1/missions
 * Protected route: returns all missions owned by req.user.userId
 */
export const getMissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        status: 'fail',
        message: 'Authentication required. User not identified.',
      });
      return;
    }

    const missions = await missionService.getUserMissions(userId);

    res.status(200).json({
      status: 'success',
      data: {
        missions,
      },
    });
  } catch (error: unknown) {
    console.error('[Mission Controller] Error fetching user missions:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while fetching missions.',
    });
  }
};
