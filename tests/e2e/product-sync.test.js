/**
 * E2E Tests for Product Synchronization
 * 
 * These tests verify that product data is correctly synchronized between
 * e-commerce platforms and the VARAi system.
 */

const { test, expect } = require('@playwright/test');
const axios = require('axios');

// Test configuration
const config = {
  shopify: {
    baseUrl: process.env.SHOPIFY_URL || 'https://test-shop.myshopify.com',
    adminUrl: process.env.SHOPIFY_ADMIN_URL || 'https://test-shop.myshopify.com/admin',
    username: process.env.SHOPIFY_USERNAME,
    password: process.env.SHOPIFY_PASSWORD,
    productId: process.env.SHOPIFY_TEST_PRODUCT_ID || '123456789'
  },
  magento: {
    baseUrl: process.env.MAGENTO_URL || 'http://localhost:8080',
    adminUrl: process.env.MAGENTO_ADMIN_URL || 'http://localhost:8080/admin',
    username: process.env.MAGENTO_USERNAME || 'admin',
    password: process.env.MAGENTO_PASSWORD || 'admin123',
    productId: process.env.MAGENTO_TEST_PRODUCT_ID || '1'
  },
  woocommerce: {
    baseUrl: process.env.WOOCOMMERCE_URL || 'http://localhost:8081',
    adminUrl: process.env.WOOCOMMERCE_ADMIN_URL || 'http://localhost:8081/wp-admin',
    username: process.env.WOOCOMMERCE_USERNAME || 'admin',
    password: process.env.WOOCOMMERCE_PASSWORD || 'password',
    productId: process.env.WOOCOMMERCE_TEST_PRODUCT_ID || '100'
  },
  bigcommerce: {
    baseUrl: process.env.BIGCOMMERCE_URL || 'https://store-{store_hash}.mybigcommerce.com',
    adminUrl: process.env.BIGCOMMERCE_ADMIN_URL || 'https://store-{store_hash}.mybigcommerce.com/manage',
    username: process.env.BIGCOMMERCE_USERNAME,
    password: process.env.BIGCOMMERCE_PASSWORD,
    productId: process.env.BIGCOMMERCE_TEST_PRODUCT_ID || '200'
  },
  varaiApi: {
    baseUrl: process.env.EYEWEAR_ML_API_URL || 'http://localhost:3000',
    apiKey: process.env.EYEWEAR_ML_API_KEY || 'test_api_key'
  }
};

// Test data
const testProductData = {
  name: 'VARAi Test Frames',
  sku: 'VARAI-TEST-001',
  price: 99.99,
  description: 'Test frames for automated testing',
  faceShapes: ['oval', 'round'],
  frameWidth: 140,
  templeLength: 145,
  bridgeWidth: 20,
  lensHeight: 45,
  lensWidth: 50
};

// Helper function to create API client
function createApiClient(platform) {
  return axios.create({
    baseURL: config.varaiApi.baseUrl,
    headers: {
      'Authorization': `Bearer ${config.varaiApi.apiKey}`,
      'Content-Type': 'application/json',
      'X-Platform': platform
    }
  });
}

