/**
 * Privacy Policy Page
 */

import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        {/* Header */}
        <header className="legal-header">
          <Link to="/" className="legal-logo">
            Deburn
          </Link>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: January 2025</p>
        </header>

        {/* Content */}
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Deburn ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered coaching platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide when using our service, including:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Profile information (organization, job title)</li>
              <li>Check-in data (mood, energy levels, stress indicators)</li>
              <li>Conversation history with the AI coach</li>
              <li>Learning progress and preferences</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide personalized coaching and insights</li>
              <li>Track your wellbeing trends over time</li>
              <li>Improve our AI coaching capabilities</li>
              <li>Send you relevant notifications and updates</li>
              <li>Ensure the security of your account</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your conversations with the AI coach are encrypted and stored securely.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
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
          Back to Deburn
        </Link>
      </div>
    </div>
  );
}
