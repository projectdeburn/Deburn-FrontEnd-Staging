/**
 * Avatar Component
 * User avatar with fallback to initials
 */

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name) {
  if (!name) return 'bg-neutral-400';

  const colors = [
    'bg-sage',
    'bg-deep-forest',
    'bg-ember',
    'bg-dawn',
    'bg-sky',
    'bg-success',
    'bg-info',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  name,
  size = 'md',
  className = '',
}) {
  const sizeClasses = sizes[size] || sizes.md;
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizeClasses} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses} ${bgColor}
        rounded-full flex items-center justify-center
        font-medium text-white
        ${className}
      `}
    >
      {initials}
    </div>
  );
}

/**
 * Coach Avatar - Animated orbs for AI coach
 */
export function CoachAvatar({ size = 'md', className = '' }) {
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <div className={`${sizeClasses} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle className="fill-sage/20 animate-pulse" cx="55" cy="50" r="40" />
        <circle className="fill-sage/30" cx="53" cy="50" r="32" />
        <circle className="fill-sage/50" cx="51" cy="50" r="24" />
        <circle className="fill-sage/70" cx="49" cy="50" r="16" />
        <circle className="fill-sage" cx="47" cy="50" r="8" />
      </svg>
    </div>
  );
}
