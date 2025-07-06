/**
 * @fileoverview Jest Configuration for Critical Fixes Test Suite
 * Simplified configuration for testing critical issues before cross-platform propagation
 * @module tests/critical-fixes/jest.config.critical-fixes
 */

module.exports = {
  displayName: 'Critical Fixes Test Suite',
  rootDir: '../../',
  testMatch: [
    '<rootDir>/tests/critical-fixes/**/*.test.js'
  ],
  
  // Test environment setup
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/critical-fixes-setup.js'
  ],
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/shopify/frontend/$1',
    '^@components/(.*)$': '<rootDir>/apps/shopify/frontend/components/$1',
    '^@types/(.*)$': '<rootDir>/apps/shopify/frontend/types/$1',
    '^@services/(.*)$': '<rootDir>/apps/shopify/frontend/services/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Coverage configuration for critical fixes
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/critical-fixes',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'apps/shopify/frontend/components/AIDiscoveryWidget.tsx',
    'apps/shopify/frontend/types/socket.ts',
    'apps/shopify/frontend/services/**/*.ts',
    '!**/*.test.{js,ts,tsx}',
    '!**/*.spec.{js,ts,tsx}',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds for critical components
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test timeout for performance tests
  testTimeout: 30000,
  
  // Memory and performance monitoring
  logHeapUsage: true,
  detectOpenHandles: true,
  detectLeaks: true,
  
  // Basic reporter configuration
  reporters: ['default'],
  
  // Test execution settings
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  errorOnDeprecated: true,
  maxWorkers: '50%'
};