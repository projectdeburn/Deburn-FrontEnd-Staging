/**
 * Circles Admin Page
 * Admin interface for managing circle pools, invitations, and groups
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { circlesAdminApi } from '@/features/circles/circles-adminApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalFooter } from '@/components/ui/Modal';

// Hero image import
import heroAdmin from '@/assets/images/hero-admin.jpg';

// SVG Icons
const icons = {
  users: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  move: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 10 20 15 15 20"></polyline>
      <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
    </svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  shuffle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"></polyline>
      <line x1="4" y1="20" x2="21" y2="3"></line>
      <polyline points="21 16 21 21 16 21"></polyline>
      <line x1="15" y1="15" x2="21" y2="21"></line>
      <line x1="4" y1="4" x2="9" y2="9"></line>
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  alertCircle: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" x2="12" y1="8" y2="12"></line>
      <line x1="12" x2="12.01" y1="16" y2="16"></line>
    </svg>
  ),
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  ),
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
      <path d="m15 5 4 4"></path>
    </svg>
  ),
};

/**
 * Parse emails from text input
 * Supports comma, semicolon, newline, and whitespace separators
 */
function parseEmails(text) {
  const parts = text.split(/[,;\n\r]+/);
  const emails = [];

  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    // Basic email validation
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      emails.push(trimmed);
    }
  }

  // Remove duplicates
  return [...new Set(emails)];
}

