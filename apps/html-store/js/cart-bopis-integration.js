/**
 * BOPIS Integration for Existing Cart System
 * SPARC Implementation - BOPIS Agent Deliverable
 * Extends the existing CartManager with BOPIS functionality
 */

class CartBOPISIntegration {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.selectedStore = null;
        this.fulfillmentType = 'shipping'; // shipping or pickup
        this.init();
    }

    init() {
        this.loadBOPISSettings();
        this.extendCartManager();
        this.bindBOPISEvents();
        this.addBOPISUI();
    }

    loadBOPISSettings() {
        const stored = localStorage.getItem('bopis_settings');
        if (stored) {
            const settings = JSON.parse(stored);
            this.selectedStore = settings.selectedStore;
            this.fulfillmentType = settings.fulfillmentType || 'shipping';
        }
    }

    saveBOPISSettings() {
        localStorage.setItem('bopis_settings', JSON.stringify({
            selectedStore: this.selectedStore,
            fulfillmentType: this.fulfillmentType
        }));
    }

    extendCartManager() {
        // Extend the existing cart manager with BOPIS methods
        const originalSaveCart = this.cartManager.saveCart.bind(this.cartManager);
        const originalUpdateCartUI = this.cartManager.updateCartUI.bind(this.cartManager);
        const originalAddItem = this.cartManager.addItem.bind(this.cartManager);

        // Override saveCart to include BOPIS data
        this.cartManager.saveCart = () => {
            originalSaveCart();
            this.syncBOPISToDatabase();
        };

        // Override updateCartUI to include BOPIS display
        this.cartManager.updateCartUI = () => {
            originalUpdateCartUI();
            this.updateBOPISDisplay();
        };

        // Override addItem to check BOPIS availability
        this.cartManager.addItem = (product, quantity = 1) => {
            originalAddItem(product, quantity);
            if (this.fulfillmentType === 'pickup' && this.selectedStore) {
                this.checkBOPISAvailability();
            }
        };

        // Add BOPIS-specific methods to cart manager
        this.cartManager.setFulfillmentType = (type) => this.setFulfillmentType(type);
        this.cartManager.setSelectedStore = (store) => this.setSelectedStore(store);
        this.cartManager.createBOPISReservation = (customerInfo) => this.createBOPISReservation(customerInfo);
        this.cartManager.getBOPISEligibleItems = () => this.getBOPISEligibleItems();
    }

    bindBOPISEvents() {
        // Fulfillment type selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'fulfillment_type') {
                this.setFulfillmentType(e.target.value);
            }
        });

        // Store selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('store-select-btn')) {
                const storeId = e.target.dataset.storeId;
                this.selectStoreById(storeId);
            }
        });

        // BOPIS reservation creation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'create-bopis-reservation') {
                this.handleReservationCreation();
            }
        });
    }

    addBOPISUI() {
        // Add BOPIS options to checkout if not already present
        const checkoutContainer = document.querySelector('.checkout-container') || 
                                 document.querySelector('#cartSidebar') ||
                                 document.body;

        if (!document.getElementById('bopis-fulfillment-options')) {
            const bopisUI = this.createBOPISUI();
            
            // Find the best place to insert BOPIS UI
            const cartContent = document.getElementById('cartContent');
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            if (cartContent && checkoutBtn) {
                cartContent.insertBefore(bopisUI, checkoutBtn.parentElement);
            } else {
                checkoutContainer.appendChild(bopisUI);
            }
        }
    }

    createBOPISUI() {
        const bopisContainer = document.createElement('div');
        bopisContainer.id = 'bopis-fulfillment-options';
        bopisContainer.className = 'bopis-container';
        bopisContainer.innerHTML = `
            <div class="fulfillment-section">
                <h4>Delivery Options</h4>
                <div class="fulfillment-choices">
                    <label class="fulfillment-option">
                        <input type="radio" name="fulfillment_type" value="shipping" ${this.fulfillmentType === 'shipping' ? 'checked' : ''}>
                        <span class="option-content">
                            <span class="option-label">Ship to Address</span>
                            <span class="option-description">Standard shipping (3-5 business days)</span>
                        </span>
                    </label>
                    <label class="fulfillment-option">
                        <input type="radio" name="fulfillment_type" value="pickup" ${this.fulfillmentType === 'pickup' ? 'checked' : ''}>
                        <span class="option-content">
                            <span class="option-label">Pick up in Store</span>
                            <span class="option-description">Reserve for pickup at a nearby store</span>
                        </span>
                    </label>
                </div>
            </div>
            
            <div id="bopis-store-selector" class="store-selector" style="display: ${this.fulfillmentType === 'pickup' ? 'block' : 'none'}">
                <div id="selected-store-display"></div>
                <div id="store-locator-container"></div>
                <div id="bopis-availability-status"></div>
            </div>
            
            <div id="bopis-reservation-section" class="reservation-section" style="display: ${this.fulfillmentType === 'pickup' && this.selectedStore ? 'block' : 'none'}">
                <button id="create-bopis-reservation" class="btn btn-primary btn-block">
                    Reserve for Pickup
                </button>
            </div>
        `;

        return bopisContainer;
    }

    setFulfillmentType(type) {
        this.fulfillmentType = type;
        this.saveBOPISSettings();
        this.updateBOPISDisplay();

        if (type === 'pickup') {
            this.showStoreSelector();
        } else {
            this.hideStoreSelector();
        }
    }

    async setSelectedStore(store) {
        this.selectedStore = store;
        this.saveBOPISSettings();
        this.updateSelectedStoreDisplay();
        
        if (this.fulfillmentType === 'pickup') {
            await this.checkBOPISAvailability();
        }
    }

    async selectStoreById(storeId) {
        try {
            const response = await fetch(`/api/v1/stores/${storeId}`);
            if (response.ok) {
                const store = await response.json();
                await this.setSelectedStore(store);
            }
        } catch (error) {
            console.error('Error selecting store:', error);
            this.showError('Failed to select store. Please try again.');
        }
    }

    showStoreSelector() {
        const storeSelector = document.getElementById('bopis-store-selector');
        if (storeSelector) {
            storeSelector.style.display = 'block';
            this.loadNearbyStores();
        }
    }

    hideStoreSelector() {
        const storeSelector = document.getElementById('bopis-store-selector');
        const reservationSection = document.getElementById('bopis-reservation-section');
        
        if (storeSelector) storeSelector.style.display = 'none';
        if (reservationSection) reservationSection.style.display = 'none';
        
        this.selectedStore = null;
        this.saveBOPISSettings();
    }

    async loadNearbyStores() {
        try {
            // Get user location
            const location = await this.getUserLocation();
            
            // Fetch nearby stores
            const response = await fetch(`/api/v1/stores/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=25`);
            const stores = response.ok ? await response.json() : await this.getAllStores();
            
            this.displayStoreOptions(stores);
        } catch (error) {
            console.error('Error loading stores:', error);
            this.displayStoreOptions([]);
        }
    }

    async getUserLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    () => resolve({ latitude: 40.7128, longitude: -74.0060 }) // NYC fallback
                );
            } else {
                resolve({ latitude: 40.7128, longitude: -74.0060 });
            }
        });
    }

    async getAllStores() {
        try {
            const response = await fetch('/api/v1/stores?active=true&bopis_enabled=true');
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Error fetching stores:', error);
            return [];
        }
    }

    displayStoreOptions(stores) {
        const container = document.getElementById('store-locator-container');
        if (!container) return;

        if (stores.length === 0) {
            container.innerHTML = `
                <div class="no-stores-message">
                    <p>No stores available for pickup in your area.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <h5>Select a Store for Pickup</h5>
            <div class="store-options">
                ${stores.slice(0, 3).map(store => `
                    <div class="store-option-compact">
                        <div class="store-info">
                            <strong>${store.name}</strong><br>
                            <small>${store.address_line1}, ${store.city}</small><br>
                            ${store.distance ? `<small class="text-primary">${store.distance.toFixed(1)} miles away</small>` : ''}
                        </div>
                        <button class="btn btn-sm btn-primary store-select-btn" data-store-id="${store.id}">
                            Select
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateSelectedStoreDisplay() {
        const container = document.getElementById('selected-store-display');
        const reservationSection = document.getElementById('bopis-reservation-section');
        
        if (!container) return;

        if (this.selectedStore) {
            container.innerHTML = `
                <div class="selected-store-info">
                    <h5>Pickup Location</h5>
                    <div class="store-details">
                        <strong>${this.selectedStore.name}</strong><br>
                        ${this.selectedStore.address_line1}<br>
                        ${this.selectedStore.city}, ${this.selectedStore.state} ${this.selectedStore.postal_code}
                    </div>
                    <button class="btn btn-link btn-sm" onclick="cartBOPIS.changeStore()">
                        Change Store
                    </button>
                </div>
            `;
            
            if (reservationSection) {
                reservationSection.style.display = 'block';
            }
        } else {
            container.innerHTML = '';
            if (reservationSection) {
                reservationSection.style.display = 'none';
            }
        }
    }

    async checkBOPISAvailability() {
        if (!this.selectedStore || !this.cartManager.cart.items.length) return;

        const statusContainer = document.getElementById('bopis-availability-status');
        if (!statusContainer) return;

        try {
            const availabilityChecks = await Promise.all(
                this.cartManager.cart.items.map(async (item) => {
                    try {
                        const response = await fetch(
                            `/api/v1/bopis/stores/${this.selectedStore.id}/inventory/${item.id}?quantity=${item.quantity}`
                        );
                        
                        if (response.ok) {
                            const inventory = await response.json();
                            return { ...item, available: inventory.is_available, inventory };
                        }
                        return { ...item, available: false };
                    } catch (error) {
                        return { ...item, available: false };
                    }
                })
            );

            this.displayAvailabilityStatus(availabilityChecks);
        } catch (error) {
            console.error('Error checking BOPIS availability:', error);
        }
    }

    displayAvailabilityStatus(availabilityChecks) {
        const container = document.getElementById('bopis-availability-status');
        if (!container) return;

        const unavailableItems = availabilityChecks.filter(item => !item.available);

        if (unavailableItems.length > 0) {
            container.innerHTML = `
                <div class="availability-warning">
                    <small class="text-warning">⚠️ Some items may not be immediately available</small>
                    <div class="unavailable-items">
                        ${unavailableItems.map(item => `
                            <small>${item.name} - Limited stock</small>
                        `).join('<br>')}
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="availability-success">
                    <small class="text-success">✅ All items available for pickup</small>
                </div>
            `;
        }
    }

    async handleReservationCreation() {
        if (!this.selectedStore) {
            this.showError('Please select a store for pickup.');
            return;
        }

        if (!this.cartManager.cart.items.length) {
            this.showError('Your cart is empty.');
            return;
        }

        // Get customer information
        const customerInfo = await this.getCustomerInfo();
        if (!customerInfo) return;

        try {
            await this.createBOPISReservation(customerInfo);
        } catch (error) {
            console.error('Error creating reservation:', error);
            this.showError('Failed to create reservation. Please try again.');
        }
    }

    async getCustomerInfo() {
        // Create a simple modal for customer information
        return new Promise((resolve) => {
            const modal = this.createCustomerInfoModal();
            document.body.appendChild(modal);

            const form = modal.querySelector('#customer-info-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const customerInfo = {
                    email: formData.get('email'),
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    instructions: formData.get('instructions')
                };

                if (customerInfo.email && customerInfo.name) {
                    modal.remove();
                    resolve(customerInfo);
                } else {
                    this.showError('Please provide your email and name.');
                }
            });

            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.remove();
                resolve(null);
            });
        });
    }

    createCustomerInfoModal() {
        const modal = document.createElement('div');
        modal.className = 'bopis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h5>Reservation Information</h5>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="customer-info-form">
                    <div class="form-group">
                        <label for="customer-email">Email *</label>
                        <input type="email" id="customer-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-name">Full Name *</label>
                        <input type="text" id="customer-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-phone">Phone Number</label>
                        <input type="tel" id="customer-phone" name="phone">
                    </div>
                    <div class="form-group">
                        <label for="special-instructions">Special Instructions</label>
                        <textarea id="special-instructions" name="instructions" rows="3"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Reservation</button>
                    </div>
                </form>
            </div>
        `;
        return modal;
    }

    async createBOPISReservation(customerInfo) {
        const reservations = [];

        for (const item of this.cartManager.cart.items) {
            const reservationData = {
                customer_email: customerInfo.email,
                customer_name: customerInfo.name,
                customer_phone: customerInfo.phone,
                store_id: this.selectedStore.id,
                frame_id: item.id,
                quantity: item.quantity,
                special_instructions: customerInfo.instructions
            };

            const response = await fetch('/api/v1/bopis/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create reservation');
            }

            const reservation = await response.json();
            reservations.push(reservation);
        }

        this.showReservationSuccess(reservations);
        this.cartManager.clearCart();
    }

    showReservationSuccess(reservations) {
        const confirmationNumbers = reservations.map(r => r.confirmation_number).join(', ');
        
        const modal = document.createElement('div');
        modal.className = 'bopis-modal success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h5>🎉 Reservation Confirmed!</h5>
                </div>
                <div class="modal-body">
                    <p>Your items have been reserved for pickup at <strong>${this.selectedStore.name}</strong></p>
                    <div class="confirmation-details">
                        <p><strong>Confirmation Number(s):</strong> ${confirmationNumbers}</p>
                        <p><strong>Store:</strong> ${this.selectedStore.name}</p>
                        <p><strong>Address:</strong> ${this.selectedStore.address_line1}, ${this.selectedStore.city}</p>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    updateBOPISDisplay() {
        this.updateSelectedStoreDisplay();
        
        // Update fulfillment type display in cart
        const fulfillmentDisplay = document.querySelector('.cart-fulfillment-display');
        if (fulfillmentDisplay) {
            if (this.fulfillmentType === 'pickup' && this.selectedStore) {
                fulfillmentDisplay.innerHTML = `
                    <small class="text-info">Pickup at: ${this.selectedStore.name}</small>
                `;
            } else if (this.fulfillmentType === 'pickup') {
                fulfillmentDisplay.innerHTML = `
                    <small class="text-warning">Pickup: Store not selected</small>
                `;
            } else {
                fulfillmentDisplay.innerHTML = `
                    <small class="text-muted">Standard shipping</small>
                `;
            }
        }
    }

    async syncBOPISToDatabase() {
        if (!window.apiIntegration) return;

        try {
            await window.apiIntegration.syncCartSession({
                session_id: this.cartManager.storageKey + '_' + Date.now(),
                cart_data: {
                    items: this.cartManager.cart.items,
                    fulfillment_type: this.fulfillmentType,
                    selected_store_id: this.selectedStore?.id
                },
                total_amount: this.cartManager.cart.total,
                store_id: this.selectedStore?.id,
                fulfillment_type: this.fulfillmentType,
                selected_store_id: this.selectedStore?.id
            });
        } catch (error) {
            console.warn('Failed to sync BOPIS data:', error);
        }
    }

    getBOPISEligibleItems() {
        return this.cartManager.cart.items.filter(item => item.id);
    }

    changeStore() {
        this.selectedStore = null;
        this.saveBOPISSettings();
        this.updateSelectedStoreDisplay();
        this.loadNearbyStores();
    }

    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'bopis-error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize BOPIS integration when cart manager is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for cart manager to be initialized
    const initBOPIS = () => {
        if (window.cartManager) {
            window.cartBOPIS = new CartBOPISIntegration(window.cartManager);
        } else {
            setTimeout(initBOPIS, 100);
        }
    };
    
    initBOPIS();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartBOPISIntegration;
}