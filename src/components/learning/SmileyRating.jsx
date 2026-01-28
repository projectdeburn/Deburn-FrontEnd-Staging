/**
 * SmileyRating Component
 * 1-5 smiley face rating for general feedback
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { post } from '@/utils/api';

// Mood face icons (1-5 scale)
const MoodFace = ({ level }) => {
  const faces = {
    1: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mood-face-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
    2: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mood-face-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="15" x2="16" y2="15"></line>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
    3: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mood-face-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="15" x2="16" y2="15"></line>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
    4: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mood-face-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
    5: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mood-face-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    ),
  };
  return faces[level] || faces[3];
};

export default function SmileyRating({ onSubmit }) {
  const { t } = useTranslation(['common']);

  const [selectedRating, setSelectedRating] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(rating) {
    if (isSubmitting || isSubmitted) return;

    setSelectedRating(rating);
    setIsSubmitting(true);

    try {
      await post('/api/feedback', {
        rating,
        isAnonymous,
      });

      setIsSubmitted(true);
      if (onSubmit) onSubmit(rating);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="smiley-rating">
        <div className="smiley-rating-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{t('common:thanks', 'Thank you for your feedback!')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="smiley-rating">
      <p className="smiley-rating-title">
        {t('common:rateExperience', 'How would you rate your experience?')}
      </p>
      <div className="smiley-rating-buttons">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            className={`smiley-btn ${selectedRating === level ? 'selected' : ''}`}
            onClick={() => handleSubmit(level)}
            disabled={isSubmitting}
            aria-label={`Rate ${level} out of 5`}
          >
            <MoodFace level={level} />
          </button>
        ))}
      </div>
      <label className="smiley-rating-anonymous">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        {t('common:submitAnonymously', 'Submit anonymously')}
      </label>
    </div>
  );
}
