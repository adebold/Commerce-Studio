/**
 * Plan Manager - US-007: Plan Management
 * VARAi Commerce Studio Customer Portal
 * 
 * Comprehensive subscription plan management with upgrade/downgrade flows,
 * prorated billing calculations, and intelligent plan recommendations.
 */

class PlanManager {
    constructor() {
        this.currentPlan = null;
        this.availablePlans = [];
        this.billingCycle = 'monthly';
        this.prorationCalculator = new ProrationCalculator();
        this.planComparison = new PlanComparison();
        this.upgradeFlow = new UpgradeFlow();
        this.init();
    }

    async init() {
        console.log('🎯 Initializing Plan Manager...');
        await this.loadCurrentPlan();
        await this.loadAvailablePlans();
        this.setupEventListeners();
        this.renderPlanInterface();
    }

    async loadCurrentPlan() {
        try {
            // Get current plan from localStorage or API
            const demoUser = localStorage.getItem('demo-user');
            if (demoUser) {
                const user = JSON.parse(demoUser);
                this.currentPlan = user.plan || this.getDefaultPlan();
            } else {
                this.currentPlan = this.getDefaultPlan();
            }
            
            console.log('📋 Current plan loaded:', this.currentPlan);
        } catch (error) {
            console.error('❌ Error loading current plan:', error);
            this.currentPlan = this.getDefaultPlan();
        }
    }

    getDefaultPlan() {
        return {
            id: 'starter',
            name: 'Starter',
            price: 29,
            billingCycle: 'monthly',
            features: [
                'Up to 1,000 products',
                'Basic AI recommendations',
                'Email support',
                'Standard analytics'
            ],
            limits: {
                products: 1000,
                apiCalls: 10000,
                storage: '5GB'
            }
        };
    }

    async loadAvailablePlans() {
        // Define available plans with comprehensive features
        this.availablePlans = [
            {
                id: 'starter',
                name: 'Starter',
                description: 'Perfect for small businesses getting started',
                monthlyPrice: 29,
                yearlyPrice: 290,
                savings: 20,
                popular: false,
                features: [
                    'Up to 1,000 products',
                    'Basic AI recommendations',
                    'Email support',
                    'Standard analytics',
                    '1 store integration',
                    '5GB storage'
                ],
                limits: {
                    products: 1000,
                    apiCalls: 10000,
                    storage: '5GB',
                    stores: 1
                },
                color: '#6c757d'
            },
            {
                id: 'professional',
                name: 'Professional',
                description: 'Advanced features for growing businesses',
                monthlyPrice: 79,
                yearlyPrice: 790,
                savings: 20,
                popular: true,
                features: [
                    'Up to 10,000 products',
                    'Advanced AI recommendations',
                    'Priority support',
                    'Advanced analytics',
                    '5 store integrations',
                    '50GB storage',
                    'Custom branding',
                    'A/B testing'
                ],
                limits: {
                    products: 10000,
                    apiCalls: 100000,
                    storage: '50GB',
                    stores: 5
                },
                color: '#007bff'
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'Full-scale solution for large organizations',
                monthlyPrice: 199,
                yearlyPrice: 1990,
                savings: 20,
                popular: false,
                features: [
                    'Unlimited products',
                    'Enterprise AI suite',
                    'Dedicated support',
                    'Custom analytics',
                    'Unlimited integrations',
                    '500GB storage',
                    'White-label solution',
                    'Custom development',
                    'SLA guarantee'
                ],
                limits: {
                    products: 'unlimited',
                    apiCalls: 'unlimited',
                    storage: '500GB',
                    stores: 'unlimited'
                },
                color: '#28a745'
            }
        ];

        console.log('📊 Available plans loaded:', this.availablePlans.length);
    }

    setupEventListeners() {
        // Plan comparison toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="compare-plans"]')) {
                this.showPlanComparison();
            }
            
            if (e.target.matches('[data-action="change-plan"]')) {
                const planId = e.target.dataset.planId;
                this.initiatePlanChange(planId);
            }
            
            if (e.target.matches('[data-action="toggle-billing"]')) {
                this.toggleBillingCycle();
            }
            
            if (e.target.matches('[data-action="confirm-upgrade"]')) {
                this.confirmPlanUpgrade();
            }
            
