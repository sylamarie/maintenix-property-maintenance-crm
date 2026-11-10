import axios from 'axios';

import { clearStoredToken, getStoredToken } from '../auth/authStorage.js';

// AuthProvider registers a function here. The API client calls it when the
// server says our login has expired, so the app can send the user to /login.
let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = /\/auth\/(demo-)?login/.test(error.config?.url || '');

    // 401 on any request except a wrong-password login means our saved login
    // pass is no longer valid (expired, or the account was deactivated).
    if (error.response?.status === 401 && !isLoginRequest && getStoredToken()) {
      clearStoredToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);
