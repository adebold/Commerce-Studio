/**
 * @fileoverview Health Check Service for the AI Avatar Chat System.
 * This service performs comprehensive health checks on all critical components
 * of the system, including NVIDIA services, core avatar services, analytics,
 * and security components. It is used by the deployment orchestrator to ensure
 * system readiness before and after deployments.
 *
 * @version 1.0.0
 * @author AI-Engineer
 */

const axios = require('axios');
const { logger } = require('../../monitoring/logger'); // Assuming a shared logger

/**
 * Represents the status of a service.
 * @enum {string}
 */
const ServiceStatus = {
  HEALTHY: 'HEALTHY',
  UNHEALTHY: 'UNHEALTHY',
  DEGRADED: 'DEGRADED',
};

/**
 * Configuration for services to be checked.
 * In a real application, this would come from a config file or service discovery.
 */
const servicesToMonitor = {
  nvidia: [
    { name: 'Omniverse Avatar Service', endpoint: 'http://nvidia-omniverse-avatar.internal/health' },
    { name: 'Riva Speech Service', endpoint: 'http://nvidia-riva-speech.internal/health' },
    { name: 'Merlin Conversation Service', endpoint: 'http://nvidia-merlin-conv.internal/health' },
  ],
  avatar: [
    { name: 'Avatar Manager', endpoint: 'http://avatar-manager.internal/health' },
    { name: 'Multi-Modal Input Processor', endpoint: 'http://multi-modal-input.internal/health' },
  ],
  analytics: [
    { name: 'Conversation Analytics Engine', endpoint: 'http://conv-analytics.internal/health' },
  ],
  security: [
    { name: 'Authentication Service', endpoint: 'http://auth-service.internal/health' },
  ],
};

class HealthCheckService {
  constructor() {
    this.timeout = 5000; // 5 seconds
  }

  /**
   * Runs all health checks for a given environment type.
   * @param {string} environmentType - 'active' or 'inactive' to adjust endpoints if needed.
   * @returns {Promise<boolean>} True if all checks pass, false otherwise.
   */
  async runAllChecks(environmentType = 'active') {
    logger.info(`Running all health checks for the '${environmentType}' environment.`);
    const allChecks = [];

    for (const category in servicesToMonitor) {
      servicesToMonitor[category].forEach(service => {
        // Adjust endpoint for blue-green if necessary
        const endpoint = this.getEndpointForEnvironment(service.endpoint, environmentType);
        allChecks.push(this.checkService(service.name, endpoint));
      });
    }

    const results = await Promise.all(allChecks);
    const isOverallHealthy = results.every(result => result.status === ServiceStatus.HEALTHY);

    if (isOverallHealthy) {
      logger.info(`Overall system health is ${ServiceStatus.HEALTHY} for '${environmentType}'.`);
    } else {
      logger.error(`Overall system health is ${ServiceStatus.UNHEALTHY} for '${environmentType}'.`);
      results.filter(r => r.status !== ServiceStatus.HEALTHY).forEach(r => {
          logger.warn(`- ${r.service}: ${r.status} - ${r.details}`);
      });
    }

    return isOverallHealthy;
  }

  /**
   * Checks the health of a single service.
   * @param {string} serviceName - The name of the service.
   * @param {string} endpoint - The health check endpoint of the service.
   * @returns {Promise<{service: string, status: ServiceStatus, details: string}>} The health status of the service.
   */
  async checkService(serviceName, endpoint) {
    try {
      const response = await axios.get(endpoint, { timeout: this.timeout });
      if (response.status === 200 && response.data.status === 'UP') {
        return { service: serviceName, status: ServiceStatus.HEALTHY, details: 'Service is responsive and healthy.' };
      }
      return { service: serviceName, status: ServiceStatus.UNHEALTHY, details: `Unexpected response: ${response.status}` };
    } catch (error) {
      let details;
      if (error.code === 'ECONNABORTED') {
        details = `Health check timed out after ${this.timeout}ms.`;
      } else if (error.response) {
        details = `Service returned status ${error.response.status}.`;
      } else {
        details = `Failed to connect to service: ${error.message}.`;
      }
      logger.warn(`Health check for ${serviceName} at ${endpoint} failed. Details: ${details}`);
      return { service: serviceName, status: ServiceStatus.UNHEALTHY, details };
    }
  }

  /**
   * Adjusts the service endpoint for blue-green deployments.
   * @param {string} baseEndpoint - The base internal endpoint.
   * @param {string} environmentType - 'active' or 'inactive'.
   * @returns {string} The adjusted endpoint.
   */
  getEndpointForEnvironment(baseEndpoint, environmentType) {
    if (environmentType === 'inactive') {
      // In a real blue-green setup, the inactive environment might have a different DNS name or port.
      // e.g., http://service.inactive.internal or http://service:8081
      // For simulation, we'll just log it.
      logger.debug(`Mapping endpoint ${baseEndpoint} to inactive environment.`);
    }
    return baseEndpoint;
  }
}

const healthCheckService = new HealthCheckService();

// Example usage:
if (require.main === module) {
  healthCheckService.runAllChecks().catch(err => {
      logger.error("Health check service failed unexpectedly.", { error: err });
  });
}

module.exports = healthCheckService;