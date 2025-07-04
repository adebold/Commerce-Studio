import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { validateRegisterRequest } from '../utils/validation.js';

export class CustomerController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateRegisterRequest(req.body);
      if (!validation.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.array().map(error => error.message)
        });
        return;
      }

      const { email, password, firstName, lastName } = req.body;
      
      // Create new customer (this will check if user exists)
      try {
        const user = await AuthService.createUser({
          email,
          password,
          firstName,
          lastName,
          roles: ['customer']
        });

        // Generate tokens by logging in
        const authService = new AuthService();
        const loginResult = await authService.login({ email, password });

        res.status(201).json({
          success: true,
          message: 'Customer registered successfully',
          data: {
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              roles: user.roles
            },
            accessToken: loginResult.accessToken,
            refreshToken: loginResult.refreshToken,
            expiresIn: loginResult.expiresIn
          }
        });
      } catch (error: any) {
        if (error.message === 'User already exists') {
          res.status(409).json({
            success: false,
            message: 'User already exists with this email'
          });
          return;
        }
        console.error('Customer registration error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    } catch (error) {
      console.error('Customer registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      const authService = new AuthService();
      const result = await authService.login({ email, password });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn
        }
      });
    } catch (error) {
      console.error('Customer login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const user = await AuthService.getUserProfile(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export const customerController = new CustomerController();
