# Traces and failure evidence

Capture the shortest flow that explains the failure. Use the already owned session; start before the triggering action and stop before closing it.

```bash
playwright-cli -s=check-task tracing-start
# Perform the affected flow.
playwright-cli -s=check-task console error
playwright-cli -s=check-task requests
playwright-cli -s=check-task tracing-stop
```

Record the exact output path returned by the CLI. Ensure `tracing-stop` and the wrapper's `close` run even when an interaction fails. Traces can contain page content, headers, and response bodies; inspect the evidence before sharing it and keep private account data out of commits.

Playwright traces help reconstruct actions, DOM state, network activity, and timing. They are not a CPU sampling profile and do not establish which JavaScript function consumed a long task. For performance comparisons, record tracing/development overhead and keep capture settings consistent. A screenshot is enough when one visual state establishes the result.
