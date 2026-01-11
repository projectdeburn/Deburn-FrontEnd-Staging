/**
 * Cookie Policy Page
 */

import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        {/* Header */}
        <header className="legal-header">
          <Link to="/" className="legal-logo">
            Eve
          </Link>
          <h1 className="legal-title">Cookie Policy</h1>
          <p className="legal-meta">Last updated: January 2025</p>
        </header>

        {/* Content */}
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your experience.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Cookies</h2>
            <p>Eve uses cookies for the following purposes:</p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management.
            </p>

            <h3>Preference Cookies</h3>
            <p>
              These cookies remember your settings and preferences, such as your language preference and theme settings, to provide a more personalized experience.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              We use analytics cookies to understand how users interact with our service, which helps us improve the user experience. These cookies collect anonymous, aggregated data.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Cookies We Use</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>session_id</td>
                  <td>Authentication and session management</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>language</td>
                  <td>Store language preference</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>consent</td>
                  <td>Remember cookie consent choice</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="legal-section">
            <h2>4. Managing Cookies</h2>
            <p>You can control and manage cookies in several ways:</p>
            <ul>
              <li>Through your browser settings - most browsers allow you to refuse or delete cookies</li>
              <li>Through our cookie consent banner when you first visit the site</li>
              <li>By contacting us to request your preferences be updated</li>
            </ul>
            <p>
              Please note that disabling certain cookies may affect the functionality of our service.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Third-Party Cookies</h2>
            <p>
              We may use third-party services that set their own cookies, such as analytics providers. These third parties have their own privacy policies governing the use of such cookies.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@eve.app">privacy@eve.app</a>
            </p>
          </section>
        </div>

        {/* Back Link */}
        <Link to="/" className="legal-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Eve
        </Link>
      </div>
    </div>
  );
}
