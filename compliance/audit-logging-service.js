/**
 * @fileoverview Comprehensive audit logging service for compliance requirements.
 * @module compliance/audit-logging-service
 */

const securityMonitoringService = require('../security/security-monitoring-service');

/**
 * Provides methods for creating detailed audit logs for user actions and system events.
 */
class AuditLoggingService {
  /**
   * Logs a user action or system event for audit purposes.
   * @param {object} options - The audit log options.
   * @param {string} options.userId - The ID of the user performing the action (or 'system' for system events).
   * @param {string} options.action - The action being performed (e.g., 'login', 'update_profile', 'delete_data').
   * @param {string} options.outcome - The outcome of the action ('success' or 'failure').
   * @param {object} [options.details] - Additional details about the event (e.g., IP address, target resource).
   */
  log(options) {
    const { userId, action, outcome, details = {} } = options;

    if (!userId || !action || !outcome) {
      console.error('Audit log is missing required fields (userId, action, outcome).');
      return;
    }

    const auditEvent = {
      actor: {
        type: userId === 'system' ? 'system' : 'user',
        id: userId,
      },
      action,
      object: {
        type: details.resourceType, // e.g., 'user_profile', 'conversation'
        id: details.resourceId,
      },
      outcome,
      timestamp: new Date().toISOString(),
      context: {
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
      },
      details: details.additionalInfo,
    };

    // Use the security monitoring service to write the log.
    // This centralizes log handling and ensures audit logs are processed like other security events.
    securityMonitoringService.logEvent('info', `audit_${action}`, auditEvent);
  }

  /**
   * Express middleware to automatically log requests.
   * @returns {function} Express middleware function.
   */
  auditRequestMiddleware() {
    return (req, res, next) => {
      const originalSend = res.send;

      res.send = (...args) => {
        const outcome = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure';

        this.log({
          userId: (req.user ? req.user.id : 'anonymous'),
          action: `${req.method} ${req.originalUrl}`,
          outcome: outcome,
          details: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            resourceType: 'http_request',
            resourceId: req.originalUrl,
            additionalInfo: {
              statusCode: res.statusCode,
              requestBody: req.body,
            },
          },
        });

        return originalSend.apply(res, args);
      };

      next();
    };
  }
}

module.exports = new AuditLoggingService();