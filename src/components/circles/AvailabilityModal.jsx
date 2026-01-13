/**
 * AvailabilityModal Component
 * Weekly time grid for selecting available meeting slots
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from '@/components/ui/Modal';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9am - 5pm

function formatHour(hour) {
  if (hour === 12) return '12pm';
  if (hour > 12) return `${hour - 12}pm`;
  return `${hour}am`;
}

export default function AvailabilityModal({
  isOpen,
  onClose,
  onSave,
  initialSlots = [],
  isSaving = false,
}) {
  const { t } = useTranslation(['circles', 'common']);
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  // Initialize with existing slots
  useEffect(() => {
    if (isOpen && initialSlots.length > 0) {
      const slotKeys = initialSlots.map(slot => `${slot.day}-${slot.hour}`);
      setSelectedSlots(new Set(slotKeys));
    } else if (isOpen) {
      setSelectedSlots(new Set());
    }
  }, [isOpen, initialSlots]);

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
  }

  function isSlotSelected(day, hour) {
    return selectedSlots.has(`${day}-${hour}`);
  }

  function handleSave() {
    // Convert Set back to array of {day, hour} objects
    const slots = Array.from(selectedSlots).map(key => {
      const [day, hour] = key.split('-');
      return { day, hour: parseInt(hour, 10) };
    });
    onSave?.(slots);
  }

  function handleClearAll() {
    setSelectedSlots(new Set());
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('circles:availability.modalTitle', 'Set Your Availability')}
      size="lg"
    >
      <div className="availability-modal-content">
        <p className="availability-modal-description">
          {t('circles:availability.modalDescription', 'Select the times you are typically available for circle meetings. Your availability helps find meeting times that work for everyone.')}
        </p>

        <div className="availability-grid-wrapper">
          <div className="availability-grid">
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
        </div>

        <div className="availability-modal-summary">
          <span className="availability-modal-count">
            {t('circles:availability.slotsSelected', '{{count}} slots selected', { count: selectedSlots.size })}
          </span>
          {selectedSlots.size > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={handleClearAll}
            >
              {t('circles:availability.clearAll', 'Clear All')}
            </button>
          )}
        </div>
      </div>

      <ModalFooter>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={isSaving}
        >
          {t('common:cancel', 'Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? t('common:saving', 'Saving...') : t('circles:availability.saveButton', 'Save Availability')}
        </button>
      </ModalFooter>
    </Modal>
  );
}
