/**
 * SmileyRating Component
 * 5-point smiley rating system for learning content feedback
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { post } from '@/utils/api';

// Mood face SVGs (matching Checkin)
const moodFaces = {
  1: (
    <svg className="mood-face-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M16 32 C18 28, 30 28, 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 14 L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M34 14 L30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  2: (
    <svg className="mood-face-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M16 32 C20 30, 28 30, 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  3: (
    <svg className="mood-face-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <line x1="16" y1="32" x2="32" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  4: (
    <svg className="mood-face-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M16 30 C20 34, 28 34, 32 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  5: (
    <svg className="mood-face-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M14 28 C18 36, 30 36, 34 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

const ratingLabels = [
  { rating: 1, label: 'Not helpful' },
  { rating: 2, label: 'Slightly helpful' },
  { rating: 3, label: 'Okay' },
  { rating: 4, label: 'Helpful' },
  { rating: 5, label: 'Very helpful' },
];

export default function SmileyRating({ contentId, contentTitle }) {
  const { t } = useTranslation(['learning', 'common']);

  const [selectedRating, setSelectedRating] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleRating(rating) {
    if (isSubmitting || isSubmitted) return;

    setSelectedRating(rating);
    setIsSubmitting(true);

    try {
      await post('/api/feedback/learning', {
        contentId,
        contentTitle,
        rating,
        isAnonymous,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // Reset on error so user can try again
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="smiley-rating">
        <div className="smiley-rating-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{t('learning:rating.thanks', 'Thanks for your feedback!')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="smiley-rating">
      <p className="smiley-rating-title">
        {t('learning:rating.title', 'How helpful was this content?')}
      </p>

      <div className="smiley-rating-buttons">
        {ratingLabels.map((item) => (
          <button
            key={item.rating}
            className={`smiley-btn ${selectedRating === item.rating ? 'selected' : ''}`}
            onClick={() => handleRating(item.rating)}
            disabled={isSubmitting}
            title={item.label}
            aria-label={item.label}
          >
            {moodFaces[item.rating]}
          </button>
        ))}
      </div>

      <label className="smiley-rating-anonymous">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          disabled={isSubmitting}
        />
        <span>{t('learning:rating.anonymous', 'Submit anonymously')}</span>
      </label>
    </div>
  );
}
