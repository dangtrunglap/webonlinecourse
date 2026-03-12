import api from '../services/api';

const apiBase = (api.defaults.baseURL ?? '').replace(/\/api\/?$/, '');

export const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBase}${path}`;
};
