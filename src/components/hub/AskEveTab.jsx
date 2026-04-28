/**
 * AskEveTab Component
 * Configure the AI leadership coach (Eve)
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hubApi } from '@/features/hub/hubApi';
import PromptEditModal from './PromptEditModal';

export default function AskEveTab({ showMessage }) {
  const { t } = useTranslation(['hub', 'common']);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(15);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [prompts, setPrompts] = useState({});
  const [editingPrompt, setEditingPrompt] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [settingsRes, configRes, promptsRes] = await Promise.all([
        hubApi.getCoachSettings(),
        hubApi.getCoachConfig(),
        hubApi.getCoachPrompts(),
      ]);

      if (settingsRes.success) {
        setDailyLimit(settingsRes.data.dailyExchangeLimit || 15);
      }
      if (configRes.success) {
        setConfig(configRes.data);
      }
      if (promptsRes.success) {
        setPrompts(promptsRes.data.prompts || {});
      }
    } catch (error) {
      showMessage(error.message || t('hub:eve.error.load'), 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveLimit(e) {
    e.preventDefault();
    if (dailyLimit < 1 || dailyLimit > 100) {
      showMessage(t('hub:eve.error.limitRange'), 'error');
      return;
    }

    setIsSaving(true);
    try {
      await hubApi.updateCoachSettings({ dailyExchangeLimit: dailyLimit });
      showMessage(t('hub:eve.success.limitSaved'), 'success');
    } catch (error) {
      showMessage(error.message || t('hub:eve.error.saveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSavePrompt(language, promptName, content) {
    try {
      await hubApi.updateCoachPrompt(language, promptName, content);
      showMessage(t('hub:eve.success.promptSaved'), 'success');
      await loadData();
      setEditingPrompt(null);
    } catch (error) {
      showMessage(error.message || t('hub:eve.error.promptSaveFailed'), 'error');
    }
  }

  if (isLoading) {
    return (
      <div className="hub-card">
        <div className="hub-empty">{t('common:loading')}</div>
      </div>
    );
  }

  const crisisKeywords = config?.crisisKeywords?.en || [];
  const softKeywords = config?.softEscalationKeywords?.en || [];

  return (
    <>
      {/* Conversation Limits Card */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:eve.limitsTitle', 'Conversation Limits')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:eve.limitsSubtitle', 'Daily message limits for Ask Eve')}
            </p>
          </div>
        </div>

        <form className="hub-form" onSubmit={handleSaveLimit}>
          <div className="hub-form-row">
            <div className="hub-form-group">
              <label className="hub-label" htmlFor="daily-limit">
                {t('hub:eve.dailyLimit', 'Daily exchanges per user')}
              </label>
              <input
                type="number"
                id="daily-limit"
                className="hub-input"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                style={{ width: '120px' }}
              />
            </div>
            <button type="submit" className="hub-btn hub-btn-primary" disabled={isSaving}>
              {isSaving ? t('common:saving') : t('common:save', 'Save')}
            </button>
          </div>
          <p className="hub-helper-text">
            {t('hub:eve.limitHelper', 'Users will see a message when they reach their daily limit and be asked to return tomorrow.')}
          </p>
        </form>
      </div>

      {/* Coach Configuration Card */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:eve.configTitle', 'Coach Configuration')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:eve.configSubtitle', 'Current AI model and topic detection settings')}
            </p>
          </div>
        </div>

        {config && (
          <>
            <div className="hub-config-grid">
              <div className="hub-config-item">
                <div className="hub-config-label">{t('hub:eve.config.model', 'AI Model')}</div>
                <div className="hub-config-value">{config.model}</div>
              </div>
              <div className="hub-config-item">
                <div className="hub-config-label">{t('hub:eve.config.maxTokens', 'Max Tokens')}</div>
                <div className="hub-config-value">{config.maxTokens}</div>
              </div>
              <div className="hub-config-item">
                <div className="hub-config-label">{t('hub:eve.config.temperature', 'Temperature')}</div>
                <div className="hub-config-value">{config.temperature || 0.7}</div>
              </div>
            </div>

            {config.methodology && (
              <div className="hub-config-section">
                <div className="hub-config-label">{t('hub:eve.config.methodology', 'Coaching Methodology')}</div>
                <div className="hub-methodology-info">
                  <div><strong>{t('hub:eve.config.primary', 'Primary')}:</strong> {config.methodology.primary}</div>
                  <div><strong>{t('hub:eve.config.ethical', 'Ethical Standards')}:</strong> {config.methodology.ethical}</div>
                  <div style={{ marginTop: '8px' }}>
                    <strong>{t('hub:eve.config.frameworks', 'Scientific Frameworks')}:</strong>
                  </div>
                  <div className="hub-topics-list" style={{ marginTop: '4px' }}>
                    {config.methodology.frameworks.map((f) => (
                      <span key={f} className="hub-topic-badge">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="hub-config-section">
              <div className="hub-config-label">
                {t('hub:eve.config.topics', 'Supported Topics')} ({config.topics?.length || 0})
              </div>
              <div className="hub-topics-list">
                {config.topics?.map((topic) => (
                  <span key={topic} className="hub-topic-badge">
                    {topic.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="hub-config-section">
              <div className="hub-config-label hub-text-danger">
                {t('hub:eve.config.crisisKeywords', 'Crisis Keywords (Level 3 - Stop Coaching)')}
              </div>
              <div className="hub-keywords-preview hub-text-danger">
                {crisisKeywords.slice(0, 8).map((kw) => (
                  <code key={kw}>{kw}</code>
                ))}
                {crisisKeywords.length > 8 && (
                  <span className="hub-text-muted">... +{crisisKeywords.length - 8} more</span>
                )}
              </div>
            </div>

            <div className="hub-config-section">
              <div className="hub-config-label hub-text-warning">
                {t('hub:eve.config.softKeywords', 'Soft Escalation Keywords (Level 1 - Caution)')}
              </div>
              <div className="hub-keywords-preview hub-text-warning">
                {softKeywords.slice(0, 6).map((kw) => (
                  <code key={kw}>{kw}</code>
                ))}
                {softKeywords.length > 6 && (
                  <span className="hub-text-muted">... +{softKeywords.length - 6} more</span>
                )}
              </div>
            </div>

            {config.hardBoundaries && (
              <div className="hub-config-section">
                <div className="hub-config-label">
                  {t('hub:eve.config.hardBoundaries', 'Hard Boundaries (Never Provide)')}
                </div>
                <div className="hub-keywords-preview">
                  {config.hardBoundaries.map((b) => (
                    <code key={b}>{b}</code>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* System Prompts Card */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:eve.promptsTitle', 'System Prompts')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:eve.promptsSubtitle', 'Coach personality and behavior prompts by language')}
            </p>
          </div>
        </div>

        {Object.keys(prompts).length === 0 ? (
          <div className="hub-empty">{t('hub:eve.noPrompts', 'No prompts found')}</div>
        ) : (
          Object.entries(prompts).map(([lang, langPrompts]) => (
            <div key={lang} className="hub-prompt-language">
              <h4 className="hub-prompt-lang-title">{lang.toUpperCase()}</h4>
              <div className="hub-prompts-list">
                {Object.entries(langPrompts).map(([name, content]) => (
                  <div key={name} className="hub-prompt-item">
                    <div className="hub-prompt-header">
                      <span className="hub-prompt-name">{name}</span>
                      <button
                        className="hub-btn hub-btn-small"
                        onClick={() => setEditingPrompt({ language: lang, name, content })}
                      >
                        {t('common:edit', 'Edit')}
                      </button>
                    </div>
                    <pre className="hub-prompt-preview">
                      {content.substring(0, 200)}{content.length > 200 ? '...' : ''}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Content Recommendations Card */}
      <div className="hub-card">
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:eve.contentTitle', 'Content Recommendations')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:eve.contentSubtitle', 'Content the coach recommends based on conversation topics')}
            </p>
          </div>
        </div>

        <div className="hub-coach-integration-info">
          <p>
            {t('hub:eve.contentInfo', 'Eve recommends content from the Content Library based on detected topics in conversations.')}
          </p>
          <p style={{ marginTop: '12px' }}>
            {t('hub:eve.contentInstructions', 'To make content available to the coach:')}
          </p>
          <ol className="hub-numbered-list">
            <li>{t('hub:eve.step1', 'Go to the Content Library tab')}</li>
            <li>{t('hub:eve.step2', 'Edit a content item and set its Coach Topics')}</li>
            <li>{t('hub:eve.step3', 'Set Status to "Published" to make it available')}</li>
          </ol>
          <div className="hub-info-box">
            <strong>{t('hub:eve.availableTopics', 'Available Topics')}:</strong>
            <div className="hub-topics-list" style={{ marginTop: '8px' }}>
              {config?.topics?.map((topic) => (
                <span key={topic} className="hub-topic-badge">{topic.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Edit Modal */}
      {editingPrompt && (
        <PromptEditModal
          language={editingPrompt.language}
          promptName={editingPrompt.name}
          content={editingPrompt.content}
          onSave={handleSavePrompt}
          onClose={() => setEditingPrompt(null)}
        />
      )}
    </>
  );
}
