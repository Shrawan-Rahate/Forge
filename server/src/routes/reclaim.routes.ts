import { Router } from 'express';
import {
  startReclaim,
  getReclaimStatus,
  createRecoveryTask,
  completeRecoveryTask,
} from '../controllers/reclaim.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const reclaimRouter = Router();

// Milestone-scoped reclaim endpoints (Protected by authenticate)
reclaimRouter.post('/milestones/:milestoneId/reclaim', authenticate, startReclaim);
reclaimRouter.get('/milestones/:milestoneId/reclaim', authenticate, getReclaimStatus);
reclaimRouter.post('/milestones/:milestoneId/reclaim/tasks', authenticate, createRecoveryTask);

// Task-scoped recovery endpoint (Protected by authenticate)
reclaimRouter.patch('/reclaim/tasks/:taskId/complete', authenticate, completeRecoveryTask);

export default reclaimRouter;
