/**
 * Coverage Threshold Checker
 * 
 * This script checks if test coverage meets the required thresholds.
 * It will fail the build if coverage is below the thresholds.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TEST_RESULTS_DIR = path.resolve(__dirname, '../../test-results');
const PLATFORMS = ['shopify', 'bigcommerce', 'woocommerce', 'magento'];

// Coverage thresholds (percentages)
const THRESHOLDS = {
  statements: 80,
  branches: 70,
  functions: 80,
  lines: 80
};

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

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

// Function to check if coverage meets thresholds
function checkCoverageThresholds(coverage) {
  if (!coverage) return { pass: false, failures: ['No coverage data available'] };
  
  const failures = [];
  
  if (coverage.statements < THRESHOLDS.statements) {
    failures.push(`Statement coverage (${coverage.statements}%) is below threshold (${THRESHOLDS.statements}%)`);
  }
  
  if (coverage.branches < THRESHOLDS.branches) {
    failures.push(`Branch coverage (${coverage.branches}%) is below threshold (${THRESHOLDS.branches}%)`);
  }
  
  if (coverage.functions < THRESHOLDS.functions) {
    failures.push(`Function coverage (${coverage.functions}%) is below threshold (${THRESHOLDS.functions}%)`);
  }
  
  if (coverage.lines < THRESHOLDS.lines) {
    failures.push(`Line coverage (${coverage.lines}%) is below threshold (${THRESHOLDS.lines}%)`);
  }
  
  return {
    pass: failures.length === 0,
    failures
  };
}

// Main function
function main() {
  console.log(`${COLORS.cyan}Checking test coverage against thresholds...${COLORS.reset}\n`);
  console.log(`${COLORS.blue}Thresholds:${COLORS.reset}`);
  console.log(`  Statements: ${THRESHOLDS.statements}%`);
  console.log(`  Branches:   ${THRESHOLDS.branches}%`);
  console.log(`  Functions:  ${THRESHOLDS.functions}%`);
  console.log(`  Lines:      ${THRESHOLDS.lines}%\n`);
  
  let allPassed = true;
  const platformResults = {};
  
  PLATFORMS.forEach(platform => {
    const coverage = collectCoverage(platform);
    if (!coverage) {
      console.log(`${COLORS.yellow}Warning: No coverage data found for ${platform}${COLORS.reset}`);
      return;
    }
    
    const result = checkCoverageThresholds(coverage);
    platformResults[platform] = { coverage, result };
    
    if (!result.pass) {
      allPassed = false;
    }
  });
  
  // Print results
  console.log(`${COLORS.blue}Results:${COLORS.reset}\n`);
  
  PLATFORMS.forEach(platform => {
    const data = platformResults[platform];
    if (!data) return;
    
    const { coverage, result } = data;
    const statusColor = result.pass ? COLORS.green : COLORS.red;
    const statusText = result.pass ? 'PASS' : 'FAIL';
    
    console.log(`${COLORS.cyan}${platform.charAt(0).toUpperCase() + platform.slice(1)}:${COLORS.reset} ${statusColor}${statusText}${COLORS.reset}`);
    console.log(`  Statements: ${formatCoverageValue(coverage.statements, THRESHOLDS.statements)}`);
    console.log(`  Branches:   ${formatCoverageValue(coverage.branches, THRESHOLDS.branches)}`);
    console.log(`  Functions:  ${formatCoverageValue(coverage.functions, THRESHOLDS.functions)}`);
    console.log(`  Lines:      ${formatCoverageValue(coverage.lines, THRESHOLDS.lines)}`);
    
    if (!result.pass) {
      console.log(`\n  ${COLORS.red}Failures:${COLORS.reset}`);
      result.failures.forEach(failure => {
        console.log(`  - ${failure}`);
      });
    }
    
    console.log(''); // Empty line between platforms
  });
  
  // Final result
  if (allPassed) {
    console.log(`${COLORS.green}✓ All coverage checks passed!${COLORS.reset}`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}✗ Some coverage checks failed!${COLORS.reset}`);
    process.exit(1);
  }
}

// Helper function to format coverage values with colors
function formatCoverageValue(actual, threshold) {
  const color = actual >= threshold ? COLORS.green : COLORS.red;
  return `${color}${actual}%${COLORS.reset}`;
}

// Run the script
main();