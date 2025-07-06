#!/usr/bin/env node

/**
 * Authentication Test Runner
 * 
 * Runs all authentication tests and provides a comprehensive validation report
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}=== ${msg} ===${colors.reset}\n`)
};

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    log.info(`Running ${testFile}...`);
    
    const child = spawn('node', [testFile], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log.success(`${testFile} completed successfully`);
        resolve({ success: true, stdout, stderr });
      } else {
        log.error(`${testFile} failed with exit code ${code}`);
        resolve({ success: false, stdout, stderr, code });
      }
    });
    
    child.on('error', (error) => {
      log.error(`Failed to run ${testFile}: ${error.message}`);
      reject(error);
    });
  });
}

async function runAllTests() {
  log.header('Authentication Test Suite Runner');
  
  const tests = [
    'test-login-auth.mjs',
    'test-auth-integration.mjs'
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await runTest(test);
      results.push({ test, ...result });
      
      // Print test output
      if (result.stdout) {
        console.log(result.stdout);
      }
      if (result.stderr) {
        console.error(result.stderr);
      }
    } catch (error) {
      log.error(`Error running ${test}: ${error.message}`);
      results.push({ test, success: false, error: error.message });
    }
  }
  
  // Summary
  log.header('Test Suite Summary');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  if (successful === total) {
    log.success(`All test suites passed! (${successful}/${total})`);
    log.success('Authentication infrastructure is fully operational! 🎉');
  } else {
    log.error(`Some test suites failed (${successful}/${total})`);
    
    results.forEach(result => {
      if (result.success) {
        log.success(`${result.test}: PASSED`);
      } else {
        log.error(`${result.test}: FAILED`);
      }
    });
  }
  
  log.header('Quick Validation Commands');
  log.info('To run individual tests:');
  log.info('  node test-login-auth.mjs          # Core authentication tests');
  log.info('  node test-auth-integration.mjs    # Integration and source analysis');
  log.info('  node run-auth-tests.mjs           # Run all tests');
  
  log.header('Demo Credentials');
  log.info('All demo accounts use password: demo123');
  log.info('Available accounts:');
  log.info('  • super@varai.com  (Super Admin)');
  log.info('  • brand@varai.com  (Brand Manager)');
  log.info('  • admin@varai.com  (Client Admin)');
  log.info('  • dev@varai.com    (Developer)');
  log.info('  • viewer@varai.com (Viewer)');
  
  process.exit(successful === total ? 0 : 1);
}

runAllTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});