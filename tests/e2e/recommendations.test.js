/**
 * E2E Tests for Recommendation Engine
 * 
 * These tests verify that product recommendations are correctly displayed
 * and tracked across all e-commerce platforms.
 */

const { test, expect } = require('@playwright/test');
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
  varaiApi: {
    baseUrl: process.env.EYEWEAR_ML_API_URL || 'http://localhost:3000',
    apiKey: process.env.EYEWEAR_ML_API_KEY || 'test_api_key'
  }
};

// Helper function to create API client
function createApiClient() {
  return axios.create({
    baseURL: config.varaiApi.baseUrl,
    headers: {
      'Authorization': `Bearer ${config.varaiApi.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
}

// Helper function to test recommendation functionality
async function testRecommendations(page, productUrl, platform) {
  // Navigate to product page
  await page.goto(productUrl);
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle');
  
  // Find the recommendations section
  const recommendationsSelector = {
    'shopify': '.varai-recommendations',
    'magento': '#varai-recommendations',
    'woocommerce': '.varai-product-recommendations',
    'bigcommerce': '.varai-recommendations'
  }[platform];
  
  await page.waitForSelector(recommendationsSelector);
  
  // Check if recommendations are loaded
  const recommendationItemSelector = {
    'shopify': '.varai-recommendation-item',
    'magento': '.varai-recommendation-item',
    'woocommerce': '.varai-recommended-product',
    'bigcommerce': '.varai-recommendation-item'
  }[platform];
  
  const recommendations = await page.$$(recommendationItemSelector);
  expect(recommendations.length).toBeGreaterThan(0);
  
  // Take a screenshot for verification
  await page.screenshot({ path: `./test-results/${platform}-recommendations.png` });
  
  // Click on a recommendation
  await recommendations[0].click();
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
  
  // Verify we've navigated to a new product page
  const currentUrl = page.url();
  expect(currentUrl).not.toBe(productUrl);
  
  // Verify the URL contains 'product' or similar term
  expect(currentUrl).toMatch(/product|products|item|items/i);
}

// Helper function to intercept and track API calls
async function setupApiInterception(page) {
  await page.addInitScript(() => {
    window.varaiApiCalls = [];
    
    // Store original fetch
    const originalFetch = window.fetch;
    
    // Override fetch to track API calls
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      // Only track VARAi API calls
      if (url.includes('varai') || url.includes('eyewear')) {
        window.varaiApiCalls.push({
          url,
          method: options?.method || 'GET',
          body: options?.body
        });
      }
      
      // Call original fetch
      return originalFetch(...args);
    };
    
    // Store original XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    
    // Override XMLHttpRequest to track API calls
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      
      xhr.open = function(method, url) {
        xhr._url = url;
        xhr._method = method;
        return originalOpen.apply(this, arguments);
      };
      
      xhr.send = function(body) {
        if (xhr._url.includes('varai') || xhr._url.includes('eyewear')) {
          window.varaiApiCalls.push({
            url: xhr._url,
            method: xhr._method,
            body
          });
        }
        return originalSend.apply(this, arguments);
      };
      
      return xhr;
    };
  });
}

// Shopify recommendation tests
test.describe('Shopify Recommendations', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient();
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await setupApiInterception(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display personalized recommendations', async () => {
    await testRecommendations(page, config.shopify.productUrl, 'shopify');
  });
  
  test('should track recommendation impressions', async () => {
    // Navigate to product page
    await page.goto(config.shopify.productUrl);
    
    // Wait for recommendations to load
    await page.waitForSelector('.varai-recommendations');
    
    // Wait a bit for tracking to occur
    await page.waitForTimeout(1000);
    
    // Check if impression tracking API calls were made
    const apiCalls = await page.evaluate(() => window.varaiApiCalls || []);
    
    // Filter for impression tracking calls
    const impressionCalls = apiCalls.filter(call => 
      call.url.includes('/analytics/track') && 
      (call.body?.includes('impression') || JSON.stringify(call.body).includes('impression'))
    );
    
    expect(impressionCalls.length).toBeGreaterThan(0);
  });
  
  test('should track recommendation clicks', async () => {
    // Navigate to product page
    await page.goto(config.shopify.productUrl);
    
    // Wait for recommendations to load
    await page.waitForSelector('.varai-recommendations');
    
    // Clear existing API calls
    await page.evaluate(() => {
      window.varaiApiCalls = [];
    });
    
    // Click on a recommendation
    const recommendations = await page.$$('.varai-recommendation-item');
    await recommendations[0].click();
    
    // Wait for navigation and tracking to complete
    await page.waitForLoadState('networkidle');
    
    // Check if click tracking API calls were made
    const apiCalls = await page.evaluate(() => window.varaiApiCalls || []);
    
    // Filter for click tracking calls
    const clickCalls = apiCalls.filter(call => 
      call.url.includes('/analytics/track') && 
      (call.body?.includes('click') || JSON.stringify(call.body).includes('click'))
    );
    
    expect(clickCalls.length).toBeGreaterThan(0);
  });
  
  test('should update recommendations based on browsing history', async () => {
    // First, visit several products to build browsing history
    const productIds = ['product-1', 'product-2', 'product-3'];
    
    for (const productId of productIds) {
      await page.goto(`${config.shopify.baseUrl}/products/${productId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Wait for tracking to occur
    }
    
    // Then visit the test product page
    await page.goto(config.shopify.productUrl);
    await page.waitForSelector('.varai-recommendations');
    
    // Get recommendation product IDs
    const recommendationIds = await page.evaluate(() => {
      const items = document.querySelectorAll('.varai-recommendation-item');
      return Array.from(items).map(item => item.getAttribute('data-product-id'));
    });
    
    // At least one of the browsed products should appear in recommendations
    const hasOverlap = productIds.some(id => recommendationIds.includes(id));
    expect(hasOverlap).toBeTruthy();
  });
});

