# Session ownership and coverage

Use the task's URL and a unique session name. A reachable canonical `https://seedit.localhost` server may belong to another checkout; confirm compatibility before using it. A delegated browser checker does not manage dev servers. The task owner records and later stops only the server it started.

The wrapper shares a single browser slot across repositories and worktrees. Check `./scripts/pw-session.sh status` when busy. `open --wait=60` waits up to 60 seconds; unreadable liveness information does not authorize lock removal. The next open reclaims a stale slot only after its browser has stopped. Do not manually release a live or unknown owner's slot.

An owned-shell cleanup pattern:

```bash
set -e
browser_session=check-task
./scripts/pw-session.sh open --wait=60 "$browser_session" "https://seedit.localhost/#/" --browser=chrome
trap './scripts/pw-session.sh close "$browser_session"' EXIT
playwright-cli -s="$browser_session" snapshot
# Complete the affected desktop flow before changing viewport.
playwright-cli -s="$browser_session" resize 375 812
playwright-cli -s="$browser_session" snapshot
```

Replace the URL/name and select coverage using `SKILL.md`. Finish desktop/mobile in the current engine, then close it before the next engine opens. Use a fresh shell for this trap or preserve an existing caller's cleanup handler.

`resize` checks viewport layout. If touch/device behavior matters, use the installed CLI's `open --mobile` or `--device` option through the wrapper and record the emulation. Desktop resizing alone is not a touch test.

`--persistent` keeps an isolated profile on disk; `--profile` selects one. Neither grants access to a contributor's active personal browser. Reuse such state only when authorized and supported by the installed harness/wrapper. Preserve profiles or data that predate this task.

Do not launch parallel A/B sessions. Compare variants sequentially with equivalent starting state. Never close default/unknown sessions, use global cleanup commands, or terminate extra Vite processes based on their count.
