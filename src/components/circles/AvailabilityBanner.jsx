import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_TO_NUMBER = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const NUMBER_TO_DAY = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour) {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour > 12) return `${hour - 12}pm`;
  return `${hour}am`;
}

export default function AvailabilityBanner({
  availability = [],
  onSaveAvailability,
  isSaving = false,
  isExpanded = false,
  onToggleExpanded,
}) {
  const { t } = useTranslation(['circles', 'common']);

  // Use internal state if no external control provided
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = onToggleExpanded ? isExpanded : internalExpanded;
  const setExpanded = onToggleExpanded || setInternalExpanded;
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const hasAvailability = availability && availability.length > 0;
  const slotCount = availability.length;

  useEffect(() => {
    if (availability.length > 0) {
      const slotKeys = availability.map(slot => {
        const dayName = NUMBER_TO_DAY[slot.day] || 'monday';
        return `${dayName}-${slot.hour}`;
      });
      setSelectedSlots(new Set(slotKeys));
    }
  }, [availability]);

  function toggleSlot(hour) {
    const key = `${selectedDay}-${hour}`;
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

  function isSlotSelected(hour) {
    return selectedSlots.has(`${selectedDay}-${hour}`);
  }

  function handleSave() {
    const slots = Array.from(selectedSlots).map(key => {
      const [dayName, hour] = key.split('-');
      return { day: DAY_TO_NUMBER[dayName], hour: parseInt(hour, 10) };
    });
    onSaveAvailability?.(slots);
    setHasChanges(false);
  }

  function handleClearAll() {
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      HOURS.forEach(hour => {
        newSet.delete(`${selectedDay}-${hour}`);
      });
      return newSet;
    });
    setHasChanges(true);
  }

  function handleClearAllDays() {
    setSelectedSlots(new Set());
    setHasChanges(true);
  }

  function handleCancel() {
    const slotKeys = availability.map(slot => {
      const dayName = NUMBER_TO_DAY[slot.day] || 'monday';
      return `${dayName}-${slot.hour}`;
    });
    setSelectedSlots(new Set(slotKeys));
    setHasChanges(false);
    setExpanded(false);
  }

  const currentDaySlotCount = HOURS.filter(hour =>
    selectedSlots.has(`${selectedDay}-${hour}`)
  ).length;

  function getDaySlotCount(day) {
    return HOURS.filter(hour => selectedSlots.has(`${day}-${hour}`)).length;
  }

  const shortDayNames = {
    monday: t('circles:availability.days.mon', 'Mon'),
    tuesday: t('circles:availability.days.tue', 'Tue'),
    wednesday: t('circles:availability.days.wed', 'Wed'),
    thursday: t('circles:availability.days.thu', 'Thu'),
    friday: t('circles:availability.days.fri', 'Fri'),
    saturday: t('circles:availability.days.sat', 'Sat'),
    sunday: t('circles:availability.days.sun', 'Sun'),
  };

  const dayNames = {
    sunday: t('circles:availability.days.sunday', 'Sunday'),
    monday: t('circles:availability.days.monday', 'Monday'),
    tuesday: t('circles:availability.days.tuesday', 'Tuesday'),
    wednesday: t('circles:availability.days.wednesday', 'Wednesday'),
    thursday: t('circles:availability.days.thursday', 'Thursday'),
    friday: t('circles:availability.days.friday', 'Friday'),
    saturday: t('circles:availability.days.saturday', 'Saturday'),
  };

  return (
    <div className={`availability-banner ${hasAvailability ? 'availability-banner--set' : ''} ${expanded ? 'availability-banner--expanded' : ''}`}>
      <div className="availability-banner-header" onClick={() => setExpanded(!expanded)}>
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
          {expanded ? icons.chevronUp : icons.chevronDown}
          <span>{expanded ? t('common:buttons.close', 'Close') : t('common:edit', 'Edit')}</span>
        </button>
      </div>

      {expanded && (
        <div className="availability-banner-body">
          <div className="availability-day-boxes">
            {DAYS_ORDER.map(day => {
              const dayHasSlots = getDaySlotCount(day) > 0;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  className={`availability-day-box ${isSelected ? 'active' : ''} ${dayHasSlots ? 'has-slots' : ''}`}
                  onClick={() => setSelectedDay(day)}
                  aria-label={`${dayNames[day]}${dayHasSlots ? ` - ${getDaySlotCount(day)} slots selected` : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className="availability-day-box-label">{dayNames[day]}</span>
                </button>
              );
            })}
          </div>

          <div className="availability-day-info">
            <span className="availability-day-name">{dayNames[selectedDay]}</span>
            <span className="availability-day-count">
              {t('circles:availability.daySlots', '{{count}} selected', { count: currentDaySlotCount })}
            </span>
          </div>

          <div className="availability-chips">
            {HOURS.map(hour => (
              <button
                key={hour}
                type="button"
                className={`availability-chip ${isSlotSelected(hour) ? 'selected' : ''}`}
                onClick={() => toggleSlot(hour)}
                aria-label={`${formatHour(hour)} on ${dayNames[selectedDay]}`}
                aria-pressed={isSlotSelected(hour)}
              >
                {formatHour(hour)}
              </button>
            ))}
          </div>

          <div className="availability-banner-footer">
            <span className="availability-slot-count">
              {t('circles:availability.slotsSelected', '{{count}} slots selected', { count: selectedSlots.size })}
            </span>
            <div className="availability-banner-actions">
              {currentDaySlotCount > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={handleClearAll}
                >
                  {t('circles:availability.clearDay', 'Clear Day')}
                </button>
              )}
              {selectedSlots.size > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={handleClearAllDays}
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
