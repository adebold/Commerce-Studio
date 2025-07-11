const LanguageDetectionService = require('../services/LanguageDetectionService');
const logger = require('../utils/logger');

class LanguageController {
  /**
   * Detect user's preferred language
   */
  static detectLanguage(req, res) {
    try {
      const detection = LanguageDetectionService.detectLanguage(req);
      
      res.status(200).json({
        success: true,
        data: detection,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Language detection error:', error);
      res.status(500).json({
        success: false,
        error: 'Language detection failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get all supported languages
   */
  static getSupportedLanguages(req, res) {
    try {
      const supportedLanguages = LanguageDetectionService.getSupportedLanguages();
      
      res.status(200).json({
        success: true,
        data: {
          languages: supportedLanguages,
          total: Object.keys(supportedLanguages).length,
          priority: 'Dutch (nl-NL) prioritized for Netherlands market'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get supported languages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get supported languages',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Set user language preference
   */
  static setLanguagePreference(req, res) {
    try {
      const { language, tenantId } = req.body;
      
      if (!language) {
        return res.status(400).json({
          success: false,
          error: 'Language is required',
          timestamp: new Date().toISOString()
        });
      }

      const supportedLanguages = LanguageDetectionService.getSupportedLanguages();
      if (!supportedLanguages[language]) {
        return res.status(400).json({
          success: false,
          error: `Language '${language}' is not supported`,
          supportedLanguages: Object.keys(supportedLanguages),
          timestamp: new Date().toISOString()
        });
      }

      // In a real implementation, this would be stored in session/database
      res.cookie('language', language, { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });

      res.status(200).json({
        success: true,
        data: {
          language,
          languageInfo: supportedLanguages[language],
          tenantId: tenantId || null
        },
        message: 'Language preference updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Set language preference error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set language preference',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get information about a specific language
   */
  static getLanguageInfo(req, res) {
    try {
      const { language } = req.params;
      const supportedLanguages = LanguageDetectionService.getSupportedLanguages();
      
      if (!supportedLanguages[language]) {
        return res.status(404).json({
          success: false,
          error: `Language '${language}' is not supported`,
          supportedLanguages: Object.keys(supportedLanguages),
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        data: {
          language,
          ...supportedLanguages[language],
          isEuLanguage: ['nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE'].includes(language)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Get language info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get language information',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = LanguageController;