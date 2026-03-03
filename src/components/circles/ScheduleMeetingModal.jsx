import { useState, useEffect, useMemo } from 'react';
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

function filterAndSortSlots(slots) {
  const today = new Date().toISOString().split('T')[0];

  const filteredSlots = slots.filter(slot => {
    // Show slots where at least 1 member is available
    if (slot.availableCount < 1) return false;
    // Skip past dates
    if (slot.date < today) return false;
    return true;
  });

  // Sort by date first, then by hour, then by availability count (descending)
  filteredSlots.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.hour !== b.hour) return a.hour - b.hour;
    return b.availableCount - a.availableCount;
  });

  return filteredSlots.map(slot => ({
    date: slot.date,
    hour: slot.hour,
    availableCount: slot.availableCount,
    availableMembers: slot.availableMembers || [],
  }));
}

function formatSlotDate(slot) {
  const date = new Date(slot.date + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDayHeader(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  group,
  onSchedule,
  onMeetingCancelled,
}) {
  const { t } = useTranslation(['circles', 'common']);
  const [allSlots, setAllSlots] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [existingMeetings, setExistingMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [recurrence, setRecurrence] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [membersModalSlot, setMembersModalSlot] = useState(null);

  // Group slots by date for day-grouped layout
  const slotsByDay = useMemo(() => {
    const groups = {};
    for (const slot of allSlots) {
      if (!groups[slot.date]) {
        groups[slot.date] = [];
      }
      groups[slot.date].push(slot);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [allSlots]);

  useEffect(() => {
    if (isOpen && group?.id) {
      loadAvailability();
      setMeetingTitle(t('circles:schedule.defaultTitle', 'Circle Discussion'));
      setSelectedSlot(null);
      setMeetingLink('');
      setRecurrence(false);
      setFrequency('weekly');
      setMembersModalSlot(null);
    }
  }, [isOpen, group?.id]);

  async function loadAvailability() {
    setIsLoading(true);
    try {
      const [availResult, meetingsResult] = await Promise.all([
        circlesApi.getGroupAvailability(group.id),
        circlesApi.getGroupMeetings(group.id),
      ]);

      if (availResult.success) {
        const rawSlots = availResult.data.slots || [];
        const members = availResult.data.totalMembers || group?.members?.length || 5;
        const memberNames = availResult.data.members || [];
        const filteredSlots = filterAndSortSlots(rawSlots);
        setAllSlots(filteredSlots);
        setAllMembers(memberNames);
        setTotalMembers(members);
      }

      if (meetingsResult.success) {
        setExistingMeetings(meetingsResult.data.meetings || []);
      }
    } catch (error) {
      setAllSlots([]);
      setAllMembers([]);
      setTotalMembers(0);
      setExistingMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }

  function getBookedMeeting(slot) {
    return existingMeetings.find(meeting => {
      if (!meeting.scheduledAt) return false;
      if (meeting.status === 'cancelled') return false;
      const meetingDate = new Date(meeting.scheduledAt);
      const meetingDateStr = meetingDate.toISOString().split('T')[0];
      const meetingHour = meetingDate.getHours();
      return meetingDateStr === slot.date && meetingHour === slot.hour;
    });
  }

  async function handleCancelMeeting(e, meetingId) {
    e.stopPropagation();
    setIsCancelling(meetingId);
    try {
      await circlesApi.cancelMeeting(meetingId);
      await loadAvailability();
      onMeetingCancelled?.();
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
    } finally {
      setIsCancelling(null);
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
        availableMembers: selectedSlot.availableMembers || [],
        recurrence,
        frequency: recurrence ? frequency : undefined,
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
              <h4>{t('circles:schedule.noAvailability', 'No Availability Yet')}</h4>
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
                  <span className="schedule-meeting-required">*</span>
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
                    required
                  />
                </div>
                <p className="schedule-meeting-hint">
                  {t('circles:schedule.meetingLinkHint', 'Add a Zoom, Google Meet, or Teams link for your circle to join')}
                </p>
              </div>

              <div className="schedule-meeting-recurrence">
                <label className="schedule-meeting-toggle-label">
                  <input
                    type="checkbox"
                    checked={recurrence}
                    onChange={(e) => setRecurrence(e.target.checked)}
                  />
                  <span>{t('circles:schedule.recurringMeeting', 'Recurring meeting')}</span>
                </label>
                {recurrence && (
                  <select
                    className="schedule-meeting-select"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="weekly">{t('circles:schedule.weekly', 'Weekly')}</option>
                    <option value="biweekly">{t('circles:schedule.biweekly', 'Bi-weekly')}</option>
                    <option value="monthly">{t('circles:schedule.monthly', 'Monthly')}</option>
                  </select>
                )}
              </div>

              <div className="schedule-meeting-field">
                <label>
                  {t('circles:schedule.selectTime', 'Select a Time')}
                </label>

                <div className="schedule-meeting-days">
                  {slotsByDay.map(([dateStr, daySlots]) => (
                    <div key={dateStr} className="schedule-meeting-day-group">
                      <div className="schedule-meeting-day-header">
                        <span>{formatDayHeader(dateStr)}</span>
                        <span className="schedule-meeting-day-count">
                          {t('circles:schedule.slotsCount', '{{count}} slots', { count: daySlots.length })}
                        </span>
                      </div>
                      <div className="schedule-meeting-day-slots">
                        {daySlots.map((slot) => {
                          const slotKey = `${slot.date}-${slot.hour}`;
                          const isSelected = selectedSlot &&
                            selectedSlot.date === slot.date &&
                            selectedSlot.hour === slot.hour;
                          const bookedMeeting = getBookedMeeting(slot);
                          const isBooked = !!bookedMeeting;
                          const densityPct = totalMembers > 0 ? (slot.availableCount / totalMembers) * 100 : 0;
                          const firstNames = (slot.availableMembers || []).slice(0, 3).map(n => n.split(' ')[0]);
                          const moreCount = (slot.availableMembers || []).length - 3;

                          if (isBooked) {
                            return (
                              <div
                                key={slotKey}
                                className="schedule-slot-card booked"
                              >
                                <div className="schedule-slot-card-time">
                                  {icons.clock}
                                  <span>{slot.hour}:00</span>
                                </div>
                                <div className="schedule-slot-card-bar" style={{ width: `${densityPct}%` }} />
                                <div className="schedule-slot-card-booked-row">
                                  <span className="schedule-slot-card-booked-label">
                                    {t('circles:schedule.booked', 'Booked')}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn-link-underline"
                                    onClick={(e) => handleCancelMeeting(e, bookedMeeting.id)}
                                    disabled={isCancelling === bookedMeeting.id}
                                  >
                                    {isCancelling === bookedMeeting.id
                                      ? '...'
                                      : t('circles:groups.cancel', 'Cancel')}
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={slotKey}
                              type="button"
                              className={`schedule-slot-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <div className="schedule-slot-card-time">
                                {icons.clock}
                                <span>{slot.hour}:00</span>
                                <span
                                  className="schedule-slot-card-count"
                                  onClick={(e) => showMembersModal(e, slot)}
                                  role="button"
                                  tabIndex={0}
                                  title={t('circles:schedule.clickToSeeMembers', 'Click to see members')}
                                >
                                  {icons.users}
                                  {slot.availableCount}/{totalMembers}
                                </span>
                              </div>
                              <div className="schedule-slot-card-bar" style={{ width: `${densityPct}%` }} />
                              {firstNames.length > 0 && (
                                <div className="schedule-slot-card-names">
                                  {firstNames.map(name => (
                                    <span key={name} className="schedule-slot-card-name">{name}</span>
                                  ))}
                                  {moreCount > 0 && (
                                    <span className="schedule-slot-card-name schedule-slot-card-name--more">+{moreCount}</span>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
            disabled={!hasSlots || !selectedSlot || !meetingTitle.trim() || !meetingLink.trim() || isScheduling}
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
              {icons.clock} {membersModalSlot.hour}:00
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
