# Video evidence

Use video when motion or an interaction sequence matters; use a screenshot for one state and a trace for DOM/network diagnosis. Record only the affected flow in the owned session.

```bash
playwright-cli -s=check-task video-start /tmp/task-owned-flow.webm
# Perform the interaction.
playwright-cli -s=check-task video-stop
```

The installed CLI takes the output filename on `video-start`; `video-stop` takes no filename. Stop recording before closing the exact session, including after a failed action. Use a unique task-owned path, inspect captured private content before sharing, and retain or remove only this task's recording. Recording overhead can affect performance measurements.
