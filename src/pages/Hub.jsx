/**
 * Hub Page
 * Admin hub for organization management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { get, post } from '@/utils/api';

// SVG Icons
const icons = {
  arrowLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M12 6h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M16 14h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M8 14h.01"></path>
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
  bookOpen: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19"></line>
      <line x1="5" x2="19" y1="12" y2="12"></line>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
    </svg>
  ),
  moreVertical: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
};

export default function Hub() {
  const { t } = useTranslation(['hub', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHubData();
  }, []);

  async function loadHubData() {
    setIsLoading(true);
    try {
      const [orgRes, membersRes] = await Promise.all([
        get(`${process.env.ENDPOINT}/api/hub/organization`).catch(() => ({ success: false })),
        get(`${process.env.ENDPOINT}/api/hub/members`).catch(() => ({ success: false })),
      ]);

      if (orgRes.success) {
        setOrganization(orgRes.data);
      }

      if (membersRes.success) {
        setMembers(membersRes.data.members || []);
      }
    } catch (error) {
      console.error('Error loading hub data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter members by search query
  const filteredMembers = members.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="hub-loading">
        <div className="hub-loading-spinner"></div>
        <p>{t('common:loading', 'Loading...')}</p>
      </div>
    );
  }

  return (
    <div className="hub-container">
      {/* Header */}
      <div className="hub-header">
        <div className="hub-header-left">
          <button className="hub-btn hub-btn-secondary hub-btn-small" onClick={() => navigate('/')}>
            {icons.arrowLeft}
            <span>{t('common:back', 'Back')}</span>
          </button>
          <div className="hub-title-group">
            <h1 className="hub-title">
              {icons.building}
              <span>{organization?.name || t('hub:title', 'Organization Hub')}</span>
            </h1>
            <p className="hub-subtitle">
              {t('hub:subtitle', 'Manage your organization')}
            </p>
          </div>
        </div>
        <div className="hub-user-info">
          <span className="hub-user-email">{user?.email}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="hub-tabs">
        {['overview', 'members', 'content', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`hub-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {t(`hub:tabs.${tab}`, tab.charAt(0).toUpperCase() + tab.slice(1))}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      <div className={`hub-section ${activeTab === 'overview' ? 'active' : ''}`}>
        {/* Stats */}
        <div className="hub-section-header">
          <h2 className="hub-section-title">{t('hub:stats.title', 'Overview')}</h2>
        </div>
        <div className="hub-config-grid">
          <div className="hub-config-item">
            <div className="hub-config-label">{t('hub:stats.members', 'Members')}</div>
            <div className="hub-config-value">{organization?.memberCount || 0}</div>
          </div>
          <div className="hub-config-item">
            <div className="hub-config-label">{t('hub:stats.active', 'Active This Week')}</div>
            <div className="hub-config-value">{organization?.activeUsers || 0}</div>
          </div>
          <div className="hub-config-item">
            <div className="hub-config-label">{t('hub:stats.lessons', 'Lessons Completed')}</div>
            <div className="hub-config-value">{organization?.completedLessons || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="hub-section-header" style={{ marginTop: '32px' }}>
          <h2 className="hub-section-title">{t('hub:actions.title', 'Quick Actions')}</h2>
        </div>
        <div className="hub-content-grid">
          <div className="hub-card" onClick={() => setActiveTab('members')} style={{ cursor: 'pointer' }}>
            <div className="hub-card-header">
              <div>
                <div className="hub-card-title">
                  {icons.plus}
                  <span style={{ marginLeft: '8px' }}>{t('hub:actions.inviteMembers', 'Invite Members')}</span>
                </div>
                <div className="hub-card-subtitle">
                  {t('hub:actions.inviteMembersDesc', 'Add team members to your organization')}
                </div>
              </div>
            </div>
          </div>

          <div className="hub-card" onClick={() => setActiveTab('content')} style={{ cursor: 'pointer' }}>
            <div className="hub-card-header">
              <div>
                <div className="hub-card-title">
                  {icons.bookOpen}
                  <span style={{ marginLeft: '8px' }}>{t('hub:actions.manageContent', 'Manage Content')}</span>
                </div>
                <div className="hub-card-subtitle">
                  {t('hub:actions.manageContentDesc', 'Configure learning modules')}
                </div>
              </div>
            </div>
          </div>

          <div className="hub-card" style={{ cursor: 'pointer' }}>
            <div className="hub-card-header">
              <div>
                <div className="hub-card-title">
                  {icons.trendingUp}
                  <span style={{ marginLeft: '8px' }}>{t('hub:actions.viewReports', 'View Reports')}</span>
                </div>
                <div className="hub-card-subtitle">
                  {t('hub:actions.viewReportsDesc', 'See usage and engagement reports')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Tab */}
      <div className={`hub-section ${activeTab === 'members' ? 'active' : ''}`}>
        <div className="hub-section-header">
          <h2 className="hub-section-title">{t('hub:members.title', 'Members')}</h2>
          <div className="hub-header-actions">
            <div className="hub-form-row" style={{ marginBottom: 0 }}>
              <div className="hub-form-group">
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="hub-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hub:members.search', 'Search members...')}
                    style={{ paddingLeft: '36px' }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--hub-text-secondary)' }}>
                    {icons.search}
                  </span>
                </div>
              </div>
            </div>
            <button className="hub-btn hub-btn-primary">
              {icons.plus}
              <span>{t('hub:members.invite', 'Invite')}</span>
            </button>
          </div>
        </div>

        <div className="hub-card">
          {filteredMembers.length > 0 ? (
            <table className="hub-table">
              <thead>
                <tr>
                  <th>{t('hub:members.name', 'Name')}</th>
                  <th>{t('hub:members.email', 'Email')}</th>
                  <th>{t('hub:members.role', 'Role')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="hub-badge hub-badge-primary" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {member.name?.charAt(0) || '?'}
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`hub-badge ${member.role === 'admin' ? 'hub-badge-primary' : ''}`}>
                        {member.role === 'admin' && icons.shield}
                        <span style={{ marginLeft: member.role === 'admin' ? '4px' : 0 }}>
                          {member.role === 'admin' ? t('hub:members.admin', 'Admin') : t('hub:members.member', 'Member')}
                        </span>
                      </span>
                    </td>
                    <td>
                      <button className="hub-btn hub-btn-secondary hub-btn-small">
                        {icons.moreVertical}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="hub-empty">
              {icons.users}
              <p>
                {searchQuery
                  ? t('hub:members.noResults', 'No members found')
                  : t('hub:members.noMembers', 'No members yet')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content Tab */}
      <div className={`hub-section ${activeTab === 'content' ? 'active' : ''}`}>
        <div className="hub-section-header">
          <h2 className="hub-section-title">{t('hub:content.title', 'Content Management')}</h2>
        </div>
        <div className="hub-card">
          <div className="hub-empty">
            {icons.bookOpen}
            <h3>{t('hub:content.title', 'Content Management')}</h3>
            <p>{t('hub:content.description', 'Configure learning content and modules for your organization')}</p>
            <button className="hub-btn hub-btn-primary" style={{ marginTop: '16px' }}>
              {t('hub:content.configure', 'Configure Content')}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Tab */}
      <div className={`hub-section ${activeTab === 'settings' ? 'active' : ''}`}>
        <div className="hub-section-header">
          <h2 className="hub-section-title">{t('hub:settings.organization', 'Organization Settings')}</h2>
        </div>
        <div className="hub-card">
          <form className="hub-form">
            <div className="hub-form-group">
              <label className="hub-label">{t('hub:settings.name', 'Organization Name')}</label>
              <input
                type="text"
                className="hub-input"
                defaultValue={organization?.name}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="hub-btn hub-btn-primary">
                {t('common:saveChanges', 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
