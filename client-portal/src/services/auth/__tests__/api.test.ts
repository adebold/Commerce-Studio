import { describe, expect, it } from 'vitest';
import authService from '../authService';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Auth API Service', () => {
  it('should login with valid credentials', async () => {
    const response = await authService.login({ 
      email: 'john.doe@example.com', 
      password: 'process.env.API_SECRET_6' 
    });
    
    expect(response).toHaveProperty('accessToken');
    expect(response).toHaveProperty('refreshToken');
    expect(response.user).toEqual(expect.objectContaining({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    }));
  });
  
  it('should throw error with invalid credentials', async () => {
    await expect(
      authService.login({ 
        email: 'wrong@example.com', 
        password: 'process.env.API_SECRET_6_1' 
      })
    ).rejects.toThrow();
  });
  
  it('should register a new user', async () => {
    await expect(
      authService.register({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'process.env.API_SECRET_6_2'
      })
    ).resolves.not.toThrow();
  });
  
  it('should throw error when registering with existing email', async () => {
    // Mock a specific response for this test
    server.use(
      http.post('/api/auth/register', () => {
        return new HttpResponse(
          JSON.stringify({ message: 'User with this email already exists' }),
          { status: 409 }
        );
      })
    );
    
    await expect(
      authService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'process.env.API_SECRET_6_2'
      })
    ).rejects.toThrow();
  });
  
  it('should send password reset email', async () => {
    await expect(
      authService.forgotPassword({ email: 'john.doe@example.com' })
    ).resolves.not.toThrow();
  });
  
  it('should reset password with valid token', async () => {
    await expect(
      authService.resetPassword({
        token: 'valid-token-123',
        password: 'Newprocess.env.API_SECRET_6_2'
      })
    ).resolves.not.toThrow();
  });
  
  it('should throw error when resetting password with invalid token', async () => {
    // Mock a specific response for this test
    server.use(
      http.post('/api/auth/reset-password', () => {
        return new HttpResponse(
          JSON.stringify({ message: 'Invalid or expired token' }),
          { status: 400 }
        );
      })
    );
    
    await expect(
      authService.resetPassword({
        token: 'invalid-token',
        password: 'Newprocess.env.API_SECRET_6_2'
      })
    ).rejects.toThrow();
  });
  
  it('should logout successfully', async () => {
    // First login to set tokens
    await authService.login({ 
      email: 'john.doe@example.com', 
      password: 'process.env.API_SECRET_6'
    });
    
    // Then logout
    await expect(
      authService.logout()
    ).resolves.not.toThrow();
  });
});
