/**
 * Circles Page
 * Peer support groups and scheduled meetings
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { get } from '@/utils/api';

// Hero image import
import heroCircles from '@/assets/images/hero-circles.jpg';

// SVG Icons
const icons = {
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
      <line x1="16" x2="16" y1="2" y2="6"></line>
      <line x1="8" x2="8" y1="2" y2="6"></line>
      <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
  ),
  video: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z"></path>
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
    </svg>
  ),
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19"></line>
      <line x1="5" x2="19" y1="12" y2="12"></line>
    </svg>
  ),
  chevronRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
};

export default function Circles() {
  const { t } = useTranslation(['circles', 'common']);

  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  useEffect(() => {
    loadCirclesData();
  }, []);

  async function loadCirclesData() {
    setIsLoading(true);
    try {
      const [groupsRes, invitesRes] = await Promise.all([
        get(`${process.env.ENDPOINT}/api/circles/groups`).catch(() => ({ success: false })),
        get(`${process.env.ENDPOINT}/api/circles/invitations`).catch(() => ({ success: false })),
      ]);

      if (groupsRes.success) {
        setGroups(groupsRes.data.groups || []);
        setUpcomingMeetings(groupsRes.data.upcomingMeetings || []);
      }

      if (invitesRes.success) {
        setInvitations(invitesRes.data.invitations || []);
      }
    } catch (error) {
      console.error('Error loading circles:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatMeetingDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>{t('common:loading', 'Loading...')}</p>
      </div>
    );
  }

  return (
    <div className="circles-content" id="circles-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image-container">
          <img
            src={heroCircles}
            alt="Circles"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{t('circles:hero.title', 'Circles')}</h1>
          <p className="hero-tagline">
            {t('circles:hero.tagline', 'Connect with your peer support groups')}
          </p>
        </div>
      </div>

      {/* Invitations */}
      {invitations.length > 0 && (
        <section className="circles-section">
          <h2 className="section-title">
            {t('circles:invitations.title', 'Pending Invitations')}
          </h2>
          <div className="invitations-list">
            {invitations.map((invite) => (
              <div key={invite.id} className="invitation-card">
                <div className="invitation-info">
                  <div className="invitation-icon">
                    {icons.mail}
                  </div>
                  <div className="invitation-details">
                    <h3>{invite.groupName}</h3>
                    <p>{t('circles:invitations.from', 'Invited by')} {invite.invitedBy}</p>
                  </div>
                </div>
                <div className="invitation-actions">
                  <button className="btn btn-ghost">
                    {t('common:decline', 'Decline')}
                  </button>
                  <button className="btn btn-primary">
                    {t('common:accept', 'Accept')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <section className="circles-section">
          <h2 className="section-title">
            {t('circles:meetings.upcoming', 'Upcoming Meetings')}
          </h2>
          <div className="meetings-list">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="meeting-item">
                <div className="meeting-icon">
                  {icons.video}
                </div>
                <div className="meeting-info">
                  <h3 className="meeting-title">{meeting.title}</h3>
                  <p className="meeting-topic">{meeting.groupName}</p>
                  <div className="meeting-date">
                    {icons.calendar}
                    <span>{formatMeetingDate(meeting.date)}</span>
                  </div>
                </div>
                {icons.chevronRight}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Groups */}
      <section className="circles-section">
        <div className="section-header">
          <h2 className="section-title">
            {t('circles:groups.myGroups', 'My Groups')}
          </h2>
          <button className="btn btn-ghost">
            {icons.plus}
            <span>{t('circles:groups.create', 'Create')}</span>
          </button>
        </div>

        {groups.length > 0 ? (
          <div className="circles-groups-list">
            {groups.map((group) => (
              <div key={group.id} className="circle-card">
                <div className="circle-card-header">
                  <div className="circle-icon">
                    {icons.users}
                  </div>
                  <div className="circle-info">
                    <h3>{group.name}</h3>
                    <p>{group.memberCount} {t('circles:groups.members', 'members')}</p>
                  </div>
                  {icons.chevronRight}
                </div>

                {/* Member Avatars */}
                {group.members && group.members.length > 0 && (
                  <div className="circle-members">
                    <div className="avatar-stack">
                      {group.members.slice(0, 4).map((member, i) => (
                        <div key={i} className="avatar">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                      ))}
                    </div>
                    {group.members.length > 4 && (
                      <span className="more-members">
                        +{group.members.length - 4} {t('common:more', 'more')}
                      </span>
                    )}
                  </div>
                )}

                {/* Next Meeting */}
                {group.nextMeeting && (
                  <div className="circle-next-meeting">
                    {icons.calendar}
                    <span>{t('circles:groups.nextMeeting', 'Next:')} {group.nextMeeting}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="circles-empty-state">
            <div className="empty-state-icon">
              {icons.users}
            </div>
            <h2>{t('circles:groups.noGroups', 'No groups yet')}</h2>
            <p>{t('circles:groups.joinPrompt', 'Join a circle to connect with peers')}</p>
            <button className="btn btn-primary">
              {icons.plus}
              <span>{t('circles:groups.create', 'Create a Circle')}</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
