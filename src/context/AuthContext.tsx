import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth';

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string | UserRole;
  name?: string;
  id?: number;
  userId?: number;
  exp?: number;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 0 | 1;
  openAuthModal: (tab?: 0 | 1) => void;
  closeAuthModal: () => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  quickLogin: (profile: 'ORGANIZER' | 'CLIENT_1' | 'CLIENT_2' | 'PORTER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PRESET_USERS = {
  ORGANIZER: {
    label: 'Organizador',
    email: 'organizador@eventos.com',
    password: 'senha123456',
    role: 'ORGANIZER' as UserRole,
  },
  CLIENT_1: {
    label: 'Cliente 1 (Alex Silva)',
    email: 'cliente1@eventos.com',
    password: 'senhaSegura123',
    role: 'CLIENT' as UserRole,
  },
  CLIENT_2: {
    label: 'Cliente 2 (Concorrência)',
    email: 'cliente2@eventos.com',
    password: 'senhaSegura123',
    role: 'CLIENT' as UserRole,
  },
  PORTER: {
    label: 'Portaria (Validador)',
    email: 'portaria@eventos.com',
    password: 'porteiroSenha123',
    role: 'PORTER' as UserRole,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Global Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<0 | 1>(0);

  const openAuthModal = useCallback((tab: 0 | 1 = 0) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const parseUserFromToken = useCallback((jwtToken: string): User | null => {
    try {
      const decoded = jwtDecode<JwtPayload>(jwtToken);
      
      // Check expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null;
      }

      // Map roles
      let normalizedRole: UserRole = 'CLIENT';
      const rawRole = (decoded.role || '').toString().toUpperCase();
      if (rawRole.includes('ORGANIZER') || rawRole.includes('ADMIN')) {
        normalizedRole = 'ORGANIZER';
      } else if (rawRole.includes('PORTER') || rawRole.includes('PORTARIA') || rawRole.includes('VALIDATOR')) {
        normalizedRole = 'PORTER';
      }

      const email = decoded.email || decoded.sub || 'usuario@eventpass.com';
      const name = decoded.name || email.split('@')[0];
      const id = decoded.id || decoded.userId || 1;

      return {
        id,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        role: normalizedRole,
      };
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Initialize and check token validity
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const parsed = parseUserFromToken(savedToken);
      if (parsed) {
        setUser((prev) => prev || parsed);
        setToken(savedToken);
      } else {
        logout();
      }
    }
    setIsLoading(false);
  }, [parseUserFromToken, logout]);

  // Listen to 401/403 unauthorized event
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    const jwtToken = res.token;
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);

    // Parse user info from token or payload
    let userInfo = parseUserFromToken(jwtToken);
    if (!userInfo) {
      // Fallback user matching credentials
      let role: UserRole = 'CLIENT';
      let name = payload.email.split('@')[0];
      if (payload.email === PRESET_USERS.ORGANIZER.email) {
        role = 'ORGANIZER';
        name = 'Organizador Oficial';
      } else if (payload.email === PRESET_USERS.PORTER.email) {
        role = 'PORTER';
        name = 'Porteiro Responsável';
      } else if (payload.email === PRESET_USERS.CLIENT_1.email) {
        name = 'Alex Silva';
      }
      userInfo = {
        id: Date.now(),
        name,
        email: payload.email,
        role,
      };
    }

    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    closeAuthModal();
  };

  const register = async (payload: RegisterPayload) => {
    await authApi.register(payload);
    // After registration, auto-login
    await login({ email: payload.email, password: payload.password });
  };

  const quickLogin = async (profile: 'ORGANIZER' | 'CLIENT_1' | 'CLIENT_2' | 'PORTER') => {
    const target = PRESET_USERS[profile];
    if (target) {
      await login({ email: target.email, password: target.password });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
