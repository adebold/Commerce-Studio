const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Virtual try-on model endpoint
app.get('/virtual-try-on/model', (req, res) => {
  res.json({
    success: true,
    model_url: 'https://example.com/model.glb',
    style_score: 85
  });
});

// Face shape detection endpoint
app.post('/face-analysis/detect-shape', (req, res) => {
  res.json({
    success: true,
    face_shape: 'oval',
    confidence: 0.92
  });
});

// Product recommendations endpoint
app.get('/recommendations', (req, res) => {
  res.json({
    success: true,
    recommendations: [
      { id: 101, name: 'Classic Frames', price: 99.99, image_url: 'https://example.com/frames1.jpg' },
      { id: 102, name: 'Modern Frames', price: 129.99, image_url: 'https://example.com/frames2.jpg' },
      { id: 103, name: 'Vintage Frames', price: 89.99, image_url: 'https://example.com/frames3.jpg' }
    ]
  });
});

// Analytics tracking endpoint
app.post('/analytics/track', (req, res) => {
  console.log('Tracking event:', req.body);
  res.json({ success: true });
});

// Webhook handling endpoint
app.post('/webhooks/:platform', (req, res) => {
  console.log(`Received webhook for ${req.params.platform}:`, req.body);
  res.json({ success: true });
});

// Authentication endpoint
app.post('/auth/token', (req, res) => {
  res.json({
    access_token: 'mock_access_token',
    token_type: 'Bearer',
    expires_in: 3600
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});