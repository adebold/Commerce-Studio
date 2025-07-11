const LanguageDetectionService = require('../services/LanguageDetectionService');
const logger = require('../utils/logger');

/**
 * Language detection middleware
 * Detects and sets the user's preferred language for the request
 */
function languageMiddleware(req, res, next) {
  try {
    // Detect language based on priority system
    const detection = LanguageDetectionService.detectLanguage(req);
    
    // Add language information to request object
    req.language = detection.language;
    req.languageInfo = detection;
    
    // Set response headers for language information
    res.set({
      'Content-Language': detection.language,
      'X-Detected-Language': detection.language,
      'X-Detection-Method': detection.detectionMethod,
      'X-GDPR-Required': detection.gdprRequired.toString()
    });

    // Log language detection for monitoring
    logger.debug(`Language detected: ${detection.language} via ${detection.detectionMethod}`, {
      userAgent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
      ip: req.ip,
      country: detection.context.geoLocation,
      isEuUser: detection.isEuUser
    });

    next();
  } catch (error) {
    logger.error('Language middleware error:', error);
    
    // Fallback to default language on error
    req.language = 'en-US';
    req.languageInfo = {
      language: 'en-US',
      country: 'United States',
      name: 'English',
      isEuUser: false,
      detectionMethod: 'error_fallback',
      context: {},
      supportedLanguages: Object.keys(LanguageDetectionService.getSupportedLanguages()),
      gdprRequired: false
    };
    
    res.set({
      'Content-Language': 'en-US',
      'X-Detected-Language': 'en-US',
      'X-Detection-Method': 'error_fallback',
      'X-GDPR-Required': 'false'
    });
    
    next();
  }
}

module.exports = languageMiddleware;