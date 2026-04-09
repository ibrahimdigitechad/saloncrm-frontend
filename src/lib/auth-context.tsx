'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setTokens, clearTokens, saveUser, getUser } from '@/lib/api';

interface User { id: string; name: string; email: string; role: string; tenant_id: string; business_name?: string; slug?: string; }
interface AuthCtx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; }

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getUser();
    if (cached) setUser(cached);
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    setTokens(data.access_token, data.refresh_token);
    saveUser(data.user);
    setUser(data.user);
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
