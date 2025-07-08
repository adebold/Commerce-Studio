/**
 * Commerce Studio Core Module
 * 
 * Centralized core services for the Commerce Studio platform.
 * Provides unified authentication, utilities, and shared functionality.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

// Export Google Cloud Authentication Service
export { default as GoogleCloudAuthService, getGoogleCloudAuthService } from './google-cloud-auth-service.js';

// Export Logging Service
export { default as LoggingService, getLoggingService, createLoggingService } from './logging-service.js';

// Export other core services
export { default as MultiModalInputProcessor } from './multi-modal-input-processor.js';
export { default as AvatarResponseGenerator } from './avatar-response-generator.js';
export { default as PositioningGuidanceTracker } from './positioning-guidance-tracker.js';
export { default as OptimalFrameCapture } from './optimal-frame-capture.js';
export { default as AvatarChatSessionManager } from './avatar-chat-session-manager.js';

// Core utilities and constants
export const CORE_VERSION = '1.0.0';
export const SUPPORTED_PLATFORMS = ['shopify', 'woocommerce', 'magento', 'html-store'];
export const DEFAULT_GOOGLE_CLOUD_REGION = 'us-central1';

/**
 * Initialize core services with configuration
 */
export async function initializeCoreServices(config = {}) {
    console.log('Initializing Commerce Studio Core Services...');
    
    const services = {};
    
    // Initialize Google Cloud Authentication if configured
    if (config.googleCloud !== false) {
        const { getGoogleCloudAuthService } = await import('./google-cloud-auth-service.js');
        services.googleCloudAuth = getGoogleCloudAuthService(config.googleCloud);
        
        if (config.autoInitialize !== false) {
            await services.googleCloudAuth.initialize();
        }
    }
    
    console.log('Commerce Studio Core Services initialized');
    return services;
}

/**
 * Get core service configuration
 */
export function getCoreConfig() {
    return {
        version: CORE_VERSION,
        supportedPlatforms: SUPPORTED_PLATFORMS,
        defaultRegion: DEFAULT_GOOGLE_CLOUD_REGION,
        environment: process.env.NODE_ENV || 'development'
    };
}