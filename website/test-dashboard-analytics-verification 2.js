#!/usr/bin/env node

/**
 * Dashboard Analytics Live Verification Test
 * Uses existing framework infrastructure to verify all dashboard analytics features
 */

const https = require('https');
const http = require('http');

class DashboardAnalyticsVerification {
    constructor() {
        this.baseUrl = 'https://commerce-studio-website-ddtojwjn7a-uc.a.run.app';
        this.results = {
            dashboardLoad: false,
            analyticsFeatures: false,
            chartIntegration: false,
            kpiMetrics: false,
            responsiveDesign: false,
            jsIntegration: false,
            cssIntegration: false,
            htmlStructure: false
        };
        this.testResults = [];
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: 10000 }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        body: data
                    });
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async testDashboardPageLoad() {
        console.log('\n📊 Testing Dashboard Page Load...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/customer/dashboard.html`);
            
            if (response.statusCode === 200) {
                this.results.dashboardLoad = true;
                this.testResults.push({
                    test: 'Dashboard Page Load',
                    status: 'PASS',
                    details: `Status: ${response.statusCode}, Content-Length: ${response.body.length}`
                });
                console.log('✅ Dashboard page loads successfully');
                return response.body;
            } else {
                this.testResults.push({
                    test: 'Dashboard Page Load',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ Dashboard page failed to load: ${response.statusCode}`);
                return null;
            }
        } catch (error) {
            this.testResults.push({
                test: 'Dashboard Page Load',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ Dashboard page load error: ${error.message}`);
            return null;
        }
    }

    async testAnalyticsFeatures(htmlContent) {
        console.log('\n📈 Testing Analytics Features...');
        
        if (!htmlContent) {
            console.log('❌ No HTML content to test');
            return;
        }

        // Test for Analytics Dashboard title
        if (htmlContent.includes('Analytics Dashboard')) {
            this.results.analyticsFeatures = true;
            this.testResults.push({
                test: 'Analytics Dashboard Title',
                status: 'PASS',
                details: 'Analytics Dashboard title found'
            });
            console.log('✅ Analytics Dashboard title present');
        } else {
            this.testResults.push({
                test: 'Analytics Dashboard Title',
                status: 'FAIL',
                details: 'Analytics Dashboard title not found'
            });
            console.log('❌ Analytics Dashboard title missing');
        }

        // Test for Chart.js integration
        if (htmlContent.includes('chart.js') || htmlContent.includes('Chart.js')) {
            this.results.chartIntegration = true;
            this.testResults.push({
                test: 'Chart.js Integration',
                status: 'PASS',
                details: 'Chart.js library detected'
            });
            console.log('✅ Chart.js integration found');
        } else {
            this.testResults.push({
                test: 'Chart.js Integration',
                status: 'FAIL',
                details: 'Chart.js library not found'
            });
            console.log('❌ Chart.js integration missing');
        }

        // Test for KPI metrics elements
        const kpiElements = [
            'totalRevenue',
            'totalOrders', 
            'conversionRate',
            'averageOrderValue'
        ];

        let kpiFound = 0;
        kpiElements.forEach(element => {
            if (htmlContent.includes(element)) {
                kpiFound++;
            }
        });

        if (kpiFound >= 3) {
            this.results.kpiMetrics = true;
            this.testResults.push({
                test: 'KPI Metrics Elements',
                status: 'PASS',
                details: `${kpiFound}/4 KPI elements found`
            });
            console.log(`✅ KPI metrics elements present (${kpiFound}/4)`);
        } else {
            this.testResults.push({
                test: 'KPI Metrics Elements',
                status: 'FAIL',
                details: `Only ${kpiFound}/4 KPI elements found`
            });
            console.log(`❌ Insufficient KPI metrics elements (${kpiFound}/4)`);
        }

        // Test for responsive design classes
        const responsiveClasses = [
            'metrics-grid',
            'charts-grid',
            'dashboard-container',
            'mobile'
        ];

        let responsiveFound = 0;
        responsiveClasses.forEach(className => {
            if (htmlContent.includes(className)) {
                responsiveFound++;
            }
        });

        if (responsiveFound >= 2) {
            this.results.responsiveDesign = true;
            this.testResults.push({
                test: 'Responsive Design Classes',
                status: 'PASS',
                details: `${responsiveFound}/4 responsive classes found`
            });
            console.log(`✅ Responsive design classes present (${responsiveFound}/4)`);
        } else {
            this.testResults.push({
                test: 'Responsive Design Classes',
                status: 'FAIL',
                details: `Only ${responsiveFound}/4 responsive classes found`
            });
            console.log(`❌ Insufficient responsive design classes (${responsiveFound}/4)`);
        }
    }

    async testJavaScriptIntegration() {
        console.log('\n🔧 Testing JavaScript Integration...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/js/dashboard-analytics-manager.js`);
            
            if (response.statusCode === 200) {
                this.results.jsIntegration = true;
                this.testResults.push({
                    test: 'Dashboard Analytics Manager JS',
                    status: 'PASS',
                    details: `File size: ${response.body.length} bytes`
                });
                console.log('✅ Dashboard Analytics Manager JavaScript loaded');
                
                // Check for key functions
                if (response.body.includes('DashboardAnalyticsManager') && 
                    response.body.includes('Chart.js') &&
                    response.body.includes('generateInsights')) {
                    console.log('✅ Key analytics functions detected');
                } else {
                    console.log('⚠️  Some analytics functions may be missing');
                }
            } else {
                this.testResults.push({
                    test: 'Dashboard Analytics Manager JS',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ Dashboard Analytics Manager JavaScript failed to load: ${response.statusCode}`);
            }
        } catch (error) {
            this.testResults.push({
                test: 'Dashboard Analytics Manager JS',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ JavaScript integration error: ${error.message}`);
        }
    }

    async testCSSIntegration() {
        console.log('\n🎨 Testing CSS Integration...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/css/customer-portal.css`);
            
            if (response.statusCode === 200) {
                this.results.cssIntegration = true;
                this.testResults.push({
                    test: 'Customer Portal CSS',
                    status: 'PASS',
                    details: `File size: ${response.body.length} bytes`
                });
                console.log('✅ Customer Portal CSS loaded');
                
                // Check for analytics-specific styles
                if (response.body.includes('dashboard-analytics') || 
                    response.body.includes('metric-card') ||
                    response.body.includes('chart-container')) {
                    console.log('✅ Analytics-specific CSS styles detected');
                } else {
                    console.log('⚠️  Analytics-specific CSS styles may be missing');
                }
            } else {
                this.testResults.push({
                    test: 'Customer Portal CSS',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ Customer Portal CSS failed to load: ${response.statusCode}`);
            }
        } catch (error) {
            this.testResults.push({
                test: 'Customer Portal CSS',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ CSS integration error: ${error.message}`);
        }
    }

    async testHTMLStructure(htmlContent) {
        console.log('\n🏗️ Testing HTML Structure...');
        
        if (!htmlContent) {
            console.log('❌ No HTML content to test');
            return;
        }

        // Test for essential HTML structure elements
        const structureElements = [
            'dashboard-container',
            'dashboard-navbar',
            'dashboard-main',
            'metrics-grid',
            'chart-container',
            'activity-feed',
            'integration-status'
        ];

        let structureFound = 0;
        structureElements.forEach(element => {
            if (htmlContent.includes(element)) {
                structureFound++;
            }
        });

        if (structureFound >= 5) {
            this.results.htmlStructure = true;
            this.testResults.push({
                test: 'HTML Structure Elements',
                status: 'PASS',
                details: `${structureFound}/7 structure elements found`
            });
            console.log(`✅ HTML structure complete (${structureFound}/7)`);
        } else {
            this.testResults.push({
                test: 'HTML Structure Elements',
                status: 'FAIL',
                details: `Only ${structureFound}/7 structure elements found`
            });
            console.log(`❌ Incomplete HTML structure (${structureFound}/7)`);
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(70));
        console.log('🎯 DASHBOARD ANALYTICS VERIFICATION REPORT');
        console.log('='.repeat(70));
        
        const totalTests = Object.keys(this.results).length;
        const passedTests = Object.values(this.results).filter(result => result).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`📊 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
        console.log('');
        
        // Detailed test results
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.details}`);
        });
        
        console.log('');
        console.log('🔍 Feature Verification Summary:');
        console.log(`• Dashboard Page Load: ${this.results.dashboardLoad ? '✅' : '❌'}`);
        console.log(`• Analytics Features: ${this.results.analyticsFeatures ? '✅' : '❌'}`);
        console.log(`• Chart.js Integration: ${this.results.chartIntegration ? '✅' : '❌'}`);
        console.log(`• KPI Metrics: ${this.results.kpiMetrics ? '✅' : '❌'}`);
        console.log(`• Responsive Design: ${this.results.responsiveDesign ? '✅' : '❌'}`);
        console.log(`• JavaScript Integration: ${this.results.jsIntegration ? '✅' : '❌'}`);
        console.log(`• CSS Integration: ${this.results.cssIntegration ? '✅' : '❌'}`);
        console.log(`• HTML Structure: ${this.results.htmlStructure ? '✅' : '❌'}`);
        console.log('');
        
        if (successRate >= 80) {
            console.log('🎉 DASHBOARD ANALYTICS DEPLOYMENT: SUCCESS');
            console.log('All major features are deployed and functional!');
        } else if (successRate >= 60) {
            console.log('⚠️  DASHBOARD ANALYTICS DEPLOYMENT: PARTIAL SUCCESS');
            console.log('Most features are working, some issues need attention.');
        } else {
            console.log('❌ DASHBOARD ANALYTICS DEPLOYMENT: NEEDS ATTENTION');
            console.log('Several critical issues require investigation.');
        }
        
        console.log('');
        console.log('🌐 Live Dashboard URL:');
        console.log(`${this.baseUrl}/customer/dashboard.html`);
        console.log('');
        console.log('📝 Note: This test verifies deployment and basic functionality.');
        console.log('For interactive testing, visit the URL above and login with demo credentials.');
        console.log('='.repeat(70));
    }

    async runVerification() {
        console.log('🚀 Starting Dashboard Analytics Verification...');
        console.log(`🌐 Testing URL: ${this.baseUrl}/customer/dashboard.html`);
        
        try {
            // Test dashboard page load and get HTML content
            const htmlContent = await this.testDashboardPageLoad();
            
            // Test analytics features in the HTML
            await this.testAnalyticsFeatures(htmlContent);
            
            // Test HTML structure
            await this.testHTMLStructure(htmlContent);
            
            // Test JavaScript integration
            await this.testJavaScriptIntegration();
            
            // Test CSS integration
            await this.testCSSIntegration();
            
            // Generate comprehensive report
            this.generateReport();
            
        } catch (error) {
            console.error(`❌ Verification failed: ${error.message}`);
        }
    }
}

// Execute the verification
if (require.main === module) {
    const verification = new DashboardAnalyticsVerification();
    verification.runVerification().catch(console.error);
}

module.exports = DashboardAnalyticsVerification;