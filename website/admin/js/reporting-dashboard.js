/**
 * Reporting Dashboard JavaScript
 * Handles all dashboard functionality, API calls, and data visualization using Chart.js
 */

// Global variables
let currentUser = null;
let dashboardData = {};
let charts = {};

// API Configuration
const API_BASE_URL = '/api';
const REPORTING_API = `${API_BASE_URL}/reporting`;
const QUALITY_API = `${API_BASE_URL}/quality`;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Check authentication
        await checkAuthentication();
        
        // Initialize user interface
        setupUserInterface();
        
        // Load initial data
        await updateDashboard();
        
        // Setup auto-refresh
        setupAutoRefresh();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showError('Failed to initialize dashboard. Please refresh the page.');
    }
}

async function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Authentication failed');
        }
        
        currentUser = await response.json();
        
    } catch (error) {
        localStorage.removeItem('authToken');
        window.location.href = '/admin/login.html';
    }
}

function setupUserInterface() {
    // Update user info in header
    document.getElementById('userName').textContent = currentUser.name || 'User';
    const roleElement = document.getElementById('userRole');
    roleElement.textContent = currentUser.role === 'super_admin' ? 'Super Admin' : 'Client';
    roleElement.className = `role-badge role-${currentUser.role}`;
    
    // Show/hide elements based on role
    if (currentUser.role === 'super_admin') {
        document.getElementById('platformFilter').style.display = 'flex';
        document.getElementById('clientFilter').style.display = 'flex';
        loadClientList();
    } else {
        document.getElementById('platformFilter').style.display = 'none';
        document.getElementById('clientFilter').style.display = 'none';
    }
}

function setupEventListeners() {
    // Alert form submission
    document.getElementById('alertForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitAlert();
    });
    
    // Modal close on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('alertModal');
        if (event.target === modal) {
            closeModal('alertModal');
        }
    });
}

async function loadClientList() {
    try {
        const response = await apiCall('/clients');
        const clients = response.data;
        
        const clientSelect = document.getElementById('clientSelect');
        clientSelect.innerHTML = '<option value="">All Clients</option>';
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Failed to load client list:', error);
    }
}

async function updateDashboard() {
    showLoading();
    
    try {
        const filters = getFilters();
        
        // Load dashboard data based on user role
        if (currentUser.role === 'super_admin') {
            await loadSuperAdminDashboard(filters);
        } else {
            await loadClientDashboard(filters);
        }
        
        // Update UI
        updateMetrics();
        updateCharts();
        
    } catch (error) {
        console.error('Dashboard update error:', error);
        showError('Failed to update dashboard data.');
    } finally {
        hideLoading();
    }
}

async function loadSuperAdminDashboard(filters) {
    const response = await apiCall(`${REPORTING_API}/super-admin/dashboard`, {
        method: 'GET',
        params: filters
    });
    
    dashboardData = response.data;
}

async function loadClientDashboard(filters) {
    const response = await apiCall(`${REPORTING_API}/client/dashboard`, {
        method: 'GET',
        params: filters
    });
    
    dashboardData = response.data;
}

function getFilters() {
    return {
        timeRange: document.getElementById('timeRange').value,
        platform: document.getElementById('platform').value,
        clientId: document.getElementById('clientSelect').value
    };
}

function updateMetrics() {
    const overview = dashboardData.overview || {};
    
    // Update metric values
    document.getElementById('totalSessions').textContent = formatNumber(overview.totalSessions || 0);
    document.getElementById('conversionRate').textContent = `${overview.conversionRate || 0}%`;
    document.getElementById('aiSuccessRate').textContent = `${Math.round((dashboardData.aiPerformance?.successRate || 0) * 100)}%`;
    document.getElementById('avgQualityScore').textContent = (dashboardData.qualityMetrics?.avgSatisfaction || 0).toFixed(1);
    
    // Update change indicators (mock data for now)
    updateChangeIndicator('sessionsChange', 12.5);
    updateChangeIndicator('conversionChange', -2.3);
    updateChangeIndicator('aiSuccessChange', 5.7);
    updateChangeIndicator('qualityChange', 8.1);
}

function updateChangeIndicator(elementId, change) {
    const element = document.getElementById(elementId);
    const isPositive = change > 0;
    
    element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
    element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
}

function updateCharts() {
    // Platform Performance Chart
    updatePlatformChart();
    
    // Conversion Trends Chart
    updateConversionChart();
    
    // AI Performance Chart
    updateAIPerformanceChart();
    
    // User Journey Chart
    updateUserJourneyChart();
}

