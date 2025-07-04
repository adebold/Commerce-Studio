/**
 * Mock server for VARAi e-commerce integration tests
 * 
 * This module provides mock servers for each e-commerce platform
 * to simulate API responses during integration testing.
 */

import nock from 'nock';
import { mockProducts, mockOrders, mockCustomers, mockWebhooks } from './mockData';

/**
 * Interface for mock server configuration
 */
interface MockServerConfig {
  baseUrl: string;
  apiKey?: string;
  apiSecret?: string;
}

/**
 * Base class for mock e-commerce servers
 */
abstract class BaseMockServer {
  protected baseUrl: string;
  protected apiKey: string;
  protected apiSecret: string;
  protected scope: nock.Scope;

  constructor(config: MockServerConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey || 'test_api_key';
    this.apiSecret = config.apiSecret || 'test_api_secret';
    this.scope = nock(this.baseUrl);
  }

  /**
   * Start the mock server
   */
  public start(): void {
    // Enable nock
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  }

  /**
   * Stop the mock server
   */
  public stop(): void {
    nock.cleanAll();
    nock.enableNetConnect();
  }

  /**
   * Reset the mock server
   */
  public reset(): void {
    nock.cleanAll();
    this.scope = nock(this.baseUrl);
  }

  /**
   * Mock authentication endpoints
   */
  public abstract mockAuth(): void;

  /**
   * Mock product endpoints
   */
  public abstract mockProducts(): void;

  /**
   * Mock order endpoints
   */
  public abstract mockOrders(): void;

  /**
   * Mock customer endpoints
   */
  public abstract mockCustomers(): void;

  /**
   * Mock webhook endpoints
   */
  public abstract mockWebhooks(): void;
}

/**
 * Mock Shopify server
 */
export class ShopifyMockServer extends BaseMockServer {
  constructor(config: MockServerConfig) {
    super(config);
  }

  public mockAuth(): void {
    this.scope
      .get('/admin/oauth/access_scopes.json')
      .reply(200, {
        access_scopes: [
          { handle: 'read_products' },
          { handle: 'write_products' },
          { handle: 'read_orders' },
          { handle: 'write_orders' }
        ]
      });
  }

  public mockProducts(): void {
    // Get products
    this.scope
      .get('/admin/api/2023-04/products.json')
      .reply(200, {
        products: [mockProducts.shopify]
      });

    // Get product by ID
    this.scope
      .get(`/admin/api/2023-04/products/${mockProducts.shopify.id}.json`)
      .reply(200, {
        product: mockProducts.shopify
      });

    // Create product
    this.scope
      .post('/admin/api/2023-04/products.json')
      .reply(201, {
        product: mockProducts.shopify
      });

    // Update product
    this.scope
      .put(`/admin/api/2023-04/products/${mockProducts.shopify.id}.json`)
      .reply(200, {
        product: mockProducts.shopify
      });
  }

  public mockOrders(): void {
    // Get orders
    this.scope
      .get('/admin/api/2023-04/orders.json')
      .reply(200, {
        orders: [mockOrders.shopify]
      });

    // Get order by ID
    this.scope
      .get(`/admin/api/2023-04/orders/${mockOrders.shopify.id}.json`)
      .reply(200, {
        order: mockOrders.shopify
      });
  }

  public mockCustomers(): void {
    // Get customers
    this.scope
      .get('/admin/api/2023-04/customers.json')
      .reply(200, {
        customers: [mockCustomers.standard]
      });

    // Get customer by ID
    this.scope
      .get(`/admin/api/2023-04/customers/${mockCustomers.standard.id}.json`)
      .reply(200, {
        customer: mockCustomers.standard
      });
  }

  public mockWebhooks(): void {
    // Get webhooks
    this.scope
      .get('/admin/api/2023-04/webhooks.json')
      .reply(200, {
        webhooks: []
      });

    // Create webhook
    this.scope
      .post('/admin/api/2023-04/webhooks.json')
      .reply(201, {
        webhook: {
          id: 'webhook-1',
          address: 'https://example.com/webhooks/shopify',
          topic: 'products/create',
          format: 'json'
        }
      });
  }
}

