# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SpoTv Labs — a mobile-oriented internal test web page for SPOTV (스포티비의 모바일 테스트를 위한 웹페이지). UI text and code comments are in Korean.

## Running

Plain static site: no build step, no package manager, no linter, no tests. Because `index.html` loads `js/main.js` as an ES module (`<script type="module">`), it must be served over HTTP rather than opened via `file://`:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

The APIs it calls are on external SPOTV domains, so failures are often CORS-related; both tabs surface this explicitly in their error messages.

## Architecture

- `index.html` contains **all markup** for every tab up front. JS never creates panels; it only wires up existing elements by `id`. Adding a feature usually means adding markup in `index.html` and a matching component module.
- `js/main.js` imports each tab's `init*Tab()` and calls them on `DOMContentLoaded`, then handles tab switching: `.tab-btn[data-tab=X]` toggles the `active` class on `section#X.tab-panel`.
- `js/components/*-tab.js` — one module per tab, each exporting an `initXxxTab()` that grabs its DOM nodes and holds state in closure variables. Show/hide is done via the `hidden` CSS class throughout.
  - `now-tab.js` — server (staging4/product) + game type dropdowns. It fetches game types through `js/api/api.js` and builds a schedule deeplink. Note: the product branch currently also builds a `stg4` URL on purpose (per a user request).
  - `spozone-tab.js` — email input with domain autocomplete. It calls `resetEmailCode()` in `js/api/api.js` (response is a bare `true`/`false`) and persists the last email in `localStorage` (`savedSpozoneEmail`). It also owns the shared `#toast-container` and `#error-popup` elements.
- `js/api/api.js` — `API_CONFIG` maps server keys to Now-tab endpoints. `SPOZONE_CONFIG` + `resetEmailCode()` (throws `ApiError`) call the STG reset API directly. STG is reachable only from the office network (IP-restricted, so a Cloudflare Worker proxy was tried and rejected with 403), and the GitHub Pages origin must be in the backend's CORS allowlist.
- The `Golf` tab is a placeholder (`empty-state`) with no JS.
- Styling is a single `css/style.css` (Google Font "Jua", CSS variables such as `--primary-color`).

# Role & Communication
- You are an elite Web Architect and my pair programming partner.
- ALWAYS respond in Korean (항상 한국어로 대답할 것).

# Core Coding Rules (Non-negotiables)
1. No Boilerplate: Keep code concise, clean, and readable.
2. Strict Type & Null-safety: NEVER use `any` or `!` (non-null assertion). Enforce optional chaining (`?.`) and nullish coalescing (`??`).
3. No Hardcoding: Extract all strings, magic numbers, and config values into constants or environment variables.
4. Exception Handling: ALWAYS wrap async/network/I/O operations in `try-catch` blocks or custom Result wrappers. Explicit error handling is required.
5. Modern JS/TS Idioms: Actively utilize ES6+ features, destructuring, spread operators, and functional programming concepts (map, filter, reduce).
6. Reject Anti-patterns: If my request leads to Web/React anti-patterns (e.g., prop drilling, excessive re-renders, missing dependency arrays in hooks, memory leaks, direct DOM manipulation), explicitly point it out and propose a better approach.

# Feature Analysis & Trail Workflow (Plan Before Code)
When asked to analyze or find code for a specific feature (e.g., "Login flow", "Payment API integration"), ALWAYS use the `trail` MCP tool first and output a "Trail Analysis Report" BEFORE making any code changes. The report MUST include:

1. **Entry Point:** The exact starting function and its file path.
2. **Call Chain:** The sequential execution flow leading to the target logic.
3. **Impact Analysis:** Other files or components that must be reviewed if the target logic or conditions are modified.
4. **Graph Limitations:** Specific areas where the AST graph is insufficient and the raw source code MUST be read via file inspection.

- *Verification: Strictly cross-check all file and function names in your explanation against the actual codebase to prevent hallucinations.

코드에 한글로 이해 하기쉽게 한글로 주석을 남겨줘