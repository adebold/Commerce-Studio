/**
 * Customer Portal JavaScript - Agentic Interactive Components
 * VARAi Commerce Studio - SPARC Framework Implementation
 * 
 * Implements intelligent user interactions with autonomous validation,
 * real-time data integration, and predictive user assistance.
 */

class CustomerPortalAgent {
    constructor() {
        this.currentCustomer = null;
        this.currentPlan = null;
        this.availablePlans = [];
        this.billingManager = null;
        this.stripeConfig = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadCustomerData();
            await this.loadPlanData();
            this.setupEventListeners();
            this.initializeBillingManager();
            console.log('Customer Portal Agent initialized successfully');
        } catch (error) {
            console.error('Error initializing Customer Portal Agent:', error);
            this.showError('Failed to initialize portal. Please refresh the page.');
        }
    }

    async loadCustomerData() {
        // Load customer data from localStorage or API
        const storedData = localStorage.getItem('varai_customer_data');
        if (storedData) {
            this.currentCustomer = JSON.parse(storedData);
        } else {
            // Mock customer data for development
            this.currentCustomer = {
                id: 'cus_visioncraft_123',
                email: 'admin@visioncraft.com',
                companyName: 'VisionCraft Eyewear',
                currentPlan: 'professional',
                status: 'active',
                created: '2024-01-15',
                usage: {
                    apiCalls: 65000,
                    storage: 4.5,
                    teamMembers: 8
                }
            };
        }
    }

    async loadPlanData() {
        // Define available plans with features and pricing
        this.availablePlans = [
            {
                id: 'starter',
                name: 'Starter Plan',
                price: 29,
                currency: 'USD',
                interval: 'month',
                features: [
                    '10,000 API calls/month',
                    '1 GB storage',
                    '2 team members',
                    'Basic integrations',
                    'Email support'
                ],
                limits: {
                    apiCalls: 10000,
                    storage: 1,
                    teamMembers: 2
                },
                recommended: false
            },
            {
                id: 'professional',
                name: 'Professional Plan',
                price: 99,
                currency: 'USD',
                interval: 'month',
                features: [
                    '100,000 API calls/month',
                    '10 GB storage',
                    '10 team members',
                    'Advanced integrations',
                    'Priority support',
                    'Analytics dashboard'
                ],
                limits: {
                    apiCalls: 100000,
                    storage: 10,
                    teamMembers: 10
                },
                recommended: true,
                current: this.currentCustomer?.currentPlan === 'professional'
            },
            {
                id: 'enterprise',
                name: 'Enterprise Plan',
                price: 299,
                currency: 'USD',
                interval: 'month',
                features: [
                    'Unlimited API calls',
                    '100 GB storage',
                    'Unlimited team members',
                    'Custom integrations',
                    'Dedicated support',
                    'Advanced analytics',
                    'White-label options'
                ],
                limits: {
                    apiCalls: -1, // Unlimited
                    storage: 100,
                    teamMembers: -1 // Unlimited
                },
                recommended: false
            }
        ];

        this.currentPlan = this.availablePlans.find(plan => 
            plan.id === this.currentCustomer?.currentPlan
        ) || this.availablePlans[1]; // Default to professional
    }

    setupEventListeners() {
        // Plan change button
        const changePlanButtons = document.querySelectorAll('[data-action="change-plan"]');
        changePlanButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handlePlanChange(e));
        });

        // Payment method buttons
        const addPaymentButtons = document.querySelectorAll('[data-action="add-payment-method"]');
        addPaymentButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleAddPaymentMethod(e));
        });

        const updatePaymentButtons = document.querySelectorAll('[data-action="update-payment-method"]');
        updatePaymentButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleUpdatePaymentMethod(e));
        });

        // Form validation
        const forms = document.querySelectorAll('form[data-validate="true"]');
        forms.forEach(form => {
            this.setupFormValidation(form);
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    initializeBillingManager() {
        // Initialize billing manager if available
        if (window.BillingManager) {
            this.billingManager = new BillingManager();
        }
    }

    /**
     * Agentic Plan Change Handler
     * Implements intelligent plan recommendations and autonomous validation
     */
    async handlePlanChange(event) {
        event.preventDefault();
        
        try {
            // Show loading state
            this.showLoadingState(event.target);
            
            // Autonomous validation - check current usage against plan limits
            const usageAnalysis = this.analyzeUsagePatterns();
            const recommendations = this.generatePlanRecommendations(usageAnalysis);
            
            // Create and show plan selection modal
            await this.showPlanSelectionModal(recommendations);
            
        } catch (error) {
            console.error('Error handling plan change:', error);
            this.showError('Unable to load plan options. Please try again.');
        } finally {
            this.hideLoadingState(event.target);
        }
    }

    analyzeUsagePatterns() {
        const usage = this.currentCustomer.usage;
        const currentLimits = this.currentPlan.limits;
        
        return {
            apiUsagePercent: currentLimits.apiCalls > 0 ? 
                (usage.apiCalls / currentLimits.apiCalls) * 100 : 0,
            storageUsagePercent: currentLimits.storage > 0 ? 
                (usage.storage / currentLimits.storage) * 100 : 0,
            teamUsagePercent: currentLimits.teamMembers > 0 ? 
                (usage.teamMembers / currentLimits.teamMembers) * 100 : 0,
            isNearingLimits: false,
            recommendUpgrade: false,
            recommendDowngrade: false
        };
    }

    generatePlanRecommendations(usageAnalysis) {
        const recommendations = [];
        
        // Check if user is nearing limits (>80%)
        if (usageAnalysis.apiUsagePercent > 80 || 
            usageAnalysis.storageUsagePercent > 80 || 
            usageAnalysis.teamUsagePercent > 80) {
            
            usageAnalysis.isNearingLimits = true;
            usageAnalysis.recommendUpgrade = true;
            
            recommendations.push({
                type: 'upgrade',
                title: 'Upgrade Recommended',
                message: 'You\'re approaching your plan limits. Consider upgrading for better performance.',
                urgency: 'high'
            });
        }
        
        // Check if user is under-utilizing (< 30%)
        if (usageAnalysis.apiUsagePercent < 30 && 
            usageAnalysis.storageUsagePercent < 30 && 
            usageAnalysis.teamUsagePercent < 30) {
            
            usageAnalysis.recommendDowngrade = true;
            
            recommendations.push({
                type: 'downgrade',
                title: 'Cost Optimization Available',
                message: 'You might save money with a lower plan based on your usage.',
                urgency: 'low'
            });
        }
        
        return recommendations;
    }

    async showPlanSelectionModal(recommendations = []) {
        const modalHTML = this.createPlanSelectionModalHTML(recommendations);
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = modalHTML;
        
        // Add to DOM
        document.body.appendChild(modalOverlay);
        
        // Setup modal event listeners
        this.setupPlanModalEventListeners(modalOverlay);
        
        // Animate in
        requestAnimationFrame(() => {
            modalOverlay.classList.add('active');
        });
    }

    createPlanSelectionModalHTML(recommendations) {
        const currentPlanId = this.currentPlan.id;
        
        return `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Choose Your Plan</h2>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                
                ${recommendations.length > 0 ? `
                    <div class="recommendations-section">
                        ${recommendations.map(rec => `
                            <div class="recommendation-card ${rec.urgency}">
                                <div class="recommendation-icon">
                                    ${rec.type === 'upgrade' ? '⬆️' : '💡'}
                                </div>
                                <div class="recommendation-content">
                                    <h4>${rec.title}</h4>
                                    <p>${rec.message}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="plans-grid">
                    ${this.availablePlans.map(plan => `
                        <div class="plan-card ${plan.id === currentPlanId ? 'current' : ''} ${plan.recommended ? 'recommended' : ''}" 
                             data-plan-id="${plan.id}">
                            ${plan.recommended ? '<div class="recommended-badge">Recommended</div>' : ''}
                            ${plan.id === currentPlanId ? '<div class="current-badge">Current Plan</div>' : ''}
                            
                            <div class="plan-header">
                                <h3>${plan.name}</h3>
                                <div class="plan-price">
                                    <span class="currency">$</span>
                                    <span class="amount">${plan.price}</span>
                                    <span class="interval">/${plan.interval}</span>
                                </div>
                            </div>
                            
                            <div class="plan-features">
                                <ul>
                                    ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="plan-actions">
                                ${plan.id === currentPlanId ? 
                                    '<button class="btn-secondary" disabled>Current Plan</button>' :
                                    `<button class="btn-primary" data-action="select-plan" data-plan-id="${plan.id}">
                                        ${this.getPlanActionText(plan.id, currentPlanId)}
                                    </button>`
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-footer">
                    <p class="billing-note">
                        <strong>Note:</strong> Plan changes are prorated and will be reflected in your next billing cycle.
                    </p>
                </div>
            </div>
        `;
    }

    getPlanActionText(targetPlanId, currentPlanId) {
        const targetPlan = this.availablePlans.find(p => p.id === targetPlanId);
        const currentPlan = this.availablePlans.find(p => p.id === currentPlanId);
        
        if (targetPlan.price > currentPlan.price) {
            return 'Upgrade Plan';
        } else if (targetPlan.price < currentPlan.price) {
            return 'Downgrade Plan';
        } else {
            return 'Select Plan';
        }
    }

    setupPlanModalEventListeners(modalOverlay) {
        // Plan selection buttons
        const selectButtons = modalOverlay.querySelectorAll('[data-action="select-plan"]');
        selectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const planId = e.target.dataset.planId;
                this.handlePlanSelection(planId);
            });
        });
    }

    async handlePlanSelection(planId) {
        try {
            const targetPlan = this.availablePlans.find(p => p.id === planId);
            if (!targetPlan) {
                throw new Error('Invalid plan selected');
            }

            // Show confirmation modal with billing preview
            await this.showPlanConfirmationModal(targetPlan);
            
        } catch (error) {
            console.error('Error handling plan selection:', error);
            this.showError('Unable to process plan selection. Please try again.');
        }
    }

    async showPlanConfirmationModal(targetPlan) {
        const proratedAmount = this.calculateProration(this.currentPlan, targetPlan);
        const isUpgrade = targetPlan.price > this.currentPlan.price;
        
        const confirmationHTML = `
            <div class="modal-container confirmation-modal">
                <div class="modal-header">
                    <h2>Confirm Plan Change</h2>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                
                <div class="plan-change-summary">
                    <div class="change-direction ${isUpgrade ? 'upgrade' : 'downgrade'}">
                        <div class="plan-from">
                            <h4>Current Plan</h4>
                            <div class="plan-name">${this.currentPlan.name}</div>
                            <div class="plan-price">$${this.currentPlan.price}/${this.currentPlan.interval}</div>
                        </div>
                        
                        <div class="change-arrow">
                            ${isUpgrade ? '⬆️' : '⬇️'}
                        </div>
                        
                        <div class="plan-to">
                            <h4>New Plan</h4>
                            <div class="plan-name">${targetPlan.name}</div>
                            <div class="plan-price">$${targetPlan.price}/${targetPlan.interval}</div>
                        </div>
                    </div>
                    
                    <div class="billing-preview">
                        <h4>Billing Preview</h4>
                        <div class="billing-details">
                            <div class="billing-line">
                                <span>Prorated amount for current period:</span>
                                <span class="amount">$${proratedAmount.toFixed(2)}</span>
                            </div>
                            <div class="billing-line">
                                <span>Next billing date:</span>
                                <span>${this.getNextBillingDate()}</span>
                            </div>
                            <div class="billing-line total">
                                <span>Total due today:</span>
                                <span class="amount">$${Math.max(0, proratedAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="feature-comparison">
                        <h4>What's Changing</h4>
                        <div class="features-grid">
                            <div class="feature-changes">
                                ${this.generateFeatureComparison(this.currentPlan, targetPlan)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-secondary" data-action="cancel-change">Cancel</button>
                    <button class="btn-primary" data-action="confirm-change" data-plan-id="${targetPlan.id}">
                        ${isUpgrade ? 'Upgrade Now' : 'Downgrade Plan'}
                    </button>
                </div>
            </div>
        `;
        
        // Replace modal content
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.innerHTML = confirmationHTML;
            this.setupConfirmationModalEventListeners(existingModal, targetPlan);
        }
    }

    calculateProration(currentPlan, targetPlan) {
        // Simple prorated calculation - in production, this would come from Stripe
        const priceDifference = targetPlan.price - currentPlan.price;
        const daysInMonth = 30;
        const daysRemaining = 15; // Mock remaining days in billing cycle
        
        return (priceDifference * daysRemaining) / daysInMonth;
    }

    getNextBillingDate() {
        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 15); // Mock 15 days from now
        return nextBilling.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    generateFeatureComparison(currentPlan, targetPlan) {
        const comparisons = [];
        
        // Compare API calls
        if (currentPlan.limits.apiCalls !== targetPlan.limits.apiCalls) {
            const change = targetPlan.limits.apiCalls === -1 ? 'Unlimited' : 
                          targetPlan.limits.apiCalls.toLocaleString();
            comparisons.push(`
                <div class="feature-change">
                    <span class="feature-name">API Calls</span>
                    <span class="change-indicator">
                        ${currentPlan.limits.apiCalls === -1 ? 'Unlimited' : currentPlan.limits.apiCalls.toLocaleString()} 
                        → ${change}
                    </span>
                </div>
            `);
        }
        
        // Compare storage
        if (currentPlan.limits.storage !== targetPlan.limits.storage) {
            comparisons.push(`
                <div class="feature-change">
                    <span class="feature-name">Storage</span>
                    <span class="change-indicator">
                        ${currentPlan.limits.storage} GB → ${targetPlan.limits.storage} GB
                    </span>
                </div>
            `);
        }
        
        // Compare team members
        if (currentPlan.limits.teamMembers !== targetPlan.limits.teamMembers) {
            const change = targetPlan.limits.teamMembers === -1 ? 'Unlimited' : 
                          targetPlan.limits.teamMembers;
            comparisons.push(`
                <div class="feature-change">
                    <span class="feature-name">Team Members</span>
                    <span class="change-indicator">
                        ${currentPlan.limits.teamMembers === -1 ? 'Unlimited' : currentPlan.limits.teamMembers} 
                        → ${change}
                    </span>
                </div>
            `);
        }
        
        return comparisons.join('');
    }

    setupConfirmationModalEventListeners(modalOverlay, targetPlan) {
        // Cancel button
        const cancelButton = modalOverlay.querySelector('[data-action="cancel-change"]');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Confirm button
        const confirmButton = modalOverlay.querySelector('[data-action="confirm-change"]');
        if (confirmButton) {
            confirmButton.addEventListener('click', async () => {
                await this.executePlanChange(targetPlan);
            });
        }
    }

    async executePlanChange(targetPlan) {
        try {
            // Show loading state
            const confirmButton = document.querySelector('[data-action="confirm-change"]');
            this.showLoadingState(confirmButton, 'Processing...');
            
            // Simulate API call to change plan
            await this.simulateAPICall('/api/billing/change-plan', {
                customerId: this.currentCustomer.id,
                newPlanId: targetPlan.id
            });
            
            // Update local data
            this.currentCustomer.currentPlan = targetPlan.id;
            this.currentPlan = targetPlan;
            localStorage.setItem('varai_customer_data', JSON.stringify(this.currentCustomer));
            
            // Show success message
            this.showSuccessMessage(`Successfully ${targetPlan.price > this.currentPlan.price ? 'upgraded' : 'changed'} to ${targetPlan.name}!`);
            
            // Close modal
            this.closeModal();
            
            // Update UI
            this.updatePlanDisplays();
            
        } catch (error) {
            console.error('Error executing plan change:', error);
            this.showError('Failed to change plan. Please try again or contact support.');
        }
    }

    async simulateAPICall(endpoint, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate potential errors (10% chance)
        if (Math.random() < 0.1) {
            throw new Error('Simulated API error');
        }
        
        return { success: true, data };
    }

    updatePlanDisplays() {
        // Update current plan displays throughout the page
        const planDisplays = document.querySelectorAll('[data-display="current-plan"]');
        planDisplays.forEach(display => {
            display.textContent = this.currentPlan.name;
        });
        
        const priceDisplays = document.querySelectorAll('[data-display="current-price"]');
        priceDisplays.forEach(display => {
            display.textContent = `$${this.currentPlan.price}`;
        });
    }

    // Payment Method Management
    async handleAddPaymentMethod(event) {
        event.preventDefault();
        
        try {
            this.showLoadingState(event.target);
            
            // Check if Stripe is available
            if (!window.Stripe) {
                throw new Error('Stripe not loaded');
            }
            
            await this.showPaymentMethodModal('add');
            
        } catch (error) {
            console.error('Error adding payment method:', error);
            this.showError('Unable to add payment method. Please try again.');
        } finally {
            this.hideLoadingState(event.target);
        }
    }

    async handleUpdatePaymentMethod(event) {
        event.preventDefault();
        
        const paymentMethodId = event.target.dataset.paymentMethodId;
        
        try {
            this.showLoadingState(event.target);
            await this.showPaymentMethodModal('update', paymentMethodId);
        } catch (error) {
            console.error('Error updating payment method:', error);
            this.showError('Unable to update payment method. Please try again.');
        } finally {
            this.hideLoadingState(event.target);
        }
    }

    async showPaymentMethodModal(mode, paymentMethodId = null) {
        const modalHTML = `
            <div class="modal-container payment-modal">
                <div class="modal-header">
                    <h2>${mode === 'add' ? 'Add Payment Method' : 'Update Payment Method'}</h2>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                
                <div class="payment-form-container">
                    <form id="payment-method-form">
                        <div class="form-group">
                            <label for="card-element">Card Information</label>
                            <div id="card-element" class="stripe-element">
                                <!-- Stripe Elements will create form elements here -->
                            </div>
                            <div id="card-errors" class="error-message" role="alert"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="cardholder-name">Cardholder Name</label>
                            <input type="text" id="cardholder-name" class="form-input" 
                                   placeholder="Full name on card" required>
                        </div>
                        
                        <div class="billing-address-section">
                            <h4>Billing Address</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="billing-address">Street Address</label>
                                    <input type="text" id="billing-address" class="form-input" 
                                           placeholder="123 Main St" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="billing-city">City</label>
                                    <input type="text" id="billing-city" class="form-input" 
                                           placeholder="New York" required>
                                </div>
                                <div class="form-group">
                                    <label for="billing-state">State</label>
                                    <input type="text" id="billing-state" class="form-input" 
                                           placeholder="NY" required>
                                </div>
                                <div class="form-group">
                                    <label for="billing-zip">ZIP Code</label>
                                    <input type="text" id="billing-zip" class="form-input" 
                                           placeholder="10001" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" data-action="cancel">Cancel</button>
                            <button type="submit" class="btn-primary" id="submit-payment-method">
                                ${mode === 'add' ? 'Add Payment Method' : 'Update Payment Method'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Create modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = modalHTML;
        document.body.appendChild(modalOverlay);
        
        // Initialize Stripe Elements
        this.initializeStripeElements(modalOverlay);
        
        // Setup event listeners
        this.setupPaymentModalEventListeners(modalOverlay, mode);
        
        // Animate in
        requestAnimationFrame(() => {
            modalOverlay.classList.add('active');
        });
    }

    initializeStripeElements(modalOverlay) {
        if (!window.Stripe) {
            console.error('Stripe not loaded');
            return;
        }
        
        // Initialize Stripe (use test key for development)
        const stripe = Stripe('pk_test_51234567890'); // Replace with actual publishable key
        const elements = stripe.elements();
        
        // Create card element
        const cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
            },
        });
        
        // Mount card element
        const cardElementContainer = modalOverlay.querySelector('#card-element');
        if (cardElementContainer) {
            cardElement.mount('#card-element');
        }
        
        // Handle real-time validation errors from the card Element
        cardElement.on('change', ({error}) => {
            const displayError = modalOverlay.querySelector('#card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
        // Store references for form submission
        modalOverlay.stripeInstance = stripe;
        modalOverlay.cardElement = cardElement;
    }

    setupPaymentModalEventListeners(modalOverlay, mode) {
        // Cancel button
        const cancelButton = modalOverlay.querySelector('[data-action="cancel"]');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Form submission
        const form = modalOverlay.querySelector('#payment-method-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePaymentMethodSubmission(modalOverlay, mode);
            });
        }
    }

    async handlePaymentMethodSubmission(modalOverlay, mode) {
        const stripe = modalOverlay.stripeInstance;
        const cardElement = modalOverlay.cardElement;
        const submitButton = modalOverlay.querySelector('#submit-payment-method');
        
        if (!stripe || !cardElement) {
            this.showError('Payment system not properly initialized');
            return;
        }
        
        try {
            // Show loading state
            this.showLoadingState(submitButton, 'Processing...');
            
            // Get cardholder name
            const cardholderName = modalOverlay.querySelector('#cardholder-name').value;
            
            // Create payment method
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: cardholderName,
                    address: {
                        line1: modalOverlay.querySelector('#billing-address').value,
                        city: modalOverlay.querySelector('#billing-city').value,
                        state: modalOverlay.querySelector('#billing-state').value,
                        postal_code: modalOverlay.querySelector('#billing-zip').value,
                    },
                },
            });
            
            if (error) {
                throw new Error(error.message);
            }
            
            // Simulate saving payment method to backend
            await this.simulateAPICall('/api/billing/payment-methods', {
                paymentMethodId: paymentMethod.id,
                customerId: this.currentCustomer.id,
                mode: mode
            });
            
            // Show success message
            this.showSuccessMessage(`Payment method ${mode === 'add' ? 'added' : 'updated'} successfully!`);
            
            // Close modal
            this.closeModal();
            
            // Refresh payment methods display
            this.refreshPaymentMethodsDisplay();
            
        } catch (error) {
            console.error('Error processing payment method:', error);
            this.showError(error.message || 'Failed to process payment method. Please try again.');
        } finally {
            this.hideLoadingState(submitButton);
        }
    }

    refreshPaymentMethodsDisplay() {
        // In a real implementation, this would reload payment methods from the API
        // For now, we'll just show a placeholder update
        const paymentMethodsContainer = document.querySelector('.payment-methods-container');
        if (paymentMethodsContainer) {
            // Add visual feedback that payment methods were updated
            const updateIndicator = document.createElement('div');
            updateIndicator.className = 'update-indicator';
            updateIndicator.textContent = 'Payment methods updated';
            updateIndicator.style.cssText = 'color: #10b981; font-size: 14px; margin-top: 8px;';
            paymentMethodsContainer.appendChild(updateIndicator);
            
            // Remove indicator after 3 seconds
            setTimeout(() => {
                if (updateIndicator.parentNode) {
                    updateIndicator.parentNode.removeChild(updateIndicator);
                }
            }, 3000);
        }
    }

    // Form Validation System
    setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            // Clear validation on focus
            input.addEventListener('focus', () => {
                this.clearFieldValidation(input);
            });
        });
        
        // Form submission validation
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const isRequired = field.hasAttribute('required');
        
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        else if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        else if (field.name === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Password validation
        else if (fieldType === 'password' && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            }
        }
        
        // Display validation result
        this.displayFieldValidation(field, isValid, errorMessage);
        
        return isValid;
    }

    displayFieldValidation(field, isValid, errorMessage) {
        // Remove existing validation
        this.clearFieldValidation(field);
        
        // Add validation classes
        field.classList.toggle('field-valid', isValid);
        field.classList.toggle('field-invalid', !isValid);
        
        // Show error message
        if (!isValid && errorMessage) {
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            errorElement.style.cssText = 'color: #ef4444; font-size: 14px; margin-top: 4px;';
            
            field.parentNode.appendChild(errorElement);
        }
    }

    clearFieldValidation(field) {
        field.classList.remove('field-valid', 'field-invalid');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }

    // UI State Management
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

    // Notification System
    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.portal-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `portal-notification ${type}`;
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
            z-index: 10000;
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

    // Modal Management
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Agentic Intelligence Features
    async analyzeUserBehavior() {
        // Collect user interaction data
        const behaviorData = {
            pageViews: this.getPageViewHistory(),
            clickPatterns: this.getClickPatterns(),
            timeSpent: this.getTimeSpentData(),
            featureUsage: this.getFeatureUsageData()
        };
        
        // Generate intelligent recommendations
        return this.generateIntelligentRecommendations(behaviorData);
    }

    getPageViewHistory() {
        // Mock page view data - in production, this would come from analytics
        return [
            { page: 'dashboard', views: 45, avgTime: 180 },
            { page: 'settings', views: 12, avgTime: 240 },
            { page: 'billing', views: 8, avgTime: 120 }
        ];
    }

    getClickPatterns() {
        // Mock click pattern data
        return [
            { element: 'change-plan-button', clicks: 3 },
            { element: 'add-payment-method', clicks: 1 },
            { element: 'usage-metrics', clicks: 15 }
        ];
    }

    getTimeSpentData() {
        // Mock time spent data
        return {
            totalSessions: 23,
            avgSessionDuration: 420, // seconds
            bounceRate: 0.15
        };
    }

    getFeatureUsageData() {
        // Mock feature usage data
        return {
            apiIntegrations: { used: true, frequency: 'daily' },
            analytics: { used: true, frequency: 'weekly' },
            teamManagement: { used: false, frequency: 'never' }
        };
    }

    generateIntelligentRecommendations(behaviorData) {
        const recommendations = [];
        
        // Analyze usage patterns and generate recommendations
        if (behaviorData.clickPatterns.find(p => p.element === 'usage-metrics' && p.clicks > 10)) {
            recommendations.push({
                type: 'feature',
                title: 'Advanced Analytics Available',
                message: 'You frequently check usage metrics. Consider upgrading for detailed analytics.',
                action: 'upgrade-plan',
                priority: 'medium'
            });
        }
        
        if (!behaviorData.featureUsage.teamManagement.used) {
            recommendations.push({
                type: 'feature',
                title: 'Team Collaboration',
                message: 'Add team members to collaborate more effectively.',
                action: 'add-team-members',
                priority: 'low'
            });
        }
        
        return recommendations;
    }

    // Predictive Analytics
    async predictUserNeeds() {
        const usage = this.currentCustomer.usage;
        const predictions = [];
        
        // Predict plan upgrade needs
        if (usage.apiCalls > this.currentPlan.limits.apiCalls * 0.8) {
            predictions.push({
                type: 'upgrade',
                confidence: 0.85,
                timeframe: '7 days',
                recommendation: 'Consider upgrading before hitting API limits'
            });
        }
        
        // Predict storage needs
        if (usage.storage > this.currentPlan.limits.storage * 0.9) {
            predictions.push({
                type: 'storage',
                confidence: 0.92,
                timeframe: '3 days',
                recommendation: 'Storage limit approaching - upgrade recommended'
            });
        }
        
        return predictions;
    }

    // Real-time Data Integration
    async connectWebSocket() {
        // In production, this would connect to a real WebSocket
        console.log('Connecting to real-time data stream...');
        
        // Simulate real-time updates
        setInterval(() => {
            this.updateRealTimeMetrics();
        }, 30000); // Update every 30 seconds
    }

    updateRealTimeMetrics() {
        // Simulate real-time metric updates
        const apiCallsElement = document.querySelector('[data-metric="api-calls"]');
        if (apiCallsElement) {
            const currentCalls = parseInt(apiCallsElement.textContent.replace(/,/g, ''));
            const newCalls = currentCalls + Math.floor(Math.random() * 50);
            apiCallsElement.textContent = newCalls.toLocaleString();
        }
        
        // Update other metrics similarly
        this.updateStorageMetrics();
        this.updateTeamMetrics();
    }

    updateStorageMetrics() {
        const storageElement = document.querySelector('[data-metric="storage"]');
        if (storageElement) {
            const currentStorage = parseFloat(storageElement.textContent);
            const newStorage = Math.min(currentStorage + Math.random() * 0.1, this.currentPlan.limits.storage);
            storageElement.textContent = newStorage.toFixed(1);
        }
    }

    updateTeamMetrics() {
        const teamElement = document.querySelector('[data-metric="team-members"]');
        if (teamElement) {
            // Team members don't change as frequently, so we'll keep this static
            // In a real implementation, this would update when team changes occur
        }
    }

    // Accessibility Enhancements
    enhanceAccessibility() {
        // Add ARIA labels to interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
        
        // Add focus management for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.manageFocusInModal(e);
            }
        });
        
        // Add screen reader announcements
        this.setupScreenReaderAnnouncements();
    }

    manageFocusInModal(event) {
        const modal = document.querySelector('.modal-overlay.active');
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    setupScreenReaderAnnouncements() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }

    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }
}

// Initialize Customer Portal Agent when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.customerPortalAgent = new CustomerPortalAgent();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomerPortalAgent;
}