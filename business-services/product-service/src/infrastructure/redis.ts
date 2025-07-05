import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

// Redis client
let redisClient: RedisClientType;

// Connect to Redis
export const connectToRedis = async (): Promise<void> => {
  try {
    // Create Redis client
    redisClient = createClient({
      url: config.redis.uri,
      socket: {
        connectTimeout: config.redis.options.connectTimeout,
      },
    });

    // Set up event handlers
    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis client error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    // Connect to Redis
    await redisClient.connect();
    
    // Log successful connection
    logger.info('Connected to Redis');
    
    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await redisClient.quit();
        logger.info('Redis connection closed due to application termination');
      } catch (err) {
        logger.error({ err }, 'Error closing Redis connection');
      }
    });
    
  } catch (err) {
    logger.error({ err }, 'Failed to connect to Redis');
    throw err;
  }
};

// Get Redis client
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Close Redis connection
export const closeRedisConnection = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (err) {
    logger.error({ err }, 'Error closing Redis connection');
    throw err;
  }
};

// Cache middleware
export const cacheMiddleware = (ttl: number = 3600) => {
  return async (req: any, res: any, next: any) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        // Return cached data
        const data = JSON.parse(cachedData);
        return res.json(data);
      }

      // Store original send method
      const originalSend = res.send;

      // Override send method
      res.send = async function(body: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            await redisClient.set(key, body, { EX: ttl });
          } catch (err) {
            logger.error({ err }, 'Error setting cache');
          }
        }

        // Call original send method
        return originalSend.call(this, body);
      };

      next();
    } catch (err) {
      logger.error({ err }, 'Error in cache middleware');
      next();
    }
  };
};