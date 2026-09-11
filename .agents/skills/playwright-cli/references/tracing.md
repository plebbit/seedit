# Tracing

Examples use the named `example` session. Open it through `scripts/pw-session.sh`, use `-s=example` for every action, and close it in cleanup before opening another session. Replace the name and output paths with task-specific ones.

Capture detailed execution traces for debugging and analysis. Traces include DOM snapshots, screenshots, network activity, and console logs.

## Basic Usage

```bash
# Start trace recording
./scripts/pw-session.sh open example about:blank
playwright-cli -s=example tracing-start

# Perform actions
playwright-cli -s=example goto https://example.com
playwright-cli -s=example click e1
playwright-cli -s=example fill e2 "test"

# Stop trace recording
playwright-cli -s=example tracing-stop
./scripts/pw-session.sh close example
```

## Trace Output Files

When you start tracing, Playwright creates a `traces/` directory with several files:

### `trace-{timestamp}.trace`

**Action log** - The main trace file containing:
- Every action performed (clicks, fills, navigations)
- DOM snapshots before and after each action
- Screenshots at each step
- Timing information
- Console messages
- Source locations

### `trace-{timestamp}.network`

**Network log** - Complete network activity:
- All HTTP requests and responses
- Request headers and bodies
- Response headers and bodies
- Timing (DNS, connect, TLS, TTFB, download)
- Resource sizes
- Failed requests and errors

### `resources/`

**Resources directory** - Cached resources:
- Images, fonts, stylesheets, scripts
- Response bodies for replay
- Assets needed to reconstruct page state

## What Traces Capture

| Category | Details |
|----------|---------|
| **Actions** | Clicks, fills, hovers, keyboard input, navigations |
| **DOM** | Full DOM snapshot before/after each action |
| **Screenshots** | Visual state at each step |
| **Network** | All requests, responses, headers, bodies, timing |
| **Console** | All console.log, warn, error messages |
| **Timing** | Precise timing for each operation |

## Use Cases

### Debugging Failed Actions

```bash
./scripts/pw-session.sh open example about:blank
playwright-cli -s=example tracing-start
playwright-cli -s=example goto https://app.example.com

# This click fails - why?
playwright-cli -s=example click e5

playwright-cli -s=example tracing-stop
# Open trace to see DOM state when click was attempted
./scripts/pw-session.sh close example
```

### Analyzing Performance

```bash
./scripts/pw-session.sh open example about:blank
playwright-cli -s=example tracing-start
playwright-cli -s=example goto https://slow-site.com
playwright-cli -s=example tracing-stop

# View network waterfall to identify slow resources
./scripts/pw-session.sh close example
```

### Capturing Evidence

```bash
# Record a complete user flow for documentation
./scripts/pw-session.sh open example about:blank
playwright-cli -s=example tracing-start

playwright-cli -s=example goto https://app.example.com/checkout
playwright-cli -s=example fill e1 "4111111111111111"
playwright-cli -s=example fill e2 "12/25"
playwright-cli -s=example fill e3 "123"
playwright-cli -s=example click e4

playwright-cli -s=example tracing-stop
# Trace shows exact sequence of events
./scripts/pw-session.sh close example
```

## Trace vs Video vs Screenshot

| Feature | Trace | Video | Screenshot |
|---------|-------|-------|------------|
| **Format** | .trace file | .webm video | .png/.jpeg image |
| **DOM inspection** | Yes | No | No |
| **Network details** | Yes | No | No |
| **Step-by-step replay** | Yes | Continuous | Single frame |
| **File size** | Medium | Large | Small |
| **Best for** | Debugging | Demos | Quick capture |

## Best Practices

### 1. Start Tracing Before the Problem

```bash
# Trace the entire flow, not just the failing step
./scripts/pw-session.sh open example about:blank
playwright-cli -s=example tracing-start
playwright-cli -s=example goto https://example.com
# ... all steps leading to the issue ...
playwright-cli -s=example tracing-stop
./scripts/pw-session.sh close example
```

### 2. Clean Up Owned Traces

Record the exact trace paths returned by the CLI. Remove only task-owned artifacts when they are no longer needed; do not delete an entire shared trace directory or infer ownership from file age.

## Limitations

- Traces add overhead to automation
- Large traces can consume significant disk space
- Some dynamic content may not replay perfectly
