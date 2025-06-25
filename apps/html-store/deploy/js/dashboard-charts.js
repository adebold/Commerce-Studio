/**
 * SKU-Genie Dashboard Charts
 * 
 * This file contains the code to create and update the charts
 * on the analytics dashboard.
 */

// Chart configuration
const chartConfig = {
    // Common options for all charts
    common: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        }
    },
    
    // Color schemes
    colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40',
        
        // Chart colors
        control: '#6c757d',
        treatment: '#007bff',
        positive: '#28a745',
        negative: '#dc3545',
        neutral: '#ffc107',
        
        // Face shape colors
        oval: '#4e73df',
        round: '#1cc88a',
        square: '#36b9cc',
        heart: '#f6c23e',
        diamond: '#e74a3b',
        oblong: '#858796'
    }
};

// Initialize all charts
function initializeCharts() {
    // A/B Testing Charts
    createFaceShapeTestChart();
    createRecommendationsTestChart();
    createTryOnTestChart();
    createConversionFunnelChart();
    
    // Recommendation Charts
    createRecommendationCTRChart();
    createRecommendationCVRChart();
    createAlgorithmPerformanceChart();
    
    // Face Shape Charts
    createFaceShapeDistributionChart();
    createFaceShapeConversionChart();
    createCompatibilityConversionChart();
    createTopProductsFaceShapeChart();
}

// Create face shape test chart
function createFaceShapeTestChart() {
    const ctx = document.getElementById('face-shape-test-chart');
    if (!ctx) return;
    
    const data = dashboardData.abTesting.faceShapeTest.dailyData;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'Control',
                    data: data.map(d => d.control),
                    borderColor: chartConfig.colors.control,
                    backgroundColor: hexToRgba(chartConfig.colors.control, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Treatment',
                    data: data.map(d => d.treatment),
                    borderColor: chartConfig.colors.treatment,
                    backgroundColor: hexToRgba(chartConfig.colors.treatment, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Conversion Rate (%)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Face Shape Compatibility Test'
                }
            }
        }
    });
}

// Create recommendations test chart
function createRecommendationsTestChart() {
    const ctx = document.getElementById('recommendations-test-chart');
    if (!ctx) return;
    
    const data = dashboardData.abTesting.recommendationsTest.dailyData;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'Control',
                    data: data.map(d => d.control),
                    borderColor: chartConfig.colors.control,
                    backgroundColor: hexToRgba(chartConfig.colors.control, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Treatment',
                    data: data.map(d => d.treatment),
                    borderColor: chartConfig.colors.treatment,
                    backgroundColor: hexToRgba(chartConfig.colors.treatment, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Average Order Value ($)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Product Recommendations Test'
                }
            }
        }
    });
}

// Create try-on test chart
function createTryOnTestChart() {
    const ctx = document.getElementById('try-on-test-chart');
    if (!ctx) return;
    
    const data = dashboardData.abTesting.tryOnTest.dailyData;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'Control',
                    data: data.map(d => d.control),
                    borderColor: chartConfig.colors.control,
                    backgroundColor: hexToRgba(chartConfig.colors.control, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Treatment',
                    data: data.map(d => d.treatment),
                    borderColor: chartConfig.colors.treatment,
                    backgroundColor: hexToRgba(chartConfig.colors.treatment, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Time on Page (seconds)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Virtual Try-On Test'
                }
            }
        }
    });
}

// Create conversion funnel chart
function createConversionFunnelChart() {
    const ctx = document.getElementById('conversion-funnel-chart');
    if (!ctx) return;
    
    const data = dashboardData.abTesting.conversionFunnel;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.stages,
            datasets: [
                {
                    label: 'Control',
                    data: data.control,
                    backgroundColor: chartConfig.colors.control,
                    borderColor: 'transparent',
                    borderWidth: 0
                },
                {
                    label: 'Treatment',
                    data: data.treatment,
                    backgroundColor: chartConfig.colors.treatment,
                    borderColor: 'transparent',
                    borderWidth: 0
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Users (%)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Conversion Funnel'
                }
            }
        }
    });
}

// Create recommendation CTR chart
function createRecommendationCTRChart() {
    const ctx = document.getElementById('recommendation-ctr-chart');
    if (!ctx) return;
    
    const data = dashboardData.recommendations.ctrOverTime;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Click-Through Rate',
                    data: data.values,
                    borderColor: chartConfig.colors.primary,
                    backgroundColor: hexToRgba(chartConfig.colors.primary, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'CTR (%)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Recommendation Click-Through Rate'
                }
            }
        }
    });
}