/**
 * Mock Magento server
 */
export class MagentoMockServer extends BaseMockServer {
  constructor(config: MockServerConfig) {
    super(config);
  }

  public mockAuth(): void {
    this.scope
      .post('/rest/V1/integration/admin/token')
      .reply(200, 'mock_admin_token');
  }

  public mockProducts(): void {
    // Get products
    this.scope
      .get('/rest/V1/products')
      .reply(200, {
        items: [mockProducts.magento]
      });

    // Get product by SKU
    this.scope
      .get(`/rest/V1/products/${mockProducts.magento.sku}`)
      .reply(200, mockProducts.magento);

    // Create product
    this.scope
      .post('/rest/V1/products')
      .reply(201, mockProducts.magento);

    // Update product
    this.scope
      .put(`/rest/V1/products/${mockProducts.magento.sku}`)
      .reply(200, mockProducts.magento);
  }

  public mockOrders(): void {
    // Get orders
    this.scope
      .get('/rest/V1/orders')
      .reply(200, {
        items: [mockOrders.magento]
      });

    // Get order by ID
    this.scope
      .get(`/rest/V1/orders/${mockOrders.magento.id}`)
      .reply(200, mockOrders.magento);
  }

  public mockCustomers(): void {
    // Get customers
    this.scope
      .get('/rest/V1/customers/search')
      .reply(200, {
        items: [mockCustomers.standard]
      });

    // Get customer by ID
    this.scope
      .get(`/rest/V1/customers/${mockCustomers.standard.id}`)
      .reply(200, mockCustomers.standard);
  }

  public mockWebhooks(): void {
    // Magento uses a different approach for webhooks (events)
    this.scope
      .post('/rest/V1/varai/webhooks')
      .reply(201, {
        id: 'webhook-1',
        event_type: 'catalog_product_save_after',
        endpoint: 'https://example.com/webhooks/magento'
      });
  }
}

/**
 * Mock WooCommerce server
 */
export class WooCommerceMockServer extends BaseMockServer {
  constructor(config: MockServerConfig) {
    super(config);
  }

  public mockAuth(): void {
    // WooCommerce uses basic auth
    this.scope
      .get('/wp-json/wc/v3')
      .reply(200, {
        namespace: 'wc/v3',
        routes: {
          '/wc/v3/products': {
            methods: ['GET', 'POST']
          },
          '/wc/v3/orders': {
            methods: ['GET', 'POST']
          }
        }
      });
  }

  public mockProducts(): void {
    // Get products
    this.scope
      .get('/wp-json/wc/v3/products')
      .reply(200, [mockProducts.woocommerce]);

    // Get product by ID
    this.scope
      .get(`/wp-json/wc/v3/products/${mockProducts.woocommerce.id}`)
      .reply(200, mockProducts.woocommerce);

    // Create product
    this.scope
      .post('/wp-json/wc/v3/products')
      .reply(201, mockProducts.woocommerce);

    // Update product
    this.scope
      .put(`/wp-json/wc/v3/products/${mockProducts.woocommerce.id}`)
      .reply(200, mockProducts.woocommerce);
  }

  public mockOrders(): void {
    // Get orders
    this.scope
      .get('/wp-json/wc/v3/orders')
      .reply(200, [mockOrders.woocommerce]);

    // Get order by ID
    this.scope
      .get(`/wp-json/wc/v3/orders/${mockOrders.woocommerce.id}`)
      .reply(200, mockOrders.woocommerce);
  }

  public mockCustomers(): void {
    // Get customers
    this.scope
      .get('/wp-json/wc/v3/customers')
      .reply(200, [mockCustomers.standard]);

    // Get customer by ID
    this.scope
      .get(`/wp-json/wc/v3/customers/${mockCustomers.standard.id}`)
      .reply(200, mockCustomers.standard);
  }

