/**
 * Analytics Dashboard JavaScript
 * Integrates with centralized VisionCraft analytics platform
 * Provides real-time consultation metrics visualization
 */

class AnalyticsDashboard {
    constructor() {
        this.currentTimeRange = '24h';
        this.charts = {};
        this.websocket = null;
        this.isConnected = false;
        this.refreshInterval = null;
        this.data = {
            metrics: {},
            consultations: {},
            faceAnalysis: {},
            recommendations: {},
            voice: {},
            stores: {},
            performance: {},
            alerts: []
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.connectWebSocket();
        await this.loadInitialData();
        this.initializeCharts();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Time range selector
        document.querySelectorAll('.time-range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.time-range-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.currentTimeRange = e.target.dataset.range;
                this.refreshData();
            });
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.nav-link.active').classList.remove('active');
                e.target.classList.add('active');
            });
        });

        // Export button
        window.exportData = () => this.exportData();
    }

    connectWebSocket() {
        try {
            // Connect to centralized real-time dashboard service
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${window.location.host}/analytics/realtime`;
            
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                this.isConnected = true;
                this.updateConnectionStatus(true);
                console.log('Connected to analytics WebSocket');
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealtimeUpdate(data);
            };

            this.websocket.onclose = () => {
                this.isConnected = false;
                this.updateConnectionStatus(false);
                console.log('Disconnected from analytics WebSocket');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus(false);
            };

        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('liveStatus');
        if (connected) {
            statusElement.textContent = 'LIVE';
            statusElement.parentElement.classList.remove('status-offline');
            statusElement.parentElement.classList.add('status-online');
        } else {
            statusElement.textContent = 'OFFLINE';
            statusElement.parentElement.classList.remove('status-online');
            statusElement.parentElement.classList.add('status-offline');
        }
    }

    async loadInitialData() {
        this.showLoading();
        
        try {
            // Load data from centralized analytics platform
            const [
                metricsResponse,
                consultationsResponse,
                faceAnalysisResponse,
                recommendationsResponse,
                voiceResponse,
                storesResponse,
                performanceResponse
            ] = await Promise.all([
                fetch(`/analytics/consultation/metrics?timeRange=${this.currentTimeRange}`),
                fetch(`/analytics/consultation/consultations?timeRange=${this.currentTimeRange}`),
                fetch(`/analytics/consultation/face-analysis?timeRange=${this.currentTimeRange}`),
                fetch(`/analytics/consultation/recommendations?timeRange=${this.currentTimeRange}`),
                fetch(`/analytics/consultation/voice?timeRange=${this.currentTimeRange}`),
                fetch(`/analytics/consultation/stores?timeRange=${this.currentTimeRange}`),
                fetch(`/analytics/consultation/performance?timeRange=${this.currentTimeRange}`)
            ]);

            this.data.metrics = await metricsResponse.json();
            this.data.consultations = await consultationsResponse.json();
            this.data.faceAnalysis = await faceAnalysisResponse.json();
            this.data.recommendations = await recommendationsResponse.json();
            this.data.voice = await voiceResponse.json();
            this.data.stores = await storesResponse.json();
            this.data.performance = await performanceResponse.json();

            this.updateMetricsDisplay();
            this.updateChartsData();

        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showMockData(); // Fallback to mock data for demo
        }

        this.hideLoading();
    }

    showMockData() {
        // Mock data for demonstration
        this.data = {
            metrics: {
                totalConsultations: 847,
                conversionRate: 12.4,
                activeUsers: 23,
                averageSessionDuration: 245000,
                faceAnalysisUsage: 78.5,
                voiceInteractionUsage: 34.2,
                storeLocatorUsage: 45.8,
                averageRecommendationsPerConsultation: 3.2
            },
            consultations: {
                stageTransitions: {
                    'greeting -> needs_assessment': 425,
                    'needs_assessment -> face_analysis': 334,
                    'face_analysis -> recommendations': 312,
                    'recommendations -> store_locator': 145,
                    'store_locator -> conversion': 105
                },
                dropoffPoints: {
                    'greeting': 12,
                    'needs_assessment': 91,
                    'face_analysis': 22,
                    'recommendations': 167,
                    'store_locator': 40
                }
            },
            faceAnalysis: {
                oval: { count: 234, avgConfidence: 0.89, avgProcessingTime: 2100, successRate: 94.2 },
                round: { count: 189, avgConfidence: 0.87, avgProcessingTime: 2250, successRate: 92.1 },
                square: { count: 156, avgConfidence: 0.91, avgProcessingTime: 1980, successRate: 95.8 },
                heart: { count: 123, avgConfidence: 0.85, avgProcessingTime: 2340, successRate: 89.4 },
                diamond: { count: 98, avgConfidence: 0.88, avgProcessingTime: 2150, successRate: 91.8 }
            },
            recommendations: {
                'frame_001': { recommended: 156, selected: 23, conversionRate: 14.7, avgConfidence: 0.89 },
                'frame_002': { recommended: 142, selected: 18, conversionRate: 12.7, avgConfidence: 0.85 },
                'frame_003': { recommended: 134, selected: 21, conversionRate: 15.7, avgConfidence: 0.92 },
                'frame_004': { recommended: 128, selected: 15, conversionRate: 11.7, avgConfidence: 0.83 },
                'frame_005': { recommended: 119, selected: 19, conversionRate: 16.0, avgConfidence: 0.87 }
            },
            voice: {
                'speech_to_text_en-US': { count: 234, avgDuration: 4500, avgProcessingTime: 1200, avgConfidence: 0.92, successRate: 96.2 },
                'voice_command_en-US': { count: 89, avgDuration: 2100, avgProcessingTime: 800, avgConfidence: 0.89, successRate: 94.4 },
                'voice_response_en-US': { count: 198, avgDuration: 3200, avgProcessingTime: 650, avgConfidence: 1.0, successRate: 98.9 }
            },
            stores: {
                'New York': { searches: 89, viewDetails: 67, directions: 34, reservations: 12, conversionRate: 13.5 },
                'Los Angeles': { searches: 76, viewDetails: 54, directions: 28, reservations: 9, conversionRate: 11.8 },
                'Chicago': { searches: 65, viewDetails: 41, directions: 22, reservations: 8, conversionRate: 12.3 },
                'Houston': { searches: 52, viewDetails: 34, directions: 18, reservations: 6, conversionRate: 11.5 }
            },
            performance: {
                face_analysis_time: { current: 2100, average: 2150, min: 1800, max: 3200, trend: -2.3 },
                face_analysis_confidence: { current: 0.89, average: 0.88, min: 0.72, max: 0.98, trend: 1.1 },
                recommendation_confidence: { current: 0.87, average: 0.86, min: 0.68, max: 0.96, trend: 1.2 },
                api_response_time: { current: 245, average: 268, min: 180, max: 450, trend: -8.6 }
            },
            alerts: [
                { type: 'warning', message: 'Face analysis confidence below threshold for oval faces', time: '2 minutes ago' },
                { type: 'info', message: 'Voice processing time improved by 15%', time: '5 minutes ago' },
                { type: 'warning', message: 'Store locator usage declining in Chicago area', time: '12 minutes ago' }
            ]
        };

        this.updateMetricsDisplay();
        this.updateChartsData();
    }

    updateMetricsDisplay() {
        const metrics = this.data.metrics;
        
        document.getElementById('totalConsultations').textContent = metrics.totalConsultations || '--';
        document.getElementById('conversionRate').textContent = `${(metrics.conversionRate || 0).toFixed(1)}%`;
        document.getElementById('activeUsers').textContent = metrics.activeUsers || '--';
        
        // Format session duration
        const duration = metrics.averageSessionDuration || 0;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        document.getElementById('avgSessionDuration').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Update change indicators (mock positive changes for demo)
        this.updateChangeIndicator('consultationsChange', '+12.3%', 'positive');
        this.updateChangeIndicator('conversionChange', '+2.1%', 'positive');
        this.updateChangeIndicator('usersChange', '+5.7%', 'positive');
        this.updateChangeIndicator('durationChange', '+8.4%', 'positive');
    }

    updateChangeIndicator(elementId, value, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            element.className = `metric-change ${type}`;
        }
    }

    initializeCharts() {
        this.initializeConsultationTrendsChart();
        this.initializeConversionFunnelChart();
        this.initializeStageTransitionsChart();
        this.initializeDropOffChart();
        this.initializeFaceShapeChart();
        this.initializeAnalysisAccuracyChart();
        this.initializeVoiceUsageChart();
        this.initializeVoicePerformanceChart();
        this.initializeStorePerformanceChart();
        this.initializeStoreActionsChart();
        this.initializePerformanceChart();
        
        this.updateRecommendationsTable();
        this.updateAlertsList();
    }

    initializeConsultationTrendsChart() {
        const ctx = document.getElementById('consultationTrendsChart').getContext('2d');
        this.charts.consultationTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Consultations Started',
                    data: [12, 8, 25, 45, 38, 22],
                    borderColor: '#2c5aa0',
                    backgroundColor: 'rgba(44, 90, 160, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Conversions',
                    data: [2, 1, 4, 7, 5, 3],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
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

    initializeConversionFunnelChart() {
        const ctx = document.getElementById('conversionFunnelChart').getContext('2d');
        this.charts.conversionFunnel = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Started', 'Face Analysis', 'Recommendations', 'Store Locator', 'Converted'],
                datasets: [{
                    data: [847, 665, 578, 387, 105],
                    backgroundColor: [
                        '#2c5aa0',
                        '#3498db',
                        '#27ae60',
                        '#f39c12',
                        '#e74c3c'
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

    initializeStageTransitionsChart() {
        const ctx = document.getElementById('stageTransitionsChart').getContext('2d');
        const transitions = this.data.consultations.stageTransitions || {};
        
        this.charts.stageTransitions = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(transitions).map(t => t.replace(' -> ', ' → ')),
                datasets: [{
                    label: 'Transitions',
                    data: Object.values(transitions),
                    backgroundColor: '#3498db'
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

    initializeDropOffChart() {
        const ctx = document.getElementById('dropOffChart').getContext('2d');
        const dropoffs = this.data.consultations.dropoffPoints || {};
        
        this.charts.dropOff = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(dropoffs),
                datasets: [{
                    data: Object.values(dropoffs),
                    backgroundColor: [
                        '#e74c3c',
                        '#f39c12',
                        '#f1c40f',
                        '#27ae60',
                        '#3498db'
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

    initializeFaceShapeChart() {
        const ctx = document.getElementById('faceShapeChart').getContext('2d');
        const faceData = this.data.faceAnalysis || {};
        
        this.charts.faceShape = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(faceData),
                datasets: [{
                    label: 'Count',
                    data: Object.values(faceData).map(d => d.count || 0),
                    backgroundColor: '#2c5aa0'
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

    initializeAnalysisAccuracyChart() {
        const ctx = document.getElementById('analysisAccuracyChart').getContext('2d');
        const faceData = this.data.faceAnalysis || {};
        
        this.charts.analysisAccuracy = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(faceData),
                datasets: [{
                    label: 'Confidence',
                    data: Object.values(faceData).map(d => (d.avgConfidence || 0) * 100),
                    backgroundColor: 'rgba(44, 90, 160, 0.2)',
                    borderColor: '#2c5aa0'
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

    initializeVoiceUsageChart() {
        const ctx = document.getElementById('voiceUsageChart').getContext('2d');
        const voiceData = this.data.voice || {};
        
        this.charts.voiceUsage = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(voiceData).map(k => k.split('_')[0]),
                datasets: [{
                    data: Object.values(voiceData).map(d => d.count || 0),
                    backgroundColor: [
                        '#2c5aa0',
                        '#27ae60',
                        '#f39c12'
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

    initializeVoicePerformanceChart() {
        const ctx = document.getElementById('voicePerformanceChart').getContext('2d');
        const voiceData = this.data.voice || {};
        
        this.charts.voicePerformance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
                datasets: [{
                    label: 'Processing Time (ms)',
                    data: [1200, 1150, 1100, 1080, 1050, 1020],
                    borderColor: '#2c5aa0',
                    backgroundColor: 'rgba(44, 90, 160, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Success Rate (%)',
                    data: [94, 95, 96, 96, 97, 97],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    initializeStorePerformanceChart() {
        const ctx = document.getElementById('storePerformanceChart').getContext('2d');
        const storeData = this.data.stores || {};
        
        this.charts.storePerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(storeData),
                datasets: [{
                    label: 'Searches',
                    data: Object.values(storeData).map(d => d.searches || 0),
                    backgroundColor: '#2c5aa0'
                }, {
                    label: 'Reservations',
                    data: Object.values(storeData).map(d => d.reservations || 0),
                    backgroundColor: '#27ae60'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
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

    initializeStoreActionsChart() {
        const ctx = document.getElementById('storeActionsChart').getContext('2d');
        
        this.charts.storeActions = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Searches', 'View Details', 'Directions', 'Reservations'],
                datasets: [{
                    data: [282, 196, 102, 35],
                    backgroundColor: [
                        '#2c5aa0',
                        '#3498db',
                        '#f39c12',
                        '#27ae60'
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

    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
                datasets: [{
                    label: 'Face Analysis Time (ms)',
                    data: [2200, 2150, 2100, 2050, 2100, 2080],
                    borderColor: '#2c5aa0',
                    backgroundColor: 'rgba(44, 90, 160, 0.1)',
                    tension: 0.4
                }, {
                    label: 'API Response Time (ms)',
                    data: [280, 270, 245, 230, 240, 235],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
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

    updateRecommendationsTable() {
        const tbody = document.getElementById('recommendationsTable');
        const recommendations = this.data.recommendations || {};
        
        tbody.innerHTML = '';
        
        Object.entries(recommendations).forEach(([frameId, data]) => {
            const row = document.createElement('tr');
            
            const statusClass = data.conversionRate > 15 ? 'success' : 
                               data.conversionRate > 10 ? 'warning' : 'danger';
            
            row.innerHTML = `
                <td>${frameId}</td>
                <td>${data.recommended}</td>
                <td>${data.selected}</td>
                <td>${data.conversionRate.toFixed(1)}%</td>
                <td>${(data.avgConfidence * 100).toFixed(1)}%</td>
                <td><span class="badge badge-${statusClass}">${statusClass.toUpperCase()}</span></td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateAlertsList() {
        const alertsList = document.getElementById('alertsList');
        const alerts = this.data.alerts || [];
        
        alertsList.innerHTML = '';
        
        if (alerts.length === 0) {
            alertsList.innerHTML = '<div class="text-center text-muted p-4">No alerts at this time</div>';
            return;
        }
        
        alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert-item ${alert.type}`;
            alertDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <i class="bi bi-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                        ${alert.message}
                    </div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            `;
            alertsList.appendChild(alertDiv);
        });
    }

    handleRealtimeUpdate(data) {
        switch (data.type) {
            case 'real_time_event':
                this.handleRealtimeEvent(data);
                break;
            case 'alert':
                this.handleNewAlert(data.alert);
                break;
            case 'initial_state':
                this.handleInitialState(data);
                break;
        }
    }

    handleRealtimeEvent(data) {
        // Update metrics in real-time based on event type
        switch (data.eventType) {
            case 'consultation_start':
                this.data.metrics.totalConsultations++;
                this.data.metrics.activeUsers++;
                break;
            case 'conversion':
                // Update conversion metrics
                break;
            case 'face_analysis':
                // Update face analysis metrics
                break;
        }
        
        this.updateMetricsDisplay();
    }

    handleNewAlert(alert) {
        this.data.alerts.unshift({
            type: alert.type,
            message: `${alert.type.toUpperCase()}: ${alert.value} (threshold: ${alert.threshold})`,
            time: 'Just now'
        });
        
        // Keep only last 10 alerts
        this.data.alerts = this.data.alerts.slice(0, 10);
        this.updateAlertsList();
    }

    updateChartsData() {
        // Update all charts with new data
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.update) {
                chart.update();
            }
        });
    }

    async refreshData() {
        await this.loadInitialData();
    }

    startAutoRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (!this.isConnected) {
                this.refreshData();
            }
        }, 30000);
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.analytics-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        const section = document.getElementById(`${sectionName}-section`);
        if (section) {
            section.style.display = 'block';
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    exportData() {
        const exportData = {
            timeRange: this.currentTimeRange,
            exportDate: new Date().toISOString(),
            data: this.data
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consultation-analytics-${this.currentTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Navigation function for sidebar
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.analytics-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.style.display = 'block';
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsDashboard = new AnalyticsDashboard();
});