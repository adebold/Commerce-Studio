/**
 * Standalone Analytics Validation Runner
 * Runs comprehensive validation tests without Jest dependency
 */

const { ComprehensiveAnalyticsValidator } = require('./comprehensive-analytics-validation-test');

async function runValidation() {
    console.log('🚀 Starting Comprehensive Analytics Pages Validation...');
    console.log('📅 ' + new Date().toISOString());
    console.log('=' .repeat(80));
    
    const validator = new ComprehensiveAnalyticsValidator();
    
    try {
        await validator.runAllTests();
        
        // Check if validation was successful
        const successRate = validator.results.summary.successRate;
        const totalTests = validator.results.summary.totalTests;
        const passedTests = validator.results.summary.passedTests;
        
        console.log('\n' + '='.repeat(80));
        console.log('🏁 VALIDATION COMPLETE');
        console.log('='.repeat(80));
        console.log(`📊 Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
        
        if (successRate >= 80) {
            console.log('✅ VALIDATION SUCCESSFUL - Analytics pages are working correctly!');
            process.exit(0);
        } else {
            console.log('❌ VALIDATION FAILED - Please review the issues above');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('💥 CRITICAL ERROR during validation:', error);
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n⚠️  Validation interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  Validation terminated');
    process.exit(1);
});

// Run the validation
runValidation().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
});