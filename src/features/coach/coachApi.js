/**
 * Coach API Client
 * Handles AI coach communication
 */

import { get, post, del, patch, getApiBaseUrl, getAuthToken } from '@/utils/api';

const BASE = '/api/coach';

class RetryableStreamError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RetryableStreamError';
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoff(attempt) {
  return Math.min(1000 * 2 ** attempt, 4000) + Math.random() * 500;
}

export const coachApi = {
  /**
   * Send a message to the AI coach (non-streaming)
   */
  sendMessage(message, conversationId = null, context = {}, language = 'en') {
    return post(`${BASE}/chat`, {
      message,
      conversationId,
      context,
      language,
    });
  },

  /**
   * Stream a message to the AI coach with automatic retry on transient failures.
   * Each retry is a fresh request — partial content from failed attempts is discarded.
   * @param {string} message - The message to send
   * @param {object} options - Options including conversationId, context, language
   * @param {object} callbacks - Callback functions for stream events
   */
  async streamMessage(message, options = {}, callbacks = {}) {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this._doStream(message, options, callbacks);
      } catch (error) {
        const isLastAttempt = attempt === maxRetries - 1;
        const isRetryable = error instanceof RetryableStreamError;

        if (!isRetryable || isLastAttempt) {
          callbacks.onError?.(error);
          throw error;
        }

        // Discard partial content from this attempt and retry
        callbacks.onRetry?.();
        await sleep(backoff(attempt));
      }
    }
  },

  /**
   * Internal: execute a single stream attempt.
   */
  async _doStream(message, options = {}, callbacks = {}) {
    const {
      conversationId = null,
      context = {},
      language = 'en',
    } = options;

    const {
      onText = () => {},
      onActions = () => {},
      onQuickReplies = () => {},
      onMetadata = () => {},
      onDone = () => {},
    } = callbacks;

    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${baseUrl}${BASE}/chat`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          message,
          conversationId,
          context,
          language,
        }),
      });
    } catch (err) {
      // Network error (TypeError from fetch) — retryable
      throw new RetryableStreamError(err.message);
    }

    if (!response.ok) {
      if (response.status >= 500) {
        throw new RetryableStreamError(`Server error: ${response.status}`);
      }
      // 4xx — not retryable
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let newConversationId = conversationId;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            onDone(newConversationId);
            return newConversationId;
          }

          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            // Ignore JSON parse errors for incomplete chunks
            continue;
          }

          switch (parsed.type) {
            case 'text':
              onText(parsed.content);
              break;
            case 'actions':
              onActions(parsed.content);
              break;
            case 'quickReplies':
              onQuickReplies(parsed.content);
              break;
            case 'metadata':
              if (parsed.content.conversationId) {
                newConversationId = parsed.content.conversationId;
              }
              onMetadata(parsed.content);
              break;
            case 'error':
              if (parsed.retryable) {
                throw new RetryableStreamError(parsed.content);
              }
              throw new Error(parsed.content);
            case 'done':
              onDone(newConversationId);
              return newConversationId;
          }
        }
      }
    }

    onDone(newConversationId);
    return newConversationId;
  },

  /**
   * Get conversation history
   */
  getHistory(conversationId, limit = 50) {
    return get(`${BASE}/history?conversationId=${conversationId}&limit=${limit}`);
  },

  /**
   * Get conversation starters
   */
  getStarters(language = 'en', wellbeing = null) {
    const params = new URLSearchParams({ language });

    if (wellbeing) {
      params.set('includeWellbeing', 'true');
      params.set('mood', wellbeing.mood || 3);
      params.set('energy', wellbeing.energy || 5);
      params.set('stress', wellbeing.stress || 5);
    }

    return get(`${BASE}/starters?${params.toString()}`);
  },

  /**
   * List all conversations (summaries)
   */
  listConversations(skip = 0, limit = 20) {
    return get(`${BASE}/conversations/list?skip=${skip}&limit=${limit}`);
  },

  /**
   * Get a full conversation by ID (with messages)
   */
  getConversation(conversationId) {
    return get(`${BASE}/conversations/${conversationId}`);
  },

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId) {
    return del(`${BASE}/conversations/${conversationId}`);
  },

  /**
   * Rename a conversation
   */
  renameConversation(conversationId, title) {
    return patch(`${BASE}/conversations/${conversationId}`, { title });
  },

  /**
   * Submit feedback for a message
   */
  submitFeedback(messageId, rating, feedback = '', category = 'coaching_quality') {
    return post(`${BASE}/feedback`, {
      messageId,
      rating,
      feedback,
      category,
    });
  },

  /**
   * Get available exercises
   */
  getExercises() {
    return get(`${BASE}/exercises`);
  },

  /**
   * Convert text to speech using ElevenLabs
   * @param {string} text - Text to convert to speech
   * @param {object} options - Options including voice, language
   * @returns {Promise<Blob>} Audio blob (MP3)
   */
  async textToSpeech(text, options = {}) {
    const { voice = 'Aria', language = 'en' } = options;

    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${BASE}/voice`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ text, voice, language }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    return response.blob();
  },

  /**
   * Translate conversation messages to target language
   * @param {string} conversationId - Conversation ID
   * @param {string} targetLanguage - Target language code ('en' or 'sv')
   * @param {object} options - Options including startIndex, count
   * @returns {Promise<object>} Translated messages and metadata
   */
  translateConversation(conversationId, targetLanguage, options = {}) {
    const { startIndex = null, count = 20 } = options;

    return post(`${BASE}/conversations/translate`, {
      conversationId,
      targetLanguage,
      startIndex,
      count,
    });
  },

  /**
   * Transcribe audio to text using Whisper
   * @param {Blob} audioBlob - Recorded audio blob
   * @param {object} options - Options including language, filename
   * @returns {Promise<string>} Transcribed text
   */
  async transcribeAudio(audioBlob, options = {}) {
    const { language = 'en', filename = 'recording.webm' } = options;

    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    formData.append('language', language);

    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${BASE}/transcribe`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail?.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.data.text;
  },
};