  public mockWebhooks(): void {
    // Get webhooks
    this.scope
      .get('/wp-json/wc/v3/webhooks')
      .reply(200, []);

    // Create webhook
    this.scope
      .post('/wp-json/wc/v3/webhooks')
      .reply(201, {
        id: 'webhook-1',
        name: 'Product created',
        topic: 'product.created',
        delivery_url: 'https://example.com/webhooks/woocommerce'
      });
  }
}

/**
 * Mock BigCommerce server
 */
export class BigCommerceMockServer extends BaseMockServer {
  constructor(config: MockServerConfig) {
    super(config);
  }

  public mockAuth(): void {
    this.scope
      .get('/stores/store-hash/v3')
      .reply(200, {
        status: 200,
        title: 'OK'
      });
  }

  public mockProducts(): void {
    // Get products
    this.scope
      .get('/stores/store-hash/v3/catalog/products')
      .reply(200, {
        data: [mockProducts.bigcommerce],
        meta: {
          pagination: {
            total: 1,
            count: 1,
            per_page: 50,
            current_page: 1,
            total_pages: 1
          }
        }
      });

    // Get product by ID
    this.scope
      .get(`/stores/store-hash/v3/catalog/products/${mockProducts.bigcommerce.id}`)
      .reply(200, {
        data: mockProducts.bigcommerce
      });

    // Create product
    this.scope
      .post('/stores/store-hash/v3/catalog/products')
      .reply(201, {
        data: mockProducts.bigcommerce
      });

    // Update product
    this.scope
      .put(`/stores/store-hash/v3/catalog/products/${mockProducts.bigcommerce.id}`)
      .reply(200, {
        data: mockProducts.bigcommerce
      });
  }

  public mockOrders(): void {
    // Get orders
    this.scope
      .get('/stores/store-hash/v3/orders')
      .reply(200, {
        data: [mockOrders.bigcommerce],
        meta: {
          pagination: {
            total: 1,
            count: 1,
            per_page: 50,
            current_page: 1,
            total_pages: 1
          }
        }
      });

    // Get order by ID
    this.scope
      .get(`/stores/store-hash/v3/orders/${mockOrders.bigcommerce.id}`)
      .reply(200, {
        data: mockOrders.bigcommerce
      });
  }

  public mockCustomers(): void {
    // Get customers
    this.scope
      .get('/stores/store-hash/v3/customers')
      .reply(200, {
        data: [mockCustomers.standard],
        meta: {
          pagination: {
            total: 1,
            count: 1,
            per_page: 50,
            current_page: 1,
            total_pages: 1
          }
        }
      });

    // Get customer by ID
    this.scope
      .get(`/stores/store-hash/v3/customers/${mockCustomers.standard.id}`)
      .reply(200, {
        data: mockCustomers.standard
      });
  }

  public mockWebhooks(): void {
    // Get webhooks
    this.scope
      .get('/stores/store-hash/v3/hooks')
      .reply(200, {
        data: []
      });

    // Create webhook
    this.scope
      .post('/stores/store-hash/v3/hooks')
      .reply(201, {
        data: {
          id: 'webhook-1',
          scope: 'store/product/*',
          destination: 'https://example.com/webhooks/bigcommerce',
          is_active: true
        }
      });
  }
}

/**
 * Create a mock server for the specified platform
 * @param platform Platform name (shopify, magento, woocommerce, bigcommerce)
 * @param config Mock server configuration
 * @returns Mock server instance
 */
export function createMockServer(platform: string, config: MockServerConfig): BaseMockServer {
  switch (platform) {
    case 'shopify':
      return new ShopifyMockServer(config);
    case 'magento':
      return new MagentoMockServer(config);
    case 'woocommerce':
      return new WooCommerceMockServer(config);
    case 'bigcommerce':
      return new BigCommerceMockServer(config);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}