# Learning

> **Rebranding Note (January 2026):** "Learnings" has been rebranded to **"Micro-Courses"** in the user-facing application. The codebase retains the original "learning" terminology for backward compatibility.

## Functions

### loadLearningContent

- **Inputs:** None (async function)
- **Outputs:** (void) Updates modules state
- **Description:** Fetches learning modules from API, updates state with module list

### formatDuration

- **Inputs:**
  - `minutes` (number): Duration in minutes
- **Outputs:** (string) Formatted duration string
- **Description:** Formats minutes into readable string (e.g., "45 min", "1h 30m")

### getLocalizedField

- **Inputs:**
  - `module` (object): Content module object
  - `field` (string): Field name without language suffix
- **Outputs:** (string) Localized field value
- **Description:** Returns the localized field based on current language (e.g., `titleEn` or `titleSv`)

### formatArticleContent

- **Inputs:**
  - `content` (string): Raw article content (HTML or markdown)
- **Outputs:** (string) Formatted HTML content
- **Description:** Processes article content with proper HTML structure:
  - Handles both HTML and markdown-style content
  - Converts markdown headers (`#`, `##`, `###`) to HTML
  - Processes bold (`**text**`) and italic (`*text*`) formatting
  - Removes `[IMAGE:caption]` placeholder syntax
  - Handles inline images with markdown syntax

---

## Components

### ModuleCard

- **Props:**
  - `module` (object): Module data object
  - `formatDuration` (function): Duration formatter function
  - `t` (function): Translation function
- **Description:** Renders a learning module card with thumbnail/icon, title, description, duration, progress badge, and progress bar

### ArticleModal

- **Props:**
  - `module` (object): Content module data
  - `onClose` (function): Close handler
- **State:**
  - `articleImageUrl` (string|null): Blob URL for fetched article image
  - `imageLoaded` (boolean): Whether image has finished loading
  - `imageFetchComplete` (boolean): Whether image fetch request is complete
  - `contentLoaded` (boolean): Whether all content is ready to display
- **Description:** Displays text article content in a modal overlay with:
  - Loading overlay until all content (including images) is loaded
  - Article image with blur-to-sharp transition
  - Formatted article text
  - Thumbs rating component
  - Escape key to close

### AudioPlayerModal

- **Props:**
  - `module` (object): Audio content module
  - `onClose` (function): Close handler
- **Description:** Audio player modal for audio articles and exercises

### ThumbsRating

- **Props:**
  - `contentId` (string): Content item ID
  - `contentTitle` (string): Content title for feedback
- **Description:** Thumbs up/down rating component for content feedback

---

## State

- `isLoading` (boolean): Loading state for data fetch
- `modules` (array): Array of module objects
- `activeModule` (object|null): Currently selected module for detail view

---

## API Calls

- `GET /api/learning/content` - Fetches list of learning content items
  - Response: `{ success, data: { items: [...] } }`

- `GET /api/learning/content/{id}/audio/{lang}` - Streams audio content
  - Response: Binary audio data

- `GET /api/article-image/{id}/{lang}` - Fetches article image
  - Response: Binary image data

---

## Article Image Loading Flow

1. Check `hasImage` / `hasImageEn` / `hasImageSv` flags from API response
2. If image exists, fetch from `/api/article-image/{id}/{lang}`
3. Create blob URL from response
4. Display image with blur-to-sharp transition
5. Show loading overlay until both image and content are ready
6. Revoke blob URL on component unmount

---

## CSS Classes

### Article Modal

| Class | Description |
|-------|-------------|
| `.text-content-modal` | Main modal container |
| `.text-content-body` | Scrollable content body |
| `.text-content-body.visible` | Fade-in state after loading |
| `.text-content-header` | Article header with title |
| `.text-content-article` | Article content area |
| `.text-content-footer` | Modal footer with close button |

### Article Image

| Class | Description |
|-------|-------------|
| `.article-image` | Image container with vignette effect |
| `.article-image.loaded` | State when image has loaded |
| `.article-image img` | Image element with blur transition |

### Loading Overlay

| Class | Description |
|-------|-------------|
| `.article-loading-overlay` | Loading overlay container |
| `.article-loading-overlay.hidden` | Hidden state after loading |
| `.article-loading-spinner` | Spinning loader animation |
| `.article-loading-text` | "Loading..." text |
