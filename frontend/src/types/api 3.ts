/**
 * API Types and Interfaces
 * 
 * This file contains all TypeScript types and interfaces used for API communication.
 * It ensures type safety across the entire application when making API calls.
 */

/**
 * Base API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  requestId?: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  success: false;
  timestamp: string;
  requestId?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

/**
 * Authentication types
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * User types
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'merchant';
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

/**
 * Product types
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  attributes: Record<string, string>;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

/**
 * Virtual Try-On types
 */
export interface VirtualTryOnRequest {
  productId: string;
  userImage: File;
  faceShapeData?: FaceShapeData;
}

export interface VirtualTryOnResponse {
  id: string;
  resultImage: string;
  confidence: number;
  faceShape: string;
  recommendations: string[];
  processingTime: number;
  createdAt: string;
}

export interface FaceShapeData {
  shape: 'round' | 'oval' | 'square' | 'heart' | 'diamond' | 'oblong';
  confidence: number;
  landmarks: FaceLandmark[];
}

export interface FaceLandmark {
  x: number;
  y: number;
  type: string;
}

/**
 * Recommendation types
 */
export interface RecommendationRequest {
  userId?: string;
  productId?: string;
  faceShape?: string;
  preferences?: RecommendationPreferences;
  context?: RecommendationContext;
}

export interface RecommendationPreferences {
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  categories?: string[];
  styles?: string[];
}

export interface RecommendationContext {
  occasion?: string;
  season?: string;
  location?: string;
}

export interface RecommendationResponse {
  id: string;
  products: RecommendedProduct[];
  algorithm: string;
  confidence: number;
  explanation: string;
  createdAt: string;
}

export interface RecommendedProduct {
  product: Product;
  score: number;
  reason: string;
}

/**
 * Analytics types
 */
export interface AnalyticsEvent {
  type: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, unknown>;
  timestamp?: string;
}

export interface AnalyticsResponse {
  metrics: AnalyticsMetric[];
  timeRange: {
    start: string;
    end: string;
  };
  aggregation: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  change?: number;
  changePercent?: number;
}

/**
 * Contact Lens types
 */
export interface ContactLensUploadRequest {
  image: File;
  name: string;
  description?: string;
}

export interface ContactLensUploadResponse {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export interface ContactLensApplyRequest {
  userImage: File;
  contactLensId: string;
}

export interface ContactLensApplyResponse {
  id: string;
  resultImage: string;
  originalImage: string;
  contactLensId: string;
  processingTime: number;
  createdAt: string;
}

/**
 * E-commerce Integration types
 */
export interface EcommerceIntegration {
  id: string;
  platform: 'shopify' | 'magento' | 'woocommerce' | 'bigcommerce';
  name: string;
  storeUrl: string;
  apiKey: string;
  apiSecret?: string;
  webhookUrl?: string;
  isActive: boolean;
  lastSync?: string;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  settings: IntegrationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSettings {
  syncProducts: boolean;
  syncOrders: boolean;
  syncCustomers: boolean;
  autoSync: boolean;
  syncInterval: number;
}

export interface ProductSyncRequest {
  integrationId: string;
  productIds?: string[];
  fullSync?: boolean;
}

export interface ProductSyncResponse {
  jobId: string;
  status: 'started' | 'completed' | 'failed';
  totalProducts: number;
  syncedProducts: number;
  errors: SyncError[];
  startedAt: string;
  completedAt?: string;
}

export interface SyncError {
  productId: string;
  error: string;
  details?: Record<string, unknown>;
}

/**
 * Webhook types
 */
export interface WebhookEvent {
  id: string;
  type: string;
  source: string;
  payload: Record<string, unknown>;
  signature?: string;
  timestamp: string;
  processed: boolean;
  processingError?: string;
}

export interface WebhookResponse {
  id: string;
  status: 'received' | 'processed' | 'failed';
  message?: string;
  processingTime: number;
}

/**
 * Health Check types
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

/**
 * Request metrics for monitoring
 */
export interface RequestMetrics {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error: boolean;
  retryCount: number;
}