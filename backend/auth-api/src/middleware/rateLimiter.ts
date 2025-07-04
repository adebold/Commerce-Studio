import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';
import { config } from '../config/index';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private static client: RedisClientType | null = null;

  /**
   * Initialize Redis connection for rate limiting
   */
  static async initialize(): Promise<void> {
    if (this.client) {
      return;
    }

    const clientConfig: any = {
      url: config.redis.url,
    };
    
    if (config.redis.password) {
      clientConfig.password = config.redis.password;
    }
    
    this.client = createClient(clientConfig);

    this.client.on('error', (err: Error) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Rate Limiter Redis Client Error:', err);
      }
    });

    try {
      await this.client.connect();
    } catch (error) {
      // In any environment, gracefully handle Redis connection failures
      this.client = null;
      console.warn('Redis not available, continuing without Redis rate limiting:', error);
    }
  }

  /**
   * Create rate limiting middleware
   */
  static createLimiter(options: RateLimitOptions) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!this.client) {
          console.warn('Rate limiter Redis client not initialized, skipping rate limiting');
          next();
          return;
        }

        const key = options.keyGenerator ? options.keyGenerator(req) : this.getDefaultKey(req);
        const windowMs = options.windowMs;
        const maxRequests = options.maxRequests;

        // Get current count
        const current = await this.client.get(key);
        const count = current ? parseInt(current, 10) : 0;

        if (count >= maxRequests) {
          // Rate limit exceeded
          const ttl = await this.client.ttl(key);
          const resetTime = new Date(Date.now() + (ttl * 1000));

          res.status(429).json({
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: ttl,
            resetTime: resetTime.toISOString(),
            limit: maxRequests,
            remaining: 0,
          });
          return;
        }

        // Increment counter
        const newCount = count + 1;
        const windowSeconds = Math.ceil(windowMs / 1000);

        if (count === 0) {
          // First request in window
          await this.client.setEx(key, windowSeconds, newCount.toString());
        } else {
          // Increment existing counter
          await this.client.incr(key);
        }

        // Add rate limit headers
        const ttl = await this.client.ttl(key);
        const resetTime = new Date(Date.now() + (ttl * 1000));

        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, maxRequests - newCount).toString(),
          'X-RateLimit-Reset': resetTime.toISOString(),
          'X-RateLimit-Window': windowMs.toString(),
        });

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Fail open - allow request if rate limiting fails
        next();
      }
    };
  }

  /**
   * Default key generator based on IP address
   */
  private static getDefaultKey(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const route = req.route?.path || req.path;
    return `rate_limit:${ip}:${route}`;
  }

  /**
   * Key generator for login attempts by email
   */
  static loginKeyGenerator(req: Request): string {
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `rate_limit:login:${email}:${ip}`;
  }

  /**
   * Key generator for general API requests by user ID
   */
  static userKeyGenerator(req: Request): string {
    const userId = req.user?._id || 'anonymous';
    const route = req.route?.path || req.path;
    return `rate_limit:user:${userId}:${route}`;
  }

  /**
   * Close Redis connection
   */
  static async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Login rate limiter - 5 attempts per 15 minutes per email/IP combination
export const loginRateLimiter = RateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: RateLimiter.loginKeyGenerator,
});

// General API rate limiter - 100 requests per minute per IP
export const apiRateLimiter = RateLimiter.createLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

// Strict rate limiter for sensitive operations - 10 requests per hour per user
export const strictRateLimiter = RateLimiter.createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  keyGenerator: RateLimiter.userKeyGenerator,
});

// Password reset rate limiter - 3 attempts per hour per email
export const passwordResetRateLimiter = RateLimiter.createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    return `rate_limit:password_reset:${email}`;
  },
});