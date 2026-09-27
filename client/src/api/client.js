import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { handleStaticRequest } from './staticAdapter';

const isStaticMode =
  import.meta.env.VITE_STATIC_DEMO === 'true' ||
  (typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:'
  ));

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  ...(isStaticMode && {
    adapter: async (config) => {
      // Simulate realistic micro-latency
      await new Promise(r => setTimeout(r, 60));
      return handleStaticRequest(config);
    },
  }),
});

api.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().token;
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  res => res,
  async err => {
    // If backend server is unreachable or static hosting returns 404, fall back to static adapter
    const isOfflineOrStatic =
      (!err.response && (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'))) ||
      (err.response?.status === 404 && (
        isStaticMode ||
        (typeof window !== 'undefined' && (
          window.location.hostname.includes('github.io') ||
          window.location.protocol === 'file:'
        ))
      ));

    if (isOfflineOrStatic && err.config) {
      try {
        return await handleStaticRequest(err.config);
      } catch {
        // pass through original error
      }
    }

    const isAuthRoute = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/mfa');
    if (err.response?.status === 401 && !isAuthRoute) {
      // Clear invalid / expired session on protected routes
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && !window.location.href.includes('/login')) {
        if (window.location.hash.startsWith('#/')) {
          window.location.hash = '#/login';
        } else {
          window.location.pathname = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);
