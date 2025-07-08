/**
 * @fileoverview Critical Fixes Test Setup
 * Global setup for critical fixes test suite
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock React for testing
global.React = require('react');

// Mock Socket.IO client
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
    id: 'mock-socket-id'
  }));
});

// Mock browser APIs
Object.defineProperty(window, 'location', {
  value: {
    protocol: 'https:',
    host: 'test.myshopify.com'
  },
  writable: true
});

// Mock MediaDevices API for face analysis tests
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [{ stop: jest.fn() }]
    }))
  },
  writable: true
});

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};

// Mock memory usage for Node.js
if (typeof process !== 'undefined') {
  process.memoryUsage = jest.fn(() => ({
    rss: 50 * 1024 * 1024,
    heapTotal: 30 * 1024 * 1024,
    heapUsed: 20 * 1024 * 1024,
    external: 5 * 1024 * 1024,
    arrayBuffers: 1 * 1024 * 1024
  }));
}

// Mock console methods for testing
const originalConsole = { ...console };
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(30000);