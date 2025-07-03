/**
 * E2E Tests for Virtual Try-On Functionality
 * 
 * These tests verify that the virtual try-on feature works correctly
 * across all e-commerce platforms.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Test configuration
const config = {
  shopify: {
    baseUrl: process.env.SHOPIFY_URL || 'https://test-shop.myshopify.com',
    productUrl: process.env.SHOPIFY_PRODUCT_URL || 'https://test-shop.myshopify.com/products/test-frames',
  },
  magento: {
    baseUrl: process.env.MAGENTO_URL || 'http://localhost:8080',
    productUrl: process.env.MAGENTO_PRODUCT_URL || 'http://localhost:8080/test-frames.html',
  },
  woocommerce: {
    baseUrl: process.env.WOOCOMMERCE_URL || 'http://localhost:8081',
    productUrl: process.env.WOOCOMMERCE_PRODUCT_URL || 'http://localhost:8081/product/test-frames/',
  },
  bigcommerce: {
    baseUrl: process.env.BIGCOMMERCE_URL || 'https://store-{store_hash}.mybigcommerce.com',
    productUrl: process.env.BIGCOMMERCE_PRODUCT_URL || 'https://store-{store_hash}.mybigcommerce.com/test-frames/',
  },
  testImages: {
    faceFront: path.resolve(__dirname, '../fixtures/face-front.jpg'),
    faceSide: path.resolve(__dirname, '../fixtures/face-side.jpg'),
    faceAngle: path.resolve(__dirname, '../fixtures/face-angle.jpg'),
  }
};

// Helper function to create API client
function createApiClient() {
  return axios.create({
    baseURL: process.env.EYEWEAR_ML_API_URL || 'http://localhost:3000',
    headers: {
      'Authorization': `Bearer ${process.env.EYEWEAR_ML_API_KEY || 'test_api_key'}`,
      'Content-Type': 'application/json'
    }
  });
}

// Helper function to test virtual try-on functionality
async function testVirtualTryOn(page, productUrl, platform) {
  // Navigate to product page
  await page.goto(productUrl);
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle');
  
  // Find and click the virtual try-on button
  const buttonSelector = {
    'shopify': 'button.varai-try-on-button',
    'magento': 'button#varai-try-on-button',
    'woocommerce': 'button.varai-virtual-try-on',
    'bigcommerce': 'button[data-varai-try-on]'
  }[platform];
  
  await page.click(buttonSelector);
  
  // Wait for the virtual try-on modal to appear
  const modalSelector = {
    'shopify': '.varai-try-on-modal',
    'magento': '#varai-try-on-modal',
    'woocommerce': '.varai-try-on-container',
    'bigcommerce': '.varai-try-on-modal'
  }[platform];
  
  await page.waitForSelector(modalSelector, { state: 'visible' });
  
  // Take a screenshot for verification
  await page.screenshot({ path: `./test-results/${platform}-try-on-modal.png` });
  
  // Test camera access
  const cameraButtonSelector = {
    'shopify': '.varai-camera-button',
    'magento': '#varai-camera-button',
    'woocommerce': '.varai-camera-access',
    'bigcommerce': '.varai-camera-button'
  }[platform];
  
  await page.click(cameraButtonSelector);
  
  // Wait for camera permission dialog and accept it
  // Note: This is browser-specific and may require different handling in CI environments
  await page.evaluate(() => {
    // Mock camera permission
    navigator.mediaDevices.getUserMedia = async () => {
      const mockTrack = {
        stop: () => {}
      };
      return {
        getTracks: () => [mockTrack]
      };
    };
  });
  
  // Wait for camera stream to initialize
  const videoSelector = {
    'shopify': '.varai-video-stream',
    'magento': '#varai-video-stream',
    'woocommerce': '.varai-video-element',
    'bigcommerce': '.varai-video-stream'
  }[platform];
  
  await page.waitForSelector(videoSelector);
  
  // Test photo capture
  const captureButtonSelector = {
    'shopify': '.varai-capture-button',
    'magento': '#varai-capture-button',
    'woocommerce': '.varai-capture-photo',
    'bigcommerce': '.varai-capture-button'
  }[platform];
  
  await page.click(captureButtonSelector);
  
  // Wait for the captured image to appear
  const capturedImageSelector = {
    'shopify': '.varai-captured-image',
    'magento': '#varai-captured-image',
    'woocommerce': '.varai-photo-preview',
    'bigcommerce': '.varai-captured-image'
  }[platform];
  
  await page.waitForSelector(capturedImageSelector);
  
  // Test face shape detection
  const detectButtonSelector = {
    'shopify': '.varai-detect-face-shape',
    'magento': '#varai-detect-face-shape',
    'woocommerce': '.varai-analyze-face',
    'bigcommerce': '.varai-detect-face-shape'
  }[platform];
  
  await page.click(detectButtonSelector);
  
  // Wait for face shape result
  const faceShapeResultSelector = {
    'shopify': '.varai-face-shape-result',
    'magento': '#varai-face-shape-result',
    'woocommerce': '.varai-face-shape-display',
    'bigcommerce': '.varai-face-shape-result'
  }[platform];
  
  await page.waitForSelector(faceShapeResultSelector);
  
  // Verify face shape is displayed
  const faceShapeText = await page.textContent(faceShapeResultSelector);
  expect(faceShapeText).toContain('oval');
  
  // Test virtual try-on rendering
  const tryOnButtonSelector = {
    'shopify': '.varai-apply-try-on',
    'magento': '#varai-apply-try-on',
    'woocommerce': '.varai-start-try-on',
    'bigcommerce': '.varai-apply-try-on'
  }[platform];
  
  await page.click(tryOnButtonSelector);
  
  // Wait for the 3D model to load and render
  const modelViewerSelector = {
    'shopify': '.varai-model-viewer',
    'magento': '#varai-model-viewer',
    'woocommerce': '.varai-3d-viewer',
    'bigcommerce': '.varai-model-viewer'
  }[platform];
  
  await page.waitForSelector(modelViewerSelector);
  
  // Take a screenshot of the rendered try-on
  await page.screenshot({ path: `./test-results/${platform}-try-on-result.png` });
  
  // Test style score display
  const styleScoreSelector = {
    'shopify': '.varai-style-score',
    'magento': '#varai-style-score',
    'woocommerce': '.varai-compatibility-score',
    'bigcommerce': '.varai-style-score'
  }[platform];
  
  const styleScoreText = await page.textContent(styleScoreSelector);
  expect(styleScoreText).toMatch(/\d+/); // Should contain a number
  
  // Close the modal
  const closeButtonSelector = {
    'shopify': '.varai-close-modal',
    'magento': '#varai-close-modal',
    'woocommerce': '.varai-close-button',
    'bigcommerce': '.varai-close-modal'
  }[platform];
  
  await page.click(closeButtonSelector);
  
  // Verify modal is closed
  await page.waitForSelector(modalSelector, { state: 'hidden' });
}

// Shopify virtual try-on tests
test.describe('Shopify Virtual Try-On', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient();
    
    // Create test directories if they don't exist
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results', { recursive: true });
    }
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock the camera API
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const mockTrack = {
          stop: () => {}
        };
        return {
          getTracks: () => [mockTrack]
        };
      };
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should provide virtual try-on functionality', async () => {
    await testVirtualTryOn(page, config.shopify.productUrl, 'shopify');
  });
  
  test('should detect face shape correctly', async () => {
    // Navigate to product page
    await page.goto(config.shopify.productUrl);
    
    // Open virtual try-on modal
    await page.click('button.varai-try-on-button');
    await page.waitForSelector('.varai-try-on-modal', { state: 'visible' });
    
    // Upload test image instead of using camera
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('.varai-upload-image');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(config.testImages.faceFront);
    
    // Wait for image to load
    await page.waitForSelector('.varai-uploaded-image');
    
    // Detect face shape
    await page.click('.varai-detect-face-shape');
    
    // Wait for face shape result
    await page.waitForSelector('.varai-face-shape-result');
    
    // Verify face shape
    const faceShapeText = await page.textContent('.varai-face-shape-result');
    expect(faceShapeText).toContain('oval');
    
    // Verify API call was made
    const requests = await page.evaluate(() => {
      return window.varaiApiCalls || [];
    });
    
    expect(requests.some(req => req.url.includes('/face-analysis/detect-shape'))).toBeTruthy();
  });
  
  test('should show frame compatibility with detected face shape', async () => {
    // Navigate to product page
    await page.goto(config.shopify.productUrl);
    
    // Open virtual try-on modal
    await page.click('button.varai-try-on-button');
    await page.waitForSelector('.varai-try-on-modal', { state: 'visible' });
    
    // Upload test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('.varai-upload-image');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(config.testImages.faceFront);
    
    // Detect face shape
    await page.click('.varai-detect-face-shape');
    await page.waitForSelector('.varai-face-shape-result');
    
    // Check compatibility display
    await page.waitForSelector('.varai-compatibility-indicator');
    const compatibilityText = await page.textContent('.varai-compatibility-indicator');
    
    // Should either show compatible or not compatible
    expect(compatibilityText).toMatch(/compatible|not compatible/i);
  });
});

// Magento virtual try-on tests
test.describe('Magento Virtual Try-On', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock the camera API
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const mockTrack = {
          stop: () => {}
        };
        return {
          getTracks: () => [mockTrack]
        };
      };
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should provide virtual try-on functionality', async () => {
    await testVirtualTryOn(page, config.magento.productUrl, 'magento');
  });
});

// WooCommerce virtual try-on tests
test.describe('WooCommerce Virtual Try-On', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock the camera API
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const mockTrack = {
          stop: () => {}
        };
        return {
          getTracks: () => [mockTrack]
        };
      };
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should provide virtual try-on functionality', async () => {
    await testVirtualTryOn(page, config.woocommerce.productUrl, 'woocommerce');
  });
});

// BigCommerce virtual try-on tests
test.describe('BigCommerce Virtual Try-On', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock the camera API
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const mockTrack = {
          stop: () => {}
        };
        return {
          getTracks: () => [mockTrack]
        };
      };
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should provide virtual try-on functionality', async () => {
    await testVirtualTryOn(page, config.bigcommerce.productUrl, 'bigcommerce');
  });
});