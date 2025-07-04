/**
 * Simple Payment Method Manager Integration Verification
 * Verifies the integration without browser automation
 */

const fs = require('fs');
const path = require('path');

function verifyPaymentMethodIntegration() {
    console.log('🔍 Verifying Payment Method Manager Integration...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, condition, details = '') {
        const passed = condition;
        results.tests.push({ name, passed, details });
        if (passed) {
            results.passed++;
            console.log(`✅ ${name}`);
        } else {
            results.failed++;
            console.log(`❌ ${name}${details ? ` - ${details}` : ''}`);
        }
    }
    
    // Test 1: Check if payment-method-manager.js exists
    const paymentManagerPath = path.join(__dirname, 'js', 'payment-method-manager.js');
    test('Payment Method Manager file exists', fs.existsSync(paymentManagerPath));
    
    // Test 2: Check if customer portal settings.html exists
    const settingsPath = path.join(__dirname, 'customer', 'settings.html');
    test('Customer portal settings.html exists', fs.existsSync(settingsPath));
    
    if (fs.existsSync(settingsPath)) {
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        // Test 3: Check if payment-method-manager.js is included in settings.html
        test('Payment Method Manager script included', 
             settingsContent.includes('payment-method-manager.js'));
        
        // Test 4: Check if payment-methods-container exists
        test('Payment methods container exists', 
             settingsContent.includes('id="payment-methods-container"'));
        
        // Test 5: Check if PaymentMethodManager is initialized
        test('PaymentMethodManager initialization code exists', 
             settingsContent.includes('PaymentMethodManager') && 
             settingsContent.includes('new PaymentMethodManager()'));
        
        // Test 6: Check if container is in billing section
        const billingSection = settingsContent.match(/id="billing-section"[\s\S]*?<\/section>/);
        if (billingSection) {
            test('Payment methods container in billing section', 
                 billingSection[0].includes('payment-methods-container'));
        } else {
            test('Payment methods container in billing section', false, 'Billing section not found');
        }
        
        // Test 7: Check if Stripe integration is maintained
        test('Stripe integration maintained', 
             settingsContent.includes('stripe/config.js') || 
             settingsContent.includes('billing-manager.js'));
        
        // Test 8: Check if CSS is properly linked
        test('Customer portal CSS linked', 
             settingsContent.includes('customer-portal.css'));
    }
    
    // Test 9: Check if CSS file exists and has payment method styles
    const cssPath = path.join(__dirname, 'css', 'customer-portal.css');
    if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        test('Payment method CSS styles exist', 
             cssContent.includes('payment-method') || 
             cssContent.includes('payment-card'));
    } else {
        test('Customer portal CSS file exists', false);
    }
    
    // Test 10: Check if PaymentMethodManager class exists
    if (fs.existsSync(paymentManagerPath)) {
        const managerContent = fs.readFileSync(paymentManagerPath, 'utf8');
        test('PaymentMethodManager class defined', 
             managerContent.includes('class PaymentMethodManager'));
        
        test('PaymentMethodManager has init method', 
             managerContent.includes('init()') || managerContent.includes('init '));
        
        test('PaymentMethodManager has CRUD methods', 
             managerContent.includes('loadPaymentMethods') && 
             managerContent.includes('showAddPaymentMethodModal') && 
             managerContent.includes('deletePaymentMethod'));
    }
    
    // Summary
    console.log('\n📊 Integration Verification Summary');
    console.log('=====================================');
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${Math.round((results.passed / results.tests.length) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All integration checks passed!');
        console.log('✅ Payment Method Manager is properly integrated with Customer Portal');
    } else {
        console.log('\n⚠️  Some integration checks failed:');
        results.tests.filter(t => !t.passed).forEach(test => {
            console.log(`   - ${test.name}${test.details ? ` (${test.details})` : ''}`);
        });
    }
    
    return results;
}

// Run verification
if (require.main === module) {
    verifyPaymentMethodIntegration();
}

module.exports = { verifyPaymentMethodIntegration };