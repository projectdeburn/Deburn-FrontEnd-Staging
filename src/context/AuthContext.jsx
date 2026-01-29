/**
 * Auth Context
 * Manages authentication state throughout the application
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/features/auth/authApi';
import { setAuthToken, clearAuthToken } from '@/utils/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'hfai_auth_token';
const USER_KEY = 'hfai_user';

// Helper to clear stored auth data (outside component to avoid dependency issues)
function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearAuthToken();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initializedRef = useRef(false);

  // Load from localStorage on mount - instant restore, background validation
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const cachedUser = localStorage.getItem(USER_KEY);

    if (storedToken && cachedUser) {
      // Restore immediately from cache
      try {
        const userData = JSON.parse(cachedUser);
        setAuthToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Validate session in background (don't block rendering)
        validateSessionInBackground();
      } catch {
        // Invalid cached data - clear and show login
        clearStoredAuth();
        setIsLoading(false);
      }
    } else if (storedToken) {
      // Token but no cached user - need to fetch (blocks until complete)
      setAuthToken(storedToken);
      fetchSession();
    } else {
      // No token - show login immediately
      setIsLoading(false);
    }

    // Background validation - silently logout if invalid
    async function validateSessionInBackground() {
      try {
        const result = await authApi.getSession();
        if (result.success && result.data?.user) {
          let userData = result.data.user;

          // Check org admin status
          try {
            const adminResult = await authApi.getAdminStatus();
            if (adminResult.success && adminResult.data) {
              userData = { ...userData, isOrgAdmin: adminResult.data.isAdmin };
            }
          } catch {
            userData = { ...userData, isOrgAdmin: false };
          }

          // Update user data and cache
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          // Invalid session - logout silently
          clearStoredAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        // Session check failed - logout silently
        clearStoredAuth();
        setUser(null);
        setIsAuthenticated(false);
      }
    }

    // Full session fetch (blocks rendering until complete)
    async function fetchSession() {
      try {
        const result = await authApi.getSession();
        if (result.success && result.data?.user) {
          let userData = result.data.user;

          try {
            const adminResult = await authApi.getAdminStatus();
            if (adminResult.success && adminResult.data) {
              userData = { ...userData, isOrgAdmin: adminResult.data.isAdmin };
            }
          } catch {
            userData = { ...userData, isOrgAdmin: false };
          }

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          clearStoredAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        clearStoredAuth();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const result = await authApi.getSession();
      if (result.success && result.data?.user) {
        let userData = result.data.user;

        try {
          const adminResult = await authApi.getAdminStatus();
          if (adminResult.success && adminResult.data) {
            userData = { ...userData, isOrgAdmin: adminResult.data.isAdmin };
          }
        } catch {
          userData = { ...userData, isOrgAdmin: false };
        }

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } else {
        clearStoredAuth();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      clearStoredAuth();
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

      // Cache user data for instant restore on next visit
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

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
    // Clear all stored auth data
    clearStoredAuth();
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
