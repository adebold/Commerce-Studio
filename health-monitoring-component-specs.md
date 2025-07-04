# Health Monitoring Component Specifications
## Detailed Technical Specifications for Implementation Teams

### Overview

This document provides detailed technical specifications for implementing the health monitoring system components, complementing the main architecture document. Each component includes implementation details, code examples, and integration guidelines.

---

## 1. Health Dashboard Frontend Component

### Component Structure

**File**: [`website/admin/js/health-dashboard.js`](../../website/admin/js/health-dashboard.js)

```javascript
/**
 * Health Dashboard Component
 * Integrates with existing VARAi Admin Portal
 */
class HealthDashboard {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: options.apiBaseUrl || '/api/v1/health',
            wsUrl: options.wsUrl || 'wss://health-monitor-service.run.app/ws/status',
            refreshInterval: options.refreshInterval || 30000,
            chartUpdateInterval: options.chartUpdateInterval || 5000,
            maxHistoryPoints: options.maxHistoryPoints || 100,
            ...options
        };
        
        this.services = [
            {
                id: 'virtual-try-on',
                name: 'Virtual Try On',
                description: 'AI-powered virtual eyewear fitting',
                endpoint: 'https://virtual-try-on-service.run.app'
            },
            {
                id: 'pupillary-distance',
                name: 'Pupillary Distance Tools',
                description: 'Precise PD measurement algorithms',
                endpoint: 'https://pd-tools-service.run.app'
            },
            {
                id: 'eyewear-fitting',
                name: 'Eyewear Fitting Height',
                description: 'Optimal frame positioning calculator',
                endpoint: 'https://fitting-height-service.run.app'
            },
            {
                id: 'glb-directory',
                name: 'GLB Directory Service',
                description: '3D model asset management',
                endpoint: 'https://glb-directory-service.run.app'
            }
        ];
        
        this.wsConnection = null;
        this.charts = {};
        this.statusCache = new Map();
        this.alertsCache = [];
        
        this.init();
    }
    
    /**
     * Initialize the health dashboard
     */
    async init() {
        try {
            await this.createDashboardHTML();
            await this.initializeWebSocket();
            await this.loadInitialData();
            this.setupEventListeners();
            this.startPeriodicUpdates();
            
            console.log('Health Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Health Dashboard:', error);
            this.showError('Failed to initialize health monitoring');
        }
    }
    
    /**
     * Create the dashboard HTML structure
     */
    async createDashboardHTML() {
        const dashboardHTML = `
            <div id="healthDashboard" class="admin-content health-dashboard" style="display: none;">
                <div class="health-header">
                    <h2 class="section-title">Service Health Monitoring</h2>
                    <div class="health-controls">
                        <button class="btn-action primary" onclick="healthDashboard.refreshAll()">
                            <span class="icon">🔄</span> Refresh All
                        </button>
                        <button class="btn-action" onclick="healthDashboard.exportReport()">
                            <span class="icon">📊</span> Export Report
                        </button>
                    </div>
                </div>
                
                <div class="health-overview">
                    <div class="services-grid" id="servicesGrid">
                        <!-- Service status cards will be populated here -->
                    </div>
                </div>
                
                <div class="health-details">
                    <div class="metrics-section">
                        <h3 class="subsection-title">Performance Metrics</h3>
                        <div class="metrics-grid">
                            <div class="metric-chart-container">
                                <canvas id="responseTimeChart"></canvas>
                            </div>
                            <div class="metric-chart-container">
                                <canvas id="errorRateChart"></canvas>
                            </div>
                            <div class="metric-chart-container">
                                <canvas id="throughputChart"></canvas>
                            </div>
                            <div class="metric-chart-container">
                                <canvas id="resourceUsageChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alerts-section">
                        <h3 class="subsection-title">Active Alerts</h3>
                        <div class="alerts-container" id="alertsContainer">
                            <!-- Alerts will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert dashboard HTML into admin content area
        const adminContent = document.querySelector('.admin-content').parentNode;
        adminContent.insertAdjacentHTML('beforeend', dashboardHTML);
    }
    
    /**
     * Initialize WebSocket connection for real-time updates
     */
    async initializeWebSocket() {
        try {
            this.wsConnection = new WebSocket(this.config.wsUrl);
            
            this.wsConnection.onopen = () => {
                console.log('WebSocket connected to health monitoring service');
                this.updateConnectionStatus(true);
            };
            
            this.wsConnection.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealtimeUpdate(data);
            };
            
            this.wsConnection.onclose = () => {
                console.log('WebSocket connection closed');
                this.updateConnectionStatus(false);
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.initializeWebSocket(), 5000);
            };
            
            this.wsConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus(false);
            };
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }
    
    /**
     * Load initial dashboard data
     */
    async loadInitialData() {
        try {
            // Load service statuses
            await this.loadServiceStatuses();
            
            // Load active alerts
            await this.loadActiveAlerts();
            
            // Initialize charts
            await this.initializeCharts();
            
            // Load historical metrics
            await this.loadHistoricalMetrics();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load health monitoring data');
        }
    }
    
    /**
     * Load current service statuses
     */
    async loadServiceStatuses() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/services`);
            const services = await response.json();
            
            services.forEach(service => {
                this.statusCache.set(service.id, service);
            });
            
            this.renderServiceCards();
        } catch (error) {
            console.error('Failed to load service statuses:', error);
        }
    }
    
    /**
     * Render service status cards
     */
    renderServiceCards() {
        const servicesGrid = document.getElementById('servicesGrid');
        servicesGrid.innerHTML = '';
        
        this.services.forEach(serviceConfig => {
            const status = this.statusCache.get(serviceConfig.id) || {
                status: 'unknown',
                metrics: {},
                last_check: null
            };
            
            const card = this.createServiceCard(serviceConfig, status);
            servicesGrid.appendChild(card);
        });
    }
    
    /**
     * Create individual service status card
     */
    createServiceCard(serviceConfig, status) {
        const card = document.createElement('div');
        card.className = `service-status-card ${status.status}`;
        card.id = `service-${serviceConfig.id}`;
        
        const statusIcon = this.getStatusIcon(status.status);
        const statusColor = this.getStatusColor(status.status);
        const lastCheck = status.last_check ? 
            new Date(status.last_check).toLocaleTimeString() : 'Never';
        
        card.innerHTML = `
            <div class="service-header">
                <div class="service-icon" style="color: ${statusColor}">
                    ${statusIcon}
                </div>
                <div class="service-info">
                    <h4 class="service-name">${serviceConfig.name}</h4>
                    <p class="service-description">${serviceConfig.description}</p>
                </div>
                <div class="service-status">
                    <span class="status-badge ${status.status}">${status.status}</span>
                </div>
            </div>
            
            <div class="service-metrics">
                <div class="metric-item">
                    <span class="metric-label">Response Time</span>
                    <span class="metric-value">${status.metrics.response_time_ms || 0}ms</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Error Rate</span>
                    <span class="metric-value">${status.metrics.error_rate_percent || 0}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">CPU Usage</span>
                    <span class="metric-value">${status.metrics.cpu_usage_percent || 0}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Memory Usage</span>
                    <span class="metric-value">${status.metrics.memory_usage_percent || 0}%</span>
                </div>
            </div>
            
            <div class="service-footer">
                <span class="last-check">Last check: ${lastCheck}</span>
                <div class="service-actions">
                    <button class="btn-action small" onclick="healthDashboard.viewServiceDetails('${serviceConfig.id}')">
                        Details
                    </button>
                    <button class="btn-action small" onclick="healthDashboard.testService('${serviceConfig.id}')">
                        Test
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Initialize performance charts
     */
    async initializeCharts() {
        // Response Time Chart
        this.charts.responseTime = new Chart(
            document.getElementById('responseTimeChart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: this.services.map((service, index) => ({
                        label: service.name,
                        data: [],
                        borderColor: this.getChartColor(index),
                        backgroundColor: this.getChartColor(index, 0.1),
                        tension: 0.4
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Milliseconds'
                            }
                        }
                    }
                }
            }
        );
        
        // Error Rate Chart
        this.charts.errorRate = new Chart(
            document.getElementById('errorRateChart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: this.services.map((service, index) => ({
                        label: service.name,
                        data: [],
                        borderColor: this.getChartColor(index),
                        backgroundColor: this.getChartColor(index, 0.1),
                        tension: 0.4
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Error Rate (%)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Percentage'
                            }
                        }
                    }
                }
            }
        );
        
        // Initialize other charts...
    }
    
    /**
     * Handle real-time updates from WebSocket
     */
    handleRealtimeUpdate(data) {
        switch (data.type) {
            case 'service_status':
                this.updateServiceStatus(data.service_id, data.status);
                break;
            case 'new_alert':
                this.addAlert(data.alert);
                break;
            case 'alert_resolved':
                this.resolveAlert(data.alert_id);
                break;
            case 'metrics_update':
                this.updateMetrics(data.service_id, data.metrics);
                break;
        }
    }
    
    /**
     * Update service status in real-time
     */
    updateServiceStatus(serviceId, status) {
        this.statusCache.set(serviceId, status);
        
        const card = document.getElementById(`service-${serviceId}`);
        if (card) {
            // Update card styling
            card.className = `service-status-card ${status.status}`;
            
            // Update status badge
            const statusBadge = card.querySelector('.status-badge');
            statusBadge.className = `status-badge ${status.status}`;
            statusBadge.textContent = status.status;
            
            // Update metrics
            this.updateCardMetrics(card, status.metrics);
        }
    }
    
    /**
     * Utility methods
     */
    getStatusIcon(status) {
        const icons = {
            healthy: '✅',
            degraded: '⚠️',
            unhealthy: '❌',
            unknown: '❓'
        };
        return icons[status] || icons.unknown;
    }
    
    getStatusColor(status) {
        const colors = {
            healthy: 'var(--varai-success)',
            degraded: 'var(--varai-warning)',
            unhealthy: 'var(--varai-error)',
            unknown: 'var(--varai-gray-400)'
        };
        return colors[status] || colors.unknown;
    }
    
    getChartColor(index, alpha = 1) {
        const colors = [
            `rgba(30, 150, 252, ${alpha})`,  // VARAi Accent
            `rgba(48, 209, 88, ${alpha})`,   // Success
            `rgba(255, 149, 0, ${alpha})`,   // Warning
            `rgba(255, 59, 48, ${alpha})`    // Error
        ];
        return colors[index % colors.length];
    }
    
    /**
     * Public methods for external interaction
     */
    async refreshAll() {
        await this.loadServiceStatuses();
        await this.loadActiveAlerts();
        this.showSuccess('All data refreshed successfully');
    }
    
    async viewServiceDetails(serviceId) {
        // Implementation for detailed service view
        console.log(`Viewing details for service: ${serviceId}`);
    }
    
    async testService(serviceId) {
        // Implementation for manual service testing
        console.log(`Testing service: ${serviceId}`);
    }
    
    showError(message) {
        // Implementation for error notifications
        console.error(message);
    }
    
    showSuccess(message) {
        // Implementation for success notifications
        console.log(message);
    }
}

