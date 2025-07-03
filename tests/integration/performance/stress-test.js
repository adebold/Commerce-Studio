/**
 * Stress testing script for VARAi platform
 * 
 * This script uses k6 to perform stress testing on the VARAi API endpoints.
 * It tests the system's behavior under extreme load conditions to identify
 * breaking points and recovery capabilities.
 * 
 * Usage:
 *   k6 run stress-test.js
 *   k6 run -e SCENARIO=api-stress stress-test.js
 *   k6 run -e SCENARIO=auth-stress stress-test.js
 *   k6 run -e SCENARIO=recommendations-stress stress-test.js
 *   k6 run -e SCENARIO=virtual-try-on-stress stress-test.js
 *   k6 run -e SCENARIO=analytics-stress stress-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import encoding from 'k6/encoding';

// Custom metrics
const errorRate = new Rate('error_rate');
const successRate = new Rate('success_rate');
const timeToFirstError = new Trend('time_to_first_error');
const requestsPerSecond = new Rate('requests_per_second');
const errorsByType = {
  timeout: new Counter('errors_timeout'),
  connection: new Counter('errors_connection'),
  http5xx: new Counter('errors_http5xx'),
  http4xx: new Counter('errors_http4xx')
};

// Configuration
const API_BASE_URL = __ENV.API_URL || 'http://api:3000';
const AUTH_BASE_URL = __ENV.AUTH_URL || 'http://auth:3001';
const RECOMMENDATION_BASE_URL = __ENV.RECOMMENDATION_URL || 'http://recommendation:3002';
const VIRTUAL_TRY_ON_BASE_URL = __ENV.VIRTUAL_TRY_ON_URL || 'http://virtual-try-on:3003';
const ANALYTICS_BASE_URL = __ENV.ANALYTICS_URL || 'http://analytics:3004';

// Test data
const testUsers = new SharedArray('users', function() {
  return [
    { email: 'stress-test-1@example.com', password: 'process.env.STRESS_TEST_SECRET' },
    { email: 'stress-test-2@example.com', password: 'process.env.STRESS_TEST_SECRET_1' },
    { email: 'stress-test-3@example.com', password: 'process.env.STRESS_TEST_SECRET_2' },
    { email: 'stress-test-4@example.com', password: 'process.env.STRESS_TEST_SECRET_3' },
    { email: 'stress-test-5@example.com', password: 'process.env.STRESS_TEST_SECRET_4' },
    { email: 'stress-test-6@example.com', password: 'process.env.STRESS_TEST_SECRET_5' },
    { email: 'stress-test-7@example.com', password: 'process.env.STRESS_TEST_SECRET_6' },
    { email: 'stress-test-8@example.com', password: 'process.env.STRESS_TEST_SECRET_7' },
    { email: 'stress-test-9@example.com', password: 'process.env.STRESS_TEST_SECRET_8' },
    { email: 'stress-test-10@example.com', password: 'process.env.STRESS_TEST_SECRET_9' }
  ];
});

const testProducts = new SharedArray('products', function() {
  return [
    { id: 'prod_001', name: 'Classic Aviator' },
    { id: 'prod_002', name: 'Vintage Round' },
    { id: 'prod_003', name: 'Modern Rectangle' },
    { id: 'prod_004', name: 'Cat Eye Sunglasses' },
    { id: 'prod_005', name: 'Oversized Square' },
    { id: 'prod_006', name: 'Slim Rectangular' },
    { id: 'prod_007', name: 'Sporty Wrap' },
    { id: 'prod_008', name: 'Clubmaster Style' },
    { id: 'prod_009', name: 'Geometric Hexagon' },
    { id: 'prod_010', name: 'Rimless Minimal' }
  ];
});

const faceShapes = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond', 'triangle'];

// Test scenarios
export const options = {
  scenarios: {
    'api-stress': {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 requests per second
        { duration: '1m', target: 30 },   // Ramp up to 30 requests per second
        { duration: '2m', target: 60 },   // Ramp up to 60 requests per second
        { duration: '1m', target: 100 },  // Ramp up to 100 requests per second
        { duration: '1m', target: 100 },  // Stay at 100 requests per second
        { duration: '1m', target: 0 }     // Ramp down to 0 requests per second
      ],
      exec: 'apiStressScenario'
    },
    'auth-stress': {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 30 },
        { duration: '2m', target: 60 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 0 }
      ],
      exec: 'authStressScenario'
    },
    'recommendations-stress': {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 30 },
        { duration: '2m', target: 60 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 0 }
      ],
      exec: 'recommendationsStressScenario'
    },
    'virtual-try-on-stress': {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 150,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '2m', target: 40 },
        { duration: '1m', target: 60 },
        { duration: '1m', target: 60 },
        { duration: '1m', target: 0 }
      ],
      exec: 'virtualTryOnStressScenario'
    },
    'analytics-stress': {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 0 }
      ],
      exec: 'analyticsStressScenario'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should complete within 2s under stress
    error_rate: ['rate<0.3'],          // Error rate should be less than 30% under stress
    success_rate: ['rate>0.7']         // Success rate should be above 70% under stress
  }
};

// Determine which scenario to run
export function setup() {
  // Create test users if they don't exist
  const adminAuth = encoding.b64encode('admin@example.com:AdminPass456!');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${adminAuth}`
  };

  // Create test users
  testUsers.forEach(user => {
    const payload = JSON.stringify({
      email: user.email,
      password: user.password,
      firstName: 'Stress',
      lastName: 'Test'
    });

    http.post(`${AUTH_BASE_URL}/admin/users`, payload, { headers });
  });

  return {
    scenario: __ENV.SCENARIO || 'api-stress',
    startTime: new Date().getTime()
  };
}

// Helper function to get auth token
function getAuthToken() {
  const user = randomItem(testUsers);
  const payload = JSON.stringify({
    email: user.email,
    password: user.password
  });

  const response = http.post(`${AUTH_BASE_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });

  const success = response.status === 200 && response.json('token') !== undefined;
  successRate.add(success);
  
  if (success) {
    return response.json('token');
  }

  // Track error types
  if (response.error_code === 'ETIMEDOUT' || response.error_code === 'ESOCKETTIMEDOUT') {
    errorsByType.timeout.add(1);
  } else if (response.error_code === 'ECONNREFUSED' || response.error_code === 'ECONNRESET') {
    errorsByType.connection.add(1);
  } else if (response.status >= 500) {
    errorsByType.http5xx.add(1);
  } else if (response.status >= 400) {
    errorsByType.http4xx.add(1);
  }

  return null;
}

// Helper function to track errors
function trackResponse(response, startTime) {
  const success = response.status >= 200 && response.status < 300;
  successRate.add(success);
  errorRate.add(!success);
  requestsPerSecond.add(1);
  
  if (!success) {
    // Track time to first error
    if (__ITER === 0) {
      const currentTime = new Date().getTime();
      timeToFirstError.add(currentTime - startTime);
    }
    
    // Track error types
    if (response.error_code === 'ETIMEDOUT' || response.error_code === 'ESOCKETTIMEDOUT') {
      errorsByType.timeout.add(1);
    } else if (response.error_code === 'ECONNREFUSED' || response.error_code === 'ECONNRESET') {
      errorsByType.connection.add(1);
    } else if (response.status >= 500) {
      errorsByType.http5xx.add(1);
    } else if (response.status >= 400) {
      errorsByType.http4xx.add(1);
    }
  }
  
  return success;
}

// API Stress Scenario
export function apiStressScenario(data) {
  const token = getAuthToken();
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  group('API Stress - Products', function() {
    // Get products with random limit and offset to stress the database
    const limit = Math.floor(Math.random() * 50) + 10; // 10-60 products
    const offset = Math.floor(Math.random() * 100);    // 0-100 offset
    
    const startTime = new Date().getTime();
    const productsResponse = http.get(`${API_BASE_URL}/products?limit=${limit}&offset=${offset}`, { headers });
    
    trackResponse(productsResponse, data.startTime);
    
    if (productsResponse.status === 200 && Array.isArray(productsResponse.json())) {
      // Get product details for a random product
      if (productsResponse.json().length > 0) {
        const randomIndex = Math.floor(Math.random() * productsResponse.json().length);
        const productId = productsResponse.json()[randomIndex].id;
        
        const productResponse = http.get(`${API_BASE_URL}/products/${productId}`, { headers });
        trackResponse(productResponse, data.startTime);
      }
    }
  });

  group('API Stress - Search', function() {
    // Perform product search with random terms
    const searchTerms = ['glasses', 'sunglasses', 'round', 'square', 'aviator', 'cat eye', 'vintage'];
    const searchTerm = randomItem(searchTerms);
    
    const searchResponse = http.get(`${API_BASE_URL}/products/search?q=${searchTerm}`, { headers });
    trackResponse(searchResponse, data.startTime);
  });

  group('API Stress - User Profile', function() {
    // Get user profile
    const profileResponse = http.get(`${API_BASE_URL}/users/me`, { headers });
    trackResponse(profileResponse, data.startTime);
    
    // Update user profile
    if (profileResponse.status === 200) {
      const updatePayload = JSON.stringify({
        firstName: `Stress${Math.floor(Math.random() * 1000)}`,
        lastName: `Test${Math.floor(Math.random() * 1000)}`
      });
      
      const updateResponse = http.put(`${API_BASE_URL}/users/me`, updatePayload, { headers });
      trackResponse(updateResponse, data.startTime);
    }
  });

  // Add a small sleep to simulate user think time and prevent absolute hammering
  sleep(Math.random() * 0.5);
}

// Auth Stress Scenario
export function authStressScenario(data) {
  group('Auth Stress - Login/Logout', function() {
    const user = randomItem(testUsers);
    const payload = JSON.stringify({
      email: user.email,
      password: user.password
    });

    const loginResponse = http.post(`${AUTH_BASE_URL}/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const loginSuccess = trackResponse(loginResponse, data.startTime);

    if (loginSuccess) {
      const token = loginResponse.json('token');
      
      // Logout
      const logoutResponse = http.post(`${AUTH_BASE_URL}/auth/logout`, null, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      trackResponse(logoutResponse, data.startTime);
    }
  });

  group('Auth Stress - Token Refresh', function() {
    const user = randomItem(testUsers);
    const payload = JSON.stringify({
      email: user.email,
      password: user.password
    });

    const loginResponse = http.post(`${AUTH_BASE_URL}/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResponse.status === 200 && loginResponse.json('refreshToken')) {
      const refreshToken = loginResponse.json('refreshToken');
      
      const refreshPayload = JSON.stringify({
        refreshToken: refreshToken
      });
      
      const refreshResponse = http.post(`${AUTH_BASE_URL}/auth/refresh`, refreshPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      trackResponse(refreshResponse, data.startTime);
    }
  });

  group('Auth Stress - Registration', function() {
    // Generate unique email for registration
    const email = `stress-${uuidv4()}@example.com`;
    const payload = JSON.stringify({
      email: email,
      password: 'process.env.STRESS_TEST_SECRET_10',
      firstName: 'Stress',
      lastName: 'Test'
    });

    const registerResponse = http.post(`${AUTH_BASE_URL}/auth/register`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    trackResponse(registerResponse, data.startTime);
  });

  // Add a small sleep to simulate user think time
  sleep(Math.random() * 0.5);
}

// Recommendations Stress Scenario
export function recommendationsStressScenario(data) {
  const token = getAuthToken();
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  group('Recommendations Stress - Face Shape', function() {
    // Get recommendations for random face shape
    const faceShape = randomItem(faceShapes);
    
    const recommendationsResponse = http.get(`${RECOMMENDATION_BASE_URL}/recommendations/face-shape/${faceShape}?limit=20`, { headers });
    trackResponse(recommendationsResponse, data.startTime);
  });

  group('Recommendations Stress - Similar Products', function() {
    // Get similar product recommendations
    const product = randomItem(testProducts);
    
    const similarResponse = http.get(`${RECOMMENDATION_BASE_URL}/recommendations/similar/${product.id}?limit=15`, { headers });
    trackResponse(similarResponse, data.startTime);
  });

  group('Recommendations Stress - Personalized', function() {
    // Get personalized recommendations
    const personalizedResponse = http.get(`${RECOMMENDATION_BASE_URL}/recommendations/personalized?limit=25`, { headers });
    trackResponse(personalizedResponse, data.startTime);
  });

  group('Recommendations Stress - Filtered', function() {
    // Get filtered recommendations
    const filters = [
      'shape=round',
      'shape=square',
      'color=black',
      'color=tortoise',
      'material=metal',
      'material=plastic',
      'price=low',
      'price=high'
    ];
    
    const randomFilters = [];
    const filterCount = Math.floor(Math.random() * 3) + 1; // 1-3 filters
    
    for (let i = 0; i < filterCount; i++) {
      const filter = randomItem(filters);
      if (!randomFilters.includes(filter)) {
        randomFilters.push(filter);
      }
    }
    
    const filterString = randomFilters.join('&');
    const filteredResponse = http.get(`${RECOMMENDATION_BASE_URL}/recommendations/filtered?${filterString}`, { headers });
    
    trackResponse(filteredResponse, data.startTime);
  });

  // Add a small sleep to simulate user think time
  sleep(Math.random() * 0.5);
}

// Virtual Try-On Stress Scenario
export function virtualTryOnStressScenario(data) {
  const token = getAuthToken();
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  group('Virtual Try-On Stress - Face Shape Detection', function() {
    // Simulate face shape detection with mock data
    const mockPayload = JSON.stringify({
      faceImageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...' // Truncated for brevity
    });
    
    const faceShapeResponse = http.post(`${VIRTUAL_TRY_ON_BASE_URL}/face-analysis/detect-shape-mock`, mockPayload, { headers });
    trackResponse(faceShapeResponse, data.startTime);
  });

  group('Virtual Try-On Stress - Frame Visualization', function() {
    // Simulate frame visualization with mock data
    const product = randomItem(testProducts);
    const faceShape = randomItem(faceShapes);
    
    const visualizePayload = JSON.stringify({
      productId: product.id,
      faceShape: faceShape,
      faceImageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...' // Truncated for brevity
    });
    
    const visualizeResponse = http.post(`${VIRTUAL_TRY_ON_BASE_URL}/try-on/visualize-mock`, visualizePayload, { headers });
    trackResponse(visualizeResponse, data.startTime);
  });

  group('Virtual Try-On Stress - History', function() {
    // Get try-on history
    const historyResponse = http.get(`${VIRTUAL_TRY_ON_BASE_URL}/try-on/history?limit=20`, { headers });
    trackResponse(historyResponse, data.startTime);
    
    // Save to history
    const product = randomItem(testProducts);
    const savePayload = JSON.stringify({
      productId: product.id,
      visualizationUrl: `https://storage.example.com/try-on/${uuidv4()}.jpg`,
      faceShape: randomItem(faceShapes),
      styleScore: Math.floor(Math.random() * 100)
    });
    
    const saveResponse = http.post(`${VIRTUAL_TRY_ON_BASE_URL}/try-on/history`, savePayload, { headers });
    trackResponse(saveResponse, data.startTime);
  });

  // Add a small sleep to simulate user think time
  sleep(Math.random() * 0.5);
}

// Analytics Stress Scenario
export function analyticsStressScenario(data) {
  const token = getAuthToken();
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  group('Analytics Stress - Track Events', function() {
    // Track various events
    const eventTypes = ['page_view', 'product_view', 'recommendation_click', 'try_on_start', 'try_on_complete', 'add_to_cart', 'checkout', 'purchase'];
    const eventType = randomItem(eventTypes);
    const product = randomItem(testProducts);
    
    const payload = JSON.stringify({
      eventType: eventType,
      properties: {
        productId: product.id,
        productName: product.name,
        source: 'stress_test',
        timestamp: new Date().toISOString(),
        sessionId: uuidv4(),
        value: Math.random() * 100
      }
    });
    
    const trackResponse = http.post(`${ANALYTICS_BASE_URL}/events/track`, payload, { headers });
    trackResponse(trackResponse, data.startTime);
  });

  group('Analytics Stress - Batch Events', function() {
    // Track batch of events
    const eventTypes = ['page_view', 'product_view', 'recommendation_click', 'try_on_start', 'try_on_complete'];
    const events = [];
    
    // Generate 5-15 random events
    const eventCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < eventCount; i++) {
      const product = randomItem(testProducts);
      events.push({
        eventType: randomItem(eventTypes),
        properties: {
          productId: product.id,
          productName: product.name,
          source: 'stress_test_batch',
          timestamp: new Date().toISOString(),
          sessionId: uuidv4()
        }
      });
    }
    
    const batchPayload = JSON.stringify({ events });
    const batchResponse = http.post(`${ANALYTICS_BASE_URL}/events/batch`, batchPayload, { headers });
    trackResponse(batchResponse, data.startTime);
  });

  group('Analytics Stress - Reports', function() {
    // Get analytics reports
    const reportTypes = ['user-activity', 'product-performance', 'conversion-rate', 'try-on-effectiveness'];
    const reportType = randomItem(reportTypes);
    
    const reportResponse = http.get(`${ANALYTICS_BASE_URL}/analytics/reports/${reportType}`, { headers });
    trackResponse(reportResponse, data.startTime);
  });

  // Add a small sleep to simulate user think time
  sleep(Math.random() * 0.3);
}

// Default function that will be executed if no scenario is specified
export default function(data) {
  apiStressScenario(data);
}

// Teardown function
export function teardown(data) {
  // Log summary of the stress test
  console.log(`Stress test completed for scenario: ${data.scenario}`);
}