import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:3005/api', // Assuming auth-service runs on port 3005
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const logout = () => apiClient.post('/auth/logout');
export const getUserProfile = () => apiClient.get('/auth/profile');