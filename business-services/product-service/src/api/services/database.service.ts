import { Collection, Db, MongoClient, CreateIndexesOptions } from 'mongodb';
import { getMongoDBConnection } from '../../infrastructure/mongodb';
import { Collections } from '../models/recommendation.models';
import { logger } from '../../utils/logger';

export class DatabaseService {
  private db: Db;

  constructor() {
    this.db = getMongoDBConnection().db;
  }

  /**
   * Initialize database collections and indexes
   */
  async initializeCollections(): Promise<void> {
    try {
      // Create indexes for user activities
      await this.createUserActivitiesIndexes();
      
      // Create indexes for trending scores
      await this.createTrendingScoresIndexes();
      
      // Create indexes for similarity scores
      await this.createSimilarityScoresIndexes();
      
      // Create indexes for recommendation feedback
      await this.createRecommendationFeedbackIndexes();
      
      logger.info('Database collections and indexes initialized successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize database collections');
      throw error;
    }
  }

  /**
   * Create indexes for user activities collection
   */
  private async createUserActivitiesIndexes(): Promise<void> {
    const collection = this.db.collection(Collections.USER_ACTIVITIES);
    
    const indexes = [
      // Composite index for user and tenant
      { key: { userId: 1, tenantId: 1 }, name: 'idx_user_tenant' },
      
      // Index for tenant and timestamp (for cleanup)
      { key: { tenantId: 1, viewedAt: -1 }, name: 'idx_tenant_timestamp' },
      
      // Index for product views
      { key: { productId: 1, tenantId: 1, viewedAt: -1 }, name: 'idx_product_views' },
      
      // Index for session tracking
      { key: { sessionId: 1, tenantId: 1 }, name: 'idx_session_tenant' },
      
      // TTL index for automatic cleanup (30 days)
      { key: { viewedAt: 1 }, name: 'idx_ttl_viewed', expireAfterSeconds: 2592000 }
    ];
    
    await collection.createIndexes(indexes);
    logger.info('Created indexes for user_activities collection');
  }

  /**
   * Create indexes for trending scores collection
   */
  private async createTrendingScoresIndexes(): Promise<void> {
    const collection = this.db.collection(Collections.TRENDING_SCORES);
    
    const indexes = [
      // Composite index for tenant, category, and score
      { key: { tenantId: 1, category: 1, score: -1 }, name: 'idx_trending_score' },
      
      // Index for tenant and time frame
      { key: { tenantId: 1, timeFrame: 1, calculatedAt: -1 }, name: 'idx_tenant_timeframe' },
      
      // Index for product trending
      { key: { productId: 1, tenantId: 1, timeFrame: 1 }, name: 'idx_product_trending' },
      
      // TTL index for automatic cleanup
      { key: { expiresAt: 1 }, name: 'idx_ttl_trending', expireAfterSeconds: 0 }
    ];
    
    await collection.createIndexes(indexes);
    logger.info('Created indexes for trending_scores collection');
  }

  /**
   * Create indexes for similarity scores collection
   */
  private async createSimilarityScoresIndexes(): Promise<void> {
    const collection = this.db.collection(Collections.SIMILARITY_SCORES);
    
    const indexes = [
      // Composite index for source product and similarity type
      { key: { sourceProductId: 1, tenantId: 1, similarityType: 1, score: -1 }, name: 'idx_similarity_search' },
      
      // Index for bidirectional similarity lookup
      { key: { targetProductId: 1, tenantId: 1, similarityType: 1 }, name: 'idx_target_similarity' },
      
      // Index for tenant and calculation time
      { key: { tenantId: 1, calculatedAt: -1 }, name: 'idx_tenant_calculation' },
      
      // TTL index for automatic cleanup
      { key: { expiresAt: 1 }, name: 'idx_ttl_similarity', expireAfterSeconds: 0 }
    ];
    
    await collection.createIndexes(indexes);
    logger.info('Created indexes for similarity_scores collection');
  }

  /**
   * Create indexes for recommendation feedback collection
   */
  private async createRecommendationFeedbackIndexes(): Promise<void> {
    const collection = this.db.collection(Collections.RECOMMENDATION_FEEDBACK);
    
    const indexes = [
      // Composite index for user feedback
      { key: { userId: 1, tenantId: 1, timestamp: -1 }, name: 'idx_user_feedback' },
      
      // Index for product feedback
      { key: { productId: 1, tenantId: 1, feedbackType: 1 }, name: 'idx_product_feedback' },
      
      // Index for recommendation type analysis
      { key: { recommendationType: 1, tenantId: 1, timestamp: -1 }, name: 'idx_recommendation_type' },
      
      // Index for feedback type analysis
      { key: { feedbackType: 1, tenantId: 1, timestamp: -1 }, name: 'idx_feedback_type' }
    ];
    
    await collection.createIndexes(indexes);
    logger.info('Created indexes for recommendation_feedback collection');
  }

  /**
   * Get a collection by name
   */
  getCollection<T = any>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName);
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return getMongoDBConnection().readyState === 1;
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    try {
      const stats = await this.db.stats();
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get database stats');
      throw error;
    }
  }
}