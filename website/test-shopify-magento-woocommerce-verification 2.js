#!/usr/bin/env node

/**
 * Shopify, Magento & WooCommerce UI Enhancement Verification Test
 * Comprehensive testing for all three e-commerce platform integrations
 */

const https = require('https');

class EcommercePlatformVerification {
    constructor() {
        this.baseUrl = 'https://commerce-studio-website-ddtojwjn7a-uc.a.run.app';
        this.results = {
            demoLoginEnhancements: false,
            shopifyIntegration: false,
            magentoIntegration: false,
            woocommerceIntegration: false,
            platformNavigation: false,
            modalFunctionality: false,
            responsiveDesign: false,
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

    async testDemoLoginEnhancements() {
        console.log('\n🔐 Testing Demo Login Enhancements...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/demo-login.html`);
            
            if (response.statusCode === 200) {
                const htmlContent = response.body;
                
                // Test for Shopify demo account
                const hasShopifyDemo = htmlContent.includes('Shopify Merchant') && 
                                     htmlContent.includes('shopify@varai.com');
                
                // Test for Magento demo account
                const hasMagentoDemo = htmlContent.includes('Magento Merchant') && 
                                     htmlContent.includes('magento@varai.com');
                
                // Test for WooCommerce demo account
                const hasWooCommerceDemo = htmlContent.includes('WooCommerce Owner') && 
                                         htmlContent.includes('woocommerce@varai.com');
                
                // Test for platform-specific styling
                const hasShopifyBorder = htmlContent.includes('border: 2px solid #96bf48');
                const hasMagentoBorder = htmlContent.includes('border: 2px solid #ec6737');
                const hasWooCommerceBorder = htmlContent.includes('border: 2px solid #96588a');
                
                const platformCount = [hasShopifyDemo, hasMagentoDemo, hasWooCommerceDemo].filter(Boolean).length;
                const stylingCount = [hasShopifyBorder, hasMagentoBorder, hasWooCommerceBorder].filter(Boolean).length;
                
                if (platformCount >= 3 && stylingCount >= 3) {
                    this.results.demoLoginEnhancements = true;
                    this.testResults.push({
                        test: 'Demo Login Enhancements',
                        status: 'PASS',
                        details: `All 3 platforms present with styling (${platformCount}/3 platforms, ${stylingCount}/3 styles)`
                    });
                    console.log('✅ All platform demo accounts present with proper styling');
                } else {
                    this.testResults.push({
                        test: 'Demo Login Enhancements',
                        status: 'PARTIAL',
                        details: `${platformCount}/3 platforms, ${stylingCount}/3 styles`
                    });
                    console.log(`⚠️  Partial implementation: ${platformCount}/3 platforms, ${stylingCount}/3 styles`);
                }
                
                // Test individual platforms
                this.results.shopifyIntegration = hasShopifyDemo;
                this.results.magentoIntegration = hasMagentoDemo;
                this.results.woocommerceIntegration = hasWooCommerceDemo;
                
                console.log(`• Shopify Demo: ${hasShopifyDemo ? '✅' : '❌'}`);
                console.log(`• Magento Demo: ${hasMagentoDemo ? '✅' : '❌'}`);
                console.log(`• WooCommerce Demo: ${hasWooCommerceDemo ? '✅' : '❌'}`);
                
            } else {
                this.testResults.push({
                    test: 'Demo Login Enhancements',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ Demo login page failed to load: ${response.statusCode}`);
            }
        } catch (error) {
            this.testResults.push({
                test: 'Demo Login Enhancements',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ Demo login test error: ${error.message}`);
        }
    }

    async testJavaScriptCredentials() {
        console.log('\n🔧 Testing JavaScript Credentials...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/demo-login.html`);
            
            if (response.statusCode === 200) {
                const htmlContent = response.body;
                
                // Test for JavaScript credentials
                const hasShopifyCredentials = htmlContent.includes("'shopify-merchant'") && 
                                            htmlContent.includes('Shopify123!');
                
                const hasMagentoCredentials = htmlContent.includes("'magento-merchant'") && 
                                           htmlContent.includes('Magento123!');
                
                const hasWooCommerceCredentials = htmlContent.includes("'woocommerce-merchant'") && 
                                                htmlContent.includes('WooCommerce123!');
                
                // Test for platform-specific features
                const hasShopifyFeatures = htmlContent.includes('Vertex AI Assistant');
                const hasMagentoFeatures = htmlContent.includes('Multi-store Support');
                const hasWooCommerceFeatures = htmlContent.includes('WordPress Plugin');
                
                const credentialCount = [hasShopifyCredentials, hasMagentoCredentials, hasWooCommerceCredentials].filter(Boolean).length;
                const featureCount = [hasShopifyFeatures, hasMagentoFeatures, hasWooCommerceFeatures].filter(Boolean).length;
                
                if (credentialCount >= 3 && featureCount >= 3) {
                    this.results.modalFunctionality = true;
                    this.testResults.push({
                        test: 'JavaScript Credentials',
                        status: 'PASS',
                        details: `All credentials and features present (${credentialCount}/3 credentials, ${featureCount}/3 features)`
                    });
                    console.log('✅ All platform credentials and features implemented');
                } else {
                    this.testResults.push({
                        test: 'JavaScript Credentials',
                        status: 'PARTIAL',
                        details: `${credentialCount}/3 credentials, ${featureCount}/3 features`
                    });
                    console.log(`⚠️  Partial credentials: ${credentialCount}/3 credentials, ${featureCount}/3 features`);
                }
                
                console.log(`• Shopify Credentials: ${hasShopifyCredentials ? '✅' : '❌'}`);
                console.log(`• Magento Credentials: ${hasMagentoCredentials ? '✅' : '❌'}`);
                console.log(`• WooCommerce Credentials: ${hasWooCommerceCredentials ? '✅' : '❌'}`);
                
            } else {
                this.testResults.push({
                    test: 'JavaScript Credentials',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ JavaScript credentials test failed: ${response.statusCode}`);
            }
        } catch (error) {
            this.testResults.push({
                test: 'JavaScript Credentials',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ JavaScript credentials error: ${error.message}`);
        }
    }

    async testDashboardIntegration() {
        console.log('\n📊 Testing Dashboard Integration...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/dashboard/index.html`);
            
            if (response.statusCode === 200) {
                const htmlContent = response.body;
                
                // Test for store connections section
                const hasStoreConnections = htmlContent.includes('Store Connections') || 
                                          htmlContent.includes('store-connections');
                
                // Test for platform cards
                const hasShopifyCard = htmlContent.includes('Shopify') && 
                                     htmlContent.includes('Connect Store');
                
                const hasMagentoCard = htmlContent.includes('Magento') && 
                                     htmlContent.includes('Connect Store');
                
                const hasWooCommerceCard = htmlContent.includes('WooCommerce') || 
                                         htmlContent.includes('WordPress');
                
                const dashboardFeatures = [hasStoreConnections, hasShopifyCard, hasMagentoCard, hasWooCommerceCard].filter(Boolean).length;
                
                if (dashboardFeatures >= 3) {
                    this.results.platformNavigation = true;
                    this.testResults.push({
                        test: 'Dashboard Integration',
                        status: 'PASS',
                        details: `${dashboardFeatures}/4 dashboard features present`
                    });
                    console.log('✅ Dashboard integration features present');
                } else {
                    this.testResults.push({
                        test: 'Dashboard Integration',
                        status: 'PARTIAL',
                        details: `${dashboardFeatures}/4 dashboard features present`
                    });
                    console.log(`⚠️  Partial dashboard integration: ${dashboardFeatures}/4 features`);
                }
                
                console.log(`• Store Connections Section: ${hasStoreConnections ? '✅' : '❌'}`);
                console.log(`• Shopify Card: ${hasShopifyCard ? '✅' : '❌'}`);
                console.log(`• Magento Card: ${hasMagentoCard ? '✅' : '❌'}`);
                console.log(`• WooCommerce Card: ${hasWooCommerceCard ? '✅' : '❌'}`);
                
            } else {
                this.testResults.push({
                    test: 'Dashboard Integration',
                    status: 'FAIL',
                    details: `HTTP ${response.statusCode}`
                });
                console.log(`❌ Dashboard integration test failed: ${response.statusCode}`);
            }
        } catch (error) {
            this.testResults.push({
                test: 'Dashboard Integration',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ Dashboard integration error: ${error.message}`);
        }
    }

    async testWooCommerceSpecifics() {
        console.log('\n🛍️ Testing WooCommerce-Specific Features...');
        
        try {
            // Test WooCommerce plugin files
            const pluginTests = [
                '/apps/woocommerce/varai.php',
                '/apps/woocommerce/includes/class-varai-api.php',
                '/apps/woocommerce/includes/class-varai-analytics.php'
            ];
            
            let pluginFilesFound = 0;
            
            for (const pluginPath of pluginTests) {
                try {
                    const response = await this.makeRequest(`${this.baseUrl}${pluginPath}`);
                    if (response.statusCode === 200 || response.statusCode === 403) {
                        pluginFilesFound++;
                    }
                } catch (error) {
                    // File might not be publicly accessible, which is expected
                }
            }
            
            // Test demo login for WooCommerce-specific features
            const demoResponse = await this.makeRequest(`${this.baseUrl}/demo-login.html`);
            const hasWordPressFeatures = demoResponse.body.includes('WordPress Plugin') && 
                                       demoResponse.body.includes('Shortcode Integration');
            
            const wooCommerceScore = (pluginFilesFound > 0 ? 50 : 0) + (hasWordPressFeatures ? 50 : 0);
            
            if (wooCommerceScore >= 50) {
                this.testResults.push({
                    test: 'WooCommerce Specifics',
                    status: 'PASS',
                    details: `WordPress features detected, plugin architecture present`
                });
                console.log('✅ WooCommerce-specific features implemented');
            } else {
                this.testResults.push({
                    test: 'WooCommerce Specifics',
                    status: 'PARTIAL',
                    details: `Limited WooCommerce features detected`
                });
                console.log('⚠️  Limited WooCommerce-specific features');
            }
            
            console.log(`• WordPress Features: ${hasWordPressFeatures ? '✅' : '❌'}`);
            console.log(`• Plugin Files: ${pluginFilesFound > 0 ? '✅' : '❌'}`);
            
        } catch (error) {
            this.testResults.push({
                test: 'WooCommerce Specifics',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ WooCommerce specifics error: ${error.message}`);
        }
    }

    async testResponsiveDesign() {
        console.log('\n📱 Testing Responsive Design...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/demo-login.html`);
            
            if (response.statusCode === 200) {
                const htmlContent = response.body;
                
                // Test for responsive CSS
                const hasResponsiveGrid = htmlContent.includes('grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))');
                const hasMobileStyles = htmlContent.includes('@media (max-width: 768px)');
                const hasFlexboxLayout = htmlContent.includes('display: flex') || htmlContent.includes('display: grid');
                
                const responsiveFeatures = [hasResponsiveGrid, hasMobileStyles, hasFlexboxLayout].filter(Boolean).length;
                
                if (responsiveFeatures >= 2) {
                    this.results.responsiveDesign = true;
                    this.testResults.push({
                        test: 'Responsive Design',
                        status: 'PASS',
                        details: `${responsiveFeatures}/3 responsive features present`
                    });
                    console.log('✅ Responsive design implemented');
                } else {
                    this.testResults.push({
                        test: 'Responsive Design',
                        status: 'PARTIAL',
                        details: `${responsiveFeatures}/3 responsive features present`
                    });
                    console.log(`⚠️  Limited responsive design: ${responsiveFeatures}/3 features`);
                }
                
                console.log(`• Responsive Grid: ${hasResponsiveGrid ? '✅' : '❌'}`);
                console.log(`• Mobile Styles: ${hasMobileStyles ? '✅' : '❌'}`);
                console.log(`• Flexbox Layout: ${hasFlexboxLayout ? '✅' : '❌'}`);
                
            }
        } catch (error) {
            this.testResults.push({
                test: 'Responsive Design',
                status: 'FAIL',
                details: error.message
            });
            console.log(`❌ Responsive design error: ${error.message}`);
        }
    }

    calculateOverallScore() {
        const weights = {
            demoLoginEnhancements: 25,
            shopifyIntegration: 15,
            magentoIntegration: 15,
            woocommerceIntegration: 15,
            platformNavigation: 15,
            modalFunctionality: 10,
            responsiveDesign: 5
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
        console.log('🎯 SHOPIFY, MAGENTO & WOOCOMMERCE VERIFICATION REPORT');
        console.log('='.repeat(80));
        console.log(`📊 Overall Success Rate: ${score}% (${score}/100)`);
        console.log('');
        
        // Detailed test results
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
            console.log(`${status} ${result.test}: ${result.details}`);
        });
        
        console.log('');
        console.log('🔍 Platform Integration Summary:');
        console.log(`• Demo Login Enhancements: ${this.results.demoLoginEnhancements ? '✅' : '❌'}`);
        console.log(`• Shopify Integration: ${this.results.shopifyIntegration ? '✅' : '❌'}`);
        console.log(`• Magento Integration: ${this.results.magentoIntegration ? '✅' : '❌'}`);
        console.log(`• WooCommerce Integration: ${this.results.woocommerceIntegration ? '✅' : '❌'}`);
        console.log(`• Platform Navigation: ${this.results.platformNavigation ? '✅' : '❌'}`);
        console.log(`• Modal Functionality: ${this.results.modalFunctionality ? '✅' : '❌'}`);
        console.log(`• Responsive Design: ${this.results.responsiveDesign ? '✅' : '❌'}`);
        console.log('');
        
        console.log('📈 Market Coverage Analysis:');
        console.log('• Shopify: ~10% of e-commerce market');
        console.log('• Magento: ~7% of e-commerce market');
        console.log('• WooCommerce: ~43% of e-commerce market');
        console.log('• Total Coverage: ~60% of global e-commerce market');
        console.log('');
        
        if (score >= 90) {
            console.log('🎉 TRIPLE PLATFORM INTEGRATION: EXCELLENT');
            console.log('All major e-commerce platforms fully integrated!');
        } else if (score >= 75) {
            console.log('✅ TRIPLE PLATFORM INTEGRATION: GOOD');
            console.log('Most features working, minor optimizations needed.');
        } else if (score >= 60) {
            console.log('⚠️  TRIPLE PLATFORM INTEGRATION: PARTIAL');
            console.log('Basic integration working, significant improvements needed.');
        } else {
            console.log('❌ TRIPLE PLATFORM INTEGRATION: NEEDS WORK');
            console.log('Major issues require immediate attention.');
        }
        
        console.log('');
        console.log('🌐 Live Demo URLs:');
        console.log(`• Demo Login: ${this.baseUrl}/demo-login.html`);
        console.log(`• Dashboard: ${this.baseUrl}/dashboard/index.html`);
        console.log('');
        console.log('📝 Test Credentials:');
        console.log('• Shopify: shopify@varai.com / Shopify123!');
        console.log('• Magento: magento@varai.com / Magento123!');
        console.log('• WooCommerce: woocommerce@varai.com / WooCommerce123!');
        console.log('='.repeat(80));
    }

    async runVerification() {
        console.log('🚀 Starting Shopify, Magento & WooCommerce Verification...');
        console.log(`🌐 Testing URL: ${this.baseUrl}`);
        
        try {
            await this.testDemoLoginEnhancements();
            await this.testJavaScriptCredentials();
            await this.testDashboardIntegration();
            await this.testWooCommerceSpecifics();
            await this.testResponsiveDesign();
            
            this.generateReport();
            
        } catch (error) {
            console.error(`❌ Verification failed: ${error.message}`);
        }
    }
}

// Execute the verification
if (require.main === module) {
    const verification = new EcommercePlatformVerification();
    verification.runVerification().catch(console.error);
}

module.exports = EcommercePlatformVerification;