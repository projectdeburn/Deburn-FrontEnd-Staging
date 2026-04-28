/**
 * Feedback Page
 * General feedback submission form
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { post } from '@/utils/api';

// Hero image import
import heroCoach from '@/assets/images/hero-coach.jpg';

const MAX_CHARS = 2000;

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

export default function Feedback() {
  const { t } = useTranslation(['feedback', 'common']);
  const textareaRef = useRef(null);

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(140, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  const charCount = content.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!content.trim() && !rating) {
      setError(t('feedback:error.empty', 'Please provide a rating or feedback'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await post('/api/feedback', {
        content: content.trim(),
        rating,
        isAnonymous,
      });

      setIsSuccess(true);
    } catch (err) {
      setError(err.message || t('feedback:error.submit', 'Failed to submit feedback'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setContent('');
    setRating(null);
    setIsAnonymous(false);
    setIsSuccess(false);
    setError('');
  }

  return (
    <div className="feedback-page">
      {/* Hero Section */}
      <div className="hero-section hero-compact">
        <div className="hero-image-container">
          <img
            src={heroCoach}
            alt="Feedback"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{t('feedback:title', 'Share Your Feedback')}</h1>
        </div>
      </div>

      {/* Subtitle below banner */}
      <p className="feedback-intro">
        {t('feedback:subtitle', 'Help us improve Eve by sharing your thoughts')}
      </p>

      {/* Feedback Form */}
      <div className="feedback-container">
        {isSuccess ? (
          <div className="feedback-success">
            <div className="feedback-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>{t('feedback:success.title', 'Thank you!')}</h2>
            <p>{t('feedback:success.message', 'Your feedback has been submitted successfully.')}</p>
            <button className="btn btn-primary" onClick={handleReset}>
              {t('feedback:success.submitAnother', 'Submit Another')}
            </button>
          </div>
        ) : (
          <div className="feedback-card">
            <form className="feedback-form" onSubmit={handleSubmit}>
              {error && (
                <div className="feedback-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Rating Section */}
              <div className="feedback-rating-section">
                <p className="feedback-rating-label">
                  {t('feedback:ratingLabel', 'How is your experience with Eve?')}
                </p>
                <div className="feedback-rating-buttons">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`feedback-rating-btn ${rating === value ? 'selected' : ''}`}
                      onClick={() => setRating(value)}
                    >
                      {moodFaces[value]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="feedback-divider"></div>

              {/* Text Feedback */}
              <div className="feedback-textarea-section">
                <p className="feedback-textarea-label">
                  {t('feedback:textLabel', 'Tell us more (optional)')}
                </p>
                <div className="feedback-textarea-wrapper">
                  <textarea
                    ref={textareaRef}
                    className="feedback-textarea"
                    placeholder={t('feedback:placeholder', "What's on your mind?")}
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                  />
                  <div className="feedback-char-count">
                    <span className={charCount >= MAX_CHARS ? 'at-limit' : ''}>
                      {charCount}
                    </span>
                    /{MAX_CHARS}
                  </div>
                </div>
              </div>

              <div className="feedback-footer">
                <label className="feedback-anonymous-toggle">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {t('feedback:anonymous', 'Submit anonymously')}
                  </span>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary feedback-submit-btn"
                  disabled={isSubmitting || (!content.trim() && !rating)}
                >
                  {isSubmitting
                    ? t('common:submitting', 'Submitting...')
                    : t('feedback:submit', 'Submit Feedback')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
