/**
 * Enhanced Cart UI - Frontend Agent Implementation
 * SPARC Phase 3 - Days 14-15
 * 
 * Consolidates BOPIS, Store Locator, and VTO integration into unified cart experience
 */

class EnhancedCartUI {
    constructor() {
        this.cartManager = window.cartManager;
        this.apiIntegration = window.apiIntegration;
        this.storeLocator = window.storeLocator;
        this.vtoIntegration = window.vtoCartIntegration;
        this.bopisManager = window.bopisManager;
        
        this.currentStore = null;
        this.reservationMode = false;
        this.vtoSessions = new Map();
        
        this.init();
    }

    init() {
        this.createEnhancedCartHTML();
        this.bindEvents();
        this.loadCartState();
        this.initializeIntegrations();
    }

    createEnhancedCartHTML() {
        const cartContainer = document.querySelector('.cart-container') || document.querySelector('#cart');
        if (!cartContainer) return;

        cartContainer.innerHTML = `
            <div class="enhanced-cart">
                <!-- Cart Header with Store Selection -->
                <div class="cart-header">
                    <h2 class="cart-title">
                        <i class="fas fa-shopping-cart"></i>
                        Your Cart
                        <span class="cart-count">0</span>
                    </h2>
                    
                    <div class="cart-mode-toggle">
                        <button class="mode-btn" data-mode="delivery" aria-pressed="true">
                            <i class="fas fa-truck"></i>
                            Delivery
                        </button>
                        <button class="mode-btn" data-mode="pickup" aria-pressed="false">
                            <i class="fas fa-store"></i>
                            Store Pickup
                        </button>
                    </div>
                </div>

                <!-- Store Selection Panel (Hidden by default) -->
                <div class="store-selection-panel" style="display: none;">
                    <div class="store-selector">
                        <h3>
                            <i class="fas fa-map-marker-alt"></i>
                            Select Pickup Store
                        </h3>
                        <div class="current-store" style="display: none;">
                            <div class="store-info">
                                <span class="store-name"></span>
                                <span class="store-distance"></span>
                            </div>
                            <button class="change-store-btn">Change Store</button>
                        </div>
                        <div class="store-search">
                            <input type="text" class="store-search-input" placeholder="Enter ZIP code or city">
                            <button class="find-stores-btn">
                                <i class="fas fa-search"></i>
                                Find Stores
                            </button>
                        </div>
                        <div class="nearby-stores"></div>
                    </div>
                </div>

                <!-- Cart Items -->
                <div class="cart-items">
                    <div class="empty-cart" style="display: none;">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Your cart is empty</h3>
                        <p>Add some frames to get started!</p>
                        <button class="browse-frames-btn">Browse Frames</button>
                    </div>
                    <div class="cart-items-list"></div>
                </div>

                <!-- VTO Integration Panel -->
                <div class="vto-integration-panel">
                    <div class="vto-summary" style="display: none;">
                        <h4>
                            <i class="fas fa-eye"></i>
                            Virtual Try-On Results
                        </h4>
                        <div class="vto-sessions-list"></div>
                    </div>
                </div>

                <!-- Cart Summary -->
                <div class="cart-summary">
                    <div class="summary-row subtotal">
                        <span>Subtotal:</span>
                        <span class="amount">$0.00</span>
                    </div>
                    <div class="summary-row tax">
                        <span>Tax:</span>
                        <span class="amount">$0.00</span>
                    </div>
                    <div class="summary-row shipping" style="display: none;">
                        <span>Shipping:</span>
                        <span class="amount">$0.00</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span class="amount">$0.00</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="cart-actions">
                    <button class="continue-shopping-btn">
                        <i class="fas fa-arrow-left"></i>
                        Continue Shopping
                    </button>
                    <button class="checkout-btn primary-btn" disabled>
                        <i class="fas fa-credit-card"></i>
                        <span class="checkout-text">Checkout</span>
                    </button>
                </div>

                <!-- BOPIS Reservation Panel -->
                <div class="bopis-panel" style="display: none;">
                    <div class="reservation-form">
                        <h3>
                            <i class="fas fa-calendar-check"></i>
                            Reserve for Pickup
                        </h3>
                        <div class="pickup-time-selection">
                            <label>Preferred Pickup Time:</label>
                            <select class="pickup-time-select">
                                <option value="">Select time...</option>
                            </select>
                        </div>
                        <div class="customer-info">
                            <input type="text" class="customer-name" placeholder="Full Name" required>
                            <input type="email" class="customer-email" placeholder="Email Address" required>
                            <input type="tel" class="customer-phone" placeholder="Phone Number" required>
                        </div>
                        <div class="reservation-actions">
                            <button class="cancel-reservation-btn">Cancel</button>
                            <button class="confirm-reservation-btn primary-btn">
                                <i class="fas fa-check"></i>
                                Reserve Items
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const cartContainer = document.querySelector('.enhanced-cart');
        if (!cartContainer) return;

        // Mode toggle events
        cartContainer.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleModeToggle(e));
        });

        // Store selection events
        cartContainer.querySelector('.find-stores-btn')?.addEventListener('click', () => this.findNearbyStores());
        cartContainer.querySelector('.change-store-btn')?.addEventListener('click', () => this.showStoreSelection());

        // Cart action events
        cartContainer.querySelector('.continue-shopping-btn')?.addEventListener('click', () => this.continueShopping());
        cartContainer.querySelector('.checkout-btn')?.addEventListener('click', () => this.handleCheckout());
        cartContainer.querySelector('.browse-frames-btn')?.addEventListener('click', () => this.browseFrames());

        // BOPIS events
        cartContainer.querySelector('.confirm-reservation-btn')?.addEventListener('click', () => this.confirmReservation());
        cartContainer.querySelector('.cancel-reservation-btn')?.addEventListener('click', () => this.cancelReservation());

        // Listen for cart updates
        document.addEventListener('cartUpdated', () => this.updateCartDisplay());
        document.addEventListener('storeSelected', (e) => this.handleStoreSelection(e.detail));
        document.addEventListener('vtoSessionCompleted', (e) => this.handleVTOSession(e.detail));
    }

    handleModeToggle(e) {
        const mode = e.target.closest('.mode-btn').dataset.mode;
        const cartContainer = document.querySelector('.enhanced-cart');
        
        // Update button states
        cartContainer.querySelectorAll('.mode-btn').forEach(btn => {
            btn.setAttribute('aria-pressed', btn.dataset.mode === mode);
        });

        // Toggle panels
        const storePanel = cartContainer.querySelector('.store-selection-panel');
        const shippingRow = cartContainer.querySelector('.summary-row.shipping');
        const checkoutBtn = cartContainer.querySelector('.checkout-btn');
        const checkoutText = checkoutBtn.querySelector('.checkout-text');

        if (mode === 'pickup') {
            this.reservationMode = true;
            storePanel.style.display = 'block';
            shippingRow.style.display = 'none';
            checkoutText.textContent = 'Reserve for Pickup';
            checkoutBtn.innerHTML = '<i class="fas fa-store"></i><span class="checkout-text">Reserve for Pickup</span>';
            
            if (!this.currentStore) {
                this.showStoreSelection();
            }
        } else {
            this.reservationMode = false;
            storePanel.style.display = 'none';
            shippingRow.style.display = 'flex';
            checkoutText.textContent = 'Checkout';
            checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i><span class="checkout-text">Checkout</span>';
        }

        this.updateCartSummary();
    }

    async findNearbyStores() {
        const searchInput = document.querySelector('.store-search-input');
        const nearbyStoresContainer = document.querySelector('.nearby-stores');
        const searchQuery = searchInput.value.trim();

        if (!searchQuery) {
            this.showError('Please enter a ZIP code or city');
            return;
        }

        try {
            nearbyStoresContainer.innerHTML = '<div class="loading">Finding nearby stores...</div>';
            
            const stores = await this.storeLocator.searchStores({
                query: searchQuery,
                services: ['bopis'],
                limit: 5
            });

            this.displayNearbyStores(stores);
        } catch (error) {
            console.error('Error finding stores:', error);
            nearbyStoresContainer.innerHTML = '<div class="error">Unable to find stores. Please try again.</div>';
        }
    }

    displayNearbyStores(stores) {
        const container = document.querySelector('.nearby-stores');
        
        if (!stores || stores.length === 0) {
            container.innerHTML = '<div class="no-stores">No stores found in your area.</div>';
            return;
        }

        container.innerHTML = stores.map(store => `
            <div class="store-option" data-store-id="${store.id}">
                <div class="store-details">
                    <h4>${store.name}</h4>
                    <p class="store-address">${store.address}</p>
                    <div class="store-meta">
                        <span class="distance">
                            <i class="fas fa-map-marker-alt"></i>
                            ${store.distance?.toFixed(1)} miles
                        </span>
                        <span class="hours ${store.isOpen ? 'open' : 'closed'}">
                            <i class="fas fa-clock"></i>
                            ${store.isOpen ? 'Open' : 'Closed'}
                        </span>
                    </div>
                </div>
                <button class="select-store-btn" data-store-id="${store.id}">
                    Select Store
                </button>
            </div>
        `).join('');

        // Bind store selection events
        container.querySelectorAll('.select-store-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const storeId = e.target.dataset.storeId;
                const store = stores.find(s => s.id === storeId);
                this.selectStore(store);
            });
        });
    }

    selectStore(store) {
        this.currentStore = store;
        
        // Update UI
        const currentStoreDiv = document.querySelector('.current-store');
        const storeSearchDiv = document.querySelector('.store-search');
        const nearbyStoresDiv = document.querySelector('.nearby-stores');
        
        currentStoreDiv.style.display = 'block';
        currentStoreDiv.querySelector('.store-name').textContent = store.name;
        currentStoreDiv.querySelector('.store-distance').textContent = `${store.distance?.toFixed(1)} miles away`;
        
        storeSearchDiv.style.display = 'none';
        nearbyStoresDiv.innerHTML = '';

        // Enable checkout if cart has items
        this.updateCheckoutButton();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('storeSelected', { detail: store }));
    }

    showStoreSelection() {
        const currentStoreDiv = document.querySelector('.current-store');
        const storeSearchDiv = document.querySelector('.store-search');
        
        currentStoreDiv.style.display = 'none';
        storeSearchDiv.style.display = 'block';
        
        // Clear previous search
        document.querySelector('.store-search-input').value = '';
        document.querySelector('.nearby-stores').innerHTML = '';
    }

    handleStoreSelection(store) {
        this.currentStore = store;
        this.updateCartSummary();
    }

    handleVTOSession(sessionData) {
        this.vtoSessions.set(sessionData.sessionId, sessionData);
        this.updateVTODisplay();
    }

    updateVTODisplay() {
        const vtoPanel = document.querySelector('.vto-integration-panel');
        const vtoSummary = vtoPanel.querySelector('.vto-summary');
        const sessionsList = vtoPanel.querySelector('.vto-sessions-list');

        if (this.vtoSessions.size === 0) {
            vtoSummary.style.display = 'none';
            return;
        }

        vtoSummary.style.display = 'block';
        sessionsList.innerHTML = Array.from(this.vtoSessions.values()).map(session => `
            <div class="vto-session" data-session-id="${session.sessionId}">
                <div class="session-info">
                    <img src="${session.frameImage}" alt="${session.frameName}" class="frame-thumb">
                    <div class="session-details">
                        <h5>${session.frameName}</h5>
                        <div class="confidence-score">
                            <span class="confidence-label">Fit Confidence:</span>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${session.confidence}%"></div>
                            </div>
                            <span class="confidence-value">${session.confidence}%</span>
                        </div>
                    </div>
                </div>
                <div class="session-actions">
                    <button class="view-session-btn" data-session-id="${session.sessionId}">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                </div>
            </div>
        `).join('');

        // Bind VTO session events
        sessionsList.querySelectorAll('.view-session-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sessionId = e.target.dataset.sessionId;
                this.viewVTOSession(sessionId);
            });
        });
    }

    viewVTOSession(sessionId) {
        const session = this.vtoSessions.get(sessionId);
        if (session && this.vtoIntegration) {
            this.vtoIntegration.displaySession(session);
        }
    }

    updateCartDisplay() {
        if (!this.cartManager) return;

        const items = this.cartManager.getItems();
        const cartCount = document.querySelector('.cart-count');
        const emptyCart = document.querySelector('.empty-cart');
        const cartItemsList = document.querySelector('.cart-items-list');

        // Update cart count
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        if (items.length === 0) {
            emptyCart.style.display = 'block';
            cartItemsList.innerHTML = '';
        } else {
            emptyCart.style.display = 'none';
            this.renderCartItems(items);
        }

        this.updateCartSummary();
        this.updateCheckoutButton();
    }

    renderCartItems(items) {
        const cartItemsList = document.querySelector('.cart-items-list');
        
        cartItemsList.innerHTML = items.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    ${item.vtoSessionId ? '<div class="vto-badge"><i class="fas fa-eye"></i></div>' : ''}
                </div>
                <div class="item-details">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-sku">SKU: ${item.sku}</p>
                    ${item.vtoData ? `
                        <div class="item-vto-info">
                            <span class="vto-confidence">
                                <i class="fas fa-check-circle"></i>
                                ${item.vtoData.confidence}% fit confidence
                            </span>
                        </div>
                    ` : ''}
                    <div class="item-availability">
                        ${this.getAvailabilityStatus(item)}
                    </div>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn minus" data-item-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn plus" data-item-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item-btn" data-item-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Bind item control events
        this.bindItemControls();
    }

    getAvailabilityStatus(item) {
        if (this.reservationMode && this.currentStore) {
            // Check store inventory
            const availability = item.storeInventory?.[this.currentStore.id];
            if (availability) {
                if (availability.quantity >= item.quantity) {
                    return `<span class="available"><i class="fas fa-check"></i> Available for pickup</span>`;
                } else if (availability.quantity > 0) {
                    return `<span class="limited"><i class="fas fa-exclamation-triangle"></i> Only ${availability.quantity} available</span>`;
                } else {
                    return `<span class="unavailable"><i class="fas fa-times"></i> Not available at selected store</span>`;
                }
            }
            return `<span class="checking"><i class="fas fa-spinner fa-spin"></i> Checking availability...</span>`;
        }
        return `<span class="in-stock"><i class="fas fa-check"></i> In stock</span>`;
    }

    bindItemControls() {
        const cartItemsList = document.querySelector('.cart-items-list');
        
        // Quantity controls
        cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.qty-btn').dataset.itemId;
                const action = e.target.closest('.qty-btn').classList.contains('plus') ? 'increase' : 'decrease';
                this.updateItemQuantity(itemId, action);
            });
        });

        // Remove item buttons
        cartItemsList.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.remove-item-btn').dataset.itemId;
                this.removeItem(itemId);
            });
        });
    }

    updateItemQuantity(itemId, action) {
        if (this.cartManager) {
            if (action === 'increase') {
                this.cartManager.updateQuantity(itemId, 1);
            } else {
                this.cartManager.updateQuantity(itemId, -1);
            }
        }
    }

    removeItem(itemId) {
        if (this.cartManager) {
            this.cartManager.removeItem(itemId);
        }
    }

    updateCartSummary() {
        if (!this.cartManager) return;

        const items = this.cartManager.getItems();
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.08; // 8% tax rate
        const tax = subtotal * taxRate;
        const shipping = this.reservationMode ? 0 : (subtotal > 50 ? 0 : 9.99);
        const total = subtotal + tax + shipping;

        // Update summary display
        document.querySelector('.summary-row.subtotal .amount').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.summary-row.tax .amount').textContent = `$${tax.toFixed(2)}`;
        document.querySelector('.summary-row.shipping .amount').textContent = `$${shipping.toFixed(2)}`;
        document.querySelector('.summary-row.total .amount').textContent = `$${total.toFixed(2)}`;
    }

    updateCheckoutButton() {
        const checkoutBtn = document.querySelector('.checkout-btn');
        const items = this.cartManager?.getItems() || [];
        
        const hasItems = items.length > 0;
        const hasStore = !this.reservationMode || this.currentStore;
        const canCheckout = hasItems && hasStore;
        
        checkoutBtn.disabled = !canCheckout;
        
        if (!hasItems) {
            checkoutBtn.title = 'Add items to cart';
        } else if (this.reservationMode && !this.currentStore) {
            checkoutBtn.title = 'Select a store for pickup';
        } else {
            checkoutBtn.title = '';
        }
    }

    async handleCheckout() {
        if (this.reservationMode) {
            this.showBOPISPanel();
        } else {
            this.proceedToCheckout();
        }
    }

    showBOPISPanel() {
        const bopisPanel = document.querySelector('.bopis-panel');
        bopisPanel.style.display = 'block';
        
        // Populate pickup times
        this.populatePickupTimes();
        
        // Scroll to panel
        bopisPanel.scrollIntoView({ behavior: 'smooth' });
    }

    populatePickupTimes() {
        const select = document.querySelector('.pickup-time-select');
        const now = new Date();
        const times = [];
        
        // Generate pickup times for next 7 days
        for (let day = 0; day < 7; day++) {
            const date = new Date(now);
            date.setDate(date.getDate() + day);
            
            if (day === 0) {
                // Today - only future times
                const currentHour = now.getHours();
                for (let hour = Math.max(currentHour + 2, 10); hour < 18; hour++) {
                    times.push({
                        value: `${date.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00`,
                        label: `Today ${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
                    });
                }
            } else {
                // Future days - full schedule
                for (let hour = 10; hour < 18; hour++) {
                    times.push({
                        value: `${date.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00`,
                        label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
                    });
                }
            }
        }
        
        select.innerHTML = '<option value="">Select time...</option>' + 
            times.map(time => `<option value="${time.value}">${time.label}</option>`).join('');
    }

    async confirmReservation() {
        const form = document.querySelector('.reservation-form');
        const formData = new FormData(form);
        
        const reservationData = {
            storeId: this.currentStore.id,
            items: this.cartManager.getItems(),
            pickupTime: document.querySelector('.pickup-time-select').value,
            customerName: document.querySelector('.customer-name').value,
            customerEmail: document.querySelector('.customer-email').value,
            customerPhone: document.querySelector('.customer-phone').value
        };

        // Validate form
        if (!this.validateReservationForm(reservationData)) {
            return;
        }

        try {
            const confirmBtn = document.querySelector('.confirm-reservation-btn');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Reservation...';

            const reservation = await this.bopisManager.createReservation(reservationData);
            
            this.showReservationSuccess(reservation);
            this.clearCart();
            
        } catch (error) {
            console.error('Reservation error:', error);
            this.showError('Failed to create reservation. Please try again.');
        } finally {
            const confirmBtn = document.querySelector('.confirm-reservation-btn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check"></i> Reserve Items';
        }
    }

    validateReservationForm(data) {
        const errors = [];
        
        if (!data.pickupTime) errors.push('Please select a pickup time');
        if (!data.customerName.trim()) errors.push('Please enter your name');
        if (!data.customerEmail.trim()) errors.push('Please enter your email');
        if (!data.customerPhone.trim()) errors.push('Please enter your phone number');
        
        if (errors.length > 0) {
            this.showError(errors.join('\n'));
            return false;
        }
        
        return true;
    }

    showReservationSuccess(reservation) {
        const modal = document.createElement('div');
        modal.className = 'reservation-success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Reservation Confirmed!</h3>
                <p>Your reservation has been created successfully.</p>
                <div class="reservation-details">
                    <p><strong>Confirmation Number:</strong> ${reservation.confirmationNumber}</p>
                    <p><strong>Store:</strong> ${this.currentStore.name}</p>
                    <p><strong>Pickup Time:</strong> ${new Date(reservation.pickupTime).toLocaleString()}</p>
                </div>
                <div class="modal-actions">
                    <button class="close-modal-btn primary-btn">Continue Shopping</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            modal.remove();
            this.continueShopping();
        });
    }

    cancelReservation() {
        const bopisPanel = document.querySelector('.bopis-panel');
        bopisPanel.style.display = 'none';
    }

    proceedToCheckout() {
        // Redirect to standard checkout
        window.location.href = '/checkout';
    }

    continueShopping() {
        window.location.href = '/products';
    }

    browseFrames() {
        window.location.href = '/products';
    }

    clearCart() {
        if (this.cartManager) {
            this.cartManager.clearCart();
        }
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    loadCartState() {
        // Load any persisted cart state
        const savedState = localStorage.getItem('enhancedCartState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.currentStore = state.currentStore;
                this.reservationMode = state.reservationMode;
                
                if (this.reservationMode) {
                    document.querySelector('[data-mode="pickup"]').click();
                }
                
                if (this.currentStore) {
                    this.selectStore(this.currentStore);
                }
            } catch (error) {
                console.error('Error loading cart state:', error);
            }
        }
    }

    saveCartState() {
        const state = {
            currentStore: this.currentStore,
            reservationMode: this.reservationMode
        };
        
        localStorage.setItem('enhancedCartState', JSON.stringify(state));
    }

    initializeIntegrations() {
        // Initialize all integration points
        this.updateCartDisplay();
        
        // Set up periodic state saving
        setInterval(() => this.saveCartState(), 30000); // Save every 30 seconds
        
        // Save state on page unload
        window.addEventListener('beforeunload', () => this.saveCartState());
    }
}

// Initialize Enhanced Cart UI when DOM is
// Initialize Enhanced Cart UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not already initialized
    if (!window.enhancedCartUI) {
        window.enhancedCartUI = new EnhancedCartUI();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCartUI;
}