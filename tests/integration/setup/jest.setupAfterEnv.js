/**
 * Jest setup file that runs after the test environment is set up
 * 
 * This file runs after the test environment is set up but before each test file.
 */

// Import Jest matchers
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
  
  toBeValidJWT(received) {
    const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    const pass = jwtRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT`,
        pass: false,
      };
    }
  },
  
  toBeValidURL(received) {
    try {
      new URL(received);
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false,
      };
    }
  },
  
  toBeValidEmail(received) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  }
});

// Global test helpers
global.createTestUser = async () => {
  const email = `test-${uuidv4()}@example.com`;
  const password = 'process.env.JEST_SECRET';
  
  try {
    const response = await axios.post(`${global.AUTH_URL}/auth/register`, {
      email,
      password,
      firstName: 'Test',
      lastName: 'User'
    });
    
    return {
      email,
      password,
      userId: response.data.userId
    };
  } catch (error) {
    console.error('Failed to create test user:', error.response?.data || error.message);
    throw error;
  }
};

global.loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${global.AUTH_URL}/auth/login`, {
      email,
      password
    });
    
    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      user: response.data.user
    };
  } catch (error) {
    console.error('Failed to login user:', error.response?.data || error.message);
    throw error;
  }
};

global.createApiClient = (token = null) => {
  return axios.create({
    baseURL: global.API_URL,
    headers: token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  });
};

// Cleanup after each test
afterEach(async () => {
  // Add any cleanup logic here if needed
});