import { Router } from 'express';
import healthRouter from './health.routes.js';
import missionRouter from './mission.routes.js';
import authRouter from './auth.routes.js';
import taskRouter from './task.routes.js';

const apiRouter = Router();

// Mount sub-routers
apiRouter.use('/', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/missions', missionRouter);
apiRouter.use('/', taskRouter);

export default apiRouter;