// Global instance
let healthDashboard;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    healthDashboard = new HealthDashboard();
});
```

### CSS Styles

**File**: [`website/css/health-dashboard.css`](../../website/css/health-dashboard.css)

```css
/* Health Dashboard Styles */
.health-dashboard {
    padding: 2rem;
    background: var(--varai-gray-50);
    min-height: calc(100vh - 120px);
}

.health-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--varai-border);
}

.health-controls {
    display: flex;
    gap: 1rem;
}

.health-overview {
    margin-bottom: 3rem;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.service-status-card {
    background: var(--varai-background);
    border: 1px solid var(--varai-border);
    border-radius: 12px;
    padding: 1.5rem;
    transition: var(--varai-transition);
    box-shadow: var(--varai-shadow-sm);
}

.service-status-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--varai-shadow-lg);
}

.service-status-card.healthy {
    border-left: 4px solid var(--varai-success);
}

.service-status-card.degraded {
    border-left: 4px solid var(--varai-warning);
}

.service-status-card.unhealthy {
    border-left: 4px solid var(--varai-error);
}

.service-status-card.unknown {
    border-left: 4px solid var(--varai-gray-400);
}

.service-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
}

.service-icon {
    font-size: 1.5rem;
    margin-top: 0.25rem;
}

.service-info {
    flex: 1;
}

