import { Router, Request, Response } from 'express';

const healthRouter = Router();

/**
 * Liveness probe — indicates the process is running and can accept traffic.
 * Used by Kubernetes / Docker health checks. Returns minimal information.
 *
 * GET /health/live
 */
healthRouter.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

/**
 * Readiness probe — indicates the application is ready to serve requests.
 * In a future sprint, this will include database connectivity checks.
 *
 * GET /health/ready
 *
 * TODO: Add database connectivity check once Prisma is connected.
 */
healthRouter.get('/ready', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

export { healthRouter };
