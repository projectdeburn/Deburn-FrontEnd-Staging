/**
 * OrganizationsTab Component
 * Manages organizations and organization administrators
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hubApi } from '@/features/hub/hubApi';

export default function OrganizationsTab({ showMessage }) {
  const { t } = useTranslation(['hub', 'common']);
  const [organizations, setOrganizations] = useState([]);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create organization form
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Add org admin form
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [orgsRes, adminsRes] = await Promise.all([
        hubApi.getOrganizations(),
        hubApi.getOrgAdmins(),
      ]);

      if (orgsRes.success) {
        setOrganizations(orgsRes.data.organizations || []);
      }
      if (adminsRes.success) {
        setOrgAdmins(adminsRes.data.admins || []);
      }
    } catch (error) {
      showMessage(error.message || t('hub:orgs.error.load'), 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateOrg(e) {
    e.preventDefault();
    if (!newOrgName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await hubApi.createOrganization(newOrgName.trim(), newOrgDomain.trim() || null);
      showMessage(t('hub:orgs.success.created', { name: newOrgName }), 'success');
      setNewOrgName('');
      setNewOrgDomain('');
      await loadData();
    } catch (error) {
      showMessage(error.message || t('hub:orgs.error.create'), 'error');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAddOrgAdmin(e) {
    e.preventDefault();
    if (!adminEmail.trim() || !selectedOrg || isAddingAdmin) return;

    setIsAddingAdmin(true);
    try {
      await hubApi.addOrgAdmin(adminEmail.trim(), selectedOrg);
      const orgName = organizations.find((o) => o.id === selectedOrg)?.name;
      showMessage(t('hub:orgs.success.adminAdded', { email: adminEmail, org: orgName }), 'success');
      setAdminEmail('');
      setSelectedOrg('');
      await loadData();
    } catch (error) {
      showMessage(error.message || t('hub:orgs.error.addAdmin'), 'error');
    } finally {
      setIsAddingAdmin(false);
    }
  }

  async function handleRemoveOrgAdmin(membershipId, email, orgName) {
    if (!confirm(t('hub:orgs.confirm.removeAdmin', { email, org: orgName }))) return;

    try {
      await hubApi.removeOrgAdmin(membershipId);
      showMessage(t('hub:orgs.success.adminRemoved', { email, org: orgName }), 'success');
      await loadData();
    } catch (error) {
      showMessage(error.message || t('hub:orgs.error.removeAdmin'), 'error');
    }
  }

  if (isLoading) {
    return (
      <div className="hub-card">
        <div className="hub-empty">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <>
      {/* Create Organization Card */}
      <div className="hub-card" style={{ marginBottom: '24px' }}>
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:orgs.createTitle', 'Create Organization')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:orgs.createSubtitle', 'Add a new organization to the platform')}
            </p>
          </div>
        </div>

        <form className="hub-form" onSubmit={handleCreateOrg}>
          <div className="hub-form-row">
            <div className="hub-form-group">
              <label className="hub-label" htmlFor="new-org-name">
                {t('hub:orgs.form.name', 'Organization Name')}
              </label>
              <input
                type="text"
                id="new-org-name"
                className="hub-input"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder={t('hub:orgs.form.namePlaceholder', 'e.g., Acme Corp')}
                required
              />
            </div>
            <div className="hub-form-group">
              <label className="hub-label" htmlFor="new-org-domain">
                {t('hub:orgs.form.domain', 'Domain (optional)')}
              </label>
              <input
                type="text"
                id="new-org-domain"
                className="hub-input"
                value={newOrgDomain}
                onChange={(e) => setNewOrgDomain(e.target.value)}
                placeholder={t('hub:orgs.form.domainPlaceholder', 'e.g., acme.com')}
              />
            </div>
            <button type="submit" className="hub-btn hub-btn-primary" disabled={isCreating}>
              {isCreating ? t('common:creating') : t('hub:orgs.createButton', 'Create Organization')}
            </button>
          </div>
        </form>

        {/* Existing Organizations Grid */}
        <div style={{ marginTop: '24px' }}>
          <h4 className="hub-section-label">
            {t('hub:orgs.existing', 'Existing Organizations')}
          </h4>
          {organizations.length === 0 ? (
            <div className="hub-empty">{t('hub:orgs.noOrgs', 'No organizations yet')}</div>
          ) : (
            <div className="hub-org-grid">
              {organizations.map((org) => (
                <div key={org.id} className="hub-org-card">
                  <div className="hub-org-card-name">{org.name}</div>
                  {org.domain && (
                    <div className="hub-org-card-domain">{org.domain}</div>
                  )}
                  <div className="hub-org-card-meta">
                    {t('hub:orgs.memberCount', '{{count}} members', { count: org.memberCount || 0 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Organization Administrators Card */}
      <div className="hub-card">
        <div className="hub-card-header">
          <div>
            <h3 className="hub-card-title">{t('hub:orgs.adminsTitle', 'Organization Administrators')}</h3>
            <p className="hub-card-subtitle">
              {t('hub:orgs.adminsSubtitle', 'Users who can manage organizations and circles')}
            </p>
          </div>
        </div>

        {/* Add Org Admin Form */}
        <form className="hub-form" onSubmit={handleAddOrgAdmin} style={{ marginBottom: '24px' }}>
          <div className="hub-form-row">
            <div className="hub-form-group">
              <label className="hub-label" htmlFor="org-admin-email">
                {t('hub:orgs.adminForm.email', 'Email')}
              </label>
              <input
                type="email"
                id="org-admin-email"
                className="hub-input"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={t('hub:orgs.adminForm.emailPlaceholder', 'Enter email address')}
                required
              />
            </div>
            <div className="hub-form-group">
              <label className="hub-label" htmlFor="org-admin-org">
                {t('hub:orgs.adminForm.org', 'Organization')}
              </label>
              <select
                id="org-admin-org"
                className="hub-select"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                required
              >
                <option value="">{t('hub:orgs.adminForm.selectOrg', 'Select organization...')}</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}{org.domain ? ` (${org.domain})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="hub-btn hub-btn-primary" disabled={isAddingAdmin}>
              {isAddingAdmin ? t('common:adding') : t('hub:orgs.adminForm.addButton', 'Add Admin')}
            </button>
          </div>
        </form>

        {/* Org Admins Table */}
        <table className="hub-table">
          <thead>
            <tr>
              <th>{t('hub:orgs.table.user', 'User')}</th>
              <th>{t('hub:orgs.table.organizations', 'Organizations')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orgAdmins.length === 0 ? (
              <tr>
                <td colSpan="3" className="hub-empty">
                  {t('hub:orgs.noAdmins', 'No organization admins found')}
                </td>
              </tr>
            ) : (
              orgAdmins.map((admin) => (
                <tr key={admin.email}>
                  <td>
                    <strong>{admin.email}</strong>
                    {admin.name && (
                      <div className="hub-text-muted">{admin.name}</div>
                    )}
                  </td>
                  <td>
                    <div className="hub-org-list">
                      {admin.organizations.map((org) => (
                        <span key={org.membershipId} className="hub-org-badge">
                          {org.name}
                          <button
                            className="hub-org-badge-remove"
                            onClick={() => handleRemoveOrgAdmin(org.membershipId, admin.email, org.name)}
                            title={t('hub:orgs.removeFromOrg', 'Remove admin from {{org}}', { org: org.name })}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