// Create recommendation CVR chart
function createRecommendationCVRChart() {
    const ctx = document.getElementById('recommendation-cvr-chart');
    if (!ctx) return;
    
    const data = dashboardData.recommendations.cvrOverTime;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Conversion Rate',
                    data: data.values,
                    borderColor: chartConfig.colors.success,
                    backgroundColor: hexToRgba(chartConfig.colors.success, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'CVR (%)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Recommendation Conversion Rate'
                }
            }
        }
    });
}

// Create algorithm performance chart
function createAlgorithmPerformanceChart() {
    const ctx = document.getElementById('algorithm-performance-chart');
    if (!ctx) return;
    
    const data = dashboardData.recommendations.algorithmPerformance;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.algorithms,
            datasets: [
                {
                    label: 'Click-Through Rate',
                    data: data.ctr,
                    backgroundColor: chartConfig.colors.primary,
                    borderColor: 'transparent',
                    borderWidth: 0
                },
                {
                    label: 'Conversion Rate',
                    data: data.cvr,
                    backgroundColor: chartConfig.colors.success,
                    borderColor: 'transparent',
                    borderWidth: 0
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Rate (%)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Algorithm Performance'
                }
            }
        }
    });
}

// Create face shape distribution chart
function createFaceShapeDistributionChart() {
    const ctx = document.getElementById('face-shape-distribution-chart');
    if (!ctx) return;
    
    const data = dashboardData.faceShape.distribution;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.shapes,
            datasets: [
                {
                    data: data.percentages,
                    backgroundColor: [
                        chartConfig.colors.oval,
                        chartConfig.colors.round,
                        chartConfig.colors.square,
                        chartConfig.colors.heart,
                        chartConfig.colors.diamond,
                        chartConfig.colors.oblong
                    ],
                    borderColor: 'white',
                    borderWidth: 1
                }
            ]
        },
        options: {
            ...chartConfig.common,
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Face Shape Distribution'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Create face shape conversion chart
function createFaceShapeConversionChart() {
    const ctx = document.getElementById('face-shape-conversion-chart');
    if (!ctx) return;
    
    const data = dashboardData.faceShape.conversionRates;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.shapes,
            datasets: [
                {
                    label: 'Conversion Rate',
                    data: data.rates,
                    backgroundColor: [
                        chartConfig.colors.oval,
                        chartConfig.colors.round,
                        chartConfig.colors.square,
                        chartConfig.colors.heart,
                        chartConfig.colors.diamond,
                        chartConfig.colors.oblong
                    ],
                    borderColor: 'transparent',
                    borderWidth: 0
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Conversion Rate (%)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Face Shape Conversion Rates'
                }
            }
        }
    });
}

// Create compatibility conversion chart
function createCompatibilityConversionChart() {
    const ctx = document.getElementById('compatibility-conversion-chart');
    if (!ctx) return;
    
    const data = dashboardData.faceShape.compatibilityConversion;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.scores,
            datasets: [
                {
                    label: 'Conversion Rate',
                    data: data.rates,
                    borderColor: chartConfig.colors.primary,
                    backgroundColor: hexToRgba(chartConfig.colors.primary, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Conversion Rate (%)'
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Conversion by Compatibility Score'
                }
            }
        }
    });
}

// Create top products by face shape chart
function createTopProductsFaceShapeChart() {
    const ctx = document.getElementById('top-products-face-shape-chart');
    if (!ctx) return;
    
    const data = dashboardData.faceShape.topProducts;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.shapes,
            datasets: [
                {
                    label: 'Conversion Rate',
                    data: data.products.map(p => p.conversion),
                    borderColor: chartConfig.colors.primary,
                    backgroundColor: hexToRgba(chartConfig.colors.primary, 0.2),
                    borderWidth: 2,
                    pointBackgroundColor: chartConfig.colors.primary,
                    pointRadius: 4
                }
            ]
        },
        options: {
            ...chartConfig.common,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                ...chartConfig.common.plugins,
                title: {
                    display: false,
                    text: 'Top Products by Face Shape'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const product = data.products[index];
                            return `${product.name}: ${product.conversion}%`;
                        }
                    }
                }
            }
        }
    });
}

// Helper function to convert hex color to rgba
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Initialize charts when document is ready
document.addEventListener('DOMContentLoaded', initializeCharts);