.service-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--varai-foreground);
}

.service-description {
    margin: 0;
    font-size: 0.9rem;
    color: var(--varai-gray-600);
}

.service-status {
    margin-left: auto;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.healthy {
    background: rgba(48, 209, 88, 0.1);
    color: var(--varai-success);
}

.status-badge.degraded {
    background: rgba(255, 149, 0, 0.1);
    color: var(--varai-warning);
}

.status-badge.unhealthy {
    background: rgba(255, 59, 48, 0.1);
    color: var(--varai-error);
}

.status-badge.unknown {
    background: rgba(142, 142, 147, 0.1);
    color: var(--varai-gray-400);
}

.service-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--varai-gray-50);
    border-radius: 8px;
}

.metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metric-label {
    font-size: 0.8rem;
    color: var(--varai-gray-600);
    font-weight: 500;
}

.metric-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--varai-foreground);
}

.service-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid var(--varai-border);
}

.last-check {
    font-size: 0.8rem;
    color: var(--varai-gray-500);
}

.service-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-action.small {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
}

.health-details {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
}

.metrics-section,
.alerts-section {
    background: var(--varai-background);
    border: 1px solid var(--varai-border);
    border-radius: 12px;
    padding: 1.5rem;
}

.subsection-title {
    margin: 0 0 1.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--varai-foreground);
}

.metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.metric-chart-container {
    height: 250px;
    position: relative;
}

.alerts-container {
    max-height: 600px;
    overflow-y: auto;
}

.alert-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--varai-border);
    transition: var(--varai-transition);
}

.alert-item:hover {
    background: var(--varai-gray-50);
}

.alert-item:last-child {
    border-bottom: none;
}

.alert-item.critical {
    background: rgba(255, 59, 48, 0.05);
    border-left: 4px solid var(--varai-error);
}

.alert-item.warning {
    background: rgba(255, 149, 0, 0.05);
    border-left: 4px solid var(--varai-warning);
}

.alert-item.info {
    background: rgba(0, 122, 255, 0.05);
    border-left: 4px solid var(--varai-info);
}

.alert-icon {
    font-size: 1.2rem;
    margin-right: 1rem;
}

.alert-content {
    flex: 1;
}

.alert-title {
    margin: 0 0 0.25rem 0;
    font-weight: 600;
    color: var(--varai-foreground);
}

.alert-message {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    color: var(--varai-gray-700);
}

.alert-time {
    font-size: 0.8rem;
    color: var(--varai-gray-500);
}

.alert-actions {
    display: flex;
    gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .health-details {
        grid-template-columns: 1fr;
    }
    
    .metrics-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .health-dashboard {
        padding: 1rem;
    }
    
    .health-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
    
    .services-grid {
        grid-template-columns: 1fr;
    }
    
    .service-metrics {
        grid-template-columns: 1fr;
    }
    
    .service-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
}

/* Animation for real-time updates */
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

.service-status-card.updating {
    animation: pulse 1s ease-in-out;
}

