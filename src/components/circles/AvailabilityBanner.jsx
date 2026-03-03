import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';

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
  chevronLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  chevronRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  person: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
};

// 8am to 8pm (hours 8-20)
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to format date as YYYY-MM-DD
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get today's date as YYYY-MM-DD
function getTodayKey() {
  return formatDateKey(new Date());
}

function formatHour(hour) {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour > 12) return `${hour - 12}pm`;
  return `${hour}am`;
}

// Get calendar days for a month (current month only, with empty slots for alignment)
function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay(); // 0-6 (Sun-Sat)
  const totalDays = lastDay.getDate();

  const days = [];

  // Add empty slots for alignment
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, isEmpty: true });
  }

  // Add days of current month only
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isEmpty: false });
  }

  return days;
}

export default function AvailabilityBanner({
  availability = [],
  groupAvailability = null,
  onSaveAvailability,
  isSaving = false,
  isExpanded = false,
  onToggleExpanded,
}) {
  const { t, i18n } = useTranslation(['circles', 'common']);
  const { user } = useAuth();
  const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

  // Use internal state if no external control provided
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = onToggleExpanded ? isExpanded : internalExpanded;
  const setExpanded = onToggleExpanded || setInternalExpanded;

  // Calendar state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null); // Date that's expanded to show hours
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [showMembersFor, setShowMembersFor] = useState(null); // hour24 to show members popover

  // Build lookup maps from group availability data
  const groupTotalMembers = groupAvailability?.totalMembers || 0;
  const groupDayMap = useMemo(() => {
    if (!groupAvailability?.slots) return {};
    const map = {};
    for (const slot of groupAvailability.slots) {
      if (!map[slot.date]) {
        map[slot.date] = { count: 0, names: new Set() };
      }
      if (slot.availableCount > map[slot.date].count) {
        map[slot.date].count = slot.availableCount;
      }
      (slot.availableMembers || []).forEach(name => map[slot.date].names.add(name));
    }
    // Convert sets to arrays
    for (const key of Object.keys(map)) {
      map[key].names = Array.from(map[key].names);
    }
    return map;
  }, [groupAvailability]);

  const groupHourMap = useMemo(() => {
    if (!groupAvailability?.slots) return {};
    const map = {};
    for (const slot of groupAvailability.slots) {
      const key = `${slot.date}-${slot.hour}`;
      map[key] = {
        count: slot.availableCount,
        names: slot.availableMembers || [],
      };
    }
    return map;
  }, [groupAvailability]);

  const hasAvailability = availability && availability.length > 0;
  const slotCount = availability.length;
  const todayKey = getTodayKey();

  useEffect(() => {
    if (availability.length > 0) {
      const slotKeys = availability.map(slot => `${slot.date}-${slot.hour}`);
      setSelectedSlots(new Set(slotKeys));
    }
  }, [availability]);

  // Get calendar days for current view
  const calendarDays = getCalendarDays(viewYear, viewMonth);

  // Month name for header
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString(i18n.language, {
    month: 'long',
    year: 'numeric'
  });

  // Navigate months
  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  // Check if a date has any slots selected
  function getDateSlotCount(dateKey) {
    return HOURS.filter(hour => selectedSlots.has(`${dateKey}-${hour}`)).length;
  }

  // Toggle a date's expanded state
  function handleDateClick(dateKey, isPast) {
    if (isPast) return;
    setSelectedDate(selectedDate === dateKey ? null : dateKey);
  }

  // Toggle hour slot
  function toggleSlot(hour) {
    if (!selectedDate) return;
    const key = `${selectedDate}-${hour}`;
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
    return selectedDate && selectedSlots.has(`${selectedDate}-${hour}`);
  }

  function handleSave() {
    const slots = Array.from(selectedSlots).map(key => {
      const lastDash = key.lastIndexOf('-');
      const date = key.substring(0, lastDash);
      const hour = parseInt(key.substring(lastDash + 1), 10);
      return { date, hour };
    });
    onSaveAvailability?.(slots);
    setHasChanges(false);
  }

  function handleClearDate() {
    if (!selectedDate) return;
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      HOURS.forEach(hour => {
        newSet.delete(`${selectedDate}-${hour}`);
      });
      return newSet;
    });
    setHasChanges(true);
  }

  function handleClearAll() {
    setSelectedSlots(new Set());
    setHasChanges(true);
  }

  function handleCancel() {
    const slotKeys = availability.map(slot => `${slot.date}-${slot.hour}`);
    setSelectedSlots(new Set(slotKeys));
    setHasChanges(false);
    setSelectedDate(null);
    setExpanded(false);
  }

  const currentDateSlotCount = selectedDate ? getDateSlotCount(selectedDate) : 0;

  // Format selected date for display
  const selectedDateDisplay = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(i18n.language, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // Members modal data — exclude current user
  const membersModalData = showMembersFor !== null ? groupHourMap[`${selectedDate}-${showMembersFor}`] : null;
  const allGroupMembers = groupAvailability?.members || [];
  const availableSet = membersModalData ? new Set(membersModalData.names) : new Set();
  const modalAvailableNames = membersModalData ? membersModalData.names.filter(n => n !== currentUserName) : [];
  const unavailableMembers = membersModalData ? allGroupMembers.filter(m => !availableSet.has(m) && m !== currentUserName) : [];

  return (
    <>
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
          {/* Calendar Header */}
          <div className="availability-calendar-header">
            <button
              type="button"
              className="availability-date-nav"
              onClick={goToPrevMonth}
              aria-label={t('circles:availability.previousMonth', 'Previous month')}
            >
              {icons.chevronLeft}
            </button>
            <span className="availability-month-label">{monthName}</span>
            <button
              type="button"
              className="availability-date-nav"
              onClick={goToNextMonth}
              aria-label={t('circles:availability.nextMonth', 'Next month')}
            >
              {icons.chevronRight}
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="availability-calendar-weekdays">
            {WEEKDAYS.map(day => (
              <div key={day} className="availability-weekday">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="availability-calendar-grid">
            {calendarDays.map(({ date, isEmpty }, idx) => {
              if (isEmpty) {
                return <div key={idx} className="availability-calendar-day-empty" />;
              }

              const dateKey = formatDateKey(date);
              const isPast = dateKey < todayKey;
              const isToday = dateKey === todayKey;
              const isSelected = selectedDate === dateKey;
              const slotCount = getDateSlotCount(dateKey);
              const hasSlots = slotCount > 0;
              const groupDay = !isPast ? groupDayMap[dateKey] : null;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`availability-calendar-day ${isPast ? 'past' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasSlots ? 'has-slots' : ''}`}
                  onClick={() => handleDateClick(dateKey, isPast)}
                  disabled={isPast}
                >
                  <span className="availability-day-number">{date.getDate()}</span>
                  {groupDay && groupTotalMembers > 0 && (
                    <span className="availability-day-group-count" title={groupDay.names.join(', ')}>
                      {icons.person}
                      {groupDay.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Hour Selection (when a date is selected) */}
          {selectedDate && (
            <div className="availability-hours-section">
              <div className="availability-hours-header">
                <span className="availability-selected-date">{selectedDateDisplay}</span>
                <span className="availability-date-count">
                  {t('circles:availability.dateSlots', '{{count}} slots selected for this date', { count: currentDateSlotCount })}
                </span>
              </div>
              <div className="availability-chips">
                {HOURS.map(hour => {
                  const groupHour = groupHourMap[`${selectedDate}-${hour}`];
                  const hasGroupMembers = groupHour && groupHour.names.length > 0;
                  return (
                    <div key={hour} className="availability-chip-wrapper">
                      <button
                        type="button"
                        className={`availability-chip ${isSlotSelected(hour) ? 'selected' : ''}`}
                        onClick={() => toggleSlot(hour)}
                        aria-label={`${formatHour(hour)} on ${selectedDateDisplay}`}
                        aria-pressed={isSlotSelected(hour)}
                      >
                        <span className="availability-chip-number">{hour}:00</span>
                        {hasGroupMembers && (
                          <span
                            className="availability-chip-person-icon"
                            onClick={(e) => { e.stopPropagation(); setShowMembersFor(hour); }}
                            role="button"
                            tabIndex={0}
                          >
                            {icons.person}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              {currentDateSlotCount > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={handleClearDate}
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  {t('circles:availability.clearDate', 'Clear Date')}
                </button>
              )}
            </div>
          )}

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

    <Modal
      isOpen={showMembersFor !== null && !!membersModalData}
      onClose={() => setShowMembersFor(null)}
      title={t('circles:schedule.memberAvailability', 'Member Availability')}
      size="sm"
    >
      {membersModalData && (
        <div className="members-availability-content">
          <p className="members-availability-time">
            {icons.calendar} {selectedDateDisplay} &nbsp;
            {formatHour(showMembersFor)}
          </p>

          <div className="members-availability-list">
            {modalAvailableNames.map((name) => (
              <div key={name} className="members-availability-item members-availability-item--available">
                {icons.check}
                <span>{name}</span>
              </div>
            ))}
            {unavailableMembers.map((name) => (
              <div key={name} className="members-availability-item members-availability-item--unavailable">
                {icons.x}
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <ModalFooter>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowMembersFor(null)}
        >
          {t('common:close', 'Close')}
        </button>
      </ModalFooter>
    </Modal>
    </>
  );
}
