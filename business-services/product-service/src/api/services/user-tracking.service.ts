import { Collection } from 'mongodb';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { 
  Collections, 
  UserActivity, 
  RecentlyViewedRequest, 
  TrackProductViewRequest 
} from '../models/recommendation.models';
import { logger } from '../../utils/logger';

export class UserTrackingService {
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private userActivitiesCollection: Collection<UserActivity>;

  constructor() {
    this.databaseService = new DatabaseService();
    this.redisService = new RedisService();
    this.userActivitiesCollection = this.databaseService.getCollection<UserActivity>(Collections.USER_ACTIVITIES);
  }

  /**
   * Track a product view
   */
  async trackProductView(request: TrackProductViewRequest): Promise<void> {
    try {
      const { tenantId, userId, productId, sessionId, deviceType, source, timestamp, duration, metadata } = request;

      // Create user activity record
      const userActivity: UserActivity = {
        userId,
        tenantId,
        productId,
        sessionId,
        deviceType,
        source,
        viewedAt: timestamp,
        duration,
        metadata
      };

      // Save to MongoDB
      await this.userActivitiesCollection.insertOne(userActivity);

      // Update Redis cache for recently viewed
      await this.updateRecentlyViewedCache(tenantId, userId, productId);

      // Update product view count in Redis
      await this.updateProductViewCount(tenantId, productId);

      logger.info({ 
        tenantId, 
        userId, 
        productId, 
        source 
      }, 'Product view tracked successfully');
    } catch (error) {
      logger.error({ error, request }, 'Error tracking product view');
      throw error;
    }
  }

  /**
   * Get recently viewed products for a user
   */
  async getRecentlyViewed(request: RecentlyViewedRequest): Promise<any[]> {
    try {
      const { tenantId, userId, limit } = request;
      const cacheKey = `recently_viewed:${tenantId}:${userId}`;

      // Try to get from cache first
      const cachedResults = await this.redisService.lrange(cacheKey, 0, limit - 1);
      if (cachedResults.length > 0) {
        logger.info({ tenantId, userId }, 'Returning cached recently viewed products');
        return cachedResults.map(item => JSON.parse(item));
      }

      // Get from database if not in cache
      const recentlyViewed = await this.userActivitiesCollection
        .find({ 
          tenantId, 
          userId 
        })
        .sort({ viewedAt: -1 })
        .limit(limit)
        .toArray();

      // Get product details for each viewed product
      const productIds = [...new Set(recentlyViewed.map(activity => activity.productId))];
      const products = await this.getProductDetails(tenantId, productIds);

      // Combine activity data with product details
      const recentlyViewedWithDetails = recentlyViewed.map(activity => {
        const product = products.find(p => p.id === activity.productId);
        return {
          productId: activity.productId,
          viewedAt: activity.viewedAt,
          deviceType: activity.deviceType,
          source: activity.source,
          product: product || null
        };
      }).filter(item => item.product !== null);

      // Cache the results for 5 minutes
      if (recentlyViewedWithDetails.length > 0) {
        const cacheData = recentlyViewedWithDetails.map(item => JSON.stringify(item));
        await this.redisService.lpush(cacheKey, ...cacheData);
        await this.redisService.expire(cacheKey, 300); // 5 minutes
      }

      logger.info({ 
        tenantId, 
        userId, 
        count: recentlyViewedWithDetails.length 
      }, 'Retrieved recently viewed products');

      return recentlyViewedWithDetails;
    } catch (error) {
      logger.error({ error, request }, 'Error getting recently viewed products');
      throw error;
    }
  }

  /**
   * Update recently viewed cache in Redis
   */
  private async updateRecentlyViewedCache(tenantId: string, userId: string, productId: string): Promise<void> {
    try {
      const cacheKey = `recently_viewed:${tenantId}:${userId}`;
      
      // Create cache entry
      const cacheEntry = JSON.stringify({
        productId,
        viewedAt: new Date(),
        cached: true
      });

      // Add to the beginning of the list
      await this.redisService.lpush(cacheKey, cacheEntry);
      
      // Keep only the last 50 items
      await this.redisService.ltrim(cacheKey, 0, 49);
      
      // Set expiration to 24 hours
      await this.redisService.expire(cacheKey, 86400);
    } catch (error) {
      logger.error({ error, tenantId, userId, productId }, 'Error updating recently viewed cache');
    }
  }

