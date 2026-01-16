/**
 * Article Modal Component
 * Displays text article content in a modal overlay
 */

import { useEffect } from 'react';

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

  // Calculate reading time (average 200 words per minute)
  const wordCount = (module.textContentEn || '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Handle backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay active" onClick={handleBackdropClick}>
      <div className="modal-content text-content-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="text-content-body">
          <div className="text-content-header">
            <div className="text-content-title-row">
              <FileTextIcon />
              <h2 className="text-content-title">{module.titleEn}</h2>
            </div>
            <div className="text-content-meta">
              {module.lengthMinutes > 0 && (
                <span className="text-content-reading-time">
                  {module.lengthMinutes} min read
                </span>
              )}
              {!module.lengthMinutes && (
                <span className="text-content-reading-time">
                  {readingTime} min read
                </span>
              )}
            </div>
          </div>

          <div
            className="text-content-article"
            dangerouslySetInnerHTML={{ __html: formatArticleContent(module.textContentEn) }}
          />
        </div>

        <div className="text-content-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Format article content with proper HTML structure
 * Handles markdown-style headers and paragraphs
 */
function formatArticleContent(content) {
  if (!content) return '';

  // Split into paragraphs
  const paragraphs = content.split(/\n\n+/);

  return paragraphs.map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';

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
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')              // Italic
      .replace(/\n/g, '<br/>');                            // Line breaks

    return `<p>${formatted}</p>`;
  }).join('');
}
