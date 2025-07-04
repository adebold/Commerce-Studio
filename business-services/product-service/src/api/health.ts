import express from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../infrastructure/redis';
import { config } from '../config';
import { logger } from '../utils/logger';

// Create router
export const healthRouter = express.Router();

// Health check endpoint
healthRouter.get('/', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection
    let redisStatus = 'disconnected';
    try {
      const redisClient = getRedisClient();
      const pingResult = await redisClient.ping();
      redisStatus = pingResult === 'PONG' ? 'connected' : 'disconnected';
    } catch (err) {
      logger.error({ err }, 'Redis health check failed');
    }
    
    // Build health response
    const health = {
      status: 'UP',
      service: config.serviceName,
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      environment: config.environment,
      instance: config.instanceId,
      dependencies: {
        mongodb: {
          status: mongoStatus === 'connected' ? 'UP' : 'DOWN',
          details: {
            connection: mongoStatus,
          },
        },
        redis: {
          status: redisStatus === 'connected' ? 'UP' : 'DOWN',
          details: {
            connection: redisStatus,
          },
        },
      },
    };
    
    // Set status code based on dependency health
    const isHealthy = health.dependencies.mongodb.status === 'UP' && 
                      health.dependencies.redis.status === 'UP';
    
    res.status(isHealthy ? 200 : 503).json(health);
  } catch (err) {
    logger.error({ err }, 'Health check failed');
    res.status(500).json({
      status: 'DOWN',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      error: {
        message: 'Health check failed',
      },
    });
  }
});

// Liveness probe endpoint
healthRouter.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe endpoint
healthRouter.get('/readiness', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection
    let redisStatus = 'disconnected';
    try {
      const redisClient = getRedisClient();
      const pingResult = await redisClient.ping();
      redisStatus = pingResult === 'PONG' ? 'connected' : 'disconnected';
    } catch (err) {
      logger.error({ err }, 'Redis health check failed');
    }
    
    // Check if service is ready
    const isReady = mongoStatus === 'connected' && redisStatus === 'connected';
    
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'UP' : 'DOWN',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      details: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Readiness check failed');
    res.status(500).json({
      status: 'DOWN',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      error: {
        message: 'Readiness check failed',
      },
    });
  }
});