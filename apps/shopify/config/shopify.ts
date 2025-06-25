import { shopifyApi, LATEST_API_VERSION, LogSeverity, ApiVersion } from '@shopify/shopify-api';
import { MemorySessionStorage } from '@shopify/shopify-app-session-storage-memory';
import { logger } from '../utils/logger';

// Validate and get required environment variables
const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} must be set`);
  return value;
};

const SHOPIFY_API_KEY = getRequiredEnvVar('SHOPIFY_API_KEY');
const SHOPIFY_API_SECRET = getRequiredEnvVar('SHOPIFY_API_SECRET');
// Use VERCEL_URL if available, otherwise fallback to HOST_NAME
const HOST_NAME = process.env.VERCEL_URL || process.env.HOST_NAME || '';
if (!HOST_NAME) {
  throw new Error('Either VERCEL_URL or HOST_NAME must be set');
}

// Use memory session storage for Vercel serverless environment
// Note: This is not ideal for production with multiple instances, but works for a single instance
const sessionStorage = new MemorySessionStorage();

// Log a warning about using memory storage
logger.warn('Using in-memory session storage. This is not recommended for production with multiple instances.');

// Shared Shopify API configuration
export const shopifyConfig = {
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: ['read_products', 'write_products', 'read_themes', 'write_themes'],
  hostName: HOST_NAME,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage,
  logger: {
    level: LogSeverity.Info,
    httpRequests: true,
    timestamps: true,
    log: (severity: LogSeverity, message: string, context?: object) => {
      switch (severity) {
        case LogSeverity.Error:
          logger.error(message, context);
          break;
        case LogSeverity.Warning:
          logger.warn(message, context);
          break;
        case LogSeverity.Info:
          logger.info(message, context);
          break;
        case LogSeverity.Debug:
          logger.debug(message, context);
          break;
      }
    }
  }
};

// Initialize Shopify API instance
export const shopify = shopifyApi(shopifyConfig);