// Magento recommendation tests
test.describe('Magento Recommendations', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await setupApiInterception(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display personalized recommendations', async () => {
    await testRecommendations(page, config.magento.productUrl, 'magento');
  });
  
  test('should filter recommendations by face shape compatibility', async () => {
    // Navigate to product page
    await page.goto(config.magento.productUrl);
    
    // Wait for recommendations to load
    await page.waitForSelector('#varai-recommendations');
    
    // Find face shape filter
    await page.click('#varai-filter-by-face-shape');
    
    // Select 'oval' face shape
    await page.selectOption('#varai-face-shape-select', 'oval');
    
    // Wait for filtered recommendations
    await page.waitForSelector('.varai-recommendation-item.face-shape-compatible');
    
    // Check if all visible recommendations are compatible
    const visibleRecommendations = await page.$$('.varai-recommendation-item:not(.hidden)');
    const compatibleRecommendations = await page.$$('.varai-recommendation-item.face-shape-compatible');
    
    expect(visibleRecommendations.length).toEqual(compatibleRecommendations.length);
  });
});

// WooCommerce recommendation tests
test.describe('WooCommerce Recommendations', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await setupApiInterception(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display personalized recommendations', async () => {
    await testRecommendations(page, config.woocommerce.productUrl, 'woocommerce');
  });
  
  test('should sort recommendations by relevance', async () => {
    // Navigate to product page
    await page.goto(config.woocommerce.productUrl);
    
    // Wait for recommendations to load
    await page.waitForSelector('.varai-product-recommendations');
    
    // Find sort dropdown
    await page.selectOption('.varai-recommendation-sort', 'relevance');
    
    // Wait for sorted recommendations
    await page.waitForTimeout(500);
    
    // Get recommendation scores
    const scores = await page.evaluate(() => {
      const items = document.querySelectorAll('.varai-recommended-product');
      return Array.from(items).map(item => 
        parseFloat(item.getAttribute('data-relevance-score') || '0')
      );
    });
    
    // Check if scores are in descending order
    const isSorted = scores.every((score, i) => i === 0 || score <= scores[i - 1]);
    expect(isSorted).toBeTruthy();
  });
});

// BigCommerce recommendation tests
test.describe('BigCommerce Recommendations', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await setupApiInterception(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display personalized recommendations', async () => {
    await testRecommendations(page, config.bigcommerce.productUrl, 'bigcommerce');
  });
  
  test('should load more recommendations when scrolling', async () => {
    // Navigate to product page
    await page.goto(config.bigcommerce.productUrl);
    
    // Wait for initial recommendations to load
    await page.waitForSelector('.varai-recommendations');
    
    // Count initial recommendations
    const initialCount = await page.$$eval('.varai-recommendation-item', items => items.length);
    
    // Scroll to the bottom of recommendations
    await page.evaluate(() => {
      const recommendationsEl = document.querySelector('.varai-recommendations');
      recommendationsEl.scrollTop = recommendationsEl.scrollHeight;
    });
    
    // Wait for more recommendations to load
    await page.waitForTimeout(1000);
    
    // Count recommendations after scrolling
    const newCount = await page.$$eval('.varai-recommendation-item', items => items.length);
    
    // Should have loaded more recommendations
    expect(newCount).toBeGreaterThan(initialCount);
  });
});