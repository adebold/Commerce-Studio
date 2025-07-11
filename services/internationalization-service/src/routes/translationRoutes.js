const express = require('express');
const router = express.Router();

// Get translations for a specific language
router.get('/:language', (req, res) => {
  const { language } = req.params;
  
  res.status(200).json({
    success: true,
    language,
    translations: {
      // Will be populated with actual translations
      welcome: 'Welcome',
      products: 'Products',
      consultation: 'Consultation'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;