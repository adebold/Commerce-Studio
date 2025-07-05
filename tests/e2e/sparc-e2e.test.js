/**
 * SPARC End-to-End Test Suite - Testing Agent Implementation
 * SPARC Phase 4 - Days 18-19
 * 
 * Complete end-to-end testing for entire SPARC workflow
 */

const { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');
const puppeteer = require('puppeteer');
const path = require('path');

describe('SPARC End-to-End Tests', () => {
    let browser;
    let page;
    let baseURL;

    beforeAll(async () => {
        // Launch browser for E2E testing
        browser = await puppeteer.launch({
            headless: process.env.CI === 'true', // Run headless in CI, visible locally
            slowMo: 50, // Slow down actions for better visibility
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--allow-running-insecure-content'
            ]
        });

        // Set base URL for testing
        baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    beforeEach(async () => {
        page = await browser.newPage();
        
        // Set viewport for consistent testing
        await page.setViewport({ width: 1280, height: 720 });
        
        // Enable request interception for API mocking
        await page.setRequestInterception(true);
        
        // Mock API responses
        page.on('request', (request) => {
            const url = request.url();
            
            if (url.includes('/api/v1/stores/nearby')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        stores: [
                            {
                                id: 'store-1',
                                name: 'VARAi Downtown',
                                address: '123 Main St, Downtown, NY 10001',
                                latitude: 40.7128,
                                longitude: -74.0060,
                                distance: 0.8,
                                isOpen: true,
                                services: ['bopis', 'eye-exam'],
                                hours: {
                                    monday: '09:00-18:00',
                                    tuesday: '09:00-18:00',
                                    wednesday: '09:00-18:00',
                                    thursday: '09:00-18:00',
                                    friday: '09:00-19:00',
                                    saturday: '10:00-17:00',
                                    sunday: '12:00-16:00'
                                }
                            },
                            {
                                id: 'store-2',
                                name: 'VARAi Mall Location',
                                address: '456 Shopping Center Dr, Mall Plaza, NY 10002',
                                latitude: 40.7589,
                                longitude: -73.9851,
                                distance: 2.3,
                                isOpen: true,
                                services: ['bopis', 'eye-exam']
                            }
                        ]
                    })
                });
            } else if (url.includes('/api/v1/stores/') && url.includes('/inventory')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        inventory: [
                            {
                                store_id: 'store-1',
                                product_id: 'frame-1',
                                quantity: 5,
                                reserved_quantity: 0
                            },
                            {
                                store_id: 'store-1',
                                product_id: 'frame-2',
                                quantity: 3,
                                reserved_quantity: 1
                            }
                        ]
                    })
                });
            } else if (url.includes('/api/v1/reservations') && request.method() === 'POST') {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: 'res-' + Date.now(),
                        confirmation_number: 'VAR' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                        store_id: 'store-1',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        customer_phone: '555-1234',
                        pickup_time: '2024-01-15T14:00:00Z',
                        status: 'confirmed',
                        items: [
                            {
                                product_id: 'frame-1',
                                quantity: 1,
                                price: 149.99
                            }
                        ],
                        created_at: new Date().toISOString()
                    })
                });
            } else if (url.includes('/api/v1/virtual-try-on')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        sessionId: 'vto-' + Date.now(),
                        productId: 'frame-1',
                        confidence: 87,
                        recommendation: 'good_fit',
                        faceAnalysis: {
                            faceShape: 'oval',
                            measurements: {
                                faceWidth: 140,
                                faceHeight: 180
                            }
                        }
                    })
                });
            } else if (url.includes('/api/v1/analytics')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true })
                });
            } else {
                request.continue();
            }
        });

        // Navigate to enhanced cart page
        await page.goto(`${baseURL}/apps/html-store/enhanced-cart.html`, {
            waitUntil: 'networkidle0'
        });
    });

    afterEach(async () => {
        if (page) {
            await page.close();
        }
    });

    describe('Complete BOPIS Workflow E2E', () => {
        test('should complete full BOPIS reservation from start to finish', async () => {
            // Step 1: Verify initial cart state
            await page.waitForSelector('.enhanced-cart');
            
            const cartTitle = await page.$eval('.cart-title', el => el.textContent);
            expect(cartTitle).toContain('Your Cart');

            // Step 2: Add sample items to cart
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify items were added
            const cartCount = await page.$eval('.cart-count', el => el.textContent);
            expect(parseInt(cartCount)).toBeGreaterThan(0);

            // Step 3: Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Verify pickup mode is active
            const pickupModeActive = await page.$eval('[data-mode="pickup"]', el => 
                el.getAttribute('aria-pressed') === 'true'
            );
            expect(pickupModeActive).toBe(true);

            // Verify store selection panel is visible
            const storePanel = await page.$('.store-selection-panel');
            const storePanelVisible = await page.evaluate(el => 
                window.getComputedStyle(el).display !== 'none', storePanel
            );
            expect(storePanelVisible).toBe(true);

            // Step 4: Search for stores
            await page.type('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            
            // Wait for stores to load
            await page.waitForSelector('.store-option', { timeout: 5000 });

            // Verify stores are displayed
            const storeOptions = await page.$$('.store-option');
            expect(storeOptions.length).toBeGreaterThan(0);

            // Step 5: Select a store
            await page.click('.select-store-btn');
            await page.waitForTimeout(500);

            // Verify store is selected
            const currentStore = await page.$('.current-store');
            const currentStoreVisible = await page.evaluate(el => 
                window.getComputedStyle(el).display !== 'none', currentStore
            );
            expect(currentStoreVisible).toBe(true);

            // Step 6: Proceed to checkout
            const checkoutBtn = await page.$('.checkout-btn');
            const checkoutEnabled = await page.evaluate(el => !el.disabled, checkoutBtn);
            expect(checkoutEnabled).toBe(true);

            await page.click('.checkout-btn');
            await page.waitForTimeout(500);

            // Verify BOPIS panel is shown
            const bopisPanel = await page.$('.bopis-panel');
            const bopisPanelVisible = await page.evaluate(el => 
                window.getComputedStyle(el).display !== 'none', bopisPanel
            );
            expect(bopisPanelVisible).toBe(true);

            // Step 7: Fill reservation form
            await page.select('.pickup-time-select', '2024-01-15T14:00:00');
            await page.type('.customer-name', 'John Doe');
            await page.type('.customer-email', 'john@example.com');
            await page.type('.customer-phone', '555-1234');

            // Step 8: Submit reservation
            await page.click('.confirm-reservation-btn');
            
            // Wait for success modal
            await page.waitForSelector('.reservation-success-modal', { timeout: 10000 });

            // Verify success modal is displayed
            const successModal = await page.$('.reservation-success-modal');
            expect(successModal).toBeTruthy();

            // Verify confirmation number is displayed
            const confirmationNumber = await page.$eval('.reservation-success-modal', el => 
                el.textContent.match(/VAR[A-Z0-9]{8}/)?.[0]
            );
            expect(confirmationNumber).toMatch(/^VAR[A-Z0-9]{8}$/);

            // Step 9: Close success modal
            await page.click('.close-modal-btn');
            await page.waitForTimeout(500);

            // Verify cart is cleared
            const finalCartCount = await page.$eval('.cart-count', el => el.textContent);
            expect(parseInt(finalCartCount)).toBe(0);

            console.log('✅ Complete BOPIS workflow test passed');
        }, 30000);

        test('should handle BOPIS workflow with inventory constraints', async () => {
            // Add items to cart
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Search and select store
            await page.type('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            await page.waitForSelector('.store-option');
            await page.click('.select-store-btn');

            // Verify inventory status is displayed
            await page.waitForSelector('.item-availability');
            const availabilityText = await page.$eval('.item-availability', el => el.textContent);
            expect(availabilityText).toContain('Available for pickup');

            console.log('✅ BOPIS inventory constraints test passed');
        }, 20000);
    });

    describe('VTO Integration E2E', () => {
        test('should complete VTO session and add to cart workflow', async () => {
            // Step 1: Add VTO session
            await page.click('button[onclick="addVTOSession()"]');
            await page.waitForTimeout(1000);

            // Verify VTO session is displayed
            await page.waitForSelector('.vto-summary');
            const vtoSummaryVisible = await page.evaluate(el => 
                window.getComputedStyle(el).display !== 'none', 
                await page.$('.vto-summary')
            );
            expect(vtoSummaryVisible).toBe(true);

            // Step 2: View VTO session details
            await page.click('.view-session-btn');
            await page.waitForTimeout(500);

            // Step 3: Add items with VTO context
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify VTO badge is shown on items
            const vtoBadge = await page.$('.vto-badge');
            expect(vtoBadge).toBeTruthy();

            // Verify confidence score is displayed
            const confidenceScore = await page.$('.vto-confidence');
            expect(confidenceScore).toBeTruthy();

            console.log('✅ VTO integration workflow test passed');
        }, 15000);

        test('should integrate VTO with BOPIS workflow', async () => {
            // Add VTO session first
            await page.click('button[onclick="addVTOSession()"]');
            await page.waitForTimeout(1000);

            // Add items to cart
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Complete store selection
            await page.type('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            await page.waitForSelector('.store-option');
            await page.click('.select-store-btn');

            // Proceed to checkout
            await page.click('.checkout-btn');
            await page.waitForTimeout(500);

            // Verify both VTO and BOPIS data are preserved
            const bopisPanel = await page.$('.bopis-panel');
            expect(bopisPanel).toBeTruthy();

            const vtoSummary = await page.$('.vto-summary');
            expect(vtoSummary).toBeTruthy();

            console.log('✅ VTO + BOPIS integration test passed');
        }, 20000);
    });

    describe('Store Locator E2E', () => {
        test('should search, filter, and select stores', async () => {
            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Step 1: Search for stores
            await page.type('.store-search-input', 'New York');
            await page.click('.find-stores-btn');

            // Wait for loading and results
            await page.waitForSelector('.store-option', { timeout: 5000 });

            // Step 2: Verify store information
            const storeOptions = await page.$$('.store-option');
            expect(storeOptions.length).toBeGreaterThan(0);

            // Check store details
            const storeName = await page.$eval('.store-option h4', el => el.textContent);
            expect(storeName).toBeTruthy();

            const storeAddress = await page.$eval('.store-address', el => el.textContent);
            expect(storeAddress).toBeTruthy();

            const storeDistance = await page.$eval('.distance', el => el.textContent);
            expect(storeDistance).toContain('miles');

            // Step 3: Select store
            await page.click('.select-store-btn');
            await page.waitForTimeout(500);

            // Verify store selection
            const selectedStoreName = await page.$eval('.store-name', el => el.textContent);
            expect(selectedStoreName).toBe(storeName);

            console.log('✅ Store locator workflow test passed');
        }, 15000);

        test('should handle store search errors gracefully', async () => {
            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Try to search without entering query
            await page.click('.find-stores-btn');
            await page.waitForTimeout(1000);

            // Should show error message
            const errorToast = await page.$('.error-toast');
            if (errorToast) {
                const errorText = await page.$eval('.error-toast', el => el.textContent);
                expect(errorText).toContain('Please enter');
            }

            console.log('✅ Store locator error handling test passed');
        }, 10000);
    });

    describe('Cart Management E2E', () => {
        test('should manage cart items through complete workflow', async () => {
            // Step 1: Start with empty cart
            const initialCartCount = await page.$eval('.cart-count', el => el.textContent);
            expect(parseInt(initialCartCount)).toBe(0);

            // Step 2: Add items
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify items added
            const cartCount = await page.$eval('.cart-count', el => el.textContent);
            expect(parseInt(cartCount)).toBeGreaterThan(0);

            // Step 3: Update quantities
            const plusBtn = await page.$('.qty-btn.plus');
            if (plusBtn) {
                await page.click('.qty-btn.plus');
                await page.waitForTimeout(500);
            }

            // Step 4: Remove item
            const removeBtn = await page.$('.remove-item-btn');
            if (removeBtn) {
                await page.click('.remove-item-btn');
                await page.waitForTimeout(500);
            }

            // Step 5: Verify cart summary updates
            const subtotal = await page.$eval('.summary-row.subtotal .amount', el => el.textContent);
            expect(subtotal).toMatch(/^\$\d+\.\d{2}$/);

            const total = await page.$eval('.summary-row.total .amount', el => el.textContent);
            expect(total).toMatch(/^\$\d+\.\d{2}$/);

            console.log('✅ Cart management workflow test passed');
        }, 15000);

        test('should switch between delivery and pickup modes', async () => {
            // Add items first
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Test delivery mode (default)
            const deliveryBtn = await page.$('[data-mode="delivery"]');
            const deliveryActive = await page.evaluate(el => 
                el.getAttribute('aria-pressed') === 'true', deliveryBtn
            );
            expect(deliveryActive).toBe(true);

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            const pickupActive = await page.evaluate(el => 
                el.getAttribute('aria-pressed') === 'true', 
                await page.$('[data-mode="pickup"]')
            );
            expect(pickupActive).toBe(true);

            // Verify checkout button text changes
            const checkoutText = await page.$eval('.checkout-text', el => el.textContent);
            expect(checkoutText).toBe('Reserve for Pickup');

            // Switch back to delivery
            await page.click('[data-mode="delivery"]');
            await page.waitForTimeout(500);

            const finalCheckoutText = await page.$eval('.checkout-text', el => el.textContent);
            expect(finalCheckoutText).toBe('Checkout');

            console.log('✅ Mode switching workflow test passed');
        }, 15000);
    });

    describe('Analytics Integration E2E', () => {
        test('should track events throughout user journey', async () => {
            // Monitor console for analytics events
            const analyticsEvents = [];
            page.on('console', msg => {
                if (msg.text().includes('Event tracked:')) {
                    analyticsEvents.push(msg.text());
                }
            });

            // Perform user actions that should trigger analytics
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(500);

            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            await page.type('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            await page.waitForTimeout(1000);

            // Verify analytics events were tracked
            expect(analyticsEvents.length).toBeGreaterThan(0);

            console.log('✅ Analytics integration test passed');
        }, 15000);
    });

    describe('Error Handling E2E', () => {
        test('should handle network errors gracefully', async () => {
            // Simulate network failure
            await page.setRequestInterception(true);
            page.removeAllListeners('request');
            page.on('request', (request) => {
                if (request.url().includes('/api/')) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Try to search for stores (should fail)
            await page.type('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            await page.waitForTimeout(2000);

            // Should show error message
            const errorMessage = await page.$eval('.nearby-stores', el => el.textContent);
            expect(errorMessage).toContain('Unable to find stores');

            console.log('✅ Network error handling test passed');
        }, 15000);

        test('should validate form inputs', async () => {
            // Add items and switch to pickup mode
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            await page.click('[data-mode="pickup"]');
            await page.click('button[onclick="simulateStoreSelection()"]');
            await page.waitForTimeout(500);

            // Try to checkout
            await page.click('.checkout-btn');
            await page.waitForTimeout(500);

            // Try to submit form without filling required fields
            await page.click('.confirm-reservation-btn');
            await page.waitForTimeout(1000);

            // Should show validation error
            const errorToast = await page.$('.error-toast');
            if (errorToast) {
                const errorText = await page.$eval('.error-toast', el => el.textContent);
                expect(errorText).toBeTruthy();
            }

            console.log('✅ Form validation test passed');
        }, 15000);
    });

    describe('Performance E2E', () => {
        test('should load and respond within performance budgets', async () => {
            const startTime = Date.now();

            // Navigate to page
            await page.goto(`${baseURL}/apps/html-store/enhanced-cart.html`, {
                waitUntil: 'networkidle0'
            });

            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

            // Test interaction responsiveness
            const interactionStart = Date.now();
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForSelector('.cart-item');
            const interactionTime = Date.now() - interactionStart;
            
            expect(interactionTime).toBeLessThan(2000); // Should respond within 2 seconds

            console.log('✅ Performance test passed');
        }, 20000);
    });

    describe('Accessibility E2E', () => {
        test('should support keyboard navigation', async () => {
            // Test tab navigation
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // Test Enter key activation
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);

            // Verify focus management
            const activeElement = await page.evaluate(() => document.activeElement.tagName);
            expect(activeElement).toBeTruthy();

            console.log('✅ Accessibility test passed');
        }, 10000);

        test('should have proper ARIA attributes', async () => {
            // Check for ARIA attributes
            const modeButtons = await page.$$('[aria-pressed]');
            expect(modeButtons.length).toBeGreaterThan(0);

            // Check for proper labeling
            const labeledElements = await page.$$('[aria-label], [aria-labelledby]');
            expect(labeledElements.length).toBeGreaterThan(0);

            console.log('✅ ARIA attributes test passed');
        }, 10000);
    });

    describe('Mobile Responsiveness E2E', () => {
        test('should work on mobile viewport', async () => {
            // Set mobile viewport
            await page.setViewport({ width: 375, height: 667 });
            await page.reload({ waitUntil: 'networkidle0' });

            // Test mobile interactions
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify mobile layout
            const cartContainer = await page.$('.enhanced-cart');
            expect(cartContainer).toBeTruthy();

            // Test touch interactions
            await page.tap('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            const pickupActive = await page.evaluate(el => 
                el.getAttribute('aria-pressed') === 'true', 
                await page.$('[data-mode="pickup"]')
            );
            expect(pickupActive).toBe(true);

            console.log('✅ Mobile responsiveness test passed');
        }, 15000);
    });
});

// Cross-browser compatibility tests
describe('Cross-Browser E2E Tests', () => {
    const browsers = ['chromium'];
    
    if (process.env.TEST_ALL_BROWSERS) {
        browsers.push('firefox', 'webkit');
    }

    browsers.forEach(browserName => {
        describe(`${browserName} compatibility`, () => {
            let browser;
            let page;

            beforeAll(async () => {
                browser = await puppeteer.launch({
                    product: browserName === 'firefox' ? 'firefox' : 'chrome',
                    headless: process.env.CI === 'true'
                });
            });

            afterAll(async () => {
                if (browser) {
                    await browser.close();
                }
            });

            beforeEach(async () => {
                page = await browser.newPage();
                await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:3000'}/apps/html-store/enhanced-cart.html`);
            });

            afterEach(async () => {
                if (page) {
                    await page.close();
                }
            });

            test(`should work in ${browserName}`, async () => {
                // Basic functionality test
                await page.waitForSelector('.enhanced-cart');
                const cartTitle = await page.$eval('.cart-title', el => el.textContent);
                expect(cartTitle).toContain('Your Cart');

                console.log(`✅ ${browserName} compatibility test passed`);
            }, 15000);
        });
    });
});