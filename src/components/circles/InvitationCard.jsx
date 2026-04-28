/**
 * InvitationCard Component
 * Displays pending invitation with accept/decline actions
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// SVG Icons
const icons = {
  mail: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
};

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function InvitationCard({
  invitation,
  onAccept,
  onDecline,
}) {
  const { t } = useTranslation(['circles', 'common']);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const { poolName, token, expiresAt } = invitation;

  async function handleAccept() {
    if (isAccepting || isDeclining) return;
    setIsAccepting(true);
    try {
      await onAccept?.(token);
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleDecline() {
    if (isAccepting || isDeclining) return;
    setIsDeclining(true);
    try {
      await onDecline?.(token);
    } finally {
      setIsDeclining(false);
    }
  }

  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  return (
    <div className={`invitation-card ${isExpired ? 'invitation-card--expired' : ''}`}>
      <div className="invitation-card-icon">
        {icons.mail}
      </div>

      <div className="invitation-card-content">
        <h3 className="invitation-card-title">{poolName}</h3>
        <p className="invitation-card-description">
          {t('circles:invitations.description', "You've been invited to join a leadership circle")}
        </p>
        {expiresAt && (
          <p className="invitation-card-expires">
            {icons.clock}
            <span>
              {isExpired
                ? t('circles:invitations.expired', 'Expired')
                : t('circles:invitations.expires', 'Expires: {{date}}', { date: formatDate(expiresAt) })}
            </span>
          </p>
        )}
      </div>

      <div className="invitation-card-actions">
        <button
          className="btn btn-ghost"
          onClick={handleDecline}
          disabled={isAccepting || isDeclining || isExpired}
        >
          {isDeclining ? t('common:loading', 'Loading...') : t('circles:invitations.decline', 'Decline')}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleAccept}
          disabled={isAccepting || isDeclining || isExpired}
        >
          {isAccepting ? t('common:loading', 'Loading...') : t('circles:invitations.accept', 'Accept')}
        </button>
      </div>
    </div>
  );
}
