import { Router } from 'express';
import { createMission, getMissions, getMissionProgress, getMissionState } from '../controllers/mission.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const missionRouter = Router();

// GET /api/v1/missions - Get all missions for the authenticated user
missionRouter.get('/', authenticate, getMissions);

// POST /api/v1/missions - Create a new Mission for the authenticated user
missionRouter.post('/', authenticate, createMission);

// GET /api/v1/missions/:missionId/progress - Get time-enemy progress for a mission
missionRouter.get('/:missionId/progress', authenticate, getMissionProgress);

// GET /api/v1/missions/:missionId/state - Evaluate and get mission milestone states
missionRouter.get('/:missionId/state', authenticate, getMissionState);

export default missionRouter;
