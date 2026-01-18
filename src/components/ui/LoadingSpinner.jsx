/**
 * LoadingSpinner Component
 * Hula-hoop style spinner - exact match to deburnalpha prototype.js
 */

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-inline">
      <div className="spinner-container">
        <svg className="spinner-svg" viewBox="0 0 100 100">
          <circle className="spinner-orb spinner-orb-1" cx="60" cy="50" r="40" />
          <circle className="spinner-orb spinner-orb-2" cx="58" cy="50" r="33" />
          <circle className="spinner-orb spinner-orb-3" cx="56" cy="50" r="26" />
          <circle className="spinner-orb spinner-orb-4" cx="54" cy="50" r="19" />
          <circle className="spinner-orb spinner-orb-5" cx="52" cy="50" r="12" />
        </svg>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
}

export default LoadingSpinner;
