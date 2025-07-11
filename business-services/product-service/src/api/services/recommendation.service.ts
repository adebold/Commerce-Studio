import { Collection } from 'mongodb';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { 
  Collections, 
  SimilarityScore, 
  RecommendationFeedback,
  SimilarProductsRequest, 
  SubmitFeedbackRequest,
  ProductRecommendation 
} from '../models/recommendation.models';
import { logger } from '../../utils/logger';

export class RecommendationService {
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private similarityCollection: Collection<SimilarityScore>;
  private feedbackCollection: Collection<RecommendationFeedback>;

  constructor() {
    this.databaseService = new DatabaseService();
    this.redisService = new RedisService();
    this.similarityCollection = this.databaseService.getCollection<SimilarityScore>(Collections.SIMILARITY_SCORES);
    this.feedbackCollection = this.databaseService.getCollection<RecommendationFeedback>(Collections.RECOMMENDATION_FEEDBACK);
  }

  /**
   * Get similar products for a given product
   */
  async getSimilarProducts(request: SimilarProductsRequest): Promise<ProductRecommendation[]> {
    try {
      const { tenantId, productId, limit, similarityType, minScore = 0.1 } = request;
      const cacheKey = `similar:${tenantId}:${productId}:${similarityType}:${limit}`;

      // Try to get from cache first
      const cachedResults = await this.redisService.get(cacheKey);
      if (cachedResults) {
        logger.info({ tenantId, productId, similarityType }, 'Returning cached similar products');
        return JSON.parse(cachedResults);
      }

      // Get similar products from database
      const query: any = {
        sourceProductId: productId,
        tenantId,
        score: { $gte: minScore }
      };

      if (similarityType !== 'all') {
        query.similarityType = similarityType;
      }

      const similarityScores = await this.similarityCollection
        .find(query)
        .sort({ score: -1 })
        .limit(limit)
        .toArray();

      // Convert to recommendation format
      const recommendations: ProductRecommendation[] = similarityScores.map(score => ({
        productId: score.targetProductId,
        score: score.score,
        reasons: score.reasons,
        recommendationType: 'similar',
        metadata: {
          similarityType: score.similarityType,
          features: score.features,
          confidence: score.score // Use similarity score as confidence
        }
      }));

      // If no results found, try to calculate similarities on-the-fly
      if (recommendations.length === 0) {
        const calculatedSimilarities = await this.calculateSimilarProducts(tenantId, productId, limit);
        recommendations.push(...calculatedSimilarities);
      }

      // Cache the results for 1 hour
      await this.redisService.setex(cacheKey, 3600, JSON.stringify(recommendations));

      logger.info({ 
        tenantId, 
        productId, 
        similarityType, 
        count: recommendations.length 
      }, 'Retrieved similar products');

      return recommendations;
    } catch (error) {
      logger.error({ error, request }, 'Error getting similar products');
      throw error;
    }
  }

  /**
   * Calculate similar products on-the-fly
   */
  private async calculateSimilarProducts(tenantId: string, productId: string, limit: number): Promise<ProductRecommendation[]> {
    try {
      // Get the source product details
      const sourceProduct = await this.getProductDetails(tenantId, productId);
      if (!sourceProduct) {
        return [];
      }

      // Get all products in the same category
      const allProducts = await this.getAllProducts(tenantId, sourceProduct.category);
      
      // Calculate similarity scores
      const similarities: ProductRecommendation[] = [];
      
      for (const product of allProducts) {
        if (product.id === productId) continue; // Skip the source product
        
        const similarity = this.calculateProductSimilarity(sourceProduct, product);
        if (similarity.score > 0.1) { // Minimum threshold
          similarities.push({
            productId: product.id,
            score: similarity.score,
            reasons: similarity.reasons,
            recommendationType: 'similar',
            metadata: {
              similarityType: 'attribute',
              features: similarity.features,
              confidence: similarity.score
            }
          });
        }
      }

      // Sort by score and limit results
      similarities.sort((a, b) => b.score - a.score);
      return similarities.slice(0, limit);
    } catch (error) {
      logger.error({ error, tenantId, productId }, 'Error calculating similar products');
      return [];
    }
  }

