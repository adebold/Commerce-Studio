/**
 * Jest Configuration - Testing Agent Implementation
 * SPARC Phase 4 - Days 18-19
 * 
 * Comprehensive test configuration for all SPARC components
 */

module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Test file patterns
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/apps/**/*.test.js',
        '<rootDir>/src/**/*.test.js'
    ],
    
    // Setup files
    setupFilesAfterEnv: [
        '<rootDir>/tests/setup.js'
    ],
    
    // Module paths
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/html-store/$1',
        '^@api/(.*)$': '<rootDir>/src/api/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1'
    },
    
    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: '<rootDir>/tests/coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json-summary'
    ],
    
    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        './apps/html-store/js/enhanced-cart-ui.js': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        './src/api/routers/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        }
    },
    
    // Files to collect coverage from
    collectCoverageFrom: [
        'apps/html-store/js/**/*.js',
        'src/api/**/*.py',
        '!**/node_modules/**',
        '!**/tests/**',
        '!**/coverage/**',
        '!**/*.config.js'
    ],
    
    // Transform configuration
    transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.py$': '<rootDir>/tests/python-transformer.js'
    },
    
    // Module file extensions
    moduleFileExtensions: [
        'js',
        'json',
        'py'
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Verbose output
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true,
    
    // Error handling
    errorOnDeprecated: true,
    
    // Globals
    globals: {
        'window': {},
        'document': {},
        'navigator': {
            userAgent: 'jest'
        }
    },
    
    // Test reporters
    reporters: [
        'default',
        [
            'jest-html-reporters',
            {
                publicPath: './tests/reports',
                filename: 'test-report.html',
                expand: true,
                hideIcon: false,
                pageTitle: 'SPARC Test Report',
                logoImgPath: undefined,
                inlineSource: false
            }
        ],
        [
            'jest-junit',
            {
                outputDirectory: './tests/reports',
                outputName: 'junit.xml',
                ancestorSeparator: ' › ',
                uniqueOutputName: 'false',
                suiteNameTemplate: '{filepath}',
                classNameTemplate: '{classname}',
                titleTemplate: '{title}'
            }
        ]
    ],
    
    // Watch plugins
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
    ],
    
    // Snapshot serializers
    snapshotSerializers: [
        'jest-serializer-html'
    ],
    
    // Test results processor
    testResultsProcessor: '<rootDir>/tests/results-processor.js'
};