const express = require('express');
const { validateLanguage } = require('../middleware/languageMiddleware');
const LanguageController = require('../controllers/LanguageController');

const router = express.Router();

// Get all supported languages
router.get('/supported', LanguageController.getSupportedLanguages);

// Detect language for a user
router.post('/detect', LanguageController.detectLanguage);

// Get language information
router.get('/:language/info', validateLanguage, LanguageController.getLanguageInfo);

// Set user language preference
router.post('/preference', LanguageController.setUserLanguagePreference);

// Get user language preference
router.get('/preference/:userId', LanguageController.getUserLanguagePreference);

// Get country language recommendations
router.get('/recommendations/:countryCode', LanguageController.getCountryLanguageRecommendations);

// Validate language code
router.get('/:language/validate', validateLanguage, LanguageController.validateLanguage);

module.exports = router;