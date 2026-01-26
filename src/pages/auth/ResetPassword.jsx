/**
 * Reset Password Page
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '@/utils/api';

export default function ResetPassword() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError(t('errors.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (password.length < 8) {
      setError(t('errors.passwordTooShort', 'Password must be at least 8 characters'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        if (data.code === 'TOKEN_EXPIRED' || data.code === 'TOKEN_INVALID') {
          setTokenValid(false);
        } else {
          setError(data.error || t('errors.resetPasswordFailed', 'Failed to reset password'));
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <div className="auth-message">
            <div className="auth-message-icon error">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('resetPassword.invalidTitle', 'Invalid or expired link')}</h2>
            <p className="auth-message-text">
              {t('resetPassword.invalidMessage', 'This password reset link is invalid or has expired. Please request a new one.')}
            </p>
            <div className="auth-message-actions">
              <Link to="/forgot-password" className="btn btn-primary">
                {t('resetPassword.requestNew', 'Request new link')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <div className="auth-message">
            <div className="auth-message-icon success">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('resetPassword.successTitle', 'Password reset successful')}</h2>
            <p className="auth-message-text">
              {t('resetPassword.successMessage', 'Your password has been reset. You can now sign in with your new password.')}
            </p>
            <div className="auth-message-actions">
              <Link to="/login" className="btn btn-primary">
                {t('resetPassword.signIn', 'Sign in')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen auth-screen active">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-text">Human First AI</span>
          </div>
          <h1 className="auth-title">{t('resetPassword.title', 'Create new password')}</h1>
          <p className="auth-subtitle">{t('resetPassword.subtitle', 'Enter a new password for your account')}</p>
        </div>

        <div className="auth-form">
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-password">
                {t('resetPassword.newPassword', 'New password')}
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reset-password"
                  name="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-password-confirm">
                {t('resetPassword.confirmPassword', 'Confirm new password')}
              </label>
              <div className="password-wrapper">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="reset-password-confirm"
                  name="passwordConfirm"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary form-submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading', 'Loading...') : t('resetPassword.submit', 'Reset password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
