/**
 * @fileoverview Comprehensive input validation and sanitization service.
 * @module security/input-validation-service
 */

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const validator = require('validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Load security policies
const securityPolicies = yaml.load(fs.readFileSync(path.resolve(__dirname, '../config/security/security-policies.yaml'), 'utf8'));
const validationConfig = securityPolicies.input_validation;

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Provides methods for validating and sanitizing user inputs.
 */
class InputValidationService {
  /**
   * Sanitizes a string to prevent XSS attacks.
   * Removes any potentially malicious HTML.
   * @param {string} input - The string to sanitize.
   * @returns {string} The sanitized string.
   */
  sanitize(input) {
    if (typeof input !== 'string') {
      return '';
    }
    return DOMPurify.sanitize(input);
  }

  /**
   * Validates an email address.
   * @param {string} email - The email to validate.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  isValidEmail(email) {
    return validator.isEmail(email);
  }

  /**
   * Validates a password against the configured policy.
   * @param {string} password - The password to validate.
   * @returns {{isValid: boolean, message: string}} An object indicating if the password is valid and a message.
   */
  validatePassword(password) {
    const policy = securityPolicies.password_policy;
    const errors = [];

    if (password.length < policy.min_length) {
      errors.push(`Password must be at least ${policy.min_length} characters long.`);
    }
    if (policy.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (policy.require_lowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }
    if (policy.require_numbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number.');
    }
    if (policy.require_symbols && !/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one symbol.');
    }

    if (errors.length > 0) {
      return { isValid: false, message: errors.join(' ') };
    }
    return { isValid: true, message: 'Password is valid.' };
  }

  /**
   * Checks if an input string exceeds the maximum allowed length.
   * @param {string} input - The input string.
   * @returns {boolean} True if the length is valid, false otherwise.
   */
  isLengthValid(input) {
    return input.length <= validationConfig.max_input_length;
  }

  /**
   * Express middleware for validating and sanitizing request bodies.
   * @param {string[]} fieldsToSanitize - A list of field names in the request body to sanitize.
   * @returns {function} Express middleware function.
   */
  validationMiddleware(fieldsToSanitize = []) {
    return (req, res, next) => {
      for (const field of fieldsToSanitize) {
        if (req.body && req.body[field]) {
          if (!this.isLengthValid(req.body[field])) {
            return res.status(400).json({
              error: 'Bad Request',
              message: `Field '${field}' exceeds maximum length of ${validationConfig.max_input_length} characters.`,
            });
          }
          req.body[field] = this.sanitize(req.body[field]);
        }
      }
      next();
    };
  }
}

module.exports = new InputValidationService();