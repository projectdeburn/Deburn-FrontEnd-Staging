/**
 * Card Component
 * Reusable card container with optional header
 */

export function Card({
  children,
  className = '',
  padding = 'md',
  ...props
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-neutral-100
        ${paddingClasses[padding] || paddingClasses.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-neutral-800 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-neutral-500 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Action Card - Clickable card with icon
 */
export function ActionCard({
  icon: Icon,
  title,
  description,
  badge,
  action,
  onClick,
  variant = 'primary',
  className = '',
}) {
  const variants = {
    primary: 'bg-deep-forest text-white',
    secondary: 'bg-white border border-neutral-100',
  };

  return (
    <div
      className={`
        rounded-xl p-6 cursor-pointer
        transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${variants[variant] || variants.secondary}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${variant === 'primary' ? 'bg-white/10' : 'bg-sage/10'}
          `}>
            <Icon className={`w-6 h-6 ${variant === 'primary' ? 'text-white' : 'text-sage'}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${variant === 'primary' ? 'text-white' : 'text-neutral-800'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${variant === 'primary' ? 'text-white/80' : 'text-neutral-500'}`}>
            {description}
          </p>
          {badge && (
            <div className="mt-3">
              {badge}
            </div>
          )}
        </div>
      </div>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * Stat Card - For displaying statistics
 */
export function StatCard({
  icon: Icon,
  value,
  label,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-xl p-5 border border-neutral-100 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-sage" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-neutral-800">{value}</div>
      <div className="text-sm text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

/**
 * Quick Card - Small clickable card
 */
export function QuickCard({
  icon: Icon,
  title,
  meta,
  onClick,
  className = '',
}) {
  return (
    <div
      className={`
        bg-white rounded-xl p-4 border border-neutral-100
        cursor-pointer transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${className}
      `}
      onClick={onClick}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-sage" />
        </div>
      )}
      <h4 className="font-medium text-neutral-800">{title}</h4>
      {meta && (
        <p className="text-sm text-neutral-500 mt-1">{meta}</p>
      )}
    </div>
  );
}
