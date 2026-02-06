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
            Human First AI
          </Link>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Last updated: January 2025</p>
        </header>

        {/* Content */}
        <div className="legal-content">
          <div className="legal-highlight">
            <p>
              <strong>Your Privacy Matters:</strong> Human First AI is committed to protecting your personal data and being transparent about what information we collect and how we use it. This policy explains how we handle your data in compliance with GDPR (EU) and PDPA (Singapore).
            </p>
          </div>

          <section className="legal-section">
            <h2>1. About Us</h2>
            <p>
              Human First AI is an AI-powered leadership development and wellbeing platform developed through a collaboration between:
            </p>
            <ul>
              <li><strong>BrainBank Pte Ltd</strong> (Singapore) — Technology development and AI infrastructure</li>
              <li><strong>Human First AI AB</strong> (Sweden) — Burnout science, organizational psychology, and EU operations</li>
            </ul>
            <p>
              For users in the European Economic Area (EEA), Human First AI AB acts as the primary data controller. For users in Asia-Pacific, BrainBank Pte Ltd acts as the primary data controller.
            </p>
            <p>
              <strong>Contact:</strong> <a href="mailto:policy@brainbank.world">policy@brainbank.world</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Personal Data We Collect</h2>
            <h3>2.1 Account Information</h3>
            <ul>
              <li>Email address</li>
              <li>Name (optional)</li>
              <li>Organization name (if applicable)</li>
              <li>Country/region</li>
              <li>Language preference</li>
            </ul>
            <h3>2.2 Wellbeing Data (Special Category Data)</h3>
            <p>
              We collect health-related data that is considered "special category data" under GDPR Article 9:
            </p>
            <ul>
              <li>Daily mood and emotional state ratings</li>
              <li>Energy and stress levels</li>
              <li>Sleep quality indicators</li>
              <li>Burnout risk indicators</li>
              <li>Wellbeing trends over time</li>
            </ul>
            <div className="legal-highlight">
              <p>
                <strong>Important:</strong> This data is only processed with your explicit consent and is used solely to provide personalized wellbeing support.
              </p>
            </div>
            <h3>2.3 Conversation Data</h3>
            <ul>
              <li>Messages and conversations with Human First AI (our AI coach)</li>
              <li>Journal entries and reflections</li>
              <li>Goals and action items you create</li>
            </ul>
            <h3>2.4 Usage Data</h3>
            <ul>
              <li>Features accessed and learning content completed</li>
              <li>Session duration and frequency</li>
              <li>Device type and browser information</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Legal Basis for Processing</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Legal Basis (GDPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Account creation and service delivery</td>
                  <td>Contract performance (Art. 6(1)(b))</td>
                </tr>
                <tr>
                  <td>Wellbeing tracking and health data</td>
                  <td>Explicit consent (Art. 9(2)(a))</td>
                </tr>
                <tr>
                  <td>AI coaching conversations</td>
                  <td>Contract performance (Art. 6(1)(b))</td>
                </tr>
                <tr>
                  <td>Service improvement and analytics</td>
                  <td>Legitimate interest (Art. 6(1)(f))</td>
                </tr>
                <tr>
                  <td>Marketing communications</td>
                  <td>Consent (Art. 6(1)(a))</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="legal-section">
            <h2>4. How We Use Your Data</h2>
            <ul>
              <li><strong>Personalized Coaching:</strong> To provide AI-powered coaching tailored to your wellbeing patterns and goals</li>
              <li><strong>Trend Analysis:</strong> To show you insights about your mood, energy, and stress over time</li>
              <li><strong>Content Recommendations:</strong> To suggest relevant exercises, articles, and meditations</li>
              <li><strong>Service Improvement:</strong> To improve our AI models and platform features (using anonymized/aggregated data)</li>
              <li><strong>Communications:</strong> To send service notifications and, with consent, wellness tips and updates</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. AI and Automated Decision-Making</h2>
            <p>Human First AI uses artificial intelligence to:</p>
            <ul>
              <li>Generate personalized coaching responses</li>
              <li>Identify patterns in your wellbeing data</li>
              <li>Recommend relevant content and exercises</li>
              <li>Provide burnout risk indicators</li>
            </ul>
            <p>
              These AI features are designed to support your wellbeing journey but do not make decisions that have legal or similarly significant effects on you. You always remain in control of your data and can request human review of any AI-generated insights.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Cloud hosting (EU-based for EEA users), AI services (with appropriate safeguards), email services</li>
              <li><strong>Our Partners:</strong> Data may be shared between BrainBank and Human First AI for service delivery, subject to appropriate data protection agreements</li>
              <li><strong>Your Organization:</strong> If you're on an enterprise plan, your organization may receive aggregated, anonymized team insights only — never individual data without your explicit consent</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. International Data Transfers</h2>
            <p>
              As a cross-border collaboration between Singapore and Sweden, your data may be transferred internationally:
            </p>
            <ul>
              <li><strong>EEA Users:</strong> Your data is primarily processed within the EU/EEA. Any transfer outside the EEA (including to Singapore) is protected by EU Standard Contractual Clauses (SCCs) as adopted by European Commission Implementing Decision (EU) 2021/914.</li>
              <li><strong>Singapore Users:</strong> Your data is processed in compliance with the Personal Data Protection Act (PDPA) 2012.</li>
            </ul>
            <p>
              We conduct Transfer Impact Assessments where required and implement supplementary security measures to protect your data.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Data Retention</h2>
            <ul>
              <li><strong>Account data:</strong> Retained while your account is active, plus 30 days after deletion request</li>
              <li><strong>Wellbeing data:</strong> Retained while your account is active; deleted upon account deletion</li>
              <li><strong>Conversation history:</strong> Retained for 12 months, then anonymized</li>
              <li><strong>Anonymized analytics:</strong> May be retained indefinitely for research and service improvement</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Your Rights</h2>
            <h3>For EEA Users (GDPR Rights)</h3>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Restriction:</strong> Request limited processing of your data</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
              <li><strong>Withdraw Consent:</strong> At any time for consent-based processing</li>
              <li><strong>AI Transparency:</strong> Request explanation of AI-assisted decisions</li>
            </ul>
            <h3>For Singapore Users (PDPA Rights)</h3>
            <ul>
              <li><strong>Access:</strong> Request information about your personal data</li>
              <li><strong>Correction:</strong> Request correction of errors or omissions</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for collection, use, or disclosure</li>
            </ul>
            <p>
              <strong>To exercise these rights,</strong> go to Settings &gt; Privacy in the app, or contact <a href="mailto:policy@brainbank.world">policy@brainbank.world</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Data Security</h2>
            <ul>
              <li>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Role-based access controls and audit logging</li>
              <li>Data hosted in secure, certified data centers</li>
              <li>Privacy by design principles embedded in development</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>11. Data Breach Response</h2>
            <p>In the event of a personal data breach, we will:</p>
            <ul>
              <li>Notify the relevant supervisory authority within 72 hours (GDPR) or as soon as practicable (PDPA)</li>
              <li>Notify affected individuals if the breach poses a high risk to their rights</li>
              <li>Document the breach and remedial actions taken</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>12. Children's Privacy</h2>
            <p>
              Human First AI is not intended for users under 16 years of age. We do not knowingly collect personal data from children.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. Significant changes will be communicated via email or through the Service at least 30 days before taking effect.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Contact &amp; Complaints</h2>
            <p>For all inquiries:</p>
            <p>
              <strong>BrainBank</strong><br />
              <a href="mailto:policy@brainbank.world">policy@brainbank.world</a>
            </p>
            <p>
              EEA users may also lodge a complaint with the Swedish Data Protection Authority (IMY) or their local supervisory authority. Singapore users may contact the Personal Data Protection Commission (PDPC).
            </p>
          </section>
        </div>

        {/* Back Link */}
        <Link to="/" className="legal-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Human First AI
        </Link>
      </div>
    </div>
  );
}
