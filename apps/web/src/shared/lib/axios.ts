import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { token } from './token';

const BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = token.get();
  if (t && config.headers) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          null,
          { withCredentials: true },
        );
        token.set(data.accessToken);
        if (original.headers) original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        console.error('[auth] Token refresh failed, redirecting to login', err);
        token.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
