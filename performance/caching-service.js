/**
 * @fileoverview Advanced caching service for avatar assets, conversation context, and user profiles.
 * Implements a multi-level caching strategy using Redis, CDN, and browser cache.
 * @module performance/caching-service
 */

const redis = require('redis');
const { promisify } = require('util');

/**
 * CachingService configuration.
 * @typedef {object} CachingServiceConfig
 * @property {string} redisUrl - The URL for the Redis server.
 * @property {number} defaultTtl - Default Time-To-Live for cache entries in seconds.
 * @property {number} longTtl - Long Time-To-Live for static assets.
 */

class CachingService {
    /**
     * Initializes the CachingService.
     * @param {CachingServiceConfig} config - Caching service configuration.
     */
    constructor(config) {
        this.config = {
            redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
            defaultTtl: process.env.CACHE_DEFAULT_TTL || 3600, // 1 hour
            longTtl: process.env.CACHE_LONG_TTL || 86400, // 24 hours
            ...config,
        };

        this.redisClient = redis.createClient({ url: this.config.redisUrl });
        this.redisClient.on('error', (err) => console.error('Redis Client Error', err));

        this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
        this.setAsync = promisify(this.redisClient.setex).bind(this.redisClient);
        this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);

        console.log('CachingService initialized.');
    }

    /**
     * Retrieves an item from the cache.
     * It checks Redis first. If not found, it will return null.
     * The caller is responsible for fetching from the source and caching it.
     * @param {string} key - The cache key.
     * @returns {Promise<object|null>} The cached item, or null if not found.
     */
    async get(key) {
        try {
            const data = await this.getAsync(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error getting cache for key: ${key}`, error);
            // Fallback: return null on error to prevent system failure
            return null;
        }
    }

    /**
     * Caches an item in Redis.
     * @param {string} key - The cache key.
     * @param {object} value - The value to cache. Must be JSON serializable.
     * @param {number} [ttl] - Optional Time-To-Live in seconds. Defaults to `defaultTtl`.
     * @returns {Promise<void>}
     */
    async set(key, value, ttl) {
        const ttlInSeconds = ttl || this.config.defaultTtl;
        try {
            await this.setAsync(key, ttlInSeconds, JSON.stringify(value));
        } catch (error)
        {
            console.error(`Error setting cache for key: ${key}`, error);
            // Graceful degradation: continue without caching if Redis fails
        }
    }

    /**
     * Deletes an item from the cache.
     * @param {string} key - The cache key.
     * @returns {Promise<void>}
     */
    async invalidate(key) {
        try {
            await this.delAsync(key);
        } catch (error) {
            console.error(`Error invalidating cache for key: ${key}`, error);
        }
    }

    /**
     * Sets appropriate cache headers for HTTP responses for CDN and browser caching.
     * @param {object} res - The Express response object.
     * @param {object} options - Caching options.
     * @param {string} options.level - Cache level ('public', 'private').
     * @param {number} options.ttl - Time-To-Live in seconds.
     * @param {string} [options.etag] - ETag for validation.
     */
    setCacheHeaders(res, { level = 'private', ttl, etag }) {
        if (process.env.NODE_ENV === 'development') {
            res.set('Cache-Control', 'no-store');
            return;
        }
        
        const cacheControl = [];
        cacheControl.push(level);
        cacheControl.push(`max-age=${ttl}`);
        cacheControl.push('must-revalidate'); // Ensures revalidation with origin server

        res.set('Cache-Control', cacheControl.join(', '));
        if (etag) {
            res.set('ETag', etag);
        }
    }

    /**
     * Middleware for caching responses.
     * @param {number} ttl - Time-To-Live in seconds.
     * @param {object} options - Options for caching.
     * @param {boolean} [options.isPublic=false] - Whether the content is public.
     * @returns {function} Express middleware.
     */
    cacheResponse(ttl, { isPublic = false } = {}) {
        return async (req, res, next) => {
            const key = `response-${req.originalUrl}`;
            try {
                const cachedResponse = await this.get(key);
                if (cachedResponse) {
                    this.setCacheHeaders(res, { level: isPublic ? 'public' : 'private', ttl });
                    return res.json(cachedResponse);
                }

                const originalJson = res.json.bind(res);
                res.json = (body) => {
                    this.set(key, body, ttl);
                    this.setCacheHeaders(res, { level: isPublic ? 'public' : 'private', ttl });
                    originalJson(body);
                };
                next();
            } catch (error) {
                console.error('Cache middleware error:', error);
                next(); // Proceed without caching on error
            }
        };
    }

    /**
     * Gracefully disconnects from Redis.
     */
    disconnect() {
        this.redisClient.quit();
        console.log('CachingService disconnected from Redis.');
    }
}

// Singleton instance
const cachingService = new CachingService();

module.exports = cachingService;