  /**
   * Update product view count in Redis
   */
  private async updateProductViewCount(tenantId: string, productId: string): Promise<void> {
    try {
      const countKey = `product_views:${tenantId}:${productId}`;
      await this.redisService.incr(countKey);
      
      // Set expiration to 7 days
      const ttl = await this.redisService.ttl(countKey);
      if (ttl === -1) {
        await this.redisService.expire(countKey, 604800); // 7 days
      }
    } catch (error) {
      logger.error({ error, tenantId, productId }, 'Error updating product view count');
    }
  }

  /**
   * Get product details (mock implementation - should integrate with actual product service)
   */
  private async getProductDetails(tenantId: string, productIds: string[]): Promise<any[]> {
    try {
      // This is a mock implementation
      // In a real implementation, this would call the actual product service
      return productIds.map(id => ({
        id,
        name: `Product ${id}`,
        price: Math.floor(Math.random() * 500) + 50,
        imageUrl: `/images/products/${id}.jpg`,
        category: 'eyewear',
        brand: 'Sample Brand',
        tenantId
      }));
    } catch (error) {
      logger.error({ error, tenantId, productIds }, 'Error getting product details');
      return [];
    }
  }

  /**
   * Get user activity statistics
   */
  async getUserActivityStats(tenantId: string, userId: string): Promise<any> {
    try {
      const stats = await this.userActivitiesCollection.aggregate([
        {
          $match: { tenantId, userId }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: 1 },
            uniqueProducts: { $addToSet: '$productId' },
            deviceTypes: { $addToSet: '$deviceType' },
            sources: { $push: '$source' },
            firstView: { $min: '$viewedAt' },
            lastView: { $max: '$viewedAt' }
          }
        },
        {
          $addFields: {
            uniqueProductsCount: { $size: '$uniqueProducts' },
            deviceTypesCount: { $size: '$deviceTypes' }
          }
        }
      ]).toArray();

      return stats[0] || {
        totalViews: 0,
        uniqueProductsCount: 0,
        deviceTypesCount: 0,
        firstView: null,
        lastView: null
      };
    } catch (error) {
      logger.error({ error, tenantId, userId }, 'Error getting user activity stats');
      throw error;
    }
  }

  /**
   * Clean up old user activities
   */
  async cleanupOldActivities(tenantId: string, daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
      
      const result = await this.userActivitiesCollection.deleteMany({
        tenantId,
        viewedAt: { $lt: cutoffDate }
      });

      logger.info({ 
        tenantId, 
        daysOld, 
        deletedCount: result.deletedCount 
      }, 'Cleaned up old user activities');
    } catch (error) {
      logger.error({ error, tenantId, daysOld }, 'Error cleaning up old activities');
      throw error;
    }
  }

  /**
   * Get popular products based on views
   */
  async getPopularProducts(tenantId: string, limit: number = 10, timeFrame: string = 'week'): Promise<any[]> {
    try {
      const startTime = new Date(Date.now() - this.getTimeFrameMs(timeFrame));
      
      const pipeline = [
        {
          $match: {
            tenantId,
            viewedAt: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: '$productId',
            views: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            lastViewed: { $max: '$viewedAt' }
          }
        },
        {
          $addFields: {
            uniqueUsersCount: { $size: '$uniqueUsers' }
          }
        },
        {
          $sort: { views: -1 }
        },
        {
          $limit: limit
        }
      ];

      const results = await this.userActivitiesCollection.aggregate(pipeline).toArray();
      
      return results.map(result => ({
        productId: result._id,
        views: result.views,
        uniqueUsers: result.uniqueUsersCount,
        lastViewed: result.lastViewed
      }));
    } catch (error) {
      logger.error({ error, tenantId, limit, timeFrame }, 'Error getting popular products');
      throw error;
    }
  }

  /**
   * Get time frame in milliseconds
   */
  private getTimeFrameMs(timeFrame: string): number {
    const timeFrames: Record<string, number> = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    return timeFrames[timeFrame] || timeFrames.week;
  }
}