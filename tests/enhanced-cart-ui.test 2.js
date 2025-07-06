/**
 * Enhanced Cart UI Test Suite - Testing Agent Implementation
 * SPARC Phase 4 - Days 18-19
 * 
 * Comprehensive test coverage for all enhanced cart functionality
 */

// Test framework setup (using Jest-like syntax)
const { describe, test, expect, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock DOM environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;

// Import the class under test
const EnhancedCartUI = require('../apps/html-store/js/enhanced-cart-ui.js');

describe('Enhanced Cart UI', () => {
    let cartUI;
    let mockCartManager;
    let mockStoreLocator;
    let mockVTOIntegration;
    let mockBOPISManager;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '<div class="cart-container"></div>';
        
        // Create mock services
        mockCartManager = {
            getItems: jest.fn(() => []),
            addItem: jest.fn(),
            updateQuantity: jest.fn(),
            removeItem: jest.fn(),
            clearCart: jest.fn()
        };
        
        mockStoreLocator = {
            searchStores: jest.fn(() => Promise.resolve([
                {
                    id: 'store-1',
                    name: 'Test Store',
                    address: '123 Test St',
                    distance: 1.5,
                    isOpen: true,
                    services: ['bopis']
                }
            ]))
        };
        
        mockVTOIntegration = {
            displaySession: jest.fn()
        };
        
        mockBOPISManager = {
            createReservation: jest.fn(() => Promise.resolve({
                id: 'res-123',
                confirmationNumber: 'VAR12345',
                pickupTime: '2024-01-15T14:00:00',
                status: 'confirmed'
            }))
        };
        
        // Set up global mocks
        global.window.cartManager = mockCartManager;
        global.window.storeLocator = mockStoreLocator;
        global.window.vtoCartIntegration = mockVTOIntegration;
        global.window.bopisManager = mockBOPISManager;
        
        // Initialize cart UI
        cartUI = new EnhancedCartUI();
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should create enhanced cart HTML structure', () => {
            const cartContainer = document.querySelector('.enhanced-cart');
            expect(cartContainer).toBeTruthy();
            
            // Check for key elements
            expect(document.querySelector('.cart-header')).toBeTruthy();
            expect(document.querySelector('.cart-mode-toggle')).toBeTruthy();
            expect(document.querySelector('.store-selection-panel')).toBeTruthy();
            expect(document.querySelector('.cart-items')).toBeTruthy();
            expect(document.querySelector('.cart-summary')).toBeTruthy();
            expect(document.querySelector('.cart-actions')).toBeTruthy();
        });

        test('should initialize with delivery mode by default', () => {
            const deliveryBtn = document.querySelector('[data-mode="delivery"]');
            const pickupBtn = document.querySelector('[data-mode="pickup"]');
            
            expect(deliveryBtn.getAttribute('aria-pressed')).toBe('true');
            expect(pickupBtn.getAttribute('aria-pressed')).toBe('false');
            expect(cartUI.reservationMode).toBe(false);
        });

        test('should bind event listeners', () => {
            const modeButtons = document.querySelectorAll('.mode-btn');
            expect(modeButtons.length).toBe(2);
            
            const findStoresBtn = document.querySelector('.find-stores-btn');
            expect(findStoresBtn).toBeTruthy();
            
            const checkoutBtn = document.querySelector('.checkout-btn');
            expect(checkoutBtn).toBeTruthy();
        });
    });

    describe('Mode Toggle', () => {
        test('should switch to pickup mode', () => {
            const pickupBtn = document.querySelector('[data-mode="pickup"]');
            pickupBtn.click();
            
            expect(cartUI.reservationMode).toBe(true);
            expect(pickupBtn.getAttribute('aria-pressed')).toBe('true');
            
            const storePanel = document.querySelector('.store-selection-panel');
            expect(storePanel.style.display).toBe('block');
        });

        test('should switch back to delivery mode', () => {
            // First switch to pickup
            const pickupBtn = document.querySelector('[data-mode="pickup"]');
            pickupBtn.click();
            
            // Then switch back to delivery
            const deliveryBtn = document.querySelector('[data-mode="delivery"]');
            deliveryBtn.click();
            
            expect(cartUI.reservationMode).toBe(false);
            expect(deliveryBtn.getAttribute('aria-pressed')).toBe('true');
            
            const storePanel = document.querySelector('.store-selection-panel');
            expect(storePanel.style.display).toBe('none');
        });

        test('should update checkout button text based on mode', () => {
            const checkoutBtn = document.querySelector('.checkout-btn');
            const checkoutText = checkoutBtn.querySelector('.checkout-text');
            
            // Initially should be "Checkout"
            expect(checkoutText.textContent).toBe('Checkout');
            
            // Switch to pickup mode
            const pickupBtn = document.querySelector('[data-mode="pickup"]');
            pickupBtn.click();
            
            expect(checkoutText.textContent).toBe('Reserve for Pickup');
        });
    });

    describe('Store Selection', () => {
        test('should search for nearby stores', async () => {
            const searchInput = document.querySelector('.store-search-input');
            const findStoresBtn = document.querySelector('.find-stores-btn');
            
            searchInput.value = '10001';
            findStoresBtn.click();
            
            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(mockStoreLocator.searchStores).toHaveBeenCalledWith({
                query: '10001',
                services: ['bopis'],
                limit: 5
            });
        });

        test('should display nearby stores', async () => {
            await cartUI.findNearbyStores();
            
            // Wait for stores to be displayed
            await new Promise(resolve => setTimeout(resolve, 0));
            
            const storeOptions = document.querySelectorAll('.store-option');
            expect(storeOptions.length).toBe(1);
            
            const storeName = document.querySelector('.store-option h4');
            expect(storeName.textContent).toBe('Test Store');
        });

        test('should select a store', () => {
            const testStore = {
                id: 'store-1',
                name: 'Test Store',
                address: '123 Test St',
                distance: 1.5,
                isOpen: true
            };
            
            cartUI.selectStore(testStore);
            
            expect(cartUI.currentStore).toEqual(testStore);
            
            const currentStoreDiv = document.querySelector('.current-store');
            expect(currentStoreDiv.style.display).toBe('block');
            
            const storeName = document.querySelector('.store-name');
            expect(storeName.textContent).toBe('Test Store');
        });

        test('should show error for empty search', async () => {
            const searchInput = document.querySelector('.store-search-input');
            searchInput.value = '';
            
            const showErrorSpy = jest.spyOn(cartUI, 'showError');
            await cartUI.findNearbyStores();
            
            expect(showErrorSpy).toHaveBeenCalledWith('Please enter a ZIP code or city');
        });
    });

    describe('Cart Items Management', () => {
        const sampleItems = [
            {
                id: 'item-1',
                name: 'Test Frame',
                sku: 'TF-001',
                price: 99.99,
                quantity: 1,
                image: 'test-image.jpg'
            }
        ];

        test('should display cart items', () => {
            mockCartManager.getItems.mockReturnValue(sampleItems);
            
            cartUI.updateCartDisplay();
            
            const cartItemsList = document.querySelector('.cart-items-list');
            expect(cartItemsList.children.length).toBe(1);
            
            const itemName = document.querySelector('.item-name');
            expect(itemName.textContent).toBe('Test Frame');
        });

        test('should show empty cart state', () => {
            mockCartManager.getItems.mockReturnValue([]);
            
            cartUI.updateCartDisplay();
            
            const emptyCart = document.querySelector('.empty-cart');
            expect(emptyCart.style.display).toBe('block');
            
            const cartItemsList = document.querySelector('.cart-items-list');
            expect(cartItemsList.innerHTML).toBe('');
        });

        test('should update item quantity', () => {
            cartUI.updateItemQuantity('item-1', 'increase');
            expect(mockCartManager.updateQuantity).toHaveBeenCalledWith('item-1', 1);
            
            cartUI.updateItemQuantity('item-1', 'decrease');
            expect(mockCartManager.updateQuantity).toHaveBeenCalledWith('item-1', -1);
        });

        test('should remove item from cart', () => {
            cartUI.removeItem('item-1');
            expect(mockCartManager.removeItem).toHaveBeenCalledWith('item-1');
        });

        test('should update cart count', () => {
            mockCartManager.getItems.mockReturnValue(sampleItems);
            
            cartUI.updateCartDisplay();
            
            const cartCount = document.querySelector('.cart-count');
            expect(cartCount.textContent).toBe('1');
        });
    });

    describe('VTO Integration', () => {
        const vtoSession = {
            sessionId: 'vto-123',
            frameName: 'VTO Frame',
            frameImage: 'vto-frame.jpg',
            confidence: 85
        };

        test('should handle VTO session data', () => {
            cartUI.handleVTOSession(vtoSession);
            
            expect(cartUI.vtoSessions.has('vto-123')).toBe(true);
            expect(cartUI.vtoSessions.get('vto-123')).toEqual(vtoSession);
        });

        test('should display VTO sessions', () => {
            cartUI.vtoSessions.set('vto-123', vtoSession);
            cartUI.updateVTODisplay();
            
            const vtoSummary = document.querySelector('.vto-summary');
            expect(vtoSummary.style.display).toBe('block');
            
            const sessionsList = document.querySelector('.vto-sessions-list');
            expect(sessionsList.children.length).toBe(1);
        });

        test('should view VTO session', () => {
            cartUI.vtoSessions.set('vto-123', vtoSession);
            cartUI.viewVTOSession('vto-123');
            
            expect(mockVTOIntegration.displaySession).toHaveBeenCalledWith(vtoSession);
        });
    });

    describe('Cart Summary', () => {
        const sampleItems = [
            { id: 'item-1', price: 100, quantity: 2 },
            { id: 'item-2', price: 50, quantity: 1 }
        ];

        test('should calculate cart totals correctly', () => {
            mockCartManager.getItems.mockReturnValue(sampleItems);
            
            cartUI.updateCartSummary();
            
            const subtotalAmount = document.querySelector('.summary-row.subtotal .amount');
            expect(subtotalAmount.textContent).toBe('$250.00');
            
            const taxAmount = document.querySelector('.summary-row.tax .amount');
            expect(taxAmount.textContent).toBe('$20.00'); // 8% tax
            
            const totalAmount = document.querySelector('.summary-row.total .amount');
            expect(totalAmount.textContent).toBe('$279.99'); // Including shipping
        });

        test('should hide shipping for pickup mode', () => {
            cartUI.reservationMode = true;
            mockCartManager.getItems.mockReturnValue(sampleItems);
            
            cartUI.updateCartSummary();
            
            const totalAmount = document.querySelector('.summary-row.total .amount');
            expect(totalAmount.textContent).toBe('$270.00'); // No shipping
        });
    });

    describe('BOPIS Reservation', () => {
        beforeEach(() => {
            cartUI.reservationMode = true;
            cartUI.currentStore = {
                id: 'store-1',
                name: 'Test Store'
            };
            mockCartManager.getItems.mockReturnValue([
                { id: 'item-1', name: 'Test Frame', price: 99.99, quantity: 1 }
            ]);
        });

        test('should show BOPIS panel on checkout', () => {
            cartUI.handleCheckout();
            
            const bopisPanel = document.querySelector('.bopis-panel');
            expect(bopisPanel.style.display).toBe('block');
        });

        test('should populate pickup times', () => {
            cartUI.populatePickupTimes();
            
            const pickupSelect = document.querySelector('.pickup-time-select');
            expect(pickupSelect.children.length).toBeGreaterThan(1);
        });

        test('should validate reservation form', () => {
            const validData = {
                pickupTime: '2024-01-15T14:00:00',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '555-1234'
            };
            
            expect(cartUI.validateReservationForm(validData)).toBe(true);
            
            const invalidData = {
                pickupTime: '',
                customerName: '',
                customerEmail: '',
                customerPhone: ''
            };
            
            expect(cartUI.validateReservationForm(invalidData)).toBe(false);
        });

        test('should create reservation successfully', async () => {
            // Set up form data
            document.querySelector('.pickup-time-select').value = '2024-01-15T14:00:00';
            document.querySelector('.customer-name').value = 'John Doe';
            document.querySelector('.customer-email').value = 'john@example.com';
            document.querySelector('.customer-phone').value = '555-1234';
            
            await cartUI.confirmReservation();
            
            expect(mockBOPISManager.createReservation).toHaveBeenCalledWith({
                storeId: 'store-1',
                items: [{ id: 'item-1', name: 'Test Frame', price: 99.99, quantity: 1 }],
                pickupTime: '2024-01-15T14:00:00',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerPhone: '555-1234'
            });
        });
    });

    describe('Checkout Button State', () => {
        test('should disable checkout when cart is empty', () => {
            mockCartManager.getItems.mockReturnValue([]);
            
            cartUI.updateCheckoutButton();
            
            const checkoutBtn = document.querySelector('.checkout-btn');
            expect(checkoutBtn.disabled).toBe(true);
        });

        test('should disable checkout in pickup mode without store', () => {
            cartUI.reservationMode = true;
            cartUI.currentStore = null;
            mockCartManager.getItems.mockReturnValue([{ id: 'item-1' }]);
            
            cartUI.updateCheckoutButton();
            
            const checkoutBtn = document.querySelector('.checkout-btn');
            expect(checkoutBtn.disabled).toBe(true);
        });

        test('should enable checkout with items and store in pickup mode', () => {
            cartUI.reservationMode = true;
            cartUI.currentStore = { id: 'store-1' };
            mockCartManager.getItems.mockReturnValue([{ id: 'item-1' }]);
            
            cartUI.updateCheckoutButton();
            
            const checkoutBtn = document.querySelector('.checkout-btn');
            expect(checkoutBtn.disabled).toBe(false);
        });
    });

    describe('State Persistence', () => {
        test('should save cart state to localStorage', () => {
            const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
            
            cartUI.currentStore = { id: 'store-1', name: 'Test Store' };
            cartUI.reservationMode = true;
            
            cartUI.saveCartState();
            
            expect(mockSetItem).toHaveBeenCalledWith(
                'enhancedCartState',
                JSON.stringify({
                    currentStore: { id: 'store-1', name: 'Test Store' },
                    reservationMode: true
                })
            );
        });

        test('should load cart state from localStorage', () => {
            const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
            mockGetItem.mockReturnValue(JSON.stringify({
                currentStore: { id: 'store-1', name: 'Test Store' },
                reservationMode: true
            }));
            
            cartUI.loadCartState();
            
            expect(cartUI.currentStore).toEqual({ id: 'store-1', name: 'Test Store' });
            expect(cartUI.reservationMode).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should show error toast', () => {
            cartUI.showError('Test error message');
            
            const errorToast = document.querySelector('.error-toast');
            expect(errorToast).toBeTruthy();
            expect(errorToast.textContent).toContain('Test error message');
        });

        test('should handle store search errors gracefully', async () => {
            mockStoreLocator.searchStores.mockRejectedValue(new Error('API Error'));
            
            const searchInput = document.querySelector('.store-search-input');
            searchInput.value = '10001';
            
            await cartUI.findNearbyStores();
            
            const nearbyStores = document.querySelector('.nearby-stores');
            expect(nearbyStores.innerHTML).toContain('Unable to find stores');
        });

        test('should handle reservation creation errors', async () => {
            mockBOPISManager.createReservation.mockRejectedValue(new Error('Reservation failed'));
            
            // Set up valid form data
            document.querySelector('.pickup-time-select').value = '2024-01-15T14:00:00';
            document.querySelector('.customer-name').value = 'John Doe';
            document.querySelector('.customer-email').value = 'john@example.com';
            document.querySelector('.customer-phone').value = '555-1234';
            
            const showErrorSpy = jest.spyOn(cartUI, 'showError');
            
            await cartUI.confirmReservation();
            
            expect(showErrorSpy).toHaveBeenCalledWith('Failed to create reservation. Please try again.');
        });
    });

    describe('Accessibility', () => {
        test('should have proper ARIA attributes', () => {
            const modeButtons = document.querySelectorAll('.mode-btn');
            modeButtons.forEach(btn => {
                expect(btn.hasAttribute('aria-pressed')).toBe(true);
            });
        });

        test('should support keyboard navigation', () => {
            const checkoutBtn = document.querySelector('.checkout-btn');
            
            // Simulate keyboard focus
            checkoutBtn.focus();
            expect(document.activeElement).toBe(checkoutBtn);
        });

        test('should have descriptive button titles', () => {
            mockCartManager.getItems.mockReturnValue([]);
            cartUI.updateCheckoutButton();
            
            const checkoutBtn = document.querySelector('.checkout-btn');
            expect(checkoutBtn.title).toBe('Add items to cart');
        });
    });

    describe('Responsive Design', () => {
        test('should handle mobile viewport', () => {
            // Simulate mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375
            });
            
            const cartContainer = document.querySelector('.enhanced-cart');
            expect(cartContainer).toBeTruthy();
            
            // Mobile-specific elements should be present
            const modeToggle = document.querySelector('.cart-mode-toggle');
            expect(modeToggle).toBeTruthy();
        });
    });
});

