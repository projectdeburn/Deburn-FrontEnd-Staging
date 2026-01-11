# Coach (Ask Eve)

## Overview

The Coach page provides an AI-powered chat interface where users can have coaching conversations with Eve, the AI leadership coach. The interface supports streaming responses, conversation starters, and quick replies.

## Components

- Hero section with coach branding
- Chat message list (user and coach messages)
- Welcome message with introduction
- Conversation starter buttons
- Quick reply chips
- Text input with voice input button
- Typing/loading indicator

## User Flow

1. User navigates to Coach page
2. Sees welcome message from Eve
3. Either clicks a conversation starter or types a message
4. Message is sent, typing indicator appears
5. AI response streams in real-time
6. Optional quick replies appear after response
7. Conversation continues with context preserved

---

# AI Section (AI Will Edit This Section Only)

## Q&A

Question: Answer (DD/MM/YY)

## Edge Cases

- Long response: Streams progressively, auto-scrolls to bottom
- Network interruption: Shows error, allows retry
- Empty message: Send button disabled
- Conversation history: Maintains context via conversationId

## Components (AI)

- CoachAvatar (internal SVG component)
- Button (from @/components/ui)
- Spinner (from @/components/ui)
- Hero image (from @/assets/images/hero-coach.jpg)
- coachApi (from @/features/coach/coachApi)
