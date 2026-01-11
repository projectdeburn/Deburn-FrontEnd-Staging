/**
 * Modal Component
 * Reusable modal/dialog with overlay
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
}) {
  const modalRef = useRef(null);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-xl shadow-lg w-full
          animate-in zoom-in-95 duration-200
          ${sizes[size] || sizes.md}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 id="modal-title" className="text-lg font-semibold text-neutral-800">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Modal Footer
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 ${className}`}>
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
      <p className="text-neutral-600">{message}</p>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
