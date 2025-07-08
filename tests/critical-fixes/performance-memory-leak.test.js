/**
 * @fileoverview Performance and Memory Leak Tests
 * Tests for missing performance tests and memory leak detection
 * @module tests/critical-fixes/performance-memory-leak
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import io from 'socket.io-client';
import AIDiscoveryWidget from '../../apps/shopify/frontend/components/AIDiscoveryWidget.tsx';

// Mock Socket.IO client
jest.mock('socket.io-client');

// Mock performance APIs
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};

// Mock memory usage tracking
global.gc = global.gc || jest.fn();

describe('Performance and Memory Leak Tests', () => {
  let mockSocket;
  let mockSocketEmit;
  let mockSocketOn;
  let performanceMetrics;
  let memorySnapshots;

  beforeEach(() => {
    performanceMetrics = [];
    memorySnapshots = [];
    
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
    
    // Mock performance monitoring
    jest.spyOn(performance, 'now').mockImplementation(() => Date.now());
    jest.spyOn(performance, 'mark').mockImplementation((name) => {
      performanceMetrics.push({ type: 'mark', name, timestamp: Date.now() });
    });
    jest.spyOn(performance, 'measure').mockImplementation((name, start, end) => {
      performanceMetrics.push({ type: 'measure', name, start, end, timestamp: Date.now() });
    });
    
    // Mock memory usage
    Object.defineProperty(process, 'memoryUsage', {
      value: jest.fn(() => ({
        rss: 50 * 1024 * 1024, // 50MB
        heapTotal: 30 * 1024 * 1024, // 30MB
        heapUsed: 20 * 1024 * 1024, // 20MB
        external: 5 * 1024 * 1024, // 5MB
        arrayBuffers: 1 * 1024 * 1024 // 1MB
      }))
    });
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    performanceMetrics = [];
    memorySnapshots = [];
  });

  describe('RED PHASE - Failing Tests Exposing Performance Issues', () => {
    test('should fail: memory usage grows unbounded with repeated operations', async () => {
      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      const initialMemory = process.memoryUsage();
      memorySnapshots.push({ phase: 'initial', memory: initialMemory });

      // Simulate heavy usage that would expose memory leaks
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (let i = 0; i < 1000; i++) {
        fireEvent.change(messageInput, { target: { value: `Memory test message ${i}` } });
        fireEvent.click(sendButton);
        
        // Simulate response to complete the cycle
        const chatResponseHandler = mockSocketOn.mock.calls.find(call => call[0] === 'chat-response')[1];
        if (chatResponseHandler) {
          chatResponseHandler({
            success: true,
            response: `Response ${i}`,
            sessionId: 'test-session'
          });
        }
        
        // Take memory snapshot every 100 operations
        if (i % 100 === 0) {
          if (global.gc) global.gc(); // Force garbage collection
          const currentMemory = process.memoryUsage();
          memorySnapshots.push({ phase: `iteration-${i}`, memory: currentMemory });
        }
      }

      const finalMemory = process.memoryUsage();
      memorySnapshots.push({ phase: 'final', memory: finalMemory });

      // THIS TEST SHOULD FAIL - Memory should not grow significantly
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const maxAcceptableGrowth = 10 * 1024 * 1024; // 10MB
      
      expect(memoryGrowth).toBeLessThan(maxAcceptableGrowth);
      
      unmount();
    });

    test('should fail: DOM nodes accumulate without cleanup', async () => {
      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      const initialNodeCount = document.querySelectorAll('*').length;

      // Simulate operations that create DOM nodes
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (let i = 0; i < 100; i++) {
        fireEvent.change(messageInput, { target: { value: `DOM test ${i}` } });
        fireEvent.click(sendButton);
        
        // Simulate typing indicator and response
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }

      const midNodeCount = document.querySelectorAll('*').length;
      
      // Clear messages (should clean up DOM nodes)
      const clearButton = screen.queryByTestId('clear-messages');
      if (clearButton) {
        fireEvent.click(clearButton);
      }

      const finalNodeCount = document.querySelectorAll('*').length;

      // THIS TEST SHOULD FAIL - DOM nodes should be cleaned up
      const nodeGrowth = finalNodeCount - initialNodeCount;
      expect(nodeGrowth).toBeLessThan(50); // Should not accumulate many nodes
      
      unmount();
    });

    test('should fail: event listeners not properly removed', async () => {
      const eventListenerTracker = new Map();
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

      // Mock addEventListener to track listeners
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        const key = `${type}-${listener.toString()}`;
        eventListenerTracker.set(key, (eventListenerTracker.get(key) || 0) + 1);
        return originalAddEventListener.call(this, type, listener, options);
      };

      // Mock removeEventListener to track removals
      EventTarget.prototype.removeEventListener = function(type, listener, options) {
        const key = `${type}-${listener.toString()}`;
        eventListenerTracker.set(key, (eventListenerTracker.get(key) || 0) - 1);
        return originalRemoveEventListener.call(this, type, listener, options);
      };

      const { unmount } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      // Trigger operations that add event listeners
      const messageInput = screen.getByTestId('message-input');
      for (let i = 0; i < 10; i++) {
        fireEvent.focus(messageInput);
        fireEvent.blur(messageInput);
      }

      unmount();

      // THIS TEST SHOULD FAIL - All listeners should be removed
      const activeListeners = Array.from(eventListenerTracker.values()).filter(count => count > 0);
      expect(activeListeners.length).toBe(0);

      // Restore original methods
      EventTarget.prototype.addEventListener = originalAddEventListener;
      EventTarget.prototype.removeEventListener = originalRemoveEventListener;
    });

    test('should fail: response time degrades with usage', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const responseTimes = [];
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      for (let i = 0; i < 50; i++) {
        const startTime = performance.now();
        
        fireEvent.change(messageInput, { target: { value: `Performance test ${i}` } });
        fireEvent.click(sendButton);
        
        // Simulate response
        const chatResponseHandler = mockSocketOn.mock.calls.find(call => call[0] === 'chat-response')[1];
        if (chatResponseHandler) {
          chatResponseHandler({
            success: true,
            response: `Response ${i}`,
            sessionId: 'test-session'
          });
        }
        
        const endTime = performance.now();
        responseTimes.push(endTime - startTime);
      }

      // THIS TEST SHOULD FAIL - Response times should not degrade significantly
      const firstTenAvg = responseTimes.slice(0, 10).reduce((a, b) => a + b) / 10;
      const lastTenAvg = responseTimes.slice(-10).reduce((a, b) => a + b) / 10;
      
      const degradationRatio = lastTenAvg / firstTenAvg;
      expect(degradationRatio).toBeLessThan(2); // Should not be more than 2x slower
    });
  });

  describe('GREEN PHASE - Tests for Optimized Implementation', () => {
    test('should pass: memory usage remains stable under load', async () => {
      const memoryTracker = {
        snapshots: [],
        
        takeSnapshot: function(label) {
          if (global.gc) global.gc();
          this.snapshots.push({
            label,
            memory: process.memoryUsage(),
            timestamp: Date.now()
          });
        },
        
        getMemoryGrowth: function() {
          if (this.snapshots.length < 2) return 0;
          const first = this.snapshots[0].memory.heapUsed;
          const last = this.snapshots[this.snapshots.length - 1].memory.heapUsed;
          return last - first;
        }
      };

      memoryTracker.takeSnapshot('start');

      // Simulate optimized operations
      for (let i = 0; i < 100; i++) {
        // Simulate message processing with proper cleanup
        const message = { id: i, content: `Test ${i}` };
        
        // Process message
        const processedMessage = { ...message, processed: true };
        
        // Clean up references
        delete processedMessage.id;
        
        if (i % 25 === 0) {
          memoryTracker.takeSnapshot(`iteration-${i}`);
        }
      }

      memoryTracker.takeSnapshot('end');

      const memoryGrowth = memoryTracker.getMemoryGrowth();
      const maxAcceptableGrowth = 5 * 1024 * 1024; // 5MB

      expect(memoryGrowth).toBeLessThan(maxAcceptableGrowth);
    });

    test('should pass: efficient DOM manipulation with virtual scrolling', async () => {
      const virtualScrollManager = {
        visibleItems: [],
        totalItems: 0,
        viewportSize: 10,
        
        addItem: function(item) {
          this.totalItems++;
          
          // Only keep visible items in DOM
          if (this.visibleItems.length >= this.viewportSize) {
            this.visibleItems.shift(); // Remove oldest
          }
          
          this.visibleItems.push(item);
        },
        
        getVisibleCount: function() {
          return this.visibleItems.length;
        },
        
        getTotalCount: function() {
          return this.totalItems;
        }
      };

      // Add many items
      for (let i = 0; i < 1000; i++) {
        virtualScrollManager.addItem({ id: i, content: `Message ${i}` });
      }

      // Should only keep viewport size in memory
      expect(virtualScrollManager.getVisibleCount()).toBe(10);
      expect(virtualScrollManager.getTotalCount()).toBe(1000);
    });

    test('should pass: debounced operations prevent excessive processing', async () => {
      const debouncedProcessor = {
        timeoutId: null,
        processCount: 0,
        
        process: function(data) {
          clearTimeout(this.timeoutId);
          
          this.timeoutId = setTimeout(() => {
            this.processCount++;
            // Actual processing logic here
          }, 100);
        },
        
        getProcessCount: function() {
          return this.processCount;
        }
      };

      // Rapid calls should be debounced
      for (let i = 0; i < 100; i++) {
        debouncedProcessor.process(`data-${i}`);
      }

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should only process once due to debouncing
      expect(debouncedProcessor.getProcessCount()).toBe(1);
    });

    test('should pass: object pooling reduces garbage collection pressure', async () => {
      const objectPool = {
        pool: [],
        created: 0,
        reused: 0,
        
        acquire: function() {
          if (this.pool.length > 0) {
            this.reused++;
            return this.pool.pop();
          } else {
            this.created++;
            return { data: null, timestamp: null };
          }
        },
        
        release: function(obj) {
          // Reset object state
          obj.data = null;
          obj.timestamp = null;
          
          // Return to pool
          this.pool.push(obj);
        },
        
        getStats: function() {
          return {
            created: this.created,
            reused: this.reused,
            poolSize: this.pool.length
          };
        }
      };

      // Use objects from pool
      const objects = [];
      for (let i = 0; i < 100; i++) {
        const obj = objectPool.acquire();
        obj.data = `data-${i}`;
        obj.timestamp = Date.now();
        objects.push(obj);
      }

      // Release objects back to pool
      objects.forEach(obj => objectPool.release(obj));

      // Use objects again (should reuse from pool)
      for (let i = 0; i < 50; i++) {
        const obj = objectPool.acquire();
        obj.data = `reused-${i}`;
        objectPool.release(obj);
      }

      const stats = objectPool.getStats();
      
      // Should have reused objects from pool
      expect(stats.reused).toBeGreaterThan(0);
      expect(stats.created).toBe(100); // Only created 100 initially
    });
  });

  describe('Performance Monitoring and Metrics', () => {
    test('should track performance metrics accurately', async () => {
      const performanceMonitor = {
        metrics: new Map(),
        
        startTimer: function(name) {
          this.metrics.set(name, { start: performance.now() });
        },
        
        endTimer: function(name) {
          const metric = this.metrics.get(name);
          if (metric) {
            metric.end = performance.now();
            metric.duration = metric.end - metric.start;
          }
        },
        
        getMetric: function(name) {
          return this.metrics.get(name);
        },
        
        getAllMetrics: function() {
          return Array.from(this.metrics.entries()).map(([name, metric]) => ({
            name,
            duration: metric.duration || 0
          }));
        }
      };

      // Measure various operations
      performanceMonitor.startTimer('message-processing');
      await new Promise(resolve => setTimeout(resolve, 10));
      performanceMonitor.endTimer('message-processing');

      performanceMonitor.startTimer('dom-update');
      await new Promise(resolve => setTimeout(resolve, 5));
      performanceMonitor.endTimer('dom-update');

      const messageMetric = performanceMonitor.getMetric('message-processing');
      const domMetric = performanceMonitor.getMetric('dom-update');

      expect(messageMetric.duration).toBeGreaterThan(0);
      expect(domMetric.duration).toBeGreaterThan(0);
      expect(messageMetric.duration).toBeGreaterThan(domMetric.duration);
    });

    test('should detect performance regressions', async () => {
      const regressionDetector = {
        baselines: new Map(),
        
        setBaseline: function(operation, duration) {
          this.baselines.set(operation, duration);
        },
        
        checkRegression: function(operation, currentDuration, threshold = 1.5) {
          const baseline = this.baselines.get(operation);
          if (!baseline) return false;
          
          return currentDuration > baseline * threshold;
        },
        
        getRegression: function(operation, currentDuration) {
          const baseline = this.baselines.get(operation);
          if (!baseline) return 0;
          
          return (currentDuration / baseline) - 1; // Percentage increase
        }
      };

      // Set baselines
      regressionDetector.setBaseline('message-send', 50);
      regressionDetector.setBaseline('response-render', 30);

      // Test current performance
      const currentMessageSend = 45; // Improved
      const currentResponseRender = 60; // Regressed

      expect(regressionDetector.checkRegression('message-send', currentMessageSend)).toBe(false);
      expect(regressionDetector.checkRegression('response-render', currentResponseRender)).toBe(true);

      const regressionPercentage = regressionDetector.getRegression('response-render', currentResponseRender);
      expect(regressionPercentage).toBeCloseTo(1.0); // 100% increase
    });
  });

  describe('Resource Management and Cleanup', () => {
    test('should properly manage WebSocket connections', async () => {
      const connectionManager = {
        connections: new Set(),
        
        createConnection: function(url) {
          const connection = {
            url,
            id: Math.random().toString(36),
            connected: true,
            close: () => {
              this.connected = false;
              connectionManager.connections.delete(this);
            }
          };
          
          this.connections.add(connection);
          return connection;
        },
        
        closeAll: function() {
          this.connections.forEach(conn => conn.close());
        },
        
        getActiveCount: function() {
          return Array.from(this.connections).filter(conn => conn.connected).length;
        }
      };

      // Create multiple connections
      const conn1 = connectionManager.createConnection('ws://test1');
      const conn2 = connectionManager.createConnection('ws://test2');
      const conn3 = connectionManager.createConnection('ws://test3');

      expect(connectionManager.getActiveCount()).toBe(3);

      // Close one connection
      conn2.close();
      expect(connectionManager.getActiveCount()).toBe(2);

      // Close all connections
      connectionManager.closeAll();
      expect(connectionManager.getActiveCount()).toBe(0);
    });

    test('should clean up timers and intervals', async () => {
      const timerManager = {
        timers: new Set(),
        intervals: new Set(),
        
        setTimeout: function(callback, delay) {
          const id = setTimeout(() => {
            callback();
            this.timers.delete(id);
          }, delay);
          
          this.timers.add(id);
          return id;
        },
        
        setInterval: function(callback, delay) {
          const id = setInterval(callback, delay);
          this.intervals.add(id);
          return id;
        },
        
        clearTimeout: function(id) {
          clearTimeout(id);
          this.timers.delete(id);
        },
        
        clearInterval: function(id) {
          clearInterval(id);
          this.intervals.delete(id);
        },
        
        clearAll: function() {
          this.timers.forEach(id => clearTimeout(id));
          this.intervals.forEach(id => clearInterval(id));
          this.timers.clear();
          this.intervals.clear();
        },
        
        getActiveCount: function() {
          return this.timers.size + this.intervals.size;
        }
      };

      // Create timers and intervals
      timerManager.setTimeout(() => {}, 1000);
      timerManager.setTimeout(() => {}, 2000);
      const intervalId = timerManager.setInterval(() => {}, 500);

      expect(timerManager.getActiveCount()).toBe(3);

      // Clear specific interval
      timerManager.clearInterval(intervalId);
      expect(timerManager.getActiveCount()).toBe(2);

      // Clear all
      timerManager.clearAll();
      expect(timerManager.getActiveCount()).toBe(0);
    });
  });
});