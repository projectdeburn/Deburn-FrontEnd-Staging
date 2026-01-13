/**
 * Circles API Client
 * Handles Leadership Circles API requests
 */

import { get, post, put, del } from '@/utils/api';

const BASE = `${import.meta.env.VITE_ENDPOINT}/api/circles`;

export const circlesApi = {
  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /**
   * Get user's circle groups with next meeting info
   */
  getMyGroups() {
    return get(`${BASE}/my-groups`);
  },

  /**
   * Get pending and accepted invitations
   */
  getMyInvitations() {
    return get(`${BASE}/my-invitations`);
  },

  /**
   * Get user's availability slots
   */
  getAvailability() {
    return get(`${BASE}/availability`);
  },

  /**
   * Update user's availability slots
   */
  updateAvailability(slots) {
    return put(`${BASE}/availability`, { slots });
  },

  // ============================================================================
  // GROUP ENDPOINTS
  // ============================================================================

  /**
   * Get group details
   */
  getGroup(groupId) {
    return get(`${BASE}/groups/${groupId}`);
  },

  /**
   * Get group's meetings
   */
  getGroupMeetings(groupId) {
    return get(`${BASE}/groups/${groupId}/meetings`);
  },

  /**
   * Get group's common availability
   */
  getGroupAvailability(groupId) {
    return get(`${BASE}/groups/${groupId}/common-availability`);
  },

  /**
   * Schedule a new meeting for the group
   */
  scheduleMeeting(groupId, meetingData) {
    return post(`${BASE}/groups/${groupId}/meetings`, meetingData);
  },

  // ============================================================================
  // INVITATION ENDPOINTS
  // ============================================================================

  /**
   * Get invitation details by token
   */
  getInvitation(token) {
    return get(`${BASE}/invitations/${token}`);
  },

  /**
   * Accept an invitation
   */
  acceptInvitation(token) {
    return post(`${BASE}/invitations/${token}/accept`, {});
  },

  /**
   * Decline an invitation
   */
  declineInvitation(token) {
    return post(`${BASE}/invitations/${token}/decline`, {});
  },

  // ============================================================================
  // MEETING ENDPOINTS
  // ============================================================================

  /**
   * Cancel a meeting
   */
  cancelMeeting(meetingId) {
    return post(`${BASE}/meetings/${meetingId}/cancel`, {});
  },

  /**
   * Update meeting attendance
   */
  updateAttendance(meetingId, attending) {
    return post(`${BASE}/meetings/${meetingId}/attendance`, { attending });
  },
};
