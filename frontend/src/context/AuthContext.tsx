'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('standtrack_token');
    const savedUser = localStorage.getItem('standtrack_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, token: userToken } = response.data;

    setUser(userData);
    setToken(userToken);
    localStorage.setItem('standtrack_token', userToken);
    localStorage.setItem('standtrack_user', JSON.stringify(userData));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await authAPI.register({ name, email, password });
    const { user: userData, token: userToken } = response.data;

    setUser(userData);
    setToken(userToken);
    localStorage.setItem('standtrack_token', userToken);
    localStorage.setItem('standtrack_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('standtrack_token');
    localStorage.removeItem('standtrack_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


