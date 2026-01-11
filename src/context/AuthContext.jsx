/**
 * Auth Context
 * Manages authentication state throughout the application
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/features/auth/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const result = await authApi.getSession();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const result = await authApi.login(email, password, rememberMe);
    if (result.success && result.data?.user) {
      setUser(result.data.user);
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with local logout even if server fails
    }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = useCallback(async (userData) => {
    return authApi.register(userData);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
