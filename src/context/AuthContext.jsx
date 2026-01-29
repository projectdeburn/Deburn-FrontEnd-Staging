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
  // Initialize state synchronously from localStorage (before first render)
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if we have a token but need to validate
    // If no token, show login immediately (no loading)
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    const hasCachedUser = !!localStorage.getItem(USER_KEY);
    return hasToken && !hasCachedUser;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    const hasCachedUser = !!localStorage.getItem(USER_KEY);
    return hasToken && hasCachedUser;
  });
  const initializedRef = useRef(false);

  // Setup auth token and run background validation on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const hasCachedUser = !!localStorage.getItem(USER_KEY);

    if (storedToken && hasCachedUser) {
      // Token already set in state, just set the API header and validate
      setAuthToken(storedToken);
      validateSessionInBackground();
    } else if (storedToken) {
      // Token but no cached user - need to fetch
      setAuthToken(storedToken);
      fetchSession();
    }
    // No token case: isLoading already false, isAuthenticated already false

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
