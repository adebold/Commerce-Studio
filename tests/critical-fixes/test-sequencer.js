/**
 * @fileoverview Test Sequencer for Critical Fixes
 * Ensures critical tests run in the correct order for optimal failure detection
 */

const Sequencer = require('@jest/test-sequencer').default;

class CriticalFixesSequencer extends Sequencer {
  sort(tests) {
    // Define test priority order (highest priority first)
    const testPriority = {
      'memory-leak-timeout-handler': 1,    // Memory leaks are critical
      'input-validation-security': 2,      // Security vulnerabilities are critical
      'connection-race-condition': 3,      // Race conditions cause instability
      'interface-consistency-error-recovery': 4, // Interface issues affect reliability
      'performance-memory-leak': 5         // Performance issues are important but not blocking
    };

    // Sort tests by priority, then alphabetically
    return tests.sort((testA, testB) => {
      const priorityA = this.getTestPriority(testA.path, testPriority);
      const priorityB = this.getTestPriority(testB.path, testPriority);

      // Sort by priority first
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort alphabetically
      return testA.path.localeCompare(testB.path);
    });
  }

  getTestPriority(testPath, priorities) {
    // Extract test name from path
    for (const [testName, priority] of Object.entries(priorities)) {
      if (testPath.includes(testName)) {
        return priority;
      }
    }
    
    // Default priority for unknown tests
    return 999;
  }
}

module.exports = CriticalFixesSequencer;