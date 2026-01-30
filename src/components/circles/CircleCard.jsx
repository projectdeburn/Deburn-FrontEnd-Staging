/**
 * CircleCard Component
 * Displays individual circle/group with members, next meeting, and actions
 */

import { useTranslation } from 'react-i18next';

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
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z"></path>
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  messageCircle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
    </svg>
  ),
};

// Avatar colors for members
const AVATAR_COLORS = [
  '#2D4A47', // Deep Forest
  '#7C9885', // Sage
  '#B8A898', // Warm Taupe
  '#5C7A6F', // Muted Green
  '#8B7355', // Mocha
  '#6B8E7D', // Seafoam
];

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
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ensureProtocol(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

export default function CircleCard({
  group,
  onScheduleMeeting,
  onViewDetails,
  onEditAvailability,
}) {
  const { t } = useTranslation(['circles', 'common']);

  const { name, members = [], nextMeeting } = group;
  const memberCount = members.length;
  const topic = nextMeeting?.title || null;

  const hasMeetingLink = nextMeeting?.meetingLink;

  return (
    <div className="circle-card">
      {/* Header: Name and Meta - always full width */}
      <div className="circle-card-header">
        <h3 className="circle-card-name">{name}</h3>
        <p className="circle-card-meta">
          {memberCount} {t('circles:groups.members', 'members')}
        </p>
      </div>

      {/* Next Meeting Badge - separate row for consistency */}
      {nextMeeting && (
        <div className="circle-card-meeting">
          <div className="circle-card-meeting-badge">
            {icons.calendar}
            <span>{formatMeetingDate(nextMeeting.scheduledAt)}</span>
          </div>
        </div>
      )}

      {/* Member Avatars */}
      <div className="circle-card-avatars">
        {members.slice(0, 6).map((member, index) => (
          <div
            key={member.id || index}
            className="circle-avatar"
            style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
            title={member.name}
          >
            {getInitials(member.name)}
          </div>
        ))}
        {members.length > 6 && (
          <div className="circle-avatar circle-avatar-more">
            +{members.length - 6}
          </div>
        )}
      </div>

      {/* Discussion Topic */}
      {topic && (
        <div className="circle-card-topic">
          <span className="circle-card-topic-label">
            {icons.messageCircle}
            {t('circles:groups.discussionTopic', 'Discussion topic')}
          </span>
          <p className="circle-card-topic-text">{topic}</p>
        </div>
      )}

      {/* Actions - always at bottom */}
      <div className="circle-card-actions">
        {nextMeeting ? (
          <>
            {/* Primary actions row */}
            <div className="circle-card-actions-row">
              {hasMeetingLink ? (
                <a
                  href={ensureProtocol(nextMeeting.meetingLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {icons.video}
                  <span>{t('circles:groups.joinCall', 'Join Call')}</span>
                </a>
              ) : (
                <button
                  className="btn btn-primary btn-disabled"
                  disabled
                  title={t('circles:groups.noLinkYet', 'No meeting link added yet')}
                >
                  {icons.video}
                  <span>{t('circles:groups.joinCall', 'Join Call')}</span>
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={() => onScheduleMeeting?.(group)}
              >
                {icons.clock}
                <span>{t('circles:groups.scheduleAnother', 'Schedule Meeting')}</span>
              </button>
            </div>
            {/* Secondary actions row */}
            <div className="circle-card-actions-row">
              <button
                className="btn btn-ghost"
                onClick={() => onViewDetails?.(group)}
              >
                {t('circles:groups.viewUpcomingMeetings', 'View Upcoming Meetings')}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => onEditAvailability?.(group)}
              >
                {t('circles:groups.editAvailability', 'Edit Availability')}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* No meeting yet - simpler layout */}
            <button
              className="btn btn-primary"
              onClick={() => onScheduleMeeting?.(group)}
            >
              {icons.clock}
              <span>{t('circles:groups.scheduleMeeting', 'Schedule Meeting')}</span>
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => onEditAvailability?.(group)}
            >
              {t('circles:groups.editAvailability', 'Edit Availability')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
