/**
 * Analytics Showcase JavaScript
 * Powers the interactive demos and visualizations for the analytics hub
 */

class AnalyticsShowcase {
    constructor() {
        this.charts = new Map();
        this.liveDataInterval = null;
        this.sampleData = this.generateSampleData();
        
        this.init();
    }

    async init() {
        console.log('🎯 Initializing Analytics Showcase...');
        
        try {
            await this.initializeCharts();
            this.startLiveDataSimulation();
            this.setupInteractivity();
            
            console.log('✅ Analytics Showcase initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Analytics Showcase:', error);
        }
    }

    async initializeCharts() {
        // Sales Forecasting Chart
        if (document.getElementById('salesForecastChart')) {
            this.createSalesForecastChart();
        }

        // Seasonal Intelligence Chart
        if (document.getElementById('seasonalChart')) {
            this.createSeasonalChart();
        }

        // Risk Assessment Chart
        if (document.getElementById('riskChart')) {
            this.createRiskChart();
        }

        // Growth Opportunities Chart
        if (document.getElementById('opportunityChart')) {
            this.createOpportunityChart();
        }

        // Real-time Analytics Chart
        if (document.getElementById('realtimeChart')) {
            this.createRealtimeChart();
        }

        // Live Dashboard Chart
        if (document.getElementById('liveDashboardChart')) {
            this.createLiveDashboardChart();
        }
    }

    createSalesForecastChart() {
        const ctx = document.getElementById('salesForecastChart').getContext('2d');
        
        const historicalData = this.generateHistoricalSalesData();
        const forecastData = this.generateForecastData(historicalData);
        
        this.charts.set('salesForecast', new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...historicalData.labels, ...forecastData.labels],
                datasets: [
                    {
                        label: 'Historical Sales',
                        data: historicalData.values,
                        borderColor: '#1E96FC',
                        backgroundColor: 'rgba(30, 150, 252, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Forecast',
                        data: [...Array(historicalData.values.length).fill(null), ...forecastData.values],
                        borderColor: '#30D158',
                        backgroundColor: 'rgba(48, 209, 88, 0.1)',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Confidence Interval',
                        data: [...Array(historicalData.values.length).fill(null), ...forecastData.upperBound],
                        borderColor: 'rgba(48, 209, 88, 0.3)',
                        backgroundColor: 'rgba(48, 209, 88, 0.1)',
                        borderWidth: 1,
                        fill: '+1',
                        pointRadius: 0
                    },
                    {
                        label: 'Lower Bound',
                        data: [...Array(historicalData.values.length).fill(null), ...forecastData.lowerBound],
                        borderColor: 'rgba(48, 209, 88, 0.3)',
                        backgroundColor: 'rgba(48, 209, 88, 0.1)',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Sales Forecast with 95% Confidence Intervals'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sales ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        }));
    }

    createSeasonalChart() {
        const ctx = document.getElementById('seasonalChart').getContext('2d');
        
        const seasonalData = this.generateSeasonalData();
        
        this.charts.set('seasonal', new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Seasonal Strength',
                        data: seasonalData.strength,
                        borderColor: '#FF9F0A',
                        backgroundColor: 'rgba(255, 159, 10, 0.2)',
                        borderWidth: 3,
                        pointBackgroundColor: '#FF9F0A',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#FF9F0A'
                    },
                    {
                        label: 'Sales Volume',
                        data: seasonalData.volume,
                        borderColor: '#1E96FC',
                        backgroundColor: 'rgba(30, 150, 252, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#1E96FC',
                        pointBorderColor: '#fff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Seasonal Pattern Analysis'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        }));
    }

