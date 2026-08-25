import { Router } from 'express';
import { createMission, getMissionProgress } from '../controllers/mission.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const missionRouter = Router();

// POST /api/v1/missions - Create a new Mission for the authenticated user
missionRouter.post('/', authenticate, createMission);

// GET /api/v1/missions/:missionId/progress - Get time-enemy progress for a mission
missionRouter.get('/:missionId/progress', authenticate, getMissionProgress);

export default missionRouter;
