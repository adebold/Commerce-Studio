const LanguageDetectionService = require('../services/LanguageDetectionService');
const logger = require('../utils/logger');

class LanguageMiddleware {
  constructor() {
    this.languageDetectionService = new LanguageDetectionService();
  }

  /**
   * Express middleware for language detection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  detectLanguage(req, res, next) {
    try {
      // Extract tenant information from headers
      const tenantId = req.headers['x-tenant-id'];
      const tenantDefaultLanguage = req.headers['x-tenant-default-language'];
      const tenantSupportedLanguages = req.headers['x-tenant-supported-languages']
        ? req.headers['x-tenant-supported-languages'].split(',')
        : [];
      const autoDetectEnabled = req.headers['x-tenant-auto-detect'] !== 'false';

      // Extract user information
      const userPreference = req.headers['x-user-language-preference'] || req.cookies?.language;
      const acceptLanguageHeader = req.headers['accept-language'];
      const userAgent = req.headers['user-agent'];
      
      // Get IP address (handle various proxy scenarios)
      const ipAddress = this.getClientIP(req);

      // Detect language using priority system
      const detectionResult = this.languageDetectionService.detectLanguage({
        userPreference,
        acceptLanguageHeader,
        ipAddress,
        tenantDefaultLanguage,
        tenantSupportedLanguages,
        autoDetectEnabled
      });

      // Attach language information to request object
      req.detectedLanguage = detectionResult.language;
      req.languageDetectionMethod = detectionResult.method;
      req.languageConfidence = detectionResult.confidence;
      req.languageSupported = detectionResult.supported;

      // Set response headers for client-side language handling
      res.setHeader('X-Detected-Language', detectionResult.language);
      res.setHeader('X-Language-Detection-Method', detectionResult.method);
      res.setHeader('X-Language-Confidence', detectionResult.confidence.toString());

      // Add language information to response locals for template rendering
      res.locals.language = detectionResult.language;
      res.locals.languageInfo = this.languageDetectionService.getLanguageInfo(detectionResult.language);

      // Log language detection for analytics
      logger.info('Language detected', {
        tenantId,
        detectedLanguage: detectionResult.language,
        method: detectionResult.method,
        confidence: detectionResult.confidence,
        ipAddress: this.maskIP(ipAddress),
        userAgent: userAgent ? userAgent.substring(0, 100) : null
      });

      next();
    } catch (error) {
      logger.error('Error in language detection middleware:', error);
      
      // Set fallback language on error
      req.detectedLanguage = 'en-US';
      req.languageDetectionMethod = 'error_fallback';
      req.languageConfidence = 0.1;
      req.languageSupported = true;
      
      res.setHeader('X-Detected-Language', 'en-US');
      res.setHeader('X-Language-Detection-Method', 'error_fallback');
      res.setHeader('X-Language-Confidence', '0.1');
      
      res.locals.language = 'en-US';
      res.locals.languageInfo = this.languageDetectionService.getLanguageInfo('en-US');
      
      next();
    }
  }

  /**
   * Extract client IP address handling various proxy scenarios
   * @param {Object} req - Express request object
   * @returns {string} Client IP address
   */
  getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['x-client-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.connection?.socket?.remoteAddress ||
           req.ip ||
           '127.0.0.1';
  }

  /**
   * Mask IP address for privacy compliance
   * @param {string} ip - IP address to mask
   * @returns {string} Masked IP address
   */
  maskIP(ip) {
    if (!ip || ip === '127.0.0.1') return 'localhost';
    
    // IPv4 masking (keep first 3 octets)
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }
    
    // IPv6 masking (keep first 4 groups)
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:xxxx:xxxx:xxxx:xxxx`;
      }
    }
    
    return 'masked';
  }

  /**
   * Middleware for validating language code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateLanguage(req, res, next) {
    const { language } = req.params;
    
    if (!language) {
      return res.status(400).json({
        error: 'Language parameter is required',
        supportedLanguages: this.languageDetectionService.getAllSupportedLanguages()
      });
    }

    const languageInfo = this.languageDetectionService.getLanguageInfo(language);
    if (!languageInfo) {
      return res.status(404).json({
        error: 'Unsupported language',
        provided: language,
        supportedLanguages: this.languageDetectionService.getAllSupportedLanguages()
      });
    }

    req.validatedLanguage = language;
    req.languageInfo = languageInfo;
    next();
  }

  /**
   * Middleware for setting user language preference
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  setLanguagePreference(req, res, next) {
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({
        error: 'Language is required in request body'
      });
    }

    const languageInfo = this.languageDetectionService.getLanguageInfo(language);
    if (!languageInfo) {
      return res.status(404).json({
        error: 'Unsupported language',
        provided: language,
        supportedLanguages: this.languageDetectionService.getAllSupportedLanguages()
      });
    }

    // Set language preference cookie (30 days)
    res.cookie('language', language, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Set response header for immediate client-side use
    res.setHeader('X-Language-Preference-Set', language);

    req.userLanguagePreference = language;
    next();
  }

  /**
   * Middleware for GDPR compliance based on detected location
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  checkGDPRCompliance(req, res, next) {
    const ipAddress = this.getClientIP(req);
    const geoip = require('geoip-lite');
    
    try {
      const geo = geoip.lookup(ipAddress);
      const isEUCountry = this.isEUCountry(geo?.country);
      
      req.gdprRequired = isEUCountry;
      req.userCountry = geo?.country;
      req.userRegion = geo?.region;
      
      // Set GDPR compliance headers
      if (isEUCountry) {
        res.setHeader('X-GDPR-Required', 'true');
        res.setHeader('X-Data-Protection-Region', 'EU');
      }
      
      next();
    } catch (error) {
      logger.error('Error in GDPR compliance check:', error);
      req.gdprRequired = false;
      next();
    }
  }

  /**
   * Check if country is in European Union
   * @param {string} countryCode - ISO country code
   * @returns {boolean} True if EU country
   */
  isEUCountry(countryCode) {
    const euCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];
    
    return euCountries.includes(countryCode);
  }
}

// Create singleton instance
const languageMiddleware = new LanguageMiddleware();

// Export middleware functions
module.exports = (req, res, next) => languageMiddleware.detectLanguage(req, res, next);
module.exports.validateLanguage = (req, res, next) => languageMiddleware.validateLanguage(req, res, next);
module.exports.setLanguagePreference = (req, res, next) => languageMiddleware.setLanguagePreference(req, res, next);
module.exports.checkGDPRCompliance = (req, res, next) => languageMiddleware.checkGDPRCompliance(req, res, next);
module.exports.LanguageMiddleware = LanguageMiddleware;