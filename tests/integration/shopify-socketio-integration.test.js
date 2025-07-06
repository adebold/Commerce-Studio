/**
 * @fileoverview Shopify Socket.IO Integration Tests
 * Tests Socket.IO real-time chat functionality in Shopify AIDiscoveryWidget
 * @module tests/integration/shopify-socketio-integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import io from 'socket.io-client';
import AIDiscoveryWidget from '../../apps/shopify/frontend/components/AIDiscoveryWidget.tsx';

// Mock Socket.IO client
jest.mock('socket.io-client');

describe('Shopify Socket.IO Integration', () => {
  let mockSocket;
  let mockSocketEmit;
  let mockSocketOn;
  let mockSocketDisconnect;

  beforeEach(() => {
    // Reset mocks
    mockSocketEmit = jest.fn();
    mockSocketOn = jest.fn();
    mockSocketDisconnect = jest.fn();
    
    mockSocket = {
      on: mockSocketOn,
      emit: mockSocketEmit,
      disconnect: mockSocketDisconnect,
      connected: false,
      id: 'test-socket-id'
    };

    io.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Socket.IO Connection Establishment', () => {
    test('should initialize Socket.IO connection on widget mount', () => {
      render(
        <AIDiscoveryWidget 
          shopDomain="test-shop.myshopify.com"
          enableFaceAnalysis={true}
        />
      );

      expect(io).toHaveBeenCalledWith(
        expect.stringContaining('test-shop.myshopify.com'),
        expect.objectContaining({
          transports: ['websocket', 'polling']
        })
      );
    });

    test('should register required event handlers', () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      expect(mockSocketOn).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('chat-response', expect.any(Function));
      expect(mockSocketOn).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });

    test('should handle connection success', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Simulate connection success
      const connectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect')[1];
      mockSocket.connected = true;
      
      connectHandler();

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
      });
    });

    test('should handle connection error', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Simulate connection error
      const errorHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect_error')[1];
      
      errorHandler(new Error('Connection failed'));

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
      });
    });
  });

  describe('Real-time Message Processing', () => {
    test('should send chat message via Socket.IO', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Simulate connected state
      mockSocket.connected = true;
      const connectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect')[1];
      connectHandler();

      // Send message
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Hello, I need help finding glasses' } });
      fireEvent.click(sendButton);

      expect(mockSocketEmit).toHaveBeenCalledWith('chat-message', expect.objectContaining({
        message: 'Hello, I need help finding glasses',
        sessionId: expect.any(String),
        timestamp: expect.any(String)
      }));
    });

    test('should handle chat-response events correctly', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Get chat-response handler
      const chatResponseHandler = mockSocketOn.mock.calls.find(call => call[0] === 'chat-response')[1];

      const mockResponse = {
        success: true,
        response: 'I can help you find the perfect glasses! What style are you looking for?',
        sessionId: 'test-session-123',
        provider: 'google',
        timestamp: new Date().toISOString()
      };

      // Simulate receiving chat response
      chatResponseHandler(mockResponse);

      await waitFor(() => {
        expect(screen.getByText(mockResponse.response)).toBeInTheDocument();
      });

      // Verify message appears in chat
      const assistantMessage = screen.getByTestId('message-assistant');
      expect(assistantMessage).toHaveTextContent(mockResponse.response);
    });

    test('should handle error responses', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const chatResponseHandler = mockSocketOn.mock.calls.find(call => call[0] === 'chat-response')[1];

      const errorResponse = {
        success: false,
        error: 'Service temporarily unavailable',
        timestamp: new Date().toISOString()
      };

      chatResponseHandler(errorResponse);

      await waitFor(() => {
        expect(screen.getByText(/Service temporarily unavailable/)).toBeInTheDocument();
      });
    });

    test('should show typing indicator during processing', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      mockSocket.connected = true;
      
      // Send message
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      // Should show typing indicator
      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      });

      // Simulate response
      const chatResponseHandler = mockSocketOn.mock.calls.find(call => call[0] === 'chat-response')[1];
      chatResponseHandler({
        success: true,
        response: 'Response received',
        sessionId: 'test-session'
      });

      // Typing indicator should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
      });
    });
  });

  describe('Fallback Mechanism', () => {
    test('should fallback to HTTP when Socket.IO unavailable', async () => {
      // Mock fetch for HTTP fallback
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          response: 'HTTP fallback response',
          provider: 'http-fallback'
        })
      });

      // Mock Socket.IO connection failure
      mockSocket.connected = false;
      io.mockImplementation(() => {
        setTimeout(() => {
          const errorHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect_error')[1];
          errorHandler(new Error('Connection failed'));
        }, 100);
        return mockSocket;
      });

      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Send message (should use HTTP fallback)
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Test fallback message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/ai-discovery/chat',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Test fallback message')
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('HTTP fallback response')).toBeInTheDocument();
      });
    });

    test('should maintain backward compatibility with existing endpoints', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          response: 'Compatible response',
          sessionId: 'test-session'
        })
      });

      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Force HTTP mode
      const widget = screen.getByTestId('ai-discovery-widget');
      fireEvent.click(screen.getByTestId('force-http-mode'));

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Compatibility test' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ai-discovery/chat', expect.any(Object));
      });
    });
  });

  describe('Connection Management', () => {
    test('should implement reconnection with exponential backoff', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Simulate disconnect
      const disconnectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'disconnect')[1];
      disconnectHandler();

      // Should attempt reconnection
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Reconnecting');
      });

      // Verify reconnection attempts with backoff
      expect(mockSocketOn).toHaveBeenCalledWith('reconnect_attempt', expect.any(Function));
    });

    test('should queue messages during disconnection', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Start connected
      mockSocket.connected = true;
      const connectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect')[1];
      connectHandler();

      // Disconnect
      mockSocket.connected = false;
      const disconnectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'disconnect')[1];
      disconnectHandler();

      // Send messages while disconnected
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Queued message 1' } });
      fireEvent.click(sendButton);

      fireEvent.change(messageInput, { target: { value: 'Queued message 2' } });
      fireEvent.click(sendButton);

      // Messages should be queued, not sent immediately
      expect(mockSocketEmit).not.toHaveBeenCalled();

      // Reconnect
      mockSocket.connected = true;
      connectHandler();

      // Queued messages should be sent
      await waitFor(() => {
        expect(mockSocketEmit).toHaveBeenCalledWith('chat-message', expect.objectContaining({
          message: 'Queued message 1'
        }));
        expect(mockSocketEmit).toHaveBeenCalledWith('chat-message', expect.objectContaining({
          message: 'Queued message 2'
        }));
      });
    });

    test('should cleanup socket connection on unmount', () => {
      const { unmount } = render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      unmount();

      expect(mockSocketDisconnect).toHaveBeenCalled();
    });
  });

  describe('Face Analysis Integration', () => {
    test('should send face analysis data via Socket.IO', async () => {
      render(
        <AIDiscoveryWidget 
          shopDomain="test-shop.myshopify.com"
          enableFaceAnalysis={true}
        />
      );

      mockSocket.connected = true;

      const mockFaceAnalysis = {
        faceShape: 'oval',
        confidence: 0.95,
        measurements: {
          faceWidth: 140,
          faceHeight: 180,
          jawWidth: 120,
          foreheadWidth: 130,
          pupillaryDistance: 62
        },
        timestamp: Date.now()
      };

      // Simulate face analysis completion
      const faceAnalysisButton = screen.getByTestId('start-face-analysis');
      fireEvent.click(faceAnalysisButton);

      // Mock face analysis result
      const widget = screen.getByTestId('ai-discovery-widget');
      fireEvent(widget, new CustomEvent('faceAnalysisComplete', {
        detail: mockFaceAnalysis
      }));

      expect(mockSocketEmit).toHaveBeenCalledWith('face-analysis', expect.objectContaining({
        faceAnalysis: mockFaceAnalysis
      }));
    });
  });

  describe('Error Handling', () => {
    test('should handle socket errors gracefully', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const errorHandler = mockSocketOn.mock.calls.find(call => call[0] === 'error')[1];
      
      errorHandler({ message: 'Socket error occurred' });

      await waitFor(() => {
        expect(screen.getByText(/Socket error occurred/)).toBeInTheDocument();
      });
    });

    test('should show user-friendly error messages', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      const chatResponseHandler = mockSocketOn.mock.calls.find(call => call[0] === 'chat-response')[1];

      chatResponseHandler({
        success: false,
        error: 'AI_SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString()
      });

      await waitFor(() => {
        expect(screen.getByText(/AI service is temporarily unavailable/)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('should handle rapid message sending', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      mockSocket.connected = true;
      const connectHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect')[1];
      connectHandler();

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      // Send multiple messages rapidly
      for (let i = 0; i < 5; i++) {
        fireEvent.change(messageInput, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton);
      }

      // Should handle all messages without errors
      expect(mockSocketEmit).toHaveBeenCalledTimes(5);
    });

    test('should throttle connection attempts', async () => {
      render(<AIDiscoveryWidget shopDomain="test-shop.myshopify.com" />);

      // Simulate multiple rapid connection failures
      const errorHandler = mockSocketOn.mock.calls.find(call => call[0] === 'connect_error')[1];
      
      for (let i = 0; i < 10; i++) {
        errorHandler(new Error('Connection failed'));
      }

      // Should not overwhelm with reconnection attempts
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent(/Reconnecting/);
      });
    });
  });
});

// Test utilities
function waitForConnection(socket, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }
    
    const timer = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, timeout);
    
    socket.on('connect', () => {
      clearTimeout(timer);
      resolve();
    });
    
    socket.on('connect_error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}