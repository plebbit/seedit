# Browser Session Management

Seedit uses one browser session machine-wide. Open and close every session through `scripts/pw-session.sh`; use `playwright-cli -s=<name>` for all actions in that session. A named session isolates cookies, storage, cache, history, and tabs, but does not grant another concurrent browser slot.

```bash
./scripts/pw-session.sh open verify-chrome https://seedit.localhost --browser=chrome
playwright-cli -s=verify-chrome snapshot
./scripts/pw-session.sh close verify-chrome
```

Always close the exact session in cleanup, even after a failure. When open exits 75, another workflow owns the slot: defer work or use a bounded wait. Never remove a live or unknown lock.

```bash
./scripts/pw-session.sh status
./scripts/pw-session.sh open --wait=60 verify https://seedit.localhost
playwright-cli -s=verify snapshot
./scripts/pw-session.sh close verify
```

## Sequential comparisons

For cross-browser or A/B checks, finish one session before opening the next. Reuse it for desktop/mobile by resizing it. Record screenshots before closing.

```bash
./scripts/pw-session.sh open variant-a 'https://example.com?variant=a'
playwright-cli -s=variant-a screenshot --filename=variant-a.png
./scripts/pw-session.sh close variant-a
./scripts/pw-session.sh open variant-b 'https://example.com?variant=b'
playwright-cli -s=variant-b screenshot --filename=variant-b.png
./scripts/pw-session.sh close variant-b
```

## Opening options

The wrapper forwards browser options to playwright-cli. Choose only options needed by the test:

```bash
./scripts/pw-session.sh open verify https://seedit.localhost --browser=firefox --headed
playwright-cli -s=verify snapshot
./scripts/pw-session.sh close verify
```

Default to a fresh isolated session. For authorized persistent state, use a task-owned profile via `--persistent` or `--profile=<path>` if supported by the installed CLI. A profile can contain credentials; never commit it or delete another task's profile. Reuse the contributor's existing browser only with explicit authorization already given for that session mode.

Omitting `-s` targets the CLI's default session, which may be different from the session opened by the wrapper. Use the explicit name consistently, including commands in other reference files. Replace generic `example` names with short task-specific names.

## Cleanup and diagnostics

Use `playwright-cli list --all` and the wrapper's `status` to inspect sessions. Close only the session this task owns. Do not run global `close-all` or `kill-all`, including after an error. If an owned browser has already died, the next wrapper open can reclaim its stale slot; do not broaden cleanup to other daemons.
