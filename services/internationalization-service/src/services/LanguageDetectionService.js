const logger = require('../utils/logger');

class LanguageDetectionService {
  constructor() {
    this.supportedLanguages = {
      'nl-NL': { name: 'Dutch', country: 'Netherlands', priority: 1 },
      'de-DE': { name: 'German', country: 'Germany', priority: 2 },
      'es-ES': { name: 'Spanish', country: 'Spain', priority: 3 },
      'pt-PT': { name: 'Portuguese', country: 'Portugal', priority: 4 },
      'fr-FR': { name: 'French', country: 'France', priority: 5 },
      'en-IE': { name: 'English', country: 'Ireland', priority: 6 },
      'en-US': { name: 'English', country: 'United States', priority: 7 }
    };

    this.euCountries = [
      'NL', 'DE', 'ES', 'PT', 'FR', 'IE', 'AT', 'BE', 'BG', 'HR', 'CY', 
      'CZ', 'DK', 'EE', 'FI', 'GR', 'HU', 'IT', 'LV', 'LT', 'LU', 
      'MT', 'PL', 'RO', 'SK', 'SI', 'SE'
    ];

    this.countryLanguageMap = {
      'NL': 'nl-NL',
      'DE': 'de-DE', 
      'AT': 'de-DE',
      'ES': 'es-ES',
      'PT': 'pt-PT',
      'FR': 'fr-FR',
      'IE': 'en-IE',
      'BE': 'nl-NL', // Belgium defaults to Dutch, but can be French
      'LU': 'fr-FR'  // Luxembourg defaults to French
    };
  }

  /**
   * Detect language with priority system:
   * 1. User preference (stored/session)
   * 2. Browser language (Accept-Language header)
   * 3. Geo-location (IP-based country detection)
   * 4. Tenant default language
   * 5. System default (en-US)
   */
  detectLanguage(req) {
    const detectionContext = {
      userPreference: null,
      browserLanguage: null,
      geoLocation: null,
      tenantDefault: null,
      systemDefault: 'en-US',
      finalLanguage: null,
      detectionMethod: null,
      isEuUser: false
    };

    try {
      // 1. Check user preference (session, cookie, or header)
      detectionContext.userPreference = this.getUserPreference(req);
      if (detectionContext.userPreference && this.isLanguageSupported(detectionContext.userPreference)) {
        detectionContext.finalLanguage = detectionContext.userPreference;
        detectionContext.detectionMethod = 'user_preference';
        logger.info(`Language detected via user preference: ${detectionContext.finalLanguage}`);
        return this.buildResponse(detectionContext);
      }

      // 2. Check browser language (Accept-Language header)
      detectionContext.browserLanguage = this.getBrowserLanguage(req);
      if (detectionContext.browserLanguage && this.isLanguageSupported(detectionContext.browserLanguage)) {
        detectionContext.finalLanguage = detectionContext.browserLanguage;
        detectionContext.detectionMethod = 'browser_language';
        logger.info(`Language detected via browser: ${detectionContext.finalLanguage}`);
        return this.buildResponse(detectionContext);
      }

      // 3. Check geo-location (IP-based)
      const geoData = this.getGeoLocation(req);
      detectionContext.geoLocation = geoData.country;
      detectionContext.isEuUser = geoData.isEU;
      
      if (geoData.language && this.isLanguageSupported(geoData.language)) {
        detectionContext.finalLanguage = geoData.language;
        detectionContext.detectionMethod = 'geo_location';
        logger.info(`Language detected via geo-location: ${detectionContext.finalLanguage} (${geoData.country})`);
        return this.buildResponse(detectionContext);
      }

      // 4. Check tenant default language
      detectionContext.tenantDefault = this.getTenantDefaultLanguage(req);
      if (detectionContext.tenantDefault && this.isLanguageSupported(detectionContext.tenantDefault)) {
        detectionContext.finalLanguage = detectionContext.tenantDefault;
        detectionContext.detectionMethod = 'tenant_default';
        logger.info(`Language detected via tenant default: ${detectionContext.finalLanguage}`);
        return this.buildResponse(detectionContext);
      }

      // 5. Fallback to system default
      detectionContext.finalLanguage = detectionContext.systemDefault;
      detectionContext.detectionMethod = 'system_default';
      logger.info(`Language fallback to system default: ${detectionContext.finalLanguage}`);
      
      return this.buildResponse(detectionContext);

    } catch (error) {
      logger.error('Language detection error:', error);
      detectionContext.finalLanguage = detectionContext.systemDefault;
      detectionContext.detectionMethod = 'error_fallback';
      return this.buildResponse(detectionContext);
    }
  }

  getUserPreference(req) {
    // Check various sources for user preference
    return req.headers['x-user-language'] || 
           req.session?.language || 
           req.cookies?.language ||
           req.query?.lang;
  }

  getBrowserLanguage(req) {
    const acceptLanguage = req.headers['accept-language'];
    if (!acceptLanguage) return null;

    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,nl;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [language, q = '1'] = lang.trim().split(';q=');
        return { language: language.trim(), quality: parseFloat(q) };
      })
      .sort((a, b) => b.quality - a.quality);

    // Find first supported language
    for (const { language } of languages) {
      const normalizedLang = this.normalizeLanguageCode(language);
      if (this.isLanguageSupported(normalizedLang)) {
        return normalizedLang;
      }
    }

    return null;
  }

  getGeoLocation(req) {
    // In production, this would use IP geolocation service
    // For now, check headers that might be set by CDN/proxy
    const country = req.headers['cf-ipcountry'] || 
                   req.headers['x-country-code'] || 
                   req.headers['x-forwarded-country'] ||
                   'US'; // default

    const isEU = this.euCountries.includes(country);
    const language = this.countryLanguageMap[country] || null;

    return {
      country,
      isEU,
      language
    };
  }

  getTenantDefaultLanguage(req) {
    // Check tenant configuration
    const tenantId = req.headers['x-tenant-id'] || req.query?.tenant;
    
    // In production, this would query tenant configuration
    // For now, return null to use other detection methods
    return null;
  }

  normalizeLanguageCode(language) {
    // Convert various formats to our standard format
    const langMap = {
      'nl': 'nl-NL',
      'de': 'de-DE',
      'es': 'es-ES',
      'pt': 'pt-PT',
      'fr': 'fr-FR',
      'en': 'en-US',
      'en-gb': 'en-IE'  // Map British English to Irish for EU compliance
    };

    const normalized = language.toLowerCase();
    return langMap[normalized] || language;
  }

  isLanguageSupported(language) {
    return language && this.supportedLanguages.hasOwnProperty(language);
  }

  buildResponse(context) {
    const languageInfo = this.supportedLanguages[context.finalLanguage];
    
    return {
      language: context.finalLanguage,
      country: languageInfo.country,
      name: languageInfo.name,
      isEuUser: context.isEuUser,
      detectionMethod: context.detectionMethod,
      context: {
        userPreference: context.userPreference,
        browserLanguage: context.browserLanguage,
        geoLocation: context.geoLocation,
        tenantDefault: context.tenantDefault,
        systemDefault: context.systemDefault
      },
      supportedLanguages: Object.keys(this.supportedLanguages),
      gdprRequired: context.isEuUser
    };
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  isEuCountry(countryCode) {
    return this.euCountries.includes(countryCode);
  }
}

module.exports = new LanguageDetectionService();