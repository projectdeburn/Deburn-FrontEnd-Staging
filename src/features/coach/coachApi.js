/**
 * Coach API Client
 * Handles AI coach communication
 */

import { get, post, getApiBaseUrl } from '@/utils/api';

const BASE = `${import.meta.env.VITE_ENDPOINT}/api/coach`;

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
      const response = await fetch(`${baseUrl}${BASE}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
};
