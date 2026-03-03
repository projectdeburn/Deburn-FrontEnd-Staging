/**
 * Learning Page
 * Micro-lessons and learning modules for leadership development
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/utils/i18n';
import { get, post, del, getAuthToken } from '@/utils/api';

// Modal components
import ArticleModal from '@/components/learning/ArticleModal';
import AudioModal from '@/components/learning/AudioModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
};

// Content type icons
const contentIcons = {
  video: icons.playCircle,
  audio: icons.headphones,
  article: icons.fileText,
  exercise: icons.headphones, // exercises use headphones icon like audio
};

/**
 * Get localized field from module based on current language
 * @param {object} module - The content module
 * @param {string} field - Base field name (e.g., 'title', 'textContent')
 * @returns {string} The localized value
 */
function getLocalizedField(module, field) {
  const lang = i18n.language === 'sv' ? 'Sv' : 'En';
  const localizedField = `${field}${lang}`;
  const fallbackField = `${field}En`;
  return module[localizedField] || module[fallbackField] || '';
}

export default function Learning() {
  const { t } = useTranslation(['learning', 'common']);

  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Modal state
  const [selectedModule, setSelectedModule] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  // Audio preload cache and controllers
  const audioCache = useRef(new Map()); // moduleId -> blob URL
  const preloadTimers = useRef(new Map()); // moduleId -> timer
  const abortControllers = useRef(new Map()); // moduleId -> AbortController

  useEffect(() => {
    loadLearningContent();
    loadBookmarks();

    // Cleanup preloaded audio on unmount
    return () => {
      audioCache.current.forEach((url) => URL.revokeObjectURL(url));
      abortControllers.current.forEach((controller) => controller.abort());
    };
  }, []);

  async function loadLearningContent() {
    setIsLoading(true);
    try {
      const response = await get('/api/learning/content');
      if (response.success) {
        setModules(response.data.items || []);
      }
    } catch (error) {
      console.error('Error loading learning content:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBookmarks() {
    try {
      const response = await get('/api/learning/bookmarks');
      if (response.success) {
        setBookmarkedIds(new Set(response.data.bookmarkIds || []));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }

  async function handleToggleBookmark(contentId) {
    const isCurrentlyBookmarked = bookmarkedIds.has(contentId);

    // Optimistic update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });

    try {
      if (isCurrentlyBookmarked) {
        await del(`/api/learning/content/${contentId}/bookmark`);
      } else {
        await post(`/api/learning/content/${contentId}/bookmark`);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on failure
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) {
          next.add(contentId);
        } else {
          next.delete(contentId);
        }
        return next;
      });
    }
  }

  function handleCardClick(module) {
    // Don't open modal if no content
    if (!module.hasContent) return;

    setSelectedModule(module);

    // Open appropriate modal based on content type
    if (module.contentType === 'text_article') {
      setShowArticleModal(true);
    } else if (module.contentType === 'audio_article' || module.contentType === 'audio_exercise') {
      setShowAudioModal(true);
    } else if (module.contentType === 'video_link' && module.videoUrl) {
      // Open video in new tab
      window.open(module.videoUrl, '_blank');
    }
  }

  function closeArticleModal() {
    setShowArticleModal(false);
    setSelectedModule(null);
  }

  function closeAudioModal() {
    setShowAudioModal(false);
    setSelectedModule(null);
  }

  // Preload audio on hover (debounced)
  const handleAudioHover = useCallback((module) => {
    const moduleId = module.id;
    const isAudio = module.contentType === 'audio_article' || module.contentType === 'audio_exercise';

    if (!isAudio || !module.hasContent || audioCache.current.has(moduleId)) return;

    // Debounce: wait 250ms before starting fetch
    const timer = setTimeout(async () => {
      // Double-check cache (might have been preloaded already)
      if (audioCache.current.has(moduleId)) return;

      const controller = new AbortController();
      abortControllers.current.set(moduleId, controller);

      try {
        const audioLang = i18n.language === 'sv' ? 'sv' : 'en';
        const response = await fetch(
          `${import.meta.env.VITE_ENDPOINT || ''}/api/learning/content/${moduleId}/audio/${audioLang}`,
          {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` },
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          audioCache.current.set(moduleId, blobUrl);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Preload failed:', err);
        }
      } finally {
        abortControllers.current.delete(moduleId);
      }
    }, 250);

    preloadTimers.current.set(moduleId, timer);
  }, []);

  // Cancel preload on hover leave
  const handleAudioLeave = useCallback((module) => {
    const moduleId = module.id;

    // Clear debounce timer
    const timer = preloadTimers.current.get(moduleId);
    if (timer) {
      clearTimeout(timer);
      preloadTimers.current.delete(moduleId);
    }

    // Abort in-flight request
    const controller = abortControllers.current.get(moduleId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(moduleId);
    }
  }, []);

  // Get preloaded audio URL if available
  const getPreloadedAudio = useCallback((moduleId) => {
    return audioCache.current.get(moduleId) || null;
  }, []);

  if (isLoading) {
    return <LoadingSpinner text={t('common:loading', 'Loading...')} />;
  }

  // Filter categories for the filter buttons
  const filterCategories = ['all', 'bookmarks', 'featured', 'leadership', 'breath', 'meditation'];

  // Filter modules based on active filter
  const filteredModules = activeFilter === 'all'
    ? modules
    : activeFilter === 'bookmarks'
      ? modules.filter(m => bookmarkedIds.has(m.id))
      : modules.filter(m => m.category === activeFilter);

  // Group modules by category
  const groupedModules = filteredModules.reduce((acc, module) => {
    const category = module.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {});

  // Define category order
  const categoryOrder = ['featured', 'leadership', 'breath', 'meditation', 'burnout', 'wellbeing', 'other'];

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

      {/* Filter Buttons */}
      <div className="learning-filters">
        {filterCategories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category === 'all'
              ? t('learning:filters.all', 'All')
              : category === 'bookmarks'
                ? t('learning:bookmarks', 'Bookmarks')
                : t(`learning:categories.${category}`, category)}
          </button>
        ))}
      </div>

      {/* Learning Content Container */}
      <div id="learning-content-container">
        {/* Render categories in order */}
        {categoryOrder.map((category) => {
          const categoryModules = groupedModules[category];
          if (!categoryModules || categoryModules.length === 0) return null;

          return (
            <section key={category} className="learning-section">
              <h2 className="section-title">
                {t(`learning:categories.${category}`, category)}
              </h2>
              <div className="learning-grid">
                {categoryModules.map((module) => (
                  <LearningCard
                    key={module.id}
                    module={module}
                    onClick={() => handleCardClick(module)}
                    onMouseEnter={() => handleAudioHover(module)}
                    onMouseLeave={() => handleAudioLeave(module)}
                    isBookmarked={bookmarkedIds.has(module.id)}
                    onToggleBookmark={() => handleToggleBookmark(module.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {modules.length === 0 && (
          <div className="card empty-state">
            {icons.bookOpen}
            <p>{t('learning:noModules', 'No learning modules available yet.')}</p>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {showArticleModal && selectedModule && (
        <ArticleModal
          module={selectedModule}
          onClose={closeArticleModal}
        />
      )}

      {/* Audio Modal */}
      {showAudioModal && selectedModule && (
        <AudioModal
          module={selectedModule}
          onClose={closeAudioModal}
          preloadedAudioUrl={getPreloadedAudio(selectedModule.id)}
        />
      )}
    </div>
  );
}

// Map content type to display type
function getDisplayType(contentType) {
  const mapping = {
    text_article: 'article',
    audio_article: 'audio',
    audio_exercise: 'exercise',
    video_link: 'video',
  };
  return mapping[contentType] || 'article';
}

// Learning Card Component
function LearningCard({ module, onClick, onMouseEnter, onMouseLeave, isBookmarked, onToggleBookmark }) {
  const { t } = useTranslation(['learning', 'common']);
  const displayType = getDisplayType(module.contentType);
  const contentIcon = contentIcons[displayType] || icons.fileText;
  const isDisabled = !module.hasContent;

  // Build class names
  const cardClasses = [
    'learning-card',
    isDisabled ? 'learning-card-disabled' : '',
    displayType === 'audio' || displayType === 'exercise' ? 'learning-card-playable' : '',
    displayType === 'article' ? 'learning-card-readable' : '',
  ].filter(Boolean).join(' ');

  // Format duration
  const duration = module.lengthMinutes;

  return (
    <div
      className={cardClasses}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={isDisabled ? undefined : onMouseEnter}
      onMouseLeave={isDisabled ? undefined : onMouseLeave}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <button
        className={`learning-card-bookmark${isBookmarked ? ' active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
        title={isBookmarked ? t('learning:removeBookmark', 'Unsave') : t('learning:addBookmark', 'Save')}
        aria-label={isBookmarked ? t('learning:removeBookmark', 'Unsave') : t('learning:addBookmark', 'Save')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div className="learning-card-icon">
        {contentIcon}
      </div>
      <h3 className="learning-card-title">{getLocalizedField(module, 'title')}</h3>
      {duration && (
        <span className="learning-card-duration">
          {t('common:time.minutes', '{{count}} min', { count: duration })}
        </span>
      )}
    </div>
  );
}