.alert-item.new {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

---

## 2. Health Check API Specifications

### Service Health Check Implementation

**File**: [`backend/health-monitor/src/health-checker.js`](../../backend/health-monitor/src/health-checker.js)

```javascript
/**
 * Health Check Service
 * Performs health checks on Cloud Run services
 */
class HealthChecker {
    constructor(config) {
        this.config = {
            timeout: config.timeout || 10000,
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 1000,
            ...config
        };
        
        this.services = new Map();
        this.loadServiceConfigurations();
    }
    
    /**
     * Load service configurations
     */
    loadServiceConfigurations() {
        const serviceConfigs = [
            {
                id: 'virtual-try-on',
                name: 'Virtual Try On Application',
                baseUrl: 'https://virtual-try-on-service.run.app',
                healthEndpoints: {
                    basic: '/health',
                    detailed: '/health/detailed',
                    dependencies: '/health/dependencies'
                },
                thresholds: {
                    response_time_ms: 2000,
                    error_rate_percent: 5,
                    cpu_usage_percent: 80,
                    memory_usage_percent: 85
                }
            },
            {
                id: 'pupillary-distance',
                name: 'Pupillary Distance Tools',
                baseUrl: 'https://pd-tools-service.run.app',
                healthEndpoints: {
                    basic: '/health',
                    calibration: '/health/calibration',
                    performance: '/health/performance'
                },
                thresholds: {
                    response_time_ms: 1500,
                    error_rate_percent: 3,
                    cpu_usage_percent: 75,
                    memory_usage_percent: 80
                }
            },
            {
                id: 'eyewear-fitting',
                name: 'Eyewear Fitting Height Tool',
                baseUrl: 'https://fitting-height-service.run.app',
                healthEndpoints: {
                    basic: '/health',
                    accuracy: '/health/accuracy',
                    resources: '/health/resources'
                },
                thresholds: {
                    response_time_ms: 1800,
                    error_rate_percent: 4,
                    cpu_usage_percent: 78,
                    memory_usage_percent: 82
                }
            },
            {
                id: 'glb-directory',
                name: 'GLB Directory Service',
                baseUrl: 'https://glb-directory-service.run.app',
                healthEndpoints: {
                    basic: '/health',
                    storage: '/health/storage',
                    cdn: '/health/cdn'
                },
                thresholds: {
                    response_time_ms: 1000,
                    error_rate_percent: 2,
                    cpu_usage_percent: 70,
                    memory_usage_percent: 75
                }
            }
        ];
        
        serviceConfigs.forEach(config => {
            this.services.set(config.id, config);
        });
    }
    
    /**
     * Perform health check on a specific service
     */
    async checkService(serviceId, checkType = 'basic') {
        const service = this.services.get(serviceId);
        if (!service) {
            throw new Error(`Service ${serviceId} not found`);
        }
        
        const startTime = Date.now();
        let attempt = 0;
        
        while (attempt < this.config.retryAttempts) {
            try {
                const result = await this.performHealthCheck(service, checkType);
                const responseTime = Date.now() - startTime;
                
                return {
                    service_id: serviceId,
                    service_name: service.name,
                    status: this.determineStatus(result, service.thresholds),
                    timestamp: new Date().toISOString(),
                    response_time_ms: responseTime,
                    check_type: checkType,
                    attempt: attempt + 1,
                    ...result
                };
            } catch (error) {
                attempt++;
                if (attempt >= this.config.retryAttempts) {
                    return {
                        service_id: serviceId,
                        service_name: service.name,
                        status: 'unhealthy',
                        timestamp: new Date().toISOString(),
                        response_time_ms: Date.now() - startTime,
                        check_type: checkType,
                        attempt: attempt,
                        error: error.message,
                        metrics: {}
                    };
                }
                
                await this.delay(this.config.retryDelay * attempt);
            }
        }
    }
    
    /**
     * Perform the actual HTTP health check
     */
    async performHealthCheck(service, checkType) {
        const endpoint = service.healthEndpoints[checkType] || service.healthEndpoints.basic;
        const url = `${service.baseUrl}${endpoint}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'VARAi-Health-Monitor/1.0'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return this.normalizeHealthResponse(data);
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    /**
     * Normalize health response to standard format
     */
    normalizeHealthResponse(data) {
        return {
            version: data.version || 'unknown',
            uptime: data.uptime || 0,
            metrics: {
                response_time_ms: data.metrics?.response_time_ms || 0,
                error_rate_percent: data.metrics?.error_rate_percent || 0,
                cpu_usage_percent: data.metrics?.cpu_usage_percent || 0,
                memory_usage_percent: data