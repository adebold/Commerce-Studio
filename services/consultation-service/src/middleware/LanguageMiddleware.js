const axios = require('axios');

/**
 * Language detection middleware for consultation service
 * Integrates with the internationalization service
 */
class LanguageMiddleware {
  constructor(i18nServiceUrl) {
    this.i18nServiceUrl = i18nServiceUrl;
    this.supportedLanguages = ['en-US', 'nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE'];
    this.defaultLanguage = 'en-US';
    
    // Cache for language detection results
    this.languageCache = new Map();
  }

  /**
   * Middleware function to detect and set language
   */
  middleware() {
    return async (req, res, next) => {
      try {
        // Check for explicit language parameter
        let detectedLanguage = req.query.language || req.headers['accept-language-override'];
        
        // If no explicit language, use language detection service
        if (!detectedLanguage) {
          detectedLanguage = await this.detectLanguage(req);
        }
        
        // Validate and set language
        req.language = this.validateLanguage(detectedLanguage);
        req.supportedLanguages = this.supportedLanguages;
        
        // Set response headers
        res.setHeader('Content-Language', req.language);
        res.setHeader('X-Supported-Languages', this.supportedLanguages.join(','));
        
        next();
      } catch (error) {
        // On error, use default language and continue
        req.language = this.defaultLanguage;
        req.supportedLanguages = this.supportedLanguages;
        next();
      }
    };
  }

  /**
   * Detect language using internationalization service
   */
  async detectLanguage(req) {
    try {
      const cacheKey = this.createCacheKey(req);
      
      // Check cache first
      if (this.languageCache.has(cacheKey)) {
        return this.languageCache.get(cacheKey);
      }
      
      // Call language detection service
      const detectionData = {
        userAgent: req.get('User-Agent'),
        acceptLanguage: req.get('Accept-Language'),
        ip: req.ip,
        tenantId: req.headers['x-tenant-id'],
        userPreference: req.headers['x-user-language']
      };
      
      const response = await axios.post(
        `${this.i18nServiceUrl}/api/languages/detect`,
        detectionData,
        { timeout: 5000 }
      );
      
      const detectedLanguage = response.data.detectedLanguage || this.defaultLanguage;
      
      // Cache the result for 1 hour
      this.languageCache.set(cacheKey, detectedLanguage);
      setTimeout(() => this.languageCache.delete(cacheKey), 3600000);
      
      return detectedLanguage;
      
    } catch (error) {
      // Fallback to browser language detection
      return this.detectFromBrowser(req);
    }
  }

  /**
   * Fallback browser language detection
   */
  detectFromBrowser(req) {
    const acceptLanguage = req.get('Accept-Language');
    
    if (!acceptLanguage) {
      return this.defaultLanguage;
    }
    
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality = '1'] = lang.trim().split(';q=');
        return {
          code: code.trim(),
          quality: parseFloat(quality)
        };
      })
      .sort((a, b) => b.quality - a.quality);
    
    // Find best matching supported language
    for (const lang of languages) {
      const normalizedCode = this.normalizeLanguageCode(lang.code);
      if (this.supportedLanguages.includes(normalizedCode)) {
        return normalizedCode;
      }
    }
    
    return this.defaultLanguage;
  }

  /**
   * Normalize language code to our supported format
   */
  normalizeLanguageCode(code) {
    const mapping = {
      'en': 'en-US',
      'nl': 'nl-NL',
      'de': 'de-DE',
      'es': 'es-ES',
      'pt': 'pt-PT',
      'fr': 'fr-FR',
      'en-gb': 'en-IE',
      'en-ie': 'en-IE'
    };
    
    return mapping[code.toLowerCase()] || code;
  }

  /**
   * Validate language against supported languages
   */
  validateLanguage(language) {
    if (!language || !this.supportedLanguages.includes(language)) {
      return this.defaultLanguage;
    }
    return language;
  }

  /**
   * Create cache key for language detection
   */
  createCacheKey(req) {
    const factors = [
      req.get('Accept-Language') || '',
      req.ip || '',
      req.headers['x-tenant-id'] || '',
      req.headers['x-user-language'] || ''
    ];
    
    return Buffer.from(factors.join('|')).toString('base64');
  }
}

// Export middleware function
module.exports = (i18nServiceUrl) => {
  const languageMiddleware = new LanguageMiddleware(i18nServiceUrl);
  return languageMiddleware.middleware();
};