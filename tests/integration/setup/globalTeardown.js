/**
 * Global teardown for Jest tests
 * 
 * This file runs once after all tests.
 */

const { MongoClient } = require('mongodb');
const axios = require('axios');
require('dotenv').config({ path: '.env.test' });

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varai_test';

// Admin credentials for teardown
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'process.env.GLOBALTEARDOWN_SECRET';

/**
 * Global teardown function
 */
module.exports = async () => {
  console.log('🧹 Starting global teardown...');
  
  // Clean up test data if needed
  if (process.env.CLEAN_TEST_DATA === 'true') {
    await cleanupTestData();
  }
  
  console.log('✅ Global teardown completed');
};

/**
 * Clean up test data
 */
async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Login as admin
    const loginResponse = await axios.post(`${AUTH_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const adminToken = loginResponse.data.token;
    
    // Clean up test users
    await cleanupTestUsers(adminToken);
    
    // Clean up test products
    await cleanupTestProducts(adminToken);
    
    // Clean up test data in MongoDB
    await cleanupMongoDB();
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Failed to clean up test data:', error.response?.data || error.message);
    // Don't throw error here, as we want the teardown to complete even if cleanup fails
  }
}

/**
 * Clean up test users
 */
async function cleanupTestUsers(adminToken) {
  const testUserEmails = [
    'vto-test@example.com',
    'recommendations-test@example.com',
    'analytics-test@example.com',
    'performance-test@example.com'
  ];
  
  // Also clean up dynamically created test users
  try {
    const response = await axios.get(`${AUTH_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dynamicTestUsers = response.data
      .filter(user => user.email.startsWith('test-') && user.email.includes('@example.com'));
    
    testUserEmails.push(...dynamicTestUsers.map(user => user.email));
  } catch (error) {
    console.error('❌ Failed to get dynamic test users:', error.response?.data || error.message);
  }
  
  for (const email of testUserEmails) {
    try {
      await axios.delete(`${AUTH_URL}/admin/users/${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Deleted test user: ${email}`);
    } catch (error) {
      // If user doesn't exist, that's fine
      if (error.response?.status === 404) {
        console.log(`ℹ️ Test user doesn't exist: ${email}`);
      } else {
        console.error(`❌ Failed to delete test user ${email}:`, error.response?.data || error.message);
      }
    }
  }
}

/**
 * Clean up test products
 */
async function cleanupTestProducts(adminToken) {
  const testProductNames = [
    'Classic Aviator',
    'Vintage Round',
    'Modern Rectangle',
    'Cat Eye Sunglasses',
    'Oversized Square'
  ];
  
  // Get all products
  try {
    const response = await axios.get(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const products = response.data;
    
    for (const product of products) {
      if (testProductNames.includes(product.name)) {
        try {
          await axios.delete(`${API_URL}/products/${product.id}`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`✅ Deleted test product: ${product.name}`);
        } catch (error) {
          console.error(`❌ Failed to delete test product ${product.name}:`, error.response?.data || error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to get products:', error.response?.data || error.message);
  }
}

/**
 * Clean up MongoDB test data
 */
async function cleanupMongoDB() {
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    
    // Clean up test data in various collections
    // This is a safer approach than dropping the entire database
    
    // Clean up test users
    await db.collection('users').deleteMany({
      email: {
        $in: [
          'vto-test@example.com',
          'recommendations-test@example.com',
          'analytics-test@example.com',
          'performance-test@example.com'
        ]
      }
    });
    
    // Clean up dynamically created test users
    await db.collection('users').deleteMany({
      email: { $regex: /^test-.*@example\.com$/ }
    });
    
    // Clean up test products
    await db.collection('products').deleteMany({
      name: {
        $in: [
          'Classic Aviator',
          'Vintage Round',
          'Modern Rectangle',
          'Cat Eye Sunglasses',
          'Oversized Square'
        ]
      }
    });
    
    // Clean up test virtual try-on history
    await db.collection('tryOnHistory').deleteMany({
      userId: { $in: await getTestUserIds(db) }
    });
    
    // Clean up test analytics events
    await db.collection('events').deleteMany({
      userId: { $in: await getTestUserIds(db) }
    });
    
    console.log('✅ MongoDB test data cleaned up');
  } catch (error) {
    console.error('❌ Failed to clean up MongoDB test data:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Get test user IDs from MongoDB
 */
async function getTestUserIds(db) {
  try {
    const testUsers = await db.collection('users').find({
      $or: [
        {
          email: {
            $in: [
              'vto-test@example.com',
              'recommendations-test@example.com',
              'analytics-test@example.com',
              'performance-test@example.com'
            ]
          }
        },
        {
          email: { $regex: /^test-.*@example\.com$/ }
        }
      ]
    }).toArray();
    
    return testUsers.map(user => user._id.toString());
  } catch (error) {
    console.error('❌ Failed to get test user IDs:', error);
    return [];
  }
}