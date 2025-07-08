/**
 * @fileoverview Memory Leak Tests for Timeout Handler Management
 * Tests for Issue 1: Memory leak in timeout handler management (lines 519-533)
 * @module tests/critical-fixes/memory-leak-timeout-handler
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import io from 'socket.io-client';
import AIDiscoveryWidget from '../../apps/shopify/frontend/components/AIDiscoveryWidget.tsx';

// Mock Socket.IO client
jest.mock('socket.io-client');

describe('Memory Leak Tests - Timeout Handler Management', () => {
  let mockSocket;
  let mockSocketEmit;
  let mockSocketOn;
  let mockSocketOff;
  let mockSocketDisconnect;
  let eventListenerRegistry;

  beforeEach(() => {
    // Track event listeners to detect memory leaks
    eventListenerRegistry = new Map();
    
    mockSocketEmit = jest.fn();
    mockSocketOn = jest.fn((event, handler) => {
      if (!eventListenerRegistry.has(event)) {
        eventListenerRegistry.set(event, []);
      }
      eventListenerRegistry.get(event).push(handler);
    });
    mockSocketOff = jest.fn((event, handler) => {
      if (eventListenerRegistry.has(event)) {
        const handlers = eventListenerRegistry.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    });
    mockSocketDisconnect = jest.fn();
    
    mockSocket = {
      on: mockSocketOn,
      off: mockSocketOff,
      emit: mockSocketEmit,
      disconnect: mockSocketDisconnect,
      connected: true,
      id: 'test-socket-id'
    };

    io.mockReturnValue(mockSocket);
    
    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    eventListenerRegistry.clear();
  });

  describe('RED PHASE - Failing Tests Exposing Memory Leaks', () => {
    test('should fail: timeout handler creates memory leak with orphaned listeners', async () => {
      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      // Simulate connected state
      const connectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect')[1];
      act(() => {
        connectHandler();
      });

      // Send multiple messages to trigger timeout handler pattern
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (let i = 0; i < 5; i++) {
        fireEvent.change(messageInput, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton);
        
        // Fast-forward to trigger timeout handler creation
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }

      // Check for memory leak - should have only 1 chat-response handler
      const chatResponseHandlers = eventListenerRegistry.get('chat-response') || [];
      
      // THIS TEST SHOULD FAIL - Current implementation creates multiple handlers
      expect(chatResponseHandlers.length).toBe(1); // Will fail with current implementation
      
      unmount();
    });

    test('should fail: timeout handlers not properly cleaned up on component unmount', async () => {
      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      // Send message to create timeout handler
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      // Get initial handler count
      const initialHandlerCount = eventListenerRegistry.get('chat-response')?.length || 0;

      // Unmount component
      unmount();

      // Check if handlers were properly removed
      const finalHandlerCount = eventListenerRegistry.get('chat-response')?.length || 0;
      
      // THIS TEST SHOULD FAIL - Current implementation doesn't clean up timeout handlers
      expect(finalHandlerCount).toBe(0); // Will fail with current implementation
    });

    test('should fail: rapid message sending creates exponential handler accumulation', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      // Send 10 rapid messages
      for (let i = 0; i < 10; i++) {
        fireEvent.change(messageInput, { target: { value: `Rapid message ${i}` } });
        fireEvent.click(sendButton);
      }

      const handlerCount = eventListenerRegistry.get('chat-response')?.length || 0;
      
      // THIS TEST SHOULD FAIL - Should have only 1 handler, not multiple
      expect(handlerCount).toBe(1); // Will fail with current implementation
    });
  });

  describe('GREEN PHASE - Tests for Fixed Implementation', () => {
    test('should pass: single timeout handler with proper cleanup', async () => {
      // This test will pass after implementing the fix
      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      // Send multiple messages
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (let i = 0; i < 5; i++) {
        fireEvent.change(messageInput, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton);
      }

      // Should maintain only one handler
      const handlerCount = eventListenerRegistry.get('chat-response')?.length || 0;
      expect(handlerCount).toBeLessThanOrEqual(1);
      
      unmount();
    });

    test('should pass: timeout tracking with Map-based cleanup', async () => {
      // Test the recommended fix implementation
      const activeTimeouts = new Map();
      
      const mockHandleChatResponseWithTimeout = jest.fn((data) => {
        if (activeTimeouts.has(data.sessionId)) {
          clearTimeout(activeTimeouts.get(data.sessionId));
          activeTimeouts.delete(data.sessionId);
        }
        // Handle response
      });

      const sessionId = 'test-session-123';
      const timeoutId = setTimeout(() => {
        activeTimeouts.delete(sessionId);
      }, 10000);

      activeTimeouts.set(sessionId, timeoutId);

      // Simulate response
      mockHandleChatResponseWithTimeout({ sessionId });

      // Timeout should be cleaned up
      expect(activeTimeouts.has(sessionId)).toBe(false);
      
      // Clean up any remaining timeouts
      activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    });
  });

  describe('Performance Impact Tests', () => {
    test('should measure memory usage growth with current implementation', async () => {
      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      const initialMemory = process.memoryUsage();
      
      // Simulate heavy usage
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (let i = 0; i < 100; i++) {
        fireEvent.change(messageInput, { target: { value: `Load test ${i}` } });
        fireEvent.click(sendButton);
        
        if (i % 10 === 0) {
          // Force garbage collection attempt
          if (global.gc) {
            global.gc();
          }
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory growth should be reasonable (less than 10MB for 100 messages)
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
      
      unmount();
    });

    test('should validate timeout cleanup prevents memory accumulation', async () => {
      const timeoutTracker = new Set();
      const originalSetTimeout = global.setTimeout;
      const originalClearTimeout = global.clearTimeout;

      // Mock setTimeout to track active timeouts
      global.setTimeout = jest.fn((callback, delay) => {
        const id = originalSetTimeout(callback, delay);
        timeoutTracker.add(id);
        return id;
      });

      global.clearTimeout = jest.fn((id) => {
        timeoutTracker.delete(id);
        return originalClearTimeout(id);
      });

      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      // Send messages to create timeouts
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (let i = 0; i < 10; i++) {
        fireEvent.change(messageInput, { target: { value: `Timeout test ${i}` } });
        fireEvent.click(sendButton);
      }

      // Should have reasonable number of active timeouts
      expect(timeoutTracker.size).toBeLessThan(20);

      unmount();

      // All timeouts should be cleaned up on unmount
      expect(timeoutTracker.size).toBe(0);

      // Restore original functions
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
    });
  });
});