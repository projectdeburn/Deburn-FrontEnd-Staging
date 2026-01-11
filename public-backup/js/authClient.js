/**
 * Auth Client
 * Frontend API client for authentication endpoints
 */

const AuthClient = {
  /**
   * Base API URL
   */
  baseUrl: '/api/auth',

  /**
   * Current user state
   */
  user: null,
  isAuthenticated: false,

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} API response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, mergedOptions);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error?.message || 'Request failed');
        error.code = data.error?.code;
        error.fields = data.error?.fields;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error. Please check your connection.');
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {object} userData - Registration data
   * @returns {Promise<object>} Registration result
   */
  async register(userData) {
    const { firstName, lastName, email, password, passwordConfirm, organization, country, consents } = userData;

    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
        organization,
        country,
        consents,
      }),
    });
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<object>} Verification result
   */
  async verifyEmail(token) {
    return this.request('/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<object>} Result
   */
  async resendVerification(email) {
    return this.request('/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Extended session
   * @returns {Promise<object>} Login result with user data
   */
  async login(email, password, rememberMe = false) {
    const result = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (result.success && result.data?.user) {
      this.user = result.data.user;
      this.isAuthenticated = true;
    }

    return result;
  },

  /**
   * Logout user
   * @returns {Promise<object>} Logout result
   */
  async logout() {
    try {
      await this.request('/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Continue with local logout even if server fails
      console.warn('Logout request failed:', error);
    }

    this.user = null;
    this.isAuthenticated = false;

    return { success: true };
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<object>} Result
   */
  async forgotPassword(email) {
    return this.request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @param {string} passwordConfirm - Password confirmation
   * @returns {Promise<object>} Result
   */
  async resetPassword(token, password, passwordConfirm) {
    return this.request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, passwordConfirm }),
    });
  },

  /**
   * Get current session
   * @returns {Promise<object>} Session data
   */
  async getSession() {
    try {
      const result = await this.request('/session', {
        method: 'GET',
      });

      if (result.success && result.data?.user) {
        this.user = result.data.user;
        this.isAuthenticated = true;
      }

      return result;
    } catch (error) {
      this.user = null;
      this.isAuthenticated = false;

      if (error.status === 401) {
        return { success: false, authenticated: false };
      }
      throw error;
    }
  },

  /**
   * Get all active sessions
   * @returns {Promise<object>} Sessions list
   */
  async getSessions() {
    return this.request('/sessions', {
      method: 'GET',
    });
  },

  /**
   * Revoke a specific session
   * @param {string} sessionId - Session ID
   * @returns {Promise<object>} Result
   */
  async revokeSession(sessionId) {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Revoke all other sessions
   * @returns {Promise<object>} Result
   */
  async revokeAllSessions() {
    return this.request('/sessions', {
      method: 'DELETE',
    });
  },

  /**
   * Export user data (GDPR)
   * @returns {Promise<object>} User data export
   */
  async exportData() {
    return this.request('/data-export', {
      method: 'GET',
    });
  },

  /**
   * Request account deletion (GDPR)
   * @param {string} reason - Deletion reason (optional)
   * @returns {Promise<object>} Result with scheduled deletion date
   */
  async deleteAccount(reason = null) {
    return this.request('/delete-account', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Refresh access token
   * @returns {Promise<object>} New access token
   */
  async refreshToken() {
    return this.request('/refresh', {
      method: 'POST',
    });
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.isAuthenticated && this.user !== null;
  },

  /**
   * Get current user
   * @returns {object|null}
   */
  getUser() {
    return this.user;
  },

  /**
   * Clear local auth state
   */
  clearState() {
    this.user = null;
    this.isAuthenticated = false;
  },
};

// Export for use in prototype.js
window.AuthClient = AuthClient;
