# Video Recording

Examples use the named `example` session. Open it through `scripts/pw-session.sh`, use `-s=example` for every action, and close it in cleanup before opening another session. Replace the name and output paths with task-specific ones.

Capture browser automation sessions as video for debugging, documentation, or verification. Produces WebM (VP8/VP9 codec).

## Basic Recording

```bash
# Start recording
./scripts/pw-session.sh open example about:blank
playwright-cli -s=example video-start

# Perform actions
playwright-cli -s=example goto https://example.com
playwright-cli -s=example snapshot
playwright-cli -s=example click e1
playwright-cli -s=example fill e2 "test input"

# Stop and save
playwright-cli -s=example video-stop demo.webm
./scripts/pw-session.sh close example
```

## Best Practices

### 1. Use Descriptive Filenames

```bash
# Include context in filename
playwright-cli -s=example video-stop recordings/login-flow-2024-01-15.webm
playwright-cli -s=example video-stop recordings/checkout-test-run-42.webm
```

## Tracing vs Video

| Feature | Video | Tracing |
|---------|-------|---------|
| Output | WebM file | Trace file (viewable in Trace Viewer) |
| Shows | Visual recording | DOM snapshots, network, console, actions |
| Use case | Demos, documentation | Debugging, analysis |
| Size | Larger | Smaller |

## Limitations

- Recording adds slight overhead to automation
- Large recordings can consume significant disk space
