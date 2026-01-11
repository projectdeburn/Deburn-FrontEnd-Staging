/**
 * Spinner Component
 * Loading indicators
 */

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <svg
      className={`animate-spin text-sage ${sizes[size] || sizes.md} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Loading Overlay
 * Full-screen or container loading state
 */
export function LoadingOverlay({ message = 'Loading...', fullScreen = false }) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0';

  return (
    <div className={`${containerClasses} bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3`}>
      <Spinner size="lg" />
      <p className="text-neutral-600">{message}</p>
    </div>
  );
}
