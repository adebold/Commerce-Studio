const geoip = require('geoip-lite');
const acceptLanguage = require('accept-language-parser');
const logger = require('../utils/logger');

class LanguageDetectionService {
  constructor() {
    this.supportedLanguages = new Map([
      ['en-US', { name: 'English (US)', region: 'US', priority: 1 }],
      ['de-DE', { name: 'German (Germany)', region: 'DE', priority: 2 }],
      ['nl-NL', { name: 'Dutch (Netherlands)', region: 'NL', priority: 3 }],
      ['es-ES', { name: 'Spanish (Spain)', region: 'ES', priority: 4 }],
      ['pt-PT', { name: 'Portuguese (Portugal)', region: 'PT', priority: 5 }],
      ['fr-FR', { name: 'French (France)', region: 'FR', priority: 6 }],
      ['de-AT', { name: 'German (Austria)', region: 'AT', priority: 7 }],
      ['de-CH', { name: 'German (Switzerland)', region: 'CH', priority: 8 }],
      ['fr-BE', { name: 'French (Belgium)', region: 'BE', priority: 9 }],
      ['nl-BE', { name: 'Dutch (Belgium)', region: 'BE', priority: 10 }],
      ['en-IE', { name: 'English (Ireland)', region: 'IE', priority: 11 }]
    ]);

    this.countryToLanguage = new Map([
      ['DE', ['de-DE']], // Germany
      ['NL', ['nl-NL']], // Netherlands
      ['ES', ['es-ES']], // Spain
      ['PT', ['pt-PT']], // Portugal
      ['FR', ['fr-FR']], // France
      ['AT', ['de-AT']], // Austria
      ['CH', ['de-CH', 'fr-CH']], // Switzerland (German/French)
      ['BE', ['nl-BE', 'fr-BE']], // Belgium (Dutch/French)
      ['IE', ['en-IE']], // Ireland
      ['US', ['en-US']], // United States
      ['GB', ['en-US']], // United Kingdom -> US English
      ['CA', ['en-US']], // Canada -> US English
      ['AU', ['en-US']], // Australia -> US English
    ]);

    this.fallbackLanguage = 'en-US';
  }

  /**
   * Detect user language based on priority system
   * @param {Object} options - Detection options
   * @param {string} options.userPreference - User's stored language preference
   * @param {string} options.acceptLanguageHeader - Browser's Accept-Language header
   * @param {string} options.ipAddress - User's IP address for geo-location
   * @param {string} options.tenantDefaultLanguage - Tenant's default language
   * @param {Array} options.tenantSupportedLanguages - Tenant's supported languages
   * @param {boolean} options.autoDetectEnabled - Whether auto-detection is enabled
   * @returns {Object} Detection result with language code and method
   */
  detectLanguage(options = {}) {
    const {
      userPreference,
      acceptLanguageHeader,
      ipAddress,
      tenantDefaultLanguage,
      tenantSupportedLanguages = [],
      autoDetectEnabled = true
    } = options;

    try {
      // Priority 1: User stored preference
      if (userPreference && this.isLanguageSupported(userPreference, tenantSupportedLanguages)) {
        return {
          language: userPreference,
          method: 'user_preference',
          confidence: 1.0,
          supported: true
        };
      }

      // Priority 2: Browser Accept-Language header
      if (autoDetectEnabled && acceptLanguageHeader) {
        const browserLanguage = this.detectFromAcceptLanguage(acceptLanguageHeader, tenantSupportedLanguages);
        if (browserLanguage) {
          return {
            language: browserLanguage,
            method: 'browser_language',
            confidence: 0.9,
            supported: true
          };
        }
      }

      // Priority 3: Geo-location based detection
      if (autoDetectEnabled && ipAddress) {
        const geoLanguage = this.detectFromGeoLocation(ipAddress, tenantSupportedLanguages);
        if (geoLanguage) {
          return {
            language: geoLanguage,
            method: 'geo_location',
            confidence: 0.8,
            supported: true
          };
        }
      }

      // Priority 4: Tenant default language
      if (tenantDefaultLanguage && this.isLanguageSupported(tenantDefaultLanguage, tenantSupportedLanguages)) {
        return {
          language: tenantDefaultLanguage,
          method: 'tenant_default',
          confidence: 0.7,
          supported: true
        };
      }

      // Priority 5: System fallback
      return {
        language: this.fallbackLanguage,
        method: 'fallback',
        confidence: 0.5,
        supported: true
      };

    } catch (error) {
      logger.error('Error in language detection:', error);
      return {
        language: this.fallbackLanguage,
        method: 'error_fallback',
        confidence: 0.1,
        supported: true,
        error: error.message
      };
    }
  }

