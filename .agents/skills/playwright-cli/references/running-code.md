# Custom Playwright operations

Use `eval` for a short page/element expression and `run-code` for Playwright operations against the existing `page`. Both need the owned session name. Get element refs and real selectors from a current snapshot; examples below require replacing their placeholders.

```bash
playwright-cli -s=check-task eval '() => ({ url: location.href, ready: document.readyState })'
playwright-cli -s=check-task eval 'el => el.getBoundingClientRect().toJSON()' e7
playwright-cli -s=check-task run-code 'async page => {
  await page.getByRole("button", { name: "Observed button label", exact: true }).waitFor({ state: "visible", timeout: 10000 });
}'
```

Wait for the specific feed, control, or state that establishes completion. Bitsocial peers and background connections can keep the network active, so `networkidle` is not a reliable readiness signal. Report unavailable peer content instead of extending waits indefinitely.

For complex expressions use a task-owned file with `run-code --filename=<path>`; avoid shell substitution in double-quoted JavaScript containing backticks or `$()`. The file contains the same `async page => { ... }` function accepted inline.

Use `page.emulateMedia({ colorScheme: "dark" })` when checking system theme behavior; also exercise the app's own theme setting when relevant. Grant browser permissions or modify storage only for the assigned scenario in an authorized context. Do not install or modify the application to make an automation helper available.

For timing-sensitive actions, perform the action and readiness check within one `run-code` invocation so time between CLI calls does not dominate the result. See `profile-browsing` for the app's measurement limits.
