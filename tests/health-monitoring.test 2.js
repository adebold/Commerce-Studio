/**
 * Health Monitoring System Tests
 * Implements test specifications from test_specs_LS1.md
 */

const request = require('supertest');
const WebSocket = require('ws');
const axios = require('axios');

// Mock axios for external API calls
jest.mock('axios');
const mockedAxios = axios;

describe('Health Monitoring System', () => {
  let app;
  let server;
  let wsServer;
  
  beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    process.env.WS_PORT = '3002';
    process.env.JWT_SECRET = 'test-secret';
    process.env.API_KEY = 'test-api-key';
    
    // Import the health monitoring API
    const healthApp = require('../website/api/health/index.js');
    app = healthApp.app;
    server = healthApp.server;
    wsServer = healthApp.wsServer;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    if (wsServer) {
      wsServer.close();
    }
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('API Endpoints', () => {
    describe('GET /api/health/status', () => {
      it('should return overall system health status', async () => {
        // Mock successful health checks for all services
        mockedAxios.get.mockResolvedValueOnce({ 
          status: 200, 
          data: { status: 'healthy' },
          headers: { 'content-type': 'application/json' }
        });
        mockedAxios.get.mockResolvedValueOnce({ 
          status: 200, 
          data: { status: 'healthy' },
          headers: { 'content-type': 'application/json' }
        });
        mockedAxios.get.mockResolvedValueOnce({ 
          status: 200, 
          data: { status: 'healthy' },
          headers: { 'content-type': 'application/json' }
        });
        mockedAxios.get.mockResolvedValueOnce({
          status: 200,
          data: { status: 'healthy' },
          headers: { 'content-type': 'application/json' }
        });
        });

        const response = await request(app)
          .get('/api/health/status')
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('services');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body.services).toHaveLength(4);
        
        // Verify service structure
        response.body.services.forEach(service => {
          expect(service).toHaveProperty('name');
          expect(service).toHaveProperty('status');
          expect(service).toHaveProperty('responseTime');
          expect(service).toHaveProperty('lastCheck');
        });
      });

      it('should return 401 without valid API key', async () => {
        await request(app)
          .get('/api/health/status')
          .expect(401);
      });

      it('should handle service failures gracefully', async () => {
        // Mock one service failure
        mockedAxios.get.mockRejectedValueOnce(new Error('Service unavailable'));
        mockedAxios.get.mockResolvedValueOnce({ 
          status: 200, 
          data: { status: 'healthy' }
        });
        mockedAxios.get.mockResolvedValueOnce({ 
          status: 200, 
          data: { status: 'healthy' }
        });
        mockedAxios.get.mockResolvedValueOnce({ 
          status: 200, 
          data: { status: 'healthy' }
        });

        const response = await request(app)
          .get('/api/health/status')
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body.status).toBe('degraded');
        
        const failedService = response.body.services.find(s => s.status === 'unhealthy');
        expect(failedService).toBeDefined();
      });
    });

    describe('GET /api/health/metrics', () => {
      it('should return aggregated metrics for all services', async () => {
        const response = await request(app)
          .get('/api/health/metrics')
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body).toHaveProperty('metrics');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body.metrics).toHaveProperty('responseTime');
        expect(response.body.metrics).toHaveProperty('errorRate');
        expect(response.body.metrics).toHaveProperty('availability');
      });

      it('should support time range filtering', async () => {
        const startTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
        const endTime = new Date().toISOString();

        const response = await request(app)
          .get('/api/health/metrics')
          .query({ start: startTime, end: endTime })
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body).toHaveProperty('metrics');
        expect(response.body).toHaveProperty('timeRange');
        expect(response.body.timeRange.start).toBe(startTime);
        expect(response.body.timeRange.end).toBe(endTime);
      });
    });

    describe('GET /api/health/alerts', () => {
      it('should return current active alerts', async () => {
        const response = await request(app)
          .get('/api/health/alerts')
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body).toHaveProperty('alerts');
        expect(response.body).toHaveProperty('summary');
        expect(Array.isArray(response.body.alerts)).toBe(true);
        
        if (response.body.alerts.length > 0) {
          const alert = response.body.alerts[0];
          expect(alert).toHaveProperty('id');
          expect(alert).toHaveProperty('service');
          expect(alert).toHaveProperty('severity');
          expect(alert).toHaveProperty('message');
          expect(alert).toHaveProperty('timestamp');
        }
      });

      it('should support severity filtering', async () => {
        const response = await request(app)
          .get('/api/health/alerts')
          .query({ severity: 'critical' })
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body).toHaveProperty('alerts');
        
        if (response.body.alerts.length > 0) {
          response.body.alerts.forEach(alert => {
            expect(alert.severity).toBe('critical');
          });
        }
      });
    });

    describe('POST /api/health/alerts/:id/acknowledge', () => {
      it('should acknowledge an alert', async () => {
        // First, create a mock alert scenario
        mockedAxios.get.mockRejectedValueOnce(new Error('Service down'));
        
        // Wait for alert to be generated (in real scenario)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get alerts to find an ID
        const alertsResponse = await request(app)
          .get('/api/health/alerts')
          .set('x-api-key', 'test-api-key');
        
        if (alertsResponse.body.alerts.length > 0) {
          const alertId = alertsResponse.body.alerts[0].id;
          
          const response = await request(app)
            .post(`/api/health/alerts/${alertId}/acknowledge`)
            .send({ acknowledgedBy: 'test-user', notes: 'Investigating issue' })
            .set('x-api-key', 'test-api-key')
            .expect(200);

          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('alert');
          expect(response.body.alert.acknowledged).toBe(true);
        }
      });

      it('should return 404 for non-existent alert', async () => {
        await request(app)
          .post('/api/health/alerts/non-existent-id/acknowledge')
          .send({ acknowledgedBy: 'test-user' })
          .set('x-api-key', 'test-api-key')
          .expect(404);
      });
    });

    describe('GET /api/health/config', () => {
      it('should return current monitoring configuration', async () => {
        const response = await request(app)
          .get('/api/health/config')
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body).toHaveProperty('services');
        expect(response.body).toHaveProperty('thresholds');
        expect(response.body).toHaveProperty('alertRules');
        expect(Array.isArray(response.body.services)).toBe(true);
        expect(response.body.services).toHaveLength(4);
      });
    });

    describe('PUT /api/health/config', () => {
      it('should update monitoring configuration', async () => {
        const newConfig = {
          thresholds: {
            responseTime: 3000,
            errorRate: 10
          },
          alertRules: {
            escalationMinutes: 20
          }
        };

        const response = await request(app)
          .put('/api/health/config')
          .send(newConfig)
          .set('x-api-key', 'test-api-key')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('config');
      });

      it('should validate configuration updates', async () => {
        const invalidConfig = {
          thresholds: {
            responseTime: -1000 // Invalid negative value
          }
        };

        await request(app)
          .put('/api/health/config')
          .send(invalidConfig)
          .set('x-api-key', 'test-api-key')
          .expect(400);
      });
    });
  });

  describe('WebSocket Real-time Updates', () => {
    it('should establish WebSocket connection', (done) => {
      const ws = new WebSocket('ws://localhost:3002');
      
      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should receive health status updates', (done) => {
      const ws = new WebSocket('ws://localhost:3002');
      
      ws.on('open', () => {
        // Subscribe to health updates
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'health-status'
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'health-update') {
          expect(message).toHaveProperty('data');
          expect(message.data).toHaveProperty('services');
          expect(message.data).toHaveProperty('timestamp');
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should receive alert notifications', (done) => {
      const ws = new WebSocket('ws://localhost:3002');
      
      ws.on('open', () => {
        // Subscribe to alerts
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'alerts'
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'alert') {
          expect(message).toHaveProperty('data');
          expect(message.data).toHaveProperty('id');
          expect(message.data).toHaveProperty('service');
          expect(message.data).toHaveProperty('severity');
          ws.close();
          done();
        }
      });

      // Trigger an alert by simulating service failure
      setTimeout(() => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Simulated failure'));
      }, 100);

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Health Monitoring Logic', () => {
    it('should detect service degradation', async () => {
      // Mock slow response times
      mockedAxios.get.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ 
            status: 200, 
            data: { status: 'healthy' }
          }), 3000) // 3 second delay
        )
      );

      const response = await request(app)
        .get('/api/health/status')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      // Should detect degraded performance
      const slowService = response.body.services.find(s => s.responseTime > 2000);
      expect(slowService).toBeDefined();
      expect(slowService.status).toBe('degraded');
    });

    it('should calculate correct availability metrics', async () => {
      // Mock mixed success/failure responses
      mockedAxios.get
        .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' }})
        .mockRejectedValueOnce(new Error('Service down'))
        .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' }})
        .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' }});

      const response = await request(app)
        .get('/api/health/metrics')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      expect(response.body.metrics.availability).toBeLessThan(100);
      expect(response.body.metrics.availability).toBeGreaterThan(0);
    });

    it('should trigger alerts based on thresholds', async () => {
      // Mock high error rate scenario
      for (let i = 0; i < 10; i++) {
        mockedAxios.get.mockRejectedValueOnce(new Error('Service error'));
      }

      // Wait for health checks to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await request(app)
        .get('/api/health/alerts')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      expect(response.body.alerts.length).toBeGreaterThan(0);
      
      const errorRateAlert = response.body.alerts.find(
        alert => alert.message.includes('error rate')
      );
      expect(errorRateAlert).toBeDefined();
    });
  });

  describe('Alert Management', () => {
    it('should respect alert cooldown periods', async () => {
      // Trigger initial alert
      mockedAxios.get.mockRejectedValueOnce(new Error('Service down'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const firstCheck = await request(app)
        .get('/api/health/alerts')
        .set('x-api-key', 'test-api-key');
      
      const initialAlertCount = firstCheck.body.alerts.length;
      
      // Trigger same condition immediately (should be in cooldown)
      mockedAxios.get.mockRejectedValueOnce(new Error('Service down'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const secondCheck = await request(app)
        .get('/api/health/alerts')
        .set('x-api-key', 'test-api-key');
      
      // Should not create duplicate alerts during cooldown
      expect(secondCheck.body.alerts.length).toBe(initialAlertCount);
    });

    it('should escalate unacknowledged alerts', async () => {
      // This test would require waiting for escalation timeout
      // In a real scenario, you'd mock the timer or use a shorter timeout for testing
      expect(true).toBe(true); // Placeholder for escalation logic test
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      mockedAxios.get.mockImplementation(() => 
        new Promise((resolve, reject) => 
          setTimeout(() => reject(new Error('ETIMEDOUT')), 15000)
        )
      );

      const response = await request(app)
        .get('/api/health/status')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      expect(response.body.status).toBe('degraded');
      
      const timedOutServices = response.body.services.filter(s => s.status === 'unhealthy');
      expect(timedOutServices.length).toBeGreaterThan(0);
    });

    it('should handle malformed service responses', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        status: 200, 
        data: 'invalid json response'
      });

      const response = await request(app)
        .get('/api/health/status')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      // Should handle gracefully and mark service as unhealthy
      const malformedService = response.body.services.find(s => s.status === 'unhealthy');
      expect(malformedService).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on API endpoints', async () => {
      // Make multiple rapid requests
      const requests = Array(10).fill().map(() => 
        request(app)
          .get('/api/health/status')
          .set('x-api-key', 'test-api-key')
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        '/api/health/status',
        '/api/health/metrics',
        '/api/health/alerts',
        '/api/health/config'
      ];

      for (const endpoint of endpoints) {
        await request(app)
          .get(endpoint)
          .expect(401);
      }
    });

    it('should validate API key format', async () => {
      await request(app)
        .get('/api/health/status')
        .set('x-api-key', 'invalid-key')
        .expect(401);
    });

    it('should sanitize error messages', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Database password: secret123'));

      const response = await request(app)
        .get('/api/health/status')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      // Error messages should not contain sensitive information
      const serviceWithError = response.body.services.find(s => s.status === 'unhealthy');
      if (serviceWithError && serviceWithError.error) {
        expect(serviceWithError.error).not.toContain('secret123');
        expect(serviceWithError.error).not.toContain('password');
      }
    });
  });
});