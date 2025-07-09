import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_TENANT_API_URL || 'http://localhost:3001/api',
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

export const getTenants = () => apiClient.get('/tenants');
export const getTenant = (id) => apiClient.get(`/tenants/${id}`);
export const createTenant = (data) => apiClient.post('/tenants', data);
export const updateTenant = (id, data) => apiClient.put(`/tenants/${id}`, data);
export const deleteTenant = (id) => apiClient.delete(`/tenants/${id}`);
export const regenerateApiKey = (id) => apiClient.post(`/tenants/${id}/regenerate-key`);