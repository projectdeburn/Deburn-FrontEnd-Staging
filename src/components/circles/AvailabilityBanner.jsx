/**
 * AvailabilityBanner Component
 * Inline availability picker that expands to show weekly time grid
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// SVG Icons
const icons = {
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
      <line x1="16" x2="16" y1="2" y2="6"></line>
      <line x1="8" x2="8" y1="2" y2="6"></line>
      <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
  ),
  checkCircle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  chevronDown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  chevronUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  ),
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function formatHour(hour) {
  if (hour === 12) return '12pm';
  if (hour > 12) return `${hour - 12}pm`;
  return `${hour}am`;
}

export default function AvailabilityBanner({
  availability = [],
  onSaveAvailability,
  isSaving = false,
}) {
  const { t } = useTranslation(['circles', 'common']);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const hasAvailability = availability && availability.length > 0;
  const slotCount = availability.length;

  // Initialize selected slots from availability prop
  useEffect(() => {
    if (availability.length > 0) {
      const slotKeys = availability.map(slot => `${slot.day}-${slot.hour}`);
      setSelectedSlots(new Set(slotKeys));
    }
  }, [availability]);

  function toggleSlot(day, hour) {
    const key = `${day}-${hour}`;
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
    setHasChanges(true);
  }

  function isSlotSelected(day, hour) {
    return selectedSlots.has(`${day}-${hour}`);
  }

  function handleSave() {
    const slots = Array.from(selectedSlots).map(key => {
      const [day, hour] = key.split('-');
      return { day, hour: parseInt(hour, 10) };
    });
    onSaveAvailability?.(slots);
    setHasChanges(false);
  }

  function handleClearAll() {
    setSelectedSlots(new Set());
    setHasChanges(true);
  }

  function handleCancel() {
    // Reset to original
    const slotKeys = availability.map(slot => `${slot.day}-${slot.hour}`);
    setSelectedSlots(new Set(slotKeys));
    setHasChanges(false);
    setIsExpanded(false);
  }

  const dayLabels = {
    monday: t('circles:availability.days.mon', 'Mon'),
    tuesday: t('circles:availability.days.tue', 'Tue'),
    wednesday: t('circles:availability.days.wed', 'Wed'),
    thursday: t('circles:availability.days.thu', 'Thu'),
    friday: t('circles:availability.days.fri', 'Fri'),
    saturday: t('circles:availability.days.sat', 'Sat'),
    sunday: t('circles:availability.days.sun', 'Sun'),
  };

  return (
    <div className={`availability-banner ${hasAvailability ? 'availability-banner--set' : ''} ${isExpanded ? 'availability-banner--expanded' : ''}`}>
      {/* Banner Header */}
      <div className="availability-banner-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className={`availability-banner-icon ${hasAvailability ? 'availability-banner-icon--success' : ''}`}>
          {hasAvailability ? icons.checkCircle : icons.calendar}
        </div>
        <div className="availability-banner-content">
          <h3 className="availability-banner-title">
            {hasAvailability
              ? t('circles:availability.doneTitle', 'Availability Set')
              : t('circles:availability.setTitle', 'Set Your Availability')}
          </h3>
          <p className="availability-banner-description">
            {hasAvailability
              ? t('circles:availability.doneDescription', "You've marked {{count}} time slots as available.", { count: slotCount })
              : t('circles:availability.setDescription', "Mark when you're free to meet with your circle. This helps find times that work for everyone.")}
          </p>
        </div>
        <button className="availability-banner-toggle" type="button">
          {isExpanded ? icons.chevronUp : icons.chevronDown}
          <span>{isExpanded ? t('common:buttons.close', 'Close') : t('common:edit', 'Edit')}</span>
        </button>
      </div>

      {/* Expandable Grid */}
      {isExpanded && (
        <div className="availability-banner-body">
          <div className="availability-grid-inline">
            {/* Header row with day names */}
            <div className="availability-grid-header">
              <div className="availability-time-label"></div>
              {DAYS.map(day => (
                <div key={day} className="availability-day-label">
                  {dayLabels[day]}
                </div>
              ))}
            </div>

            {/* Time rows */}
            {HOURS.map(hour => (
              <div key={hour} className="availability-grid-row">
                <div className="availability-time-label">
                  {formatHour(hour)}
                </div>
                {DAYS.map(day => (
                  <button
                    key={`${day}-${hour}`}
                    className={`availability-slot ${isSlotSelected(day, hour) ? 'availability-slot--selected' : ''}`}
                    onClick={() => toggleSlot(day, hour)}
                    type="button"
                    aria-label={`${dayLabels[day]} ${formatHour(hour)}`}
                    aria-pressed={isSlotSelected(day, hour)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="availability-banner-footer">
            <span className="availability-slot-count">
              {t('circles:availability.slotsSelected', '{{count}} slots selected', { count: selectedSlots.size })}
            </span>
            <div className="availability-banner-actions">
              {selectedSlots.size > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={handleClearAll}
                >
                  {t('circles:availability.clearAll', 'Clear All')}
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t('common:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? t('common:saving', 'Saving...') : t('circles:availability.saveButton', 'Save Availability')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
