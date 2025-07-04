#!/usr/bin/env node

/**
 * VARAi Commerce Studio - VisionCraft Demo Store Integration Tests Runner
 * Executes VisionCraft-specific tests from the comprehensive test suite
 */

const ComprehensiveTestSuite = require('../comprehensive-test-suite');

async function runVisionCraftTests() {
    console.log('🛍️ VARAi Commerce Studio - VisionCraft Demo Store Tests');
    console.log('=====================================================\n');

    const testSuite = new ComprehensiveTestSuite();
    
    try {
        await testSuite.init();
        console.log('✅ Test suite initialized successfully\n');

        // Run VisionCraft integration tests
        await testSuite.testVisionCraftIntegration();

        // Generate focused report
        const results = testSuite.testResults.visioncraft;
        const totalPassed = results.passed.length;
        const totalFailed = results.failed.length;
        const totalTests = totalPassed + totalFailed;
        const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        console.log('\n🎯 VISIONCRAFT TEST SUMMARY');
        console.log('============================');
        console.log(`Total VisionCraft Tests: ${totalTests}`);
        console.log(`Passed: ${totalPassed} (${passRate}%)`);
        console.log(`Failed: ${totalFailed}`);

        if (totalFailed > 0) {
            console.log('\n❌ FAILED TESTS:');
            results.failed.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure.test || 'Unknown'}: ${failure.error}`);
            });
        }

        if (totalPassed > 0) {
            console.log('\n✅ PASSED TESTS:');
            results.passed.forEach((success, index) => {
                console.log(`${index + 1}. ${success.test || 'Unknown'}: ${success.result || 'Success'}`);
            });
        }

        await testSuite.close();

        if (totalFailed === 0) {
            console.log('\n🎉 SUCCESS: All VisionCraft integration tests passed!');
            console.log('Demo store is fully functional and integrated.');
            process.exit(0);
        } else {
            console.log('\n⚠️  ISSUES DETECTED: Please review and fix failed VisionCraft tests.');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ VISIONCRAFT TEST EXECUTION FAILED:', error.message);
        await testSuite.close();
        process.exit(1);
    }
}

runVisionCraftTests();