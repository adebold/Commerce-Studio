/**
 * Mock data for VARAi e-commerce integration tests
 */

/**
 * Mock product data for testing
 */
export const mockProducts = {
  // Shopify product mock
  shopify: {
    id: 'shopify-test-product-1',
    name: 'Shopify Test Frames',
    description: 'Test frames for Shopify integration testing',
    brand: 'VARAi Test',
    sku: 'VARAI-SHOPIFY-TEST-001',
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
        sku: 'VARAI-SHOPIFY-TEST-001-BLK',
        color: 'black',
        price: 99.99,
        compareAtPrice: 129.99,
        inventoryQuantity: 10,
        isActive: true
      }
    ],
    tags: ['test', 'integration-test'],
    isActive: true,
    metadata: {
      virtualTryOnEnabled: true,
      styleScore: 85,
      frameFitScore: 90
    }
  },
  
  // Magento product mock
  magento: {
    id: 'magento-test-product-1',
    name: 'Magento Test Frames',
    description: 'Test frames for Magento integration testing',
    brand: 'VARAi Test',
    sku: 'VARAI-MAGENTO-TEST-001',
    frameType: 'full-rim',
    frameMaterial: 'metal',
    frameShape: 'square',
    frameColor: 'silver',
    lensWidth: 52,
    bridgeWidth: 18,
    templeLength: 140,
    rimType: 'full',
    faceShapeCompatibility: ['oval', 'heart'],
    price: 129.99,
    compareAtPrice: 159.99,
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/images/test-frame-2.jpg',
        position: 1,
        alt: 'Front view'
      }
    ],
    variants: [
      {
        id: 'var-1',
        sku: 'VARAI-MAGENTO-TEST-001-SLV',
        color: 'silver',
        price: 129.99,
        compareAtPrice: 159.99,
        inventoryQuantity: 15,
        isActive: true
      }
    ],
    tags: ['test', 'integration-test'],
    isActive: true,
    metadata: {
      virtualTryOnEnabled: true,
      styleScore: 80,
      frameFitScore: 85
    }
  },
  
  // WooCommerce product mock
  woocommerce: {
    id: 'woo-test-product-1',
    name: 'WooCommerce Test Frames',
    description: 'Test frames for WooCommerce integration testing',
    brand: 'VARAi Test',
    sku: 'VARAI-WOO-TEST-001',
    frameType: 'semi-rim',
    frameMaterial: 'titanium',
    frameShape: 'rectangle',
    frameColor: 'gold',
    lensWidth: 54,
    bridgeWidth: 17,
    templeLength: 142,
    rimType: 'semi',
    faceShapeCompatibility: ['square', 'round'],
    price: 149.99,
    compareAtPrice: 179.99,
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/images/test-frame-3.jpg',
        position: 1,
        alt: 'Front view'
      }
    ],
    variants: [
      {
        id: 'var-1',
        sku: 'VARAI-WOO-TEST-001-GLD',
        color: 'gold',
        price: 149.99,
        compareAtPrice: 179.99,
        inventoryQuantity: 8,
        isActive: true
      }
    ],
    tags: ['test', 'integration-test'],
    isActive: true,
    metadata: {
      virtualTryOnEnabled: true,
      styleScore: 90,
      frameFitScore: 88
    }
  },
  
  // BigCommerce product mock
  bigcommerce: {
    id: 'bc-test-product-1',
    name: 'BigCommerce Test Frames',
    description: 'Test frames for BigCommerce integration testing',
    brand: 'VARAi Test',
    sku: 'VARAI-BC-TEST-001',
    frameType: 'rimless',
    frameMaterial: 'plastic',
    frameShape: 'aviator',
    frameColor: 'blue',
    lensWidth: 56,
    bridgeWidth: 16,
    templeLength: 138,
    rimType: 'rimless',
    faceShapeCompatibility: ['oval', 'diamond'],
    price: 159.99,
    compareAtPrice: 189.99,
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/images/test-frame-4.jpg',
        position: 1,
        alt: 'Front view'
      }
    ],
    variants: [
      {
        id: 'var-1',
        sku: 'VARAI-BC-TEST-001-BLU',
        color: 'blue',
        price: 159.99,
        compareAtPrice: 189.99,
        inventoryQuantity: 12,
        isActive: true
      }
    ],
    tags: ['test', 'integration-test'],
    isActive: true,
    metadata: {
      virtualTryOnEnabled: true,
      styleScore: 82,
      frameFitScore: 86
    }
  }
};

/**
 * Mock order data for testing
 */
