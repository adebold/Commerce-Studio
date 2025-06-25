/**
 * Logger utility for Shopify integration
 * 
 * This module provides a simple logging utility for the Shopify integration
 * with configurable log levels and formatting.
 */

/**
 * Log levels with corresponding priority values
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

/**
 * Current log level (can be set via environment variable)
 */
const currentLevel = process.env.LOG_LEVEL || 'info';

/**
 * Logger instance
 */
export const logger = {
  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {Error|any} [error] - Optional error object or details
   */
  error: (message, error) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.error) {
      console.error(`[ERROR] ${message}`);
      if (error) {
        if (error instanceof Error) {
          console.error(`- ${error.message}`);
          if (error.stack) {
            console.error(`- ${error.stack}`);
          }
        } else {
          console.error('- Details:', error);
        }
      }
    }
  },

  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {any} [details] - Optional additional details
   */
  warn: (message, details) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.warn) {
      console.warn(`[WARN] ${message}`);
      if (details) {
        console.warn('- Details:', details);
      }
    }
  },

  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {any} [details] - Optional additional details
   */
  info: (message, details) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.info) {
      console.log(`[INFO] ${message}`);
      if (details) {
        console.log('- Details:', details);
      }
    }
  },

  /**
   * Log a debug message
   * @param {string} message - The message to log
   * @param {any} [details] - Optional additional details
   */
  debug: (message, details) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.debug) {
      console.log(`[DEBUG] ${message}`);
      if (details) {
        console.log('- Details:', details);
      }
    }
  },

  /**
   * Log a trace message (most verbose)
   * @param {string} message - The message to log
   * @param {any} [details] - Optional additional details
   */
  trace: (message, details) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.trace) {
      console.log(`[TRACE] ${message}`);
      if (details) {
        console.log('- Details:', details);
      }
    }
  },

  /**
   * Set the log level
   * @param {string} level - The log level to set
   */
  setLevel: (level) => {
    if (LOG_LEVELS[level] !== undefined) {
      process.env.LOG_LEVEL = level;
    } else {
      console.warn(`[WARN] Invalid log level: ${level}. Using default 'info' level.`);
      process.env.LOG_LEVEL = 'info';
    }
  }
};
