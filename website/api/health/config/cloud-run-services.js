/**
 * Cloud Run Services Configuration
 * Defines the 4 Cloud Run services to monitor
 */

const CLOUD_RUN_SERVICES = {
  'virtual-try-on': {
    id: 'virtual-try-on',
    name: 'Virtual Try On Application',
    description: 'AI-powered virtual eyewear try-on service',
    url: process.env.VIRTUAL_TRY_ON_URL || 'https://virtual-try-on-service.run.app',
    healthEndpoints: {
      basic: '/health',
      detailed: '/health/detailed',
      dependencies: '/health/dependencies'
    },
    expectedResponseTime: 2000, // 2 seconds
    criticalService: true,
    dependencies: ['database', 'storage', 'ml-api'],
    tags: ['ai', 'computer-vision', 'customer-facing']
  },
  
  'pupillary-distance': {
    id: 'pupillary-distance',
    name: 'Pupillary Distance Tools',
    description: 'Precision measurement tools for pupillary distance calculation',
    url: process.env.PUPILLARY_DISTANCE_URL || 'https://pupillary-distance-tools.run.app',
    healthEndpoints: {
      basic: '/health',
      calibration: '/health/calibration',
      performance: '/health/performance'
    },
    expectedResponseTime: 1500, // 1.5 seconds
    criticalService: true,
    dependencies: ['camera-api', 'calibration-service'],
    tags: ['measurement', 'precision', 'customer-facing']
  },
  
  'eyewear-fitting': {
    id: 'eyewear-fitting',
    name: 'Eyewear Fitting Height Tool',
    description: 'Advanced fitting algorithms for optimal eyewear positioning',
    url: process.env.EYEWEAR_FITTING_URL || 'https://eyewear-fitting-height.run.app',
    healthEndpoints: {
      basic: '/health',
      accuracy: '/health/accuracy',
      resources: '/health/resources'
    },
    expectedResponseTime: 1800, // 1.8 seconds
    criticalService: true,
    dependencies: ['face-detection-api', 'fitting-algorithm'],
    tags: ['fitting', 'algorithm', 'customer-facing']
  },
  
  'glb-directory': {
    id: 'glb-directory',
    name: 'GLB Directory Service',
    description: '3D model directory service for virtual try-on assets',
    url: process.env.GLB_DIRECTORY_URL || 'https://glb-directory-service.run.app',
    healthEndpoints: {
      basic: '/health',
      storage: '/health/storage',
      cdn: '/health/cdn'
    },
    expectedResponseTime: 1000, // 1 second
    criticalService: false,
    dependencies: ['cloud-storage', 'cdn', 'asset-pipeline'],
    tags: ['3d-models', 'assets', 'storage']
  }
};

/**
 * Health check configuration for all services
 */
const HEALTH_CHECK_CONFIG = {
  intervals: {
    basic: 30000,      // 30 seconds - basic health checks
    detailed: 300000,  // 5 minutes - detailed health checks
    dependencies: 600000 // 10 minutes - dependency checks
  },
  
  thresholds: {
    response_time: 2000,    // 2 seconds max response time
    error_rate: 5,          // 5% max error rate
    cpu_usage: 80,          // 80% max CPU usage
    memory_usage: 85,       // 85% max memory usage
    availability: 99.5      // 99.5% minimum availability
  },
  
  retry: {
    attempts: 3,            // Retry failed health checks 3 times
    backoff: 5000,          // 5 second backoff between retries
    timeout: 10000          // 10 second timeout per request
  },
  
  alerting: {
    escalation_delay: 900000, // 15 minutes before escalation
    notification_channels: ['email', 'slack'],
    severity_levels: {
      critical: {
        conditions: ['service_down', 'high_error_rate'],
        notify_immediately: true,
        escalate_after: 300000 // 5 minutes
      },
      warning: {
        conditions: ['slow_response', 'resource_usage'],
        notify_immediately: false,
        escalate_after: 900000 // 15 minutes
      },
      info: {
        conditions: ['dependency_degraded'],
        notify_immediately: false,
        escalate_after: 1800000 // 30 minutes
      }
    }
  }
};

/**
 * Service status definitions
 */
const SERVICE_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown'
};

/**
 * Alert severity levels
 */
const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Alert status types
 */
const ALERT_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved'
};

/**
 * Metric types tracked for each service
 */
const METRIC_TYPES = {
  RESPONSE_TIME: 'response_time_ms',
  ERROR_RATE: 'error_rate_percent',
  CPU_USAGE: 'cpu_usage_percent',
  MEMORY_USAGE: 'memory_usage_percent',
  ACTIVE_CONNECTIONS: 'active_connections',
  REQUESTS_PER_MINUTE: 'requests_per_minute',
  UPTIME: 'uptime_seconds',
  AVAILABILITY: 'availability_percent'
};

/**
 * Get service configuration by ID
 * @param {string} serviceId - The service identifier
 * @returns {Object|null} Service configuration or null if not found
 */
function getServiceConfig(serviceId) {
  return CLOUD_RUN_SERVICES[serviceId] || null;
}

/**
 * Get all service configurations
 * @returns {Object} All service configurations
 */
function getAllServiceConfigs() {
  return CLOUD_RUN_SERVICES;
}

/**
 * Get list of critical services
 * @returns {Array} Array of critical service IDs
 */
function getCriticalServices() {
  return Object.keys(CLOUD_RUN_SERVICES).filter(
    serviceId => CLOUD_RUN_SERVICES[serviceId].criticalService
  );
}

/**
 * Get services by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} Array of service IDs with the specified tag
 */
function getServicesByTag(tag) {
  return Object.keys(CLOUD_RUN_SERVICES).filter(
    serviceId => CLOUD_RUN_SERVICES[serviceId].tags.includes(tag)
  );
}

/**
 * Validate service configuration
 * @param {Object} config - Service configuration to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateServiceConfig(config) {
  const requiredFields = ['id', 'name', 'url', 'healthEndpoints'];
  return requiredFields.every(field => config.hasOwnProperty(field));
}

/**
 * Get health endpoint URL for a service
 * @param {string} serviceId - Service identifier
 * @param {string} endpointType - Type of health endpoint (basic, detailed, etc.)
 * @returns {string|null} Full URL to health endpoint or null if not found
 */
function getHealthEndpointUrl(serviceId, endpointType = 'basic') {
  const service = getServiceConfig(serviceId);
  if (!service || !service.healthEndpoints[endpointType]) {
    return null;
  }
  
  return `${service.url}${service.healthEndpoints[endpointType]}`;
}

/**
 * Get expected response time for a service
 * @param {string} serviceId - Service identifier
 * @returns {number} Expected response time in milliseconds
 */
function getExpectedResponseTime(serviceId) {
  const service = getServiceConfig(serviceId);
  return service ? service.expectedResponseTime : HEALTH_CHECK_CONFIG.thresholds.response_time;
}

/**
 * Check if service is critical
 * @param {string} serviceId - Service identifier
 * @returns {boolean} True if service is critical
 */
function isCriticalService(serviceId) {
  const service = getServiceConfig(serviceId);
  return service ? service.criticalService : false;
}

module.exports = {
  CLOUD_RUN_SERVICES,
  HEALTH_CHECK_CONFIG,
  SERVICE_STATUS,
  ALERT_SEVERITY,
  ALERT_STATUS,
  METRIC_TYPES,
  getServiceConfig,
  getAllServiceConfigs,
  getCriticalServices,
  getServicesByTag,
  validateServiceConfig,
  getHealthEndpointUrl,
  getExpectedResponseTime,
  isCriticalService
};