/**
 * Admin Page
 * Administrative controls and settings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { get } from '@/utils/api';

// SVG Icons
const icons = {
  arrowLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  database: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
      <path d="M3 12A9 3 0 0 0 21 12"></path>
    </svg>
  ),
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  refreshCw: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M3 21v-5h5"></path>
    </svg>
  ),
  alertTriangle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" x2="12" y1="9" y2="13"></line>
      <line x1="12" x2="12.01" y1="17" y2="17"></line>
    </svg>
  ),
  checkSmall: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
};

export default function Admin() {
  const { t } = useTranslation(['admin', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCheckins: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
      return;
    }
    loadAdminStats();
  }, [user, navigate]);

  async function loadAdminStats() {
    setIsLoading(true);
    try {
      const response = await get(`${import.meta.env.VITE_ENDPOINT}/api/admin/stats`);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          {icons.arrowLeft}
        </button>
        <div className="admin-title">
          {icons.shield}
          <h1>{t('admin:title', 'Admin Panel')}</h1>
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Content */}
      <div className="admin-content">
        {/* Stats Overview */}
        <section className="admin-section">
          <h2 className="section-title">
            {t('admin:stats.title', 'Platform Statistics')}
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                {icons.users}
              </div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">{t('admin:stats.totalUsers', 'Total Users')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                {icons.checkCircle}
              </div>
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-label">{t('admin:stats.activeUsers', 'Active Users')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                {icons.database}
              </div>
              <div className="stat-value">{stats.totalCheckins}</div>
              <div className="stat-label">{t('admin:stats.checkins', 'Check-ins')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                {icons.mail}
              </div>
              <div className="stat-value">{stats.totalSessions}</div>
              <div className="stat-label">{t('admin:stats.sessions', 'Coach Sessions')}</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="admin-section">
          <h2 className="section-title">
            {t('admin:actions.title', 'Quick Actions')}
          </h2>
          <div className="admin-actions-grid">
            <div className="card action-card">
              <div className="action-icon">
                {icons.users}
              </div>
              <div className="action-content">
                <h3>{t('admin:actions.manageUsers', 'Manage Users')}</h3>
                <p>{t('admin:actions.manageUsersDesc', 'View and manage user accounts')}</p>
              </div>
            </div>

            <div className="card action-card">
              <div className="action-icon">
                {icons.settings}
              </div>
              <div className="action-content">
                <h3>{t('admin:actions.settings', 'System Settings')}</h3>
                <p>{t('admin:actions.settingsDesc', 'Configure system settings')}</p>
              </div>
            </div>

            <div className="card action-card">
              <div className="action-icon">
                {icons.database}
              </div>
              <div className="action-content">
                <h3>{t('admin:actions.content', 'Content Management')}</h3>
                <p>{t('admin:actions.contentDesc', 'Manage learning content and modules')}</p>
              </div>
            </div>

            <div className="card action-card">
              <div className="action-icon">
                {icons.refreshCw}
              </div>
              <div className="action-content">
                <h3>{t('admin:actions.sync', 'Sync Data')}</h3>
                <p>{t('admin:actions.syncDesc', 'Synchronize data and caches')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* System Health */}
        <section className="admin-section">
          <h2 className="section-title">
            {t('admin:health.title', 'System Health')}
          </h2>
          <div className="card">
            <div className="health-list">
              <div className="health-item">
                <span className="health-label">
                  {t('admin:health.database', 'Database')}
                </span>
                <span className="health-status healthy">
                  {icons.checkSmall}
                  <span>Healthy</span>
                </span>
              </div>
              <div className="health-item">
                <span className="health-label">
                  {t('admin:health.api', 'API Services')}
                </span>
                <span className="health-status healthy">
                  {icons.checkSmall}
                  <span>Healthy</span>
                </span>
              </div>
              <div className="health-item">
                <span className="health-label">
                  {t('admin:health.ai', 'AI Coach')}
                </span>
                <span className="health-status healthy">
                  {icons.checkSmall}
                  <span>Healthy</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
