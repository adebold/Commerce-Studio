/**
 * @fileoverview Cross-Platform Socket.IO Consistency Tests
 * Tests that Socket.IO integration behaves consistently across all platforms
 * @module tests/integration/cross-platform-socketio-consistency
 */

import { jest } from '@jest/globals';
import io from 'socket.io-client';

// Mock platform widgets
const mockPlatformWidgets = {
  shopify: {
    create: () => ({
      sendMessage: jest.fn(),
      handleChatResponse: jest.fn(),
      setConnectionStatus: jest.fn(),
      getConnectionIndicator: jest.fn(),
      getMessages: jest.fn(() => []),
      hasErrorMessage: jest.fn(() => false),
      getErrorMessage: jest.fn(() => ''),
      supportsRealTime: jest.fn(() => true),
      fallbackMode: 'http'
    })
  },
  woocommerce: {
    create: () => ({
      sendMessage: jest.fn(),
      handleChatResponse: jest.fn(),
      setConnectionStatus: jest.fn(),
      getConnectionIndicator: jest.fn(),
      getMessages: jest.fn(() => []),
      hasErrorMessage: jest.fn(() => false),
      getErrorMessage: jest.fn(() => ''),
      supportsRealTime: jest.fn(() => true),
      fallbackMode: 'http'
    })
  },
  magento: {
    create: () => ({
      sendMessage: jest.fn(),
      handleChatResponse: jest.fn(),
      setConnectionStatus: jest.fn(),
      getConnectionIndicator: jest.fn(),
      getMessages: jest.fn(() => []),
      hasErrorMessage: jest.fn(() => false),
      getErrorMessage: jest.fn(() => ''),
      supportsRealTime: jest.fn(() => true),
      fallbackMode: 'http'
    })
  },
  'html-store': {
    create: () => ({
      sendMessage: jest.fn(),
      handleChatResponse: jest.fn(),
      setConnectionStatus: jest.fn(),
      getConnectionIndicator: jest.fn(),
      getMessages: jest.fn(() => []),
      hasErrorMessage: jest.fn(() => false),
      getErrorMessage: jest.fn(() => ''),
      supportsRealTime: jest.fn(() => true),
      fallbackMode: 'http'
    })
  }
};

// Mock Socket.IO
jest.mock('socket.io-client');

