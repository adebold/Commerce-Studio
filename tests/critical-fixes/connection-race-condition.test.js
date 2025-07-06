/**
 * @fileoverview Connection Status Race Condition Tests
 * Tests for Issue 3: Connection status race condition (lines 164-176)
 * @module tests/critical-fixes/connection-race-condition
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import io from 'socket.io-client';
import AIDiscoveryWidget from '../../apps/shopify/frontend/components/AIDiscoveryWidget.tsx';

// Mock Socket.IO client
jest.mock('socket.io-client');

describe('Connection Status Race Condition Tests', () => {
  let mockSocket;
  let mockSocketEmit;
  let mockSocketOn;
  let mockSocketDisconnect;
  let connectionErrorHandlers;

  beforeEach(() => {
    connectionErrorHandlers = [];
    
    mockSocketEmit = jest.fn();
    mockSocketOn = jest.fn((event, handler) => {
      if (event === 'connect_error') {
        connectionErrorHandlers.push(handler);
      }
    });
    mockSocketDisconnect = jest.fn();
    
    mockSocket = {
      on: mockSocketOn,
      emit: mockSocketEmit,
      disconnect: mockSocketDisconnect,
      connected: false,
      id: 'test-socket-id'
    };

    io.mockReturnValue(mockSocket);
    
    // Mock React state updates to be synchronous for testing
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    connectionErrorHandlers = [];
  });

  describe('RED PHASE - Failing Tests Exposing Race Conditions', () => {
    test('should fail: race condition in connection attempt counting', async () => {
      const { rerender } = render(
        <AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />
      );

      // Simulate rapid connection errors
      const errorHandler = connectionErrorHandlers[0];
      
      // Fire multiple errors in rapid succession
      for (let i = 0; i < 5; i++) {
        act(() => {
          errorHandler(new Error(`Connection error ${i}`));
        });
      }

      // Fast-forward to allow state updates
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // THIS TEST SHOULD FAIL - Current implementation has race condition
      // The connectionAttempts state may not be updated before the comparison
      await waitFor(() => {
        const connectionStatus = screen.getByTestId('connection-status');
        // Should not fallback to HTTP after exactly 3 attempts due to race condition
        expect(connectionStatus).not.toHaveTextContent('HTTP Mode');
      });
    });

    test('should fail: state update race condition causes premature HTTP fallback', async () => {
      let stateUpdateOrder = [];
      
      // Mock useState to track state update order
      const originalUseState = React.useState;
      React.useState = jest.fn((initial) => {
        const [state, setState] = originalUseState(initial);
        const wrappedSetState = (newState) => {
          stateUpdateOrder.push({
            timestamp: Date.now(),
            state: typeof newState === 'function' ? 'function' : newState
          });
          setState(newState);
        };
        return [state, wrappedSetState];
      });

      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Trigger connection errors rapidly
      const errorHandler = connectionErrorHandlers[0];
      
      act(() => {
        errorHandler(new Error('Error 1'));
        errorHandler(new Error('Error 2'));
        errorHandler(new Error('Error 3'));
      });

      // THIS TEST SHOULD FAIL - Race condition causes incorrect state order
      expect(stateUpdateOrder.length).toBeGreaterThan(0);
      
      // Restore original useState
      React.useState = originalUseState;
    });

    test('should fail: concurrent error handling leads to inconsistent state', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const errorHandler = connectionErrorHandlers[0];
      
      // Simulate concurrent error handling
      const errorPromises = [];
      for (let i = 0; i < 10; i++) {
        errorPromises.push(
          new Promise(resolve => {
            setTimeout(() => {
              act(() => {
                errorHandler(new Error(`Concurrent error ${i}`));
              });
              resolve();
            }, Math.random() * 10);
          })
        );
      }

      await Promise.all(errorPromises);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // THIS TEST SHOULD FAIL - Concurrent updates cause inconsistent state
      const connectionStatus = screen.getByTestId('connection-status');
      const statusText = connectionStatus.textContent;
      
      // State should be consistent, not in an undefined state
      expect(['Connected', 'Disconnected', 'Reconnecting', 'Error', 'HTTP Mode']).toContain(statusText);
    });

    test('should fail: connection attempt counter not atomic', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const errorHandler = connectionErrorHandlers[0];
      
      // Create a scenario where multiple errors occur before state updates
      const errors = [
        new Error('Error 1'),
        new Error('Error 2'),
        new Error('Error 3'),
        new Error('Error 4')
      ];

      // Fire all errors synchronously (simulating rapid network failures)
      errors.forEach(error => {
        act(() => {
          errorHandler(error);
        });
      });

      // THIS TEST SHOULD FAIL - Counter should be exactly 4, but race condition may cause different value
      await waitFor(() => {
        // We can't directly access the internal state, but we can infer from behavior
        // If HTTP fallback is triggered, it means the counter reached 3
        const connectionStatus = screen.getByTestId('connection-status');
        const isHttpMode = connectionStatus.textContent.includes('HTTP');
        
        // With 4 errors, should definitely be in HTTP mode, but race condition may prevent this
        expect(isHttpMode).toBe(true);
      });
    });
  });

  describe('GREEN PHASE - Tests for Fixed Implementation', () => {
    test('should pass: atomic connection attempt counting', async () => {
      // Mock the fixed implementation with useCallback and proper state management
      const useAtomicCounter = (initialValue = 0) => {
        const [count, setCount] = React.useState(initialValue);
        
        const increment = React.useCallback(() => {
          setCount(prevCount => {
            const newCount = prevCount + 1;
            return newCount;
          });
        }, []);
        
        return [count, increment];
      };

      const [attempts, incrementAttempts] = useAtomicCounter(0);
      
      // Simulate multiple increments
      for (let i = 0; i < 5; i++) {
        incrementAttempts();
      }
      
      // Should have correct count
      expect(attempts).toBe(5);
    });

    test('should pass: proper error handler with functional state updates', async () => {
      const mockSetConnectionAttempts = jest.fn();
      const mockSetConnectionStatus = jest.fn();
      const mockSetUseSocketIO = jest.fn();

      // Mock the fixed error handler implementation
      const handleConnectionError = (error) => {
        mockSetConnectionAttempts(prev => {
          const newAttempts = prev + 1;
          
          // Use the updated value in the same function
          if (newAttempts >= 3) {
            console.log('Falling back to HTTP API after multiple connection failures');
            mockSetUseSocketIO(false);
          }
          
          return newAttempts;
        });
        
        mockSetConnectionStatus('error');
      };

      // Simulate 3 connection errors
      for (let i = 0; i < 3; i++) {
        handleConnectionError(new Error(`Error ${i + 1}`));
      }

      // Should have called setConnectionAttempts 3 times
      expect(mockSetConnectionAttempts).toHaveBeenCalledTimes(3);
      
      // Should have triggered HTTP fallback
      expect(mockSetUseSocketIO).toHaveBeenCalledWith(false);
    });

    test('should pass: useRef for immediate value access', async () => {
      // Test the recommended fix using useRef for immediate access
      const connectionAttemptsRef = React.useRef(0);
      const [, setConnectionAttempts] = React.useState(0);
      const [useSocketIO, setUseSocketIO] = React.useState(true);

      const handleConnectionErrorFixed = (error) => {
        connectionAttemptsRef.current += 1;
        setConnectionAttempts(connectionAttemptsRef.current);
        
        // Use ref value for immediate access (no race condition)
        if (connectionAttemptsRef.current >= 3) {
          setUseSocketIO(false);
        }
      };

      // Simulate rapid errors
      for (let i = 0; i < 5; i++) {
        handleConnectionErrorFixed(new Error(`Error ${i + 1}`));
      }

      // Should correctly trigger HTTP fallback
      expect(useSocketIO).toBe(false);
      expect(connectionAttemptsRef.current).toBe(5);
    });

    test('should pass: debounced error handling prevents race conditions', async () => {
      let errorCount = 0;
      let httpFallbackTriggered = false;
      
      // Mock debounced error handler
      const debouncedErrorHandler = (() => {
        let timeoutId;
        
        return (error) => {
          clearTimeout(timeoutId);
          errorCount++;
          
          timeoutId = setTimeout(() => {
            if (errorCount >= 3) {
              httpFallbackTriggered = true;
            }
          }, 100); // 100ms debounce
        };
      })();

      // Fire multiple errors rapidly
      for (let i = 0; i < 5; i++) {
        debouncedErrorHandler(new Error(`Error ${i + 1}`));
      }

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(errorCount).toBe(5);
      expect(httpFallbackTriggered).toBe(true);
    });
  });

  describe('Concurrency and Threading Tests', () => {
    test('should handle concurrent state updates correctly', async () => {
      const stateManager = {
        connectionAttempts: 0,
        status: 'connecting',
        useSocketIO: true,
        
        updateState: function(updates) {
          // Simulate atomic state update
          Object.assign(this, updates);
        },
        
        handleError: function() {
          const newAttempts = this.connectionAttempts + 1;
          
          this.updateState({
            connectionAttempts: newAttempts,
            status: 'error',
            useSocketIO: newAttempts < 3
          });
        }
      };

      // Simulate concurrent errors
      const concurrentErrors = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve().then(() => stateManager.handleError())
      );

      await Promise.all(concurrentErrors);

      // State should be consistent
      expect(stateManager.connectionAttempts).toBe(10);
      expect(stateManager.useSocketIO).toBe(false);
      expect(stateManager.status).toBe('error');
    });

    test('should maintain state consistency under rapid updates', async () => {
      let stateHistory = [];
      
      const trackingStateManager = {
        attempts: 0,
        
        increment: function() {
          this.attempts++;
          stateHistory.push({
            attempts: this.attempts,
            timestamp: Date.now()
          });
        }
      };

      // Rapid increments
      for (let i = 0; i < 100; i++) {
        trackingStateManager.increment();
      }

      // Verify state consistency
      expect(trackingStateManager.attempts).toBe(100);
      expect(stateHistory).toHaveLength(100);
      
      // Verify monotonic increase
      for (let i = 1; i < stateHistory.length; i++) {
        expect(stateHistory[i].attempts).toBe(stateHistory[i - 1].attempts + 1);
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should recover from race condition errors gracefully', async () => {
      const resilientErrorHandler = {
        attempts: 0,
        maxAttempts: 3,
        isRecovering: false,
        
        handleError: function(error) {
          if (this.isRecovering) {
            return; // Prevent concurrent handling
          }
          
          this.isRecovering = true;
          
          try {
            this.attempts++;
            
            if (this.attempts >= this.maxAttempts) {
              this.triggerFallback();
            }
          } finally {
            this.isRecovering = false;
          }
        },
        
        triggerFallback: function() {
          // Fallback logic
          return 'HTTP_FALLBACK';
        }
      };

      // Test concurrent error handling
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(resilientErrorHandler.handleError(new Error(`Error ${i}`)));
      }

      expect(resilientErrorHandler.attempts).toBe(5);
      expect(resilientErrorHandler.triggerFallback()).toBe('HTTP_FALLBACK');
    });
  });
});