// Shopify product synchronization tests
test.describe('Shopify Product Synchronization', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient('shopify');
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should sync product data from Shopify to VARAi', async () => {
    // Login to Shopify admin
    await page.goto(config.shopify.adminUrl);
    await page.fill('#account_email', config.shopify.username);
    await page.click('button[type="submit"]');
    await page.fill('#account_password', config.shopify.password);
    await page.click('button[type="submit"]');
    
    // Navigate to product edit page
    await page.goto(`${config.shopify.adminUrl}/products/${config.shopify.productId}`);
    
    // Update product with test data
    await page.fill('input[name="title"]', testProductData.name);
    await page.fill('input[name="sku"]', testProductData.sku);
    await page.fill('input[name="price"]', testProductData.price.toString());
    
    // Add custom metafields for eyewear data
    await page.click('button:has-text("Metafields")');
    await page.click('button:has-text("Add definition")');
    await page.fill('input[placeholder="Namespace"]', 'varai');
    await page.fill('input[placeholder="Key"]', 'face_shapes');
    await page.selectOption('select[aria-label="Type"]', 'json_string');
    await page.fill('textarea', JSON.stringify(testProductData.faceShapes));
    await page.click('button:has-text("Save")');
    
    // Add more metafields for frame dimensions
    await page.click('button:has-text("Add definition")');
    await page.fill('input[placeholder="Namespace"]', 'varai');
    await page.fill('input[placeholder="Key"]', 'frame_dimensions');
    await page.selectOption('select[aria-label="Type"]', 'json_string');
    await page.fill('textarea', JSON.stringify({
      frame_width: testProductData.frameWidth,
      temple_length: testProductData.templeLength,
      bridge_width: testProductData.bridgeWidth,
      lens_height: testProductData.lensHeight,
      lens_width: testProductData.lensWidth
    }));
    await page.click('button:has-text("Save")');
    
    // Save product
    await page.click('button:has-text("Save")');
    
    // Wait for sync to complete (this would trigger webhooks in a real environment)
    await page.waitForTimeout(2000);
    
    // Verify product data in VARAi API
    const response = await apiClient.get(`/products/${config.shopify.productId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('name', testProductData.name);
    expect(response.data).toHaveProperty('sku', testProductData.sku);
    expect(response.data).toHaveProperty('price', testProductData.price);
    expect(response.data).toHaveProperty('face_shapes');
    expect(response.data.face_shapes).toEqual(expect.arrayContaining(testProductData.faceShapes));
    expect(response.data).toHaveProperty('dimensions');
    expect(response.data.dimensions).toHaveProperty('frame_width', testProductData.frameWidth);
  });

  test('should sync product updates from VARAi to Shopify', async () => {
    // Update product in VARAi
    const updatedData = {
      style_score: 85,
      face_shapes: ['oval', 'heart', 'square'],
      recommendations: ['casual', 'business']
    };
    
    await apiClient.put(`/products/${config.shopify.productId}`, updatedData);
    
    // Wait for sync to complete
    await page.waitForTimeout(2000);
    
    // Check Shopify product for updated data
    await page.goto(`${config.shopify.adminUrl}/products/${config.shopify.productId}`);
    await page.click('button:has-text("Metafields")');
    
    // Check for updated metafields
    const metafieldContent = await page.textContent('.metafield-list');
    expect(metafieldContent).toContain('style_score');
    expect(metafieldContent).toContain('85');
    expect(metafieldContent).toContain('heart');
    expect(metafieldContent).toContain('square');
  });
});

// Magento product synchronization tests
test.describe('Magento Product Synchronization', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient('magento');
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should sync product data from Magento to VARAi', async () => {
    // Login to Magento admin
    await page.goto(`${config.magento.adminUrl}`);
    await page.fill('#username', config.magento.username);
    await page.fill('#login', config.magento.password);
    await page.click('.action-login');
    
    // Navigate to product edit page
    await page.goto(`${config.magento.adminUrl}/catalog/product/edit/id/${config.magento.productId}`);
    
    // Update product with test data
    await page.fill('input[name="product[name]"]', testProductData.name);
    await page.fill('input[name="product[sku]"]', testProductData.sku);
    await page.fill('input[name="product[price]"]', testProductData.price.toString());
    
    // Navigate to VARAi tab
    await page.click('div[data-index="varai"]');
    
    // Fill VARAi specific fields
    await page.selectOption('select[name="product[varai_face_shapes][]"]', testProductData.faceShapes);
    await page.fill('input[name="product[varai_frame_width]"]', testProductData.frameWidth.toString());
    await page.fill('input[name="product[varai_temple_length]"]', testProductData.templeLength.toString());
    await page.fill('input[name="product[varai_bridge_width]"]', testProductData.bridgeWidth.toString());
    
    // Save product
    await page.click('button#save-button');
    
    // Wait for sync to complete
    await page.waitForTimeout(2000);
    
    // Verify product data in VARAi API
    const response = await apiClient.get(`/products/${config.magento.productId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('name', testProductData.name);
    expect(response.data).toHaveProperty('sku', testProductData.sku);
    expect(response.data).toHaveProperty('price', testProductData.price);
    expect(response.data).toHaveProperty('face_shapes');
    expect(response.data.face_shapes).toEqual(expect.arrayContaining(testProductData.faceShapes));
    expect(response.data).toHaveProperty('dimensions');
    expect(response.data.dimensions).toHaveProperty('frame_width', testProductData.frameWidth);
  });
});

