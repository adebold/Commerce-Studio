#!/usr/bin/env node

/**
 * Post-Deployment Monitoring Script for Predictive Analytics Showcase
 * Comprehensive verification of Google Cloud Run deployment
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://commerce-studio-website-ddtojwjn7a-uc.a.run.app';

// Test endpoints to verify
const TEST_ENDPOINTS = [
    { path: '/', name: 'Homepage', critical: true },
    { path: '/analytics/', name: 'Analytics Hub', critical: true },
    { path: '/analytics/index.html', name: 'Analytics Hub (Direct)', critical: true },
    { path: '/analytics/sales-forecasting.html', name: 'Sales Forecasting', critical: true },
    { path: '/analytics/real-time-analytics.html', name: 'Real-time Analytics', critical: true },
    { path: '/js/analytics-showcase.js', name: 'Analytics JavaScript', critical: true },
    { path: '/css/predictive-analytics.css', name: 'Analytics CSS', critical: false },
    { path: '/customer/', name: 'Customer Portal', critical: false },
    { path: '/dashboard/', name: 'Dashboard', critical: false }
];

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
    responseTime: 2000, // 2 seconds
    contentLength: 1000, // minimum content length
    cacheControl: true
};

class DeploymentMonitor {
    constructor() {
        this.results = [];
        this.errors = [];
        this.warnings = [];
        this.startTime = Date.now();
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        responseTime: responseTime,
                        contentLength: data.length
                    });
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    async testEndpoint(endpoint) {
        const url = `${BASE_URL}${endpoint.path}`;
        console.log(`\n🔍 Testing: ${endpoint.name} (${endpoint.path})`);
        
        try {
            const response = await this.makeRequest(url);
            const result = {
                endpoint: endpoint,
                url: url,
                status: response.statusCode,
                responseTime: response.responseTime,
                contentLength: response.contentLength,
                headers: response.headers,
                success: response.statusCode === 200,
                timestamp: new Date().toISOString()
            };

            // Performance analysis
            if (response.responseTime > PERFORMANCE_THRESHOLDS.responseTime) {
                this.warnings.push(`${endpoint.name}: Slow response time (${response.responseTime}ms)`);
            }

            if (response.contentLength < PERFORMANCE_THRESHOLDS.contentLength && endpoint.critical) {
                this.warnings.push(`${endpoint.name}: Small content size (${response.contentLength} bytes)`);
            }

            // Status analysis
            if (response.statusCode === 200) {
                console.log(`✅ ${endpoint.name}: OK (${response.responseTime}ms, ${response.contentLength} bytes)`);
            } else if (response.statusCode === 404) {
                console.log(`❌ ${endpoint.name}: NOT FOUND (404)`);
                if (endpoint.critical) {
                    this.errors.push(`CRITICAL: ${endpoint.name} returns 404`);
                }
            } else {
                console.log(`⚠️  ${endpoint.name}: HTTP ${response.statusCode}`);
                this.warnings.push(`${endpoint.name}: Unexpected status ${response.statusCode}`);
            }

            // Cache analysis
            const cacheControl = response.headers['cache-control'];
            if (cacheControl) {
                console.log(`   Cache-Control: ${cacheControl}`);
            }

            // Security headers analysis
            const securityHeaders = ['x-frame-options', 'x-content-type-options', 'x-xss-protection'];
            securityHeaders.forEach(header => {
                if (response.headers[header]) {
                    console.log(`   ${header}: ${response.headers[header]}`);
                }
            });

            this.results.push(result);
            return result;

        } catch (error) {
            console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
            this.errors.push(`${endpoint.name}: ${error.message}`);
            
            const result = {
                endpoint: endpoint,
                url: url,
                error: error.message,
                success: false,
                timestamp: new Date().toISOString()
            };
            
            this.results.push(result);
            return result;
        }
    }

    async runHealthCheck() {
        console.log('🏥 Running health check...');
        try {
            const response = await this.makeRequest(`${BASE_URL}/health`);
            if (response.statusCode === 200) {
                console.log('✅ Health check: PASSED');
                return true;
            } else {
                console.log(`❌ Health check: FAILED (${response.statusCode})`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Health check: ERROR - ${error.message}`);
            return false;
        }
    }

    async runPerformanceTest() {
        console.log('\n⚡ Running performance tests...');
        
        const performanceTests = [
            { path: '/', iterations: 3 },
            { path: '/analytics/', iterations: 3 }
        ];

        for (const test of performanceTests) {
            const times = [];
            console.log(`\n📊 Performance test: ${test.path} (${test.iterations} iterations)`);
            
            for (let i = 0; i < test.iterations; i++) {
                try {
                    const response = await this.makeRequest(`${BASE_URL}${test.path}`);
                    times.push(response.responseTime);
                    console.log(`   Iteration ${i + 1}: ${response.responseTime}ms`);
                } catch (error) {
                    console.log(`   Iteration ${i + 1}: ERROR - ${error.message}`);
                }
            }

            if (times.length > 0) {
                const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                const minTime = Math.min(...times);
                const maxTime = Math.max(...times);
                
                console.log(`   Average: ${avgTime.toFixed(2)}ms`);
                console.log(`   Min: ${minTime}ms, Max: ${maxTime}ms`);
                
                if (avgTime > PERFORMANCE_THRESHOLDS.responseTime) {
                    this.warnings.push(`${test.path}: Average response time exceeds threshold (${avgTime.toFixed(2)}ms)`);
                }
            }
        }
    }

    generateReport() {
        const totalTime = Date.now() - this.startTime;
        const successfulTests = this.results.filter(r => r.success).length;
        const totalTests = this.results.length;
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 POST-DEPLOYMENT MONITORING REPORT');
        console.log('='.repeat(80));
        console.log(`🕐 Test Duration: ${totalTime}ms`);
        console.log(`✅ Successful Tests: ${successfulTests}/${totalTests}`);
        console.log(`❌ Errors: ${this.errors.length}`);
        console.log(`⚠️  Warnings: ${this.warnings.length}`);
        
        if (this.errors.length > 0) {
            console.log('\n🚨 CRITICAL ERRORS:');
            this.errors.forEach(error => console.log(`   • ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`   • ${warning}`));
        }

        console.log('\n📋 DETAILED RESULTS:');
        this.results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
            const size = result.contentLength ? `${result.contentLength}B` : 'N/A';
            console.log(`   ${status} ${result.endpoint.name}: ${result.status || 'ERROR'} (${time}, ${size})`);
        });

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (this.errors.some(e => e.includes('404'))) {
            console.log('   • URGENT: Fix 404 errors for analytics pages - check deployment and nginx routing');
            console.log('   • Verify analytics files are properly copied in Docker build');
            console.log('   • Check nginx.conf analytics location block');
        }
        
        if (this.warnings.some(w => w.includes('response time'))) {
            console.log('   • Consider implementing CDN for static assets');
            console.log('   • Optimize image sizes and enable compression');
        }
        
        if (successfulTests === totalTests) {
            console.log('   • 🎉 All tests passed! Deployment is healthy');
        }

        console.log('\n' + '='.repeat(80));
        
        return {
            success: this.errors.length === 0,
            totalTests: totalTests,
            successfulTests: successfulTests,
            errors: this.errors,
            warnings: this.warnings,
            results: this.results
        };
    }

    async run() {
        console.log('🚀 Starting Post-Deployment Monitoring');
        console.log(`📍 Target: ${BASE_URL}`);
        console.log(`🕐 Started: ${new Date().toISOString()}`);
        
        // Health check first
        await this.runHealthCheck();
        
        // Test all endpoints
        console.log('\n🔍 Testing endpoints...');
        for (const endpoint of TEST_ENDPOINTS) {
            await this.testEndpoint(endpoint);
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Performance tests
        await this.runPerformanceTest();
        
        // Generate final report
        return this.generateReport();
    }
}

// Run monitoring if called directly
if (require.main === module) {
    const monitor = new DeploymentMonitor();
    monitor.run().then(report => {
        process.exit(report.success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Monitoring failed:', error);
        process.exit(1);
    });
}

module.exports = DeploymentMonitor;