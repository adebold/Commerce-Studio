/**
 * VARAi Jest Setup
 */

// Set up Jest environment
require('@testing-library/jest-dom');

// Mock window properties
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/product/test-product/',
    pathname: '/product/test-product/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock document properties
document.title = 'Test Product - VARAi Store';

// Mock body classes
document.body.className = 'single-product woocommerce';

// Mock console methods to avoid cluttering test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = jest.fn((...args) => {
  if (args[0] && args[0].includes && args[0].includes('[VARAi]')) {
    return;
  }
  originalConsoleError(...args);
});

console.warn = jest.fn((...args) => {
  if (args[0] && args[0].includes && args[0].includes('[VARAi]')) {
    return;
  }
  originalConsoleWarn(...args);
});

// Clean up after tests
afterEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Reset document body
  document.body.innerHTML = '';
});