export default function CirclesAdmin() {
  const { t } = useTranslation(['circlesAdmin', 'common']);
  const navigate = useNavigate();

  // Admin state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Pool state
  const [pools, setPools] = useState([]);
  const [currentPool, setCurrentPool] = useState(null);

  // Invitation state
  const [invitations, setInvitations] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Group state
  const [groups, setGroups] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Email diagnostics state
  const [diagnosticEmail, setDiagnosticEmail] = useState({
    to: '',
    subject: 'Eve Email Diagnostic Test',
    message: 'This is a diagnostic test email from the Eve admin panel.',
  });
  const [isSendingDiagnostic, setIsSendingDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  // Move member state
  const [moveModal, setMoveModal] = useState({
    isOpen: false,
    member: null,
    fromGroup: null,
    toGroupId: '',
  });
  const [isMoving, setIsMoving] = useState(false);

  // Delete group state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    group: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Create group state
  const [createGroupModal, setCreateGroupModal] = useState({
    isOpen: false,
    name: '',
  });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Add member state
  const [addMemberModal, setAddMemberModal] = useState({
    isOpen: false,
    member: null,
    toGroupId: '',
  });
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Remove member state
  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    member: null,
    fromGroup: null,
  });
  const [isRemoving, setIsRemoving] = useState(false);

  // Edit group state
  const [editGroupModal, setEditGroupModal] = useState({
    isOpen: false,
    group: null,
    name: '',
  });
  const [isEditingGroup, setIsEditingGroup] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  /**
   * Check admin status and load data
   */
  async function checkAdminAndLoad() {
    setIsLoading(true);
    setError(null);

    try {
      // Check admin status
      const statusRes = await circlesAdminApi.getAdminStatus();

      if (!statusRes.success || !statusRes.data?.isAdmin) {
        setIsAdmin(false);
        // Redirect non-admins to dashboard
        navigate('/dashboard', { replace: true });
        return;
      }

      setIsAdmin(true);

      // Load pools
      const poolsRes = await circlesAdminApi.getPools();

      if (poolsRes.success && poolsRes.data?.pools?.length > 0) {
        setPools(poolsRes.data.pools);
        const pool = poolsRes.data.pools[0];
        setCurrentPool(pool);

        // Load pool data
        await loadPoolData(pool.id);
      } else {
        setPools([]);
        setCurrentPool(null);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err.message || 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Load invitations and groups for a pool
   */
  async function loadPoolData(poolId) {
    try {
      const [invitesRes, groupsRes] = await Promise.all([
        circlesAdminApi.getPoolInvitations(poolId).catch(() => ({ success: false })),
        circlesAdminApi.getPoolGroups(poolId).catch(() => ({ success: false })),
      ]);

      if (invitesRes.success) {
        setInvitations(invitesRes.data?.invitations || []);
      }

      if (groupsRes.success) {
        setGroups(groupsRes.data?.groups || []);
      }
    } catch (err) {
      console.error('Error loading pool data:', err);
    }
  }

  /**
   * Send invitations
   */
  async function handleSendInvitations() {
    const emails = parseEmails(emailInput);

    if (emails.length === 0) {
      alert(t('circlesAdmin:invite.noEmails', 'Please enter at least one valid email address'));
      return;
    }

    if (!currentPool) {
      alert(t('circlesAdmin:invite.noPool', 'No pool selected'));
      return;
    }

    setIsSending(true);

    try {
      const invitees = emails.map(email => ({ email }));
      const result = await circlesAdminApi.sendInvitations(currentPool.id, invitees);

      if (result.success) {
        const sent = result.data?.sent?.length || 0;
        const failed = result.data?.failed?.length || 0;
        const duplicate = result.data?.duplicate?.length || 0;

        let message = t('circlesAdmin:invite.sentSuccess', 'Sent {{count}} invitations', { count: sent });
        if (failed > 0) {
          message += `\n${t('circlesAdmin:invite.failed', '{{count}} failed', { count: failed })}`;
        }
        if (duplicate > 0) {
          message += `\n${t('circlesAdmin:invite.duplicate', '{{count}} duplicates skipped', { count: duplicate })}`;
        }

        alert(message);
        setEmailInput('');

        // Reload invitations
        await loadPoolData(currentPool.id);
      }
    } catch (err) {
      console.error('Error sending invitations:', err);
      alert(err.message || 'Failed to send invitations');
    } finally {
      setIsSending(false);
    }
  }

  /**
   * Remove an invitation
   */
  async function handleRemoveInvitation(invitationId) {
    if (!confirm(t('circlesAdmin:invite.confirmRemove', 'Remove this invitation?'))) {
      return;
    }

    try {
      const result = await circlesAdminApi.cancelInvitation(invitationId);

      if (result.success) {
        // Remove from local state
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (err) {
      console.error('Error removing invitation:', err);
      alert(err.message || 'Failed to remove invitation');
    }
  }

  /**
   * Send diagnostic email
   */
  async function handleSendDiagnosticEmail() {
    if (!diagnosticEmail.to) {
      alert(t('circlesAdmin:diagnostics.noRecipient', 'Please enter a recipient email'));
      return;
    }

    setIsSendingDiagnostic(true);
    setDiagnosticResult(null);

    try {
      const result = await circlesAdminApi.sendDiagnosticEmail(diagnosticEmail);

      if (result.success) {
        setDiagnosticResult({
          success: true,
          message: t('circlesAdmin:diagnostics.success', 'Test email sent successfully!'),
        });
      } else {
        setDiagnosticResult({
          success: false,
          message: result.message || t('circlesAdmin:diagnostics.error', 'Failed to send test email'),
        });
      }
    } catch (err) {
      console.error('Error sending diagnostic email:', err);
      setDiagnosticResult({
        success: false,
        message: err.message || t('circlesAdmin:diagnostics.error', 'Failed to send test email'),
      });
    } finally {
      setIsSendingDiagnostic(false);
    }
  }

  /**
   * Open move member modal
   */
  function handleOpenMoveModal(member, fromGroup, toGroupId) {
    const targetGroup = groups.find(g => g.id === toGroupId);
    if (targetGroup) {
      setMoveModal({
        isOpen: true,
        member,
        fromGroup,
        toGroupId,
      });
    }
  }

  /**
   * Close move member modal
   */
  function handleCloseMoveModal() {
    setMoveModal({
      isOpen: false,
      member: null,
      fromGroup: null,
      toGroupId: '',
    });
  }

  /**
   * Execute move member
   */
  async function handleMoveMember() {
    if (!currentPool || !moveModal.member || !moveModal.fromGroup || !moveModal.toGroupId) {
      return;
    }

    setIsMoving(true);

    try {
      const result = await circlesAdminApi.moveMember(
        currentPool.id,
        moveModal.fromGroup.id,
        moveModal.member.id,
        moveModal.toGroupId
      );

      if (result.success) {
        // Reload groups to reflect the change
        await loadPoolData(currentPool.id);
        handleCloseMoveModal();
      }
    } catch (err) {
      console.error('Error moving member:', err);
      alert(err.message || 'Failed to move member');
    } finally {
      setIsMoving(false);
    }
  }

  /**
   * Get available groups for moving (exclude current group, check capacity)
   */
  function getAvailableTargetGroups(currentGroupId) {
    // Use maxGroupSize from pool, default to 6
    const maxSize = currentPool?.maxGroupSize || 6;
    return groups.filter(g =>
      g.id !== currentGroupId &&
      (g.members?.length || 0) < maxSize
    );
  }

  /**
   * Check if source group can lose a member (must keep at least 3)
   */
  function canMoveFromGroup(group) {
    // Allow moving from any group that has members
    return (group.members?.length || 0) > 0;
  }

  /**
   * Open delete group modal
   */
  function handleOpenDeleteModal(group) {
    setDeleteModal({
      isOpen: true,
      group,
    });
  }

  /**
   * Close delete group modal
   */
  function handleCloseDeleteModal() {
    setDeleteModal({
      isOpen: false,
      group: null,
    });
  }

  /**
   * Execute delete group
   */
  async function handleDeleteGroup() {
    if (!currentPool || !deleteModal.group) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await circlesAdminApi.deleteGroup(
        currentPool.id,
        deleteModal.group.id
      );

      if (result.success) {
        // Reload groups to reflect the change
        await loadPoolData(currentPool.id);
        handleCloseDeleteModal();
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      alert(err.message || 'Failed to delete group');
    } finally {
      setIsDeleting(false);
    }
  }

  /**
   * Open create group modal
   */
  function handleOpenCreateGroupModal() {
    setCreateGroupModal({
      isOpen: true,
      name: '',
    });
  }

  /**
   * Close create group modal
   */
  function handleCloseCreateGroupModal() {
    setCreateGroupModal({
      isOpen: false,
      name: '',
    });
  }

  /**
   * Execute create group
   */
  async function handleCreateGroup() {
    if (!currentPool || !createGroupModal.name.trim()) {
      return;
    }

    setIsCreatingGroup(true);

    try {
      const result = await circlesAdminApi.createGroup(
        currentPool.id,
        createGroupModal.name.trim()
      );

      if (result.success) {
        // Reload groups to reflect the change
        await loadPoolData(currentPool.id);
        handleCloseCreateGroupModal();
      }
    } catch (err) {
      console.error('Error creating group:', err);
      alert(err.message || 'Failed to create group');
    } finally {
      setIsCreatingGroup(false);
    }
  }

  /**
   * Open add member modal
   */
  function handleOpenAddMemberModal(member, toGroupId) {
    const targetGroup = groups.find(g => g.id === toGroupId);
    if (targetGroup) {
      setAddMemberModal({
        isOpen: true,
        member,
        toGroupId,
      });
    }
  }

  /**
   * Close add member modal
   */
  function handleCloseAddMemberModal() {
    setAddMemberModal({
      isOpen: false,
      member: null,
      toGroupId: '',
    });
  }

  /**
   * Execute add member to group
   */
  async function handleAddMember() {
    if (!currentPool || !addMemberModal.member || !addMemberModal.toGroupId) {
      return;
    }

    setIsAddingMember(true);

    try {
      const result = await circlesAdminApi.addMemberToGroup(
        currentPool.id,
        addMemberModal.toGroupId,
        addMemberModal.member.userId
      );

      if (result.success) {
        // Reload groups to reflect the change
        await loadPoolData(currentPool.id);
        handleCloseAddMemberModal();
      }
    } catch (err) {
      console.error('Error adding member:', err);
      alert(err.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  }

  /**
   * Open remove member modal
   */
  function handleOpenRemoveModal(member, fromGroup) {
    setRemoveModal({
      isOpen: true,
      member,
      fromGroup,
    });
  }

  /**
   * Close remove member modal
   */
  function handleCloseRemoveModal() {
    setRemoveModal({
      isOpen: false,
      member: null,
      fromGroup: null,
    });
  }

  /**
   * Execute remove member
   */
  async function handleRemoveMember() {
    if (!currentPool || !removeModal.member || !removeModal.fromGroup) {
      return;
    }

    setIsRemoving(true);

    try {
      const result = await circlesAdminApi.removeMemberFromGroup(
        currentPool.id,
        removeModal.fromGroup.id,
        removeModal.member.id
      );

      if (result.success) {
        // Reload data to reflect the change
        await loadPoolData(currentPool.id);
        handleCloseRemoveModal();
      }
    } catch (err) {
      console.error('Error removing member:', err);
      alert(err.message || 'Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  }

  /**
   * Open edit group modal
   */
  function handleOpenEditGroupModal(group) {
    setEditGroupModal({
      isOpen: true,
      group,
      name: group.name,
    });
  }

  /**
   * Close edit group modal
   */
  function handleCloseEditGroupModal() {
    setEditGroupModal({
      isOpen: false,
      group: null,
      name: '',
    });
  }

  /**
   * Execute update group name
   */
  async function handleUpdateGroupName() {
    if (!currentPool || !editGroupModal.group || !editGroupModal.name.trim()) {
      return;
    }

    setIsEditingGroup(true);

    try {
      const result = await circlesAdminApi.updateGroup(
        currentPool.id,
        editGroupModal.group.id,
        editGroupModal.name.trim()
      );

      if (result.success) {
        // Reload data to reflect the change
        await loadPoolData(currentPool.id);
        handleCloseEditGroupModal();
      }
    } catch (err) {
      console.error('Error updating group:', err);
      alert(err.message || 'Failed to update group name');
    } finally {
      setIsEditingGroup(false);
    }
  }

  /**
   * Get groups that have capacity for new members
   */
  function getGroupsWithCapacity() {
    const maxSize = currentPool?.maxGroupSize || 6;
    return groups.filter(g => (g.members?.length || 0) < maxSize);
  }

  /**
   * Get unassigned accepted members (accepted invitations not in any group)
   */
  function getUnassignedMembers() {
    // Get all member ids currently in groups
    const assignedUserIds = new Set();
    for (const group of groups) {
      for (const member of (group.members || [])) {
        // Backend returns member.id (string), not member.userId
        if (member.id) {
          assignedUserIds.add(member.id);
        }
      }
    }

    // Filter accepted invitations to find unassigned ones
    return invitations
      .filter(inv => inv.status === 'accepted' && inv.userId && !assignedUserIds.has(inv.userId))
      .map(inv => {
        const firstName = inv.firstName || '';
        const lastName = inv.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return {
          email: inv.email,
          name: fullName || inv.email,
          userId: inv.userId,
        };
      });
  }

  /**
   * Assign groups
   */
  async function handleAssignGroups() {
    if (!currentPool) return;

    if (!confirm(t('circlesAdmin:groups.confirmAssign', 'Assign members to groups? This cannot be undone.'))) {
      return;
    }

    setIsAssigning(true);

    try {
      const result = await circlesAdminApi.assignGroups(currentPool.id);

      if (result.success) {
        alert(result.message || t('circlesAdmin:groups.assignSuccess', 'Groups assigned successfully'));

        // Reload pool data
        await loadPoolData(currentPool.id);
      }
    } catch (err) {
      console.error('Error assigning groups:', err);
      alert(err.message || 'Failed to assign groups');
    } finally {
      setIsAssigning(false);
    }
  }

  // Calculate parsed emails count
  const parsedEmails = parseEmails(emailInput);
  const emailCount = parsedEmails.length;

  // Calculate if can assign groups
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;
  const minRequired = currentPool?.targetGroupSize || 3;
  const canAssign = acceptedCount >= minRequired && currentPool?.status === 'inviting';

  // Loading state
  if (isLoading) {
    return <LoadingSpinner text={t('common:loading', 'Loading...')} />;
  }

  // Error state
  if (error) {
    return (
      <div className="circles-error-state">
        <div className="circles-error-icon">{icons.alertCircle}</div>
        <h2>{t('circlesAdmin:error.title', 'Something went wrong')}</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={checkAdminAndLoad}>
          {t('common:refresh', 'Try Again')}
        </button>
      </div>
    );
  }

  // Not admin (should redirect, but show message just in case)
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image-container">
          <img
            src={heroAdmin}
            alt="Admin Panel"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{t('circlesAdmin:hero.title', 'Admin Panel')}</h1>
          <p className="hero-tagline">
            {t('circlesAdmin:hero.tagline', 'Manage circle invitations')}
          </p>
        </div>
      </div>

      {/* Pool Info Section */}
      <section className="section" id="admin-pool-section">
        <div className="admin-pool-header">
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            {currentPool?.name || t('circlesAdmin:pool.noPool', 'No pool configured')}
          </h2>
          <div className="admin-pool-status">
            {currentPool ? (
              <>
                <span className={`admin-status-badge status-${currentPool.status}`}>
                  {currentPool.status}
                </span>
                <span className="admin-status-info">
                  {t('circlesAdmin:pool.targetSize', 'Target group size: {{size}}', { size: currentPool.targetGroupSize || 4 })}
                </span>
              </>
            ) : (
              <span className="admin-status-info">
                {t('circlesAdmin:pool.contactSupport', 'Contact support to set up your organization.')}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Send Invitations Section */}
      {currentPool && (
        <section className="section" id="admin-invite-section">
          <h2 className="section-title">{t('circlesAdmin:invite.title', 'Send Invitations')}</h2>
          <div className="admin-invite-form">
            <div className="form-group">
              <label className="form-label">
                {t('circlesAdmin:invite.label', 'Paste emails (comma or newline separated)')}
              </label>
              <textarea
                id="admin-emails-input"
                className="form-textarea"
                rows="5"
                placeholder={t('circlesAdmin:invite.placeholder', 'email1@example.com, email2@example.com\nemail3@example.com')}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            <div className="admin-invite-actions">
              <span id="admin-email-count" className="admin-email-count">
                {t('circlesAdmin:invite.emailCount', '{{count}} email(s) detected', { count: emailCount })}
              </span>
              <button
                className="btn btn-primary"
                onClick={handleSendInvitations}
                disabled={isSending || emailCount === 0}
              >
                {icons.send}
                <span style={{ marginLeft: '8px' }}>
                  {isSending
                    ? t('circlesAdmin:invite.sending', 'Sending...')
                    : t('circlesAdmin:invite.sendButton', 'Send Invitations')
                  }
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Invited Users Section */}
      {currentPool && (
        <section className="section" id="admin-invitations-section">
          <h2 className="section-title">
            {t('circlesAdmin:invitations.title', 'Invited Users')}{' '}
            <span className="admin-count-badge">{invitations.length}</span>
          </h2>
          <div className="admin-invitations-list" id="admin-invitations-list">
            {invitations.length === 0 ? (
              <div className="admin-empty-state">
                {icons.users}
                <p>{t('circlesAdmin:invitations.empty', 'No invitations yet')}</p>
              </div>
            ) : (
              <div className="admin-invitations-table">
                <div className="admin-table-header">
                  <span>{t('circlesAdmin:invitations.email', 'Email')}</span>
                  <span>{t('circlesAdmin:invitations.status', 'Status')}</span>
                  <span>{t('circlesAdmin:invitations.action', 'Action')}</span>
                </div>
                {invitations.map((inv) => (
                  <div key={inv.id} className="admin-table-row">
                    <span className="admin-invitation-email">{inv.email}</span>
                    <span className={`admin-invitation-status status-${inv.status}`}>
                      {inv.status}
                    </span>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveInvitation(inv.id)}
                      title={t('circlesAdmin:invitations.remove', 'Remove')}
                    >
                      {icons.trash}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Unassigned Members Section */}
      {currentPool && groups.length > 0 && (() => {
        const unassignedMembers = getUnassignedMembers();
        const groupsWithCapacity = getGroupsWithCapacity();

        if (unassignedMembers.length === 0) return null;

        return (
          <section className="section" id="admin-unassigned-section">
            <h2 className="section-title">
              {t('circlesAdmin:unassigned.title', 'Unassigned Members')}{' '}
              <span className="admin-count-badge">{unassignedMembers.length}</span>
            </h2>
            <div className="admin-unassigned-list">
              {unassignedMembers.map((member) => (
                <div key={member.userId} className="admin-table-row">
                  <div className="admin-member-info">
                    {icons.user}
                    <span style={{ marginLeft: '8px' }}>{member.name}</span>
                  </div>
                  {groupsWithCapacity.length > 0 ? (
                    <div className="admin-move-select-wrapper">
                      <select
                        className="admin-move-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleOpenAddMemberModal(member, e.target.value);
                          }
                        }}
                      >
                        <option value="">{t('circlesAdmin:unassigned.addTo', 'Add to...')}</option>
                        {groupsWithCapacity.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name} ({group.members?.length || 0})
                          </option>
                        ))}
                      </select>
                      <span className="admin-move-icon">{icons.move}</span>
                    </div>
                  ) : (
                    <span className="admin-status-info">
                      {t('circlesAdmin:unassigned.allGroupsFull', 'All groups full')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Groups Section */}
      {currentPool && (
        <section className="section" id="admin-groups-section">
          <div className="admin-groups-header">
            <h2 className="section-title">
              {t('circlesAdmin:groups.title', 'Groups')}{' '}
              <span className="admin-count-badge">{groups.length}</span>
            </h2>
            <div className="admin-groups-actions">
              {canAssign && (
                <button
                  className="btn btn-secondary"
                  onClick={handleAssignGroups}
                  disabled={isAssigning}
                >
                  {icons.shuffle}
                  <span style={{ marginLeft: '8px' }}>
                    {isAssigning
                      ? t('circlesAdmin:groups.assigning', 'Assigning...')
                      : t('circlesAdmin:groups.assignButton', 'Assign Groups ({{count}} accepted)', { count: acceptedCount })
                    }
                  </span>
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleOpenCreateGroupModal}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span style={{ marginLeft: '8px' }}>
                  {t('circlesAdmin:groups.createButton', 'Create Group')}
                </span>
              </button>
            </div>
          </div>
          <div className="admin-groups-list" id="admin-groups-list">
            {groups.length === 0 ? (
              <div className="admin-empty-state">
                {icons.users}
                <p>{t('circlesAdmin:groups.empty', 'No groups assigned yet')}</p>
              </div>
            ) : (
              groups.map((group) => {
                const availableTargets = getAvailableTargetGroups(group.id);
                const canMove = canMoveFromGroup(group);

                return (
                  <div key={group.id} className="admin-group-card">
                    <div className="admin-group-header">
                      <div className="admin-group-title-row">
                        <div className="admin-group-name-edit">
                          <h4>{group.name}</h4>
                          <button
                            className="btn btn-icon btn-ghost btn-sm"
                            onClick={() => handleOpenEditGroupModal(group)}
                            title={t('circlesAdmin:groups.editName', 'Edit name')}
                          >
                            {icons.edit}
                          </button>
                        </div>
                        <span className="admin-group-count">
                          {t('circlesAdmin:groups.memberCount', '{{count}} members', { count: group.members?.length || 0 })}
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleOpenDeleteModal(group)}
                        title={t('circlesAdmin:groups.deleteGroup', 'Delete Group')}
                      >
                        {icons.trash}
                      </button>
                    </div>
                    <ul className="admin-group-members">
                      {(group.members || []).map((member, idx) => (
                        <li key={member.id || idx} className="admin-group-member-row">
                          <div className="admin-member-info">
                            {icons.user}
                            <span style={{ marginLeft: '8px' }}>
                              {member.name || member.email || 'Member'}
                            </span>
                          </div>
                          <div className="admin-member-actions">
                            {availableTargets.length > 0 && (
                              <select
                                className="admin-move-select"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleOpenMoveModal(member, group, e.target.value);
                                  }
                                }}
                              >
                                <option value="">{t('circlesAdmin:groups.moveTo', 'Move to...')}</option>
                                {availableTargets.map(target => (
                                  <option key={target.id} value={target.id}>
                                    {target.name} ({target.members?.length || 0})
                                  </option>
                                ))}
                              </select>
                            )}
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleOpenRemoveModal(member, group)}
                              title={t('circlesAdmin:groups.removeMember', 'Remove Member')}
                            >
                              {icons.trash}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Email Diagnostics Section */}
      {currentPool && (
        <section className="section" id="admin-email-diagnostics-section">
          <h2 className="section-title">
            {icons.mail}
            <span style={{ marginLeft: '8px' }}>
              {t('circlesAdmin:diagnostics.title', 'Email Diagnostics')}
            </span>
          </h2>
          <div className="admin-invite-form">
            <div className="form-group">
              <label className="form-label" htmlFor="diagnostic-email-to">
                {t('circlesAdmin:diagnostics.recipientEmail', 'Recipient Email')}
              </label>
              <input
                type="email"
                id="diagnostic-email-to"
                className="form-input"
                placeholder={t('circlesAdmin:diagnostics.recipientPlaceholder', 'test@example.com')}
                value={diagnosticEmail.to}
                onChange={(e) => setDiagnosticEmail(prev => ({ ...prev, to: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="diagnostic-email-subject">
                {t('circlesAdmin:diagnostics.subject', 'Subject')}
              </label>
              <input
                type="text"
                id="diagnostic-email-subject"
                className="form-input"
                placeholder={t('circlesAdmin:diagnostics.subjectPlaceholder', 'Test Email Subject')}
                value={diagnosticEmail.subject}
                onChange={(e) => setDiagnosticEmail(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="diagnostic-email-message">
                {t('circlesAdmin:diagnostics.message', 'Message')}
              </label>
              <textarea
                id="diagnostic-email-message"
                className="form-textarea"
                rows="4"
                placeholder={t('circlesAdmin:diagnostics.messagePlaceholder', 'Enter your test message here...')}
                value={diagnosticEmail.message}
                onChange={(e) => setDiagnosticEmail(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
            <div className="admin-invite-actions">
              <button
                className="btn btn-primary"
                onClick={handleSendDiagnosticEmail}
                disabled={isSendingDiagnostic || !diagnosticEmail.to}
              >
                {icons.send}
                <span style={{ marginLeft: '8px' }}>
                  {isSendingDiagnostic
                    ? t('circlesAdmin:diagnostics.sending', 'Sending...')
                    : t('circlesAdmin:diagnostics.sendButton', 'Send Test Email')
                  }
                </span>
              </button>
            </div>
            {diagnosticResult && (
              <div
                className={`admin-diagnostic-result ${diagnosticResult.success ? 'success' : 'error'}`}
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: diagnosticResult.success ? 'rgba(90, 154, 130, 0.1)' : 'rgba(194, 112, 102, 0.1)',
                  color: diagnosticResult.success ? 'var(--color-success)' : 'var(--color-alert)',
                }}
              >
                {diagnosticResult.message}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Move Member Confirmation Modal */}
      <Modal
        isOpen={moveModal.isOpen}
        onClose={handleCloseMoveModal}
        title={t('circlesAdmin:groups.moveTitle', 'Move Member')}
        size="sm"
      >
        <p style={{ color: 'var(--neutral-600)', margin: 0 }}>
          {t('circlesAdmin:groups.moveConfirm', 'Move {{name}} from {{from}} to {{to}}?', {
            name: moveModal.member?.name || 'Member',
            from: moveModal.fromGroup?.name || '',
            to: groups.find(g => g.id === moveModal.toGroupId)?.name || '',
          })}
        </p>
        <ModalFooter>
          <button
            className="btn btn-ghost"
            onClick={handleCloseMoveModal}
            disabled={isMoving}
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleMoveMember}
            disabled={isMoving}
          >
            {isMoving
              ? t('circlesAdmin:groups.moving', 'Moving...')
              : t('circlesAdmin:groups.confirmMove', 'Confirm Move')
            }
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Group Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        title={t('circlesAdmin:groups.deleteTitle', 'Delete Group')}
        size="sm"
      >
        <p style={{ color: 'var(--neutral-600)', margin: 0 }}>
          {t('circlesAdmin:groups.deleteConfirm', 'Are you sure you want to delete "{{name}}"? This action cannot be undone.', {
            name: deleteModal.group?.name || 'Group',
          })}
        </p>
        {(deleteModal.group?.members?.length || 0) > 0 && (
          <div className="modal-warning" style={{ marginTop: 'var(--space-3)' }}>
            {t('circlesAdmin:groups.deleteWarning', 'This group has {{count}} member(s) who will be removed from the group.', {
              count: deleteModal.group?.members?.length || 0,
            })}
          </div>
        )}
        <ModalFooter>
          <button
            className="btn btn-ghost"
            onClick={handleCloseDeleteModal}
            disabled={isDeleting}
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteGroup}
            disabled={isDeleting}
          >
            {isDeleting
              ? t('circlesAdmin:groups.deleting', 'Deleting...')
              : t('circlesAdmin:groups.confirmDelete', 'Delete Group')
            }
          </button>
        </ModalFooter>
      </Modal>

      {/* Create Group Modal */}
      <Modal
        isOpen={createGroupModal.isOpen}
        onClose={handleCloseCreateGroupModal}
        title={t('circlesAdmin:groups.createTitle', 'Create New Group')}
        size="sm"
      >
        <div className="form-group">
          <label className="form-label" htmlFor="create-group-name">
            {t('circlesAdmin:groups.groupName', 'Group Name')}
          </label>
          <input
            type="text"
            id="create-group-name"
            className="form-input"
            placeholder={t('circlesAdmin:groups.groupNamePlaceholder', 'e.g., Circle D')}
            value={createGroupModal.name}
            onChange={(e) => setCreateGroupModal(prev => ({ ...prev, name: e.target.value }))}
            autoFocus
          />
        </div>
        <ModalFooter>
          <button
            className="btn btn-ghost"
            onClick={handleCloseCreateGroupModal}
            disabled={isCreatingGroup}
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreateGroup}
            disabled={isCreatingGroup || !createGroupModal.name.trim()}
          >
            {isCreatingGroup
              ? t('circlesAdmin:groups.creating', 'Creating...')
              : t('circlesAdmin:groups.confirmCreate', 'Create Group')
            }
          </button>
        </ModalFooter>
      </Modal>

      {/* Add Member Confirmation Modal */}
      <Modal
        isOpen={addMemberModal.isOpen}
        onClose={handleCloseAddMemberModal}
        title={t('circlesAdmin:unassigned.addTitle', 'Add Member to Group')}
        size="sm"
      >
        <p style={{ color: 'var(--neutral-600)', margin: 0 }}>
          {t('circlesAdmin:unassigned.addConfirm', 'Add {{name}} to {{group}}?', {
            name: addMemberModal.member?.name || 'Member',
            group: groups.find(g => g.id === addMemberModal.toGroupId)?.name || '',
          })}
        </p>
        <ModalFooter>
          <button
            className="btn btn-ghost"
            onClick={handleCloseAddMemberModal}
            disabled={isAddingMember}
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddMember}
            disabled={isAddingMember}
          >
            {isAddingMember
              ? t('circlesAdmin:unassigned.adding', 'Adding...')
              : t('circlesAdmin:unassigned.confirmAdd', 'Add to Group')
            }
          </button>
        </ModalFooter>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={removeModal.isOpen}
        onClose={handleCloseRemoveModal}
        title={t('circlesAdmin:groups.removeTitle', 'Remove Member')}
        size="sm"
      >
        <p style={{ color: 'var(--neutral-600)', margin: 0 }}>
          {t('circlesAdmin:groups.removeConfirm', 'Remove {{name}} from {{group}}?', {
            name: removeModal.member?.name || 'Member',
            group: removeModal.fromGroup?.name || '',
          })}
        </p>
        <div className="modal-warning" style={{ marginTop: 'var(--space-3)' }}>
          {t('circlesAdmin:groups.removeWarning', 'This will also remove their invitation. They will need to be re-invited to join again.')}
        </div>
        <ModalFooter>
          <button
            className="btn btn-ghost"
            onClick={handleCloseRemoveModal}
            disabled={isRemoving}
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleRemoveMember}
            disabled={isRemoving}
          >
            {isRemoving
              ? t('circlesAdmin:groups.removing', 'Removing...')
              : t('circlesAdmin:groups.confirmRemove', 'Remove Member')
            }
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Group Name Modal */}
      <Modal
        isOpen={editGroupModal.isOpen}
        onClose={handleCloseEditGroupModal}
        title={t('circlesAdmin:groups.editGroupTitle', 'Edit Group Name')}
        size="sm"
      >
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="edit-group-name" className="form-label">
            {t('circlesAdmin:groups.groupName', 'Group Name')}
          </label>
          <input
            id="edit-group-name"
            type="text"
            className="form-input"
            value={editGroupModal.name}
            onChange={(e) => setEditGroupModal(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t('circlesAdmin:groups.groupNamePlaceholder', 'Enter group name')}
            disabled={isEditingGroup}
          />
        </div>
        <ModalFooter>
          <button
            className="btn btn-ghost"
            onClick={handleCloseEditGroupModal}
            disabled={isEditingGroup}
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdateGroupName}
            disabled={isEditingGroup || !editGroupModal.name.trim()}
          >
            {isEditingGroup
              ? t('common:saving', 'Saving...')
              : t('common:save', 'Save')
            }
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
