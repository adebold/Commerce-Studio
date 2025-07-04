/**
 * Test helpers for VARAi e-commerce integration tests
 */

import axios, { AxiosInstance } from 'axios';
import { MongoClient, Db } from 'mongodb';

/**
 * Create an API client for testing
 * @param baseUrl Base URL for the API
 * @param apiKey API key for authentication
 * @param platform Platform identifier (shopify, magento, woocommerce, bigcommerce)
 * @returns Axios instance configured for testing
 */
export function createTestApiClient(
  baseUrl: string = process.env.API_BASE_URL || 'http://localhost:3000',
  apiKey: string = process.env.API_KEY || 'test_api_key',
  platform: string = 'test'
): AxiosInstance {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Platform': platform
    }
  });
}

/**
 * Connect to the test database
 * @returns MongoDB client and database
 */
export async function connectToTestDb(): Promise<{ client: MongoClient, db: Db }> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/varai_test';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  return { client, db };
}

/**
 * Generate a random test product
 * @param platform Platform identifier
 * @param customFields Custom fields to override defaults
 * @returns Test product object
 */
export function generateTestProduct(platform: string, customFields: Record<string, any> = {}): Record<string, any> {
  const timestamp = Date.now();
  
  const baseProduct = {
    id: `test-product-${timestamp}`,
    name: `Test Eyewear Frame ${timestamp}`,
    description: 'A test eyewear frame for integration testing',
    brand: 'TestBrand',
    sku: `TEST-SKU-${timestamp}`,
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
        id: `img-${timestamp}`,
        url: 'https://example.com/images/test-frame-1.jpg',
        position: 1,
        alt: 'Front view'
      }
    ],
    variants: [
      {
        id: `var-${timestamp}`,
        sku: `TEST-SKU-${timestamp}-BLK`,
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
  };
  
  return { ...baseProduct, ...customFields };
}

/**
 * Wait for a condition to be true
 * @param condition Function that returns a promise resolving to a boolean
 * @param timeout Timeout in milliseconds
 * @param interval Polling interval in milliseconds
 * @returns Promise that resolves when condition is true
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Clean up test data
 * @param db MongoDB database
 * @param collections Collections to clean
 */
export async function cleanupTestData(db: Db, collections: string[] = []): Promise<void> {
  for (const collection of collections) {
    await db.collection(collection).deleteMany({ 
      $or: [
        { sku: { $regex: /^TEST-SKU-/ } },
        { tags: 'integration-test' }
      ]
    });
  }
}