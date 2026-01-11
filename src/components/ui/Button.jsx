/**
 * Button Component
 * Reusable button with multiple variants
 */

import { forwardRef } from 'react';

const variants = {
  primary: 'bg-deep-forest text-white hover:bg-[#1d3429] active:bg-[#152520]',
  secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200',
  danger: 'bg-alert text-white hover:bg-[#a85a52] active:bg-[#8f4d46]',
  outline: 'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
      )}
      {children}
    </button>
  );
});
