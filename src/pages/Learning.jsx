/**
 * Learning Page
 * Micro-lessons and learning modules for leadership development
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { get } from '@/utils/api';

// Hero image import
import heroLearning from '@/assets/images/hero-learning.jpg';

// SVG Icons
const icons = {
  playCircle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
  ),
  headphones: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
  ),
  fileText: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" x2="8" y1="13" y2="13"></line>
      <line x1="16" x2="8" y1="17" y2="17"></line>
      <line x1="10" x2="8" y1="9" y2="9"></line>
    </svg>
  ),
  bookOpen: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
};

// Content type icons
const contentIcons = {
  video: icons.playCircle,
  audio: icons.headphones,
  article: icons.fileText,
  exercise: icons.bookOpen,
};

export default function Learning() {
  const { t } = useTranslation(['learning', 'common']);

  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadLearningContent();
  }, []);

  async function loadLearningContent() {
    setIsLoading(true);
    try {
      const response = await get('/api/learning/modules');
      if (response.success) {
        setModules(response.data.modules || []);
      }
    } catch (error) {
      console.error('Error loading learning content:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} ${t('common:min', 'min')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
    <div className="learning-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image-container">
          <img
            src={heroLearning}
            alt="Abstract layers representing learning"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{t('learning:hero.title', 'Learning')}</h1>
          <p className="hero-tagline">
            {t('learning:hero.tagline', 'Micro-lessons for busy leaders')}
          </p>
        </div>
      </div>

      {/* Learning Content Container */}
      <div id="learning-content-container">
        {/* Continue Learning Section */}
        {modules.some((m) => m.progress > 0 && m.progress < 100) && (
          <section className="learning-section">
            <h2 className="section-title">
              {t('learning:continueLearning', 'Continue Learning')}
            </h2>
            <div className="learning-grid">
              {modules
                .filter((m) => m.progress > 0 && m.progress < 100)
                .map((module) => (
                  <LearningCard
                    key={module.id}
                    module={module}
                    formatDuration={formatDuration}
                    t={t}
                  />
                ))}
            </div>
          </section>
        )}

        {/* All Modules */}
        <section className="learning-section">
          <h2 className="section-title">
            {t('learning:allModules', 'All Modules')}
          </h2>
          {modules.length > 0 ? (
            <div className="learning-grid">
              {modules.map((module) => (
                <LearningCard
                  key={module.id}
                  module={module}
                  formatDuration={formatDuration}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="card empty-state">
              {icons.bookOpen}
              <p>{t('learning:noModules', 'No learning modules available yet.')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Learning Card Component
function LearningCard({ module, formatDuration, t }) {
  const contentIcon = contentIcons[module.type] || icons.bookOpen;
  const cardClass = module.type === 'video' || module.type === 'audio'
    ? 'learning-card learning-card-playable'
    : 'learning-card learning-card-readable';

  return (
    <div className={`${cardClass} ${module.progress === 100 ? 'completed' : ''}`}>
      {/* Image/Icon */}
      <div className="learning-card-image">
        {module.thumbnail ? (
          <img src={module.thumbnail} alt={module.title} />
        ) : (
          <div className="learning-card-icon">
            {contentIcon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="learning-card-content">
        <div className="learning-card-meta">
          <span className="learning-type">{module.type || 'lesson'}</span>
          <span className="learning-duration">
            {icons.clock}
            {formatDuration(module.duration || 10)}
          </span>
        </div>

        <h3 className="learning-card-title">{module.title}</h3>
        <p className="learning-card-description">{module.description}</p>

        {/* Progress */}
        {module.progress > 0 && (
          <div className="learning-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${module.progress}%` }}
              />
            </div>
            {module.progress === 100 ? (
              <span className="progress-complete">
                {icons.checkCircle}
                {t('common:complete', 'Complete')}
              </span>
            ) : (
              <span className="progress-text">{module.progress}%</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
