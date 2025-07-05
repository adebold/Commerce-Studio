/**
 * Global setup for VARAi e-commerce integration tests
 * 
 * This file is executed once before all tests run.
 * It sets up the test environment, including:
 * - Loading environment variables
 * - Setting up mock servers
 * - Creating test databases
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

let mongoServer;

module.exports = async () => {
  console.log('🚀 Setting up integration test environment...');
  
  // Start in-memory MongoDB server for tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Make the MongoDB URI available globally
  process.env.MONGODB_URI = mongoUri;
  
  // Set test mode
  process.env.NODE_ENV = 'test';
  
  // Set mock API keys for e-commerce platforms
  process.env.SHOPIFY_API_KEY = 'process.env.API_KEY_288';
  process.env.SHOPIFY_API_SECRET = 'process.env.API_KEY_293';
  
  process.env.MAGENTO_API_KEY = 'process.env.API_KEY_289';
  process.env.MAGENTO_API_SECRET = 'process.env.API_KEY_295';
  
  process.env.WOOCOMMERCE_API_KEY = 'process.env.API_KEY_290';
  process.env.WOOCOMMERCE_API_SECRET = 'process.env.API_KEY_297';
  
  process.env.BIGCOMMERCE_API_KEY = 'process.env.API_KEY_291';
  process.env.BIGCOMMERCE_API_SECRET = 'process.env.API_KEY_299';
  
  // Store MongoDB server instance for teardown
  global.__MONGO_SERVER__ = mongoServer;
  
  console.log('✅ Test environment setup complete');
  console.log(`📊 MongoDB running at ${mongoUri}`);
};