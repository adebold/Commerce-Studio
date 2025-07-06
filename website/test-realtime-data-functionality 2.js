/**
 * Real-time Data Functionality Test Suite
 * Tests the US-004: Real-time Data Integration implementation
 */

const puppeteer = require('puppeteer');

class RealTimeDataTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
    }

    async initialize() {
        console.log('🚀 Initializing Real-time Data Test Suite...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1200, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Browser Error:', msg.text());
            } else if (msg.text().includes('Real-time')) {
                console.log('📡 Real-time Log:', msg.text());
            }
        });
    }

    async testRealTimeManagerSetup() {
        console.log('\n📋 Testing Real-time Data Manager Setup...');
        
        try {
            await this.page.goto('https://commerce-studio-website-ddtojwjn7a-uc.a.run.app/customer/settings.html', {
                waitUntil: 'networkidle0',
                timeout: 10000
            });

            // Check if Real-time Data Manager is loaded
            const managerExists = await this.page.evaluate(() => {
                return typeof window.RealTimeDataManager !== 'undefined';
            });

            // Check if manager is initialized
            const managerInitialized = await this.page.evaluate(() => {
                return window.realTimeDataManager instanceof window.RealTimeDataManager;
            });

            this.testResults.push({
                test: 'Real-time Data Manager Setup',
                passed: managerExists && managerInitialized,
                details: `Manager exists: ${managerExists}, Initialized: ${managerInitialized}`
            });

            return managerExists && managerInitialized;

        } catch (error) {
            console.log('❌ Real-time manager setup test failed:', error.message);
            this.testResults.push({
                test: 'Real-time Data Manager Setup',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testWebSocketConnection() {
        console.log('\n🔌 Testing WebSocket Connection...');
        
        try {
            // Test WebSocket URL generation
            const wsUrl = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    return window.realTimeDataManager.getWebSocketUrl();
                }
                return null;
            });

            // Test connection status
            const connectionStatus = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    return window.realTimeDataManager.getConnectionStatus();
                }
                return null;
            });

            const passed = wsUrl !== null && connectionStatus !== null;
            
            this.testResults.push({
                test: 'WebSocket Connection Setup',
                passed: passed,
                details: `WebSocket URL: ${wsUrl}, Status available: ${connectionStatus !== null}`
            });

            return passed;

        } catch (error) {
            console.log('❌ WebSocket connection test failed:', error.message);
            this.testResults.push({
                test: 'WebSocket Connection Setup',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testEventListeners() {
        console.log('\n👂 Testing Event Listeners...');
        
        try {
            // Test event listener setup
            const eventListenersSetup = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    // Check if event listeners map exists
                    return window.realTimeDataManager.eventListeners instanceof Map;
                }
                return false;
            });

            // Test adding event listeners
            const eventListenerAdded = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    let testEventFired = false;
                    window.realTimeDataManager.on('test_event', () => {
                        testEventFired = true;
                    });
                    window.realTimeDataManager.emit('test_event');
                    return testEventFired;
                }
                return false;
            });

            const passed = eventListenersSetup && eventListenerAdded;
            
            this.testResults.push({
                test: 'Event Listeners',
                passed: passed,
                details: `Event system setup: ${eventListenersSetup}, Test event fired: ${eventListenerAdded}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Event listeners test failed:', error.message);
            this.testResults.push({
                test: 'Event Listeners',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testUsageDataHandling() {
        console.log('\n📊 Testing Usage Data Handling...');
        
        try {
            // Test usage data structure
            const usageDataStructure = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    const usageData = window.realTimeDataManager.getUsageData();
                    return usageData && 
                           typeof usageData.current === 'object' &&
                           Array.isArray(usageData.history) &&
                           typeof usageData.limits === 'object';
                }
                return false;
            });

            // Test usage update handling
            const usageUpdateHandled = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    const testPayload = {
                        metric: 'api_calls',
                        value: 1500,
                        limit: 10000,
                        percentage: 15,
                        timestamp: new Date().toISOString()
                    };
                    
                    window.realTimeDataManager.handleUsageUpdate(testPayload);
                    const usageData = window.realTimeDataManager.getUsageData();
                    
                    return usageData.current.api_calls && 
                           usageData.current.api_calls.value === 1500;
                }
                return false;
            });

            const passed = usageDataStructure && usageUpdateHandled;
            
            this.testResults.push({
                test: 'Usage Data Handling',
                passed: passed,
                details: `Data structure: ${usageDataStructure}, Update handling: ${usageUpdateHandled}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Usage data handling test failed:', error.message);
            this.testResults.push({
                test: 'Usage Data Handling',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testBillingDataHandling() {
        console.log('\n💰 Testing Billing Data Handling...');
        
        try {
            // Test billing data structure
            const billingDataStructure = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    const billingData = window.realTimeDataManager.getBillingData();
                    return billingData && 
                           typeof billingData.currentUsage === 'number' &&
                           typeof billingData.estimatedCost === 'number' &&
                           Array.isArray(billingData.alerts);
                }
                return false;
            });

            // Test billing update handling
            const billingUpdateHandled = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    const testPayload = {
                        currentUsage: 125.50,
                        estimatedCost: 150.75,
                        billingCycle: {
                            startDate: '2025-01-01',
                            endDate: '2025-01-31',
                            daysRemaining: 15
                        },
                        alerts: []
                    };
                    
                    window.realTimeDataManager.handleBillingUpdate(testPayload);
                    const billingData = window.realTimeDataManager.getBillingData();
                    
                    return billingData.currentUsage === 125.50 && 
                           billingData.estimatedCost === 150.75;
                }
                return false;
            });

            const passed = billingDataStructure && billingUpdateHandled;
            
            this.testResults.push({
                test: 'Billing Data Handling',
                passed: passed,
                details: `Data structure: ${billingDataStructure}, Update handling: ${billingUpdateHandled}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Billing data handling test failed:', error.message);
            this.testResults.push({
                test: 'Billing Data Handling',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testNotificationSystem() {
        console.log('\n🔔 Testing Notification System...');
        
        try {
            // Test notification creation
            const notificationCreated = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    window.realTimeDataManager.showNotification(
                        'Test Notification',
                        'This is a test notification message',
                        'info'
                    );
                    
                    // Check if notification container exists
                    const container = document.getElementById('notifications-container');
                    return container !== null;
                }
                return false;
            });

            // Wait for notification to appear
            await this.page.waitForTimeout(500);

            // Test notification visibility
            const notificationVisible = await this.page.evaluate(() => {
                const notifications = document.querySelectorAll('.notification');
                return notifications.length > 0;
            });

            const passed = notificationCreated && notificationVisible;
            
            this.testResults.push({
                test: 'Notification System',
                passed: passed,
                details: `Notification created: ${notificationCreated}, Visible: ${notificationVisible}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Notification system test failed:', error.message);
            this.testResults.push({
                test: 'Notification System',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testDataFormatting() {
        console.log('\n📝 Testing Data Formatting...');
        
        try {
            // Test usage value formatting
            const usageFormatting = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    const apiCalls = window.realTimeDataManager.formatUsageValue('api_calls', 1500);
                    const storage = window.realTimeDataManager.formatUsageValue('storage', 1073741824); // 1GB
                    
                    return apiCalls === '1,500' && storage.includes('GB');
                }
                return false;
            });

            // Test bytes formatting
            const bytesFormatting = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    const bytes = window.realTimeDataManager.formatBytes(1024);
                    const kilobytes = window.realTimeDataManager.formatBytes(1048576);
                    
                    return bytes === '1 KB' && kilobytes === '1 MB';
                }
                return false;
            });

            // Test usage class determination
            const usageClasses = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    const normal = window.realTimeDataManager.getUsageClass(50);
                    const high = window.realTimeDataManager.getUsageClass(92);
                    const critical = window.realTimeDataManager.getUsageClass(97);
                    
                    return normal === 'normal' && high === 'high' && critical === 'critical';
                }
                return false;
            });

            const passed = usageFormatting && bytesFormatting && usageClasses;
            
            this.testResults.push({
                test: 'Data Formatting',
                passed: passed,
                details: `Usage formatting: ${usageFormatting}, Bytes formatting: ${bytesFormatting}, Usage classes: ${usageClasses}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Data formatting test failed:', error.message);
            this.testResults.push({
                test: 'Data Formatting',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testConnectionStatusDisplay() {
        console.log('\n🔗 Testing Connection Status Display...');
        
        try {
            // Test connection status update
            const statusUpdated = await this.page.evaluate(() => {
                if (window.realTimeDataManager) {
                    // Create a mock status element
                    const statusElement = document.createElement('div');
                    statusElement.id = 'connection-status';
                    document.body.appendChild(statusElement);
                    
                    window.realTimeDataManager.updateConnectionStatus();
                    
                    return statusElement.className.includes('connection-status');
                }
                return false;
            });

            const passed = statusUpdated;
            
            this.testResults.push({
                test: 'Connection Status Display',
                passed: passed,
                details: `Status display updated: ${statusUpdated}`
            });

            return passed;

        } catch (error) {
            console.log('❌ Connection status display test failed:', error.message);
            this.testResults.push({
                test: 'Connection Status Display',
                passed: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async generateReport() {
        console.log('\n📊 Generating Real-time Data Test Report...');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('📡 REAL-TIME DATA INTEGRATION TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
        console.log('');

        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${result.test}: ${status}`);
            console.log(`   Details: ${result.details}`);
            console.log('');
        });

        // Generate recommendations
        console.log('💡 RECOMMENDATIONS:');
        const failedTests = this.testResults.filter(result => !result.passed);
        
        if (failedTests.length === 0) {
            console.log('✅ All real-time data tests passed! US-004 implementation is working correctly.');
            console.log('🚀 Ready for production deployment with real-time capabilities.');
        } else {
            failedTests.forEach(test => {
                console.log(`❌ Fix: ${test.test} - ${test.details}`);
            });
        }

        console.log('='.repeat(60));
        
        return {
            totalTests,
            passedTests,
            successRate: parseFloat(successRate),
            results: this.testResults
        };
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async runAllTests() {
        try {
            await this.initialize();
            
            console.log('🧪 Running Real-time Data Integration Test Suite...');
            console.log('Testing URL: https://commerce-studio-website-ddtojwjn7a-uc.a.run.app/customer/settings.html');
            
            // Run all tests
            await this.testRealTimeManagerSetup();
            await this.testWebSocketConnection();
            await this.testEventListeners();
            await this.testUsageDataHandling();
            await this.testBillingDataHandling();
            await this.testNotificationSystem();
            await this.testDataFormatting();
            await this.testConnectionStatusDisplay();
            
            // Generate final report
            const report = await this.generateReport();
            
            return report;
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            return {
                totalTests: 0,
                passedTests: 0,
                successRate: 0,
                error: error.message
            };
        } finally {
            await this.cleanup();
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new RealTimeDataTester();
    tester.runAllTests().then(report => {
        console.log('\n🏁 Real-time Data Integration Test Suite Complete!');
        process.exit(report.successRate === 100 ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test suite error:', error);
        process.exit(1);
    });
}

module.exports = RealTimeDataTester;