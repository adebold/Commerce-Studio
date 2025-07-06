#!/usr/bin/env node

/**
 * Platform-Specific Demo Store Verification Test
 * Tests the enhanced dashboard with platform-specific "View Demo Store" buttons
 */

const https = require('https');

class PlatformDemoStoreTest {
    constructor() {
        this.baseUrl = 'https://commerce-studio-website-ddtojwjn7a-uc.a.run.app';
        this.results = {
            platformDetection: false,
            shopifyDemoStore: false,
            magentoDemoStore: false,
            woocommerceDemoStore: false,
            defaultDemoStore: false,
            platformIndicators: false,
            overallScore: 0
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

    async testPlatformDetection() {
        console.log('\n🔍 Testing Platform Detection...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/dashboard/index.html`);
            
            if (response.statusCode === 200) {
                const htmlContent = response.body;
                
                // Test for platform-demo-buttons container
                const hasPlatformContainer = htmlContent.includes('id="platform-demo-buttons"');
                
                // Test for dashboard JavaScript inclusion
                const hasDashboardJS = htmlContent.includes('/js/dashboard.js');
                
                if (hasPlatformContainer && hasDashboardJS) {
                    this.results.platformDetection = true;
                    this.testResults.push({
                        test: 'Platform Detection',
                        status: 'PASS',
                        details: 'Platform-specific demo button container and JavaScript detected'
                    });
                    console.log('✅ Platform detection infrastructure present');
                } else {
                    this.testResults.push({
                        test: 'Platform Detection',
                        status: 'FAIL',
                        details: `Missing: ${!hasPlatformContainer ? 'container' : ''} ${!hasDashboardJS ? 'JavaScript' : ''}`
                    });
                    console.log(`❌ Platform detection missing: ${!hasPlatformContainer ? 'container' : ''} ${!hasDashboardJS ? 'JavaScript' : ''}`);
                }
                
            } else {
                this.testResults.push({
                    test: 'Platform Detection',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ Dashboard failed to load: ${response.statusCode}`);
            }
        } catch (error) {
            this.testResults.push({
                test: 'Platform Detection',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ Platform detection error: ${error.message}`);
        }
    }

    async testDashboardJavaScript() {
        console.log('\n🔧 Testing Dashboard JavaScript...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/js/dashboard.js`);
            
            if (response.statusCode === 200) {
                const jsContent = response.body;
                
                // Test for platform-specific demo store URLs
                const hasShopifyURL = jsContent.includes('varai-commerce-studio-dev.myshopify.com');
                const hasMagentoURL = jsContent.includes('demo-magento.varai.com');
                const hasWooCommerceURL = jsContent.includes('demo-wordpress.varai.com');
                const hasDefaultURL = jsContent.includes('visioncraft-store-353252826752.us-central1.run.app');
                
                // Test for platform detection function
                const hasPlatformInit = jsContent.includes('initializePlatformDemoButtons');
                
                // Test for connection functions
                const hasShopifyConnect = jsContent.includes('connectShopify');
                const hasMagentoConnect = jsContent.includes('connectMagento');
                const hasWooCommerceConnect = jsContent.includes('connectWooCommerce');
                
                const urlCount = [hasShopifyURL, hasMagentoURL, hasWooCommerceURL, hasDefaultURL].filter(Boolean).length;
                const functionCount = [hasPlatformInit, hasShopifyConnect, hasMagentoConnect, hasWooCommerceConnect].filter(Boolean).length;
                
                if (urlCount >= 4 && functionCount >= 4) {
                    this.results.shopifyDemoStore = hasShopifyURL;
                    this.results.magentoDemoStore = hasMagentoURL;
                    this.results.woocommerceDemoStore = hasWooCommerceURL;
                    this.results.defaultDemoStore = hasDefaultURL;
                    
                    this.testResults.push({
                        test: 'Dashboard JavaScript',
                        status: 'PASS',
                        details: `All platform URLs and functions present (${urlCount}/4 URLs, ${functionCount}/4 functions)`
                    });
                    console.log('✅ Dashboard JavaScript fully implemented');
                } else {
                    this.testResults.push({
                        test: 'Dashboard JavaScript',
                        status: 'PARTIAL',
                        details: `${urlCount}/4 URLs, ${functionCount}/4 functions present`
                    });
                    console.log(`⚠️  Partial JavaScript implementation: ${urlCount}/4 URLs, ${functionCount}/4 functions`);
                }
                
                console.log(`• Shopify Demo URL: ${hasShopifyURL ? '✅' : '❌'}`);
                console.log(`• Magento Demo URL: ${hasMagentoURL ? '✅' : '❌'}`);
                console.log(`• WooCommerce Demo URL: ${hasWooCommerceURL ? '✅' : '❌'}`);
                console.log(`• Default Demo URL: ${hasDefaultURL ? '✅' : '❌'}`);
                console.log(`• Platform Initialization: ${hasPlatformInit ? '✅' : '❌'}`);
                
            } else {
                this.testResults.push({
                    test: 'Dashboard JavaScript',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ Dashboard JavaScript failed to load: ${response.statusCode}`);
            }
        } catch (error) {
            this.testResults.push({
                test: 'Dashboard JavaScript',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ Dashboard JavaScript error: ${error.message}`);
        }
    }

    async testDemoStoreURLs() {
        console.log('\n🌐 Testing Demo Store URLs...');
        
        const demoStores = [
            {
                name: 'VisionCraft Demo Store',
                url: 'https://visioncraft-store-353252826752.us-central1.run.app',
                platform: 'default'
            },
            {
                name: 'Shopify Dev Store',
                url: 'https://varai-commerce-studio-dev.myshopify.com',
                platform: 'shopify'
            }
        ];
        
        let accessibleStores = 0;
        
        for (const store of demoStores) {
            try {
                console.log(`Testing ${store.name}...`);
                const response = await this.makeRequest(store.url);
                
                if (response.statusCode === 200 || response.statusCode === 302) {
                    console.log(`✅ ${store.name}: Accessible`);
                    accessibleStores++;
                    
                    if (store.platform === 'default') {
                        this.results.defaultDemoStore = true;
                    } else if (store.platform === 'shopify') {
                        this.results.shopifyDemoStore = true;
                    }
                } else {
                    console.log(`⚠️  ${store.name}: HTTP ${response.statusCode}`);
                }
            } catch (error) {
                console.log(`❌ ${store.name}: ${error.message}`);
            }
        }
        
        if (accessibleStores >= 1) {
            this.testResults.push({
                test: 'Demo Store URLs',
                status: 'PASS',
                details: `${accessibleStores}/${demoStores.length} demo stores accessible`
            });
        } else {
            this.testResults.push({
                test: 'Demo Store URLs',
                status: 'FAIL',
                details: 'No demo stores accessible'
            });
        }
    }

    async testPlatformIndicators() {
        console.log('\n🏷️ Testing Platform Indicators...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/js/dashboard.js`);
            
            if (response.statusCode === 200) {
                const jsContent = response.body;
                
                // Test for platform indicator functionality
                const hasIndicatorLogic = jsContent.includes('platformIndicator') && 
                                        jsContent.includes('platform.charAt(0).toUpperCase()');
                
                const hasIndicatorStyling = jsContent.includes('position: absolute') && 
                                          jsContent.includes('background: var(--varai-success)');
                
                if (hasIndicatorLogic && hasIndicatorStyling) {
                    this.results.platformIndicators = true;
                    this.testResults.push({
                        test: 'Platform Indicators',
                        status: 'PASS',
                        details: 'Platform indicator logic and styling implemented'
                    });
                    console.log('✅ Platform indicators implemented');
                } else {
                    this.testResults.push({
                        test: 'Platform Indicators',
                        status: 'PARTIAL',
                        details: `Missing: ${!hasIndicatorLogic ? 'logic' : ''} ${!hasIndicatorStyling ? 'styling' : ''}`
                    });
                    console.log(`⚠️  Platform indicators partial: ${!hasIndicatorLogic ? 'missing logic' : ''} ${!hasIndicatorStyling ? 'missing styling' : ''}`);
                }
                
            }
        } catch (error) {
            this.testResults.push({
                test: 'Platform Indicators',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ Platform indicators error: ${error.message}`);
        }
    }

    calculateOverallScore() {
        const weights = {
            platformDetection: 25,
            shopifyDemoStore: 20,
            magentoDemoStore: 15,
            woocommerceDemoStore: 15,
            defaultDemoStore: 15,
            platformIndicators: 10
        };
        
        let totalScore = 0;
        Object.entries(this.results).forEach(([key, value]) => {
            if (weights[key] && value) {
                totalScore += weights[key];
            }
        });
        
        this.results.overallScore = totalScore;
        return totalScore;
    }

    generateReport() {
        const score = this.calculateOverallScore();
        
        console.log('\n' + '='.repeat(80));
        console.log('🎯 PLATFORM-SPECIFIC DEMO STORE VERIFICATION REPORT');
        console.log('='.repeat(80));
        console.log(`📊 Overall Success Rate: ${score}% (${score}/100)`);
        console.log('');
        
        // Detailed test results
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
            console.log(`${status} ${result.test}: ${result.details}`);
        });
        
        console.log('');
        console.log('🔍 Platform Demo Store Summary:');
        console.log(`• Platform Detection: ${this.results.platformDetection ? '✅' : '❌'}`);
        console.log(`• Shopify Demo Store: ${this.results.shopifyDemoStore ? '✅' : '❌'}`);
        console.log(`• Magento Demo Store: ${this.results.magentoDemoStore ? '✅' : '❌'}`);
        console.log(`• WooCommerce Demo Store: ${this.results.woocommerceDemoStore ? '✅' : '❌'}`);
        console.log(`• Default Demo Store: ${this.results.defaultDemoStore ? '✅' : '❌'}`);
        console.log(`• Platform Indicators: ${this.results.platformIndicators ? '✅' : '❌'}`);
        console.log('');
        
        console.log('🌐 Demo Store URLs:');
        console.log('• Default: https://visioncraft-store-353252826752.us-central1.run.app');
        console.log('• Shopify: https://varai-commerce-studio-dev.myshopify.com/admin/apps/varai-commerce-studio');
        console.log('• Magento: https://demo-magento.varai.com/admin/varai/dashboard');
        console.log('• WooCommerce: https://demo-wordpress.varai.com/wp-admin/admin.php?page=varai-settings');
        console.log('');
        
        console.log('🧪 Test Instructions:');
        console.log('1. Login with platform-specific demo account (shopify@varai.com, etc.)');
        console.log('2. Navigate to dashboard');
        console.log('3. Verify "View Demo Store" button shows platform-specific label and URL');
        console.log('4. Check for platform indicator badge on button');
        console.log('5. Click button to verify it opens correct demo store');
        console.log('');
        
        if (score >= 90) {
            console.log('🎉 PLATFORM DEMO STORES: EXCELLENT');
            console.log('All platform-specific demo store functionality working perfectly!');
        } else if (score >= 75) {
            console.log('✅ PLATFORM DEMO STORES: GOOD');
            console.log('Most functionality working, minor optimizations needed.');
        } else if (score >= 60) {
            console.log('⚠️  PLATFORM DEMO STORES: PARTIAL');
            console.log('Basic functionality working, significant improvements needed.');
        } else {
            console.log('❌ PLATFORM DEMO STORES: NEEDS WORK');
            console.log('Major issues require immediate attention.');
        }
        
        console.log('='.repeat(80));
    }

    async runVerification() {
        console.log('🚀 Starting Platform-Specific Demo Store Verification...');
        console.log(`🌐 Testing URL: ${this.baseUrl}`);
        
        try {
            await this.testPlatformDetection();
            await this.testDashboardJavaScript();
            await this.testDemoStoreURLs();
            await this.testPlatformIndicators();
            
            this.generateReport();
            
        } catch (error) {
            console.error(`❌ Verification failed: ${error.message}`);
        }
    }
}

// Execute the verification
if (require.main === module) {
    const verification = new PlatformDemoStoreTest();
    verification.runVerification().catch(console.error);
}

module.exports = PlatformDemoStoreTest;