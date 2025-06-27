// This file provides polyfills for TextEncoder and TextDecoder in Jest tests

// Check if TextEncoder is already defined
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

// Check if TextDecoder is already defined
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Mock crypto.subtle for tests
if (typeof crypto === 'undefined') {
  global.crypto = {};
}

if (typeof crypto.subtle === 'undefined') {
  global.crypto.subtle = {
    digest: jest.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32)))
  };
}

// Mock window.crypto for tests
if (typeof window !== 'undefined' && typeof window.crypto === 'undefined') {
  Object.defineProperty(window, 'crypto', {
    value: global.crypto
  });
}