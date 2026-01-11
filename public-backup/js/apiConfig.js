/**
 * API Configuration
 * Handles different environments (web, native iOS/Android)
 */

const ApiConfig = {
  /**
   * Detect if running in Capacitor native app
   */
  isNativeApp: window.Capacitor && window.Capacitor.isNativePlatform(),

  /**
   * Get the base URL for API requests
   * - In web: use relative URLs (empty string)
   * - In native: use the production server URL
   */
  getBaseUrl() {
    if (this.isNativeApp) {
      // For native apps, always use the production server
      return 'https://deburnalpha.onrender.com';
    }
    // For web, use relative URLs
    return '';
  },

  /**
   * Initialize the config and update all API clients
   */
  init() {
    const baseUrl = this.getBaseUrl();

    // Update AuthClient if it exists
    if (window.AuthClient) {
      window.AuthClient.baseUrl = `${baseUrl}/api/auth`;
    }

    console.log(`API Config initialized: ${this.isNativeApp ? 'Native App' : 'Web'}, baseUrl: ${baseUrl || '(relative)'}`);

    return baseUrl;
  }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  ApiConfig.init();
});

// Export for use in other scripts
window.ApiConfig = ApiConfig;
