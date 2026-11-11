# Chat feature — design

## Goal

Turn the current single-turn Q&A into a **multi-turn conversation** within a dialog session. Ask a follow-up ("and what about the second point?", "explain that term", "now make it shorter") and the AI sees the earlier turns, so answers build on each other.

This is the "chat?" item from `ideas.txt`.

## Opt-in via a "conversation" checkbox

Chat is enabled by a **checkbox** in the dialog. When it is:

- **off (default)** — behavior is exactly today's single-turn Q&A: each question sends a fresh message set, the answer replaces the answer block, nothing is remembered. No change for existing users.
- **on** — the dialog switches to conversation mode: it accumulates `chatHistory`, shows a scrolling transcript of all turns, and each new question sends the full history so the AI has context.

## Current behavior (context)

- One question → `submitQuestion()` reads `#hpsChatGPTQuestion`, calls `getAnswer()` → `promptOnText()`, which builds a **fresh** message array each time:
  - with page content: `[user: load, assistant: text, user: prompt]`
  - without content: `[user: prompt]`
- The answer replaces the single `#hpsChatGPTAnswer` block; the old answer is discarded (only kept transiently in a linear `history` used by the back/forward buttons).
- There is **no accumulated memory** of prior turns — each question is independent.

## What changes

### 1. Session message list

Maintain `this.chatHistory` — an in-memory array of messages in OpenAI chat format (only used while the conversation checkbox is on):

```
[
  { role: 'user', content: ... },     // question / context-loading
  { role: 'assistant', content: ... }, // previous answer
  { role: 'user', content: ... },      // current question
  ...
]
```

- Created on dialog open, cleared on dialog close (per-session, not persisted — no backend/localStorage requirement for v1).
- Each new `submitQuestion()` **appends** the new user message, sends the whole `chatHistory`, and **appends** the returned assistant answer.
- The initial page-content load is a special case — see below.

### 2. Page content only in the first turn

The `load-text-into-mouth` pattern (loadinstruction → assistant text → prompt) is only meaningful for the **first** turn. For follow-ups:

- Only the first question includes the page-content load instructions (when "content" is checked).
- Follow-up turns send plain user messages and rely on the AI remembering the loaded text from turn 1 (that's the whole point of chat — no need to re-send the page).

### 3. Transcript (conversation) view

In conversation mode, replace the single answer block with a **conversation transcript** inside `#hpsChatGPTResponse`:

- Render each turn as a bubble/row: user question and assistant answer, joined by markdown rendering (reuse `markdownToHtml`).
- New answers **append**; older answers stay visible and scrollable.
- Keep the raw markdown per turn so editing/copy still work.
- When the checkbox is off, the single answer block is used as today.

### 4. UI

- Add a **"conversation" checkbox** in the controls row.
  - Turning it on: initializes `chatHistory`, shows the transcript view, and adds a "New chat" reset button.
  - Turning it off: clears the transcript back to the single-answer view; the last answer stays visible, chat history is dropped.
- Question textarea stays; Enter submits a new turn.
- Add a **"New chat" / reset** button (visible only in conversation mode) to clear `chatHistory` and the transcript (and optionally re-trigger the summary load).
- Keep existing single-answer actions meaningful:
  - Copy copies the **latest** answer.
  - Back/forward history still navigates the selectable Q/A pairs.
- The screenshot checkbox applies to the current turn only (as today).

### 5. Clipping & limits

- `sendChatGPTRequestWithClipping` already shortens the longest message when the context is exceeded — this now matters more as the chat grows.
- Design decision: when things get too long, shorten the **oldest** turns first (progressive degradation), and surface the "(clipped)" indicator so the user knows context is being dropped.

### 6. Predefined prompts & summary

- The initial auto-summary and predefined prompts are just the **first** turn of a chat; they remain behaviorally the same.
- A user prompt can be selected at any turn and appended like a normal question.

## Going back/forward in the conversation

The existing back/forward buttons (`&#x23F3`, the history buttons in the bottom row) already navigate a linear history in single-answer mode. In **conversation mode** they navigate the **turns**:

- Each submitted turn (question + answer pair) is recorded as an entry in `this.history`.
- **Back** moves to the previous turn and restores the transcript as it looked at that point (all turns up to and including that index).
- **Forward** moves to a later turn again.
- So you can freely step back and forth through the whole conversation and re-view any earlier point, then continue asking — new turns append from the current position.

## Out of scope (v1)

- Persisting chats across page reloads / sessions.
- Editing history / branching / retry of a turn.
- Streaming (SSE) rendering of answers while generating.
- Multi-backend chat-state merge (each backend talks to its own session anyway; handled naturally since chatHistory is model-agnostic OpenAI-style).

## File impact

- `ChatGPTBookmarklet-impl.js` — the main work: `chatHistory`, rework `promptOnText`/`getAnswer` to append, transcript rendering, conversation checkbox, "New chat" reset, turn-based history navigation, oldest-first clipping.
- `ChatGPTBookmarklet.html` — conversation checkbox, transcript container, "New chat" button.
- `ChatGPTBookmarklet.css` — bubble/row styling.
- `ChatGPTBookmarklet-data.js` — update `helptext`.
- `CHAT.md` — this doc (which doubles as the feature spec).
