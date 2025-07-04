import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwtService';
import { AuthService } from '../services/authService';
import { User } from '../types/auth';

// Type for authenticated user (without password hash, with _id instead of id)
type AuthenticatedUser = Omit<User, 'passwordHash' | 'id'> & { _id: string };

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        message: 'Access token required',
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
      return;
    }

    // Verify token and get user data
    const user = await AuthService.verifyAccessToken(token);
    req.user = user as AuthenticatedUser;
    
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed';
    
    if (message === 'Token expired') {
      res.status(401).json({
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    if (message === 'Invalid token') {
      res.status(401).json({
        error: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
      return;
    }

    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Middleware to check if user has required roles
 */
export const requireRoles = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: userRoles
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = requireRoles(['admin']);

/**
 * Middleware to check if user is active
 */
export const requireActiveUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (!req.user.isActive) {
    res.status(403).json({
      error: 'Account is inactive',
      code: 'ACCOUNT_INACTIVE'
    });
    return;
  }

  next();
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const user = await AuthService.verifyAccessToken(token);
      req.user = user as AuthenticatedUser;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.warn('Optional auth failed:', error);
  }

  next();
};