// Integration Tests
describe('Enhanced Cart UI Integration', () => {
    let cartUI;
    
    beforeEach(() => {
        document.body.innerHTML = '<div class="cart-container"></div>';
        
        // Set up realistic mock services
        global.window.cartManager = {
            getItems: () => [
                {
                    id: 'frame-1',
                    name: 'Classic Aviator',
                    sku: 'AVT-001',
                    price: 149.99,
                    quantity: 1,
                    image: 'aviator.jpg',
                    storeInventory: {
                        'store-1': { quantity: 5 }
                    }
                }
            ],
            addItem: jest.fn(),
            updateQuantity: jest.fn(),
            removeItem: jest.fn(),
            clearCart: jest.fn()
        };
        
        global.window.storeLocator = {
            searchStores: () => Promise.resolve([
                {
                    id: 'store-1',
                    name: 'VARAi Downtown',
                    address: '123 Main St',
                    distance: 0.8,
                    isOpen: true,
                    services: ['bopis']
                }
            ])
        };
        
        global.window.vtoCartIntegration = {
            displaySession: jest.fn()
        };
        
        global.window.bopisManager = {
            createReservation: () => Promise.resolve({
                id: 'res-123',
                confirmationNumber: 'VAR12345',
                pickupTime: '2024-01-15T14:00:00',
                status: 'confirmed'
            })
        };
        
        cartUI = new EnhancedCartUI();
    });

    test('should complete full BOPIS workflow', async () => {
        // 1. Switch to pickup mode
        const pickupBtn = document.querySelector('[data-mode="pickup"]');
        pickupBtn.click();
        
        expect(cartUI.reservationMode).toBe(true);
        
        // 2. Search for stores
        const searchInput = document.querySelector('.store-search-input');
        const findStoresBtn = document.querySelector('.find-stores-btn');
        
        searchInput.value = '10001';
        findStoresBtn.click();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 3. Select a store
        const selectStoreBtn = document.querySelector('.select-store-btn');
        selectStoreBtn.click();
        
        expect(cartUI.currentStore).toBeTruthy();
        
        // 4. Proceed to checkout
        const checkoutBtn = document.querySelector('.checkout-btn');
        checkoutBtn.click();
        
        const bopisPanel = document.querySelector('.bopis-panel');
        expect(bopisPanel.style.display).toBe('block');
        
        // 5. Fill reservation form
        document.querySelector('.pickup-time-select').value = '2024-01-15T14:00:00';
        document.querySelector('.customer-name').value = 'John Doe';
        document.querySelector('.customer-email').value = 'john@example.com';
        document.querySelector('.customer-phone').value = '555-1234';
        
        // 6. Confirm reservation
        const confirmBtn = document.querySelector('.confirm-reservation-btn');
        confirmBtn.click();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Should show success modal
        const successModal = document.querySelector('.reservation-success-modal');
        expect(successModal).toBeTruthy();
    });

    test('should handle complete VTO to cart workflow', () => {
        // 1. Add VTO session
        const vtoSession = {
            sessionId: 'vto-123',
            frameName: 'Designer Frame',
            frameImage: 'designer.jpg',
            confidence: 92
        };
        
        cartUI.handleVTOSession(vtoSession);
        
        // 2. VTO should be displayed
        const vtoSummary = document.querySelector('.vto-summary');
        expect(vtoSummary.style.display).toBe('block');
        
        // 3. View VTO session
        const viewBtn = document.querySelector('.view-session-btn');
        viewBtn.click();
        
        expect(global.window.vtoCartIntegration.displaySession).toHaveBeenCalledWith(vtoSession);
    });
});