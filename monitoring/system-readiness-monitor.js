/**
 * @fileoverview System Readiness Monitor for the AI Avatar Chat System.
 * This service provides real-time monitoring of system readiness and key
 * launch metrics. It continuously checks the health and performance of all
 * components and provides an aggregated view of the system's state, with
 * alerting capabilities.
 *
 * @version 1.0.0
 * @author AI-Engineer
 */

const EventEmitter = require('events');
const { logger } = require('./logger'); // Assuming a shared logger
const healthCheckService = require('../deploy/production/health-check-service');

/**
 * Represents the overall system readiness state.
 * @enum {string}
 */
const SystemReadinessState = {
  READY: 'READY',
  NOT_READY: 'NOT_READY',
  DEGRADED: 'DEGRADED',
  UNKNOWN: 'UNKNOWN',
};

class SystemReadinessMonitor extends EventEmitter {
  /**
   * @param {object} config - Monitoring configuration.
   * @param {number} config.checkInterval - The interval in milliseconds to run readiness checks.
   */
  constructor(config) {
    super();
    this.config = config;
    this.currentState = SystemReadinessState.UNKNOWN;
    this.intervalId = null;

    this.on('stateChange', this.handleStateChange);
  }

  /**
   * Starts the continuous monitoring process.
   */
  start() {
    if (this.intervalId) {
      logger.warn('System readiness monitor is already running.');
      return;
    }
    logger.info(`Starting system readiness monitor with a check interval of ${this.config.checkInterval}ms.`);
    this.intervalId = setInterval(() => this.runCheck(), this.config.checkInterval);
    this.runCheck(); // Run a check immediately on start
  }

  /**
   * Stops the monitoring process.
   */
  stop() {
    if (!this.intervalId) {
      logger.warn('System readiness monitor is not running.');
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = null;
    logger.info('System readiness monitor stopped.');
  }

  /**
   * Runs a single readiness check cycle.
   */
  async runCheck() {
    logger.info('Running system readiness check...');
    try {
      const isHealthy = await healthCheckService.runAllChecks();
      // In a real system, we would also check performance metrics from a system like Prometheus.
      const performanceMetrics = await this.getPerformanceMetrics();

      const newState = this.determineSystemState(isHealthy, performanceMetrics);

      if (newState !== this.currentState) {
        this.emit('stateChange', newState, this.currentState);
        this.currentState = newState;
      }
    } catch (error) {
      logger.error('Error during system readiness check:', { error: error.message, stack: error.stack });
      if (this.currentState !== SystemReadinessState.NOT_READY) {
        this.emit('stateChange', SystemReadinessState.NOT_READY, this.currentState);
        this.currentState = SystemReadinessState.NOT_READY;
      }
    }
  }

  /**
   * Fetches performance metrics from a monitoring system.
   * @returns {Promise<object>} An object with key performance indicators.
   */
  async getPerformanceMetrics() {
    // Placeholder for fetching metrics from Prometheus, DataDog, etc.
    logger.debug('Fetching performance metrics...');
    return {
      avgResponseTime: Math.random() * 200, // Simulate value
      errorRate: Math.random() * 1, // Simulate value
    };
  }

  /**
   * Determines the overall system state based on health and performance.
   * @param {boolean} isHealthy - The result from the health check service.
   * @param {object} performanceMetrics - Key performance indicators.
   * @returns {SystemReadinessState} The calculated system readiness state.
   */
  determineSystemState(isHealthy, performanceMetrics) {
    if (!isHealthy) {
      return SystemReadinessState.NOT_READY;
    }
    // Example logic for DEGRADED state based on performance
    if (performanceMetrics.avgResponseTime > 180 || performanceMetrics.errorRate > 0.8) {
      return SystemReadinessState.DEGRADED;
    }
    return SystemReadinessState.READY;
  }

  /**
   * Handles changes in the system readiness state, primarily for alerting.
   * @param {SystemReadinessState} newState - The new state.
   * @param {SystemReadinessState} oldState - The previous state.
   */
  handleStateChange(newState, oldState) {
    const message = `System readiness state changed from ${oldState} to ${newState}.`;
    logger.info(message);

    // Trigger alerts for negative state changes
    if (newState === SystemReadinessState.NOT_READY || newState === SystemReadinessState.DEGRADED) {
      this.triggerAlert(newState, message);
    }
  }

  /**
   * Triggers an alert.
   * @param {SystemReadinessState} state - The state that triggered the alert.
   * @param {string} message - The alert message.
   */
  triggerAlert(state, message) {
    const severity = (state === SystemReadinessState.NOT_READY) ? 'CRITICAL' : 'WARNING';
    logger.warn('Triggering Alert!', {
      severity,
      message,
      timestamp: new Date().toISOString(),
    });
    // Placeholder for integration with an alerting system (e.g., Slack, PagerDuty)
  }
}

// Example usage:
if (require.main === module) {
  const monitorConfig = {
    checkInterval: 30000, // 30 seconds
  };
  const monitor = new SystemReadinessMonitor(monitorConfig);
  monitor.start();

  // Gracefully shut down
  process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
  });
}

module.exports = SystemReadinessMonitor;