/**
 * GroupDetailsModal Component
 * Displays full circle/group information with members and meetings
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { circlesApi } from '@/features/circles/circlesApi';

// Avatar colors
const AVATAR_COLORS = [
  '#2D4A47', '#7C9885', '#B8A898', '#5C7A6F', '#8B7355', '#6B8E7D',
];

// SVG Icons
const icons = {
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
      <line x1="16" x2="16" y1="2" y2="6"></line>
      <line x1="8" x2="8" y1="2" y2="6"></line>
      <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z"></path>
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18"></line>
      <line x1="6" x2="18" y1="6" y2="18"></line>
    </svg>
  ),
};

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatMeetingDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function GroupDetailsModal({
  isOpen,
  onClose,
  group,
  onScheduleMeeting,
}) {
  const { t } = useTranslation(['circles', 'common']);
  const [meetings, setMeetings] = useState([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);

  useEffect(() => {
    if (isOpen && group?.id) {
      loadMeetings();
    }
  }, [isOpen, group?.id]);

  async function loadMeetings() {
    setIsLoadingMeetings(true);
    try {
      const result = await circlesApi.getGroupMeetings(group.id);
      if (result.success) {
        setMeetings(result.data.meetings || []);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setIsLoadingMeetings(false);
    }
  }

  if (!group) return null;

  const { name, members = [], pool } = group;
  const cadence = pool?.cadence || 'bi-weekly';
  const topic = pool?.topic;

  const cadenceText = {
    weekly: t('circles:groups.weekly', 'Weekly'),
    'bi-weekly': t('circles:groups.biWeekly', 'Bi-weekly'),
    monthly: t('circles:groups.monthly', 'Monthly'),
  }[cadence] || cadence;

  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledAt) >= new Date());
  const pastMeetings = meetings.filter(m => new Date(m.scheduledAt) < new Date());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={name}
      size="lg"
    >
      <div className="group-details-content">
        {/* Group Info */}
        <div className="group-details-meta">
          <span className="group-details-meta-item">
            {icons.users}
            {members.length} {t('circles:groups.members', 'members')}
          </span>
          <span className="group-details-meta-item">
            {icons.calendar}
            {cadenceText}
          </span>
        </div>

        {/* Discussion Topic */}
        {topic && (
          <div className="group-details-topic">
            <h4>{t('circles:groups.currentTopic', 'Current Discussion Topic')}</h4>
            <p>{topic}</p>
          </div>
        )}

        {/* Members List */}
        <div className="group-details-section">
          <h4>{t('circles:groups.membersTitle', 'Members')}</h4>
          <div className="group-details-members">
            {members.map((member, index) => (
              <div key={member.id || index} className="group-details-member">
                <div
                  className="group-details-member-avatar"
                  style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                >
                  {getInitials(member.name)}
                </div>
                <span className="group-details-member-name">{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="group-details-section">
          <h4>{t('circles:groups.upcomingMeetings', 'Upcoming Meetings')}</h4>
          {isLoadingMeetings ? (
            <p className="group-details-loading">{t('common:loading', 'Loading...')}</p>
          ) : upcomingMeetings.length > 0 ? (
            <div className="group-details-meetings">
              {upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="group-details-meeting">
                  <div className="group-details-meeting-info">
                    <span className="group-details-meeting-title">{meeting.title}</span>
                    <span className="group-details-meeting-date">
                      {formatMeetingDate(meeting.scheduledAt)}
                    </span>
                  </div>
                  {meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-small"
                    >
                      {icons.video}
                      <span>{t('circles:groups.join', 'Join')}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="group-details-empty">
              {t('circles:groups.noUpcoming', 'No upcoming meetings scheduled.')}
            </p>
          )}
        </div>

        {/* Past Meetings */}
        {pastMeetings.length > 0 && (
          <div className="group-details-section">
            <h4>{t('circles:groups.pastMeetings', 'Past Meetings')}</h4>
            <div className="group-details-meetings group-details-meetings--past">
              {pastMeetings.slice(0, 5).map(meeting => (
                <div key={meeting.id} className="group-details-meeting group-details-meeting--past">
                  <div className="group-details-meeting-info">
                    <span className="group-details-meeting-title">{meeting.title}</span>
                    <span className="group-details-meeting-date">
                      {formatMeetingDate(meeting.scheduledAt)}
                    </span>
                  </div>
                  <span className="group-details-meeting-status">
                    {meeting.status === 'completed' ? icons.check : icons.x}
                    {meeting.status === 'completed'
                      ? t('circles:groups.completed', 'Completed')
                      : t('circles:groups.cancelled', 'Cancelled')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
        >
          {t('common:buttons.close', 'Close')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onClose();
            onScheduleMeeting?.(group);
          }}
        >
          {t('circles:groups.scheduleMeeting', 'Schedule Meeting')}
        </button>
      </ModalFooter>
    </Modal>
  );
}
