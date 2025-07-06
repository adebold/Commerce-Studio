/**
 * Dashboard Analytics Functionality Test Suite
 * Tests the US-006: Dashboard Analytics & Insights implementation
 */

const puppeteer = require('puppeteer');

class DashboardAnalyticsTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
    }

    async initialize() {
        console.log('🚀 Initializing Dashboard Analytics Test Suite...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1200, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Browser Error:', msg.text());
            } else if (msg.text().includes('Analytics')) {
                console.log('📊 Analytics Log:', msg.text());
            }
        });
    }

    async testDashboardAnalyticsManagerSetup() {
        console.log('\n📊 Testing Dashboard Analytics Manager Setup...');
        
        try {
            await this.page.goto('https://commerce-studio-website-ddtojwjn7a-uc.a.run.app/customer/dashboard.html', {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for the analytics dashboard to load
            await this.page.waitForSelector('#analytics-dashboard', { timeout: 10000 });

            // Check if Dashboard Analytics Manager is initialized
            const managerInitialized = await this.page.evaluate(() => {
                return typeof window.dashboardAnalytics !== 'undefined' && 
                       window.dashboardAnalytics && 
                       window.dashboardAnalytics.isInitialized === true;
            });

            // Check if analytics data is loaded
            const analyticsDataLoaded = await this.page.evaluate(() => {
                return window.dashboardAnalytics && 
                       window.dashboardAnalytics.analytics &&
                       Object.keys(window.dashboardAnalytics.analytics).length > 0;
            });

            // Check if charts are initialized
            const chartsInitialized = await this.page.evaluate(() => {
                return window.dashboardAnalytics && 
                       window.dashboardAnalytics.charts &&
                       Object.keys(window.dashboardAnalytics.charts).length > 0;
            });

            this.testResults.push({
                test: 'Dashboard Analytics Manager Setup',
                success: managerInitialized && analyticsDataLoaded && chartsInitialized,
                details: `Manager initialized: ${managerInitialized}, Data loaded: ${analyticsDataLoaded}, Charts initialized: ${chartsInitialized}`
            });

            return managerInitialized && analyticsDataLoaded && chartsInitialized;

        } catch (error) {
            console.error('❌ Dashboard analytics manager setup test failed:', error.message);
            this.testResults.push({
                test: 'Dashboard Analytics Manager Setup',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testKPICardsDisplay() {
        console.log('\n📈 Testing KPI Cards Display...');
        
        try {
            // Check if KPI cards are present
            const kpiCards = await this.page.$$('.analytics-kpi-card');
            const kpiCardCount = kpiCards.length;

            // Check if KPI values are populated
            const kpiValuesPopulated = await this.page.evaluate(() => {
                const kpiValues = document.querySelectorAll('.kpi-value');
                return Array.from(kpiValues).every(value => value.textContent.trim() !== '');
            });

            // Check if KPI changes are displayed
            const kpiChangesDisplayed = await this.page.evaluate(() => {
                const kpiChanges = document.querySelectorAll('.kpi-change');
                return kpiChanges.length > 0 && 
                       Array.from(kpiChanges).some(change => change.textContent.includes('%'));
            });

            // Check if KPI icons are present
            const kpiIconsPresent = await this.page.evaluate(() => {
                const kpiIcons = document.querySelectorAll('.kpi-icon');
                return kpiIcons.length > 0;
            });

            this.testResults.push({
                test: 'KPI Cards Display',
                success: kpiCardCount >= 6 && kpiValuesPopulated && kpiChangesDisplayed && kpiIconsPresent,
                details: `KPI cards: ${kpiCardCount}, Values populated: ${kpiValuesPopulated}, Changes displayed: ${kpiChangesDisplayed}, Icons present: ${kpiIconsPresent}`
            });

            return kpiCardCount >= 6 && kpiValuesPopulated && kpiChangesDisplayed && kpiIconsPresent;

        } catch (error) {
            console.error('❌ KPI cards display test failed:', error.message);
            this.testResults.push({
                test: 'KPI Cards Display',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testChartsRendering() {
        console.log('\n📊 Testing Charts Rendering...');
        
        try {
            // Switch to analytics tab
            await this.page.click('button[onclick="showSection(\'analytics\')"]');
            await this.page.waitForTimeout(1000);

            // Check if chart canvases are present
            const chartCanvases = await this.page.$$('canvas');
            const chartCount = chartCanvases.length;

            // Check if Chart.js charts are rendered
            const chartsRendered = await this.page.evaluate(() => {
                const canvases = document.querySelectorAll('canvas');
                return Array.from(canvases).some(canvas => {
                    const ctx = canvas.getContext('2d');
                    return ctx && canvas.width > 0 && canvas.height > 0;
                });
            });

            // Check specific chart containers
            const salesChartExists = await this.page.$('#sales-trend-chart');
            const revenueChartExists = await this.page.$('#revenue-breakdown-chart');
            const trafficChartExists = await this.page.$('#traffic-chart');

            this.testResults.push({
                test: 'Charts Rendering',
                success: chartCount >= 3 && chartsRendered && salesChartExists && revenueChartExists,
                details: `Chart count: ${chartCount}, Charts rendered: ${chartsRendered}, Sales chart: ${!!salesChartExists}, Revenue chart: ${!!revenueChartExists}, Traffic chart: ${!!trafficChartExists}`
            });

            return chartCount >= 3 && chartsRendered && salesChartExists && revenueChartExists;

        } catch (error) {
            console.error('❌ Charts rendering test failed:', error.message);
            this.testResults.push({
                test: 'Charts Rendering',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testInsightsGeneration() {
        console.log('\n🧠 Testing AI Insights Generation...');
        
        try {
            // Check if insights section exists
            const insightsSection = await this.page.$('#analytics-insights');
            const insightsSectionExists = !!insightsSection;

            // Check if insights are generated
            const insightsGenerated = await this.page.evaluate(() => {
                return window.dashboardAnalytics && 
                       window.dashboardAnalytics.insights &&
                       window.dashboardAnalytics.insights.length > 0;
            });

            // Check if insight cards are displayed
            const insightCards = await this.page.$$('.insight-card');
            const insightCardCount = insightCards.length;

            // Check if insights have proper structure
            const insightsStructureValid = await this.page.evaluate(() => {
                const cards = document.querySelectorAll('.insight-card');
                return Array.from(cards).every(card => {
                    const title = card.querySelector('.insight-content h4');
                    const description = card.querySelector('.insight-content p');
                    const icon = card.querySelector('.insight-icon');
                    return title && description && icon;
                });
            });

            this.testResults.push({
                test: 'AI Insights Generation',
                success: insightsSectionExists && insightsGenerated && insightCardCount > 0 && insightsStructureValid,
                details: `Insights section: ${insightsSectionExists}, Insights generated: ${insightsGenerated}, Insight cards: ${insightCardCount}, Structure valid: ${insightsStructureValid}`
            });

            return insightsSectionExists && insightsGenerated && insightCardCount > 0 && insightsStructureValid;

        } catch (error) {
            console.error('❌ AI insights generation test failed:', error.message);
            this.testResults.push({
                test: 'AI Insights Generation',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testAnalyticsControls() {
        console.log('\n🎛️ Testing Analytics Controls...');
        
        try {
            // Check if date range selector exists
            const dateRangeSelector = await this.page.$('#analytics-date-range');
            const dateRangeSelectorExists = !!dateRangeSelector;

            // Check if refresh button exists and works
            const refreshButton = await this.page.$('#analytics-refresh-btn');
            const refreshButtonExists = !!refreshButton;

            if (refreshButton) {
                await this.page.click('#analytics-refresh-btn');
                await this.page.waitForTimeout(1000);
            }

            // Check if export button exists
            const exportButton = await this.page.$('#analytics-export-btn');
            const exportButtonExists = !!exportButton;

            // Test date range change
            let dateRangeWorking = false;
            if (dateRangeSelector) {
                await this.page.select('#analytics-date-range', '7d');
                await this.page.waitForTimeout(500);
                dateRangeWorking = true;
            }

            this.testResults.push({
                test: 'Analytics Controls',
                success: dateRangeSelectorExists && refreshButtonExists && exportButtonExists && dateRangeWorking,
                details: `Date range selector: ${dateRangeSelectorExists}, Refresh button: ${refreshButtonExists}, Export button: ${exportButtonExists}, Date range working: ${dateRangeWorking}`
            });

            return dateRangeSelectorExists && refreshButtonExists && exportButtonExists && dateRangeWorking;

        } catch (error) {
            console.error('❌ Analytics controls test failed:', error.message);
            this.testResults.push({
                test: 'Analytics Controls',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testMetricsDisplay() {
        console.log('\n📋 Testing Metrics Display...');
        
        try {
            // Check if metrics grid exists
            const metricsGrid = await this.page.$('.analytics-metrics-grid');
            const metricsGridExists = !!metricsGrid;

            // Check if metric cards are present
            const metricCards = await this.page.$$('.analytics-metric-card');
            const metricCardCount = metricCards.length;

            // Check if traffic metrics are displayed
            const trafficMetrics = await this.page.$('#traffic-metrics');
            const trafficMetricsExists = !!trafficMetrics;

            // Check if product metrics are displayed
            const productMetrics = await this.page.$('#product-metrics');
            const productMetricsExists = !!productMetrics;

            // Check if integration status is displayed
            const integrationStatus = await this.page.$('#integration-status');
            const integrationStatusExists = !!integrationStatus;

            // Check if metric values are populated
            const metricValuesPopulated = await this.page.evaluate(() => {
                const metricValues = document.querySelectorAll('.metric-value');
                return metricValues.length > 0 && 
                       Array.from(metricValues).every(value => value.textContent.trim() !== '');
            });

            this.testResults.push({
                test: 'Metrics Display',
                success: metricsGridExists && metricCardCount >= 3 && trafficMetricsExists && productMetricsExists && integrationStatusExists && metricValuesPopulated,
                details: `Metrics grid: ${metricsGridExists}, Metric cards: ${metricCardCount}, Traffic metrics: ${trafficMetricsExists}, Product metrics: ${productMetricsExists}, Integration status: ${integrationStatusExists}, Values populated: ${metricValuesPopulated}`
            });

            return metricsGridExists && metricCardCount >= 3 && trafficMetricsExists && productMetricsExists && integrationStatusExists && metricValuesPopulated;

        } catch (error) {
            console.error('❌ Metrics display test failed:', error.message);
            this.testResults.push({
                test: 'Metrics Display',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testDashboardNavigation() {
        console.log('\n🧭 Testing Dashboard Navigation...');
        
        try {
            // Test tab switching
            const tabs = ['overview', 'analytics', 'performance', 'insights'];
            let tabSwitchingWorking = true;

            for (const tab of tabs) {
                try {
                    await this.page.click(`button[onclick="showSection('${tab}')"]`);
                    await this.page.waitForTimeout(500);
                    
                    const sectionVisible = await this.page.evaluate((tabName) => {
                        const section = document.getElementById(tabName + '-section');
                        return section && section.classList.contains('active');
                    }, tab);
                    
                    if (!sectionVisible) {
                        tabSwitchingWorking = false;
                        break;
                    }
                } catch (error) {
                    tabSwitchingWorking = false;
                    break;
                }
            }

            // Check if sidebar navigation works
            const sidebarLinks = await this.page.$$('.sidebar-nav a');
            const sidebarLinksCount = sidebarLinks.length;

            // Test mobile menu toggle (if applicable)
            let mobileMenuWorking = true;
            try {
                await this.page.setViewport({ width: 600, height: 800 });
                await this.page.waitForTimeout(500);
                
                const mobileMenuBtn = await this.page.$('.mobile-menu-btn');
                if (mobileMenuBtn) {
                    await this.page.click('.mobile-menu-btn');
                    await this.page.waitForTimeout(500);
                }
                
                // Reset viewport
                await this.page.setViewport({ width: 1200, height: 800 });
            } catch (error) {
                mobileMenuWorking = false;
            }

            this.testResults.push({
                test: 'Dashboard Navigation',
                success: tabSwitchingWorking && sidebarLinksCount >= 8 && mobileMenuWorking,
                details: `Tab switching: ${tabSwitchingWorking}, Sidebar links: ${sidebarLinksCount}, Mobile menu: ${mobileMenuWorking}`
            });

            return tabSwitchingWorking && sidebarLinksCount >= 8 && mobileMenuWorking;

        } catch (error) {
            console.error('❌ Dashboard navigation test failed:', error.message);
            this.testResults.push({
                test: 'Dashboard Navigation',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testResponsiveDesign() {
        console.log('\n📱 Testing Responsive Design...');
        
        try {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.waitForTimeout(1000);

            // Check if mobile layout adapts
            const mobileLayoutCorrect = await this.page.evaluate(() => {
                const dashboard = document.querySelector('.analytics-dashboard');
                const kpiGrid = document.querySelector('.analytics-kpi-grid');
                return dashboard && kpiGrid;
            });

            // Test tablet viewport
            await this.page.setViewport({ width: 768, height: 1024 });
            await this.page.waitForTimeout(1000);

            // Check if tablet layout adapts
            const tabletLayoutCorrect = await this.page.evaluate(() => {
                const chartsGrid = document.querySelector('.analytics-charts-grid');
                return chartsGrid !== null;
            });

            // Test desktop viewport
            await this.page.setViewport({ width: 1200, height: 800 });
            await this.page.waitForTimeout(1000);

            // Check if desktop layout is correct
            const desktopLayoutCorrect = await this.page.evaluate(() => {
                const sidebar = document.querySelector('.sidebar');
                const mainContent = document.querySelector('.main-content');
                return sidebar && mainContent;
            });

            this.testResults.push({
                test: 'Responsive Design',
                success: mobileLayoutCorrect && tabletLayoutCorrect && desktopLayoutCorrect,
                details: `Mobile layout: ${mobileLayoutCorrect}, Tablet layout: ${tabletLayoutCorrect}, Desktop layout: ${desktopLayoutCorrect}`
            });

            return mobileLayoutCorrect && tabletLayoutCorrect && desktopLayoutCorrect;

        } catch (error) {
            console.error('❌ Responsive design test failed:', error.message);
            this.testResults.push({
                test: 'Responsive Design',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async runAllTests() {
        console.log('🧪 Running Dashboard Analytics Test Suite...');
        console.log('Testing URL: https://commerce-studio-website-ddtojwjn7a-uc.a.run.app/customer/dashboard.html');

        const tests = [
            () => this.testDashboardAnalyticsManagerSetup(),
            () => this.testKPICardsDisplay(),
            () => this.testChartsRendering(),
            () => this.testInsightsGeneration(),
            () => this.testAnalyticsControls(),
            () => this.testMetricsDisplay(),
            () => this.testDashboardNavigation(),
            () => this.testResponsiveDesign()
        ];

        let successCount = 0;
        for (const test of tests) {
            const result = await test();
            if (result) successCount++;
        }

        await this.generateReport(successCount, tests.length);
        await this.cleanup();
    }

    async generateReport(successCount, totalTests) {
        console.log('\n📊 Generating Dashboard Analytics Test Report...');

        const successRate = ((successCount / totalTests) * 100).toFixed(1);

        console.log('\n============================================================');
        console.log('📊 DASHBOARD ANALYTICS & INSIGHTS TEST RESULTS');
        console.log('============================================================');
        console.log(`📈 Overall Success Rate: ${successRate}% (${successCount}/${totalTests})`);
        console.log('');

        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${result.test}: ${status}`);
            console.log(`   Details: ${result.details}`);
            console.log('');
        });

        console.log('💡 RECOMMENDATIONS:');
        this.testResults.forEach(result => {
            if (!result.success) {
                console.log(`❌ Fix: ${result.test} - ${result.details}`);
            }
        });

        if (successRate >= 80) {
            console.log('🎉 EXCELLENT: Dashboard analytics functionality is working well!');
        } else if (successRate >= 60) {
            console.log('⚠️  GOOD: Dashboard analytics mostly working, minor issues to address');
        } else {
            console.log('🚨 NEEDS ATTENTION: Dashboard analytics requires significant fixes');
        }

        console.log('============================================================');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('\n🏁 Dashboard Analytics Test Suite Complete!');
    }
}

// Run the test suite
async function runDashboardAnalyticsTests() {
    const tester = new DashboardAnalyticsTester();
    
    try {
        await tester.initialize();
        await tester.runAllTests();
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        await tester.cleanup();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardAnalyticsTester;
} else {
    // Run tests if called directly
    runDashboardAnalyticsTests();
}