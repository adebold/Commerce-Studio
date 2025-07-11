import React, { createContext, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthProvider';

// Create API context
const ApiContext = createContext(null);

/**
 * API Provider component
 * Provides configured axios instance with authentication handling
 * and error management throughout the application
 */
export function ApiProvider({ children }) {
  const { session, refreshSession, signOut } = useAuth();
  
  // Create base API client configuration
  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Add request interceptor for authentication
    client.interceptors.request.use(
      config => {
        // Add auth headers if session exists
        if (session && session.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    client.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the session
            const refreshed = await refreshSession();
            
            if (refreshed) {
              // Update Authorization header with new token
              originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
              
              // Retry the original request
              return client(originalRequest);
            } else {
              // If refresh failed, sign out
              signOut();
              
              // Redirect to auth page
              window.location.href = '/auth';
              
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // If refresh throws an error, sign out
            signOut();
            
            // Redirect to auth page
            window.location.href = '/auth';
            
            return Promise.reject(refreshError);
          }
        }
        
        // Handle 403 Forbidden errors
        if (error.response && error.response.status === 403) {
          console.error('Permission denied:', error.response.data);
        }
        
        // Handle 404 Not Found errors
        if (error.response && error.response.status === 404) {
          console.error('Resource not found:', error.response.data);
        }
        
        // Handle 500 Internal Server Error
        if (error.response && error.response.status >= 500) {
          console.error('Server error:', error.response.data);
        }
        
        // Handle network errors
        if (error.message === 'Network Error') {
          console.error('Network error: Please check your connection');
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
          console.error('Request timeout: The request took too long to complete');
        }
        
        return Promise.reject(error);
      }
    );
    
    return client;
  }, [session, refreshSession, signOut]);
  
  // Provide API client through context
  const contextValue = useMemo(() => {
    return { apiClient };
  }, [apiClient]);
  
  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
}

// Custom hook to use the API client
export function useApi() {
  const context = useContext(ApiContext);
  
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  
  return context;
}