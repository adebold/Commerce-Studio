import { ObjectId } from 'mongodb';

/**
 * User Activity Model - tracks user interactions with products
 */
export interface UserActivity {
  _id?: ObjectId;
  userId: string;
  tenantId: string;
  productId: string;
  sessionId: string;
  deviceType: 'web' | 'mobile' | 'tablet';
  source: 'search' | 'recommendation' | 'direct' | 'category' | 'trending';
  viewedAt: Date;
  duration?: number; // Time spent viewing in seconds
  metadata?: {
    userAgent?: string;
    referrer?: string;
    page?: string;
  };
}

/**
 * Trending Score Model - stores calculated trending scores for products
 */
export interface TrendingScore {
  _id?: ObjectId;
  productId: string;
  tenantId: string;
  category: string;
  score: number;
  metrics: {
    views: number;
    uniqueViews: number;
    purchases: number;
    addToCart: number;
    shares: number;
  };
  timeFrame: 'hour' | 'day' | 'week' | 'month';
  calculatedAt: Date;
  expiresAt: Date;
}

/**
 * Similarity Score Model - stores calculated similarity between products
 */
export interface SimilarityScore {
  _id?: ObjectId;
  sourceProductId: string;
  targetProductId: string;
  tenantId: string;
  similarityType: 'visual' | 'attribute' | 'behavioral' | 'hybrid';
  score: number;
  reasons: string[];
  features: {
    visual?: number;
    category?: number;
    brand?: number;
    priceRange?: number;
    style?: number;
    material?: number;
    color?: number;
  };
  calculatedAt: Date;
  expiresAt: Date;
}

/**
 * Recommendation Feedback Model - stores user feedback on recommendations
 */
export interface RecommendationFeedback {
  _id?: ObjectId;
  tenantId: string;
  userId: string;
  productId: string;
  recommendationType: 'trending' | 'similar' | 'personalized';
  feedbackType: 'click' | 'purchase' | 'like' | 'dislike' | 'not_interested';
  rating?: number; // 1-5 scale
  comment?: string;
  timestamp: Date;
  metadata?: {
    sessionId?: string;
    source?: string;
    position?: number; // Position in recommendation list
  };
}

/**
 * Product Recommendation Result
 */
export interface ProductRecommendation {
  productId: string;
  score: number;
  reasons: string[];
  recommendationType: 'trending' | 'similar' | 'personalized';
  metadata?: {
    category?: string;
    brand?: string;
    priceRange?: string;
    confidence?: number;
  };
}

/**
 * Trending Products Request Parameters
 */
export interface TrendingProductsRequest {
  tenantId: string;
  category?: string;
  limit: number;
  timeFrame: string;
  includeMetrics?: boolean;
}

/**
 * Recently Viewed Request Parameters
 */
export interface RecentlyViewedRequest {
  tenantId: string;
  userId: string;
  limit: number;
  includeDetails?: boolean;
}

/**
 * Similar Products Request Parameters
 */
export interface SimilarProductsRequest {
  tenantId: string;
  productId: string;
  limit: number;
  similarityType: string;
  minScore?: number;
}

/**
 * Track Product View Request Parameters
 */
export interface TrackProductViewRequest {
  tenantId: string;
  userId: string;
  productId: string;
  sessionId: string;
  deviceType: 'web' | 'mobile' | 'tablet';
  source: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Submit Feedback Request Parameters
 */
export interface SubmitFeedbackRequest {
  tenantId: string;
  userId: string;
  productId: string;
  feedbackType: string;
  rating?: number;
  comment?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * MongoDB Collection Names
 */
export const Collections = {
  USER_ACTIVITIES: 'user_activities',
  TRENDING_SCORES: 'trending_scores',
  SIMILARITY_SCORES: 'similarity_scores',
  RECOMMENDATION_FEEDBACK: 'recommendation_feedback',
  PRODUCTS: 'products' // Reference to existing products collection
} as const;