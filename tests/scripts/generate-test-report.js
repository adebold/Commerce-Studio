/**
 * Test Report Generator
 * 
 * This script combines test results from all platforms and generates a comprehensive HTML report.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TEST_RESULTS_DIR = path.resolve(__dirname, '../../test-results');
const REPORT_OUTPUT_DIR = path.resolve(TEST_RESULTS_DIR, 'report');
const PLATFORMS = ['shopify', 'bigcommerce', 'woocommerce', 'magento'];
const TEST_TYPES = ['unit', 'integration', 'e2e'];

// Ensure report directory exists
if (!fs.existsSync(REPORT_OUTPUT_DIR)) {
  fs.mkdirSync(REPORT_OUTPUT_DIR, { recursive: true });
}

// Function to parse JUnit XML results
function parseJUnitResults(filePath) {
  try {
    const xml = fs.readFileSync(filePath, 'utf8');
    const testsuites = xml.match(/<testsuite[^>]*>/g) || [];
    
    let totalTests = 0;
    let failures = 0;
    let skipped = 0;
    let time = 0;
    
    testsuites.forEach(testsuite => {
      const testCount = parseInt(testsuite.match(/tests="(\d+)"/)?.[1] || '0');
      const failureCount = parseInt(testsuite.match(/failures="(\d+)"/)?.[1] || '0');
      const skipCount = parseInt(testsuite.match(/skipped="(\d+)"/)?.[1] || '0');
      const timeValue = parseFloat(testsuite.match(/time="([\d\.]+)"/)?.[1] || '0');
      
      totalTests += testCount;
      failures += failureCount;
      skipped += skipCount;
      time += timeValue;
    });
    
    return {
      total: totalTests,
      passed: totalTests - failures - skipped,
      failed: failures,
      skipped: skipped,
      time: time.toFixed(2)
    };
  } catch (error) {
    console.error(`Error parsing JUnit results from ${filePath}:`, error);
    return { total: 0, passed: 0, failed: 0, skipped: 0, time: 0 };
  }
}

// Function to collect coverage data
function collectCoverage(platform) {
  try {
    const coverageSummaryPath = path.resolve(TEST_RESULTS_DIR, `${platform}-coverage/coverage-summary.json`);
    if (fs.existsSync(coverageSummaryPath)) {
      const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
      return {
        statements: summary.total.statements.pct,
        branches: summary.total.branches.pct,
        functions: summary.total.functions.pct,
        lines: summary.total.lines.pct
      };
    }
    return null;
  } catch (error) {
    console.error(`Error collecting coverage for ${platform}:`, error);
    return null;
  }
}

// Collect all test results
const results = {};

PLATFORMS.forEach(platform => {
  results[platform] = {};
  
  TEST_TYPES.forEach(testType => {
    const resultsDir = path.resolve(TEST_RESULTS_DIR, `${platform}-${testType}-test-results`);
    if (fs.existsSync(resultsDir)) {
      const junitFiles = fs.readdirSync(resultsDir)
        .filter(file => file.endsWith('.xml'))
        .map(file => path.resolve(resultsDir, file));
      
      if (junitFiles.length > 0) {
        const testResults = parseJUnitResults(junitFiles[0]);
        results[platform][testType] = testResults;
      }
    }
  });
  
  // Add coverage data
  results[platform].coverage = collectCoverage(platform);
});

// Generate HTML report
function generateHtmlReport(results) {
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VARAi E-commerce Integration Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px 15px;
      border: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      padding: 20px;
      width: 23%;
    }
    .summary-card h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .summary-number {
      font-size: 32px;
      font-weight: bold;
      color: #3498db;
    }
    .success { color: #27ae60; }
    .warning { color: #f39c12; }
    .danger { color: #e74c3c; }
    .coverage-bar {
      height: 20px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    .coverage-value {
      height: 100%;
      background: #3498db;
    }
    .platform-section {
      margin-bottom: 40px;
    }
  </style>
</head>
<body>
  <h1>VARAi E-commerce Integration Test Report</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Total Tests</h3>
      <div class="summary-number">${Object.values(results).reduce((sum, platform) => {
        return sum + Object.values(platform)
          .filter(result => typeof result === 'object' && result !== null && 'total' in result)
          .reduce((platformSum, result) => platformSum + result.total, 0);
      }, 0)}</div>
    </div>
    <div class="summary-card">
      <h3>Passed Tests</h3>
      <div class="summary-number success">${Object.values(results).reduce((sum, platform) => {
        return sum + Object.values(platform)
          .filter(result => typeof result === 'object' && result !== null && 'passed' in result)
          .reduce((platformSum, result) => platformSum + result.passed, 0);
      }, 0)}</div>
    </div>
    <div class="summary-card">
      <h3>Failed Tests</h3>
      <div class="summary-number ${Object.values(results).some(platform => 
        Object.values(platform).some(result => 
          typeof result === 'object' && result !== null && 'failed' in result && result.failed > 0
        )
      ) ? 'danger' : 'success'}">${Object.values(results).reduce((sum, platform) => {
        return sum + Object.values(platform)
          .filter(result => typeof result === 'object' && result !== null && 'failed' in result)
          .reduce((platformSum, result) => platformSum + result.failed, 0);
      }, 0)}</div>
    </div>
    <div class="summary-card">
      <h3>Average Coverage</h3>
      <div class="summary-number">${(() => {
        const coverages = Object.values(results)
          .map(platform => platform.coverage)
          .filter(coverage => coverage !== null)
          .map(coverage => (coverage.statements + coverage.branches + coverage.functions + coverage.lines) / 4);
        
        return coverages.length > 0 
          ? (coverages.reduce((sum, coverage) => sum + coverage, 0) / coverages.length).toFixed(2) + '%'
          : 'N/A';
      })()}</div>
    </div>
  </div>
`;

  // Add platform-specific sections
  PLATFORMS.forEach(platform => {
    html += `
  <div class="platform-section">
    <h2>${platform.charAt(0).toUpperCase() + platform.slice(1)} Integration</h2>
    
    <h3>Test Results</h3>
    <table>
      <thead>
        <tr>
          <th>Test Type</th>
          <th>Total</th>
          <th>Passed</th>
          <th>Failed</th>
          <th>Skipped</th>
          <th>Time (s)</th>
        </tr>
      </thead>
      <tbody>
    `;
    
    TEST_TYPES.forEach(testType => {
      const result = results[platform][testType] || { total: 0, passed: 0, failed: 0, skipped: 0, time: 0 };
      html += `
        <tr>
          <td>${testType.charAt(0).toUpperCase() + testType.slice(1)}</td>
          <td>${result.total}</td>
          <td class="${result.failed === 0 ? 'success' : ''}">${result.passed}</td>
          <td class="${result.failed > 0 ? 'danger' : ''}">${result.failed}</td>
          <td class="${result.skipped > 0 ? 'warning' : ''}">${result.skipped}</td>
          <td>${result.time}</td>
        </tr>
      `;
    });
    
    html += `
      </tbody>
    </table>
    `;
    
    // Add coverage section if available
    if (results[platform].coverage) {
      const coverage = results[platform].coverage;
      html += `
    <h3>Code Coverage</h3>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Coverage</th>
          <th>Visual</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Statements</td>
          <td>${coverage.statements}%</td>
          <td>
            <div class="coverage-bar">
              <div class="coverage-value" style="width: ${coverage.statements}%"></div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Branches</td>
          <td>${coverage.branches}%</td>
          <td>
            <div class="coverage-bar">
              <div class="coverage-value" style="width: ${coverage.branches}%"></div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Functions</td>
          <td>${coverage.functions}%</td>
          <td>
            <div class="coverage-bar">
              <div class="coverage-value" style="width: ${coverage.functions}%"></div>
            </div>
          </td>
        </tr>
        <tr>
          <td>Lines</td>
          <td>${coverage.lines}%</td>
          <td>
            <div class="coverage-bar">
              <div class="coverage-value" style="width: ${coverage.lines}%"></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
      `;
    }
    
    html += `
  </div>
    `;
  });
  
  html += `
</body>
</html>
  `;
  
  return html;
}

// Write HTML report
const htmlReport = generateHtmlReport(results);
fs.writeFileSync(path.resolve(REPORT_OUTPUT_DIR, 'index.html'), htmlReport);

// Generate JSON summary
fs.writeFileSync(
  path.resolve(REPORT_OUTPUT_DIR, 'summary.json'),
  JSON.stringify(results, null, 2)
);

console.log(`Test report generated at ${REPORT_OUTPUT_DIR}`);