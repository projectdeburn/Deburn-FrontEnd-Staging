/**
 * Login Page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { t, i18n } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || t('errors.loginFailed', 'Invalid email or password'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="screen auth-screen active">
      <div className="auth-language-switcher">
        <span className="auth-lang-label">{t('common.language.label', 'Language:')}</span>
        <button
          className={`auth-lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('en')}
        >
          EN
        </button>
        <span className="auth-lang-divider">|</span>
        <button
          className={`auth-lang-btn ${i18n.language === 'sv' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('sv')}
        >
          SV
        </button>
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-text">Deburn</span>
          </div>
          <h1 className="auth-title">{t('login.title', 'Welcome back')}</h1>
          <p className="auth-subtitle">{t('login.subtitle', 'Sign in to continue your leadership journey')}</p>
        </div>

        <div className="auth-form">
          {error && (
            <div className="auth-alert error visible">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                {t('login.email', 'Email address')}
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="form-error" id="login-email-error"></span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                {t('login.password', 'Password')}
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <span className="form-error" id="login-password-error"></span>
            </div>

            <div className="form-row">
              <div className="checkbox-group" style={{ marginBottom: 0 }}>
                <input
                  type="checkbox"
                  id="login-remember"
                  name="rememberMe"
                  className="checkbox-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="checkbox-label" htmlFor="login-remember">
                  {t('login.rememberMe', 'Remember me')}
                </label>
              </div>
              <Link to="/forgot-password" className="form-link">
                {t('login.forgotPassword', 'Forgot password?')}
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary form-submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading', 'Loading...') : t('login.submit', 'Sign in')}
            </button>
          </form>

          <div className="form-footer">
            {t('login.noAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="form-link">
              {t('login.signUp', 'Create account')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
