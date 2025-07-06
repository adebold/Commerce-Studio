/**
 * Payment Method Manager - Enhanced CRUD Operations
 * VARAi Commerce Studio - SPARC Framework Implementation
 * 
 * US-002: Payment Method Management
 * Implements comprehensive payment method CRUD operations with intelligent features
 */

class PaymentMethodManager {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentMethods = [];
        this.defaultPaymentMethod = null;
        this.customerId = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize Stripe
            if (window.Stripe) {
                this.stripe = Stripe(this.getStripePublishableKey());
                this.elements = this.stripe.elements();
            }
            
            // Load customer data
            await this.loadCustomerData();
            
            // Load existing payment methods
            await this.loadPaymentMethods();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Payment Method Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing Payment Method Manager:', error);
        }
    }

    getStripePublishableKey() {
        // In production, this would come from environment variables
        return 'pk_test_51234567890'; // Replace with actual publishable key
    }

    async loadCustomerData() {
        const storedData = localStorage.getItem('varai_customer_data');
        if (storedData) {
            const customerData = JSON.parse(storedData);
            this.customerId = customerData.id;
        }
    }

    async loadPaymentMethods() {
        try {
            // Simulate API call to load payment methods
            const response = await this.simulateAPICall('/api/billing/payment-methods', {
                customerId: this.customerId
            });
            
            this.paymentMethods = response.paymentMethods || this.getMockPaymentMethods();
            this.defaultPaymentMethod = this.paymentMethods.find(pm => pm.isDefault);
            
            this.renderPaymentMethods();
        } catch (error) {
            console.error('Error loading payment methods:', error);
            this.paymentMethods = this.getMockPaymentMethods();
            this.renderPaymentMethods();
        }
    }

    getMockPaymentMethods() {
        return [
            {
                id: 'pm_1234567890',
                type: 'card',
                card: {
                    brand: 'visa',
                    last4: '4242',
                    expMonth: 12,
                    expYear: 2025
                },
                billingDetails: {
                    name: 'John Smith',
                    address: {
                        line1: '123 Innovation Drive',
                        city: 'San Francisco',
                        state: 'CA',
                        postalCode: '94105'
                    }
                },
                isDefault: true,
                created: '2024-01-15T10:30:00Z'
            },
            {
                id: 'pm_0987654321',
                type: 'card',
                card: {
                    brand: 'mastercard',
                    last4: '5555',
                    expMonth: 8,
                    expYear: 2026
                },
                billingDetails: {
                    name: 'John Smith',
                    address: {
                        line1: '456 Business Ave',
                        city: 'San Francisco',
                        state: 'CA',
                        postalCode: '94105'
                    }
                },
                isDefault: false,
                created: '2024-02-20T14:15:00Z'
            }
        ];
    }

    setupEventListeners() {
        // Add payment method buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-payment-method"]')) {
                e.preventDefault();
                this.showAddPaymentMethodModal();
            }
            
            if (e.target.matches('[data-action="edit-payment-method"]')) {
                e.preventDefault();
                const paymentMethodId = e.target.dataset.paymentMethodId;
                this.showEditPaymentMethodModal(paymentMethodId);
            }
            
            if (e.target.matches('[data-action="delete-payment-method"]')) {
                e.preventDefault();
                const paymentMethodId = e.target.dataset.paymentMethodId;
                this.showDeleteConfirmation(paymentMethodId);
            }
            
            if (e.target.matches('[data-action="set-default-payment-method"]')) {
                e.preventDefault();
                const paymentMethodId = e.target.dataset.paymentMethodId;
                this.setDefaultPaymentMethod(paymentMethodId);
            }
        });
    }

    renderPaymentMethods() {
        const container = document.querySelector('.payment-methods-container');
        if (!container) return;

        const html = `
            <div class="payment-methods-header">
                <h3>Payment Methods</h3>
                <button class="btn btn-primary" data-action="add-payment-method">
                    <span class="icon">+</span>
                    Add Payment Method
                </button>
            </div>
            
            <div class="payment-methods-list">
                ${this.paymentMethods.map(pm => this.renderPaymentMethodCard(pm)).join('')}
            </div>
            
            ${this.paymentMethods.length === 0 ? this.renderEmptyState() : ''}
        `;
        
        container.innerHTML = html;
    }

    renderPaymentMethodCard(paymentMethod) {
        const brandIcon = this.getBrandIcon(paymentMethod.card.brand);
        const isDefault = paymentMethod.isDefault;
        
        return `
            <div class="payment-method-card ${isDefault ? 'default' : ''}" data-payment-method-id="${paymentMethod.id}">
                ${isDefault ? '<div class="default-badge">Default</div>' : ''}
                
                <div class="payment-method-info">
                    <div class="card-details">
                        <div class="card-brand">
                            ${brandIcon}
                            <span class="brand-name">${paymentMethod.card.brand.toUpperCase()}</span>
                        </div>
                        <div class="card-number">•••• •••• •••• ${paymentMethod.card.last4}</div>
                        <div class="card-expiry">Expires ${paymentMethod.card.expMonth}/${paymentMethod.card.expYear}</div>
                    </div>
                    
                    <div class="billing-details">
                        <div class="cardholder-name">${paymentMethod.billingDetails.name}</div>
                        <div class="billing-address">
                            ${paymentMethod.billingDetails.address.line1}<br>
                            ${paymentMethod.billingDetails.address.city}, ${paymentMethod.billingDetails.address.state} ${paymentMethod.billingDetails.address.postalCode}
                        </div>
                    </div>
                </div>
                
                <div class="payment-method-actions">
                    ${!isDefault ? `
                        <button class="btn btn-secondary btn-sm" data-action="set-default-payment-method" data-payment-method-id="${paymentMethod.id}">
                            Set as Default
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-secondary btn-sm" data-action="edit-payment-method" data-payment-method-id="${paymentMethod.id}">
                        Edit
                    </button>
                    
                    ${!isDefault ? `
                        <button class="btn btn-danger btn-sm" data-action="delete-payment-method" data-payment-method-id="${paymentMethod.id}">
                            Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getBrandIcon(brand) {
        const icons = {
            visa: '💳',
            mastercard: '💳',
            amex: '💳',
            discover: '💳',
            diners: '💳',
            jcb: '💳',
            unionpay: '💳'
        };
        
        return icons[brand] || '💳';
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">💳</div>
                <h4>No Payment Methods</h4>
                <p>Add a payment method to manage your subscription and billing.</p>
                <button class="btn btn-primary" data-action="add-payment-method">
                    Add Your First Payment Method
                </button>
            </div>
        `;
    }

    async showAddPaymentMethodModal() {
        const modal = this.createPaymentMethodModal('add');
        document.body.appendChild(modal);
        
        // Initialize Stripe Elements
        this.initializeStripeElements(modal);
        
        // Setup form handlers
        this.setupPaymentMethodForm(modal, 'add');
        
        // Show modal
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    async showEditPaymentMethodModal(paymentMethodId) {
        const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
        if (!paymentMethod) return;
        
        const modal = this.createPaymentMethodModal('edit', paymentMethod);
        document.body.appendChild(modal);
        
        // Initialize Stripe Elements
        this.initializeStripeElements(modal);
        
        // Setup form handlers
        this.setupPaymentMethodForm(modal, 'edit', paymentMethod);
        
        // Show modal
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    createPaymentMethodModal(mode, paymentMethod = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay payment-method-modal';
        
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Edit Payment Method' : 'Add Payment Method';
        
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                
                <div class="modal-content">
                    <form id="payment-method-form" class="payment-method-form">
                        <div class="form-section">
                            <h4>Card Information</h4>
                            <div class="form-group">
                                <label for="card-element">Card Details</label>
                                <div id="card-element" class="stripe-element">
                                    <!-- Stripe Elements will create form elements here -->
                                </div>
                                <div id="card-errors" class="error-message" role="alert"></div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Billing Information</h4>
                            <div class="form-group">
                                <label for="cardholder-name">Cardholder Name</label>
                                <input type="text" id="cardholder-name" class="form-input" 
                                       value="${paymentMethod?.billingDetails?.name || ''}" 
                                       placeholder="Full name on card" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="billing-address">Street Address</label>
                                <input type="text" id="billing-address" class="form-input" 
                                       value="${paymentMethod?.billingDetails?.address?.line1 || ''}"
                                       placeholder="123 Main St" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="billing-city">City</label>
                                    <input type="text" id="billing-city" class="form-input" 
                                           value="${paymentMethod?.billingDetails?.address?.city || ''}"
                                           placeholder="New York" required>
                                </div>
                                <div class="form-group">
                                    <label for="billing-state">State</label>
                                    <input type="text" id="billing-state" class="form-input" 
                                           value="${paymentMethod?.billingDetails?.address?.state || ''}"
                                           placeholder="NY" required>
                                </div>
                                <div class="form-group">
                                    <label for="billing-zip">ZIP Code</label>
                                    <input type="text" id="billing-zip" class="form-input" 
                                           value="${paymentMethod?.billingDetails?.address?.postalCode || ''}"
                                           placeholder="10001" required>
                                </div>
                            </div>
                        </div>
                        
                        ${!isEdit ? `
                            <div class="form-section">
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="set-as-default" checked>
                                        <span class="checkmark"></span>
                                        Set as default payment method
                                    </label>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" data-action="cancel">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary" id="submit-payment-method">
                                ${isEdit ? 'Update Payment Method' : 'Add Payment Method'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        return modal;
    }

    initializeStripeElements(modal) {
        if (!this.stripe) return;
        
        const cardElement = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });
        
        const cardElementContainer = modal.querySelector('#card-element');
        if (cardElementContainer) {
            cardElement.mount('#card-element');
        }
        
        // Handle real-time validation errors
        cardElement.on('change', ({error}) => {
            const displayError = modal.querySelector('#card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
        // Store reference
        modal.cardElement = cardElement;
    }

    setupPaymentMethodForm(modal, mode, paymentMethod = null) {
        const form = modal.querySelector('#payment-method-form');
        const cancelButton = modal.querySelector('[data-action="cancel"]');
        const closeButton = modal.querySelector('.modal-close');
        
        // Cancel and close handlers
        [cancelButton, closeButton].forEach(button => {
            if (button) {
                button.addEventListener('click', () => {
                    this.closeModal(modal);
                });
            }
        });
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePaymentMethodSubmission(modal, mode, paymentMethod);
        });
        
        // Escape key handler
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
        modal.escapeHandler = escapeHandler;
    }

    async handlePaymentMethodSubmission(modal, mode, existingPaymentMethod = null) {
        const submitButton = modal.querySelector('#submit-payment-method');
        const cardElement = modal.cardElement;
        
        if (!this.stripe || !cardElement) {
            this.showError('Payment system not properly initialized');
            return;
        }
        
        try {
            // Show loading state
            this.showLoadingState(submitButton, 'Processing...');
            
            // Get form data
            const formData = this.getFormData(modal);
            
            let paymentMethodId;
            
            if (mode === 'add') {
                // Create new payment method
                const {error, paymentMethod} = await this.stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    billing_details: {
                        name: formData.cardholderName,
                        address: {
                            line1: formData.billingAddress,
                            city: formData.billingCity,
                            state: formData.billingState,
                            postal_code: formData.billingZip,
                        },
                    },
                });
                
                if (error) {
                    throw new Error(error.message);
                }
                
                paymentMethodId = paymentMethod.id;
                
                // Save to backend
                await this.savePaymentMethod(paymentMethod, formData.setAsDefault);
                
            } else {
                // Update existing payment method
                paymentMethodId = existingPaymentMethod.id;
                await this.updatePaymentMethod(paymentMethodId, formData);
            }
            
            // Show success message
            this.showSuccessMessage(`Payment method ${mode === 'add' ? 'added' : 'updated'} successfully!`);
            
            // Close modal
            this.closeModal(modal);
            
            // Reload payment methods
            await this.loadPaymentMethods();
            
        } catch (error) {
            console.error('Error processing payment method:', error);
            this.showError(error.message || 'Failed to process payment method. Please try again.');
        } finally {
            this.hideLoadingState(submitButton);
        }
    }

    getFormData(modal) {
        return {
            cardholderName: modal.querySelector('#cardholder-name').value,
            billingAddress: modal.querySelector('#billing-address').value,
            billingCity: modal.querySelector('#billing-city').value,
            billingState: modal.querySelector('#billing-state').value,
            billingZip: modal.querySelector('#billing-zip').value,
            setAsDefault: modal.querySelector('#set-as-default')?.checked || false
        };
    }

    async savePaymentMethod(paymentMethod, setAsDefault) {
        // Simulate API call to save payment method
        await this.simulateAPICall('/api/billing/payment-methods', {
            customerId: this.customerId,
            paymentMethodId: paymentMethod.id,
            setAsDefault: setAsDefault
        });
        
        // Add to local array
        const newPaymentMethod = {
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: paymentMethod.card,
            billingDetails: paymentMethod.billing_details,
            isDefault: setAsDefault,
            created: new Date().toISOString()
        };
        
        // If setting as default, update existing default
        if (setAsDefault) {
            this.paymentMethods.forEach(pm => pm.isDefault = false);
            this.defaultPaymentMethod = newPaymentMethod;
        }
        
        this.paymentMethods.push(newPaymentMethod);
    }

    async updatePaymentMethod(paymentMethodId, formData) {
        // Simulate API call to update payment method
        await this.simulateAPICall(`/api/billing/payment-methods/${paymentMethodId}`, formData);
        
        // Update local array
        const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
        if (paymentMethod) {
            paymentMethod.billingDetails.name = formData.cardholderName;
            paymentMethod.billingDetails.address = {
                line1: formData.billingAddress,
                city: formData.billingCity,
                state: formData.billingState,
                postalCode: formData.billingZip
            };
        }
    }

    async setDefaultPaymentMethod(paymentMethodId) {
        try {
            // Show loading state
            const button = document.querySelector(`[data-payment-method-id="${paymentMethodId}"] [data-action="set-default-payment-method"]`);
            if (button) {
                this.showLoadingState(button, 'Setting...');
            }
            
            // Simulate API call
            await this.simulateAPICall(`/api/billing/payment-methods/${paymentMethodId}/set-default`, {
                customerId: this.customerId
            });
            
            // Update local state
            this.paymentMethods.forEach(pm => {
                pm.isDefault = pm.id === paymentMethodId;
            });
            
            this.defaultPaymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
            
            // Re-render
            this.renderPaymentMethods();
            
            this.showSuccessMessage('Default payment method updated successfully!');
            
        } catch (error) {
            console.error('Error setting default payment method:', error);
            this.showError('Failed to update default payment method. Please try again.');
        }
    }

    async showDeleteConfirmation(paymentMethodId) {
        const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
        if (!paymentMethod) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay confirmation-modal';
        
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Delete Payment Method</h2>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                
                <div class="modal-content">
                    <div class="confirmation-content">
                        <div class="warning-icon">⚠️</div>
                        <h3>Are you sure?</h3>
                        <p>This will permanently delete the payment method ending in <strong>${paymentMethod.card.last4}</strong>.</p>
                        <p class="warning-text">This action cannot be undone.</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                        <button class="btn btn-danger" data-action="confirm-delete" data-payment-method-id="${paymentMethodId}">
                            Delete Payment Method
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup handlers
        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('[data-action="confirm-delete"]').addEventListener('click', async () => {
            await this.deletePaymentMethod(paymentMethodId);
            this.closeModal(modal);
        });
        
        // Show modal
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    async deletePaymentMethod(paymentMethodId) {
        try {
            // Simulate API call
            await this.simulateAPICall(`/api/billing/payment-methods/${paymentMethodId}`, {}, 'DELETE');
            
            // Remove from local array
            this.paymentMethods = this.paymentMethods.filter(pm => pm.id !== paymentMethodId);
            
            // If this was the default, set a new default
            if (this.defaultPaymentMethod?.id === paymentMethodId) {
                this.defaultPaymentMethod = this.paymentMethods[0] || null;
                if (this.defaultPaymentMethod) {
                    this.defaultPaymentMethod.isDefault = true;
                }
            }
            
            // Re-render
            this.renderPaymentMethods();
            
            this.showSuccessMessage('Payment method deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting payment method:', error);
            this.showError('Failed to delete payment method. Please try again.');
        }
    }

    closeModal(modal) {
        modal.classList.add('closing');
        
        // Remove escape handler
        if (modal.escapeHandler) {
            document.removeEventListener('keydown', modal.escapeHandler);
        }
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Utility methods
    async simulateAPICall(endpoint, data = {}, method = 'POST') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Simulate potential errors (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Network error occurred');
        }
        
        return { success: true, data };
    }

    showLoadingState(element, text = 'Loading...') {
        if (!element) return;
        
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.innerHTML = `
            <span class="loading-spinner"></span>
            ${text}
        `;
        element.classList.add('loading');
    }

    hideLoadingState(element) {
        if (!element) return;
        
        element.disabled = false;
        element.textContent = element.dataset.originalText || 'Submit';
        element.classList.remove('loading');
        delete element.dataset.originalText;
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.payment-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `payment-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            max-width: 400px;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Setup close handler
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize Payment Method Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.payment-methods-container')) {
        window.paymentMethodManager = new PaymentMethodManager();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentMethodManager;
}