  /**
   * Calculate similarity between two products
   */
  private calculateProductSimilarity(sourceProduct: any, targetProduct: any): any {
    let score = 0;
    const reasons: string[] = [];
    const features: any = {};

    // Category similarity (high weight)
    if (sourceProduct.category === targetProduct.category) {
      score += 0.3;
      features.category = 1;
      reasons.push(`Both are in the ${sourceProduct.category} category`);
    } else {
      features.category = 0;
    }

    // Brand similarity (medium weight)
    if (sourceProduct.brand === targetProduct.brand) {
      score += 0.2;
      features.brand = 1;
      reasons.push(`Both are from ${sourceProduct.brand}`);
    } else {
      features.brand = 0;
    }

    // Price range similarity (medium weight)
    const priceDifference = Math.abs(sourceProduct.price - targetProduct.price);
    const maxPrice = Math.max(sourceProduct.price, targetProduct.price);
    const priceScore = Math.max(0, 1 - (priceDifference / maxPrice));
    score += priceScore * 0.2;
    features.priceRange = priceScore;
    
    if (priceScore > 0.8) {
      reasons.push('Similar price range');
    }

    // Style similarity (if available)
    if (sourceProduct.style && targetProduct.style) {
      if (sourceProduct.style === targetProduct.style) {
        score += 0.15;
        features.style = 1;
        reasons.push(`Both have ${sourceProduct.style} style`);
      } else {
        features.style = 0;
      }
    }

    // Material similarity (if available)
    if (sourceProduct.material && targetProduct.material) {
      if (sourceProduct.material === targetProduct.material) {
        score += 0.1;
        features.material = 1;
        reasons.push(`Both made from ${sourceProduct.material}`);
      } else {
        features.material = 0;
      }
    }

    // Color similarity (if available)
    if (sourceProduct.color && targetProduct.color) {
      if (sourceProduct.color === targetProduct.color) {
        score += 0.05;
        features.color = 1;
        reasons.push(`Both available in ${sourceProduct.color}`);
      } else {
        features.color = 0;
      }
    }

    // Add generic reason if no specific ones
    if (reasons.length === 0) {
      reasons.push('Similar product attributes');
    }

    return {
      score: Math.min(score, 1), // Cap at 1
      reasons,
      features
    };
  }

  /**
   * Submit feedback for recommendations
   */
  async submitFeedback(request: SubmitFeedbackRequest): Promise<string> {
    try {
      const { tenantId, userId, productId, feedbackType, rating, comment, timestamp, metadata } = request;

      const feedback: RecommendationFeedback = {
        tenantId,
        userId,
        productId,
        recommendationType: 'similar', // This could be dynamic based on context
        feedbackType,
        rating,
        comment,
        timestamp,
        metadata
      };

      const result = await this.feedbackCollection.insertOne(feedback);
      
      // Update recommendation models based on feedback (future enhancement)
      await this.processFeedback(feedback);

      logger.info({ 
        tenantId, 
        userId, 
        productId, 
        feedbackType 
      }, 'Feedback submitted successfully');

      return result.insertedId.toString();
    } catch (error) {
      logger.error({ error, request }, 'Error submitting feedback');
      throw error;
    }
  }

  /**
   * Process feedback to improve recommendations
   */
  private async processFeedback(feedback: RecommendationFeedback): Promise<void> {
    try {
      // This is a placeholder for future ML model updates
      // In a real implementation, this would:
      // 1. Update similarity scores based on positive/negative feedback
      // 2. Adjust recommendation algorithms
      // 3. Trigger model retraining if needed
      
      logger.info({ 
        feedbackType: feedback.feedbackType,
        productId: feedback.productId 
      }, 'Processing feedback for model improvement');
    } catch (error) {
      logger.error({ error, feedback }, 'Error processing feedback');
    }
  }

  /**
   * Get product details (mock implementation)
   */
  private async getProductDetails(tenantId: string, productId: string): Promise<any> {
    try {
      // This is a mock implementation
      // In a real implementation, this would call the actual product service
      return {
        id: productId,
        name: `Product ${productId}`,
        price: Math.floor(Math.random() * 500) + 50,
        category: 'eyewear',
        brand: 'Sample Brand',
        style: 'modern',
        material: 'acetate',
        color: 'black',
        tenantId
      };
    } catch (error) {
      logger.error({ error, tenantId, productId }, 'Error getting product details');
      return null;
    }
  }

  /**
   * Get all products in a category (mock implementation)
   */
  private async getAllProducts(tenantId: string, category: string): Promise<any[]> {
    try {
      // This is a mock implementation
      // In a real implementation, this would call the actual product service
      const products = [];
      for (let i = 1; i <= 20; i++) {
        products.push({
          id: `product-${i}`,
          name: `Product ${i}`,
          price: Math.floor(Math.random() * 500) + 50,
          category,
          brand: i % 3 === 0 ? 'Brand A' : i % 3 === 1 ? 'Brand B' : 'Brand C',
          style: i % 2 === 0 ? 'modern' : 'classic',
          material: i % 4 === 0 ? 'metal' : 'acetate',
          color: i % 5 === 0 ? 'black' : 'brown',
          tenantId
        });
      }
      return products;
    } catch (error) {
      logger.error({ error, tenantId, category }, 'Error getting all products');
      return [];
    }
  }

  /**
   * Get recommendation statistics
   */
  async getRecommendationStats(tenantId: string): Promise<any> {
    try {
      const stats = await this.feedbackCollection.aggregate([
        {
          $match: { tenantId }
        },
        {
          $group: {
            _id: {
              feedbackType: '$feedbackType',
              recommendationType: '$recommendationType'
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ]).toArray();

      return stats.reduce((acc, stat) => {
        const key = `${stat._id.recommendationType}_${stat._id.feedbackType}`;
        acc[key] = {
          count: stat.count,
          avgRating: stat.avgRating
        };
        return acc;
      }, {});
    } catch (error) {
      logger.error({ error, tenantId }, 'Error getting recommendation stats');
      throw error;
    }
  }
}