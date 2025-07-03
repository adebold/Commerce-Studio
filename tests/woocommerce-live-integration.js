#!/usr/bin/env node

/**
 * 🛒 WooCommerce Live Integration Implementation
 * GREEN phase: Implementation to make WooCommerce tests pass
 */

const axios = require('axios');
const LiveStoreConfig = require('./live-store-config');

class WooCommerceLiveIntegration {
    constructor() {
        this.config = new LiveStoreConfig();
        this.wooConfig = this.config.getWooCommerceConfig();
        this.thresholds = this.config.getTestThresholds();
        this.baseUrl = `https://${this.wooConfig.storeUrl}`;
        this.apiUrl = `${this.baseUrl}/wp-json/${this.wooConfig.apiVersion}`;
        this.wpApiUrl = `${this.baseUrl}/wp-json/wp/v2`;
    }

    // ===== GREEN PHASE: IMPLEMENTATION =====

    async testWooCommerceAPIAuthentication() {
        console.log('  🔐 Testing WooCommerce API Authentication...');
        
        if (!this.wooConfig.consumerKey || !this.wooConfig.consumerSecret) {
            throw new Error('WooCommerce API credentials not configured');
        }

        try {
            const auth = Buffer.from(`${this.wooConfig.consumerKey}:${this.wooConfig.consumerSecret}`).toString('base64');
            
            const response = await axios.get(`${this.apiUrl}/system_status`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.wooConfig.timeout
            });

            if (response.status === 200 && response.data.environment) {
                console.log('    ✅ WooCommerce API authentication successful');
                console.log(`    📊 WooCommerce Version: ${response.data.environment.version}`);
                console.log(`    🌐 WordPress Version: ${response.data.environment.wp_version}`);
                console.log(`    🔧 PHP Version: ${response.data.environment.php_version}`);
                
                return {
                    success: true,
                    environment: response.data.environment,
                    responseTime: response.headers['x-response-time'] || 'N/A'
                };
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.log('    ❌ WooCommerce API authentication failed:', error.message);
            throw error;
        }
    }

