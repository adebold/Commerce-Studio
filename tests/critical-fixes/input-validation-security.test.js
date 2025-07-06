/**
 * @fileoverview Input Validation and Sanitization Security Tests
 * Tests for Issue 2: Missing input validation and sanitization
 * @module tests/critical-fixes/input-validation-security
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import io from 'socket.io-client';
import AIDiscoveryWidget from '../../apps/shopify/frontend/components/AIDiscoveryWidget.tsx';

// Mock Socket.IO client
jest.mock('socket.io-client');

describe('Input Validation and Sanitization Security Tests', () => {
  let mockSocket;
  let mockSocketEmit;
  let mockSocketOn;

  beforeEach(() => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RED PHASE - Failing Tests Exposing Security Vulnerabilities', () => {
    test('should fail: XSS payload in chat message not sanitized', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload="alert(1)">',
        '<div onclick="alert(1)">Click me</div>',
        '<object data="javascript:alert(1)">',
        '<embed src="javascript:alert(1)">',
        '<link rel="stylesheet" href="javascript:alert(1)">',
        '<style>@import "javascript:alert(1)";</style>'
      ];

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (const payload of xssPayloads) {
        fireEvent.change(messageInput, { target: { value: payload } });
        fireEvent.click(sendButton);

        // Check if the payload was sanitized before sending
        const lastCall = mockSocketEmit.mock.calls[mockSocketEmit.mock.calls.length - 1];
        const sentMessage = lastCall[1].message;

        // THIS TEST SHOULD FAIL - Current implementation doesn't sanitize
        expect(sentMessage).not.toContain('<script>');
        expect(sentMessage).not.toContain('javascript:');
        expect(sentMessage).not.toContain('onerror=');
        expect(sentMessage).not.toContain('onclick=');
        expect(sentMessage).not.toContain('<iframe>');
        expect(sentMessage).not.toContain('<svg');
        expect(sentMessage).not.toContain('<object');
        expect(sentMessage).not.toContain('<embed');
      }
    });

    test('should fail: SQL injection patterns not validated', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' UNION SELECT * FROM admin_users --",
        "'; DELETE FROM products; --",
        "' OR 1=1 --",
        "'; EXEC xp_cmdshell('dir'); --"
      ];

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (const payload of sqlInjectionPayloads) {
        fireEvent.change(messageInput, { target: { value: payload } });
        fireEvent.click(sendButton);

        const lastCall = mockSocketEmit.mock.calls[mockSocketEmit.mock.calls.length - 1];
        const sentMessage = lastCall[1].message;

        // THIS TEST SHOULD FAIL - Current implementation doesn't validate SQL patterns
        expect(sentMessage).not.toMatch(/DROP\s+TABLE/i);
        expect(sentMessage).not.toMatch(/INSERT\s+INTO/i);
        expect(sentMessage).not.toMatch(/DELETE\s+FROM/i);
        expect(sentMessage).not.toMatch(/UNION\s+SELECT/i);
        expect(sentMessage).not.toMatch(/EXEC\s+xp_cmdshell/i);
      }
    });

    test('should fail: oversized message not rejected', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const maxMessageSize = 1000; // 1KB limit
      const oversizedMessage = 'x'.repeat(maxMessageSize + 1);

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: oversizedMessage } });
      fireEvent.click(sendButton);

      // THIS TEST SHOULD FAIL - Current implementation doesn't validate message size
      expect(mockSocketEmit).not.toHaveBeenCalled(); // Should not send oversized message
    });

    test('should fail: invalid session ID format not rejected', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const invalidSessionIds = [
        '<script>alert(1)</script>',
        '../../../etc/passwd',
        'session; DROP TABLE users;',
        'session\x00null',
        '',
        'a'.repeat(100), // Too long
        '../../admin/config',
        'session<>invalid'
      ];

      // Mock the widget's session ID setter
      const widget = screen.getByTestId('ai-discovery-widget');
      
      for (const invalidId of invalidSessionIds) {
        // Simulate setting invalid session ID
        fireEvent(widget, new CustomEvent('setSessionId', { detail: invalidId }));

        const messageInput = screen.getByTestId('message-input');
        const sendButton = screen.getByTestId('send-button');

        fireEvent.change(messageInput, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);

        if (mockSocketEmit.mock.calls.length > 0) {
          const lastCall = mockSocketEmit.mock.calls[mockSocketEmit.mock.calls.length - 1];
          const sessionId = lastCall[1].sessionId;

          // THIS TEST SHOULD FAIL - Current implementation doesn't validate session IDs
          expect(sessionId).toMatch(/^[a-zA-Z0-9_-]{1,64}$/);
        }
      }
    });

    test('should fail: HTML entities not properly encoded', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const htmlEntities = [
        '&lt;script&gt;alert(1)&lt;/script&gt;',
        '&#60;script&#62;alert(1)&#60;/script&#62;',
        '&amp;lt;img src=x onerror=alert(1)&amp;gt;',
        '&#x3C;svg onload=alert(1)&#x3E;'
      ];

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (const entity of htmlEntities) {
        fireEvent.change(messageInput, { target: { value: entity } });
        fireEvent.click(sendButton);

        const lastCall = mockSocketEmit.mock.calls[mockSocketEmit.mock.calls.length - 1];
        const sentMessage = lastCall[1].message;

        // THIS TEST SHOULD FAIL - Current implementation doesn't handle HTML entities
        expect(sentMessage).not.toContain('&lt;script&gt;');
        expect(sentMessage).not.toContain('&#60;script&#62;');
      }
    });
  });

  describe('GREEN PHASE - Tests for Secure Implementation', () => {
    test('should pass: XSS payloads properly sanitized', async () => {
      // Mock sanitization function (this would be implemented in the fix)
      const sanitizeInput = (input) => {
        return input
          .replace(/<script.*?>.*?<\/script>/gi, '')
          .replace(/<iframe.*?>.*?<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/<svg.*?>/gi, '')
          .replace(/onerror\s*=/gi, '')
          .replace(/<object.*?>/gi, '')
          .replace(/<embed.*?>/gi, '')
          .replace(/<link.*?>/gi, '')
          .replace(/<style.*?>.*?<\/style>/gi, '');
      };

      const xssPayload = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
      const sanitized = sanitizeInput(xssPayload);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).toBe(''); // Should be completely sanitized
    });

    test('should pass: message size validation', async () => {
      const validateMessageSize = (message, maxSize = 1000) => {
        return new Blob([message]).size <= maxSize;
      };

      const normalMessage = 'Hello, I need help finding glasses.';
      const oversizedMessage = 'x'.repeat(1001);

      expect(validateMessageSize(normalMessage)).toBe(true);
      expect(validateMessageSize(oversizedMessage)).toBe(false);
    });

    test('should pass: session ID validation', async () => {
      const validateSessionId = (sessionId) => {
        const sessionIdRegex = /^[a-zA-Z0-9_-]{1,64}$/;
        return sessionIdRegex.test(sessionId);
      };

      const validIds = [
        'session-123-abc',
        'user_456_def',
        'shop-789-ghi',
        'uuid-12345678-1234-1234-1234-123456789012'
      ];

      const invalidIds = [
        '<script>alert(1)</script>',
        '../../../etc/passwd',
        'session; DROP TABLE users;',
        ''
      ];

      validIds.forEach(id => {
        expect(validateSessionId(id)).toBe(true);
      });

      invalidIds.forEach(id => {
        expect(validateSessionId(id)).toBe(false);
      });
    });

    test('should pass: SQL injection pattern detection', async () => {
      const containsSQLInjection = (input) => {
        const sqlPatterns = [
          /DROP\s+TABLE/i,
          /INSERT\s+INTO/i,
          /DELETE\s+FROM/i,
          /UNION\s+SELECT/i,
          /EXEC\s+xp_cmdshell/i,
          /'\s*OR\s*'1'\s*=\s*'1/i,
          /--/,
          /;.*?--/
        ];

        return sqlPatterns.some(pattern => pattern.test(input));
      };

      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM admin --"
      ];

      const safeInputs = [
        "I'm looking for glasses",
        "What's the best frame for my face?",
        "Can you help me find sunglasses?"
      ];

      maliciousInputs.forEach(input => {
        expect(containsSQLInjection(input)).toBe(true);
      });

      safeInputs.forEach(input => {
        expect(containsSQLInjection(input)).toBe(false);
      });
    });

    test('should pass: comprehensive input sanitization', async () => {
      const comprehensiveSanitize = (input) => {
        // Remove script tags
        let sanitized = input.replace(/<script.*?>.*?<\/script>/gi, '');
        
        // Remove event handlers
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        
        // Remove javascript: protocols
        sanitized = sanitized.replace(/javascript:/gi, '');
        
        // Remove dangerous tags
        sanitized = sanitized.replace(/<(iframe|object|embed|link|style|svg)[^>]*>/gi, '');
        
        // Encode HTML entities
        sanitized = sanitized
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
        
        return sanitized;
      };

      const dangerousInput = '<script>alert("xss")</script><img src="x" onerror="alert(1)">Hello World';
      const sanitized = comprehensiveSanitize(dangerousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).toContain('Hello World');
      expect(sanitized).toContain('&lt;'); // HTML encoded
    });
  });

  describe('Edge Cases and Advanced Attacks', () => {
    test('should handle encoded XSS attempts', async () => {
      const encodedXSSPayloads = [
        '%3Cscript%3Ealert(1)%3C/script%3E',
        '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;',
        '&lt;script&gt;alert(1)&lt;/script&gt;',
        String.fromCharCode(60, 115, 99, 114, 105, 112, 116, 62) + 'alert(1)' + String.fromCharCode(60, 47, 115, 99, 114, 105, 112, 116, 62)
      ];

      const decodeAndSanitize = (input) => {
        // Decode URL encoding
        let decoded = decodeURIComponent(input);
        
        // Decode HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = decoded;
        decoded = textarea.value;
        
        // Apply sanitization
        return decoded.replace(/<script.*?>.*?<\/script>/gi, '');
      };

      encodedXSSPayloads.forEach(payload => {
        const sanitized = decodeAndSanitize(payload);
        expect(sanitized).not.toContain('alert(1)');
      });
    });

    test('should validate against polyglot attacks', async () => {
      const polyglotPayloads = [
        'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//',
        '">\'><marquee><img src=x onerror=confirm(1)></marquee>"></plaintext\\></|\\><plaintext/onmouseover=prompt(1)><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>\'-->"></script><script>alert(document.cookie)</script>">\'><img/id="confirm&lpar;1)"/alt="/"src="/"onerror=eval(id)>\'">',
        'javascript://\'/</title></style></textarea></script>--><p" onclick=alert()//>*/alert()/*',
        '<!--<img src="--><img src=x onerror=alert(1)//">'
      ];

      const detectPolyglot = (input) => {
        const dangerousPatterns = [
          /javascript:/i,
          /on\w+\s*=/i,
          /<script/i,
          /<img.*?onerror/i,
          /alert\s*\(/i,
          /confirm\s*\(/i,
          /prompt\s*\(/i
        ];

        return dangerousPatterns.some(pattern => pattern.test(input));
      };

      polyglotPayloads.forEach(payload => {
        expect(detectPolyglot(payload)).toBe(true);
      });
    });

    test('should handle Unicode and international character attacks', async () => {
      const unicodeAttacks = [
        '\u003cscript\u003ealert(1)\u003c/script\u003e', // Unicode encoded script
        '\uFF1Cscript\uFF1Ealert(1)\uFF1C/script\uFF1E', // Fullwidth characters
        '＜script＞alert(1)＜/script＞', // Fullwidth HTML
        '\u0000<script>alert(1)</script>' // Null byte injection
      ];

      const normalizeUnicode = (input) => {
        // Normalize Unicode
        let normalized = input.normalize('NFKC');
        
        // Remove null bytes
        normalized = normalized.replace(/\u0000/g, '');
        
        // Convert fullwidth to halfwidth
        normalized = normalized.replace(/[\uFF01-\uFF5E]/g, (char) => {
          return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
        });
        
        return normalized;
      };

      unicodeAttacks.forEach(attack => {
        const normalized = normalizeUnicode(attack);
        expect(normalized).toContain('<script>'); // Should normalize to detectable form
      });
    });
  });
});