export const mockOrders = {
  // Shopify order mock
  shopify: {
    id: 'shopify-test-order-1',
    orderNumber: 'SHOP1001',
    customerId: 'customer-1',
    customerEmail: 'test@example.com',
    status: 'processing',
    createdAt: new Date().toISOString(),
    totalPrice: 99.99,
    currency: 'USD',
    lineItems: [
      {
        id: 'line-1',
        productId: 'shopify-test-product-1',
        variantId: 'var-1',
        sku: 'VARAI-SHOPIFY-TEST-001-BLK',
        name: 'Shopify Test Frames - Black',
        quantity: 1,
        price: 99.99
      }
    ],
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Customer',
      address1: '123 Test St',
      city: 'Test City',
      province: 'Test State',
      zip: '12345',
      country: 'US'
    }
  },
  
  // Magento order mock
  magento: {
    id: 'magento-test-order-1',
    orderNumber: 'MAG1001',
    customerId: 'customer-1',
    customerEmail: 'test@example.com',
    status: 'processing',
    createdAt: new Date().toISOString(),
    totalPrice: 129.99,
    currency: 'USD',
    lineItems: [
      {
        id: 'line-1',
        productId: 'magento-test-product-1',
        variantId: 'var-1',
        sku: 'VARAI-MAGENTO-TEST-001-SLV',
        name: 'Magento Test Frames - Silver',
        quantity: 1,
        price: 129.99
      }
    ],
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Customer',
      address1: '123 Test St',
      city: 'Test City',
      province: 'Test State',
      zip: '12345',
      country: 'US'
    }
  },
  
  // WooCommerce order mock
  woocommerce: {
    id: 'woo-test-order-1',
    orderNumber: 'WOO1001',
    customerId: 'customer-1',
    customerEmail: 'test@example.com',
    status: 'processing',
    createdAt: new Date().toISOString(),
    totalPrice: 149.99,
    currency: 'USD',
    lineItems: [
      {
        id: 'line-1',
        productId: 'woo-test-product-1',
        variantId: 'var-1',
        sku: 'VARAI-WOO-TEST-001-GLD',
        name: 'WooCommerce Test Frames - Gold',
        quantity: 1,
        price: 149.99
      }
    ],
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Customer',
      address1: '123 Test St',
      city: 'Test City',
      province: 'Test State',
      zip: '12345',
      country: 'US'
    }
  },
  
  // BigCommerce order mock
  bigcommerce: {
    id: 'bc-test-order-1',
    orderNumber: 'BC1001',
    customerId: 'customer-1',
    customerEmail: 'test@example.com',
    status: 'processing',
    createdAt: new Date().toISOString(),
    totalPrice: 159.99,
    currency: 'USD',
    lineItems: [
      {
        id: 'line-1',
        productId: 'bc-test-product-1',
        variantId: 'var-1',
        sku: 'VARAI-BC-TEST-001-BLU',
        name: 'BigCommerce Test Frames - Blue',
        quantity: 1,
        price: 159.99
      }
    ],
    shippingAddress: {
      firstName: 'Test',
      lastName: 'Customer',
      address1: '123 Test St',
      city: 'Test City',
      province: 'Test State',
      zip: '12345',
      country: 'US'
    }
  }
};

/**
 * Mock customer data for testing
 */
export const mockCustomers = {
  // Standard customer
  standard: {
    id: 'customer-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '555-123-4567',
    createdAt: new Date().toISOString(),
    addresses: [
      {
        id: 'address-1',
        firstName: 'Test',
        lastName: 'Customer',
        address1: '123 Test St',
        city: 'Test City',
        province: 'Test State',
        zip: '12345',
        country: 'US',
        isDefault: true
      }
    ],
    metadata: {
      faceShape: 'oval',
      stylePreferences: ['classic', 'professional'],
      pdMeasurement: 64
    }
  }
};

/**
 * Mock webhook payloads for testing
 */
export const mockWebhooks = {
  // Shopify webhooks
  shopify: {
    productCreate: {
      id: 'shopify-test-product-1',
      title: 'Shopify Test Frames',
      body_html: 'Test frames for Shopify integration testing',
      vendor: 'VARAi Test',
      product_type: 'Eyeglasses',
      created_at: new Date().toISOString(),
      handle: 'shopify-test-frames',
      variants: [
        {
          id: 'var-1',
          sku: 'VARAI-SHOPIFY-TEST-001-BLK',
          price: '99.99',
          compare_at_price: '129.99',
          inventory_quantity: 10
        }
      ],
      options: [
        {
          name: 'Color',
          values: ['Black']
        }
      ],
      images: [
        {
          id: 'img-1',
          src: 'https://example.com/images/test-frame-1.jpg',
          position: 1,
          alt: 'Front view'
        }
      ],
      tags: 'test,integration-test'
    },
    orderCreate: {
      id: 'shopify-test-order-1',
      name: '#1001',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      total_price: '99.99',
      currency: 'USD',
      line_items: [
        {
          id: 'line-1',
          product_id: 'shopify-test-product-1',
          variant_id: 'var-1',
          sku: 'VARAI-SHOPIFY-TEST-001-BLK',
          name: 'Shopify Test Frames - Black',
          quantity: 1,
          price: '99.99'
        }
      ]
    }
  }
};