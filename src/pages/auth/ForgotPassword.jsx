/**
 * Forgot Password Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '@/utils/api';

export default function ForgotPassword() {
  const { t } = useTranslation('auth');

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="screen auth-screen active">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-text">Deburn</span>
          </div>
          <h1 className="auth-title">{t('forgotPassword.title', 'Reset your password')}</h1>
          <p className="auth-subtitle">{t('forgotPassword.subtitle', "Enter your email and we'll send you a reset link")}</p>
        </div>

        <div className="auth-form">
          {success && (
            <div className="auth-alert success visible">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{t('forgotPassword.success', "If this email is registered, we've sent password reset instructions.")}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert error visible">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  {t('forgotPassword.email', 'Email address')}
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  name="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary form-submit"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading', 'Loading...') : t('forgotPassword.submit', 'Send reset link')}
              </button>
            </form>
          )}

          <div className="form-footer">
            <Link to="/login" className="form-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              {t('forgotPassword.backToLogin', 'Back to sign in')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
