import { api } from './client';
import { User, PorterUser, UserRole } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface TokenResponse {
  token: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/users/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const response = await api.post<User>('/users/register', payload);
    return response.data;
  },

  getPorters: async (): Promise<PorterUser[]> => {
    const response = await api.get<PorterUser[]>('/users/porters');
    return response.data;
  },
};
