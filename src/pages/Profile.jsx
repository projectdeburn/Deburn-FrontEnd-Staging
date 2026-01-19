/**
 * Profile Page
 * User profile settings and account management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { put, post, uploadFile, del } from '@/utils/api';

// LocalStorage key for conversation history (must match Coach.jsx)
const CONVERSATION_STORAGE_KEY = 'deburn_coach_conversation';

// SVG Icons
const icons = {
  arrowLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" x2="12" y1="3" y2="15"></line>
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" x2="10" y1="11" y2="17"></line>
      <line x1="14" x2="14" y1="11" y2="17"></line>
    </svg>
  ),
  checkCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  key: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
    </svg>
  ),
  logOut: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" x2="9" y1="12" y2="12"></line>
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" x2="22" y1="12" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
};

export default function Profile() {
  const { t, i18n } = useTranslation(['profile', 'common']);
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setOrganization(user.organization || '');
      setRole(user.role || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError(t('profile:avatar.error.tooLarge', 'File too large. Max size is 1MB.'));
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError(t('profile:avatar.error.invalidType', 'Invalid file type. Use JPG or PNG.'));
      return;
    }

    setError('');
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await uploadFile('/api/profile/avatar', formData);
      if (response.success) {
        setAvatarUrl(response.data.avatarUrl);
        await refreshUser();
      }
    } catch (err) {
      setError(err.message || t('profile:avatar.error.upload', 'Failed to upload avatar'));
    }
  }

  async function handleRemoveAvatar() {
    try {
      await put('/api/profile/avatar', { remove: true });
      setAvatarUrl('');
      await refreshUser();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setShowSuccess(false);

    try {
      const response = await put('/api/profile', {
        firstName,
        lastName,
        organization,
        role,
        bio,
      });

      if (response.success) {
        setShowSuccess(true);
        await refreshUser();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || t('profile:error.save', 'Failed to save changes'));
    } finally {
      setIsSaving(false);
    }
  }

  function changeLanguage(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleClearConversationHistory() {
    if (!window.confirm(t('profile:conversation.confirmClear', 'Are you sure you want to clear your conversation history? This cannot be undone.'))) {
      return;
    }

    setIsClearingHistory(true);
    setHistoryCleared(false);

    try {
      // Delete from backend
      await del('/api/conversations');

      // Clear localStorage
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);

      setHistoryCleared(true);
      setTimeout(() => setHistoryCleared(false), 3000);
    } catch (err) {
      setError(err.message || t('profile:conversation.clearError', 'Failed to clear conversation history'));
    } finally {
      setIsClearingHistory(false);
    }
  }

  async function handleChangePassword() {
    if (!email) {
      setError(t('profile:password.noEmail', 'No email address found'));
      return;
    }

    setIsSendingReset(true);
    setResetSent(false);
    setError('');

    try {
      await post('/api/auth/forgot-password', { email });
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      setError(err.message || t('profile:password.resetError', 'Failed to send reset link'));
    } finally {
      setIsSendingReset(false);
    }
  }

  const initials = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          {icons.arrowLeft}
        </button>
        <h1 className="profile-title">{t('profile:title', 'Profile Settings')}</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Content */}
      <div className="profile-content">
        {/* Profile Picture */}
        <section className="profile-section">
          <h2 className="profile-section-title">
            {t('profile:avatar.title', 'Profile Picture')}
          </h2>
          <div className="profile-picture-card">
            <div className="profile-picture-preview">
              <div className="profile-avatar-large">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`${firstName} ${lastName}`} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>
            <div className="profile-picture-info">
              <p className="profile-picture-hint">
                {t('profile:avatar.hint', 'Upload a profile picture to personalize your account.')}
              </p>
              <p className="profile-picture-limits">
                {t('profile:avatar.limits', 'Max file size: 1MB. Formats: JPG, PNG')}
              </p>
              <div className="profile-picture-actions">
                <label className="btn btn-secondary">
                  {icons.upload}
                  <span>{t('profile:avatar.upload', 'Upload Photo')}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
                {avatarUrl && (
                  <button className="btn btn-ghost" onClick={handleRemoveAvatar}>
                    {icons.trash}
                    <span>{t('common:remove', 'Remove')}</span>
                  </button>
                )}
              </div>
              {error && <p className="profile-picture-error">{error}</p>}
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="profile-section">
          <h2 className="profile-section-title">
            {t('profile:info.title', 'Personal Information')}
          </h2>
          <form className="profile-form" onSubmit={handleSubmit}>
            {showSuccess && (
              <div className="auth-alert auth-alert-success">
                {icons.checkCircle}
                <span>{t('profile:success', 'Profile updated successfully')}</span>
              </div>
            )}

            <div className="profile-form-grid">
              <div className="form-group">
                <label className="form-label">
                  {t('profile:info.firstName', 'First Name')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('profile:info.firstNamePlaceholder', 'Your first name')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t('profile:info.lastName', 'Last Name')}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('profile:info.lastNamePlaceholder', 'Your last name')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('profile:info.email', 'Email Address')}
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
              />
              <p className="form-helper">
                {t('profile:info.emailHelper', 'Contact support to change your email address')}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('profile:info.organization', 'Organization')}
              </label>
              <input
                type="text"
                className="form-input"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={t('profile:info.organizationPlaceholder', 'Your company name')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('profile:info.role', 'Job Title')}
              </label>
              <input
                type="text"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={t('profile:info.rolePlaceholder', 'e.g. Engineering Manager')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('profile:info.bio', 'Bio')}
              </label>
              <textarea
                className="form-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('profile:info.bioPlaceholder', 'Tell us a bit about yourself...')}
                rows={3}
              />
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? t('common:saving', 'Saving...') : t('common:saveChanges', 'Save Changes')}
              </button>
            </div>
          </form>
        </section>

        {/* Language Settings */}
        <section className="profile-section">
          <h2 className="profile-section-title">
            {t('profile:language.title', 'Language')}
          </h2>
          <div className="profile-language-select">
            {icons.globe}
            <div className="language-options">
              <button
                className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                English
              </button>
              <button
                className={`language-btn ${i18n.language === 'sv' ? 'active' : ''}`}
                onClick={() => changeLanguage('sv')}
              >
                Svenska
              </button>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="profile-section profile-account-card">
          <h2 className="profile-section-title">
            {t('profile:account.title', 'Account')}
          </h2>
          <div className="profile-account-item">
            <div className="profile-account-info">
              <h4>{t('profile:account.changePassword', 'Change Password')}</h4>
              <p>{t('profile:account.changePasswordHint', 'Update your password to keep your account secure')}</p>
              {resetSent && (
                <p className="profile-success-text">{t('profile:password.resetSent', 'Password reset link sent to your email')}</p>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleChangePassword}
              disabled={isSendingReset}
            >
              {icons.key}
              <span>{isSendingReset ? t('common:sending', 'Sending...') : t('profile:account.changePasswordBtn', 'Change')}</span>
            </button>
          </div>

          <div className="profile-account-item">
            <div className="profile-account-info">
              <h4>{t('profile:conversation.title', 'Conversation History')}</h4>
              <p>{t('profile:conversation.hint', 'Clear your AI coach conversation history')}</p>
              {historyCleared && (
                <p className="profile-success-text">{t('profile:conversation.cleared', 'Conversation history cleared')}</p>
              )}
            </div>
            <button
              className="btn btn-ghost"
              onClick={handleClearConversationHistory}
              disabled={isClearingHistory}
            >
              {icons.trash}
              <span>{isClearingHistory ? t('common:clearing', 'Clearing...') : t('profile:conversation.clearBtn', 'Clear')}</span>
            </button>
          </div>

          <div className="profile-account-item">
            <div className="profile-account-info">
              <h4>{t('profile:account.signOut', 'Sign Out')}</h4>
              <p>{t('profile:account.signOutHint', 'Sign out of your account on this device')}</p>
            </div>
            <button className="btn btn-ghost logout" onClick={handleLogout}>
              {icons.logOut}
              <span>{t('common:logout', 'Sign Out')}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
