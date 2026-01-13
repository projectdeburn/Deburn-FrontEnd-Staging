/**
 * ContentModal Component
 * Create/Edit content modal with type-specific fields
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const COACH_TOPICS = [
  'delegation', 'stress', 'team_dynamics', 'communication', 'leadership',
  'time_management', 'conflict', 'burnout', 'motivation', 'decision_making',
  'mindfulness', 'resilience'
];

const CATEGORIES = ['leadership', 'breath', 'meditation', 'burnout', 'wellbeing', 'other'];
const CONTENT_TYPES = ['text_article', 'audio_article', 'audio_exercise', 'video_link'];
const STATUSES = ['draft', 'in_review', 'published', 'archived'];

export default function ContentModal({ mode, item, onSave, onClose }) {
  const { t } = useTranslation(['hub', 'common']);
  const isEdit = mode === 'edit';
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    contentType: item?.contentType || 'text_article',
    category: item?.category || 'leadership',
    status: item?.status || 'draft',
    titleEn: item?.titleEn || '',
    titleSv: item?.titleSv || '',
    lengthMinutes: item?.lengthMinutes || '',
    relatedFramework: item?.relatedFramework || '',
    purpose: item?.purpose || '',
    outcome: item?.outcome || '',
    coachTopics: item?.coachTopics || [],
    coachPriority: item?.coachPriority || 0,
    coachEnabled: item?.coachEnabled !== false,
    textContentEn: item?.textContentEn || '',
    textContentSv: item?.textContentSv || '',
    videoUrl: item?.videoUrl || '',
    videoEmbedCode: item?.videoEmbedCode || '',
    videoAvailableInEn: item?.videoAvailableInEn || false,
    videoAvailableInSv: item?.videoAvailableInSv || false,
    voiceoverScriptEn: item?.voiceoverScriptEn || '',
    voiceoverScriptSv: item?.voiceoverScriptSv || '',
    ttsSpeed: item?.ttsSpeed || 1.0,
    ttsVoice: item?.ttsVoice || 'Aria',
  });

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleTopicToggle(topic) {
    setFormData((prev) => {
      const topics = prev.coachTopics.includes(topic)
        ? prev.coachTopics.filter((t) => t !== topic)
        : [...prev.coachTopics, topic];
      return { ...prev, coachTopics: topics };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.titleEn.trim()) {
      alert(t('hub:content.error.titleRequired', 'English title is required'));
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        lengthMinutes: formData.lengthMinutes ? parseFloat(formData.lengthMinutes) : null,
        coachPriority: parseInt(formData.coachPriority) || 0,
        titleSv: formData.titleSv || null,
        relatedFramework: formData.relatedFramework || null,
        purpose: formData.purpose || null,
        outcome: formData.outcome || null,
        textContentEn: formData.textContentEn || null,
        textContentSv: formData.textContentSv || null,
        videoUrl: formData.videoUrl || null,
        videoEmbedCode: formData.videoEmbedCode || null,
        voiceoverScriptEn: formData.voiceoverScriptEn || null,
        voiceoverScriptSv: formData.voiceoverScriptSv || null,
      };
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  }

  const isAudioType = formData.contentType === 'audio_article' || formData.contentType === 'audio_exercise';

  return (
    <div className="hub-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hub-modal hub-modal-large">
        <div className="hub-modal-header">
          <h3>
            {isEdit
              ? t('hub:content.modal.editTitle', 'Edit Content Item')
              : t('hub:content.modal.createTitle', 'Create Content Item')}
          </h3>
          <button className="hub-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="hub-modal-body">
          <form id="content-form" className="hub-form" onSubmit={handleSubmit}>
            {/* Type, Category, Status */}
            <div className="hub-form-row">
              <div className="hub-form-group">
                <label className="hub-label">{t('hub:content.form.contentType', 'Content Type')} *</label>
                <select
                  className="hub-select"
                  value={formData.contentType}
                  onChange={(e) => handleChange('contentType', e.target.value)}
                >
                  <option value="text_article">Text Article</option>
                  <option value="audio_article">Audio Article</option>
                  <option value="audio_exercise">Audio Exercise</option>
                  <option value="video_link">Video Link</option>
                </select>
              </div>
              <div className="hub-form-group">
                <label className="hub-label">{t('hub:content.form.category', 'Category')}</label>
                <select
                  className="hub-select"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="hub-form-group">
                <label className="hub-label">{t('hub:content.form.status', 'Status')}</label>
                <select
                  className="hub-select"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Titles */}
            <div className="hub-form-group">
              <label className="hub-label">{t('hub:content.form.titleEn', 'Title (English)')} *</label>
              <input
                type="text"
                className="hub-input"
                value={formData.titleEn}
                onChange={(e) => handleChange('titleEn', e.target.value)}
                required
              />
            </div>
            <div className="hub-form-group">
              <label className="hub-label">{t('hub:content.form.titleSv', 'Title (Swedish)')}</label>
              <input
                type="text"
                className="hub-input"
                value={formData.titleSv}
                onChange={(e) => handleChange('titleSv', e.target.value)}
              />
            </div>

            {/* Length and Framework */}
            <div className="hub-form-row">
              <div className="hub-form-group">
                <label className="hub-label">{t('hub:content.form.length', 'Length (minutes)')}</label>
                <input
                  type="number"
                  className="hub-input"
                  value={formData.lengthMinutes}
                  onChange={(e) => handleChange('lengthMinutes', e.target.value)}
                  step="0.5"
                />
              </div>
              <div className="hub-form-group">
                <label className="hub-label">{t('hub:content.form.framework', 'Related Framework')}</label>
                <input
                  type="text"
                  className="hub-input"
                  value={formData.relatedFramework}
                  onChange={(e) => handleChange('relatedFramework', e.target.value)}
                  placeholder="e.g., Burnout Recovery"
                />
              </div>
            </div>

            {/* Purpose and Outcome */}
            <div className="hub-form-group">
              <label className="hub-label">{t('hub:content.form.purpose', 'Purpose')}</label>
              <textarea
                className="hub-textarea"
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                rows={2}
              />
            </div>
            <div className="hub-form-group">
              <label className="hub-label">{t('hub:content.form.outcome', 'Desired Outcome')}</label>
              <textarea
                className="hub-textarea"
                value={formData.outcome}
                onChange={(e) => handleChange('outcome', e.target.value)}
                rows={2}
              />
            </div>

            {/* Coach Topics */}
            <div className="hub-form-group">
              <label className="hub-label">
                {t('hub:content.form.coachTopics', 'Coach Topics (for Ask Eve recommendations)')}
              </label>
              <div className="hub-checkbox-grid">
                {COACH_TOPICS.map((topic) => (
                  <label key={topic} className="hub-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.coachTopics.includes(topic)}
                      onChange={() => handleTopicToggle(topic)}
                    />
                    {topic.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>

            {/* Coach Priority and Enable */}
            <div className="hub-form-row">
              <div className="hub-form-group">
                <label className="hub-label">
                  {t('hub:content.form.priority', 'Coach Priority (0-10, higher = more recommended)')}
                </label>
                <input
                  type="number"
                  className="hub-input"
                  value={formData.coachPriority}
                  onChange={(e) => handleChange('coachPriority', e.target.value)}
                  min="0"
                  max="10"
                />
              </div>
              <div className="hub-form-group">
                <label className="hub-checkbox-label" style={{ marginTop: '28px' }}>
                  <input
                    type="checkbox"
                    checked={formData.coachEnabled}
                    onChange={(e) => handleChange('coachEnabled', e.target.checked)}
                  />
                  {t('hub:content.form.enableCoach', 'Enable for coach recommendations')}
                </label>
              </div>
            </div>

            {/* Text Content Section */}
            {formData.contentType === 'text_article' && (
              <div className="hub-form-section">
                <h4 className="hub-form-section-title">{t('hub:content.form.textContent', 'Text Content')}</h4>
                <div className="hub-form-group">
                  <label className="hub-label">{t('hub:content.form.contentEn', 'Content (English)')}</label>
                  <textarea
                    className="hub-textarea"
                    value={formData.textContentEn}
                    onChange={(e) => handleChange('textContentEn', e.target.value)}
                    rows={6}
                    placeholder="Article content in English..."
                  />
                </div>
                <div className="hub-form-group">
                  <label className="hub-label">{t('hub:content.form.contentSv', 'Content (Swedish)')}</label>
                  <textarea
                    className="hub-textarea"
                    value={formData.textContentSv}
                    onChange={(e) => handleChange('textContentSv', e.target.value)}
                    rows={6}
                    placeholder="Article content in Swedish..."
                  />
                </div>
              </div>
            )}

            {/* Audio Section */}
            {isAudioType && (
              <>
                <div className="hub-form-section">
                  <h4 className="hub-form-section-title">{t('hub:content.form.voiceover', 'Voiceover Script')}</h4>
                  <p className="hub-helper-text">
                    Insert pauses: <code>&lt;break time="1s" /&gt;</code> or <code>--</code> (em-dash)
                  </p>
                  <div className="hub-form-group">
                    <label className="hub-label">{t('hub:content.form.scriptEn', 'Script (English)')}</label>
                    <textarea
                      className="hub-textarea"
                      value={formData.voiceoverScriptEn}
                      onChange={(e) => handleChange('voiceoverScriptEn', e.target.value)}
                      rows={6}
                      placeholder="Enter the voiceover script for English audio..."
                    />
                  </div>
                  <div className="hub-form-group">
                    <label className="hub-label">{t('hub:content.form.scriptSv', 'Script (Swedish)')}</label>
                    <textarea
                      className="hub-textarea"
                      value={formData.voiceoverScriptSv}
                      onChange={(e) => handleChange('voiceoverScriptSv', e.target.value)}
                      rows={6}
                      placeholder="Enter the voiceover script for Swedish audio..."
                    />
                  </div>
                </div>

                <div className="hub-form-section">
                  <h4 className="hub-form-section-title">{t('hub:content.form.ttsSettings', 'TTS Generation Settings')}</h4>
                  <div className="hub-form-row">
                    <div className="hub-form-group">
                      <label className="hub-label">{t('hub:content.form.speed', 'Speech Speed')}</label>
                      <select
                        className="hub-select"
                        value={formData.ttsSpeed}
                        onChange={(e) => handleChange('ttsSpeed', parseFloat(e.target.value))}
                      >
                        <option value="0.7">0.7x (Slow - Meditation)</option>
                        <option value="0.85">0.85x (Relaxed)</option>
                        <option value="1.0">1.0x (Normal)</option>
                        <option value="1.1">1.1x (Slightly Fast)</option>
                        <option value="1.2">1.2x (Fast)</option>
                      </select>
                    </div>
                    <div className="hub-form-group">
                      <label className="hub-label">{t('hub:content.form.voice', 'Voice')}</label>
                      <select
                        className="hub-select"
                        value={formData.ttsVoice}
                        onChange={(e) => handleChange('ttsVoice', e.target.value)}
                      >
                        <option value="Aria">Aria (Female)</option>
                        <option value="Sarah">Sarah (Female)</option>
                        <option value="Alice">Alice (Female, British)</option>
                        <option value="George">George (Male, British)</option>
                        <option value="Brian">Brian (Male)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Video Section */}
            {formData.contentType === 'video_link' && (
              <div className="hub-form-section">
                <h4 className="hub-form-section-title">{t('hub:content.form.video', 'Video')}</h4>
                <div className="hub-form-group">
                  <label className="hub-label">{t('hub:content.form.videoUrl', 'Video URL')}</label>
                  <input
                    type="url"
                    className="hub-input"
                    value={formData.videoUrl}
                    onChange={(e) => handleChange('videoUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="hub-form-group">
                  <label className="hub-label">{t('hub:content.form.embedCode', 'Embed Code')}</label>
                  <textarea
                    className="hub-textarea"
                    value={formData.videoEmbedCode}
                    onChange={(e) => handleChange('videoEmbedCode', e.target.value)}
                    rows={3}
                    placeholder="<iframe ...></iframe>"
                  />
                </div>
                <div className="hub-form-row">
                  <div className="hub-form-group">
                    <label className="hub-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.videoAvailableInEn}
                        onChange={(e) => handleChange('videoAvailableInEn', e.target.checked)}
                      />
                      Available in English
                    </label>
                  </div>
                  <div className="hub-form-group">
                    <label className="hub-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.videoAvailableInSv}
                        onChange={(e) => handleChange('videoAvailableInSv', e.target.checked)}
                      />
                      Available in Swedish
                    </label>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="hub-modal-footer">
          <button className="hub-btn" onClick={onClose}>
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            form="content-form"
            className="hub-btn hub-btn-primary"
            disabled={isSaving}
          >
            {isSaving
              ? t('common:saving')
              : isEdit
                ? t('common:saveChanges', 'Save Changes')
                : t('hub:content.modal.create', 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}
