const LanguageDetectionService = require('../services/LanguageDetectionService');
const logger = require('../utils/logger');

class LanguageController {
  constructor() {
    this.languageDetectionService = new LanguageDetectionService();
  }

  /**
   * Get all supported languages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSupportedLanguages = async (req, res) => {
    try {
      const languages = this.languageDetectionService.getAllSupportedLanguages();
      
      res.json({
        success: true,
        data: languages,
        total: languages.length
      });
    } catch (error) {
      logger.error('Error getting supported languages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get supported languages'
      });
    }
  };

  /**
   * Detect language for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  detectLanguage = async (req, res) => {
    try {
      const {
        userPreference,
        tenantId,
        tenantDefaultLanguage,
        tenantSupportedLanguages,
        autoDetectEnabled = true
      } = req.body;

      // Use headers for browser and IP information
      const acceptLanguageHeader = req.headers['accept-language'];
      const userAgent = req.headers['user-agent'];
      const ipAddress = this.getClientIP(req);

      // Detect language using the service
      const detectionResult = this.languageDetectionService.detectLanguage({
        userPreference,
        acceptLanguageHeader,
        ipAddress,
        tenantDefaultLanguage,
        tenantSupportedLanguages,
        autoDetectEnabled
      });

      // Log detection for analytics
      logger.info('Language detection performed', {
        tenantId,
        detectedLanguage: detectionResult.language,
        method: detectionResult.method,
        confidence: detectionResult.confidence,
        userAgent: userAgent ? userAgent.substring(0, 100) : null,
        ipAddress: this.maskIP(ipAddress)
      });

      res.json({
        success: true,
        data: {
          ...detectionResult,
          timestamp: new Date().toISOString(),
          userAgent: userAgent ? userAgent.substring(0, 100) : null
        }
      });
    } catch (error) {
      logger.error('Error detecting language:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to detect language',
        fallbackLanguage: 'en-US'
      });
    }
  };

  /**
   * Get language information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getLanguageInfo = async (req, res) => {
    try {
      const { language } = req.params;
      const languageInfo = this.languageDetectionService.getLanguageInfo(language);

      if (!languageInfo) {
        return res.status(404).json({
          success: false,
          error: 'Language not found'
        });
      }

      res.json({
        success: true,
        data: {
          code: language,
          ...languageInfo
        }
      });
    } catch (error) {
      logger.error('Error getting language info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get language information'
      });
    }
  };

  /**
   * Set user language preference
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  setUserLanguagePreference = async (req, res) => {
    try {
      const { userId, language, tenantId } = req.body;

      if (!userId || !language) {
        return res.status(400).json({
          success: false,
          error: 'User ID and language are required'
        });
      }

      // Validate language
      const languageInfo = this.languageDetectionService.getLanguageInfo(language);
      if (!languageInfo) {
        return res.status(400).json({
          success: false,
          error: 'Invalid language code'
        });
      }

      // Set cookie for immediate use
      res.cookie('language', language, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Log preference change
      logger.info('User language preference set', {
        userId,
        language,
        tenantId,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          userId,
          language,
          languageInfo,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error setting user language preference:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set language preference'
      });
    }
  };

  /**
   * Get user language preference
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserLanguagePreference = async (req, res) => {
    try {
      const { userId } = req.params;
      
      // For now, get from cookie or headers
      const languageFromCookie = req.cookies?.language;
      const languageFromHeader = req.headers['x-user-language-preference'];
      
      const preference = languageFromCookie || languageFromHeader;

      if (!preference) {
        return res.status(404).json({
          success: false,
          error: 'No language preference found for user'
        });
      }

      const languageInfo = this.languageDetectionService.getLanguageInfo(preference);

      res.json({
        success: true,
        data: {
          userId,
          language: preference,
          languageInfo,
          source: languageFromCookie ? 'cookie' : 'header'
        }
      });
    } catch (error) {
      logger.error('Error getting user language preference:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get language preference'
      });
    }
  };

  /**
   * Get country language recommendations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCountryLanguageRecommendations = async (req, res) => {
    try {
      const { countryCode } = req.params;
      
      const recommendations = this.languageDetectionService.getCountryLanguageRecommendations(countryCode);
      
      if (!recommendations || recommendations.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No language recommendations found for country'
        });
      }

      // Get detailed info for each recommended language
      const detailedRecommendations = recommendations.map(langCode => {
        const info = this.languageDetectionService.getLanguageInfo(langCode);
        return {
          code: langCode,
          ...info
        };
      }).filter(Boolean);

      res.json({
        success: true,
        data: {
          countryCode,
          recommendations: detailedRecommendations,
          total: detailedRecommendations.length
        }
      });
    } catch (error) {
      logger.error('Error getting country language recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get country language recommendations'
      });
    }
  };

  /**
   * Validate language code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  validateLanguage = async (req, res) => {
    try {
      const { language } = req.params;
      const { tenantSupportedLanguages } = req.query;
      
      const isSupported = this.languageDetectionService.isLanguageSupported(
        language,
        tenantSupportedLanguages ? tenantSupportedLanguages.split(',') : []
      );

      const languageInfo = this.languageDetectionService.getLanguageInfo(language);

      res.json({
        success: true,
        data: {
          language,
          isSupported,
          isGloballySupported: !!languageInfo,
          languageInfo
        }
      });
    } catch (error) {
      logger.error('Error validating language:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate language'
      });
    }
  };

  /**
   * Get client IP address
   * @param {Object} req - Express request object
   * @returns {string} Client IP address
   */
  getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['x-client-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           '127.0.0.1';
  }

  /**
   * Mask IP address for privacy
   * @param {string} ip - IP address
   * @returns {string} Masked IP address
   */
  maskIP(ip) {
    if (!ip || ip === '127.0.0.1') return 'localhost';
    
    // IPv4 masking
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }
    
    // IPv6 masking
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:xxxx:xxxx:xxxx:xxxx`;
      }
    }
    
    return 'masked';
  }
}

module.exports = new LanguageController();