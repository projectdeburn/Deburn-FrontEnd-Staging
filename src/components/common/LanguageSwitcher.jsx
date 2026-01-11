/**
 * Language Switcher Component
 * Allows users to switch between available languages
 */

import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'sv', label: 'SV' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="text-neutral-500">Language:</span>
      {LANGUAGES.map((lang, index) => (
        <span key={lang.code} className="flex items-center">
          {index > 0 && <span className="text-neutral-300 mx-1">|</span>}
          <button
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-1 py-0.5 rounded transition-colors ${
              currentLang === lang.code
                ? 'text-deep-forest font-medium'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {lang.label}
          </button>
        </span>
      ))}
    </div>
  );
}
