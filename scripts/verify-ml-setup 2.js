#!/usr/bin/env node

/**
 * ML Environment Verification Script
 * 
 * This script verifies the ML environment setup and tests connectivity
 * to the ML platform API. It can be run for different environments to
 * ensure proper configuration.
 * 
 * Usage:
 *   node verify-ml-setup.js [environment]
 * 
 * Examples:
 *   node verify-ml-setup.js development
 *   node verify-ml-setup.js staging
 */

require('dotenv').config();
const { createClient } = require('../src/ml/client');
const path = require('path');

// Define environments
const ENVIRONMENTS = ['development', 'staging', 'production', 'local'];

// Parse command line arguments
const args = process.argv.slice(2);
const targetEnv = args[0] || 'development';

// Validate environment
if (!ENVIRONMENTS.includes(targetEnv)) {
  console.error(`Error: Invalid environment "${targetEnv}"`);
  console.error(`Valid environments: ${ENVIRONMENTS.join(', ')}`);
  process.exit(1);
}

/**
 * Main verification function
 */
async function verifySetup() {
  console.log(`\n🔍 Verifying ML setup for ${targetEnv} environment...\n`);
  
  try {
    // Load environment-specific .env file
    const envFile = path.resolve(__dirname, `../src/ml/.env.${targetEnv}`);
    require('dotenv').config({ path: envFile, override: true });
    
    console.log('Environment Variables:');
    console.log(`- ML_API_BASE_URL: ${maskUrl(process.env.ML_API_BASE_URL)}`);
    console.log(`- ML_API_KEY: ${maskApiKey(process.env.ML_API_KEY)}`);
    console.log(`- ML_CLIENT_TIMEOUT: ${process.env.ML_CLIENT_TIMEOUT}`);
    console.log(`- ML_CLIENT_ENABLE_CACHE: ${process.env.ML_CLIENT_ENABLE_CACHE}`);
    console.log(`- ML_CLIENT_LOG_LEVEL: ${process.env.ML_CLIENT_LOG_LEVEL}`);
    console.log();
    
    // Create ML client
    const mlClient = createClient();
    console.log('✅ ML client created successfully');
    
    // Test API connectivity
    console.log('\nTesting API connectivity...');
    
    // Run a simple test (try to get recommendations)
    const testUserId = 'test-user-123';
    const testSessionId = `test-session-${Date.now()}`;
    
    try {
      const recommendations = await mlClient.getRecommendations(testUserId, testSessionId);
      if (Array.isArray(recommendations)) {
        console.log(`✅ API connection successful, received ${recommendations.length} recommendations`);
      } else {
        console.log('⚠️ API connected but unexpected response format');
      }
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      
      if (error.message.includes('401') || error.message.includes('authentication')) {
        console.log('\n⚠️ API key authentication failed. Please check your API key.');
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
        console.log('\n⚠️ Could not connect to the API. Please check:');
        console.log('  1. The API server is running');
        console.log('  2. The base URL is correct');
        console.log('  3. Network connectivity to the API server');
      }
    }
    
    console.log('\nVerification complete!');
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

/**
 * Mask a URL to show only the domain
 */
function maskUrl(url) {
  if (!url) return 'undefined';
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}/*******`;
  } catch (e) {
    return url;
  }
}

/**
 * Mask API key to show only the first and last few characters
 */
function maskApiKey(apiKey) {
  if (!apiKey) return 'undefined';
  if (apiKey.length < 8) return '********';
  return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
}

// Run the verification
verifySetup();
