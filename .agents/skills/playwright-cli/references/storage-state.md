# Scoped storage setup

Use an isolated test profile unless reuse of existing state is authorized. Inspect source to identify the actual setting key and value before changing it. These clients can keep identity/account material in browser storage; avoid dumping unrelated values into logs.

```bash
playwright-cli -s=check-task state-save /tmp/task-owned-state.json
playwright-cli -s=check-task state-load /tmp/task-owned-state.json
playwright-cli -s=check-task reload
```

Use a unique task-owned output path. A storage-state file is not a complete browser backup: inspect what the installed version saves before relying on IndexedDB, sessionStorage, extensions, or open tabs. Never promise that loading it reproduces an entire personal browser session.

For one setting, prefer `localstorage-get`, `localstorage-set`, and `localstorage-delete` with the known key over clearing all storage. Record the original value and restore it when retaining that context. Cookie and sessionStorage commands have corresponding scoped operations; use CLI help rather than resetting the whole profile.

Keep exported identity/auth state out of Git and user-facing evidence. Clean up only the temporary files this task created; preserve preexisting exports and profiles. Use UI actions when the app must observe a setting change that direct storage writes would bypass.
