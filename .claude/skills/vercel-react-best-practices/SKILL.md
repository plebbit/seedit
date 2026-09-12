---
name: vercel-react-best-practices
description: Apply relevant Vercel React guidance to this Vite client when reviewing a changed React flow or investigating a performance concern.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

<!-- Generated from .agents/skills/vercel-react-best-practices/SKILL.md; run yarn ai-workflow:sync. -->

# Vercel React Guidance for This Client

Select rules for the affected behavior; do not load the entire compiled `AGENTS.md` or run every rule as a checklist. The bundled reference is an upstream React/Next.js guide, while this repository is a Vite client with Bitsocial hooks and Zustand.

Useful starting points when relevant:

- Derived state or effect synchronization: [derived state](rules/rerender-derived-state-no-effect.md), [event logic](rules/rerender-move-effect-to-event.md).
- Render/subscription cost: [defer reads](rules/rerender-defer-reads.md), [simple expressions](rules/rerender-simple-expression-in-memo.md), [transient values](rules/rerender-use-ref-transient-values.md).
- Repeated browser work: [event listeners](rules/client-event-listeners.md), [passive listeners](rules/client-passive-event-listeners.md).
- Bundle or async bottlenecks: [barrel imports](rules/bundle-barrel-imports.md), [independent async work](rules/async-parallel.md).

Read other `rules/` files only when their topic applies. Skip Next.js, Server Components, server caching, server actions, and hydration guidance for this client. Do not introduce SWR, Next.js APIs, manual memoization, or a new dependency merely because an upstream example uses it. Adapt examples to the installed React/compiler behavior, existing data layer, and product design constraints.

Establish a correctness or measured performance reason for a change, preserve error handling and accessibility, and verify the affected behavior under `docs/agent-playbooks/verification.md`. Treat reference priorities as triage guidance rather than mandatory refactor targets. Licensed upstream rule files and their attribution remain intact.
