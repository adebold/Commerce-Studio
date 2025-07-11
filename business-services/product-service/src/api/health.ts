import { Request, Response } from 'express';

/**
 * Health check endpoint for the product service
 */
export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'product-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
};

/**
 * Detailed health check with system information
 */
export const detailedHealthCheck = (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'healthy',
    service: 'product-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
};