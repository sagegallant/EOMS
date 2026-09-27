import { api } from './client';

export const authApi = {
  login: (identifier, password) =>
    api.post('/auth/login', { identifier, username: identifier, password }).then(r => r.data),
  verifyMfa: (challenge, code) =>
    api.post('/auth/mfa/verify', { challenge, code }).then(r => r.data),
  setupMfa: () =>
    api.post('/auth/mfa/setup').then(r => r.data),
  enableMfa: (setupToken, code) =>
    api.post('/auth/mfa/enable', { setupToken, code }).then(r => r.data),
  disableMfa: (password) =>
    api.post('/auth/mfa/disable', { password }).then(r => r.data),
  getCurrentUser: () =>
    api.get('/auth/me').then(r => r.data),
};

