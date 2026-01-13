/**
 * ComplianceTab Component
 * GDPR compliance management and security controls
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hubApi } from '@/features/hub/hubApi';

export default function ComplianceTab({ showMessage }) {
  const { t } = useTranslation(['hub', 'common']);
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // User search
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Pending deletions
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [isLoadingDeletions, setIsLoadingDeletions] = useState(false);

  // Security config
  const [securityConfig, setSecurityConfig] = useState(null);
  const [showSecurityConfig, setShowSecurityConfig] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setIsLoadingStats(true);
    try {
      const result = await hubApi.getComplianceStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.loadStats'), 'error');
    } finally {
      setIsLoadingStats(false);
    }
  }

  async function handleSearchUser(e) {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    setSearchedUser(null);
    try {
      const result = await hubApi.getComplianceUser(searchEmail.trim());
      if (result.success) {
        setSearchedUser(result.data);
      }
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.userNotFound'), 'error');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleExportData() {
    if (!searchedUser?.id) return;

    try {
      showMessage(t('hub:compliance.exporting'), 'info');
      const result = await hubApi.exportUserData(searchedUser.id);

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${searchedUser.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showMessage(t('hub:compliance.success.exported'), 'success');
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.export'), 'error');
    }
  }

  async function handleDeleteAccount() {
    if (!searchedUser?.id) return;

    const email = searchedUser.email;
    if (!confirm(t('hub:compliance.confirm.delete', { email }))) return;

    const confirmEmail = prompt(t('hub:compliance.confirm.typeEmail', { email }));
    if (confirmEmail !== email) {
      showMessage(t('hub:compliance.error.emailMismatch'), 'error');
      return;
    }

    try {
      await hubApi.deleteUserAccount(searchedUser.id);
      showMessage(t('hub:compliance.success.deleted', { email }), 'success');
      setSearchedUser(null);
      setSearchEmail('');
      await loadStats();
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.delete'), 'error');
    }
  }

  async function loadPendingDeletions() {
    setIsLoadingDeletions(true);
    try {
      const result = await hubApi.getPendingDeletions();
      if (result.success) {
        setPendingDeletions(result.data.users || []);
      }
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.loadDeletions'), 'error');
    } finally {
      setIsLoadingDeletions(false);
    }
  }

  async function handleExecuteDeletion(userId, email) {
    if (!confirm(t('hub:compliance.confirm.executeNow', { email }))) return;

    try {
      await hubApi.deleteUserAccount(userId);
      showMessage(t('hub:compliance.success.deleted', { email }), 'success');
      await loadPendingDeletions();
      await loadStats();
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.delete'), 'error');
    }
  }

  async function handleCleanupSessions() {
    try {
      const result = await hubApi.cleanupSessions();
      showMessage(
        t('hub:compliance.success.cleanup', { count: result.data.deletedCount || 0 }),
        'success'
      );
      await loadStats();
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.cleanup'), 'error');
    }
  }

  async function handleViewSecurityConfig() {
    if (showSecurityConfig) {
      setShowSecurityConfig(false);
      return;
    }

    try {
      const result = await hubApi.getSecurityConfig();
      if (result.success) {
        setSecurityConfig(result.data);
        setShowSecurityConfig(true);
      }
    } catch (error) {
      showMessage(error.message || t('hub:compliance.error.loadConfig'), 'error');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <>
      {/* Compliance Dashboard Card */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:compliance.dashboardTitle', 'Compliance Dashboard')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:compliance.dashboardSubtitle', 'GDPR compliance status and statistics')}
            </p>
          </div>
          <button
            className="hub-btn hub-btn-primary"
            onClick={loadStats}
            disabled={isLoadingStats}
          >
            {isLoadingStats ? t('common:loading') : t('hub:compliance.refreshStats', 'Refresh Stats')}
          </button>
        </div>

        <div className="hub-config-grid">
          <div className="hub-config-item">
            <div className="hub-config-label">{t('hub:compliance.stats.totalUsers', 'Total Users')}</div>
            <div className="hub-config-value">{stats?.totalUsers || '-'}</div>
          </div>
          <div className="hub-config-item">
            <div className="hub-config-label">{t('hub:compliance.stats.pendingDeletions', 'Pending Deletions')}</div>
            <div className="hub-config-value">{stats?.pendingDeletions || '-'}</div>
          </div>
          <div className="hub-config-item">
            <div className="hub-config-label">{t('hub:compliance.stats.auditLogs', 'Audit Log Entries')}</div>
            <div className="hub-config-value">{stats?.auditLogCount || '-'}</div>
          </div>
          <div className="hub-config-item">
            <div className="hub-config-label">{t('hub:compliance.stats.activeSessions', 'Active Sessions')}</div>
            <div className="hub-config-value">{stats?.activeSessions || '-'}</div>
          </div>
        </div>
      </div>

      {/* User Data Management Card */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:compliance.userDataTitle', 'User Data Management')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:compliance.userDataSubtitle', 'Search, export, and delete user data (GDPR Articles 17 & 20)')}
            </p>
          </div>
        </div>

        {/* Search User Form */}
        <form className="hub-form" onSubmit={handleSearchUser} style={{ marginBottom: '24px' }}>
          <div className="hub-form-row">
            <div className="hub-form-group">
              <label className="hub-label" htmlFor="compliance-email">
                {t('hub:compliance.findUser', 'Find User by Email')}
              </label>
              <input
                type="email"
                id="compliance-email"
                className="hub-input"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <button type="submit" className="hub-btn hub-btn-primary" disabled={isSearching}>
              {isSearching ? t('common:searching') : t('hub:compliance.search', 'Search')}
            </button>
          </div>
        </form>

        {/* User Details */}
        {searchedUser && (
          <div className="hub-user-details">
            <div className="hub-info-box">
              <h4>{t('hub:compliance.userInfo', 'User Information')}</h4>
              <div className="hub-user-info-grid">
                <div><strong>{t('hub:compliance.field.email', 'Email')}:</strong> {searchedUser.email}</div>
                <div><strong>{t('hub:compliance.field.organization', 'Organization')}:</strong> {searchedUser.organization || '-'}</div>
                <div><strong>{t('hub:compliance.field.status', 'Status')}:</strong> {searchedUser.status}</div>
                <div><strong>{t('hub:compliance.field.created', 'Created')}:</strong> {formatDate(searchedUser.createdAt)}</div>
                <div><strong>{t('hub:compliance.field.lastLogin', 'Last Login')}:</strong> {formatDate(searchedUser.lastLoginAt) || 'Never'}</div>
                <div><strong>{t('hub:compliance.field.sessions', 'Sessions')}:</strong> {searchedUser.sessionCount || 0}</div>
                <div><strong>{t('hub:compliance.field.checkins', 'Check-ins')}:</strong> {searchedUser.checkInCount || 0}</div>
                <div>
                  <strong>{t('hub:compliance.field.consents', 'Consents')}:</strong>{' '}
                  ToS: {searchedUser.consents?.termsOfService?.accepted ? 'Yes' : 'No'},{' '}
                  Privacy: {searchedUser.consents?.privacyPolicy?.accepted ? 'Yes' : 'No'}
                </div>
              </div>

              {searchedUser.deletion?.requestedAt && (
                <div className="hub-alert hub-alert-danger" style={{ marginTop: '12px' }}>
                  <strong>{t('hub:compliance.deletionRequested', 'Deletion Requested')}:</strong>{' '}
                  {formatDate(searchedUser.deletion.requestedAt)} -{' '}
                  {t('hub:compliance.scheduledFor', 'Scheduled')}: {formatDate(searchedUser.deletion.scheduledFor)}
                </div>
              )}
            </div>

            <div className="hub-form-row" style={{ marginTop: '16px' }}>
              <button className="hub-btn hub-btn-primary" onClick={handleExportData}>
                {t('hub:compliance.exportData', 'Export User Data (GDPR)')}
              </button>
              <button className="hub-btn hub-btn-danger" onClick={handleDeleteAccount}>
                {t('hub:compliance.deleteAccount', 'Delete Account')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Deletions Card */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:compliance.pendingTitle', 'Pending Account Deletions')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:compliance.pendingSubtitle', 'Users who have requested account deletion (30-day grace period)')}
            </p>
          </div>
          <button
            className="hub-btn"
            onClick={loadPendingDeletions}
            disabled={isLoadingDeletions}
          >
            {isLoadingDeletions ? t('common:loading') : t('common:refresh', 'Refresh')}
          </button>
        </div>

        <table className="hub-table">
          <thead>
            <tr>
              <th>{t('hub:compliance.table.email', 'Email')}</th>
              <th>{t('hub:compliance.table.requested', 'Requested')}</th>
              <th>{t('hub:compliance.table.scheduledFor', 'Scheduled For')}</th>
              <th>{t('hub:compliance.table.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pendingDeletions.length === 0 ? (
              <tr>
                <td colSpan="4" className="hub-empty">
                  {t('hub:compliance.noPending', 'No pending deletions')}
                </td>
              </tr>
            ) : (
              pendingDeletions.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{formatDate(user.deletion?.requestedAt)}</td>
                  <td>{formatDate(user.deletion?.scheduledFor)}</td>
                  <td>
                    <button
                      className="hub-btn hub-btn-small hub-btn-danger"
                      onClick={() => handleExecuteDeletion(user.id, user.email)}
                    >
                      {t('hub:compliance.executeNow', 'Execute Now')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Security Controls Card */}
      <div className="hub-card">
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:compliance.securityTitle', 'Security Controls')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:compliance.securitySubtitle', 'Manual security maintenance actions')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="hub-btn" onClick={handleCleanupSessions}>
            {t('hub:compliance.cleanupSessions', 'Cleanup Expired Sessions')}
          </button>
          <button className="hub-btn" onClick={handleViewSecurityConfig}>
            {showSecurityConfig
              ? t('hub:compliance.hideConfig', 'Hide Security Config')
              : t('hub:compliance.viewConfig', 'View Security Config')}
          </button>
        </div>

        {showSecurityConfig && securityConfig && (
          <div className="hub-info-box" style={{ marginTop: '16px' }}>
            <pre className="hub-code-block">
              {JSON.stringify(securityConfig, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
