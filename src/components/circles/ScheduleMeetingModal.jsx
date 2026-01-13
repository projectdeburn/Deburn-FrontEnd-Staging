/**
 * ScheduleMeetingModal Component
 * For scheduling a new circle meeting based on common availability
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { circlesApi } from '@/features/circles/circlesApi';

// SVG Icons
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
};

function formatSlotDate(slot) {
  const date = new Date(slot.date);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatHour(hour) {
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
  const [commonAvailability, setCommonAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');

  useEffect(() => {
    if (isOpen && group?.id) {
      loadCommonAvailability();
      setMeetingTitle(t('circles:schedule.defaultTitle', 'Circle Discussion'));
      setSelectedSlot(null);
    }
  }, [isOpen, group?.id]);

  async function loadCommonAvailability() {
    setIsLoading(true);
    try {
      const result = await circlesApi.getGroupAvailability(group.id);
      if (result.success) {
        setCommonAvailability(result.data.slots || []);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSchedule() {
    if (!selectedSlot || !meetingTitle.trim()) return;

    setIsScheduling(true);
    try {
      await onSchedule?.({
        groupId: group.id,
        title: meetingTitle.trim(),
        scheduledAt: `${selectedSlot.date}T${String(selectedSlot.hour).padStart(2, '0')}:00:00`,
      });
      onClose();
    } finally {
      setIsScheduling(false);
    }
  }

  if (!group) return null;

  const hasAvailability = commonAvailability.length > 0;

  return (
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
        ) : !hasAvailability ? (
          <div className="schedule-meeting-no-availability">
            {icons.alertCircle}
            <h4>{t('circles:schedule.noAvailability', 'No Common Availability')}</h4>
            <p>
              {t('circles:schedule.noAvailabilityDesc', 'There are no time slots where all members are available. Ask members to update their availability.')}
            </p>
          </div>
        ) : (
          <>
            {/* Meeting Title */}
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

            {/* Available Slots */}
            <div className="schedule-meeting-field">
              <label>
                {t('circles:schedule.selectTime', 'Select a Time')}
              </label>
              <div className="schedule-meeting-slots">
                {commonAvailability.map((slot, index) => {
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
                      {slot.availableCount && (
                        <span className="schedule-meeting-slot-count">
                          {t('circles:schedule.available', '{{count}} available', { count: slot.availableCount })}
                        </span>
                      )}
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
          disabled={!hasAvailability || !selectedSlot || !meetingTitle.trim() || isScheduling}
        >
          {isScheduling ? t('common:creating', 'Creating...') : t('circles:schedule.scheduleButton', 'Schedule')}
        </button>
      </ModalFooter>
    </Modal>
  );
}
