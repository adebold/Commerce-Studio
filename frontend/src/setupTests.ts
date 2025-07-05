// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder for React Router tests
// Using 'as any' to bypass TypeScript errors since this is just for testing
class MockTextEncoder {
  encoding = 'utf-8';
  encode(input: string): Uint8Array {
    return new Uint8Array(input.split('').map(char => char.charCodeAt(0)));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encodeInto(source: string, destination: Uint8Array): { read: number; written: number } {
    // This is a stub implementation for testing purposes
    return { read: 0, written: 0 };
  }
}

class MockTextDecoder {
  encoding = 'utf-8';
  fatal = false;
  ignoreBOM = false;
  decode(input?: BufferSource): string {
    if (!input) return '';
    const buffer = input instanceof ArrayBuffer ? new Uint8Array(input) : new Uint8Array(input.buffer);
    return Array.from(buffer)
      .map(byte => String.fromCharCode(byte))
      .join('');
  }
}

// Use type assertions to bypass TypeScript's type checking
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).TextEncoder = MockTextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).TextDecoder = MockTextDecoder;

// Mock global fetch for tests
global.fetch = jest.fn();

// Reset all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});

// Mock window.matchMedia for responsive component tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver
});

// Mock import.meta.env for Vite environment variables
// This is needed for tests that use import.meta.env
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
if (!(global as any).import) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (global as any).import = {
    meta: {
      env: {
        MODE: 'test',
        DEV: true,
        PROD: false,
        SSR: false,
        VITE_API_URL: 'http://localhost:8000',
        VITE_AUTH_API_URL: 'http://localhost:8001',
        VITE_ANALYTICS_API_URL: 'http://localhost:8002',
        VITE_RECOMMENDATIONS_API_URL: 'http://localhost:8003',
        VITE_PLATFORM: 'web',
        VITE_MULTI_TENANT: 'true',
        VITE_ENABLE_ANALYTICS: 'true',
        VITE_ENABLE_RECOMMENDATIONS: 'true',
        // Add any other environment variables used in your application
      }
    }
  };
}

// Make import.meta.env directly accessible
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(global as any).import.meta.env = (global as any).import.meta.env || (global as any).import.meta.env;

// Add a direct reference to process.env for compatibility
process.env.VITE_API_URL = 'http://localhost:8000';
process.env.VITE_AUTH_API_URL = 'http://localhost:8001';
process.env.VITE_ANALYTICS_API_URL = 'http://localhost:8002';
process.env.VITE_RECOMMENDATIONS_API_URL = 'http://localhost:8003';
process.env.VITE_PLATFORM = 'web';
process.env.VITE_MULTI_TENANT = 'true';
process.env.VITE_ENABLE_ANALYTICS = 'true';
process.env.VITE_ENABLE_RECOMMENDATIONS = 'true';