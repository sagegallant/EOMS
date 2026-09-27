import { api } from './client';

export const onboardingApi = {
  listPlans: (params = {}) =>
    api.get('/onboarding', { params }).then(r => r.data),
  getPlanById: (id) =>
    api.get(`/onboarding/${id}`).then(r => r.data),
  getPlanByEmployeeId: (employeeId) =>
    api.get(`/onboarding/employee/${employeeId}`).then(r => r.data),
  createPlan: (data) =>
    api.post('/onboarding', data).then(r => r.data),
  updatePlan: (id, data) =>
    api.patch(`/onboarding/${id}`, data).then(r => r.data),
  listTemplates: () =>
    api.get('/onboarding/templates').then(r => r.data),
  getTemplateById: (id) =>
    api.get(`/onboarding/templates/${id}`).then(r => r.data),
  triggerSlaCheck: () =>
    api.post('/onboarding/sla-check').then(r => r.data),
};
