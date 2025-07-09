/**
 * Centralized Google Cloud Authentication Service
 * 
 * Provides unified authentication for all Google Cloud services across the Commerce Studio platform.
 * Eliminates duplication of authentication logic in individual applications.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { GoogleAuth } from 'google-auth-library';
import { SpeechClient } from '@google-cloud/speech';
import { SessionsClient } from '@google-cloud/dialogflow-cx';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { getLoggingService } from './logging-service.js';
import { getConfigService } from './config-service.js';

class GoogleCloudAuthService extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Get centralized configuration
        const configService = getConfigService();
        const gcpConfig = configService.isLoaded ? configService.getGoogleCloudConfig() : {};
        
        this.config = {
            projectId: config.projectId || gcpConfig.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID || 'eyewearml-conversational-ai',
            keyFilename: config.keyFilename || gcpConfig.keyFilename || process.env.GOOGLE_APPLICATION_CREDENTIALS,
            location: config.location || gcpConfig.location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
            scopes: config.scopes || [
                'https://www.googleapis.com/auth/cloud-platform',
                'https://www.googleapis.com/auth/dialogflow',
                'https://www.googleapis.com/auth/speech',
                'https://www.googleapis.com/auth/texttospeech'
            ],
            ...config
        };
        
        this.auth = null;
        this.credentials = null;
        this.isInitialized = false;
        this.authCache = new Map();
        this.logger = getLoggingService().child('GoogleCloudAuth');
        
        // Service-specific client configurations
        this.serviceConfigs = {
            dialogflow: {
                apiEndpoint: this.config.location === 'us-central1' 
                    ? 'us-central1-dialogflow.googleapis.com' 
                    : null
            },
            speech: {
                languageCode: 'en-US'
            },
            textToSpeech: {
                languageCode: 'en-US'
            }
        };
    }

    /**
     * Initialize the Google Cloud authentication service
     */
    async initialize() {
        try {
            this.logger.info('Initializing Google Cloud Authentication Service...');
            
            // Validate configuration
            this.validateConfiguration();
            
            // Initialize Google Auth
            this.auth = new GoogleAuth({
                projectId: this.config.projectId,
                keyFilename: this.config.keyFilename,
                scopes: this.config.scopes
            });
            
            // Get credentials
            this.credentials = await this.auth.getCredentials();
            
            // Test authentication
            await this.testAuthentication();
            
            this.isInitialized = true;
            console.log(`Google Cloud Authentication initialized for project: ${this.config.projectId}`);
            
            this.emit('initialized', {
                projectId: this.config.projectId,
                location: this.config.location
            });
            
            return true;
            
        } catch (error) {
            console.error('Failed to initialize Google Cloud Authentication:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Validate the authentication configuration
     */
    validateConfiguration() {
        if (!this.config.projectId) {
            throw new Error('Google Cloud Project ID is required. Set GOOGLE_CLOUD_PROJECT_ID environment variable.');
        }
        
        // Check for authentication method
        const hasCredentialsFile = this.config.keyFilename && this.config.keyFilename !== '';
        const hasApplicationDefaultCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const isRunningOnGCP = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
        
        if (!hasCredentialsFile && !hasApplicationDefaultCredentials && !isRunningOnGCP) {
            console.warn('No explicit credentials found. Will attempt to use Application Default Credentials.');
        }
        
        console.log('Google Cloud Authentication Configuration:');
        console.log(`  Project ID: ${this.config.projectId}`);
        console.log(`  Location: ${this.config.location}`);
        console.log(`  Credentials File: ${hasCredentialsFile ? 'Configured' : 'Not configured'}`);
        console.log(`  Application Default Credentials: ${hasApplicationDefaultCredentials ? 'Available' : 'Not available'}`);
    }

    /**
     * Test authentication by making a simple API call
     */
    async testAuthentication() {
        try {
            const client = await this.auth.getClient();
            const projectId = await this.auth.getProjectId();
            
            if (projectId !== this.config.projectId) {
                console.warn(`Project ID mismatch: configured=${this.config.projectId}, authenticated=${projectId}`);
            }
            
            console.log(`Authentication test successful for project: ${projectId}`);
            return true;
            
        } catch (error) {
            console.error('Authentication test failed:', error);
            throw new Error(`Google Cloud authentication failed: ${error.message}`);
        }
    }

    /**
     * Get authenticated client for a specific service
     */
    async getServiceClient(serviceName, clientClass, additionalOptions = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const cacheKey = `${serviceName}_${JSON.stringify(additionalOptions)}`;
        
        if (this.authCache.has(cacheKey)) {
            return this.authCache.get(cacheKey);
        }
        
        try {
            const baseOptions = {
                projectId: this.config.projectId,
                auth: this.auth
            };
            
            // Add service-specific configurations
            if (this.serviceConfigs[serviceName]) {
                Object.assign(baseOptions, this.serviceConfigs[serviceName]);
            }
            
            // Merge with additional options
            const clientOptions = { ...baseOptions, ...additionalOptions };
            
            const client = new clientClass(clientOptions);
            
            // Cache the client
            this.authCache.set(cacheKey, client);
            
            console.log(`Created authenticated ${serviceName} client`);
            return client;
            
        } catch (error) {
            console.error(`Failed to create ${serviceName} client:`, error);
            throw error;
        }
    }

    /**
     * Get Dialogflow CX Sessions Client
     */
    async getDialogflowClient(options = {}) {
        const dialogflowOptions = {
            ...options
        };
        
        // Set regional endpoint for Dialogflow CX
        if (this.config.location === 'us-central1') {
            dialogflowOptions.apiEndpoint = 'us-central1-dialogflow.googleapis.com';
        }
        
        return this.getServiceClient('dialogflow', SessionsClient, dialogflowOptions);
    }

    /**
     * Get Speech Client
     */
    async getSpeechClient(options = {}) {
        return this.getServiceClient('speech', SpeechClient, options);
    }

    /**
     * Get Text-to-Speech Client
     */
    async getTextToSpeechClient(options = {}) {
        return this.getServiceClient('textToSpeech', TextToSpeechClient, options);
    }

    /**
     * Get Secret Manager Client
     */
    async getSecretManagerClient(options = {}) {
        return this.getServiceClient('secretManager', SecretManagerServiceClient, options);
    }

    /**
     * Get authentication credentials for manual client creation
     */
    async getCredentials() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        return {
            projectId: this.config.projectId,
            auth: this.auth,
            credentials: this.credentials,
            location: this.config.location
        };
    }

    /**
     * Check if the service is properly authenticated
     */
    isAuthenticated() {
        return this.isInitialized && this.auth !== null;
    }

    /**
     * Get project information
     */
    getProjectInfo() {
        return {
            projectId: this.config.projectId,
            location: this.config.location,
            isAuthenticated: this.isAuthenticated()
        };
    }

    /**
     * Clear authentication cache
     */
    clearCache() {
        this.authCache.clear();
        console.log('Google Cloud authentication cache cleared');
    }

    /**
     * Shutdown the authentication service
     */
    async shutdown() {
        this.clearCache();
        this.isInitialized = false;
        this.auth = null;
        this.credentials = null;
        
        this.emit('shutdown');
        console.log('Google Cloud Authentication Service shutdown');
    }
}

// Export singleton instance
let authServiceInstance = null;

export function getGoogleCloudAuthService(config = {}) {
    if (!authServiceInstance) {
        authServiceInstance = new GoogleCloudAuthService(config);
    }
    return authServiceInstance;
}

export default GoogleCloudAuthService;