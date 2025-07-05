/**
 * Real-time Data Manager for Customer Portal
 * Implements US-004: Real-time Data Integration
 * 
 * Features:
 * - WebSocket connections for live updates
 * - Real-time usage monitoring
 * - Live billing calculations
 * - Connection management and reconnection
 * - Event-driven architecture
 * - Performance optimization
 */

class RealTimeDataManager {
    constructor(options = {}) {
        this.options = {
            wsUrl: options.wsUrl || this.getWebSocketUrl(),
            reconnectInterval: options.reconnectInterval || 5000,
            maxReconnectAttempts: options.maxReconnectAttempts || 10,
            heartbeatInterval: options.heartbeatInterval || 30000,
            debug: options.debug || false,
            ...options
        };

        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.heartbeatTimer = null;
        this.eventListeners = new Map();
        this.subscriptions = new Set();
        this.lastHeartbeat = null;
        
        // Data caches for real-time updates
        this.usageData = {
            current: {},
            history: [],
            limits: {}
        };
        
        this.billingData = {
            currentUsage: 0,
            estimatedCost: 0,
            billingCycle: {},
            alerts: []
        };

        this.connectionStatus = {
            connected: false,
            lastConnected: null,
            reconnectAttempts: 0,
            latency: 0
        };

        this.init();
    }

    /**
     * Initialize the real-time data manager
     */
    init() {
        this.log('Initializing Real-time Data Manager...');
        this.connect();
        this.setupEventListeners();
        this.startHeartbeat();
    }

