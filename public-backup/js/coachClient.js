/**
 * Deburn AI Coach Client
 * Handles communication with the AI Coach API
 */

const CoachClient = {
  conversationId: null,
  isStreaming: false,

  /**
   * Send a message to the AI coach (non-streaming)
   * @param {string} message - The message to send
   * @param {Object} context - Optional context data
   * @returns {Promise<Object>} - The response
   */
  async sendMessage(message, context = {}) {
    try {
      // Get current language from i18n client
      const language = window.I18nClient?.currentLanguage || 'en';

      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          conversationId: this.conversationId,
          context,
          language
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      const data = await response.json();

      // Update conversation ID
      if (data.conversationId) {
        this.conversationId = data.conversationId;
      }

      return data;
    } catch (error) {
      console.error('Coach send message error:', error);
      throw error;
    }
  },

  /**
   * Stream a message to the AI coach
   * @param {string} message - The message to send
   * @param {Object} callbacks - Callback functions
   * @param {Object} context - Optional context data
   */
  async streamMessage(message, callbacks = {}, context = {}) {
    const {
      onText = () => {},
      onActions = () => {},
      onQuickReplies = () => {},
      onMetadata = () => {},
      onDone = () => {},
      onError = () => {}
    } = callbacks;

    this.isStreaming = true;

    try {
      // Get current language from i18n client
      const language = window.I18nClient?.currentLanguage || 'en';

      const response = await fetch('/api/coach/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          conversationId: this.conversationId,
          context,
          language
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stream message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
              this.isStreaming = false;
              onDone();
              return;
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
                    this.conversationId = parsed.content.conversationId;
                  }
                  onMetadata(parsed.content);
                  break;
                case 'error':
                  onError(new Error(parsed.content));
                  break;
                case 'done':
                  this.isStreaming = false;
                  onDone();
                  return;
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      this.isStreaming = false;
      onDone();
    } catch (error) {
      this.isStreaming = false;
      console.error('Coach stream error:', error);
      onError(error);
    }
  },

  /**
   * Get conversation history
   * @param {string} conversationId - The conversation ID
   * @param {number} limit - Max messages to return
   * @returns {Promise<Object>} - The conversation history
   */
  async getHistory(conversationId, limit = 50) {
    try {
      const response = await fetch(
        `/api/coach/history?conversationId=${conversationId}&limit=${limit}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get history');
      }

      return await response.json();
    } catch (error) {
      console.error('Coach get history error:', error);
      throw error;
    }
  },

  /**
   * Get conversation starters
   * @param {Object} wellbeing - Optional wellbeing data
   * @returns {Promise<Array>} - Conversation starters
   */
  async getStarters(wellbeing = null) {
    try {
      // Get current language from i18n client
      const language = window.I18nClient?.currentLanguage || 'en';

      let url = '/api/coach/starters';
      const params = new URLSearchParams({ language });

      if (wellbeing) {
        params.set('includeWellbeing', 'true');
        params.set('mood', wellbeing.mood || 3);
        params.set('energy', wellbeing.energy || 5);
        params.set('stress', wellbeing.stress || 5);
      }

      url += '?' + params.toString();

      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get starters');
      }

      const data = await response.json();
      return data.starters;
    } catch (error) {
      console.error('Coach get starters error:', error);
      throw error;
    }
  },

  /**
   * Submit feedback for a message
   * @param {string} messageId - The message ID
   * @param {string} rating - The rating (helpful, not_helpful, inappropriate)
   * @param {string} feedback - Optional text feedback
   * @param {string} category - Feedback category
   */
  async submitFeedback(messageId, rating, feedback = '', category = 'coaching_quality') {
    try {
      const response = await fetch('/api/coach/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messageId,
          rating,
          feedback,
          category
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit feedback');
      }

      return await response.json();
    } catch (error) {
      console.error('Coach submit feedback error:', error);
      throw error;
    }
  },

  /**
   * Get available exercises
   * @returns {Promise<Object>} - Exercises and modules
   */
  async getExercises() {
    try {
      const response = await fetch('/api/coach/exercises', {
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get exercises');
      }

      return await response.json();
    } catch (error) {
      console.error('Coach get exercises error:', error);
      throw error;
    }
  },

  /**
   * Start a new conversation
   */
  newConversation() {
    this.conversationId = null;
    this.isStreaming = false;
  }
};

// Make available globally
window.CoachClient = CoachClient;
