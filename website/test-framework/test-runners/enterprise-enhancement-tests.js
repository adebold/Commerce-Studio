/**
 * Enterprise Enhancement Tests
 * Validates the enhanced hero section, ROI calculator, trust signals, and interactive elements
 */

const puppeteer = require('puppeteer');

class EnterpriseEnhancementTests {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTests() {
        console.log('🚀 Starting Enterprise Enhancement Tests...\n');
        
        try {
            this.browser = await puppeteer.launch({ 
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            
            // Set viewport for consistent testing
            await this.page.setViewport({ width: 1200, height: 800 });
            
            // Navigate to homepage
            await this.page.goto('http://localhost:8080', { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });

            // Run all tests
            await this.testEnhancedHeroSection();
            await this.testSocialProofElements();
            await this.testInteractiveElements();
            await this.testROICalculator();
            await this.testTrustSignals();
            await this.testMetricsSection();
            await this.testModalFunctionality();
            await this.testResponsiveDesign();
            await this.testAccessibility();
            await this.testPerformance();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            this.addResult('Test Suite Execution', false, `Failed to run tests: ${error.message}`);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
            this.printResults();
        }
    }

    async testEnhancedHeroSection() {
        console.log('🎯 Testing Enhanced Hero Section...');
        
        try {
            // Check for enhanced hero class
            const heroSection = await this.page.$('.varai-hero-enhanced');
            this.addResult('Enhanced Hero Section Present', !!heroSection, 'Enhanced hero section should be present');

            // Check for animated title
            const animatedTitle = await this.page.$('.varai-hero-title-animated');
            this.addResult('Animated Title Present', !!animatedTitle, 'Animated title should be present');

            // Check for highlight metric
            const highlightMetric = await this.page.$('.highlight-metric');
            this.addResult('Highlight Metric Present', !!highlightMetric, 'Highlight metric (47%) should be present');

            // Verify metric text content
            if (highlightMetric) {
                const metricText = await this.page.evaluate(el => el.textContent, highlightMetric);
                this.addResult('Metric Value Correct', metricText.includes('47'), `Metric should show 47%, got: ${metricText}`);
            }

            // Check for enhanced CTA group
            const ctaGroup = await this.page.$('.varai-hero-cta-group');
            this.addResult('Enhanced CTA Group Present', !!ctaGroup, 'Enhanced CTA group should be present');

            // Check for trust indicators
            const trustIndicators = await this.page.$('.varai-trust-indicators');
            this.addResult('Trust Indicators Present', !!trustIndicators, 'Trust indicators should be present');

            // Check for lead magnets
            const leadMagnets = await this.page.$('.varai-lead-magnets');
            this.addResult('Lead Magnets Present', !!leadMagnets, 'Lead magnets should be present');

        } catch (error) {
            this.addResult('Enhanced Hero Section Test', false, `Error: ${error.message}`);
        }
    }

    async testSocialProofElements() {
        console.log('👥 Testing Social Proof Elements...');
        
        try {
            // Check for social proof bar
            const socialProofBar = await this.page.$('.varai-social-proof-bar');
            this.addResult('Social Proof Bar Present', !!socialProofBar, 'Social proof bar should be present');

            // Check for customer logos
            const customerLogos = await this.page.$('.customer-logos');
            this.addResult('Customer Logos Present', !!customerLogos, 'Customer logos should be present');

            // Count customer logo elements
            const logoCount = await this.page.$$eval('.customer-logo', logos => logos.length);
            this.addResult('Multiple Customer Logos', logoCount >= 3, `Should have at least 3 customer logos, found: ${logoCount}`);

            // Check for trusted by text
            const trustedText = await this.page.$eval('.varai-social-proof-bar', el => el.textContent);
            this.addResult('Trusted By Text Present', trustedText.includes('500+'), 'Should mention "500+" trusted retailers');

        } catch (error) {
            this.addResult('Social Proof Elements Test', false, `Error: ${error.message}`);
        }
    }

    async testInteractiveElements() {
        console.log('⚡ Testing Interactive Elements...');
        
        try {
            // Check for interactive demo
            const interactiveDemo = await this.page.$('.interactive-product-demo');
            this.addResult('Interactive Demo Present', !!interactiveDemo, 'Interactive product demo should be present');

            // Check for demo container
            const demoContainer = await this.page.$('.demo-container');
            this.addResult('Demo Container Present', !!demoContainer, 'Demo container should be present');

            // Check for dashboard preview
            const dashboardPreview = await this.page.$('.dashboard-preview');
            this.addResult('Dashboard Preview Present', !!dashboardPreview, 'Dashboard preview should be present');

            // Check for demo metrics
            const demoMetrics = await this.page.$('.demo-metrics');
            this.addResult('Demo Metrics Present', !!demoMetrics, 'Demo metrics should be present');

            // Check for animated metric cards
            const metricCards = await this.page.$$('.metric-card.animated');
            this.addResult('Animated Metric Cards Present', metricCards.length >= 2, `Should have at least 2 animated metric cards, found: ${metricCards.length}`);

            // Check for chart bars
            const chartBars = await this.page.$$('.chart-bar');
            this.addResult('Chart Bars Present', chartBars.length >= 5, `Should have at least 5 chart bars, found: ${chartBars.length}`);

        } catch (error) {
            this.addResult('Interactive Elements Test', false, `Error: ${error.message}`);
        }
    }

    async testROICalculator() {
        console.log('📊 Testing ROI Calculator...');
        
        try {
            // Wait for ROI calculator to be injected
            await this.page.waitForTimeout(2000);

            // Check for ROI calculator
            const roiCalculator = await this.page.$('.varai-roi-calculator');
            this.addResult('ROI Calculator Present', !!roiCalculator, 'ROI calculator should be present');

            if (roiCalculator) {
                // Check for input fields
                const visitorsInput = await this.page.$('#visitors');
                const conversionInput = await this.page.$('#conversion');
                const aovInput = await this.page.$('#aov');
                
                this.addResult('Visitors Input Present', !!visitorsInput, 'Visitors input should be present');
                this.addResult('Conversion Input Present', !!conversionInput, 'Conversion rate input should be present');
                this.addResult('AOV Input Present', !!aovInput, 'AOV input should be present');

                // Check for results display
                const revenueIncrease = await this.page.$('#revenue-increase');
                const annualROI = await this.page.$('#annual-roi');
                
                this.addResult('Revenue Increase Display Present', !!revenueIncrease, 'Revenue increase display should be present');
                this.addResult('Annual ROI Display Present', !!annualROI, 'Annual ROI display should be present');

                // Test calculator functionality
                if (visitorsInput && conversionInput && aovInput) {
                    await this.page.evaluate(() => {
                        document.getElementById('visitors').value = '20000';
                        document.getElementById('conversion').value = '3.0';
                        document.getElementById('aov').value = '200';
                        document.getElementById('visitors').dispatchEvent(new Event('input'));
                    });

                    await this.page.waitForTimeout(500);

                    const calculatedRevenue = await this.page.$eval('#revenue-increase', el => el.textContent);
                    this.addResult('Calculator Functionality', calculatedRevenue !== '$0', `Calculator should update values, got: ${calculatedRevenue}`);
                }
            }

        } catch (error) {
            this.addResult('ROI Calculator Test', false, `Error: ${error.message}`);
        }
    }

    async testTrustSignals() {
        console.log('🛡️ Testing Trust Signals...');
        
        try {
            // Wait for trust section to be injected
            await this.page.waitForTimeout(2000);

            // Check for trust section
            const trustSection = await this.page.$('.varai-trust-section');
            this.addResult('Trust Section Present', !!trustSection, 'Trust signals section should be present');

            if (trustSection) {
                // Check for security certifications
                const securityCerts = await this.page.$('.security-certifications');
                this.addResult('Security Certifications Present', !!securityCerts, 'Security certifications should be present');

                // Check for customer reviews
                const customerReviews = await this.page.$('.customer-reviews');
                this.addResult('Customer Reviews Present', !!customerReviews, 'Customer reviews should be present');

                // Check for industry recognition
                const industryRecognition = await this.page.$('.industry-recognition');
                this.addResult('Industry Recognition Present', !!industryRecognition, 'Industry recognition should be present');

                // Check for rating display
                const rating = await this.page.$('.rating');
                if (rating) {
                    const ratingText = await this.page.evaluate(el => el.textContent, rating);
                    this.addResult('Rating Display Correct', ratingText.includes('4.9'), `Rating should show 4.9, got: ${ratingText}`);
                }

                // Check for stars
                const stars = await this.page.$('.stars');
                this.addResult('Star Rating Present', !!stars, 'Star rating should be present');
            }

        } catch (error) {
            this.addResult('Trust Signals Test', false, `Error: ${error.message}`);
        }
    }

    async testMetricsSection() {
        console.log('📈 Testing Metrics Section...');
        
        try {
            // Wait for metrics section to be injected
            await this.page.waitForTimeout(2000);

            // Check for value proposition section
            const valueProposition = await this.page.$('.varai-value-proposition');
            this.addResult('Value Proposition Section Present', !!valueProposition, 'Value proposition section should be present');

            if (valueProposition) {
                // Check for metrics grid
                const metricsGrid = await this.page.$('.varai-metrics-grid');
                this.addResult('Metrics Grid Present', !!metricsGrid, 'Metrics grid should be present');

                // Count metric cards
                const metricCards = await this.page.$$('.varai-metrics-grid .metric-card');
                this.addResult('Four Metric Cards Present', metricCards.length === 4, `Should have 4 metric cards, found: ${metricCards.length}`);

                // Check for metric numbers with data-target
                const metricNumbers = await this.page.$$('.metric-number[data-target]');
                this.addResult('Metric Numbers with Targets', metricNumbers.length >= 4, `Should have at least 4 metric numbers with targets, found: ${metricNumbers.length}`);
            }

        } catch (error) {
            this.addResult('Metrics Section Test', false, `Error: ${error.message}`);
        }
    }

    async testModalFunctionality() {
        console.log('🔲 Testing Modal Functionality...');
        
        try {
            // Wait for JavaScript to load
            await this.page.waitForTimeout(2000);

            // Check for modal container
            const modalContainer = await this.page.$('.modal-container');
            this.addResult('Modal Container Present', !!modalContainer, 'Modal container should be present');

            // Test trial modal trigger
            const trialButton = await this.page.$('button[onclick*="openTrialModal"]');
            if (trialButton) {
                await trialButton.click();
                await this.page.waitForTimeout(500);

                const modalVisible = await this.page.evaluate(() => {
                    const modal = document.querySelector('.modal-container');
                    return modal && window.getComputedStyle(modal).display !== 'none';
                });

                this.addResult('Trial Modal Opens', modalVisible, 'Trial modal should open when button is clicked');

                // Close modal
                const closeButton = await this.page.$('.modal-close');
                if (closeButton) {
                    await closeButton.click();
                    await this.page.waitForTimeout(500);
                }
            }

        } catch (error) {
            this.addResult('Modal Functionality Test', false, `Error: ${error.message}`);
        }
    }

    async testResponsiveDesign() {
        console.log('📱 Testing Responsive Design...');
        
        try {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.waitForTimeout(1000);

            // Check if hero title adjusts for mobile
            const heroTitle = await this.page.$('.varai-hero-title-animated');
            if (heroTitle) {
                const fontSize = await this.page.evaluate(el => {
                    return window.getComputedStyle(el).fontSize;
                }, heroTitle);
                
                this.addResult('Mobile Hero Title Responsive', fontSize !== '3.5rem', `Hero title should adjust for mobile, font-size: ${fontSize}`);
            }

            // Check if grid becomes single column
            const heroGrid = await this.page.$('.varai-grid-cols-2');
            if (heroGrid) {
                const gridColumns = await this.page.evaluate(el => {
                    return window.getComputedStyle(el).gridTemplateColumns;
                }, heroGrid);
                
                this.addResult('Mobile Grid Single Column', gridColumns === '1fr' || gridColumns.includes('1fr'), `Grid should be single column on mobile, got: ${gridColumns}`);
            }

            // Reset to desktop viewport
            await this.page.setViewport({ width: 1200, height: 800 });
            await this.page.waitForTimeout(1000);

        } catch (error) {
            this.addResult('Responsive Design Test', false, `Error: ${error.message}`);
        }
    }

    async testAccessibility() {
        console.log('♿ Testing Accessibility...');
        
        try {
            // Check for proper heading structure
            const h1Elements = await this.page.$$('h1');
            this.addResult('Single H1 Element', h1Elements.length === 1, `Should have exactly one H1 element, found: ${h1Elements.length}`);

            // Check for alt text on images
            const images = await this.page.$$('img');
            let imagesWithAlt = 0;
            for (const img of images) {
                const alt = await this.page.evaluate(el => el.getAttribute('alt'), img);
                if (alt) imagesWithAlt++;
            }
            
            this.addResult('Images Have Alt Text', imagesWithAlt === images.length, `${imagesWithAlt}/${images.length} images have alt text`);

            // Check for button accessibility
            const buttons = await this.page.$$('button');
            let accessibleButtons = 0;
            for (const button of buttons) {
                const text = await this.page.evaluate(el => el.textContent.trim(), button);
                const ariaLabel = await this.page.evaluate(el => el.getAttribute('aria-label'), button);
                if (text || ariaLabel) accessibleButtons++;
            }
            
            this.addResult('Buttons Have Accessible Text', accessibleButtons === buttons.length, `${accessibleButtons}/${buttons.length} buttons have accessible text`);

            // Check for form labels
            const inputs = await this.page.$$('input');
            let labeledInputs = 0;
            for (const input of inputs) {
                const id = await this.page.evaluate(el => el.id, input);
                if (id) {
                    const label = await this.page.$(`label[for="${id}"]`);
                    if (label) labeledInputs++;
                }
            }
            
            this.addResult('Form Inputs Have Labels', labeledInputs === inputs.length, `${labeledInputs}/${inputs.length} inputs have associated labels`);

        } catch (error) {
            this.addResult('Accessibility Test', false, `Error: ${error.message}`);
        }
    }

    async testPerformance() {
        console.log('⚡ Testing Performance...');
        
        try {
            // Measure page load time
            const startTime = Date.now();
            await this.page.reload({ waitUntil: 'networkidle0' });
            const loadTime = Date.now() - startTime;
            
            this.addResult('Page Load Time', loadTime < 5000, `Page should load in under 5 seconds, took: ${loadTime}ms`);

            // Check for CSS and JS files
            const cssFiles = await this.page.$$eval('link[rel="stylesheet"]', links => links.length);
            const jsFiles = await this.page.$$eval('script[src]', scripts => scripts.length);
            
            this.addResult('CSS Files Loaded', cssFiles >= 2, `Should have at least 2 CSS files, found: ${cssFiles}`);
            this.addResult('JS Files Loaded', jsFiles >= 2, `Should have at least 2 JS files, found: ${jsFiles}`);

            // Check for console errors
            const logs = [];
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    logs.push(msg.text());
                }
            });

