/**
 * BOPIS (Buy Online, Pick up In Store) Frontend Integration
 * SPARC Implementation - BOPIS Agent Deliverable
 * Handles reservation creation, status tracking, and store selection
 */

class BOPISManager {
    constructor() {
        this.apiBase = '/api/v1/bopis';
        this.currentReservation = null;
        this.selectedStore = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStoredReservations();
        this.initializeStoreSelector();
    }

    bindEvents() {
        // BOPIS option selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'fulfillment_type') {
                this.handleFulfillmentChange(e.target.value);
            }
        });

        // Store selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('store-select-btn')) {
                this.selectStore(e.target.dataset.storeId);
            }
        });

        // Reservation creation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'create-reservation-btn') {
                this.createReservation();
            }
        });

        // Reservation tracking
        document.addEventListener('click', (e) => {
            if (e.target.id === 'track-reservation-btn') {
                this.trackReservation();
            }
        });
    }

    handleFulfillmentChange(fulfillmentType) {
        const storeSelector = document.getElementById('store-selector');
        const shippingInfo = document.getElementById('shipping-info');

        if (fulfillmentType === 'pickup') {
            storeSelector.style.display = 'block';
            shippingInfo.style.display = 'none';
            this.showStoreLocator();
        } else {
            storeSelector.style.display = 'none';
            shippingInfo.style.display = 'block';
            this.selectedStore = null;
        }
    }

    async showStoreLocator() {
        try {
            // Get user's location if available
            const userLocation = await this.getUserLocation();
            
            // Find nearby stores
            const stores = await this.findNearbyStores(userLocation);
            
            // Display store options
            this.displayStoreOptions(stores);
            
        } catch (error) {
            console.error('Error showing store locator:', error);
            this.showStoreError('Unable to load nearby stores. Please try again.');
        }
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    // Fallback to default location (NYC)
                    resolve({
                        latitude: 40.7128,
                        longitude: -74.0060
                    });
                },
                { timeout: 5000, enableHighAccuracy: false }
            );
        });
    }

    async findNearbyStores(location) {
        try {
            const response = await fetch(`/api/v1/stores/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=25`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch nearby stores');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error finding nearby stores:', error);
            // Fallback to all active stores
            return await this.getAllStores();
        }
    }

    async getAllStores() {
        try {
            const response = await fetch('/api/v1/stores?active=true&bopis_enabled=true');
            if (!response.ok) {
                throw new Error('Failed to fetch stores');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching stores:', error);
            return [];
        }
    }

    displayStoreOptions(stores) {
        const container = document.getElementById('store-options');
        
        if (!stores || stores.length === 0) {
            container.innerHTML = `
                <div class="no-stores-message">
                    <p>No stores available for pickup in your area.</p>
                    <button onclick="bopisManager.showAllStores()" class="btn btn-secondary">
                        View All Stores
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = stores.map(store => `
            <div class="store-option" data-store-id="${store.id}">
                <div class="store-info">
                    <h4>${store.name}</h4>
                    <p class="store-address">
                        ${store.address_line1}<br>
                        ${store.city}, ${store.state} ${store.postal_code}
                    </p>
                    <p class="store-distance">${store.distance ? `${store.distance.toFixed(1)} miles away` : ''}</p>
                    <div class="store-services">
                        ${store.services_offered ? store.services_offered.map(service => 
                            `<span class="service-tag">${service.replace('_', ' ')}</span>`
                        ).join('') : ''}
                    </div>
                    <div class="store-hours">
                        <strong>Today:</strong> ${this.getTodayHours(store.operating_hours)}
                    </div>
                </div>
                <div class="store-actions">
                    <button class="btn btn-primary store-select-btn" data-store-id="${store.id}">
                        Select This Store
                    </button>
                    <button class="btn btn-secondary" onclick="bopisManager.checkStoreInventory('${store.id}')">
                        Check Availability
                    </button>
                </div>
            </div>
        `).join('');
    }

    getTodayHours(operatingHours) {
        if (!operatingHours) return 'Hours not available';
        
        const today = new Date().toLocaleLowerCase().slice(0, 3) + 
                     new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase().slice(3);
        const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
        
        return operatingHours[todayKey] || 'Closed';
    }

    async selectStore(storeId) {
        try {
            // Get store details
            const response = await fetch(`/api/v1/stores/${storeId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch store details');
            }
            
            this.selectedStore = await response.json();
            
            // Update UI
            this.updateSelectedStoreDisplay();
            
            // Check inventory for current cart items
            await this.checkCartInventory();
            
        } catch (error) {
            console.error('Error selecting store:', error);
            this.showError('Failed to select store. Please try again.');
        }
    }

    updateSelectedStoreDisplay() {
        const container = document.getElementById('selected-store-info');
        
        if (!this.selectedStore) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="selected-store">
                <h4>Pickup Location</h4>
                <div class="store-details">
                    <strong>${this.selectedStore.name}</strong><br>
                    ${this.selectedStore.address_line1}<br>
                    ${this.selectedStore.city}, ${this.selectedStore.state} ${this.selectedStore.postal_code}<br>
                    <span class="store-phone">${this.selectedStore.phone}</span>
                </div>
                <button class="btn btn-link" onclick="bopisManager.changeStore()">
                    Change Store
                </button>
            </div>
        `;
    }

    async checkCartInventory() {
        if (!this.selectedStore) return;

        const cartItems = this.getCartItems();
        const inventoryChecks = [];

        for (const item of cartItems) {
            try {
                const response = await fetch(
                    `/api/v1/bopis/stores/${this.selectedStore.id}/inventory/${item.frame_id}?quantity=${item.quantity}`
                );
                
                if (response.ok) {
                    const inventory = await response.json();
                    inventoryChecks.push({
                        ...item,
                        inventory
                    });
                }
            } catch (error) {
                console.error('Error checking inventory for item:', item.frame_id, error);
            }
        }

        this.displayInventoryStatus(inventoryChecks);
    }

    displayInventoryStatus(inventoryChecks) {
        const container = document.getElementById('inventory-status');
        
        const unavailableItems = inventoryChecks.filter(item => !item.inventory.is_available);
        
        if (unavailableItems.length > 0) {
            container.innerHTML = `
                <div class="inventory-warning">
                    <h4>⚠️ Some items are not available at this store</h4>
                    <ul>
                        ${unavailableItems.map(item => `
                            <li>${item.name} - ${item.inventory.quantity_available} available (need ${item.quantity})</li>
                        `).join('')}
                    </ul>
                    <p>You can still create a reservation, but these items may need to be ordered.</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="inventory-success">
                    <h4>✅ All items are available for pickup</h4>
                    <p>Your order is ready to be reserved at this store.</p>
                </div>
            `;
        }
    }

    async createReservation() {
        if (!this.selectedStore) {
            this.showError('Please select a store for pickup.');
            return;
        }

        const customerInfo = this.getCustomerInfo();
        if (!customerInfo.email || !customerInfo.name) {
            this.showError('Please provide your email and name for the reservation.');
            return;
        }

        const cartItems = this.getCartItems();
        if (cartItems.length === 0) {
            this.showError('Your cart is empty.');
            return;
        }

        try {
            this.showLoading('Creating your reservation...');

            // Create reservations for each item (or combine if API supports multiple items)
            const reservations = [];
            
            for (const item of cartItems) {
                const reservationData = {
                    customer_email: customerInfo.email,
                    customer_name: customerInfo.name,
                    customer_phone: customerInfo.phone,
                    store_id: this.selectedStore.id,
                    frame_id: item.frame_id,
                    quantity: item.quantity,
                    special_instructions: customerInfo.instructions,
                    pickup_by_date: this.getPickupDate()
                };

                const response = await fetch(`${this.apiBase}/reservations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reservationData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Failed to create reservation');
                }

                const reservation = await response.json();
                reservations.push(reservation);
            }

            this.hideLoading();
            this.showReservationSuccess(reservations);
            this.storeReservations(reservations);
            
            // Clear cart after successful reservation
            this.clearCart();

        } catch (error) {
            this.hideLoading();
            console.error('Error creating reservation:', error);
            this.showError(`Failed to create reservation: ${error.message}`);
        }
    }

    getCustomerInfo() {
        return {
            email: document.getElementById('customer-email')?.value || '',
            name: document.getElementById('customer-name')?.value || '',
            phone: document.getElementById('customer-phone')?.value || '',
            instructions: document.getElementById('special-instructions')?.value || ''
        };
    }

    getCartItems() {
        // Integration with existing cart system
        if (window.cart && window.cart.items) {
            return window.cart.items;
        }
        
        // Fallback to localStorage
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData).items || [] : [];
    }

    getPickupDate() {
        const pickupDateInput = document.getElementById('pickup-date');
        if (pickupDateInput && pickupDateInput.value) {
            return new Date(pickupDateInput.value).toISOString();
        }
        
        // Default to 7 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        return defaultDate.toISOString();
    }

    showReservationSuccess(reservations) {
        const confirmationNumbers = reservations.map(r => r.confirmation_number).join(', ');
        
        const modal = document.createElement('div');
        modal.className = 'reservation-success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🎉 Reservation Confirmed!</h2>
                <p>Your items have been reserved for pickup at <strong>${this.selectedStore.name}</strong></p>
                <div class="confirmation-details">
                    <p><strong>Confirmation Number(s):</strong> ${confirmationNumbers}</p>
                    <p><strong>Pickup By:</strong> ${new Date(reservations[0].pickup_by_date).toLocaleDateString()}</p>
                    <p><strong>Store Address:</strong><br>
                       ${this.selectedStore.address_line1}<br>
                       ${this.selectedStore.city}, ${this.selectedStore.state} ${this.selectedStore.postal_code}
                    </p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="bopisManager.closeModal()">Continue Shopping</button>
                    <button class="btn btn-secondary" onclick="bopisManager.trackReservation('${confirmationNumbers.split(',')[0].trim()}')">Track Reservation</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Send confirmation email (if API supports it)
        this.sendConfirmationEmail(reservations);
    }

    async trackReservation(confirmationNumber = null) {
        const trackingNumber = confirmationNumber || document.getElementById('tracking-number')?.value;
        
        if (!trackingNumber) {
            this.showError('Please enter a confirmation number.');
            return;
        }

        try {
            this.showLoading('Looking up your reservation...');

            const response = await fetch(`${this.apiBase}/reservations/${trackingNumber}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Reservation not found. Please check your confirmation number.');
                }
                throw new Error('Failed to retrieve reservation details.');
            }

            const reservation = await response.json();
            this.hideLoading();
            this.displayReservationDetails(reservation);

        } catch (error) {
            this.hideLoading();
            console.error('Error tracking reservation:', error);
            this.showError(error.message);
        }
    }

    displayReservationDetails(reservation) {
        const container = document.getElementById('reservation-details') || this.createReservationDetailsContainer();
        
        const statusColor = this.getStatusColor(reservation.status);
        const statusText = this.getStatusText(reservation.status);
        
        container.innerHTML = `
            <div class="reservation-card">
                <div class="reservation-header">
                    <h3>Reservation Details</h3>
                    <span class="status-badge status-${reservation.status}" style="background-color: ${statusColor}">
                        ${statusText}
                    </span>
                </div>
                
                <div class="reservation-info">
                    <div class="info-row">
                        <strong>Confirmation Number:</strong> ${reservation.confirmation_number}
                    </div>
                    <div class="info-row">
                        <strong>Store:</strong> ${reservation.store_name}
                    </div>
                    <div class="info-row">
                        <strong>Customer:</strong> ${reservation.customer_name} (${reservation.customer_email})
                    </div>
                    <div class="info-row">
                        <strong>Reserved:</strong> ${new Date(reservation.reservation_date).toLocaleDateString()}
                    </div>
                    <div class="info-row">
                        <strong>Pickup By:</strong> ${new Date(reservation.pickup_by_date).toLocaleDateString()}
                    </div>
                    ${reservation.special_instructions ? `
                        <div class="info-row">
                            <strong>Instructions:</strong> ${reservation.special_instructions}
                        </div>
                    ` : ''}
                    ${reservation.staff_notes ? `
                        <div class="info-row">
                            <strong>Store Notes:</strong> ${reservation.staff_notes}
                        </div>
                    ` : ''}
                </div>
                
                <div class="reservation-actions">
                    ${this.getReservationActions(reservation)}
                </div>
            </div>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'pending': '#ffc107',
            'confirmed': '#17a2b8',
            'ready': '#28a745',
            'picked_up': '#6c757d',
            'expired': '#dc3545',
            'cancelled': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    getStatusText(status) {
        const texts = {
            'pending': 'Pending Confirmation',
            'confirmed': 'Confirmed',
            'ready': 'Ready for Pickup',
            'picked_up': 'Picked Up',
            'expired': 'Expired',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status;
    }

    getReservationActions(reservation) {
        switch (reservation.status) {
            case 'pending':
            case 'confirmed':
                return `
                    <button class="btn btn-warning" onclick="bopisManager.cancelReservation('${reservation.confirmation_number}')">
                        Cancel Reservation
                    </button>
                `;
            case 'ready':
                return `
                    <div class="pickup-ready">
                        <p><strong>🎉 Your order is ready for pickup!</strong></p>
                        <p>Please bring a valid ID and your confirmation number.</p>
                    </div>
                `;
            case 'expired':
                return `
                    <div class="expired-notice">
                        <p>This reservation has expired. Please contact the store if you still need these items.</p>
                    </div>
                `;
            default:
                return '';
        }
    }

    // Utility methods
    storeReservations(reservations) {
        const stored = JSON.parse(localStorage.getItem('bopis_reservations') || '[]');
        const updated = [...stored, ...reservations];
        localStorage.setItem('bopis_reservations', JSON.stringify(updated));
    }

    loadStoredReservations() {
        const stored = JSON.parse(localStorage.getItem('bopis_reservations') || '[]');
        this.displayRecentReservations(stored);
    }

    displayRecentReservations(reservations) {
        const container = document.getElementById('recent-reservations');
        if (!container || reservations.length === 0) return;

        const recent = reservations.slice(-3).reverse();
        container.innerHTML = `
            <h4>Recent Reservations</h4>
            ${recent.map(reservation => `
                <div class="recent-reservation">
                    <span class="confirmation">${reservation.confirmation_number}</span>
                    <span class="store">${reservation.store_name}</span>
                    <span class="status status-${reservation.status}">${this.getStatusText(reservation.status)}</span>
                    <button class="btn btn-sm btn-link" onclick="bopisManager.trackReservation('${reservation.confirmation_number}')">
                        View Details
                    </button>
                </div>
            `).join('')}
        `;
    }

    showLoading(message) {
        const loader = document.getElementById('bopis-loader') || this.createLoader();
        loader.querySelector('.loading-message').textContent = message;
        loader.style.display = 'block';
    }

    hideLoading() {
        const loader = document.getElementById('bopis-loader');
        if (loader) loader.style.display = 'none';
    }

    showError(message) {
        const errorContainer = document.getElementById('bopis-error') || this.createErrorContainer();
        errorContainer.querySelector('.error-message').textContent = message;
        errorContainer.style.display = 'block';
        
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    createLoader() {
        const loader = document.createElement('div');
        loader.id = 'bopis-loader';
        loader.className = 'bopis-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <div class="loading-message">Loading...</div>
            </div>
        `;
        document.body.appendChild(loader);
        return loader;
    }

    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'bopis-error';
        container.className = 'bopis-error';
        container.innerHTML = `
            <div class="error-content">
                <span class="error-message"></span>
                <button class="close-btn" onclick="this.parentElement.parentElement.style.display='none'">&times;</button>
            </div>
        `;
        document.body.appendChild(container);
        return container;
    }

    closeModal() {
        const modals = document.querySelectorAll('.reservation-success-modal');
        modals.forEach(modal => modal.remove());
    }

    clearCart() {
        if (window.cart && window.cart.clear) {
            window.cart.clear();
        } else {
            localStorage.removeItem('cart');
        }
    }

    changeStore() {
        this.selectedStore = null;
        this.updateSelectedStoreDisplay();
        this.showStoreLocator();
    }

    initializeStoreSelector() {
        // Add BOPIS option to checkout if not already present
        const checkoutForm = document.querySelector('.checkout-form');
        if (checkoutForm && !document.getElementById('fulfillment-options')) {
            this.addFulfillmentOptions(checkoutForm);
        }
    }

    addFulfillmentOptions(checkoutForm) {
        const fulfillmentSection = document.createElement('div');
        fulfillmentSection.id = 'fulfillment-options';
        fulfillmentSection.innerHTML = `
            <h3>Delivery Options</h3>
            <div class="fulfillment-choices">
                <label class="fulfillment-option">
                    <input type="radio" name="fulfillment_type" value="shipping" checked>
                    <span class="option-label">Ship to Address</span>
                    <span class="option-description">Standard shipping (3-5 business days)</span>
                </label>
                <label class="fulfillment-option">
                    <input type="radio" name="fulfillment_type" value="pickup">
                    <span class="option-label">Pick up in Store</span>
                    <span class="option-description">Reserve for pickup at a nearby store</span>
                </label>
            </div>
            <div id="store-selector" style="display: none;">
                <div id="store-options"></div>
                <div id="selected-store-info"></div>
                <div id="inventory-status"></div>
            </div>
        `;
        
        checkoutForm.insertBefore(fulfillmentSection, checkoutForm.querySelector('.payment-section'));
    }
}

// Initialize BOPIS manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bopisManager = new BOPISManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BOPISManager;
}