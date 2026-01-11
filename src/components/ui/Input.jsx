/**
 * Input Component
 * Reusable form input with label and error handling
 */

import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    type = 'text',
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const inputClasses = `
    w-full px-4 py-2.5
    bg-white border rounded-lg
    text-neutral-800 placeholder-neutral-400
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent
    disabled:bg-neutral-50 disabled:cursor-not-allowed
    ${error ? 'border-alert' : 'border-neutral-200 hover:border-neutral-300'}
    ${className}
  `;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-alert">{error}</p>
      )}
    </div>
  );
});

/**
 * Textarea Component
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    className = '',
    containerClassName = '',
    rows = 3,
    ...props
  },
  ref
) {
  const textareaClasses = `
    w-full px-4 py-2.5
    bg-white border rounded-lg
    text-neutral-800 placeholder-neutral-400
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent
    disabled:bg-neutral-50 disabled:cursor-not-allowed
    resize-none
    ${error ? 'border-alert' : 'border-neutral-200 hover:border-neutral-300'}
    ${className}
  `;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-alert">{error}</p>
      )}
    </div>
  );
});

/**
 * Select Component
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    children,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const selectClasses = `
    w-full px-4 py-2.5
    bg-white border rounded-lg
    text-neutral-800
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent
    disabled:bg-neutral-50 disabled:cursor-not-allowed
    ${error ? 'border-alert' : 'border-neutral-200 hover:border-neutral-300'}
    ${className}
  `;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-alert">{error}</p>
      )}
    </div>
  );
});

/**
 * Checkbox Component
 */
export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    error,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-4 h-4 rounded border-neutral-300
            text-deep-forest
            focus:ring-sage focus:ring-offset-0
            ${className}
          `}
          {...props}
        />
        {label && (
          <span className="text-sm text-neutral-700">{label}</span>
        )}
      </label>
      {error && (
        <p className="text-sm text-alert">{error}</p>
      )}
    </div>
  );
});
