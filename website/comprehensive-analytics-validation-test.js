/**
 * Comprehensive Jest/Puppeteer Test Suite for Analytics Pages Validation
 * Tests all 5 analytics pages on the live production site
 * Validates content, functionality, and design elements
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Production URLs to test
const PRODUCTION_BASE_URL = 'https://varai-website-353252826752.us-central1.run.app';
const ANALYTICS_PAGES = [
    {
        name: 'Analytics Hub',
        url: `${PRODUCTION_BASE_URL}/analytics/`,
        path: '/analytics/',
        expectedElements: [
            '.analytics-showcase-hero',
            '.analytics-capability-card',
            '.live-analytics-dashboard',
            '.analytics-grid'
        ],
        expectedHeadings: ['Predictive Analytics Hub', 'Analytics Capabilities'],
        charts: []
    },
    {
        name: 'Sales Forecasting',
        url: `${PRODUCTION_BASE_URL}/analytics/sales-forecasting.html`,
        path: '/analytics/sales-forecasting.html',
        expectedElements: [
            '.analytics-showcase-hero',
            '.live-analytics-dashboard',
            '.analytics-demo-container'
        ],
        expectedHeadings: ['Sales Forecasting', 'How Sales Forecasting Works'],
        charts: ['seasonalPatternChart', 'confidenceChart', 'multiProductChart', 'modelUpdateChart']
    },
    {
        name: 'Risk Assessment',
        url: `${PRODUCTION_BASE_URL}/analytics/risk-assessment.html`,
        path: '/analytics/risk-assessment.html',
        expectedElements: [
            '.analytics-showcase-hero',
            '.analytics-grid',
            '.analytics-capability-card'
        ],
        expectedHeadings: ['Risk Assessment', 'How Risk Assessment Works'],
        charts: ['operationalRiskChart', 'complianceRiskChart', 'riskDashboardChart']
    },
    {
        name: 'Growth Opportunities',
        url: `${PRODUCTION_BASE_URL}/analytics/growth-opportunities.html`,
        path: '/analytics/growth-opportunities.html',
        expectedElements: [
            '.analytics-showcase-hero',
            '.analytics-grid',
            '.analytics-capability-card'
        ],
        expectedHeadings: ['Growth Opportunities', 'How Growth Opportunities Works'],
        charts: ['clvChart', 'digitalTransformationChart', 'opportunityMatrix']
    },
    {
        name: 'Real-time Analytics',
        url: `${PRODUCTION_BASE_URL}/analytics/real-time-analytics.html`,
        path: '/analytics/real-time-analytics.html',
        expectedElements: [
            '.analytics-showcase-hero',
            '.live-analytics-dashboard',
            '.analytics-grid',
            '#alertsContainer'
        ],
        expectedHeadings: ['Real-time Analytics', 'Live Business Intelligence Dashboard'],
        charts: ['liveSalesChart', 'liveCustomerChart']
    }
];

const SOLUTIONS_PAGE = {
    name: 'Enhanced Solutions',
    url: `${PRODUCTION_BASE_URL}/solutions.html`,
    path: '/solutions.html',
    expectedElements: [
        '.solutions-hero',
        '.solution-card',
        '.varai-card'
    ],
    expectedHeadings: ['Solutions', 'Our Solutions']
};

class ComprehensiveAnalyticsValidator {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            pageTests: [],
            navigationTests: [],
            contentTests: [],
            functionalityTests: [],
            designTests: [],
            performanceTests: [],
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                successRate: 0
            }
        };
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Analytics Pages Validation...');
        console.log(`🌐 Testing Production Site: ${PRODUCTION_BASE_URL}`);
        console.log('=' .repeat(80));

        try {
            await this.setupBrowser();
            
            // Test all analytics pages
            for (const pageConfig of ANALYTICS_PAGES) {
                await this.testAnalyticsPage(pageConfig);
            }
            
            // Test solutions page
            await this.testSolutionsPage();
            
            // Test navigation functionality
            await this.testMainNavigation();
            
            // Generate comprehensive report
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.logTest('Test Suite Execution', false, `Critical error: ${error.message}`);
        } finally {
            await this.cleanup();
        }
    }

    async setupBrowser() {
        console.log('🔧 Setting up browser...');
        
        this.browser = await puppeteer.launch({
            headless: true,
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        
        this.page = await this.browser.newPage();
        
        // Set user agent
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Enable request interception for performance monitoring
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            req.continue();
        });
        
        console.log('✅ Browser setup complete');
    }

    async testAnalyticsPage(pageConfig) {
        console.log(`\n📊 Testing ${pageConfig.name}...`);
        console.log(`🔗 URL: ${pageConfig.url}`);
        
        const pageStartTime = Date.now();
        
        try {
            // Test page accessibility
            const response = await this.page.goto(pageConfig.url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            
            const loadTime = Date.now() - pageStartTime;
            
            // Test HTTP status
            const statusTest = response.status() === 200;
            this.logTest(`${pageConfig.name} - HTTP Status`, statusTest, 
                statusTest ? `Status: ${response.status()}` : `Failed with status: ${response.status()}`);
            
            // Test page load performance
            const performanceTest = loadTime < 5000;
            this.logTest(`${pageConfig.name} - Load Performance`, performanceTest,
                `Load time: ${loadTime}ms ${performanceTest ? '(Good)' : '(Slow)'}`);
            
            if (!statusTest) {
                console.log(`❌ Skipping further tests for ${pageConfig.name} due to HTTP error`);
                return;
            }
            
            // Wait for page to fully load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Test page title
            const title = await this.page.title();
            const titleTest = title.includes('VARAi') && title.length > 0;
            this.logTest(`${pageConfig.name} - Page Title`, titleTest, 
                titleTest ? `Title: "${title}"` : 'Missing or invalid title');
            
            // Test expected elements
            await this.testPageElements(pageConfig);
            
            // Test headings structure
            await this.testPageHeadings(pageConfig);
            
            // Test charts if applicable
            if (pageConfig.charts && pageConfig.charts.length > 0) {
                await this.testCharts(pageConfig);
            }
            
            // Test Apple-inspired design elements
            await this.testAppleDesignElements(pageConfig);
            
            // Test responsive design
            await this.testResponsiveDesign(pageConfig);
            
            // Test accessibility
            await this.testAccessibility(pageConfig);
            
            console.log(`✅ ${pageConfig.name} testing complete`);
            
        } catch (error) {
            console.log(`❌ Error testing ${pageConfig.name}: ${error.message}`);
            this.logTest(`${pageConfig.name} - Page Access`, false, `Error: ${error.message}`);
        }
    }

    async testPageElements(pageConfig) {
        console.log(`  🔍 Testing page elements for ${pageConfig.name}...`);
        
        for (const selector of pageConfig.expectedElements) {
            try {
                const element = await this.page.$(selector);
                const elementExists = element !== null;
                
                if (elementExists) {
                    // Check if element is visible
                    const isVisible = await this.page.evaluate((sel) => {
                        const el = document.querySelector(sel);
                        if (!el) return false;
                        const style = window.getComputedStyle(el);
                        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                    }, selector);
                    
                    this.logTest(`${pageConfig.name} - Element ${selector}`, isVisible,
                        isVisible ? 'Present and visible' : 'Present but not visible');
                } else {
                    this.logTest(`${pageConfig.name} - Element ${selector}`, false, 'Element not found');
                }
            } catch (error) {
                this.logTest(`${pageConfig.name} - Element ${selector}`, false, `Error: ${error.message}`);
            }
        }
    }

    async testPageHeadings(pageConfig) {
        console.log(`  📝 Testing headings for ${pageConfig.name}...`);
        
        try {
            const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', 
                elements => elements.map(el => el.textContent.trim()));
            
            const hasHeadings = headings.length > 0;
            this.logTest(`${pageConfig.name} - Headings Structure`, hasHeadings,
                hasHeadings ? `Found ${headings.length} headings` : 'No headings found');
            
            // Test for expected headings
            for (const expectedHeading of pageConfig.expectedHeadings) {
                const headingExists = headings.some(heading => 
                    heading.toLowerCase().includes(expectedHeading.toLowerCase()));
                this.logTest(`${pageConfig.name} - Heading "${expectedHeading}"`, headingExists,
                    headingExists ? 'Found' : 'Missing');
            }
            
        } catch (error) {
            this.logTest(`${pageConfig.name} - Headings Test`, false, `Error: ${error.message}`);
        }
    }

    async testCharts(pageConfig) {
        console.log(`  📈 Testing charts for ${pageConfig.name}...`);
        
        try {
            // Check if Chart.js is loaded
            const chartJsLoaded = await this.page.evaluate(() => {
                return typeof Chart !== 'undefined';
            });
            
            this.logTest(`${pageConfig.name} - Chart.js Library`, chartJsLoaded,
                chartJsLoaded ? 'Chart.js loaded' : 'Chart.js not loaded');
            
            // Test individual charts
            for (const chartId of pageConfig.charts) {
                const chartExists = await this.page.$(`#${chartId}`);
                const chartTest = chartExists !== null;
                
                if (chartTest) {
                    // Check if chart has content
                    const hasContent = await this.page.evaluate((id) => {
                        const canvas = document.getElementById(id);
                        if (!canvas) return false;
                        
                        // Check if canvas has been drawn on
                        const ctx = canvas.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        
                        // Look for non-transparent pixels
                        for (let i = 3; i < imageData.data.length; i += 4) {
                            if (imageData.data[i] !== 0) return true;
                        }
                        return false;
                    }, chartId);
                    
                    this.logTest(`${pageConfig.name} - Chart ${chartId}`, hasContent,
                        hasContent ? 'Chart rendered with content' : 'Chart container exists but empty');
                } else {
                    this.logTest(`${pageConfig.name} - Chart ${chartId}`, false, 'Chart container not found');
                }
            }
            
        } catch (error) {
            this.logTest(`${pageConfig.name} - Charts Test`, false, `Error: ${error.message}`);
        }
    }

    async testAppleDesignElements(pageConfig) {
        console.log(`  🍎 Testing Apple-inspired design for ${pageConfig.name}...`);
        
        try {
            // Test for Apple-style CSS classes
            const appleClasses = [
                '.varai-card',
                '.varai-btn',
                '.varai-hero',
                '.varai-container'
            ];
            
            let appleElementsFound = 0;
            
            for (const className of appleClasses) {
                const elements = await this.page.$$(className);
                if (elements.length > 0) {
                    appleElementsFound++;
                }
            }
            
            const hasAppleDesign = appleElementsFound >= 2;
            this.logTest(`${pageConfig.name} - Apple Design Elements`, hasAppleDesign,
                `Found ${appleElementsFound}/${appleClasses.length} Apple-style elements`);
            
            // Test for proper typography
            const hasProperFonts = await this.page.evaluate(() => {
                const body = document.body;
                const computedStyle = window.getComputedStyle(body);
                const fontFamily = computedStyle.fontFamily.toLowerCase();
                return fontFamily.includes('inter') || fontFamily.includes('sf pro') || fontFamily.includes('system-ui');
            });
            
            this.logTest(`${pageConfig.name} - Apple Typography`, hasProperFonts,
                hasProperFonts ? 'Apple-style fonts detected' : 'Standard fonts in use');
            
        } catch (error) {
            this.logTest(`${pageConfig.name} - Apple Design Test`, false, `Error: ${error.message}`);
        }
    }

    async testResponsiveDesign(pageConfig) {
        console.log(`  📱 Testing responsive design for ${pageConfig.name}...`);
        
        try {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if mobile menu toggle exists
            const mobileToggle = await this.page.$('.varai-mobile-menu-toggle');
            const hasMobileToggle = mobileToggle !== null;
            
            this.logTest(`${pageConfig.name} - Mobile Menu Toggle`, hasMobileToggle,
                hasMobileToggle ? 'Mobile menu toggle present' : 'Mobile menu toggle missing');
            
            // Test tablet viewport
            await this.page.setViewport({ width: 768, height: 1024 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test desktop viewport
            await this.page.setViewport({ width: 1920, height: 1080 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check for responsive grid classes
            const responsiveElements = await this.page.$$('.varai-grid, .varai-flex, .varai-d-md-flex');
            const hasResponsiveElements = responsiveElements.length > 0;
            
            this.logTest(`${pageConfig.name} - Responsive Elements`, hasResponsiveElements,
                hasResponsiveElements ? `Found ${responsiveElements.length} responsive elements` : 'No responsive elements found');
            
        } catch (error) {
            this.logTest(`${pageConfig.name} - Responsive Design Test`, false, `Error: ${error.message}`);
        }
    }

    async testAccessibility(pageConfig) {
        console.log(`  ♿ Testing accessibility for ${pageConfig.name}...`);
        
        try {
            // Test ARIA labels
            const ariaElements = await this.page.$$('[aria-label], [aria-labelledby], [role]');
            const hasAriaElements = ariaElements.length > 0;
            
            this.logTest(`${pageConfig.name} - ARIA Labels`, hasAriaElements,
                hasAriaElements ? `Found ${ariaElements.length} ARIA elements` : 'No ARIA elements found');
            
            // Test alt text for images
            const images = await this.page.$$('img');
            let imagesWithAlt = 0;
            
            for (const img of images) {
                const alt = await img.evaluate(el => el.alt);
                if (alt && alt.trim().length > 0) {
                    imagesWithAlt++;
                }
            }
            
            const altTextTest = images.length === 0 || imagesWithAlt === images.length;
            this.logTest(`${pageConfig.name} - Image Alt Text`, altTextTest,
                `${imagesWithAlt}/${images.length} images have alt text`);
            
            // Test keyboard navigation
            const focusableElements = await this.page.$$('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const hasKeyboardNav = focusableElements.length > 0;
            
            this.logTest(`${pageConfig.name} - Keyboard Navigation`, hasKeyboardNav,
                hasKeyboardNav ? `Found ${focusableElements.length} focusable elements` : 'No focusable elements found');
            
        } catch (error) {
            this.logTest(`${pageConfig.name} - Accessibility Test`, false, `Error: ${error.message}`);
        }
    }

    async testSolutionsPage() {
        console.log(`\n🔧 Testing Enhanced Solutions Page...`);
        console.log(`🔗 URL: ${SOLUTIONS_PAGE.url}`);
        
        try {
            const response = await this.page.goto(SOLUTIONS_PAGE.url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            
            const statusTest = response.status() === 200;
            this.logTest('Solutions Page - HTTP Status', statusTest,
                statusTest ? `Status: ${response.status()}` : `Failed with status: ${response.status()}`);
            
            if (statusTest) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Test visual elements
                const solutionCards = await this.page.$$('.solution-card, .varai-card');
                const hasCards = solutionCards.length > 0;
                
                this.logTest('Solutions Page - Solution Cards', hasCards,
                    hasCards ? `Found ${solutionCards.length} solution cards` : 'No solution cards found');
                
                // Check for placeholder content
                const hasPlaceholders = await this.page.evaluate(() => {
                    const text = document.body.textContent;
                    return text.includes('Demo') || text.includes('Placeholder') || text.includes('linear-gradient');
                });
                
                this.logTest('Solutions Page - Content Quality', !hasPlaceholders,
                    hasPlaceholders ? 'Contains placeholder content' : 'Real content detected');
            }
            
        } catch (error) {
            this.logTest('Solutions Page - Access Test', false, `Error: ${error.message}`);
        }
    }

    async testMainNavigation() {
        console.log(`\n🧭 Testing Main Navigation...`);
        
        try {
            // Go to analytics hub to test navigation
            await this.page.goto(`${PRODUCTION_BASE_URL}/analytics/`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Test analytics dropdown
            const dropdown = await this.page.$('.varai-nav-dropdown');
            const hasDropdown = dropdown !== null;
            
            this.logTest('Navigation - Analytics Dropdown', hasDropdown,
                hasDropdown ? 'Analytics dropdown found' : 'Analytics dropdown missing');
            
            if (hasDropdown) {
                // Test dropdown menu items
                const dropdownItems = await this.page.$$('.varai-dropdown-item');
                const expectedItems = 6; // Hub + 5 analytics pages
                const hasAllItems = dropdownItems.length >= expectedItems;
                
                this.logTest('Navigation - Dropdown Items', hasAllItems,
                    `Found ${dropdownItems.length}/${expectedItems} dropdown items`);
                
                // Test dropdown links
                for (let i = 0; i < Math.min(dropdownItems.length, 3); i++) {
                    try {
                        const href = await dropdownItems[i].evaluate(el => el.getAttribute('href'));
                        const linkTest = href && href.length > 0;
                        
                        this.logTest(`Navigation - Dropdown Link ${i + 1}`, linkTest,
                            linkTest ? `Link: ${href}` : 'Invalid or missing href');
                    } catch (error) {
                        this.logTest(`Navigation - Dropdown Link ${i + 1}`, false, `Error: ${error.message}`);
                    }
                }
            }
            
        } catch (error) {
            this.logTest('Navigation - Test', false, `Error: ${error.message}`);
        }
    }

    logTest(testName, passed, message) {
        const result = {
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        // Add to appropriate category
        if (testName.includes('HTTP Status') || testName.includes('Page Access')) {
            this.results.pageTests.push(result);
        } else if (testName.includes('Navigation')) {
            this.results.navigationTests.push(result);
        } else if (testName.includes('Element') || testName.includes('Heading') || testName.includes('Content')) {
            this.results.contentTests.push(result);
        } else if (testName.includes('Chart') || testName.includes('Interactive')) {
            this.results.functionalityTests.push(result);
        } else if (testName.includes('Design') || testName.includes('Apple') || testName.includes('Responsive')) {
            this.results.designTests.push(result);
        } else {
            this.results.performanceTests.push(result);
        }
        
        this.results.summary.totalTests++;
        
        if (passed) {
            this.results.summary.passedTests++;
            console.log(`    ✅ ${testName}: ${message}`);
        } else {
            this.results.summary.failedTests++;
            console.log(`    ❌ ${testName}: ${message}`);
        }
    }

    async generateReport() {
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;
        
        this.results.summary.successRate = ((this.results.summary.passedTests / this.results.summary.totalTests) * 100).toFixed(1);
        
        const report = {
            metadata: {
                testSuite: 'Comprehensive Analytics Pages Validation',
                productionUrl: PRODUCTION_BASE_URL,
                timestamp: new Date().toISOString(),
                duration: `${(totalTime / 1000).toFixed(2)}s`,
                browser: 'Puppeteer/Chrome'
            },
            summary: this.results.summary,
            testResults: {
                pageTests: this.results.pageTests,
                navigationTests: this.results.navigationTests,
                contentTests: this.results.contentTests,
                functionalityTests: this.results.functionalityTests,
                designTests: this.results.designTests,
                performanceTests: this.results.performanceTests
            },
            testedPages: ANALYTICS_PAGES.map(page => ({
                name: page.name,
                url: page.url,
                expectedElements: page.expectedElements.length,
                expectedCharts: page.charts.length
            })),
            recommendations: this.generateRecommendations()
        };
        
        // Save detailed report
        const reportPath = path.join(__dirname, 'comprehensive-analytics-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Generate summary report
        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE ANALYTICS VALIDATION REPORT');
        console.log('='.repeat(80));
        console.log(`🌐 Production URL: ${PRODUCTION_BASE_URL}`);
        console.log(`⏱️  Total Duration: ${(totalTime / 1000).toFixed(2)}s`);
        console.log(`📋 Total Tests: ${this.results.summary.totalTests}`);
        console.log(`✅ Passed: ${this.results.summary.passedTests}`);
        console.log(`❌ Failed: ${this.results.summary.failedTests}`);
        console.log(`📈 Success Rate: ${this.results.summary.successRate}%`);
        console.log('');
        
        // Category breakdown
        console.log('📊 TEST CATEGORIES:');
        console.log(`   Page Tests: ${this.results.pageTests.filter(t => t.passed).length}/${this.results.pageTests.length} passed`);
        console.log(`   Navigation Tests: ${this.results.navigationTests.filter(t => t.passed).length}/${this.results.navigationTests.length} passed`);
        console.log(`   Content Tests: ${this.results.contentTests.filter(t => t.passed).length}/${this.results.contentTests.length} passed`);
        console.log(`   Functionality Tests: ${this.results.functionalityTests.filter(t => t.passed).length}/${this.results.functionalityTests.length} passed`);
        console.log(`   Design Tests: ${this.results.designTests.filter(t => t.passed).length}/${this.results.designTests.length} passed`);
        console.log(`   Performance Tests: ${this.results.performanceTests.filter(t => t.passed).length}/${this.results.performanceTests.length} passed`);
        console.log('');
        
        // Pages status
        console.log('📄 PAGES STATUS:');
        ANALYTICS_PAGES.forEach(page => {
            const pageTests = [...this.results.pageTests, ...this.results.contentTests, ...this.results.functionalityTests]
                .filter(test => test.name.includes(page.name));
            const pagePassed = pageTests.filter(test => test.passed).length;
            const pageTotal = pageTests.length;
            const status = pagePassed === pageTotal ? '✅' : pagePassed > pageTotal * 0.7 ? '⚠️' : '❌';
            console.log(`   ${status} ${page.name}: ${pagePassed}/${pageTotal} tests passed`);
        });
        
        console.log('');
        console.log(`📁 Detailed report saved to: ${reportPath}`);
        
        if (this.results.summary.failedTests === 0) {
            console.log('🎉 ALL TESTS PASSED! Analytics pages are fully validated.');
        } else if (this.results.summary.successRate >= 80) {
            console.log('⚠️  Most tests passed with minor issues. Review failed tests above.');
        } else {
            console.log('❌ Significant issues found. Please review and fix failed tests.');
        }
        
        console.log('='.repeat(80));
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.summary.failedTests > 0) {
            recommendations.push('Review and fix failed test cases listed in the detailed report');
        }
        
        const pageFailures = this.results.pageTests.filter(test => !test.passed).length;
        if (pageFailures > 0) {
            recommendations.push('Fix page accessibility and HTTP status issues');
        }
        
        const contentFailures = this.results.contentTests.filter(test => !test.passed).length;
        if (contentFailures > 0) {
            recommendations.push('Add missing page elements and improve content structure');
        }
        
        const functionalityFailures = this.results.functionalityTests.filter(test => !test.passed).length;
        if (functionalityFailures > 0) {
            recommendations.push('Fix chart rendering and interactive functionality');
        }
        
        const designFailures = this.results.designTests.filter(test => !test.passed).length;
        if (designFailures > 0) {
            recommendations.push('Improve Apple-inspired design consistency and responsive behavior');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('All tests passed! Continue monitoring for any regressions.');
        }
        
        return recommendations;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Direct execution support
if (require.main === module) {
    const validator = new ComprehensiveAnalyticsValidator();
    validator.runAllTests().catch(console.error);
}

module.exports = { ComprehensiveAnalyticsValidator };