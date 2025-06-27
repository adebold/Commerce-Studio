/**
 * Frontend Environment Configuration Utilities
 * 
 * Provides type-safe access to environment variables with validation,
 * default values, and environment-specific configuration management.
 */

// Environment variable validation error
export class ConfigurationError extends Error {
  constructor(message: string, public readonly variable?: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';

// Configuration interface
export interface EnvironmentConfig {
  // Core settings
  environment: Environment;
  apiBaseUrl: string;
  version: string;
  
  // Feature flags
  enableAnalytics: boolean;
  enableABTesting: boolean;
  enableVirtualTryOn: boolean;
  
  // Analytics
  googleAnalyticsId?: string;
  mixpanelToken?: string;
  
  // Development settings
  debugMode: boolean;
  mockApi: boolean;
}

/**
 * Get environment variable with validation and type conversion
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && defaultValue === undefined) {
    throw new ConfigurationError(
      `Environment variable ${key} is required but not set`,
      key
    );
  }
  
  return value || defaultValue || '';
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  
  if (!value) {
    return defaultValue;
  }
  
  const normalizedValue = value.toLowerCase();
  
  if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }
  
  if (['false', '0', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }
  
  throw new ConfigurationError(
    `Environment variable ${key} must be a boolean value (true/false, 1/0, yes/no, on/off), got: ${value}`,
    key
  );
}

/**
 * Get numeric environment variable
 */
export function getNumericEnvVar(key: string, defaultValue?: number): number {
  const value = process.env[key];
  
  if (!value) {
    if (defaultValue === undefined) {
      throw new ConfigurationError(
        `Environment variable ${key} is required but not set`,
        key
      );
    }
    return defaultValue;
  }
  
  const numericValue = Number(value);
  
  if (isNaN(numericValue)) {
    throw new ConfigurationError(
      `Environment variable ${key} must be a number, got: ${value}`,
      key
    );
  }
  
  return numericValue;
}

/**
 * Validate required environment variables
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new ConfigurationError(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

/**
 * Get current environment
 */
export function getEnvironment(): Environment {
  const env = getEnvVar('REACT_APP_ENVIRONMENT', 'development').toLowerCase();
  
  if (!['development', 'staging', 'production', 'test'].includes(env)) {
    throw new ConfigurationError(
      `Invalid environment: ${env}. Must be one of: development, staging, production, test`,
      'REACT_APP_ENVIRONMENT'
    );
  }
  
  return env as Environment;
}

/**
 * Environment check utilities
 */
export const isProduction = (): boolean => getEnvironment() === 'production';
export const isDevelopment = (): boolean => getEnvironment() === 'development';
export const isStaging = (): boolean => getEnvironment() === 'staging';
export const isTest = (): boolean => getEnvironment() === 'test';

/**
 * Get API base URL with validation
 */
export function getApiBaseUrl(): string {
  const baseUrl = getEnvVar('REACT_APP_API_BASE_URL', 'http://localhost:8000/api/v1');
  
  try {
    new URL(baseUrl);
    return baseUrl;
  } catch {
    throw new ConfigurationError(
      `Invalid API base URL: ${baseUrl}`,
      'REACT_APP_API_BASE_URL'
    );
  }
}

/**
 * Create complete environment configuration
 */
export function createEnvironmentConfig(): EnvironmentConfig {
  try {
    const environment = getEnvironment();
    
    const config: EnvironmentConfig = {
      // Core settings
      environment,
      apiBaseUrl: getApiBaseUrl(),
      version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
      
      // Feature flags
      enableAnalytics: getBooleanEnvVar('REACT_APP_ENABLE_ANALYTICS', true),
      enableABTesting: getBooleanEnvVar('REACT_APP_ENABLE_A_B_TESTING', true),
      enableVirtualTryOn: getBooleanEnvVar('REACT_APP_ENABLE_VIRTUAL_TRY_ON', true),
      
      // Analytics (optional)
      googleAnalyticsId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
      mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN,
      
      // Development settings
      debugMode: isDevelopment() || getBooleanEnvVar('REACT_APP_DEBUG_MODE', false),
      mockApi: getBooleanEnvVar('REACT_APP_MOCK_API', false),
    };
    
    // Validate analytics configuration in production
    if (isProduction() && config.enableAnalytics) {
      if (!config.googleAnalyticsId && !config.mixpanelToken) {
        console.warn('Analytics enabled in production but no analytics tokens configured');
      }
    }
    
    return config;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error('Environment configuration error:', error.message);
      throw error;
    }
    
    throw new ConfigurationError(
      `Failed to create environment configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Environment-specific configuration helpers
 */
export const environmentHelpers = {
  /**
   * Get CORS origins for the current environment
   */
  getCorsOrigins(): string[] {
    const origins = getEnvVar('REACT_APP_CORS_ORIGINS', '');
    return origins ? origins.split(',').map(origin => origin.trim()) : [];
  },
  
  /**
   * Get timeout values based on environment
   */
  getTimeouts() {
    const baseTimeout = isProduction() ? 10000 : 5000;
    
    return {
      api: getNumericEnvVar('REACT_APP_API_TIMEOUT', baseTimeout),
      upload: getNumericEnvVar('REACT_APP_UPLOAD_TIMEOUT', baseTimeout * 3),
      analysis: getNumericEnvVar('REACT_APP_ANALYSIS_TIMEOUT', baseTimeout * 2),
    };
  },
  
  /**
   * Get rate limiting configuration
   */
  getRateLimits() {
    return {
      apiRequestsPerMinute: getNumericEnvVar('REACT_APP_RATE_LIMIT_API', 60),
      uploadRequestsPerMinute: getNumericEnvVar('REACT_APP_RATE_LIMIT_UPLOAD', 10),
      analysisRequestsPerMinute: getNumericEnvVar('REACT_APP_RATE_LIMIT_ANALYSIS', 20),
    };
  },
  
  /**
   * Get feature flag configuration
   */
  getFeatureFlags() {
    return {
      enableAnalytics: getBooleanEnvVar('REACT_APP_ENABLE_ANALYTICS', true),
      enableABTesting: getBooleanEnvVar('REACT_APP_ENABLE_A_B_TESTING', true),
      enableVirtualTryOn: getBooleanEnvVar('REACT_APP_ENABLE_VIRTUAL_TRY_ON', true),
      enableOfflineMode: getBooleanEnvVar('REACT_APP_ENABLE_OFFLINE_MODE', false),
      enableBetaFeatures: getBooleanEnvVar('REACT_APP_ENABLE_BETA_FEATURES', isDevelopment()),
    };
  },
};

// Create and export the global configuration
export const config = createEnvironmentConfig();

// Export individual configuration values for convenience
export const {
  environment,
  apiBaseUrl,
  version,
  enableAnalytics,
  enableABTesting,
  enableVirtualTryOn,
  debugMode,
  mockApi,
} = config;

// Development utilities
if (isDevelopment()) {
  // Make configuration available in browser console for debugging
  (window as Window & { __EYEWEAR_ML_CONFIG__?: EnvironmentConfig }).__EYEWEAR_ML_CONFIG__ = config;
  
  console.log('EyewearML Environment Configuration:', {
    environment: config.environment,
    apiBaseUrl: config.apiBaseUrl,
    version: config.version,
    featureFlags: {
      analytics: config.enableAnalytics,
      abTesting: config.enableABTesting,
      virtualTryOn: config.enableVirtualTryOn,
    },
    debugMode: config.debugMode,
    mockApi: config.mockApi,
  });
}