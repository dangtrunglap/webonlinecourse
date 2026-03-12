import axios from 'axios';

const runtimeBaseUrl = (() => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8080/api';
  }

  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5078/api';
  }

  return `${protocol}//${hostname}:8080/api`;
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || runtimeBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
  const requestUrl = String(error.config?.url || '');
  const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
  const hasStoredToken = Boolean(localStorage.getItem('token'));

  if (error.response?.status === 401 && hasStoredToken && !isAuthRequest) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
