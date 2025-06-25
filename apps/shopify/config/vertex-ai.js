/**
 * Vertex AI Configuration for Shopify Integration
 * 
 * This module provides configuration settings for the Vertex AI
 * integration with Shopify and the EyewearML platform.
 */

// Environment variables with defaults
const config = {
  // API configuration
  apiBaseUrl: process.env.VERTEX_AI_API_URL || 'https://api.eyewearml.example/v1',
  apiKey: process.env.VERTEX_AI_API_KEY || '',
  projectId: process.env.VERTEX_AI_PROJECT_ID || 'eyewearml-project',
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  endpointId: process.env.VERTEX_AI_ENDPOINT_ID || 'shopping-assistant-endpoint',
  
  // Development mode settings
  useSimulation: process.env.VERTEX_AI_USE_SIMULATION === 'true' || 
                !process.env.VERTEX_AI_API_KEY || 
                process.env.NODE_ENV === 'development',
  
  // Enhancement options
  enhancementLevel: process.env.VERTEX_AI_ENHANCEMENT_LEVEL || 'standard',
  
  // Cache settings
  cacheEnabled: process.env.VERTEX_AI_CACHE_ENABLED === 'true' || false,
  cacheTTL: parseInt(process.env.VERTEX_AI_CACHE_TTL || '3600', 10),
  
  // Timeout settings (in milliseconds)
  requestTimeout: parseInt(process.env.VERTEX_AI_REQUEST_TIMEOUT || '5000', 10),
  
  // Logging settings
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Rate limiting
  maxRequestsPerMinute: parseInt(process.env.VERTEX_AI_MAX_REQUESTS_PER_MINUTE || '60', 10),
  
  // Recommendation settings
  defaultMaxResults: parseInt(process.env.VERTEX_AI_DEFAULT_MAX_RESULTS || '3', 10),
  includeProductDetails: process.env.VERTEX_AI_INCLUDE_PRODUCT_DETAILS === 'true' || true,
  
  // Chat session settings
  sessionTTL: parseInt(process.env.VERTEX_AI_SESSION_TTL || '1800', 10), // 30 minutes
  
  // User settings
  anonymousUserPrefix: process.env.VERTEX_AI_ANONYMOUS_USER_PREFIX || 'anon_',
  
  // Store-specific settings
  shopifyIntegrationEnabled: process.env.VERTEX_AI_SHOPIFY_INTEGRATION_ENABLED === 'true' || true,
  htmlStoreIntegrationEnabled: process.env.VERTEX_AI_HTML_STORE_INTEGRATION_ENABLED === 'true' || true
};

export default config;
