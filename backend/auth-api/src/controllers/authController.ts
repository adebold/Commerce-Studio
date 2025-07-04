import { Request, Response } from 'express';
import { AuthService, AuthError } from '../services/authService';
import { JwtService } from '../services/jwtService';
import { LoginRequest, RefreshTokenRequest } from '../types/auth';
import {
  validateLoginRequest,
  validateRefreshTokenRequest,
  validateRegisterRequest,
  validateChangePasswordRequest,
  validateUpdateProfileRequest,
} from '../utils/validation';

export class AuthController {
  /**
   * POST /api/auth/login
   * Authenticate user and return JWT tokens
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validateLoginRequest(req.body);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const credentials: LoginRequest = req.body;
      const result = await AuthService.login(credentials);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Revoke refresh token
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      await AuthService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validateRefreshTokenRequest(req.body);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { refreshToken }: RefreshTokenRequest = req.body;
      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Extract user ID from JWT payload (set by auth middleware)
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await AuthService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * POST /api/auth/register
   * Register a new user account
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validateChangePasswordRequest(req.body);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { email, password, firstName, lastName } = req.body;
      
      const user = await AuthService.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
        return;
      }

      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * PUT /api/auth/change-password
   * Change user password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validateLoginRequest(req.body);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * PUT /api/auth/profile
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validateUpdateProfileRequest(req.body);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const userId = (req as any).user?.userId;
      const { firstName, lastName, email } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const updatedUser = await AuthService.updateUserProfile(userId, {
        firstName,
        lastName,
        email,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already in use') {
        res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
        return;
      }

      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * POST /api/auth/revoke-all-tokens
   * Revoke all refresh tokens for the current user (security feature)
   */
  static async revokeAllTokens(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      await AuthService.revokeAllUserTokens(userId);

      res.status(200).json({
        success: true,
        message: 'All tokens revoked successfully',
      });
    } catch (error) {
      console.error('Revoke all tokens error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/auth/verify-token
   * Verify if the current access token is valid
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'No token provided',
        });
        return;
      }

      const token = authHeader.substring(7);
      const user = await AuthService.verifyAccessToken(token);

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: user,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  }
}