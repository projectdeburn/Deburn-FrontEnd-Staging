/**
 * Checkin Page
 * Multi-step daily check-in flow
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { post } from '@/utils/api';

// SVG Icons
const icons = {
  arrowLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  arrowRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
  zap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  brain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  cloud: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
    </svg>
  ),
  cloudSun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="M20 12h2"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
      <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path>
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path>
    </svg>
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  ),
  sparkles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      <path d="M5 3v4"></path>
      <path d="M19 17v4"></path>
      <path d="M3 5h4"></path>
      <path d="M17 19h4"></path>
    </svg>
  ),
  activity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  checkCircle: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  flame: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
  ),
  lightbulb: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  ),
};

// Mood face SVGs
const moodFaces = {
  1: (
    <svg className="mood-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M16 32 C18 28, 30 28, 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 14 L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M34 14 L30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  2: (
    <svg className="mood-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M16 32 C20 30, 28 30, 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  3: (
    <svg className="mood-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <line x1="16" y1="32" x2="32" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  4: (
    <svg className="mood-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M16 30 C20 34, 28 34, 32 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  5: (
    <svg className="mood-icon" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2"/>
      <circle cx="16" cy="20" r="2" fill="currentColor"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      <path d="M14 28 C18 36, 30 36, 34 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

export default function Checkin() {
  const { t } = useTranslation(['checkin', 'common']);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Check-in data
  const [mood, setMood] = useState(null);
  const [physicalEnergy, setPhysicalEnergy] = useState(5);
  const [mentalEnergy, setMentalEnergy] = useState(6);
  const [sleep, setSleep] = useState(null);
  const [stress, setStress] = useState(4);

  const totalSteps = 4;

  // Helper function to calculate slider fill gradient
  function getSliderStyle(value, min = 1, max = 10) {
    const percentage = ((value - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(90deg, var(--color-sage) 0%, var(--color-deep-forest) ${percentage}%, var(--neutral-200) ${percentage}%)`,
    };
  }

  // Mood labels
  const moodLabels = {
    1: t('checkin:mood.struggling', 'Struggling'),
    2: t('checkin:mood.low', 'Low'),
    3: t('checkin:mood.neutral', 'Neutral'),
    4: t('checkin:mood.good', 'Good'),
    5: t('checkin:mood.great', 'Great'),
  };

  // Sleep options with icons
  const sleepOptions = [
    { value: 1, icon: icons.moon, label: t('checkin:sleep.poor', 'Poor') },
    { value: 2, icon: icons.cloud, label: t('checkin:sleep.fair', 'Fair') },
    { value: 3, icon: icons.cloudSun, label: t('checkin:sleep.ok', 'OK') },
    { value: 4, icon: icons.sun, label: t('checkin:sleep.good', 'Good') },
    { value: 5, icon: icons.sparkles, label: t('checkin:sleep.great', 'Great') },
  ];

  function isStepValid() {
    switch (currentStep) {
      case 1:
        return mood !== null;
      case 2:
        return true;
      case 3:
        return sleep !== null;
      case 4:
        return true;
      default:
        return false;
    }
  }

  async function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === totalSteps - 1) {
      await submitCheckin();
    } else {
      navigate('/dashboard');
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  async function submitCheckin() {
    setIsSubmitting(true);
    try {
      const response = await post('/api/checkin', {
        mood,
        physicalEnergy,
        mentalEnergy,
        sleep,
        stress,
      });

      if (response.success) {
        setCompletionData(response.data);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="checkin-screen">
      <div className="checkin-container">
        {/* Check-in Header */}
        <header className="checkin-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          {icons.arrowLeft}
        </button>
        <h2 className="checkin-title">{t('checkin:title', 'Daily Check-in')}</h2>
        <div className="header-spacer"></div>
      </header>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className="step-dots">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`step-dot ${i + 1 <= currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
              data-step={i + 1}
            />
          ))}
        </div>
        <span className="step-text">
          {t('checkin:step', 'Step')} {currentStep} {t('checkin:of', 'of')} {totalSteps}
        </span>
      </div>

      {/* Step 1: Mood */}
      <div className={`checkin-step ${currentStep === 1 ? 'active' : ''}`} data-step="1">
        <div className="step-content">
          <h3 className="step-question">
            {t('checkin:mood.question', 'How are you feeling right now?')}
          </h3>
          <div className="mood-selector">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={`mood-option ${mood === level ? 'selected' : ''}`}
                data-value={level}
                onClick={() => setMood(level)}
              >
                {moodFaces[level]}
                <span className="mood-label">{moodLabels[level]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Energy */}
      <div className={`checkin-step ${currentStep === 2 ? 'active' : ''}`} data-step="2">
        <div className="step-content">
          <h3 className="step-question">
            {t('checkin:energy.question', "What's your energy level?")}
          </h3>

          <div className="slider-group">
            <div className="slider-header">
              {icons.zap}
              <span>{t('checkin:energy.physical', 'Physical Energy')}</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={physicalEnergy}
                onChange={(e) => setPhysicalEnergy(parseInt(e.target.value))}
                className="slider"
                style={getSliderStyle(physicalEnergy)}
              />
              <div className="slider-labels">
                <span>{t('common:low', 'Low')}</span>
                <span>{t('common:high', 'High')}</span>
              </div>
            </div>
          </div>

          <div className="slider-group">
            <div className="slider-header">
              {icons.brain}
              <span>{t('checkin:energy.mental', 'Mental Energy')}</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={mentalEnergy}
                onChange={(e) => setMentalEnergy(parseInt(e.target.value))}
                className="slider"
                style={getSliderStyle(mentalEnergy)}
              />
              <div className="slider-labels">
                <span>{t('common:low', 'Low')}</span>
                <span>{t('common:high', 'High')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Sleep & Stress */}
      <div className={`checkin-step ${currentStep === 3 ? 'active' : ''}`} data-step="3">
        <div className="step-content">
          <h3 className="step-question">
            {t('checkin:sleep.question', 'How did you sleep?')}
          </h3>
          <div className="sleep-selector">
            {sleepOptions.map((option) => (
              <button
                key={option.value}
                className={`sleep-option ${sleep === option.value ? 'selected' : ''}`}
                data-value={option.value}
                onClick={() => setSleep(option.value)}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="slider-group" style={{ marginTop: '48px' }}>
            <div className="slider-header">
              {icons.activity}
              <span>{t('checkin:stress.label', 'Current stress level')}</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={stress}
                onChange={(e) => setStress(parseInt(e.target.value))}
                className="slider stress-slider"
              />
              <div className="slider-labels">
                <span>{t('checkin:stress.calm', 'Calm')}</span>
                <span>{t('checkin:stress.overwhelmed', 'Overwhelmed')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Complete */}
      <div className={`checkin-step ${currentStep === 4 ? 'active' : ''}`} data-step="4">
        <div className="step-content completion-content">
          <div className="completion-icon">
            {icons.checkCircle}
          </div>
          <h3 className="completion-title">
            {t('checkin:complete.title', 'Check-in Complete')}
          </h3>

          <div className="streak-celebration">
            {icons.flame}
            <span className="streak-number">{completionData?.streak || 1}</span>
            <span className="streak-label">{t('checkin:complete.streak', 'Day Streak!')}</span>
          </div>

          {completionData?.insight && (
            <div className="insight-card">
              <div className="insight-header">
                {icons.lightbulb}
                <span>{t('checkin:complete.insight', "Today's Insight")}</span>
              </div>
              <p className="insight-text">{completionData.insight}</p>
            </div>
          )}

          {completionData?.tip && (
            <div className="tip-card">
              <p className="tip-label">{t('checkin:complete.tipLabel', 'Your morning tip:')}</p>
              <p className="tip-text">"{completionData.tip}"</p>
            </div>
          )}
        </div>
      </div>

        {/* Navigation Buttons */}
        <div className="checkin-nav">
          <button
            className="btn btn-ghost"
            onClick={handleBack}
            style={{ visibility: currentStep === 1 || currentStep === 4 ? 'hidden' : 'visible' }}
          >
            {icons.arrowLeft}
            <span>{t('common:back', 'Back')}</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <span>{t('common:loading', 'Loading...')}</span>
            ) : currentStep === 4 ? (
              <span>{t('checkin:complete.done', 'Done')}</span>
            ) : currentStep === 3 ? (
              <span>{t('checkin:submit', 'Submit')}</span>
            ) : (
              <>
                <span>{t('common:continue', 'Continue')}</span>
                {icons.arrowRight}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
