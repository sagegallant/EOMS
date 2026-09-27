import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      /* ── login: Real API call to Express backend ────── */
      login: async (identifier, password) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post('/api/v1/auth/login', {
            identifier: identifier?.trim(),
            username: identifier?.trim(),
            password,
          });

          const { token, user, mfaRequired, challenge } = res.data;

          if (mfaRequired) {
            set({ loading: false });
            return { mfaRequired: true, challenge };
          }

          set({ token, user, loading: false, error: null });
          return user;
        } catch (err) {
          const message =
            err.response?.data?.message ||
            (err.response?.status === 401
              ? 'Invalid username or password.'
              : 'Failed to connect to authentication service.');
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      /* ── verifyMfa: verify TOTP code ─────────────────── */
      verifyMfa: async (challenge, code) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post('/api/v1/auth/mfa/verify', { challenge, code });
          const { token, user } = res.data;
          set({ token, user, loading: false, error: null });
          return user;
        } catch (err) {
          const message = err.response?.data?.message || 'Invalid MFA verification code.';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      /* ── setSession: for external auth / refreshed tokens */
      setSession: (token, user) => set({ token, user, error: null }),

      /* ── logout ─────────────────────────────────────────── */
      logout: () => {
        set({ token: null, user: null, error: null, loading: false });
      },
    }),
    { name: 'eoms-session' }
  )
);

export const hasRole = (user, ...roles) =>
  !!user?.roles?.some(r => roles.includes(r));
