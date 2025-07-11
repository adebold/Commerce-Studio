import { RedisClientType } from 'redis';
import { getRedisClient } from '../../infrastructure/redis';
import { logger } from '../../utils/logger';

export class RedisService {
  private redis: RedisClientType;

  constructor() {
    // Use existing Redis connection from infrastructure
    this.redis = getRedisClient();
  }

  /**
   * Get value from Redis
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      logger.error({ error, key }, 'Error getting value from Redis');
      return null;
    }
  }

  /**
   * Set value in Redis
   */
  async set(key: string, value: string): Promise<void> {
    try {
      await this.redis.set(key, value);
    } catch (error) {
      logger.error({ error, key }, 'Error setting value in Redis');
      throw error;
    }
  }

  /**
   * Set value in Redis with expiration
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    try {
      await this.redis.set(key, value, { EX: seconds });
    } catch (error) {
      logger.error({ error, key, seconds }, 'Error setting value with expiration in Redis');
      throw error;
    }
  }

  /**
   * Delete key from Redis
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Error deleting key from Redis');
      throw error;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (error) {
      logger.error({ error, pattern }, 'Error deleting keys by pattern from Redis');
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error({ error, key }, 'Error checking if key exists in Redis');
      return false;
    }
  }

  /**
   * Add item to set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sAdd(key, members);
    } catch (error) {
      logger.error({ error, key, members }, 'Error adding to set in Redis');
      throw error;
    }
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.sMembers(key);
    } catch (error) {
      logger.error({ error, key }, 'Error getting set members from Redis');
      return [];
    }
  }

  /**
   * Add item to list
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redis.lPush(key, values);
    } catch (error) {
      logger.error({ error, key, values }, 'Error pushing to list in Redis');
      throw error;
    }
  }

  /**
   * Get list items
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redis.lRange(key, start, stop);
    } catch (error) {
      logger.error({ error, key, start, stop }, 'Error getting list range from Redis');
      return [];
    }
  }

  /**
   * Trim list to specified length
   */
  async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.redis.lTrim(key, start, stop);
    } catch (error) {
      logger.error({ error, key, start, stop }, 'Error trimming list in Redis');
      throw error;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      logger.error({ error, key }, 'Error incrementing counter in Redis');
      throw error;
    }
  }

  /**
   * Set expiration for key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      logger.error({ error, key, seconds }, 'Error setting expiration in Redis');
      throw error;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error({ error, key }, 'Error getting TTL from Redis');
      return -1;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error({ error }, 'Error closing Redis connection');
    }
  }
}