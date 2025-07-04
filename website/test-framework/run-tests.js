#!/usr/bin/env node

/**
 * VARAi Commerce Studio - Test Runner
 * Simple script to execute comprehensive website tests
 */

const TDDOrchestrator = require('./tdd-orchestrator');
const ComprehensiveTestSuite = require('./comprehensive-test-suite');

async function runTests() {
    console.log('🚀 VARAi Commerce Studio - Enhanced Test Runner');
    console.log('===============================================');
    console.log('🧪 TDD Implementation: Addressing Framework Paradox');
    console.log('📊 Target: 80.8% framework readiness → 95% execution');
    console.log('===============================================\n');

    // Check if comprehensive TDD should be run
    const args = process.argv.slice(2);
    const runTDD = args.includes('--tdd') || args.includes('--comprehensive');
    
    if (runTDD) {
        console.log('🔬 Running Comprehensive TDD Implementation...\n');
        const orchestrator = new TDDOrchestrator();
        
        try {
            await orchestrator.init();
            const results = await orchestrator.runComprehensiveTDDSuite();
            
            console.log('\n🎯 TDD IMPLEMENTATION RESULTS');
            console.log('=============================');
            console.log(`Overall Score: ${results.summary.overallScore}/100`);
            console.log(`Test Coverage: ${results.summary.testCoverage}%`);
            console.log(`Security Score: ${results.testResults.security?.overallScore || 0}/100`);
            console.log(`Accessibility Score: ${results.testResults.accessibility?.overallScore || 0}/100`);
            console.log(`Form Validation Score: ${results.testResults.forms?.overallScore || 0}/100`);
            console.log(`Performance Score: ${results.testResults.performance?.overallScore || 0}/100`);
            console.log(`Production Ready: ${results.productionReadiness.status}`);
            console.log(`Deployment Blocked: ${results.summary.deploymentBlocked ? 'YES' : 'NO'}`);

            if (results.summary.deploymentBlocked) {
                console.log('\n🚫 DEPLOYMENT BLOCKED - Quality gates failed');
                console.log('Critical Issues:');
                results.productionReadiness.blockers.forEach(blocker => {
                    console.log(`  ❌ ${blocker}`);
                });
                console.log('\nRecommendations:');
                results.productionReadiness.recommendations.forEach(rec => {
                    console.log(`  💡 ${rec}`);
                });
                process.exit(1);
            } else {
                console.log('\n✅ PRODUCTION READY - All quality gates passed');
                console.log('🚀 Website ready for deployment!');
                process.exit(0);
            }

        } catch (error) {
            console.error('\n❌ TDD IMPLEMENTATION FAILED:', error.message);
            process.exit(1);
        }
    } else {
        console.log('📋 Running Standard Navigation Tests...');
        console.log('💡 Use --tdd flag for comprehensive TDD implementation\n');
        
        const testSuite = new ComprehensiveTestSuite();
        
        try {
            const results = await testSuite.runAllTests();
            
            // Calculate summary
            const totalPassed = Object.values(results).reduce((sum, category) => sum + category.passed.length, 0);
            const totalFailed = Object.values(results).reduce((sum, category) => sum + category.failed.length, 0);
            const totalTests = totalPassed + totalFailed;
            const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

            console.log('\n🎯 NAVIGATION TEST SUMMARY');
            console.log('==========================');
            console.log(`Total Tests: ${totalTests}`);
            console.log(`Passed: ${totalPassed} (${passRate}%)`);
            console.log(`Failed: ${totalFailed}`);
            
            console.log('\n⚠️  WARNING: Framework Paradox Detected!');
            console.log('==========================================');
            console.log('🔍 Analysis: Comprehensive test frameworks available but not executed');
            console.log('📊 Current Coverage: ~15% (Navigation only)');
            console.log('🎯 Available Coverage: 80%+ (Security, Forms, Accessibility, Performance)');
            console.log('💡 Solution: Run with --tdd flag for full implementation');
            console.log('');
            console.log('Example: node run-tests.js --tdd');

            if (totalFailed === 0) {
                console.log('\n✅ Navigation tests passed, but comprehensive validation needed.');
                process.exit(0);
            } else {
                console.log('\n❌ Navigation test failures detected.');
                process.exit(1);
            }

        } catch (error) {
            console.error('\n❌ TEST EXECUTION FAILED:', error.message);
            console.error('Please check the error details and try again.');
            process.exit(1);
        }
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
VARAi Commerce Studio Test Runner

Usage:
  node run-tests.js [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information

Examples:
  node run-tests.js                    # Run all tests
  npm test                            # Run via npm script
  npm run test:navigation             # Run specific test category

For more information, see README.md
`);
    process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
    const packageJson = require('./package.json');
    console.log(`VARAi Test Suite v${packageJson.version}`);
    process.exit(0);
}

// Run the tests
runTests();