import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { TrendingService } from '../services/trending.service';
import { UserTrackingService } from '../services/user-tracking.service';
import { logger } from '../../utils/logger';

export class RecommendationController {
  private recommendationService: RecommendationService;
  private trendingService: TrendingService;
  private userTrackingService: UserTrackingService;

  constructor() {
    this.recommendationService = new RecommendationService();
    this.trendingService = new TrendingService();
    this.userTrackingService = new UserTrackingService();
  }

  /**
   * Get trending products
   */
  getTrendingProducts = async (req: Request, res: Response) => {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { category, limit = 10, timeFrame = 'week' } = req.query;

      const trendingProducts = await this.trendingService.getTrendingProducts({
        tenantId,
        category: category as string,
        limit: parseInt(limit as string),
        timeFrame: timeFrame as string
      });

      res.json({
        success: true,
        data: trendingProducts,
        metadata: {
          tenantId,
          category,
          limit: parseInt(limit as string),
          timeFrame,
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error({ error, req_id: req.id }, 'Error getting trending products');
      res.status(500).json({
        success: false,
        error: 'Failed to get trending products',
        requestId: req.id
      });
    }
  };

  /**
   * Get recently viewed products for a user
   */
  getRecentlyViewed = async (req: Request, res: Response) => {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { userId } = req.params;
      const { limit = 10 } = req.query;

      const recentlyViewed = await this.userTrackingService.getRecentlyViewed({
        tenantId,
        userId,
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: recentlyViewed,
        metadata: {
          tenantId,
          userId,
          limit: parseInt(limit as string),
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error({ error, req_id: req.id }, 'Error getting recently viewed products');
      res.status(500).json({
        success: false,
        error: 'Failed to get recently viewed products',
        requestId: req.id
      });
    }
  };

  /**
   * Get similar products to a given product
   */
  getSimilarProducts = async (req: Request, res: Response) => {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { productId } = req.params;
      const { limit = 10, similarityType = 'visual' } = req.query;

      const similarProducts = await this.recommendationService.getSimilarProducts({
        tenantId,
        productId,
        limit: parseInt(limit as string),
        similarityType: similarityType as string
      });

      res.json({
        success: true,
        data: similarProducts,
        metadata: {
          tenantId,
          productId,
          limit: parseInt(limit as string),
          similarityType,
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error({ error, req_id: req.id }, 'Error getting similar products');
      res.status(500).json({
        success: false,
        error: 'Failed to get similar products',
        requestId: req.id
      });
    }
  };

  /**
   * Track a product view for recommendations
   */
  trackProductView = async (req: Request, res: Response) => {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { userId, productId, sessionId, deviceType = 'web', source = 'direct' } = req.body;

      await this.userTrackingService.trackProductView({
        tenantId,
        userId,
        productId,
        sessionId,
        deviceType,
        source,
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Product view tracked successfully',
        metadata: {
          tenantId,
          userId,
          productId,
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error({ error, req_id: req.id }, 'Error tracking product view');
      res.status(500).json({
        success: false,
        error: 'Failed to track product view',
        requestId: req.id
      });
    }
  };

  /**
   * Submit feedback for recommendations
   */
  submitFeedback = async (req: Request, res: Response) => {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { userId, productId, feedbackType, rating, comment } = req.body;

      const feedbackId = await this.recommendationService.submitFeedback({
        tenantId,
        userId,
        productId,
        feedbackType,
        rating,
        comment,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: { feedbackId },
        message: 'Feedback submitted successfully',
        metadata: {
          tenantId,
          userId,
          productId,
          requestId: req.id
        }
      });
    } catch (error) {
      logger.error({ error, req_id: req.id }, 'Error submitting feedback');
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
        requestId: req.id
      });
    }
  };
}