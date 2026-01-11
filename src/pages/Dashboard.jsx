/**
 * Dashboard Page
 * Main landing page with daily check-in, trends, and quick access cards
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { get } from '@/utils/api';

// Hero image import
import heroImage from '@/assets/images/hero-nordic-calm.jpg';

// SVG Icons
const icons = {
  heartPulse: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
    </svg>
  ),
  bookOpen: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  flame: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
  ),
  lightbulb: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  ),
  playCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
      <line x1="16" x2="16" y1="2" y2="6"></line>
      <line x1="8" x2="8" y1="2" y2="6"></line>
      <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
  ),
  trendingUp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  trendingDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
      <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
  ),
  minus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
};

export default function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      const [dashboardResponse, trendsResponse] = await Promise.all([
        get('/api/dashboard').catch(() => ({ success: false })),
        get('/api/checkin/trends?period=7').catch(() => ({ success: false })),
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }

      if (trendsResponse.success) {
        setTrends(trendsResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || t('common:user', 'there');

    if (hour < 12) {
      return t('dashboard:hero.greeting.morning', { name, defaultValue: `Good morning, ${name}` });
    } else if (hour < 17) {
      return t('dashboard:hero.greeting.afternoon', { name, defaultValue: `Good afternoon, ${name}` });
    } else {
      return t('dashboard:hero.greeting.evening', { name, defaultValue: `Good evening, ${name}` });
    }
  }

  function getTodayDate() {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  function getTrendIcon(change, metric) {
    if (change === 0 || change === undefined) {
      return icons.minus;
    }
    if (metric === 'stress') {
      return change < 0 ? icons.trendingDown : icons.trendingUp;
    }
    return change > 0 ? icons.trendingUp : icons.trendingDown;
  }

  function getTrendClass(change, metric) {
    if (change === 0 || change === undefined) return 'neutral';
    if (metric === 'stress') {
      return change < 0 ? 'positive' : 'negative';
    }
    return change > 0 ? 'positive' : 'negative';
  }

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>{t('common:loading', 'Loading...')}</p>
      </div>
    );
  }

  const hasCheckedIn = dashboardData?.todaysCheckin != null;
  const streak = dashboardData?.streak || 0;
  const insightsCount = dashboardData?.insightsCount || 0;

  return (
    <div className="dashboard-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image-container">
          <img
            src={heroImage}
            alt="Abstract Nordic landscape"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{getGreeting()}</h1>
          <p className="hero-date">{getTodayDate()}</p>
          <p className="hero-tagline">
            {t('dashboard:hero.tagline', 'Lead with resilience. Build with purpose.')}
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards">
        {/* Check-in Card */}
        <div
          className={`card ${hasCheckedIn ? 'checked-in' : ''}`}
          onClick={() => navigate('/checkin')}
        >
          <div className="card-content">
            <div className="card-icon">
              {icons.heartPulse}
            </div>
            <h3 className="card-title">
              {t('dashboard:checkinCard.title', 'Daily Check-in')}
            </h3>
            <p className="card-description">
              {hasCheckedIn
                ? t('dashboard:checkinCard.completed', "You've completed today's check-in")
                : t('dashboard:checkinCard.description', 'Start your day with a quick reflection')}
            </p>
            <div className="streak-badge">
              {icons.flame}
              <span className="streak-count">
                {streak} {t('dashboard:checkinCard.streak', 'day streak')}
              </span>
            </div>
          </div>
          <button
            className={`btn ${hasCheckedIn ? 'btn-secondary' : 'btn-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/checkin');
            }}
          >
            {hasCheckedIn
              ? t('dashboard:checkinCard.retake', 'Retake')
              : t('dashboard:checkinCard.button', 'Begin Check-in')}
          </button>
        </div>

        {/* Today's Focus Card */}
        <div
          className="card card-secondary"
          onClick={() => navigate('/learning')}
        >
          <div className="card-content">
            <div className="card-icon">
              {icons.bookOpen}
            </div>
            <h3 className="card-title">
              {t('dashboard:focusCard.title', "Today's Focus")}
            </h3>
            <p className="card-description todays-focus-title">
              {dashboardData?.todaysFocus?.title ||
                t('dashboard:focusCard.noFocus', 'No focus set for today')}
            </p>
            {dashboardData?.todaysFocus && (
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${dashboardData.todaysFocus.progress || 0}%` }}
                  />
                </div>
                <span className="progress-text">
                  {dashboardData.todaysFocus.progress || 0}%
                </span>
              </div>
            )}
          </div>
          <button
            className="btn btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/learning');
            }}
          >
            {t('dashboard:focusCard.button', 'Continue')}
          </button>
        </div>
      </div>

      {/* Week at a Glance */}
      <section className="week-glance-section">
        <h2 className="section-title">
          {t('dashboard:weekGlance.title', 'Your Week at a Glance')}
        </h2>
        <div className="trends-card">
          {/* Mood Trend */}
          <div className="trend-item">
            <div className="trend-header">
              <span className="trend-label">
                {t('common:trends.mood', 'Mood')}
              </span>
              <span className={`trend-change ${getTrendClass(trends?.moodChange, 'mood')}`}>
                {getTrendIcon(trends?.moodChange, 'mood')}
              </span>
            </div>
            <div className="mini-chart">
              <svg className="trend-line" viewBox="0 0 100 40" preserveAspectRatio="none">
                {(trends?.moodValues || Array(7).fill(5)).map((val, i, arr) => {
                  const x = (i / (arr.length - 1)) * 100;
                  const height = (val / 10) * 40;
                  return (
                    <rect
                      key={i}
                      x={x - 3}
                      y={40 - height}
                      width="6"
                      height={height}
                      fill="var(--color-sage)"
                      rx="2"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Energy Trend */}
          <div className="trend-item">
            <div className="trend-header">
              <span className="trend-label">
                {t('common:trends.energy', 'Energy')}
              </span>
              <span className={`trend-change ${getTrendClass(trends?.energyChange, 'energy')}`}>
                {getTrendIcon(trends?.energyChange, 'energy')}
              </span>
            </div>
            <div className="mini-chart">
              <svg className="trend-line" viewBox="0 0 100 40" preserveAspectRatio="none">
                {(trends?.energyValues || Array(7).fill(5)).map((val, i, arr) => {
                  const x = (i / (arr.length - 1)) * 100;
                  const height = (val / 10) * 40;
                  return (
                    <rect
                      key={i}
                      x={x - 3}
                      y={40 - height}
                      width="6"
                      height={height}
                      fill="var(--color-sage)"
                      rx="2"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Stress Trend */}
          <div className="trend-item">
            <div className="trend-header">
              <span className="trend-label">
                {t('common:trends.stress', 'Stress')}
              </span>
              <span className={`trend-change ${getTrendClass(trends?.stressChange, 'stress')}`}>
                {getTrendIcon(trends?.stressChange, 'stress')}
              </span>
            </div>
            <div className="mini-chart">
              <svg className="trend-line" viewBox="0 0 100 40" preserveAspectRatio="none">
                {(trends?.stressValues || Array(7).fill(5)).map((val, i, arr) => {
                  const x = (i / (arr.length - 1)) * 100;
                  const height = (val / 10) * 40;
                  return (
                    <rect
                      key={i}
                      x={x - 3}
                      y={40 - height}
                      width="6"
                      height={height}
                      fill="var(--color-success)"
                      rx="2"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="quick-access-section">
        <h2 className="section-title">
          {t('dashboard:quickAccess.title', 'Quick Access')}
        </h2>
        <div className="quick-cards">
          <div className="quick-card" onClick={() => navigate('/progress')}>
            <div className="quick-card-icon">
              {icons.lightbulb}
            </div>
            <h4 className="quick-card-title">
              {t('dashboard:quickAccess.insights', 'Insights')}
            </h4>
            <p className="quick-card-meta">
              {t('dashboard:quickAccess.insightsCount', {
                count: insightsCount,
                defaultValue: `${insightsCount} insights waiting`,
              })}
            </p>
          </div>

          <div className="quick-card" onClick={() => navigate('/learning')}>
            <div className="quick-card-icon">
              {icons.playCircle}
            </div>
            <h4 className="quick-card-title">
              {t('dashboard:quickAccess.learning', 'Learning')}
            </h4>
            <p className="quick-card-meta">
              {t('dashboard:quickAccess.continueModule', 'Continue module')}
            </p>
          </div>

          <div className="quick-card" onClick={() => navigate('/circles')}>
            <div className="quick-card-icon">
              {icons.calendar}
            </div>
            <h4 className="quick-card-title">
              {t('dashboard:quickAccess.nextCircle', 'Next Circle')}
            </h4>
            <p className="quick-card-meta">
              {dashboardData?.nextCircle?.date || '—'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
