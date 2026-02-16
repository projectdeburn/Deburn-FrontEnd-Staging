# Chat Message Virtualization

## Problem

When conversations grow long (100+ messages), all messages are rendered in the DOM simultaneously. This causes:
- Increasing DOM size and layout cost
- Scroll jank on lower-end devices
- Unnecessary memory usage for off-screen messages and their animated avatars

The quick wins (memoization, state isolation, debounced localStorage) address re-render cost during streaming. Virtualization addresses the DOM size problem — only rendering messages visible in the viewport.

## Concept

Replace the `messages.map()` rendering in `Coach.jsx` with a virtualized list. Only ~15-20 messages exist in the DOM at any time. As the user scrolls, messages are mounted/unmounted dynamically. The scroll container maintains the correct total height so the scrollbar behaves normally.

## Recommended Library

**`@tanstack/react-virtual`** (TanStack Virtual)
- Lightweight (~2KB gzipped)
- Handles variable-height items with dynamic measurement
- No opinion on DOM structure (works with existing CSS)
- Well-maintained, widely used

Install:
```bash
npm install @tanstack/react-virtual
```

## Files to Change

### 1. `src/pages/Coach.jsx`

This is the main file that needs modification.

#### a) Add import

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

#### b) Add a ref for the scroll container

The existing `.chat-messages` div needs a ref:

```jsx
const chatContainerRef = useRef(null);
```

Replace:
```jsx
<div className="chat-messages" id="chat-messages">
```
With:
```jsx
<div className="chat-messages" id="chat-messages" ref={chatContainerRef}>
```

#### c) Set up the virtualizer

Add this after the existing state/ref declarations (around line 120):

```jsx
const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => chatContainerRef.current,
  estimateSize: () => 120,  // estimated average message height in px
  overscan: 5,              // render 5 extra messages above/below viewport
});
```

- `estimateSize`: An initial guess for message height. The virtualizer measures actual heights after render and corrects itself.
- `overscan`: Extra items rendered outside the viewport to prevent flicker during fast scrolling.

#### d) Replace the messages `.map()` with virtualized rendering

Replace the current block (lines 655-708):
```jsx
{messages.map((message) => (
  <div key={message.id} className={`message ...`}>
    ...
  </div>
))}
```

With:
```jsx
<div
  style={{
    height: `${virtualizer.getTotalSize()}px`,
    width: '100%',
    position: 'relative',
  }}
>
  {virtualizer.getVirtualItems().map((virtualItem) => {
    const message = messages[virtualItem.index];
    return (
      <div
        key={message.id}
        ref={virtualizer.measureElement}
        data-index={virtualItem.index}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualItem.start}px)`,
        }}
      >
        <div className={`message ${message.role === 'user' ? 'message-user' : 'message-coach'}`}>
          {message.role === 'assistant' && (
            <div className="message-avatar">
              <CoachAvatar />
            </div>
          )}
          <div className="message-content">
            <FormattedMessage content={message.content} />
            {/* Action cards and listen button — same as current code */}
          </div>
        </div>
      </div>
    );
  })}
</div>
```

Key points:
- `virtualizer.getTotalSize()` gives the container its full scrollable height.
- `virtualizer.getVirtualItems()` returns only the visible items (plus overscan).
- `virtualizer.measureElement` is passed as a `ref` to each item so the virtualizer knows its actual rendered height.
- Items are positioned with `transform: translateY()` for GPU-accelerated positioning.

#### e) Update auto-scroll behavior

The current auto-scroll uses a dummy div with `scrollIntoView`:
```jsx
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, streamingContent]);
```

Replace with virtualizer's built-in scroll method:
```jsx
useEffect(() => {
  if (messages.length > 0) {
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end', behavior: 'smooth' });
  }
}, [messages, streamingContent]);
```

Note: The streaming message and typing indicator sit *outside* the virtualized list (they're already separate in the current code), so they don't need special handling. But the scroll-to-bottom logic must account for their height — you may need to scroll the container to its max `scrollHeight` instead of using `scrollToIndex`.

An alternative approach for auto-scroll:
```jsx
useEffect(() => {
  const container = chatContainerRef.current;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}, [messages, streamingContent]);
```

#### f) Add a `MessageItem` component (new function in Coach.jsx)

Extract the message rendering into its own component to work cleanly with virtualization and `React.memo` (from the memoization quick win):

```jsx
const MessageItem = React.memo(function MessageItem({ message, onPlayTTS, onStopTTS, playingMessageId, onActionClick, getActionIcon, getActionTitle, t }) {
  return (
    <div className={`message ${message.role === 'user' ? 'message-user' : 'message-coach'}`}>
      {message.role === 'assistant' && (
        <div className="message-avatar"><CoachAvatar /></div>
      )}
      <div className="message-content">
        <FormattedMessage content={message.content} />
        {/* ... action cards and listen button */}
      </div>
    </div>
  );
});
```

This pairs with the memoization quick win — if the quick win has already been implemented, `MessageItem` will already exist and just needs to be used inside the virtualizer loop.

### 2. `src/utils/formatCoachResponse.jsx`

No changes needed for virtualization. This file is only affected by the memoization quick win.

### 3. CSS — `prototype.css` (or relevant stylesheet)

Minor adjustments may be needed:

- The `.chat-messages` container must have a **fixed or constrained height** and `overflow-y: auto` (it likely already does).
- Messages should not have `margin-bottom` that varies, as it complicates height measurement. If margins are used, ensure they're consistent or use `padding` inside the message div instead.
- Remove any CSS that assumes all messages are in normal document flow (e.g., `> .message:last-child` selectors), since virtualized items use absolute positioning.

## Edge Cases to Handle

### 1. User scrolls up, new message arrives
- Don't auto-scroll if the user has scrolled up (they're reading history).
- Add a "scroll to bottom" button when not at bottom.
- Implementation: track `isAtBottom` state via scroll event on the container.

### 2. Message height changes after render
- Action cards loading, images, or content expansion could change height.
- `virtualizer.measureElement` handles this automatically — it re-measures on DOM changes.

### 3. Welcome message and conversation starters
- These are static elements *above* the virtualized list. Keep them outside the virtualizer, rendered normally.

### 4. Streaming message and typing indicator
- These are already rendered separately (lines 711-736 in current code). Keep them outside the virtualizer, positioned after the virtualized container.

## Testing Checklist

- [ ] Conversations with 5 messages render correctly
- [ ] Conversations with 100+ messages render correctly
- [ ] Scrolling up and down is smooth
- [ ] New messages appear at the bottom
- [ ] Auto-scroll works during streaming
- [ ] Auto-scroll does NOT happen when user has scrolled up
- [ ] Action cards display and are clickable
- [ ] Listen/Stop TTS buttons work
- [ ] Language translation still updates visible messages
- [ ] Clear history works
- [ ] Page refresh restores conversation correctly
- [ ] Mobile scroll behavior is smooth