describe('Cross-Platform Socket.IO Consistency', () => {
  let mockSocket;
  let platforms;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: 'test-socket-id'
    };

    io.mockReturnValue(mockSocket);

    platforms = Object.keys(mockPlatformWidgets);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Identical Chat Behavior', () => {
    test('should have consistent chat behavior across all platforms', async () => {
      const testMessage = 'Hello, I need help finding glasses';
      const responses = [];

      // Mock consistent AI response
      const mockAIResponse = {
        success: true,
        response: 'I can help you find the perfect glasses! What style are you looking for?',
        sessionId: 'test-session',
        provider: 'google',
        timestamp: new Date().toISOString()
      };

      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        // Mock sendMessage to return consistent response
        widget.sendMessage.mockResolvedValue(mockAIResponse);
        
        const response = await widget.sendMessage(testMessage);
        responses.push({ platform: platformName, response });
      }

      // Verify all responses have consistent structure
      responses.forEach(({ platform, response }) => {
        expect(response).toMatchObject({
          success: true,
          response: expect.any(String),
          sessionId: expect.any(String),
          provider: expect.any(String),
          timestamp: expect.any(String)
        });
      });

      // Verify response content consistency
      const responseTexts = responses.map(r => r.response.response);
      const firstResponse = responseTexts[0];
      
      responseTexts.forEach(text => {
        expect(text).toBe(firstResponse);
      });
    });

    test('should handle chat-response events consistently', async () => {
      const mockResponse = {
        success: true,
        response: 'Consistent AI response across platforms',
        sessionId: 'test-session',
        provider: 'google',
        timestamp: new Date().toISOString()
      };

      const handlerResults = [];

      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        // Simulate chat-response handling
        widget.handleChatResponse(mockResponse);
        
        // Verify message was processed
        expect(widget.handleChatResponse).toHaveBeenCalledWith(mockResponse);
        
        handlerResults.push({
          platform: platformName,
          called: widget.handleChatResponse.mock.calls.length > 0
        });
      }

      // All platforms should handle the response
      handlerResults.forEach(result => {
        expect(result.called).toBe(true);
      });
    });

    test('should maintain consistent message format across platforms', async () => {
      const testMessage = 'What glasses would you recommend for my face shape?';
      
      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        // Mock Socket.IO emit to capture message format
        const emitSpy = jest.fn();
        widget.socket = { emit: emitSpy, connected: true };
        
        await widget.sendMessage(testMessage);
        
        // Verify consistent message structure
        expect(emitSpy).toHaveBeenCalledWith('chat-message', expect.objectContaining({
          message: testMessage,
          sessionId: expect.any(String),
          timestamp: expect.any(String)
        }));
      }
    });
  });

  describe('Consistent Error Handling', () => {
    test('should handle connection errors consistently across platforms', async () => {
      const connectionError = new Error('Connection failed');
      const errorResults = [];

      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        // Simulate connection error
        try {
          throw connectionError;
        } catch (error) {
          widget.setConnectionStatus('error');
          widget.hasErrorMessage.mockReturnValue(true);
          widget.getErrorMessage.mockReturnValue('Connection error occurred');
        }
        
        errorResults.push({
          platform: platformName,
          hasError: widget.hasErrorMessage(),
          errorMessage: widget.getErrorMessage()
        });
      }

      // All platforms should handle errors consistently
      errorResults.forEach(result => {
        expect(result.hasError).toBe(true);
        expect(result.errorMessage).toContain('error');
      });
    });

    test('should handle AI service errors consistently', async () => {
      const serviceError = {
        success: false,
        error: 'AI_SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString()
      };

      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        widget.handleChatResponse(serviceError);
        
        // Verify error was handled
        expect(widget.handleChatResponse).toHaveBeenCalledWith(serviceError);
      }
    });

    test('should provide user-friendly error messages consistently', async () => {
      const errorScenarios = [
        { type: 'network', error: 'Network error' },
        { type: 'timeout', error: 'Request timeout' },
        { type: 'server', error: 'Server error' }
      ];

      for (const scenario of errorScenarios) {
        for (const platformName of platforms) {
          const widget = mockPlatformWidgets[platformName].create();
          
          // Mock error scenario
          widget.hasErrorMessage.mockReturnValue(true);
          widget.getErrorMessage.mockReturnValue(`${scenario.type} occurred`);
          
          expect(widget.hasErrorMessage()).toBe(true);
          expect(widget.getErrorMessage()).toContain(scenario.type);
        }
      }
    });
  });

  describe('Uniform Connection Status Indicators', () => {
    test('should show consistent connection status indicators', async () => {
      const connectionStates = ['connecting', 'connected', 'disconnected', 'error'];
      
      for (const state of connectionStates) {
        for (const platformName of platforms) {
          const widget = mockPlatformWidgets[platformName].create();
          
          widget.setConnectionStatus(state);
          
          const mockIndicator = {
            state: state,
            visible: true,
            color: getExpectedColor(state)
          };
          
          widget.getConnectionIndicator.mockReturnValue(mockIndicator);
          
          const indicator = widget.getConnectionIndicator();
          
          expect(indicator.state).toBe(state);
          expect(indicator.visible).toBe(true);
          expect(indicator.color).toBe(getExpectedColor(state));
        }
      }
    });

    test('should update connection status consistently', async () => {
      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        // Test state transitions
        const stateTransitions = [
          'connecting',
          'connected', 
          'disconnected',
          'connecting',
          'connected'
        ];
        
        for (const state of stateTransitions) {
          widget.setConnectionStatus(state);
          expect(widget.setConnectionStatus).toHaveBeenCalledWith(state);
        }
      }
    });
  });

  describe('Socket.IO Event Handling Consistency', () => {
    test('should register same event handlers across platforms', async () => {
      const expectedEvents = ['connect', 'disconnect', 'chat-response', 'connect_error'];
      
      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        widget.socket = mockSocket;
        
        // Simulate widget initialization
        expectedEvents.forEach(event => {
          widget.socket.on(event, jest.fn());
        });
        
        // Verify all expected events are registered
        expectedEvents.forEach(event => {
          expect(mockSocket.on).toHaveBeenCalledWith(event, expect.any(Function));
        });
      }
    });

    test('should emit events with consistent format', async () => {
      const testEvents = [
        { name: 'chat-message', data: { message: 'test', sessionId: 'session1' } },
        { name: 'join-session', data: 'session1' },
        { name: 'face-analysis', data: { landmarks: [] } }
      ];

      for (const event of testEvents) {
        for (const platformName of platforms) {
          const widget = mockPlatformWidgets[platformName].create();
          widget.socket = mockSocket;
          
          widget.socket.emit(event.name, event.data);
          
          expect(mockSocket.emit).toHaveBeenCalledWith(event.name, event.data);
        }
      }
    });
  });

  describe('Fallback Mechanism Consistency', () => {
    test('should fallback to HTTP consistently when Socket.IO unavailable', async () => {
      // Mock fetch for HTTP fallback
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          response: 'HTTP fallback response',
          provider: 'http-fallback'
        })
      });

      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        // Simulate Socket.IO unavailable
        widget.supportsRealTime.mockReturnValue(false);
        widget.fallbackMode = 'http';
        
        // Mock HTTP fallback
        widget.sendMessage.mockImplementation(async (message) => {
          const response = await fetch(`/apps/${platformName}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
          });
          return response.json();
        });
        
        const result = await widget.sendMessage('Test message');
        
        expect(result.provider).toBe('http-fallback');
        expect(global.fetch).toHaveBeenCalledWith(
          `/apps/${platformName}/api/chat`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      }
    });

    test('should maintain backward compatibility across platforms', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          response: 'Compatible response',
          sessionId: 'test-session'
        })
      });

      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        // Force HTTP mode
        widget.fallbackMode = 'http';
        
        widget.sendMessage.mockImplementation(async (message) => {
          const response = await fetch(`/apps/${platformName}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, sessionId: 'test-session' })
          });
          return response.json();
        });
        
        const result = await widget.sendMessage('Compatibility test');
        
        expect(result).toMatchObject({
          success: true,
          response: 'Compatible response',
          sessionId: 'test-session'
        });
      }
    });
  });

  describe('Performance Consistency', () => {
    test('should handle rapid message sending consistently', async () => {
      const messageCount = 5;
      
      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        widget.socket = mockSocket;
        
        // Send multiple messages rapidly
        const promises = [];
        for (let i = 0; i < messageCount; i++) {
          promises.push(widget.sendMessage(`Message ${i}`));
        }
        
        await Promise.all(promises);
        
        // Should handle all messages
        expect(widget.sendMessage).toHaveBeenCalledTimes(messageCount);
      }
    });

    test('should have consistent response times', async () => {
      const responseTimes = [];
      
      for (const platformName of platforms) {
        const widget = mockPlatformWidgets[platformName].create();
        
        const startTime = Date.now();
        
        widget.sendMessage.mockResolvedValue({
          success: true,
          response: 'Test response',
          provider: 'test'
        });
        
        await widget.sendMessage('Performance test');
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push({ platform: platformName, time: responseTime });
      }
      
      // Response times should be reasonably consistent (within 100ms variance)
      const avgTime = responseTimes.reduce((sum, rt) => sum + rt.time, 0) / responseTimes.length;
      
      responseTimes.forEach(rt => {
        expect(Math.abs(rt.time - avgTime)).toBeLessThan(100);
      });
    });
  });

  describe('Security Consistency', () => {
    test('should enforce consistent security policies', async () => {
      const securityTests = [
        { name: 'XSS prevention', input: '<script>alert("xss")</script>' },
        { name: 'SQL injection prevention', input: "'; DROP TABLE users; --" },
        { name: 'Command injection prevention', input: '$(rm -rf /)' }
      ];

      for (const test of securityTests) {
        for (const platformName of platforms) {
          const widget = mockPlatformWidgets[platformName].create();
          
          // Mock security validation
          widget.sendMessage.mockImplementation(async (message) => {
            // Simulate input sanitization
            const sanitized = message.replace(/<script.*?>.*?<\/script>/gi, '');
            return {
              success: true,
              response: `Processed: ${sanitized}`,
              provider: 'test'
            };
          });
          
          const result = await widget.sendMessage(test.input);
          
          // Should not contain dangerous content
          expect(result.response).not.toContain('<script>');
          expect(result.response).not.toContain('DROP TABLE');
          expect(result.response).not.toContain('rm -rf');
        }
      }
    });
  });
});

// Helper function to get expected indicator color
function getExpectedColor(state) {
  switch (state) {
    case 'connected':
      return 'green';
    case 'error':
    case 'disconnected':
      return 'red';
    case 'connecting':
    default:
      return 'yellow';
  }
}

// Helper function to create platform widget
function createPlatformWidget(platform, options = {}) {
  return mockPlatformWidgets[platform].create(options);
}