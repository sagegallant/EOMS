import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── Demo users (frontend-only auth until backend is ready) ─ */
const DEMO_USERS = [
  {
    id: 1,
    username: 'priya.patel',
    password: 'Password@123',
    name: 'Priya Patel',
    email: 'priya.patel@eoms.in',
    roles: ['HR_ADMIN'],
    dept: 'People Operations',
    hub: 'Bengaluru',
  },
  {
    id: 2,
    username: 'aarav.sharma',
    password: 'Password@123',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@eoms.in',
    roles: ['EMPLOYEE'],
    dept: 'Platform Engineering',
    hub: 'Bengaluru',
  },
  {
    id: 3,
    username: 'vikram.malhotra',
    password: 'Password@123',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@eoms.in',
    roles: ['MANAGER'],
    dept: 'Platform Engineering',
    hub: 'Bengaluru',
  },
  {
    id: 4,
    username: 'rohan.verma',
    password: 'Password@123',
    name: 'Rohan Verma',
    email: 'rohan.verma@eoms.in',
    roles: ['IT_ADMIN'],
    dept: 'IT & Systems',
    hub: 'Hyderabad',
  },
  {
    id: 5,
    username: 'admin',
    password: 'Password@123',
    name: 'System Administrator',
    email: 'admin@eoms.in',
    roles: ['SYSTEM_ADMIN', 'HR_ADMIN'],
    dept: 'Platform',
    hub: 'Remote',
  },
  {
    id: 6,
    username: 'neha.nair',
    password: 'Password@123',
    name: 'Neha Nair',
    email: 'neha.nair@eoms.in',
    roles: ['HR_SPECIALIST'],
    dept: 'People Operations',
    hub: 'Hyderabad',
  },
];

export const useAuthStore = create(persist(
  (set) => ({
    token: null,
    user: null,

    /* ── login: validates credentials client-side ──────── */
    login: async (username, password) => {
      // Simulate async (will be replaced by real API call)
      await new Promise(r => setTimeout(r, 400));

      const match = DEMO_USERS.find(
        u => u.username === username.trim() && u.password === password
      );

      if (!match) {
        throw new Error('Invalid username or password. Try Password@123 as the password.');
      }

      // Build a safe user object (omit password)
      const { password: _pwd, ...safeUser } = match;
      const token = `demo-token-${safeUser.id}-${Date.now()}`;

      set({ token, user: safeUser });
      return safeUser;
    },

    /* ── setSession: for external auth (future API) ─────── */
    setSession: (token, user) => set({ token, user }),

    /* ── logout ─────────────────────────────────────────── */
    logout: () => set({ token: null, user: null }),
  }),
  { name: 'eoms-session' },
));

export const hasRole = (user, ...roles) =>
  !!user?.roles?.some(r => roles.includes(r));
