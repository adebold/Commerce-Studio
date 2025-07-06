const EventEmitter = require('events');

/**
 * @class AvatarBehaviorOptimizer
 * @description Optimizes avatar behavior patterns based on user engagement metrics.
 * @extends EventEmitter
 */
class AvatarBehaviorOptimizer extends EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.userEngagementScores = new Map();
    this.behaviorModels = {
      default: {
        greeting: "Hello! How can I help you today?",
        farewell: "Goodbye! Have a great day.",
        emotionResponse: { happy: 'smile', sad: 'concerned' }
      }
    };
    this.abTests = new Map();
    console.log('AvatarBehaviorOptimizer initialized.');
  }

  /**
   * Tracks user engagement for a session.
   * @param {string} sessionId - The session identifier.
   * @param {string} event - The engagement event (e.g., 'click', 'long_gaze', 'positive_feedback').
   * @param {number} value - The value associated with the event.
   */
  trackEngagement(sessionId, event, value) {
    if (!this.userEngagementScores.has(sessionId)) {
      this.userEngagementScores.set(sessionId, { totalScore: 0, events: [] });
    }

    const sessionData = this.userEngagementScores.get(sessionId);
    sessionData.totalScore += value;
    sessionData.events.push({ event, value, timestamp: new Date() });

    this.emit('engagement-updated', { sessionId, score: sessionData.totalScore });
  }

  /**
   * Adapts avatar behavior based on accumulated engagement scores.
   * @param {string} sessionId - The session identifier.
   */
  adaptBehavior(sessionId) {
    const sessionData = this.userEngagementScores.get(sessionId);
    if (!sessionData || !sessionData.totalScore) {
      return; // Not enough data to adapt
    }

    try {
      // Placeholder for a more complex adaptation model.
      // This could adjust response tone, proactivity, or expression frequency.
      let newBehaviorKey = 'default';
      if (sessionData.totalScore > 100) { // Example threshold
        newBehaviorKey = 'highly-engaged';
        if (!this.behaviorModels[newBehaviorKey]) {
          this.behaviorModels[newBehaviorKey] = { ...this.behaviorModels.default, proactivity: 'high' };
        }
      } else if (sessionData.totalScore < 20) {
        newBehaviorKey = 'less-engaged';
        if (!this.behaviorModels[newBehaviorKey]) {
          this.behaviorModels[newBehaviorKey] = { ...this.behaviorModels.default, proactivity: 'low' };
        }
      }

      this.emit('behavior-adapted', { sessionId, newBehaviorKey, model: this.behaviorModels[newBehaviorKey] });
      return this.behaviorModels[newBehaviorKey];
    } catch (error) {
      this.emit('error', new Error(`Failed to adapt behavior for session ${sessionId}: ${error.message}`));
    }
  }

  /**
   * Creates an A/B test for a specific avatar behavior.
   * @param {string} testName - The name of the test.
   * @param {string} behaviorName - The name of the behavior to test (e.g., 'greeting').
   * @param {Array<object>} variants - An array of variants to test. Each object should have `id` and `value`.
   * @returns {string} The ID of the created A/B test.
   */
  createABTest(testName, behaviorName, variants) {
    const testId = `test_${Date.now()}`;
    if (this.abTests.has(testName)) {
      this.emit('error', new Error(`A/B test with name "${testName}" already exists.`));
      return null;
    }

    const test = {
      id: testId,
      name: testName,
      behaviorName,
      variants: variants.map(v => ({ ...v, impressions: 0, conversions: 0 })),
      isActive: true,
    };

    this.abTests.set(testName, test);
    this.emit('ab-test-created', { testId, testName });
    return testId;
  }

  /**
   * Gets a variant for a user for a specific A/B test.
   * @param {string} testName - The name of the test.
   * @param {string} userId - The user identifier.
   * @returns {object|null} The variant to show the user.
   */
  getTestVariant(testName, userId) {
    const test = this.abTests.get(testName);
    if (!test || !test.isActive) {
      return null;
    }

    // Simple bucketing based on userId hash to ensure user sees the same variant.
    const hash = this.hashCode(userId);
    const variantIndex = hash % test.variants.length;
    const variant = test.variants[variantIndex];
    variant.impressions++;

    this.emit('variant-assigned', { testName, userId, variantId: variant.id });
    return variant;
  }

  /**
   * Records a conversion for an A/B test variant.
   * @param {string} testName - The name of the test.
   * @param {string} variantId - The ID of the variant that converted.
   */
  recordTestConversion(testName, variantId) {
    const test = this.abTests.get(testName);
    if (!test) return;

    const variant = test.variants.find(v => v.id === variantId);
    if (variant) {
      variant.conversions++;
      this.emit('test-conversion-recorded', { testName, variantId });
    }
  }

  /**
   * Analyzes the results of an A/B test and determines a winner.
   * @param {string} testName - The name of the test.
   * @returns {object|null} The winning variant or null if inconclusive.
   */
  getTestResults(testName) {
    const test = this.abTests.get(testName);
    if (!test) return null;

    // Placeholder for statistical significance calculation (e.g., Chi-Squared test).
    // For now, we'll just pick the one with the highest conversion rate.
    let winner = null;
    let maxConversionRate = -1;

    test.variants.forEach(variant => {
      const conversionRate = variant.impressions > 0 ? variant.conversions / variant.impressions : 0;
      if (conversionRate > maxConversionRate) {
        maxConversionRate = conversionRate;
        winner = variant;
      }
    });

    this.emit('ab-test-results-analyzed', { testName, winner });
    return winner;
  }

  /**
   * Simple string hash function.
   * @param {string} str - The string to hash.
   * @returns {number} The hash code.
   * @private
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

module.exports = AvatarBehaviorOptimizer;