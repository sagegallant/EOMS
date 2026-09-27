import { api } from './client';

export const assetApi = {
  list: (params = {}) =>
    api.get('/assets', { params }).then(r => r.data),
  getById: (id) =>
    api.get(`/assets/${id}`).then(r => r.data),
  create: (data) =>
    api.post('/assets', data).then(r => r.data),
  listAllocations: (params = {}) =>
    api.get('/assets/allocations', { params }).then(r => r.data),
  allocate: (data) =>
    api.post('/assets/allocate', data).then(r => r.data),
  acknowledge: (id, data) =>
    api.patch(`/assets/allocations/${id}/acknowledge`, data).then(r => r.data),
  returnAsset: (id, data) =>
    api.patch(`/assets/allocations/${id}/return`, data).then(r => r.data),
};
