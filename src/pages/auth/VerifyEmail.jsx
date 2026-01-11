/**
 * Verify Email Page
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function VerifyEmail() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('verifying'); // verifying, success, error, resent
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else if (!email) {
      setStatus('error');
      setError(t('verifyEmail.noToken', 'Invalid verification link'));
    }
  }, [token]);

  async function verifyToken() {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(data.error || t('verifyEmail.failed', 'Email verification failed'));
      }
    } catch (err) {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  }

  async function resendVerification() {
    if (!email) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('resent');
      } else {
        setError(data.error || t('verifyEmail.resendFailed', 'Failed to resend verification email'));
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  }

  // Verifying state
  if (status === 'verifying' && token) {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <div className="auth-message">
            <div className="auth-message-icon pending">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('verifyEmail.verifying', 'Verifying your email...')}</h2>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
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
            <h2 className="auth-message-title">{t('verifyEmail.successTitle', 'Email verified!')}</h2>
            <p className="auth-message-text">
              {t('verifyEmail.successMessage', 'Your email has been verified. You can now sign in to your account.')}
            </p>
            <div className="auth-message-actions">
              <Link to="/login" className="btn btn-primary">
                {t('verifyEmail.signIn', 'Sign in')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resent state
  if (status === 'resent') {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <div className="auth-message">
            <div className="auth-message-icon success">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('verifyEmail.resentTitle', 'Email sent!')}</h2>
            <p className="auth-message-text">
              {t('verifyEmail.resentMessage', 'A new verification link has been sent to your email address.')}
            </p>
            <div className="auth-message-actions">
              <Link to="/login" className="btn btn-secondary">
                {t('verifyEmail.backToLogin', 'Back to login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending verification (no token, just email)
  if (!token && email) {
    return (
      <div className="screen auth-screen active">
        <div className="auth-container">
          <div className="auth-message">
            <div className="auth-message-icon pending">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h2 className="auth-message-title">{t('verifyEmail.pendingTitle', 'Verify your email')}</h2>
            <p className="auth-message-text">
              {t('verifyEmail.pendingMessage', "We've sent a verification link to")}
            </p>
            <p className="auth-message-email">{email}</p>
            <div className="auth-message-actions">
              <button
                className="btn btn-secondary"
                onClick={resendVerification}
                disabled={isResending}
              >
                {isResending ? t('common.loading', 'Loading...') : t('verifyEmail.resend', 'Resend verification email')}
              </button>
              <Link to="/login" className="btn btn-ghost">
                {t('verifyEmail.backToLogin', 'Back to login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
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
          <h2 className="auth-message-title">{t('verifyEmail.errorTitle', 'Verification failed')}</h2>
          <p className="auth-message-text">
            {error || t('verifyEmail.errorMessage', 'This verification link is invalid or has expired.')}
          </p>
          <div className="auth-message-actions">
            {email && (
              <button
                className="btn btn-primary"
                onClick={resendVerification}
                disabled={isResending}
              >
                {isResending ? t('common.loading', 'Loading...') : t('verifyEmail.resend', 'Resend verification email')}
              </button>
            )}
            <Link to="/login" className={`btn ${email ? 'btn-secondary' : 'btn-primary'}`}>
              {t('verifyEmail.backToLogin', 'Back to login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
