/**
 * Notifications API Client
 * Handles notification API requests
 */

import { get, post } from '@/utils/api';

const BASE = '/api/notifications';

export const notificationApi = {
  /**
   * Get notifications with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Max notifications to return (default 20)
   * @param {number} params.offset - Number to skip for pagination
   * @param {boolean} params.unreadOnly - Only return unread notifications
   */
  getNotifications({ limit = 20, offset = 0, unreadOnly = false } = {}) {
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('offset', offset);
    if (unreadOnly) params.append('unread_only', 'true');
    return get(`${BASE}?${params.toString()}`);
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount() {
    return get(`${BASE}/count`);
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of notification to mark
   */
  markAsRead(notificationId) {
    return post(`${BASE}/${notificationId}/read`, {});
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    return post(`${BASE}/read-all`, {});
  },
};
