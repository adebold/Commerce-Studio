/**
 * Payment Method Manager Integration Test
 * Tests the integration of Payment Method Manager with Customer Portal Settings
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testPaymentMethodIntegration() {
    console.log('🧪 Starting Payment Method Manager Integration Test...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Browser Error:', msg.text());
            } else if (msg.text().includes('PaymentMethodManager')) {
                console.log('💳 Payment Manager:', msg.text());
            }
        });
        
        // Navigate to customer portal settings
        const settingsPath = path.join(__dirname, 'customer', 'settings.html');
        await page.goto(`file://${settingsPath}`);
        
        console.log('✅ Loaded customer portal settings page');
        
        // Wait for page to load
        await page.waitForTimeout(2000);
        
        // Test 1: Check if scripts are loaded
        console.log('\n📋 Test 1: Script Loading');
        
        const scriptsLoaded = await page.evaluate(() => {
            return {
                paymentMethodManager: typeof PaymentMethodManager !== 'undefined',
                stripe: typeof Stripe !== 'undefined',
                billingManager: typeof window.billingManager !== 'undefined'
            };
        });
        
        console.log('Payment Method Manager loaded:', scriptsLoaded.paymentMethodManager ? '✅' : '❌');
        console.log('Stripe loaded:', scriptsLoaded.stripe ? '✅' : '❌');
        console.log('Billing Manager loaded:', scriptsLoaded.billingManager ? '✅' : '❌');
        
        // Test 2: Check if payment methods container exists
        console.log('\n📋 Test 2: Payment Methods Container');
        
        const containerExists = await page.$('#payment-methods-container');
        console.log('Payment methods container exists:', containerExists ? '✅' : '❌');
        
        // Test 3: Navigate to billing section
        console.log('\n📋 Test 3: Billing Section Navigation');
        
        // Click on billing navigation
        const billingNavExists = await page.$('a[onclick="showSection(\'billing\')"]');
        console.log('Billing navigation exists:', billingNavExists ? '✅' : '❌');
        
        if (billingNavExists) {
            await page.click('a[onclick="showSection(\'billing\')"]');
            await page.waitForTimeout(1000);
            
            // Check if billing section is visible
            const billingVisible = await page.evaluate(() => {
                const section = document.getElementById('billing-section');
                return section && section.style.display !== 'none';
            });
            
            console.log('Billing section visible:', billingVisible ? '✅' : '❌');
        }
        
        // Test 4: Check Payment Method Manager initialization
        console.log('\n📋 Test 4: Payment Method Manager Initialization');
        
        const managerInitialized = await page.evaluate(() => {
            return typeof window.paymentMethodManager !== 'undefined' && 
                   window.paymentMethodManager !== null;
        });
        
        console.log('Payment Method Manager initialized:', managerInitialized ? '✅' : '❌');
        
        // Test 5: Check if payment methods container is in billing section
        console.log('\n📋 Test 5: Payment Methods Container Location');
        
        const containerInBilling = await page.evaluate(() => {
            const billingSection = document.getElementById('billing-section');
            const container = document.getElementById('payment-methods-container');
            return billingSection && container && billingSection.contains(container);
        });
        
        console.log('Payment methods container in billing section:', containerInBilling ? '✅' : '❌');
        
        // Test 6: Check for payment method functionality
        console.log('\n📋 Test 6: Payment Method Functionality');
        
        // Wait a bit for any async initialization
        await page.waitForTimeout(2000);
        
        const functionalityTest = await page.evaluate(() => {
            const manager = window.paymentMethodManager;
            if (!manager) return { available: false };
            
            return {
                available: true,
                hasLoadMethod: typeof manager.loadPaymentMethods === 'function',
                hasAddMethod: typeof manager.showAddPaymentMethodModal === 'function',
                hasEditMethod: typeof manager.showEditPaymentMethodModal === 'function',
                hasDeleteMethod: typeof manager.deletePaymentMethod === 'function'
            };
        });
        
        if (functionalityTest.available) {
            console.log('Payment Method Manager methods:');
            console.log('  - loadPaymentMethods:', functionalityTest.hasLoadMethod ? '✅' : '❌');
            console.log('  - showAddPaymentMethodModal:', functionalityTest.hasAddMethod ? '✅' : '❌');
            console.log('  - showEditPaymentMethodModal:', functionalityTest.hasEditMethod ? '✅' : '❌');
            console.log('  - deletePaymentMethod:', functionalityTest.hasDeleteMethod ? '✅' : '❌');
        } else {
            console.log('Payment Method Manager not available: ❌');
        }
        
        // Test 7: Check CSS styling
        console.log('\n📋 Test 7: CSS Styling');
        
        const stylingTest = await page.evaluate(() => {
            const container = document.getElementById('payment-methods-container');
            if (!container) return { exists: false };
            
            const styles = window.getComputedStyle(container);
            return {
                exists: true,
                hasStyles: styles.length > 0,
                display: styles.display,
                position: styles.position
            };
        });
        
        if (stylingTest.exists) {
            console.log('Payment methods container styling:');
            console.log('  - Has CSS styles:', stylingTest.hasStyles ? '✅' : '❌');
            console.log('  - Display:', stylingTest.display);
        } else {
            console.log('Container styling test failed: ❌');
        }
        
        // Test 8: Integration with existing billing functionality
        console.log('\n📋 Test 8: Integration with Existing Billing');
        
        const integrationTest = await page.evaluate(() => {
            // Check if Change Plan button exists and works with payment methods
            const changePlanBtn = document.querySelector('button[onclick*="changePlan"]') || 
                                 document.querySelector('button:contains("Change Plan")') ||
                                 document.querySelector('[data-action="change-plan"]');
            
            return {
                changePlanExists: !!changePlanBtn,
                billingFormExists: !!document.querySelector('#billingAddress'),
                paymentSectionExists: !!document.getElementById('payment-methods-container')
            };
        });
        
        console.log('Change Plan button exists:', integrationTest.changePlanExists ? '✅' : '❌');
        console.log('Billing form exists:', integrationTest.billingFormExists ? '✅' : '❌');
        console.log('Payment section integrated:', integrationTest.paymentSectionExists ? '✅' : '❌');
        
        // Summary
        console.log('\n📊 Integration Test Summary');
        console.log('================================');
        
        const allTests = [
            scriptsLoaded.paymentMethodManager,
            !!containerExists,
            !!billingNavExists,
            managerInitialized,
            containerInBilling,
            functionalityTest.available,
            stylingTest.exists,
            integrationTest.paymentSectionExists
        ];
        
        const passedTests = allTests.filter(test => test).length;
        const totalTests = allTests.length;
        
        console.log(`Tests Passed: ${passedTests}/${totalTests}`);
        console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All integration tests passed! Payment Method Manager is properly integrated.');
        } else {
            console.log('⚠️  Some integration tests failed. Please review the issues above.');
        }
        
        // Keep browser open for manual inspection
        console.log('\n🔍 Browser will remain open for manual inspection...');
        console.log('Press Ctrl+C to close when done.');
        
        // Wait indefinitely
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Browser will be closed when process is terminated
    }
}

// Run the test
if (require.main === module) {
    testPaymentMethodIntegration().catch(console.error);
}

module.exports = { testPaymentMethodIntegration };