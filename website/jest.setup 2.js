/**
 * Jest Setup File for Analytics Validation Tests
 * Configures global test environment and utilities
 */

// Increase timeout for Puppeteer tests
jest.setTimeout(120000);

// Global test utilities
global.testUtils = {
    // Helper to wait for elements
    waitForElement: async (page, selector, timeout = 10000) => {
        try {
            await page.waitForSelector(selector, { timeout });
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // Helper to check if element is visible
    isElementVisible: async (page, selector) => {
        try {
            const element = await page.$(selector);
            if (!element) return false;
            
            return await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return false;
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0';
            }, selector);
        } catch (error) {
            return false;
        }
    },
    
    // Helper to get page performance metrics
    getPerformanceMetrics: async (page) => {
        return await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            };
        });
    }
};

// Console logging for test debugging
const originalConsoleLog = console.log;
console.log = (...args) => {
    if (process.env.NODE_ENV !== 'test' || process.env.VERBOSE_TESTS === 'true') {
        originalConsoleLog(...args);
    }
};

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});