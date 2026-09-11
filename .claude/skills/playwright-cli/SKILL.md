---
name: playwright-cli
description: Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract information from web pages.
allowed-tools: Bash(playwright-cli:*), Bash(./scripts/pw-session.sh:*)
---

<!-- Generated from .agents/skills/playwright-cli/SKILL.md; run yarn ai-workflow:sync. -->

# Browser Automation with playwright-cli

## Resource Budget (MUST)

One Playwright browser session may be active at a time, machine-wide. The budget is shared by every worktree and by any other checkout that ships this wrapper, because the contended resource is machine RAM and CPU rather than the repository. Playwright disables normal background throttling, so hidden seedit pages keep P2P and rendering work active after a check.

- During iteration, use Chrome/Blink only. Run the full cross-browser matrix once the change is ready for final verification.
- Open every fresh session through `./scripts/pw-session.sh open <session> ...`; it acquires the shared browser slot.
- Reuse the same engine session for desktop and mobile by resizing it.
- Close it with `./scripts/pw-session.sh close <session>` in a finally-style cleanup before opening another engine. `close` stops the browser even when the lock was already lost, so it is always the right cleanup call.
- Run browser engines and profiler batches sequentially. Never spawn browser-driving agents in parallel.
- Exit code 75 means the slot is busy. Finish non-browser work and retry, or block on `./scripts/pw-session.sh open --wait[=SECONDS] <session> ...` (default 300s). Do not bypass the lock.
- Never use `playwright-cli close-all` or `kill-all` while concurrent agents may own sessions.
- A lock left behind by an interrupted workflow clears itself: the next `open` reclaims any slot whose browser is no longer running. Inspect the holder with `./scripts/pw-session.sh status`, which reports whether that browser is still alive. `release <session>` is a last resort for the rare case where `status` cannot verify the browser state.

## Cross-Browser UI Verification

When using `playwright-cli` to verify rendering, styling, layout, or interactions in this repo, run the relevant flow in all three major browser engines:

- `chrome` for Blink
- `firefox` for Gecko
- `webkit` for Safari/WebKit coverage

Use separate short named sessions per engine, compare the results, and record any engine-specific differences instead of treating Chromium output as sufficient. Run them sequentially:

```bash
./scripts/pw-session.sh open verify-chrome http://example.com --browser=chrome
# Run the desktop and mobile flow, then release the slot.
./scripts/pw-session.sh close verify-chrome

./scripts/pw-session.sh open verify-firefox http://example.com --browser=firefox
# Run the desktop and mobile flow, then release the slot.
./scripts/pw-session.sh close verify-firefox

./scripts/pw-session.sh open verify-webkit http://example.com --browser=webkit
# Run the desktop and mobile flow, then release the slot.
./scripts/pw-session.sh close verify-webkit
```

## Quick start

```bash
# open new browser
./scripts/pw-session.sh open example
# navigate to a page
playwright-cli -s=example goto https://playwright.dev
# interact with the page using refs from the snapshot
playwright-cli -s=example click e15
playwright-cli -s=example type "page.click"
playwright-cli -s=example press Enter
# take a screenshot
playwright-cli -s=example screenshot
# close the browser
./scripts/pw-session.sh close example
```

## Session mode selection

Default to a fresh isolated browser session for reproducible verification.

Before browser work where existing state may matter, explicitly confirm the mode if the user has not already said which one they want:

1. Fresh isolated `playwright-cli` session
2. Current browser session reuse

Existing state usually matters when the task depends on auth, cookies, extensions, open tabs, or reproducing something already happening in the contributor's browser.

Do not attach to a live personal browser session without explicit approval.

If current-session reuse is requested, prefer the supported attach path in the local setup:

```bash
# Fresh isolated browser (default)
./scripts/pw-session.sh open verify https://example.com

# Reusable Playwright-managed profile
./scripts/pw-session.sh open verify https://example.com --persistent

# Attach to an existing browser when the local extension bridge is set up
./scripts/pw-session.sh open example --extension
```

If the task requires the contributor's current browser session and the attach path is not available in the current setup, stop and ask whether to switch to a fresh session or provide an explicit CDP-based Playwright script.

All interaction examples below use the named `example` session. Replace it with the session you opened through the wrapper. Browser-open examples are alternatives; close the active session before selecting another.

## Commands

### Core

```bash
./scripts/pw-session.sh open example
# open and navigate right away
./scripts/pw-session.sh open example https://example.com/
playwright-cli -s=example goto https://playwright.dev
playwright-cli -s=example type "search query"
playwright-cli -s=example click e3
playwright-cli -s=example dblclick e7
playwright-cli -s=example fill e5 "user@example.com"
playwright-cli -s=example drag e2 e8
playwright-cli -s=example hover e4
playwright-cli -s=example select e9 "option-value"
playwright-cli -s=example upload ./document.pdf
playwright-cli -s=example check e12
playwright-cli -s=example uncheck e12
playwright-cli -s=example snapshot
playwright-cli -s=example snapshot --filename=after-click.yaml
playwright-cli -s=example eval "document.title"
playwright-cli -s=example eval "el => el.textContent" e5
playwright-cli -s=example dialog-accept
playwright-cli -s=example dialog-accept "confirmation text"
playwright-cli -s=example dialog-dismiss
playwright-cli -s=example resize 1920 1080
./scripts/pw-session.sh close example
```

### Navigation

```bash
playwright-cli -s=example go-back
playwright-cli -s=example go-forward
playwright-cli -s=example reload
```

### Keyboard

```bash
playwright-cli -s=example press Enter
playwright-cli -s=example press ArrowDown
playwright-cli -s=example keydown Shift
playwright-cli -s=example keyup Shift
```

### Mouse

