/**
 * Auth API Client
 * Handles authentication-related API requests
 */

import { get, post, del } from '@/utils/api';

const BASE = '/api/auth';

export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} language - Current UI language for email
   */
  register(userData, language = 'en') {
    return post(`${BASE}/register`, { ...userData, language });
  },

  /**
   * Verify email with token
   */
  verifyEmail(token) {
    return post(`${BASE}/verify-email`, { token });
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   * @param {string} language - Current UI language for email
   */
  resendVerification(email, language = 'en') {
    return post(`${BASE}/resend-verification`, { email, language });
  },

  /**
   * Login user
   */
  login(email, password, rememberMe = false) {
    return post(`${BASE}/login`, { email, password, rememberMe });
  },

  /**
   * Logout user
   */
  logout() {
    return post(`${BASE}/logout`, {});
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @param {string} language - Current UI language for email
   */
  forgotPassword(email, language = 'en') {
    return post(`${BASE}/forgot-password`, { email, language });
  },

  /**
   * Reset password with token
   */
  resetPassword(token, password, passwordConfirm) {
    return post(`${BASE}/reset-password`, { token, password, passwordConfirm });
  },

  /**
   * Get current session
   */
  getSession() {
    return get(`${BASE}/session`);
  },

  /**
   * Get organization admin status
   * @returns {Promise<{success: boolean, data: {isAdmin: boolean, organizations: Array}}>}
   */
  getAdminStatus() {
    return get(`${BASE}/admin-status`);
  },

  /**
   * Get all active sessions
   */
  getSessions() {
    return get(`${BASE}/sessions`);
  },

  /**
   * Revoke a specific session
   */
  revokeSession(sessionId) {
    return del(`${BASE}/sessions/${sessionId}`);
  },

  /**
   * Revoke all other sessions
   */
  revokeAllSessions() {
    return del(`${BASE}/sessions`);
  },

  /**
   * Export user data (GDPR)
   */
  exportData() {
    return get(`${BASE}/data-export`);
  },

  /**
   * Request account deletion (GDPR)
   */
  deleteAccount(reason = null) {
    return post(`${BASE}/delete-account`, { reason });
  },

  /**
   * Refresh access token
   */
  refreshToken() {
    return post(`${BASE}/refresh`, {});
  },
};
