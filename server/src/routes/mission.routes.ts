import { Router } from 'express';
import { createMission } from '../controllers/mission.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const missionRouter = Router();

// POST /api/v1/missions - Create a new Mission for the authenticated user
missionRouter.post('/', authenticate, createMission);

export default missionRouter;
