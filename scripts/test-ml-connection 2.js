#!/usr/bin/env node

/**
 * ML API Connection Test Script
 * 
 * This script tests the connectivity to the ML API server for any environment.
 * 
 * Usage:
 *   node test-ml-connection.js [environment]
 * 
 * Examples:
 *   node test-ml-connection.js local
 *   node test-ml-connection.js development
 *   node test-ml-connection.js staging
 */

const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('../src/ml/client');

// Define environments
const ENVIRONMENTS = ['development', 'staging', 'production', 'local'];

// Parse command line arguments
const args = process.argv.slice(2);
const targetEnv = args[0] || 'local';

// Validate environment
if (!ENVIRONMENTS.includes(targetEnv)) {
  console.error(`Error: Invalid environment "${targetEnv}"`);
  console.error(`Valid environments: ${ENVIRONMENTS.join(', ')}`);
  process.exit(1);
}

/**
 * Main test function
 */
async function testMlConnection() {
  console.log(`\n🔍 Testing ML API connection for ${targetEnv} environment...\n`);
  
  try {
    // Load environment-specific .env file
    const envFile = path.resolve(__dirname, `../src/ml/.env.${targetEnv}`);
    dotenv.config({ path: envFile, override: true });
    
    // Display configuration
    console.log('Environment Variables:');
    console.log(`- ML_API_BASE_URL: ${maskUrl(process.env.ML_API_BASE_URL)}`);
    console.log(`- ML_API_KEY: ${maskApiKey(process.env.ML_API_KEY)}`);
    console.log(`- ML_CLIENT_TIMEOUT: ${process.env.ML_CLIENT_TIMEOUT}ms`);
    console.log(`- ML_CLIENT_ENABLE_CACHE: ${process.env.ML_CLIENT_ENABLE_CACHE}`);
    console.log(`- ML_CLIENT_LOG_LEVEL: ${process.env.ML_CLIENT_LOG_LEVEL}`);
    
    // Create ML client
    console.log('\nCreating ML client...');
    const mlClient = createClient();
    console.log('✅ ML client created successfully');
    
    // Test recommendations
    console.log('\nTesting recommendations endpoint...');
    const testUserId = 'test-user-' + Date.now();
    const testSessionId = 'test-session-' + Date.now();
    
    try {
      // Get recommendations
      console.log(`Requesting recommendations for user: ${testUserId}`);
      const recommendations = await mlClient.getRecommendations(testUserId, testSessionId);
      
      // Display results
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        console.log(`✅ Received ${recommendations.length} recommendations`);
        console.log('\nSample recommendation:');
        console.log(JSON.stringify(recommendations[0], null, 2));
      } else if (Array.isArray(recommendations)) {
        console.log(`✅ Received empty recommendations array`);
      } else {
        console.log(`⚠️ Unexpected response format:`);
        console.log(JSON.stringify(recommendations, null, 2));
      }
    } catch (error) {
      console.error(`❌ Failed to get recommendations: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log('\n🏁 Connection test completed');
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
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

// Run the test
testMlConnection().catch(console.error);
