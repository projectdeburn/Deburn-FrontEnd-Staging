/**
 * HubAdminsTab Component
 * Manages Hub administrators with global admin access
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hubApi } from '@/features/hub/hubApi';

export default function HubAdminsTab({ currentUserEmail, showMessage }) {
  const { t } = useTranslation(['hub', 'common']);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    setIsLoading(true);
    try {
      const result = await hubApi.getHubAdmins();
      if (result.success) {
        setAdmins(result.data.admins || []);
      }
    } catch (error) {
      showMessage(error.message || t('hub:admins.error.load'), 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddAdmin(e) {
    e.preventDefault();
    if (!newAdminEmail.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await hubApi.addHubAdmin(newAdminEmail.trim());
      showMessage(t('hub:admins.success.added', { email: newAdminEmail }), 'success');
      setNewAdminEmail('');
      await loadAdmins();
    } catch (error) {
      showMessage(error.message || t('hub:admins.error.add'), 'error');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveAdmin(email) {
    if (!confirm(t('hub:admins.confirm.remove', { email }))) return;

    try {
      await hubApi.removeHubAdmin(email);
      showMessage(t('hub:admins.success.removed', { email }), 'success');
      await loadAdmins();
    } catch (error) {
      showMessage(error.message || t('hub:admins.error.remove'), 'error');
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

  if (isLoading) {
    return (
      <div className="hub-card">
        <div className="hub-empty">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <div className="hub-card">
      <div className="hub-card-header">
        <div>
          <h3 className="hub-card-title">{t('hub:admins.title', 'Hub Administrators')}</h3>
          <p className="hub-card-subtitle">
            {t('hub:admins.subtitle', 'Users with access to this global admin section')}
          </p>
        </div>
      </div>

      {/* Add Hub Admin Form */}
      <form className="hub-form" onSubmit={handleAddAdmin} style={{ marginBottom: '24px' }}>
        <div className="hub-form-row">
          <div className="hub-form-group">
            <label className="hub-label" htmlFor="hub-admin-email">
              {t('hub:admins.addAdmin', 'Add Hub Admin')}
            </label>
            <input
              type="email"
              id="hub-admin-email"
              className="hub-input"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder={t('hub:admins.emailPlaceholder', 'Enter email address')}
              required
            />
          </div>
          <button type="submit" className="hub-btn hub-btn-primary" disabled={isAdding}>
            {isAdding ? t('common:adding') : t('hub:admins.addButton', 'Add Admin')}
          </button>
        </div>
      </form>

      {/* Hub Admins Table */}
      <table className="hub-table">
        <thead>
          <tr>
            <th>{t('hub:admins.table.email', 'Email')}</th>
            <th>{t('hub:admins.table.addedBy', 'Added By')}</th>
            <th>{t('hub:admins.table.added', 'Added')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr>
              <td colSpan="4" className="hub-empty">
                {t('hub:admins.empty', 'No hub admins found')}
              </td>
            </tr>
          ) : (
            admins.map((admin) => (
              <tr key={admin.email}>
                <td><strong>{admin.email}</strong></td>
                <td>{admin.addedBy}</td>
                <td>{formatDate(admin.addedAt)}</td>
                <td>
                  {admin.email !== currentUserEmail ? (
                    <button
                      className="hub-btn hub-btn-danger hub-btn-small"
                      onClick={() => handleRemoveAdmin(admin.email)}
                    >
                      {t('common:remove', 'Remove')}
                    </button>
                  ) : (
                    <span className="hub-text-muted">
                      {t('hub:admins.currentUser', 'Current user')}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
