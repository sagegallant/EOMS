import { api } from './client';

export const settingApi = {
  list: () =>
    api.get('/settings').then(r => r.data),
  update: (key, settingValue) =>
    api.patch(`/settings/${key}`, { settingValue }).then(r => r.data),
};
