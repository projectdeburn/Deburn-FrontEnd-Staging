/**
 * Notification Dropdown Component
 * Bell icon with badge and dropdown list of notifications
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/context/NotificationContext';

// Notification type icons
const TYPE_ICONS = {
  invitation: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  group_assignment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  meeting_scheduled: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  meeting_reminder: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  user_moved: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 10 20 15 15 20"></polyline>
      <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
    </svg>
  ),
};

// Format relative time
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NotificationDropdown() {
  const { t } = useTranslation(['common']);
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(true);
    }
  }, [isOpen, notifications.length, fetchNotifications]);

  function handleToggle() {
    setIsOpen(!isOpen);
  }

  function handleNotificationClick(notification) {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  }

  function handleMarkAllRead() {
    markAllAsRead();
  }

  function handleLoadMore() {
    loadMore();
  }

  return (
    <div ref={dropdownRef} className="notification-dropdown-container">
      <button className="notification-bell-btn" onClick={handleToggle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>{t('common:notifications.title', 'Notifications')}</h3>
            {unreadCount > 0 && (
              <button
                className="notification-mark-all-btn"
                onClick={handleMarkAllRead}
              >
                {t('common:notifications.markAllRead', 'Mark all read')}
              </button>
            )}
          </div>

          <div className="notification-dropdown-list">
            {notifications.length === 0 && !isLoading && (
              <div className="notification-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p>{t('common:notifications.empty', 'No notifications yet')}</p>
              </div>
            )}

            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-item-icon">
                  {TYPE_ICONS[notification.type] || TYPE_ICONS.invitation}
                </div>
                <div className="notification-item-content">
                  <div className="notification-item-title">
                    {!notification.read && <span className="notification-unread-dot"></span>}
                    {notification.title}
                  </div>
                  <div className="notification-item-message">
                    {notification.message}
                  </div>
                  <div className="notification-item-time">
                    {formatRelativeTime(notification.createdAt)}
                  </div>
                </div>
              </button>
            ))}

            {isLoading && (
              <div className="notification-loading">
                <div className="notification-spinner"></div>
              </div>
            )}

            {hasMore && !isLoading && (
              <button
                className="notification-load-more"
                onClick={handleLoadMore}
              >
                {t('common:notifications.loadMore', 'Load more')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
