import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index';
import { JwtPayload } from '../types/auth';

export class JwtService {
  /**
   * Generate an access token for a user
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
      expiresIn: config.jwt.accessTokenExpiry as any,
      issuer: 'eyewearml-auth',
      audience: 'eyewearml-app',
    };
    
    return jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.secret,
      options
    );
  }

  /**
   * Generate a refresh token (just a random string, stored separately)
   */
  static generateRefreshToken(): string {
    const options: SignOptions = {
      expiresIn: config.jwt.refreshTokenExpiry as any,
      issuer: 'eyewearml-auth',
      audience: 'eyewearml-app',
    };
    
    return jwt.sign(
      {
        type: 'refresh',
        jti: Math.random().toString(36).substring(2) + Date.now().toString(36)
      },
      config.jwt.secret,
      options
    );
  }

  /**
   * Verify and decode an access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'eyewearml-auth',
        audience: 'eyewearml-app',
      }) as JwtPayload & { type?: string };
      
      // Check if this is actually an access token
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid token type') {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify a refresh token
   */
  static verifyRefreshToken(token: string): any {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'eyewearml-auth',
        audience: 'eyewearml-app',
      }) as any;
      
      // Check if this is actually a refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid token type') {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] || null;
  }

  /**
   * Get token expiry time in seconds
   */
  static getAccessTokenExpirySeconds(): number {
    const expiry = config.jwt.accessTokenExpiry;
    
    // Parse time string (e.g., "15m", "1h", "7d")
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900;
    }
  }
}