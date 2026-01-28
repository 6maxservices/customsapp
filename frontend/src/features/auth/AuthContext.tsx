import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
  stationId: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error: any) {
      // Silently fail - user is not authenticated
      setUser(null);
      // Log error in development
      if (import.meta.env.DEV) {
        console.log('Auth check failed (this is normal if not logged in):', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        // After successful login, verify the session works
        // Small delay to ensure cookie is set
        setTimeout(() => {
          checkAuth();
        }, 100);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      // Log error for debugging
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      // Re-throw to be handled by LoginPage
      throw error;
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

