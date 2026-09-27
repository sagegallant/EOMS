import { api } from './client';

export const taskApi = {
  list: (params = {}) =>
    api.get('/tasks', { params }).then(r => r.data),
  getById: (id) =>
    api.get(`/tasks/${id}`).then(r => r.data),
  create: (data) =>
    api.post('/tasks', data).then(r => r.data),
  update: (id, data) =>
    api.patch(`/tasks/${id}`, data).then(r => r.data),
  updateProgress: (taskId, data) =>
    api.patch(`/tasks/${taskId}/progress`, data).then(r => r.data),
  delete: (id) =>
    api.delete(`/tasks/${id}`).then(r => r.data),
};
