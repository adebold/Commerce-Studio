/**
 * Navigation Structure Test
 * Validates that Store Locator has been removed from main navigation
 * and moved to footer across all website pages
 */

const fs = require('fs');
const path = require('path');

// Pages to test
const pagesToTest = [
    'index.html',
    'pricing.html', 
    'products.html',
    'solutions.html',
    'company.html'
];

// Test results
let testResults = {
    passed: 0,
    failed: 0,
    details: []
};

function testPage(filename) {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
        testResults.failed++;
        testResults.details.push({
            page: filename,
            status: 'FAILED',
            reason: 'File does not exist'
        });
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Test 1: Store Locator should NOT be in main navigation
    const mainNavRegex = /<div class="varai-navbar-nav[^>]*>[\s\S]*?<\/div>/;
    const mainNavMatch = content.match(mainNavRegex);
    
    let hasStoreLocatorInMainNav = false;
    if (mainNavMatch) {
        hasStoreLocatorInMainNav = mainNavMatch[0].includes('store-locator.html');
    }
    
    // Test 2: Customer Portal should be in main navigation
    let hasCustomerPortalInMainNav = false;
    if (mainNavMatch) {
        hasCustomerPortalInMainNav = mainNavMatch[0].includes('customer/login.html') || 
                                   mainNavMatch[0].includes('Customer Portal');
    }
    
    // Test 3: Store Locator should be in footer
    const footerRegex = /<footer[\s\S]*?<\/footer>/;
    const footerMatch = content.match(footerRegex);
    
    let hasStoreLocatorInFooter = false;
    if (footerMatch) {
        hasStoreLocatorInFooter = footerMatch[0].includes('store-locator.html');
    }
    
    // Test 4: Main navigation should have core business functions
    const expectedMainNavItems = [
        'Products',
        'Solutions', 
        'Pricing',
        'Company'
    ];
    
    let hasAllCoreNavItems = true;
    let missingItems = [];
    
    if (mainNavMatch) {
        expectedMainNavItems.forEach(item => {
            if (!mainNavMatch[0].includes(item)) {
                hasAllCoreNavItems = false;
                missingItems.push(item);
            }
        });
    }
    
    // Determine test result
    const testPassed = !hasStoreLocatorInMainNav && 
                      hasCustomerPortalInMainNav && 
                      hasStoreLocatorInFooter && 
                      hasAllCoreNavItems;
    
    if (testPassed) {
        testResults.passed++;
        testResults.details.push({
            page: filename,
            status: 'PASSED',
            reason: 'All navigation requirements met'
        });
    } else {
        testResults.failed++;
        
        let issues = [];
        if (hasStoreLocatorInMainNav) {
            issues.push('Store Locator found in main navigation');
        }
        if (!hasCustomerPortalInMainNav) {
            issues.push('Customer Portal missing from main navigation');
        }
        if (!hasStoreLocatorInFooter) {
            issues.push('Store Locator missing from footer');
        }
        if (!hasAllCoreNavItems) {
            issues.push(`Missing core nav items: ${missingItems.join(', ')}`);
        }
        
        testResults.details.push({
            page: filename,
            status: 'FAILED',
            reason: issues.join('; ')
        });
    }
}

// Run tests
console.log('🧪 Testing Navigation Structure Correction...\n');

pagesToTest.forEach(testPage);

// Print results
console.log('📊 Test Results:');
console.log('================');

testResults.details.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${result.page}: ${result.status}`);
    if (result.status === 'FAILED') {
        console.log(`   Reason: ${result.reason}`);
    }
});

console.log('\n📈 Summary:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📄 Total: ${testResults.passed + testResults.failed}`);

// Expected navigation structure
console.log('\n🎯 Expected Navigation Structure:');
console.log('==================================');
console.log('📍 Main Navigation (Header):');
console.log('   • Home');
console.log('   • Products');
console.log('   • Solutions');
console.log('   • Pricing');
console.log('   • Company');
console.log('   • Demo Store');
console.log('   • Customer Portal');
console.log('   • Get Started (CTA)');
console.log('');
console.log('📍 Secondary Navigation (Footer):');
console.log('   • Store Locator');
console.log('   • API Documentation');
console.log('   • Demo Login');
console.log('   • Customer Portal');

if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Navigation structure correction completed successfully.');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    process.exit(1);
}