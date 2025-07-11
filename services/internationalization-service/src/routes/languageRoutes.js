const express = require('express');
const router = express.Router();
const LanguageController = require('../controllers/LanguageController');

// Language detection endpoint
router.get('/detect', LanguageController.detectLanguage);

// Get supported languages
router.get('/supported', LanguageController.getSupportedLanguages);

// Set user language preference
router.post('/preference', LanguageController.setLanguagePreference);

// Get language information
router.get('/info/:language', LanguageController.getLanguageInfo);

module.exports = router;