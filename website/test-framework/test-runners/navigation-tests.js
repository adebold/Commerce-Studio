#!/usr/bin/env node

/**
 * VARAi Commerce Studio - Navigation Tests Runner
 * Executes navigation-specific tests from the comprehensive test suite
 */

const ComprehensiveTestSuite = require('../comprehensive-test-suite');

async function runNavigationTests() {
    console.log('🧭 VARAi Commerce Studio - Navigation Tests');
    console.log('==========================================\n');

    const testSuite = new ComprehensiveTestSuite();
    
    try {
        await testSuite.init();
        console.log('✅ Test suite initialized successfully\n');

        // Run navigation tests
        await testSuite.testNavigationLinks();

        // Generate focused report
        const results = testSuite.testResults.navigation;
        const totalPassed = results.passed.length;
        const totalFailed = results.failed.length;
        const totalTests = totalPassed + totalFailed;
        const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        console.log('\n🎯 NAVIGATION TEST SUMMARY');
        console.log('==========================');
        console.log(`Total Navigation Tests: ${totalTests}`);
        console.log(`Passed: ${totalPassed} (${passRate}%)`);
        console.log(`Failed: ${totalFailed}`);

        if (totalFailed > 0) {
            console.log('\n❌ FAILED TESTS:');
            results.failed.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.test || failure.page || 'Unknown'}: ${failure.error}`);
            });
        }

        await testSuite.close();

        if (totalFailed === 0) {
            console.log('\n🎉 SUCCESS: All navigation tests passed!');
            process.exit(0);
        } else {
            console.log('\n⚠️  ISSUES DETECTED: Please review and fix failed navigation tests.');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ NAVIGATION TEST EXECUTION FAILED:', error.message);
        await testSuite.close();
        process.exit(1);
    }
}

runNavigationTests();