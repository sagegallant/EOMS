import { api } from './client';

export const documentApi = {
  listTypes: () =>
    api.get('/documents/types').then(r => r.data),
  list: (params = {}) =>
    api.get('/documents', { params }).then(r => r.data),
  getById: (id) =>
    api.get(`/documents/${id}`).then(r => r.data),
  upload: (formDataOrJson) => {
    const isFormData = typeof FormData !== 'undefined' && formDataOrJson instanceof FormData;
    return api.post('/documents/upload', formDataOrJson, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then(r => r.data);
  },
  verify: (id, data) =>
    api.patch(`/documents/${id}/verify`, data).then(r => r.data),
  getDownloadUrl: (id) => `/api/v1/documents/${id}/download`,
  downloadBlob: (id) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

