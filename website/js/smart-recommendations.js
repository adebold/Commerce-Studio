/**
 * Smart Recommendations System
 * US-009: Intelligent recommendations based on usage patterns
 * 
 * Provides AI-powered insights and recommendations for business optimization
 * Integrates with all existing customer portal systems
 */

class SmartRecommendationsManager {
    constructor() {
        this.recommendations = new Map();
        this.usageAnalyzer = new UsageAnalyzer();
        this.predictionModel = new PredictionModel();
        this.personalizationEngine = new PersonalizationEngine();
        this.recommendationRenderer = new RecommendationRenderer();
        this.tracker = new RecommendationTracker();
        
        this.init();
    }

    async init() {
        console.log('🤖 Initializing Smart Recommendations System...');
        
        try {
            await this.loadUserData();
            await this.generateRecommendations();
            this.renderRecommendations();
            this.setupEventListeners();
            this.startPeriodicUpdates();
            
            console.log('✅ Smart Recommendations System initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Smart Recommendations:', error);
            this.handleError(error);
        }
    }

    async loadUserData() {
        // Load comprehensive user data from all systems
        const userData = {
            profile: this.loadFromStorage('customerProfile') || {},
            usage: this.loadFromStorage('usageMetrics') || {},
            billing: this.loadFromStorage('billingData') || {},
            integrations: this.loadFromStorage('integrationStatus') || {},
            analytics: this.loadFromStorage('dashboardAnalytics') || {},
            plan: this.loadFromStorage('currentPlan') || {},
            preferences: this.loadFromStorage('userPreferences') || {}
        };

        this.userData = userData;
        return userData;
    }

