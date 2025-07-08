/**
 * Centralized Logging Service
 * Provides unified logging functionality across the Commerce Studio platform
 * Supports different log levels, formatting, and output destinations
 */

class LoggingService {
    constructor(options = {}) {
        this.config = {
            level: options.level || process.env.LOG_LEVEL || 'info',
            prefix: options.prefix || '',
            timestamp: options.timestamp !== false,
            colors: options.colors !== false && process.stdout.isTTY,
            destination: options.destination || 'console'
        };

        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };

        this.colors = {
            error: '\x1b[31m',   // Red
            warn: '\x1b[33m',    // Yellow
            info: '\x1b[36m',    // Cyan
            debug: '\x1b[35m',   // Magenta
            trace: '\x1b[37m',   // White
            reset: '\x1b[0m'     // Reset
        };

        this.symbols = {
            error: '❌',
            warn: '⚠️',
            info: 'ℹ️',
            debug: '🔍',
            trace: '📝'
        };
    }

    /**
     * Check if a log level should be output
     */
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.config.level];
    }

    /**
     * Format log message
     */
    formatMessage(level, message, context = {}) {
        let formatted = '';

        // Add timestamp
        if (this.config.timestamp) {
            const timestamp = new Date().toISOString();
            formatted += `[${timestamp}] `;
        }

        // Add prefix
        if (this.config.prefix) {
            formatted += `[${this.config.prefix}] `;
        }

        // Add level with symbol and color
        const symbol = this.symbols[level] || '';
        const levelText = level.toUpperCase().padEnd(5);
        
        if (this.config.colors) {
            const color = this.colors[level] || '';
            formatted += `${color}${symbol} ${levelText}${this.colors.reset} `;
        } else {
            formatted += `${symbol} ${levelText} `;
        }

        // Add main message
        formatted += message;

        // Add context if provided
        if (Object.keys(context).length > 0) {
            formatted += ` ${JSON.stringify(context)}`;
        }

        return formatted;
    }

    /**
     * Generic log method
     */
    log(level, message, context = {}) {
        if (!this.shouldLog(level)) {
            return;
        }

        const formatted = this.formatMessage(level, message, context);

        switch (this.config.destination) {
            case 'console':
                console.log(formatted);
                break;
            case 'file':
                // TODO: Implement file logging
                console.log(formatted);
                break;
            default:
                console.log(formatted);
        }
    }

    /**
     * Error logging
     */
    error(message, context = {}) {
        this.log('error', message, context);
    }

    /**
     * Warning logging
     */
    warn(message, context = {}) {
        this.log('warn', message, context);
    }

    /**
     * Info logging
     */
    info(message, context = {}) {
        this.log('info', message, context);
    }

    /**
     * Debug logging
     */
    debug(message, context = {}) {
        this.log('debug', message, context);
    }

    /**
     * Trace logging
     */
    trace(message, context = {}) {
        this.log('trace', message, context);
    }

    /**
     * Service-specific logging methods
     */
    
    /**
     * Google Cloud service logging
     */
    googleCloud(message, context = {}) {
        this.info(`[Google Cloud] ${message}`, context);
    }

    /**
     * NVIDIA service logging
     */
    nvidia(message, context = {}) {
        this.info(`[NVIDIA] ${message}`, context);
    }

    /**
     * Authentication logging
     */
    auth(message, context = {}) {
        this.info(`[Auth] ${message}`, context);
    }

    /**
     * API logging
     */
    api(message, context = {}) {
        this.info(`[API] ${message}`, context);
    }

    /**
     * Test logging
     */
    test(message, context = {}) {
        this.info(`[Test] ${message}`, context);
    }

    /**
     * Avatar service logging
     */
    avatar(message, context = {}) {
        this.info(`[Avatar] ${message}`, context);
    }

    /**
     * Socket.IO logging
     */
    socket(message, context = {}) {
        this.info(`[Socket.IO] ${message}`, context);
    }

    /**
     * Performance logging
     */
    performance(message, context = {}) {
        this.debug(`[Performance] ${message}`, context);
    }

    /**
     * Security logging
     */
    security(message, context = {}) {
        this.warn(`[Security] ${message}`, context);
    }

    /**
     * Create a child logger with a specific prefix
     */
    child(prefix) {
        return new LoggingService({
            ...this.config,
            prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix
        });
    }

    /**
     * Set log level
     */
    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.config.level = level;
        }
    }

    /**
     * Enable/disable colors
     */
    setColors(enabled) {
        this.config.colors = enabled;
    }

    /**
     * Enable/disable timestamps
     */
    setTimestamp(enabled) {
        this.config.timestamp = enabled;
    }
}

// Create singleton instance
let loggingServiceInstance = null;

/**
 * Get the singleton logging service instance
 */
export function getLoggingService(options = {}) {
    if (!loggingServiceInstance) {
        loggingServiceInstance = new LoggingService(options);
    }
    return loggingServiceInstance;
}

/**
 * Create a new logging service instance (for testing or specific use cases)
 */
export function createLoggingService(options = {}) {
    return new LoggingService(options);
}

export default LoggingService;