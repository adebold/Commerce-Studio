/**
 * E2E Tests for Integration Monitoring
 * 
 * These tests verify that the monitoring infrastructure for
 * e-commerce platform integrations works correctly.
 */

const { test, expect } = require('@playwright/test');
const axios = require('axios');

// Test configuration
const config = {
  monitoringDashboard: {
    url: process.env.MONITORING_DASHBOARD_URL || 'http://localhost:3001/dashboard',
    username: process.env.MONITORING_USERNAME || 'admin',
    password: process.env.MONITORING_PASSWORD || 'admin'
  },
  healthEndpoints: {
    shopify: process.env.SHOPIFY_HEALTH_ENDPOINT || 'http://localhost:3000/health/shopify',
    magento: process.env.MAGENTO_HEALTH_ENDPOINT || 'http://localhost:3000/health/magento',
    woocommerce: process.env.WOOCOMMERCE_HEALTH_ENDPOINT || 'http://localhost:3000/health/woocommerce',
    bigcommerce: process.env.BIGCOMMERCE_HEALTH_ENDPOINT || 'http://localhost:3000/health/bigcommerce'
  },
  apiKey: process.env.MONITORING_API_KEY || 'test_monitoring_key'
};

// Helper function to create API client
function createApiClient() {
  return axios.create({
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
}

// Helper function to check health endpoint
async function checkHealthEndpoint(url) {
  const apiClient = createApiClient();
  
  try {
    const response = await apiClient.get(url);
    return {
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      error: error.message,
      data: error.response?.data
    };
  }
}

// Tests for health check endpoints
test.describe('Health Check Endpoints', () => {
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient();
  });

  test('Shopify integration health endpoint should return status', async () => {
    const result = await checkHealthEndpoint(config.healthEndpoints.shopify);
    
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(result.data.status);
    expect(result.data).toHaveProperty('timestamp');
    expect(result.data).toHaveProperty('version');
    expect(result.data).toHaveProperty('details');
  });
  
  test('Magento integration health endpoint should return status', async () => {
    const result = await checkHealthEndpoint(config.healthEndpoints.magento);
    
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(result.data.status);
    expect(result.data).toHaveProperty('timestamp');
    expect(result.data).toHaveProperty('version');
    expect(result.data).toHaveProperty('details');
  });
  
  test('WooCommerce integration health endpoint should return status', async () => {
    const result = await checkHealthEndpoint(config.healthEndpoints.woocommerce);
    
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(result.data.status);
    expect(result.data).toHaveProperty('timestamp');
    expect(result.data).toHaveProperty('version');
    expect(result.data).toHaveProperty('details');
  });
  
  test('BigCommerce integration health endpoint should return status', async () => {
    const result = await checkHealthEndpoint(config.healthEndpoints.bigcommerce);
    
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(result.data.status);
    expect(result.data).toHaveProperty('timestamp');
    expect(result.data).toHaveProperty('version');
    expect(result.data).toHaveProperty('details');
  });
  
  test('Health endpoints should include detailed component status', async () => {
    // Check Shopify health details
    const shopifyResult = await checkHealthEndpoint(config.healthEndpoints.shopify);
    
    expect(shopifyResult.data.details).toHaveProperty('api');
    expect(shopifyResult.data.details).toHaveProperty('database');
    expect(shopifyResult.data.details).toHaveProperty('webhooks');
    
    // Each component should have its own status
    expect(['healthy', 'degraded', 'unhealthy']).toContain(shopifyResult.data.details.api.status);
    expect(['healthy', 'degraded', 'unhealthy']).toContain(shopifyResult.data.details.database.status);
    expect(['healthy', 'degraded', 'unhealthy']).toContain(shopifyResult.data.details.webhooks.status);
  });
  
  test('Health endpoints should include performance metrics', async () => {
    // Check any health endpoint for performance metrics
    const result = await checkHealthEndpoint(config.healthEndpoints.shopify);
    
    // Should include performance metrics
    expect(result.data).toHaveProperty('performance');
    expect(result.data.performance).toHaveProperty('responseTime');
    expect(result.data.performance).toHaveProperty('requestsPerMinute');
    expect(result.data.performance).toHaveProperty('errorRate');
    
    // Metrics should be numbers
    expect(typeof result.data.performance.responseTime).toBe('number');
    expect(typeof result.data.performance.requestsPerMinute).toBe('number');
    expect(typeof result.data.performance.errorRate).toBe('number');
  });
});

