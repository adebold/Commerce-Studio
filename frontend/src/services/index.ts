/**
 * Services Index - Central export point for all service modules
 * 
 * This file consolidates all service exports to provide a single import point
 * for components and other modules that need to access service functionality.
 */

// Core API client and error handling
export { ApiError } from './api';

// Specific API endpoints
export {
  authApi,
  userApi,
  productApi,
  framesApi,
  virtualTryOnApi,
  recommendationApi,
  analyticsApi,
  contactLensApi,
  ecommerceApi,
  webhookApi,
  healthApi,
  apiUtils
} from './api';

// Authentication services
export {
  Role,
  type UserContext,
  type AuthResponse,
  type LoginCredentials,
  type RegistrationData
} from './auth';

// Commerce Studio services
export {
  commerceStudioService,
  commerceStudioApi,
  type Product as CommerceProduct,
  type PricingPlan,
  type Solution
} from './commerce-studio';

// Analytics services
export {
  type ConversionFunnelData,
  type HeatmapData,
  type CohortData,
  type ABTestData,
  type AnalyticsFilters
} from './analytics';

// Recommendation services
export {
  type UserPreferences,
  type RecommendationResult,
  type FrameRecommendation
} from './recommendation-service';

// Settings services
export {
  type TeamMember,
  type BillingInfo,
  type AccountSettings,
  type ApiKey
} from './settings';

// Error handling
export { ApiError as ServiceError } from './errors';

// Face shape service
export * from './faceShapeService';

// Metrics service
export * from './metrics';

// Merchant onboarding analytics
export * from './merchant-onboarding-analytics';

// Scraping service
export * from './scraping';

// Redirect service
export * from './redirect';

/**
 * Main API endpoints are available through named exports above
 * Use authApi, userApi, productApi, etc. for specific functionality
 */