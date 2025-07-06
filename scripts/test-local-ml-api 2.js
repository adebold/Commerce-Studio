#!/usr/bin/env node

/**
 * Test Script for Local ML API
 * 
 * This script tests the connectivity to the local ML API server
 * without relying on other services.
 * 
 * Usage:
 *   node test-local-ml-api.js
 */

require('dotenv').config({ path: 'src/ml/.env.local' });
const fetch = require('node-fetch');

const API_BASE_URL = process.env.ML_API_BASE_URL || 'http://localhost:5000/api';
const API_KEY = process.env.ML_API_KEY || 'local-dev-key';

/**
 * Main function
 */
async function testLocalMlApi() {
  console.log('\n🔍 Testing local ML API connectivity...\n');
  
  console.log('Configuration:');
  console.log(`- API Base URL: ${API_BASE_URL}`);
  console.log(`- API Key: ${maskApiKey(API_KEY)}`);
  
  try {
    // First test the root endpoint
    console.log('\nTesting root endpoint...');
    const rootResponse = await fetch(API_BASE_URL.replace('/api', ''), {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (rootResponse.ok) {
      console.log('✅ Root endpoint accessible');
      console.log('Response:', await rootResponse.json());
    } else {
      console.error(`❌ Root endpoint returned status: ${rootResponse.status}`);
    }
    
    // Test recommendations endpoint
    console.log('\nTesting recommendations endpoint...');
    const recommendationsResponse = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        user_id: 'test-user-123',
        session_id: `test-session-${Date.now()}`
      })
    });
    
    if (recommendationsResponse.ok) {
      const recommendations = await recommendationsResponse.json();
      console.log(`✅ Recommendations endpoint returned ${recommendations.length} recommendations`);
      console.log('Sample recommendation:', recommendations[0]);
    } else {
      console.error(`❌ Recommendations endpoint returned status: ${recommendationsResponse.status}`);
    }
    
    console.log('\n✅ Local ML API test complete!');
  } catch (error) {
    console.error('\n❌ Error testing local ML API:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nMake sure the local ML API server is running with:');
      console.log('node scripts/start-local-ml-api.js');
    }
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
testLocalMlApi();
