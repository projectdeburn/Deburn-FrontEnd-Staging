# Coach

## Functions

### sendMessage

- **Inputs:**
  - `text` (string): Message text to send
- **Outputs:** (void) Updates messages state, streams response
- **Description:** Sends user message to AI coach, handles streaming response via coachApi.streamMessage, updates UI with streamed content

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

---

## Components

### CoachAvatar

- **Props:** None
- **Description:** Renders SVG avatar with layered circle orbs for the AI coach

---

## State

- `messages` (array): Array of message objects `{ id, role, content }`
- `inputValue` (string): Current input field value
- `isLoading` (boolean): Whether a message is being sent/streamed
- `conversationId` (string|null): Current conversation ID for context
- `showStarters` (boolean): Whether to show conversation starters
- `quickReplies` (array): Array of quick reply strings
- `streamingContent` (string): Currently streaming response content

---

## API Calls

- `POST /api/coach/stream` - Streams AI coach response (via coachApi.streamMessage)
  - Body: `{ message, conversationId, language, context }`
  - Response: Server-Sent Events stream with text, actions, quickReplies, metadata
