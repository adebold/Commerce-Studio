const logger = require('../utils/logger');

// Simple in-memory rate limiter
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.max = options.max || 100;
    this.store = new Map();
    
    // Clean up old entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (now - data.resetTime > this.windowMs) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      
      let record = this.store.get(key);
      
      if (!record) {
        record = {
          count: 0,
          resetTime: now
        };
        this.store.set(key, record);
      }
      
      // Reset if window has passed
      if (now - record.resetTime > this.windowMs) {
        record.count = 0;
        record.resetTime = now;
      }
      
      record.count++;
      
      // Set rate limit headers
      res.set({
        'RateLimit-Limit': this.max,
        'RateLimit-Remaining': Math.max(0, this.max - record.count),
        'RateLimit-Reset': new Date(record.resetTime + this.windowMs).toISOString()
      });
      
      if (record.count > this.max) {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        return res.status(429).json({
          error: 'Too many requests from this IP, please try again later',
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
      
      next();
    };
  }
}

const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}).middleware();

module.exports = { rateLimiter };