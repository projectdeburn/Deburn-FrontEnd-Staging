## API Description

AI coaching chat endpoints for streaming responses and conversation management.

---

## POST /api/coach/stream

Streams AI coach response using Server-Sent Events.

**Request:**
```json
{
  "message": "I want to work on my leadership skills",
  "conversationId": "conv_123abc",
  "language": "en",
  "context": {}
}
```

**Frontend Input** (src/features/coach/coachApi.js):
```json
{
  "message": "I want to work on my leadership skills",
  "conversationId": "conv_123abc",
  "context": {},
  "language": "en"
}
```

**Response (SSE Stream):**
```
data: {"type":"metadata","content":{"conversationId":"conv_123abc"}}

data: {"type":"text","content":"That's a great goal! "}

data: {"type":"text","content":"Leadership development..."}

data: {"type":"quickReplies","content":["Tell me more","Show me exercises"]}

data: [DONE]
```

---

## POST /api/coach/chat

Non-streaming message endpoint (alternative to stream).

**Request:**
```json
{
  "message": "Hello",
  "conversationId": null,
  "context": {},
  "language": "en"
}
```

**Frontend Input** (src/features/coach/coachApi.js):
```json
{
  "message": "Hello",
  "conversationId": null,
  "context": {},
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Hello! I'm your AI Leadership Coach...",
    "conversationId": "conv_123abc",
    "quickReplies": ["Tell me more", "I have a question"]
  }
}
```

---

## GET /api/coach/starters

Fetches conversation starter suggestions.

**Query Parameters:**
- `language` (string): Language code ('en' or 'sv')
- `includeWellbeing` (boolean): Include wellbeing-based suggestions
- `mood` (number): Current mood (if includeWellbeing)
- `energy` (number): Current energy (if includeWellbeing)
- `stress` (number): Current stress (if includeWellbeing)

**Frontend Input** (src/features/coach/coachApi.js):
Query string built from:
```js
{
  language: "en",
  includeWellbeing: "true",  // if wellbeing provided
  mood: 3,                    // default if not specified
  energy: 5,                  // default if not specified
  stress: 5                   // default if not specified
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "starters": [
      {
        "key": "leadership",
        "text": "I want to work on my leadership skills"
      },
      {
        "key": "stress",
        "text": "My stress has been building up"
      }
    ]
  }
}
```

---

## GET /api/coach/history

Fetches conversation history.

**Frontend Input** (src/features/coach/coachApi.js):
Query parameters:
- `conversationId` (string): The conversation ID
- `limit` (number): Max messages to return (default: 50)

---

## POST /api/coach/feedback

Submits feedback for a message.

**Frontend Input** (src/features/coach/coachApi.js):
```json
{
  "messageId": "msg_123",
  "rating": 5,
  "feedback": "Very helpful advice!",
  "category": "coaching_quality"
}
```

---

## GET /api/coach/exercises

Fetches available exercises.

**Frontend Input** (src/features/coach/coachApi.js):
No request body.
