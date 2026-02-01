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

  /**
   * Create a new empty group in a pool
   * @param {string} poolId - Pool ID
   * @param {string} name - Group name
   * @returns {Promise<{success: boolean, data: {id: string, name: string, memberCount: number}}>}
   */
  createGroup(poolId, name) {
    return post(`${CIRCLES_BASE}/pools/${poolId}/groups`, { name });
  },

  /**
   * Move a member from one group to another
   * @param {string} poolId - Pool ID
   * @param {string} fromGroupId - Source group ID
   * @param {string} memberId - User ID of member to move
   * @param {string} toGroupId - Target group ID
   * @returns {Promise<{success: boolean, data: {fromGroup, toGroup, movedMember}}>}
   */
  moveMember(poolId, fromGroupId, memberId, toGroupId) {
    return post(`${CIRCLES_BASE}/pools/${poolId}/groups/${fromGroupId}/move-member`, {
      memberId,
      toGroupId,
    });
  },

  /**
   * Delete a circle group
   * @param {string} poolId - Pool ID
   * @param {string} groupId - Group ID to delete
   * @returns {Promise<{success: boolean, data: {message: string, deletedGroup: Object}}>}
   */
  deleteGroup(poolId, groupId) {
    return post(`${CIRCLES_BASE}/pools/${poolId}/groups/${groupId}/delete`, {});
  },

  /**
   * Add a latecomer to an existing group
   * @param {string} poolId - Pool ID
   * @param {string} groupId - Target group ID
   * @param {string} userId - User ID to add
   * @returns {Promise<{success: boolean, data: {group: Object}}>}
   */
  addMemberToGroup(poolId, groupId, userId) {
    return post(`${CIRCLES_BASE}/pools/${poolId}/groups/${groupId}/add-member`, {
      userId,
    });
  },

  // ============================================================================
  // DIAGNOSTICS
  // ============================================================================

  /**
   * Send a diagnostic test email
   * @param {Object} params - Email parameters
   * @param {string} params.to - Recipient email
   * @param {string} params.subject - Email subject
   * @param {string} params.message - Email message
   * @returns {Promise<{success: boolean, data: {message: string}}>}
   */
  sendDiagnosticEmail({ to, subject, message }) {
    return post(`${CIRCLES_BASE}/admin/diagnostic-email`, { to, subject, message });
  },
};
