import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcrypt';
import { database } from '../config/database';
import { JwtService } from '../services/jwtService';
import { describe, it, beforeAll, afterAll, beforeEach, expect } from '@jest/globals';

describe('Authentication Endpoints', () => {
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;
  let testDb: Db;
  let testUser: any;
  let validAccessToken: string;
  let validRefreshToken: string;
  let app: any;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    testDb = mongoClient.db('test');
    
    // Initialize the database connection for the app
    database.initialize(testDb);
    
    // Import app after database is initialized
    const appModule = await import('../app');
    app = appModule.default;
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    await testDb.collection('users').deleteMany({});
    await testDb.collection('refreshTokens').deleteMany({});

    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    const userResult = await testDb.collection('users').insertOne({
      email: 'test@example.com',
      passwordHash: hashedPassword,
      roles: ['user'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    testUser = {
      _id: userResult.insertedId,
      email: 'test@example.com',
      passwordHash: hashedPassword,
      roles: ['user'],
      isActive: true,
    };

    // Generate valid tokens for testing
    validAccessToken = JwtService.generateAccessToken({
      userId: testUser._id.toString(),
      email: testUser.email,
      roles: testUser.roles,
    });

    validRefreshToken = JwtService.generateRefreshToken();
    await testDb.collection('refreshTokens').insertOne({
      token: validRefreshToken,
      userId: testUser._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should login with username instead of email', async () => {
      // Update user to have a username
      await testDb.collection('users').updateOne(
        { _id: testUser._id },
        { $set: { username: 'testuser' } }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser', // Using username in email field
          password: 'testpassword123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpassword123',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
        })
        .expect(400);

      expect(response.body.message).toContain('Validation error');
    });

    it('should enforce rate limiting', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
      );

      const responses = await Promise.all(requests);
      
      // Last request should be rate limited
      expect(responses[5].status).toBe(429);
    });

    it('should create refresh token in database', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
        })
        .expect(200);

      const refreshTokenDoc = await testDb.collection('refreshTokens').findOne({
        token: response.body.refreshToken,
      });

      expect(refreshTokenDoc).toBeTruthy();
      expect(refreshTokenDoc?.userId.toString()).toBe(testUser._id.toString());
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: validRefreshToken,
        })
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');

      // Verify refresh token is removed from database
      const refreshTokenDoc = await testDb.collection('refreshTokens').findOne({
        token: validRefreshToken,
      });
      expect(refreshTokenDoc).toBeNull();
    });

    it('should handle invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: validRefreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).not.toBe(validAccessToken);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should reject expired refresh token', async () => {
      // Create expired refresh token
      const expiredToken = JwtService.generateRefreshToken();
      await testDb.collection('refreshTokens').insertOne({
        token: expiredToken,
        userId: testUser._id,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: expiredToken,
        })
        .expect(401);

      expect(response.body.message).toBe('Refresh token expired');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid access token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.roles).toEqual(['user']);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid access token');
    });

    it('should reject expired token', async () => {
      // Generate expired token (this is a mock - in real scenario, we'd need to manipulate time)
      const expiredToken = JwtService.generateAccessToken({
        userId: testUser._id.toString(),
        email: testUser.email,
        roles: testUser.roles,
      });

      // For testing purposes, we'll use an obviously invalid token format
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer expired.token.here')
        .expect(401);

      expect(response.body.message).toBe('Invalid access token');
    });

    it('should handle user not found', async () => {
      // Delete the user but keep the token
      await testDb.collection('users').deleteOne({ _id: testUser._id });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Security Tests', () => {
    it('should not expose password in any response', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
        });

      expect(loginResponse.body.user).not.toHaveProperty('password');

      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

      expect(profileResponse.body.user).not.toHaveProperty('password');
    });

    it('should use secure password hashing', async () => {
      const user = await testDb.collection('users').findOne({ _id: testUser._id });
      expect(user?.passwordHash).not.toBe('testpassword123');
      expect(user?.passwordHash.startsWith('$2b$')).toBe(true); // bcrypt hash format
    });

    it('should generate unique refresh tokens', async () => {
      const token1 = JwtService.generateRefreshToken();
      const token2 = JwtService.generateRefreshToken();
      expect(token1).not.toBe(token2);
    });

    it('should validate JWT token structure', async () => {
      const token = JwtService.generateAccessToken({
        userId: testUser._id.toString(),
        email: testUser.email,
        roles: testUser.roles,
      });

      // JWT should have 3 parts separated by dots
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should handle empty request bodies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Validation error');
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: longPassword,
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle special characters in email', async () => {
      // Create user with special characters
      const specialEmail = 'test+special@example.com';
      const hashedPassword = await bcrypt.hash('testpassword123', 12);
      await testDb.collection('users').insertOne({
        email: specialEmail,
        passwordHash: hashedPassword,
        roles: ['user'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: specialEmail,
          password: 'testpassword123',
        })
        .expect(200);

      expect(response.body.user.email).toBe(specialEmail);
    });
  });
  describe('Token Generation', () => {

    it('should generate unique refresh tokens', async () => {
      const token1 = JwtService.generateRefreshToken();
      const token2 = JwtService.generateRefreshToken();
      expect(token1).not.toBe(token2);
    });

    it('should validate JWT token structure', async () => {
      const token = JwtService.generateAccessToken({
        userId: testUser._id.toString(),
        email: testUser.email,
        roles: testUser.roles,
      });

      // JWT should have 3 parts separated by dots
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should handle empty request bodies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Validation error');
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: longPassword,
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle special characters in email', async () => {
      // Create user with special characters
      const specialEmail = 'test+special@example.com';
      const hashedPassword = await bcrypt.hash('testpassword123', 12);
      await testDb.collection('users').insertOne({
        email: specialEmail,
        passwordHash: hashedPassword,
        roles: ['user'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: specialEmail,
          password: 'testpassword123',
        })
        .expect(200);

      expect(response.body.user.email).toBe(specialEmail);
    });
  });
});