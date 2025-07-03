/**
 * Global setup for Playwright tests
 * 
 * This file runs once before all Playwright tests.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.test' });

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Admin credentials for setup
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'process.env.PLAYWRIGHT_SECRET';

/**
 * Global setup function
 */
async function globalSetup() {
  console.log('🚀 Starting Playwright global setup...');
  
  // Create test directories if they don't exist
  const testResultsDir = path.resolve(__dirname, '../test-results');
  const videosDir = path.resolve(__dirname, '../test-results/videos');
  const screenshotsDir = path.resolve(__dirname, '../test-results/screenshots');
  
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Wait for services to be ready
  await waitForServices();
  
  // Create test users for UI tests
  await createTestUsers();
  
  console.log('✅ Playwright global setup completed');
}

/**
 * Wait for services to be ready
 */
async function waitForServices() {
  console.log('⏳ Waiting for services to be ready...');
  
  const maxRetries = 30;
  const retryInterval = 2000;
  
  // Wait for API service
  await waitForService(API_URL, maxRetries, retryInterval);
  
  // Wait for Auth service
  await waitForService(AUTH_URL, maxRetries, retryInterval);
  
  // Wait for Frontend service
  await waitForService(FRONTEND_URL, maxRetries, retryInterval);
  
  console.log('✅ All services are ready');
}

/**
 * Wait for a service to be ready
 */
async function waitForService(url, maxRetries, retryInterval) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(`${url}/health`);
      console.log(`✅ Service at ${url} is ready`);
      return;
    } catch (error) {
      console.log(`⏳ Waiting for service at ${url}... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  
  throw new Error(`Service at ${url} is not ready after ${maxRetries} retries`);
}

/**
 * Create test users for UI tests
 */
async function createTestUsers() {
  console.log('⏳ Creating test users for UI tests...');
  
  try {
    // Login as admin
    const loginResponse = await axios.post(`${AUTH_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const adminToken = loginResponse.data.token;
    
    // Create UI test users
    const uiTestUsers = [
      {
        email: 'ui-test-admin@example.com',
        password: 'process.env.PLAYWRIGHT_SECRET_1',
        firstName: 'UI',
        lastName: 'Admin',
        role: 'admin'
      },
      {
        email: 'ui-test-user@example.com',
        password: 'process.env.PLAYWRIGHT_SECRET_2',
        firstName: 'UI',
        lastName: 'User',
        role: 'user'
      },
      {
        email: 'ui-test-merchant@example.com',
        password: 'process.env.PLAYWRIGHT_SECRET_3',
        firstName: 'UI',
        lastName: 'Merchant',
        role: 'merchant'
      }
    ];
    
    for (const user of uiTestUsers) {
      try {
        const { role, ...userData } = user;
        
        // Create user
        const createResponse = await axios.post(`${AUTH_URL}/admin/users`, userData, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Assign role if needed
        if (role && role !== 'user') {
          await axios.post(`${AUTH_URL}/admin/users/${createResponse.data.userId}/roles`, {
            role
          }, {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          });
        }
        
        console.log(`✅ Created UI test user: ${user.email}`);
      } catch (error) {
        // If user already exists, that's fine
        if (error.response?.status === 409) {
          console.log(`ℹ️ UI test user already exists: ${user.email}`);
        } else {
          throw error;
        }
      }
    }
    
    // Save test user credentials to a file for tests to use
    const testUsersFile = path.resolve(__dirname, '../fixtures/ui-test-users.json');
    fs.writeFileSync(testUsersFile, JSON.stringify(uiTestUsers, null, 2));
    
    console.log('✅ UI test users created');
  } catch (error) {
    console.error('❌ Failed to create UI test users:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = globalSetup;