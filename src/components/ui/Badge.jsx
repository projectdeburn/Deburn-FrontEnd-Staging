/**
 * Badge Component
 * Small status/label indicators
 */

const variants = {
  default: 'bg-neutral-100 text-neutral-700',
  primary: 'bg-deep-forest/10 text-deep-forest',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-alert/10 text-alert',
  info: 'bg-info/10 text-info',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

/**
 * Streak Badge - For showing streak count
 */
export function StreakBadge({ count, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-ember/10 text-ember rounded-full ${className}`}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 23a7.5 7.5 0 0 0 7.5-7.5c0-5.07-4.26-10.24-6.78-12.89a1 1 0 0 0-1.44 0C8.76 5.26 4.5 10.43 4.5 15.5A7.5 7.5 0 0 0 12 23zm0-2a5.5 5.5 0 0 1-5.5-5.5c0-3.8 3.12-7.93 5.5-10.6 2.38 2.67 5.5 6.8 5.5 10.6A5.5 5.5 0 0 1 12 21z" />
      </svg>
      <span className="font-semibold">{count}</span>
      <span className="text-sm">day streak</span>
    </div>
  );
}
