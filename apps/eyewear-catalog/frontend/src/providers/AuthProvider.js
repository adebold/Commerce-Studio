import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create authentication context
const AuthContext = createContext(null);

/**
 * Authentication Provider component
 * Manages user authentication state, session management,
 * and provides authentication methods throughout the app
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  
  // State for authentication
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    checkSession();
  }, []);
  
  // Check authentication session
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current session from API
      const response = await axios.get('/auth/session');
      
      if (response.data && response.data.shop) {
        // Set session data
        setSession(response.data);
      } else {
        // Clear session if no valid data
        setSession(null);
        
        // Redirect to auth page if not on auth page
        if (window.location.pathname !== '/auth') {
          navigate('/auth');
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Session check error:', err);
      
      // Clear session on error
      setSession(null);
      setError('Authentication failed. Please try again.');
      setLoading(false);
      
      // Redirect to auth page if not on auth page
      if (window.location.pathname !== '/auth') {
        navigate('/auth');
      }
    }
  }, [navigate]);
  
  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      // Validate and refresh session if needed
      const response = await axios.post('/auth/validate-session');
      
      if (response.data && response.data.shop) {
        // Update session data
        setSession(response.data);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Session refresh error:', err);
      return false;
    }
  }, []);
  
  // Sign in user
  const signIn = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authorization URL
      const response = await axios.get('/auth/shopify-url');
      
      if (response.data && response.data.url) {
        // Redirect to Shopify OAuth authorization
        window.location.href = response.data.url;
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  }, []);
  
  // Sign out user
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call logout endpoint
      await axios.post('/auth/logout');
      
      // Clear session
      setSession(null);
      
      // Redirect to auth page
      navigate('/auth');
      
      setLoading(false);
    } catch (err) {
      console.error('Sign out error:', err);
      
      // Clear session anyway on error
      setSession(null);
      
      // Redirect to auth page
      navigate('/auth');
      
      setLoading(false);
    }
  }, [navigate]);
  
  // Provide authentication context
  const contextValue = {
    session,
    loading,
    error,
    isAuthenticated: !!session,
    checkSession,
    refreshSession,
    signIn,
    signOut
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}