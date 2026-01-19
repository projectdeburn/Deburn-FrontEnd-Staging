## API Description

AI coaching chat endpoints for streaming responses and conversation management.

**Key Features:**
- SSE streaming responses with actions
- Encrypted conversation persistence (backend)
- Local-first display with backend sync

---

## POST /api/coach/chat

Streams AI coach response using Server-Sent Events. Messages are automatically encrypted and stored on backend.

**Request:**
```json
{
  "message": "I want to work on my leadership skills",
  "conversationId": "conv_123abc",
  "language": "en"
}
```

**Frontend Input** (src/features/coach/coachApi.js):
```typescript
{
  message: string,              // User's message to the coach
  conversationId: string | null, // Existing conversation ID or null for new
  language: string              // Language code: "en" | "sv" (default: "en")
}
```

**Response (SSE Stream):**
```
data: {"type":"text","content":"That's a great goal! "}

data: {"type":"text","content":"Leadership development..."}

data: {"type":"actions","content":[
  {"type":"exercise","id":"breathing-1","label":"Try a Calming Exercise","metadata":{"duration":"3 min","contentType":"audio_exercise","category":"breathing"}},
  {"type":"learning","id":"stress-mgmt-1","label":"Learn: Stress Management","metadata":{"duration":"5 min","contentType":"audio_article","category":"wellbeing"}}
]}

data: {"type":"quickReplies","content":["Tell me more","Show me exercises"]}

data: {"type":"metadata","content":{"conversationId":"conv_123abc","topics":["stress"],"safetyLevel":0}}

data: {"type":"done","content":null}
```

**Stream Chunk Types:**
| Type | Content | Description |
|------|---------|-------------|
| `text` | string | Incremental response text |
| `actions` | Action[] | Recommended learning/exercises |
| `quickReplies` | string[] | Suggested follow-up messages |
| `metadata` | object | conversationId, topics, safetyLevel |
| `done` | null | Stream complete |

**Action Object:**
```typescript
{
  type: string,      // "learning" | "exercise"
  id: string,        // Content identifier
  label: string,     // User-facing label
  metadata: {
    duration?: string,     // e.g., "3 min"
    contentType?: string,  // e.g., "audio_exercise", "audio_article"
    category?: string      // e.g., "breathing", "wellbeing"
  }
}
```

---

## GET /api/coach/starters

Fetches conversation starter suggestions based on user wellbeing data.

**Query Parameters:**
- `language` (string): Language code ('en' or 'sv')
- `includeWellbeing` (boolean): Include wellbeing-based suggestions

**Response:**
```json
{
  "success": true,
  "data": {
    "starters": [
      {"label": "I want to work on my leadership skills", "context": "leadership"},
      {"label": "My stress has been building up", "context": "stress"}
    ]
  }
}
```

---

## GET /api/conversations

Fetches user's conversation history (decrypted). Used for syncing local state with backend.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_20260119_abc123",
      "messageCount": 4,
      "lastMessageAt": "2026-01-19T12:00:00Z",
      "createdAt": "2026-01-19T10:00:00Z"
    },
    "messages": [
      {"role": "user", "content": "Hello", "timestamp": "...", "actions": null},
      {"role": "assistant", "content": "Hi there!", "timestamp": "...", "actions": [...]}
    ]
  }
}
```

---

## DELETE /api/conversations

Deletes all conversation history for the user.

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "deletedCount": 1
  }
}
```

---

## POST /api/coach/voice

Converts text to speech using ElevenLabs.

**Request:**
```json
{
  "text": "Hello, how can I help you today?",
  "voice": "Aria"
}
```

**Response:** `audio/mpeg` (MP3 binary)

**Available Voices:**
- `Aria` (default coach voice)
- `Sarah` (standard female)
- `Roger` (standard male)

---

## GET /api/learning/content

Pre-loads learning content for action cards in coach responses.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "abc123",
        "title": "Managing Stress",
        "category": "wellbeing",
        "contentType": "audio_article",
        "duration": "5 min"
      }
    ]
  }
}
```
