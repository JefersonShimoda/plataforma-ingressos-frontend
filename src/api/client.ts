import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://plataforma-ingressos-api.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

// Response Interceptor: Handle 401/403 and normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      
      // Auto logout on 401 Unauthorized or 403 Forbidden when token was sent
      if (status === 401 || status === 403) {
        const hasToken = localStorage.getItem('token');
        if (hasToken) {
          // If we had a token and got 401/403, clear it and dispatch event
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
