/**
 * Coach API Client
 * Handles AI coach communication
 */

import { get, post, getApiBaseUrl, getAuthToken } from '@/utils/api';

const BASE = '/api/coach';

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
   * Stream a message to the AI coach
   * @param {string} message - The message to send
   * @param {object} options - Options including conversationId, context, language
   * @param {object} callbacks - Callback functions for stream events
   */
  async streamMessage(message, options = {}, callbacks = {}) {
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
      onError = () => {},
    } = callbacks;

    try {
      const baseUrl = getApiBaseUrl();
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}${BASE}/chat`, {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stream message');
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

            try {
              const parsed = JSON.parse(data);

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
                  onError(new Error(parsed.content));
                  break;
                case 'done':
                  onDone(newConversationId);
                  return newConversationId;
              }
            } catch {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      onDone(newConversationId);
      return newConversationId;
    } catch (error) {
      onError(error);
      throw error;
    }
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
