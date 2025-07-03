/**
 * Cross-Platform Compatibility Tests
 * 
 * These tests verify that the VARAi platform works consistently across
 * different e-commerce platforms, ensuring that data is properly
 * transformed and synchronized between systems.
 */

import { ShopifyAdapter } from '../../../../src/integrations/platforms/shopify/shopify-adapter-varai';
import { MagentoAdapter } from '../../../../src/integrations/platforms/magento/magento-adapter-varai';
import { WooCommerceAdapter } from '../../../../src/integrations/platforms/woocommerce/woocommerce-adapter-varai';
import { BigCommerceAdapter } from '../../../../src/integrations/platforms/bigcommerce/bigcommerce-adapter-varai';
import { 
  ShopifyMockServer, 
  MagentoMockServer, 
  WooCommerceMockServer, 
  BigCommerceMockServer 
} from '../common/mocks/mockServer';
import { mockProducts, mockOrders, mockCustomers } from '../common/mocks/mockData';
import { createTestApiClient, connectToTestDb, cleanupTestData } from '../common/utils/testHelpers';
import { MongoClient, Db } from 'mongodb';
import { LoggerFactory } from '../../../../src/utils/logger';
import { TokenManager, InMemoryTokenStorage } from '../../../../src/integrations/auth/token-manager';
import { PlatformConfig, Product, SyncResult } from '../../../../src/integrations/types/platform-adapter';

// Test configurations
const shopifyConfig: PlatformConfig = {
  integrationId: 'test-shopify-integration',
  storeUrl: 'https://test-store.myshopify.com',
  credentials: {
    apiKey: 'process.env.APIKEY_2610',
    apiSecret: 'process.env.APIKEY_2615'
  },
  webhookUrl: 'https://webhook.example.com/varai-shopify',
  apiVersion: '2023-04'
};

const magentoConfig: PlatformConfig = {
  integrationId: 'test-magento-integration',
  storeUrl: 'https://test-store.magento.com',
  credentials: {
    apiKey: 'process.env.APIKEY_2611',
    apiSecret: 'process.env.APIKEY_2617'
  },
  webhookUrl: 'https://webhook.example.com/varai-magento',
  apiVersion: 'V1'
};

const wooCommerceConfig: PlatformConfig = {
  integrationId: 'test-woocommerce-integration',
  storeUrl: 'https://test-store.woocommerce.com',
  credentials: {
    apiKey: 'process.env.APIKEY_2612',
    apiSecret: 'process.env.APIKEY_2619'
  },
  webhookUrl: 'https://webhook.example.com/varai-woocommerce',
  apiVersion: 'wc/v3'
};

const bigCommerceConfig: PlatformConfig = {
  integrationId: 'test-bigcommerce-integration',
  storeUrl: 'https://test-store.mybigcommerce.com',
  credentials: {
    apiKey: 'process.env.APIKEY_2613',
    apiSecret: 'process.env.APIKEY_2621'
  },
  webhookUrl: 'https://webhook.example.com/varai-bigcommerce',
  apiVersion: 'v3'
};

