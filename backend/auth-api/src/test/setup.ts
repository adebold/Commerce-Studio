/**
 * Test setup file for Jest
 * Configures global test environment and utilities
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { database } from '../config/database';

let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  
  // Initialize database singleton with test database
  database.initialize(mongoClient.db('test-auth-db'));
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const db = database.getDb();
  const collections = await db.listCollections().toArray();
  
  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (mongoClient) {
    await mongoClient.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '10';
process.env.NODE_ENV = 'test';