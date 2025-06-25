// Setup file for Jest tests

// Mock the window object
global.window = Object.create(window);

// Mock jQuery
global.$ = require('jquery');

// Mock Knockout
global.ko = require('ko');

// Mock Magento's define/require system
global.define = function(dependencies, factory) {
  // Return the factory directly for testing
  return factory.apply(null, dependencies.map(dep => {
    switch(dep) {
      case 'jquery':
        return global.$;
      case 'ko':
        return global.ko;
      case 'uiComponent':
        return require('uiComponent');
      case 'mage/url':
        return require('mage/url');
      default:
        return {};
    }
  }));
};

// Mock modal functionality
$.fn.modal = function(action) {
  return this;
};

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = function(...args) {
  if (process.env.JEST_VERBOSE) {
    originalConsoleError.apply(console, args);
  }
};

// Add custom matchers
expect.extend({
  toBeFunction(received) {
    const pass = typeof received === 'function';
    return {
      message: () => `expected ${received} to be a function`,
      pass
    };
  }
});