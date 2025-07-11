const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Get translation for a specific key
router.get('/:language/:key', async (req, res) => {
  try {
    const { language, key } = req.params;
    const { namespace = 'common' } = req.query;
    
    // Load translation file
    const translationPath = `../locales/${language}.json`;
    const translations = require(translationPath);
    
    // Get translation from namespace
    const translation = translations[namespace]?.[key] || translations[key];
    
    if (!translation) {
      return res.status(404).json({
        success: false,
        error: 'Translation not found',
        language,
        key,
        namespace
      });
    }
    
    res.json({
      success: true,
      translation,
      language,
      key,
      namespace
    });
  } catch (error) {
    logger.error('Translation retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve translation'
    });
  }
});

// Get all translations for a language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { namespace } = req.query;
    
    // Load translation file
    const translationPath = `../locales/${language}.json`;
    const translations = require(translationPath);
    
    // Return specific namespace or all translations
    const result = namespace ? translations[namespace] || {} : translations;
    
    res.json({
      success: true,
      translations: result,
      language,
      namespace: namespace || 'all'
    });
  } catch (error) {
    logger.error('Translation retrieval error:', error);
    res.status(404).json({
      success: false,
      error: 'Language not found or translation file missing',
      language: req.params.language
    });
  }
});

// Get multiple translations
router.post('/batch', async (req, res) => {
  try {
    const { language, keys, namespace = 'common' } = req.body;
    
    if (!language || !keys || !Array.isArray(keys)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request. Language and keys array are required'
      });
    }
    
    // Load translation file
    const translationPath = `../locales/${language}.json`;
    const translations = require(translationPath);
    
    // Get translations for all keys
    const result = {};
    keys.forEach(key => {
      const translation = translations[namespace]?.[key] || translations[key];
      if (translation) {
        result[key] = translation;
      }
    });
    
    res.json({
      success: true,
      translations: result,
      language,
      namespace,
      requestedKeys: keys.length,
      foundKeys: Object.keys(result).length
    });
  } catch (error) {
    logger.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve translations'
    });
  }
});

// Search translations
router.get('/:language/search', async (req, res) => {
  try {
    const { language } = req.params;
    const { q: query, namespace } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Load translation file
    const translationPath = `../locales/${language}.json`;
    const translations = require(translationPath);
    
    // Search translations
    const results = {};
    const searchTranslations = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'string') {
          if (obj[key].toLowerCase().includes(query.toLowerCase()) || 
              key.toLowerCase().includes(query.toLowerCase())) {
            results[fullKey] = obj[key];
          }
        } else if (typeof obj[key] === 'object') {
          searchTranslations(obj[key], fullKey);
        }
      });
    };
    
    if (namespace && translations[namespace]) {
      searchTranslations(translations[namespace], namespace);
    } else {
      searchTranslations(translations);
    }
    
    res.json({
      success: true,
      results,
      language,
      query,
      namespace: namespace || 'all',
      resultCount: Object.keys(results).length
    });
  } catch (error) {
    logger.error('Translation search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search translations'
    });
  }
});

module.exports = router;