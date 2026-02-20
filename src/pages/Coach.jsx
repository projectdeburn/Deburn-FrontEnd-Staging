/**
 * Coach Page
 * AI coaching chat interface with streaming responses and multiple conversations
 */

import { useState, useEffect, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { coachApi } from '@/features/coach/coachApi';
import { get } from '@/utils/api';
import { FormattedMessage, StreamingMessage } from '@/utils/formatCoachResponse.jsx';
import ArticleModal from '@/components/learning/ArticleModal';
import AudioModal from '@/components/learning/AudioModal';

// LocalStorage key — only persist which conversation was last active
const ACTIVE_CONVERSATION_KEY = 'hfai_coach_active_conversation';

// Hero image import
import heroCoach from '@/assets/images/hero-coach.jpg';

// SVG Icons
const icons = {
  compass: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
    </svg>
  ),
  heart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
    </svg>
  ),
  mic: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
  ),
  send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" x2="11" y1="2" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  volume: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>
  ),
  stop: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  ),
  // Action icons
  playCircle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
  ),
  headphones: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path>
    </svg>
  ),
  bookOpen: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  // Sidebar icons
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19"></line>
      <line x1="5" x2="19" y1="12" y2="12"></line>
    </svg>
  ),
  messageSquare: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"></path>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18"></line>
      <line x1="6" x2="18" y1="6" y2="18"></line>
    </svg>
  ),
  sidebar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" x2="9" y1="3" y2="21"></line>
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  chevronUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  ),
};

// Coach avatar SVG component
const CoachAvatar = () => (
  <svg className="coach-avatar-svg" viewBox="0 0 100 100">
    <circle className="avatar-orb avatar-orb-1" cx="55" cy="50" r="40"/>
    <circle className="avatar-orb avatar-orb-2" cx="53" cy="50" r="32"/>
    <circle className="avatar-orb avatar-orb-3" cx="51" cy="50" r="24"/>
    <circle className="avatar-orb avatar-orb-4" cx="49" cy="50" r="16"/>
    <circle className="avatar-orb avatar-orb-5" cx="47" cy="50" r="8"/>
  </svg>
);

// Get icon based on action type/contentType (pure function, no component deps)
function getActionIcon(action) {
  const contentType = action.metadata?.contentType || '';
  if (contentType === 'audio_article' || contentType === 'audio_exercise') {
    return icons.playCircle;
  } else if (action.type === 'exercise') {
    return icons.headphones;
  }
  return icons.bookOpen;
}

