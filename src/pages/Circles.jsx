/**
 * Circles Page
 * Leadership Circles - peer support groups and scheduled meetings
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { circlesApi } from '@/features/circles/circlesApi';

// Components
import CircleCard from '@/components/circles/CircleCard';
import AvailabilityBanner from '@/components/circles/AvailabilityBanner';
import InvitationCard from '@/components/circles/InvitationCard';
import GroupDetailsModal from '@/components/circles/GroupDetailsModal';
import ScheduleMeetingModal from '@/components/circles/ScheduleMeetingModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Hero image import
import heroCircles from '@/assets/images/hero-circles.jpg';

// SVG Icons
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

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);
  const [availability, setAvailability] = useState([]);

  // Modal state
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  useEffect(() => {
    loadCirclesData();
  }, []);

  async function loadCirclesData() {
    setIsLoading(true);
    setError(null);
    try {
      const [groupsRes, invitesRes, availRes] = await Promise.all([
        circlesApi.getMyGroups().catch(() => ({ success: false })),
        circlesApi.getMyInvitations().catch(() => ({ success: false })),
        circlesApi.getAvailability().catch(() => ({ success: false })),
      ]);

      if (groupsRes.success) {
        setGroups(groupsRes.data.groups || []);
      }

      if (invitesRes.success) {
        setPendingInvitations(invitesRes.data.pending || []);
        setAcceptedInvitations(invitesRes.data.accepted || []);
      }

      if (availRes.success) {
        setAvailability(availRes.data.slots || []);
      }
    } catch (err) {
      console.error('Error loading circles:', err);
      setError(err.message || t('circles:error.load', 'Failed to load circles'));
    } finally {
      setIsLoading(false);
    }
  }

  // Invitation handlers
  async function handleAcceptInvitation(token) {
    try {
      const result = await circlesApi.acceptInvitation(token);
      if (result.success) {
        // Refresh data
        await loadCirclesData();
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
    }
  }

  async function handleDeclineInvitation(token) {
    try {
      const result = await circlesApi.declineInvitation(token);
      if (result.success) {
        // Remove from pending
        setPendingInvitations(prev => prev.filter(inv => inv.token !== token));
      }
    } catch (err) {
      console.error('Error declining invitation:', err);
    }
  }

  // Availability handlers
  async function handleSaveAvailability(slots) {
    setIsSavingAvailability(true);
    try {
      const result = await circlesApi.updateAvailability(slots);
      if (result.success) {
        setAvailability(slots);
      }
    } catch (err) {
      console.error('Error saving availability:', err);
    } finally {
      setIsSavingAvailability(false);
    }
  }

  // Meeting handlers
  function handleViewDetails(group) {
    setSelectedGroup(group);
    setShowGroupDetailsModal(true);
  }

  function handleScheduleMeeting(group) {
    setSelectedGroup(group);
    setShowScheduleModal(true);
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
      });
      if (result.success) {
        // Refresh to get updated meeting data
        await loadCirclesData();
      }
    } catch (err) {
      console.error('Error scheduling meeting:', err);
    }
  }

  // Loading state
  if (isLoading) {
    return <LoadingSpinner text={t('common:loading', 'Loading...')} />;
  }

  // Error state
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
      {/* Hero Section */}
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

      {/* Availability Banner - only show if user has groups */}
      {hasGroups && (
        <AvailabilityBanner
          availability={availability}
          onSaveAvailability={handleSaveAvailability}
          isSaving={isSavingAvailability}
        />
      )}

      {/* Pending Invitations */}
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

      {/* Your Circles */}
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
                onJoinCall={handleJoinCall}
              />
            ))}
          </div>
        ) : hasAcceptedInvitations ? (
          // Accepted invitation, waiting for group formation
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
          // No circles at all
          <div className="circles-empty-state">
            <div className="circles-empty-icon">{icons.users}</div>
            <h2>{t('circles:empty.title', 'No circles yet')}</h2>
            <p>
              {t('circles:empty.description', "You haven't been assigned to any leadership circles yet. When your organization admin creates a circle and assigns groups, you'll see your circle here.")}
            </p>
          </div>
        )}
      </section>

      {/* Modals */}
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
      />
    </>
  );
}
