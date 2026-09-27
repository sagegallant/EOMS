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
    // If backend server is unreachable (e.g. static hosting or offline), fall back to static adapter
    if (!err.response && (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'))) {
      try {
        return await handleStaticRequest(err.config);
      } catch {
        // pass through original error
      }
    }

    if (err.response?.status === 401) {
      // Clear invalid / expired session
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
