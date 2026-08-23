import { Router } from 'express';
import healthRouter from './health.routes.js';

const apiRouter = Router();

// Mount sub-routers
apiRouter.use('/', healthRouter);

export default apiRouter;
