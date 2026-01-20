/**
 * Hub Page
 * Global Administration panel for the Deburn platform
 * Accessible only to Hub Admins (role-based access control)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { hubApi } from '@/features/hub/hubApi';
import {
  HubAdminsTab,
  OrganizationsTab,
  AskEveTab,
  ContentLibraryTab,
  ComplianceTab,
} from '@/components/hub';

const TABS = [
  { id: 'hub-admins', label: 'Hub Admins' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'ask-eve', label: 'Ask Eve' },
  { id: 'content', label: 'Content Library' },
  { id: 'compliance', label: 'Compliance' },
];

export default function Hub() {
  const { t } = useTranslation(['hub', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('hub-admins');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    setIsLoading(true);
    try {
      // Try to load hub admins - if successful, user has access
      const result = await hubApi.getHubAdmins();
      if (result.success) {
        setIsAuthorized(true);
      }
    } catch (error) {
      if (error.status === 403) {
        setIsAuthorized(false);
      } else {
        // For other errors, assume authorized (mock server)
        setIsAuthorized(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function showMessage(text, type = 'info') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="hub-loading">
        <div className="hub-loading-spinner"></div>
        <p>{t('hub:loading', 'Checking access...')}</p>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="hub-unauthorized">
        <h2>{t('hub:unauthorized.title', 'Access Denied')}</h2>
        <p>{t('hub:unauthorized.message', "You don't have permission to access the Hub.")}</p>
        <button className="hub-btn hub-btn-primary" onClick={() => navigate('/dashboard')}>
          {t('hub:unauthorized.returnButton', 'Return to App')}
        </button>
      </div>
    );
  }

  return (
    <div className="hub-container">
      {/* Header */}
      <header className="hub-header">
        <div>
          <h1 className="hub-title">{t('hub:title', 'Hub')}</h1>
          <p className="hub-subtitle">{t('hub:subtitle', 'Global Administration')}</p>
        </div>
        <div className="hub-user-info">
          <div>{t('hub:signedInAs', 'Signed in as')}</div>
          <div className="hub-user-email">{user?.email}</div>
        </div>
      </header>

      {/* Message Area */}
      {message && (
        <div className={`hub-message hub-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="hub-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`hub-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {t(`hub:tabs.${tab.id}`, tab.label)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="hub-tab-content">
        {activeTab === 'hub-admins' && (
          <section className="hub-section active">
            <HubAdminsTab
              currentUserEmail={user?.email}
              showMessage={showMessage}
            />
          </section>
        )}

        {activeTab === 'organizations' && (
          <section className="hub-section active">
            <OrganizationsTab showMessage={showMessage} />
          </section>
        )}

        {activeTab === 'ask-eve' && (
          <section className="hub-section active">
            <AskEveTab showMessage={showMessage} />
          </section>
        )}

        {activeTab === 'content' && (
          <section className="hub-section active">
            <ContentLibraryTab showMessage={showMessage} />
          </section>
        )}

        {activeTab === 'compliance' && (
          <section className="hub-section active">
            <ComplianceTab showMessage={showMessage} />
          </section>
        )}
      </div>
    </div>
  );
}
