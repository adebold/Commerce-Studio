/**
 * Store Integration Functionality Test Suite
 * Tests the US-005: Store Integration Management implementation
 */

const puppeteer = require('puppeteer');

class StoreIntegrationTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
    }

    async initialize() {
        console.log('🚀 Initializing Store Integration Test Suite...');
        
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
            } else if (msg.text().includes('Store Integration')) {
                console.log('🔌 Integration Log:', msg.text());
            }
        });
    }

    async testStoreIntegrationManagerSetup() {
        console.log('\n🔌 Testing Store Integration Manager Setup...');
        
        try {
            await this.page.goto('https://commerce-studio-website-ddtojwjn7a-uc.a.run.app/customer/settings.html', {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for the integrations section to load
            await this.page.waitForSelector('#integrations-section', { timeout: 10000 });

            // Check if Store Integration Manager is initialized
            const managerInitialized = await this.page.evaluate(() => {
                return typeof window.storeIntegrationManager !== 'undefined' && 
                       window.storeIntegrationManager.isInitialized === true;
            });

            // Check if integration cards are present
            const integrationCards = await this.page.$$('.integration-card');
            const cardCount = integrationCards.length;

            // Check if platform configurations are loaded
            const platformsLoaded = await this.page.evaluate(() => {
                return window.storeIntegrationManager && 
                       Object.keys(window.storeIntegrationManager.platforms).length > 0;
            });

            this.testResults.push({
                test: 'Store Integration Manager Setup',
                success: managerInitialized && cardCount >= 4 && platformsLoaded,
                details: `Manager initialized: ${managerInitialized}, Cards found: ${cardCount}, Platforms loaded: ${platformsLoaded}`
            });

            return managerInitialized && cardCount >= 4 && platformsLoaded;

        } catch (error) {
            console.error('❌ Store integration manager setup test failed:', error.message);
            this.testResults.push({
                test: 'Store Integration Manager Setup',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testIntegrationCardInteractions() {
        console.log('\n🎯 Testing Integration Card Interactions...');
        
        try {
            // Test Connect button for Magento
            const connectButtonExists = await this.page.$('.integration-connect-btn[data-platform="magento"]');
            
            if (connectButtonExists) {
                // Click the connect button
                await this.page.click('.integration-connect-btn[data-platform="magento"]');
                
                // Wait for modal to appear
                await this.page.waitForSelector('.integration-modal-overlay', { timeout: 5000 });
                
                // Check if modal content is correct
                const modalTitle = await this.page.$eval('.integration-modal-header h3', el => el.textContent);
                const isCorrectModal = modalTitle.includes('Connect Magento');
                
                // Close modal
                await this.page.click('.integration-modal-close');
                
                this.testResults.push({
                    test: 'Integration Card Interactions',
                    success: isCorrectModal,
                    details: `Connect button works: ${!!connectButtonExists}, Modal title: ${modalTitle}`
                });
                
                return isCorrectModal;
            } else {
                throw new Error('Connect button not found');
            }

        } catch (error) {
            console.error('❌ Integration card interactions test failed:', error.message);
            this.testResults.push({
                test: 'Integration Card Interactions',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testConnectionModal() {
        console.log('\n📋 Testing Connection Modal...');
        
        try {
            // Open Shopify connection modal (should show configure/disconnect options)
            const shopifyConfigButton = await this.page.$('.integration-configure-btn[data-platform="shopify"]');
            
            if (shopifyConfigButton) {
                await this.page.click('.integration-configure-btn[data-platform="shopify"]');
                
                // Wait for configuration modal
                await this.page.waitForSelector('.integration-modal-overlay', { timeout: 5000 });
                
                // Check for configuration tabs
                const syncTab = await this.page.$('.integration-tab-btn');
                const syncTabExists = !!syncTab;
                
                // Check for sync settings
                const syncSettings = await this.page.$('.integration-sync-options');
                const syncSettingsExists = !!syncSettings;
                
                // Close modal
                await this.page.click('.integration-modal-close');
                
                this.testResults.push({
                    test: 'Connection Modal',
                    success: syncTabExists && syncSettingsExists,
                    details: `Sync tab: ${syncTabExists}, Sync settings: ${syncSettingsExists}`
                });
                
                return syncTabExists && syncSettingsExists;
            } else {
                // Test WooCommerce connect modal instead
                await this.page.click('.integration-connect-btn[data-platform="woocommerce"]');
                
                await this.page.waitForSelector('.integration-modal-overlay', { timeout: 5000 });
                
                // Check for form fields
                const formFields = await this.page.$$('.integration-form-input');
                const fieldCount = formFields.length;
                
                // Check for store name field
                const storeNameField = await this.page.$('#woocommerce-store-name');
                const storeNameExists = !!storeNameField;
                
                // Close modal
                await this.page.click('.integration-modal-close');
                
                this.testResults.push({
                    test: 'Connection Modal',
                    success: fieldCount >= 3 && storeNameExists,
                    details: `Form fields: ${fieldCount}, Store name field: ${storeNameExists}`
                });
                
                return fieldCount >= 3 && storeNameExists;
            }

        } catch (error) {
            console.error('❌ Connection modal test failed:', error.message);
            this.testResults.push({
                test: 'Connection Modal',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testPlatformSupport() {
        console.log('\n🏪 Testing Platform Support...');
        
        try {
            // Check if all major platforms are supported
            const platforms = await this.page.evaluate(() => {
                if (!window.storeIntegrationManager) return {};
                return Object.keys(window.storeIntegrationManager.platforms);
            });

            const expectedPlatforms = ['shopify', 'magento', 'woocommerce', 'bigcommerce'];
            const allPlatformsSupported = expectedPlatforms.every(platform => platforms.includes(platform));

            // Check platform configurations
            const platformConfigs = await this.page.evaluate(() => {
                if (!window.storeIntegrationManager) return {};
                return window.storeIntegrationManager.platforms;
            });

            const configsValid = Object.values(platformConfigs).every(config => 
                config.name && config.icon && config.authType && config.requiredFields
            );

            this.testResults.push({
                test: 'Platform Support',
                success: allPlatformsSupported && configsValid,
                details: `Platforms: ${platforms.join(', ')}, Configs valid: ${configsValid}`
            });

            return allPlatformsSupported && configsValid;

        } catch (error) {
            console.error('❌ Platform support test failed:', error.message);
            this.testResults.push({
                test: 'Platform Support',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testSyncFunctionality() {
        console.log('\n🔄 Testing Sync Functionality...');
        
        try {
            // Check if sync button exists for connected platform (Shopify)
            const syncButton = await this.page.$('.integration-sync-btn[data-platform="shopify"]');
            const syncButtonExists = !!syncButton;

            // Check if sync status indicator exists
            const syncIndicator = await this.page.$('#integration-sync-indicator');
            const syncIndicatorExists = !!syncIndicator;

            // Test sync status methods
            const syncMethods = await this.page.evaluate(() => {
                if (!window.storeIntegrationManager) return false;
                return typeof window.storeIntegrationManager.triggerSync === 'function' &&
                       typeof window.storeIntegrationManager.checkSyncStatus === 'function' &&
                       typeof window.storeIntegrationManager.updateSyncIndicators === 'function';
            });

            this.testResults.push({
                test: 'Sync Functionality',
                success: syncButtonExists && syncIndicatorExists && syncMethods,
                details: `Sync button: ${syncButtonExists}, Indicator: ${syncIndicatorExists}, Methods: ${syncMethods}`
            });

            return syncButtonExists && syncIndicatorExists && syncMethods;

        } catch (error) {
            console.error('❌ Sync functionality test failed:', error.message);
            this.testResults.push({
                test: 'Sync Functionality',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testEventSystem() {
        console.log('\n📡 Testing Event System...');
        
        try {
            // Test event system methods
            const eventMethods = await this.page.evaluate(() => {
                if (!window.storeIntegrationManager) return false;
                return typeof window.storeIntegrationManager.on === 'function' &&
                       typeof window.storeIntegrationManager.emit === 'function';
            });

            // Test event listener registration
            const eventListenerTest = await this.page.evaluate(() => {
                if (!window.storeIntegrationManager) return false;
                
                let eventFired = false;
                window.storeIntegrationManager.on('test_event', () => {
                    eventFired = true;
                });
                
                window.storeIntegrationManager.emit('test_event', { test: true });
                return eventFired;
            });

            this.testResults.push({
                test: 'Event System',
                success: eventMethods && eventListenerTest,
                details: `Event methods: ${eventMethods}, Event listener test: ${eventListenerTest}`
            });

            return eventMethods && eventListenerTest;

        } catch (error) {
            console.error('❌ Event system test failed:', error.message);
            this.testResults.push({
                test: 'Event System',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testFormValidation() {
        console.log('\n✅ Testing Form Validation...');
        
        try {
            // Open BigCommerce connection modal
            await this.page.click('.integration-connect-btn[data-platform="bigcommerce"]');
            await this.page.waitForSelector('.integration-modal-overlay', { timeout: 5000 });

            // Try to submit empty form
            const submitButton = await this.page.$('.integration-connection-form button[type="submit"]');
            if (submitButton) {
                await this.page.click('.integration-connection-form button[type="submit"]');
                
                // Check if form validation prevents submission
                const modalStillOpen = await this.page.$('.integration-modal-overlay');
                const validationWorking = !!modalStillOpen;
                
                // Fill in required fields
                await this.page.type('#bigcommerce-store-name', 'Test Store');
                await this.page.type('#bigcommerce-store_hash', 'test123');
                await this.page.type('#bigcommerce-access_token', 'test_token_123');
                
                // Check if fields are filled
                const storeNameValue = await this.page.$eval('#bigcommerce-store-name', el => el.value);
                const fieldsFilledCorrectly = storeNameValue === 'Test Store';
                
                // Close modal
                await this.page.click('.integration-modal-close');
                
                this.testResults.push({
                    test: 'Form Validation',
                    success: validationWorking && fieldsFilledCorrectly,
                    details: `Validation working: ${validationWorking}, Fields filled: ${fieldsFilledCorrectly}`
                });
                
                return validationWorking && fieldsFilledCorrectly;
            } else {
                throw new Error('Submit button not found');
            }

        } catch (error) {
            console.error('❌ Form validation test failed:', error.message);
            this.testResults.push({
                test: 'Form Validation',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async testResponsiveDesign() {
        console.log('\n📱 Testing Responsive Design...');
        
        try {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.waitForTimeout(1000);

            // Check if integration cards stack properly
            const cardsContainer = await this.page.$('.integration-cards');
            const containerStyles = await this.page.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    display: styles.display,
                    gridTemplateColumns: styles.gridTemplateColumns
                };
            }, cardsContainer);

            const mobileLayoutCorrect = containerStyles.display === 'grid';

            // Test tablet viewport
            await this.page.setViewport({ width: 768, height: 1024 });
            await this.page.waitForTimeout(1000);

            // Check if layout adapts
            const tabletLayoutCorrect = await this.page.evaluate(() => {
                const cards = document.querySelectorAll('.integration-card');
                return cards.length > 0;
            });

            // Reset to desktop
            await this.page.setViewport({ width: 1200, height: 800 });

            this.testResults.push({
                test: 'Responsive Design',
                success: mobileLayoutCorrect && tabletLayoutCorrect,
                details: `Mobile layout: ${mobileLayoutCorrect}, Tablet layout: ${tabletLayoutCorrect}`
            });

            return mobileLayoutCorrect && tabletLayoutCorrect;

        } catch (error) {
            console.error('❌ Responsive design test failed:', error.message);
            this.testResults.push({
                test: 'Responsive Design',
                success: false,
                details: `Error: ${error.message}`
            });
            return false;
        }
    }

    async runAllTests() {
        console.log('🧪 Running Store Integration Test Suite...');
        console.log('Testing URL: https://commerce-studio-website-ddtojwjn7a-uc.a.run.app/customer/settings.html');

        const tests = [
            () => this.testStoreIntegrationManagerSetup(),
            () => this.testIntegrationCardInteractions(),
            () => this.testConnectionModal(),
            () => this.testPlatformSupport(),
            () => this.testSyncFunctionality(),
            () => this.testEventSystem(),
            () => this.testFormValidation(),
            () => this.testResponsiveDesign()
        ];

        let successCount = 0;
        for (const test of tests) {
            const result = await test();
            if (result) successCount++;
        }

        await this.generateReport(successCount, tests.length);
        await this.cleanup();
    }

    async generateReport(successCount, totalTests) {
        console.log('\n📊 Generating Store Integration Test Report...');

        const successRate = ((successCount / totalTests) * 100).toFixed(1);

        console.log('\n============================================================');
        console.log('🔌 STORE INTEGRATION MANAGEMENT TEST RESULTS');
        console.log('============================================================');
        console.log(`📊 Overall Success Rate: ${successRate}% (${successCount}/${totalTests})`);
        console.log('');

        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${result.test}: ${status}`);
            console.log(`   Details: ${result.details}`);
            console.log('');
        });

        console.log('💡 RECOMMENDATIONS:');
        this.testResults.forEach(result => {
            if (!result.success) {
                console.log(`❌ Fix: ${result.test} - ${result.details}`);
            }
        });
        console.log('============================================================');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('\n🏁 Store Integration Test Suite Complete!');
    }
}

// Run the test suite
async function runStoreIntegrationTests() {
    const tester = new StoreIntegrationTester();
    
    try {
        await tester.initialize();
        await tester.runAllTests();
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        await tester.cleanup();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoreIntegrationTester;
} else {
    // Run tests if called directly
    runStoreIntegrationTests();
}