describe('Cross-Platform Compatibility Tests', () => {
  // Adapters
  let shopifyAdapter: ShopifyAdapter;
  let magentoAdapter: MagentoAdapter;
  let wooCommerceAdapter: WooCommerceAdapter;
  let bigCommerceAdapter: BigCommerceAdapter;
  
  // Mock servers
  let shopifyMockServer: ShopifyMockServer;
  let magentoMockServer: MagentoMockServer;
  let wooCommerceMockServer: WooCommerceMockServer;
  let bigCommerceMockServer: BigCommerceMockServer;
  
  // Database
  let mongoClient: MongoClient;
  let db: Db;
  
  // API client
  let apiClient: any;
  
  // Logger and token manager
  let logger: any;
  let tokenManager: TokenManager;

  beforeAll(async () => {
    // Connect to test database
    const dbConnection = await connectToTestDb();
    mongoClient = dbConnection.client;
    db = dbConnection.db;

    // Create API client
    apiClient = createTestApiClient();

    // Setup mock servers
    shopifyMockServer = new ShopifyMockServer({
      baseUrl: 'https://test-store.myshopify.com'
    });
    
    magentoMockServer = new MagentoMockServer({
      baseUrl: 'https://test-store.magento.com'
    });
    
    wooCommerceMockServer = new WooCommerceMockServer({
      baseUrl: 'https://test-store.woocommerce.com'
    });
    
    bigCommerceMockServer = new BigCommerceMockServer({
      baseUrl: 'https://test-store.mybigcommerce.com'
    });
    
    // Start mock servers
    shopifyMockServer.start();
    magentoMockServer.start();
    wooCommerceMockServer.start();
    bigCommerceMockServer.start();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData(db, ['products', 'orders', 'customers']);

    // Close database connection
    await mongoClient.close();

    // Stop mock servers
    shopifyMockServer.stop();
    magentoMockServer.stop();
    wooCommerceMockServer.stop();
    bigCommerceMockServer.stop();
  });

  beforeEach(() => {
    // Reset mock servers
    shopifyMockServer.reset();
    magentoMockServer.reset();
    wooCommerceMockServer.reset();
    bigCommerceMockServer.reset();

    // Setup mocks
    shopifyMockServer.mockAuth();
    shopifyMockServer.mockProducts();
    shopifyMockServer.mockOrders();
    shopifyMockServer.mockCustomers();
    shopifyMockServer.mockWebhooks();
    
    magentoMockServer.mockAuth();
    magentoMockServer.mockProducts();
    magentoMockServer.mockOrders();
    magentoMockServer.mockCustomers();
    magentoMockServer.mockWebhooks();
    
    wooCommerceMockServer.mockAuth();
    wooCommerceMockServer.mockProducts();
    wooCommerceMockServer.mockOrders();
    wooCommerceMockServer.mockCustomers();
    wooCommerceMockServer.mockWebhooks();
    
    bigCommerceMockServer.mockAuth();
    bigCommerceMockServer.mockProducts();
    bigCommerceMockServer.mockOrders();
    bigCommerceMockServer.mockCustomers();
    bigCommerceMockServer.mockWebhooks();

    // Create logger
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    };
    jest.spyOn(LoggerFactory, 'getLogger').mockReturnValue(logger);

    // Create token manager
    const tokenStorage = new InMemoryTokenStorage();
    tokenManager = new TokenManager(tokenStorage);
    
    // Mock token manager methods
    jest.spyOn(tokenManager, 'getToken').mockResolvedValue({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 3600000),
      merchantId: 'test-merchant',
      platform: 'test'
    });

    // Create adapters
    shopifyAdapter = new ShopifyAdapter(shopifyConfig, logger, tokenManager);
    magentoAdapter = new MagentoAdapter(magentoConfig, logger, tokenManager);
    wooCommerceAdapter = new WooCommerceAdapter(wooCommerceConfig, logger, tokenManager);
    bigCommerceAdapter = new BigCommerceAdapter(bigCommerceConfig, logger, tokenManager);
  });

  describe('Connection Compatibility', () => {
    it('should connect to all platforms successfully', async () => {
      // Connect to all platforms
      const shopifyResult = await shopifyAdapter.connect();
      const magentoResult = await magentoAdapter.connect();
      const wooCommerceResult = await wooCommerceAdapter.connect();
      const bigCommerceResult = await bigCommerceAdapter.connect();
      
      // Verify all connections were successful
      expect(shopifyResult.connected).toBe(true);
      expect(magentoResult.connected).toBe(true);
      expect(wooCommerceResult.connected).toBe(true);
      expect(bigCommerceResult.connected).toBe(true);
    });
  });

  describe('Product Synchronization Compatibility', () => {
    it('should sync the same product to all platforms', async () => {
      // Create a standard product for testing
      const standardProduct: Product = {
        id: 'cross-platform-test-product',
        name: 'Cross-Platform Test Frames',
        description: 'Test frames for cross-platform compatibility testing',
        brand: 'VARAi Test',
        sku: 'VARAI-CROSS-TEST-001',
        frameType: 'full-rim',
        frameMaterial: 'acetate',
        frameShape: 'round',
        frameColor: 'black',
        lensWidth: 50,
        bridgeWidth: 20,
        templeLength: 145,
        rimType: 'full',
        faceShapeCompatibility: ['round', 'oval'],
        price: 99.99,
        compareAtPrice: 129.99,
        images: [
          {
            id: 'img-1',
            url: 'https://example.com/images/test-frame-1.jpg',
            position: 1,
            alt: 'Front view'
          }
        ],
        variants: [
          {
            id: 'var-1',
            sku: 'VARAI-CROSS-TEST-001-BLK',
            color: 'black',
            price: 99.99,
            compareAtPrice: 129.99,
            inventoryQuantity: 10,
            isActive: true
          }
        ],
        tags: ['cross-platform-test'],
        isActive: true,
        metadata: {
          virtualTryOnEnabled: true,
          styleScore: 85,
          frameFitScore: 90
        }
      };
      
      // Sync product to all platforms
      const shopifyResult = await shopifyAdapter.syncProducts([standardProduct]);
      const magentoResult = await magentoAdapter.syncProducts([standardProduct]);
      const wooCommerceResult = await wooCommerceAdapter.syncProducts([standardProduct]);
      const bigCommerceResult = await bigCommerceAdapter.syncProducts([standardProduct]);
      
      // Verify all syncs were successful
      expect(shopifyResult.success).toBe(true);
      expect(shopifyResult.itemsProcessed).toBe(1);
      expect(shopifyResult.itemsFailed).toBe(0);
      
      expect(magentoResult.success).toBe(true);
      expect(magentoResult.itemsProcessed).toBe(1);
      expect(magentoResult.itemsFailed).toBe(0);
      
      expect(wooCommerceResult.success).toBe(true);
      expect(wooCommerceResult.itemsProcessed).toBe(1);
      expect(wooCommerceResult.itemsFailed).toBe(0);
      
      expect(bigCommerceResult.success).toBe(true);
      expect(bigCommerceResult.itemsProcessed).toBe(1);
      expect(bigCommerceResult.itemsFailed).toBe(0);
    });
    
    it('should handle platform-specific product fields correctly', async () => {
      // Create products with platform-specific fields
      const shopifyProduct = {
        ...mockProducts.shopify,
        metadata: {
          ...mockProducts.shopify.metadata,
          shopifySpecificField: 'shopify-value'
        }
      };
      
      const magentoProduct = {
        ...mockProducts.magento,
        metadata: {
          ...mockProducts.magento.metadata,
          magentoSpecificField: 'magento-value'
        }
      };
      
      const wooCommerceProduct = {
        ...mockProducts.woocommerce,
        metadata: {
          ...mockProducts.woocommerce.metadata,
          wooCommerceSpecificField: 'woocommerce-value'
        }
      };
      
      const bigCommerceProduct = {
        ...mockProducts.bigcommerce,
        metadata: {
          ...mockProducts.bigcommerce.metadata,
          bigCommerceSpecificField: 'bigcommerce-value'
        }
      };
      
      // Sync products to their respective platforms
      const shopifyResult = await shopifyAdapter.syncProducts([shopifyProduct]);
      const magentoResult = await magentoAdapter.syncProducts([magentoProduct]);
      const wooCommerceResult = await wooCommerceAdapter.syncProducts([wooCommerceProduct]);
      const bigCommerceResult = await bigCommerceAdapter.syncProducts([bigCommerceProduct]);
      
      // Verify all syncs were successful
      expect(shopifyResult.success).toBe(true);
      expect(magentoResult.success).toBe(true);
      expect(wooCommerceResult.success).toBe(true);
      expect(bigCommerceResult.success).toBe(true);
    });
  });

  describe('Order Processing Compatibility', () => {
    it('should process orders from all platforms', async () => {
      // Process orders from all platforms
      const shopifyOrders = await shopifyAdapter.processOrders();
      const magentoOrders = await magentoAdapter.processOrders();
      const wooCommerceOrders = await wooCommerceAdapter.processOrders();
      const bigCommerceOrders = await bigCommerceAdapter.processOrders();
      
      // Verify orders were processed
      expect(shopifyOrders.length).toBeGreaterThan(0);
      expect(magentoOrders.length).toBeGreaterThan(0);
      expect(wooCommerceOrders.length).toBeGreaterThan(0);
      expect(bigCommerceOrders.length).toBeGreaterThan(0);
      
      // Verify order status
      expect(shopifyOrders[0].status).toBe('processed');
      expect(magentoOrders[0].status).toBe('processed');
      expect(wooCommerceOrders[0].status).toBe('processed');
      expect(bigCommerceOrders[0].status).toBe('processed');
    });
  });

  describe('Webhook Handling Compatibility', () => {
    it('should register webhooks on all platforms', async () => {
      // Register webhooks on all platforms
      const shopifyResult = await shopifyAdapter.registerWebhooks();
      const magentoResult = await magentoAdapter.registerWebhooks();
      const wooCommerceResult = await wooCommerceAdapter.registerWebhooks();
      const bigCommerceResult = await bigCommerceAdapter.registerWebhooks();
      
      // Verify webhooks were registered
      expect(shopifyResult).toBe(true);
      expect(magentoResult).toBe(true);
      expect(wooCommerceResult).toBe(true);
      expect(bigCommerceResult).toBe(true);
    });
    
    it('should handle webhook events from all platforms', async () => {
      // Create webhook payloads for each platform
      const shopifyPayload = {
        topic: 'products/create',
        body: JSON.stringify({
          id: mockProducts.shopify.id,
          title: mockProducts.shopify.name
        }),
        headers: {
          'x-shopify-hmac-sha256': 'valid_hmac'
        }
      };
      
      const magentoPayload = {
        type: 'catalog_product_created',
        product_id: mockProducts.magento.id
      };
      
      const wooCommercePayload = {
        topic: 'product.updated',
        body: {
          product: {
            id: mockProducts.woocommerce.id,
            name: mockProducts.woocommerce.name
          }
        }
      };
      
      const bigCommercePayload = {
        topic: 'store/product/updated',
        data: {
          id: mockProducts.bigcommerce.id,
          name: mockProducts.bigcommerce.name
        }
      };
      
      // Mock webhook signature verification
      jest.spyOn(shopifyAdapter as any, 'verifyWebhookSignature').mockReturnValue(true);
      
      // Process webhook events
      const shopifyResult = await shopifyAdapter.handleWebhook(shopifyPayload);
      const magentoResult = await magentoAdapter.handleWebhook(magentoPayload);
      const wooCommerceResult = await wooCommerceAdapter.handleWebhook(wooCommercePayload);
      const bigCommerceResult = await bigCommerceAdapter.handleWebhook(bigCommercePayload);
      
      // Verify webhook events were processed
      expect(shopifyResult.processed).toBe(true);
      expect(magentoResult.processed).toBe(true);
      expect(wooCommerceResult.processed).toBe(true);
      expect(bigCommerceResult.processed).toBe(true);
    });
  });

  describe('Data Transformation Compatibility', () => {
    it('should transform product data consistently across platforms', async () => {
      // Create a standard product
      const standardProduct: Product = {
        id: 'data-transform-test-product',
        name: 'Data Transformation Test Frames',
        description: 'Test frames for data transformation compatibility testing',
        brand: 'VARAi Test',
        sku: 'VARAI-TRANSFORM-TEST-001',
        frameType: 'full-rim',
        frameMaterial: 'acetate',
        frameShape: 'round',
        frameColor: 'black',
        lensWidth: 50,
        bridgeWidth: 20,
        templeLength: 145,
        rimType: 'full',
        faceShapeCompatibility: ['round', 'oval'],
        price: 99.99,
        compareAtPrice: 129.99,
        images: [
          {
            id: 'img-1',
            url: 'https://example.com/images/test-frame-1.jpg',
            position: 1,
            alt: 'Front view'
          }
        ],
        variants: [
          {
            id: 'var-1',
            sku: 'VARAI-TRANSFORM-TEST-001-BLK',
            color: 'black',
            price: 99.99,
            compareAtPrice: 129.99,
            inventoryQuantity: 10,
            isActive: true
          }
        ],
        tags: ['data-transform-test'],
        isActive: true,
        metadata: {
          virtualTryOnEnabled: true,
          styleScore: 85,
          frameFitScore: 90
        }
      };
      
      // Get platform-specific transformations
      const shopifyTransformed = (shopifyAdapter as any).mapProductToShopify(standardProduct);
      const magentoTransformed = (magentoAdapter as any).mapProductToMagento(standardProduct);
      const wooCommerceTransformed = (wooCommerceAdapter as any).mapProductToWooCommerce(standardProduct);
      const bigCommerceTransformed = (bigCommerceAdapter as any).mapProductToBigCommerce(standardProduct);
      
      // Verify core product data is preserved in all transformations
      expect(shopifyTransformed.title).toBe(standardProduct.name);
      expect(magentoTransformed.name).toBe(standardProduct.name);
      expect(wooCommerceTransformed.name).toBe(standardProduct.name);
      expect(bigCommerceTransformed.name).toBe(standardProduct.name);
      
      expect(shopifyTransformed.body_html).toContain(standardProduct.description);
      expect(magentoTransformed.description).toContain(standardProduct.description);
      expect(wooCommerceTransformed.description).toContain(standardProduct.description);
      expect(bigCommerceTransformed.description).toContain(standardProduct.description);
      
      // Verify VARAi-specific metadata is preserved
      expect(shopifyTransformed.metafields).toBeDefined();
      expect(magentoTransformed.custom_attributes).toBeDefined();
      expect(wooCommerceTransformed.meta_data).toBeDefined();
      expect(bigCommerceTransformed.meta_fields).toBeDefined();
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle errors consistently across platforms', async () => {
      // Create an invalid product (missing required fields)
      const invalidProduct = {
        id: 'invalid-product',
        // Missing name and other required fields
      } as unknown as Product;
      
      // Attempt to sync invalid product to all platforms
      const shopifyResult = await shopifyAdapter.syncProducts([invalidProduct]);
      const magentoResult = await magentoAdapter.syncProducts([invalidProduct]);
      const wooCommerceResult = await wooCommerceAdapter.syncProducts([invalidProduct]);
      const bigCommerceResult = await bigCommerceAdapter.syncProducts([invalidProduct]);
      
      // Verify all platforms handled the error consistently
      expect(shopifyResult.success).toBe(false);
      expect(shopifyResult.itemsFailed).toBe(1);
      expect(shopifyResult.errors.length).toBe(1);
      
      expect(magentoResult.success).toBe(false);
      expect(magentoResult.itemsFailed).toBe(1);
      expect(magentoResult.errors.length).toBe(1);
      
      expect(wooCommerceResult.success).toBe(false);
      expect(wooCommerceResult.itemsFailed).toBe(1);
      expect(wooCommerceResult.errors.length).toBe(1);
      
      expect(bigCommerceResult.success).toBe(false);
      expect(bigCommerceResult.itemsFailed).toBe(1);
      expect(bigCommerceResult.errors.length).toBe(1);
    });
  });
});