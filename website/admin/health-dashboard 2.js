/**
 * Health Dashboard Frontend Component
 * Real-time health monitoring for Cloud Run services
 */

class HealthDashboard {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl || '/api/health/v1',
      wsUrl: config.wsUrl || `ws://${window.location.host}/ws/health`,
      refreshInterval: config.refreshInterval || 30000,
      maxHistoryPoints: config.maxHistoryPoints || 100,
      chartUpdateInterval: config.chartUpdateInterval || 5000
    };
    
    this.services = [
      'virtual-try-on',
      'pupillary-distance', 
      'eyewear-fitting',
      'glb-directory'
    ];
    
    this.wsConnection = null;
    this.charts = {};
    this.statusCache = new Map();
    this.alertsCache = [];
    this.metricsHistory = new Map();
    this.connectionStatus = 'disconnected';
    this.refreshTimer = null;
    this.chartUpdateTimer = null;
    
    // Bind methods
    this.handleRealtimeUpdate = this.handleRealtimeUpdate.bind(this);
    this.handleWebSocketError = this.handleWebSocketError.bind(this);
    this.handleWebSocketClose = this.handleWebSocketClose.bind(this);
  }

  /**
   * Initialize the health dashboard
   */
  async initialize() {
    console.log('Initializing Health Dashboard...');
    
    try {
      await this.createDashboardHTML();
      await this.initializeWebSocket();
      await this.loadInitialData();
      this.initializeCharts();
      this.setupEventListeners();
      this.startPeriodicUpdates();
      this.integrateHelpSystem();
      
      console.log('Health Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Health Dashboard:', error);
      this.showError('Failed to initialize health dashboard');
    }
  }

  /**
   * Create the dashboard HTML structure
   */
  async createDashboardHTML() {
    const servicesGrid = document.getElementById('servicesGrid');
    const metricsCharts = document.getElementById('metricsCharts');
    const alertsPanel = document.getElementById('alertsPanel');
    
    if (!servicesGrid || !metricsCharts || !alertsPanel) {
      throw new Error('Required dashboard elements not found');
    }
    
    // Create services grid
    servicesGrid.innerHTML = this.services.map(serviceId => 
      this.createServiceCardHTML(serviceId)
    ).join('');
    
    // Create metrics charts container
    metricsCharts.innerHTML = `
      <div class="charts-grid">
        <div class="chart-container">
          <h4>Response Time</h4>
          <canvas id="responseTimeChart"></canvas>
        </div>
        <div class="chart-container">
          <h4>Error Rate</h4>
          <canvas id="errorRateChart"></canvas>
        </div>
        <div class="chart-container">
          <h4>CPU Usage</h4>
          <canvas id="cpuUsageChart"></canvas>
        </div>
        <div class="chart-container">
          <h4>Memory Usage</h4>
          <canvas id="memoryUsageChart"></canvas>
        </div>
      </div>
    `;
    
    // Create alerts panel
    alertsPanel.innerHTML = `
      <div class="alerts-header">
        <div class="alerts-summary" id="alertsSummary">
          <span class="alert-count critical">0</span>
          <span class="alert-count warning">0</span>
          <span class="alert-count info">0</span>
        </div>
        <button class="btn-action" id="clearAlertsBtn">Clear All</button>
      </div>
      <div class="alerts-list" id="alertsList">
        <!-- Alerts will be populated here -->
      </div>
    `;
  }

  /**
   * Create service card HTML
   */
  createServiceCardHTML(serviceId) {
    const serviceName = this.getServiceDisplayName(serviceId);
    
    return `
      <div class="service-status-card unknown" id="service-${serviceId}">
        <div class="service-header">
          <h3 class="service-name">${serviceName}</h3>
          <div class="service-status" data-help="service-status">
            <span class="status-icon">❓</span>
            <span class="status-text">Unknown</span>
          </div>
        </div>
        <div class="service-metrics">
          <div class="metric">
            <span class="metric-label">Response Time</span>
            <span class="metric-value" data-metric="response_time" data-help="latency-metric">--</span>
          </div>
          <div class="metric">
            <span class="metric-label">Error Rate</span>
            <span class="metric-value" data-metric="error_rate" data-help="error-rate-metric">--</span>
          </div>
          <div class="metric">
            <span class="metric-label">CPU Usage</span>
            <span class="metric-value" data-metric="cpu_usage" data-help="cpu-metric">--</span>
          </div>
          <div class="metric">
            <span class="metric-label">Memory Usage</span>
            <span class="metric-value" data-metric="memory_usage" data-help="memory-metric">--</span>
          </div>
        </div>
        <div class="service-actions">
          <button class="btn-action" onclick="healthDashboard.viewServiceDetails('${serviceId}')">
            Details
          </button>
          <button class="btn-action" onclick="healthDashboard.refreshService('${serviceId}')" data-help="refresh-button">
            Refresh
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get display name for service
   */
  getServiceDisplayName(serviceId) {
    const names = {
      'virtual-try-on': 'Virtual Try On',
      'pupillary-distance': 'Pupillary Distance Tools',
      'eyewear-fitting': 'Eyewear Fitting Height',
      'glb-directory': 'GLB Directory Service'
    };
    return names[serviceId] || serviceId;
  }

  /**
   * Initialize WebSocket connection
   */
  async initializeWebSocket() {
    try {
      this.wsConnection = new WebSocket(this.config.wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatus = 'connected';
        this.updateConnectionStatus();
        
        // Subscribe to real-time updates
        this.subscribeToUpdates();
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleRealtimeUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.wsConnection.onerror = this.handleWebSocketError;
      this.wsConnection.onclose = this.handleWebSocketClose;
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.connectionStatus = 'error';
      this.updateConnectionStatus();
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates() {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      // Subscribe to service status updates
      this.wsConnection.send(JSON.stringify({
        type: 'subscribe',
        subscription_type: 'service_status'
      }));
      
      // Subscribe to alerts
      this.wsConnection.send(JSON.stringify({
        type: 'subscribe',
        subscription_type: 'alerts'
      }));
      
      // Subscribe to metrics
      this.wsConnection.send(JSON.stringify({
        type: 'subscribe',
        subscription_type: 'metrics'
      }));
    }
  }

  /**
   * Handle real-time updates from WebSocket
   */
  handleRealtimeUpdate(data) {
    switch (data.type) {
      case 'service_status_update':
        this.handleServiceStatusUpdate(data);
        break;
      case 'new_alert':
        this.handleNewAlert(data);
        break;
      case 'alert_update':
        this.handleAlertUpdate(data);
        break;
      case 'metrics_update':
        this.handleMetricsUpdate(data);
        break;
      case 'connection_established':
        console.log('WebSocket connection established:', data);
        break;
      case 'error':
        console.error('WebSocket error:', data.message);
        break;
    }
  }

  /**
   * Handle service status updates
   */
  handleServiceStatusUpdate(data) {
    if (data.services) {
      data.services.forEach(service => {
        this.updateServiceStatus(service.service_id, service);
      });
    }
  }

  /**
   * Handle new alerts
   */
  handleNewAlert(data) {
    if (data.alert) {
      this.alertsCache.unshift(data.alert);
      this.updateAlertsDisplay();
      this.showNotification(`New ${data.alert.severity} alert: ${data.alert.message}`, data.alert.severity);
    }
  }

  /**
   * Handle alert updates
   */
  handleAlertUpdate(data) {
    if (data.alert) {
      const index = this.alertsCache.findIndex(alert => alert.id === data.alert.id);
      if (index !== -1) {
        this.alertsCache[index] = data.alert;
        this.updateAlertsDisplay();
      }
    }
  }

  /**
   * Handle metrics updates
   */
  handleMetricsUpdate(data) {
    if (data.service_id && data.metrics) {
      this.storeMetrics(data.service_id, data.metrics);
      this.updateCharts();
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleWebSocketError(error) {
    console.error('WebSocket error:', error);
    this.connectionStatus = 'error';
    this.updateConnectionStatus();
  }

  /**
   * Handle WebSocket close
   */
  handleWebSocketClose(event) {
    console.log('WebSocket closed:', event.code, event.reason);
    this.connectionStatus = 'disconnected';
    this.updateConnectionStatus();
    
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      if (this.connectionStatus === 'disconnected') {
        console.log('Attempting to reconnect WebSocket...');
        this.initializeWebSocket();
      }
    }, 5000);
  }

  /**
   * Update connection status display
   */
  updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;
    
    const indicator = statusElement.querySelector('.status-indicator');
    const text = statusElement.querySelector('.status-text');
    
    switch (this.connectionStatus) {
      case 'connected':
        indicator.style.backgroundColor = 'var(--varai-success)';
        text.textContent = 'Connected';
        break;
      case 'disconnected':
        indicator.style.backgroundColor = 'var(--varai-gray-400)';
        text.textContent = 'Disconnected';
        break;
      case 'error':
        indicator.style.backgroundColor = 'var(--varai-error)';
        text.textContent = 'Connection Error';
        break;
      default:
        indicator.style.backgroundColor = 'var(--varai-warning)';
        text.textContent = 'Connecting...';
    }
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      // Load service statuses
      await this.loadServiceStatuses();
      
      // Load active alerts
      await this.loadActiveAlerts();
      
      // Load recent metrics
      await this.loadRecentMetrics();
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.showError('Failed to load dashboard data');
    }
  }

  /**
   * Load service statuses
   */
  async loadServiceStatuses() {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/services`, {
        headers: {
          'X-API-Key': this.getApiKey()
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.services) {
        data.services.forEach(service => {
          this.statusCache.set(service.service_id, service);
          this.updateServiceStatus(service.service_id, service);
        });
      }
      
    } catch (error) {
      console.error('Failed to load service statuses:', error);
      throw error;
    }
  }

  /**
   * Load active alerts
   */
  async loadActiveAlerts() {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/alerts?status=active&limit=20`, {
        headers: {
          'X-API-Key': this.getApiKey()
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.alerts) {
        this.alertsCache = data.alerts;
        this.updateAlertsDisplay();
      }
      
    } catch (error) {
      console.error('Failed to load alerts:', error);
      throw error;
    }
  }

  /**
   * Load recent metrics for charts
   */
  async loadRecentMetrics() {
    try {
      for (const serviceId of this.services) {
        const response = await fetch(
          `${this.config.apiBaseUrl}/services/${serviceId}/metrics?timeframe=1h&resolution=5m`,
          {
            headers: {
              'X-API-Key': this.getApiKey()
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.metrics) {
            this.metricsHistory.set(serviceId, data.metrics);
          }
        }
      }
      
      this.updateCharts();
      
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  /**
   * Update service status display
   */
  updateServiceStatus(serviceId, status) {
    const card = document.getElementById(`service-${serviceId}`);
    if (!card) return;
    
    // Update status class
    card.className = `service-status-card ${status.status}`;
    
    // Update status icon and text
    const statusIcon = card.querySelector('.status-icon');
    const statusText = card.querySelector('.status-text');
    
    if (statusIcon && statusText) {
      const { icon, text } = this.getStatusDisplay(status.status);
      statusIcon.textContent = icon;
      statusText.textContent = text;
    }
    
    // Update metrics
    const responseTimeEl = card.querySelector('[data-metric="response_time"]');
    const errorRateEl = card.querySelector('[data-metric="error_rate"]');
    const cpuUsageEl = card.querySelector('[data-metric="cpu_usage"]');
    const memoryUsageEl = card.querySelector('[data-metric="memory_usage"]');
    
    if (responseTimeEl) {
      responseTimeEl.textContent = status.response_time_ms ? `${status.response_time_ms}ms` : '--';
    }
    if (errorRateEl) {
      errorRateEl.textContent = status.error_rate_percent !== undefined ? `${status.error_rate_percent}%` : '--';
    }
    if (cpuUsageEl) {
      cpuUsageEl.textContent = status.cpu_usage_percent !== undefined ? `${status.cpu_usage_percent}%` : '--';
    }
    if (memoryUsageEl) {
      memoryUsageEl.textContent = status.memory_usage_percent !== undefined ? `${status.memory_usage_percent}%` : '--';
    }
    
    // Store in cache
    this.statusCache.set(serviceId, status);
  }

  /**
   * Get status display info
   */
  getStatusDisplay(status) {
    const displays = {
      healthy: { icon: '✅', text: 'Healthy' },
      degraded: { icon: '⚠️', text: 'Degraded' },
      unhealthy: { icon: '❌', text: 'Unhealthy' },
      unknown: { icon: '❓', text: 'Unknown' }
    };
    return displays[status] || displays.unknown;
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded');
      return;
    }
    
    const chartConfig = {
      type: 'line',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute'
            }
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    };
    
    // Response Time Chart
    const responseTimeCtx = document.getElementById('responseTimeChart');
    if (responseTimeCtx) {
      this.charts.responseTime = new Chart(responseTimeCtx, {
        ...chartConfig,
        data: {
          datasets: this.services.map((serviceId, index) => ({
            label: this.getServiceDisplayName(serviceId),
            data: [],
            borderColor: this.getChartColor(index),
            backgroundColor: this.getChartColor(index, 0.1),
            tension: 0.1
          }))
        },
        options: {
          ...chartConfig.options,
          scales: {
            ...chartConfig.options.scales,
            y: {
              ...chartConfig.options.scales.y,
              title: {
                display: true,
                text: 'Response Time (ms)'
              }
            }
          }
        }
      });
    }
    
    // Error Rate Chart
    const errorRateCtx = document.getElementById('errorRateChart');
    if (errorRateCtx) {
      this.charts.errorRate = new Chart(errorRateCtx, {
        ...chartConfig,
        data: {
          datasets: this.services.map((serviceId, index) => ({
            label: this.getServiceDisplayName(serviceId),
            data: [],
            borderColor: this.getChartColor(index),
            backgroundColor: this.getChartColor(index, 0.1),
            tension: 0.1
          }))
        },
        options: {
          ...chartConfig.options,
          scales: {
            ...chartConfig.options.scales,
            y: {
              ...chartConfig.options.scales.y,
              title: {
                display: true,
                text: 'Error Rate (%)'
              }
            }
          }
        }
      });
    }
    
    // CPU Usage Chart
    const cpuUsageCtx = document.getElementById('cpuUsageChart');
    if (cpuUsageCtx) {
      this.charts.cpuUsage = new Chart(cpuUsageCtx, {
        ...chartConfig,
        data: {
          datasets: this.services.map((serviceId, index) => ({
            label: this.getServiceDisplayName(serviceId),
            data: [],
            borderColor: this.getChartColor(index),
            backgroundColor: this.getChartColor(index, 0.1),
            tension: 0.1
          }))
        },
        options: {
          ...chartConfig.options,
          scales: {
            ...chartConfig.options.scales,
            y: {
              ...chartConfig.options.scales.y,
              max: 100,
              title: {
                display: true,
                text: 'CPU Usage (%)'
              }
            }
          }
        }
      });
    }
    
    // Memory Usage Chart
    const memoryUsageCtx = document.getElementById('memoryUsageChart');
    if (memoryUsageCtx) {
      this.charts.memoryUsage = new Chart(memoryUsageCtx, {
        ...chartConfig,
        data: {
          datasets: this.services.map((serviceId, index) => ({
            label: this.getServiceDisplayName(serviceId),
            data: [],
            borderColor: this.getChartColor(index),
            backgroundColor: this.getChartColor(index, 0.1),
            tension: 0.1
          }))
        },
        options: {
          ...chartConfig.options,
          scales: {
            ...chartConfig.options.scales,
            y: {
              ...chartConfig.options.scales.y,
              max: 100,
              title: {
                display: true,
                text: 'Memory Usage (%)'
              }
            }
          }
        }
      });
    }
  }

  /**
   * Get chart color for service
   */
  getChartColor(index, alpha = 1) {
    const colors = [
      `rgba(30, 150, 252, ${alpha})`,   // Blue
      `rgba(48, 209, 88, ${alpha})`,    // Green
      `rgba(255, 149, 0, ${alpha})`,    // Orange
      `rgba(255, 59, 48, ${alpha})`     // Red
    ];
    return colors[index % colors.length];
  }

  /**
   * Update charts with latest data
   */
  updateCharts() {
    this.services.forEach((serviceId, index) => {
      const metrics = this.metricsHistory.get(serviceId) || [];
      
      // Update response time chart
      if (this.charts.responseTime) {
        this.charts.responseTime.data.datasets[index].data = metrics.map(m => ({
          x: new Date(m.timestamp),
          y: m.response_time_ms || 0
        }));
      }
      
      // Update error rate chart
      if (this.charts.errorRate) {
        this.charts.errorRate.data.datasets[index].data = metrics.map(m => ({
          x: new Date(m.timestamp),
          y: m.error_rate_percent || 0
        }));
      }
      
      // Update CPU usage chart
      if (this.charts.cpuUsage) {
        this.charts.cpuUsage.data.datasets[index].data = metrics.map(m => ({
          x: new Date(m.timestamp),
          y: m.cpu_usage_percent || 0
        }));
      }
      
      // Update memory usage chart
      if (this.charts.memoryUsage) {
        this.charts.memoryUsage.data.datasets[index].data = metrics.map(m => ({
          x: new Date(m.timestamp),
          y: m.memory_usage_percent || 0
        }));
      }
    });
    
    // Update all charts
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.update) {
        chart.update('none'); // No animation for real-time updates
      }
    });
  }

  /**
   * Store metrics for a service
   */
  storeMetrics(serviceId, metrics) {
    if (!this.metricsHistory.has(serviceId)) {
      this.metricsHistory.set(serviceId, []);
    }
    
    const history = this.metricsHistory.get(serviceId);
    history.push({
      timestamp: new Date().toISOString(),
      ...metrics
    });
    
    // Keep only recent data points
    if (history.length > this.config.maxHistoryPoints) {
      history.splice(0, history.length - this.config.maxHistoryPoints);
    }
    
    this.metricsHistory.set(serviceId, history);
  }

  /**
   * Update alerts display
   */
  updateAlertsDisplay() {
    const alertsList = document.getElementById('alertsList');
    const alertsSummary = document.getElementById('alertsSummary');
    
    if (!alertsList || !alertsSummary) return;
    
    // Update summary counts
    const criticalCount = this.alertsCache.filter(a => a.severity === 'critical' && a.status === 'active').length;
    const warningCount = this.alertsCache.filter(a => a.severity === 'warning' && a.status === 'active').length;
    const infoCount = this.alertsCache.filter(a => a.severity === 'info' && a.status === 'active').length;
    
    alertsSummary.innerHTML = `
      <span class="alert-count critical">${criticalCount}</span>
      <span class="alert-count warning">${warningCount}</span>
      <span class="alert-count info">${infoCount}</span>
    `;
    
    // Update alerts list
    if (this.alertsCache.length === 0) {
      alertsList.innerHTML = '<div class="no-alerts">No active alerts</div>';
    } else {
      alertsList.innerHTML = this.alertsCache
        .filter(alert => alert.status === 'active')
        .slice(0, 10) // Show only first 10 alerts
        .map(alert => this.createAlertHTML(alert))
        .join('');
    }
  }

  /**
   * Create alert HTML
   */
  createAlertHTML(alert) {
    const timeAgo = this.getTimeAgo(new Date(alert.created_at));
    
    return `
      <div class="alert-item ${alert.severity}" data-alert-id="${alert.id}">
        <div class="alert-content">
          <div class="alert-header">
            <span class="alert-service">${this.getServiceDisplayName(alert.service_id)}</span>
            <span class="alert-time">${timeAgo}</span>
          </div>
          <div class="alert-message">${alert.message}</div>
          <div class="alert-details">
            <span class="alert-severity ${alert.severity}">${alert.severity.toUpperCase()}</span>
            <span class="alert-value">Current: ${alert.current_value}</span>
            <span class="alert-threshold">Threshold: ${alert.threshold_value}</span>
          </div>
        </div>
        <div class="alert-actions">
          <button class="btn-action" onclick="healthDashboard.acknowledgeAlert('${alert.id}')">
            Acknowledge
          </button>
          <button class="btn-action" onclick="healthDashboard.viewAlertDetails('${alert.id}')">
            Details
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshHealthBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshAllData();
      });
    }
    
    // Clear alerts button
    const clearAlertsBtn = document.getElementById('clearAlertsBtn');
    if (clearAlertsBtn) {
      clearAlertsBtn.addEventListener('click', () => {
        this.clearAllAlerts();
      });
    }
  }

  /**
   * Start periodic updates
   */
  startPeriodicUpdates() {
    // Refresh data periodically
    this.refreshTimer = setInterval(() => {
      this.loadServiceStatuses();
    }, this.config.refreshInterval);
    
    // Update charts periodically
    this.chartUpdateTimer = setInterval(() => {
      this.loadRecentMetrics();
    }, this.config.chartUpdateInterval);
  }

  /**
   * Stop periodic updates
   */
  stopPeriodicUpdates() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.chartUpdateTimer) {
      clearInterval(this.chartUpdateTimer);
      this.chartUpdateTimer = null;
    }
  }

  /**
   * Refresh all data
   */
  async refreshAllData() {
    try {
      await this.loadInitialData();
      this.showNotification('Dashboard data refreshed', 'info');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      this.showError('Failed to refresh dashboard data');
    }
  }

  /**
   * Refresh specific service
   */
  async refreshService(serviceId) {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/services/${serviceId}/status`, {
        headers: {
          'X-API-Key': this.getApiKey()
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const status = await response.json();
      this.updateServiceStatus(serviceId, status);
      
      this.showNotification(`${this.getServiceDisplayName(serviceId)} status refreshed`, 'info');
      
    } catch (error) {
      console.error(`Failed to refresh service ${serviceId}:`, error);
      this.showError(`Failed to refresh ${this.getServiceDisplayName(serviceId)}`);
    }
  }

  /**
   * View service details
   */
  viewServiceDetails(serviceId) {
    const status = this.statusCache.get(serviceId);
    if (!status) {
      this.showError('Service status not available');
      return;
    }
    
    // Create modal or detailed view
    alert(`Service Details for ${this.getServiceDisplayName(serviceId)}:\n\n${JSON.stringify(status, null, 2)}`);
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId) {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.getApiKey()
        },
        body: JSON.stringify({
          acknowledged_by: 'admin@varai.com', // TODO: Get from user session
          comment: 'Acknowledged from dashboard'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Update local cache
      const alertIndex = this.alertsCache.findIndex(alert => alert.id === alertId);
      if (alertIndex !== -1) {
        this.alertsCache[alertIndex].status = 'acknowledged';
        this.alertsCache[alertIndex].acknowledged_at = new Date().toISOString();
        this.updateAlertsDisplay();
      }
      
      this.showNotification('Alert acknowledged', 'info');
      
    } catch (error) {
      console.error(`Failed to acknowledge alert ${alertId}:`, error);
      this.showError('Failed to acknowledge alert');
    }
  }

  /**
   * View alert details
   */
  viewAlertDetails(alertId) {
    const alert = this.alertsCache.find(a => a.id === alertId);
    if (!alert) {
      this.showError('Alert not found');
      return;
    }
    
    // Create modal or detailed view
    alert(`Alert Details:\n\n${JSON.stringify(alert, null, 2)}`);
  }

  /**
   * Clear all alerts
   */
  async clearAllAlerts() {
    if (!confirm('Are you sure you want to clear all alerts?')) {
      return;
    }
    
    try {
      // Acknowledge all active alerts
      const activeAlerts = this.alertsCache.filter(alert => alert.status === 'active');
      
      for (const alert of activeAlerts) {
        await this.acknowledgeAlert(alert.id);
      }
      
      this.showNotification('All alerts cleared', 'info');
      
    } catch (error) {
      console.error('Failed to clear alerts:', error);
      this.showError('Failed to clear all alerts');
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
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
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Get API key (placeholder - should be from secure storage)
   */
  getApiKey() {
    // TODO: Implement secure API key retrieval
    return 'demo-api-key';
  }

  /**
   * Integrate help system with dashboard elements
   */
  integrateHelpSystem() {
    // Wait for help system to be available
    if (typeof window.healthHelp !== 'undefined') {
      // Add contextual help to existing elements
      this.addHelpToExistingElements();
    } else {
      // Retry after a short delay if help system isn't ready
      setTimeout(() => this.integrateHelpSystem(), 500);
    }
  }

  /**
   * Add help attributes to existing dashboard elements
   */
  addHelpToExistingElements() {
    // Add help to charts
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => {
      const title = chart.querySelector('h4');
      if (title) {
        const chartType = title.textContent.toLowerCase().replace(' ', '-');
        chart.classList.add('performance-chart');
        if (window.healthHelp) {
          window.healthHelp.addContextualHelp(chart, `${chartType}-metric`);
        }
      }
    });

    // Add help to alerts section
    const alertsPanel = document.getElementById('alertsPanel');
    if (alertsPanel) {
      const alertItems = alertsPanel.querySelectorAll('.alert-item');
      alertItems.forEach(alert => {
        const ackButton = alert.querySelector('.btn-acknowledge');
        const resolveButton = alert.querySelector('.btn-resolve');
        
        if (ackButton && window.healthHelp) {
          window.healthHelp.addContextualHelp(ackButton, 'alert-acknowledge');
        }
        if (resolveButton && window.healthHelp) {
          window.healthHelp.addContextualHelp(resolveButton, 'alert-resolve');
        }
      });
    }

    // Add help to time filter if it exists
    const timeFilter = document.querySelector('.time-filter');
    if (timeFilter && window.healthHelp) {
      window.healthHelp.addContextualHelp(timeFilter, 'time-filter');
    }

    // Add service threshold help to service cards
    const serviceCards = document.querySelectorAll('.service-status-card');
    serviceCards.forEach(card => {
      card.classList.add('service-thresholds');
    });
  }
  /**
   * Cleanup resources
   */
  destroy() {
    // Close WebSocket connection
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    
    // Stop timers
    this.stopPeriodicUpdates();
    
    // Destroy charts
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    });
    this.charts = {};
    
    console.log('Health Dashboard destroyed');
  }
}

// Make HealthDashboard available globally
window.HealthDashboard = HealthDashboard;