# Session Log - 16/01/26

## Learning Page - Content Modals & Availability States

Implemented article and audio modals for the learning page, with greyed-out state for unavailable content.

---

## Changes to `src/pages/Learning.jsx`

### Added modal state management

- `selectedModule` - Tracks which module is currently selected
- `showArticleModal` - Controls article modal visibility
- `showAudioModal` - Controls audio modal visibility

### Added disabled state for cards without content

Cards now receive the `learning-card-disabled` class when `hasContent: false`, which:
- Applies 0.45 opacity (greyed out appearance)
- Sets `cursor: not-allowed`
- Prevents click handler from firing

### Added click handler logic

`handleCardClick()` opens the appropriate modal based on `contentType`:
- `text_article` → Opens ArticleModal
- `audio_article` / `audio_exercise` → Opens AudioModal
- `video_link` → Opens URL in new tab

### Updated category rendering

Categories now render in a defined order with display names:
- featured → "Featured"
- leadership → "Leadership"
- breath → "Breath Techniques"
- meditation → "Meditation"
- burnout → "Burnout Prevention"
- wellbeing → "Wellbeing"
- other → "Other"

---

## New Component: `src/components/learning/ArticleModal.jsx`

Modal for displaying text article content.

### Features
- Title with file-text icon
- Reading time display (from duration or calculated from word count)
- Formatted article content with markdown-style header support
- Close button and Escape key to close
- Backdrop click to close
- Body scroll lock when open

---

## New Component: `src/components/learning/AudioModal.jsx`

Modal for playing audio content with custom player.

### Features
- Animated circle visualizer (SVG with CSS animations)
- Title display
- Custom audio controls:
  - Play/Pause button
  - Skip backward 10 seconds
  - Skip forward 10 seconds
- Progress bar with seek on click
- Time display (current / duration)
- Close button and Escape key to close
- Backdrop click to close
- Body scroll lock when open

### Audio source
Uses the backend streaming endpoint: `/api/learning/content/{id}/audio/en`

---

## CSS Used (from existing `prototype.css`)

| Class | Purpose |
|-------|---------|
| `.learning-card-disabled` | Greyed out state (opacity 0.45) |
| `.audio-player-modal` | Audio modal container |
| `.audio-player` | Audio player wrapper |
| `.audio-visualizer` | Circle animation container |
| `.viz-orb-*` | Animated circles |
| `.audio-progress-container` | Progress bar wrapper |
| `.audio-progress-bar` | Progress fill |
| `.audio-controls` | Control buttons container |
| `.text-content-modal` | Article modal container |
| `.text-content-body` | Article content wrapper |
| `.text-content-title` | Article title |
| `.text-content-article` | Article text content |

---

## API Restructure - Match deburnalpha Structure

Updated frontend to match the restructured backend API.

### Changes to `src/pages/Learning.jsx`

**API endpoint change:**
- Old: `GET /api/learning/modules`
- New: `GET /api/learning/content`

**Response mapping change:**
- Old: `response.data.modules`
- New: `response.data.items`

**Field name mappings:**
- `module.title` → `module.titleEn`
- `module.type` → derived from `module.contentType` via `getDisplayType()`
- `module.duration` → `module.lengthMinutes`

**Added `getDisplayType()` helper:**
Maps backend `contentType` to display type for icon selection:
- `text_article` → `article`
- `audio_article` → `audio`
- `audio_exercise` → `exercise`
- `video_link` → `video`

### Changes to `src/components/learning/ArticleModal.jsx`

**Field name updates:**
- `module.title` → `module.titleEn`
- `module.textContent` → `module.textContentEn`
- `module.duration` → `module.lengthMinutes`

### Changes to `src/components/learning/AudioModal.jsx`

**Field name updates:**
- `module.title` → `module.titleEn`

**Audio URL construction:**
- Old: Used `module.audioUrl` directly
- New: Constructs URL from content ID: `/api/learning/content/${module.id}/audio/en`

This allows the frontend to work with the backend's audio streaming endpoint.

---

## Audio Streaming - Blob URL Approach

Fixed audio playback failing due to authentication issues with `<audio>` elements.

### Problem

The `<audio src={url}>` element makes plain GET requests without Authorization headers. The backend requires Bearer token authentication, so audio requests returned 401 Unauthorized.

### Solution

Instead of setting the audio `src` directly, the frontend now:
1. Fetches audio using `fetch()` with Authorization header
2. Converts response to blob
3. Creates blob URL with `URL.createObjectURL(blob)`
4. Sets blob URL as audio source
5. Cleans up blob URL on unmount

### Changes to `src/components/learning/AudioModal.jsx`

**New imports:**
```jsx
import { getAuthToken } from '../../utils/api';
```

**New state:**
```jsx
const [audioSrc, setAudioSrc] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**New useEffect for fetching audio:**
- Fetches audio with `Authorization: Bearer ${getAuthToken()}` header
- Creates blob URL on success
- Handles React StrictMode double-invocation with `cancelled` flag
- Cleans up blob URL on unmount

**UI changes:**
- Play button disabled while loading or no audio source
- Shows "Loading audio..." while fetching
- Shows error message if fetch fails

### Benefits
- Works across different domains (no cookie issues)
- Uses existing Bearer token authentication
- No CORS credential configuration needed
- Handles React StrictMode properly
