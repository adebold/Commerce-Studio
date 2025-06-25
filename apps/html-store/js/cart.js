/**
 * VisionCraft Eyewear - Shopping Cart Management
 * 
 * Handles cart state, persistence, and UI interactions
 */

class CartManager {
    constructor() {
        this.storageKey = 'visioncraft_cart';
        this.cart = this.loadCart();
        this.listeners = [];
        this.init();
    }

    init() {
        this.updateCartUI();
        this.setupEventListeners();
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {
                items: [],
                total: 0,
                itemCount: 0,
                currency: 'USD'
            };
        } catch (error) {
            console.error('Error loading cart:', error);
            return { items: [], total: 0, itemCount: 0, currency: 'USD' };
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            this.notifyListeners();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    /**
     * Add item to cart
     */
    addItem(product, quantity = 1) {
        const existingItem = this.cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.items.push({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.image,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.updateTotals();
        this.saveCart();
        this.updateCartUI();
        this.showAddToCartNotification(product.name);
    }

    /**
     * Remove item from cart
     */
    removeItem(productId) {
        const itemIndex = this.cart.items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const removedItem = this.cart.items[itemIndex];
            this.cart.items.splice(itemIndex, 1);
            this.updateTotals();
            this.saveCart();
            this.updateCartUI();
            this.showNotification(`Removed "${removedItem.name}" from cart`, 'info');
        }
    }

    /**
     * Update item quantity
     */
    updateQuantity(productId, quantity) {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.updateTotals();
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    /**
     * Clear entire cart
     */
    clearCart() {
        this.cart = { items: [], total: 0, itemCount: 0, currency: 'USD' };
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Cart cleared', 'info');
    }

    /**
     * Update cart totals
     */
    updateTotals() {
        this.cart.total = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cart.itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Get cart summary
     */
    getCart() {
        return { ...this.cart };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for cart icon clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-toggle')) {
                e.preventDefault();
                this.toggleCartSidebar();
            }
        });

        // Listen for cart item actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-item-remove')) {
                e.preventDefault();
                const productId = e.target.closest('.cart-item-remove').dataset.productId;
                this.removeItem(productId);
            }
            
            if (e.target.closest('.cart-item-quantity-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.cart-item-quantity-btn');
                const productId = btn.dataset.productId;
                const action = btn.dataset.action;
                const item = this.cart.items.find(item => item.id === productId);
                
                if (item) {
                    if (action === 'increase') {
                        this.updateQuantity(productId, item.quantity + 1);
                    } else if (action === 'decrease') {
                        this.updateQuantity(productId, item.quantity - 1);
                    }
                }
            }
            
            // Handle checkout button
            if (e.target.closest('#checkoutBtn')) {
                e.preventDefault();
                this.proceedToCheckout();
            }
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartToggle = e.target.closest('.cart-toggle');
            
            if (cartSidebar && cartSidebar.classList.contains('show') && !cartSidebar.contains(e.target) && !cartToggle) {
                this.closeCartSidebar();
            }
        });
    }

    /**
     * Update cart UI elements
     */
    updateCartUI() {
        this.updateCartIcon();
        this.updateCartSidebar();
    }

    /**
     * Update cart icon and badge
     */
    updateCartIcon() {
        const cartBadge = document.querySelector('.cart-badge');
        const cartCount = document.querySelector('.cart-count');
        
        if (cartBadge) {
            cartBadge.textContent = this.cart.itemCount;
            cartBadge.style.display = this.cart.itemCount > 0 ? 'inline-block' : 'none';
        }
        
        if (cartCount) {
            cartCount.textContent = this.cart.itemCount;
        }
    }

    /**
     * Update cart sidebar content
     */
    updateCartSidebar() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartContent = document.getElementById('cartContent');
        
        if (!cartItems) return;

        if (this.cart.items.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'block';
            if (cartContent) cartContent.style.display = 'none';
            return;
        }

        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';

        // Update cart items
        cartItems.innerHTML = this.cart.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h6 class="cart-item-name">${item.name}</h6>
                    <p class="cart-item-brand">${item.brand}</p>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="btn btn-sm btn-outline-secondary cart-item-quantity-btn" 
                                data-product-id="${item.id}" data-action="decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary cart-item-quantity-btn" 
                                data-product-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline-danger cart-item-remove" 
                            data-product-id="${item.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Update total
        if (cartTotal) {
            cartTotal.textContent = `$${this.cart.total.toFixed(2)}`;
        }
    }

    /**
     * Toggle cart sidebar
     */
    toggleCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('show');
        }
    }

    /**
     * Close cart sidebar
     */
    closeCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('show');
        }
    }

    /**
     * Show add to cart notification
     */
    showAddToCartNotification(productName) {
        this.showNotification(`Added "${productName}" to cart!`, 'success');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show cart-notification`;
        notification.style.cssText = 'position: fixed; top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    /**
     * Proceed to checkout
     */
    proceedToCheckout() {
        if (this.cart.items.length === 0) {
            this.showNotification('Your cart is empty', 'warning');
            return;
        }

        // Track checkout start for analytics
        if (typeof trackCheckoutStart === 'function') {
            trackCheckoutStart(this.cart.items);
        }

        // For now, show a modal with checkout information
        // In a real implementation, this would redirect to a checkout page
        this.showCheckoutModal();
    }

    /**
     * Show checkout modal with store pickup options
     */
    showCheckoutModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'checkoutModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Checkout Options</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Fulfillment Options -->
                        <div class="mb-4">
                            <h6 class="mb-3">Choose Fulfillment Option</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card fulfillment-option" data-option="pickup">
                                        <div class="card-body text-center">
                                            <i class="bi bi-shop fs-2 text-primary mb-2"></i>
                                            <h6>In-Store Pickup</h6>
                                            <p class="text-muted small">Try before you buy<br>Ready in 2 hours</p>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="fulfillment" id="pickup" value="pickup" checked>
                                                <label class="form-check-label" for="pickup">Select Pickup</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card fulfillment-option" data-option="shipping">
                                        <div class="card-body text-center">
                                            <i class="bi bi-truck fs-2 text-primary mb-2"></i>
                                            <h6>Home Delivery</h6>
                                            <p class="text-muted small">Delivered to your door<br>3-5 business days</p>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="fulfillment" id="shipping" value="shipping">
                                                <label class="form-check-label" for="shipping">Select Shipping</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Store Selection (shown for pickup) -->
                        <div id="storeSelection" class="mb-4">
                            <h6 class="mb-3">Select Store Location</h6>
                            <div class="store-list">
                                <div class="card store-option mb-2" data-store="downtown">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 class="mb-1">VisionCraft Downtown</h6>
                                                <p class="text-muted mb-1">123 Main Street, Downtown</p>
                                                <small class="text-success">✓ All items available</small>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="store" id="store-downtown" value="downtown" checked>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card store-option mb-2" data-store="mall">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 class="mb-1">VisionCraft Mall</h6>
                                                <p class="text-muted mb-1">456 Shopping Center, Mall District</p>
                                                <small class="text-success">✓ All items available</small>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="store" id="store-mall" value="mall">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card store-option mb-2" data-store="westside">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 class="mb-1">VisionCraft Westside</h6>
                                                <p class="text-muted mb-1">789 West Avenue, Westside</p>
                                                <small class="text-warning">⚠ Limited availability</small>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="store" id="store-westside" value="westside">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Customer Information -->
                        <div class="mb-4">
                            <h6 class="mb-3">Contact Information</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="customerName" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="customerName" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="customerPhone" class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" id="customerPhone" required>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="customerEmail" class="form-label">Email Address</label>
                                <input type="email" class="form-control" id="customerEmail" required>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="checkout-summary">
                            <h6>Order Summary</h6>
                            <div class="checkout-items">
                                ${this.cart.items.map(item => `
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong>${item.name}</strong><br>
                                            <small class="text-muted">${item.brand} × ${item.quantity}</small>
                                        </div>
                                        <div class="text-end">
                                            <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between align-items-center">
                                <strong>Total: $${this.cart.total.toFixed(2)}</strong>
                            </div>
                            <div class="mt-3">
                                <p class="text-muted small">
                                    <i class="bi bi-info-circle me-1"></i>
                                    This is a demo store. In a real implementation, you would be redirected to a secure checkout page.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Shopping</button>
                        <button type="button" class="btn btn-primary-custom" onclick="window.cartManager.completeCheckout()">
                            <span id="checkoutButtonText">Reserve for Pickup</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // Add event listeners for fulfillment options
        modal.addEventListener('change', (e) => {
            if (e.target.name === 'fulfillment') {
                const storeSelection = modal.querySelector('#storeSelection');
                const checkoutButtonText = modal.querySelector('#checkoutButtonText');
                
                if (e.target.value === 'pickup') {
                    storeSelection.style.display = 'block';
                    checkoutButtonText.textContent = 'Reserve for Pickup';
                } else {
                    storeSelection.style.display = 'none';
                    checkoutButtonText.textContent = 'Place Order';
                }
            }
        });

        // Add click handlers for fulfillment cards
        modal.querySelectorAll('.fulfillment-option').forEach(card => {
            card.addEventListener('click', () => {
                const radio = card.querySelector('input[type="radio"]');
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            });
        });

        // Add click handlers for store cards
        modal.querySelectorAll('.store-option').forEach(card => {
            card.addEventListener('click', () => {
                const radio = card.querySelector('input[type="radio"]');
                radio.checked = true;
            });
        });

        // Clean up modal when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    /**
     * Complete checkout with store pickup information
     */
    completeCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;

        // Get form data
        const fulfillmentType = modal.querySelector('input[name="fulfillment"]:checked')?.value || 'pickup';
        const selectedStore = modal.querySelector('input[name="store"]:checked')?.value || 'downtown';
        const customerName = modal.querySelector('#customerName')?.value;
        const customerPhone = modal.querySelector('#customerPhone')?.value;
        const customerEmail = modal.querySelector('#customerEmail')?.value;

        // Validate required fields
        if (!customerName || !customerPhone || !customerEmail) {
            this.showNotification('Please fill in all contact information', 'warning');
            return;
        }

        // Create order data
        const orderData = {
            id: 'ORD-' + Date.now(),
            items: [...this.cart.items],
            total: this.cart.total,
            fulfillmentType,
            selectedStore,
            customer: {
                name: customerName,
                phone: customerPhone,
                email: customerEmail
            },
            status: fulfillmentType === 'pickup' ? 'ready-for-pickup' : 'processing',
            createdAt: new Date().toISOString()
        };

        // Store order in localStorage (in real app, this would go to backend)
        const orders = JSON.parse(localStorage.getItem('visioncraft_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('visioncraft_orders', JSON.stringify(orders));

        // Track purchase for analytics
        if (typeof trackPurchase === 'function') {
            trackPurchase(this.cart.items, this.cart.total);
        }

        // Clear the cart
        this.clearCart();

        // Close modal
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }

        // Show success message with order details
        const storeNames = {
            downtown: 'VisionCraft Downtown',
            mall: 'VisionCraft Mall',
            westside: 'VisionCraft Westside'
        };

        let successMessage;
        if (fulfillmentType === 'pickup') {
            successMessage = `Order reserved! Pick up at ${storeNames[selectedStore]} in 2 hours. Order #${orderData.id}`;
        } else {
            successMessage = `Order placed successfully! You'll receive shipping updates at ${customerEmail}. Order #${orderData.id}`;
        }

        this.showNotification(successMessage, 'success');
        
        // Close cart sidebar
        this.closeCart();

        // Show order confirmation modal after a brief delay
        setTimeout(() => {
            this.showOrderConfirmation(orderData, storeNames);
        }, 1000);
    }

    /**
     * Show order confirmation modal
     */
    showOrderConfirmation(orderData, storeNames) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'orderConfirmationModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-check-circle me-2"></i>Order Confirmed!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <h6>Order #${orderData.id}</h6>
                            <p class="text-muted">Thank you, ${orderData.customer.name}!</p>
                        </div>
                        
                        ${orderData.fulfillmentType === 'pickup' ? `
                            <div class="alert alert-info">
                                <h6><i class="bi bi-shop me-2"></i>Ready for Pickup</h6>
                                <p class="mb-1"><strong>Store:</strong> ${storeNames[orderData.selectedStore]}</p>
                                <p class="mb-1"><strong>Estimated Ready Time:</strong> 2 hours</p>
                                <p class="mb-0"><strong>Bring:</strong> Photo ID and order confirmation</p>
                            </div>
                        ` : `
                            <div class="alert alert-info">
                                <h6><i class="bi bi-truck me-2"></i>Shipping Information</h6>
                                <p class="mb-1"><strong>Estimated Delivery:</strong> 3-5 business days</p>
                                <p class="mb-0"><strong>Tracking info will be sent to:</strong> ${orderData.customer.email}</p>
                            </div>
                        `}
                        
                        <div class="order-summary mt-3">
                            <h6>Items Ordered:</h6>
                            ${orderData.items.map(item => `
                                <div class="d-flex justify-content-between mb-1">
                                    <span>${item.name} × ${item.quantity}</span>
                                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <hr>
                            <div class="d-flex justify-content-between">
                                <strong>Total: $${orderData.total.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary-custom" onclick="window.print()">
                            <i class="bi bi-printer me-2"></i>Print Confirmation
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // Clean up modal when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    /**
     * Add change listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of cart changes
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.getCart());
            } catch (error) {
                console.error('Error in cart listener:', error);
            }
        });
    }
}

// Create global cart manager instance
window.cartManager = new CartManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}