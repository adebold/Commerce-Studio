/**
 * Integration tests for virtual try-on functionality
 * 
 * These tests verify that the virtual try-on feature works correctly,
 * including photo capture, face shape detection, frame visualization,
 * and integration with the recommendation engine.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Test configuration
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  virtualTryOnUrl: process.env.VIRTUAL_TRY_ON_URL || 'http://localhost:3003',
  recommendationUrl: process.env.RECOMMENDATION_URL || 'http://localhost:3002',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
  testImages: {
    faceFront: path.resolve(__dirname, '../../fixtures/face-front.jpg'),
    faceSide: path.resolve(__dirname, '../../fixtures/face-side.jpg'),
    faceAngle: path.resolve(__dirname, '../../fixtures/face-angle.jpg'),
    noFace: path.resolve(__dirname, '../../fixtures/no-face.jpg'),
    multipleFaces: path.resolve(__dirname, '../../fixtures/multiple-faces.jpg')
  },
  testUser: {
    email: 'vto-test@example.com',
    password: 'process.env.VIRTUAL_TRY_ON_FLOW_SECRET'
  }
};

// Helper function to create API client
function createApiClient(token = null) {
  return axios.create({
    baseURL: config.apiUrl,
    headers: token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  });
}

// Helper function to create Virtual Try-On API client
function createVtoClient(token = null) {
  return axios.create({
    baseURL: config.virtualTryOnUrl,
    headers: token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  });
}

test.describe('Virtual Try-On API Integration', () => {
  let apiClient;
  let vtoClient;
  let userToken;
  let testProductId;

  test.beforeAll(async () => {
    // Login to get user token
    apiClient = createApiClient();
    
    try {
      const loginResponse = await apiClient.post('/auth/login', {
        email: config.testUser.email,
        password: config.testUser.password
      });
      
      userToken = loginResponse.data.token;
      apiClient = createApiClient(userToken);
      vtoClient = createVtoClient(userToken);
      
      // Get a test product ID
      const productsResponse = await apiClient.get('/products?limit=1');
      testProductId = productsResponse.data[0].id;
    } catch (error) {
      console.error('Setup failed:', error.response?.data || error.message);
      throw error;
    }
  });

  test('should detect face shape from image', async () => {
    // Create form data with image
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImages.faceFront));
    
    // Send request to detect face shape
    const response = await vtoClient.post('/face-analysis/detect-shape', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('faceShape');
    expect(['oval', 'round', 'square', 'heart', 'oblong', 'diamond', 'triangle']).toContain(response.data.faceShape);
    expect(response.data).toHaveProperty('confidence');
    expect(response.data.confidence).toBeGreaterThan(0.5);
    expect(response.data).toHaveProperty('faceDetection');
    expect(response.data.faceDetection).toHaveProperty('boundingBox');
  });

  test('should handle image with no face', async () => {
    // Create form data with image that has no face
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImages.noFace));
    
    try {
      // Send request to detect face shape
      await vtoClient.post('/face-analysis/detect-shape', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      // If we get here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Verify error response
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.message).toContain('No face detected');
    }
  });

  test('should handle image with multiple faces', async () => {
    // Create form data with image that has multiple faces
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImages.multipleFaces));
    
    try {
      // Send request to detect face shape
      await vtoClient.post('/face-analysis/detect-shape', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      // If we get here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Verify error response
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.message).toContain('Multiple faces detected');
    }
  });

  test('should generate frame visualization', async () => {
    // Create form data with image
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImages.faceFront));
    formData.append('productId', testProductId);
    
    // Send request to generate frame visualization
    const response = await vtoClient.post('/try-on/visualize', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('visualizationUrl');
    expect(response.data.visualizationUrl).toMatch(/^https?:\/\//);
    expect(response.data).toHaveProperty('faceShape');
    expect(response.data).toHaveProperty('styleScore');
    expect(response.data.styleScore).toBeGreaterThanOrEqual(0);
    expect(response.data.styleScore).toBeLessThanOrEqual(100);
  });

  test('should save try-on history', async () => {
    // Create form data with image
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImages.faceFront));
    formData.append('productId', testProductId);
    
    // Send request to generate frame visualization
    const visualizeResponse = await vtoClient.post('/try-on/visualize', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    // Save try-on to history
    const saveResponse = await vtoClient.post('/try-on/history', {
      productId: testProductId,
      visualizationUrl: visualizeResponse.data.visualizationUrl,
      faceShape: visualizeResponse.data.faceShape,
      styleScore: visualizeResponse.data.styleScore
    });
    
    // Verify response
    expect(saveResponse.status).toBe(201);
    expect(saveResponse.data).toHaveProperty('id');
    
    // Get try-on history
    const historyResponse = await vtoClient.get('/try-on/history');
    
    // Verify history contains the saved try-on
    expect(historyResponse.status).toBe(200);
    expect(Array.isArray(historyResponse.data)).toBe(true);
    expect(historyResponse.data.length).toBeGreaterThan(0);
    
    const savedTryOn = historyResponse.data.find(item => item.id === saveResponse.data.id);
    expect(savedTryOn).toBeDefined();
    expect(savedTryOn.productId).toBe(testProductId);
    expect(savedTryOn.visualizationUrl).toBe(visualizeResponse.data.visualizationUrl);
  });

  test('should get frame recommendations based on face shape', async () => {
    // Create form data with image
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImages.faceFront));
    
    // Send request to detect face shape
    const faceShapeResponse = await vtoClient.post('/face-analysis/detect-shape', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    // Get recommendations based on face shape
    const recommendationsResponse = await apiClient.get(`/recommendations/face-shape/${faceShapeResponse.data.faceShape}`);
    
    // Verify response
    expect(recommendationsResponse.status).toBe(200);
    expect(Array.isArray(recommendationsResponse.data)).toBe(true);
    expect(recommendationsResponse.data.length).toBeGreaterThan(0);
    
    // Verify recommendations include compatibility score
    recommendationsResponse.data.forEach(recommendation => {
      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('name');
      expect(recommendation).toHaveProperty('compatibilityScore');
      expect(recommendation.compatibilityScore).toBeGreaterThan(0);
    });
  });

  test('should compare multiple frames', async () => {
    // Get two product IDs for comparison
    const productsResponse = await apiClient.get('/products?limit=2');
    const productId1 = productsResponse.data[0].id;
    const productId2 = productsResponse.data[1].id;
    
    // Create form data with image
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImages.faceFront));
    
    // Generate visualization for first product
    formData.append('productId', productId1);
    const visualization1Response = await vtoClient.post('/try-on/visualize', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    // Update form data for second product
    formData.set('productId', productId2);
    const visualization2Response = await vtoClient.post('/try-on/visualize', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    // Compare the two products
    const compareResponse = await vtoClient.post('/try-on/compare', {
      comparisons: [
        {
          productId: productId1,
          visualizationUrl: visualization1Response.data.visualizationUrl,
          styleScore: visualization1Response.data.styleScore
        },
        {
          productId: productId2,
          visualizationUrl: visualization2Response.data.visualizationUrl,
          styleScore: visualization2Response.data.styleScore
        }
      ]
    });
    
    // Verify response
    expect(compareResponse.status).toBe(200);
    expect(compareResponse.data).toHaveProperty('comparisonId');
    expect(compareResponse.data).toHaveProperty('comparisonUrl');
    expect(compareResponse.data).toHaveProperty('products');
    expect(compareResponse.data.products).toHaveLength(2);
    expect(compareResponse.data.products[0].productId).toBe(productId1);
    expect(compareResponse.data.products[1].productId).toBe(productId2);
  });
});

test.describe('Virtual Try-On UI Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${config.frontendUrl}/login`);
    await page.fill('input[type="email"]', config.testUser.email);
    await page.fill('input[type="password"]', config.testUser.password);
    await page.click('button[type="submit"]');
    
    // Navigate to virtual try-on page
    await page.goto(`${config.frontendUrl}/virtual-try-on`);
    
    // Wait for page to load
    await page.waitForSelector('.virtual-try-on-container');
  });

  test('should upload photo and detect face shape', async ({ page }) => {
    // Upload photo
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(config.testImages.faceFront);
    
    // Wait for face detection to complete
    await page.waitForSelector('.face-shape-result', { state: 'visible' });
    
    // Verify face shape is detected
    const faceShapeText = await page.textContent('.face-shape-result');
    expect(faceShapeText).toMatch(/Face Shape: (oval|round|square|heart|oblong|diamond|triangle)/);
    
    // Verify face detection visualization is shown
    await expect(page.locator('.face-detection-overlay')).toBeVisible();
  });

  test('should select frame and visualize try-on', async ({ page }) => {
    // Upload photo
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(config.testImages.faceFront);
    
    // Wait for face detection to complete
    await page.waitForSelector('.face-shape-result', { state: 'visible' });
    
    // Select a frame
    await page.click('.frame-selector .frame-option:first-child');
    
    // Wait for try-on visualization to load
    await page.waitForSelector('.try-on-visualization', { state: 'visible' });
    
    // Verify visualization is shown
    await expect(page.locator('.try-on-visualization img')).toBeVisible();
    
    // Verify style score is shown
    const styleScoreText = await page.textContent('.style-score');
    expect(styleScoreText).toMatch(/Style Score: \d+/);
  });

  test('should compare multiple frames', async ({ page }) => {
    // Upload photo
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(config.testImages.faceFront);
    
    // Wait for face detection to complete
    await page.waitForSelector('.face-shape-result', { state: 'visible' });
    
    // Select first frame
    await page.click('.frame-selector .frame-option:nth-child(1)');
    
    // Wait for try-on visualization to load
    await page.waitForSelector('.try-on-visualization', { state: 'visible' });
    
    // Add to comparison
    await page.click('.add-to-comparison');
    
    // Select second frame
    await page.click('.frame-selector .frame-option:nth-child(2)');
    
    // Wait for try-on visualization to update
    await page.waitForTimeout(1000); // Wait for visualization to update
    
    // Add to comparison
    await page.click('.add-to-comparison');
    
    // Open comparison view
    await page.click('.view-comparison');
    
    // Wait for comparison view to load
    await page.waitForSelector('.comparison-view', { state: 'visible' });
    
    // Verify comparison shows both frames
    const comparisonItems = await page.locator('.comparison-item').count();
    expect(comparisonItems).toBe(2);
  });

  test('should show frame recommendations based on face shape', async ({ page }) => {
    // Upload photo
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(config.testImages.faceFront);
    
    // Wait for face detection to complete
    await page.waitForSelector('.face-shape-result', { state: 'visible' });
    
    // Wait for recommendations to load
    await page.waitForSelector('.recommendations-container', { state: 'visible' });
    
    // Verify recommendations are shown
    const recommendationItems = await page.locator('.recommendation-item').count();
    expect(recommendationItems).toBeGreaterThan(0);
    
    // Verify recommendations include compatibility scores
    await expect(page.locator('.compatibility-score')).toBeVisible();
  });

  test('should save try-on to history', async ({ page }) => {
    // Upload photo
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(config.testImages.faceFront);
    
    // Wait for face detection to complete
    await page.waitForSelector('.face-shape-result', { state: 'visible' });
    
    // Select a frame
    await page.click('.frame-selector .frame-option:first-child');
    
    // Wait for try-on visualization to load
    await page.waitForSelector('.try-on-visualization', { state: 'visible' });
    
    // Save to history
    await page.click('.save-to-history');
    
    // Verify success message
    await page.waitForSelector('.success-message', { state: 'visible' });
    const successMessage = await page.textContent('.success-message');
    expect(successMessage).toContain('saved to history');
    
    // Navigate to history page
    await page.click('.view-history');
    
    // Wait for history page to load
    await page.waitForSelector('.history-container', { state: 'visible' });
    
    // Verify history contains the saved try-on
    const historyItems = await page.locator('.history-item').count();
    expect(historyItems).toBeGreaterThan(0);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Upload invalid image (no face)
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(config.testImages.noFace);
    
    // Wait for error message
    await page.waitForSelector('.error-message', { state: 'visible' });
    
    // Verify error message
    const errorMessage = await page.textContent('.error-message');
    expect(errorMessage).toContain('No face detected');
    
    // Verify user can try again
    await expect(page.locator('input[type="file"]')).toBeEnabled();
  });
});