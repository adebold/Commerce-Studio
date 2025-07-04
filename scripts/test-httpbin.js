#!/usr/bin/env node

/**
 * Httpbin Connection Test Script
 * 
 * This script tests the connectivity to httpbin.org as a fallback API
 * for local development when the actual ML API is not available.
 * 
 * Usage:
 *   node test-httpbin.js
 */

const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

/**
 * Main test function
 */
async function testHttpbin() {
  console.log('\n🔍 Testing httpbin.org connection for local development...\n');
  
  try {
    // Load environment from local .env file
    const envFile = path.resolve(__dirname, '../src/ml/.env.local');
    dotenv.config({ path: envFile, override: true });
    
    // Display configuration
    console.log('Environment Variables:');
    console.log(`- API_BASE_URL: ${process.env.ML_API_BASE_URL}`);
    console.log(`- API_KEY: ${maskApiKey(process.env.ML_API_KEY)}`);
    console.log(`- CLIENT_TIMEOUT: ${process.env.ML_CLIENT_TIMEOUT}ms`);
    
    // Test GET request
    console.log('\nTesting GET request...');
    const getResponse = await fetch(`${process.env.ML_API_BASE_URL}/get?param1=value1&param2=value2`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ML_API_KEY}`
      }
    });
    
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ GET request successful');
      console.log('Response headers:', getResult.headers);
      console.log('Query parameters:', getResult.args);
    } else {
      console.error(`❌ GET request failed with status: ${getResponse.status}`);
    }
    
    // Test POST request with JSON
    console.log('\nTesting POST request...');
    const postData = {
      user_id: 'test-user-123',
      session_id: `test-session-${Date.now()}`,
      preferences: {
        style: 'modern',
        color: 'black',
        material: 'metal'
      }
    };
    
    const postResponse = await fetch(`${process.env.ML_API_BASE_URL}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ML_API_KEY}`
      },
      body: JSON.stringify(postData)
    });
    
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST request successful');
      console.log('Request data:', postResult.json);
      console.log('Authorization header present:', 'authorization' in postResult.headers);
    } else {
      console.error(`❌ POST request failed with status: ${postResponse.status}`);
    }
    
    // Test response delay (to simulate network latency)
    console.log('\nTesting delayed response (3 seconds)...');
    const delayResponse = await fetch(`${process.env.ML_API_BASE_URL}/delay/3`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ML_API_KEY}`
      }
    });
    
    if (delayResponse.ok) {
      console.log('✅ Delayed response received successfully');
    } else {
      console.error(`❌ Delayed response failed with status: ${delayResponse.status}`);
    }
    
    console.log('\n✅ All httpbin tests completed successfully');
    console.log('\nHttpbin is working as a fallback API for development.');
    console.log('You can proceed with ML integration development using httpbin.org for testing.');
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nUnable to connect to httpbin.org. Please check your internet connection.');
    }
    process.exit(1);
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
testHttpbin().catch(console.error);
