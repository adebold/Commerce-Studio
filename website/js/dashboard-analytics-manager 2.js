/**
 * Dashboard Analytics & Insights Manager
 * US-006: Dashboard Analytics & Insights Implementation
 * 
 * Provides comprehensive analytics, insights, and data visualization
 * for the customer portal dashboard with agentic intelligence.
 */

class DashboardAnalyticsManager {
    constructor() {
        this.isInitialized = false;
        this.analytics = {
            sales: {},
            traffic: {},
            products: {},
            customers: {},
            integrations: {}
        };
        this.charts = {};
        this.insights = [];
        this.eventListeners = {};
        this.refreshInterval = null;
        this.agenticInsights = new AgenticInsightsEngine();
        
        this.init();
    }

    /**
     * Initialize the Dashboard Analytics Manager
     */
    async init() {
        try {
            console.log('🔄 Initializing Dashboard Analytics Manager...');
            
            await this.loadAnalyticsData();
            this.setupEventListeners();
            this.initializeCharts();
            this.generateInsights();
            this.startRealTimeUpdates();
            
            this.isInitialized = true;
            console.log('✅ Dashboard Analytics Manager initialized successfully');
            
            this.emit('analytics_initialized', { timestamp: new Date() });
        } catch (error) {
            console.error('❌ Failed to initialize Dashboard Analytics Manager:', error);
            this.showNotification('Failed to load analytics data', 'error');
        }
    }

    /**
     * Load analytics data from various sources
     */
    async loadAnalyticsData() {
        try {
            console.log('📊 Loading analytics data...');
            
            // Load data from multiple sources
            const [salesData, trafficData, productData, customerData, integrationData] = await Promise.all([
                this.loadSalesAnalytics(),
                this.loadTrafficAnalytics(),
                this.loadProductAnalytics(),
                this.loadCustomerAnalytics(),
                this.loadIntegrationAnalytics()
            ]);

            this.analytics = {
                sales: salesData,
                traffic: trafficData,
                products: productData,
                customers: customerData,
                integrations: integrationData
            };

            this.updateAnalyticsDisplay();
            console.log('✅ Analytics data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load analytics data:', error);
            throw error;
        }
    }