// Tests for monitoring dashboard
test.describe('Monitoring Dashboard', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login to monitoring dashboard
    await page.goto(config.monitoringDashboard.url);
    await page.fill('input[name="username"]', config.monitoringDashboard.username);
    await page.fill('input[name="password"]', config.monitoringDashboard.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('.dashboard-container');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Dashboard should display integration status for all platforms', async () => {
    // Check if all platform statuses are displayed
    await page.waitForSelector('.integration-status-card');
    
    // Should have status cards for all platforms
    const shopifyCard = await page.$('.integration-status-card[data-platform="shopify"]');
    const magentoCard = await page.$('.integration-status-card[data-platform="magento"]');
    const woocommerceCard = await page.$('.integration-status-card[data-platform="woocommerce"]');
    const bigcommerceCard = await page.$('.integration-status-card[data-platform="bigcommerce"]');
    
    expect(shopifyCard).not.toBeNull();
    expect(magentoCard).not.toBeNull();
    expect(woocommerceCard).not.toBeNull();
    expect(bigcommerceCard).not.toBeNull();
    
    // Take a screenshot of the dashboard
    await page.screenshot({ path: './test-results/monitoring-dashboard.png' });
  });
  
  test('Dashboard should display real-time metrics', async () => {
    // Navigate to metrics tab
    await page.click('a:has-text("Metrics")');
    
    // Wait for metrics to load
    await page.waitForSelector('.metrics-container');
    
    // Check for real-time charts
    const charts = await page.$$('.metric-chart');
    expect(charts.length).toBeGreaterThan(0);
    
    // Check for specific metrics
    const responseTimeChart = await page.$('.metric-chart[data-metric="response-time"]');
    const requestRateChart = await page.$('.metric-chart[data-metric="request-rate"]');
    const errorRateChart = await page.$('.metric-chart[data-metric="error-rate"]');
    
    expect(responseTimeChart).not.toBeNull();
    expect(requestRateChart).not.toBeNull();
    expect(errorRateChart).not.toBeNull();
    
    // Take a screenshot of the metrics page
    await page.screenshot({ path: './test-results/monitoring-metrics.png' });
  });
  
  test('Dashboard should display recent alerts', async () => {
    // Navigate to alerts tab
    await page.click('a:has-text("Alerts")');
    
    // Wait for alerts to load
    await page.waitForSelector('.alerts-container');
    
    // Check for alerts table
    const alertsTable = await page.$('.alerts-table');
    expect(alertsTable).not.toBeNull();
    
    // Take a screenshot of the alerts page
    await page.screenshot({ path: './test-results/monitoring-alerts.png' });
  });
  
  test('Dashboard should allow filtering by platform', async () => {
    // Navigate to logs tab
    await page.click('a:has-text("Logs")');
    
    // Wait for logs to load
    await page.waitForSelector('.logs-container');
    
    // Select Shopify from platform filter
    await page.selectOption('select.platform-filter', 'shopify');
    
    // Wait for filtered logs
    await page.waitForTimeout(500);
    
    // Check that logs are filtered
    const logEntries = await page.$$('.log-entry');
    
    // If there are log entries, check they're for Shopify
    if (logEntries.length > 0) {
      const platformColumn = await page.$$eval('.log-entry .platform-column', 
        elements => elements.map(el => el.textContent.toLowerCase()));
      
      // All entries should be for Shopify
      expect(platformColumn.every(text => text.includes('shopify'))).toBeTruthy();
    }
    
    // Take a screenshot of the filtered logs
    await page.screenshot({ path: './test-results/monitoring-filtered-logs.png' });
  });
});

