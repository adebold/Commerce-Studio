import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware to validate tenant ID from headers
 */
export const validateTenantId = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    logger.warn({ req_id: req.id }, 'Missing tenant ID in request headers');
    return res.status(400).json({
      success: false,
      error: 'Missing tenant ID in request headers',
      code: 'MISSING_TENANT_ID',
      requestId: req.id
    });
  }
  
  // Validate tenant ID format (basic validation)
  if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
    logger.warn({ req_id: req.id, tenantId }, 'Invalid tenant ID format');
    return res.status(400).json({
      success: false,
      error: 'Invalid tenant ID format',
      code: 'INVALID_TENANT_ID',
      requestId: req.id
    });
  }
  
  next();
};

/**
 * Middleware to validate API key (optional - for future use)
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    logger.warn({ req_id: req.id }, 'Missing API key in request headers');
    return res.status(401).json({
      success: false,
      error: 'Missing API key in request headers',
      code: 'MISSING_API_KEY',
      requestId: req.id
    });
  }
  
  // In a real implementation, you would validate the API key against a database
  // For now, we'll just check if it exists
  next();
};

/**
 * Middleware to validate request body
 */
export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      logger.warn({ req_id: req.id, missingFields }, 'Missing required fields in request body');
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        requestId: req.id
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate query parameters
 */
export const validateQueryParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingParams = requiredParams.filter(param => !req.query[param]);
    
    if (missingParams.length > 0) {
      logger.warn({ req_id: req.id, missingParams }, 'Missing required query parameters');
      return res.status(400).json({
        success: false,
        error: `Missing required query parameters: ${missingParams.join(', ')}`,
        code: 'MISSING_REQUIRED_PARAMS',
        requestId: req.id
      });
    }
    
    next();
  };
};