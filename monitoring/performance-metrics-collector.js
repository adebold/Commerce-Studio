/**
 * @fileoverview Real-time performance metrics collection and alerting.
 * Collects and exposes key performance indicators (KPIs) for monitoring systems like Prometheus.
 * @module monitoring/performance-metrics-collector
 */

const client = require('prom-client');
const responseTime = require('response-time');

class PerformanceMetricsCollector {
    /**
     * Initializes the Performance Metrics Collector.
     */
    constructor() {
        this.register = new client.Registry();
        client.collectDefaultMetrics({ register: this.register, prefix: 'avatar_chat_' });

        this.defineMetrics();
        console.log('PerformanceMetricsCollector initialized.');
    }

    /**
     * Defines custom metrics for the application.
     */
    defineMetrics() {
        this.metrics = {
            httpRequestDurationMicroseconds: new client.Histogram({
                name: 'http_request_duration_ms',
                help: 'Duration of HTTP requests in ms',
                labelNames: ['method', 'route', 'code'],
                buckets: [50, 100, 200, 500, 1000, 2500, 5000], // Buckets for response time from 50ms to 5s
            }),
            dbQueryDurationMicroseconds: new client.Histogram({
                name: 'db_query_duration_ms',
                help: 'Duration of database queries in ms',
                labelNames: ['query_type'],
                buckets: [10, 50, 100, 250, 500],
            }),
            cacheHitRate: new client.Counter({
                name: 'cache_hits_total',
                help: 'Total number of cache hits',
                labelNames: ['cache_type'],
            }),
            cacheMissRate: new client.Counter({
                name: 'cache_misses_total',
                help: 'Total number of cache misses',
                labelNames: ['cache_type'],
            }),
            activeConnections: new client.Gauge({
                name: 'active_connections',
                help: 'Number of active connections',
                labelNames: ['connection_type'], // e.g., 'http', 'websocket'
            }),
            errorRate: new client.Counter({
                name: 'errors_total',
                help: 'Total number of errors',
                labelNames: ['error_type'], // e.g., 'db', 'api', 'cdn'
            }),
        };

        for (const metric of Object.values(this.metrics)) {
            this.register.registerMetric(metric);
        }
    }

    /**
     * Returns middleware to measure HTTP request duration.
     * @returns {function} Express middleware.
     */
    getHttpRequestDurationMiddleware() {
        return responseTime((req, res, time) => {
            if (req.route) {
                this.metrics.httpRequestDurationMicroseconds
                    .labels(req.method, req.route.path, res.statusCode)
                    .observe(time);
            }
        });
    }

    /**
     * Increments the cache hit counter.
     * @param {string} cacheType - The type of cache (e.g., 'redis', 'cdn').
     */
    incrementCacheHit(cacheType) {
        this.metrics.cacheHitRate.inc({ cache_type: cacheType });
    }

    /**
     * Increments the cache miss counter.
     * @param {string} cacheType - The type of cache (e.g., 'redis', 'cdn').
     */
    incrementCacheMiss(cacheType) {
        this.metrics.cacheMissRate.inc({ cache_type: cacheType });
    }

    /**
     * Increments the error counter.
     * @param {string} errorType - The type of error (e.g., 'db', 'api').
     */
    incrementError(errorType) {
        this.metrics.errorRate.inc({ error_type: errorType });
    }

    /**
     * Records the duration of a database query.
     * @param {string} queryType - A label for the type of query (e.g., 'select_user').
     * @param {number} durationMs - The duration of the query in milliseconds.
     */
    recordDbQueryDuration(queryType, durationMs) {
        this.metrics.dbQueryDurationMicroseconds
            .labels(queryType)
            .observe(durationMs);
    }

    /**
     * Sets the gauge for active connections.
     * @param {string} connectionType - The type of connection.
     * @param {number} value - The number of active connections.
     */
    setActiveConnections(connectionType, value) {
        this.metrics.activeConnections.set({ connection_type: connectionType }, value);
    }

    /**
     * Returns middleware to expose metrics for Prometheus scraping.
     * @returns {function} Express middleware.
     */
    getMetricsEndpoint() {
        return async (req, res) => {
            res.set('Content-Type', this.register.contentType);
            res.end(await this.register.metrics());
        };
    }
}

const performanceMetricsCollector = new PerformanceMetricsCollector();

module.exports = performanceMetricsCollector;