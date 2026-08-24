import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

/**
 * Basic server health check.
 * Checks that the Express server is up and responsive.
 * Does NOT query the database.
 */
export const getHealth = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'forge-api',
  });
};

/**
 * Database health check.
 * Checks that the Express server can communicate with PostgreSQL via Prisma.
 */
export const getDbHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Perform a lightweight query to test the database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      service: 'forge-api',
      database: 'connected',
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    res.status(503).json({
      status: 'error',
      service: 'forge-api',
      database: 'disconnected',
    });
  }
};
