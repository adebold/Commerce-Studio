/**
 * SKU-Genie Dashboard Data
 * 
 * This file contains mock data for the analytics dashboard.
 * In a production environment, this would be replaced with
 * real data from the analytics API.
 */

// Dashboard data
const dashboardData = {
    // Key metrics
    metrics: {
        conversionRate: {
            value: 3.2,
            change: 0.5,
            trend: 'up'
        },
        avgOrderValue: {
            value: 142,
            change: 12,
            trend: 'up'
        },
        recommendationCTR: {
            value: 8.7,
            change: 1.2,
            trend: 'up'
        },
        activeTests: {
            value: 3,
            change: 0,
            trend: 'neutral'
        }
    },
    
    // A/B testing data
    abTesting: {
        // Face shape compatibility test
        faceShapeTest: {
            name: 'Face Shape Compatibility',
            status: 'running',
            startDate: '2025-04-01',
            endDate: '2025-05-01',
            confidence: 98,
            impact: {
                metric: 'conversion',
                value: 24,
                trend: 'up'
            },
            variants: {
                control: {
                    name: 'Control',
                    users: 5243,
                    conversions: 157,
                    conversionRate: 2.99
                },
                treatment: {
                    name: 'Treatment',
                    users: 5187,
                    conversions: 192,
                    conversionRate: 3.70
                }
            },
            dailyData: [
                { date: '2025-04-01', control: 2.8, treatment: 3.1 },
                { date: '2025-04-02', control: 2.9, treatment: 3.3 },
                { date: '2025-04-03', control: 3.0, treatment: 3.4 },
                { date: '2025-04-04', control: 2.7, treatment: 3.5 },
                { date: '2025-04-05', control: 2.8, treatment: 3.6 },
                { date: '2025-04-06', control: 3.1, treatment: 3.7 },
                { date: '2025-04-07', control: 3.0, treatment: 3.8 },
                { date: '2025-04-08', control: 3.2, treatment: 3.9 }
            ]
        },
        
        // Product recommendations test
        recommendationsTest: {
            name: 'Product Recommendations',
            status: 'running',
            startDate: '2025-04-01',
            endDate: '2025-05-01',
            confidence: 95,
            impact: {
                metric: 'aov',
                value: 18,
                trend: 'up'
            },
            variants: {
                control: {
                    name: 'Control',
                    users: 5243,
                    avgOrderValue: 127,
                    ordersWithMultipleItems: 22
                },
                treatment: {
                    name: 'Treatment',
                    users: 5187,
                    avgOrderValue: 150,
                    ordersWithMultipleItems: 31
                }
            },
            dailyData: [
                { date: '2025-04-01', control: 125, treatment: 142 },
                { date: '2025-04-02', control: 126, treatment: 145 },
                { date: '2025-04-03', control: 128, treatment: 148 },
                { date: '2025-04-04', control: 127, treatment: 149 },
                { date: '2025-04-05', control: 129, treatment: 151 },
                { date: '2025-04-06', control: 126, treatment: 153 },
                { date: '2025-04-07', control: 128, treatment: 155 },
                { date: '2025-04-08', control: 130, treatment: 157 }
            ]
        },
        
        // Virtual try-on test
        tryOnTest: {
            name: 'Virtual Try-On',
            status: 'running',
            startDate: '2025-04-01',
            endDate: '2025-05-01',
            confidence: 72,
            impact: {
                metric: 'engagement',
                value: 5,
                trend: 'up'
            },
            variants: {
                control: {
                    name: 'Control',
                    users: 5243,
                    avgTimeOnPage: 95,
                    productViews: 2.1
                },
                treatment: {
                    name: 'Treatment',
                    users: 5187,
                    avgTimeOnPage: 127,
                    productViews: 2.8
                }
            },
            dailyData: [
                { date: '2025-04-01', control: 94, treatment: 120 },
                { date: '2025-04-02', control: 95, treatment: 122 },
                { date: '2025-04-03', control: 93, treatment: 125 },
                { date: '2025-04-04', control: 96, treatment: 126 },
                { date: '2025-04-05', control: 95, treatment: 128 },
                { date: '2025-04-06', control: 97, treatment: 130 },
                { date: '2025-04-07', control: 96, treatment: 132 },
                { date: '2025-04-08', control: 98, treatment: 135 }
            ]
        },
        
        // Conversion funnel
        conversionFunnel: {
            stages: ['Product View', 'Add to Cart', 'Checkout', 'Purchase'],
            control: [100, 22, 12, 3],
            treatment: [100, 28, 16, 4]
        }
    },
    
    // Recommendation data
    recommendations: {
        // Click-through rate over time
        ctrOverTime: {
            dates: ['Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8'],
            values: [7.2, 7.5, 7.8, 8.1, 8.3, 8.5, 8.6, 8.7]
        },
        
        // Conversion rate over time
        cvrOverTime: {
            dates: ['Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8'],
            values: [2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5]
        },
        
        // Algorithm performance
        algorithmPerformance: {
            algorithms: ['Face Shape', 'Style Preference', 'Browsing History', 'Purchase History', 'Collaborative', 'Content-Based'],
            ctr: [9.2, 8.7, 8.3, 7.9, 7.5, 7.1],
            cvr: [3.8, 3.5, 3.3, 3.1, 2.9, 2.7]
        },
        
        // Top recommended products
        topRecommended: [
            {
                id: 'product-1',
                name: 'Classic Rectangle Frame',
                image: 'https://images.unsplash.com/photo-1577803645773-f96470509666',
                count: 245,
                score: 8.9
            },
            {
                id: 'product-2',
                name: 'Modern Round Frame',
                image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371',
                count: 198,
                score: 8.7
            },
            {
                id: 'product-6',
                name: 'Vintage Aviator Frame',
                image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
                count: 176,
                score: 8.5
            }
        ],
        
        // Highest conversion products
        highestConversion: [
            {
                id: 'product-3',
                name: 'Premium Cat-Eye Frame',
                image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879',
                conversion: 12.4,
                score: 9.2
            },
            {
                id: 'product-1',
                name: 'Classic Rectangle Frame',
                image: 'https://images.unsplash.com/photo-1577803645773-f96470509666',
                conversion: 10.8,
                score: 8.9
            },
            {
                id: 'product-5',
                name: 'Rimless Titanium Frame',
                image: 'https://images.unsplash.com/photo-1633621623555-acfaac1721ae',
                conversion: 9.7,
                score: 8.3
            }
        ]
    },
    
    // Face shape analytics
    faceShape: {
        // Distribution of face shapes
        distribution: {
            shapes: ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'],
            percentages: [32, 24, 18, 12, 8, 6]
        },
        
        // Conversion rates by face shape
        conversionRates: {
            shapes: ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'],
            rates: [3.5, 3.2, 3.8, 2.9, 3.1, 3.3]
        },
        
        // Conversion by compatibility score
        compatibilityConversion: {
            scores: ['90-100%', '80-89%', '70-79%', '60-69%', '50-59%', '<50%'],
            rates: [4.8, 3.9, 3.2, 2.5, 1.8, 1.2]
        },
        
        // Top products by face shape
        topProducts: {
            shapes: ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'],
            products: [
                { name: 'Classic Rectangle', conversion: 4.2 },
                { name: 'Vintage Aviator', conversion: 3.9 },
                { name: 'Premium Cat-Eye', conversion: 4.5 },
                { name: 'Modern Round', conversion: 3.7 },
                { name: 'Rimless Titanium', conversion: 3.8 },
                { name: 'Sport Performance', conversion: 4.1 }
            ]
        }
    }
};

