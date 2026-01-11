/**
 * Hub Client
 * API client for Hub admin section
 */

const HubClient = {
  baseUrl: '/api/hub',

  /**
   * Get base URL (handles native app vs web)
   */
  getBaseUrl() {
    if (window.ApiConfig) {
      return window.ApiConfig.getBaseUrl() + this.baseUrl;
    }
    return this.baseUrl;
  },

  /**
   * Make an API request
   */
  async request(endpoint, options = {}) {
    const url = this.getBaseUrl() + endpoint;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, mergedOptions);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error?.message || 'Request failed');
      error.code = data.error?.code;
      error.status = response.status;
      throw error;
    }

    return data;
  },

  // ============================================================================
  // HUB ADMIN MANAGEMENT
  // ============================================================================

  /**
   * Get all hub admins
   */
  async getHubAdmins() {
    return this.request('/admins', { method: 'GET' });
  },

  /**
   * Add a hub admin
   */
  async addHubAdmin(email) {
    return this.request('/admins', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Remove a hub admin
   */
  async removeHubAdmin(email) {
    return this.request(`/admins/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  },

  // ============================================================================
  // ORGANIZATION ADMIN MANAGEMENT
  // ============================================================================

  /**
   * Get all organization admins
   */
  async getOrgAdmins() {
    return this.request('/org-admins', { method: 'GET' });
  },

  /**
   * Get all organizations
   */
  async getOrganizations() {
    return this.request('/organizations', { method: 'GET' });
  },

  /**
   * Add an organization admin
   */
  async addOrgAdmin(email, organizationId) {
    return this.request('/org-admins', {
      method: 'POST',
      body: JSON.stringify({ email, organizationId }),
    });
  },

  /**
   * Remove an organization admin
   */
  async removeOrgAdmin(membershipId) {
    return this.request(`/org-admins/${membershipId}`, {
      method: 'DELETE',
    });
  },

  // ============================================================================
  // ORGANIZATIONS
  // ============================================================================

  /**
   * Create a new organization
   */
  async createOrganization(name, domain) {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, domain }),
    });
  },

  // ============================================================================
  // AI COACH SETTINGS
  // ============================================================================

  /**
   * Get coach settings (daily exchange limit, etc.)
   */
  async getCoachSettings() {
    return this.request('/settings/coach', { method: 'GET' });
  },

  /**
   * Update coach settings
   */
  async updateCoachSettings(settings) {
    return this.request('/settings/coach', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Get all coach prompts
   */
  async getCoachPrompts() {
    return this.request('/coach/prompts', { method: 'GET' });
  },

  /**
   * Update a coach prompt
   */
  async updateCoachPrompt(language, promptName, content) {
    return this.request(`/coach/prompts/${language}/${promptName}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * Get all exercises
   */
  async getCoachExercises() {
    return this.request('/coach/exercises', { method: 'GET' });
  },

  /**
   * Update exercises
   */
  async updateCoachExercises(exercises) {
    return this.request('/coach/exercises', {
      method: 'PUT',
      body: JSON.stringify({ exercises }),
    });
  },

  /**
   * Get coach config
   */
  async getCoachConfig() {
    return this.request('/coach/config', { method: 'GET' });
  },

  // ============================================================================
  // CONTENT LIBRARY
  // ============================================================================

  /**
   * Get all content items with optional filters
   */
  async getContent(filters = {}) {
    const params = new URLSearchParams();
    if (filters.contentType) params.append('contentType', filters.contentType);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/content${query}`, { method: 'GET' });
  },

  /**
   * Get a single content item
   */
  async getContentItem(id) {
    return this.request(`/content/${id}`, { method: 'GET' });
  },

  /**
   * Create a new content item
   */
  async createContent(data) {
    return this.request('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a content item
   */
  async updateContent(id, data) {
    return this.request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a content item
   */
  async deleteContent(id) {
    return this.request(`/content/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Upload audio file for a content item
   */
  async uploadAudio(contentId, lang, file) {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch(`${this.baseUrl}/content/${contentId}/audio/${lang}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to upload audio');
    }
    return data;
  },

  /**
   * Remove audio file from a content item
   */
  async removeAudio(contentId, lang) {
    return this.request(`/content/${contentId}/audio/${lang}`, {
      method: 'DELETE',
    });
  },

  // ============================================================================
  // COMPLIANCE
  // ============================================================================

  /**
   * Get compliance statistics
   */
  async getComplianceStats() {
    return this.request('/compliance/stats', { method: 'GET' });
  },

  /**
   * Get user compliance data by email
   */
  async getComplianceUser(email) {
    return this.request(`/compliance/user/${encodeURIComponent(email)}`, { method: 'GET' });
  },

  /**
   * Export all user data (GDPR Article 20)
   */
  async exportUserData(userId) {
    return this.request(`/compliance/export/${userId}`, { method: 'POST' });
  },

  /**
   * Delete user account and all data (GDPR Article 17)
   */
  async deleteUserAccount(userId) {
    return this.request(`/compliance/delete/${userId}`, { method: 'POST' });
  },

  /**
   * Get users with pending deletion requests
   */
  async getPendingDeletions() {
    return this.request('/compliance/pending-deletions', { method: 'GET' });
  },

  /**
   * Cleanup expired sessions
   */
  async cleanupSessions() {
    return this.request('/compliance/cleanup-sessions', { method: 'POST' });
  },

  /**
   * Get security configuration
   */
  async getSecurityConfig() {
    return this.request('/compliance/security-config', { method: 'GET' });
  },
};

// Export for use in hub.html
window.HubClient = HubClient;