            await this.page.waitForTimeout(2000);
            this.addResult('No Console Errors', logs.length === 0, `Should have no console errors, found: ${logs.length}`);

        } catch (error) {
            this.addResult('Performance Test', false, `Error: ${error.message}`);
        }
    }

    addResult(testName, passed, message) {
        this.results.tests.push({
            name: testName,
            passed,
            message
        });
        
        if (passed) {
            this.results.passed++;
            console.log(`  ✅ ${testName}`);
        } else {
            this.results.failed++;
            console.log(`  ❌ ${testName}: ${message}`);
        }
    }

    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 ENTERPRISE ENHANCEMENT TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📊 Total: ${this.results.tests.length}`);
        console.log(`🎯 Success Rate: ${((this.results.passed / this.results.tests.length) * 100).toFixed(1)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.message}`);
                });
        }
        
        console.log('\n' + '='.repeat(60));
        
        // Return results for potential CI integration
        return {
            success: this.results.failed === 0,
            passed: this.results.passed,
            failed: this.results.failed,
            total: this.results.tests.length,
            successRate: (this.results.passed / this.results.tests.length) * 100
        };
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnterpriseEnhancementTests;
}

// Run tests if called directly
if (require.main === module) {
    const tester = new EnterpriseEnhancementTests();
    tester.runTests().then(results => {
        process.exit(results.success ? 0 : 1);
    });
}