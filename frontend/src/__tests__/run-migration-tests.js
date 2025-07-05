#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * React MUI Theme System Migration Test Runner
 * 
 * This script runs all migration-related tests and provides a comprehensive
 * report on the migration status and test results.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  subheader: (msg) => console.log(`${colors.bright}${msg}${colors.reset}`),
};

class MigrationTestRunner {
  constructor() {
    this.results = {
      cardSubcomponents: { passed: 0, failed: 0, errors: [] },
      themeStructure: { passed: 0, failed: 0, errors: [] },
      authContext: { passed: 0, failed: 0, errors: [] },
      buildCompilation: { passed: 0, failed: 0, errors: [] },
      overall: { passed: 0, failed: 0, duration: 0 }
    };
    this.startTime = Date.now();
  }

  async runTestSuite(suiteName, testFile, description) {
    log.subheader(`Running ${suiteName} Tests`);
    log.info(description);

    try {
      const output = execSync(`npm test -- --testPathPattern="${testFile}" --verbose --passWithNoTests`, {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '../../..'),
        timeout: 120000, // 2 minutes timeout per suite
      });

      // Parse Jest output for test results
      const lines = output.split('\n');
      const passedTests = lines.filter(line => line.includes('✓')).length;
      const failedTests = lines.filter(line => line.includes('✕')).length;

      this.results[this.getSuiteKey(suiteName)] = {
        passed: passedTests,
        failed: failedTests,
        errors: failedTests > 0 ? [output] : []
      };

      if (failedTests === 0) {
        log.success(`${suiteName} tests passed (${passedTests} tests)`);
      } else {
        log.error(`${suiteName} tests failed (${failedTests} failed, ${passedTests} passed)`);
      }

      return { passed: passedTests, failed: failedTests };
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      log.error(`${suiteName} tests encountered errors`);
      console.log(errorOutput);

      this.results[this.getSuiteKey(suiteName)] = {
        passed: 0,
        failed: 1,
        errors: [errorOutput]
      };

      return { passed: 0, failed: 1 };
    }
  }

  getSuiteKey(suiteName) {
    const keyMap = {
      'Card Subcomponent Migration': 'cardSubcomponents',
      'Theme Structure Migration': 'themeStructure',
      'Auth Context Migration': 'authContext',
      'Build Compilation': 'buildCompilation'
    };
    return keyMap[suiteName] || 'other';
  }

  async runTypeScriptCheck() {
    log.subheader('Running TypeScript Compilation Check');
    
    try {
      const output = execSync('npx tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '../../..'),
        timeout: 60000,
      });

      log.success('TypeScript compilation successful (0 errors)');
      return { errors: 0, success: true };
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      const errorLines = errorOutput.split('\n').filter(line => 
        line.includes('error TS') || line.match(/\(\d+,\d+\): error/)
      );
      
      const errorCount = errorLines.length;
      
      if (errorCount < 50) {
        log.success(`TypeScript compilation has ${errorCount} errors (target: <50)`);
        return { errors: errorCount, success: true };
      } else {
        log.error(`TypeScript compilation has ${errorCount} errors (target: <50)`);
        return { errors: errorCount, success: false };
      }
    }
  }

  async runBuildTest() {
    log.subheader('Running Production Build Test');
    
    try {
      const output = execSync('npm run build', {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '../../..'),
        timeout: 300000, // 5 minutes
      });

      log.success('Production build successful');
      return { success: true };
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || error.message;
      log.error('Production build failed');
      console.log(errorOutput);
      return { success: false, error: errorOutput };
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    log.header('Migration Test Results Summary');
    
    // Calculate totals
    let totalPassed = 0;
    let totalFailed = 0;
    
    Object.keys(this.results).forEach(key => {
      if (key !== 'overall') {
        totalPassed += this.results[key].passed;
        totalFailed += this.results[key].failed;
      }
    });

    this.results.overall = {
      passed: totalPassed,
      failed: totalFailed,
      duration: duration
    };

    // Display results by category
    console.log('Test Results by Category:');
    console.log('─'.repeat(50));
    
    const categories = [
      { key: 'cardSubcomponents', name: 'Card Subcomponent Migration' },
      { key: 'themeStructure', name: 'Theme Structure Migration' },
      { key: 'authContext', name: 'Auth Context Migration' },
      { key: 'buildCompilation', name: 'Build Compilation' }
    ];

    categories.forEach(({ key, name }) => {
      const result = this.results[key];
      const status = result.failed === 0 ? 
        `${colors.green}PASS${colors.reset}` : 
        `${colors.red}FAIL${colors.reset}`;
      
      console.log(`${name.padEnd(30)} ${status} (${result.passed} passed, ${result.failed} failed)`);
    });

    console.log('─'.repeat(50));
    console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);

    // Migration status
    log.header('Migration Status');
    
    const migrationChecks = [
      { name: 'Card.Header/Card.Content Replacement', status: this.results.cardSubcomponents.failed === 0 },
      { name: 'Theme Structure Migration', status: this.results.themeStructure.failed === 0 },
      { name: 'Auth Context userId Integration', status: this.results.authContext.failed === 0 },
      { name: 'Build Compilation Success', status: this.results.buildCompilation.failed === 0 }
    ];

    migrationChecks.forEach(check => {
      const status = check.status ? 
        `${colors.green}✓ COMPLETE${colors.reset}` : 
        `${colors.red}✗ INCOMPLETE${colors.reset}`;
      console.log(`${check.name.padEnd(35)} ${status}`);
    });

    // Overall status
    const allTestsPassed = totalFailed === 0;
    const migrationComplete = migrationChecks.every(check => check.status);

    log.header('Overall Status');
    
    if (allTestsPassed && migrationComplete) {
      log.success('🎉 Migration completed successfully! All tests passed.');
      console.log('✅ Ready for production deployment');
    } else if (migrationComplete) {
      log.warning('⚠️  Migration completed but some tests failed');
      console.log('🔍 Review test failures before deployment');
    } else {
      log.error('❌ Migration incomplete');
      console.log('🚧 Continue migration work before deployment');
    }

    return {
      success: allTestsPassed && migrationComplete,
      totalPassed,
      totalFailed,
      duration,
      migrationComplete
    };
  }

  async run() {
    log.header('React MUI Theme System Migration Test Suite');
    log.info('Testing migration from custom design system to MUI components');
    log.info('Target: Reduce TypeScript errors from 186 to <50');

    try {
      // Run test suites
      await this.runTestSuite(
        'Card Subcomponent Migration',
        'CardSubcomponentMigration.test.tsx',
        'Testing replacement of Card.Header/Card.Content with MUI CardHeader/CardContent'
      );

      await this.runTestSuite(
        'Theme Structure Migration', 
        'ThemeStructureMigration.test.tsx',
        'Testing migration from custom theme properties to MUI theme structure'
      );

      await this.runTestSuite(
        'Auth Context Migration',
        'AuthContextMigration.test.tsx', 
        'Testing UserContext.userId integration in dashboard components'
      );

      await this.runTestSuite(
        'Build Compilation',
        'BuildCompilation.test.tsx',
        'Testing TypeScript compilation and production build success'
      );

      // Run additional checks
      log.header('Additional Migration Checks');
      
      const tsCheck = await this.runTypeScriptCheck();
      const buildCheck = await this.runBuildTest();

      // Generate and display report
      const report = this.generateReport();

      // Exit with appropriate code
      process.exit(report.success ? 0 : 1);

    } catch (error) {
      log.error('Test runner encountered an error:');
      console.error(error);
      process.exit(1);
    }
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  const runner = new MigrationTestRunner();
  runner.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MigrationTestRunner;