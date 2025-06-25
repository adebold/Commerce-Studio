module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/Test/js'],
  moduleNameMapper: {
    '^jquery$': '<rootDir>/node_modules/jquery/dist/jquery.js',
    '^ko$': '<rootDir>/node_modules/knockout/build/output/knockout-latest.js',
    '^uiComponent$': '<rootDir>/Test/js/mocks/uiComponent.js',
    '^mage/url$': '<rootDir>/Test/js/mocks/url.js',
    '../../view/frontend/web/js/(.*)': '<rootDir>/view/frontend/web/js/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/Test/js/setup.js'],
  testMatch: ['**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/Test/js/coverage',
  coverageReporters: ['text', 'lcov'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!knockout|jquery).+\\.js$'
  ],
  verbose: true
};