# AGENTS: How to be productive in this repository

This file gives concise, actionable guidance for AI coding agents that need to work on this repository.

1) Big picture
- Primary purpose: a collection of command-line utilities and small web/docs for interacting with LLMs.
- Key runtime pieces:
  - `bin/chatgpt` — the main Node.js CLI that implements a very feature-rich front-end to OpenAI-compatible chat APIs.
  - many small helper scripts in `bin/` that call `chatgpt` or provide tooling (`chatgptapplytemplate`, `chatgptpromptlib`, `chatgptdictate`, ...).
  - `templates/` holds prompt templates used by `chatgptapplytemplate` and others.
  - `docs/` and `public/` contain web-facing pages and bookmarklets.
      - `docs/` contains an index and several small web applications / bookmarklets (see `docs/index.html`).
        Examples: `docs/ChatGPTBookmarklet/` (installable ChatGPT bookmarklet), `docs/grabStyles/` (Grab Styles bookmarklet),
        `docs/dictation/` (Dictation mini-app), and `docs/bookmarkletmaker/` (bookmarklet generator).

2) Important files and directories (quick reference)
- `bin/chatgpt` — entry point for most functionality; Node.js script (~1.2k lines). Read it to understand options parsing, conversation handling, tools integration, and request formatting.
- `bin/_makeusagetxt` — used to regenerate `_usages.txt` by calling each script's `--help`.
- `templates/` — template files such as `*.template.txt` and `*.json` used by template appliers.
- `test/chatgpt` — integration tests using Bats. See `test/chatgpt/README.md` and the it_test script.
- `CLAUDE.md` and `README.md` — project-level developer guidance (build/test commands, style rules, conventions).
 - `docs/index.html` — index page describing experiments and providing drag-install bookmarklet links; edit it
   when adding or changing bookmarklets or web mini-apps. Bookmarklets are typically added as an anchor with a
   generated `javascript:` URL (see `grabstyles` anchor construction in `docs/index.html`).

3) How the code is structured and why
- Scripts are the primary surface. Conventions: executable scripts live in `bin/`. Files beginning with `_` are helpers or metadata (e.g. `_makeusagetxt`, `_usages.txt`).
- Conversation state is file-based and stored in `$HOME/.chatgpt.js/conversations`. Profiles live in `$HOME/.chatgpt.js/profiles`.
- Tools integration: `chatgpt` accepts a tools config (`-tf`) or a tools script (`-ts`). Tools config is an array of tool descriptors (JSON) with keys like `function`, `commandline`, `stdin` and an optional `cfgfilelocation`.
- The repository intentionally keeps CLI scripts small, shell-first and readable; many scripts call each other via exec.

4) Developer workflows and commands (concrete)
- Build (generate usages, docs, templates):
  - `make all` (see `CLAUDE.md` / `Makefile`).
- Run integration tests (requires valid API credentials; tests use real API calls):
  - `cd test/chatgpt && ./it_test.bats`
  - To run a subset: `CHATGPT_TEST_ARGS="-op profile_name" ./it_test.bats`
- Run an example CLI call:
  - `bin/chatgpt -p 'Summarize:' -f README.md` — reads README.md and submits it.
- Regenerate usages file for bin scripts:
  - `bin/_makeusagetxt` will call each executable in `bin/` with `--help` and collect output into `_usages.txt`.

5) Project-specific conventions agents must follow
- Absolute paths: many scripts expect absolute paths or resolve `~` and relative files to CWD with `resolveFile()`—preserve that behavior when editing.
- IDs in HTML use the `hps-chatgpt-` prefix. Search for that when modifying docs/layout.
- Error handling: scripts print descriptive errors to stderr and use non-zero exit codes (common pattern: exit(1) or exit(2)). Keep consistent messages.
- Prompt library: `chatgptpromptlib` is used for reusable prompt fragments. When you see `promptlib:key` in a prompt, the CLI will call `chatgptpromptlib key` and replace the token with its output.
- Tools scripts: if implementing a tool script referenced via `-ts`, it must support `--openaitoolsconfig` and output a tools JSON config. The config must follow the format `[{"function":{...}, "commandline":[...], "stdin":...}, ...]`.

6) Environment and configuration variables
- `OPENAI_API_KEY` or file at `$HOME/.openai-api-key.txt` — API key fallback.
- `OPENAI_API_BASE` — base URL for API; `chatgpt` appends `/chat/completions` when not overridden.
- `OPENAI_API_DEFAULTMODEL`, `OPENAI_API_HIGHMODEL`, `OPENAI_API_THINKINGMODEL` — model defaults and special model aliases.
- $HOME is used for profile and conversation storage: `$HOME/.chatgpt.js/profiles` and `$HOME/.chatgpt.js/conversations`.

7) Tests and CI notes
- Tests use Bats + bats-assert and assume access to a working LLM endpoint. Running tests may incur cost.
- Tests can be invoked manually; CI should provide API credentials or mock/stub the HTTP calls.

8) Examples agents should use when making changes
- Add new tool: create `tools/yourtool.json` describing the tool, or write `bin/yourtool` that supports `--openaitoolsconfig` and returns the tool config. Then call `chatgpt -tf tools/yourtool.json` or `chatgpt -ts bin/yourtool`.
- Add a prompt template: put `your.template.txt` in `templates/` and call `bin/chatgptapplytemplate template_name file`.
- Add help text: ensure `--help` output exists and is collected by `_makeusagetxt`.

9) Where to look first when investigating a change
- `bin/chatgpt` to understand CLI contract and how options are parsed and resolved.
- `bin/_makeusagetxt` and `_usages.txt` for how command help text is maintained.
- `templates/` for prompt patterns and examples.
- `test/chatgpt` and `test/chatgpt/README.md` for integration expectations.
- `CLAUDE.md` for developer guidance and conventions.

10) Safety and non-goals
- The repo intentionally calls the real LLM APIs in many places. Do not add tests that make uncontrolled API calls without flagging costs.
- Don't change global behaviors (path resolution, profile storage) without updating related docs and tests.

If anything in this file is unclear, read `bin/chatgpt` first — it contains the canonical behavior and examples.


