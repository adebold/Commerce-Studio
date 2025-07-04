#!/usr/bin/env node

/**
 * Local ML API Server
 * 
 * This script starts a local Express server that simulates the ML API
 * for development and testing purposes. It provides mock responses to the
 * endpoints used by the ML client.
 * 
 * Usage:
 *   node start-local-ml-api.js [port]
 * 
 * Examples:
 *   node start-local-ml-api.js
 *   node start-local-ml-api.js 5000
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Sample data
const mockFrames = [
  {
    frame_id: 'frame-001',
    brand: 'EyewearML Classic',
    style: 'modern',
    price: 129.99,
    color: 'black',
    material: 'metal',
    image_url: 'https://example.com/frames/frame-001.jpg',
    rating: 4.5
  },
  {
    frame_id: 'frame-002',
    brand: 'EyewearML Premium',
    style: 'vintage',
    price: 159.99,
    color: 'tortoise',
    material: 'acetate',
    image_url: 'https://example.com/frames/frame-002.jpg',
    rating: 4.8
  },
  {
    frame_id: 'frame-003',
    brand: 'EyewearML Sport',
    style: 'sporty',
    price: 119.99,
    color: 'blue',
    material: 'plastic',
    image_url: 'https://example.com/frames/frame-003.jpg',
    rating: 4.3
  },
  {
    frame_id: 'frame-004',
    brand: 'EyewearML Designer',
    style: 'cat-eye',
    price: 179.99,
    color: 'red',
    material: 'acetate',
    image_url: 'https://example.com/frames/frame-004.jpg',
    rating: 4.7
  },
  {
    frame_id: 'frame-005',
    brand: 'EyewearML Eco',
    style: 'round',
    price: 149.99,
    color: 'green',
    material: 'wood',
    image_url: 'https://example.com/frames/frame-005.jpg',
    rating: 4.6
  }
];

// Face shape analysis
const mockFaceShapeAnalysis = {
  faceShape: {
    id: 2,
    name: 'round',
    confidence: 0.87
  },
  measurements: {
    pupillaryDistance: 64.2,
    jawlineWidth: 135.7,
    foreheadWidth: 147.3
  },
  skinTone: 'medium',
  recommendedShapes: [
    {
      name: 'rectangle',
      reason: 'Adds definition and makes your face appear longer'
    },
    {
      name: 'square',
      reason: 'Provides angles that contrast with your round features'
    },
    {
      name: 'cat-eye',
      reason: 'Draws attention upward and adds dimension'
    }
  ],
  confidenceScores: {
    faceShape: 0.87,
    measurements: 0.92,
    skinTone: 0.84
  },
  success: true
};

// Create Express app
const app = express();
const port = process.argv[2] || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Authentication middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  // In a real environment, this would validate the token
  // For this mock server, we accept any token that starts with "local-"
  const token = authHeader.split(' ')[1];
  if (token && !token.startsWith('local-') && token !== 'dev-api-key-placeholder' && token !== 'staging-api-key-placeholder') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
  }
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'EyewearML Local API Server',
    version: '1.0.0',
    endpoints: [
      '/api/recommendations',
      '/api/face-analysis',
      '/api/frame-compatibility',
      '/api/biometric-profile',
      '/api/try-on-event',
      '/api/similar-frames',
      '/api/style-recommendations'
    ]
  });
});

// Recommendations endpoint
app.post('/api/recommendations', (req, res) => {
  const { user_id, session_id, limit = 5 } = req.body;
  
  console.log(`Getting recommendations for user: ${user_id}, session: ${session_id}, limit: ${limit}`);
  
  // Return random subset of frames with reasoning
  const recommendations = shuffleArray([...mockFrames])
    .slice(0, limit)
    .map(frame => ({
      ...frame,
      score: (Math.random() * 0.5 + 0.5).toFixed(2), // Random score between 0.5 and 1.0
      reasoning: `This frame was recommended because it matches your preference for ${frame.style} styles and ${frame.color} colors.`
    }));
  
  res.json(recommendations);
});

// Face Analysis endpoint
app.post('/api/face-analysis', (req, res) => {
  const { image_url } = req.body;
  
  console.log(`Analyzing face from image: ${image_url}`);
  
  // Return mock face analysis data
  res.json(mockFaceShapeAnalysis);
});

// Frame Compatibility endpoint
app.post('/api/frame-compatibility', (req, res) => {
  const { face_shape, filters = {} } = req.body;
  
  console.log(`Getting frame compatibility for face shape: ${face_shape}, filters:`, filters);
  
  // Filter frames based on input
  let compatibleFrames = [...mockFrames];
  
  if (filters.color) {
    compatibleFrames = compatibleFrames.filter(frame => 
      frame.color.toLowerCase() === filters.color.toLowerCase()
    );
  }
  
  if (filters.material) {
    compatibleFrames = compatibleFrames.filter(frame => 
      frame.material.toLowerCase() === filters.material.toLowerCase()
    );
  }
  
  // Add compatibility score
  compatibleFrames = compatibleFrames.map(frame => ({
    ...frame,
    compatibility_score: (Math.random() * 0.3 + 0.7).toFixed(2) // Random score between 0.7 and 1.0
  }));
  
  res.json(compatibleFrames);
});

// Biometric Profile endpoint
app.post('/api/biometric-profile', (req, res) => {
  const { user_id, ...biometric_data } = req.body;
  
  console.log(`Updating biometric profile for user: ${user_id}`, biometric_data);
  
  res.json({
    success: true,
    message: 'Biometric profile updated successfully'
  });
});

// Try-On Event endpoint
app.post('/api/try-on-event', (req, res) => {
  const { user_id, frame_id, ...event_data } = req.body;
  
  console.log(`Recording try-on event - user: ${user_id}, frame: ${frame_id}`, event_data);
  
  res.json({
    success: true,
    message: 'Try-on event recorded successfully'
  });
});

// Similar Frames endpoint
app.post('/api/similar-frames', (req, res) => {
  const { frame_id, limit = 3 } = req.body;
  
  console.log(`Getting similar frames to: ${frame_id}, limit: ${limit}`);
  
  // Return random frames as similar
  const similarFrames = shuffleArray([...mockFrames])
    .filter(frame => frame.frame_id !== frame_id)
    .slice(0, limit)
    .map(frame => ({
      ...frame,
      similarity_score: (Math.random() * 0.4 + 0.6).toFixed(2) // Random score between 0.6 and 1.0
    }));
  
  res.json(similarFrames);
});

// Style Recommendations endpoint
app.post('/api/style-recommendations', (req, res) => {
  const { style, filters = {}, limit = 5 } = req.body;
  
  console.log(`Getting style recommendations for: ${style}, filters:`, filters, `limit: ${limit}`);
  
  // Filter frames based on style and other filters
  let styleFrames = [...mockFrames];
  
  if (style) {
    styleFrames = styleFrames.filter(frame => 
      frame.style.toLowerCase() === style.toLowerCase()
    );
  }
  
  if (filters.color) {
    styleFrames = styleFrames.filter(frame => 
      frame.color.toLowerCase() === filters.color.toLowerCase()
    );
  }
  
  if (filters.material) {
    styleFrames = styleFrames.filter(frame => 
      frame.material.toLowerCase() === filters.material.toLowerCase()
    );
  }
  
  // If no frames match the filters, return random frames
  if (styleFrames.length === 0) {
    styleFrames = shuffleArray([...mockFrames]).slice(0, limit);
  } else {
    styleFrames = styleFrames.slice(0, limit);
  }
  
  res.json(styleFrames);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server Error',
    message: 'An internal server error occurred'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Local ML API server running at http://localhost:${port}`);
  console.log(`API base URL: http://localhost:${port}/api`);
  console.log('Use Ctrl+C to stop the server');
});

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