// Memoized message item — only re-renders when its message or playingMessageId changes.
// Prevents re-rendering all historical messages during streaming ticks.
const MessageItem = memo(function MessageItem({ message, playingMessageId, onActionClick, onPlayTTS, onStopTTS, getActionTitle, t }) {
  if (message.isError) {
    return (
      <div className="message message-system message-error">
        <div className="message-content">{message.content}</div>
      </div>
    );
  }

  return (
    <div className={`message ${message.role === 'user' ? 'message-user' : 'message-coach'}${message.partial ? ' message-partial' : ''}`}>
      {message.role === 'assistant' && (
        <div className="message-avatar">
          <CoachAvatar />
        </div>
      )}
      <div className="message-content">
        <FormattedMessage content={message.content} />
        {message.role === 'assistant' && message.actions && message.actions.length > 0 && (
          <div className="coach-content-suggestions">
            {message.actions.map((action) => (
              <button
                key={action.id}
                className="coach-content-card"
                onClick={() => onActionClick(action)}
              >
                <div className="coach-content-card-icon">
                  {getActionIcon(action)}
                </div>
                <div className="coach-content-card-title">
                  {getActionTitle(action)}
                </div>
              </button>
            ))}
          </div>
        )}
        {message.role === 'assistant' && message.content.length > 10 && (
          <button
            className={`coach-listen-btn ${playingMessageId === message.id ? 'playing' : ''}`}
            onClick={() => {
              if (playingMessageId === message.id) {
                onStopTTS();
              } else {
                onPlayTTS(message.content, message.id);
              }
            }}
          >
            {playingMessageId === message.id ? icons.stop : icons.volume}
            <span className="listen-text">
              {playingMessageId === message.id
                ? t('coach:stop', 'Stop')
                : t('coach:listen', 'Listen')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.message === next.message && prev.playingMessageId === next.playingMessageId;
});

// Format relative time for sidebar
function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Coach() {
  const { t, i18n } = useTranslation(['coach', 'common']);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingContentRef = useRef('');
  const actionsRef = useRef([]);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showStarters, setShowStarters] = useState(true);
  const [quickReplies, setQuickReplies] = useState([]);
  const [actions, setActions] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [learningContent, setLearningContent] = useState([]);

  // Conversation list (sidebar)
  const [conversationList, setConversationList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Modal state for action content
  const [selectedModule, setSelectedModule] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const prevLanguageRef = useRef(i18n.language);
  const prevConversationIdRef = useRef(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);

  // Cleanup media recorder and audio on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Pre-load learning content for action cards
  useEffect(() => {
    async function loadLearningContent() {
      try {
        const response = await get('/api/learning/content');
        if (response.success) {
          setLearningContent(response.data.items || []);
        }
      } catch (error) {
        console.error('Error loading learning content:', error);
      }
    }
    loadLearningContent();
  }, []);

  // Load conversation list and restore last active conversation on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await coachApi.listConversations();
        if (response.conversations) {
          setConversationList(response.conversations);

          // Try to restore the last active conversation
          const savedId = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
          const targetId = savedId && response.conversations.some(c => c.conversationId === savedId)
            ? savedId
            : null;

          if (targetId) {
            await loadConversation(targetId);
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
    loadConversations();
  }, []);

  // Persist active conversation id
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
    }
  }, [conversationId]);

  // Load a specific conversation by id
  async function loadConversation(convId) {
    setLoadingConversation(true);
    try {
      const response = await coachApi.getConversation(convId);
      // Real backend returns messages directly; mock wraps in {success, data}
      const msgs = response.messages || response.data?.messages;
      if (msgs) {
        const loadedMessages = msgs.map((msg, index) => ({
          id: index,
          role: msg.role,
          content: msg.content,
          actions: msg.actions || [],
        }));
        setMessages(loadedMessages);
        setConversationId(convId);
        setShowStarters(false);
        setQuickReplies([]);
        setActions([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoadingConversation(false);
    }
  }

  // Auto-play TTS when voice input response is ready
  const playTTS = async (text, messageId) => {
    try {
      setPlayingMessageId(messageId);
      // Get voice preference from localStorage (synced with backend by Profile page)
      const voice = localStorage.getItem('coachVoice') || 'Alice';
      const audioBlob = await coachApi.textToSpeech(text, { voice, language: i18n.language });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingMessageId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingMessageId(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setPlayingMessageId(null);
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingMessageId(null);
  };

  const toggleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording — onstop handler will handle transcription
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type (webm for Chrome/Firefox, mp4 for Safari)
      let mimeType = 'audio/webm;codecs=opus';
      let fileExtension = 'webm';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        fileExtension = 'mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
          fileExtension = 'webm';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Release microphone
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        audioChunksRef.current = [];

        // Skip empty/silent recordings
        if (audioBlob.size < 1000) return;

        setIsLoading(true);
        try {
          const transcript = await coachApi.transcribeAudio(audioBlob, {
            language: i18n.language,
            filename: `recording.${fileExtension}`,
          });

          if (transcript && transcript.trim()) {
            setInputValue(transcript);
            setIsVoiceInput(true);
            setTimeout(() => {
              sendMessage(transcript);
            }, 100);
          }
        } catch (error) {
          console.error('Transcription error:', error);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.onerror = () => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 120 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 120000);

    } catch (error) {
      console.error('Microphone access error:', error);
      setIsRecording(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Translate conversation when language changes or conversation switches while on non-default language
  useEffect(() => {
    const prevLanguage = prevLanguageRef.current;
    const prevConvId = prevConversationIdRef.current;
    const currentLanguage = i18n.language;

    const languageChanged = prevLanguage !== currentLanguage;
    const conversationSwitched = prevConvId !== conversationId;

    // Update refs
    prevLanguageRef.current = currentLanguage;
    prevConversationIdRef.current = conversationId;

    if (!conversationId || messages.length === 0) return;

    // Translate if language changed, or conversation switched while on non-default language
    const needsTranslation = languageChanged || (conversationSwitched && currentLanguage !== 'en');
    if (!needsTranslation) return;

    async function translateMessages() {
      setIsTranslating(true);
      // Clear quick replies since they're language-specific
      setQuickReplies([]);

      try {
        const response = await coachApi.translateConversation(
          conversationId,
          currentLanguage,
          { count: 50 }
        );

        if (response.translatedMessages?.length > 0) {
          // Create a map of index to translated content
          const translationMap = new Map();
          response.translatedMessages.forEach((tm) => {
            translationMap.set(tm.index, tm.content);
          });

          // Update messages with translated content
          setMessages((prev) =>
            prev.map((msg, idx) => {
              const translated = translationMap.get(idx);
              if (translated) {
                return { ...msg, content: translated };
              }
              return msg;
            })
          );
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    }

    translateMessages();
  }, [i18n.language, conversationId, messages.length]);

  // Conversation starters
  const starters = [
    {
      key: 'leadership',
      icon: icons.compass,
      text: t('coach:starters.leadership', 'I want to work on my leadership skills'),
    },
    {
      key: 'stress',
      icon: icons.heart,
      text: t('coach:starters.stress', 'My stress has been building up'),
    },
  ];

  // Refresh conversation list from backend
  async function refreshConversationList() {
    try {
      const response = await coachApi.listConversations();
      if (response.conversations) {
        setConversationList(response.conversations);
      }
    } catch (error) {
      console.error('Error refreshing conversation list:', error);
    }
  }

  // Send a message
  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    const isNewConversation = !conversationId;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setShowStarters(false);
    setQuickReplies([]);
    setActions([]);
    setIsLoading(true);
    setStreamingContent('');
    streamingContentRef.current = '';
    actionsRef.current = [];

    // Batched update timer for smoother rendering
    let updateTimer = null;
    const flushUpdate = () => {
      if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
      }
      setStreamingContent(streamingContentRef.current);
    };

    try {
      const assistantId = Date.now() + 1;

      await coachApi.streamMessage(
        text,
        {
          conversationId,
          language: i18n.language,
        },
        {
          onText: (content) => {
            streamingContentRef.current += content;
            // Batch updates every 30ms for smoother rendering
            if (!updateTimer) {
              updateTimer = setTimeout(flushUpdate, 30);
            }
          },
          onActions: (actionList) => {
            if (actionList && actionList.length > 0) {
              actionsRef.current = actionList;
              setActions(actionList);
            }
          },
          onQuickReplies: (replies) => {
            setQuickReplies(replies);
          },
          onMetadata: (metadata) => {
            if (metadata.conversationId) {
              setConversationId(metadata.conversationId);
              // If this was a new conversation, refresh the sidebar
              if (isNewConversation) {
                refreshConversationList();
              }
            }
          },
          onRetry: () => {
            // Discard partial content from failed attempt
            if (updateTimer) {
              clearTimeout(updateTimer);
              updateTimer = null;
            }
            streamingContentRef.current = '';
            actionsRef.current = [];
            setStreamingContent('');
            setActions([]);
          },
          onDone: () => {
            // Clear any pending update timer and flush final content
            if (updateTimer) {
              clearTimeout(updateTimer);
              updateTimer = null;
            }
            // Capture the final content and actions from refs before clearing
            const finalContent = streamingContentRef.current;
            const finalActions = actionsRef.current;
            setMessages((prev) => [
              ...prev,
              {
                id: assistantId,
                role: 'assistant',
                content: finalContent,
                actions: finalActions,
              },
            ]);
            setStreamingContent('');
            streamingContentRef.current = '';
            actionsRef.current = [];
            setIsLoading(false);

            // Auto-play TTS if input was via voice
            if (isVoiceInput && finalContent.length > 10) {
              playTTS(finalContent, assistantId);
              setIsVoiceInput(false);
            }
          },
          onError: (error) => {
            console.error('Stream error:', error);

            // Preserve any partial content already streamed
            const partial = streamingContentRef.current;
            if (partial) {
              setMessages((prev) => [...prev, {
                id: assistantId,
                role: 'assistant',
                content: partial,
                partial: true,
              }]);
            }

            // Show user-facing error message
            setMessages((prev) => [...prev, {
              id: Date.now() + 2,
              role: 'system',
              content: t('coach:streamError', 'I had trouble responding. Please try again.'),
              isError: true,
            }]);

            setStreamingContent('');
            streamingContentRef.current = '';
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  }

  function handleStarterClick(starter) {
    sendMessage(starter.text);
  }

  function handleQuickReply(reply) {
    sendMessage(reply);
  }

  // Get localized title for action card
  function getActionTitle(action) {
    const category = action.metadata?.category;
    const contentType = action.metadata?.contentType;

    // Try to find matching content for localized title
    let module = null;
    if (category && contentType) {
      module = learningContent.find(
        (item) => item.category === category && item.contentType === contentType
      );
    }
    if (!module && contentType) {
      module = learningContent.find((item) => item.contentType === contentType);
    }

    if (module) {
      return i18n.language === 'sv' ? (module.titleSv || module.titleEn) : module.titleEn;
    }

    // Fall back to action label
    return action.label;
  }

  // Handle action card click - find module from pre-loaded content and open modal
  function handleActionClick(action) {
    // Find matching content from pre-loaded learning content
    // Match by category and contentType from action metadata
    const category = action.metadata?.category;
    const contentType = action.metadata?.contentType;

    let module = null;

    if (category && contentType) {
      // First try exact match on category and contentType
      module = learningContent.find(
        (item) => item.category === category && item.contentType === contentType
      );
    }

    if (!module && contentType) {
      // Fall back to just contentType match
      module = learningContent.find((item) => item.contentType === contentType);
    }

    if (!module) {
      console.error('No matching content found for action:', action.id);
      return;
    }

    setSelectedModule(module);

    // Open appropriate modal based on content type
    if (module.contentType === 'text_article') {
      setShowArticleModal(true);
    } else if (module.contentType === 'audio_article' || module.contentType === 'audio_exercise') {
      setShowAudioModal(true);
    } else if (module.contentType === 'video_link' && module.videoUrl) {
      // Open video in new tab
      window.open(module.videoUrl, '_blank');
    }
  }

  // Close modals
  function closeModals() {
    setShowArticleModal(false);
    setShowAudioModal(false);
    setSelectedModule(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(inputValue);
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  // --- Sidebar handlers ---

  function handleNewChat() {
    setMessages([]);
    setConversationId(null);
    setShowStarters(true);
    setQuickReplies([]);
    setActions([]);
    setStreamingContent('');
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    setSidebarOpen(false);
  }

  async function handleSelectConversation(convId) {
    if (convId === conversationId) {
      setSidebarOpen(false);
      return;
    }
    await loadConversation(convId);
    setSidebarOpen(false);
  }

  async function handleDeleteConversation(convId) {
    if (!window.confirm(t('coach:deleteConversationConfirm', 'Delete this conversation?'))) {
      return;
    }

    try {
      await coachApi.deleteConversation(convId);
      setConversationList((prev) => prev.filter((c) => c.conversationId !== convId));

      // If we deleted the active conversation, reset to new chat
      if (convId === conversationId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  function handleStartRename(convId, currentTitle) {
    setEditingTitle(convId);
    setEditTitleValue(currentTitle);
  }

  async function handleSaveRename(convId) {
    const newTitle = editTitleValue.trim();
    if (!newTitle) {
      setEditingTitle(null);
      return;
    }

    try {
      await coachApi.renameConversation(convId, newTitle);
      setConversationList((prev) =>
        prev.map((c) =>
          c.conversationId === convId ? { ...c, title: newTitle } : c
        )
      );
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
    setEditingTitle(null);
  }

  function handleCancelRename() {
    setEditingTitle(null);
    setEditTitleValue('');
  }

  return (
    <div className="coach-content">
      {/* Hero Section */}
      <div className="hero-section hero-compact">
        <div className="hero-image-container">
          <img
            src={heroCoach}
            alt="Abstract shapes representing conversation"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-greeting">{t('coach:hero.title', 'Ask Eve')}</h1>
          <p className="hero-tagline">
            {t('coach:hero.tagline', 'Your leadership coach')}
          </p>
        </div>
      </div>

      {/* Coach Body: Sidebar + Chat */}
      <div className="coach-body">
        {/* Conversation Sidebar */}
        <div className={`conversation-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="new-chat-btn" onClick={handleNewChat}>
            {icons.plus}
            <span>{t('coach:newChat', 'New Chat')}</span>
          </button>

          <div className="conversation-list">
            {conversationList.map((conv) => (
              <div
                key={conv.conversationId}
                className={`conversation-item ${conv.conversationId === conversationId ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.conversationId)}
              >
                <div className="conversation-item-icon">
                  {icons.messageSquare}
                </div>
                <div className="conversation-item-body">
                  {editingTitle === conv.conversationId ? (
                    <div className="conversation-item-edit" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        className="conversation-rename-input"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conv.conversationId);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        autoFocus
                      />
                      <button
                        className="conversation-edit-btn save"
                        onClick={() => handleSaveRename(conv.conversationId)}
                      >
                        {icons.check}
                      </button>
                      <button
                        className="conversation-edit-btn cancel"
                        onClick={handleCancelRename}
                      >
                        {icons.x}
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="conversation-item-title">{conv.title || t('coach:yourConversation', 'Your Conversation')}</span>
                      <span className="conversation-item-meta">
                        {conv.messageCount} {t('coach:messages', 'messages')}
                        {conv.lastMessageAt && ` · ${formatRelativeTime(conv.lastMessageAt)}`}
                      </span>
                    </>
                  )}
                </div>
                {editingTitle !== conv.conversationId && (
                  <div className="conversation-item-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="conversation-action-btn"
                      title={t('coach:rename', 'Rename')}
                      onClick={() => handleStartRename(conv.conversationId, conv.title)}
                    >
                      {icons.edit}
                    </button>
                    <button
                      className="conversation-action-btn delete"
                      title={t('coach:delete', 'Delete')}
                      onClick={() => handleDeleteConversation(conv.conversationId)}
                    >
                      {icons.trash}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {conversationList.length === 0 && (
              <div className="conversation-list-empty">
                <p>{t('coach:noConversations', 'No conversations yet')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown trigger bar */}
        <div className="conversation-dropdown-bar" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span className="conversation-dropdown-title">
            {icons.messageSquare}
            {conversationId
              ? (conversationList.find(c => c.conversationId === conversationId)?.title
                || t('coach:yourConversation', 'Your Conversation'))
              : t('coach:newChat', 'New Chat')}
          </span>
          <div className="conversation-dropdown-actions">
            <button
              className="new-chat-header-btn"
              onClick={(e) => { e.stopPropagation(); handleNewChat(); }}
              title={t('coach:newChat', 'New Chat')}
            >
              {icons.plus}
            </button>
            {sidebarOpen ? icons.chevronUp : icons.chevronDown}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="chat-container">

          {/* Translation Indicator */}
          {isTranslating && (
            <div className="translation-indicator">
              <span className="translation-spinner"></span>
              <span>{t('coach:translating', 'Translating conversation...')}</span>
            </div>
          )}
          <div className="chat-messages" id="chat-messages">
            {loadingConversation && (
              <div className="chat-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            {/* Welcome Message */}
            <div className="message message-coach" id="welcome-message">
              <div className="message-avatar">
                <CoachAvatar />
              </div>
              <div className="message-content">
                <p>
                  {t('coach:welcome.greeting', "Hello! I'm your AI Leadership Coach. I'm here to help you grow as a leader, manage stress, and build stronger teams.")}
                </p>
                <p style={{ marginTop: '12px' }}>
                  {t('coach:welcome.prompt', 'What would you like to explore today?')}
                </p>
              </div>
            </div>

            {/* Conversation Starters */}
            {showStarters && (
              <div className="conversation-starters" id="conversation-starters">
                {starters.map((starter) => (
                  <button
                    key={starter.key}
                    className="starter-btn"
                    data-starter-key={starter.key}
                    onClick={() => handleStarterClick(starter)}
                  >
                    {starter.icon}
                    <span>{starter.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                playingMessageId={playingMessageId}
                onActionClick={handleActionClick}
                onPlayTTS={playTTS}
                onStopTTS={stopTTS}
                getActionTitle={getActionTitle}
                t={t}
              />
            ))}

            {/* Streaming Content */}
            {streamingContent && (
              <div className="message message-coach">
                <div className="message-avatar">
                  <CoachAvatar />
                </div>
                <div className="message-content">
                  <StreamingMessage content={streamingContent} />
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && !streamingContent && (
              <div className="message message-coach typing-indicator">
                <div className="message-avatar">
                  <CoachAvatar />
                </div>
                <div className="message-content">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          {quickReplies.length > 0 && !isLoading && (
            <div className="quick-replies" id="quick-replies">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-chip"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input */}
          <div className="chat-input-container">
            {isRecording ? (
              <button className="recording-bar" onClick={toggleVoiceInput}>
                <span className="recording-bar-dot"></span>
                <span className="recording-bar-label">{t('coach:recording', 'Recording...')}</span>
                <span className="recording-bar-stop">{icons.stop} {t('coach:tapToStop', 'Tap to stop')}</span>
              </button>
            ) : (
              <>
                <div className="chat-input-wrapper">
                  <button
                    className="voice-input-btn"
                    id="voice-input-btn"
                    title={t('coach:input.voice', 'Voice input')}
                    onClick={toggleVoiceInput}
                    disabled={isLoading}
                  >
                    {icons.mic}
                  </button>
                  <textarea
                    ref={inputRef}
                    className="chat-input"
                    id="coach-input"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-grow: reset height then set to scrollHeight
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder={t('coach:input.placeholder', 'Type a message...')}
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    className="chat-send-btn"
                    id="coach-send-btn"
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    {icons.send}
                  </button>
                </div>
                <p className="chat-hint">
                  <span>{t('coach:input.hint', 'Your conversations are private and confidential')}</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Modals */}
      {showArticleModal && selectedModule && (
        <ArticleModal module={selectedModule} onClose={closeModals} />
      )}

      {showAudioModal && selectedModule && (
        <AudioModal module={selectedModule} onClose={closeModals} />
      )}
    </div>
  );
}