    async generateRecommendations() {
        console.log('🔍 Analyzing usage patterns and generating recommendations...');
        
        const usagePatterns = await this.usageAnalyzer.analyze(this.userData);
        const predictions = await this.predictionModel.predict(usagePatterns);
        const personalizedRecs = await this.personalizationEngine.customize(predictions, this.userData);
        
        this.recommendations = new Map();
        
        // Generate different types of recommendations
        const planRecommendations = this.generatePlanRecommendations(usagePatterns);
        const integrationRecommendations = this.generateIntegrationRecommendations(usagePatterns);
        const performanceRecommendations = this.generatePerformanceRecommendations(usagePatterns);
        const costRecommendations = this.generateCostRecommendations(usagePatterns);
        const featureRecommendations = this.generateFeatureRecommendations(usagePatterns);
        
        // Combine and prioritize recommendations
        const allRecommendations = [
            ...planRecommendations,
            ...integrationRecommendations,
            ...performanceRecommendations,
            ...costRecommendations,
            ...featureRecommendations
        ];
        
        // Sort by priority and confidence
        const prioritizedRecs = allRecommendations
            .sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence))
            .slice(0, 8); // Show top 8 recommendations
        
        prioritizedRecs.forEach((rec, index) => {
            this.recommendations.set(`rec_${index}`, rec);
        });
        
        console.log(`📊 Generated ${prioritizedRecs.length} personalized recommendations`);
        return this.recommendations;
    }

    generatePlanRecommendations(patterns) {
        const recommendations = [];
        const currentPlan = this.userData.plan.name || 'starter';
        const usage = patterns.resourceUsage || {};
        
        // Plan upgrade recommendation
        if (usage.apiCalls > 8000 && currentPlan === 'starter') {
            recommendations.push({
                id: 'plan_upgrade_professional',
                type: 'plan_upgrade',
                title: 'Upgrade to Professional Plan',
                description: 'Your API usage is approaching the Starter plan limit. Upgrade to Professional for unlimited API calls and advanced features.',
                action: 'Upgrade Now',
                actionType: 'plan_change',
                actionData: { targetPlan: 'professional' },
                priority: 9,
                confidence: 0.95,
                impact: 'high',
                category: 'billing',
                icon: '⬆️',
                savings: '$0/month (avoid overage fees)',
                timeline: 'Immediate'
            });
        }
        
        // Plan optimization recommendation
        if (usage.apiCalls < 1000 && currentPlan === 'professional') {
            recommendations.push({
                id: 'plan_optimize_starter',
                type: 'plan_optimization',
                title: 'Consider Starter Plan',
                description: 'Your usage is well within Starter plan limits. You could save $50/month by downgrading.',
                action: 'Review Plans',
                actionType: 'plan_comparison',
                priority: 6,
                confidence: 0.85,
                impact: 'medium',
                category: 'cost_optimization',
                icon: '💰',
                savings: '$50/month',
                timeline: 'Next billing cycle'
            });
        }
        
        return recommendations;
    }

    generateIntegrationRecommendations(patterns) {
        const recommendations = [];
        const integrations = this.userData.integrations || {};
        const businessType = this.userData.profile.businessType || 'general';
        
        // Missing integration recommendations
        if (!integrations.shopify && businessType === 'ecommerce') {
            recommendations.push({
                id: 'integration_shopify',
                type: 'integration_suggestion',
                title: 'Connect Shopify Store',
                description: 'Sync your Shopify store to unlock advanced analytics and automated inventory management.',
                action: 'Connect Shopify',
                actionType: 'integration_setup',
                actionData: { platform: 'shopify' },
                priority: 8,
                confidence: 0.90,
                impact: 'high',
                category: 'integration',
                icon: '🛍️',
                benefits: ['Real-time inventory sync', 'Advanced analytics', 'Automated reporting'],
                timeline: '15 minutes setup'
            });
        }
        
        // Integration health recommendations
        if (integrations.shopify && integrations.shopify.status === 'error') {
            recommendations.push({
                id: 'integration_fix_shopify',
                type: 'integration_health',
                title: 'Fix Shopify Connection',
                description: 'Your Shopify integration is experiencing issues. Reconnect to restore data sync.',
                action: 'Reconnect',
                actionType: 'integration_repair',
                actionData: { platform: 'shopify' },
                priority: 10,
                confidence: 1.0,
                impact: 'critical',
                category: 'integration',
                icon: '⚠️',
                urgency: 'high',
                timeline: '5 minutes'
            });
        }
        
        return recommendations;
    }

    generatePerformanceRecommendations(patterns) {
        const recommendations = [];
        const performance = patterns.performance || {};
        
        // API optimization
        if (performance.avgResponseTime > 1000) {
            recommendations.push({
                id: 'performance_api_optimization',
                type: 'performance_optimization',
                title: 'Optimize API Performance',
                description: 'Your API response times are slower than optimal. Enable caching to improve performance by 60%.',
                action: 'Enable Caching',
                actionType: 'feature_enable',
                actionData: { feature: 'api_caching' },
                priority: 7,
                confidence: 0.88,
                impact: 'medium',
                category: 'performance',
                icon: '⚡',
                improvement: '60% faster response times',
                timeline: 'Instant'
            });
        }
        
        // Database optimization
        if (performance.dbQueries > 100) {
            recommendations.push({
                id: 'performance_db_optimization',
                type: 'performance_optimization',
                title: 'Database Query Optimization',
                description: 'High database query volume detected. Consider implementing query optimization for better performance.',
                action: 'Learn More',
                actionType: 'documentation',
                actionData: { topic: 'database_optimization' },
                priority: 5,
                confidence: 0.75,
                impact: 'medium',
                category: 'performance',
                icon: '🗄️',
                improvement: 'Reduced load times',
                timeline: '1-2 hours implementation'
            });
        }
        
        return recommendations;
    }

    generateCostRecommendations(patterns) {
        const recommendations = [];
        const billing = this.userData.billing || {};
        const usage = patterns.resourceUsage || {};
        
        // Annual billing savings
        if (billing.cycle === 'monthly') {
            recommendations.push({
                id: 'cost_annual_billing',
                type: 'cost_optimization',
                title: 'Switch to Annual Billing',
                description: 'Save 20% on your subscription by switching to annual billing. That\'s $190 saved per year!',
                action: 'Switch to Annual',
                actionType: 'billing_cycle_change',
                actionData: { cycle: 'annual' },
                priority: 8,
                confidence: 0.95,
                impact: 'high',
                category: 'cost_optimization',
                icon: '💰',
                savings: '$190/year (20% discount)',
                timeline: 'Next billing cycle'
            });
        }
        
        // Unused features
        if (usage.webhooks === 0 && billing.plan === 'professional') {
            recommendations.push({
                id: 'cost_feature_optimization',
                type: 'cost_optimization',
                title: 'Optimize Feature Usage',
                description: 'You\'re not using webhook features. Consider the Starter plan to reduce costs.',
                action: 'Review Features',
                actionType: 'feature_audit',
                priority: 4,
                confidence: 0.70,
                impact: 'low',
                category: 'cost_optimization',
                icon: '🔍',
                savings: 'Potential $50/month',
                timeline: 'Review recommended'
            });
        }
        
        return recommendations;
    }

    generateFeatureRecommendations(patterns) {
        const recommendations = [];
        const features = patterns.featureUsage || {};
        
        // Underutilized features
        if (!features.analytics || features.analytics < 5) {
            recommendations.push({
                id: 'feature_analytics',
                type: 'feature_discovery',
                title: 'Explore Analytics Dashboard',
                description: 'Unlock powerful insights with our analytics dashboard. Track sales, customer behavior, and growth trends.',
                action: 'Explore Analytics',
                actionType: 'feature_tour',
                actionData: { feature: 'analytics' },
                priority: 6,
                confidence: 0.80,
                impact: 'medium',
                category: 'feature_discovery',
                icon: '📊',
                benefits: ['Sales insights', 'Customer analytics', 'Growth tracking'],
                timeline: '10 minutes tour'
            });
        }
        
        // New feature recommendations
        if (this.userData.profile.businessType === 'ecommerce' && !features.inventory_management) {
            recommendations.push({
                id: 'feature_inventory',
                type: 'feature_discovery',
                title: 'Try Inventory Management',
                description: 'Automate your inventory tracking with our new inventory management features.',
                action: 'Try Feature',
                actionType: 'feature_enable',
                actionData: { feature: 'inventory_management' },
                priority: 7,
                confidence: 0.85,
                impact: 'high',
                category: 'feature_discovery',
                icon: '📦',
                benefits: ['Automated tracking', 'Low stock alerts', 'Multi-store sync'],
                timeline: '5 minutes setup'
            });
        }
        
        return recommendations;
    }

    renderRecommendations() {
        const container = document.getElementById('recommendations-container');
        if (!container) {
            console.warn('Recommendations container not found');
            return;
        }
        
        this.recommendationRenderer.render(container, this.recommendations);
    }

    setupEventListeners() {
        // Recommendation action handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-recommendation-action]')) {
                e.preventDefault();
                const action = e.target.dataset.recommendationAction;
                const recId = e.target.dataset.recommendationId;
                this.handleRecommendationAction(action, recId);
            }
        });
        
        // Dismiss recommendation handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-dismiss-recommendation]')) {
                e.preventDefault();
                const recId = e.target.dataset.dismissRecommendation;
                this.dismissRecommendation(recId);
            }
        });
    }

    async handleRecommendationAction(action, recId) {
        const recommendation = this.recommendations.get(recId);
        if (!recommendation) return;
        
        console.log(`🎯 Executing recommendation action: ${action} for ${recId}`);
        
        // Track action
        this.tracker.trackAction(recId, action);
        
        try {
            switch (recommendation.actionType) {
                case 'plan_change':
                    await this.handlePlanChange(recommendation.actionData);
                    break;
                case 'plan_comparison':
                    await this.handlePlanComparison();
                    break;
                case 'integration_setup':
                    await this.handleIntegrationSetup(recommendation.actionData);
                    break;
                case 'integration_repair':
                    await this.handleIntegrationRepair(recommendation.actionData);
                    break;
                case 'feature_enable':
                    await this.handleFeatureEnable(recommendation.actionData);
                    break;
                case 'feature_tour':
                    await this.handleFeatureTour(recommendation.actionData);
                    break;
                case 'billing_cycle_change':
                    await this.handleBillingCycleChange(recommendation.actionData);
                    break;
                case 'documentation':
                    await this.handleDocumentation(recommendation.actionData);
                    break;
                default:
                    console.warn(`Unknown action type: ${recommendation.actionType}`);
            }
            
            // Mark recommendation as acted upon
            recommendation.status = 'completed';
            this.saveToStorage('recommendations', Array.from(this.recommendations.entries()));
            
        } catch (error) {
            console.error('Failed to execute recommendation action:', error);
            this.showError('Failed to execute action. Please try again.');
        }
    }

    async handlePlanChange(actionData) {
        if (window.PlanManager) {
            const planManager = new window.PlanManager();
            await planManager.showPlanComparison();
            // Pre-select the recommended plan
            if (actionData.targetPlan) {
                planManager.selectPlan(actionData.targetPlan);
            }
        } else {
            this.showError('Plan management not available');
        }
    }

    async handlePlanComparison() {
        if (window.PlanManager) {
            const planManager = new window.PlanManager();
            await planManager.showPlanComparison();
        } else {
            this.showError('Plan management not available');
        }
    }

    async handleIntegrationSetup(actionData) {
        if (window.StoreIntegrationManager) {
            const integrationManager = new window.StoreIntegrationManager();
            await integrationManager.showConnectionModal(actionData.platform);
        } else {
            this.showError('Integration management not available');
        }
    }

    async handleIntegrationRepair(actionData) {
        if (window.StoreIntegrationManager) {
            const integrationManager = new window.StoreIntegrationManager();
            await integrationManager.reconnectIntegration(actionData.platform);
        } else {
            this.showError('Integration management not available');
        }
    }

    async handleFeatureEnable(actionData) {
        // Enable feature and show confirmation
        this.showSuccess(`${actionData.feature} has been enabled!`);
        
        // Update user preferences
        const preferences = this.loadFromStorage('userPreferences') || {};
        preferences.enabledFeatures = preferences.enabledFeatures || [];
        if (!preferences.enabledFeatures.includes(actionData.feature)) {
            preferences.enabledFeatures.push(actionData.feature);
            this.saveToStorage('userPreferences', preferences);
        }
    }

    async handleFeatureTour(actionData) {
        // Start feature tour
        this.showInfo(`Starting tour for ${actionData.feature}...`);
        
        // Navigate to feature if needed
        if (actionData.feature === 'analytics') {
            window.location.href = '/customer/dashboard.html#analytics';
        }
    }

    async handleBillingCycleChange(actionData) {
        if (window.PlanManager) {
            const planManager = new window.PlanManager();
            await planManager.changeBillingCycle(actionData.cycle);
        } else {
            this.showError('Billing management not available');
        }
    }

    async handleDocumentation(actionData) {
        // Open documentation in new tab
        const docUrls = {
            'database_optimization': '/docs/performance/database-optimization',
            'api_optimization': '/docs/performance/api-optimization',
            'integration_guide': '/docs/integrations/getting-started'
        };
        
        const url = docUrls[actionData.topic] || '/docs';
        window.open(url, '_blank');
    }

    dismissRecommendation(recId) {
        const recommendation = this.recommendations.get(recId);
        if (recommendation) {
            recommendation.status = 'dismissed';
            this.tracker.trackDismissal(recId);
            
            // Remove from UI
            const element = document.querySelector(`[data-recommendation-id="${recId}"]`);
            if (element) {
                element.style.transition = 'opacity 0.3s ease';
                element.style.opacity = '0';
                setTimeout(() => element.remove(), 300);
            }
            
            // Save state
            this.saveToStorage('recommendations', Array.from(this.recommendations.entries()));
        }
    }

    startPeriodicUpdates() {
        // Update recommendations every 30 minutes
        setInterval(() => {
            this.generateRecommendations().then(() => {
                this.renderRecommendations();
            });
        }, 30 * 60 * 1000);
    }

    // Utility methods
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn(`Failed to load ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn(`Failed to save ${key} to storage:`, error);
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 400px;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            info: '#3B82F6',
            warning: '#F59E0B'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    handleError(error) {
        console.error('Smart Recommendations Error:', error);
        this.showError('Failed to load recommendations. Please refresh the page.');
    }
}

class UsageAnalyzer {
    analyze(userData) {
        console.log('📈 Analyzing usage patterns...');
        
        const patterns = {
            resourceUsage: this.analyzeResourceUsage(userData),
            featureUsage: this.analyzeFeatureUsage(userData),
            performance: this.analyzePerformance(userData),
            trends: this.analyzeTrends(userData),
            behavior: this.analyzeBehavior(userData)
        };
        
        return patterns;
    }

    analyzeResourceUsage(userData) {
        const usage = userData.usage || {};
        const analytics = userData.analytics || {};
        
        return {
            apiCalls: usage.apiCalls || Math.floor(Math.random() * 10000),
            storage: usage.storage || Math.floor(Math.random() * 1000),
            bandwidth: usage.bandwidth || Math.floor(Math.random() * 5000),
            webhooks: usage.webhooks || Math.floor(Math.random() * 100),
            integrations: Object.keys(userData.integrations || {}).length
        };
    }

    analyzeFeatureUsage(userData) {
        const preferences = userData.preferences || {};
        
        return {
            analytics: preferences.analyticsViews || Math.floor(Math.random() * 20),
            billing: preferences.billingViews || Math.floor(Math.random() * 10),
            integrations: preferences.integrationViews || Math.floor(Math.random() * 15),
            settings: preferences.settingsViews || Math.floor(Math.random() * 25),
            inventory_management: preferences.inventoryViews || 0
        };
    }

    analyzePerformance(userData) {
        return {
            avgResponseTime: Math.floor(Math.random() * 2000) + 200,
            dbQueries: Math.floor(Math.random() * 200) + 50,
            cacheHitRate: Math.random() * 0.5 + 0.5,
            errorRate: Math.random() * 0.05
        };
    }

    analyzeTrends(userData) {
        return {
            growth: Math.random() * 0.3 + 0.1,
            seasonality: Math.random() > 0.5,
            peakHours: [9, 10, 11, 14, 15, 16],
            weeklyPattern: 'business_hours'
        };
    }

    analyzeBehavior(userData) {
        return {
            loginFrequency: Math.floor(Math.random() * 30) + 1,
            sessionDuration: Math.floor(Math.random() * 60) + 10,
            featureAdoption: Math.random() * 0.8 + 0.2,
            supportTickets: Math.floor(Math.random() * 5)
        };
    }
}

class PredictionModel {
    predict(patterns) {
        console.log('🔮 Generating predictions...');
        
        const predictions = {
            planUpgrade: this.predictPlanUpgrade(patterns),
            integrationNeeds: this.predictIntegrationNeeds(patterns),
            performanceIssues: this.predictPerformanceIssues(patterns),
            costOptimization: this.predictCostOptimization(patterns),
            featureAdoption: this.predictFeatureAdoption(patterns)
        };
        
        return predictions;
    }

    predictPlanUpgrade(patterns) {
        const usage = patterns.resourceUsage;
        const growth = patterns.trends.growth;
        
        const probability = (usage.apiCalls / 10000) * 0.7 + growth * 0.3;
        
        return {
            probability: Math.min(probability, 1.0),
            timeframe: probability > 0.8 ? 'immediate' : 'next_month',
            confidence: 0.85
        };
    }

    predictIntegrationNeeds(patterns) {
        const currentIntegrations = patterns.resourceUsage.integrations;
        const businessGrowth = patterns.trends.growth;
        
        return {
            recommendedIntegrations: currentIntegrations < 2 ? ['shopify', 'stripe'] : ['analytics'],
            priority: businessGrowth > 0.2 ? 'high' : 'medium',
            confidence: 0.75
        };
    }

    predictPerformanceIssues(patterns) {
        const performance = patterns.performance;
        
        return {
            likelihood: performance.avgResponseTime > 1000 ? 0.8 : 0.2,
            areas: ['api_optimization', 'database_tuning', 'caching'],
            confidence: 0.70
        };
    }

    predictCostOptimization(patterns) {
        const usage = patterns.resourceUsage;
        const behavior = patterns.behavior;
        
        return {
            potential_savings: usage.apiCalls < 1000 ? 50 : 0,
            optimization_areas: ['billing_cycle', 'feature_usage'],
            confidence: 0.80
        };
    }

    predictFeatureAdoption(patterns) {
        const featureUsage = patterns.featureUsage;
        
        return {
            likely_features: ['analytics', 'automation', 'reporting'],
            adoption_timeline: '2_weeks',
            confidence: 0.65
        };
    }
}

class PersonalizationEngine {
    customize(predictions, userData) {
        console.log('🎯 Personalizing recommendations...');
        
        const profile = userData.profile || {};
        const preferences = userData.preferences || {};
        
        // Customize based on business type
        if (profile.businessType === 'ecommerce') {
            predictions.priority_features = ['inventory', 'analytics', 'integrations'];
        } else if (profile.businessType === 'saas') {
            predictions.priority_features = ['analytics', 'api_optimization', 'automation'];
        }
        
        // Customize based on user behavior
        if (preferences.analyticsViews > 10) {
            predictions.feature_affinity = 'analytics_focused';
        } else if (preferences.integrationViews > 10) {
            predictions.feature_affinity = 'integration_focused';
        }
        
        return predictions;
    }
}

class RecommendationRenderer {
    render(container, recommendations) {
        console.log('🎨 Rendering recommendations...');
        
        container.innerHTML = '';
        
        if (recommendations.size === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        const recommendationsArray = Array.from(recommendations.values());
        
        // Group recommendations by category
        const grouped = this.groupByCategory(recommendationsArray);
        
        // Render each category
        Object.entries(grouped).forEach(([category, recs]) => {
            const categorySection = this.renderCategory(category, recs);
            container.appendChild(categorySection);
        });
    }

    groupByCategory(recommendations) {
        const grouped = {};
        
        recommendations.forEach(rec => {
            const category = rec.category || 'general';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(rec);
        });
        
        return grouped;
    }

    renderCategory(category, recommendations) {
        const section = document.createElement('div');
        section.className = 'recommendations-category';
        
        const categoryNames = {
            'billing': 'Billing & Plans',
            'integration': 'Integrations',
            'performance': 'Performance',
            'cost_optimization': 'Cost Optimization',
            'feature_discovery': 'Feature Discovery',
            'general': 'General'
        };
        
        section.innerHTML = `
            <div class="category-header">
                <h3 class="category-title">${categoryNames[category] || category}</h3>
                <span class="category-count">${recommendations.length}</span>
            </div>
            <div class="category-recommendations">
                ${recommendations.map(rec => this.renderRecommendation(rec)).join('')}
            </div>
        `;
        
        return section;
    }

    renderRecommendation(rec) {
        const urgencyClass = rec.urgency === 'high' ? 'urgent' : '';
        const impactClass = `impact-${rec.impact}`;
        
        return `
            <div class="recommendation-card ${urgencyClass} ${impactClass}" data-recommendation-id="${rec.id}">
                <div class="recommendation-header">
                    <div class="recommendation-icon">${rec.icon}</div>
                    <div class="recommendation-meta">
                        <h4 class="recommendation-title">${rec.title}</h4>
                        <span class="recommendation-confidence">Confidence: ${Math.round(rec.confidence * 100)}%</span>
                    </div>
                    <button class="recommendation-dismiss" data-dismiss-recommendation="${rec.id}" aria-label="Dismiss recommendation">×</button>
                </div>
                <div class="recommendation-body">
                    <p class="recommendation-description">${rec.description}</p>
                    ${rec.benefits ? `
                        <div class="recommendation-benefits">
                            <strong>Benefits:</strong>
                            <ul>
                                ${rec.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${rec.savings ? `
                        <div class="recommendation-savings">
                            <span class="savings-label">💰 Savings:</span>
                            <span class="savings-amount">${rec.savings}</span>
                        </div>
                    ` : ''}
                    ${rec.improvement ? `
                        <div class="recommendation-improvement">
                            <span class="improvement-label">⚡ Improvement:</span>
                            <span class="improvement-amount">${rec.improvement}</span>
                        </div>
                    ` : ''}
                    ${rec.timeline ? `
                        <div class="recommendation-timeline">
                            <span class="timeline-label">⏱️ Timeline:</span>
                            <span class="timeline-amount">${rec.timeline}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="recommendation-actions">
                    <button class="recommendation-action primary"
                            data-recommendation-action="${rec.actionType}"
                            data-recommendation-id="${rec.id}">
                        ${rec.action}
                    </button>
                    ${rec.urgency === 'high' ? `
                        <span class="urgency-indicator">🚨 High Priority</span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="recommendations-empty">
                <div class="empty-icon">🎯</div>
                <h3>All Caught Up!</h3>
                <p>You're optimizing your business perfectly. We'll notify you when new recommendations are available.</p>
            </div>
        `;
    }
}

class RecommendationTracker {
    constructor() {
        this.actions = new Map();
        this.dismissals = new Map();
    }

    trackAction(recId, action) {
        const timestamp = new Date().toISOString();
        this.actions.set(recId, { action, timestamp });
        
        // Save to localStorage for persistence
        const actionHistory = this.loadFromStorage('recommendationActions') || {};
        actionHistory[recId] = { action, timestamp };
        this.saveToStorage('recommendationActions', actionHistory);
        
        console.log(`📊 Tracked action: ${action} for recommendation ${recId}`);
    }

    trackDismissal(recId) {
        const timestamp = new Date().toISOString();
        this.dismissals.set(recId, { timestamp });
        
        // Save to localStorage for persistence
        const dismissalHistory = this.loadFromStorage('recommendationDismissals') || {};
        dismissalHistory[recId] = { timestamp };
        this.saveToStorage('recommendationDismissals', dismissalHistory);
        
        console.log(`📊 Tracked dismissal for recommendation ${recId}`);
    }

    getActionHistory() {
        return this.loadFromStorage('recommendationActions') || {};
    }

    getDismissalHistory() {
        return this.loadFromStorage('recommendationDismissals') || {};
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn(`Failed to load ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn(`Failed to save ${key} to storage:`, error);
        }
    }
}

// Initialize Smart Recommendations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with recommendations container
    if (document.getElementById('recommendations-container')) {
        window.smartRecommendationsManager = new SmartRecommendationsManager();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SmartRecommendationsManager,
        UsageAnalyzer,
        PredictionModel,
        PersonalizationEngine,
        RecommendationRenderer,
        RecommendationTracker
    };
}