```bash
playwright-cli -s=example mousemove 150 300
playwright-cli -s=example mousedown
playwright-cli -s=example mousedown right
playwright-cli -s=example mouseup
playwright-cli -s=example mouseup right
playwright-cli -s=example mousewheel 0 100
```

### Save as

```bash
playwright-cli -s=example screenshot
playwright-cli -s=example screenshot e5
playwright-cli -s=example screenshot --filename=page.png
playwright-cli -s=example pdf --filename=page.pdf
```

### Tabs

```bash
playwright-cli -s=example tab-list
playwright-cli -s=example tab-new
playwright-cli -s=example tab-new https://example.com/page
playwright-cli -s=example tab-close
playwright-cli -s=example tab-close 2
playwright-cli -s=example tab-select 0
```

### Storage

```bash
playwright-cli -s=example state-save
playwright-cli -s=example state-save auth.json
playwright-cli -s=example state-load auth.json

# Cookies
playwright-cli -s=example cookie-list
playwright-cli -s=example cookie-list --domain=example.com
playwright-cli -s=example cookie-get session_id
playwright-cli -s=example cookie-set session_id abc123
playwright-cli -s=example cookie-set session_id abc123 --domain=example.com --httpOnly --secure
playwright-cli -s=example cookie-delete session_id
playwright-cli -s=example cookie-clear

# LocalStorage
playwright-cli -s=example localstorage-list
playwright-cli -s=example localstorage-get theme
playwright-cli -s=example localstorage-set theme dark
playwright-cli -s=example localstorage-delete theme
playwright-cli -s=example localstorage-clear

# SessionStorage
playwright-cli -s=example sessionstorage-list
playwright-cli -s=example sessionstorage-get step
playwright-cli -s=example sessionstorage-set step 3
playwright-cli -s=example sessionstorage-delete step
playwright-cli -s=example sessionstorage-clear
```

### Network

```bash
playwright-cli -s=example route "**/*.jpg" --status=404
playwright-cli -s=example route "https://api.example.com/**" --body='{"mock": true}'
playwright-cli -s=example route-list
playwright-cli -s=example unroute "**/*.jpg"
playwright-cli -s=example unroute
```

### DevTools

```bash
playwright-cli -s=example console
playwright-cli -s=example console warning
playwright-cli -s=example network
playwright-cli -s=example run-code "async page => await page.context().grantPermissions(['geolocation'])"
playwright-cli -s=example tracing-start
playwright-cli -s=example tracing-stop
playwright-cli -s=example video-start
playwright-cli -s=example video-stop video.webm
```

### Install

```bash
playwright-cli install --skills
playwright-cli install-browser
```

### Configuration
```bash
# Use specific browser when creating session
./scripts/pw-session.sh open example --browser=chrome
./scripts/pw-session.sh open example --browser=firefox
./scripts/pw-session.sh open example --browser=webkit
./scripts/pw-session.sh open example --browser=msedge
# Connect to browser via extension
./scripts/pw-session.sh open example --extension

# Use persistent profile (by default profile is in-memory)
./scripts/pw-session.sh open example --persistent
# Use persistent profile with custom directory
./scripts/pw-session.sh open example --profile=/path/to/profile

# Start with config file
./scripts/pw-session.sh open example --config=my-config.json

# Close the browser
./scripts/pw-session.sh close example
# Delete user data for the default session
playwright-cli -s=example delete-data
```

### Browser Sessions

```bash
# create new browser session named "mysession" with persistent profile
./scripts/pw-session.sh open mysession example.com --persistent
# same with manually specified profile directory (use when requested explicitly)
./scripts/pw-session.sh open mysession example.com --profile=/path/to/profile
playwright-cli -s=mysession click e6
./scripts/pw-session.sh close mysession  # stop a named browser
playwright-cli -s=mysession delete-data  # delete user data for persistent session

playwright-cli list
# Never use these during concurrent agent work; they affect unrelated sessions.
# Close only the session owned by this task
./scripts/pw-session.sh close example
```

## Example: Form submission

```bash
./scripts/pw-session.sh open example https://example.com/form
playwright-cli -s=example snapshot

playwright-cli -s=example fill e1 "user@example.com"
playwright-cli -s=example fill e2 "password123"
playwright-cli -s=example click e3
playwright-cli -s=example snapshot
./scripts/pw-session.sh close example
```

## Example: Multi-tab workflow

```bash
./scripts/pw-session.sh open example https://example.com
playwright-cli -s=example tab-new https://example.com/other
playwright-cli -s=example tab-list
playwright-cli -s=example tab-select 0
playwright-cli -s=example snapshot
./scripts/pw-session.sh close example
```

## Example: Debugging with DevTools

```bash
./scripts/pw-session.sh open example https://example.com
playwright-cli -s=example click e4
playwright-cli -s=example fill e7 "test"
playwright-cli -s=example console
playwright-cli -s=example network
./scripts/pw-session.sh close example
```

```bash
./scripts/pw-session.sh open example https://example.com
playwright-cli -s=example tracing-start
playwright-cli -s=example click e4
playwright-cli -s=example fill e7 "test"
playwright-cli -s=example tracing-stop
./scripts/pw-session.sh close example
```

## Specific tasks

* **Request mocking** [references/request-mocking.md](references/request-mocking.md)
* **Running Playwright code** [references/running-code.md](references/running-code.md)
* **Browser session management** [references/session-management.md](references/session-management.md)
* **Storage state (cookies, localStorage)** [references/storage-state.md](references/storage-state.md)
* **Test generation** [references/test-generation.md](references/test-generation.md)
* **Tracing** [references/tracing.md](references/tracing.md)
* **Video recording** [references/video-recording.md](references/video-recording.md)
