import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import authService from '../authService_fixed';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    })),
    post: vi.fn(),
    isAxiosError: vi.fn()
  }
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  default: vi.fn().mockImplementation((token) => {
    if (token === 'valid-token') {
      return { exp: Date.now() / 1000 + 3600 }; // Valid token (expires in 1 hour)
    } else if (token === 'expired-token') {
      return { exp: Date.now() / 1000 - 3600 }; // Expired token (expired 1 hour ago)
    }
    throw new Error('Invalid token');
  })
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  },
  writable: true
});

describe('authService', () => {
  let mockPost: any;
  
  beforeEach(() => {
    // Create a fresh mock for each test
    mockPost = vi.fn();
    
    // Mock the axios.create to return an object with post method
    (axios.create as any).mockReturnValue({
      post: mockPost,
      get: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    });
    
    // Reset mocks between tests
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should make a POST request to /auth/login with correct data', async () => {
      const mockResponse = {
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: '1', email: 'test@example.com' }
        }
      };
      
      mockPost.mockResolvedValueOnce(mockResponse);
      
      const loginData = { email: 'test@example.com', password: 'process.env.AUTHSERVICE_FIXED_SECRET_1' };
      const result = await authService.login(loginData);
      
      expect(mockPost).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should throw an error when the request fails', async () => {
      const mockError = new Error('Login failed');
      mockPost.mockRejectedValueOnce(mockError);
      
      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should make a POST request to /auth/register with correct data', async () => {
      mockPost.mockResolvedValueOnce({});
      
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'process.env.AUTHSERVICE_FIXED_SECRET_1'
      };
      
      await authService.register(registerData);
      
      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerData);
    });
  });

  describe('forgotPassword', () => {
    it('should make a POST request to /auth/forgot-password with email', async () => {
      mockPost.mockResolvedValueOnce({});
      
      await authService.forgotPassword({ email: 'test@example.com' });
      
      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
    });
  });

  describe('resetPassword', () => {
    it('should make a POST request to /auth/reset-password with token and password', async () => {
      mockPost.mockResolvedValueOnce({});
      
      await authService.resetPassword({ token: 'reset-token', password: 'process.env.AUTHSERVICE_FIXED_SECRET_1_2' });
      
      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        password: 'process.env.AUTHSERVICE_FIXED_SECRET_1_2'
      });
    });
  });

  describe('logout', () => {
    it('should make a POST request to /auth/logout and clear localStorage', async () => {
      const refreshToken = 'refresh-token';
      window.localStorage.getItem = vi.fn().mockReturnValueOnce(refreshToken);
      mockPost.mockResolvedValueOnce({});
      
      await authService.logout();
      
      expect(mockPost).toHaveBeenCalledWith('/auth/logout', { refreshToken });
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
    
    it('should handle API errors gracefully', async () => {
      window.localStorage.getItem = vi.fn().mockReturnValueOnce('refresh-token');
      mockPost.mockRejectedValueOnce(new Error('Network error'));
      
      await authService.logout();
      
      // Should still remove tokens even if API call fails
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
    
    it('should not make API call if no refresh token exists', async () => {
      window.localStorage.getItem = vi.fn().mockReturnValueOnce(null);
      
      await authService.logout();
      
      expect(mockPost).not.toHaveBeenCalled();
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('isTokenValid', () => {
    it('should return true for a valid token', () => {
      const result = authService.isTokenValid('valid-token');
      expect(result).toBe(true);
    });
    
    it('should return false for an expired token', () => {
      const result = authService.isTokenValid('expired-token');
      expect(result).toBe(false);
    });
    
    it('should return false for invalid tokens', () => {
      const result = authService.isTokenValid('invalid-token');
      expect(result).toBe(false);
    });
    
    it('should return false when no token is provided', () => {
      const result = authService.isTokenValid('');
      expect(result).toBe(false);
    });
  });
});
