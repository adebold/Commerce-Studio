import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import authService from '../authService';

// Mock the authService
vi.mock('../authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    isTokenValid: vi.fn()
  }
}));

// Helper function to create a wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current).toEqual(expect.objectContaining({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true, // This matches actual implementation
      login: expect.any(Function),
      register: expect.any(Function),
      logout: expect.any(Function),
      forgotPassword: expect.any(Function),
      resetPassword: expect.any(Function),
      updateProfile: expect.any(Function)
    }));
  });

  it('initializes auth state from localStorage', async () => {
    // Mock a valid token
    vi.spyOn(authService, 'isTokenValid').mockReturnValue(true);
    localStorage.setItem('accessToken', 'valid-token');
    
    // Mock user profile
    const mockUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    };
    vi.spyOn(authService, 'getProfile').mockResolvedValue(mockUser);
    
    const { result, rerender } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization to complete
    await vi.waitFor(() => expect(result.current.isInitialized).toBe(true));
    
    // Re-render to get updated state
    rerender();
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('login function updates auth state and stores tokens', async () => {
    const mockLoginResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    };
    
    // Mock the login service
    vi.spyOn(authService, 'login').mockResolvedValue(mockLoginResponse);
    
    // Mock localStorage
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Call login function
    await act(async () => {
      await result.current.login('john@example.com', 'process.env.AUTHCONTEXT_SECRET');
    });
    
    // Check if service was called
    expect(authService.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      process.env.AUTHCONTEXT_SECRET: 'process.env.AUTHCONTEXT_SECRET'
    });
    
    // Check if tokens were stored - Fixed missing commas
    expect(localStorageSpy).toHaveBeenCalledWith('accessToken', 'access-token');
    expect(localStorageSpy).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    
    // Check if auth state was updated
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockLoginResponse.user);
  });

  it('logout function clears auth state and removes tokens', async () => {
    // Mock a successful login to set the initial state
    const mockUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    };
    
    const mockLoginResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: mockUser
    };
    
    vi.spyOn(authService, 'login').mockResolvedValue(mockLoginResponse);
    
    // Mock localStorage
    const localStorageRemoveSpy = vi.spyOn(Storage.prototype, 'removeItem');
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Login to set the authenticated state
    await act(async () => {
      await result.current.login('john@example.com', 'process.env.AUTHCONTEXT_SECRET');
    });
    
    // Verify login worked
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    
    // Call logout function
    await act(async () => {
      await result.current.logout();
    });
    
    // Check if service was called
    expect(authService.logout).toHaveBeenCalled();
    
    // Check if tokens were removed
    expect(localStorageRemoveSpy).toHaveBeenCalledWith('accessToken');
    expect(localStorageRemoveSpy).toHaveBeenCalledWith('refreshToken');
    
    // Check if auth state was updated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('register function calls the auth service with correct data', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const registerData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      process.env.AUTHCONTEXT_SECRET: 'process.env.AUTHCONTEXT_SECRET_1'
    };
    
    await act(async () => {
      await result.current.register(
        registerData.firstName,
        registerData.lastName,
        registerData.email,
        registerData.process.env.AUTHCONTEXT_SECRET
      );
    });
    
    expect(authService.register).toHaveBeenCalledWith(registerData);
  });

  it('forgotPassword function calls the auth service with correct email', async () => {
    vi.spyOn(authService, 'forgotPassword').mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.forgotPassword('test@example.com');
    });
    
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('resetPassword function calls the auth service with correct data', async () => {
    vi.spyOn(authService, 'resetPassword').mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.resetPassword('reset-token', 'process.env.AUTHCONTEXT_SECRET_2');
    });
    
    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'reset-token',
      process.env.AUTHCONTEXT_SECRET: 'process.env.AUTHCONTEXT_SECRET_2'
    });
  });

  it('updateProfile function updates user state with new data', async () => {
    // Mock initial user and login response
    const initialUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    };
    
    const mockLoginResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: initialUser
    };
    
    // Mock updated user
    const updatedUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Smith', // Updated last name
      email: 'john@example.com',
      company: 'New Company', // Updated company
      createdAt: '2025-01-01',
      updatedAt: '2025-03-17'
    };
    
    vi.spyOn(authService, 'login').mockResolvedValue(mockLoginResponse);
    vi.spyOn(authService, 'updateProfile').mockResolvedValue(updatedUser);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Login to set the initial user state
    await act(async () => {
      await result.current.login('john@example.com', 'process.env.AUTHCONTEXT_SECRET');
    });
    
    // Verify initial state
    expect(result.current.user).toEqual(initialUser);
    
    // Call updateProfile
    await act(async () => {
      const response = await result.current.updateProfile({
        lastName: 'Smith',
        company: 'New Company'
      });
      
      expect(response).toEqual(updatedUser);
    });
    
    // Check if service was called correctly
    expect(authService.updateProfile).toHaveBeenCalledWith({
      lastName: 'Smith',
      company: 'New Company'
    });
    
    // Check if user state was updated
    expect(result.current.user).toEqual(updatedUser);
  });
});
