import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { circlesApi } from '@/features/circles/circlesApi';

const icons = {
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
      <line x1="16" x2="16" y1="2" y2="6"></line>
      <line x1="8" x2="8" y1="2" y2="6"></line>
      <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  alertCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" x2="12" y1="8" y2="12"></line>
      <line x1="12" x2="12.01" y1="16" y2="16"></line>
    </svg>
  ),
  link: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

function normalizeUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getNextDateForDayOfWeek(dayOfWeek, weeksAhead = 0) {
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntil = dayOfWeek - currentDay;

  if (daysUntil < 0 || (daysUntil === 0 && weeksAhead === 0)) {
    daysUntil += 7;
  }

  daysUntil += weeksAhead * 7;

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntil);
  return targetDate;
}

function convertSlotsToUpcomingDates(slots, weeksToShow = 2) {
  const upcomingSlots = [];

  for (let week = 0; week < weeksToShow; week++) {
    for (const slot of slots) {
      const date = getNextDateForDayOfWeek(slot.day, week);
      const dateStr = date.toISOString().split('T')[0];
      upcomingSlots.push({
        date: dateStr,
        day: slot.day,
        hour: slot.hour,
        availableCount: slot.availableCount,
        availableMembers: slot.availableMembers || [],
        dateObj: date,
      });
    }
  }

  upcomingSlots.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.hour - b.hour;
  });

  return upcomingSlots;
}

function formatSlotDate(slot) {
  const date = new Date(slot.date);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatHour(hour) {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  group,
  onSchedule,
}) {
  const { t } = useTranslation(['circles', 'common']);
  const [allSlots, setAllSlots] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [membersModalSlot, setMembersModalSlot] = useState(null);

  useEffect(() => {
    if (isOpen && group?.id) {
      loadAvailability();
      setMeetingTitle(t('circles:schedule.defaultTitle', 'Circle Discussion'));
      setSelectedSlot(null);
      setMeetingLink('');
      setMembersModalSlot(null);
    }
  }, [isOpen, group?.id]);

  async function loadAvailability() {
    setIsLoading(true);
    try {
      const result = await circlesApi.getGroupAvailability(group.id);
      if (result.success) {
        const weeklySlots = result.data.slots || [];
        const members = result.data.totalMembers || group?.members?.length || 5;
        const memberNames = result.data.members || [];
        const upcomingSlots = convertSlotsToUpcomingDates(weeklySlots, 2);
        setAllSlots(upcomingSlots);
        setAllMembers(memberNames);
        setTotalMembers(members);
      }
    } catch (error) {
      setAllSlots([]);
      setAllMembers([]);
      setTotalMembers(0);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSchedule() {
    if (!selectedSlot || !meetingTitle.trim()) return;

    setIsScheduling(true);
    try {
      const timezone = getUserTimezone();
      await onSchedule?.({
        groupId: group.id,
        title: meetingTitle.trim(),
        scheduledAt: `${selectedSlot.date}T${String(selectedSlot.hour).padStart(2, '0')}:00:00`,
        duration: 60,
        meetingLink: normalizeUrl(meetingLink),
        timezone,
      });
      onClose();
    } finally {
      setIsScheduling(false);
    }
  }

  function showMembersModal(e, slot) {
    e.stopPropagation();
    setMembersModalSlot(slot);
  }

  if (!group) return null;

  const hasSlots = allSlots.length > 0;

  // Get unavailable members for the members modal
  const availableSet = membersModalSlot ? new Set(membersModalSlot.availableMembers) : new Set();
  const unavailableMembers = membersModalSlot ? allMembers.filter(m => !availableSet.has(m)) : [];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('circles:schedule.title', 'Schedule Meeting')}
        size="md"
      >
        <div className="schedule-meeting-content">
          <p className="schedule-meeting-subtitle">
            {t('circles:schedule.for', 'For: {{groupName}}', { groupName: group.name })}
          </p>

          {isLoading ? (
            <div className="schedule-meeting-loading">
              <div className="loading-spinner"></div>
              <p>{t('common:loading', 'Loading...')}</p>
            </div>
          ) : !hasSlots ? (
            <div className="schedule-meeting-no-availability">
              {icons.alertCircle}
              <h4>{t('circles:schedule.noAvailability', 'No Common Availability')}</h4>
              <p>
                {t('circles:schedule.noAvailabilityDesc', 'There are no time slots where members are available. Ask members to update their availability.')}
              </p>
            </div>
          ) : (
            <>
              <div className="schedule-meeting-field">
                <label htmlFor="meeting-title">
                  {t('circles:schedule.meetingTitle', 'Meeting Title')}
                </label>
                <input
                  type="text"
                  id="meeting-title"
                  className="schedule-meeting-input"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder={t('circles:schedule.defaultTitle', 'Circle Discussion')}
                />
              </div>

              <div className="schedule-meeting-field">
                <label htmlFor="meeting-link">
                  {t('circles:schedule.meetingLink', 'Meeting Link')}
                  <span className="schedule-meeting-optional">
                    {t('common:optional', '(optional)')}
                  </span>
                </label>
                <div className="schedule-meeting-input-wrapper">
                  <span className="schedule-meeting-input-icon">{icons.link}</span>
                  <input
                    type="url"
                    id="meeting-link"
                    className="schedule-meeting-input schedule-meeting-input--with-icon"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder={t('circles:schedule.meetingLinkPlaceholder', 'https://zoom.us/j/... or https://meet.google.com/...')}
                  />
                </div>
              </div>

              <div className="schedule-meeting-field">
                <label>
                  {t('circles:schedule.selectTime', 'Select a Time')}
                </label>

                <div className="schedule-meeting-slots">
                  {allSlots.map((slot) => {
                    const slotKey = `${slot.date}-${slot.hour}`;
                    const isSelected = selectedSlot &&
                      selectedSlot.date === slot.date &&
                      selectedSlot.hour === slot.hour;

                    return (
                      <button
                        key={slotKey}
                        type="button"
                        className={`schedule-meeting-slot ${isSelected ? 'schedule-meeting-slot--selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <span className="schedule-meeting-slot-date">
                          {icons.calendar}
                          {formatSlotDate(slot)}
                        </span>
                        <span className="schedule-meeting-slot-time">
                          {icons.clock}
                          {formatHour(slot.hour)}
                        </span>
                        <span
                          className="schedule-meeting-slot-availability"
                          onClick={(e) => showMembersModal(e, slot)}
                          role="button"
                          tabIndex={0}
                          title={t('circles:schedule.clickToSeeMembers', 'Click to see members')}
                        >
                          {icons.users}
                          {slot.availableCount}/{totalMembers}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <ModalFooter>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isScheduling}
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSchedule}
            disabled={!hasSlots || !selectedSlot || !meetingTitle.trim() || isScheduling}
          >
            {isScheduling ? t('common:creating', 'Creating...') : t('circles:schedule.scheduleButton', 'Schedule')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Members availability modal */}
      <Modal
        isOpen={!!membersModalSlot}
        onClose={() => setMembersModalSlot(null)}
        title={t('circles:schedule.memberAvailability', 'Member Availability')}
        size="sm"
      >
        {membersModalSlot && (
          <div className="members-availability-content">
            <p className="members-availability-time">
              {icons.calendar} {formatSlotDate(membersModalSlot)} &nbsp;
              {icons.clock} {formatHour(membersModalSlot.hour)}
            </p>

            <div className="members-availability-list">
              {membersModalSlot.availableMembers.map((name) => (
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
            onClick={() => setMembersModalSlot(null)}
          >
            {t('common:close', 'Close')}
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
