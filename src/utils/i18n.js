/**
 * i18n Configuration
 * Sets up react-i18next for internationalization
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locale files
import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enCheckin from '@/locales/en/checkin.json';
import enCircles from '@/locales/en/circles.json';
import enCoach from '@/locales/en/coach.json';
import enDashboard from '@/locales/en/dashboard.json';
import enErrors from '@/locales/en/errors.json';
import enLearning from '@/locales/en/learning.json';
import enProfile from '@/locales/en/profile.json';
import enProgress from '@/locales/en/progress.json';
import enValidation from '@/locales/en/validation.json';
import enHub from '@/locales/en/hub.json';
import enFeedback from '@/locales/en/feedback.json';

import svCommon from '@/locales/sv/common.json';
import svAuth from '@/locales/sv/auth.json';
import svCheckin from '@/locales/sv/checkin.json';
import svCircles from '@/locales/sv/circles.json';
import svCoach from '@/locales/sv/coach.json';
import svDashboard from '@/locales/sv/dashboard.json';
import svErrors from '@/locales/sv/errors.json';
import svLearning from '@/locales/sv/learning.json';
import svProfile from '@/locales/sv/profile.json';
import svProgress from '@/locales/sv/progress.json';
import svValidation from '@/locales/sv/validation.json';
import svHub from '@/locales/sv/hub.json';
import svFeedback from '@/locales/sv/feedback.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    checkin: enCheckin,
    circles: enCircles,
    coach: enCoach,
    dashboard: enDashboard,
    errors: enErrors,
    learning: enLearning,
    profile: enProfile,
    progress: enProgress,
    validation: enValidation,
    hub: enHub,
    feedback: enFeedback,
  },
  sv: {
    common: svCommon,
    auth: svAuth,
    checkin: svCheckin,
    circles: svCircles,
    coach: svCoach,
    dashboard: svDashboard,
    errors: svErrors,
    learning: svLearning,
    profile: svProfile,
    progress: svProgress,
    validation: svValidation,
    hub: svHub,
    feedback: svFeedback,
  },
};

// Get saved language or detect from browser
function getInitialLanguage() {
  const saved = localStorage.getItem('language');
  if (saved && ['en', 'sv'].includes(saved)) {
    return saved;
  }

  const browserLang = navigator.language.split('-')[0];
  return ['en', 'sv'].includes(browserLang) ? browserLang : 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'checkin', 'circles', 'coach', 'dashboard', 'errors', 'learning', 'profile', 'progress', 'validation', 'hub', 'feedback'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;

/**
 * Change the current language
 */
export function setLanguage(lang) {
  if (['en', 'sv'].includes(lang)) {
    i18n.changeLanguage(lang);
  }
}

/**
 * Get the current language
 */
export function getLanguage() {
  return i18n.language;
}
