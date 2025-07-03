/**
 * Integration tests for Shopify adapter
 * 
 * These tests verify that the Shopify adapter correctly integrates
 * with the VARAi platform, including authentication, product synchronization,
 * order management, customer data, and webhook handling.
 */

import { ShopifyAdapter } from '../../../../../src/integrations/platforms/shopify/shopify-adapter-varai';
import { ShopifyMockServer } from '../../common/mocks/mockServer';
import { mockProducts, mockOrders, mockCustomers } from '../../common/mocks/mockData';
import { createTestApiClient, connectToTestDb, cleanupTestData } from '../../common/utils/testHelpers';
import { MongoClient, Db } from 'mongodb';
import { LoggerFactory } from '../../../../../src/utils/logger';
import { TokenManager, InMemoryTokenStorage } from '../../../../../src/integrations/auth/token-manager';
import { ConnectionStatus, PlatformConfig } from '../../../../../src/integrations/types/platform-adapter';

// Test configuration
const testConfig: PlatformConfig = {
  integrationId: 'test-integration',
  storeUrl: 'https://test-store.myshopify.com',
  credentials: {
    apiKey: 'process.env.APIKEY_2622',
    apiSecret: 'process.env.APIKEY_2624'
  },
  webhookUrl: 'https://webhook.example.com/varai-shopify',
  apiVersion: '2023-04'
};

describe('Shopify Integration Tests', () => {
  let mockServer: ShopifyMockServer;
  let adapter: ShopifyAdapter;
  let logger: any;
  let tokenManager: TokenManager;
  let mongoClient: MongoClient;
  let db: Db;
  let apiClient: any;

  beforeAll(async () => {
    // Connect to test database
    const dbConnection = await connectToTestDb();
    mongoClient = dbConnection.client;
    db = dbConnection.db;

    // Create API client
    apiClient = createTestApiClient(undefined, undefined, 'shopify');

    // Setup mock server
    mockServer = new ShopifyMockServer({
      baseUrl: 'https://test-store.myshopify.com'
    });
    mockServer.start();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData(db, ['products', 'orders', 'customers']);

    // Close database connection
    await mongoClient.close();

    // Stop mock server
    mockServer.stop();
  });

  beforeEach(() => {
    // Reset mock server
    mockServer.reset();

    // Setup mocks
    mockServer.mockAuth();
    mockServer.mockProducts();
    mockServer.mockOrders();
    mockServer.mockCustomers();
    mockServer.mockWebhooks();

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
      platform: 'shopify'
    });

    // Create adapter
    adapter = new ShopifyAdapter(testConfig, logger, tokenManager);
  });

  describe('Authentication and Connection', () => {
    it('should successfully connect to Shopify', async () => {
      const result = await adapter.connect();
      
      expect(result.connected).toBe(true);
      expect(result.errorMessage).toBeUndefined();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Successfully connected'));
    });

    it('should handle connection failure gracefully', async () => {
      // Mock connection failure
      mockServer.reset();
      mockServer.scope.get('/admin/oauth/access_scopes.json').replyWithError('Connection failed');
      
      const result = await adapter.connect();
      
      expect(result.connected).toBe(false);
      expect(result.errorMessage).toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error connecting'), expect.any(Object));
    });
  });

  describe('Product Synchronization', () => {
    it('should successfully sync products from VARAi to Shopify', async () => {
      const products = [mockProducts.shopify];
      
      const result = await adapter.syncProducts(products);
      
      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBe(1);
      expect(result.itemsFailed).toBe(0);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Product sync completed'));
    });

    it('should handle product sync failures gracefully', async () => {
      // Mock product sync failure
      mockServer.reset();
      mockServer.mockAuth();
      mockServer.scope.get('/admin/api/2023-04/products.json').replyWithError('API error');
      
      const products = [mockProducts.shopify];
      
      const result = await adapter.syncProducts(products);
      
      expect(result.success).toBe(false);
      expect(result.itemsFailed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to sync product'), expect.any(Object));
    });
  });

  describe('Order Management', () => {
    it('should successfully process orders', async () => {
      const result = await adapter.processOrders();
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].status).toBe('processed');
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Order processing completed'));
    });

    it('should handle empty orders list', async () => {
      // Mock empty orders list
      mockServer.reset();
      mockServer.mockAuth();
      mockServer.scope.get('/admin/api/2023-04/orders.json').reply(200, { orders: [] });
      
      const result = await adapter.processOrders();
      
      expect(result.length).toBe(0);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('No orders found'));
    });
  });

  describe('Webhook Handling', () => {
    it('should successfully register webhooks', async () => {
      const result = await adapter.registerWebhooks();
      
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Registering VARAi webhooks'));
    });

    it('should handle webhook registration failure', async () => {
      // Mock webhook registration failure
      mockServer.reset();
      mockServer.mockAuth();
      mockServer.scope.get('/admin/api/2023-04/webhooks.json').replyWithError('API error');
      
      const result = await adapter.registerWebhooks();
      
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error registering webhooks'), expect.any(Object));
    });

    it('should process product webhook events', async () => {
      const webhookPayload = {
        topic: 'products/create',
        body: JSON.stringify({
          id: mockProducts.shopify.id,
          title: mockProducts.shopify.name
        }),
        headers: {
          'x-shopify-hmac-sha256': 'valid_hmac'
        }
      };
      
      // Mock the verifyWebhookSignature method
      jest.spyOn(adapter as any, 'verifyWebhookSignature').mockReturnValue(true);
      
      const result = await adapter.handleWebhook(webhookPayload);
      
      expect(result.processed).toBe(true);
      expect(result.eventType).toBe('products/create');
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Handling VARAi Shopify webhook'));
    });

    it('should reject invalid webhook signatures', async () => {
      const webhookPayload = {
        topic: 'products/create',
        body: JSON.stringify({
          id: mockProducts.shopify.id,
          title: mockProducts.shopify.name
        }),
        headers: {
          'x-shopify-hmac-sha256': 'invalid_hmac'
        }
      };
      
      // Mock the verifyWebhookSignature method
      jest.spyOn(adapter as any, 'verifyWebhookSignature').mockReturnValue(false);
      
      const result = await adapter.handleWebhook(webhookPayload);
      
      expect(result.processed).toBe(false);
      expect(result.errorMessage).toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid webhook signature'));
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should retry failed API requests', async () => {
      // Mock a temporary failure followed by success
      mockServer.reset();
      mockServer.mockAuth();
      mockServer.scope
        .get('/admin/api/2023-04/products.json')
        .once()
        .replyWithError('Temporary API error')
        .get('/admin/api/2023-04/products.json')
        .reply(200, { products: [mockProducts.shopify] });
      
      const result = await adapter.syncProducts([mockProducts.shopify]);
      
      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBe(1);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Retrying API request'));
    });

    it('should handle rate limiting gracefully', async () => {
      // Mock a rate limit response
      mockServer.reset();
      mockServer.mockAuth();
      mockServer.scope
        .get('/admin/api/2023-04/products.json')
        .reply(429, { errors: 'Too Many Requests' }, { 'Retry-After': '2' });
      
      const result = await adapter.syncProducts([mockProducts.shopify]);
      
      expect(result.success).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Rate limited'));
    });
  });
});