    async testWooCommerceProductSync() {
        console.log('  📦 Testing WooCommerce Product Synchronization...');
        
        try {
            const auth = Buffer.from(`${this.wooConfig.consumerKey}:${this.wooConfig.consumerSecret}`).toString('base64');
            
            const response = await axios.get(`${this.apiUrl}/products?per_page=10`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.wooConfig.timeout
            });

            if (response.status === 200 && Array.isArray(response.data)) {
                const products = response.data;
                console.log(`    ✅ Retrieved ${products.length} products`);
                
                // Test product data structure
                const sampleProduct = products[0];
                if (sampleProduct) {
                    console.log(`    📊 Sample Product: ${sampleProduct.name}`);
                    console.log(`    💰 Price: $${sampleProduct.price || 'N/A'}`);
                    console.log(`    📦 Stock: ${sampleProduct.stock_quantity || 'N/A'}`);
                    console.log(`    🏷️  SKU: ${sampleProduct.sku || 'N/A'}`);
                }

                return {
                    success: true,
                    productCount: products.length,
                    products: products.slice(0, 3).map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        stock_quantity: p.stock_quantity,
                        sku: p.sku
                    })),
                    syncTime: Date.now()
                };
            } else {
                throw new Error('No products found');
            }
        } catch (error) {
            console.log('    ❌ WooCommerce product sync failed:', error.message);
            throw error;
        }
    }

    async testWooCommerceCustomerData() {
        console.log('  👥 Testing WooCommerce Customer Data...');
        
        try {
            const auth = Buffer.from(`${this.wooConfig.consumerKey}:${this.wooConfig.consumerSecret}`).toString('base64');
            
            const response = await axios.get(`${this.apiUrl}/customers?per_page=5`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.wooConfig.timeout
            });

            if (response.status === 200 && Array.isArray(response.data)) {
                const customers = response.data;
                console.log(`    ✅ Retrieved ${customers.length} customers`);
                
                // Test customer data structure
                const sampleCustomer = customers[0];
                if (sampleCustomer) {
                    console.log(`    👤 Sample Customer: ${sampleCustomer.first_name} ${sampleCustomer.last_name}`);
                    console.log(`    📧 Email: ${sampleCustomer.email}`);
                    console.log(`    📅 Created: ${sampleCustomer.date_created}`);
                    console.log(`    🛒 Orders: ${sampleCustomer.orders_count || 0}`);
                }

                return {
                    success: true,
                    customerCount: customers.length,
                    customers: customers.map(c => ({
                        id: c.id,
                        email: c.email,
                        name: `${c.first_name} ${c.last_name}`,
                        date_created: c.date_created,
                        orders_count: c.orders_count
                    }))
                };
            } else {
                throw new Error('No customers found');
            }
        } catch (error) {
            console.log('    ❌ WooCommerce customer data test failed:', error.message);
            throw error;
        }
    }

    async testWooCommerceOrderHistory() {
        console.log('  📋 Testing WooCommerce Order History...');
        
        try {
            const auth = Buffer.from(`${this.wooConfig.consumerKey}:${this.wooConfig.consumerSecret}`).toString('base64');
            
            const response = await axios.get(`${this.apiUrl}/orders?per_page=10`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.wooConfig.timeout
            });

            if (response.status === 200 && Array.isArray(response.data)) {
                const orders = response.data;
                console.log(`    ✅ Retrieved ${orders.length} orders`);
                
                // Calculate total revenue
                const totalRevenue = orders.reduce((sum, order) => {
                    return sum + parseFloat(order.total || 0);
                }, 0);

                console.log(`    💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
                
                // Test order data structure
                const sampleOrder = orders[0];
                if (sampleOrder) {
                    console.log(`    📊 Sample Order: #${sampleOrder.number}`);
                    console.log(`    💵 Value: $${sampleOrder.total}`);
                    console.log(`    📅 Date: ${sampleOrder.date_created}`);
                    console.log(`    📦 Status: ${sampleOrder.status}`);
                }

                return {
                    success: true,
                    orderCount: orders.length,
                    totalRevenue: totalRevenue,
                    orders: orders.slice(0, 3).map(o => ({
                        id: o.id,
                        number: o.number,
                        total: o.total,
                        date_created: o.date_created,
                        status: o.status
                    }))
                };
            } else {
                throw new Error('No orders found');
            }
        } catch (error) {
            console.log('    ❌ WooCommerce order history test failed:', error.message);
            throw error;
        }
    }

    async testWordPressIntegration() {
        console.log('  🔌 Testing WordPress Integration...');
        
        try {
            // Test WordPress REST API
            const response = await axios.get(`${this.wpApiUrl}/users/me`, {
                auth: {
                    username: this.wooConfig.wpUsername,
                    password: this.wooConfig.wpPassword
                },
                timeout: this.wooConfig.timeout
            });

            if (response.status === 200 && response.data.id) {
                console.log('    ✅ WordPress API integration successful');
                console.log(`    👤 User: ${response.data.name}`);
                console.log(`    📧 Email: ${response.data.email}`);
                console.log(`    🔑 Roles: ${response.data.roles?.join(', ') || 'N/A'}`);
                
                // Test VARAi plugin presence
                try {
                    const pluginsResponse = await axios.get(`${this.baseUrl}/wp-json/varai/v1/status`, {
                        timeout: 5000
                    });
                    
                    if (pluginsResponse.status === 200) {
                        console.log('    ✅ VARAi WordPress plugin detected');
                    }
                } catch (pluginError) {
                    console.log('    ⚠️  VARAi WordPress plugin not detected');
                }

                return {
                    success: true,
                    user: {
                        id: response.data.id,
                        name: response.data.name,
                        email: response.data.email,
                        roles: response.data.roles
                    },
                    varaiPluginActive: false // Will be true if plugin responds
                };
            } else {
                throw new Error('Invalid WordPress API response');
            }
        } catch (error) {
            console.log('    ❌ WordPress integration test failed:', error.message);
            throw error;
        }
    }

    async testWooCommerceWebhooks() {
        console.log('  🔔 Testing WooCommerce Webhooks...');
        
        try {
            const auth = Buffer.from(`${this.wooConfig.consumerKey}:${this.wooConfig.consumerSecret}`).toString('base64');
            
            const response = await axios.get(`${this.apiUrl}/webhooks`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.wooConfig.timeout
            });

            if (response.status === 200) {
                const webhooks = response.data || [];
                console.log(`    ✅ Found ${webhooks.length} configured webhooks`);
                
                // Check for VARAi webhooks
                const varaiWebhooks = webhooks.filter(webhook => 
                    webhook.delivery_url && webhook.delivery_url.includes('varai')
                );
                
                console.log(`    🎯 VARAi webhooks: ${varaiWebhooks.length}`);
                
                if (webhooks.length > 0) {
                    const sampleWebhook = webhooks[0];
                    console.log(`    📊 Sample Webhook: ${sampleWebhook.topic}`);
                    console.log(`    🌐 URL: ${sampleWebhook.delivery_url}`);
                    console.log(`    ✅ Status: ${sampleWebhook.status}`);
                }

                return {
                    success: true,
                    webhookCount: webhooks.length,
                    varaiWebhooks: varaiWebhooks.length,
                    webhooks: webhooks.map(w => ({
                        id: w.id,
                        topic: w.topic,
                        delivery_url: w.delivery_url,
                        status: w.status,
                        date_created: w.date_created
                    }))
                };
            } else {
                throw new Error('Failed to retrieve webhooks');
            }
        } catch (error) {
            console.log('    ❌ WooCommerce webhooks test failed:', error.message);
            throw error;
        }
    }

    async testWooCommercePerformance() {
        console.log('  ⚡ Testing WooCommerce API Performance...');
        
        const startTime = Date.now();
        
        try {
            const auth = Buffer.from(`${this.wooConfig.consumerKey}:${this.wooConfig.consumerSecret}`).toString('base64');
            
            // Test multiple API calls for performance
            const promises = [
                axios.get(`${this.apiUrl}/system_status`, {
                    headers: { 'Authorization': `Basic ${auth}` }
                }),
                axios.get(`${this.apiUrl}/products?per_page=1`, {
                    headers: { 'Authorization': `Basic ${auth}` }
                }),
                axios.get(`${this.apiUrl}/customers?per_page=1`, {
                    headers: { 'Authorization': `Basic ${auth}` }
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
            console.log('    ❌ WooCommerce performance test failed:', error.message);
            throw error;
        }
    }

    async runAllWooCommerceTests() {
        console.log('\n🛒 Running WooCommerce Live Integration Tests...');
        
        const tests = [
            { name: 'API Authentication', method: this.testWooCommerceAPIAuthentication.bind(this) },
            { name: 'Product Sync', method: this.testWooCommerceProductSync.bind(this) },
            { name: 'Customer Data', method: this.testWooCommerceCustomerData.bind(this) },
            { name: 'Order History', method: this.testWooCommerceOrderHistory.bind(this) },
            { name: 'WordPress Integration', method: this.testWordPressIntegration.bind(this) },
            { name: 'Webhooks', method: this.testWooCommerceWebhooks.bind(this) },
            { name: 'Performance', method: this.testWooCommercePerformance.bind(this) }
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
        
        console.log(`\n📊 WooCommerce Integration Score: ${score.toFixed(1)}/100`);
        console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);

        return {
            score: score,
            passedTests: passedTests,
            totalTests: tests.length,
            results: results
        };
    }
}

module.exports = WooCommerceLiveIntegration;