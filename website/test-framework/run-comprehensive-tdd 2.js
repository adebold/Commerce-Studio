#!/usr/bin/env node

/**
 * VARAi Commerce Studio - Comprehensive TDD Test Runner
 * Integrates all test frameworks with quality gates
 */

const TDDOrchestrator = require('./tdd-orchestrator');

async function runComprehensiveTDD() {
    console.log('🧪 VARAi Commerce Studio - Comprehensive TDD Implementation');
    console.log('===========================================================');
    console.log('Addressing critical framework paradox: 80.8% ready → 95% executed');
    console.log('===========================================================\n');

    const orchestrator = new TDDOrchestrator();
    
    try {
        await orchestrator.init();
        const results = await orchestrator.runComprehensiveTDDSuite();
        
        console.log('\n🎯 TDD IMPLEMENTATION COMPLETE');
        console.log('==============================');
        console.log(`Overall Score: ${results.summary.overallScore}/100`);
        console.log(`Test Coverage: ${results.summary.testCoverage}%`);
        console.log(`Production Ready: ${results.productionReadiness.status}`);
        console.log(`Deployment Blocked: ${results.summary.deploymentBlocked ? 'YES' : 'NO'}`);

        if (results.summary.deploymentBlocked) {
            console.log('\n🚫 DEPLOYMENT BLOCKED - Quality gates failed');
            console.log('Blockers:');
            results.productionReadiness.blockers.forEach(blocker => {
                console.log(`  - ${blocker}`);
            });
            process.exit(1);
        } else {
            console.log('\n✅ PRODUCTION READY - All quality gates passed');
            process.exit(0);
        }

    } catch (error) {
        console.error('\n❌ TDD IMPLEMENTATION FAILED:', error.message);
        process.exit(1);
    }
}

runComprehensiveTDD();