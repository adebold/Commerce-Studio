/**
 * @fileoverview Custom Jest Matchers for Critical Fixes
 * Specialized matchers for testing memory leaks, performance, and security
 */

// Custom matcher for memory leak detection
expect.extend({
  toHaveMemoryLeak(received, maxGrowth = 10 * 1024 * 1024) {
    const memoryGrowth = received.final - received.initial;
    const pass = memoryGrowth < maxGrowth;
    
    if (pass) {
      return {
        message: () => `Expected memory growth ${memoryGrowth} to exceed ${maxGrowth}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected memory growth ${memoryGrowth} to be less than ${maxGrowth}`,
        pass: false,
      };
    }
  },

  toBeWithinPerformanceThreshold(received, baseline, threshold = 1.5) {
    const ratio = received / baseline;
    const pass = ratio <= threshold;
    
    if (pass) {
      return {
        message: () => `Expected performance ratio ${ratio} to exceed threshold ${threshold}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected performance ratio ${ratio} to be within threshold ${threshold}`,
        pass: false,
      };
    }
  },

  toBeSecureInput(received) {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /DROP\s+TABLE/i,
      /INSERT\s+INTO/i,
      /DELETE\s+FROM/i
    ];
    
    const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(received));
    const pass = !hasDangerousContent;
    
    if (pass) {
      return {
        message: () => `Expected "${received}" to contain dangerous patterns`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected "${received}" to be secure (no dangerous patterns)`,
        pass: false,
      };
    }
  },

  toHaveCleanedUpTimeouts(received) {
    const pass = received.size === 0;
    
    if (pass) {
      return {
        message: () => `Expected timeout map to have active timeouts`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected all timeouts to be cleaned up, but ${received.size} remain`,
        pass: false,
      };
    }
  },

  toHaveConsistentInterface(received, expected) {
    const receivedKeys = Object.keys(received).sort();
    const expectedKeys = Object.keys(expected).sort();
    const pass = JSON.stringify(receivedKeys) === JSON.stringify(expectedKeys);
    
    if (pass) {
      return {
        message: () => `Expected interfaces to be different`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected interfaces to match. Received: ${receivedKeys.join(', ')}, Expected: ${expectedKeys.join(', ')}`,
        pass: false,
      };
    }
  }
});