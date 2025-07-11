import { Collection } from 'mongodb';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { 
  Collections, 
  TrendingScore, 
  TrendingProductsRequest, 
  ProductRecommendation 
} from '../models/recommendation.models';
import { logger } from '../../utils/logger';

export class TrendingService {
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private trendingCollection: Collection<TrendingScore>;

  constructor() {
    this.databaseService = new DatabaseService();
    this.redisService = new RedisService();
    this.trendingCollection = this.databaseService.getCollection<TrendingScore>(Collections.TRENDING_SCORES);
  }

  /**
   * Get trending products for a tenant
   */
  async getTrendingProducts(request: TrendingProductsRequest): Promise<ProductRecommendation[]> {
    try {
      const { tenantId, category, limit, timeFrame } = request;
      const cacheKey = `trending:${tenantId}:${category || 'all'}:${timeFrame}:${limit}`;

      // Try to get from cache first
      const cachedResults = await this.redisService.get(cacheKey);
      if (cachedResults) {
        logger.info({ tenantId, category, timeFrame }, 'Returning cached trending products');
        return JSON.parse(cachedResults);
      }

      // Build query
      const query: any = {
        tenantId,
        timeFrame,
        calculatedAt: { $gte: new Date(Date.now() - this.getTimeFrameMs(timeFrame)) }
      };

      if (category) {
        query.category = category;
      }

      // Get trending products from database
      const trendingScores = await this.trendingCollection
        .find(query)
        .sort({ score: -1 })
        .limit(limit)
        .toArray();

      // Convert to recommendation format
      const recommendations: ProductRecommendation[] = trendingScores.map(score => ({
        productId: score.productId,
        score: score.score,
        reasons: this.generateTrendingReasons(score),
        recommendationType: 'trending',
        metadata: {
          category: score.category,
          timeFrame: score.timeFrame,
          metrics: score.metrics,
          confidence: this.calculateConfidence(score)
        }
      }));

      // Cache the results for 15 minutes
      await this.redisService.setex(cacheKey, 900, JSON.stringify(recommendations));

      logger.info({ 
        tenantId, 
        category, 
        timeFrame, 
        count: recommendations.length 
      }, 'Retrieved trending products');

      return recommendations;
    } catch (error) {
      logger.error({ error, request }, 'Error getting trending products');
      throw error;
    }
  }

  /**
   * Calculate trending scores for products
   */
  async calculateTrendingScores(tenantId: string): Promise<void> {
    try {
      const timeFrames = ['hour', 'day', 'week', 'month'];
      
      for (const timeFrame of timeFrames) {
        await this.calculateTrendingScoresForTimeFrame(tenantId, timeFrame);
      }

      logger.info({ tenantId }, 'Calculated trending scores for all time frames');
    } catch (error) {
      logger.error({ error, tenantId }, 'Error calculating trending scores');
      throw error;
    }
  }

