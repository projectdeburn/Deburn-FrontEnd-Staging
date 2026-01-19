import { useState, useEffect, useRef } from 'react';
import { getAuthToken } from '../../utils/api';
import SmileyRating from './SmileyRating';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const RewindIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 19 2 12 11 5 11 19"></polygon>
    <polygon points="22 19 13 12 22 5 22 19"></polygon>
  </svg>
);

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const ForwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 19 22 12 13 5 13 19"></polygon>
    <polygon points="2 19 11 12 2 5 2 19"></polygon>
  </svg>
);

export default function AudioModal({ module, onClose }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSrc, setAudioSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!module.id) return;

    let blobUrl = null;
    let cancelled = false;

    const fetchAudio = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_ENDPOINT || ''}/api/learning/content/${module.id}/audio/en`,
          {
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`
            }
          }
        );

        if (cancelled) return;

        if (!response.ok) {
          throw new Error('Failed to load audio');
        }

        const blob = await response.blob();

        if (cancelled) return;

        blobUrl = URL.createObjectURL(blob);
        setAudioSrc(blobUrl);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAudio();

    return () => {
      cancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [module.id]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function togglePlay() {
    if (!audioRef.current || !audioSrc) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function skip(seconds) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  }

  function handleProgressClick(e) {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  }

  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }

  function handleLoadedMetadata() {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }

  function handleEnded() {
    setIsPlaying(false);
    setCurrentTime(0);
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="modal-overlay active" onClick={handleBackdropClick}>
      <div className="modal-content audio-player-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className={`audio-player ${loading ? 'loading' : 'ready'}`}>
          {/* Meditative Visualization */}
          <div className={`audio-visualizer ${isPlaying ? 'playing' : ''}`}>
            <svg viewBox="0 0 200 200" className="audio-viz-svg">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle className="viz-orb viz-orb-1" cx="100" cy="100" r="40" filter="url(#glow)"/>
              <circle className="viz-orb viz-orb-2" cx="100" cy="100" r="35" filter="url(#glow)"/>
              <circle className="viz-orb viz-orb-3" cx="100" cy="100" r="30" filter="url(#glow)"/>
              <circle className="viz-orb viz-orb-4" cx="100" cy="100" r="25" filter="url(#glow)"/>
              <circle className="viz-orb viz-orb-5" cx="100" cy="100" r="20" filter="url(#glow)"/>
            </svg>
          </div>

          <div className="audio-player-title">{module.titleEn}</div>

          {error && <div className="audio-error">{error}</div>}

          <div className="audio-progress-container" onClick={handleProgressClick}>
            <div
              className="audio-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="audio-time">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="audio-controls">
            <button className="audio-control-btn" onClick={() => skip(-10)}>
              <RewindIcon />
            </button>
            <button
              className={`audio-play-btn ${loading ? 'loading' : ''}`}
              onClick={togglePlay}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
              {/* Loading spinner inside play button */}
              <svg className="audio-loading-spinner" viewBox="0 0 48 48">
                <circle className="spinner-orb spinner-orb-1" cx="24" cy="24" r="20" fill="none" strokeWidth="2.5"/>
                <circle className="spinner-orb spinner-orb-2" cx="24" cy="24" r="15" fill="none" strokeWidth="2.5"/>
                <circle className="spinner-orb spinner-orb-3" cx="24" cy="24" r="10" fill="none" strokeWidth="2.5"/>
              </svg>
            </button>
            <button className="audio-control-btn" onClick={() => skip(10)}>
              <ForwardIcon />
            </button>
          </div>

          {audioSrc && (
            <audio
              ref={audioRef}
              src={audioSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          <SmileyRating
            contentId={module._id || module.id}
            contentTitle={module.titleEn}
          />
        </div>
      </div>
    </div>
  );
}
