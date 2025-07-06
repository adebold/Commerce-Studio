// Mock NVIDIA Services Server for AI Avatar Chat System
//
// This script simulates the NVIDIA Omniverse Avatar, Riva Speech, and Merlin Conversation APIs
// for demo purposes. It provides mock responses to showcase the avatar's functionality
// without requiring actual NVIDIA services.
//

const http = require('http');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const PORT = 8080;
const CONFIG_PATH = path.join(__dirname, '..', 'demo-configuration.yaml');
const PRODUCTS_PATH = path.join(__dirname, '..', 'sample-data', 'demo-products.json');

// --- Helper Functions ---

// Simple YAML parser
const parseYaml = (yaml) => {
  const config = {};
  yaml.split('\n').forEach(line => {
    if (line.includes(':')) {
      const [key, value] = line.split(/:(.*)/s).map(s => s.trim());
      if (key && value) config[key] = value.replace(/"/g, '');
    }
  });
  return config;
};

// Load configuration
const loadConfig = () => {
  try {
    const yaml = fs.readFileSync(CONFIG_PATH, 'utf8');
    // A more robust YAML parser should be used in a real application
    return parseYaml(yaml);
  } catch (error) {
    console.error('Error loading configuration:', error);
    return {};
  }
};

const config = loadConfig();

// --- Mock API Endpoints ---

const handleRequest = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    // Omniverse Avatar Mock
    if (req.url === '/nvidia/omniverse/avatar') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        avatar_id: 'mock-avatar-123',
        status: 'streaming',
        animation_url: 'ws://localhost:8080/mock-animation-stream'
      }));
    }
    // Riva Speech-to-Text Mock
    else if (req.url === '/nvidia/riva/speech' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        transcript: "Hello, I'm looking for new glasses.",
        confidence: 0.95
      }));
    }
    // Merlin Conversation Mock
    else if (req.url === '/nvidia/merlin/conversation' && req.method === 'POST') {
      const requestBody = JSON.parse(body);
      let responseText = "I'm sorry, I don't understand.";

      if (requestBody.text.toLowerCase().includes('glasses')) {
        responseText = "Of course! Based on my analysis, I recommend our 'Aviator' or 'Wayfarer' styles. Would you like to see them?";
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        response_text: responseText,
        session_id: 'mock-session-456'
      }));
    }
    // Product Recommendations Mock
    else if (req.url === '/products' && req.method === 'GET') {
      fs.readFile(PRODUCTS_PATH, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading products');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });
};

// --- Server Initialization ---

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`✅ Mock NVIDIA server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or choose a different port.`);
  } else {
    console.error('Server error:', err);
  }
});