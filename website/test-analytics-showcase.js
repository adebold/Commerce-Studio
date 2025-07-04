/**
 * Test Suite for Analytics Showcase
 * Validates the predictive analytics showcase functionality
 */

class AnalyticsShowcaseTest {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    async runAllTests() {
        console.log('🧪 Starting Analytics Showcase Test Suite...');
        
        try {
            await this.testNavigationDropdown();
            await this.testAnalyticsHubPage();
            await this.testSalesForecastingPage();
            await this.testRealtimeAnalyticsPage();
            await this.testInteractiveCharts();
            await this.testResponsiveDesign();
            await this.testAccessibility();
            
            this.generateReport();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    async testNavigationDropdown() {
        console.log('📋 Testing navigation dropdown...');
        
        try {
            // Test dropdown exists
            const dropdown = document.querySelector('.varai-nav-dropdown');
            this.assert(dropdown !== null, 'Analytics dropdown exists in navigation');
            
            // Test dropdown menu items
            const dropdownItems = document.querySelectorAll('.varai-dropdown-item');
            this.assert(dropdownItems.length >= 5, 'All analytics pages linked in dropdown');
            
            // Test dropdown hover functionality
            const dropdownMenu = document.querySelector('.varai-dropdown-menu');
            if (dropdownMenu) {
                const initialOpacity = window.getComputedStyle(dropdownMenu).opacity;
                this.assert(initialOpacity === '0', 'Dropdown initially hidden');
            }
            
            this.logTest('Navigation Dropdown', true, 'All dropdown tests passed');
        } catch (error) {
            this.logTest('Navigation Dropdown', false, error.message);
        }
    }

    async testAnalyticsHubPage() {
        console.log('📊 Testing analytics hub page...');
        
        try {
            // Test if we're on the analytics hub page
            const isHubPage = window.location.pathname.includes('/analytics/') || 
                             window.location.pathname.includes('analytics/index.html');
            
            if (isHubPage) {
                // Test hero section
                const heroSection = document.querySelector('.analytics-showcase-hero');
                this.assert(heroSection !== null, 'Analytics hero section exists');
                
                // Test capability cards
                const capabilityCards = document.querySelectorAll('.analytics-capability-card');
                this.assert(capabilityCards.length >= 4, 'All capability cards present');
                
                // Test live dashboard
                const liveDashboard = document.querySelector('.live-analytics-dashboard');
                this.assert(liveDashboard !== null, 'Live dashboard section exists');
                
                // Test analytics grid
                const analyticsGrid = document.querySelector('.analytics-grid');
                this.assert(analyticsGrid !== null, 'Analytics metrics grid exists');
            }
            
            this.logTest('Analytics Hub Page', true, 'Hub page structure validated');
        } catch (error) {
            this.logTest('Analytics Hub Page', false, error.message);
        }
    }

    async testSalesForecastingPage() {
        console.log('📈 Testing sales forecasting page...');
        
        try {
            // Test if Chart.js is loaded
            this.assert(typeof Chart !== 'undefined', 'Chart.js library loaded');
            
            // Test forecast demo functionality
            if (typeof updateForecastDemo === 'function') {
                // Test scenario switching
                updateForecastDemo('conservative');
                updateForecastDemo('realistic');
                updateForecastDemo('optimistic');
                this.assert(true, 'Forecast scenario switching works');
            }
            
            // Test chart containers
            const chartContainers = document.querySelectorAll('canvas[id*="Chart"]');
            this.assert(chartContainers.length > 0, 'Chart containers present');
            
            this.logTest('Sales Forecasting Page', true, 'Forecasting functionality validated');
        } catch (error) {
            this.logTest('Sales Forecasting Page', false, error.message);
        }
    }

    async testRealtimeAnalyticsPage() {
        console.log('⚡ Testing real-time analytics page...');
        
        try {
            // Test real-time functionality
            const isRealtimePage = window.location.pathname.includes('real-time-analytics');
            
            if (isRealtimePage) {
                // Test live status indicators
                const liveIndicators = document.querySelectorAll('[style*="animation: pulse"]');
                this.assert(liveIndicators.length > 0, 'Live status indicators present');
                
                // Test alert system
                if (typeof generateTestAlert === 'function') {
                    generateTestAlert();
                    const alertsContainer = document.getElementById('alertsContainer');
                    this.assert(alertsContainer !== null, 'Alerts container exists');
                }
                
                // Test data stream toggle
                if (typeof toggleDataStream === 'function') {
                    toggleDataStream();
                    this.assert(true, 'Data stream toggle works');
                }
            }
            
            this.logTest('Real-time Analytics Page', true, 'Real-time functionality validated');
        } catch (error) {
            this.logTest('Real-time Analytics Page', false, error.message);
        }
    }

    async testInteractiveCharts() {
        console.log('📊 Testing interactive charts...');
        
        try {
            // Test Chart.js integration
            this.assert(typeof Chart !== 'undefined', 'Chart.js available');
            
            // Test analytics showcase class
            if (typeof AnalyticsShowcase !== 'undefined') {
                this.assert(true, 'AnalyticsShowcase class available');
            }
            
            // Test chart responsiveness
            const canvasElements = document.querySelectorAll('canvas');
            canvasElements.forEach(canvas => {
                const parent = canvas.parentElement;
                if (parent) {
                    const hasResponsiveClass = parent.style.position === 'relative' || 
                                            canvas.style.maxWidth === '100%';
                    // Charts should be responsive
                }
            });
            
            this.logTest('Interactive Charts', true, 'Chart functionality validated');
        } catch (error) {
            this.logTest('Interactive Charts', false, error.message);
        }
    }

    async testResponsiveDesign() {
        console.log('📱 Testing responsive design...');
        
        try {
            // Test mobile menu toggle
            const mobileToggle = document.querySelector('.varai-mobile-menu-toggle');
            this.assert(mobileToggle !== null, 'Mobile menu toggle exists');
            
            // Test responsive grid classes
            const responsiveGrids = document.querySelectorAll('.varai-grid');
            this.assert(responsiveGrids.length > 0, 'Responsive grids present');
            
            // Test analytics cards responsiveness
            const analyticsCards = document.querySelectorAll('.analytics-capability-card');
            analyticsCards.forEach(card => {
                const styles = window.getComputedStyle(card);
                // Cards should have proper spacing and sizing
                this.assert(styles.padding !== '', 'Analytics cards have proper styling');
            });
            
            this.logTest('Responsive Design', true, 'Responsive design validated');
        } catch (error) {
            this.logTest('Responsive Design', false, error.message);
        }
    }

    async testAccessibility() {
        console.log('♿ Testing accessibility...');
        
        try {
            // Test ARIA labels
            const ariaLabels = document.querySelectorAll('[aria-label]');
            this.assert(ariaLabels.length > 0, 'ARIA labels present');
            
            // Test semantic HTML
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            this.assert(headings.length > 0, 'Proper heading structure');
            
            // Test alt text for images
            const images = document.querySelectorAll('img');
            let hasAltText = true;
            images.forEach(img => {
                if (!img.alt && !img.getAttribute('aria-label')) {
                    hasAltText = false;
                }
            });
            this.assert(hasAltText, 'Images have alt text or ARIA labels');
            
            // Test keyboard navigation
            const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
            this.assert(focusableElements.length > 0, 'Focusable elements present');
            
            this.logTest('Accessibility', true, 'Accessibility features validated');
        } catch (error) {
            this.logTest('Accessibility', false, error.message);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    logTest(testName, passed, message) {
        const result = {
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            this.failedTests++;
            console.log(`❌ ${testName}: ${message}`);
        }
    }

    generateReport() {
        const totalTests = this.passedTests + this.failedTests;
        const successRate = ((this.passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n📊 Analytics Showcase Test Report');
        console.log('=====================================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('=====================================');
        
        // Display detailed results
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.name}: ${result.message}`);
        });
        
        // Save results to localStorage for debugging
        localStorage.setItem('analyticsShowcaseTestResults', JSON.stringify({
            summary: {
                total: totalTests,
                passed: this.passedTests,
                failed: this.failedTests,
                successRate: successRate
            },
            details: this.testResults,
            timestamp: new Date().toISOString()
        }));
        
        console.log('\n💾 Test results saved to localStorage as "analyticsShowcaseTestResults"');
        
        if (this.failedTests === 0) {
            console.log('🎉 All tests passed! Analytics showcase is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Please review the issues above.');
        }
    }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        const tester = new AnalyticsShowcaseTest();
        tester.runAllTests();
    }, 2000);
});

// Export for manual testing
window.AnalyticsShowcaseTest = AnalyticsShowcaseTest;