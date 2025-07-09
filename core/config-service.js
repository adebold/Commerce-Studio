/**
 * Centralized Configuration Service
 * 
 * Loads and manages configuration from multiple sources:
 * - Environment variables
 * - YAML configuration files
 * - Default values
 * 
 * Integrates with the existing GoogleCloudAuthService for streamlined maintenance.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { getLoggingService } from './logging-service.js';

class ConfigService {
    constructor() {
        this.config = {};
        this.logger = getLoggingService().child('ConfigService');
        this.isLoaded = false;
        this.environment = process.env.NODE_ENV || 'development';
    }

    /**
     * Load configuration from all sources
     */
    async load() {
        try {
            this.logger.info(`Loading configuration for environment: ${this.environment}`);
            
            // Load base configuration
            await this.loadEnvironmentConfig();
            
            // Override with environment variables
            this.loadEnvironmentVariables();
            
            // Validate required configuration
            this.validateConfiguration();
            
            this.isLoaded = true;
            this.logger.info('Configuration loaded successfully');
            
            return this.config;
            
        } catch (error) {
            this.logger.error('Failed to load configuration:', error);
            throw error;
        }
    }

    /**
     * Load environment-specific YAML configuration
     */
    async loadEnvironmentConfig() {
        const configPath = path.join(process.cwd(), 'config', 'environments', `${this.environment}.yaml`);
        
        if (fs.existsSync(configPath)) {
            try {
                const configContent = fs.readFileSync(configPath, 'utf8');
                const envConfig = yaml.load(configContent);
                
                // Merge with existing config
                this.config = this.deepMerge(this.config, envConfig);
                
                this.logger.debug(`Loaded environment config from: ${configPath}`);
            } catch (error) {
                this.logger.warn(`Failed to load environment config from ${configPath}:`, error);
            }
        } else {
            this.logger.warn(`Environment config file not found: ${configPath}`);
        }
    }

    /**
     * Load and override with environment variables
     */
    loadEnvironmentVariables() {
        const envMappings = {
            // Google Cloud
            'GOOGLE_CLOUD_PROJECT_ID': 'google_cloud.project_id',
            'GOOGLE_APPLICATION_CREDENTIALS': 'google_cloud.credentials_path',
            'GOOGLE_CLOUD_LOCATION': 'google_cloud.location',
            
            // Dialogflow
            'DIALOGFLOW_AGENT_ID': 'dialogflow.agent_id',
            'DIALOGFLOW_LOCATION': 'dialogflow.location',
            
            // API
            'PORT': 'api.port',
            'NODE_ENV': 'environment.name',
            'LOG_LEVEL': 'logging.level',
            
            // Security
            'JWT_SECRET': 'security.jwt_secret',
            'SESSION_SECRET': 'security.session_secret',
            'ENCRYPTION_KEY': 'security.encryption_key',
            
            // External Services
            'NVIDIA_API_KEY': 'external_services.nvidia.api_key',
            'SHOPIFY_WEBHOOK_SECRET': 'external_services.shopify.webhook_secret'
        };

        Object.entries(envMappings).forEach(([envVar, configPath]) => {
            const value = process.env[envVar];
            if (value) {
                this.setNestedValue(this.config, configPath, value);
                this.logger.debug(`Set ${configPath} from environment variable ${envVar}`);
            }
        });
    }

    /**
     * Validate required configuration values
     */
    validateConfiguration() {
        const required = [
            'google_cloud.project_id',
            'google_cloud.credentials_path',
            'dialogflow.agent_id'
        ];

        const missing = [];
        
        required.forEach(path => {
            if (!this.getNestedValue(this.config, path)) {
                missing.push(path);
            }
        });

        if (missing.length > 0) {
            const error = new Error(`Missing required configuration: ${missing.join(', ')}`);
            error.code = 'MISSING_CONFIG';
            error.missing = missing;
            throw error;
        }
    }

    /**
     * Get configuration value by path
     */
    get(path, defaultValue = undefined) {
        if (!this.isLoaded) {
            throw new Error('Configuration not loaded. Call load() first.');
        }
        
        return this.getNestedValue(this.config, path) || defaultValue;
    }

    /**
     * Get Google Cloud configuration for the auth service
     */
    getGoogleCloudConfig() {
        return {
            projectId: this.get('google_cloud.project_id'),
            keyFilename: this.get('google_cloud.credentials_path'),
            location: this.get('google_cloud.location'),
            serviceAccount: this.get('google_cloud.service_account')
        };
    }

    /**
     * Get Dialogflow configuration
     */
    getDialogflowConfig() {
        return {
            agentId: this.get('dialogflow.agent_id'),
            location: this.get('dialogflow.location'),
            languageCode: this.get('dialogflow.language_code'),
            sessionTimeout: this.get('dialogflow.session_timeout')
        };
    }

    /**
     * Helper: Set nested object value by path
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    /**
     * Helper: Get nested object value by path
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Helper: Deep merge objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
}

// Singleton instance
let configServiceInstance = null;

export function getConfigService() {
    if (!configServiceInstance) {
        configServiceInstance = new ConfigService();
    }
    return configServiceInstance;
}

export default ConfigService;