// Tests for alerting system
test.describe('Alerting System', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient();
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Should trigger alert when health check fails', async () => {
    // First, check current alert count
    const initialAlertsResponse = await apiClient.get(`${config.monitoringDashboard.url}/api/alerts/count`);
    const initialAlertCount = initialAlertsResponse.data.count;
    
    // Simulate a health check failure by sending a request to the test endpoint
    await apiClient.post(`${config.monitoringDashboard.url}/api/test/trigger-health-failure`, {
      platform: 'shopify',
      component: 'api',
      duration: 60 // seconds
    });
    
    // Wait for alert to be triggered
    await page.waitForTimeout(5000);
    
    // Check if alert count increased
    const updatedAlertsResponse = await apiClient.get(`${config.monitoringDashboard.url}/api/alerts/count`);
    const updatedAlertCount = updatedAlertsResponse.data.count;
    
    expect(updatedAlertCount).toBeGreaterThan(initialAlertCount);
    
    // Login to dashboard to check alert
    await page.goto(config.monitoringDashboard.url);
    await page.fill('input[name="username"]', config.monitoringDashboard.username);
    await page.fill('input[name="password"]', config.monitoringDashboard.password);
    await page.click('button[type="submit"]');
    
    // Navigate to alerts page
    await page.click('a:has-text("Alerts")');
    
    // Check for the new alert
    await page.waitForSelector('.alert-item:has-text("Shopify API Health Check Failed")');
    
    // Take a screenshot of the alert
    await page.screenshot({ path: './test-results/health-check-alert.png' });
  });
  
  test('Should send alert notifications', async () => {
    // Get notification settings
    const notificationResponse = await apiClient.get(`${config.monitoringDashboard.url}/api/notifications/settings`);
    
    // Skip test if notifications are not configured
    if (!notificationResponse.data.email.enabled && !notificationResponse.data.slack.enabled) {
      test.skip('Notifications are not enabled');
      return;
    }
    
    // Trigger a test notification
    await apiClient.post(`${config.monitoringDashboard.url}/api/test/trigger-notification`, {
      type: 'test',
      message: 'This is a test notification from the E2E tests'
    });
    
    // Wait for notification to be sent
    await page.waitForTimeout(5000);
    
    // Check notification log
    const notificationLogResponse = await apiClient.get(`${config.monitoringDashboard.url}/api/notifications/log`);
    
    // Find our test notification in the log
    const testNotification = notificationLogResponse.data.find(
      notification => notification.message.includes('test notification from the E2E tests')
    );
    
    expect(testNotification).toBeDefined();
    expect(testNotification.status).toBe('sent');
  });
});

// Tests for performance benchmarks
test.describe('Performance Benchmarks', () => {
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient();
  });

  test('Should track response time benchmarks', async () => {
    // Get performance benchmarks
    const benchmarksResponse = await apiClient.get(`${config.monitoringDashboard.url}/api/performance/benchmarks`);
    
    // Check if benchmarks exist for all platforms
    const platforms = ['shopify', 'magento', 'woocommerce', 'bigcommerce'];
    
    for (const platform of platforms) {
      expect(benchmarksResponse.data).toHaveProperty(platform);
      expect(benchmarksResponse.data[platform]).toHaveProperty('responseTime');
      expect(benchmarksResponse.data[platform]).toHaveProperty('throughput');
      expect(benchmarksResponse.data[platform]).toHaveProperty('errorRate');
      
      // Response time should be a number
      expect(typeof benchmarksResponse.data[platform].responseTime.p95).toBe('number');
      expect(typeof benchmarksResponse.data[platform].responseTime.p99).toBe('number');
      expect(typeof benchmarksResponse.data[platform].responseTime.avg).toBe('number');
    }
  });
  
  test('Should compare current performance against benchmarks', async () => {
    // Get current performance metrics
    const currentMetricsResponse = await apiClient.get(`${config.monitoringDashboard.url}/api/performance/current`);
    
    // Get performance benchmarks
    const benchmarksResponse = await apiClient.get(`${config.monitoringDashboard.url}/api/performance/benchmarks`);
    
    // Check if current metrics exist for all platforms
    const platforms = ['shopify', 'magento', 'woocommerce', 'bigcommerce'];
    
    for (const platform of platforms) {
      expect(currentMetricsResponse.data).toHaveProperty(platform);
      expect(currentMetricsResponse.data[platform]).toHaveProperty('responseTime');
      
      // Compare current response time with benchmark
      const currentResponseTime = currentMetricsResponse.data[platform].responseTime.avg;
      const benchmarkResponseTime = benchmarksResponse.data[platform].responseTime.avg;
      
      // Log the comparison
      console.log(`${platform} response time: ${currentResponseTime}ms (benchmark: ${benchmarkResponseTime}ms)`);
      
      // Current response time should be a number
      expect(typeof currentResponseTime).toBe('number');
    }
  });
});

