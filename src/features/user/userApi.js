/**
 * User API Client
 * Handles user preferences and profile API requests
 */

import { get, patch } from '@/utils/api';

const BASE = '/api/user';

export const userApi = {
  /**
   * Get user preferences (coach voice settings, etc.)
   * @returns {Promise<{success: boolean, data: {coachPreferences: {voice: string}}}>}
   */
  getPreferences() {
    return get(`${BASE}/preferences`);
  },

  /**
   * Update user preferences
   * @param {Object} coachPreferences - Preferences to update
   * @param {string} coachPreferences.voice - Voice name for TTS
   * @returns {Promise<{success: boolean, data: {coachPreferences: {voice: string}}}>}
   */
  updatePreferences(coachPreferences) {
    return patch(`${BASE}/preferences`, { coachPreferences });
  },
};
