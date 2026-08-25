import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({ baseURL: '/api/v1' });

api.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(null, err => {
  if (err.response?.status === 401) useAuthStore.getState().logout();
  return Promise.reject(err);
});
