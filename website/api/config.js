/**
 * API Configuration Endpoint
 * Provides secure access to Google Maps API key and other configuration
 */

const express = require('express');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const router = express.Router();

// Initialize Secret Manager client
const secretClient = new SecretManagerServiceClient();

/**
 * Get Google Maps API key configuration
 * Securely retrieves API key from Google Secret Manager
 */
router.get('/maps-key', async (req, res) => {
  try {
    // Set CORS headers for frontend access
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    let apiKey;
    
    // Try to get from Google Secret Manager first (production)
    try {
      apiKey = await getSecretFromGoogleSecretManager('google-maps-api-key');
    } catch (secretError) {
      console.warn('Failed to retrieve from Secret Manager:', secretError.message);
      
      // Fallback to environment variable (development/testing)
      apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        throw new Error('Google Maps API key not configured in environment or Secret Manager');
      }
    }

    // Validate API key format (basic check)
    if (!apiKey || !apiKey.startsWith('AIza')) {
      throw new Error('Invalid Google Maps API key format');
    }

    // Return configuration
    res.json({
      apiKey: apiKey,
      libraries: ['places', 'marker'],
      loading: 'async',
      region: 'US',
      language: 'en'
    });

  } catch (error) {
    console.error('Failed to retrieve Maps API configuration:', error);
    
    // Return error response without exposing sensitive details
    res.status(500).json({
      error: 'Configuration unavailable',
      message: 'Google Maps configuration is temporarily unavailable. Please try again later.',
      fallback: {
        libraries: ['places', 'marker'],
        loading: 'async'
      }
    });
  }
});

/**
 * Get secret from Google Secret Manager
 * @param {string} secretName - Name of the secret to retrieve
 * @returns {Promise<string>} - Secret value
 */
async function getSecretFromGoogleSecretManager(secretName) {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'ml-datadriven-recos';
    const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    
    console.log(`Attempting to retrieve secret: ${secretPath}`);
    
    const [version] = await secretClient.accessSecretVersion({
      name: secretPath,
    });
    
    const secretValue = version.payload.data.toString();
    
    if (!secretValue) {
      throw new Error(`Secret ${secretName} is empty`);
    }
    
    console.log(`Successfully retrieved secret: ${secretName}`);
    return secretValue;
    
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
  }
}

/**
 * Health check endpoint for API configuration service
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-config',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Get general application configuration
 */
router.get('/app', (req, res) => {
  res.json({
    name: 'VARAi Commerce Studio',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      storeLocator: true,
      bopis: true,
      analytics: true
    },
    api: {
      baseUrl: process.env.API_BASE_URL || '/api/v1',
      timeout: 30000
    }
  });
});

module.exports = router;