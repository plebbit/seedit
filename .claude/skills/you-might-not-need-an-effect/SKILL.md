---
name: you-might-not-need-an-effect
description: Review React effects and memoization when the user requests an effect audit or a change has unclear synchronization needs.
disable-model-invocation: true
---

<!-- Generated from .agents/skills/you-might-not-need-an-effect/SKILL.md; run yarn ai-workflow:sync. -->

# Review Effects

Inspect the requested files or task-owned diff. An audit returns findings; apply fixes when the user requests implementation or cleanup. Preserve existing authorization without inventing an additional approval step. Use surrounding source and relevant tests to establish each effect's actual purpose.

Decide whether the behavior is derived computation, an event response, or synchronization with an external system:

- Derive values from props/state during render rather than mirroring them with effects. Use memoization only when it has a demonstrated benefit.
- Keep user-triggered work in the appropriate handler. Route lifecycle work must still handle direct entry, history navigation, and other ways the route changes; moving it into one click handler can lose behavior.
- Use Bitsocial hooks for protocol data and Zustand selectors for shared state. Do not replace these with manual fetching or mirrored subscriptions.
- A key can reset a component's state, but verify that resetting its full subtree is intended.
- Keep effects that synchronize browser APIs or imperative systems, with correct dependencies and cleanup. Do not move initialization into module scope unless import-time execution is safe and preserves its lifecycle.

Do not remove an effect or memo solely because it exists. Check behavior, loading/error states and cleanup after any refactor using `docs/agent-playbooks/verification.md`. Report concrete findings or changes without expanding into an unrelated React overhaul.

For a pattern that remains unclear, consult React's [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) guidance for that pattern.
