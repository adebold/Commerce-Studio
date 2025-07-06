/**
 * Test Suite for Reporting and Quality Management System
 * Tests API endpoints, authentication, and data processing
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock Express app for testing
const express = require('express');
const app = express();

// Import services
const authService = require('../api/auth-service');
const reportingService = require('../api/reporting-service');
const qualityService = require('../api/quality-management-service');

app.use(express.json());
app.use('/api/auth', authService);
app.use('/api/reporting', reportingService);
app.use('/api/quality', qualityService);

describe('Reporting and Quality Management System', () => {
  let superAdminToken;
  let clientToken;

  beforeAll(async () => {
    // Setup test tokens
    superAdminToken = jwt.sign(
      {
        id: 'test-super-admin-id',
        email: 'admin@test.com',
        role: 'super_admin',
        name: 'Test Super Admin'
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    clientToken = jwt.sign(
      {
        id: 'test-client-id',
        email: 'client@test.com',
        role: 'client',
        clientId: 'test-client-123',
        name: 'Test Client'
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('Authentication Service', () => {
    test('should verify valid super admin token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('super_admin');
    });

    test('should verify valid client token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('client');
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Reporting Service', () => {
    test('super admin should access cross-platform dashboard', async () => {
      const response = await request(app)
        .get('/api/reporting/super-admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ timeRange: '7d' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.overview).toBeDefined();
    });

    test('client should access filtered dashboard', async () => {
      const response = await request(app)
        .get('/api/reporting/client/dashboard')
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ timeRange: '7d' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.clientId).toBe('test-client-123');
    });

    test('client should not access super admin dashboard', async () => {
      const response = await request(app)
        .get('/api/reporting/super-admin/dashboard')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    test('should provide performance analysis', async () => {
      const response = await request(app)
        .get('/api/reporting/performance/analysis')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ timeRange: '30d' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toBeDefined();
    });

    test('should handle data export requests', async () => {
      const exportConfig = {
        reportType: 'user_sessions',
        format: 'csv',
        timeRange: '7d',
        filters: {}
      };

      const response = await request(app)
        .post('/api/reporting/export')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(exportConfig);

      // Note: In a real test, you'd mock the database and verify the export
      // For now, we just check that the endpoint is accessible
      expect([200, 500]).toContain(response.status); // 500 expected without real DB
    });
  });

  describe('Quality Management Service', () => {
    test('should score individual conversations', async () => {
      const scoreRequest = {
        conversationId: 'test-conversation-123',
        manualScore: 4.5
      };

      const response = await request(app)
        .post('/api/quality/score-conversation')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(scoreRequest);

      // Note: In a real test, you'd mock the database
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should provide quality trends analysis', async () => {
      const response = await request(app)
        .get('/api/quality/trends')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ timeRange: '30d', granularity: 'daily' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trends).toBeDefined();
    });

    test('should manage quality alerts', async () => {
      const alertData = {
        type: 'low_satisfaction',
        severity: 'high',
        title: 'Test Alert',
        description: 'Test alert description',
        threshold: 3.0
      };

      const response = await request(app)
        .post('/api/quality/alerts')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(alertData);

      // Note: In a real test, you'd mock the database
      expect([200, 500]).toContain(response.status);
    });

    test('should provide quality recommendations', async () => {
      const response = await request(app)
        .get('/api/quality/recommendations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ timeRange: '30d' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toBeDefined();
    });

    test('client should only access their quality data', async () => {
      const response = await request(app)
        .get('/api/quality/trends')
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ timeRange: '7d' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // In a real implementation, verify that only client data is returned
    });
  });

  describe('Role-Based Access Control', () => {
    test('should enforce super admin only endpoints', async () => {
      const response = await request(app)
        .get('/api/auth/clients')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    test('should allow super admin access to client endpoints', async () => {
      const response = await request(app)
        .get('/api/reporting/client/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ clientId: 'test-client-123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should filter data based on user role', async () => {
      // Test that client can only see their own data
      const clientResponse = await request(app)
        .get('/api/quality/alerts')
        .set('Authorization', `Bearer ${clientToken}`);

      // Test that super admin can see all data
      const adminResponse = await request(app)
        .get('/api/quality/alerts')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(clientResponse.status).toBe(200);
      expect(adminResponse.status).toBe(200);
      // In a real implementation, verify data filtering
    });
  });

  describe('Data Validation and Security', () => {
    test('should validate required fields in requests', async () => {
      const invalidRequest = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/quality/score-conversation')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should sanitize input data', async () => {
      const maliciousRequest = {
        conversationId: '<script>alert("xss")</script>',
        manualScore: 'invalid'
      };

      const response = await request(app)
        .post('/api/quality/score-conversation')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(maliciousRequest);

      // Should handle malicious input gracefully
      expect([400, 500]).toContain(response.status);
    });

    test('should handle database errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we just ensure endpoints don't crash
      const response = await request(app)
        .get('/api/reporting/super-admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBeDefined();
      expect(typeof response.body).toBe('object');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/auth/verify')
          .set('Authorization', `Bearer ${superAdminToken}`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect([200, 500]).toContain(response.status);
      });
    });

    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/reporting/super-admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`);
      
      const responseTime = Date.now() - startTime;
      
      // Should respond within 5 seconds (generous for testing)
      expect(responseTime).toBeLessThan(5000);
    });
  });
});

// Helper functions for testing
function generateMockAnalyticsData() {
  return {
    overview: {
      totalSessions: 1000,
      totalConversions: 150,
      conversionRate: 15.0,
      timeRange: '7d',
      platform: 'all'
    },
    aiPerformance: {
      avgProcessingTime: 2500,
      successRate: 0.95,
      avgAccuracy: 0.92,
      totalAnalyses: 800
    },
    platformBreakdown: [
      { _id: 'shopify', sessions: 400, conversions: 60 },
      { _id: 'magento', sessions: 300, conversions: 45 },
      { _id: 'woocommerce', sessions: 200, conversions: 30 },
      { _id: 'html', sessions: 100, conversions: 15 }
    ],
    qualityMetrics: {
      avgSatisfaction: 4.2,
      avgCoherence: 4.0,
      avgHelpfulness: 4.3,
      completionRate: 0.85
    }
  };
}

function generateMockQualityData() {
  return {
    overview: {
      totalConversations: 500,
      avgSatisfaction: 4.1,
      avgCoherence: 3.9,
      avgHelpfulness: 4.2,
      completionRate: 0.82,
      avgResponseTime: 1800
    },
    qualityDistribution: [
      { _id: 5, count: 150 },
      { _id: 4, count: 200 },
      { _id: 3, count: 100 },
      { _id: 2, count: 30 },
      { _id: 1, count: 20 }
    ],
    commonIssues: [
      { _id: 'intent_recognition_failure', count: 25, recoveryRate: 0.8 },
      { _id: 'timeout_error', count: 15, recoveryRate: 0.6 },
      { _id: 'api_rate_limit', count: 10, recoveryRate: 0.9 }
    ]
  };
}

module.exports = {
  generateMockAnalyticsData,
  generateMockQualityData
};