    /**
     * Get WebSocket URL based on environment
     */
    getWebSocketUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws/customer-portal`;
    }

    /**
     * Establish WebSocket connection
     */
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.log('WebSocket already connected');
            return;
        }

        this.log(`Connecting to WebSocket: ${this.options.wsUrl}`);
        
        try {
            this.ws = new WebSocket(this.options.wsUrl);
            this.setupWebSocketHandlers();
        } catch (error) {
            this.log('Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    setupWebSocketHandlers() {
        this.ws.onopen = (event) => {
            this.log('WebSocket connected successfully');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.connectionStatus.connected = true;
            this.connectionStatus.lastConnected = new Date();
            
            this.emit('connected', { timestamp: new Date() });
            this.subscribeToChannels();
            this.updateConnectionStatus();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                this.log('Failed to parse WebSocket message:', error);
            }
        };

        this.ws.onclose = (event) => {
            this.log('WebSocket connection closed:', event.code, event.reason);
            this.isConnected = false;
            this.connectionStatus.connected = false;
            
            this.emit('disconnected', { 
                code: event.code, 
                reason: event.reason,
                timestamp: new Date()
            });
            
            this.updateConnectionStatus();
            
            if (!event.wasClean) {
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            this.log('WebSocket error:', error);
            this.emit('error', { error, timestamp: new Date() });
        };
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(data) {
        const { type, payload, timestamp } = data;
        
        this.log('Received message:', type, payload);

        switch (type) {
            case 'usage_update':
                this.handleUsageUpdate(payload);
                break;
            case 'billing_update':
                this.handleBillingUpdate(payload);
                break;
            case 'plan_change':
                this.handlePlanChange(payload);
                break;
            case 'alert':
                this.handleAlert(payload);
                break;
            case 'heartbeat':
                this.handleHeartbeat(payload);
                break;
            case 'subscription_confirmed':
                this.handleSubscriptionConfirmed(payload);
                break;
            default:
                this.log('Unknown message type:', type);
        }

        // Emit generic message event
        this.emit('message', { type, payload, timestamp });
    }

    /**
     * Handle real-time usage updates
     */
    handleUsageUpdate(payload) {
        const { metric, value, limit, percentage, timestamp } = payload;
        
        // Update usage data cache
        this.usageData.current[metric] = {
            value,
            limit,
            percentage,
            timestamp: new Date(timestamp)
        };

        // Add to history
        this.usageData.history.push({
            metric,
            value,
            timestamp: new Date(timestamp)
        });

        // Keep only last 100 history entries
        if (this.usageData.history.length > 100) {
            this.usageData.history = this.usageData.history.slice(-100);
        }

        // Update UI elements
        this.updateUsageDisplay(metric, value, limit, percentage);
        
        // Check for usage alerts
        this.checkUsageAlerts(metric, percentage);

        this.emit('usage_update', { metric, value, limit, percentage, timestamp });
    }

    /**
     * Handle real-time billing updates
     */
    handleBillingUpdate(payload) {
        const { currentUsage, estimatedCost, billingCycle, alerts } = payload;
        
        // Update billing data cache
        this.billingData = {
            currentUsage,
            estimatedCost,
            billingCycle,
            alerts,
            lastUpdated: new Date()
        };

        // Update billing display
        this.updateBillingDisplay();

        this.emit('billing_update', payload);
    }

    /**
     * Handle plan change notifications
     */
    handlePlanChange(payload) {
        const { newPlan, effectiveDate, changes } = payload;
        
        this.log('Plan change received:', newPlan);
        
        // Show notification
        this.showNotification('Plan Updated', 
            `Your plan has been changed to ${newPlan.name}`, 'success');
        
        // Update plan display
        this.updatePlanDisplay(newPlan);

        this.emit('plan_change', payload);
    }

    /**
     * Handle real-time alerts
     */
    handleAlert(payload) {
        const { level, title, message, action } = payload;
        
        this.log('Alert received:', level, title);
        
        // Show alert notification
        this.showNotification(title, message, level);
        
        // Add to alerts list
        this.billingData.alerts.unshift({
            ...payload,
            timestamp: new Date()
        });

        this.emit('alert', payload);
    }

    /**
     * Handle heartbeat response
     */
    handleHeartbeat(payload) {
        const now = Date.now();
        if (this.lastHeartbeat) {
            this.connectionStatus.latency = now - this.lastHeartbeat;
        }
        this.updateConnectionStatus();
    }

    /**
     * Subscribe to real-time channels
     */
    subscribeToChannels() {
        const subscriptions = [
            'usage_monitoring',
            'billing_updates',
            'plan_changes',
            'system_alerts'
        ];

        subscriptions.forEach(channel => {
            this.subscribe(channel);
        });
    }

    /**
     * Subscribe to a specific channel
     */
    subscribe(channel) {
        if (!this.isConnected) {
            this.log('Cannot subscribe - not connected');
            return;
        }

        const message = {
            type: 'subscribe',
            channel: channel,
            timestamp: new Date().toISOString()
        };

        this.send(message);
        this.subscriptions.add(channel);
        this.log('Subscribed to channel:', channel);
    }

    /**
     * Unsubscribe from a channel
     */
    unsubscribe(channel) {
        if (!this.isConnected) {
            return;
        }

        const message = {
            type: 'unsubscribe',
            channel: channel,
            timestamp: new Date().toISOString()
        };

        this.send(message);
        this.subscriptions.delete(channel);
        this.log('Unsubscribed from channel:', channel);
    }

    /**
     * Send message through WebSocket
     */
    send(message) {
        if (!this.isConnected || this.ws.readyState !== WebSocket.OPEN) {
            this.log('Cannot send message - not connected');
            return false;
        }

        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            this.log('Failed to send message:', error);
            return false;
        }
    }

    /**
     * Start heartbeat mechanism
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.lastHeartbeat = Date.now();
                this.send({
                    type: 'heartbeat',
                    timestamp: new Date().toISOString()
                });
            }
        }, this.options.heartbeatInterval);
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            this.log('Max reconnection attempts reached');
            this.emit('max_reconnect_attempts');
            return;
        }

        this.reconnectAttempts++;
        this.connectionStatus.reconnectAttempts = this.reconnectAttempts;
        
        this.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${this.options.reconnectInterval}ms`);
        
        setTimeout(() => {
            this.connect();
        }, this.options.reconnectInterval);
    }

    /**
     * Update usage display in UI
     */
    updateUsageDisplay(metric, value, limit, percentage) {
        const elements = {
            value: document.getElementById(`usage-${metric}-value`),
            limit: document.getElementById(`usage-${metric}-limit`),
            percentage: document.getElementById(`usage-${metric}-percentage`),
            progress: document.getElementById(`usage-${metric}-progress`)
        };

        if (elements.value) {
            elements.value.textContent = this.formatUsageValue(metric, value);
        }
        
        if (elements.limit) {
            elements.limit.textContent = this.formatUsageValue(metric, limit);
        }
        
        if (elements.percentage) {
            elements.percentage.textContent = `${percentage.toFixed(1)}%`;
        }
        
        if (elements.progress) {
            elements.progress.style.width = `${Math.min(percentage, 100)}%`;
            elements.progress.className = `usage-progress ${this.getUsageClass(percentage)}`;
        }
    }

    /**
     * Update billing display in UI
     */
    updateBillingDisplay() {
        const elements = {
            currentUsage: document.getElementById('current-usage-amount'),
            estimatedCost: document.getElementById('estimated-cost-amount'),
            billingCycle: document.getElementById('billing-cycle-info')
        };

        if (elements.currentUsage) {
            elements.currentUsage.textContent = `$${this.billingData.currentUsage.toFixed(2)}`;
        }
        
        if (elements.estimatedCost) {
            elements.estimatedCost.textContent = `$${this.billingData.estimatedCost.toFixed(2)}`;
        }
        
        if (elements.billingCycle && this.billingData.billingCycle) {
            const { startDate, endDate, daysRemaining } = this.billingData.billingCycle;
            elements.billingCycle.textContent = `${daysRemaining} days remaining in cycle`;
        }
    }

    /**
     * Update plan display
     */
    updatePlanDisplay(plan) {
        const elements = {
            name: document.getElementById('current-plan-name'),
            price: document.getElementById('current-plan-price'),
            features: document.getElementById('current-plan-features')
        };

        if (elements.name) {
            elements.name.textContent = plan.name;
        }
        
        if (elements.price) {
            elements.price.textContent = `$${plan.price}/month`;
        }
    }

    /**
     * Update connection status display
     */
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        const latencyElement = document.getElementById('connection-latency');
        
        if (statusElement) {
            statusElement.className = `connection-status ${this.isConnected ? 'connected' : 'disconnected'}`;
            statusElement.textContent = this.isConnected ? 'Connected' : 'Disconnected';
        }
        
        if (latencyElement && this.connectionStatus.latency) {
            latencyElement.textContent = `${this.connectionStatus.latency}ms`;
        }
    }

    /**
     * Check for usage alerts
     */
    checkUsageAlerts(metric, percentage) {
        const thresholds = [50, 75, 90, 95];
        
        thresholds.forEach(threshold => {
            if (percentage >= threshold && !this.hasRecentAlert(metric, threshold)) {
                this.showUsageAlert(metric, percentage, threshold);
            }
        });
    }

    /**
     * Show usage alert
     */
    showUsageAlert(metric, percentage, threshold) {
        const message = `${metric} usage is at ${percentage.toFixed(1)}% (${threshold}% threshold reached)`;
        this.showNotification('Usage Alert', message, 'warning');
    }

    /**
     * Check if there's a recent alert for this metric and threshold
     */
    hasRecentAlert(metric, threshold) {
        const recentTime = Date.now() - (5 * 60 * 1000); // 5 minutes
        return this.billingData.alerts.some(alert => 
            alert.metric === metric && 
            alert.threshold === threshold && 
            new Date(alert.timestamp).getTime() > recentTime
        );
    }

    /**
     * Show notification
     */
    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4 class="notification-title">${title}</h4>
                <p class="notification-message">${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add to notifications container
        const container = document.getElementById('notifications-container') || 
                         this.createNotificationsContainer();
        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Add close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    /**
     * Create notifications container if it doesn't exist
     */
    createNotificationsContainer() {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Format usage value based on metric type
     */
    formatUsageValue(metric, value) {
        switch (metric) {
            case 'api_calls':
                return value.toLocaleString();
            case 'storage':
                return this.formatBytes(value);
            case 'bandwidth':
                return this.formatBytes(value);
            default:
                return value.toString();
        }
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Get CSS class based on usage percentage
     */
    getUsageClass(percentage) {
        if (percentage >= 95) return 'critical';
        if (percentage >= 90) return 'high';
        if (percentage >= 75) return 'medium';
        return 'normal';
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Connection status click handler
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.addEventListener('click', () => {
                if (!this.isConnected) {
                    this.connect();
                }
            });
        }
    }

    /**
     * Event emitter functionality
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.log('Error in event callback:', error);
                }
            });
        }
    }

    /**
     * Get current usage data
     */
    getUsageData() {
        return { ...this.usageData };
    }

    /**
     * Get current billing data
     */
    getBillingData() {
        return { ...this.billingData };
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return { ...this.connectionStatus };
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        this.log('Disconnecting Real-time Data Manager...');
        
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.ws) {
            this.ws.close(1000, 'Manual disconnect');
            this.ws = null;
        }

        this.isConnected = false;
        this.connectionStatus.connected = false;
        this.updateConnectionStatus();
    }

    /**
     * Logging utility
     */
    log(...args) {
        if (this.options.debug) {
            console.log('[RealTimeDataManager]', ...args);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeDataManager;
} else {
    window.RealTimeDataManager = RealTimeDataManager;
}