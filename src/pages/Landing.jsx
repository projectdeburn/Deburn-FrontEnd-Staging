/**
 * Landing Page
 * Public marketing page for Human First AI
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { PageMeta } from '@/components/common/PageMeta';
import { get, post } from '@/utils/api';
import storyElenaDream from '@/assets/images/story-elena-dream.jpg';
import storyMismatch from '@/assets/images/story-mismatched-priorities.jpg';
import storyLeadership from '@/assets/images/story-leadership-coaching.jpg';
import storyHfai from '@/assets/images/story-hfai.jpg';
import storyEnding from '@/assets/images/story-ending.jpg';

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
      <PageMeta
        path="/"
        title="AI Leadership Coaching & Resilience Training | Human First AI"
        description="Eve is your AI-powered leadership coach. Build stronger teams through personalized micro-learning, real-time feedback, and actionable leadership insights."
      />
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
          <h1 className="l-hero-headline l-animate">{t('hero.headline')}</h1>
          <p className="l-hero-sub l-animate l-animate-delay-1">{t('hero.sub')}</p>
          <p className="l-hero-body l-animate l-animate-delay-2">{t('hero.body')}</p>
          <p className="l-hero-body l-animate l-animate-delay-2">{t('hero.body2')}</p>
        </div>
      </section>

      {/* DEMO VIDEO */}
      <VideoSection t={t} />

      {/* OUR POINT OF VIEW */}
      <section className="l-problem" id="l-pov">
        <div className="l-container">
          <p className="l-insight-eyebrow l-animate">{t('pov.eyebrow')}</p>
          <h2 className="l-section-headline l-animate l-animate-delay-1">{t('pov.headline')}</h2>
          <p className="l-eve-body l-animate l-animate-delay-2">{t('pov.body1')}</p>
          <p className="l-eve-body l-animate l-animate-delay-2">{t('pov.body2')}</p>
          <p className="l-eve-body l-animate l-animate-delay-3">{t('pov.body3')}</p>

          <div className="l-stat-grid l-animate l-animate-delay-3">
            <div className="l-stat-card l-stat-card-sage">
              <div className="l-stat-number">{t('story.stat1.number')}</div>
              <p className="l-stat-label">{t('story.stat1.label')}</p>
            </div>
            <div className="l-stat-card l-stat-card-ember">
              <div className="l-stat-number">{t('story.stat2.number')}</div>
              <p className="l-stat-label">{t('story.stat2.label')}</p>
            </div>
            <div className="l-stat-card l-stat-card-forest">
              <div className="l-stat-number">{t('story.stat3.number')}</div>
              <p className="l-stat-label">{t('story.stat3.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT THIS LOOKS LIKE IN PRACTICE */}
      <section className="l-insight" id="l-story">
        <div className="l-insight-inner l-container">
          <p className="l-insight-eyebrow l-animate">{t('story.eyebrow')}</p>

          <div className="l-story-boxes">

            {/* Box 1 — The Setup */}
            <div className="l-story-box l-animate l-animate-delay-1">
              <span className="l-story-box-step" aria-hidden="true">1</span>
              <img className="l-story-box-img" src={storyElenaDream} alt={t('story.box1.img')} />
              <p className="l-story-box-body" dangerouslySetInnerHTML={{ __html: t('story.box1.body') }} />
            </div>

            {/* Box 2 — The Breaking Point */}
            <div className="l-story-box l-animate l-animate-delay-1">
              <span className="l-story-box-step" aria-hidden="true">2</span>
              <img className="l-story-box-img" src={storyMismatch} alt={t('story.box2.img')} />
              <p className="l-story-box-body" dangerouslySetInnerHTML={{ __html: t('story.box2.body') }} />
            </div>

            {/* Box 3 — The Turning Point */}
            <div className="l-story-box l-animate l-animate-delay-1">
              <span className="l-story-box-step" aria-hidden="true">3</span>
              <img className="l-story-box-img" src={storyLeadership} alt={t('story.box3.img')} />
              <p className="l-story-box-body" dangerouslySetInnerHTML={{ __html: t('story.box3.body') }} />
            </div>

            {/* Box 4 — The Daily Habit */}
            <div className="l-story-box l-story-box--habit l-animate l-animate-delay-1">
              <span className="l-story-box-step" aria-hidden="true">4</span>
              <img className="l-story-box-img" src={storyHfai} alt={t('story.box4.img')} />
              <p className="l-story-box-body" dangerouslySetInnerHTML={{ __html: t('story.box4.intro') }} />
            </div>

            {/* Box 5 — The Result */}
            <div className="l-story-box l-animate l-animate-delay-1">
              <span className="l-story-box-step" aria-hidden="true">5</span>
              <img className="l-story-box-img" src={storyEnding} alt={t('story.box5.img')} />
              <p className="l-story-box-body" dangerouslySetInnerHTML={{ __html: t('story.box5.body') }} />
            </div>

          </div>
        </div>
      </section>

      {/* THE PRODUCT */}
      <section className="l-pillars" id="l-product">
        <div className="l-pillars-inner l-container">
          <div className="l-pillars-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('product.headline')}</h2>
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

          <hr className="l-pillars-divider l-animate l-animate-delay-4" />

          <div className="l-pillars-grid l-pillars-grid--single">
            <div className="l-pillar-card l-animate l-animate-delay-4">
              <svg className="l-pillar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="2" y1="20" x2="22" y2="20" />
              </svg>
              <h3 className="l-pillar-title">{t('pillar5.title')}</h3>
              <p className="l-pillar-body">{t('pillar5.body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT COMPOUNDS */}
      <section className="l-how" id="l-compounds">
        <div className="l-how-inner l-container">
          <div className="l-how-header l-animate">
            <h2 className="l-section-headline l-section-headline-center">{t('compounds.headline')}</h2>
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

      {/* COMPARISON TABLE */}
      <section className="l-comparison" id="l-comparison">
        <div className="l-container">
          <h2 className="l-comparison-headline l-animate">{t('compare.headline')}</h2>
          <div className="l-comparison-wrap l-animate l-animate-delay-1">
            <table className="l-comparison-table">
              <thead>
                <tr>
                  <th className="l-cmp-col-feature">{t('compare.col_feature')}</th>
                  <th className="l-cmp-col-hfai">{t('compare.col_hfai')}</th>
                  <th>{t('compare.col_lms')}</th>
                  <th>{t('compare.col_coaching')}</th>
                  <th>{t('compare.col_manager')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'compare.row1', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: ['partial', 'compare.note_inconsistent'] },
                  { label: 'compare.row2', hfai: 'yes', lms: 'no',  coaching: ['partial', 'compare.note_scheduled'],  manager: 'no' },
                  { label: 'compare.row3', hfai: 'yes', lms: 'yes', coaching: 'no',                                   manager: ['partial', 'compare.note_bandwidth'] },
                  { label: 'compare.row4', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: 'no' },
                  { label: 'compare.row5', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: 'no' },
                  { label: 'compare.row6', hfai: 'yes', lms: 'no',  coaching: 'no',                                   manager: ['partial', 'compare.note_notices'] },
                  { label: 'compare.row7', hfai: 'yes', lms: 'yes', coaching: 'no',                                   manager: ['partial', 'compare.note_time'] },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="l-cmp-col-feature">{t(row.label)}</td>
                    <td className="l-cmp-col-hfai"><CmpCell val={row.hfai} t={t} /></td>
                    <td><CmpCell val={row.lms} t={t} /></td>
                    <td><CmpCell val={row.coaching} t={t} /></td>
                    <td><CmpCell val={row.manager} t={t} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            {(() => {
              const localeItems = t('testimonials.items', { returnObjects: true }) || [];
              const displayItems = testimonials.length > 0 ? testimonials : localeItems;
              return displayItems.length > 0 ? (
                displayItems.map((item, i) => (
                  <div className="l-testimonial-card l-animate l-visible" key={i}>
                    <p className="l-testimonial-quote">{item.content}</p>
                    <p className="l-testimonial-attribution">{item.attribution}</p>
                  </div>
                ))
              ) : (
                <p className="l-testimonials-empty">{t('testimonials.empty')}</p>
              );
            })()}
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
            <form className="l-contact-form l-animate l-animate-delay-3" onSubmit={handleSubmit} noValidate>
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
 * Demo video section — collapsible Vimeo player
 */
function VideoSection({ t }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const hasOpenedRef = useRef(false);
  const closeButtonRef = useRef(null);

  const openVideo = () => {
    hasOpenedRef.current = true;
    setVideoOpen(true);
  };
  const closeVideo = () => setVideoOpen(false);

  useEffect(() => {
    if (videoOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [videoOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && videoOpen) closeVideo();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [videoOpen]);

  return (
    <section className="l-video" id="l-video">
      <div className="l-video-inner">
        {!videoOpen ? (
          <div
            className={`l-video-card l-animate${hasOpenedRef.current ? ' l-visible' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Play demo video"
            onClick={openVideo}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openVideo();
              }
            }}
          >
            <div className="l-video-thumb-wrap">
              <img
                className="l-video-thumb-img"
                src="/images/landing/demo-thumbnail.jpg"
                alt="Human First AI platform demo"
                draggable={false}
              />
              <div className="l-video-play-btn" aria-hidden="true">
                <svg className="l-video-play-icon" viewBox="0 0 24 24" fill="none">
                  <polygon points="9.5,6 9.5,18 19,12" fill="white" />
                </svg>
              </div>
            </div>
            <p className="l-video-card-text">
              <strong>{t('video.headline')}</strong>
              <br />
              <span>{t('video.desc')}</span>
            </p>
          </div>
        ) : (
          <div className="l-video-expanded">
            <button
              className="l-video-close-btn"
              type="button"
              aria-label="Close video"
              ref={closeButtonRef}
              onClick={closeVideo}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="l-video-player">
              <iframe
                src="https://player.vimeo.com/video/1196383244?h=b3aa5b669a&autoplay=1&badge=0&byline=0&portrait=0&title=0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Comparison table cell — renders yes / no / partial+note
 */
function CmpCell({ val, t }) {
  if (val === 'yes') return <span className="l-cmp-yes" aria-label="Yes">✓</span>;
  if (val === 'no')  return <span className="l-cmp-no"  aria-label="No">✗</span>;
  if (Array.isArray(val)) {
    return (
      <span className="l-cmp-partial">
        <span aria-label="Partial">⚠</span>
        <span className="l-cmp-note">{t(val[1])}</span>
      </span>
    );
  }
  return null;
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
