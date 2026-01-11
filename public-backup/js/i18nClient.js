/**
 * i18n Client for Deburn
 * Handles frontend internationalization
 */

const I18nClient = {
  currentLanguage: 'en',
  supportedLanguages: ['en', 'sv'],
  translations: {},
  initialized: false,

  /**
   * Initialize i18n with language detection
   */
  async init() {
    if (this.initialized) return this;

    // Priority: 1. User profile setting (loaded later), 2. localStorage, 3. Browser, 4. Default
    const savedLang = localStorage.getItem('deburn_language');
    const browserLang = navigator.language?.split('-')[0];

    this.currentLanguage = savedLang ||
      (this.supportedLanguages.includes(browserLang) ? browserLang : 'en');

    // Load translations
    await this.loadTranslations(this.currentLanguage);

    // Also preload English as fallback
    if (this.currentLanguage !== 'en') {
      await this.loadTranslations('en');
    }

    this.initialized = true;
    document.documentElement.lang = this.currentLanguage;

    // Update UI after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.updatePageContent();
        this.updateLanguageSwitchers();
      });
    } else {
      this.updatePageContent();
      this.updateLanguageSwitchers();
    }

    return this;
  },

  /**
   * Load translation files for a language
   */
  async loadTranslations(lang) {
    if (this.translations[lang] && Object.keys(this.translations[lang]).length > 0) {
      return; // Already loaded
    }

    const namespaces = [
      'common', 'dashboard', 'checkin', 'coach',
      'learning', 'circles', 'progress', 'profile',
      'auth', 'errors', 'validation'
    ];

    this.translations[lang] = {};

    const loadPromises = namespaces.map(async (ns) => {
      try {
        const response = await fetch(`/locales/${lang}/${ns}.json`);
        if (response.ok) {
          this.translations[lang][ns] = await response.json();
        }
      } catch (e) {
        console.warn(`Failed to load ${lang}/${ns}.json`);
      }
    });

    await Promise.all(loadPromises);
  },

  /**
   * Get translation by key
   * @param {string} key - Dot-notation key (e.g., 'common.nav.dashboard')
   * @param {object} options - Interpolation values and count for pluralization
   */
  t(key, options = {}) {
    const [namespace, ...pathParts] = key.split('.');

    // Try current language first
    let value = this.getNestedValue(this.translations[this.currentLanguage]?.[namespace], pathParts);

    // Fallback to English if not found
    if (value === undefined && this.currentLanguage !== 'en') {
      value = this.getNestedValue(this.translations['en']?.[namespace], pathParts);
    }

    // Return key if still not found
    if (value === undefined) {
      console.warn(`Translation missing: ${key}`);
      return key;
    }

    // Handle pluralization
    if (options.count !== undefined && typeof value === 'object') {
      if (options.count === 1 && value.one) {
        value = value.one;
      } else if (value.other) {
        value = value.other;
      }
    }

    // Handle interpolation
    if (typeof value === 'string') {
      value = value.replace(/\{\{(\w+)\}\}/g, (match, varName) =>
        options[varName] !== undefined ? options[varName] : match
      );
    }

    return value;
  },

  /**
   * Helper to get nested value from object
   */
  getNestedValue(obj, pathParts) {
    if (!obj) return undefined;
    let value = obj;
    for (const part of pathParts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    return value;
  },

  /**
   * Change language
   */
  async setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    if (lang === this.currentLanguage) return;

    // Save to localStorage first
    localStorage.setItem('deburn_language', lang);

    // Sync with backend if logged in (fire and forget)
    this.syncLanguagePreference(lang);

    // Reload the page to apply language change everywhere
    window.location.reload();
  },

  /**
   * Update all translatable content on the page
   */
  updatePageContent() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const optionsStr = el.dataset.i18nOptions;
      const options = optionsStr ? JSON.parse(optionsStr) : {};
      el.textContent = this.t(key, options);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });

    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = this.t(el.dataset.i18nTitle);
    });

    // Update aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', this.t(el.dataset.i18nAria));
    });

    // Update HTML content (for elements that need innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      el.innerHTML = this.t(key);
    });
  },

  /**
   * Update language switcher UI elements
   */
  updateLanguageSwitchers() {
    // Update user menu language switchers
    const switchers = document.querySelectorAll('.language-switcher');
    switchers.forEach(switcher => {
      const buttons = switcher.querySelectorAll('[data-lang]');
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
      });
    });

    // Update auth screen language switchers
    const authSwitchers = document.querySelectorAll('.auth-language-switcher');
    authSwitchers.forEach(switcher => {
      const buttons = switcher.querySelectorAll('[data-lang]');
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
      });
    });

    // Update select dropdowns
    const selects = document.querySelectorAll('select[name="preferredLanguage"], #profile-language');
    selects.forEach(select => {
      select.value = this.currentLanguage;
    });
  },

  /**
   * Sync language preference with backend
   */
  async syncLanguagePreference(lang) {
    try {
      const response = await fetch('/api/user/language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferredLanguage: lang })
      });

      if (!response.ok) {
        // User might not be logged in, that's OK
        console.debug('Could not sync language preference (user may not be logged in)');
      }
    } catch (e) {
      console.debug('Failed to sync language preference:', e.message);
    }
  },

  /**
   * Set language from user profile (called after login)
   */
  async setLanguageFromProfile(profileLanguage) {
    if (profileLanguage && this.supportedLanguages.includes(profileLanguage)) {
      if (profileLanguage !== this.currentLanguage) {
        await this.setLanguage(profileLanguage);
      }
    }
  },

  /**
   * Format date according to current locale
   */
  formatDate(date, style = 'long') {
    const locale = this.currentLanguage === 'sv' ? 'sv-SE' : 'en-US';

    const options = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    };

    return new Intl.DateTimeFormat(locale, options[style] || options.long).format(date);
  },

  /**
   * Format number according to current locale
   */
  formatNumber(number, options = {}) {
    const locale = this.currentLanguage === 'sv' ? 'sv-SE' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  },

  /**
   * Format percentage according to current locale
   */
  formatPercent(value, options = {}) {
    const locale = this.currentLanguage === 'sv' ? 'sv-SE' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 0,
      signDisplay: 'exceptZero',
      ...options
    }).format(value / 100);
  },

  /**
   * Get time of day key for greetings
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  },

  /**
   * Get localized greeting with name
   */
  getGreeting(name) {
    const timeOfDay = this.getTimeOfDay();
    return this.t(`common.greeting.${timeOfDay}`, { name });
  },

  /**
   * Get current language code
   */
  getLanguage() {
    return this.currentLanguage;
  },

  /**
   * Check if a language is supported
   */
  isLanguageSupported(lang) {
    return this.supportedLanguages.includes(lang);
  }
};

// Global shortcut function
function t(key, options) {
  return I18nClient.t(key, options);
}

// Initialize on script load
I18nClient.init().catch(console.error);

// Expose globally
window.I18nClient = I18nClient;
window.t = t;