function updatePlatformChart() {
    const ctx = document.getElementById('platformChart').getContext('2d');
    
    if (charts.platformChart) {
        charts.platformChart.destroy();
    }
    
    const platformData = dashboardData.platformBreakdown || [];
    
    charts.platformChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: platformData.map(p => p._id || 'Unknown'),
            datasets: [{
                data: platformData.map(p => p.sessions || 0),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ]
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

function updateConversionChart() {
    const ctx = document.getElementById('conversionChart').getContext('2d');
    
    if (charts.conversionChart) {
        charts.conversionChart.destroy();
    }
    
    // Generate date labels based on time range
    const timeRange = document.getElementById('timeRange').value;
    const days = generateDateLabels(timeRange);
    
    charts.conversionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Conversion Rate',
                data: generateMockTrendData(days.length, 2, 4),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Conversion Rate: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function updateAIPerformanceChart() {
    const ctx = document.getElementById('aiPerformanceChart').getContext('2d');
    
    if (charts.aiPerformanceChart) {
        charts.aiPerformanceChart.destroy();
    }
    
    const aiData = dashboardData.aiPerformance || {};
    
    charts.aiPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Processing Time (ms)', 'Success Rate (%)', 'Accuracy (%)'],
            datasets: [{
                label: 'Performance Metrics',
                data: [
                    aiData.avgProcessingTime || 2500,
                    (aiData.successRate || 0.95) * 100,
                    (aiData.avgAccuracy || 0.92) * 100
                ],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(240, 147, 251, 0.8)'
                ],
                borderColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (context.dataIndex === 0) {
                                return `${label}: ${value.toFixed(0)}ms`;
                            } else {
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        }
    });
}

function updateUserJourneyChart() {
    const ctx = document.getElementById('userJourneyChart').getContext('2d');
    
    if (charts.userJourneyChart) {
        charts.userJourneyChart.destroy();
    }
    
    const journeyData = dashboardData.userJourney || [
        { _id: 'Landing', totalSessions: 1000 },
        { _id: 'Widget Interaction', totalSessions: 850 },
        { _id: 'Face Analysis', totalSessions: 720 },
        { _id: 'Recommendations', totalSessions: 680 },
        { _id: 'Virtual Try-On', totalSessions: 450 },
        { _id: 'Add to Cart', totalSessions: 320 },
        { _id: 'Purchase', totalSessions: 180 }
    ];
    
    charts.userJourneyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: journeyData.map(j => j._id),
            datasets: [{
                label: 'Sessions',
                data: journeyData.map(j => j.totalSessions),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Sessions: ${context.parsed.x.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

// Quality Management Functions
async function updateQualityData() {
    try {
        const filters = {
            timeRange: document.getElementById('qualityTimeRange').value,
            minSatisfaction: document.getElementById('minSatisfaction').value,
            clientId: currentUser.role === 'client' ? currentUser.clientId : document.getElementById('clientSelect').value
        };
        
        const response = await apiCall(`${QUALITY_API}/conversations`, {
            method: 'GET',
            params: filters
        });
        
        updateQualityOverview(response.data);
        updateQualityTrends(response.data);
        updateCommonIssues(response.data);
        updateQualityDistribution(response.data);
        
    } catch (error) {
        console.error('Quality data update error:', error);
        showError('Failed to update quality data.');
    }
}

function updateQualityOverview(data) {
    const overview = data.overview || {};
    const overviewElement = document.getElementById('qualityOverview');
    
    overviewElement.innerHTML = `
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${overview.totalConversations || 0}</div>
                <div class="metric-label">Total Conversations</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(overview.avgSatisfaction || 0).toFixed(1)}</div>
                <div class="metric-label">Avg Satisfaction</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round((overview.completionRate || 0) * 100)}%</div>
                <div class="metric-label">Completion Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(overview.avgResponseTime || 0)}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
        </div>
    `;
}

function updateQualityTrends(data) {
    const ctx = document.getElementById('qualityTrendsChart').getContext('2d');
    
    if (charts.qualityTrendsChart) {
        charts.qualityTrendsChart.destroy();
    }
    
    const timeRange = document.getElementById('qualityTimeRange').value;
    const days = generateDateLabels(timeRange);
    
    charts.qualityTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Satisfaction Score',
                    data: generateMockTrendData(days.length, 3.5, 5),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Coherence Score',
                    data: generateMockTrendData(days.length, 3.2, 4.5),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Helpfulness Score',
                    data: generateMockTrendData(days.length, 3.8, 4.8),
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateQualityDistribution(data) {
    const ctx = document.getElementById('qualityDistributionChart').getContext('2d');
    
    if (charts.qualityDistributionChart) {
        charts.qualityDistributionChart.destroy();
    }
    
    const distribution = data.qualityDistribution || [
        { _id: 5, count: 45 },
        { _id: 4, count: 78 },
        { _id: 3, count: 32 },
        { _id: 2, count: 15 },
        { _id: 1, count: 8 }
    ];
    
    charts.qualityDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: distribution.map(d => `${d._id} Star${d._id !== 1 ? 's' : ''}`),
            datasets: [{
                label: 'Number of Conversations',
                data: distribution.map(d => d.count),
                backgroundColor: [
                    '#27ae60',
                    '#2ecc71',
                    '#f39c12',
                    '#e67e22',
                    '#e74c3c'
                ],
                borderColor: [
                    '#229954',
                    '#28b463',
                    '#d68910',
                    '#ca6f1e',
                    '#c0392b'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Conversations: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

function updateCommonIssues(data) {
    const issues = data.commonIssues || [];
    const issuesElement = document.getElementById('commonIssues');
    
    if (issues.length === 0) {
        issuesElement.innerHTML = '<div class="alert alert-success">No common issues found!</div>';
        return;
    }
    
    const issuesHtml = issues.map(issue => `
        <div class="alert alert-warning">
            <strong>${issue._id}</strong><br>
            Occurrences: ${issue.count}<br>
            Recovery Rate: ${Math.round((issue.recoveryRate || 0) * 100)}%
        </div>
    `).join('');
    
    issuesElement.innerHTML = issuesHtml;
}

// Performance Functions
async function updatePerformanceData() {
    try {
        const filters = {
            timeRange: document.getElementById('timeRange').value,
            clientId: currentUser.role === 'client' ? currentUser.clientId : document.getElementById('clientSelect').value
        };
        
        const response = await apiCall(`${REPORTING_API}/performance/analysis`, {
            method: 'GET',
            params: filters
        });
        
        updatePerformanceOverview(response.data);
        updatePerformanceCharts(response.data);
        updateOptimizationTips(response.data.recommendations || []);
        
    } catch (error) {
        console.error('Performance data update error:', error);
        showError('Failed to update performance data.');
    }
}

function updatePerformanceOverview(data) {
    const overview = data.faceAnalysisPerformance || {};
    const overviewElement = document.getElementById('performanceOverview');
    
    overviewElement.innerHTML = `
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${Math.round(overview.avgTotalTime || 2500)}ms</div>
                <div class="metric-label">Avg Processing Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round((overview.successRate || 0.95) * 100)}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(overview.avgNetworkLatency || 150)}ms</div>
                <div class="metric-label">Network Latency</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(overview.avgRetries || 0.2).toFixed(1)}</div>
                <div class="metric-label">Avg Retries</div>
            </div>
        </div>
    `;
}

function updatePerformanceCharts(data) {
    updateResponseTimeChart(data);
    updateAIProcessingChart(data);
}

function updateResponseTimeChart(data) {
    const ctx = document.getElementById('responseTimeChart').getContext('2d');
    
    if (charts.responseTimeChart) {
        charts.responseTimeChart.destroy();
    }
    
    const timeRange = document.getElementById('timeRange').value;
    const days = generateDateLabels(timeRange);
    
    charts.responseTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Face Analysis (ms)',
                    data: generateMockTrendData(days.length, 2000, 3500),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Recommendations (ms)',
                    data: generateMockTrendData(days.length, 800, 1500),
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'ms';
                        }
                    }
                }
            }
        }
    });
}

function updateAIProcessingChart(data) {
    const ctx = document.getElementById('aiProcessingChart').getContext('2d');
    
    if (charts.aiProcessingChart) {
        charts.aiProcessingChart.destroy();
    }
    
    charts.aiProcessingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Image Capture', 'MediaPipe Processing', 'Feature Extraction', 'Measurement Calc', 'Classification'],
            datasets: [{
                data: [300, 800, 400, 600, 200],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}ms`;
                        }
                    }
                }
            }
        }
    });
}

function updateOptimizationTips(recommendations) {
    const tipsElement = document.getElementById('optimizationTips');
    
    if (recommendations.length === 0) {
        tipsElement.innerHTML = '<div class="alert alert-success">All systems are performing optimally! 🎉</div>';
        return;
    }
    
    const tipsHtml = recommendations.map(rec => `
        <div class="alert alert-${rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}">
            <strong>${rec.title}</strong><br>
            ${rec.description}<br>
            <ul style="margin-top: 0.5rem;">
                ${rec.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
        </div>
    `).join('');
    
    tipsElement.innerHTML = tipsHtml;
}

// Alert Management Functions
async function updateAlerts() {
    try {
        const filters = {
            status: document.getElementById('alertStatus').value,
            severity: document.getElementById('alertSeverity').value,
            clientId: currentUser.role === 'client' ? currentUser.clientId : undefined
        };
        
        const response = await apiCall(`${QUALITY_API}/alerts`, {
            method: 'GET',
            params: filters
        });
        
        displayAlerts(response.data);
        
    } catch (error) {
        console.error('Alerts update error:', error);
        showError('Failed to update alerts.');
    }
}

function displayAlerts(alerts) {
    const alertsElement = document.getElementById('alertsList');
    
    if (alerts.length === 0) {
        alertsElement.innerHTML = '<div class="alert alert-info">No alerts found.</div>';
        return;
    }
    
    const alertsHtml = alerts.map(alert => `
        <div class="alert alert-${alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>${alert.title}</strong><br>
                    ${alert.description}<br>
                    <small>Created: ${new Date(alert.createdAt).toLocaleString()}</small><br>
                    <small>Triggered: ${alert.triggeredCount} times</small>
                </div>
                <div>
                    <button class="btn btn-sm" onclick="resolveAlert('${alert.alertId}')">Resolve</button>
                </div>
            </div>
        </div>
    `).join('');
    
    alertsElement.innerHTML = alertsHtml;
}

async function resolveAlert(alertId) {
    try {
        await apiCall(`${QUALITY_API}/alerts/${alertId}`, {
            method: 'PATCH',
            body: { status: 'resolved' }
        });
        
        await updateAlerts();
        showSuccess('Alert resolved successfully.');
        
    } catch (error) {
        console.error('Alert resolution error:', error);
        showError('Failed to resolve alert.');
    }
}

function createAlert() {
    document.getElementById('alertModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function submitAlert() {
    try {
        const alertData = {
            type: document.getElementById('alertType').value,
            severity: document.getElementById('alertSeverityForm').value,
            title: document.getElementById('alertTitle').value,
            description: document.getElementById('alertDescription').value,
            threshold: parseFloat(document.getElementById('alertThreshold').value),
            clientId: currentUser.role === 'client' ? currentUser.clientId : document.getElementById('clientSelect').value
        };
        
        await apiCall(`${QUALITY_API}/alerts`, {
            method: 'POST',
            body: alertData
        });
        
        closeModal('alertModal');
        await updateAlerts();
        showSuccess('Alert created successfully.');
        
        // Reset form
        document.getElementById('alertForm').reset();
        
    } catch (error) {
        console.error('Alert creation error:', error);
        showError('Failed to create alert.');
    }
}

// Export Functions
async function exportData() {
    try {
        const exportConfig = {
            reportType: document.getElementById('exportType').value,
            format: document.getElementById('exportFormat').value,
            timeRange: document.getElementById('exportTimeRange').value,
            filters: {
                clientId: currentUser.role === 'client' ? currentUser.clientId : document.getElementById('clientSelect').value
            }
        };
        
        const response = await fetch(`${REPORTING_API}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(exportConfig)
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_${exportConfig.reportType}_${exportConfig.timeRange}.${exportConfig.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess('Data exported successfully.');
        
    } catch (error) {
        console.error('Export error:', error);
        showError('Failed to export data.');
    }
}

async function exportQualityReport() {
    try {
        const filters = {
            timeRange: document.getElementById('qualityTimeRange').value,
            minSatisfaction: document.getElementById('minSatisfaction').value,
            clientId: currentUser.role === 'client' ? currentUser.clientId : document.getElementById('clientSelect').value
        };
        
        const exportConfig = {
            reportType: 'conversation_quality',
            format: 'csv',
            timeRange: filters.timeRange,
            filters
        };
        
        const response = await fetch(`${REPORTING_API}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(exportConfig)
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quality_report_${filters.timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess('Quality report exported successfully.');
        
    } catch (error) {
        console.error('Quality export error:', error);
        showError('Failed to export quality report.');
    }
}

async function runQualityAnalysis() {
    try {
        showLoading();
        
        const analysisConfig = {
            timeRange: document.getElementById('qualityTimeRange').value,
            clientId: currentUser.role === 'client' ? currentUser.clientId : document.getElementById('clientSelect').value,
            minConversations: 10
        };
        
        const response = await apiCall(`${QUALITY_API}/analyze-batch`, {
            method: 'POST',
            body: analysisConfig
        });
        
        showSuccess(`Quality analysis completed. Analyzed ${response.data.conversationCount} conversations.`);
        await updateQualityData();
        
    } catch (error) {
        console.error('Quality analysis error:', error);
        showError('Failed to run quality analysis.');
    } finally {
        hideLoading();
    }
}

function configureScheduledReports() {
    showError('Scheduled reports configuration is not yet implemented.');
}

// Utility Functions
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        ...options
    };
    
    if (options.params) {
        const params = new URLSearchParams(options.params);
        endpoint += `?${params.toString()}`;
    }
    
    if (options.body) {
        config.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return await response.json();
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function generateDateLabels(timeRange) {
    const labels = [];
    const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        if (days <= 7) {
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        } else if (days <= 30) {
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        } else {
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
    }
    
    return labels;
}

function generateMockTrendData(length, min, max) {
    const data = [];
    let current = (min + max) / 2;
    
    for (let i = 0; i < length; i++) {
        const variation = (Math.random() - 0.5) * (max - min) * 0.2;
        current = Math.max(min, Math.min(max, current + variation));
        data.push(parseFloat(current.toFixed(2)));
    }
    
    return data;
}

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.classList.add('active');
    
    // Load tab-specific data
    switch (tabName) {
        case 'quality':
            updateQualityData();
            break;
        case 'performance':
            updatePerformanceData();
            break;
        case 'alerts':
            updateAlerts();
            break;
        case 'analytics':
            updateAnalyticsData();
            break;
    }
}

async function updateAnalyticsData() {
    try {
        // Update behavior chart
        updateBehaviorChart();
        
        // Update revenue chart
        updateRevenueChart();
        
        // Update device chart
        updateDeviceChart();
        
    } catch (error) {
        console.error('Analytics data update error:', error);
        showError('Failed to update analytics data.');
    }
}

function updateBehaviorChart() {
    const ctx = document.getElementById('behaviorChart').getContext('2d');
    
    if (charts.behaviorChart) {
        charts.behaviorChart.destroy();
    }
    
    charts.behaviorChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Page Views', 'Widget Interactions', 'Face Analysis', 'Recommendations', 'Virtual Try-On', 'Purchases'],
            datasets: [{
                label: 'User Engagement',
                data: [85, 72, 68, 65, 45, 28],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    if (charts.revenueChart) {
        charts.revenueChart.destroy();
    }
    
    const timeRange = document.getElementById('timeRange').value;
    const days = generateDateLabels(timeRange);
    
    charts.revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'AI-Assisted Sales',
                    data: generateMockTrendData(days.length, 1000, 5000),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: 'Regular Sales',
                    data: generateMockTrendData(days.length, 500, 2000),
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: '#764ba2',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

function updateDeviceChart() {
    const ctx = document.getElementById('deviceChart').getContext('2d');
    
    if (charts.deviceChart) {
        charts.deviceChart.destroy();
    }
    
    charts.deviceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Mobile', 'Desktop', 'Tablet'],
            datasets: [{
                data: [65, 28, 7],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}

function showLoading() {
    // Show loading indicators
    document.querySelectorAll('.loading').forEach(loader => {
        loader.style.display = 'flex';
    });
}

function hideLoading() {
    // Hide loading indicators
    document.querySelectorAll('.loading').forEach(loader => {
        loader.style.display = 'none';
    });
}

function showError(message) {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-danger';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    notification.innerHTML = `
        <strong>Error:</strong> ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; font-size: 1.2em; cursor: pointer;">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    notification.innerHTML = `
        <strong>Success:</strong> ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; font-size: 1.2em; cursor: pointer;">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

function setupAutoRefresh() {
    // Auto-refresh dashboard every 5 minutes
    setInterval(() => {
        if (document.getElementById('overview').classList.contains('active')) {
            updateDashboard();
        }
    }, 5 * 60 * 1000);
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/admin/login.html';
}

// Initialize charts object to prevent errors
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;