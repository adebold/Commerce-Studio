const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'tenant-management',
    version: '1.0.0',
    env: process.env.NODE_ENV
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Tenant Management Service is running' });
});

// Environment info endpoint for debugging
app.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_USER: process.env.DB_USER ? 'SET' : 'NOT_SET',
    DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT_SET',
    CLOUD_SQL_CONNECTION_NAME: process.env.CLOUD_SQL_CONNECTION_NAME ? 'SET' : 'NOT_SET'
  });
});

// Start server immediately
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Tenant Management Service running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});