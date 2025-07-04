/**
 * Playwright configuration for UI integration tests
 * @see https://playwright.dev/docs/test-configuration
 */

const { devices } = require('@playwright/test');
require('dotenv').config({ path: '.env.test' });

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './',
  testMatch: '**/*.ui.test.js',
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './test-results/playwright-report' }],
    ['junit', { outputFile: './test-results/junit/ui-tests.xml' }],
    ['list'],
    ['allure-playwright']
  ],
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Collect traces for all tests
    contextOptions: {
      recordVideo: {
        dir: './test-results/videos/',
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
  outputDir: './test-results/test-artifacts/',
  webServer: process.env.CI ? {
    command: 'node ../mocks/server.js',
    port: 3000,
    timeout: 5000,
    reuseExistingServer: !process.env.CI,
  } : undefined,
  // Global setup and teardown
  globalSetup: require.resolve('./setup/playwright.globalSetup.js'),
  globalTeardown: require.resolve('./setup/playwright.globalTeardown.js'),
};

module.exports = config;