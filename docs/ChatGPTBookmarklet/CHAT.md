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
  - Turning it on: enters conversation mode, shows the transcript view, and adds a labeled **"Clear"** reset button (which clears both the conversation and the input field).
  - Turning it off: leaves conversation mode; the concatenated turns go back into the single-answer fields, and the chat state is preserved in a snapshot so it can be restored on return.
- Turning on the checkbox (or submitting a turn) clears the question textarea, so the next question is a fresh follow-up turn.
- Question textarea stays; Enter submits a new turn.
- A labeled **"Clear"** button (visible only in conversation mode) clears `chatHistory`, the transcript, the answer field and the input field — a clean start.
- Keep existing single-answer actions meaningful:
  - Copy copies the **latest** answer.
  - Back/forward history still navigates the turns (single mode: Q/A pairs; chat mode: turns, and new turns append from the current position).
- The screenshot checkbox applies to the current turn only (as today).
- The dialog is capped at the screen height (`max-height: 90vh`); when content is long the answer / transcript scroll internally instead of growing the dialog past the viewport.

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
- So you can freely step back and forth through the whole conversation and re-view any earlier point, then continue asking — new turns append from the current position: submitting a follow-up while positioned at an earlier turn **truncates** the later turns (`truncateHistoryToCurrent()`) and appends the new turn there, and `chatHistory` is rebuilt to match. Older turns are shown faded with a "newer turns lie beyond the current position" separator so it's clear part of the conversation is hidden.
- While an answer is pending (the in-flight turn is recorded in `history` with an empty answer), it survives a mid-request mode toggle and is filled in when the answer arrives.

## Conversation <-> single-mode toggle

Both modes share `this.history` (a list of `{question, answer}` turns). Toggling the **conversation** checkbox transitions without destroying state:

**single → conversation (turn ON)** — `enterConversation()`
- **First entry** (open dialog, no saved snapshot) with existing single-mode turns (incl. an open-dialog auto-summary): adopts them as the conversation — a question asked in single mode before toggling on becomes a **user** turn and its answer the assistant turn. If no turns exist yet, seeds turn 1 from the current fields (empty question is fine — handles the summary case).
- **The input field is always cleared** on entry. The current single-mode prompt (whether the original or an edited/unsubmitted draft) is moved *into* the transcript as a turn rather than left lingering in the input field, so toggling back and forth yields a consistent result.
- Seeds `this.chatHistory` via `seedChatHistoryFromSingle(turn1.question)` so the first chat submission has the load-the-text page context.

**conversation → single (turn OFF)** — `exitConversation()`
- Concatenates all **user** messages into the question field and all **assistant** messages (joined with blank lines) into the answer field via `setAnswer`.
- Snapshots `this.savedHistory` (deep copy of the turns) and `this.savedSnapshot` (`{question, answer}` baseline of the just-concatenated values) so an untouched return can be detected and restored.

**single → conversation again (turn ON, returning)** — `enterConversation()`
- If the question/answer fields are **unchanged** since leaving (compared against `savedSnapshot` via `wasChanged()`): **restore** the old turns into the transcript and rebuild `chatHistory` from them (`rebuildChatHistoryFromTurns()`), so follow-ups carry full context; the input is cleared (nothing was modified).
- If **changed** (user edited either field while off): start a **fresh** conversation whose **turn 1 is the current question/answer** — the edited question text becomes the first user message (and is included in `chatHistory`), and the input field is cleared. The edit is not lost; it becomes the first user message in the chat.

`newChat()` clears `savedHistory`/`savedSnapshot` too, so a new chat never resurrects old state.

## Out of scope (v1)

- Persisting chats across page reloads / sessions.
- Editing history / branching / retry of a turn.
- Streaming (SSE) rendering of answers while generating.
- Multi-backend chat-state merge (each backend talks to its own session anyway; handled naturally since chatHistory is model-agnostic OpenAI-style).

## File impact

- `ChatGPTBookmarklet-impl.js` — the main work: `chatHistory`, rework `promptOnText`/`getAnswer` to append, transcript rendering, conversation checkbox, "Clear" reset, turn-based history navigation, oldest-first clipping.
- `ChatGPTBookmarklet.html` — conversation checkbox, transcript container, "Clear" button.
- `ChatGPTBookmarklet.css` — bubble/row styling.
- `ChatGPTBookmarklet-data.js` — update `helptext`.
- `CHAT.md` — this doc (which doubles as the feature spec).
