/**
 * Jest configuration for VARAi e-commerce integration tests
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/common/mocks/**',
    '!**/dist/**',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  reporters: ['default', 'jest-junit'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/common/setup/jest.setup.js'],
  globalSetup: '<rootDir>/common/setup/globalSetup.js',
  globalTeardown: '<rootDir>/common/setup/globalTeardown.js',
  testTimeout: 30000, // 30 seconds
  verbose: true,
  // Environment variables for tests
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  // Custom resolver for platform-specific mocks
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};