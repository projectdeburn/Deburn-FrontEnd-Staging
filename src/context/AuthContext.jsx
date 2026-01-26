/**
 * Auth Context
 * Manages authentication state throughout the application
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/features/auth/authApi';
import { setAuthToken, clearAuthToken } from '@/utils/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'hfai_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load token from localStorage on mount and check session
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setAuthToken(storedToken);
    }
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const result = await authApi.getSession();
      if (result.success && result.data?.user) {
        let userData = result.data.user;

        // Check org admin status (SRP: separate endpoint)
        try {
          const adminResult = await authApi.getAdminStatus();
          if (adminResult.success && adminResult.data) {
            userData = { ...userData, isOrgAdmin: adminResult.data.isAdmin };
          }
        } catch {
          // If admin status check fails, continue without it
          userData = { ...userData, isOrgAdmin: false };
        }

        setUser(userData);
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
      // Store token in localStorage and set for API requests
      if (result.data.token) {
        localStorage.setItem(TOKEN_KEY, result.data.token);
        setAuthToken(result.data.token);
      }

      let userData = result.data.user;

      // Check org admin status (SRP: separate endpoint)
      try {
        const adminResult = await authApi.getAdminStatus();
        if (adminResult.success && adminResult.data) {
          userData = { ...userData, isOrgAdmin: adminResult.data.isAdmin };
        }
      } catch {
        // If admin status check fails, continue without it
        userData = { ...userData, isOrgAdmin: false };
      }

      setUser(userData);
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
    // Clear token from localStorage and API
    localStorage.removeItem(TOKEN_KEY);
    clearAuthToken();
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
