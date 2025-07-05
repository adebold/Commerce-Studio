import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { loginRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimiter';
import { LoginRequest } from '../types/auth';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body as LoginRequest & { username?: string };

    // Validate input
    if ((!email && !username) || !password) {
      res.status(400).json({
        message: 'Validation error',
        error: 'Email/username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
      return;
    }

    // Use email or username for login
    const loginIdentifier = email || username;
    
    if (!loginIdentifier) {
      res.status(400).json({
        message: 'Validation error',
        error: 'Email or username is required',
        code: 'MISSING_CREDENTIALS'
      });
      return;
    }

    // Validate email format only if email is provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          message: 'Validation error',
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        });
        return;
      }
    }

    // Authenticate user
    const result = await AuthService.login({ email: loginIdentifier, password });

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    
    if (message === 'Invalid credentials') {
      res.status(401).json({
        message: 'Invalid credentials',
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        message: 'Validation error',
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    
    if (message.includes('Invalid refresh token') || message.includes('not found')) {
      res.status(401).json({
        message: 'Invalid refresh token',
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    if (message.includes('expired')) {
      res.status(401).json({
        message: 'Refresh token expired',
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
      return;
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user by revoking refresh token
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        message: 'Validation error',
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }

    await AuthService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    
    if (message.includes('Invalid refresh token') || message.includes('not found')) {
      res.status(400).json({
        message: 'Invalid refresh token',
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    console.error('Logout error:', error);
    // Always return success for logout to prevent information leakage
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    // Get fresh user data
    const user = await AuthService.getUserProfile(req.user._id);

    res.status(200).json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user profile';
    
    if (message === 'User not found') {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const { firstName, lastName, email } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        });
        return;
      }
    }

    const updatedUser = await AuthService.updateUserProfile(req.user._id, {
      firstName,
      lastName,
      email
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    
    if (message === 'Email already in use') {
      res.status(409).json({
        error: 'Email already in use',
        code: 'EMAIL_IN_USE'
      });
      return;
    }

    if (message === 'User not found') {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: 'Current password and new password are required',
        code: 'MISSING_PASSWORDS'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        error: 'New password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
      return;
    }

    await AuthService.changePassword(req.user._id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    
    if (message === 'Current password is incorrect') {
      res.status(400).json({
        error: 'Current password is incorrect',
        code: 'INCORRECT_PASSWORD'
      });
      return;
    }

    if (message === 'User not found') {
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;