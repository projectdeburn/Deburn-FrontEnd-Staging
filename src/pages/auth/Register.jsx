/**
 * Register Page
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

function getPasswordStrength(password) {
  if (!password) return { strength: 0, textKey: '', dataStrength: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { strength: 0, textKey: '', dataStrength: '' },
    { strength: 1, textKey: 'passwordStrength.weak', dataStrength: 'weak' },
    { strength: 2, textKey: 'passwordStrength.fair', dataStrength: 'fair' },
    { strength: 3, textKey: 'passwordStrength.good', dataStrength: 'good' },
    { strength: 4, textKey: 'passwordStrength.strong', dataStrength: 'strong' },
  ];

  return levels[Math.min(score, 4)];
}

export default function Register() {
  const { t, i18n } = useTranslation('auth');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    country: '',
    password: '',
    passwordConfirm: '',
    termsOfService: false,
    privacyPolicy: false,
    dataProcessing: false,
    marketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (formData.password !== formData.passwordConfirm) {
      setFieldErrors({ passwordConfirm: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        organization: formData.organization,
        country: formData.country,
        consents: {
          termsOfService: formData.termsOfService,
          privacyPolicy: formData.privacyPolicy,
          dataProcessing: formData.dataProcessing,
          marketing: formData.marketing,
        },
      }, i18n.language);

      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      if (err.fields) {
        setFieldErrors(err.fields);
      }
      setError(err.message || t('errors.registrationFailed', 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  }

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
            <h2 className="auth-message-title">{t('register.successTitle', 'Check your email')}</h2>
            <p className="auth-message-text">
              {t('register.successMessage', "We've sent a verification link to your email address.")}
            </p>
            <p className="auth-message-email">{formData.email}</p>
            <div className="auth-message-actions">
              <Link to="/login" className="btn btn-primary">
                {t('register.backToLogin', 'Back to login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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

      <div className="auth-container" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-text">Human First AI</span>
          </div>
          <h1 className="auth-title">{t('register.title', 'Create your account')}</h1>
          <p className="auth-subtitle">{t('register.subtitle', 'Start your leadership development journey')}</p>
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
            <div className="form-row-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="register-firstname">
                  {t('register.firstName', 'First name')}
                </label>
                <input
                  type="text"
                  id="register-firstname"
                  name="firstName"
                  className={`form-input ${fieldErrors.firstName ? 'error' : ''}`}
                  placeholder={t('register.firstNamePlaceholder', 'Your first name')}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.firstName && <span className="form-error">{fieldErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="register-lastname">
                  {t('register.lastName', 'Last name')}
                </label>
                <input
                  type="text"
                  id="register-lastname"
                  name="lastName"
                  className={`form-input ${fieldErrors.lastName ? 'error' : ''}`}
                  placeholder={t('register.lastNamePlaceholder', 'Your last name')}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.lastName && <span className="form-error">{fieldErrors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                {t('register.email', 'Work email address')}
              </label>
              <input
                type="email"
                id="register-email"
                name="email"
                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                placeholder={t('register.emailPlaceholder', 'you@company.com')}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-organization">
                {t('register.organization', 'Organization')}
              </label>
              <input
                type="text"
                id="register-organization"
                name="organization"
                className="form-input"
                placeholder={t('register.organizationPlaceholder', 'Your company name')}
                value={formData.organization}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-country">
                {t('register.country', 'Country')}
              </label>
              <select
                id="register-country"
                name="country"
                className={`form-select ${fieldErrors.country ? 'error' : ''}`}
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">{t('register.countryPlaceholder', 'Select your country')}</option>
                <optgroup label={t('countries.eu', 'European Union')}>
                  <option value="SE">Sweden</option>
                  <option value="FI">Finland</option>
                  <option value="DK">Denmark</option>
                  <option value="NO">Norway</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="AT">Austria</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="PT">Portugal</option>
                  <option value="IE">Ireland</option>
                  <option value="PL">Poland</option>
                  <option value="CZ">Czech Republic</option>
                </optgroup>
                <optgroup label={t('countries.other', 'Other Countries')}>
                  <option value="GB">United Kingdom</option>
                  <option value="CH">Switzerland</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </optgroup>
              </select>
              {fieldErrors.country && <span className="form-error">{fieldErrors.country}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                {t('register.password', 'Password')}
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  name="password"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  placeholder={t('register.passwordPlaceholder', 'Create a strong password')}
                  value={formData.password}
                  onChange={handleChange}
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
              <div className="password-strength" data-strength={passwordStrength.dataStrength}>
                <div className="strength-bar">
                  <div className="strength-segment"></div>
                  <div className="strength-segment"></div>
                  <div className="strength-segment"></div>
                  <div className="strength-segment"></div>
                </div>
                <span className="strength-text">{passwordStrength.textKey ? t(passwordStrength.textKey) : ''}</span>
              </div>
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password-confirm">
                {t('register.confirmPassword', 'Confirm password')}
              </label>
              <div className="password-wrapper">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="register-password-confirm"
                  name="passwordConfirm"
                  className={`form-input ${fieldErrors.passwordConfirm ? 'error' : ''}`}
                  placeholder={t('register.confirmPasswordPlaceholder', 'Confirm your password')}
                  value={formData.passwordConfirm}
                  onChange={handleChange}
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
              {fieldErrors.passwordConfirm && <span className="form-error">{fieldErrors.passwordConfirm}</span>}
            </div>

            <div className="consent-section">
              <h4 className="consent-section-title">{t('consent.title', 'Terms and Agreements')}</h4>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent-terms"
                  name="termsOfService"
                  className="checkbox-input"
                  checked={formData.termsOfService}
                  onChange={handleChange}
                  required
                />
                <label className="checkbox-label" htmlFor="consent-terms" dangerouslySetInnerHTML={{ __html: t('consent.terms', 'I agree to the <a href="/legal/terms-of-service" target="_blank">Terms of Service</a>') }} />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent-privacy"
                  name="privacyPolicy"
                  className="checkbox-input"
                  checked={formData.privacyPolicy}
                  onChange={handleChange}
                  required
                />
                <label className="checkbox-label" htmlFor="consent-privacy" dangerouslySetInnerHTML={{ __html: t('consent.privacy', 'I agree to the <a href="/legal/privacy-policy" target="_blank">Privacy Policy</a>') }} />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent-data"
                  name="dataProcessing"
                  className="checkbox-input"
                  checked={formData.dataProcessing}
                  onChange={handleChange}
                  required
                />
                <label className="checkbox-label" htmlFor="consent-data">
                  {t('consent.dataProcessing', 'I consent to the processing of my personal data as described in the Privacy Policy')}
                </label>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent-marketing"
                  name="marketing"
                  className="checkbox-input"
                  checked={formData.marketing}
                  onChange={handleChange}
                />
                <label className="checkbox-label" htmlFor="consent-marketing">
                  {t('consent.marketing', "I'd like to receive product updates and leadership tips (optional)")}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary form-submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading', 'Loading...') : t('register.submit', 'Create account')}
            </button>
          </form>

          <div className="form-footer">
            {t('register.hasAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="form-link">
              {t('register.signIn', 'Sign in')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
