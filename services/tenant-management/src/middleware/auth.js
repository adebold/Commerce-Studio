const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateApiKey = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7);
    
    // In a real production environment, this should be a more secure, constant-time comparison
    // and should ideally be handled by a dedicated authentication service.
    const isAdminKeyValid = token === process.env.ADMIN_API_KEY;

    if (!isAdminKeyValid) {
      logger.warn('Invalid admin API key attempt');
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'UNAUTHORIZED'
      });
    }

    // Set admin user context
    req.user = {
      id: 'admin',
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      code: 'UNAUTHORIZED'
    });
  }
};

const requireAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required',
      code: 'FORBIDDEN'
    });
  }
  next();
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: `Permission '${permission}' required`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

module.exports = {
  authenticateApiKey,
  requireAdminRole,
  requirePermission
};