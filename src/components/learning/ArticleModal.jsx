/**
 * Article Modal Component
 * Displays text article content in a modal overlay
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/utils/i18n';
import { getAuthToken } from '@/utils/api';
import ThumbsRating from './ThumbsRating';

/**
 * Get localized field from module based on current language
 */
function getLocalizedField(module, field) {
  const lang = i18n.language === 'sv' ? 'Sv' : 'En';
  const localizedField = `${field}${lang}`;
  const fallbackField = `${field}En`;
  return module[localizedField] || module[fallbackField] || '';
}

// File text icon
const FileTextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" x2="8" y1="13" y2="13"></line>
    <line x1="16" x2="8" y1="17" y2="17"></line>
    <line x1="10" x2="8" y1="9" y2="9"></line>
  </svg>
);

// Close icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function ArticleModal({ module, onClose }) {
  const { t } = useTranslation(['learning', 'common']);
  const [articleImageUrl, setArticleImageUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFetchComplete, setImageFetchComplete] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Close on escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Content is loaded when image fetch is complete AND image is loaded (if applicable)
  useEffect(() => {
    if (!imageFetchComplete) return;

    // If there's an image URL, wait for the image to load
    if (articleImageUrl) {
      if (imageLoaded) {
        // Small delay for smooth transition
        const timer = setTimeout(() => setContentLoaded(true), 100);
        return () => clearTimeout(timer);
      }
    } else {
      // No image, just show content after brief delay
      const timer = setTimeout(() => setContentLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [imageFetchComplete, articleImageUrl, imageLoaded]);

  // Fetch article image if available
  useEffect(() => {
    async function fetchArticleImage() {
      const lang = i18n.language === 'sv' ? 'sv' : 'en';
      const hasImage = lang === 'sv' ? module.hasImageSv : module.hasImageEn;

      // Also check generic hasImage flag
      if (!hasImage && !module.hasImage) {
        // No image to fetch, mark as complete
        setImageFetchComplete(true);
        return;
      }

      try {
        const moduleId = module._id || module.id;
        const response = await fetch(
          `${import.meta.env.VITE_ENDPOINT || ''}/api/article-image/${moduleId}/${lang}`,
          {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` },
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setArticleImageUrl(url);
        }
      } catch (error) {
        console.error('Error fetching article image:', error);
      } finally {
        // Mark fetch as complete regardless of success/failure
        setImageFetchComplete(true);
      }
    }

    fetchArticleImage();

    // Cleanup blob URL on unmount
    return () => {
      if (articleImageUrl) {
        URL.revokeObjectURL(articleImageUrl);
      }
    };
  }, [module]);

  // Get localized content
  const title = getLocalizedField(module, 'title');
  const textContent = getLocalizedField(module, 'textContent');

  // Calculate reading time (average 200 words per minute)
  const wordCount = (textContent || '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Handle backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay active" onClick={handleBackdropClick}>
      <div className="modal-content text-content-modal" style={{ position: 'relative' }}>
        {/* Loading overlay */}
        <div className={`article-loading-overlay ${contentLoaded ? 'hidden' : ''}`}>
          <div className="article-loading-spinner"></div>
          <p className="article-loading-text">{t('common:loading', 'Loading...')}</p>
        </div>

        <button className="modal-close-btn" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className={`text-content-body ${contentLoaded ? 'visible' : ''}`}>
          <div className="text-content-header">
            <div className="text-content-title-row">
              <FileTextIcon />
              <h2 className="text-content-title">{title}</h2>
            </div>
            <div className="text-content-meta">
              {module.lengthMinutes > 0 && (
                <span className="text-content-reading-time">
                  {module.lengthMinutes} {t('learning:minRead', 'min read')}
                </span>
              )}
              {!module.lengthMinutes && (
                <span className="text-content-reading-time">
                  {readingTime} {t('learning:minRead', 'min read')}
                </span>
              )}
            </div>
          </div>

          {/* Article Image */}
          {articleImageUrl && (
            <figure className={`article-image ${imageLoaded ? 'loaded' : ''}`}>
              <img
                src={articleImageUrl}
                alt={title}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </figure>
          )}

          <div
            className="text-content-article"
            dangerouslySetInnerHTML={{ __html: formatArticleContent(textContent) }}
          />

          <ThumbsRating
            contentId={module._id || module.id}
            contentTitle={title}
          />
        </div>

        <div className={`text-content-footer ${contentLoaded ? 'visible' : ''}`}>
          <button className="btn btn-secondary" onClick={onClose}>
            {t('common:close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Format article content with proper HTML structure
 * Handles markdown-style headers, paragraphs, and images
 *
 * Note: [IMAGE:caption] syntax is removed because the article image
 * is displayed at the top of the article via the hasImage mechanism.
 */
function formatArticleContent(content) {
  if (!content) return '';

  // Check if content is already HTML (starts with < and contains tags)
  const isHtml = content.trim().startsWith('<') && /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    // Content is already HTML - remove image placeholders and return
    let html = content;

    // Remove [IMAGE:caption] placeholders - the image is shown at the top via hasImage
    html = html.replace(/\[IMAGE:[^\]]*\]/g, '');

    // Convert markdown images ![alt](url) to img tags (for any actual URLs in content)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
      '<figure class="article-image inline-image"><img src="$2" alt="$1"><figcaption>$1</figcaption></figure>');

    return html;
  }

  // Content is markdown-style - parse it
  // Split into paragraphs
  const paragraphs = content.split(/\n\n+/);

  return paragraphs.map(para => {
    let trimmed = para.trim();
    if (!trimmed) return '';

    // Skip [IMAGE:caption] lines - the image is shown at the top via hasImage
    if (trimmed.match(/^\[IMAGE:[^\]]*\]$/)) {
      return '';
    }

    // Handle markdown images ![alt](url) with actual URLs
    if (trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
      const match = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      return `<figure class="article-image inline-image"><img src="${match[2]}" alt="${match[1]}"><figcaption>${match[1]}</figcaption></figure>`;
    }

    // Check for markdown-style headers
    if (trimmed.startsWith('### ')) {
      return `<h4>${trimmed.slice(4)}</h4>`;
    }
    if (trimmed.startsWith('## ')) {
      return `<h3>${trimmed.slice(3)}</h3>`;
    }
    if (trimmed.startsWith('# ')) {
      return `<h2>${trimmed.slice(2)}</h2>`;
    }

    // Check for horizontal rule
    if (trimmed === '---') {
      return '<hr>';
    }

    // Check for bold section headers (e.g., "**Header:**")
    if (trimmed.startsWith('**') && trimmed.includes(':**')) {
      const headerMatch = trimmed.match(/^\*\*([^*]+):\*\*\s*(.*)/);
      if (headerMatch) {
        return `<h4>${headerMatch[1]}</h4><p>${headerMatch[2]}</p>`;
      }
    }

    // Regular paragraph - handle inline formatting
    let formatted = trimmed
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // Bold
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>') // Italic (not bold)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="inline-article-image">') // Inline images with URLs
      .replace(/\[IMAGE:[^\]]*\]/g, '')                    // Remove image placeholders
      .replace(/\n/g, '<br/>');                            // Line breaks

    return `<p>${formatted}</p>`;
  }).join('');
}
