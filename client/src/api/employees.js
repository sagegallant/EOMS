import { api } from './client';

export const employeeApi = {
  list: (params = {}) =>
    api.get('/employees', { params }).then(r => r.data),
  getById: (id) =>
    api.get(`/employees/${id}`).then(r => r.data),
  create: (data) =>
    api.post('/employees', data).then(r => r.data),
  update: (id, data) =>
    api.patch(`/employees/${id}`, data).then(r => r.data),
  deactivate: (id) =>
    api.patch(`/employees/${id}/deactivate`).then(r => r.data),
  reactivate: (id) =>
    api.patch(`/employees/${id}/reactivate`).then(r => r.data),
  delete: (id) =>
    api.delete(`/employees/${id}`).then(r => r.data),
  getDepartments: () =>
    api.get('/employees/departments').then(r => r.data),
  getPositions: () =>
    api.get('/employees/positions').then(r => r.data),
};
