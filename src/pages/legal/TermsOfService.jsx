/**
 * Terms of Service Page
 */

import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        {/* Header */}
        <header className="legal-header">
          <Link to="/" className="legal-logo">
            Eve
          </Link>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Last updated: January 2025</p>
        </header>

        {/* Content */}
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Eve ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              Eve is an AI-powered personal development and coaching platform that helps users track their wellbeing, receive personalized coaching, and develop leadership skills. The Service includes:
            </p>
            <ul>
              <li>Daily check-ins and mood tracking</li>
              <li>AI-powered coaching conversations</li>
              <li>Learning modules and micro-lessons</li>
              <li>Progress tracking and insights</li>
              <li>Peer support circles</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts</h2>
            <p>To use certain features of the Service, you must create an account. You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete registration information</li>
              <li>Updating your information to keep it current</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Upload malicious content or code</li>
              <li>Impersonate others or misrepresent your affiliation</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Disclaimer</h2>
            <div className="legal-highlight">
              <p>
                <strong>Important:</strong> Eve provides AI-powered coaching for personal development purposes only. The Service is not a substitute for professional medical, psychological, or therapeutic advice. If you are experiencing a mental health crisis, please contact a qualified healthcare professional or emergency services.
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Eve and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@eve.app">legal@eve.app</a>
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
