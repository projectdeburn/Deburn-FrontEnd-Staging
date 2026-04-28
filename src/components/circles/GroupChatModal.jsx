/**
 * GroupChatModal Component
 * Full-screen chat modal for group messaging within a Think Tank circle
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { circlesApi } from '@/features/circles/circlesApi';
import { useAuth } from '@/context/AuthContext';

const AVATAR_COLORS = [
  '#2D4A47', '#7C9885', '#B8A898', '#5C7A6F', '#8B7355', '#6B8E7D',
];

const icons = {
  send: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" x2="11" y1="2" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  retry: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
  ),
};

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

let tempIdCounter = 0;

export default function GroupChatModal({ isOpen, onClose, group }) {
  const { t } = useTranslation(['circles', 'common']);
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'You'
    : 'You';

  useEffect(() => {
    if (isOpen && group?.id) {
      loadMessages();
    }
    if (!isOpen) {
      setMessages([]);
      setNewMessage('');
    }
  }, [isOpen, group?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  async function loadMessages() {
    setIsLoading(true);
    try {
      const result = await circlesApi.getGroupMessages(group.id);
      if (result.success) {
        setMessages(result.data.messages || []);
      }
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage(content, tempId) {
    try {
      const result = await circlesApi.sendGroupMessage(group.id, content);
      if (result.success) {
        // Swap temp message with server response
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...result.data } : msg))
        );
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...msg, _failed: true, _sending: false } : msg))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, _failed: true, _sending: false } : msg))
      );
    }
  }

  function handleSend(e) {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content) return;

    const tempId = `temp_${++tempIdCounter}`;
    const optimisticMsg = {
      id: tempId,
      userName,
      content,
      createdAt: new Date().toISOString(),
      _sending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');
    inputRef.current?.focus();

    // Fire and forget — UI already updated
    sendMessage(content, tempId);
  }

  function handleRetry(msg) {
    // Reset to sending state and retry
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, _failed: false, _sending: true } : m))
    );
    sendMessage(msg.content, msg.id);
  }

  if (!group) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${group.name} — ${t('circles:groups.messagesTitle', 'Group Messages')}`}
      size="md"
    >
      <div className="group-chat-modal">
        <div className="group-chat-messages">
          {isLoading ? (
            <p className="group-chat-loading">{t('common:loading', 'Loading...')}</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className={`group-chat-msg${msg._failed ? ' group-chat-msg--failed' : ''}${msg._sending ? ' group-chat-msg--sending' : ''}`}>
                <div
                  className="group-chat-msg-avatar"
                  style={{ backgroundColor: AVATAR_COLORS[(msg.userName || '').length % AVATAR_COLORS.length] }}
                >
                  {getInitials(msg.userName)}
                </div>
                <div className="group-chat-msg-body">
                  <div className="group-chat-msg-header">
                    <span className="group-chat-msg-name">{msg.userName}</span>
                    <span className="group-chat-msg-time">
                      {msg._sending ? t('circles:groups.sending', 'Sending...') : formatRelativeTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="group-chat-msg-content">{msg.content}</p>
                  {msg._failed && (
                    <button className="group-chat-msg-retry" onClick={() => handleRetry(msg)}>
                      {icons.retry}
                      <span>{t('circles:groups.retry', 'Failed — tap to retry')}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="group-chat-empty">
              {t('circles:groups.noMessages', 'No messages yet. Start a conversation with your group.')}
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="group-chat-input" onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('circles:groups.messagePlaceholder', 'Write a message...')}
          />
          <button type="submit" disabled={!newMessage.trim()}>
            {icons.send}
          </button>
        </form>
      </div>
    </Modal>
  );
}
