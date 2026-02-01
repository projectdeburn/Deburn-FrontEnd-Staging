import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { circlesApi } from '@/features/circles/circlesApi';

import CircleCard from '@/components/circles/CircleCard';
import AvailabilityBanner from '@/components/circles/AvailabilityBanner';
import InvitationCard from '@/components/circles/InvitationCard';
import GroupDetailsModal from '@/components/circles/GroupDetailsModal';
import ScheduleMeetingModal from '@/components/circles/ScheduleMeetingModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import heroCircles from '@/assets/images/hero-circles.jpg';

const icons = {
  users: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  check: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  alertCircle: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" x2="12" y1="8" y2="12"></line>
      <line x1="12" x2="12.01" y1="16" y2="16"></line>
    </svg>
  ),
};

export default function Circles() {
  const { t } = useTranslation(['circles', 'common']);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);
  const [availability, setAvailability] = useState([]);

  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilityExpanded, setAvailabilityExpanded] = useState(false);

  const availabilityBannerRef = useRef(null);

  useEffect(() => {
    loadCirclesData();
  }, []);

  async function loadCirclesData() {
    setIsLoading(true);
    setError(null);
    try {
      const [groupsRes, invitesRes] = await Promise.all([
        circlesApi.getMyGroups().catch(() => ({ success: false })),
        circlesApi.getMyInvitations().catch(() => ({ success: false })),
      ]);

      let loadedGroups = [];
      if (groupsRes.success) {
        loadedGroups = groupsRes.data.groups || [];
        setGroups(loadedGroups);
      }

      if (invitesRes.success) {
        setPendingInvitations(invitesRes.data.pending || []);
        setAcceptedInvitations(invitesRes.data.accepted || []);
      }

      if (loadedGroups.length > 0) {
        const firstGroupId = loadedGroups[0].id;
        const availRes = await circlesApi.getAvailability(firstGroupId).catch(() => ({ success: false }));
        if (availRes.success) {
          setAvailability(availRes.data.slots || []);
        }
      }
    } catch (err) {
      setError(err.message || t('circles:error.load', 'Failed to load circles'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcceptInvitation(token) {
    try {
      const result = await circlesApi.acceptInvitation(token);
      if (result.success) {
        await loadCirclesData();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeclineInvitation(token) {
    try {
      const result = await circlesApi.declineInvitation(token);
      if (result.success) {
        setPendingInvitations(prev => prev.filter(inv => inv.token !== token));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveAvailability(slots) {
    if (groups.length === 0) {
      return;
    }

    const groupId = groups[0].id;
    setIsSavingAvailability(true);
    try {
      const result = await circlesApi.updateAvailability(groupId, slots);
      if (result.success) {
        setAvailability(slots);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingAvailability(false);
    }
  }

  function handleViewDetails(group) {
    setSelectedGroup(group);
    setShowGroupDetailsModal(true);
  }

  function handleScheduleMeeting(group) {
    setSelectedGroup(group);
    setShowScheduleModal(true);
  }

  function handleEditAvailability() {
    // Expand the banner and scroll to it
    setAvailabilityExpanded(true);
    availabilityBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleJoinCall(group, meeting) {
    if (meeting?.meetingLink) {
      window.open(meeting.meetingLink, '_blank', 'noopener,noreferrer');
    }
  }

  async function handleScheduleSubmit(meetingData) {
    try {
      const result = await circlesApi.scheduleMeeting(meetingData.groupId, {
        title: meetingData.title,
        scheduledAt: meetingData.scheduledAt,
        duration: meetingData.duration || 60,
        meetingLink: meetingData.meetingLink,
        timezone: meetingData.timezone,
        availableMembers: meetingData.availableMembers,
      });
      if (result.success) {
        await loadCirclesData();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (isLoading) {
    return <LoadingSpinner text={t('common:loading', 'Loading...')} />;
  }

  if (error) {
    return (
      <div className="circles-error-state">
        <div className="circles-error-icon">{icons.alertCircle}</div>
        <h2>{t('circles:error.title', 'Something went wrong')}</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadCirclesData}>
          {t('common:refresh', 'Try Again')}
        </button>
      </div>
    );
  }

  const hasGroups = groups.length > 0;
  const hasPendingInvitations = pendingInvitations.length > 0;
  const hasAcceptedInvitations = acceptedInvitations.length > 0;

  return (
    <>
      <div className="hero-section">
        <div className="hero-image-container">
          <img
            src={heroCircles}
            alt="Leadership Circles"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{t('circles:hero.title', 'Leadership Circles')}</h1>
          <p className="hero-tagline">
            {t('circles:hero.tagline', 'Connect with peers who understand')}
          </p>
        </div>
      </div>

      {hasGroups && (
        <div ref={availabilityBannerRef}>
          <AvailabilityBanner
            availability={availability}
            onSaveAvailability={handleSaveAvailability}
            isSaving={isSavingAvailability}
            isExpanded={availabilityExpanded}
            onToggleExpanded={setAvailabilityExpanded}
          />
        </div>
      )}

      {hasPendingInvitations && (
        <section className="section">
          <h2 className="section-title">
            {t('circles:invitations.title', 'Pending Invitations')}
          </h2>
          <div className="invitations-list">
            {pendingInvitations.map((invite) => (
              <InvitationCard
                key={invite.token}
                invitation={invite}
                onAccept={handleAcceptInvitation}
                onDecline={handleDeclineInvitation}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">
          {t('circles:groups.title', 'Your Circles')}
        </h2>

        {hasGroups ? (
          <div className="circles-grid">
            {groups.map((group) => (
              <CircleCard
                key={group.id}
                group={group}
                onScheduleMeeting={handleScheduleMeeting}
                onViewDetails={handleViewDetails}
                onEditAvailability={handleEditAvailability}
              />
            ))}
          </div>
        ) : hasAcceptedInvitations ? (
          <div className="circles-waiting-state">
            <div className="circles-waiting-icon">{icons.check}</div>
            <h3>{t('circles:empty.acceptedTitle', 'Invitation Accepted')}</h3>
            <p>
              {t('circles:empty.acceptedFor', 'Accepted for: {{poolName}}', {
                poolName: acceptedInvitations[0]?.poolName || 'Leadership Circle'
              })}
            </p>
            <p className="circles-waiting-description">
              {t('circles:empty.acceptedDescription', "You'll be notified when your circle group is formed.")}
            </p>
          </div>
        ) : (
          <div className="circles-empty-state">
            <div className="circles-empty-icon">{icons.users}</div>
            <h2>{t('circles:empty.title', 'No circles yet')}</h2>
            <p>
              {t('circles:empty.description', "You haven't been assigned to any leadership circles yet. When your organization admin creates a circle and assigns groups, you'll see your circle here.")}
            </p>
          </div>
        )}
      </section>

      <GroupDetailsModal
        isOpen={showGroupDetailsModal}
        onClose={() => {
          setShowGroupDetailsModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onScheduleMeeting={handleScheduleMeeting}
      />

      <ScheduleMeetingModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onSchedule={handleScheduleSubmit}
        onMeetingCancelled={loadCirclesData}
      />
    </>
  );
}
