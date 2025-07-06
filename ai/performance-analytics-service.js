const EventEmitter = require('events');

/**
 * @class PerformanceAnalyticsService
 * @description Tracks conversation performance and identifies optimization opportunities.
 * @extends EventEmitter
 */
class PerformanceAnalyticsService extends EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.metrics = {
      totalConversations: 0,
      successfulConversations: 0,
      averageConversationDuration: 0,
      averageResponseTime: 0,
      userSentimentHistory: [],
      errorRate: 0,
    };
    this.conversationData = [];
    console.log('PerformanceAnalyticsService initialized.');
  }

  /**
   * Tracks a specific metric for a completed conversation.
   * @param {object} data - The data for the completed conversation.
   * e.g., { sessionId, duration, responseTimes, userSatisfaction, wasSuccessful, errorOccurred }
   */
  logConversation(data) {
    if (!data || !data.sessionId) {
      this.emit('error', new Error('Invalid conversation data provided for logging.'));
      return;
    }

    try {
      this.conversationData.push(data);
      this.recalculateMetrics();
      this.emit('metrics-updated', this.getRealTimeMetrics());

      const recommendations = this.getOptimizationRecommendations();
      if (recommendations.length > 0) {
        this.emit('new-recommendations', { recommendations });
      }
    } catch (error) {
      this.emit('error', new Error(`Failed to log conversation ${data.sessionId}: ${error.message}`));
    }
  }

  /**
   * Recalculates aggregate metrics based on all logged conversation data.
   * @private
   */
  recalculateMetrics() {
    const numConversations = this.conversationData.length;
    if (numConversations === 0) return;

    this.metrics.totalConversations = numConversations;

    this.metrics.successfulConversations = this.conversationData.filter(c => c.wasSuccessful).length;

    const totalDuration = this.conversationData.reduce((sum, c) => sum + c.duration, 0);
    this.metrics.averageConversationDuration = totalDuration / numConversations;

    const allResponseTimes = this.conversationData.flatMap(c => c.responseTimes || []);
    if (allResponseTimes.length > 0) {
      const totalResponseTime = allResponseTimes.reduce((sum, time) => sum + time, 0);
      this.metrics.averageResponseTime = totalResponseTime / allResponseTimes.length;
    }

    this.metrics.userSentimentHistory = this.conversationData.map(c => ({
      sessionId: c.sessionId,
      satisfaction: c.userSatisfaction
    }));
    
    const errors = this.conversationData.filter(c => c.errorOccurred).length;
    this.metrics.errorRate = errors / numConversations;
  }

  /**
   * Returns the current real-time performance metrics.
   * @returns {object} The current metrics.
   */
  getRealTimeMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalConversations > 0 ?
        this.metrics.successfulConversations / this.metrics.totalConversations : 0,
      currentSentiment: this.metrics.userSentimentHistory.length > 0 ?
        this.metrics.userSentimentHistory.slice(-1)[0].satisfaction : null,
    };
  }

  /**
   * Generates optimization recommendations based on current metrics.
   * @returns {Array<string>} A list of recommendation strings.
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    const currentMetrics = this.getRealTimeMetrics();

    if (currentMetrics.successRate < 0.7 && currentMetrics.totalConversations > 20) {
      recommendations.push(
        `Conversation success rate is low (${(currentMetrics.successRate * 100).toFixed(1)}%). ` +
        `Consider reviewing conversation logs for common failure points.`
      );
    }

    if (currentMetrics.averageResponseTime > 3000) { // > 3 seconds
      recommendations.push(
        `Average response time is high (${(currentMetrics.averageResponseTime / 1000).toFixed(2)}s). ` +
        `Investigate backend service performance and query optimization.`
      );
    }

    if (currentMetrics.errorRate > 0.1 && currentMetrics.totalConversations > 10) {
      recommendations.push(
        `Error rate is high (${(currentMetrics.errorRate * 100).toFixed(1)}%). ` +
        `Check logs for recurring exceptions or integration failures.`
      );
    }
    
    const recentSentiments = this.metrics.userSentimentHistory.slice(-10).map(s => s.satisfaction);
    if (recentSentiments.length === 10) {
        const averageRecentSentiment = recentSentiments.reduce((a, b) => a + b, 0) / 10;
        if (averageRecentSentiment < 0.6) {
            recommendations.push(
                `Average user satisfaction has been trending down recently. ` +
                `Review recent interactions for changes in user experience.`
            );
        }
    }

    return recommendations;
  }
}

module.exports = PerformanceAnalyticsService;