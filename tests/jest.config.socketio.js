/**
 * @fileoverview Jest Configuration for Socket.IO Integration Tests
 * Specialized configuration for testing Socket.IO real-time functionality
 * @module tests/jest.config.socketio
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/tests/integration/*socketio*.test.js',
    '**/tests/security/*socketio*.test.js',
    '**/tests/specifications/*socketio*.test.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/socketio-test-setup.js'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@apps/(.*)$': '<rootDir>/apps/$1',
    '^@services/(.*)$': '<rootDir>/services/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/tests/coverage/socketio',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './apps/shopify/frontend/components/AIDiscoveryWidget.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './apps/*/api/chat.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'apps/shopify/frontend/components/AIDiscoveryWidget.tsx',
    'apps/woocommerce/frontend/components/AIDiscoveryWidget.js',
    'apps/magento/frontend/components/AIDiscoveryWidget.js',
    'apps/html-store/frontend/components/AIDiscoveryWidget.js',
    'apps/*/api/chat.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Test timeout (increased for Socket.IO connection tests)
  testTimeout: 10000,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/setup/socketio-global-setup.js',
  globalTeardown: '<rootDir>/tests/setup/socketio-global-teardown.js',
  
  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Verbose output for debugging
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/coverage/',
    '<rootDir>/logs/'
  ],
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/tests/reports',
      outputName: 'socketio-test-results.xml',
      suiteName: 'Socket.IO Integration Tests'
    }],
    ['jest-html-reporters', {
      publicPath: '<rootDir>/tests/reports',
      filename: 'socketio-test-report.html',
      pageTitle: 'Socket.IO Integration Test Report'
    }]
  ],
  
  // Custom test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    userAgent: 'node.js'
  },
  
  // Snapshot configuration
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Maximum worker processes
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/tests/.jest-cache',
  
  // Test result processor
  testResultsProcessor: '<rootDir>/tests/processors/socketio-results-processor.js'
};