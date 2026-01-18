/**
 * Circles Admin API Client
 * Handles admin API requests for circle pools, invitations, and groups
 */

import { get, post, del } from '@/utils/api';

const AUTH_BASE = '/api/auth';
const CIRCLES_BASE = '/api/circles';

export const circlesAdminApi = {
  // ============================================================================
  // ADMIN STATUS
  // ============================================================================

  /**
   * Check if current user is an organization admin
   * @returns {Promise<{success: boolean, data: {isAdmin: boolean, organizations: Array}}>}
   */
  getAdminStatus() {
    return get(`${AUTH_BASE}/admin-status`);
  },

  // ============================================================================
  // POOL ENDPOINTS
  // ============================================================================

  /**
   * Get pools for admin's organization
   * @param {string} [status] - Optional status filter
   * @returns {Promise<{success: boolean, data: {pools: Array}}>}
   */
  getPools(status = null) {
    const query = status ? `?status=${status}` : '';
    return get(`${CIRCLES_BASE}/pools${query}`);
  },

  /**
   * Get pool details
   * @param {string} poolId - Pool ID
   * @returns {Promise<{success: boolean, data: {pool: Object}}>}
   */
  getPool(poolId) {
    return get(`${CIRCLES_BASE}/pools/${poolId}`);
  },

  // ============================================================================
  // INVITATION ENDPOINTS
  // ============================================================================

  /**
   * Send invitations to a pool
   * @param {string} poolId - Pool ID
   * @param {Array<{email: string, firstName?: string, lastName?: string}>} invitees
   * @returns {Promise<{success: boolean, data: {sent: Array, failed: Array, duplicate: Array}}>}
   */
  sendInvitations(poolId, invitees) {
    return post(`${CIRCLES_BASE}/pools/${poolId}/invitations`, { invitees });
  },

  /**
   * Get all invitations for a pool
   * @param {string} poolId - Pool ID
   * @returns {Promise<{success: boolean, data: {invitations: Array, count: number}}>}
   */
  getPoolInvitations(poolId) {
    return get(`${CIRCLES_BASE}/pools/${poolId}/invitations`);
  },

  /**
   * Cancel/remove an invitation
   * @param {string} invitationId - Invitation ID
   * @returns {Promise<{success: boolean, data: {message: string}}>}
   */
  cancelInvitation(invitationId) {
    return del(`${CIRCLES_BASE}/invitations/${invitationId}`);
  },

  // ============================================================================
  // GROUP ENDPOINTS
  // ============================================================================

  /**
   * Trigger group assignment for a pool
   * @param {string} poolId - Pool ID
   * @returns {Promise<{success: boolean, data: {groups: Array, totalMembers: number}}>}
   */
  assignGroups(poolId) {
    return post(`${CIRCLES_BASE}/pools/${poolId}/assign`, {});
  },

  /**
   * Get groups for a pool
   * @param {string} poolId - Pool ID
   * @returns {Promise<{success: boolean, data: {groups: Array, count: number}}>}
   */
  getPoolGroups(poolId) {
    return get(`${CIRCLES_BASE}/pools/${poolId}/groups`);
  },
};
