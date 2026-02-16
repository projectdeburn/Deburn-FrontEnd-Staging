/**
 * Coach Page
 * AI coaching chat interface with streaming responses
 */

import { useState, useEffect, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { coachApi } from '@/features/coach/coachApi';
import { get, del } from '@/utils/api';
import { FormattedMessage, StreamingMessage } from '@/utils/formatCoachResponse.jsx';
import ArticleModal from '@/components/learning/ArticleModal';
import AudioModal from '@/components/learning/AudioModal';

// LocalStorage key for conversation history
const CONVERSATION_STORAGE_KEY = 'hfai_coach_conversation';

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
  return (
    <div className={`message ${message.role === 'user' ? 'message-user' : 'message-coach'}`}>
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

export default function Coach() {
  const { t, i18n } = useTranslation(['coach', 'common']);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingContentRef = useRef('');
  const actionsRef = useRef([]);
  const messagesRef = useRef([]);
  const conversationIdRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showStarters, setShowStarters] = useState(true);
  const [quickReplies, setQuickReplies] = useState([]);
  const [actions, setActions] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [learningContent, setLearningContent] = useState([]);

  // Modal state for action content
  const [selectedModule, setSelectedModule] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const prevLanguageRef = useRef(i18n.language);

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

  // Load conversation from localStorage on mount, then sync with backend
  useEffect(() => {
    async function loadConversation() {
      // Step 1: Load from localStorage for instant display
      const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.messages && parsed.messages.length > 0) {
            setMessages(parsed.messages);
            setConversationId(parsed.conversationId || null);
            setShowStarters(false);
          }
        } catch (e) {
          console.error('Error parsing stored conversation:', e);
        }
      }

      // Step 2: Sync with backend (backend is source of truth)
      try {
        const response = await get('/api/conversations');
        if (response.success && response.data?.messages?.length > 0) {
          const backendMessages = response.data.messages.map((msg, index) => ({
            id: index,
            role: msg.role,
            content: msg.content,
            actions: msg.actions || [],
          }));
          const backendConvId = response.data.conversation?.id || null;

          // Backend has data - update localStorage and state
          setMessages(backendMessages);
          setConversationId(backendConvId);
          setShowStarters(false);

          // Update localStorage with backend data
          localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify({
            messages: backendMessages,
            conversationId: backendConvId,
          }));
        }
      } catch (error) {
        // Backend sync failed, keep localStorage data
        console.error('Error syncing with backend:', error);
      }
    }

    loadConversation();
  }, []);

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

  // Save messages to localStorage whenever they change (debounced to avoid blocking during rapid updates)
  const saveTimerRef = useRef(null);
  messagesRef.current = messages;
  conversationIdRef.current = conversationId;
  useEffect(() => {
    if (messages.length > 0) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify({
          messages,
          conversationId,
        }));
      }, 1500);
    }
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [messages, conversationId]);

  // Flush pending localStorage write on unmount to prevent data loss
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        if (messagesRef.current.length > 0) {
          localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify({
            messages: messagesRef.current,
            conversationId: conversationIdRef.current,
          }));
        }
      }
    };
  }, []);

  // Translate conversation when language changes
  useEffect(() => {
    const prevLanguage = prevLanguageRef.current;
    const currentLanguage = i18n.language;

    // Update ref for next comparison
    prevLanguageRef.current = currentLanguage;

    // Skip if no language change or no conversation
    if (prevLanguage === currentLanguage || !conversationId || messages.length === 0) {
      return;
    }

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

  // Send a message
  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

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
            }
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

  async function handleClearHistory(e) {
    e.preventDefault();
    if (!window.confirm(t('coach:clearHistoryConfirm', 'Are you sure you want to clear your conversation history?'))) {
      return;
    }

    try {
      await del('/api/conversations');
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
      setMessages([]);
      setConversationId(null);
      setShowStarters(true);
    } catch {
      // Silent fail
    }
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
          <div className="chat-input-wrapper">
            <button
              className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
              id="voice-input-btn"
              title={t('coach:input.voice', 'Voice input')}
              onClick={toggleVoiceInput}
              disabled={isLoading}
            >
              {icons.mic}
              <div className="voice-recording-indicator" id="voice-recording-indicator"></div>
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
            <a
              href="#"
              className="clear-history-link"
              onClick={handleClearHistory}
            >
              {t('coach:clearHistory', 'Clear history')}
            </a>
            <span className="chat-hint-separator">•</span>
            <span>{t('coach:input.hint', 'Your conversations are private and confidential')}</span>
          </p>
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
