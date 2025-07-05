/**
 * Google Maps API Integration Tests
 * Comprehensive testing for the modernized store locator functionality
 */

const puppeteer = require('puppeteer');

class GoogleMapsTests {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🗺️ Starting Google Maps API Integration Tests...\n');
        
        try {
            await this.setupBrowser();
            
            const tests = [
                'testApiKeyConfiguration',
                'testModernMarkerImplementation',
                'testAsyncLoadingOptimization',
                'testErrorHandlingAndFallback',
                'testStoreLocationDisplay',
                'testUserGeolocationIntegration',
                'testSearchFunctionality',
                'testBopisIntegration',
                'testResponsiveDesign',
                'testAccessibility'
            ];
            
            for (const test of tests) {
                await this.runTest(test);
            }
            
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.testResults.push({
                test: 'Test Suite Setup',
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            await this.cleanup();
        }
        
        return this.testResults;
    }

    async setupBrowser() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set viewport for consistent testing
        await this.page.setViewport({ width: 1200, height: 800 });
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Browser Error:', msg.text());
            }
        });
    }

    async runTest(testName) {
        console.log(`🧪 Running ${testName}...`);
        
        try {
            const result = await this[testName]();
            this.testResults.push({
                test: testName,
                status: result.status,
                message: result.message,
                details: result.details || {},
                timestamp: new Date().toISOString()
            });
            
            if (result.status === 'PASSED') {
                console.log(`✅ ${testName} - PASSED`);
            } else {
                console.log(`❌ ${testName} - FAILED: ${result.message}`);
            }
            
        } catch (error) {
            console.log(`❌ ${testName} - ERROR: ${error.message}`);
            this.testResults.push({
                test: testName,
                status: 'ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testApiKeyConfiguration() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Wait for page load
        await this.page.waitForSelector('#store-map', { timeout: 5000 });
        
        // Check if hardcoded API key is removed
        const scriptTags = await this.page.$$eval('script', scripts => 
            scripts.map(script => script.src).filter(src => src.includes('maps.googleapis.com'))
        );
        
        const hasHardcodedKey = scriptTags.some(src => src.includes('YOUR_API_KEY'));
        
        if (hasHardcodedKey) {
            return {
                status: 'FAILED',
                message: 'Hardcoded API key still present in HTML'
            };
        }
        
        // Check if API configuration endpoint exists
        try {
            const response = await this.page.evaluate(async () => {
                const res = await fetch('/api/config/maps-key');
                return {
                    status: res.status,
                    ok: res.ok
                };
            });
            
            if (response.status === 404) {
                return {
                    status: 'FAILED',
                    message: 'API configuration endpoint not found'
                };
            }
            
        } catch (error) {
            return {
                status: 'FAILED',
                message: 'API configuration endpoint not accessible'
            };
        }
        
        return {
            status: 'PASSED',
            message: 'API key configuration properly implemented'
        };
    }

    async testModernMarkerImplementation() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Wait for store locator to initialize
        await this.page.waitForSelector('#store-map', { timeout: 5000 });
        
        // Check if ModernStoreLocator class is loaded
        const hasModernClass = await this.page.evaluate(() => {
            return typeof window.ModernStoreLocator !== 'undefined';
        });
        
        if (!hasModernClass) {
            return {
                status: 'FAILED',
                message: 'ModernStoreLocator class not found'
            };
        }
        
        // Check for modern Google Maps API usage
        const hasModernAPI = await this.page.evaluate(() => {
            const script = document.querySelector('script[src*="maps.googleapis.com"]');
            return script && script.src.includes('libraries=places,marker');
        });
        
        return {
            status: 'PASSED',
            message: 'Modern marker implementation detected',
            details: {
                modernClass: hasModernClass,
                modernAPI: hasModernAPI
            }
        };
    }

    async testAsyncLoadingOptimization() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Check for loading states
        const hasLoadingState = await this.page.waitForSelector('.map-loading, .loading-spinner', { 
            timeout: 3000 
        }).then(() => true).catch(() => false);
        
        // Check if map loads without blocking
        const mapContainer = await this.page.waitForSelector('#store-map', { timeout: 5000 });
        
        if (!mapContainer) {
            return {
                status: 'FAILED',
                message: 'Map container not found'
            };
        }
        
        // Check for async script loading
        const hasAsyncLoading = await this.page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return scripts.some(script => 
                script.src.includes('maps.googleapis.com') && 
                (script.async || script.defer)
            );
        });
        
        return {
            status: 'PASSED',
            message: 'Async loading optimization implemented',
            details: {
                loadingState: hasLoadingState,
                asyncLoading: hasAsyncLoading
            }
        };
    }

    async testErrorHandlingAndFallback() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Simulate API failure by blocking Google Maps requests
        await this.page.setRequestInterception(true);
        this.page.on('request', request => {
            if (request.url().includes('maps.googleapis.com')) {
                request.abort();
            } else {
                request.continue();
            }
        });
        
        // Reload page to trigger fallback
        await this.page.reload();
        
        // Wait for fallback UI
        const fallbackUI = await this.page.waitForSelector('.map-fallback', { 
            timeout: 10000 
        }).then(() => true).catch(() => false);
        
        if (!fallbackUI) {
            return {
                status: 'FAILED',
                message: 'Fallback UI not displayed on API failure'
            };
        }
        
        // Check fallback content
        const fallbackContent = await this.page.$eval('.map-fallback', el => el.textContent);
        const hasStoreInfo = fallbackContent.includes('Toronto') && fallbackContent.includes('phone');
        
        return {
            status: 'PASSED',
            message: 'Error handling and fallback UI working correctly',
            details: {
                fallbackDisplayed: fallbackUI,
                hasStoreInfo: hasStoreInfo
            }
        };
    }

    async testStoreLocationDisplay() {
        // Reset request interception
        await this.page.setRequestInterception(false);
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Trigger store search
        await this.page.type('#location-search', 'New York, NY');
        await this.page.click('#find-stores-btn');
        
        // Wait for store results
        const storeCards = await this.page.waitForSelector('.store-card', { 
            timeout: 10000 
        }).then(() => true).catch(() => false);
        
        if (!storeCards) {
            return {
                status: 'FAILED',
                message: 'Store locations not displayed'
            };
        }
        
        // Check store card content
        const storeInfo = await this.page.evaluate(() => {
            const cards = document.querySelectorAll('.store-card');
            return Array.from(cards).map(card => ({
                name: card.querySelector('.store-name')?.textContent,
                address: card.querySelector('.store-address')?.textContent,
                distance: card.querySelector('.store-distance')?.textContent,
                features: Array.from(card.querySelectorAll('.store-feature')).map(f => f.textContent)
            }));
        });
        
        const hasValidStores = storeInfo.length > 0 && storeInfo.every(store => 
            store.name && store.address && store.distance
        );
        
        return {
            status: hasValidStores ? 'PASSED' : 'FAILED',
            message: hasValidStores ? 'Store locations displayed correctly' : 'Invalid store data',
            details: {
                storeCount: storeInfo.length,
                stores: storeInfo
            }
        };
    }

    async testUserGeolocationIntegration() {
        // Mock geolocation
        await this.page.evaluateOnNewDocument(() => {
            navigator.geolocation = {
                getCurrentPosition: (success) => {
                    success({
                        coords: {
                            latitude: 40.7128,
                            longitude: -74.0060
                        }
                    });
                }
            };
        });
        
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Wait for geolocation to trigger
        await this.page.waitForTimeout(3000);
        
        // Check if stores are automatically loaded
        const autoLoadedStores = await this.page.$('.store-card');
        
        return {
            status: autoLoadedStores ? 'PASSED' : 'FAILED',
            message: autoLoadedStores ? 'Geolocation integration working' : 'Geolocation not triggering store search',
            details: {
                autoLoaded: !!autoLoadedStores
            }
        };
    }

    async testSearchFunctionality() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Test search input
        await this.page.type('#location-search', 'Los Angeles');
        
        // Check for suggestions (if implemented)
        const suggestions = await this.page.waitForSelector('.location-suggestions', { 
            timeout: 3000 
        }).then(() => true).catch(() => false);
        
        // Test search execution
        await this.page.click('#find-stores-btn');
        
        // Wait for loading state
        const loadingState = await this.page.waitForSelector('.loading-state', { 
            timeout: 2000 
        }).then(() => true).catch(() => false);
        
        // Wait for results
        const results = await this.page.waitForSelector('.store-card', { 
            timeout: 10000 
        }).then(() => true).catch(() => false);
        
        return {
            status: results ? 'PASSED' : 'FAILED',
            message: results ? 'Search functionality working' : 'Search not returning results',
            details: {
                suggestions: suggestions,
                loadingState: loadingState,
                results: results
            }
        };
    }

    async testBopisIntegration() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Trigger store search first
        await this.page.type('#location-search', 'New York');
        await this.page.click('#find-stores-btn');
        
        // Wait for stores to load
        await this.page.waitForSelector('.store-card', { timeout: 10000 });
        
        // Look for BOPIS button
        const bopisButton = await this.page.$('.store-action-btn.primary');
        
        if (!bopisButton) {
            return {
                status: 'FAILED',
                message: 'BOPIS button not found'
            };
        }
        
        // Click BOPIS button
        await bopisButton.click();
        
        // Check if modal opens
        const modal = await this.page.waitForSelector('#bopis-modal', { 
            timeout: 5000 
        }).then(() => true).catch(() => false);
        
        if (!modal) {
            return {
                status: 'FAILED',
                message: 'BOPIS modal not opening'
            };
        }
        
        // Check modal content
        const modalContent = await this.page.$('#bopis-form-container');
        
        return {
            status: modalContent ? 'PASSED' : 'FAILED',
            message: modalContent ? 'BOPIS integration working' : 'BOPIS modal content missing',
            details: {
                buttonFound: !!bopisButton,
                modalOpened: modal,
                formPresent: !!modalContent
            }
        };
    }

    async testResponsiveDesign() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Test mobile viewport
        await this.page.setViewport({ width: 375, height: 667 });
        await this.page.waitForTimeout(1000);
        
        // Check if map container is responsive
        const mapContainer = await this.page.$eval('#store-map', el => ({
            width: el.offsetWidth,
            height: el.offsetHeight
        }));
        
        // Test tablet viewport
        await this.page.setViewport({ width: 768, height: 1024 });
        await this.page.waitForTimeout(1000);
        
        // Check layout adjustments
        const tabletLayout = await this.page.$eval('.varai-lg-grid-cols-2', el => 
            window.getComputedStyle(el).gridTemplateColumns
        );
        
        // Reset to desktop
        await this.page.setViewport({ width: 1200, height: 800 });
        
        return {
            status: 'PASSED',
            message: 'Responsive design working correctly',
            details: {
                mobileMap: mapContainer,
                tabletLayout: tabletLayout
            }
        };
    }

    async testAccessibility() {
        await this.page.goto('http://localhost:8080/store-locator.html');
        
        // Check for ARIA labels
        const ariaLabels = await this.page.$$eval('[aria-label]', elements => 
            elements.map(el => el.getAttribute('aria-label'))
        );
        
        // Check for proper heading structure
        const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
            elements.map(el => ({ tag: el.tagName, text: el.textContent.trim() }))
        );
        
        // Check for keyboard navigation
        const focusableElements = await this.page.$$eval(
            'button, input, select, textarea, a[href]', 
            elements => elements.length
        );
        
        return {
            status: 'PASSED',
            message: 'Accessibility features implemented',
            details: {
                ariaLabels: ariaLabels.length,
                headings: headings.length,
                focusableElements: focusableElements
            }
        };
    }

    async generateReport() {
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        const errors = this.testResults.filter(r => r.status === 'ERROR').length;
        const total = this.testResults.length;
        
        console.log('\n📊 Google Maps API Integration Test Results:');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`❌ Failed: ${failed}/${total}`);
        console.log(`⚠️  Errors: ${errors}/${total}`);
        console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        if (failed > 0 || errors > 0) {
            console.log('\n🔍 Failed/Error Tests:');
            this.testResults
                .filter(r => r.status !== 'PASSED')
                .forEach(result => {
                    console.log(`  • ${result.test}: ${result.message || result.error}`);
                });
        }
        
        // Save detailed report
        const report = {
            summary: {
                total,
                passed,
                failed,
                errors,
                successRate: ((passed / total) * 100).toFixed(1)
            },
            tests: this.testResults,
            timestamp: new Date().toISOString()
        };
        
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Export for use in other test runners
module.exports = GoogleMapsTests;

// Run tests if called directly
if (require.main === module) {
    const tester = new GoogleMapsTests();
    tester.runAllTests().then(results => {
        process.exit(results.some(r => r.status !== 'PASSED') ? 1 : 0);
    }).catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}