  /**
   * Calculate trending scores for a specific time frame
   */
  private async calculateTrendingScoresForTimeFrame(tenantId: string, timeFrame: string): Promise<void> {
    try {
      const startTime = new Date(Date.now() - this.getTimeFrameMs(timeFrame));
      const endTime = new Date();

      // Aggregate user activities to calculate metrics
      const pipeline = [
        {
          $match: {
            tenantId,
            viewedAt: { $gte: startTime, $lte: endTime }
          }
        },
        {
          $group: {
            _id: {
              productId: '$productId',
              category: '$metadata.category'
            },
            views: { $sum: 1 },
            uniqueViews: { $addToSet: '$userId' },
            sessions: { $addToSet: '$sessionId' },
            sources: { $push: '$source' }
          }
        },
        {
          $addFields: {
            uniqueViewsCount: { $size: '$uniqueViews' },
            uniqueSessionsCount: { $size: '$sessions' },
            directViews: {
              $size: {
                $filter: {
                  input: '$sources',
                  cond: { $eq: ['$$this', 'direct'] }
                }
              }
            },
            searchViews: {
              $size: {
                $filter: {
                  input: '$sources',
                  cond: { $eq: ['$$this', 'search'] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            // Calculate trending score based on multiple factors
            score: {
              $add: [
                { $multiply: ['$views', 1] },                    // Base views
                { $multiply: ['$uniqueViewsCount', 2] },         // Unique views (higher weight)
                { $multiply: ['$uniqueSessionsCount', 1.5] },    // Unique sessions
                { $multiply: ['$directViews', 0.5] },            // Direct traffic
                { $multiply: ['$searchViews', 0.3] }             // Search traffic
              ]
            }
          }
        },
        {
          $project: {
            productId: '$_id.productId',
            category: '$_id.category',
            score: 1,
            metrics: {
              views: '$views',
              uniqueViews: '$uniqueViewsCount',
              purchases: 0, // TODO: Add purchase tracking
              addToCart: 0, // TODO: Add cart tracking
              shares: 0     // TODO: Add social sharing tracking
            }
          }
        },
        {
          $sort: { score: -1 }
        }
      ];

      const userActivitiesCollection = this.databaseService.getCollection(Collections.USER_ACTIVITIES);
      const results = await userActivitiesCollection.aggregate(pipeline).toArray();

      // Save trending scores to database
      const trendingScores: TrendingScore[] = results.map(result => ({
        productId: result.productId,
        tenantId,
        category: result.category || 'uncategorized',
        score: result.score,
        metrics: result.metrics,
        timeFrame: timeFrame as any,
        calculatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.getTimeFrameMs(timeFrame) * 2) // Expire after 2x the time frame
      }));

      // Remove old scores for this time frame
      await this.trendingCollection.deleteMany({
        tenantId,
        timeFrame,
        calculatedAt: { $lt: startTime }
      });

      // Insert new scores
      if (trendingScores.length > 0) {
        await this.trendingCollection.insertMany(trendingScores);
      }

      // Clear cache for this tenant and time frame
      await this.clearTrendingCache(tenantId, timeFrame);

      logger.info({ 
        tenantId, 
        timeFrame, 
        count: trendingScores.length 
      }, 'Calculated trending scores for time frame');
    } catch (error) {
      logger.error({ error, tenantId, timeFrame }, 'Error calculating trending scores for time frame');
      throw error;
    }
  }

  /**
   * Generate reasons for trending recommendations
   */
  private generateTrendingReasons(score: TrendingScore): string[] {
    const reasons: string[] = [];
    
    if (score.metrics.views > 100) {
      reasons.push(`Popular with ${score.metrics.views} views this ${score.timeFrame}`);
    }
    
    if (score.metrics.uniqueViews > 50) {
      reasons.push(`Viewed by ${score.metrics.uniqueViews} unique customers`);
    }
    
    if (score.score > 100) {
      reasons.push('High trending score based on recent activity');
    }
    
    if (score.category !== 'uncategorized') {
      reasons.push(`Trending in ${score.category} category`);
    }
    
    // Add generic reason if no specific ones
    if (reasons.length === 0) {
      reasons.push('Recently gaining popularity');
    }
    
    return reasons;
  }

  /**
   * Calculate confidence score for trending recommendation
   */
  private calculateConfidence(score: TrendingScore): number {
    const baseConfidence = 0.5;
    const viewsWeight = Math.min(score.metrics.views / 100, 1) * 0.3;
    const uniqueViewsWeight = Math.min(score.metrics.uniqueViews / 50, 1) * 0.2;
    
    return Math.min(baseConfidence + viewsWeight + uniqueViewsWeight, 1);
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

  /**
   * Clear trending cache for a tenant and time frame
   */
  private async clearTrendingCache(tenantId: string, timeFrame: string): Promise<void> {
    try {
      const pattern = `trending:${tenantId}:*:${timeFrame}:*`;
      await this.redisService.deletePattern(pattern);
    } catch (error) {
      logger.error({ error, tenantId, timeFrame }, 'Error clearing trending cache');
    }
  }
}