// WooCommerce product synchronization tests
test.describe('WooCommerce Product Synchronization', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient('woocommerce');
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should sync product data from WooCommerce to VARAi', async () => {
    // Login to WooCommerce admin
    await page.goto(`${config.woocommerce.adminUrl}`);
    await page.fill('#user_login', config.woocommerce.username);
    await page.fill('#user_pass', config.woocommerce.password);
    await page.click('#wp-submit');
    
    // Navigate to product edit page
    await page.goto(`${config.woocommerce.adminUrl}/post.php?post=${config.woocommerce.productId}&action=edit`);
    
    // Update product with test data
    await page.fill('#title', testProductData.name);
    await page.fill('#_sku', testProductData.sku);
    await page.fill('#_regular_price', testProductData.price.toString());
    
    // Fill VARAi specific fields
    await page.click('div.varai-settings-tab');
    
    // Select face shapes
    for (const shape of testProductData.faceShapes) {
      await page.check(`input[name="varai_face_shapes[]"][value="${shape}"]`);
    }
    
    // Fill frame dimensions
    await page.fill('#varai_frame_width', testProductData.frameWidth.toString());
    await page.fill('#varai_temple_length', testProductData.templeLength.toString());
    await page.fill('#varai_bridge_width', testProductData.bridgeWidth.toString());
    
    // Save product
    await page.click('#publish');
    
    // Wait for sync to complete
    await page.waitForTimeout(2000);
    
    // Verify product data in VARAi API
    const response = await apiClient.get(`/products/${config.woocommerce.productId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('name', testProductData.name);
    expect(response.data).toHaveProperty('sku', testProductData.sku);
    expect(response.data).toHaveProperty('price', testProductData.price);
    expect(response.data).toHaveProperty('face_shapes');
    expect(response.data.face_shapes).toEqual(expect.arrayContaining(testProductData.faceShapes));
    expect(response.data).toHaveProperty('dimensions');
    expect(response.data.dimensions).toHaveProperty('frame_width', testProductData.frameWidth);
  });
});

// BigCommerce product synchronization tests
test.describe('BigCommerce Product Synchronization', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient('bigcommerce');
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should sync product data from BigCommerce to VARAi', async () => {
    // Login to BigCommerce admin
    await page.goto(config.bigcommerce.adminUrl);
    await page.fill('#user_email', config.bigcommerce.username);
    await page.fill('#user_password', config.bigcommerce.password);
    await page.click('button[type="submit"]');
    
    // Navigate to product edit page
    await page.goto(`${config.bigcommerce.adminUrl}/products/edit/${config.bigcommerce.productId}`);
    
    // Update product with test data
    await page.fill('input[name="product_name"]', testProductData.name);
    await page.fill('input[name="product_sku"]', testProductData.sku);
    await page.fill('input[name="product_price"]', testProductData.price.toString());
    
    // Navigate to VARAi app
    await page.click('a:has-text("Apps")');
    await page.click('a:has-text("VARAi")');
    
    // Fill VARAi specific fields
    for (const shape of testProductData.faceShapes) {
      await page.check(`input[name="face_shapes[]"][value="${shape}"]`);
    }
    
    await page.fill('input[name="frame_width"]', testProductData.frameWidth.toString());
    await page.fill('input[name="temple_length"]', testProductData.templeLength.toString());
    await page.fill('input[name="bridge_width"]', testProductData.bridgeWidth.toString());
    
    // Save VARAi settings
    await page.click('button:has-text("Save")');
    
    // Wait for sync to complete
    await page.waitForTimeout(2000);
    
    // Verify product data in VARAi API
    const response = await apiClient.get(`/products/${config.bigcommerce.productId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('name', testProductData.name);
    expect(response.data).toHaveProperty('sku', testProductData.sku);
    expect(response.data).toHaveProperty('price', testProductData.price);
    expect(response.data).toHaveProperty('face_shapes');
    expect(response.data.face_shapes).toEqual(expect.arrayContaining(testProductData.faceShapes));
    expect(response.data).toHaveProperty('dimensions');
    expect(response.data.dimensions).toHaveProperty('frame_width', testProductData.frameWidth);
  });
});