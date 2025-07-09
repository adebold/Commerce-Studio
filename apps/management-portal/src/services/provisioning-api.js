import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_PROVISIONING_API_URL || 'http://localhost:3002/api',
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

export const provisionStore = (tenantId) => apiClient.post('/provision/store', { tenantId });
export const getProvisioningStatus = (jobId) => apiClient.get(`/provision/status/${jobId}`);