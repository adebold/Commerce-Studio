// Billing Manager for VARAi Connected Apps
// Handles Stripe integration and billing operations

class BillingManager {
    constructor() {
        this.stripeConfig = new StripeConfig();
        this.stripeAPI = new StripeAPI();
        this.currentCustomer = null;
        this.currentSubscription = null;
        this.paymentMethods = [];
        this.invoices = [];
        this.tokenBalance = 0;
        this.monthlyAllowance = 0;
        
        this.init();
    }

    async init() {
        try {
            await this.loadCustomerData();
            await this.loadBillingData();
            this.setupEventListeners();
            this.renderBillingInterface();
        } catch (error) {
            console.error('Error initializing billing manager:', error);
            this.showError('Failed to load billing information');
        }
    }

    async loadCustomerData() {
        // Mock customer data - replace with actual API call
        this.currentCustomer = {
            id: 'cus_mock_123',
            email: 'customer@example.com',
            name: 'Acme Eyewear Co.',
            plan: 'professional',
            status: 'active',
            created: '2024-01-15'
        };

        // Load token balance and usage
        this.tokenBalance = 6500;
        this.monthlyAllowance = 10000;
        this.tokensUsed = 3500;
        this.tokensRemaining = this.tokenBalance;
    }

    async loadBillingData() {
        try {
            // Load subscription data
            this.currentSubscription = {
                id: 'sub_mock_123',
                status: 'active',
                current_period_start: Math.floor(Date.now() / 1000) - 86400 * 15,
                current_period_end: Math.floor(Date.now() / 1000) + 86400 * 15,
                plan: this.stripeConfig.getProductByPlan(this.currentCustomer.plan),
                cancel_at_period_end: false
            };

            // Load payment methods
            this.paymentMethods = [
                {
                    id: 'pm_mock_123',
                    type: 'card',
                    card: {
                        brand: 'visa',
                        last4: '4242',
                        exp_month: 12,
                        exp_year: 2025
                    },
                    is_default: true
                }
            ];

            // Load recent invoices
            this.invoices = [
                {
                    id: 'in_mock_123',
                    amount_paid: 19900,
                    currency: 'usd',
                    status: 'paid',
                    created: Math.floor(Date.now() / 1000) - 86400 * 30,
                    hosted_invoice_url: '#',
                    period_start: Math.floor(Date.now() / 1000) - 86400 * 60,
                    period_end: Math.floor(Date.now() / 1000) - 86400 * 30
                },
                {
                    id: 'in_mock_124',
                    amount_paid: 19900,
                    currency: 'usd',
                    status: 'paid',
                    created: Math.floor(Date.now() / 1000) - 86400 * 60,
                    hosted_invoice_url: '#',
                    period_start: Math.floor(Date.now() / 1000) - 86400 * 90,
                    period_end: Math.floor(Date.now() / 1000) - 86400 * 60
                }
            ];
        } catch (error) {
            console.error('Error loading billing data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Plan change buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.plan-upgrade-btn')) {
                const plan = e.target.dataset.plan;
                this.handlePlanChange(plan);
            }
            
            if (e.target.matches('.cancel-subscription-btn')) {
                this.handleSubscriptionCancellation();
            }
            
            if (e.target.matches('.reactivate-subscription-btn')) {
                this.handleSubscriptionReactivation();
            }
            
            if (e.target.matches('.buy-tokens-btn')) {
                const packageType = e.target.dataset.package;
                this.handleTokenPurchase(packageType);
            }
            
            if (e.target.matches('.add-payment-method-btn')) {
                this.handleAddPaymentMethod();
            }
            
            if (e.target.matches('.remove-payment-method-btn')) {
                const paymentMethodId = e.target.dataset.paymentMethodId;
                this.handleRemovePaymentMethod(paymentMethodId);
            }
        });
    }

    renderBillingInterface() {
        this.renderCurrentPlan();
        this.renderTokenBalance();
        this.renderPaymentMethods();
        this.renderInvoiceHistory();
        this.renderPlanOptions();
        this.renderTokenPackages();
    }

    renderCurrentPlan() {
        const currentPlanElement = document.getElementById('currentPlan');
        if (!currentPlanElement) return;

        const plan = this.currentSubscription.plan;
        const nextBillingDate = new Date(this.currentSubscription.current_period_end * 1000);
        const cancelAtPeriodEnd = this.currentSubscription.cancel_at_period_end;

        currentPlanElement.innerHTML = `
            <div class="current-plan-card">
                <div class="plan-header">
                    <h3>${plan.name}</h3>
                    <div class="plan-price">$${plan.price}/month</div>
                </div>
                <div class="plan-details">
                    <p>${plan.description}</p>
                    <div class="billing-info">
                        ${cancelAtPeriodEnd ? 
                            `<div class="cancellation-notice">
                                <span class="status-badge cancelled">Cancelling</span>
                                <p>Your subscription will end on ${nextBillingDate.toLocaleDateString()}</p>
                                <button class="btn-primary reactivate-subscription-btn">Reactivate</button>
                            </div>` :
                            `<p>Next billing: ${nextBillingDate.toLocaleDateString()}</p>
                             <button class="btn-secondary cancel-subscription-btn">Cancel Subscription</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    renderTokenBalance() {
        const tokenBalanceElement = document.getElementById('tokenBalance');
        if (!tokenBalanceElement) return;

        const usagePercent = ((this.monthlyAllowance - this.tokensRemaining) / this.monthlyAllowance) * 100;
        const resetDate = new Date(this.currentSubscription.current_period_end * 1000);

        tokenBalanceElement.innerHTML = `
            <div class="token-balance-card">
                <div class="balance-header">
                    <h3>Token Balance</h3>
                    <div class="balance-amount">${this.tokensRemaining.toLocaleString()}</div>
                </div>
                <div class="usage-bar">
                    <div class="usage-fill" style="width: ${usagePercent}%"></div>
                </div>
                <div class="usage-details">
                    <p>Used: ${(this.monthlyAllowance - this.tokensRemaining).toLocaleString()} / ${this.monthlyAllowance.toLocaleString()}</p>
                    <p>Resets: ${resetDate.toLocaleDateString()}</p>
                </div>
            </div>
        `;
    }

    renderPaymentMethods() {
        const paymentMethodsElement = document.getElementById('paymentMethods');
        if (!paymentMethodsElement) return;

        const paymentMethodsHTML = this.paymentMethods.map(pm => `
            <div class="payment-method-card">
                <div class="payment-method-info">
                    <div class="card-icon">💳</div>
                    <div class="card-details">
                        <div class="card-brand">${pm.card.brand.toUpperCase()} •••• ${pm.card.last4}</div>
                        <div class="card-expiry">Expires ${pm.card.exp_month}/${pm.card.exp_year}</div>
                    </div>
                    ${pm.is_default ? '<span class="default-badge">Default</span>' : ''}
                </div>
                <div class="payment-method-actions">
                    ${!pm.is_default ? `<button class="btn-danger remove-payment-method-btn" data-payment-method-id="${pm.id}">Remove</button>` : ''}
                </div>
            </div>
        `).join('');

        paymentMethodsElement.innerHTML = `
            <div class="payment-methods-section">
                <div class="section-header">
                    <h3>Payment Methods</h3>
                    <button class="btn-primary add-payment-method-btn">Add Payment Method</button>
                </div>
                <div class="payment-methods-list">
                    ${paymentMethodsHTML}
                </div>
            </div>
        `;
    }

    renderInvoiceHistory() {
        const invoiceHistoryElement = document.getElementById('invoiceHistory');
        if (!invoiceHistoryElement) return;

        const invoicesHTML = this.invoices.map(invoice => {
            const date = new Date(invoice.created * 1000);
            const amount = (invoice.amount_paid / 100).toFixed(2);
            
            return `
                <div class="invoice-row">
                    <div class="invoice-date">${date.toLocaleDateString()}</div>
                    <div class="invoice-description">Monthly Subscription</div>
                    <div class="invoice-amount">$${amount}</div>
                    <div class="invoice-status">
                        <span class="status-badge ${invoice.status}">${invoice.status}</span>
                    </div>
                    <div class="invoice-actions">
                        <a href="${invoice.hosted_invoice_url}" target="_blank" class="btn-link">View</a>
                    </div>
                </div>
            `;
        }).join('');

        invoiceHistoryElement.innerHTML = `
            <div class="invoice-history-section">
                <h3>Invoice History</h3>
                <div class="invoice-list">
                    <div class="invoice-header">
                        <div>Date</div>
                        <div>Description</div>
                        <div>Amount</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>
                    ${invoicesHTML}
                </div>
            </div>
        `;
    }

    renderPlanOptions() {
        const planOptionsElement = document.getElementById('planOptions');
        if (!planOptionsElement) return;

        const plans = this.stripeConfig.getAllPlans();
        const currentPlan = this.currentCustomer.plan;

        const plansHTML = plans.map(plan => {
            const isCurrent = plan.name.toLowerCase().includes(currentPlan);
            const isUpgrade = plan.price > this.currentSubscription.plan.price;
            
            return `
                <div class="plan-option-card ${isCurrent ? 'current-plan' : ''}">
                    <div class="plan-name">${plan.name}</div>
                    <div class="plan-price">$${plan.price}/month</div>
                    <div class="plan-description">${plan.description}</div>
                    <div class="plan-features">
                        <ul>
                            <li>${plan.tokens === -1 ? 'Unlimited' : plan.tokens.toLocaleString()} tokens/month</li>
                            <li>All AI services included</li>
                            <li>24/7 support</li>
                            ${plan.name === 'Enterprise Plan' ? '<li>Custom integrations</li>' : ''}
                        </ul>
                    </div>
                    <div class="plan-actions">
                        ${isCurrent ? 
                            '<button class="btn-secondary" disabled>Current Plan</button>' :
                            `<button class="btn-primary plan-upgrade-btn" data-plan="${plan.name.toLowerCase().split(' ')[0]}">${isUpgrade ? 'Upgrade' : 'Downgrade'}</button>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        planOptionsElement.innerHTML = `
            <div class="plan-options-section">
                <h3>Available Plans</h3>
                <div class="plan-options-grid">
                    ${plansHTML}
                </div>
            </div>
        `;
    }

    renderTokenPackages() {
        const tokenPackagesElement = document.getElementById('tokenPackages');
        if (!tokenPackagesElement) return;

        const packages = this.stripeConfig.getAllTokenPackages();

        const packagesHTML = packages.map(pkg => `
            <div class="token-package-card">
                <div class="package-name">${pkg.name}</div>
                <div class="package-price">$${pkg.price}</div>
                <div class="package-description">${pkg.description}</div>
                <div class="package-value">
                    <div class="tokens-amount">${pkg.tokens.toLocaleString()} tokens</div>
                    <div class="price-per-token">$${(pkg.price / pkg.tokens).toFixed(3)} per token</div>
                </div>
                <button class="btn-primary buy-tokens-btn" data-package="${pkg.name.toLowerCase().split(' ')[0]}">
                    Buy Now
                </button>
            </div>
        `).join('');

        tokenPackagesElement.innerHTML = `
            <div class="token-packages-section">
                <h3>Buy Additional Tokens</h3>
                <div class="token-packages-grid">
                    ${packagesHTML}
                </div>
            </div>
        `;
    }

    async handlePlanChange(newPlan) {
        try {
            this.showLoading('Updating subscription...');
            
            const product = this.stripeConfig.getProductByPlan(newPlan);
            if (!product) {
                throw new Error('Invalid plan selected');
            }

            // Mock API call - replace with actual Stripe API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.currentSubscription.plan = product;
            this.currentCustomer.plan = newPlan;
            
            // Update monthly allowance based on new plan
            this.monthlyAllowance = product.tokens === -1 ? 999999 : product.tokens;
            
            this.hideLoading();
            this.showSuccess(`Successfully upgraded to ${product.name}!`);
            this.renderBillingInterface();
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to change plan: ${error.message}`);
        }
    }

    async handleSubscriptionCancellation() {
        if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) {
            return;
        }

        try {
            this.showLoading('Cancelling subscription...');
            
            // Mock API call - replace with actual Stripe API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.currentSubscription.cancel_at_period_end = true;
            
            this.hideLoading();
            this.showSuccess('Subscription cancelled. You will retain access until the end of your billing period.');
            this.renderCurrentPlan();
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to cancel subscription: ${error.message}`);
        }
    }

    async handleSubscriptionReactivation() {
        try {
            this.showLoading('Reactivating subscription...');
            
            // Mock API call - replace with actual Stripe API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.currentSubscription.cancel_at_period_end = false;
            
            this.hideLoading();
            this.showSuccess('Subscription reactivated successfully!');
            this.renderCurrentPlan();
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to reactivate subscription: ${error.message}`);
        }
    }

    async handleTokenPurchase(packageType) {
        try {
            const tokenPackage = this.stripeConfig.getTokenPackage(packageType);
            if (!tokenPackage) {
                throw new Error('Invalid token package selected');
            }

            this.showLoading('Processing purchase...');
            
            // Mock checkout session creation - replace with actual Stripe API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate successful purchase
            this.tokenBalance += tokenPackage.tokens;
            this.tokensRemaining += tokenPackage.tokens;
            
            this.hideLoading();
            this.showSuccess(`Successfully purchased ${tokenPackage.tokens.toLocaleString()} tokens!`);
            this.renderTokenBalance();
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to purchase tokens: ${error.message}`);
        }
    }

    async handleAddPaymentMethod() {
        try {
            this.showLoading('Adding payment method...');
            
            // Mock payment method addition - replace with actual Stripe API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newPaymentMethod = {
                id: `pm_mock_${Date.now()}`,
                type: 'card',
                card: {
                    brand: 'mastercard',
                    last4: '5555',
                    exp_month: 6,
                    exp_year: 2026
                },
                is_default: false
            };
            
            this.paymentMethods.push(newPaymentMethod);
            
            this.hideLoading();
            this.showSuccess('Payment method added successfully!');
            this.renderPaymentMethods();
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to add payment method: ${error.message}`);
        }
    }

    async handleRemovePaymentMethod(paymentMethodId) {
        if (!confirm('Are you sure you want to remove this payment method?')) {
            return;
        }

        try {
            this.showLoading('Removing payment method...');
            
            // Mock payment method removal - replace with actual Stripe API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.paymentMethods = this.paymentMethods.filter(pm => pm.id !== paymentMethodId);
            
            this.hideLoading();
            this.showSuccess('Payment method removed successfully!');
            this.renderPaymentMethods();
            
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to remove payment method: ${error.message}`);
        }
    }

    // Utility methods for UI feedback
    showLoading(message) {
        const loadingElement = document.getElementById('loadingIndicator');
        if (loadingElement) {
            loadingElement.textContent = message;
            loadingElement.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('loadingIndicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Initialize billing manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with billing elements
    if (document.getElementById('currentPlan') || document.getElementById('tokenBalance')) {
        window.billingManager = new BillingManager();
    }
});