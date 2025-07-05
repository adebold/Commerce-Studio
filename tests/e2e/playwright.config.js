/**
 * Playwright E2E Test Configuration - Testing Agent Implementation
 * SPARC Phase 4 - Days 18-19
 * 
 * Comprehensive E2E testing configuration for cross-browser testing
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    // Test directory
    testDir: './tests/e2e',
    
    // Global test timeout
    timeout: 30000,
    
    // Expect timeout for assertions
    expect: {
        timeout: 5000
    },
    
    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,
    
    // Retry on CI only
    retries: process.env.CI ? 2 : 0,
    
    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,
    
    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'tests/e2e/reports/html' }],
        ['json', { outputFile: 'tests/e2e/reports/results.json' }],
        ['junit', { outputFile: 'tests/e2e/reports/junit.xml' }],
        ['line']
    ],
    
    // Global setup and teardown
    globalSetup: require.resolve('./global-setup.js'),
    globalTeardown: require.resolve('./global-teardown.js'),
    
    // Shared settings for all projects
    use: {
        // Base URL for tests
        baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
        
        // Collect trace when retrying the failed test
        trace: 'on-first-retry',
        
        // Record video on failure
        video: 'retain-on-failure',
        
        // Take screenshot on failure
        screenshot: 'only-on-failure',
        
        // Browser context options
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        
        // Emulate user preferences
        colorScheme: 'light',
        locale: 'en-US',
        timezoneId: 'America/New_York',
        
        // Network conditions
        launchOptions: {
            slowMo: process.env.CI ? 0 : 50
        }
    },
    
    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        
        // Mobile testing
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
        
        // Tablet testing
        {
            name: 'iPad',
            use: { ...devices['iPad Pro'] },
        },
        
        // High DPI testing
        {
            name: 'High DPI',
            use: {
                ...devices['Desktop Chrome'],
                deviceScaleFactor: 2,
            },
        },
        
        // Slow network testing
        {
            name: 'Slow Network',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: ['--simulate-slow-connection']
                }
            },
        }
    ],
    
    // Web server configuration for local testing
    webServer: process.env.CI ? undefined : {
        command: 'npm run serve:test',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
    
    // Output directory
    outputDir: 'tests/e2e/test-results/',
    
    // Test match patterns
    testMatch: [
        '**/e2e/**/*.test.js',
        '**/e2e/**/*.spec.js'
    ],
    
    // Test ignore patterns
    testIgnore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**'
    ]
});