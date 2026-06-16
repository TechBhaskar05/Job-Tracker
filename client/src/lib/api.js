import axios from 'axios';
import { getToken, clearAuth } from './auth';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth();
      const isOnLogin = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isOnLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
