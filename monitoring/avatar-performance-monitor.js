/**
 * @fileoverview Avatar-specific performance monitoring with response times,
 * error rates, and quality metrics.
 *
 * @version 1.0.0
 * @author Roo Code <Roo@users.noreply.github.com>
 * @copyright 2025 Commerce Studio
 */

import DataStore from '../data/data-store.js'; // Assuming a generic data store for metrics
import RealTimeDashboardService from '../analytics/real-time-dashboard-service.js';

/**
 * @class AvatarPerformanceMonitor
 * @description Monitors the real-time performance of the AI avatar.
 */
class AvatarPerformanceMonitor {
    /**
     * @constructor
     */
    constructor() {
        this.metricsStore = new DataStore('performance_metrics');
    }

    /**
     * Logs a specific performance metric for a session.
     * @param {string} sessionId - The session ID.
     * @param {string} metricName - The name of the metric (e.g., 'response_time', 'error_rate').
     * @param {number} value - The value of the metric.
     */
    logMetric(sessionId, metricName, value) {
        if (!sessionId || !metricName || typeof value !== 'number') {
            throw new Error('Session ID, metric name, and a numeric value are required.');
        }

        const metric = {
            sessionId,
            metricName,
            value,
            timestamp: new Date().toISOString(),
        };

        // Store metric and push to real-time dashboard
        this.metricsStore.append(sessionId, metric);
        RealTimeDashboardService.pushEvent('performance_update', { sessionId, [metricName]: value });
    }

    /**
     * Calculates and logs the response time for a message.
     * @param {string} sessionId - The session ID.
     * @param {Date} requestTime - The timestamp of the user's request.
     * @param {Date} responseTime - The timestamp of the avatar's response.
     */
    trackResponseTime(sessionId, requestTime, responseTime) {
        const duration = responseTime.getTime() - requestTime.getTime();
        this.logMetric(sessionId, 'response_time', duration);
    }

    /**
     * Increments the error count for a session.
     * @param {string} sessionId - The session ID.
     * @param {string} errorType - The type of error that occurred.
     */
    trackError(sessionId, errorType = 'generic') {
        // This would typically involve a more sophisticated error aggregation system.
        // For simplicity, we'll log a single event.
        this.logMetric(sessionId, 'error_count', 1);
        console.error(`Performance Monitor: Error tracked in session ${sessionId} of type ${errorType}`);
    }

    /**
     * Retrieves all performance metrics for a given session.
     * @param {string} sessionId - The session ID.
     * @returns {Promise<object[]>} A list of metric objects.
     */
    async getSessionMetrics(sessionId) {
        return await this.metricsStore.get(sessionId) || [];
    }

    /**
     * Calculates summary metrics for a batch of sessions.
     * @param {string[]} sessionIds - An array of session IDs.
     * @returns {Promise<object>} An object with summary performance data.
     */
    async getBatchMetrics(sessionIds) {
        let totalResponseTime = 0;
        let responseCount = 0;
        let totalErrors = 0;
        let totalMessages = 0; // Assuming we can get this from another service if needed

        for (const id of sessionIds) {
            const metrics = await this.getSessionMetrics(id);
            for (const metric of metrics) {
                if (metric.metricName === 'response_time') {
                    totalResponseTime += metric.value;
                    responseCount++;
                } else if (metric.metricName === 'error_count') {
                    totalErrors += metric.value;
                }
            }
            // In a real system, you'd fetch message count per session
            totalMessages += responseCount; // Approximation
        }

        const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
        const avgErrorRate = totalMessages > 0 ? totalErrors / totalMessages : 0;

        return {
            summary: {
                avgResponseTime,
                avgErrorRate,
                totalErrors,
                totalSessions: sessionIds.length,
            },
            // In a real system, you might include detailed breakdowns.
        };
    }

    /**
     * Health check for the performance monitor.
     * @returns {object} Health status.
     */
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            dependencies: ['DataStore', 'RealTimeDashboardService'],
        };
    }
}

export default new AvatarPerformanceMonitor();