import { Router } from 'express';
import { getHealth, getDbHealth } from '../controllers/health.controller.js';

const healthRouter = Router();

// GET /api/v1/health - Basic server health check
healthRouter.get('/health', getHealth);

// GET /api/v1/health/db - Database connectivity health check
healthRouter.get('/health/db', getDbHealth);

export default healthRouter;
