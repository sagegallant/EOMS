import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist(
  (set) => ({
    token: null,
    user: null,
    setSession: (token, user) => set({ token, user }),
    logout: () => set({ token: null, user: null }),
  }),
  { name: 'eoms-session' },
));

export const hasRole = (user, ...roles) =>
  !!user?.roles?.some(r => roles.includes(r));
