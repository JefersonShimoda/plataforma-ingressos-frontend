import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://plataforma-ingressos-api.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 segundos para suportar inicialização (cold start) no plano gratuito
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-retry on cold start (502/503/504/Network Error) + Auth Guard
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config & { _retryCount?: number });

    // Check if error is due to server waking up (cold start)
    const isColdStartError =
      !error.response ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.response.status === 504 ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK';

    if (config && isColdStartError) {
      config._retryCount = config._retryCount || 0;

      // Retry up to 3 times with exponential backoff (2s, 4s, 6s)
      if (config._retryCount < 3) {
        config._retryCount += 1;
        const delay = config._retryCount * 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    if (error.response) {
      const status = error.response.status;

      // Auto logout on valid 401 Unauthorized or 403 Forbidden
      if ((status === 401 || status === 403) && error.response.data) {
        const hasToken = localStorage.getItem('token');
        if (hasToken) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to extract user-friendly error message from API response
 */
export const getErrorMessage = (error: unknown, fallback = 'Ocorreu um erro ao processar a solicitação.'): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;

    // 1. Check for standard error field { error: "mensagem" }
    if (typeof data.error === 'string') {
      return data.error;
    }

    // 2. Check for message field { message: "mensagem" }
    if (typeof data.message === 'string') {
      return data.message;
    }

    // 3. Check for validation map { email: "inválido", password: "muito curta" }
    const fieldErrors = Object.values(data).filter((v) => typeof v === 'string') as string[];
    if (fieldErrors.length > 0) {
      return fieldErrors.join(' • ');
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
