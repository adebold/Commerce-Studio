const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3009;

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3008", "https:"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3008'],
  credentials: true
}));

// Serve static files
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    // Set appropriate headers for HTML files
    if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Language', 'nl-NL');
    }
  }
}));

// API endpoint for store information
app.get('/api/store-info', (req, res) => {
  res.json({
    name: 'Brillen Amsterdam',
    language: 'nl-NL',
    market: 'Netherlands',
    city: 'Amsterdam',
    currency: 'EUR',
    timezone: 'Europe/Amsterdam',
    features: [
      'Multi-language support',
      'Virtual try-on',
      'AI recommendations',
      'Face analysis',
      'Premium eyewear'
    ],
    contact: {
      address: 'Kalverstraat 123, 1012 AB Amsterdam',
      phone: '+31 20 123 4567',
      email: 'info@brillenamsterdam.nl'
    },
    hours: {
      monday: '09:00 - 18:00',
      tuesday: '09:00 - 18:00',
      wednesday: '09:00 - 18:00',
      thursday: '09:00 - 18:00',
      friday: '09:00 - 18:00',
      saturday: '10:00 - 17:00',
      sunday: '12:00 - 17:00'
    },
    i18nService: 'http://localhost:3008/api'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Brillen Amsterdam Demo Store',
    version: '1.0.0',
    language: 'nl-NL',
    uptime: process.uptime()
  });
});

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Er is een fout opgetreden. Probeer het later opnieuw.',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🇳🇱 Brillen Amsterdam Demo Store running on port ${PORT}`);
  console.log(`🌍 Language: Dutch (nl-NL)`);
  console.log(`🏪 Market: Netherlands - Amsterdam`);
  console.log(`🔗 Internationalization Service: http://localhost:3008`);
  console.log(`📍 Store URL: http://localhost:${PORT}`);
});

module.exports = app;