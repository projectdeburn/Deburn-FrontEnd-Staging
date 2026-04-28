/**
 * Modal Component
 * Reusable modal/dialog with overlay
 * Uses prototype.css classes (no Tailwind)
 */

import { useEffect, useRef, Children, isValidElement } from 'react';

// Close icon SVG
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18"></line>
    <line x1="6" x2="18" y1="6" y2="18"></line>
  </svg>
);

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Size mapping
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '500px' },
    lg: { maxWidth: '600px' },
    xl: { maxWidth: '800px' },
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="circles-modal-content"
        style={sizeStyles[size] || sizeStyles.md}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="circles-modal-header">
          <h2 id="modal-title">{title}</h2>
          {showCloseButton && (
            <button
              className="circles-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Body — render everything except ModalFooter */}
        <div className="circles-modal-body">
          {Children.toArray(children).filter(
            child => !(isValidElement(child) && child.type === ModalFooter)
          )}
        </div>

        {/* Footer — rendered outside scrollable body so it stays pinned */}
        {Children.toArray(children).filter(
          child => isValidElement(child) && child.type === ModalFooter
        )}
      </div>
    </div>
  );
}

/**
 * Modal Footer
 * Renders action buttons at the bottom of the modal
 */
export function ModalFooter({ children }) {
  return (
    <div className="circles-modal-footer">
      {children}
    </div>
  );
}

/**
 * Confirm Dialog
 * A simple confirmation dialog
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color: 'var(--neutral-600)', margin: 0 }}>{message}</p>
      <ModalFooter>
        <button
          className="btn btn-ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}
