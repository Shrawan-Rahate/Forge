import { Router, Request, Response } from 'express';

const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'forge-api',
  });
});

export default healthRouter;
