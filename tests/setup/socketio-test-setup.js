/**
 * @fileoverview Socket.IO Test Setup
 * Global setup for Socket.IO integration tests
 * @module tests/setup/socketio-test-setup
 */

import { jest } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';
import { JSDOM } from 'jsdom';

// Global polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock WebSocket for testing
class MockWebSocket {
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 100);
  }
  
  send(data) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Mock sending data
  }
  
  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
  
  addEventListener(event, handler) {
    this[`on${event}`] = handler;
  }
  
  removeEventListener(event, handler) {
    this[`on${event}`] = null;
  }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

global.WebSocket = MockWebSocket;

// Mock Socket.IO client
const mockSocketIO = jest.fn(() => ({
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  connect: jest.fn(),
  connected: false,
  id: 'mock-socket-id',
  io: {
    engine: {
      transport: {
        name: 'websocket'
      }
    }
  }
}));

global.io = mockSocketIO;

// Mock MediaPipe components
global.FaceMesh = jest.fn().mockImplementation(() => ({
  setOptions: jest.fn(),
  onResults: jest.fn(),
  send: jest.fn().mockResolvedValue(undefined)
}));

global.Camera = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn()
}));

// Mock fetch for HTTP fallback tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      success: true,
      response: 'Mock response',
      provider: 'mock'
    })
  })
);

// Mock navigator.mediaDevices for camera tests
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [{ stop: jest.fn() }]
      })
    )
  }
});

// Mock MediaRecorder for voice tests
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: null,
  onstop: null
}));

// Mock Blob for file handling
global.Blob = jest.fn().mockImplementation((parts, options) => ({
  size: parts.reduce((size, part) => size + part.length, 0),
  type: options?.type || '',
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  text: () => Promise.resolve(parts.join(''))
}));

// Mock URL for object URLs
global.URL = {
  createObjectURL: jest.fn(() => 'mock-object-url'),
  revokeObjectURL: jest.fn()
};

// Mock Audio for avatar audio playback
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => [])
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Setup JSDOM environment for DOM tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock window.location
Object.defineProperty(global.window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock window.history
Object.defineProperty(global.window, 'history', {
  value: {
    pushState: jest.fn(),
    replaceState: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    go: jest.fn()
  },
  writable: true
});

// Mock online/offline events
Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true
});

global.window.addEventListener = jest.fn();
global.window.removeEventListener = jest.fn();

// Mock SecurityPolicyViolationEvent for CSP tests
global.SecurityPolicyViolationEvent = jest.fn().mockImplementation((type, init) => ({
  type,
  violatedDirective: init.violatedDirective,
  blockedURI: init.blockedURI,
  lineNumber: init.lineNumber,
  columnNumber: init.columnNumber,
  sourceFile: init.sourceFile
}));

// Test utilities
global.testUtils = {
  // Wait for condition with timeout
  waitFor: async (condition, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Condition not met within timeout');
  },
  
  // Wait for Socket.IO connection
  waitForConnection: async (socket, timeout = 5000) => {
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
  },
  
  // Create mock socket
  createMockSocket: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn(),
    connected: true,
    id: 'test-socket-id',
    trigger: function(event, data) {
      const handler = this.on.mock.calls.find(call => call[0] === event)?.[1];
      if (handler) handler(data);
    }
  }),
  
  // Simulate network conditions
  simulateNetworkCondition: (condition) => {
    switch (condition) {
      case 'offline':
        Object.defineProperty(global.navigator, 'onLine', { value: false });
        break;
      case 'online':
        Object.defineProperty(global.navigator, 'onLine', { value: true });
        break;
      case 'slow':
        // Mock slow network by adding delays
        global.fetch = jest.fn(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, response: 'Slow response' })
            }), 2000)
          )
        );
        break;
      default:
        // Reset to normal
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, response: 'Normal response' })
          })
        );
    }
  }
};

// Cleanup function for after each test
global.testCleanup = () => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset navigator.onLine
  Object.defineProperty(global.navigator, 'onLine', { value: true });
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset fetch mock
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        response: 'Mock response',
        provider: 'mock'
      })
    })
  );
};

// Setup Jest matchers
expect.extend({
  toBeConnected(socket) {
    const pass = socket.connected === true;
    return {
      message: () => `expected socket to ${pass ? 'not ' : ''}be connected`,
      pass
    };
  },
  
  toHaveEmitted(socket, event, data) {
    const calls = socket.emit.mock.calls;
    const found = calls.some(call => 
      call[0] === event && (data ? JSON.stringify(call[1]) === JSON.stringify(data) : true)
    );
    
    return {
      message: () => `expected socket to ${found ? 'not ' : ''}have emitted ${event}${data ? ` with data ${JSON.stringify(data)}` : ''}`,
      pass: found
    };
  },
  
  toHaveRegisteredEvent(socket, event) {
    const calls = socket.on.mock.calls;
    const found = calls.some(call => call[0] === event);
    
    return {
      message: () => `expected socket to ${found ? 'not ' : ''}have registered event ${event}`,
      pass: found
    };
  }
});

// Export test utilities for use in tests
export { testUtils, testCleanup };