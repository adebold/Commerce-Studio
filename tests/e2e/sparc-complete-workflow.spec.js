/**
 * SPARC Complete Workflow E2E Tests - Testing Agent Implementation
 * SPARC Phase 4 - Days 18-19
 * 
 * End-to-end testing for complete SPARC user journeys using Playwright
 */

const { test, expect } = require('@playwright/test');

// Test data and utilities
const testData = {
    customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567'
    },
    store: {
        searchQuery: '10001',
        expectedStores: [
            {
                name: 'VARAi Downtown',
                address: '123 Main St, Downtown, NY 10001',
                distance: '0.8 miles'
            }
        ]
    },
    frames: [
        {
            id: 'frame-1',
            name: 'Classic Aviator',
            price: 149.99
        },
        {
            id: 'frame-2',
            name: 'Modern Rectangle',
            price: 199.99
        }
    ]
};

// Setup API mocking
async function setupAPIMocks(page) {
    await page.route('**/api/v1/stores/nearby**', async route => {
        await route.fulfill({
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
                        services: ['bopis', 'eye-exam', 'repairs'],
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
    });

    await page.route('**/api/v1/stores/*/inventory**', async route => {
        await route.fulfill({
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
    });

    await page.route('**/api/v1/reservations', async route => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'res-' + Date.now(),
                    confirmation_number: 'VAR' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                    store_id: 'store-1',
                    customer_name: testData.customer.name,
                    customer_email: testData.customer.email,
                    customer_phone: testData.customer.phone,
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
        }
    });

    await page.route('**/api/v1/virtual-try-on**', async route => {
        await route.fulfill({
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
    });

    await page.route('**/api/v1/analytics/**', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
        });
    });
}

test.describe('SPARC Complete Workflow E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await setupAPIMocks(page);
        await page.goto('/apps/html-store/enhanced-cart.html');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Complete BOPIS Journey', () => {
        test('should complete full BOPIS reservation from empty cart to confirmation', async ({ page }) => {
            // Step 1: Verify initial empty cart state
            await expect(page.locator('.cart-count')).toHaveText('0');
            await expect(page.locator('.empty-cart')).toBeVisible();

            // Step 2: Add items to cart
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify items were added
            await expect(page.locator('.cart-count')).not.toHaveText('0');
            await expect(page.locator('.cart-items-list .cart-item')).toHaveCount(2);
            await expect(page.locator('.empty-cart')).not.toBeVisible();

            // Step 3: Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Verify pickup mode activation
            await expect(page.locator('[data-mode="pickup"]')).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('[data-mode="delivery"]')).toHaveAttribute('aria-pressed', 'false');
            await expect(page.locator('.store-selection-panel')).toBeVisible();
            await expect(page.locator('.checkout-text')).toHaveText('Reserve for Pickup');

            // Step 4: Search for stores
            await page.fill('.store-search-input', testData.store.searchQuery);
            await page.click('.find-stores-btn');

            // Wait for stores to load and verify
            await expect(page.locator('.store-option')).toHaveCount(2);
            await expect(page.locator('.store-option').first().locator('h4')).toHaveText('VARAi Downtown');
            await expect(page.locator('.store-option').first().locator('.store-address')).toContainText('123 Main St');
            await expect(page.locator('.store-option').first().locator('.distance')).toContainText('0.8 miles');

            // Step 5: Select the first store
            await page.click('.store-option .select-store-btn');
            await page.waitForTimeout(500);

            // Verify store selection
            await expect(page.locator('.current-store')).toBeVisible();
            await expect(page.locator('.store-name')).toHaveText('VARAi Downtown');
            await expect(page.locator('.store-distance')).toContainText('0.8 miles away');

            // Step 6: Verify checkout button is enabled
            await expect(page.locator('.checkout-btn')).toBeEnabled();

            // Step 7: Proceed to checkout
            await page.click('.checkout-btn');
            await page.waitForTimeout(500);

            // Verify BOPIS panel is displayed
            await expect(page.locator('.bopis-panel')).toBeVisible();
            await expect(page.locator('.reservation-form h3')).toContainText('Reserve for Pickup');

            // Step 8: Fill reservation form
            await page.selectOption('.pickup-time-select', '2024-01-15T14:00:00');
            await page.fill('.customer-name', testData.customer.name);
            await page.fill('.customer-email', testData.customer.email);
            await page.fill('.customer-phone', testData.customer.phone);

            // Step 9: Submit reservation
            await page.click('.confirm-reservation-btn');

            // Wait for success modal
            await expect(page.locator('.reservation-success-modal')).toBeVisible({ timeout: 10000 });

            // Verify success modal content
            await expect(page.locator('.reservation-success-modal h3')).toHaveText('Reservation Confirmed!');
            
            // Verify confirmation number format
            const confirmationNumber = await page.locator('.reservation-success-modal').textContent();
            expect(confirmationNumber).toMatch(/VAR[A-Z0-9]{8}/);

            // Step 10: Close success modal
            await page.click('.close-modal-btn');
            await page.waitForTimeout(500);

            // Verify cart is cleared
            await expect(page.locator('.cart-count')).toHaveText('0');
            await expect(page.locator('.empty-cart')).toBeVisible();
        });

        test('should handle BOPIS workflow with inventory validation', async ({ page }) => {
            // Add items to cart
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Search and select store
            await page.fill('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            await expect(page.locator('.store-option')).toHaveCount(2);
            await page.click('.select-store-btn');

            // Verify inventory status is displayed for each item
            const availabilityElements = page.locator('.item-availability');
            await expect(availabilityElements).toHaveCount(2);
            
            // Check that at least one item shows availability
            await expect(availabilityElements.first()).toContainText('Available for pickup');
        });

        test('should prevent checkout without store selection in pickup mode', async ({ page }) => {
            // Add items to cart
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Verify checkout button is disabled without store selection
            await expect(page.locator('.checkout-btn')).toBeDisabled();
            await expect(page.locator('.checkout-btn')).toHaveAttribute('title', 'Select a store for pickup');
        });
    });

    test.describe('VTO Integration Journey', () => {
        test('should complete VTO session and integrate with cart', async ({ page }) => {
            // Step 1: Start VTO session
            await page.click('button[onclick="addVTOSession()"]');
            await page.waitForTimeout(1000);

            // Verify VTO session is displayed
            await expect(page.locator('.vto-summary')).toBeVisible();
            await expect(page.locator('.vto-sessions-list .vto-session')).toHaveCount(1);

            // Verify VTO session details
            await expect(page.locator('.session-details h5')).toContainText('Designer Cat-Eye');
            await expect(page.locator('.confidence-value')).toContainText('92%');

            // Step 2: View VTO session
            await page.click('.view-session-btn');
            await page.waitForTimeout(500);

            // Step 3: Add items to cart with VTO context
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify VTO integration in cart items
            await expect(page.locator('.vto-badge')).toBeVisible();
            await expect(page.locator('.vto-confidence')).toContainText('87% fit confidence');
        });

        test('should integrate VTO with BOPIS workflow', async ({ page }) => {
            // Add VTO session
            await page.click('button[onclick="addVTOSession()"]');
            await page.waitForTimeout(1000);

            // Add items to cart
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Complete store selection
            await page.fill('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            await expect(page.locator('.store-option')).toHaveCount(2);
            await page.click('.select-store-btn');

            // Verify both VTO and store data are preserved
            await expect(page.locator('.vto-summary')).toBeVisible();
            await expect(page.locator('.current-store')).toBeVisible();
            await expect(page.locator('.vto-badge')).toBeVisible();

            // Proceed to checkout
            await page.click('.checkout-btn');
            await page.waitForTimeout(500);

            // Verify BOPIS panel shows with VTO context preserved
            await expect(page.locator('.bopis-panel')).toBeVisible();
            await expect(page.locator('.vto-summary')).toBeVisible();
        });
    });

    test.describe('Store Locator Journey', () => {
        test('should search, filter, and select stores with detailed validation', async ({ page }) => {
            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Step 1: Search for stores
            await page.fill('.store-search-input', 'New York');
            await page.click('.find-stores-btn');

            // Wait for loading state
            await expect(page.locator('.nearby-stores .loading')).toBeVisible();
            
            // Wait for results
            await expect(page.locator('.store-option')).toHaveCount(2);

            // Step 2: Verify store information details
            const firstStore = page.locator('.store-option').first();
            await expect(firstStore.locator('h4')).toHaveText('VARAi Downtown');
            await expect(firstStore.locator('.store-address')).toHaveText('123 Main St, Downtown, NY 10001');
            await expect(firstStore.locator('.distance')).toContainText('0.8 miles');
            await expect(firstStore.locator('.hours.open')).toContainText('Open');

            // Step 3: Select store and verify selection
            await firstStore.locator('.select-store-btn').click();
            await page.waitForTimeout(500);

            // Verify store selection UI changes
            await expect(page.locator('.current-store')).toBeVisible();
            await expect(page.locator('.store-search')).not.toBeVisible();
            await expect(page.locator('.store-name')).toHaveText('VARAi Downtown');
            await expect(page.locator('.store-distance')).toContainText('0.8 miles away');

            // Step 4: Test change store functionality
            await page.click('.change-store-btn');
            await page.waitForTimeout(500);

            await expect(page.locator('.current-store')).not.toBeVisible();
            await expect(page.locator('.store-search')).toBeVisible();
        });

        test('should handle empty search query gracefully', async ({ page }) => {
            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Try to search without entering query
            await page.click('.find-stores-btn');
            await page.waitForTimeout(1000);

            // Should show error message
            await expect(page.locator('.error-toast')).toBeVisible();
            await expect(page.locator('.error-toast')).toContainText('Please enter a ZIP code or city');
        });

        test('should handle no stores found scenario', async ({ page }) => {
            // Mock empty response
            await page.route('**/api/v1/stores/nearby**', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ stores: [] })
                });
            });

            // Switch to pickup mode and search
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            await page.fill('.store-search-input', '99999');
            await page.click('.find-stores-btn');
            await page.waitForTimeout(1000);

            // Should show no stores message
            await expect(page.locator('.no-stores')).toBeVisible();
            await expect(page.locator('.no-stores')).toContainText('No stores found in your area');
        });
    });

    test.describe('Cart Management Journey', () => {
        test('should manage cart items through complete lifecycle', async ({ page }) => {
            // Step 1: Start with empty cart
            await expect(page.locator('.cart-count')).toHaveText('0');
            await expect(page.locator('.empty-cart')).toBeVisible();

            // Step 2: Add items
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify items added
            await expect(page.locator('.cart-count')).toHaveText('2');
            await expect(page.locator('.cart-items-list .cart-item')).toHaveCount(2);
            await expect(page.locator('.empty-cart')).not.toBeVisible();

            // Step 3: Verify item details
            const firstItem = page.locator('.cart-item').first();
            await expect(firstItem.locator('.item-name')).toHaveText('Classic Aviator');
            await expect(firstItem.locator('.item-sku')).toContainText('SKU: AVT-001');
            await expect(firstItem.locator('.quantity')).toHaveText('1');

            // Step 4: Update quantity
            await firstItem.locator('.qty-btn.plus').click();
            await page.waitForTimeout(500);
            await expect(firstItem.locator('.quantity')).toHaveText('2');

            // Step 5: Decrease quantity
            await firstItem.locator('.qty-btn.minus').click();
            await page.waitForTimeout(500);
            await expect(firstItem.locator('.quantity')).toHaveText('1');

            // Step 6: Remove item
            await firstItem.locator('.remove-item-btn').click();
            await page.waitForTimeout(500);
            await expect(page.locator('.cart-items-list .cart-item')).toHaveCount(1);
            await expect(page.locator('.cart-count')).toHaveText('1');

            // Step 7: Verify cart summary updates
            await expect(page.locator('.summary-row.subtotal .amount')).toMatch(/^\$\d+\.\d{2}$/);
            await expect(page.locator('.summary-row.tax .amount')).toMatch(/^\$\d+\.\d{2}$/);
            await expect(page.locator('.summary-row.total .amount')).toMatch(/^\$\d+\.\d{2}$/);
        });

        test('should switch between delivery and pickup modes seamlessly', async ({ page }) => {
            // Add items first
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify initial delivery mode
            await expect(page.locator('[data-mode="delivery"]')).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('[data-mode="pickup"]')).toHaveAttribute('aria-pressed', 'false');
            await expect(page.locator('.checkout-text')).toHaveText('Checkout');
            await expect(page.locator('.store-selection-panel')).not.toBeVisible();
            await expect(page.locator('.summary-row.shipping')).toBeVisible();

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Verify pickup mode changes
            await expect(page.locator('[data-mode="pickup"]')).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('[data-mode="delivery"]')).toHaveAttribute('aria-pressed', 'false');
            await expect(page.locator('.checkout-text')).toHaveText('Reserve for Pickup');
            await expect(page.locator('.store-selection-panel')).toBeVisible();
            await expect(page.locator('.summary-row.shipping')).not.toBeVisible();

            // Switch back to delivery
            await page.click('[data-mode="delivery"]');
            await page.waitForTimeout(500);

            // Verify return to delivery mode
            await expect(page.locator('[data-mode="delivery"]')).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('[data-mode="pickup"]')).toHaveAttribute('aria-pressed', 'false');
            await expect(page.locator('.checkout-text')).toHaveText('Checkout');
            await expect(page.locator('.store-selection-panel')).not.toBeVisible();
            await expect(page.locator('.summary-row.shipping')).toBeVisible();
        });

        test('should calculate cart totals correctly', async ({ page }) => {
            // Add items
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Get initial totals
            const subtotalText = await page.locator('.summary-row.subtotal .amount').textContent();
            const taxText = await page.locator('.summary-row.tax .amount').textContent();
            const shippingText = await page.locator('.summary-row.shipping .amount').textContent();
            const totalText = await page.locator('.summary-row.total .amount').textContent();

            // Parse amounts
            const subtotal = parseFloat(subtotalText.replace('$', ''));
            const tax = parseFloat(taxText.replace('$', ''));
            const shipping = parseFloat(shippingText.replace('$', ''));
            const total = parseFloat(totalText.replace('$', ''));

            // Verify calculations
            expect(tax).toBeCloseTo(subtotal * 0.08, 2); // 8% tax
            expect(total).toBeCloseTo(subtotal + tax + shipping, 2);

            // Switch to pickup mode and verify shipping is removed
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            const newTotalText = await page.locator('.summary-row.total .amount').textContent();
            const newTotal = parseFloat(newTotalText.replace('$', ''));
            expect(newTotal).toBeCloseTo(subtotal + tax, 2); // No shipping in pickup mode
        });
    });

    test.describe('Error Handling and Edge Cases', () => {
        test('should handle network errors gracefully', async ({ page }) => {
            // Simulate network failure for store search
            await page.route('**/api/v1/stores/nearby**', async route => {
                await route.abort();
            });

            // Switch to pickup mode
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);

            // Try to search for stores
            await page.fill('.store-search-input', '10001');
            await page.click('.find-stores-btn');
            await page.waitForTimeout(2000);

            // Should show error message
            await expect(page.locator('.nearby-stores')).toContainText('Unable to find stores');
        });

        test('should validate reservation form inputs', async ({ page }) => {
            // Add items and setup for BOPIS
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            await page.click('[data-mode="pickup"]');
            await page.click('button[onclick="simulateStoreSelection()"]');
            await page.waitForTimeout(500);

            // Go to checkout
            await page.click('.checkout-btn');
            await page.waitForTimeout(500);

            // Try to submit form without required fields
            await page.click('.confirm-reservation-btn');
            await page.waitForTimeout(1000);

            // Should show validation error
            await expect(page.locator('.error-toast')).toBeVisible();
            await expect(page.locator('.error-toast')).toContainText('Please select a pickup time');
        });

        test('should handle reservation creation failure', async ({ page }) => {
            // Mock reservation failure
            await page.route('**/api/v1/reservations', async route => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 500,
                        contentType: 'application/json',
                        body: JSON.stringify({ error: 'Reservation failed' })
                    });
                }
            });

            // Complete setup for BOPIS
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            await page.click('[data-mode="pickup"]');
            await page.click('button[onclick="simulateStoreSelection()"]');
            await page.waitForTimeout(500);

            await page.click('.checkout-btn');
            await page.waitForTimeout(500);

            // Fill form
            await page.selectOption('.pickup-time-select', '2024-01-15T14:00:00');
            await page.fill('.customer-name', testData.customer.name);
            await page.fill('.customer-email', testData.customer.email);
            await page.fill('.customer-phone', testData.customer.phone);

            // Submit and expect error
            await page.click('.confirm-reservation-btn');
            await page.waitForTimeout(2000);

            await expect(page.locator('.error-toast')).toBeVisible();
            await expect(page.locator('.error-toast')).toContainText('Failed to create reservation');
        });
    });

    test.describe('Performance and Accessibility', () => {
        test('should load within performance budget', async ({ page }) => {
            const startTime = Date.now();

            await page.goto('/apps/html-store/enhanced-cart.html');
            await page.waitForLoadState('networkidle');

            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

            // Test interaction responsiveness
            const interactionStart = Date.now();
            await page.click('button[onclick="addSampleItems()"]');
            await expect(page.locator('.cart-item')).toHaveCount(2);
            const interactionTime = Date.now() - interactionStart;

            expect(interactionTime).toBeLessThan(2000); // Should respond within 2 seconds
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Test tab navigation through interactive elements
            await page.keyboard.press('Tab'); // First mode button
            await expect(page.locator('[data-mode="delivery"]')).toBeFocused();

            await page.keyboard.press('Tab'); // Second mode button
            await expect(page.locator('[data-mode="pickup"]')).toBeFocused();

            // Test Enter key activation
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            await expect(page.locator('[data-mode="pickup"]')).toHaveAttribute('aria-pressed', 'true');
        });

        test('should have proper ARIA attributes', async ({ page }) => {
            // Check mode buttons have aria-pressed
            await expect(page.locator('[data-mode="delivery"]')).toHaveAttribute('aria-pressed', 'true');
            await expect(page.locator('[data-mode="pickup"]')).toHaveAttribute('aria-pressed', 'false');

            // Check checkout button has proper title when disabled
            await page.click('[data-mode="pickup"]');
            await page.waitForTimeout(500);
            await expect(page.locator('.checkout-btn')).toHaveAttribute('title', 'Select a store for pickup');
        });
    });

    test.describe('Mobile Responsiveness', () => {
        test('should work correctly on mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload({ waitUntil: 'networkidle' });

            // Test mobile interactions
            await page.click('button[onclick="addSampleItems()"]');
            await page.waitForTimeout(1000);

            // Verify mobile layout
            await expect(page.locator('.enhanced-cart')).toBeVisible();
            await expect(page.locator('.cart-items-list .cart-item')).toHaveCount(2);

            // Test touch interactions
            await page.tap('[data-mode="pickup"]');
            await page.waitForTimeout(500);
            await expect(page.locator('[data-mode="pickup"]')).toHaveAttribute('aria-pressed', 'true');

            // Test mobile store search
            await page.fill('.store-search-input', '10001');
            await page.tap('.find-stores-btn');
            await expect(page.locator('.store-option')).toHaveCount(2);
        });
    });
});