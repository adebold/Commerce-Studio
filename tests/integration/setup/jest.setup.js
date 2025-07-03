/**
 * Jest setup file
 * 
 * This file runs before each test file.
 */

// Load environment variables from .env.test file
require('dotenv').config({ path: '.env.test' });

// Set default timeout for all tests
jest.setTimeout(30000);

// Global variables
global.API_URL = process.env.API_URL || 'http://localhost:3000';
global.AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
global.RECOMMENDATION_URL = process.env.RECOMMENDATION_URL || 'http://localhost:3002';
global.VIRTUAL_TRY_ON_URL = process.env.VIRTUAL_TRY_ON_URL || 'http://localhost:3003';
global.ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:3004';
global.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Mock data paths
global.FIXTURES_PATH = require('path').resolve(__dirname, '../fixtures');

// Console output configuration
// Silence console.log during tests but keep errors and warnings
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (process.env.DEBUG === 'true') {
    originalConsoleLog(...args);
  }
};

// Keep console.error and console.warn as is
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  originalConsoleWarn(...args);
};