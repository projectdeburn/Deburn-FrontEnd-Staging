/**
 * Notification Context
 * Manages notification state and provides methods to interact with notifications
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi } from '@/features/notifications/notificationApi';
import { useAuth } from '@/context/AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const result = await notificationApi.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.data.unread);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (reset = false) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const offset = reset ? 0 : notifications.length;
      const result = await notificationApi.getNotifications({ limit: 20, offset });

      if (result.success) {
        if (reset) {
          setNotifications(result.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...result.data.notifications]);
        }
        setHasMore(result.data.hasMore);
        setTotal(result.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, notifications.length]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const result = await notificationApi.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationApi.markAllAsRead();
      if (result.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Refresh notifications (reset and fetch fresh)
  const refresh = useCallback(() => {
    fetchNotifications(true);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchNotifications(false);
    }
  }, [fetchNotifications, isLoading, hasMore]);

  // Fetch unread count on auth state change
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    total,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refresh,
    loadMore,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
