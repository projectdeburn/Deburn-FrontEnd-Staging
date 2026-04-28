# Coach

## Functions

### sendMessage

- **Inputs:**
  - `text` (string): Message text to send
- **Outputs:** (void) Updates messages state, streams response
- **Description:** Sends user message to AI coach, handles streaming response via coachApi.streamMessage, updates UI with streamed content. Saves messages to localStorage for persistence.

### handleStarterClick

- **Inputs:**
  - `starter` (object): Starter object with `text` property
- **Outputs:** (void) Calls sendMessage
- **Description:** Sends the starter message text when a conversation starter is clicked

### handleQuickReply

- **Inputs:**
  - `reply` (string): Quick reply text
- **Outputs:** (void) Calls sendMessage
- **Description:** Sends quick reply text as a message

### handleActionClick

- **Inputs:**
  - `action` (object): Action object with `id`, `label`, `metadata`
- **Outputs:** (void) Opens content modal
- **Description:** Finds matching content from pre-loaded learning content by category/contentType and opens appropriate modal (ArticleModal, AudioModal, or external video link)

### handleSubmit

- **Inputs:**
  - `e` (Event): Form submit event
- **Outputs:** (void) Calls sendMessage
- **Description:** Form submit handler, prevents default and sends inputValue

### handleKeyPress

- **Inputs:**
  - `e` (KeyboardEvent): Keyboard event
- **Outputs:** (void) Calls sendMessage on Enter
- **Description:** Handles Enter key press to send message (without Shift)

### playTTS

- **Inputs:**
  - `text` (string): Text to convert to speech
  - `messageId` (number): Message ID for tracking playback
- **Outputs:** (void) Plays audio
- **Description:** Converts text to speech using coachApi.textToSpeech and plays audio

### toggleVoiceInput

- **Inputs:** None
- **Outputs:** (void) Toggles recording state
- **Description:** Starts/stops speech recognition for voice input

---

## Components

### CoachAvatar

- **Props:** None
- **Description:** Renders SVG avatar with layered circle orbs for the AI coach

---

## State

- `messages` (array): Array of message objects `{ id, role, content, actions }`
- `inputValue` (string): Current input field value
- `isLoading` (boolean): Whether a message is being sent/streamed
- `conversationId` (string|null): Current conversation ID for context
- `showStarters` (boolean): Whether to show conversation starters
- `quickReplies` (array): Array of quick reply strings
- `actions` (array): Current streaming actions
- `streamingContent` (string): Currently streaming response content
- `learningContent` (array): Pre-loaded learning content for action cards
- `selectedModule` (object|null): Currently selected content for modal
- `showArticleModal` (boolean): Article modal visibility
- `showAudioModal` (boolean): Audio modal visibility
- `isRecording` (boolean): Voice recording state
- `isVoiceInput` (boolean): Whether last input was voice
- `playingMessageId` (number|null): ID of message currently being read aloud

---

## Persistence

**localStorage Key:** `deburn_coach_conversation`

**Data Structure:**
```json
{
  "messages": [
    { "id": 1, "role": "user", "content": "...", "actions": [] },
    { "id": 2, "role": "assistant", "content": "...", "actions": [...] }
  ],
  "conversationId": "conv_..."
}
```

**Sync Flow:**
1. On mount: Load from localStorage (instant display)
2. Background: Sync with backend (backend is source of truth)
3. On message: Save to localStorage + backend stores via chat

---

## API Calls

- `POST /api/coach/chat` - Streams AI coach response (via coachApi.streamMessage)
  - Body: `{ message, conversationId, language }`
  - Response: Server-Sent Events stream with text, actions, quickReplies, metadata
- `GET /api/conversations` - Fetches conversation history from backend
  - Response: `{ conversation, messages }` with decrypted content
- `GET /api/learning/content` - Pre-loads learning content for action cards
  - Response: `{ items: [...] }` with content metadata
