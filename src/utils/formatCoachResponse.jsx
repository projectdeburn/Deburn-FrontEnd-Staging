/**
 * Format coach response with markdown-like formatting
 * Converts plain text from LLM to structured HTML
 */

/**
 * Escape HTML entities to prevent XSS
 * @param {string} text - Raw text
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format coach response text to HTML
 * @param {string} text - Raw text from LLM
 * @returns {string} Formatted HTML string
 */
export function formatCoachResponse(text) {
  if (!text) return '';

  // Escape HTML first to prevent XSS
  let formatted = escapeHtml(text);

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em> (single asterisks, not double)
  formatted = formatted.replace(/(?:^|[^*])\*([^*]+)\*(?:[^*]|$)/g, '<em>$1</em>');

  // Convert bullet points (- item) to list items
  formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Convert bullet points (• item) to list items
  formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive list items in <ul>
  formatted = formatted.replace(/(<li>[^<]+<\/li>\n?)+/g, '<ul>$&</ul>');

  // Convert numbered lists (1. item) to ordered list items
  formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

  // Convert double newlines (paragraphs) to two line breaks
  formatted = formatted.replace(/\n\n/g, '<br><br>');

  // Convert single newlines to one line break
  formatted = formatted.replace(/\n/g, '<br>');

  // Clean up breaks inside/around lists
  formatted = formatted.replace(/(<br>)+<ul>/g, '<ul>');
  formatted = formatted.replace(/<\/ul>(<br>)+/g, '</ul>');
  formatted = formatted.replace(/(<br>)+<li>/g, '<li>');
  formatted = formatted.replace(/<\/li>(<br>)+/g, '</li>');

  return formatted;
}

/**
 * React component for rendering formatted coach response
 * Uses dangerouslySetInnerHTML safely since we escape input first
 */
export function FormattedMessage({ content }) {
  const formattedHtml = formatCoachResponse(content);

  return (
    <div
      className="formatted-message"
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
}

/**
 * React component for rendering streaming formatted content
 * Formats progressively without buffering - same approach as Claude/ChatGPT
 * Incomplete markers briefly show as raw text until closed
 */
export function StreamingMessage({ content }) {
  const formattedHtml = formatCoachResponse(content);

  return (
    <div
      className="formatted-message"
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
}