// Tests for logging system
test.describe('Logging System', () => {
  let page;
  let apiClient;

  test.beforeAll(async () => {
    apiClient = createApiClient();
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login to monitoring dashboard
    await page.goto(config.monitoringDashboard.url);
    await page.fill('input[name="username"]', config.monitoringDashboard.username);
    await page.fill('input[name="password"]', config.monitoringDashboard.password);
    await page.click('button[type="submit"]');
    
    // Navigate to logs page
    await page.click('a:has-text("Logs")');
    await page.waitForSelector('.logs-container');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Should display integration logs with proper filtering', async () => {
    // Check log filters
    const platformFilter = await page.$('select.platform-filter');
    const levelFilter = await page.$('select.level-filter');
    const dateFilter = await page.$('input.date-filter');
    
    expect(platformFilter).not.toBeNull();
    expect(levelFilter).not.toBeNull();
    expect(dateFilter).not.toBeNull();
    
    // Test platform filter
    await page.selectOption('select.platform-filter', 'shopify');
    await page.waitForTimeout(500);
    
    // Check that logs are filtered by platform
    const platformLogs = await page.$$('.log-entry');
    if (platformLogs.length > 0) {
      const platformColumn = await page.$$eval('.log-entry .platform-column', 
        elements => elements.map(el => el.textContent.toLowerCase()));
      
      expect(platformColumn.every(text => text.includes('shopify'))).toBeTruthy();
    }
    
    // Test level filter
    await page.selectOption('select.platform-filter', ''); // Clear platform filter
    await page.selectOption('select.level-filter', 'error');
    await page.waitForTimeout(500);
    
    // Check that logs are filtered by level
    const levelLogs = await page.$$('.log-entry');
    if (levelLogs.length > 0) {
      const levelColumn = await page.$$eval('.log-entry .level-column', 
        elements => elements.map(el => el.textContent.toLowerCase()));
      
      expect(levelColumn.every(text => text.includes('error'))).toBeTruthy();
    }
  });
  
  test('Should allow searching logs by content', async () => {
    // Generate a unique search term
    const searchTerm = `test-${Date.now()}`;
    
    // Create a test log entry with our search term
    await apiClient.post(`${config.monitoringDashboard.url}/api/logs/test`, {
      platform: 'test',
      level: 'info',
      message: `This is a test log entry with search term: ${searchTerm}`
    });
    
    // Wait for log to be indexed
    await page.waitForTimeout(2000);
    
    // Refresh logs
    await page.click('button.refresh-logs');
    await page.waitForTimeout(500);
    
    // Search for our unique term
    await page.fill('input.log-search', searchTerm);
    await page.click('button.search-logs');
    await page.waitForTimeout(500);
    
    // Check that our log entry is found
    const logContent = await page.textContent('.logs-container');
    expect(logContent).toContain(searchTerm);
  });
  
  test('Should display log details with request/response information', async () => {
    // Find a log entry
    const logEntries = await page.$$('.log-entry');
    
    if (logEntries.length === 0) {
      test.skip('No log entries available');
      return;
    }
    
    // Click on the first log entry to view details
    await logEntries[0].click();
    
    // Wait for details panel to open
    await page.waitForSelector('.log-details-panel');
    
    // Check for details sections
    const timestampSection = await page.$('.log-details-timestamp');
    const messageSection = await page.$('.log-details-message');
    
    expect(timestampSection).not.toBeNull();
    expect(messageSection).not.toBeNull();
    
    // Check for request/response information if available
    const requestSection = await page.$('.log-details-request');
    const responseSection = await page.$('.log-details-response');
    
    if (requestSection) {
      const requestContent = await page.textContent('.log-details-request');
      expect(requestContent).toContain('URL') || expect(requestContent).toContain('Method');
    }
    
    if (responseSection) {
      const responseContent = await page.textContent('.log-details-response');
      expect(responseContent).toContain('Status') || expect(responseContent).toContain('Body');
    }
  });
});