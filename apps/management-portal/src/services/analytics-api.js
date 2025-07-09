import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_ANALYTICS_API_URL || 'http://localhost:3004/api',
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

export const getGlobalMetrics = (dateRange) => apiClient.get('/metrics/global', { params: { dateRange } });
export const getTenantMetrics = (dateRange) => apiClient.get('/metrics/tenants', { params: { dateRange } });