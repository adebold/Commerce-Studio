#!/usr/bin/env node

/**
 * 🛍️ Shopify Live Integration Implementation
 * GREEN phase: Implementation to make Shopify tests pass
 */

const axios = require('axios');
const LiveStoreConfig = require('./live-store-config');

class ShopifyLiveIntegration {
    constructor() {
        this.config = new LiveStoreConfig();
        this.shopifyConfig = this.config.getShopifyConfig();
        this.thresholds = this.config.getTestThresholds();
        this.baseUrl = `https://${this.shopifyConfig.storeUrl}`;
        this.apiUrl = `${this.baseUrl}/admin/api/${this.shopifyConfig.apiVersion}`;
    }

    // ===== GREEN PHASE: IMPLEMENTATION =====

    async testShopifyAPIAuthentication() {
        console.log('  🔐 Testing Shopify API Authentication...');
        
        if (!this.shopifyConfig.accessToken) {
            throw new Error('Shopify access token not configured');
        }

        try {
            const response = await axios.get(`${this.apiUrl}/shop.json`, {
                headers: {
                    'X-Shopify-Access-Token': this.shopifyConfig.accessToken,
                    'Content-Type': 'application/json'
                },
                timeout: this.shopifyConfig.timeout
            });

            if (response.status === 200 && response.data.shop) {
                console.log('    ✅ Shopify API authentication successful');
                console.log(`    📊 Store: ${response.data.shop.name}`);
                console.log(`    🌐 Domain: ${response.data.shop.domain}`);
                return {
                    success: true,
                    shop: response.data.shop,
                    responseTime: response.headers['x-response-time'] || 'N/A'
                };
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.log('    ❌ Shopify API authentication failed:', error.message);
            throw error;
        }
    }

    async testShopifyProductSync() {
        console.log('  📦 Testing Shopify Product Synchronization...');
        
        try {
            const response = await axios.get(`${this.apiUrl}/products.json?limit=10`, {
                headers: {
                    'X-Shopify-Access-Token': this.shopifyConfig.accessToken,
                    'Content-Type': 'application/json'
                },
                timeout: this.shopifyConfig.timeout
            });

            if (response.status === 200 && response.data.products) {
                const products = response.data.products;
                console.log(`    ✅ Retrieved ${products.length} products`);
                
                // Test product data structure
                const sampleProduct = products[0];
                if (sampleProduct) {
                    console.log(`    📊 Sample Product: ${sampleProduct.title}`);
                    console.log(`    💰 Price: ${sampleProduct.variants?.[0]?.price || 'N/A'}`);
                    console.log(`    📦 Inventory: ${sampleProduct.variants?.[0]?.inventory_quantity || 'N/A'}`);
                }

                return {
                    success: true,
                    productCount: products.length,
                    products: products.slice(0, 3), // Return first 3 for testing
                    syncTime: Date.now()
                };
            } else {
                throw new Error('No products found');
            }
        } catch (error) {
            console.log('    ❌ Shopify product sync failed:', error.message);
            throw error;
        }
    }

    async testShopifyCustomerData() {
        console.log('  👥 Testing Shopify Customer Data...');
        
        try {
            const response = await axios.get(`${this.apiUrl}/customers.json?limit=5`, {
                headers: {
                    'X-Shopify-Access-Token': this.shopifyConfig.accessToken,
                    'Content-Type': 'application/json'
                },
                timeout: this.shopifyConfig.timeout
            });

            if (response.status === 200 && response.data.customers) {
                const customers = response.data.customers;
                console.log(`    ✅ Retrieved ${customers.length} customers`);
                
                // Test customer data structure
                const sampleCustomer = customers[0];
                if (sampleCustomer) {
                    console.log(`    👤 Sample Customer: ${sampleCustomer.first_name} ${sampleCustomer.last_name}`);
                    console.log(`    📧 Email: ${sampleCustomer.email}`);
                    console.log(`    📅 Created: ${sampleCustomer.created_at}`);
                }

                return {
                    success: true,
                    customerCount: customers.length,
                    customers: customers.map(c => ({
                        id: c.id,
                        email: c.email,
                        name: `${c.first_name} ${c.last_name}`,
                        created_at: c.created_at
                    }))
                };
            } else {
                throw new Error('No customers found');
            }
        } catch (error) {
            console.log('    ❌ Shopify customer data test failed:', error.message);
            throw error;
        }
    }

    async testShopifyOrderHistory() {
        console.log('  📋 Testing Shopify Order History...');
        
        try {
            const response = await axios.get(`${this.apiUrl}/orders.json?limit=10&status=any`, {
                headers: {
                    'X-Shopify-Access-Token': this.shopifyConfig.accessToken,
                    'Content-Type': 'application/json'
                },
                timeout: this.shopifyConfig.timeout
            });

            if (response.status === 200 && response.data.orders) {
                const orders = response.data.orders;
                console.log(`    ✅ Retrieved ${orders.length} orders`);
                
                // Calculate total revenue
                const totalRevenue = orders.reduce((sum, order) => {
                    return sum + parseFloat(order.total_price || 0);
                }, 0);

                console.log(`    💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
                
                // Test order data structure
                const sampleOrder = orders[0];
                if (sampleOrder) {
                    console.log(`    📊 Sample Order: #${sampleOrder.order_number}`);
                    console.log(`    💵 Value: $${sampleOrder.total_price}`);
                    console.log(`    📅 Date: ${sampleOrder.created_at}`);
                }

                return {
                    success: true,
                    orderCount: orders.length,
                    totalRevenue: totalRevenue,
                    orders: orders.slice(0, 3).map(o => ({
                        id: o.id,
                        order_number: o.order_number,
                        total_price: o.total_price,
                        created_at: o.created_at,
                        financial_status: o.financial_status
                    }))
                };
            } else {
                throw new Error('No orders found');
            }
        } catch (error) {
            console.log('    ❌ Shopify order history test failed:', error.message);
            throw error;
        }
    }

    async testShopifyWebhooks() {
        console.log('  🔔 Testing Shopify Webhooks...');
        
        try {
            const response = await axios.get(`${this.apiUrl}/webhooks.json`, {
                headers: {
                    'X-Shopify-Access-Token': this.shopifyConfig.accessToken,
                    'Content-Type': 'application/json'
                },
                timeout: this.shopifyConfig.timeout
            });

            if (response.status === 200) {
                const webhooks = response.data.webhooks || [];
                console.log(`    ✅ Found ${webhooks.length} configured webhooks`);
                
                // Check for VARAi webhooks
                const varaiWebhooks = webhooks.filter(webhook => 
                    webhook.address && webhook.address.includes('varai')
                );
                
                console.log(`    🎯 VARAi webhooks: ${varaiWebhooks.length}`);
                
                if (webhooks.length > 0) {
                    const sampleWebhook = webhooks[0];
                    console.log(`    📊 Sample Webhook: ${sampleWebhook.topic}`);
                    console.log(`    🌐 Address: ${sampleWebhook.address}`);
                }

                return {
                    success: true,
                    webhookCount: webhooks.length,
                    varaiWebhooks: varaiWebhooks.length,
                    webhooks: webhooks.map(w => ({
                        id: w.id,
                        topic: w.topic,
                        address: w.address,
                        created_at: w.created_at
                    }))
                };
            } else {
                throw new Error('Failed to retrieve webhooks');
            }
        } catch (error) {
            console.log('    ❌ Shopify webhooks test failed:', error.message);
            throw error;
        }
    }

    async testShopifyPerformance() {
        console.log('  ⚡ Testing Shopify API Performance...');
        
        const startTime = Date.now();
        
        try {
            // Test multiple API calls for performance
            const promises = [
                axios.get(`${this.apiUrl}/shop.json`, {
                    headers: { 'X-Shopify-Access-Token': this.shopifyConfig.accessToken }
                }),
                axios.get(`${this.apiUrl}/products/count.json`, {
                    headers: { 'X-Shopify-Access-Token': this.shopifyConfig.accessToken }
                }),
                axios.get(`${this.apiUrl}/customers/count.json`, {
                    headers: { 'X-Shopify-Access-Token': this.shopifyConfig.accessToken }
                })
            ];

            const results = await Promise.all(promises);
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const avgResponseTime = totalTime / promises.length;

            console.log(`    ✅ Performance test completed`);
            console.log(`    ⏱️  Total time: ${totalTime}ms`);
            console.log(`    📊 Average response time: ${avgResponseTime.toFixed(2)}ms`);
            
            const performanceGrade = avgResponseTime < this.thresholds.performance.apiResponseTime ? 'PASS' : 'FAIL';
            console.log(`    🎯 Performance grade: ${performanceGrade}`);

            return {
                success: true,
                totalTime: totalTime,
                averageResponseTime: avgResponseTime,
                threshold: this.thresholds.performance.apiResponseTime,
                grade: performanceGrade
            };
        } catch (error) {
            console.log('    ❌ Shopify performance test failed:', error.message);
            throw error;
        }
    }

    async runAllShopifyTests() {
        console.log('\n🛍️ Running Shopify Live Integration Tests...');
        
        const tests = [
            { name: 'API Authentication', method: this.testShopifyAPIAuthentication.bind(this) },
            { name: 'Product Sync', method: this.testShopifyProductSync.bind(this) },
            { name: 'Customer Data', method: this.testShopifyCustomerData.bind(this) },
            { name: 'Order History', method: this.testShopifyOrderHistory.bind(this) },
            { name: 'Webhooks', method: this.testShopifyWebhooks.bind(this) },
            { name: 'Performance', method: this.testShopifyPerformance.bind(this) }
        ];

        const results = [];
        let passedTests = 0;

        for (const test of tests) {
            try {
                const result = await test.method();
                results.push({
                    name: test.name,
                    status: 'PASS',
                    result: result
                });
                passedTests++;
            } catch (error) {
                results.push({
                    name: test.name,
                    status: 'FAIL',
                    error: error.message
                });
            }
        }

        const score = (passedTests / tests.length) * 100;
        
        console.log(`\n📊 Shopify Integration Score: ${score.toFixed(1)}/100`);
        console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);

        return {
            score: score,
            passedTests: passedTests,
            totalTests: tests.length,
            results: results
        };
    }
}

module.exports = ShopifyLiveIntegration;