            if (e.target.matches('[data-action="cancel-change"]')) {
                this.cancelPlanChange();
            }
        });

        // Billing cycle change
        document.addEventListener('change', (e) => {
            if (e.target.matches('[name="billing-cycle"]')) {
                this.billingCycle = e.target.value;
                this.updatePlanPricing();
            }
        });
    }

    renderPlanInterface() {
        const container = document.getElementById('plan-management-container');
        if (!container) {
            console.warn('⚠️ Plan management container not found');
            return;
        }

        container.innerHTML = `
            <div class="plan-manager">
                <div class="plan-header">
                    <h2 class="plan-title">Subscription Plan</h2>
                    <p class="plan-subtitle">Manage your subscription and billing preferences</p>
                </div>

                <div class="current-plan-card">
                    <div class="current-plan-header">
                        <h3>Current Plan</h3>
                        <span class="plan-badge plan-badge-${this.currentPlan.id}">${this.currentPlan.name}</span>
                    </div>
                    <div class="current-plan-details">
                        <div class="plan-price">
                            <span class="price-amount">$${this.currentPlan.price}</span>
                            <span class="price-period">/${this.billingCycle}</span>
                        </div>
                        <div class="plan-features">
                            ${this.currentPlan.features.map(feature => `
                                <div class="feature-item">
                                    <svg class="feature-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="plan-actions">
                            <button class="btn btn-outline" data-action="compare-plans">
                                Compare Plans
                            </button>
                            <button class="btn btn-primary" data-action="change-plan">
                                Change Plan
                            </button>
                        </div>
                    </div>
                </div>

                <div class="billing-cycle-toggle">
                    <div class="toggle-header">
                        <h4>Billing Cycle</h4>
                        <p>Save 20% with annual billing</p>
                    </div>
                    <div class="toggle-options">
                        <label class="toggle-option ${this.billingCycle === 'monthly' ? 'active' : ''}">
                            <input type="radio" name="billing-cycle" value="monthly" ${this.billingCycle === 'monthly' ? 'checked' : ''}>
                            <span>Monthly</span>
                        </label>
                        <label class="toggle-option ${this.billingCycle === 'yearly' ? 'active' : ''}">
                            <input type="radio" name="billing-cycle" value="yearly" ${this.billingCycle === 'yearly' ? 'checked' : ''}>
                            <span>Yearly</span>
                            <span class="savings-badge">Save 20%</span>
                        </label>
                    </div>
                </div>

                <div id="plan-comparison-modal" class="modal" style="display: none;">
                    <!-- Plan comparison content will be inserted here -->
                </div>

                <div id="plan-change-modal" class="modal" style="display: none;">
                    <!-- Plan change flow content will be inserted here -->
                </div>
            </div>
        `;

        this.addPlanManagerStyles();
    }

    addPlanManagerStyles() {
        if (document.getElementById('plan-manager-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'plan-manager-styles';
        styles.textContent = `
            .plan-manager {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
            }

            .plan-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .plan-title {
                font-size: 2rem;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 0.5rem;
            }

            .plan-subtitle {
                color: #6c757d;
                font-size: 1.1rem;
            }

            .current-plan-card {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 2rem;
                border: 2px solid #e9ecef;
            }

            .current-plan-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }

            .current-plan-header h3 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0;
            }

            .plan-badge {
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .plan-badge-starter {
                background: #6c757d;
                color: white;
            }

            .plan-badge-professional {
                background: #007bff;
                color: white;
            }

            .plan-badge-enterprise {
                background: #28a745;
                color: white;
            }

            .current-plan-details {
                display: grid;
                gap: 1.5rem;
            }

            .plan-price {
                display: flex;
                align-items: baseline;
                gap: 0.5rem;
            }

            .price-amount {
                font-size: 2.5rem;
                font-weight: 700;
                color: #1a1a1a;
            }

            .price-period {
                font-size: 1.1rem;
                color: #6c757d;
            }

            .plan-features {
                display: grid;
                gap: 0.75rem;
            }

            .feature-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .feature-icon {
                width: 20px;
                height: 20px;
                color: #28a745;
                flex-shrink: 0;
            }

            .plan-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }

            .billing-cycle-toggle {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 2rem;
            }

            .toggle-header {
                margin-bottom: 1.5rem;
            }

            .toggle-header h4 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0 0 0.5rem 0;
            }

            .toggle-header p {
                color: #6c757d;
                margin: 0;
            }

            .toggle-options {
                display: flex;
                gap: 1rem;
                background: #f8f9fa;
                padding: 0.5rem;
                border-radius: 8px;
            }

            .toggle-option {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }

            .toggle-option input {
                display: none;
            }

            .toggle-option.active {
                background: white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .savings-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #28a745;
                color: white;
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                border-radius: 10px;
                font-weight: 600;
            }

            .btn {
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                font-weight: 600;
                text-decoration: none;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .btn-primary {
                background: #007bff;
                color: white;
            }

            .btn-primary:hover {
                background: #0056b3;
            }

            .btn-outline {
                background: transparent;
                color: #007bff;
                border: 2px solid #007bff;
            }

            .btn-outline:hover {
                background: #007bff;
                color: white;
            }

            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                backdrop-filter: blur(4px);
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }

            @media (max-width: 768px) {
                .plan-manager {
                    padding: 1rem;
                }

                .current-plan-card,
                .billing-cycle-toggle {
                    padding: 1.5rem;
                }

                .plan-actions {
                    flex-direction: column;
                }

                .toggle-options {
                    flex-direction: column;
                    gap: 0.5rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    showPlanComparison() {
        const modal = document.getElementById('plan-comparison-modal');
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Compare Plans</h3>
                    <button class="modal-close" onclick="this.closest('.modal').style.display='none'">&times;</button>
                </div>
                <div class="plan-comparison-grid">
                    ${this.availablePlans.map(plan => this.renderPlanCard(plan)).join('')}
                </div>
            </div>
        `;
    }

    renderPlanCard(plan) {
        const isCurrentPlan = plan.id === this.currentPlan.id;
        const price = this.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        const period = this.billingCycle === 'yearly' ? 'year' : 'month';

        return `
            <div class="plan-card ${isCurrentPlan ? 'current' : ''} ${plan.popular ? 'popular' : ''}">
                ${plan.popular ? '<div class="popular-badge">Most Popular</div>' : ''}
                <div class="plan-card-header">
                    <h4>${plan.name}</h4>
                    <p>${plan.description}</p>
                </div>
                <div class="plan-card-price">
                    <span class="price">$${price}</span>
                    <span class="period">/${period}</span>
                    ${this.billingCycle === 'yearly' && plan.savings ? 
                        `<span class="savings">Save ${plan.savings}%</span>` : ''}
                </div>
                <div class="plan-card-features">
                    ${plan.features.map(feature => `
                        <div class="feature">
                            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            ${feature}
                        </div>
                    `).join('')}
                </div>
                <div class="plan-card-action">
                    ${isCurrentPlan ? 
                        '<button class="btn btn-current" disabled>Current Plan</button>' :
                        `<button class="btn btn-primary" data-action="change-plan" data-plan-id="${plan.id}">
                            ${this.isPlanUpgrade(plan) ? 'Upgrade' : 'Downgrade'}
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    isPlanUpgrade(plan) {
        const planOrder = { starter: 1, professional: 2, enterprise: 3 };
        return planOrder[plan.id] > planOrder[this.currentPlan.id];
    }

    async initiatePlanChange(planId) {
        const newPlan = this.availablePlans.find(p => p.id === planId);
        if (!newPlan) return;

        const isUpgrade = this.isPlanUpgrade(newPlan);
        const prorationDetails = await this.prorationCalculator.calculate(
            this.currentPlan, 
            newPlan, 
            this.billingCycle
        );

        this.showPlanChangeModal(newPlan, isUpgrade, prorationDetails);
    }

    showPlanChangeModal(newPlan, isUpgrade, prorationDetails) {
        const modal = document.getElementById('plan-change-modal');
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isUpgrade ? 'Upgrade' : 'Downgrade'} Plan</h3>
                    <button class="modal-close" onclick="this.closest('.modal').style.display='none'">&times;</button>
                </div>
                <div class="plan-change-content">
                    <div class="plan-change-summary">
                        <div class="change-from">
                            <h4>Current Plan</h4>
                            <div class="plan-info">
                                <span class="plan-name">${this.currentPlan.name}</span>
                                <span class="plan-price">$${this.currentPlan.price}/${this.billingCycle}</span>
                            </div>
                        </div>
                        <div class="change-arrow">→</div>
                        <div class="change-to">
                            <h4>New Plan</h4>
                            <div class="plan-info">
                                <span class="plan-name">${newPlan.name}</span>
                                <span class="plan-price">$${this.billingCycle === 'yearly' ? newPlan.yearlyPrice : newPlan.monthlyPrice}/${this.billingCycle}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="proration-details">
                        <h4>Billing Details</h4>
                        <div class="billing-breakdown">
                            <div class="billing-item">
                                <span>Prorated credit</span>
                                <span>$${prorationDetails.credit.toFixed(2)}</span>
                            </div>
                            <div class="billing-item">
                                <span>New plan charge</span>
                                <span>$${prorationDetails.charge.toFixed(2)}</span>
                            </div>
                            <div class="billing-item total">
                                <span>Total ${isUpgrade ? 'charge' : 'credit'}</span>
                                <span class="${isUpgrade ? 'charge' : 'credit'}">
                                    ${isUpgrade ? '+' : '-'}$${Math.abs(prorationDetails.total).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <p class="billing-note">
                            ${isUpgrade ? 
                                'You will be charged the prorated amount immediately.' :
                                'Credit will be applied to your next billing cycle.'
                            }
                        </p>
                    </div>

                    <div class="plan-change-actions">
                        <button class="btn btn-outline" data-action="cancel-change">
                            Cancel
                        </button>
                        <button class="btn btn-primary" data-action="confirm-upgrade" data-plan-id="${newPlan.id}">
                            Confirm ${isUpgrade ? 'Upgrade' : 'Downgrade'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async confirmPlanUpgrade() {
        const planId = event.target.dataset.planId;
        const newPlan = this.availablePlans.find(p => p.id === planId);
        
        try {
            // Show loading state
            event.target.textContent = 'Processing...';
            event.target.disabled = true;

            // Simulate API call
            await this.processPlanChange(newPlan);
            
            // Update current plan
            this.currentPlan = newPlan;
            
            // Update localStorage
            const demoUser = JSON.parse(localStorage.getItem('demo-user') || '{}');
            demoUser.plan = newPlan;
            localStorage.setItem('demo-user', JSON.stringify(demoUser));

            // Close modal and refresh interface
            document.getElementById('plan-change-modal').style.display = 'none';
            this.renderPlanInterface();
            
            // Show success notification
            this.showNotification(`Successfully ${this.isPlanUpgrade(newPlan) ? 'upgraded' : 'downgraded'} to ${newPlan.name} plan!`, 'success');
            
        } catch (error) {
            console.error('❌ Plan change error:', error);
            this.showNotification('Failed to change plan. Please try again.', 'error');
            
            // Reset button
            event.target.textContent = 'Confirm Upgrade';
            event.target.disabled = false;
        }
    }

    async processPlanChange(newPlan) {
        // Simulate API call to process plan change
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('✅ Plan changed successfully to:', newPlan.name);
                resolve();
            }, 2000);
        });
    }

    toggleBillingCycle() {
        this.billingCycle = this.billingCycle === 'monthly' ? 'yearly' : 'monthly';
        this.updatePlanPricing();
    }

    updatePlanPricing() {
        // Update all price displays
        const priceElements = document.querySelectorAll('[data-price]');
        priceElements.forEach(element => {
            const planId = element.dataset.planId;
            const plan = this.availablePlans.find(p => p.id === planId);
            if (plan) {
                const price = this.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                element.textContent = `$${price}`;
            }
        });

        // Update billing cycle toggles
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[name="billing-cycle"][value="${this.billingCycle}"]`).closest('.toggle-option').classList.add('active');
    }

    cancelPlanChange() {
        document.getElementById('plan-change-modal').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Proration Calculator for billing calculations
class ProrationCalculator {
    calculate(currentPlan, newPlan, billingCycle) {
        return new Promise((resolve) => {
            // Simulate complex proration calculation
            setTimeout(() => {
                const currentPrice = billingCycle === 'yearly' ? currentPlan.yearlyPrice || currentPlan.price * 10 : currentPlan.price;
                const newPrice = billingCycle === 'yearly' ? newPlan.yearlyPrice : newPlan.monthlyPrice;
                
                // Calculate prorated amounts (simplified)
                const daysInCycle = billingCycle === 'yearly' ? 365 : 30;
                const daysRemaining = Math.floor(Math.random() * daysInCycle) + 1;
                const prorationFactor = daysRemaining / daysInCycle;
                
                const credit = currentPrice * prorationFactor;
                const charge = newPrice * prorationFactor;
                const total = charge - credit;
                
                resolve({
                    credit: credit,
                    charge: charge,
                    total: total,
                    daysRemaining: daysRemaining,
                    billingCycle: billingCycle
                });
            }, 500);
        });
    }
}

// Plan Comparison utility
class PlanComparison {
    constructor() {
        this.comparisonMatrix = this.buildComparisonMatrix();
    }

    buildComparisonMatrix() {
        return {
            features: [
                'Products',
                'API Calls',
                'Storage',
                'Store Integrations',
                'Support Level',
                'Analytics',
                'Custom Branding',
                'A/B Testing',
                'SLA Guarantee'
            ]
        };
    }
}

// Upgrade Flow handler
class UpgradeFlow {
    constructor() {
        this.steps = ['plan-selection', 'billing-review', 'payment-confirmation', 'completion'];
        this.currentStep = 0;
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            return this.steps[this.currentStep];
        }
        return null;
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            return this.steps[this.currentStep];
        }
        return null;
    }

    getCurrentStep() {
        return this.steps[this.currentStep];
    }
}

// Initialize Plan Manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if plan management container exists
    if (document.getElementById('plan-management-container')) {
        window.planManager = new PlanManager();
        console.log('🎯 Plan Manager initialized successfully');
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlanManager, ProrationCalculator, PlanComparison, UpgradeFlow };
}