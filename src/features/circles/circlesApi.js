import { get, post, put, del } from '@/utils/api';

const BASE = '/api/circles';

export const circlesApi = {
  getMyGroups() {
    return get(`${BASE}/my-groups`);
  },

  getMyInvitations() {
    return get(`${BASE}/my-invitations`);
  },

  getAvailability(groupId) {
    return get(`${BASE}/availability?groupId=${groupId}`);
  },

  updateAvailability(groupId, slots) {
    return put(`${BASE}/availability`, { groupId, slots });
  },

  getGroup(groupId) {
    return get(`${BASE}/groups/${groupId}`);
  },

  getGroupMeetings(groupId) {
    return get(`${BASE}/groups/${groupId}/meetings`);
  },

  getGroupAvailability(groupId) {
    return get(`${BASE}/groups/${groupId}/common-availability`);
  },

  scheduleMeeting(groupId, meetingData) {
    return post(`${BASE}/groups/${groupId}/meetings`, meetingData);
  },

  getInvitation(token) {
    return get(`${BASE}/invitations/${token}`);
  },

  acceptInvitation(token) {
    return post(`${BASE}/invitations/${token}/accept`, {});
  },

  declineInvitation(token) {
    return post(`${BASE}/invitations/${token}/decline`, {});
  },

  cancelMeeting(meetingId) {
    return post(`${BASE}/meetings/${meetingId}/cancel`, {});
  },

  updateAttendance(meetingId, attending) {
    return post(`${BASE}/meetings/${meetingId}/attendance`, { attending });
  },
};
