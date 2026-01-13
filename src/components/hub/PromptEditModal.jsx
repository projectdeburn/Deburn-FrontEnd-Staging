/**
 * PromptEditModal Component
 * Modal for editing system prompts
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PromptEditModal({ language, promptName, content, onSave, onClose }) {
  const { t } = useTranslation(['hub', 'common']);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(language, promptName, editedContent);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="hub-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hub-modal">
        <div className="hub-modal-header">
          <h3>
            {t('hub:prompts.editTitle', 'Edit Prompt')}: {promptName} ({language.toUpperCase()})
          </h3>
          <button className="hub-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="hub-modal-body">
          <textarea
            className="hub-prompt-editor"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={15}
          />
        </div>
        <div className="hub-modal-footer">
          <button className="hub-btn" onClick={onClose}>
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            className="hub-btn hub-btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('common:saving') : t('common:saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
