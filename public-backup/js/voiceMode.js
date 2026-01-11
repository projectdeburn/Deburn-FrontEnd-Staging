/**
 * Voice Mode Controller
 * Handles speech-to-text (STT) and text-to-speech (TTS) for the AI coach
 */

class VoiceMode {
  constructor(options = {}) {
    this.language = options.language || 'en-US';
    this.onTranscript = options.onTranscript || (() => {});
    this.onInterimTranscript = options.onInterimTranscript || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onEnd = options.onEnd || (() => {});
    this.onError = options.onError || (() => {});

    this.recognition = null;
    this.isListening = false;
    this.audioElement = null;
    this.isPlaying = false;

    this._initSpeechRecognition();
    this._initAudioElement();
  }

  /**
   * Check if speech recognition is supported
   */
  static isSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Initialize the Web Speech API
   */
  _initSpeechRecognition() {
    if (!VoiceMode.isSupported()) {
      console.warn('[VoiceMode] Speech recognition not supported, TTS will still work');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configuration
    this.recognition.continuous = false; // Stop after user stops speaking
    this.recognition.interimResults = true; // Get real-time results
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        this.onInterimTranscript(interimTranscript);
      }

      if (finalTranscript) {
        this.onTranscript(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('[VoiceMode] Speech recognition error:', event.error);
      this.isListening = false;

      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your settings.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          // User cancelled, not an error
          return;
      }

      this.onError(errorMessage, event.error);
    };
  }

  /**
   * Initialize audio element for TTS playback
   */
  _initAudioElement() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
    });
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
    });
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
    });
    this.audioElement.addEventListener('error', (e) => {
      console.error('[VoiceMode] Audio playback error:', e);
      this.isPlaying = false;
    });
  }

  /**
   * Set the recognition language
   * @param {string} lang - Language code (e.g., 'en-US', 'sv-SE')
   */
  setLanguage(lang) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Start listening for speech
   */
  startListening() {
    if (!this.recognition) {
      this.onError('Speech recognition not supported in this browser', 'not-supported');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    // Stop any playing audio
    if (this.isPlaying) {
      this.stopAudio();
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('[VoiceMode] Failed to start recognition:', error);
      this.onError('Failed to start voice recognition', 'start-failed');
      return false;
    }
  }

  /**
   * Stop listening for speech
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Toggle listening state
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Generate and play TTS audio for text
   * @param {string} text - Text to convert to speech
   * @param {Object} options - TTS options
   * @returns {Promise<void>}
   */
  async playTTS(text, options = {}) {
    if (!text) {
      console.warn('[VoiceMode] No text provided for TTS');
      return;
    }

    console.log('[VoiceMode] Starting TTS for text:', text.substring(0, 50) + '...');

    const { voice, language, onStart, onEnd, onError } = options;

    try {
      // Show loading state
      if (onStart) onStart();

      console.log('[VoiceMode] Calling TTS API...');

      // Call TTS endpoint (uses cookie auth like other coach endpoints)
      const response = await fetch('/api/coach/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text,
          voice,
          language: language || this.language.split('-')[0], // 'en-US' -> 'en'
        }),
      });

      console.log('[VoiceMode] TTS response status:', response.status);

      if (!response.ok) {
        // Try to get error message, but handle case where response is not JSON
        let errorMessage = 'TTS request failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          }
        } catch (e) {
          console.error('[VoiceMode] Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Create blob from audio response
      const audioBlob = await response.blob();
      console.log('[VoiceMode] Received audio blob:', audioBlob.size, 'bytes');

      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      this.audioElement.src = audioUrl;

      // Set up completion handler
      const handleEnded = () => {
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
        this.audioElement.removeEventListener('ended', handleEnded);
      };
      this.audioElement.addEventListener('ended', handleEnded);

      console.log('[VoiceMode] Playing audio...');
      await this.audioElement.play();
      console.log('[VoiceMode] Audio playback started');
    } catch (error) {
      console.error('[VoiceMode] TTS error:', error);
      if (onError) onError(error.message);
    }
  }

  /**
   * Stop TTS audio playback
   */
  stopAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  /**
   * Check if currently playing audio
   */
  isAudioPlaying() {
    return this.isPlaying;
  }

  /**
   * Get language code for Web Speech API
   * @param {string} lang - Short language code (e.g., 'en', 'sv')
   * @returns {string} Full language code
   */
  static getLanguageCode(lang) {
    const languageMap = {
      en: 'en-US',
      sv: 'sv-SE',
    };
    return languageMap[lang] || lang;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceMode;
}
