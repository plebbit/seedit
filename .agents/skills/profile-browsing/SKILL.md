---
name: profile-browsing
description: Profile seedit navigation, feed rendering, and interaction using sequential playwright-cli sessions, browser timings, traces, and available React evidence.
---

# Profile Browsing Performance

Define the requested routes, interactions, and performance concern. Verify the current routes in `src/app.tsx` and hash routing in `src/index.tsx`; use the supplied app URL or `https://seedit.localhost`.

## Coordinate the run

- Reuse a compatible dev server in this worktree. If a server is needed, the parent starts one in an owned terminal, records its process, waits for readiness, and stops it after the run. Never stop unrelated Vite processes. A profiling child does not manage servers.
- Use one browser session machine-wide through `scripts/pw-session.sh`. Profile Chrome first; apply `scripts/pw-throttle.sh <session> mid` or `low` for a low-spec pass when relevant. Keep browser engines and heavy verification sequential.
- A small flow can be profiled directly. For larger work, assign sequential batches of two to four routes to the `profiler` role in `.agents/roles/profiler.md`, with a unique session name and explicit acceptance criteria. Wait for each child to close its session before another browser task starts.

Choose actual populated routes and content from the current app; do not invent community addresses. Example batches:

| Routes | Focus |
|---|---|
| `/#/`, `/#/s/all` | Subscribed and all-community feeds |
| `/#/s/<community-address>`, `/#/s/<community-address>/new` | Community sorting and switching |
| `/#/s/<community-address>/comments/<comment-cid>` | Post, comments, and media expansion |
| `/#/settings`, `/#/communities` | Local controls and community navigation |

## Evidence available in this checkout

`src/lib/react-scan.ts` dynamically loads react-scan and exposes its raw `getReport` as `window.__getReactScanReport`. It does not expose an app-owned plain-object `onRender` collector or `__resetReactScanReport`. The installed react-scan report may be empty; `JSON.stringify(new Map())` also returns `{}` regardless of entries. Check the report type and data before drawing a conclusion. An empty report means unavailable evidence, not zero rerenders or good performance.

The profiler sets `window.__PROFILING__ = true` before page scripts to hide react-scan's toolbar. Use browser timing and tracing when component attribution is unavailable. Do not add an app collector solely to satisfy an assumed workflow. `$inspect-elements` can resolve a visible DOM element to source when specific attribution is needed.

## Compare and report

Keep initial document loading separate from same-document hash navigation. Hash changes can retain the document and its counters; compare phase deltas or explicitly reload for an independent cold-load measurement. Measure readiness of the actual feed/control rather than only the browser load event. Record missing peer content or network failures that limit the comparison.

Report the device/throttle settings, URL and flow, observed timings, long tasks or layout shifts, trace/screenshot paths, and concrete symptoms. Separate observations from inferred causes. Rerender count alone does not justify memoization or a refactor; establish measurable cost first. Run the same narrow flow after a fix to compare results.

Close each exact session in cleanup even after failures. Stop only the dev server this task started. Return any remaining limitations without converting unavailable metrics into passing checks.
