/**
 * Authentication Service
 * 
 * Provides methods for user authentication and authorization
 */

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @returns Promise with login result
 */
export const login = async (email: string, password: string): Promise<{ success: boolean; token?: string }> => {
  try {
    // In a real implementation, this would make an API call
    // For now, we'll simulate a successful login for testing purposes
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Simulate API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return { success: true, token: data.token };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout current user
 */
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  // Additional cleanup as needed
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

/**
 * Get current authentication token
 * @returns Current auth token or null
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with registration result
 */
export const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ success: boolean }> => {
  try {
    // Simulate API call
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param email User email
 * @returns Promise with request result
 */
export const requestPasswordReset = async (email: string): Promise<{ success: boolean }> => {
  try {
    // Simulate API call
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset request failed');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Verify user's authentication status and refresh token if needed
 * @returns Promise with verification result
 */
export const verifyAuth = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) return false;
    
    // Simulate API call to verify token
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Auth verification error:', error);
    logout();
    return false;
  }
};