// Initialize dashboard data
function initializeDashboardData() {
    // Set key metrics
    document.getElementById('conversion-rate').textContent = dashboardData.metrics.conversionRate.value + '%';
    document.getElementById('avg-order-value').textContent = '$' + dashboardData.metrics.avgOrderValue.value;
    document.getElementById('recommendation-ctr').textContent = dashboardData.metrics.recommendationCTR.value + '%';
    document.getElementById('active-tests').textContent = dashboardData.metrics.activeTests.value;
    
    // Set metric changes
    const conversionChange = document.getElementById('conversion-change');
    conversionChange.innerHTML = `<i class="bi bi-arrow-${dashboardData.metrics.conversionRate.trend}"></i> ${dashboardData.metrics.conversionRate.change}%`;
    conversionChange.className = `metric-change ${dashboardData.metrics.conversionRate.trend === 'up' ? 'positive' : dashboardData.metrics.conversionRate.trend === 'down' ? 'negative' : ''}`;
    
    const aovChange = document.getElementById('aov-change');
    aovChange.innerHTML = `<i class="bi bi-arrow-${dashboardData.metrics.avgOrderValue.trend}"></i> $${dashboardData.metrics.avgOrderValue.change}`;
    aovChange.className = `metric-change ${dashboardData.metrics.avgOrderValue.trend === 'up' ? 'positive' : dashboardData.metrics.avgOrderValue.trend === 'down' ? 'negative' : ''}`;
    
    const ctrChange = document.getElementById('ctr-change');
    ctrChange.innerHTML = `<i class="bi bi-arrow-${dashboardData.metrics.recommendationCTR.trend}"></i> ${dashboardData.metrics.recommendationCTR.change}%`;
    ctrChange.className = `metric-change ${dashboardData.metrics.recommendationCTR.trend === 'up' ? 'positive' : dashboardData.metrics.recommendationCTR.trend === 'down' ? 'negative' : ''}`;
    
    const testsChange = document.getElementById('tests-change');
    testsChange.innerHTML = `<i class="bi bi-${dashboardData.metrics.activeTests.trend === 'neutral' ? 'dash' : 'arrow-' + dashboardData.metrics.activeTests.trend}"></i> ${dashboardData.metrics.activeTests.change === 0 ? 'No change' : dashboardData.metrics.activeTests.change}`;
    testsChange.className = `metric-change ${dashboardData.metrics.activeTests.trend === 'up' ? 'positive' : dashboardData.metrics.activeTests.trend === 'down' ? 'negative' : ''}`;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initializeDashboardData);