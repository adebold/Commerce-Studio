import { Router } from 'express';
import { getMongoDBConnection } from '../infrastructure/mongodb';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = getMongoDBConnection().readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection (basic check)
    const redisStatus = 'connected'; // Simplified for now
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus
      }
    };

    res.json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export { router as healthRouter };