  /**
   * Detect language from Accept-Language header
   * @param {string} acceptLanguageHeader - Browser's Accept-Language header
   * @param {Array} supportedLanguages - List of supported languages for tenant
   * @returns {string|null} Detected language code or null
   */
  detectFromAcceptLanguage(acceptLanguageHeader, supportedLanguages = []) {
    try {
      const parsedLanguages = acceptLanguage.parse(acceptLanguageHeader);
      
      // Sort by quality score (descending)
      parsedLanguages.sort((a, b) => (b.quality || 1) - (a.quality || 1));

      for (const lang of parsedLanguages) {
        // Try exact match first (e.g., "de-DE")
        const exactMatch = this.normalizeLanguageCode(lang.code);
        if (exactMatch && this.isLanguageSupported(exactMatch, supportedLanguages)) {
          return exactMatch;
        }

        // Try language family match (e.g., "de" -> "de-DE")
        const familyMatch = this.findLanguageFamily(lang.code);
        if (familyMatch && this.isLanguageSupported(familyMatch, supportedLanguages)) {
          return familyMatch;
        }
      }

      return null;
    } catch (error) {
      logger.error('Error parsing Accept-Language header:', error);
      return null;
    }
  }

  /**
   * Detect language from geo-location
   * @param {string} ipAddress - User's IP address
   * @param {Array} supportedLanguages - List of supported languages for tenant
   * @returns {string|null} Detected language code or null
   */
  detectFromGeoLocation(ipAddress, supportedLanguages = []) {
    try {
      const geo = geoip.lookup(ipAddress);
      if (!geo || !geo.country) {
        return null;
      }

      const countryCode = geo.country;
      const possibleLanguages = this.countryToLanguage.get(countryCode) || [];

      // Find the first supported language for this country
      for (const language of possibleLanguages) {
        if (this.isLanguageSupported(language, supportedLanguages)) {
          return language;
        }
      }

      return null;
    } catch (error) {
      logger.error('Error in geo-location detection:', error);
      return null;
    }
  }

  /**
   * Check if a language is supported
   * @param {string} languageCode - Language code to check
   * @param {Array} supportedLanguages - List of supported languages
   * @returns {boolean} True if supported
   */
  isLanguageSupported(languageCode, supportedLanguages = []) {
    // If no specific supported languages provided, check global support
    if (supportedLanguages.length === 0) {
      return this.supportedLanguages.has(languageCode);
    }

    return supportedLanguages.includes(languageCode) && this.supportedLanguages.has(languageCode);
  }

  /**
   * Normalize language code to supported format
   * @param {string} languageCode - Raw language code
   * @returns {string|null} Normalized language code or null
   */
  normalizeLanguageCode(languageCode) {
    if (!languageCode) return null;

    // Convert to lowercase and handle common variations
    const normalized = languageCode.toLowerCase().replace('_', '-');
    
    // Common mappings
    const mappings = {
      'en': 'en-US',
      'de': 'de-DE',
      'nl': 'nl-NL',
      'es': 'es-ES',
      'pt': 'pt-PT',
      'fr': 'fr-FR',
      'german': 'de-DE',
      'dutch': 'nl-NL',
      'spanish': 'es-ES',
      'portuguese': 'pt-PT',
      'french': 'fr-FR',
      'english': 'en-US'
    };

    if (mappings[normalized]) {
      return mappings[normalized];
    }

    // Check if it's already in correct format
    const upperCaseCode = languageCode.toLowerCase().split('-')
      .map((part, index) => index === 0 ? part : part.toUpperCase())
      .join('-');

    if (this.supportedLanguages.has(upperCaseCode)) {
      return upperCaseCode;
    }

    return null;
  }

  /**
   * Find language family match
   * @param {string} languageCode - Language code to match
   * @returns {string|null} Matched language code or null
   */
  findLanguageFamily(languageCode) {
    if (!languageCode) return null;

    const language = languageCode.split('-')[0].toLowerCase();
    
    // Find first supported language in the same family
    for (const [supportedLang] of this.supportedLanguages) {
      if (supportedLang.split('-')[0].toLowerCase() === language) {
        return supportedLang;
      }
    }

    return null;
  }

  /**
   * Get language information
   * @param {string} languageCode - Language code
   * @returns {Object|null} Language information or null
   */
  getLanguageInfo(languageCode) {
    return this.supportedLanguages.get(languageCode) || null;
  }

  /**
   * Get all supported languages
   * @returns {Array} List of supported languages with info
   */
  getAllSupportedLanguages() {
    return Array.from(this.supportedLanguages.entries()).map(([code, info]) => ({
      code,
      ...info
    }));
  }

  /**
   * Get country-specific language recommendations
   * @param {string} countryCode - ISO country code
   * @returns {Array} Recommended languages for the country
   */
  getCountryLanguageRecommendations(countryCode) {
    return this.countryToLanguage.get(countryCode?.toUpperCase()) || [];
  }
}

module.exports = LanguageDetectionService;