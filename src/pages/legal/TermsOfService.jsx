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
            Human First AI
          </Link>
          <h1 className="legal-title">Terms of Use</h1>
          <p className="legal-meta">Last updated: January 2025</p>
        </header>

        {/* Content */}
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using Human First AI ("the Service"), you agree to be bound by these Terms of Use ("Terms") and our Privacy Policy. If you do not agree to these Terms, please do not use the Service.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and the Service providers:
            </p>
            <ul>
              <li><strong>BrainBank Pte Ltd</strong> (Singapore) — Technology and AI services</li>
              <li><strong>Human First AI AB</strong> (Sweden) — Wellbeing methodology and EU operations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              Human First AI is an AI-powered leadership development and wellbeing platform that provides:
            </p>
            <ul>
              <li><strong>Daily Check-ins:</strong> Track your mood, energy, stress, and sleep</li>
              <li><strong>AI Coaching:</strong> Personalized conversations with Human First AI, our AI wellness coach</li>
              <li><strong>Learning Content:</strong> Articles, exercises, meditations, and breathing techniques</li>
              <li><strong>Progress Tracking:</strong> Visualize your wellbeing trends over time</li>
              <li><strong>Goal Setting:</strong> Set and track personal development goals</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use the Service, you must create an account with accurate and complete information. You may register using your email address or through your organization if you have an enterprise account.
            </p>
            <h3>3.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <h3>3.3 Account Types</h3>
            <ul>
              <li><strong>Individual Accounts:</strong> Personal use for wellbeing tracking and coaching</li>
              <li><strong>Enterprise Accounts:</strong> Organization-sponsored accounts with additional features</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or in violation of any laws</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or its servers</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Share your account credentials with others</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Upload malicious code or content</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. AI-Generated Content</h2>
            <div className="legal-highlight">
              <p>
                <strong>Important Health Disclaimer:</strong> Human First AI provides AI-powered coaching and content for general wellbeing and personal development purposes only. Human First AI is NOT a substitute for professional medical, psychological, psychiatric, or therapeutic advice, diagnosis, or treatment.
              </p>
            </div>
            <h3>5.1 Nature of AI Coaching</h3>
            <p>Human First AI's AI coaching:</p>
            <ul>
              <li>Provides supportive conversations and general wellness guidance</li>
              <li>Offers evidence-based techniques for stress management and wellbeing</li>
              <li>Helps you reflect on patterns and set goals</li>
              <li>Is not capable of providing clinical diagnosis or treatment</li>
            </ul>
            <h3>5.2 Seeking Professional Help</h3>
            <p>If you are experiencing:</p>
            <ul>
              <li>Thoughts of self-harm or suicide</li>
              <li>Severe depression or anxiety</li>
              <li>A mental health crisis</li>
              <li>Any medical emergency</li>
            </ul>
            <p>
              Please contact emergency services, a mental health professional, or a crisis helpline immediately. Human First AI is not designed to handle emergencies.
            </p>
            <h3>5.3 AI Limitations</h3>
            <p>While we strive for accuracy, AI-generated content may occasionally:</p>
            <ul>
              <li>Contain inaccuracies or outdated information</li>
              <li>Misunderstand context or nuance</li>
              <li>Provide responses that don't fully address your situation</li>
            </ul>
            <p>You should always use your judgment and seek professional advice for important decisions.</p>
          </section>

          <section className="legal-section">
            <h2>6. User Content</h2>
            <h3>6.1 Your Content</h3>
            <p>
              You retain ownership of content you create in the Service (journal entries, messages, goals, etc.). By using the Service, you grant us a license to process this content to provide and improve the Service.
            </p>
            <h3>6.2 Content Guidelines</h3>
            <p>You agree not to submit content that:</p>
            <ul>
              <li>Is illegal, harmful, threatening, or abusive</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains personal information about others without consent</li>
              <li>Contains malware or harmful code</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Intellectual Property</h2>
            <h3>7.1 Our Intellectual Property</h3>
            <p>
              The Service, including its design, features, content, and underlying technology, is owned by BrainBank Pte Ltd and Human First AI AB and is protected by international intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.
            </p>
            <h3>7.2 License to Use</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial purposes in accordance with these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Privacy and Data Protection</h2>
            <p>
              Your use of the Service is also governed by our <Link to="/privacy-policy">Privacy Policy</Link>, which describes how we collect, use, and protect your personal data, including:
            </p>
            <ul>
              <li>Compliance with GDPR (for EU/EEA users)</li>
              <li>Compliance with PDPA (for Singapore users)</li>
              <li>Special handling of health-related data</li>
              <li>Cross-border data transfer safeguards</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Enterprise Accounts</h2>
            <p>If you access the Service through an enterprise account provided by your organization:</p>
            <ul>
              <li>Your organization may have access to aggregated, anonymized usage data</li>
              <li>Your individual check-in data and conversations remain private unless you explicitly consent to share</li>
              <li>Additional terms from your organization's agreement may apply</li>
              <li>Your organization's administrator may manage certain account settings</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. Fees and Payment</h2>
            <h3>10.1 Free and Premium Features</h3>
            <p>
              Some features of the Service may be available for free, while others may require a subscription. We will clearly indicate which features require payment.
            </p>
            <h3>10.2 Subscription Terms</h3>
            <p>If you purchase a subscription:</p>
            <ul>
              <li>Subscriptions renew automatically unless cancelled</li>
              <li>You can cancel at any time through your account settings</li>
              <li>Refunds are provided in accordance with applicable law and our refund policy</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>11. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul>
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We do not guarantee the Service will be uninterrupted or error-free</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability shall not exceed the amount you paid for the Service in the past 12 months</li>
            </ul>
            <p>Some jurisdictions do not allow limitation of liability, so some of these limitations may not apply to you.</p>
          </section>

          <section className="legal-section">
            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless BrainBank, Human First AI, and their officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Termination</h2>
            <h3>13.1 Termination by You</h3>
            <p>
              You may terminate your account at any time through your account settings or by contacting us. Upon termination, your data will be handled in accordance with our Privacy Policy.
            </p>
            <h3>13.2 Termination by Us</h3>
            <p>We may suspend or terminate your account if you:</p>
            <ul>
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Pose a risk to other users or the Service</li>
            </ul>
            <p>We will provide notice when reasonably possible.</p>
            <h3>13.3 Effect of Termination</h3>
            <p>Upon termination:</p>
            <ul>
              <li>Your right to use the Service ends immediately</li>
              <li>You may request export of your data (subject to our data retention policies)</li>
              <li>Provisions that by their nature should survive will continue to apply</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>14. Dispute Resolution</h2>
            <h3>14.1 Informal Resolution</h3>
            <p>
              We encourage you to contact us first to resolve any disputes informally. Most issues can be resolved quickly through our support team.
            </p>
            <h3>14.2 Governing Law</h3>
            <ul>
              <li><strong>For EU/EEA Users:</strong> These Terms are governed by Swedish law. You may bring claims in Swedish courts or the courts of your country of residence.</li>
              <li><strong>For Singapore/APAC Users:</strong> These Terms are governed by Singapore law. Disputes may be resolved through arbitration at the Singapore International Arbitration Centre (SIAC).</li>
            </ul>
            <h3>14.3 Consumer Rights</h3>
            <p>
              Nothing in these Terms affects your statutory consumer rights under applicable law, including EU consumer protection regulations.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Changes to Terms</h2>
            <p>We may update these Terms from time to time. For significant changes:</p>
            <ul>
              <li>We will provide at least 30 days notice via email or in-app notification</li>
              <li>Continued use after changes take effect constitutes acceptance</li>
              <li>If you disagree with changes, you may terminate your account</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>16. General Provisions</h2>
            <h3>16.1 Entire Agreement</h3>
            <p>
              These Terms, together with the Privacy Policy, constitute the entire agreement between you and us regarding the Service.
            </p>
            <h3>16.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in effect.
            </p>
            <h3>16.3 No Waiver</h3>
            <p>
              Our failure to enforce any right or provision of these Terms does not constitute a waiver.
            </p>
            <h3>16.4 Assignment</h3>
            <p>
              You may not assign your rights under these Terms without our consent. We may assign our rights in connection with a merger, acquisition, or sale of assets.
            </p>
            <h3>16.5 Language</h3>
            <p>
              These Terms are provided in English. If translated, the English version prevails in case of conflict.
            </p>
          </section>

          <section className="legal-section">
            <h2>17. Contact Information</h2>
            <p>For questions about these Terms:</p>
            <p>
              <strong>BrainBank</strong><br />
              <a href="mailto:policy@brainbank.world">policy@brainbank.world</a>
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
