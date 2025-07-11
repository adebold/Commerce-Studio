// Mock window.dataLayer for GA4 tracking
window.dataLayer = [];

// Mock fetch globally
global.fetch = jest.fn();

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = {};
  }
  
  append(key, value) {
    this.data[key] = value;
  }
  
  get(key) {
    return this.data[key];
  }
  
  getAll(key) {
    return [this.data[key]];
  }
  
  has(key) {
    return key in this.data;
  }
  
  delete(key) {
    delete this.data[key];
  }
  
  entries() {
    return Object.entries(this.data);
  }
  
  keys() {
    return Object.keys(this.data);
  }
  
  values() {
    return Object.values(this.data);
  }
  
  forEach(callback) {
    Object.entries(this.data).forEach(([key, value]) => {
      callback(value, key, this);
    });
  }
};

// Mock CustomEvent
global.CustomEvent = class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail || {};
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
  }
};

// Add missing DOM methods
if (!Element.prototype.closest) {
  Element.prototype.closest = function(selector) {
    let el = this;
    while (el) {
      if (el.matches && el.matches(selector)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };
}

// Add missing DOM properties
Object.defineProperty(HTMLElement.prototype, 'innerText', {
  get() {
    return this.textContent;
  },
  set(value) {
    this.textContent = value;
  },
  configurable: true,
});

// Mock console methods to avoid cluttering test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = jest.fn((...args) => {
  if (process.env.DEBUG) {
    originalConsoleError(...args);
  }
});

console.warn = jest.fn((...args) => {
  if (process.env.DEBUG) {
    originalConsoleWarn(...args);
  }
});

console.log = jest.fn((...args) => {
  if (process.env.DEBUG) {
    originalConsoleLog(...args);
  }
});

// Restore console methods after tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});