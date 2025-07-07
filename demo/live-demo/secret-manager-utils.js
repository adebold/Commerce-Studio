/**
 * Google Secret Manager Utility for retrieving API keys
 * Handles secure retrieval of secrets from Google Cloud Secret Manager
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

class SecretManagerUtils {
    constructor() {
        this.client = new SecretManagerServiceClient();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Retrieve a secret from Google Secret Manager
     * @param {string} secretName - Full secret name (e.g., "projects/PROJECT_ID/secrets/SECRET_NAME/versions/latest")
     * @returns {Promise<string>} The secret value
     */
    async getSecret(secretName) {
        try {
            // Check cache first
            const cached = this.cache.get(secretName);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.value;
            }

            console.log(`🔐 Retrieving secret: ${secretName}`);
            
            const [version] = await this.client.accessSecretVersion({
                name: secretName,
            });

            const secretValue = version.payload.data.toString();
            
            // Cache the result
            this.cache.set(secretName, {
                value: secretValue,
                timestamp: Date.now()
            });

            console.log(`✅ Secret retrieved successfully`);
            return secretValue;
        } catch (error) {
            console.error(`❌ Failed to retrieve secret ${secretName}:`, error.message);
            throw error;
        }
    }

    /**
     * Load all NVIDIA API keys from environment variables pointing to secrets
     * @returns {Promise<Object>} Object containing all NVIDIA API keys
     */
    async loadNvidiaApiKeys() {
        const keys = {};
        
        try {
            // Load NVIDIA API Key
            if (process.env.NVIDIA_API_KEY_SECRET) {
                keys.NVIDIA_API_KEY = await this.getSecret(process.env.NVIDIA_API_KEY_SECRET);
            }

            // Load Omniverse API Key
            if (process.env.NVIDIA_OMNIVERSE_API_KEY_SECRET) {
                keys.NVIDIA_OMNIVERSE_API_KEY = await this.getSecret(process.env.NVIDIA_OMNIVERSE_API_KEY_SECRET);
            }

            // Load Riva API Key
            if (process.env.NVIDIA_RIVA_API_KEY_SECRET) {
                keys.NVIDIA_RIVA_API_KEY = await this.getSecret(process.env.NVIDIA_RIVA_API_KEY_SECRET);
            }

            // Load Merlin API Key
            if (process.env.NVIDIA_MERLIN_API_KEY_SECRET) {
                keys.NVIDIA_MERLIN_API_KEY = await this.getSecret(process.env.NVIDIA_MERLIN_API_KEY_SECRET);
            }

            console.log(`🔑 Loaded ${Object.keys(keys).length} NVIDIA API keys from Secret Manager`);
            return keys;
        } catch (error) {
            console.error('❌ Failed to load NVIDIA API keys from Secret Manager:', error.message);
            throw error;
        }
    }

    /**
     * Set environment variables from retrieved secrets
     * @param {Object} secrets - Object containing secret key-value pairs
     */
    setEnvironmentVariables(secrets) {
        Object.entries(secrets).forEach(([key, value]) => {
            process.env[key] = value;
            console.log(`✅ Set environment variable: ${key}`);
        });
    }

    /**
     * Clear the secret cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Secret cache cleared');
    }
}

export default SecretManagerUtils;