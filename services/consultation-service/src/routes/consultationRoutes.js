const express = require('express');
const router = express.Router();
const ValidationMiddleware = require('../middleware/ValidationMiddleware');

/**
 * Consultation API Routes
 */

/**
 * POST /api/consultation/start
 * Start a new consultation session
 */
router.post('/start', 
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateStartConsultation,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { tenantId, userId, language, userPreferences, context } = req.body;
      
      const result = await consultationService.startConsultation(
        tenantId || req.headers['x-tenant-id'],
        userId || req.headers['x-user-id'],
        language || req.language,
        { userPreferences, context }
      );
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/consultation/:consultationId/message
 * Process a consultation message
 */
router.post('/:consultationId/message',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateProcessMessage,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { consultationId } = req.params;
      const { message, metadata } = req.body;
      
      const result = await consultationService.processMessage(
        consultationId,
        message,
        { metadata }
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/consultation/:consultationId/image
 * Process image upload for face analysis
 */
router.post('/:consultationId/image',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateConsultationId,
  ValidationMiddleware.validateImageUpload,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { consultationId } = req.params;
      const { imageData, format, quality } = req.body;
      
      const message = {
        type: 'image',
        imageData,
        format,
        quality
      };
      
      const result = await consultationService.processMessage(
        consultationId,
        message,
        { metadata: { source: 'image_upload' } }
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/consultation/:consultationId/status
 * Get consultation status
 */
router.get('/:consultationId/status',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateConsultationId,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { consultationId } = req.params;
      
      const status = consultationService.getConsultationStatus(consultationId);
      
      if (!status.found) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONSULTATION_NOT_FOUND',
            message: 'Consultation not found',
            language: req.language
          }
        });
      }
      
      res.json({
        success: true,
        consultationId,
        status: status.status,
        language: status.language,
        messageCount: status.messageCount,
        hasRecommendations: status.hasRecommendations,
        hasFaceAnalysis: status.hasFaceAnalysis
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/consultation/:consultationId/language
 * Switch consultation language
 */
router.put('/:consultationId/language',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateLanguageSwitch,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { consultationId } = req.params;
      const { language } = req.body;
      
      const result = await consultationService.switchLanguage(consultationId, language);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/consultation/:consultationId
 * End consultation session
 */
router.delete('/:consultationId',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateConsultationId,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { consultationId } = req.params;
      
      const result = await consultationService.endConsultation(consultationId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/consultation/languages
 * Get supported languages
 */
router.get('/languages',
  ValidationMiddleware.validateQueryParams,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      
      res.json({
        success: true,
        supportedLanguages: consultationService.supportedLanguages,
        defaultLanguage: 'en-US',
        currentLanguage: req.language
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/consultation/:consultationId/history
 * Get consultation message history
 */
router.get('/:consultationId/history',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateConsultationId,
  ValidationMiddleware.validateQueryParams,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { consultationId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const consultation = consultationService.activeConsultations.get(consultationId) ||
                          consultationService.consultationHistory.get(consultationId);
      
      if (!consultation) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONSULTATION_NOT_FOUND',
            message: 'Consultation not found',
            language: req.language
          }
        });
      }
      
      const messages = consultation.messages.slice(offset, offset + limit);
      
      res.json({
        success: true,
        consultationId,
        messages,
        pagination: {
          total: consultation.messages.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + limit < consultation.messages.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/consultation/:consultationId/recommendations
 * Get consultation recommendations
 */
router.get('/:consultationId/recommendations',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateConsultationId,
  async (req, res, next) => {
    try {
      const consultationService = req.app.locals.consultationService;
      const { consultationId } = req.params;
      
      const consultation = consultationService.activeConsultations.get(consultationId) ||
                          consultationService.consultationHistory.get(consultationId);
      
      if (!consultation) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONSULTATION_NOT_FOUND',
            message: 'Consultation not found',
            language: req.language
          }
        });
      }
      
      const recommendations = consultation.context.recommendations || [];
      const faceAnalysis = consultation.context.faceAnalysis;
      
      res.json({
        success: true,
        consultationId,
        recommendations,
        faceAnalysis: faceAnalysis ? {
          faceShape: faceAnalysis.faceShape,
          confidence: faceAnalysis.confidence,
          measurements: faceAnalysis.measurements
        } : null,
        language: consultation.language
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/consultation/:consultationId/feedback
 * Submit consultation feedback
 */
router.post('/:consultationId/feedback',
  ValidationMiddleware.validateHeaders,
  ValidationMiddleware.validateConsultationId,
  async (req, res, next) => {
    try {
      const { consultationId } = req.params;
      const { rating, feedback, improvements } = req.body;
      
      // Validate feedback data
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_RATING',
            message: 'Rating must be between 1 and 5',
            language: req.language
          }
        });
      }
      
      const consultationService = req.app.locals.consultationService;
      const consultation = consultationService.activeConsultations.get(consultationId) ||
                          consultationService.consultationHistory.get(consultationId);
      
      if (!consultation) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONSULTATION_NOT_FOUND',
            message: 'Consultation not found',
            language: req.language
          }
        });
      }
      
      // Store feedback in consultation context
      consultation.context.feedback = {
        rating,
        feedback,
        improvements,
        timestamp: new Date(),
        language: req.language
      };
      
      res.json({
        success: true,
        consultationId,
        message: 'Feedback submitted successfully',
        language: req.language
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;