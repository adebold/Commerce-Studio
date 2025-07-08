/**
 * @fileoverview Database optimization service for query optimization and connection pooling.
 * Uses a connection pool to manage database connections efficiently and provides utilities
 * for optimizing and analyzing database queries.
 * @module performance/database-optimization-service
 */

const { Pool } = require('pg'); // Using 'pg' for PostgreSQL as an example

/**
 * @typedef {object} DbConfig
 * @property {string} connectionString - Database connection string.
 * @property {number} maxConnections - Maximum number of connections in the pool.
 * @property {number} idleTimeoutMillis - How long a client is allowed to remain idle before being closed.
 * @property {number} connectionTimeoutMillis - How long to wait for a connection from the pool.
 */

class DatabaseOptimizationService {
    /**
     * Initializes the Database Optimization Service.
     * @param {DbConfig} config - Database configuration.
     */
    constructor(config) {
        this.config = {
            connectionString: process.env.DATABASE_URL,
            maxConnections: process.env.DB_MAX_CONNECTIONS || 20,
            idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
            connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
            ...config,
        };

        if (!this.config.connectionString) {
            console.warn('Database service is not configured. No database connection pool will be created.');
            this.pool = null;
        } else {
            this.pool = new Pool(this.config);
            this.pool.on('error', (err, client) => {
                console.error('Unexpected error on idle client', err);
                // Graceful degradation: The app can continue running, but new queries might fail.
            });
            console.log('DatabaseOptimizationService initialized with connection pool.');
        }
    }

    /**
     * Executes a query using a client from the connection pool.
     * @param {string} text - The SQL query text.
     * @param {Array<any>} [params] - Parameters for the query.
     * @returns {Promise<object>} The query result.
     */
    async query(text, params) {
        if (!this.pool) {
            throw new Error('Database not configured.');
        }
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            if (duration > 100) { // Log slow queries
                console.warn(`Slow query detected (${duration}ms): ${text.substring(0, 100)}...`);
            }
            return res;
        } catch (error) {
            console.error('Database query error:', error);
            throw error; // Re-throw to be handled by the caller
        }
    }

    /**
     * Gets a client from the pool for a transaction.
     * @returns {Promise<import('pg').PoolClient>} A database client.
     */
    async getClient() {
        if (!this.pool) {
            throw new Error('Database not configured.');
        }
        const client = await this.pool.connect();
        return client;
    }

    /**
     * Analyzes a query's performance using EXPLAIN ANALYZE.
     * This should be used in development/staging, not production.
     * @param {string} sql - The SQL query to analyze.
     * @returns {Promise<string>} The query plan analysis.
     */
    async analyzeQuery(sql) {
        if (process.env.NODE_ENV === 'production') {
            return 'Query analysis is disabled in production.';
        }
        try {
            const { rows } = await this.query(`EXPLAIN ANALYZE ${sql}`);
            return rows.map(row => row['QUERY PLAN']).join('\n');
        } catch (error) {
            console.error(`Error analyzing query: ${sql}`, error);
            return `Failed to analyze query: ${error.message}`;
        }
    }

    /**
     * Paginates results for large datasets to avoid memory overload.
     * @param {string} baseQuery - The base SQL query without LIMIT and OFFSET.
     * @param {object} options - Pagination options.
     * @param {number} [options.page=1] - The current page.
     * @param {number} [options.pageSize=25] - The number of items per page.
     * @param {Array<any>} [options.params=[]] - Parameters for the base query.
     * @returns {Promise<object>} The paginated query result.
     */
    async paginate(baseQuery, { page = 1, pageSize = 25, params = [] }) {
        const offset = (page - 1) * pageSize;
        const paginatedQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const queryParams = [...params, pageSize, offset];
        
        return this.query(paginatedQuery, queryParams);
    }

    /**
     * Gracefully shuts down the connection pool.
     */
    async shutdown() {
        if (this.pool) {
            await this.pool.end();
            console.log('Database connection pool has been closed.');
        }
    }
}

const databaseOptimizationService = new DatabaseOptimizationService();

module.exports = databaseOptimizationService;