    /**
     * Load sales analytics data
     */
    async loadSalesAnalytics() {
        // Simulate API call - replace with actual API integration
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalRevenue: 125847.50,
                    monthlyRevenue: 18750.25,
                    dailyRevenue: 1250.75,
                    revenueGrowth: 15.8,
                    orderCount: 342,
                    averageOrderValue: 367.98,
                    conversionRate: 3.2,
                    salesByChannel: {
                        shopify: 45.2,
                        magento: 28.7,
                        woocommerce: 16.8,
                        direct: 9.3
                    },
                    salesTrend: this.generateTrendData(30, 800, 2000),
                    topProducts: [
                        { name: 'Premium Widget Pro', sales: 1250, revenue: 45000 },
                        { name: 'Essential Kit Bundle', sales: 890, revenue: 32000 },
                        { name: 'Advanced Analytics Tool', sales: 675, revenue: 28500 }
                    ]
                });
            }, 500);
        });
    }

    /**
     * Load traffic analytics data
     */
    async loadTrafficAnalytics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalVisitors: 15420,
                    uniqueVisitors: 12350,
                    pageViews: 45680,
                    bounceRate: 32.5,
                    averageSessionDuration: 245, // seconds
                    trafficSources: {
                        organic: 42.3,
                        direct: 28.7,
                        social: 15.2,
                        paid: 13.8
                    },
                    trafficTrend: this.generateTrendData(30, 300, 800),
                    topPages: [
                        { page: '/products', views: 8520, conversionRate: 4.2 },
                        { page: '/solutions', views: 6780, conversionRate: 3.8 },
                        { page: '/pricing', views: 5640, conversionRate: 5.1 }
                    ]
                });
            }, 600);
        });
    }

    /**
     * Load product analytics data
     */
    async loadProductAnalytics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalProducts: 156,
                    activeProducts: 142,
                    outOfStock: 8,
                    lowStock: 12,
                    productPerformance: [
                        { id: 1, name: 'Premium Widget Pro', views: 2340, sales: 125, conversionRate: 5.3 },
                        { id: 2, name: 'Essential Kit Bundle', views: 1890, sales: 89, conversionRate: 4.7 },
                        { id: 3, name: 'Advanced Analytics Tool', views: 1560, sales: 67, conversionRate: 4.3 }
                    ],
                    categoryPerformance: {
                        widgets: { sales: 45.2, revenue: 125000 },
                        tools: { sales: 32.8, revenue: 89000 },
                        bundles: { sales: 22.0, revenue: 67000 }
                    },
                    inventoryAlerts: [
                        { product: 'Premium Widget Pro', stock: 5, status: 'low' },
                        { product: 'Basic Tool Set', stock: 0, status: 'out' }
                    ]
                });
            }, 700);
        });
    }

    /**
     * Load customer analytics data
     */
    async loadCustomerAnalytics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalCustomers: 2847,
                    newCustomers: 156,
                    returningCustomers: 892,
                    customerLifetimeValue: 1250.75,
                    churnRate: 5.2,
                    customerSatisfaction: 4.6,
                    customerSegments: {
                        premium: { count: 425, revenue: 156000 },
                        standard: { count: 1890, revenue: 234000 },
                        basic: { count: 532, revenue: 45000 }
                    },
                    customerGrowth: this.generateTrendData(30, 50, 150),
                    topCustomers: [
                        { name: 'Enterprise Corp', revenue: 25000, orders: 45 },
                        { name: 'Tech Solutions Inc', revenue: 18500, orders: 32 },
                        { name: 'Digital Agency Pro', revenue: 15200, orders: 28 }
                    ]
                });
            }, 800);
        });
    }

    /**
     * Load integration analytics data
     */
    async loadIntegrationAnalytics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    connectedPlatforms: 3,
                    totalSyncs: 1247,
                    successfulSyncs: 1198,
                    failedSyncs: 49,
                    syncSuccessRate: 96.1,
                    lastSyncTime: new Date(Date.now() - 300000), // 5 minutes ago
                    platformStatus: {
                        shopify: { status: 'connected', lastSync: new Date(Date.now() - 180000), health: 'good' },
                        magento: { status: 'connected', lastSync: new Date(Date.now() - 240000), health: 'good' },
                        woocommerce: { status: 'connected', lastSync: new Date(Date.now() - 300000), health: 'warning' }
                    },
                    syncPerformance: this.generateTrendData(7, 80, 120),
                    dataQuality: {
                        products: 98.5,
                        orders: 97.2,
                        customers: 99.1,
                        inventory: 96.8
                    }
                });
            }, 900);
        });
    }

    /**
     * Generate trend data for charts
     */
    generateTrendData(days, min, max) {
        const data = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            data.push({
                date: date.toISOString().split('T')[0],
                value: value
            });
        }
        
        return data;
    }

    /**
     * Initialize charts and visualizations
     */
    initializeCharts() {
        try {
            console.log('📈 Initializing charts...');
            
            this.initializeSalesChart();
            this.initializeTrafficChart();
            this.initializeRevenueChart();
            this.initializeConversionChart();
            this.initializeCustomerChart();
            
            console.log('✅ Charts initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize charts:', error);
        }
    }

    /**
     * Initialize sales trend chart
     */
    initializeSalesChart() {
        const canvas = document.getElementById('sales-trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const salesData = this.analytics.sales.salesTrend || [];

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: salesData.map(item => item.date),
                datasets: [{
                    label: 'Daily Sales',
                    data: salesData.map(item => item.value),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize traffic chart
     */
    initializeTrafficChart() {
        const canvas = document.getElementById('traffic-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const trafficData = this.analytics.traffic.trafficTrend || [];

        this.charts.traffic = new Chart(ctx, {
            type: 'area',
            data: {
                labels: trafficData.map(item => item.date),
                datasets: [{
                    label: 'Daily Visitors',
                    data: trafficData.map(item => item.value),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Initialize revenue breakdown chart
     */
    initializeRevenueChart() {
        const canvas = document.getElementById('revenue-breakdown-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const salesByChannel = this.analytics.sales.salesByChannel || {};

        this.charts.revenue = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(salesByChannel).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
                datasets: [{
                    data: Object.values(salesByChannel),
                    backgroundColor: [
                        '#007bff',
                        '#28a745',
                        '#ffc107',
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Initialize conversion funnel chart
     */
    initializeConversionChart() {
        const canvas = document.getElementById('conversion-funnel-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.conversion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Visitors', 'Product Views', 'Add to Cart', 'Checkout', 'Purchase'],
                datasets: [{
                    label: 'Conversion Funnel',
                    data: [100, 65, 35, 20, 15],
                    backgroundColor: [
                        '#007bff',
                        '#17a2b8',
                        '#ffc107',
                        '#fd7e14',
                        '#28a745'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize customer growth chart
     */
    initializeCustomerChart() {
        const canvas = document.getElementById('customer-growth-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const customerData = this.analytics.customers.customerGrowth || [];

        this.charts.customers = new Chart(ctx, {
            type: 'line',
            data: {
                labels: customerData.map(item => item.date),
                datasets: [{
                    label: 'New Customers',
                    data: customerData.map(item => item.value),
                    borderColor: '#6f42c1',
                    backgroundColor: 'rgba(111, 66, 193, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Generate AI-powered insights
     */
    generateInsights() {
        try {
            console.log('🧠 Generating agentic insights...');
            
            this.insights = this.agenticInsights.analyzeData(this.analytics);
            this.displayInsights();
            
            console.log('✅ Insights generated successfully');
        } catch (error) {
            console.error('❌ Failed to generate insights:', error);
        }
    }

    /**
     * Display insights in the UI
     */
    displayInsights() {
        const insightsContainer = document.getElementById('analytics-insights');
        if (!insightsContainer) return;

        const insightsHTML = this.insights.map(insight => `
            <div class="insight-card ${insight.priority}">
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                    ${insight.action ? `<button class="insight-action-btn" onclick="dashboardAnalytics.executeInsightAction('${insight.id}')">${insight.action}</button>` : ''}
                </div>
                <div class="insight-impact">
                    <span class="impact-label">Impact:</span>
                    <span class="impact-value ${insight.impact.level}">${insight.impact.value}</span>
                </div>
            </div>
        `).join('');

        insightsContainer.innerHTML = insightsHTML;
    }

    /**
     * Update analytics display
     */
    updateAnalyticsDisplay() {
        this.updateKPICards();
        this.updateMetricCards();
        this.updateStatusIndicators();
    }

    /**
     * Update KPI cards
     */
    updateKPICards() {
        const kpis = [
            { id: 'total-revenue', value: this.analytics.sales.totalRevenue, format: 'currency' },
            { id: 'monthly-revenue', value: this.analytics.sales.monthlyRevenue, format: 'currency' },
            { id: 'total-orders', value: this.analytics.sales.orderCount, format: 'number' },
            { id: 'conversion-rate', value: this.analytics.sales.conversionRate, format: 'percentage' },
            { id: 'total-customers', value: this.analytics.customers.totalCustomers, format: 'number' },
            { id: 'customer-satisfaction', value: this.analytics.customers.customerSatisfaction, format: 'rating' }
        ];

        kpis.forEach(kpi => {
            const element = document.getElementById(kpi.id);
            if (element) {
                element.textContent = this.formatValue(kpi.value, kpi.format);
            }
        });
    }

    /**
     * Update metric cards
     */
    updateMetricCards() {
        // Update traffic metrics
        const trafficMetrics = document.getElementById('traffic-metrics');
        if (trafficMetrics) {
            trafficMetrics.innerHTML = `
                <div class="metric-item">
                    <span class="metric-label">Total Visitors</span>
                    <span class="metric-value">${this.formatValue(this.analytics.traffic.totalVisitors, 'number')}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Unique Visitors</span>
                    <span class="metric-value">${this.formatValue(this.analytics.traffic.uniqueVisitors, 'number')}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Bounce Rate</span>
                    <span class="metric-value">${this.formatValue(this.analytics.traffic.bounceRate, 'percentage')}</span>
                </div>
            `;
        }

        // Update product metrics
        const productMetrics = document.getElementById('product-metrics');
        if (productMetrics) {
            productMetrics.innerHTML = `
                <div class="metric-item">
                    <span class="metric-label">Total Products</span>
                    <span class="metric-value">${this.analytics.products.totalProducts}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Active Products</span>
                    <span class="metric-value">${this.analytics.products.activeProducts}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Low Stock</span>
                    <span class="metric-value warning">${this.analytics.products.lowStock}</span>
                </div>
            `;
        }
    }

    /**
     * Update status indicators
     */
    updateStatusIndicators() {
        const integrationStatus = document.getElementById('integration-status');
        if (integrationStatus) {
            const platforms = this.analytics.integrations.platformStatus || {};
            const statusHTML = Object.entries(platforms).map(([platform, status]) => `
                <div class="status-item">
                    <div class="status-indicator ${status.health}"></div>
                    <span class="status-platform">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                    <span class="status-time">${this.formatTimeAgo(status.lastSync)}</span>
                </div>
            `).join('');
            
            integrationStatus.innerHTML = statusHTML;
        }
    }

    /**
     * Format values based on type
     */
    formatValue(value, format) {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(value);
            case 'percentage':
                return `${value}%`;
            case 'number':
                return new Intl.NumberFormat('en-US').format(value);
            case 'rating':
                return `${value}/5.0`;
            default:
                return value;
        }
    }

    /**
     * Format time ago
     */
    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // Update analytics every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadAnalyticsData();
        }, 300000);

        // Update time-sensitive displays every minute
        setInterval(() => {
            this.updateStatusIndicators();
        }, 60000);
    }

    /**
     * Execute insight action
     */
    executeInsightAction(insightId) {
        const insight = this.insights.find(i => i.id === insightId);
        if (!insight) return;

        console.log(`🎯 Executing insight action: ${insight.title}`);
        
        switch (insight.actionType) {
            case 'optimize_campaign':
                this.optimizeCampaign(insight.data);
                break;
            case 'restock_product':
                this.restockProduct(insight.data);
                break;
            case 'improve_conversion':
                this.improveConversion(insight.data);
                break;
            default:
                this.showNotification(`Action executed: ${insight.title}`, 'success');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('analytics-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAnalyticsData();
                this.showNotification('Analytics data refreshed', 'success');
            });
        }

        // Export button
        const exportBtn = document.getElementById('analytics-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalytics();
            });
        }

        // Date range selector
        const dateRange = document.getElementById('analytics-date-range');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => {
                this.updateDateRange(e.target.value);
            });
        }
    }

    /**
     * Export analytics data
     */
    exportAnalytics() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                analytics: this.analytics,
                insights: this.insights
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Analytics data exported successfully', 'success');
        } catch (error) {
            console.error('❌ Failed to export analytics:', error);
            this.showNotification('Failed to export analytics data', 'error');
        }
    }

    /**
     * Update date range
     */
    updateDateRange(range) {
        console.log(`📅 Updating date range to: ${range}`);
        this.loadAnalyticsData();
    }

    /**
     * Event system
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `analytics-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });

        this.isInitialized = false;
        console.log('🧹 Dashboard Analytics Manager destroyed');
    }
}

/**
 * Agentic Insights Engine
 * AI-powered analytics insights and recommendations
 */
class AgenticInsightsEngine {
    constructor() {
        this.insightRules = this.initializeInsightRules();
    }

    /**
     * Initialize insight generation rules
     */
    initializeInsightRules() {
        return [
            {
                id: 'revenue_growth_opportunity',
                condition: (data) => data.sales.revenueGrowth < 10,
                generate: (data) => ({
                    id: 'revenue_growth_opportunity',
                    title: 'Revenue Growth Opportunity',
                    description: `Your revenue growth is ${data.sales.revenueGrowth}%. Consider optimizing your top-performing products or expanding to new channels.`,
                    priority: 'high',
                    icon: 'fas fa-chart-line',
                    impact: { level: 'high', value: '+25% potential revenue' },
                    action: 'Optimize Strategy',
                    actionType: 'optimize_campaign',
                    data: { type: 'revenue', current: data.sales.revenueGrowth }
                })
            },
            {
                id: 'inventory_alert',
                condition: (data) => data.products.lowStock > 5,
                generate: (data) => ({
                    id: 'inventory_alert',
                    title: 'Inventory Management Alert',
                    description: `${data.products.lowStock} products are running low on stock. Restock soon to avoid lost sales.`,
                    priority: 'medium',
                    icon: 'fas fa-boxes',
                    impact: { level: 'medium', value: 'Prevent stockouts' },
                    action: 'Restock Products',
                    actionType: 'restock_product',
                    data: { lowStockCount: data.products.lowStock }
                })
            },
            {
                id: 'conversion_optimization',
                condition: (data) => data.sales.conversionRate < 3.0,
                generate: (data) => ({
                    id: 'conversion_optimization',
                    title: 'Conversion Rate Optimization',
                    description: `Your conversion rate is ${data.sales.conversionRate}%. Optimize your checkout process and product pages to increase conversions.`,
                    priority: 'high',
                    icon: 'fas fa-funnel-dollar',
                    impact: { level: 'high', value: '+15% conversion rate' },
                    action: 'Improve Conversion',
                    actionType: 'improve_conversion',
                    data: { currentRate: data.sales.conversionRate }
                })
            },
            {
                id: 'customer_retention',
                condition: (data) => data.customers.churnRate > 5.0,
                generate: (data) => ({
                    id: 'customer_retention',
                    title: 'Customer Retention Focus',
                    description: `Customer churn rate is ${data.customers.churnRate}%. Implement retention strategies to reduce churn.`,
                    priority: 'medium',
                    icon: 'fas fa-user-friends',
                    impact: { level: 'medium', value: 'Reduce churn by 30%' },
                    action: 'Launch Retention Campaign',
                    actionType: 'retention_campaign',
                    data: { churnRate: data.customers.churnRate }
                })
            },
            {
                id: 'integration_health',
                condition: (data) => data.integrations.syncSuccessRate < 95,
                generate: (data) => ({
                    id: 'integration_health',
                    title: 'Integration Health Check',
                    description: `Sync success rate is ${data.integrations.syncSuccessRate}%. Review integration settings to improve reliability.`,
                    priority: 'medium',
                    icon: 'fas fa-sync-alt',
                    impact: { level: 'medium', value: 'Improve sync reliability' },
                    action: 'Check Integrations',
                    actionType: 'check_integrations',
                    data: { successRate: data.integrations.syncSuccessRate }
                })
            }
        ];
    }

    /**
     * Analyze data and generate insights
     */
    analyzeData(analytics) {
        const insights = [];

        this.insightRules.forEach(rule => {
            if (rule.condition(analytics)) {
                insights.push(rule.generate(analytics));
            }
        });

        // Add performance insights
        insights.push(...this.generatePerformanceInsights(analytics));
        
        // Add predictive insights
        insights.push(...this.generatePredictiveInsights(analytics));

        return insights.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Generate performance insights
     */
    generatePerformanceInsights(analytics) {
        const insights = [];

        // Top performing product insight
        if (analytics.products.productPerformance && analytics.products.productPerformance.length > 0) {
            const topProduct = analytics.products.productPerformance[0];
            insights.push({
                id: 'top_product_performance',
                title: 'Top Performing Product',
                description: `${topProduct.name} is your best performer with ${topProduct.sales} sales and ${topProduct.conversionRate}% conversion rate.`,
                priority: 'low',
                icon: 'fas fa-star',
                impact: { level: 'low', value: 'Continue momentum' },
                action: null,
                actionType: null,
                data: topProduct
            });
        }

        // Traffic source insight
        if (analytics.traffic.trafficSources) {
            const topSource = Object.entries(analytics.traffic.trafficSources)
                .sort(([,a], [,b]) => b - a)[0];
            
            insights.push({
                id: 'traffic_source_optimization',
                title: 'Traffic Source Optimization',
                description: `${topSource[0]} is your top traffic source at ${topSource[1]}%. Consider investing more in this channel.`,
                priority: 'low',
                icon: 'fas fa-chart-pie',
                impact: { level: 'low', value: 'Optimize traffic mix' },
                action: null,
                actionType: null,
                data: { source: topSource[0], percentage: topSource[1] }
            });
        }

        return insights;
    }

    /**
     * Generate predictive insights
     */
    generatePredictiveInsights(analytics) {
        const insights = [];

        // Revenue prediction
        if (analytics.sales.revenueGrowth > 0) {
            const projectedRevenue = analytics.sales.monthlyRevenue * (1 + analytics.sales.revenueGrowth / 100);
            insights.push({
                id: 'revenue_prediction',
                title: 'Revenue Forecast',
                description: `Based on current growth trends, next month's revenue is projected to be $${projectedRevenue.toLocaleString()}.`,
                priority: 'low',
                icon: 'fas fa-crystal-ball',
                impact: { level: 'low', value: 'Plan ahead' },
                action: null,
                actionType: null,
                data: { projected: projectedRevenue, growth: analytics.sales.revenueGrowth }
            });
        }

        return insights;
    }
}

// Global instance
window.dashboardAnalytics = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('analytics-dashboard')) {
        window.dashboardAnalytics = new DashboardAnalyticsManager();
    }
});