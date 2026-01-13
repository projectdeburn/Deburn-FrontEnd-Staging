/**
 * Hub API Client
 * Handles Hub admin section API requests
 */

import { get, post, put, del, uploadFile } from '@/utils/api';

const BASE = `${process.env.ENDPOINT}/api/hub`;

export const hubApi = {
  // ============================================================================
  // HUB ADMIN MANAGEMENT
  // ============================================================================

  getHubAdmins() {
    return get(`${BASE}/admins`);
  },

  addHubAdmin(email) {
    return post(`${BASE}/admins`, { email });
  },

  removeHubAdmin(email) {
    return del(`${BASE}/admins/${encodeURIComponent(email)}`);
  },

  // ============================================================================
  // ORGANIZATION ADMIN MANAGEMENT
  // ============================================================================

  getOrgAdmins() {
    return get(`${BASE}/org-admins`);
  },

  getOrganizations() {
    return get(`${BASE}/organizations`);
  },

  addOrgAdmin(email, organizationId) {
    return post(`${BASE}/org-admins`, { email, organizationId });
  },

  removeOrgAdmin(membershipId) {
    return del(`${BASE}/org-admins/${membershipId}`);
  },

  // ============================================================================
  // ORGANIZATIONS
  // ============================================================================

  createOrganization(name, domain) {
    return post(`${BASE}/organizations`, { name, domain });
  },

  // ============================================================================
  // AI COACH SETTINGS
  // ============================================================================

  getCoachSettings() {
    return get(`${BASE}/settings/coach`);
  },

  updateCoachSettings(settings) {
    return put(`${BASE}/settings/coach`, settings);
  },

  getCoachPrompts() {
    return get(`${BASE}/coach/prompts`);
  },

  updateCoachPrompt(language, promptName, content) {
    return put(`${BASE}/coach/prompts/${language}/${promptName}`, { content });
  },

  getCoachExercises() {
    return get(`${BASE}/coach/exercises`);
  },

  updateCoachExercises(exercises) {
    return put(`${BASE}/coach/exercises`, { exercises });
  },

  getCoachConfig() {
    return get(`${BASE}/coach/config`);
  },

  // ============================================================================
  // CONTENT LIBRARY
  // ============================================================================

  getContent(filters = {}) {
    const params = new URLSearchParams();
    if (filters.contentType) params.append('contentType', filters.contentType);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return get(`${BASE}/content${query}`);
  },

  getContentItem(id) {
    return get(`${BASE}/content/${id}`);
  },

  createContent(data) {
    return post(`${BASE}/content`, data);
  },

  updateContent(id, data) {
    return put(`${BASE}/content/${id}`, data);
  },

  deleteContent(id) {
    return del(`${BASE}/content/${id}`);
  },

  uploadAudio(contentId, lang, file) {
    const formData = new FormData();
    formData.append('audio', file);
    return uploadFile(`${BASE}/content/${contentId}/audio/${lang}`, formData);
  },

  removeAudio(contentId, lang) {
    return del(`${BASE}/content/${contentId}/audio/${lang}`);
  },

  // ============================================================================
  // COMPLIANCE
  // ============================================================================

  getComplianceStats() {
    return get(`${BASE}/compliance/stats`);
  },

  getComplianceUser(email) {
    return get(`${BASE}/compliance/user/${encodeURIComponent(email)}`);
  },

  exportUserData(userId) {
    return post(`${BASE}/compliance/export/${userId}`, {});
  },

  deleteUserAccount(userId) {
    return post(`${BASE}/compliance/delete/${userId}`, {});
  },

  getPendingDeletions() {
    return get(`${BASE}/compliance/pending-deletions`);
  },

  cleanupSessions() {
    return post(`${BASE}/compliance/cleanup-sessions`, {});
  },

  getSecurityConfig() {
    return get(`${BASE}/compliance/security-config`);
  },
};
