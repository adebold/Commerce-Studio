/**
 * Jest configuration for integration tests
 */

module.exports = {
  // The root directory that Jest should scan for tests and modules
  rootDir: './',

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/?(*.)+(spec|test).[tj]s?(x)'
  ],

  // An array of regexp pattern strings that are matched against all test paths
  // matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    '/mocks/',
    '/utils/'
  ],

  // An array of regexp pattern strings that are matched against all source file paths
  // before re-running tests in watch mode
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    '/mocks/',
    '/utils/'
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    '/mocks/',
    '/utils/'
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover',
    'html'
  ],

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: [
    'node_modules',
    '<rootDir>'
  ],

  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // A list of paths to directories that Jest should use to search for files in
  roots: [
    '<rootDir>'
  ],

  // The paths to modules that run some code to configure or set up the testing environment
  setupFiles: [
    '<rootDir>/setup/jest.setup.js'
  ],

  // A list of paths to modules that run some code to configure or set up the testing framework
  setupFilesAfterEnv: [
    '<rootDir>/setup/jest.setupAfterEnv.js'
  ],

  // The test timeout in milliseconds
  testTimeout: 30000,

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },

  // An array of regexp pattern strings that are matched against all source file paths
  // before transformation
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],

  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results/junit',
      outputName: 'integration-tests.xml'
    }],
    ['jest-html-reporter', {
      pageTitle: 'VARAi Integration Test Report',
      outputPath: './test-results/html-report/index.html'
    }],
    ['jest-allure', {
      resultsDir: './allure-results'
    }]
  ],

  // Global setup and teardown
  globalSetup: '<rootDir>/setup/globalSetup.js',
  globalTeardown: '<rootDir>/setup/globalTeardown.js',

  // Retry failed tests
  retryTimes: 1,
  bail: 0
};