const Joi = require('joi');

/**
 * Validation middleware for consultation service
 */
class ValidationMiddleware {
  
  /**
   * Validate consultation start request
   */
  static validateStartConsultation = (req, res, next) => {
    const schema = Joi.object({
      tenantId: Joi.string().required().min(1).max(100),
      userId: Joi.string().required().min(1).max(100),
      language: Joi.string().valid('en-US', 'nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE').optional(),
      userPreferences: Joi.object().optional(),
      context: Joi.object().optional()
    });
    
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          language: req.language || 'en-US'
        }
      });
    }
    
    next();
  };

  /**
   * Validate message processing request
   */
  static validateProcessMessage = (req, res, next) => {
    const schema = Joi.object({
      consultationId: Joi.string().required().uuid(),
      message: Joi.object({
        type: Joi.string().valid('text', 'image', 'voice').required(),
        text: Joi.string().when('type', {
          is: 'text',
          then: Joi.required().min(1).max(5000),
          otherwise: Joi.optional()
        }),
        imageData: Joi.string().when('type', {
          is: 'image',
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        voiceData: Joi.string().when('type', {
          is: 'voice',
          then: Joi.required(),
          otherwise: Joi.optional()
        })
      }).required(),
      metadata: Joi.object().optional()
    });
    
    const { error } = schema.validate({
      consultationId: req.params.consultationId,
      ...req.body
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          language: req.language || 'en-US'
        }
      });
    }
    
    next();
  };

  /**
   * Validate consultation ID parameter
   */
  static validateConsultationId = (req, res, next) => {
    const schema = Joi.object({
      consultationId: Joi.string().required().uuid()
    });
    
    const { error } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid consultation ID',
          language: req.language || 'en-US'
        }
      });
    }
    
    next();
  };

  /**
   * Validate language switch request
   */
  static validateLanguageSwitch = (req, res, next) => {
    const schema = Joi.object({
      consultationId: Joi.string().required().uuid(),
      language: Joi.string().valid('en-US', 'nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE').required()
    });
    
    const { error } = schema.validate({
      consultationId: req.params.consultationId,
      ...req.body
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          language: req.language || 'en-US'
        }
      });
    }
    
    next();
  };

  /**
   * Validate tenant and user headers
   */
  static validateHeaders = (req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.headers['x-user-id'];
    
    if (!tenantId || !userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HEADERS',
          message: 'Missing required headers: x-tenant-id and x-user-id',
          language: req.language || 'en-US'
        }
      });
    }
    
    // Validate header format
    const headerSchema = Joi.object({
      tenantId: Joi.string().required().min(1).max(100),
      userId: Joi.string().required().min(1).max(100)
    });
    
    const { error } = headerSchema.validate({ tenantId, userId });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_HEADERS',
          message: 'Invalid header format',
          language: req.language || 'en-US'
        }
      });
    }
    
    next();
  };

  /**
   * Validate image upload
   */
  static validateImageUpload = (req, res, next) => {
    const schema = Joi.object({
      imageData: Joi.string().required(),
      format: Joi.string().valid('jpeg', 'jpg', 'png', 'webp').optional(),
      quality: Joi.number().min(0.1).max(1.0).optional()
    });
    
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          language: req.language || 'en-US'
        }
      });
    }
    
    // Validate base64 image data
    if (req.body.imageData && !req.body.imageData.match(/^data:image\/(jpeg|jpg|png|webp);base64,/)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_IMAGE_FORMAT',
          message: 'Image must be in base64 format with valid MIME type',
          language: req.language || 'en-US'
        }
      });
    }
    
    next();
  };

  /**
   * Validate query parameters
   */
  static validateQueryParams = (req, res, next) => {
    const schema = Joi.object({
      language: Joi.string().valid('en-US', 'nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE').optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
      status: Joi.string().valid('active', 'completed', 'cancelled').optional()
    });
    
    const { error } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          language: req.language || 'en-US'
        }
      });
    }
    
    next();
  };
}

module.exports = ValidationMiddleware;