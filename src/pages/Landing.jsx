/**
 * Landing Page
 * Public marketing page for Human First AI
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { get, post } from '@/utils/api';

export default function Landing() {
  const { t, i18n } = useTranslation('landing');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState([]);
  const [formState, setFormState] = useState('idle'); // idle | sending | success | error
  const [formError, setFormError] = useState('');

  const demoRef = useRef(null);
  const animateObserver = useRef(null);

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Scroll animations via IntersectionObserver
  useEffect(() => {
    animateObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('l-visible');
            animateObserver.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.l-animate').forEach((el) => {
      animateObserver.current.observe(el);
    });

    return () => animateObserver.current?.disconnect();
  }, []);

  // Load testimonials
  const loadTestimonials = useCallback(async (lang) => {
    try {
      const res = await get(`/api/public/testimonials?lang=${lang}`);
      setTestimonials(res.data || []);
    } catch {
      setTestimonials([]);
    }
  }, []);

  useEffect(() => {
    loadTestimonials(i18n.language);
  }, [i18n.language, loadTestimonials]);

  // Language toggle
  const setLang = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Scroll to demo form
  const scrollToDemo = () => {
    if (demoRef.current) {
      const navH = 64;
      const top = demoRef.current.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Smooth scroll for anchor links
  const scrollToId = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const navH = 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Contact form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormState('sending');

    const form = e.target;
    const name = form.elements.name.value.trim();
    const company = form.elements.company.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    try {
      const res = await post('/api/public/contact', { name, company, email, message });
      if (res.success) {
        setFormState('success');
      } else {
        setFormError(res.error?.message || t('form.error.generic'));
        setFormState('error');
      }
    } catch {
      setFormError(t('form.error.generic'));
      setFormState('error');
    }
  };

  // Don't render while checking auth
  if (isLoading) return null;

  const lang = i18n.language;

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className="l-nav" role="navigation" aria-label="Main navigation">
        <div className="l-nav-inner">
          <Link className="l-nav-brand" to="/">
            <div className="logo">
              <svg className="logo-icon" viewBox="0 0 32 32" width="32" height="32">
                <circle cx="17" cy="16" r="12" fill="none" stroke="#2D4A47" strokeWidth="1.5" />
                <circle cx="16.5" cy="16" r="9" fill="none" stroke="#7A9E97" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="6" fill="none" stroke="#C4956A" strokeWidth="1.5" />
                <circle cx="15.5" cy="16" r="3" fill="none" stroke="#D4A9A0" strokeWidth="1.5" />
              </svg>
            </div>
            <span>{t('nav.brand')}</span>
          </Link>
          <div className="l-nav-actions">
            <LangToggle lang={lang} setLang={setLang} />
            <Link to="/login" className="l-btn-ghost">{t('nav.login')}</Link>
            <button className="l-btn-primary" onClick={scrollToDemo}>{t('nav.demo')}</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="l-hero" id="l-hero">
        <div className="l-hero-bg" role="presentation" aria-hidden="true" />
        <div className="l-hero-content l-container">
          <p className="l-hero-eyebrow l-animate">{t('hero.eyebrow')}</p>
          <h1 className="l-hero-headline l-animate l-animate-delay-1">{t('hero.headline')}</h1>
          <p className="l-hero-sub l-animate l-animate-delay-2">{t('hero.sub')}</p>
          <div className="l-hero-actions l-animate l-animate-delay-3">
            <button className="l-btn-ember" onClick={scrollToDemo}>{t('hero.cta1')}</button>
            <a href="#l-how" className="l-btn-outline-white" onClick={(e) => scrollToId(e, 'l-how')}>
              {t('hero.cta2')}
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="l-problem" id="l-problem">
        <div className="l-container">
          <h2 className="l-section-headline l-animate">{t('problem.headline')}</h2>
          <p className="l-eve-body l-animate l-animate-delay-1">{t('problem.body')}</p>
          <div className="l-stat-grid">
            <div className="l-stat-card l-stat-card-sage l-animate l-animate-delay-1">
              <div className="l-stat-number">{t('stat1.number')}</div>
              <p className="l-stat-label">{t('stat1.label')}</p>
            </div>
            <div className="l-stat-card l-stat-card-ember l-animate l-animate-delay-2">
              <div className="l-stat-number">{t('stat2.number')}</div>
              <p className="l-stat-label">{t('stat2.label')}</p>
            </div>
            <div className="l-stat-card l-stat-card-forest l-animate l-animate-delay-3">
              <div className="l-stat-number">{t('stat3.number')}</div>
              <p className="l-stat-label">{t('stat3.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHT */}
      <section className="l-insight" id="l-insight">
        <div className="l-insight-inner l-container">
          <div className="l-insight-header">
            <p className="l-insight-eyebrow l-animate">{t('insight.eyebrow')}</p>
            <h2 className="l-section-headline l-animate l-animate-delay-1">{t('insight.headline')}</h2>
            <p className="l-eve-body l-animate l-animate-delay-2">{t('insight.body')}</p>
          </div>
          <div className="l-compare-grid">
            <div className="l-compare-card l-old l-animate l-animate-delay-1">
              <p className="l-compare-label">{t('insight.old.label')}</p>
              <h3 className="l-compare-title">{t('insight.old.title')}</h3>
              <ul className="l-compare-list">
                <li>{t('insight.old.1')}</li>
                <li>{t('insight.old.2')}</li>
                <li>{t('insight.old.3')}</li>
                <li>{t('insight.old.4')}</li>
              </ul>
            </div>
            <div className="l-compare-card l-new l-animate l-animate-delay-2">
              <p className="l-compare-label">{t('insight.new.label')}</p>
              <h3 className="l-compare-title">{t('insight.new.title')}</h3>
              <ul className="l-compare-list">
                <li>{t('insight.new.1')}</li>
                <li>{t('insight.new.2')}</li>
                <li>{t('insight.new.3')}</li>
                <li>{t('insight.new.4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MEET EVE */}
      <section className="l-eve" id="l-eve">
        <div className="l-eve-inner l-container">
          <div className="l-eve-image" aria-hidden="true">
            <img src="/images/landing/solution.jpg" alt="" loading="lazy" />
          </div>
          <div className="l-eve-copy">
            <p className="l-eve-eyebrow l-animate">{t('eve.eyebrow')}</p>
            <h2 className="l-eve-headline l-animate l-animate-delay-1">{t('eve.headline')}</h2>
            <p className="l-eve-body l-animate l-animate-delay-2">{t('eve.body')}</p>
            <ul className="l-eve-capabilities l-animate l-animate-delay-3">
              <li>{t('eve.cap1')}</li>
              <li>{t('eve.cap2')}</li>
              <li>{t('eve.cap3')}</li>
              <li>{t('eve.cap4')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="l-pillars" id="l-pillars">
        <div className="l-pillars-inner l-container">
          <div className="l-pillars-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('pillars.headline')}</h2>
            <p className="l-pillars-sub">{t('pillars.sub')}</p>
          </div>
          <div className="l-pillars-grid">
            <div className="l-pillar-card l-animate l-animate-delay-1">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar1.title')}</h3>
              <p className="l-pillar-body">{t('pillar1.body')}</p>
            </div>
            <div className="l-pillar-card l-animate l-animate-delay-2">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar2.title')}</h3>
              <p className="l-pillar-body">{t('pillar2.body')}</p>
            </div>
            <div className="l-pillar-card l-animate l-animate-delay-3">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar3.title')}</h3>
              <p className="l-pillar-body">{t('pillar3.body')}</p>
            </div>
            <div className="l-pillar-card l-animate l-animate-delay-4">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                <circle cx="5" cy="12" r="2.5" />
                <circle cx="19" cy="12" r="2.5" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar4.title')}</h3>
              <p className="l-pillar-body">{t('pillar4.body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="l-how" id="l-how">
        <div className="l-how-inner l-container">
          <div className="l-how-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('how.headline')}</h2>
          </div>
          <div className="l-steps-grid">
            <div className="l-step l-animate l-animate-delay-1">
              <div className="l-step-number" aria-hidden="true">1</div>
              <h3 className="l-step-title">{t('step1.title')}</h3>
              <p className="l-step-body">{t('step1.body')}</p>
            </div>
            <div className="l-step l-animate l-animate-delay-2">
              <div className="l-step-number" aria-hidden="true">2</div>
              <h3 className="l-step-title">{t('step2.title')}</h3>
              <p className="l-step-body">{t('step2.body')}</p>
            </div>
            <div className="l-step l-animate l-animate-delay-3">
              <div className="l-step-number" aria-hidden="true">3</div>
              <h3 className="l-step-title">{t('step3.title')}</h3>
              <p className="l-step-body">{t('step3.body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="l-testimonials" id="l-testimonials">
        <div className="l-testimonials-inner l-container">
          <div className="l-testimonials-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('testimonials.headline')}</h2>
            <p className="l-pillars-sub">{t('testimonials.sub')}</p>
          </div>
          <div className="l-testimonials-grid">
            {testimonials.length === 0 ? (
              <p className="l-testimonials-empty">{t('testimonials.empty')}</p>
            ) : (
              testimonials.map((item, i) => (
                <div className="l-testimonial-card l-animate l-visible" key={i}>
                  <p className="l-testimonial-quote">{item.content}</p>
                  <p className="l-testimonial-attribution">{item.attribution}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* DEMO / CONTACT FORM */}
      <section className="l-demo" id="l-demo" ref={demoRef}>
        <div className="l-demo-inner l-container">
          <h2 className="l-demo-headline l-animate">{t('demo.headline')}</h2>
          <p className="l-demo-sub l-animate l-animate-delay-1">{t('demo.sub')}</p>

          {formState === 'success' ? (
            <div className="l-form-success" role="status">
              <div className="l-form-success-icon" aria-hidden="true">&#10003;</div>
              <p className="l-form-success-title">{t('form.success.title')}</p>
              <p className="l-form-success-body">{t('form.success.body')}</p>
            </div>
          ) : (
            <form className="l-contact-form l-animate l-animate-delay-2" onSubmit={handleSubmit} noValidate>
              <div className="l-form-row">
                <input className="l-input" type="text" name="name" maxLength={100} required placeholder={t('form.name')} />
                <input className="l-input" type="text" name="company" maxLength={200} required placeholder={t('form.company')} />
              </div>
              <input className="l-input" type="email" name="email" required placeholder={t('form.email')} />
              <textarea className="l-input l-textarea" name="message" maxLength={3000} placeholder={t('form.message')} />
              {formError && <p className="l-form-error" role="alert">{formError}</p>}
              <div className="l-form-submit">
                <button className="l-btn-ember" type="submit" disabled={formState === 'sending'}>
                  {formState === 'sending' ? t('form.sending') : t('form.submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer" role="contentinfo">
        <div className="l-footer-inner l-container">
          <span className="l-footer-brand">
            Human First AI &middot; Powered by{' '}
            <a href="https://brainbank.world" target="_blank" rel="noopener noreferrer" className="l-footer-brand-link">
              Brainbank.world
            </a>
          </span>
          <nav className="l-footer-links" aria-label="Footer navigation">
            <Link className="l-footer-link" to="/privacy-policy">{t('footer.privacy')}</Link>
            <Link className="l-footer-link" to="/terms-of-service">{t('footer.terms')}</Link>
          </nav>
          <div className="l-footer-right">
            <LangToggle lang={lang} setLang={setLang} dark />
            <Link to="/login" className="l-footer-link">{t('footer.login')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Language toggle pill component
 */
function LangToggle({ lang, setLang, dark = false }) {
  return (
    <div className={`l-lang-toggle${dark ? ' l-lang-toggle-dark' : ''}`} role="group" aria-label="Language selection">
      <button
        className={`l-lang-btn${lang === 'en' ? ' l-active' : ''}`}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        className={`l-lang-btn${lang === 'sv' ? ' l-active' : ''}`}
        onClick={() => setLang('sv')}
      >
        SV
      </button>
    </div>
  );
}
