/**
 * Global setup for Jest tests
 * 
 * This file runs once before all tests.
 */

const axios = require('axios');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.test' });

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varai_test';

// Admin credentials for setup
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'process.env.GLOBALSETUP_SECRET';

/**
 * Global setup function
 */
module.exports = async () => {
  console.log('🚀 Starting global setup...');
  
  // Create test directories if they don't exist
  const testResultsDir = path.resolve(__dirname, '../test-results');
  const allureResultsDir = path.resolve(__dirname, '../allure-results');
  const fixturesDir = path.resolve(__dirname, '../fixtures');
  
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }
  
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  // Wait for services to be ready
  await waitForServices();
  
  // Initialize test data
  await initializeTestData();
  
  console.log('✅ Global setup completed');
};

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
  
  // Wait for MongoDB
  await waitForMongoDB(MONGODB_URI, maxRetries, retryInterval);
  
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
 * Wait for MongoDB to be ready
 */
async function waitForMongoDB(uri, maxRetries, retryInterval) {
  let client;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      client = new MongoClient(uri);
      await client.connect();
      await client.db().admin().ping();
      console.log('✅ MongoDB is ready');
      await client.close();
      return;
    } catch (error) {
      console.log(`⏳ Waiting for MongoDB... (${i + 1}/${maxRetries})`);
      if (client) {
        await client.close().catch(() => {});
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  
  throw new Error(`MongoDB is not ready after ${maxRetries} retries`);
}

/**
 * Initialize test data
 */
async function initializeTestData() {
  console.log('⏳ Initializing test data...');
  
  try {
    // Login as admin
    const loginResponse = await axios.post(`${AUTH_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const adminToken = loginResponse.data.token;
    
    // Create test users
    await createTestUsers(adminToken);
    
    // Create test products
    await createTestProducts(adminToken);
    
    console.log('✅ Test data initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test data:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create test users
 */
async function createTestUsers(adminToken) {
  const testUsers = [
    {
      email: 'vto-test@example.com',
      password: 'process.env.GLOBALSETUP_SECRET_1',
      firstName: 'VTO',
      lastName: 'Test'
    },
    {
      email: 'recommendations-test@example.com',
      password: 'process.env.GLOBALSETUP_SECRET_2',
      firstName: 'Recommendations',
      lastName: 'Test'
    },
    {
      email: 'analytics-test@example.com',
      password: 'process.env.GLOBALSETUP_SECRET_3',
      firstName: 'Analytics',
      lastName: 'Test'
    },
    {
      email: 'performance-test@example.com',
      password: 'process.env.GLOBALSETUP_SECRET_4',
      firstName: 'Performance',
      lastName: 'Test'
    }
  ];
  
  for (const user of testUsers) {
    try {
      await axios.post(`${AUTH_URL}/admin/users`, user, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Created test user: ${user.email}`);
    } catch (error) {
      // If user already exists, that's fine
      if (error.response?.status === 409) {
        console.log(`ℹ️ Test user already exists: ${user.email}`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Create test products
 */
async function createTestProducts(adminToken) {
  // Check if test products already exist
  try {
    const response = await axios.get(`${API_URL}/products?limit=1`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.length > 0) {
      console.log('ℹ️ Test products already exist');
      return;
    }
  } catch (error) {
    console.error('❌ Failed to check for existing products:', error.response?.data || error.message);
  }
  
  // Create test products
  const testProducts = [
    {
      name: 'Classic Aviator',
      description: 'Timeless aviator style with metal frame',
      price: 129.99,
      imageUrl: 'https://example.com/images/aviator.jpg',
      attributes: {
        shape: 'aviator',
        material: 'metal',
        color: 'gold',
        faceShapeCompatibility: ['oval', 'square', 'heart']
      }
    },
    {
      name: 'Vintage Round',
      description: 'Retro-inspired round frames',
      price: 99.99,
      imageUrl: 'https://example.com/images/round.jpg',
      attributes: {
        shape: 'round',
        material: 'acetate',
        color: 'tortoise',
        faceShapeCompatibility: ['square', 'diamond', 'heart']
      }
    },
    {
      name: 'Modern Rectangle',
      description: 'Contemporary rectangular frames',
      price: 149.99,
      imageUrl: 'https://example.com/images/rectangle.jpg',
      attributes: {
        shape: 'rectangle',
        material: 'acetate',
        color: 'black',
        faceShapeCompatibility: ['oval', 'round', 'heart']
      }
    },
    {
      name: 'Cat Eye Sunglasses',
      description: 'Elegant cat eye sunglasses',
      price: 159.99,
      imageUrl: 'https://example.com/images/cateye.jpg',
      attributes: {
        shape: 'cat-eye',
        material: 'acetate',
        color: 'red',
        faceShapeCompatibility: ['oval', 'square', 'diamond']
      }
    },
    {
      name: 'Oversized Square',
      description: 'Bold oversized square frames',
      price: 179.99,
      imageUrl: 'https://example.com/images/square.jpg',
      attributes: {
        shape: 'square',
        material: 'acetate',
        color: 'blue',
        faceShapeCompatibility: ['oval', 'heart', 'diamond']
      }
    }
  ];
  
  for (const product of testProducts) {
    try {
      await axios.post(`${API_URL}/products`, product, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Created test product: ${product.name}`);
    } catch (error) {
      console.error(`❌ Failed to create test product ${product.name}:`, error.response?.data || error.message);
      throw error;
    }
  }
}