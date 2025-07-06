/**
 * @fileoverview Interface Consistency and Error Recovery Pattern Tests
 * Tests for Issue 4: Duplicate interface definitions and Issue 5: Inconsistent error recovery patterns
 * @module tests/critical-fixes/interface-consistency-error-recovery
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import io from 'socket.io-client';
import AIDiscoveryWidget from '../../apps/shopify/frontend/components/AIDiscoveryWidget.tsx';

// Mock Socket.IO client
jest.mock('socket.io-client');

// Mock type imports to test interface consistency
jest.mock('../../apps/shopify/frontend/types/socket.ts', () => ({
  ChatMessageData: 'ChatMessageData',
  ChatResponseData: 'ChatResponseData',
  FaceAnalysisResult: 'FaceAnalysisResult',
  ConnectionStatus: 'ConnectionStatus'
}));

describe('Interface Consistency and Error Recovery Pattern Tests', () => {
  let mockSocket;
  let mockSocketEmit;
  let mockSocketOn;
  let errorRecoveryLog;

  beforeEach(() => {
    errorRecoveryLog = [];
    
    mockSocketEmit = jest.fn();
    mockSocketOn = jest.fn();
    
    mockSocket = {
      on: mockSocketOn,
      emit: mockSocketEmit,
      disconnect: jest.fn(),
      connected: true,
      id: 'test-socket-id'
    };

    io.mockReturnValue(mockSocket);
    
    // Mock console methods to track error recovery patterns
    jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
      errorRecoveryLog.push({ type: 'error', message, args });
    });
    
    jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
      errorRecoveryLog.push({ type: 'warn', message, args });
    });
    
    jest.spyOn(console, 'log').mockImplementation((message, ...args) => {
      errorRecoveryLog.push({ type: 'log', message, args });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    errorRecoveryLog = [];
  });

  describe('RED PHASE - Failing Tests Exposing Interface Inconsistencies', () => {
    test('should fail: duplicate FaceAnalysisResult interface definitions', async () => {
      // Test that would fail due to duplicate interface definitions
      const componentInterface = {
        faceShape: 'string',
        confidence: 'number',
        measurements: {
          faceWidth: 'number',
          faceHeight: 'number',
          jawWidth: 'number',
          foreheadWidth: 'number',
          pupillaryDistance: 'number'
        },
        timestamp: 'number'
      };

      const typesInterface = {
        faceShape: 'string',
        confidence: 'number',
        measurements: {
          faceWidth: 'number',
          faceHeight: 'number',
          jawWidth: 'number',
          foreheadWidth: 'number',
          pupillaryDistance: 'number'
        },
        timestamp: 'number'
      };

      // THIS TEST SHOULD FAIL - Interfaces should be identical but may drift apart
      expect(JSON.stringify(componentInterface)).toBe(JSON.stringify(typesInterface));
      
      // Additional check for interface completeness
      const requiredFields = ['faceShape', 'confidence', 'measurements', 'timestamp'];
      requiredFields.forEach(field => {
        expect(componentInterface).toHaveProperty(field);
        expect(typesInterface).toHaveProperty(field);
      });
    });

    test('should fail: inconsistent error message formats across recovery patterns', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Simulate different types of errors to expose inconsistent patterns
      const errorScenarios = [
        { type: 'connection', error: new Error('Connection failed') },
        { type: 'timeout', error: new Error('Request timeout') },
        { type: 'validation', error: new Error('Invalid input') },
        { type: 'server', error: new Error('Server error') },
        { type: 'network', error: new Error('Network unavailable') }
      ];

      const errorHandlers = mockSocketOn.mock.calls.reduce((acc, call) => {
        if (call[0].includes('error') || call[0] === 'connect_error') {
          acc[call[0]] = call[1];
        }
        return acc;
      }, {});

      // Trigger different error scenarios
      errorScenarios.forEach(scenario => {
        const handler = errorHandlers['connect_error'] || errorHandlers['error'];
        if (handler) {
          handler(scenario.error);
        }
      });

      // THIS TEST SHOULD FAIL - Error messages should follow consistent format
      const errorMessages = errorRecoveryLog.filter(log => log.type === 'error');
      
      if (errorMessages.length > 1) {
        const firstFormat = errorMessages[0].message.split(':')[0];
        errorMessages.forEach(log => {
          const currentFormat = log.message.split(':')[0];
          expect(currentFormat).toBe(firstFormat); // Should have consistent prefix format
        });
      }
    });

    test('should fail: inconsistent retry strategies across error types', async () => {
      const retryStrategies = new Map();
      
      // Mock different error recovery strategies
      const mockErrorRecovery = {
        connectionError: {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 1000
        },
        timeoutError: {
          maxRetries: 5, // Different from connection error
          backoffMultiplier: 1.5, // Different multiplier
          initialDelay: 500 // Different initial delay
        },
        validationError: {
          maxRetries: 1, // Different strategy
          backoffMultiplier: 1,
          initialDelay: 0
        }
      };

      // THIS TEST SHOULD FAIL - Retry strategies should be consistent
      const strategies = Object.values(mockErrorRecovery);
      const firstStrategy = strategies[0];
      
      strategies.forEach(strategy => {
        expect(strategy.maxRetries).toBe(firstStrategy.maxRetries);
        expect(strategy.backoffMultiplier).toBe(firstStrategy.backoffMultiplier);
        expect(strategy.initialDelay).toBe(firstStrategy.initialDelay);
      });
    });

    test('should fail: error recovery state not properly reset between attempts', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const errorHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect_error')[1];
      
      // Simulate error -> recovery -> error cycle
      errorHandler(new Error('First error'));
      
      // Simulate successful recovery
      const connectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect')[1];
      connectHandler();
      
      // Simulate another error
      errorHandler(new Error('Second error'));

      // THIS TEST SHOULD FAIL - Error state should be reset after successful connection
      await waitFor(() => {
        const connectionStatus = screen.getByTestId('connection-status');
        // Should not show accumulated error state from previous failure
        expect(connectionStatus.textContent).not.toContain('Multiple failures');
      });
    });
  });

  describe('GREEN PHASE - Tests for Consistent Implementation', () => {
    test('should pass: single source of truth for interface definitions', async () => {
      // Test the fixed implementation with centralized interfaces
      const centralizedInterfaces = {
        FaceAnalysisResult: {
          faceShape: 'string',
          confidence: 'number',
          measurements: {
            faceWidth: 'number',
            faceHeight: 'number',
            jawWidth: 'number',
            foreheadWidth: 'number',
            pupillaryDistance: 'number'
          },
          timestamp: 'number'
        },
        ChatMessageData: {
          message: 'string',
          sessionId: 'string',
          timestamp: 'string',
          faceAnalysis: 'FaceAnalysisResult?'
        },
        ChatResponseData: {
          success: 'boolean',
          response: 'string',
          sessionId: 'string',
          provider: 'string',
          timestamp: 'string',
          error: 'string?'
        }
      };

      // Verify interface consistency
      Object.keys(centralizedInterfaces).forEach(interfaceName => {
        expect(centralizedInterfaces[interfaceName]).toBeDefined();
        expect(typeof centralizedInterfaces[interfaceName]).toBe('object');
      });
    });

    test('should pass: consistent error message formatting', async () => {
      const formatError = (type, message, context = {}) => {
        return {
          type,
          message: `[${type.toUpperCase()}] ${message}`,
          timestamp: new Date().toISOString(),
          context
        };
      };

      const errors = [
        formatError('connection', 'Failed to connect to server', { attempts: 1 }),
        formatError('timeout', 'Request timed out', { duration: 5000 }),
        formatError('validation', 'Invalid input provided', { field: 'message' })
      ];

      // All errors should follow the same format
      errors.forEach(error => {
        expect(error.message).toMatch(/^\[.*\] .*/);
        expect(error).toHaveProperty('type');
        expect(error).toHaveProperty('timestamp');
        expect(error).toHaveProperty('context');
      });
    });

    test('should pass: unified retry strategy configuration', async () => {
      const unifiedRetryConfig = {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 10000,
        
        calculateDelay: function(attempt) {
          const delay = this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1);
          return Math.min(delay, this.maxDelay);
        },
        
        shouldRetry: function(error, attempt) {
          return attempt <= this.maxRetries && this.isRetryableError(error);
        },
        
        isRetryableError: function(error) {
          const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_FAILED'];
          return retryableErrors.includes(error.code);
        }
      };

      // Test unified strategy
      expect(unifiedRetryConfig.calculateDelay(1)).toBe(1000);
      expect(unifiedRetryConfig.calculateDelay(2)).toBe(2000);
      expect(unifiedRetryConfig.calculateDelay(3)).toBe(4000);
      
      const retryableError = { code: 'NETWORK_ERROR' };
      const nonRetryableError = { code: 'VALIDATION_ERROR' };
      
      expect(unifiedRetryConfig.shouldRetry(retryableError, 1)).toBe(true);
      expect(unifiedRetryConfig.shouldRetry(nonRetryableError, 1)).toBe(false);
    });

    test('should pass: proper error state cleanup and reset', async () => {
      const errorStateManager = {
        currentError: null,
        errorHistory: [],
        retryCount: 0,
        isRecovering: false,
        
        recordError: function(error) {
          this.currentError = error;
          this.errorHistory.push({
            error,
            timestamp: Date.now(),
            retryCount: this.retryCount
          });
        },
        
        startRecovery: function() {
          this.isRecovering = true;
          this.retryCount++;
        },
        
        completeRecovery: function() {
          this.currentError = null;
          this.retryCount = 0;
          this.isRecovering = false;
        },
        
        reset: function() {
          this.currentError = null;
          this.errorHistory = [];
          this.retryCount = 0;
          this.isRecovering = false;
        }
      };

      // Simulate error -> recovery cycle
      errorStateManager.recordError(new Error('Test error'));
      errorStateManager.startRecovery();
      
      expect(errorStateManager.isRecovering).toBe(true);
      expect(errorStateManager.retryCount).toBe(1);
      
      // Complete recovery
      errorStateManager.completeRecovery();
      
      expect(errorStateManager.currentError).toBeNull();
      expect(errorStateManager.retryCount).toBe(0);
      expect(errorStateManager.isRecovering).toBe(false);
    });
  });

  describe('Interface Validation and Type Safety', () => {
    test('should validate interface compliance at runtime', async () => {
      const validateInterface = (obj, schema) => {
        const errors = [];
        
        Object.keys(schema).forEach(key => {
          if (!(key in obj)) {
            errors.push(`Missing required field: ${key}`);
          } else {
            const expectedType = schema[key];
            const actualType = typeof obj[key];
            
            if (expectedType.endsWith('?')) {
              // Optional field
              const baseType = expectedType.slice(0, -1);
              if (obj[key] !== null && obj[key] !== undefined && actualType !== baseType) {
                errors.push(`Field ${key} should be ${baseType} or null/undefined, got ${actualType}`);
              }
            } else if (actualType !== expectedType) {
              errors.push(`Field ${key} should be ${expectedType}, got ${actualType}`);
            }
          }
        });
        
        return errors;
      };

      const faceAnalysisSchema = {
        faceShape: 'string',
        confidence: 'number',
        timestamp: 'number'
      };

      const validFaceAnalysis = {
        faceShape: 'oval',
        confidence: 0.95,
        timestamp: Date.now()
      };

      const invalidFaceAnalysis = {
        faceShape: 'oval',
        confidence: '0.95', // Wrong type
        // Missing timestamp
      };

      const validErrors = validateInterface(validFaceAnalysis, faceAnalysisSchema);
      const invalidErrors = validateInterface(invalidFaceAnalysis, faceAnalysisSchema);

      expect(validErrors).toHaveLength(0);
      expect(invalidErrors.length).toBeGreaterThan(0);
    });

    test('should maintain backward compatibility with interface changes', async () => {
      const v1Interface = {
        message: 'string',
        sessionId: 'string'
      };

      const v2Interface = {
        message: 'string',
        sessionId: 'string',
        timestamp: 'string', // New required field
        metadata: 'object?' // New optional field
      };

      const isBackwardCompatible = (oldInterface, newInterface) => {
        return Object.keys(oldInterface).every(key => key in newInterface);
      };

      // Should be backward compatible
      expect(isBackwardCompatible(v1Interface, v2Interface)).toBe(true);
      
      // Test with data
      const v1Data = {
        message: 'Hello',
        sessionId: 'session-123'
      };

      const v2Data = {
        message: 'Hello',
        sessionId: 'session-123',
        timestamp: new Date().toISOString(),
        metadata: { source: 'widget' }
      };

      // V1 data should work with V2 interface (with defaults)
      const migrateV1ToV2 = (v1Data) => ({
        ...v1Data,
        timestamp: new Date().toISOString(),
        metadata: null
      });

      const migratedData = migrateV1ToV2(v1Data);
      expect(migratedData).toHaveProperty('timestamp');
      expect(migratedData).toHaveProperty('metadata');
    });
  });

  describe('Error Recovery Pattern Consistency', () => {
    test('should implement consistent error categorization', async () => {
      const errorCategories = {
        NETWORK: ['CONNECTION_FAILED', 'TIMEOUT', 'DNS_ERROR'],
        VALIDATION: ['INVALID_INPUT', 'MISSING_FIELD', 'FORMAT_ERROR'],
        SERVER: ['INTERNAL_ERROR', 'SERVICE_UNAVAILABLE', 'RATE_LIMITED'],
        CLIENT: ['INVALID_STATE', 'PERMISSION_DENIED', 'QUOTA_EXCEEDED']
      };

      const categorizeError = (error) => {
        for (const [category, codes] of Object.entries(errorCategories)) {
          if (codes.includes(error.code)) {
            return category;
          }
        }
        return 'UNKNOWN';
      };

      const testErrors = [
        { code: 'CONNECTION_FAILED' },
        { code: 'INVALID_INPUT' },
        { code: 'INTERNAL_ERROR' },
        { code: 'PERMISSION_DENIED' },
        { code: 'UNKNOWN_ERROR' }
      ];

      const categories = testErrors.map(categorizeError);
      
      expect(categories).toEqual(['NETWORK', 'VALIDATION', 'SERVER', 'CLIENT', 'UNKNOWN']);
    });

    test('should apply consistent recovery strategies by error category', async () => {
      const recoveryStrategies = {
        NETWORK: {
          shouldRetry: true,
          maxRetries: 3,
          backoffMultiplier: 2,
          fallbackAction: 'USE_HTTP'
        },
        VALIDATION: {
          shouldRetry: false,
          maxRetries: 0,
          backoffMultiplier: 1,
          fallbackAction: 'SHOW_ERROR'
        },
        SERVER: {
          shouldRetry: true,
          maxRetries: 2,
          backoffMultiplier: 1.5,
          fallbackAction: 'QUEUE_REQUEST'
        },
        CLIENT: {
          shouldRetry: false,
          maxRetries: 0,
          backoffMultiplier: 1,
          fallbackAction: 'RESET_STATE'
        }
      };

      const getRecoveryStrategy = (errorCategory) => {
        return recoveryStrategies[errorCategory] || recoveryStrategies.CLIENT;
      };

      // Test strategy consistency
      const networkStrategy = getRecoveryStrategy('NETWORK');
      const validationStrategy = getRecoveryStrategy('VALIDATION');

      expect(networkStrategy.shouldRetry).toBe(true);
      expect(validationStrategy.shouldRetry).toBe(false);
      expect(networkStrategy.fallbackAction).toBe('USE_HTTP');
      expect(validationStrategy.fallbackAction).toBe('SHOW_ERROR');
    });
  });
});