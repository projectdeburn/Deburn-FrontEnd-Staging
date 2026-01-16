/**
 * Progress Page
 * Track wellbeing trends and achievements
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { get } from '@/utils/api';

// Hero image import
import heroProgress from '@/assets/images/hero-progress.jpg';

// SVG Icons
const icons = {
  flame: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
  ),
  checkCircle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  bookOpen: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  messageCircle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  trendingUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  trendingDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
      <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
  ),
  minus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  lightbulb: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  ),
  sparkles: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      <path d="M5 3v4"></path>
      <path d="M19 17v4"></path>
      <path d="M3 5h4"></path>
      <path d="M17 19h4"></path>
    </svg>
  ),
};

export default function Progress() {
  const { t } = useTranslation(['progress', 'common']);

  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [stats, setStats] = useState({
    streak: 0,
    checkins: 0,
    lessons: 0,
    sessions: 0,
  });
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadProgressData();
  }, [period]);

  async function loadProgressData() {
    setIsLoading(true);
    try {
      const [statsRes, trendsRes, insightsRes] = await Promise.all([
        get('/api/progress/stats').catch(() => ({ success: false })),
        get(`/api/checkin/trends?period=${period}`).catch(() => ({ success: false })),
        get('/api/progress/insights').catch(() => ({ success: false })),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (trendsRes.success) {
        setTrends(trendsRes.data);
      }

      if (insightsRes.success) {
        setInsights(insightsRes.data.insights || []);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getTrendClass(change, metric) {
    if (change === undefined || change === 0) return 'neutral';
    const isPositive = metric === 'stress' ? change < 0 : change > 0;
    return isPositive ? 'positive' : 'negative';
  }

  function getTrendIcon(change) {
    if (change === undefined || change === 0) return icons.minus;
    return change > 0 ? icons.trendingUp : icons.trendingDown;
  }

  function generateChartPath(values, height = 100) {
    if (!values || values.length === 0) {
      return `M0,${height / 2} L400,${height / 2}`;
    }
    const maxVal = Math.max(...values, 10);
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * 400;
      const y = height - (val / maxVal) * (height - 10);
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }

  function generateFillPath(values, height = 100) {
    if (!values || values.length === 0) {
      return `M0,${height / 2} L400,${height / 2} L400,${height} L0,${height} Z`;
    }
    const maxVal = Math.max(...values, 10);
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * 400;
      const y = height - (val / maxVal) * (height - 10);
      return `${x},${y}`;
    });
    return `M${points.join(' L')} L400,${height} L0,${height} Z`;
  }

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>{t('common:loading', 'Loading...')}</p>
      </div>
    );
  }

  return (
    <div className="progress-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image-container">
          <img
            src={heroProgress}
            alt="Abstract curves representing growth"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{t('progress:hero.title', 'Your Progress')}</h1>
          <p className="hero-tagline">
            {t('progress:hero.tagline', 'Track your growth over time')}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <section className="section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              {icons.flame}
            </div>
            <div className="stat-value stat-number">{stats.streak}</div>
            <div className="stat-label">{t('progress:stats.streak', 'Day Streak')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {icons.checkCircle}
            </div>
            <div className="stat-value stat-number">{stats.checkins}</div>
            <div className="stat-label">{t('progress:stats.checkins', 'Check-ins')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {icons.bookOpen}
            </div>
            <div className="stat-value stat-number">{stats.lessons}</div>
            <div className="stat-label">{t('progress:stats.lessons', 'Lessons Completed')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              {icons.messageCircle}
            </div>
            <div className="stat-value stat-number">{stats.sessions}</div>
            <div className="stat-label">{t('progress:stats.sessions', 'Coach Sessions')}</div>
          </div>
        </div>
      </section>

      {/* Wellbeing Trends */}
      <section className="section">
        <h2 className="section-title">
          {t('progress:trends.title', 'Wellbeing Trends')}
          <span className="period-label">
            ({t('progress:trends.last', 'Last')} {period} {t('progress:trends.days', 'Days')})
          </span>
        </h2>
        <div className="period-selector">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              data-period={p}
              onClick={() => setPeriod(p)}
            >
              {p} {t('progress:trends.daysShort', 'Days')}
            </button>
          ))}
        </div>

        <div className="trends-card trends-card-large">
          {/* Mood Chart */}
          <div className="trend-item-large wellbeing-chart" data-metric="mood">
            <div className="trend-header">
              <span className="trend-label">
                {t('progress:trends.mood', 'Overall Mood')}
              </span>
              <span className={`trend-change ${getTrendClass(trends?.moodChange, 'mood')} trend-badge`}>
                {getTrendIcon(trends?.moodChange)}
                <span>{trends?.moodChange !== undefined ? `${Math.abs(trends.moodChange)}%` : '--'}</span>
              </span>
            </div>
            <div className="chart-placeholder">
              <svg viewBox="0 0 400 100" className="trend-chart">
                <defs>
                  <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'var(--color-sage)', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: 'var(--color-sage)', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <path d={generateFillPath(trends?.moodValues)} fill="url(#moodGradient)" />
                <polyline
                  className="chart-line"
                  points={generateChartPath(trends?.moodValues).replace(/M|L/g, ' ').trim()}
                  fill="none"
                  stroke="var(--color-sage)"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          {/* Stress Chart */}
          <div className="trend-item-large wellbeing-chart" data-metric="stress">
            <div className="trend-header">
              <span className="trend-label">
                {t('progress:trends.stress', 'Stress Levels')}
              </span>
              <span className={`trend-change ${getTrendClass(trends?.stressChange, 'stress')} trend-badge`}>
                {getTrendIcon(trends?.stressChange)}
                <span>{trends?.stressChange !== undefined ? `${Math.abs(trends.stressChange)}%` : '--'}</span>
              </span>
            </div>
            <div className="chart-placeholder">
              <svg viewBox="0 0 400 100" className="trend-chart">
                <defs>
                  <linearGradient id="stressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'var(--color-success)', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: 'var(--color-success)', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <path d={generateFillPath(trends?.stressValues)} fill="url(#stressGradient)" />
                <polyline
                  className="chart-line"
                  points={generateChartPath(trends?.stressValues).replace(/M|L/g, ' ').trim()}
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="section">
        <h2 className="section-title">
          {t('progress:insights.title', 'Key Insights')}
        </h2>
        <div className="insights-list">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <div className="insight-icon">
                  {icons.lightbulb}
                </div>
                <div className="insight-content">
                  <h4 className="insight-title">{insight.title}</h4>
                  <p className="insight-description">{insight.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="insight-item empty-state">
              <div className="insight-icon">
                {icons.sparkles}
              </div>
              <div className="insight-content">
                <h4 className="insight-title">
                  {t('progress:insights.noInsights', 'No insights yet')}
                </h4>
                <p className="insight-description">
                  {t('progress:insights.prompt', 'Complete a few check-ins to start seeing personalized insights about your wellbeing patterns.')}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
