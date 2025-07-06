/**
 * @fileoverview Test Results Processor for Critical Fixes
 * Processes test results and generates metrics for critical fixes
 */

module.exports = (results) => {
  const { testResults, numTotalTests, numPassedTests, numFailedTests } = results;
  
  // Calculate critical metrics
  const criticalMetrics = {
    totalTests: numTotalTests,
    passedTests: numPassedTests,
    failedTests: numFailedTests,
    passRate: numTotalTests > 0 ? (numPassedTests / numTotalTests) * 100 : 0,
    criticalIssues: [],
    performanceMetrics: {},
    securityMetrics: {},
    memoryMetrics: {}
  };

  // Analyze test results for critical issues
  testResults.forEach(testFile => {
    testFile.testResults.forEach(test => {
      // Check for memory leak indicators
      if (test.title.includes('memory leak') && test.status === 'failed') {
        criticalMetrics.criticalIssues.push({
          type: 'MEMORY_LEAK',
          test: test.title,
          file: testFile.testFilePath
        });
      }

      // Check for security vulnerabilities
      if (test.title.includes('XSS') || test.title.includes('injection')) {
        if (test.status === 'failed') {
          criticalMetrics.criticalIssues.push({
            type: 'SECURITY_VULNERABILITY',
            test: test.title,
            file: testFile.testFilePath
          });
        }
      }

      // Check for race conditions
      if (test.title.includes('race condition') && test.status === 'failed') {
        criticalMetrics.criticalIssues.push({
          type: 'RACE_CONDITION',
          test: test.title,
          file: testFile.testFilePath
        });
      }

      // Check for performance regressions
      if (test.title.includes('performance') && test.status === 'failed') {
        criticalMetrics.criticalIssues.push({
          type: 'PERFORMANCE_REGRESSION',
          test: test.title,
          file: testFile.testFilePath
        });
      }
    });
  });

  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    status: criticalMetrics.criticalIssues.length === 0 ? 'PASS' : 'FAIL',
    metrics: criticalMetrics,
    recommendations: generateRecommendations(criticalMetrics)
  };

  // Write summary to file
  const fs = require('fs');
  const path = require('path');
  
  try {
    const outputDir = path.join(process.cwd(), 'coverage', 'critical-fixes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'critical-fixes-summary.json'),
      JSON.stringify(summary, null, 2)
    );
  } catch (error) {
    console.warn('Failed to write critical fixes summary:', error.message);
  }

  return results;
};

function generateRecommendations(metrics) {
  const recommendations = [];

  if (metrics.criticalIssues.length > 0) {
    recommendations.push('❌ Critical issues detected - DO NOT PROCEED with cross-platform propagation');
    
    metrics.criticalIssues.forEach(issue => {
      switch (issue.type) {
        case 'MEMORY_LEAK':
          recommendations.push('🔧 Fix memory leaks before deployment');
          break;
        case 'SECURITY_VULNERABILITY':
          recommendations.push('🔒 Address security vulnerabilities immediately');
          break;
        case 'RACE_CONDITION':
          recommendations.push('⚡ Resolve race conditions for stability');
          break;
        case 'PERFORMANCE_REGRESSION':
          recommendations.push('🚀 Optimize performance before release');
          break;
      }
    });
  } else {
    recommendations.push('✅ All critical tests passed - Ready for cross-platform propagation');
  }

  return recommendations;
}