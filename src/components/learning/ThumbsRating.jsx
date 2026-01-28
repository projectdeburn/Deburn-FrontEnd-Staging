/**
 * ThumbsRating Component
 * Simple thumbs up/down rating for learning content feedback
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { post } from '@/utils/api';

const icons = {
  thumbsUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12"></path>
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
    </svg>
  ),
  thumbsDown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2"></path>
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
    </svg>
  ),
};

export default function ThumbsRating({ contentId, contentTitle }) {
  const { t } = useTranslation(['learning', 'common']);

  const [selectedRating, setSelectedRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleRating(rating) {
    if (isSubmitting || isSubmitted) return;

    // Validate required props
    if (!contentId) {
      console.error('ThumbsRating: contentId is required');
      return;
    }

    setSelectedRating(rating);
    setIsSubmitting(true);

    try {
      await post('/api/feedback/learning', {
        contentId,
        contentTitle: contentTitle || 'Unknown',
        rating,
        isAnonymous: false,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="content-rating">
        <div className="rating-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{t('learning:rating.thanks', 'Thanks!')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-rating">
      <button
        className={`rating-btn ${selectedRating === 1 ? 'active' : ''}`}
        onClick={() => handleRating(1)}
        disabled={isSubmitting}
        data-rating="1"
        aria-label={t('learning:rating.helpful', 'Helpful')}
      >
        {icons.thumbsUp}
      </button>
      <button
        className={`rating-btn ${selectedRating === -1 ? 'active' : ''}`}
        onClick={() => handleRating(-1)}
        disabled={isSubmitting}
        data-rating="-1"
        aria-label={t('learning:rating.notHelpful', 'Not helpful')}
      >
        {icons.thumbsDown}
      </button>
    </div>
  );
}
