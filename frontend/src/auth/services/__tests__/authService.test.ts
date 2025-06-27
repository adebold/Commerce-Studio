/**
 * Tests for Authentication Service
 */
import { login, logout, isAuthenticated, getToken, register, requestPasswordReset, verifyAuth } from '../authService';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('login', () => {
    test('should login successfully with valid credentials', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token', user: { id: '123', email: 'test@example.com' } }),
      });

      const result = await login('test@example.com', 'process.env.AUTHSERVICE_SECRET_5');

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'process.env.AUTHSERVICE_SECRET_5' }),
      });

      // Verify token was stored in localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-token');

      // Verify result
      expect(result).toEqual({ success: true, token: 'test-token' });
    });

    test('should throw error with invalid credentials', async () => {
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      // Expect login to throw an error
      await expect(login('wrong@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');

      // Verify localStorage was not called
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    test('should throw error when email or password is missing', async () => {
      await expect(login('', 'process.env.AUTHSERVICE_SECRET_5')).rejects.toThrow('Email and password are required');
      await expect(login('test@example.com', '')).rejects.toThrow('Email and password are required');
      
      // Verify fetch was not called
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    test('should remove token from localStorage', () => {
      // Set a token first
      localStorageMock.setItem('auth_token', 'test-token');
      
      // Call logout
      logout();
      
      // Verify token was removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when token exists', () => {
      // Set a token
      localStorageMock.getItem.mockReturnValueOnce('test-token');
      
      // Check authentication status
      const result = isAuthenticated();
      
      // Verify result
      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });

    test('should return false when token does not exist', () => {
      // Don't set a token (mock returns null)
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      // Check authentication status
      const result = isAuthenticated();
      
      // Verify result
      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('getToken', () => {
    test('should return token from localStorage', () => {
      // Set a token
      localStorageMock.getItem.mockReturnValueOnce('test-token');
      
      // Get token
      const token = getToken();
      
      // Verify result
      expect(token).toBe('test-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });

    test('should return null when token does not exist', () => {
      // Don't set a token (mock returns null)
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      // Get token
      const token = getToken();
      
      // Verify result
      expect(token).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('register', () => {
    test('should register successfully with valid data', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const userData = {
        email: 'new@example.com',
        password: 'process.env.AUTHSERVICE_SECRET_5',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await register(userData);

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Verify result
      expect(result).toEqual({ success: true });
    });

    test('should throw error with invalid registration data', async () => {
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      });

      const userData = {
        email: 'existing@example.com',
        password: 'process.env.AUTHSERVICE_SECRET_5',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Expect register to throw an error
      await expect(register(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('requestPasswordReset', () => {
    test('should request password reset successfully', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await requestPasswordReset('test@example.com');

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      // Verify result
      expect(result).toEqual({ success: true });
    });

    test('should throw error when password reset fails', async () => {
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User not found' }),
      });

      // Expect requestPasswordReset to throw an error
      await expect(requestPasswordReset('nonexistent@example.com')).rejects.toThrow('User not found');
    });
  });

  describe('verifyAuth', () => {
    test('should return true for valid token', async () => {
      // Set a token
      localStorageMock.getItem.mockReturnValue('test-token');
      
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      });

      const result = await verifyAuth();

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      // Verify result
      expect(result).toBe(true);
    });

    test('should return false and logout for invalid token', async () => {
      // Set a token
      localStorageMock.getItem.mockReturnValue('invalid-token');
      
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid token' }),
      });

      const result = await verifyAuth();

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalled();
      
      // Verify logout was called
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      
      // Verify result
      expect(result).toBe(false);
    });

    test('should return false when no token exists', async () => {
      // Don't set a token (mock returns null)
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      const result = await verifyAuth();
      
      // Verify fetch was not called
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Verify result
      expect(result).toBe(false);
    });
  });
});