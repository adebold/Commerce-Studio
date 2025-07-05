#!/usr/bin/env node

/**
 * 🧪 Live Store Test Runner
 * Complete TDD test suite for Shopify & WooCommerce live customer data
 * 
 * Usage: node tests/run-live-store-tests.js
 */

const LiveStoreConfig = require('./live-store-config');
const ShopifyLiveIntegration = require('./shopify-live-integration');
const WooCommerceLiveIntegration = require('./woocommerce-live-integration');
const { performance } = require('perf_hooks');

class LiveStoreTestRunner {
    constructor() {
        this.config = new LiveStoreConfig();
        this.shopify = new ShopifyLiveIntegration();
        this.woocommerce = new WooCommerceLiveIntegration();
        this.results = {
            overall: {
                score: 0,
                status: 'PENDING',
                startTime: null,
                endTime: null,
                duration: 0
            },
            shopify: {
                score: 0,
                status: 'PENDING',
                tests: []
            },
            woocommerce: {
                score: 0,
                status: 'PENDING',
                tests: []
            },
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                coverage: {
                    storeConnection: 0,
                    dataSync: 0,
                    performance: 0,
                    integration: 0
                }
            }
        };
    }

    async runAllTests() {
        console.log('🧪 VARAi Commerce Studio - Live Store Integration Test Suite');
        console.log('=' .repeat(80));
        console.log('📊 Testing with REAL customer data from live stores');
        console.log('🛍️  Shopify + 🛒 WooCommerce Integration Validation');
        console.log('=' .repeat(80));

        this.results.overall.startTime = new Date().toISOString();
        const startTime = performance.now();

        // Check configuration
        this.validateConfiguration();

        try {
            // Run Shopify tests
            console.log('\n🛍️ SHOPIFY INTEGRATION TESTS');
            console.log('-'.repeat(50));
            const shopifyResults = await this.shopify.runAllShopifyTests();
            this.results.shopify = {
                score: shopifyResults.score,
                status: shopifyResults.score >= 80 ? 'PASS' : 'FAIL',
                tests: shopifyResults.results,
                passedTests: shopifyResults.passedTests,
                totalTests: shopifyResults.totalTests
            };

            // Run WooCommerce tests
            console.log('\n🛒 WOOCOMMERCE INTEGRATION TESTS');
            console.log('-'.repeat(50));
            const woocommerceResults = await this.woocommerce.runAllWooCommerceTests();
            this.results.woocommerce = {
                score: woocommerceResults.score,
                status: woocommerceResults.score >= 80 ? 'PASS' : 'FAIL',
                tests: woocommerceResults.results,
                passedTests: woocommerceResults.passedTests,
                totalTests: woocommerceResults.totalTests
            };

            // Calculate overall results
            this.calculateOverallResults();

        } catch (error) {
            console.error('\n❌ Test suite failed:', error.message);
            this.results.overall.status = 'ERROR';
        }

        const endTime = performance.now();
        this.results.overall.endTime = new Date().toISOString();
        this.results.overall.duration = ((endTime - startTime) / 1000).toFixed(2);

        // Generate comprehensive report
        this.generateComprehensiveReport();
        
        // Return results for programmatic use
        return this.results;
    }

    validateConfiguration() {
        console.log('\n🔧 Configuration Validation');
        console.log('-'.repeat(30));

        const shopifyConfigured = this.config.getShopifyConfig().accessToken;
        const woocommerceConfigured = this.config.getWooCommerceConfig().consumerKey;

        console.log(`Shopify Configuration: ${shopifyConfigured ? '✅ Ready' : '❌ Missing credentials'}`);
        console.log(`WooCommerce Configuration: ${woocommerceConfigured ? '✅ Ready' : '❌ Missing credentials'}`);

        if (!shopifyConfigured && !woocommerceConfigured) {
            console.log('\n⚠️  No live store credentials configured!');
            console.log('📝 Please set up environment variables for testing:');
            console.log('   - SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN');
            console.log('   - WOOCOMMERCE_STORE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET');
            console.log('\n🧪 Running in demo mode with mock data...\n');
        }

        return shopifyConfigured || woocommerceConfigured;
    }

    calculateOverallResults() {
        const shopifyWeight = 0.5; // 50% weight
        const woocommerceWeight = 0.5; // 50% weight

        // Calculate weighted overall score
        this.results.overall.score = (
            (this.results.shopify.score * shopifyWeight) +
            (this.results.woocommerce.score * woocommerceWeight)
        );

        // Calculate summary statistics
        this.results.summary.totalTests = 
            this.results.shopify.totalTests + this.results.woocommerce.totalTests;
        
        this.results.summary.passedTests = 
            this.results.shopify.passedTests + this.results.woocommerce.passedTests;
        
        this.results.summary.failedTests = 
            this.results.summary.totalTests - this.results.summary.passedTests;

        // Determine overall status
        if (this.results.overall.score >= 85) {
            this.results.overall.status = 'EXCELLENT';
        } else if (this.results.overall.score >= 75) {
            this.results.overall.status = 'GOOD';
        } else if (this.results.overall.score >= 60) {
            this.results.overall.status = 'NEEDS_IMPROVEMENT';
        } else {
            this.results.overall.status = 'CRITICAL';
        }

        // Calculate coverage areas
        this.calculateCoverageMetrics();
    }

    calculateCoverageMetrics() {
        // Store Connection Coverage
        const connectionTests = [
            ...this.results.shopify.tests.filter(t => t.name.includes('Authentication')),
            ...this.results.woocommerce.tests.filter(t => t.name.includes('Authentication'))
        ];
        this.results.summary.coverage.storeConnection = 
            (connectionTests.filter(t => t.status === 'PASS').length / connectionTests.length) * 100;

        // Data Sync Coverage
        const syncTests = [
            ...this.results.shopify.tests.filter(t => t.name.includes('Sync') || t.name.includes('Product') || t.name.includes('Customer')),
            ...this.results.woocommerce.tests.filter(t => t.name.includes('Sync') || t.name.includes('Product') || t.name.includes('Customer'))
        ];
        this.results.summary.coverage.dataSync = 
            (syncTests.filter(t => t.status === 'PASS').length / syncTests.length) * 100;

        // Performance Coverage
        const performanceTests = [
            ...this.results.shopify.tests.filter(t => t.name.includes('Performance')),
            ...this.results.woocommerce.tests.filter(t => t.name.includes('Performance'))
        ];
        this.results.summary.coverage.performance = 
            (performanceTests.filter(t => t.status === 'PASS').length / performanceTests.length) * 100;

        // Integration Coverage
        const integrationTests = [
            ...this.results.shopify.tests.filter(t => t.name.includes('Webhook') || t.name.includes('Order')),
            ...this.results.woocommerce.tests.filter(t => t.name.includes('Webhook') || t.name.includes('WordPress'))
        ];
        this.results.summary.coverage.integration = 
            (integrationTests.filter(t => t.status === 'PASS').length / integrationTests.length) * 100;
    }

    generateComprehensiveReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📋 COMPREHENSIVE LIVE STORE INTEGRATION REPORT');
        console.log('='.repeat(80));

        // Overall Results
        console.log(`\n🎯 OVERALL SCORE: ${this.results.overall.score.toFixed(1)}/100`);
        console.log(`📊 STATUS: ${this.getStatusEmoji(this.results.overall.status)} ${this.results.overall.status}`);
        console.log(`⏱️  DURATION: ${this.results.overall.duration}s`);
        console.log(`📅 COMPLETED: ${this.results.overall.endTime}`);

        // Platform Scores
        console.log('\n📈 PLATFORM SCORES:');
        console.log(`🛍️  Shopify:     ${this.results.shopify.score.toFixed(1)}/100 ${this.getStatusEmoji(this.results.shopify.status)}`);
        console.log(`🛒 WooCommerce: ${this.results.woocommerce.score.toFixed(1)}/100 ${this.getStatusEmoji(this.results.woocommerce.status)}`);

        // Test Summary
        console.log('\n📊 TEST SUMMARY:');
        console.log(`✅ Passed: ${this.results.summary.passedTests}/${this.results.summary.totalTests}`);
        console.log(`❌ Failed: ${this.results.summary.failedTests}/${this.results.summary.totalTests}`);
        console.log(`📈 Success Rate: ${((this.results.summary.passedTests / this.results.summary.totalTests) * 100).toFixed(1)}%`);

        // Coverage Metrics
        console.log('\n🎯 COVERAGE METRICS:');
        console.log(`🔌 Store Connection: ${this.results.summary.coverage.storeConnection.toFixed(1)}%`);
        console.log(`🔄 Data Synchronization: ${this.results.summary.coverage.dataSync.toFixed(1)}%`);
        console.log(`⚡ Performance: ${this.results.summary.coverage.performance.toFixed(1)}%`);
        console.log(`🔗 Integration: ${this.results.summary.coverage.integration.toFixed(1)}%`);

        // Detailed Results
        console.log('\n📝 DETAILED RESULTS:');
        
        console.log('\n🛍️ Shopify Tests:');
        this.results.shopify.tests.forEach(test => {
            const emoji = test.status === 'PASS' ? '✅' : '❌';
            console.log(`  ${emoji} ${test.name}`);
            if (test.status === 'FAIL') {
                console.log(`     Error: ${test.error}`);
            }
        });

        console.log('\n🛒 WooCommerce Tests:');
        this.results.woocommerce.tests.forEach(test => {
            const emoji = test.status === 'PASS' ? '✅' : '❌';
            console.log(`  ${emoji} ${test.name}`);
            if (test.status === 'FAIL') {
                console.log(`     Error: ${test.error}`);
            }
        });

        // Recommendations
        this.generateRecommendations();

        console.log('\n' + '='.repeat(80));
    }

    generateRecommendations() {
        console.log('\n💡 RECOMMENDATIONS:');

        if (this.results.overall.score >= 85) {
            console.log('🎉 Excellent! Your system is ready for production with live customer data.');
            console.log('✅ All critical integrations are working properly.');
            console.log('🚀 Consider implementing advanced features like AI recommendations.');
        } else if (this.results.overall.score >= 75) {
            console.log('👍 Good performance! Minor improvements needed before production.');
            console.log('🔧 Focus on failed tests and performance optimization.');
        } else if (this.results.overall.score >= 60) {
            console.log('⚠️  System needs significant improvements before production deployment.');
            console.log('🛠️  Priority: Fix critical integration failures.');
            console.log('📈 Improve data synchronization and API performance.');
        } else {
            console.log('🚨 Critical issues detected! System not ready for production.');
            console.log('🔴 Immediate action required on failed integrations.');
            console.log('📞 Consider consulting with development team.');
        }

        // Specific recommendations based on failed tests
        const failedTests = [
            ...this.results.shopify.tests.filter(t => t.status === 'FAIL'),
            ...this.results.woocommerce.tests.filter(t => t.status === 'FAIL')
        ];

        if (failedTests.length > 0) {
            console.log('\n🎯 SPECIFIC ACTIONS NEEDED:');
            failedTests.forEach(test => {
                console.log(`• Fix ${test.name}: ${test.error}`);
            });
        }
    }

    getStatusEmoji(status) {
        const emojis = {
            'EXCELLENT': '🟢',
            'GOOD': '🟡',
            'NEEDS_IMPROVEMENT': '🟠',
            'CRITICAL': '🔴',
            'PASS': '✅',
            'FAIL': '❌',
            'ERROR': '💥'
        };
        return emojis[status] || '❓';
    }

    // Export results to JSON file
    async exportResults(filename = 'live-store-test-results.json') {
        const fs = require('fs').promises;
        try {
            await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
            console.log(`\n💾 Results exported to: ${filename}`);
        } catch (error) {
            console.error(`❌ Failed to export results: ${error.message}`);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const testRunner = new LiveStoreTestRunner();
    testRunner.runAllTests()
        .then(results => {
            // Export results
            testRunner.exportResults();
            
            // Exit with appropriate code
            const exitCode = results.overall.score >= 75 ? 0 : 1;
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('💥 Test runner failed:', error);
            process.exit(1);
        });
}

module.exports = LiveStoreTestRunner;