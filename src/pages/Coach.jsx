/**
 * Coach Page
 * AI coaching chat interface with streaming responses
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { coachApi } from '@/features/coach/coachApi';

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

export default function Coach() {
  const { t, i18n } = useTranslation(['coach', 'common']);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingContentRef = useRef('');

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showStarters, setShowStarters] = useState(true);
  const [quickReplies, setQuickReplies] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = i18n.language === 'sv' ? 'sv-SE' : 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        setInputValue(transcript);

        // If final result, send the message
        if (event.results[event.results.length - 1].isFinal) {
          setIsRecording(false);
          setIsVoiceInput(true);
          setTimeout(() => {
            sendMessage(transcript);
          }, 100);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [i18n.language]);

  // Auto-play TTS when voice input response is ready
  const playTTS = async (text, messageId) => {
    try {
      setPlayingMessageId(messageId);
      const audioBlob = await coachApi.textToSpeech(text, { language: i18n.language });
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

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      console.warn('Speech recognition not supported');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

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
    setShowStarters(false);
    setQuickReplies([]);
    setIsLoading(true);
    setStreamingContent('');
    streamingContentRef.current = '';

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
            setStreamingContent(streamingContentRef.current);
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
            // Capture the final content from the ref before clearing
            const finalContent = streamingContentRef.current;
            setMessages((prev) => [
              ...prev,
              {
                id: assistantId,
                role: 'assistant',
                content: finalContent,
              },
            ]);
            setStreamingContent('');
            streamingContentRef.current = '';
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
            {t('coach:hero.tagline', 'Your personal leadership companion')}
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="chat-container">
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
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'message-user' : 'message-coach'}`}
            >
              {message.role === 'assistant' && (
                <div className="message-avatar">
                  <CoachAvatar />
                </div>
              )}
              <div className="message-content">
                <p>{message.content}</p>
                {/* Listen Button for assistant messages */}
                {message.role === 'assistant' && message.content.length > 10 && (
                  <button
                    className={`coach-listen-btn ${playingMessageId === message.id ? 'playing' : ''}`}
                    onClick={() => {
                      if (playingMessageId === message.id) {
                        stopTTS();
                      } else {
                        playTTS(message.content, message.id);
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
          ))}

          {/* Streaming Content */}
          {streamingContent && (
            <div className="message message-coach">
              <div className="message-avatar">
                <CoachAvatar />
              </div>
              <div className="message-content">
                <p>{streamingContent}</p>
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
              className={`voice-input-btn ${isRecording ? 'recording' : ''} ${!recognitionRef.current ? 'not-supported' : ''}`}
              id="voice-input-btn"
              title={t('coach:input.voice', 'Voice input')}
              onClick={toggleVoiceInput}
              disabled={isLoading}
            >
              {icons.mic}
              <div className="voice-recording-indicator" id="voice-recording-indicator"></div>
            </button>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              id="coach-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('coach:input.placeholder', 'Type a message...')}
              disabled={isLoading}
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
            {t('coach:input.hint', 'Your conversations are private and confidential')}
          </p>
        </div>
      </div>
    </div>
  );
}