    createRiskChart() {
        const ctx = document.getElementById('riskChart').getContext('2d');
        
        const riskData = this.generateRiskData();
        
        this.charts.set('risk', new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                    data: riskData.values,
                    backgroundColor: [
                        '#30D158',
                        '#FF9F0A',
                        '#FF3B30'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Risk Distribution'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        }));
    }

    createOpportunityChart() {
        const ctx = document.getElementById('opportunityChart').getContext('2d');
        
        const opportunityData = this.generateOpportunityData();
        
        this.charts.set('opportunity', new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Growth Opportunities',
                    data: opportunityData.opportunities,
                    backgroundColor: 'rgba(30, 150, 252, 0.6)',
                    borderColor: '#1E96FC',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointHoverRadius: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'ROI vs Implementation Effort'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `ROI: ${context.parsed.y}%, Effort: ${context.parsed.x}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Implementation Effort (1-10)'
                        },
                        min: 0,
                        max: 10
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Expected ROI (%)'
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        }));
    }

    createRealtimeChart() {
        const ctx = document.getElementById('realtimeChart').getContext('2d');
        
        this.charts.set('realtime', new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Revenue',
                        data: [],
                        borderColor: '#1E96FC',
                        backgroundColor: 'rgba(30, 150, 252, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Orders',
                        data: [],
                        borderColor: '#30D158',
                        backgroundColor: 'rgba(48, 209, 88, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Real-time Business Metrics'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Orders'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        }));

        // Start real-time data updates
        this.updateRealtimeChart();
    }

    createLiveDashboardChart() {
        const ctx = document.getElementById('liveDashboardChart').getContext('2d');
        
        const dashboardData = this.generateDashboardData();
        
        this.charts.set('liveDashboard', new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dashboardData.labels,
                datasets: [
                    {
                        label: 'Actual Sales',
                        data: dashboardData.actual,
                        backgroundColor: '#1E96FC',
                        borderColor: '#1E96FC',
                        borderWidth: 1
                    },
                    {
                        label: 'Predicted Sales',
                        data: dashboardData.predicted,
                        backgroundColor: '#30D158',
                        borderColor: '#30D158',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Actual vs Predicted Performance'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sales Volume'
                        }
                    }
                }
            }
        }));
    }

    updateRealtimeChart() {
        const chart = this.charts.get('realtime');
        if (!chart) return;

        const now = new Date();
        const timeLabel = now.toLocaleTimeString();
        
        // Generate random data points
        const revenue = 1000 + Math.random() * 2000;
        const orders = 10 + Math.random() * 20;

        // Add new data
        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(revenue);
        chart.data.datasets[1].data.push(orders);

        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }

        chart.update('none');

        // Schedule next update
        setTimeout(() => this.updateRealtimeChart(), 2000);
    }

    startLiveDataSimulation() {
        this.liveDataInterval = setInterval(() => {
            this.updateLiveMetrics();
        }, 3000);

        // Initial update
        this.updateLiveMetrics();
    }

    updateLiveMetrics() {
        const baseRevenue = 45000;
        const baseSales = 850;
        const baseCustomers = 1200;
        
        const revenue = baseRevenue + (Math.random() - 0.5) * 5000;
        const sales = baseSales + Math.floor((Math.random() - 0.5) * 100);
        const customers = baseCustomers + Math.floor((Math.random() - 0.5) * 50);
        
        const revenueChange = ((Math.random() - 0.3) * 20).toFixed(1);
        const salesChange = ((Math.random() - 0.3) * 15).toFixed(1);
        const customersChange = ((Math.random() - 0.3) * 10).toFixed(1);
        
        const riskLevels = ['Low', 'Medium', 'Low', 'Low', 'Medium'];
        const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

        // Update DOM elements
        this.updateElement('liveRevenue', `$${revenue.toLocaleString()}`);
        this.updateElement('liveSales', sales.toLocaleString());
        this.updateElement('liveCustomers', customers.toLocaleString());
        this.updateElement('liveRisk', riskLevel);
        
        this.updateElement('revenueChange', `${revenueChange > 0 ? '+' : ''}${revenueChange}%`);
        this.updateElement('salesChange', `${salesChange > 0 ? '+' : ''}${salesChange}%`);
        this.updateElement('customersChange', `${customersChange > 0 ? '+' : ''}${customersChange}%`);
        this.updateElement('riskChange', riskLevel === 'Low' ? 'Stable' : 'Monitor');
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    setupInteractivity() {
        // Add hover effects and interactions
        document.querySelectorAll('.analytics-capability-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // Data generation methods
    generateSampleData() {
        return {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
            categories: ['Sunglasses', 'Reading Glasses', 'Prescription', 'Blue Light', 'Safety']
        };
    }

    generateHistoricalSalesData() {
        const labels = [];
        const values = [];
        const baseValue = 25000;
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            
            const seasonalMultiplier = this.getSeasonalMultiplier(date.getMonth());
            const trendMultiplier = 1 + (11 - i) * 0.02;
            const randomVariation = 0.8 + Math.random() * 0.4;
            
            values.push(Math.round(baseValue * seasonalMultiplier * trendMultiplier * randomVariation));
        }
        
        return { labels, values };
    }

    generateForecastData(historicalData) {
        const labels = [];
        const values = [];
        const upperBound = [];
        const lowerBound = [];
        
        const lastValue = historicalData.values[historicalData.values.length - 1];
        const growthRate = 0.03; // 3% monthly growth
        
        for (let i = 1; i <= 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            
            const forecastValue = lastValue * Math.pow(1 + growthRate, i);
            const confidence = 0.15; // 15% confidence interval
            
            values.push(Math.round(forecastValue));
            upperBound.push(Math.round(forecastValue * (1 + confidence)));
            lowerBound.push(Math.round(forecastValue * (1 - confidence)));
        }
        
        return { labels, values, upperBound, lowerBound };
    }

    generateSeasonalData() {
        const strength = [65, 70, 75, 80, 85, 90, 85, 80, 75, 85, 95, 100];
        const volume = [70, 65, 75, 80, 85, 95, 90, 85, 80, 90, 100, 95];
        
        return { strength, volume };
    }

    generateRiskData() {
        return {
            values: [75, 20, 5], // Low, Medium, High risk percentages
            categories: ['Inventory', 'Market', 'Financial', 'Operational', 'Competitive']
        };
    }

    generateOpportunityData() {
        const opportunities = [
            { x: 3, y: 45 }, // Low effort, medium ROI
            { x: 7, y: 75 }, // High effort, high ROI
            { x: 2, y: 25 }, // Low effort, low ROI
            { x: 5, y: 60 }, // Medium effort, high ROI
            { x: 8, y: 35 }, // High effort, medium ROI
            { x: 4, y: 80 }, // Medium effort, very high ROI
        ];
        
        return { opportunities };
    }

    generateDashboardData() {
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
        const actual = [850, 920, 780, 1100, 950, 1050];
        const predicted = [880, 900, 820, 1080, 980, 1020];
        
        return { labels, actual, predicted };
    }

    getSeasonalMultiplier(month) {
        // Seasonal patterns: higher in Nov-Dec (holiday season), lower in Jan-Feb
        const seasonalPattern = [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.0, 0.95, 0.9, 1.1, 1.3, 1.4];
        return seasonalPattern[month] || 1.0;
    }

    destroy() {
        // Clean up intervals and charts
        if (this.liveDataInterval) {
            clearInterval(this.liveDataInterval);
        }
        
        this.charts.forEach(chart => {
            chart.destroy();
        });
        
        this.charts.clear();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsShowcase = new AnalyticsShowcase();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.analyticsShowcase) {
        window.analyticsShowcase.destroy();
    }
});