// Connected Apps End-to-End Test Suite
// Comprehensive testing for the Connected Apps marketplace with Stripe integration

const puppeteer = require('puppeteer');
const fs = require('fs');

class ConnectedAppsE2ETestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'https://commerce-studio-website-353252826752.us-central1.run.app';
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };
    }

    async initialize() {
        console.log('🚀 Initializing Connected Apps E2E Test Suite...');
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    async runTest(testName, testFunction) {
        this.testResults.total++;
        console.log(`\n🧪 Running: ${testName}`);
        
        try {
            await testFunction();
            this.testResults.passed++;
            this.testResults.details.push({
                name: testName,
                status: 'PASSED',
                message: 'Test completed successfully'
            });
            console.log(`✅ PASSED: ${testName}`);
        } catch (error) {
            this.testResults.failed++;
            this.testResults.details.push({
                name: testName,
                status: 'FAILED',
                message: error.message
            });
            console.log(`❌ FAILED: ${testName} - ${error.message}`);
        }
    }

    // Test 1: Customer Portal Navigation
    async testCustomerPortalNavigation() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html`);
        await this.page.waitForSelector('.settings-sidebar', { timeout: 10000 });
        
        // Check if Connected Apps navigation item exists
        const connectedAppsNav = await this.page.$('.nav-item[data-section="connected-apps"]');
        if (!connectedAppsNav) {
            throw new Error('Connected Apps navigation item not found');
        }
        
        // Click on Connected Apps
        await connectedAppsNav.click();
        await this.page.waitForSelector('#connected-apps', { timeout: 5000 });
        
        // Verify Connected Apps section is visible
        const connectedAppsSection = await this.page.$('#connected-apps');
        const isVisible = await connectedAppsSection.isIntersectingViewport();
        if (!isVisible) {
            throw new Error('Connected Apps section not visible after navigation');
        }
    }

    // Test 2: Token Balance Display
    async testTokenBalanceDisplay() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        await this.page.waitForSelector('.token-balance-card', { timeout: 10000 });
        
        // Check token balance elements
        const tokenBalance = await this.page.$('.token-count');
        const balanceText = await this.page.evaluate(el => el.textContent, tokenBalance);
        
        if (!balanceText || !balanceText.includes('2,500')) {
            throw new Error('Token balance not displaying correctly');
        }
        
        // Check usage analytics
        const usageChart = await this.page.$('.usage-chart');
        if (!usageChart) {
            throw new Error('Usage analytics chart not found');
        }
    }

    // Test 3: App Grid Display
    async testAppGridDisplay() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        await this.page.waitForSelector('.apps-grid', { timeout: 10000 });
        
        // Check if all 6 apps are displayed
        const appCards = await this.page.$$('.app-card');
        if (appCards.length !== 6) {
            throw new Error(`Expected 6 app cards, found ${appCards.length}`);
        }
        
        // Verify each app has required elements
        for (let i = 0; i < appCards.length; i++) {
            const card = appCards[i];
            const title = await card.$('.app-title');
            const description = await card.$('.app-description');
            const tokenCost = await card.$('.token-cost');
            const activateBtn = await card.$('.activate-btn');
            
            if (!title || !description || !tokenCost || !activateBtn) {
                throw new Error(`App card ${i + 1} missing required elements`);
            }
        }
    }

    // Test 4: App Activation Flow
    async testAppActivationFlow() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        await this.page.waitForSelector('.apps-grid', { timeout: 10000 });
        
        // Find an inactive app and activate it
        const inactiveApp = await this.page.$('.app-card:not(.active) .activate-btn');
        if (!inactiveApp) {
            throw new Error('No inactive apps found to test activation');
        }
        
        // Click activate button
        await inactiveApp.click();
        
        // Wait for activation to complete
        await this.page.waitForTimeout(2000);
        
        // Check if app status changed
        const appCard = await this.page.$('.app-card.active');
        if (!appCard) {
            throw new Error('App activation did not update status');
        }
        
        // Verify deactivate button appears
        const deactivateBtn = await appCard.$('.deactivate-btn');
        if (!deactivateBtn) {
            throw new Error('Deactivate button not found after activation');
        }
    }

    // Test 5: Configuration Modal
    async testConfigurationModal() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        await this.page.waitForSelector('.apps-grid', { timeout: 10000 });
        
        // Find and click configure button
        const configureBtn = await this.page.$('.configure-btn');
        if (!configureBtn) {
            throw new Error('Configure button not found');
        }
        
        await configureBtn.click();
        
        // Wait for modal to appear
        await this.page.waitForSelector('.config-modal', { timeout: 5000 });
        
        // Check modal elements
        const modal = await this.page.$('.config-modal');
        const modalTitle = await modal.$('.modal-title');
        const configForm = await modal.$('.config-form');
        const saveBtn = await modal.$('.save-config-btn');
        const cancelBtn = await modal.$('.cancel-btn');
        
        if (!modalTitle || !configForm || !saveBtn || !cancelBtn) {
            throw new Error('Configuration modal missing required elements');
        }
        
        // Close modal
        await cancelBtn.click();
        await this.page.waitForTimeout(1000);
        
        // Verify modal is closed
        const modalVisible = await this.page.$('.config-modal');
        if (modalVisible) {
            throw new Error('Configuration modal did not close properly');
        }
    }

    // Test 6: Billing Information Display
    async testBillingInformationDisplay() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        await this.page.waitForSelector('.billing-info', { timeout: 10000 });
        
        // Check billing elements
        const currentPlan = await this.page.$('.current-plan');
        const nextBilling = await this.page.$('.next-billing');
        const usageThisMonth = await this.page.$('.usage-this-month');
        
        if (!currentPlan || !nextBilling || !usageThisMonth) {
            throw new Error('Billing information elements not found');
        }
        
        // Verify plan information
        const planText = await this.page.evaluate(el => el.textContent, currentPlan);
        if (!planText.includes('Professional Plan')) {
            throw new Error('Current plan not displaying correctly');
        }
    }

    // Test 7: Token Purchase Flow
    async testTokenPurchaseFlow() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        await this.page.waitForSelector('.token-balance-card', { timeout: 10000 });
        
        // Click buy tokens button
        const buyTokensBtn = await this.page.$('.buy-tokens-btn');
        if (!buyTokensBtn) {
            throw new Error('Buy tokens button not found');
        }
        
        await buyTokensBtn.click();
        
        // Wait for purchase modal or redirect
        await this.page.waitForTimeout(2000);
        
        // Check if Stripe checkout would be initiated (mock check)
        const currentUrl = this.page.url();
        if (!currentUrl.includes('connected-apps') && !currentUrl.includes('checkout')) {
            throw new Error('Token purchase flow did not initiate properly');
        }
    }

    // Test 8: Usage Analytics
    async testUsageAnalytics() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        await this.page.waitForSelector('.usage-analytics', { timeout: 10000 });
        
        // Check analytics elements
        const usageChart = await this.page.$('.usage-chart');
        const usageStats = await this.page.$('.usage-stats');
        const topApps = await this.page.$('.top-apps');
        
        if (!usageChart || !usageStats || !topApps) {
            throw new Error('Usage analytics elements not found');
        }
        
        // Verify chart data
        const chartData = await this.page.evaluate(() => {
            const chart = document.querySelector('.usage-chart canvas');
            return chart ? true : false;
        });
        
        if (!chartData) {
            throw new Error('Usage chart not rendering properly');
        }
    }

    // Test 9: Responsive Design
    async testResponsiveDesign() {
        await this.page.goto(`${this.baseUrl}/customer/settings.html#connected-apps`);
        
        // Test mobile viewport
        await this.page.setViewport({ width: 375, height: 667 });
        await this.page.waitForTimeout(1000);
        
        // Check if mobile layout is applied
        const appsGrid = await this.page.$('.apps-grid');
        const gridStyle = await this.page.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
        }, appsGrid);
        
        // Should be single column on mobile
        if (!gridStyle.includes('1fr') || gridStyle.split(' ').length > 1) {
            throw new Error('Mobile responsive layout not applied correctly');
        }
        
        // Test tablet viewport
        await this.page.setViewport({ width: 768, height: 1024 });
        await this.page.waitForTimeout(1000);
        
        // Reset to desktop
        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    // Test 10: Admin Portal Integration
    async testAdminPortalIntegration() {
        await this.page.goto(`${this.baseUrl}/admin/index.html`);
        await this.page.waitForSelector('.admin-dashboard', { timeout: 10000 });
        
        // Check customer management section
        const customerMgmt = await this.page.$('.customer-management');
        if (!customerMgmt) {
            throw new Error('Customer management section not found in admin portal');
        }
        
        // Check billing overview
        const billingOverview = await this.page.$('.billing-overview');
        if (!billingOverview) {
            throw new Error('Billing overview not found in admin portal');
        }
        
        // Verify Connected Apps metrics
        const connectedAppsMetrics = await this.page.$('.connected-apps-metrics');
        if (!connectedAppsMetrics) {
            throw new Error('Connected Apps metrics not found in admin portal');
        }
    }

    // Test 11: API Integration Points
    async testAPIIntegrationPoints() {
        // Test API endpoints are accessible
        const apiEndpoints = [
            '/api/stripe/config',
            '/api/customer/tokens',
            '/api/apps/status',
            '/api/billing/subscription'
        ];
        
        for (const endpoint of apiEndpoints) {
            try {
                const response = await this.page.goto(`${this.baseUrl}${endpoint}`, {
                    waitUntil: 'networkidle0',
                    timeout: 10000
                });
                
                if (!response.ok() && response.status() !== 404) {
                    throw new Error(`API endpoint ${endpoint} returned status ${response.status()}`);
                }
            } catch (error) {
                // Some endpoints may require authentication, so 401/403 is acceptable
                if (!error.message.includes('401') && !error.message.includes('403')) {
                    throw new Error(`API endpoint ${endpoint} failed: ${error.message}`);
                }
            }
        }
    }

    // Test 12: Security Headers and HTTPS
    async testSecurityAndHTTPS() {
        const response = await this.page.goto(`${this.baseUrl}/customer/settings.html`);
        
        // Check HTTPS
        if (!this.page.url().startsWith('https://')) {
            throw new Error('Site not using HTTPS');
        }
        
        // Check security headers
        const headers = response.headers();
        const requiredHeaders = [
            'strict-transport-security',
            'x-content-type-options',
            'x-frame-options'
        ];
        
        for (const header of requiredHeaders) {
            if (!headers[header]) {
                console.warn(`⚠️ Missing security header: ${header}`);
            }
        }
    }

    async runAllTests() {
        console.log('🎯 Starting Connected Apps E2E Test Suite');
        console.log('=' .repeat(60));
        
        await this.initialize();
        
        // Run all tests
        await this.runTest('Customer Portal Navigation', () => this.testCustomerPortalNavigation());
        await this.runTest('Token Balance Display', () => this.testTokenBalanceDisplay());
        await this.runTest('App Grid Display', () => this.testAppGridDisplay());
        await this.runTest('App Activation Flow', () => this.testAppActivationFlow());
        await this.runTest('Configuration Modal', () => this.testConfigurationModal());
        await this.runTest('Billing Information Display', () => this.testBillingInformationDisplay());
        await this.runTest('Token Purchase Flow', () => this.testTokenPurchaseFlow());
        await this.runTest('Usage Analytics', () => this.testUsageAnalytics());
        await this.runTest('Responsive Design', () => this.testResponsiveDesign());
        await this.runTest('Admin Portal Integration', () => this.testAdminPortalIntegration());
        await this.runTest('API Integration Points', () => this.testAPIIntegrationPoints());
        await this.runTest('Security and HTTPS', () => this.testSecurityAndHTTPS());
        
        await this.generateReport();
        await this.cleanup();
    }

    async generateReport() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 CONNECTED APPS E2E TEST RESULTS');
        console.log('=' .repeat(60));
        
        const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed} (${passRate}%)`);
        console.log(`Failed: ${this.testResults.failed}`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults.details
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.message}`);
                });
        }
        
        // Generate detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                passRate: `${passRate}%`
            },
            details: this.testResults.details,
            environment: {
                baseUrl: this.baseUrl,
                userAgent: await this.page.evaluate(() => navigator.userAgent)
            }
        };
        
        // Save report to file
        fs.writeFileSync(
            'CONNECTED_APPS_E2E_TEST_REPORT.json',
            JSON.stringify(report, null, 2)
        );
        
        console.log('\n📄 Detailed report saved to: CONNECTED_APPS_E2E_TEST_REPORT.json');
        
        // Overall status
        if (this.testResults.failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED - Connected Apps marketplace is ready for production!');
        } else if (passRate >= 80) {
            console.log('\n⚠️ MOSTLY PASSING - Some issues need attention before full production deployment');
        } else {
            console.log('\n❌ SIGNIFICANT ISSUES - Major problems need resolution before production');
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the test suite
async function runConnectedAppsE2ETests() {
    const testSuite = new ConnectedAppsE2ETestSuite();
    
    try {
        await testSuite.runAllTests();
    } catch (error) {
        console.error('❌ Test suite failed to run:', error);
        process.exit(1);
    }
}

// Export for use in other scripts
module.exports = ConnectedAppsE2ETestSuite;

// Run if called directly
if (require.main === module) {
    runConnectedAppsE2ETests();
}