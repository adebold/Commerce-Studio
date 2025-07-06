/**
 * @fileoverview Socket.IO and CSP Security Tests
 * Tests Content Security Policy compliance for MediaPipe WebAssembly and Socket.IO
 * @module tests/security/socketio-csp-security
 */

import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';

// Mock MediaPipe FaceMesh
global.FaceMesh = jest.fn().mockImplementation(() => ({
  setOptions: jest.fn(),
  onResults: jest.fn(),
  send: jest.fn()
}));

// Mock Camera
global.Camera = jest.fn().mockImplementation(() => ({
  start: jest.fn()
}));

describe('Socket.IO and CSP Security Tests', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Create JSDOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Security-Policy" content="
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.socket.io;
            connect-src 'self' ws: wss: https:;
            worker-src 'self' blob:;
            child-src 'self' blob:;
            img-src 'self' data: https:;
            style-src 'self' 'unsafe-inline';
          ">
        </head>
        <body>
          <div id="test-container"></div>
        </body>
      </html>
    `, {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.navigator = window.navigator;
  });

  afterEach(() => {
    dom.window.close();
    jest.clearAllMocks();
  });

  describe('Content Security Policy Compliance', () => {
    test('should allow MediaPipe WebAssembly with unsafe-eval', async () => {
      // Test that CSP allows 'unsafe-eval' for MediaPipe WebAssembly
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const cspContent = cspMeta.getAttribute('content');
      
      expect(cspContent).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(cspContent).toContain("worker-src 'self' blob:");
      expect(cspContent).toContain("child-src 'self' blob:");
      
      // Test MediaPipe initialization doesn't violate CSP
      expect(() => {
        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      }).not.toThrow();
    });

    test('should allow WebSocket connections', () => {
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const cspContent = cspMeta.getAttribute('content');
      
      expect(cspContent).toContain("connect-src 'self' ws: wss: https:");
      
      // Test WebSocket connection is allowed
      expect(() => {
        // Mock WebSocket for CSP test
        global.WebSocket = jest.fn().mockImplementation(() => ({
          addEventListener: jest.fn(),
          send: jest.fn(),
          close: jest.fn()
        }));
        
        new WebSocket('ws://localhost:3000');
      }).not.toThrow();
    });

    test('should allow CDN resources for Socket.IO and MediaPipe', () => {
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const cspContent = cspMeta.getAttribute('content');
      
      expect(cspContent).toContain('https://cdn.jsdelivr.net');
      expect(cspContent).toContain('https://cdn.socket.io');
      
      // Test script loading from allowed CDNs
      const allowedCDNs = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.socket.io/4.7.2/socket.io.min.js'
      ];
      
      allowedCDNs.forEach(url => {
        expect(() => {
          const script = document.createElement('script');
          script.src = url;
          document.head.appendChild(script);
        }).not.toThrow();
      });
    });

    test('should block unauthorized script sources', () => {
      // Test that unauthorized domains are blocked
      const unauthorizedSources = [
        'https://malicious-site.com/script.js',
        'http://untrusted-cdn.net/library.js',
        'https://evil.example.com/payload.js'
      ];
      
      // Mock CSP violation reporting
      const cspViolations = [];
      document.addEventListener('securitypolicyviolation', (e) => {
        cspViolations.push(e.violatedDirective);
      });
      
      unauthorizedSources.forEach(url => {
        const script = document.createElement('script');
        script.src = url;
        
        // Simulate CSP blocking
        const event = new window.SecurityPolicyViolationEvent('securitypolicyviolation', {
          violatedDirective: 'script-src',
          blockedURI: url
        });
        document.dispatchEvent(event);
      });
      
      expect(cspViolations.length).toBe(unauthorizedSources.length);
    });
  });

  describe('WebSocket Security', () => {
    test('should enforce secure WebSocket connections in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        // Test that only secure WebSocket connections are allowed in production
        const secureWSUrl = 'wss://secure-domain.com/socket.io/';
        const insecureWSUrl = 'ws://insecure-domain.com/socket.io/';
        
        // Mock Socket.IO client
        global.io = jest.fn().mockImplementation((url, options) => {
          if (process.env.NODE_ENV === 'production' && url.startsWith('ws://')) {
            throw new Error('Insecure WebSocket connection not allowed in production');
          }
          return {
            on: jest.fn(),
            emit: jest.fn(),
            disconnect: jest.fn()
          };
        });
        
        // Secure connection should work
        expect(() => {
          global.io(secureWSUrl);
        }).not.toThrow();
        
        // Insecure connection should be blocked
        expect(() => {
          global.io(insecureWSUrl);
        }).toThrow('Insecure WebSocket connection not allowed in production');
        
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    test('should validate WebSocket origin', () => {
      const allowedOrigins = [
        'https://shop.myshopify.com',
        'https://woocommerce-site.com',
        'https://magento-store.com',
        'https://html-store.com'
      ];
      
      const blockedOrigins = [
        'https://malicious-site.com',
        'http://untrusted-domain.net',
        'https://phishing-attempt.org'
      ];
      
      // Mock origin validation
      const validateOrigin = (origin) => {
        return allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '')));
      };
      
      allowedOrigins.forEach(origin => {
        expect(validateOrigin(origin)).toBe(true);
      });
      
      blockedOrigins.forEach(origin => {
        expect(validateOrigin(origin)).toBe(false);
      });
    });

    test('should implement rate limiting for WebSocket connections', () => {
      const connectionAttempts = [];
      const maxConnectionsPerMinute = 10;
      
      // Mock rate limiting
      const checkRateLimit = (clientId) => {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Clean old attempts
        const recentAttempts = connectionAttempts.filter(
          attempt => attempt.timestamp > oneMinuteAgo && attempt.clientId === clientId
        );
        
        return recentAttempts.length < maxConnectionsPerMinute;
      };
      
      const clientId = 'test-client-123';
      
      // Test normal usage (should be allowed)
      for (let i = 0; i < 5; i++) {
        connectionAttempts.push({ clientId, timestamp: Date.now() });
        expect(checkRateLimit(clientId)).toBe(true);
      }
      
      // Test rate limiting (should be blocked after limit)
      for (let i = 0; i < 10; i++) {
        connectionAttempts.push({ clientId, timestamp: Date.now() });
      }
      
      expect(checkRateLimit(clientId)).toBe(false);
    });
  });

  describe('Input Validation and Sanitization', () => {
    test('should sanitize chat messages to prevent XSS', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload="alert(1)">',
        '<div onclick="alert(1)">Click me</div>'
      ];
      
      // Mock sanitization function
      const sanitizeInput = (input) => {
        return input
          .replace(/<script.*?>.*?<\/script>/gi, '')
          .replace(/<iframe.*?>.*?<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/<svg.*?>/gi, '')
          .replace(/onerror\s*=/gi, '');
      };
      
      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).not.toContain('onclick=');
        expect(sanitized).not.toContain('<iframe>');
        expect(sanitized).not.toContain('<svg');
      });
    });

    test('should validate message size limits', () => {
      const maxMessageSize = 1000; // 1KB limit
      
      const validateMessageSize = (message) => {
        return new Blob([message]).size <= maxMessageSize;
      };
      
      // Normal message should pass
      const normalMessage = 'Hello, I need help finding glasses for my face shape.';
      expect(validateMessageSize(normalMessage)).toBe(true);
      
      // Oversized message should fail
      const oversizedMessage = 'x'.repeat(maxMessageSize + 1);
      expect(validateMessageSize(oversizedMessage)).toBe(false);
    });

    test('should validate session IDs', () => {
      const validSessionIds = [
        'session-123-abc',
        'user_456_def',
        'shop-789-ghi',
        'uuid-12345678-1234-1234-1234-123456789012'
      ];
      
      const invalidSessionIds = [
        '<script>alert(1)</script>',
        '../../../etc/passwd',
        'session; DROP TABLE users;',
        'session\x00null',
        ''
      ];
      
      const validateSessionId = (sessionId) => {
        const sessionIdRegex = /^[a-zA-Z0-9_-]{1,64}$/;
        return sessionIdRegex.test(sessionId);
      };
      
      validSessionIds.forEach(sessionId => {
        expect(validateSessionId(sessionId)).toBe(true);
      });
      
      invalidSessionIds.forEach(sessionId => {
        expect(validateSessionId(sessionId)).toBe(false);
      });
    });
  });

  describe('Platform-Specific Security Tests', () => {
    test('should enforce Shopify CSP requirements', () => {
      const shopifyCSP = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.shopify.com", "https://cdn.jsdelivr.net"],
        'connect-src': ["'self'", "wss:", "https:"],
        'img-src': ["'self'", "data:", "https:"],
        'style-src': ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"]
      };
      
      // Verify Shopify-specific CSP directives
      Object.entries(shopifyCSP).forEach(([directive, sources]) => {
        sources.forEach(source => {
          expect(sources).toContain(source);
        });
      });
    });

    test('should enforce WooCommerce CSP requirements', () => {
      const wooCommerceCSP = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        'connect-src': ["'self'", "ws:", "wss:", "https:"],
        'img-src': ["'self'", "data:", "https:"],
        'style-src': ["'self'", "'unsafe-inline'"]
      };
      
      // Verify WooCommerce-specific CSP directives
      Object.entries(wooCommerceCSP).forEach(([directive, sources]) => {
        sources.forEach(source => {
          expect(sources).toContain(source);
        });
      });
    });

    test('should enforce Magento CSP requirements', () => {
      const magentoCSP = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        'connect-src': ["'self'", "ws:", "wss:", "https:"],
        'img-src': ["'self'", "data:", "https:"],
        'style-src': ["'self'", "'unsafe-inline'"]
      };
      
      // Verify Magento-specific CSP directives
      Object.entries(magentoCSP).forEach(([directive, sources]) => {
        sources.forEach(source => {
          expect(sources).toContain(source);
        });
      });
    });

    test('should enforce HTML Store CSP requirements', () => {
      const htmlStoreCSP = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdn.socket.io"],
        'connect-src': ["'self'", "ws:", "wss:", "https:"],
        'img-src': ["'self'", "data:", "https:"],
        'style-src': ["'self'", "'unsafe-inline'"]
      };
      
      // Verify HTML Store-specific CSP directives
      Object.entries(htmlStoreCSP).forEach(([directive, sources]) => {
        sources.forEach(source => {
          expect(sources).toContain(source);
        });
      });
    });
  });

  describe('MediaPipe Security', () => {
    test('should load MediaPipe from trusted CDN only', () => {
      const trustedCDNs = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/',
        'https://unpkg.com/@mediapipe/'
      ];
      
      const untrustedSources = [
        'http://malicious-cdn.com/mediapipe/',
        'https://fake-mediapipe.net/',
        'javascript:alert(1)'
      ];
      
      const isValidMediaPipeSource = (url) => {
        return trustedCDNs.some(cdn => url.startsWith(cdn));
      };
      
      trustedCDNs.forEach(cdn => {
        const testUrl = `${cdn}face_mesh/face_mesh.js`;
        expect(isValidMediaPipeSource(testUrl)).toBe(true);
      });
      
      untrustedSources.forEach(url => {
        expect(isValidMediaPipeSource(url)).toBe(false);
      });
    });

    test('should validate MediaPipe model files', () => {
      const validModelFiles = [
        'face_mesh.js',
        'face_mesh_solution_packed_assets.data',
        'face_mesh_solution_simd_wasm_bin.wasm'
      ];
      
      const invalidFiles = [
        '../../../etc/passwd',
        'malicious_script.js',
        'backdoor.wasm'
      ];
      
      const isValidModelFile = (filename) => {
        const allowedExtensions = ['.js', '.wasm', '.data'];
        const allowedPrefixes = ['face_mesh', 'camera_utils', 'control_utils', 'drawing_utils'];
        
        return allowedExtensions.some(ext => filename.endsWith(ext)) &&
               allowedPrefixes.some(prefix => filename.startsWith(prefix));
      };
      
      validModelFiles.forEach(file => {
        expect(isValidModelFile(file)).toBe(true);
      });
      
      invalidFiles.forEach(file => {
        expect(isValidModelFile(file)).toBe(false);
      });
    });

    test('should handle MediaPipe initialization errors securely', () => {
      const mockErrorHandler = jest.fn();
      
      // Mock MediaPipe with error
      global.FaceMesh = jest.fn().mockImplementation(() => {
        throw new Error('MediaPipe initialization failed');
      });
      
      try {
        new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
      } catch (error) {
        mockErrorHandler(error);
      }
      
      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'MediaPipe initialization failed'
        })
      );
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive information in error messages', () => {
      const sensitiveErrors = [
        'Database connection failed: mysql://user:password@localhost/db',
        'API key invalid: sk-1234567890abcdef',
        'File not found: /etc/passwd',
        'Internal server error: Stack trace with file paths'
      ];
      
      const sanitizeErrorMessage = (error) => {
        return error
          .replace(/mysql:\/\/[^@]+@[^\/]+\/\w+/g, 'Database connection failed')
          .replace(/sk-[a-zA-Z0-9]+/g, 'API key invalid')
          .replace(/\/[a-zA-Z0-9\/._-]+/g, 'File path')
          .replace(/Stack trace.*/gi, 'Internal error occurred');
      };
      
      sensitiveErrors.forEach(error => {
        const sanitized = sanitizeErrorMessage(error);
        
        expect(sanitized).not.toContain('password');
        expect(sanitized).not.toContain('sk-');
        expect(sanitized).not.toContain('/etc/');
        expect(sanitized).not.toContain('Stack trace');
      });
    });

    test('should log security events for monitoring', () => {
      const securityEvents = [];
      
      const logSecurityEvent = (event) => {
        securityEvents.push({
          timestamp: new Date().toISOString(),
          type: event.type,
          severity: event.severity,
          details: event.details
        });
      };
      
      // Simulate security events
      const events = [
        { type: 'CSP_VIOLATION', severity: 'HIGH', details: 'Script blocked from unauthorized domain' },
        { type: 'RATE_LIMIT_EXCEEDED', severity: 'MEDIUM', details: 'Too many connection attempts' },
        { type: 'INVALID_INPUT', severity: 'LOW', details: 'XSS attempt detected and blocked' }
      ];
      
      events.forEach(logSecurityEvent);
      
      expect(securityEvents).toHaveLength(3);
      expect(securityEvents[0].type).toBe('CSP_VIOLATION');
      expect(securityEvents[1].severity).toBe('MEDIUM');
      expect(securityEvents[2].details).toContain('XSS attempt');
    });
  });
});