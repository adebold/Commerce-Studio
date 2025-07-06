/**
 * @fileoverview Magento AI Discovery Chat API
 * Provides chat functionality with unified Dialogflow service integration
 * @module apps/magento/api/chat
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import UnifiedDialogflowService from '../../../services/google/unified-dialogflow-service.js';

const router = express.Router();

// Initialize unified Dialogflow service
const dialogflowService = new UnifiedDialogflowService({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  sessionId: 'magento-session',
  languageCode: 'en-US'
});

// Security middleware
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"]
    }
  }
}));

router.use(cors({
  origin: process.env.MAGENTO_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

/**
 * POST /api/chat
 * Process chat messages with unified Dialogflow service
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = uuidv4(), context = {} } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string',
        provider: 'validation'
      });
    }

    // Process message through unified Dialogflow service
    const response = await dialogflowService.processMessage(message, {
      sessionId,
      context: {
        platform: 'magento',
        ...context
      }
    });

    // Return standardized response
    res.json({
      success: true,
      response: response.text,
      sessionId: response.sessionId,
      intent: response.intent,
      confidence: response.confidence,
      provider: response.provider,
      timestamp: new Date().toISOString(),
      platform: 'magento'
    });

  } catch (error) {
    console.error('Magento Chat API Error:', error);
    
    // Return error response with fallback
    res.status(500).json({
      success: false,
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      error: error.message,
      provider: 'error-fallback',
      timestamp: new Date().toISOString(),
      platform: 'magento'
    });
  }
});

/**
 * GET /api/chat/health
 * Health check endpoint
 */
router.get('/chat/health', async (req, res) => {
  try {
    const health = await dialogflowService.healthCheck();
    res.json({
      success: true,
      status: 'healthy',
      services: health,
      platform: 'magento',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      platform: 'magento',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;