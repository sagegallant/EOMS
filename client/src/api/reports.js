import { api } from './client';

export const reportApi = {
  getSummary: () =>
    api.get('/reports/summary').then(r => r.data),
  getDepartmentStats: () =>
    api.get('/reports/departments').then(r => r.data),
};
