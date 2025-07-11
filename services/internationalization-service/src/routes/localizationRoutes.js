const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Get localization data for a specific language and region
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { region, format = 'json' } = req.query;
    
    // Load translation file
    const translationPath = `../locales/${language}.json`;
    const translations = require(translationPath);
    
    // Get localization data
    const localizationData = {
      language,
      region: region || language.split('-')[1]?.toUpperCase(),
      translations: translations,
      metadata: {
        dateFormat: getDateFormat(language),
        timeFormat: getTimeFormat(language),
        numberFormat: getNumberFormat(language),
        currencyFormat: getCurrencyFormat(language),
        rtl: isRTL(language),
        pluralRules: getPluralRules(language)
      }
    };
    
    // Return in requested format
    if (format === 'js') {
      res.setHeader('Content-Type', 'application/javascript');
      res.send(`window.i18n = ${JSON.stringify(localizationData, null, 2)};`);
    } else {
      res.json({
        success: true,
        data: localizationData
      });
    }
  } catch (error) {
    logger.error('Localization data retrieval error:', error);
    res.status(404).json({
      success: false,
      error: 'Language not found or localization data missing',
      language: req.params.language
    });
  }
});

// Get formatting information only
router.get('/:language/formats', async (req, res) => {
  try {
    const { language } = req.params;
    
    const formats = {
      language,
      dateFormat: getDateFormat(language),
      timeFormat: getTimeFormat(language),
      numberFormat: getNumberFormat(language),
      currencyFormat: getCurrencyFormat(language),
      rtl: isRTL(language),
      pluralRules: getPluralRules(language)
    };
    
    res.json({
      success: true,
      formats
    });
  } catch (error) {
    logger.error('Format retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve format information'
    });
  }
});

// Format a date according to language preferences
router.post('/:language/format/date', async (req, res) => {
  try {
    const { language } = req.params;
    const { date, format } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }
    
    const dateObj = new Date(date);
    const locale = language.replace('-', '_');
    
    let formattedDate;
    if (format) {
      // Custom format
      formattedDate = formatDateCustom(dateObj, format, language);
    } else {
      // Default locale format
      formattedDate = dateObj.toLocaleDateString(locale);
    }
    
    res.json({
      success: true,
      original: date,
      formatted: formattedDate,
      language,
      format: format || 'default'
    });
  } catch (error) {
    logger.error('Date formatting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to format date'
    });
  }
});

// Format a number according to language preferences
router.post('/:language/format/number', async (req, res) => {
  try {
    const { language } = req.params;
    const { number, type = 'decimal' } = req.body;
    
    if (number === undefined || number === null) {
      return res.status(400).json({
        success: false,
        error: 'Number is required'
      });
    }
    
    const locale = language.replace('-', '_');
    let formattedNumber;
    
    switch (type) {
      case 'currency':
        formattedNumber = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: getCurrencyCode(language)
        }).format(number);
        break;
      case 'percent':
        formattedNumber = new Intl.NumberFormat(locale, {
          style: 'percent'
        }).format(number);
        break;
      default:
        formattedNumber = new Intl.NumberFormat(locale).format(number);
    }
    
    res.json({
      success: true,
      original: number,
      formatted: formattedNumber,
      language,
      type
    });
  } catch (error) {
    logger.error('Number formatting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to format number'
    });
  }
});

// Helper functions
function getDateFormat(language) {
  const formats = {
    'en-US': 'MM/dd/yyyy',
    'en-GB': 'dd/MM/yyyy',
    'de-DE': 'dd.MM.yyyy',
    'nl-NL': 'dd-MM-yyyy',
    'es-ES': 'dd/MM/yyyy',
    'pt-PT': 'dd/MM/yyyy',
    'fr-FR': 'dd/MM/yyyy'
  };
  return formats[language] || 'dd/MM/yyyy';
}

function getTimeFormat(language) {
  const formats = {
    'en-US': '12h',
    'en-GB': '24h',
    'de-DE': '24h',
    'nl-NL': '24h',
    'es-ES': '24h',
    'pt-PT': '24h',
    'fr-FR': '24h'
  };
  return formats[language] || '24h';
}

function getNumberFormat(language) {
  const formats = {
    'en-US': { decimal: '.', thousands: ',' },
    'en-GB': { decimal: '.', thousands: ',' },
    'de-DE': { decimal: ',', thousands: '.' },
    'nl-NL': { decimal: ',', thousands: '.' },
    'es-ES': { decimal: ',', thousands: '.' },
    'pt-PT': { decimal: ',', thousands: '.' },
    'fr-FR': { decimal: ',', thousands: ' ' }
  };
  return formats[language] || { decimal: '.', thousands: ',' };
}

function getCurrencyFormat(language) {
  const formats = {
    'en-US': { currency: 'USD', symbol: '$', position: 'before' },
    'en-GB': { currency: 'GBP', symbol: '£', position: 'before' },
    'de-DE': { currency: 'EUR', symbol: '€', position: 'after' },
    'nl-NL': { currency: 'EUR', symbol: '€', position: 'after' },
    'es-ES': { currency: 'EUR', symbol: '€', position: 'after' },
    'pt-PT': { currency: 'EUR', symbol: '€', position: 'after' },
    'fr-FR': { currency: 'EUR', symbol: '€', position: 'after' }
  };
  return formats[language] || { currency: 'USD', symbol: '$', position: 'before' };
}

function getCurrencyCode(language) {
  const codes = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'de-DE': 'EUR',
    'nl-NL': 'EUR',
    'es-ES': 'EUR',
    'pt-PT': 'EUR',
    'fr-FR': 'EUR'
  };
  return codes[language] || 'USD';
}

function isRTL(language) {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language.split('-')[0]);
}

function getPluralRules(language) {
  const rules = {
    'en-US': 'en',
    'en-GB': 'en',
    'de-DE': 'de',
    'nl-NL': 'nl',
    'es-ES': 'es',
    'pt-PT': 'pt',
    'fr-FR': 'fr'
  };
  return rules[language] || 'en';
}

function formatDateCustom(date, format, language) {
  // Simple date formatting - could be enhanced with a library like date-fns
  const formats = {
    'yyyy': date.getFullYear(),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'dd': String(date.getDate()).padStart(2, '0'),
    'HH': String(date.getHours()).padStart(2, '0'),
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'ss': String(date.getSeconds()).padStart(2, '0')
  };
  
  let formatted = format;
  Object.keys(formats).forEach(key => {
    formatted = formatted.replace(new RegExp(key, 'g'), formats[key]);
  });
  
  return formatted;
}

module.exports = router;