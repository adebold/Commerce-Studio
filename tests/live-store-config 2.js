#!/usr/bin/env node

/**
 * 🧪 Live Store Configuration
 * Environment setup and configuration for live store testing
 */

class LiveStoreConfig {
    constructor() {
        this.validateEnvironment();
        this.setupConfiguration();
    }

    validateEnvironment() {
        const requiredEnvVars = [
            'SHOPIFY_STORE_URL',
            'SHOPIFY_ACCESS_TOKEN',
            'WOOCOMMERCE_STORE_URL',
            'WOOCOMMERCE_CONSUMER_KEY',
            'WOOCOMMERCE_CONSUMER_SECRET'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.warn('⚠️  Missing environment variables for live testing:');
            missingVars.forEach(varName => {
                console.warn(`   - ${varName}`);
            });
            console.warn('\n📝 Create a .env file with your live store credentials');
        }
    }

    setupConfiguration() {
        this.shopify = {
            storeUrl: process.env.SHOPIFY_STORE_URL || 'demo-store.myshopify.com',
            accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
            apiKey: process.env.SHOPIFY_API_KEY || '',
            apiSecret: process.env.SHOPIFY_API_SECRET || '',
            apiVersion: '2024-01',
            timeout: 10000
        };

        this.woocommerce = {
            storeUrl: process.env.WOOCOMMERCE_STORE_URL || 'demo-store.com',
            consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
            consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
            wpUsername: process.env.WP_USERNAME || '',
            wpPassword: process.env.WP_PASSWORD || '',
            apiVersion: 'wc/v3',
            timeout: 10000
        };

        this.varai = {
            baseUrl: process.env.VARAI_BASE_URL || 'https://commerce-studio-website-ddtojwjn7a-uc.a.run.app',
            apiKey: process.env.VARAI_API_KEY || '',
            timeout: 15000
        };

        this.testThresholds = {
            performance: {
                apiResponseTime: 2000, // 2 seconds
                dashboardLoadTime: 3000, // 3 seconds
                syncTime: 5000 // 5 seconds
            },
            accuracy: {
                dataSync: 95, // 95% accuracy
                recommendations: 75, // 75% accuracy
                analytics: 90 // 90% accuracy
            },
            availability: {
                uptime: 99.5, // 99.5% uptime
                errorRate: 1 // Max 1% error rate
            }
        };
    }

    getShopifyConfig() {
        return this.shopify;
    }

    getWooCommerceConfig() {
        return this.woocommerce;
    }

    getVaraiConfig() {
        return this.varai;
    }

    getTestThresholds() {
        return this.testThresholds;
    }

    isLiveTestingEnabled() {
        return !!(this.shopify.accessToken && this.woocommerce.consumerKey);
    }

    generateTestReport() {
        return {
            timestamp: new Date().toISOString(),
            environment: {
                shopify: {
                    configured: !!this.shopify.accessToken,
                    store: this.shopify.storeUrl
                },
                woocommerce: {
                    configured: !!this.woocommerce.consumerKey,
                    store: this.woocommerce.storeUrl
                },
                varai: {
                    configured: !!this.varai.apiKey,
                    baseUrl: this.varai.baseUrl
                }
            },
            thresholds: this.testThresholds
        };
    }
}

module.exports = LiveStoreConfig;