# src/AGENTS.md

These rules apply to `src/**`. Follow the repo-root `AGENTS.md` first, then use this file for code inside the application source tree.

- Keep route composition in `src/views/`, reusable UI in `src/components/`, shared logic in `src/hooks/`, and shared app state in `src/stores/`.
- Before adding new state, decide whether it belongs in render, a reusable hook, or a Zustand store. Do not duplicate the same state logic across views.
- Use `@bitsocial/bitsocial-react-hooks` for data access. Do not add data-fetching `useEffect` calls or effects that only synchronize derived state.
- Read `DESIGN.md` before visual, layout, component, or theme work. Preserve Seedit's compact old.reddit-inspired hierarchy and verify both light and dark themes.
- When changing React UI logic, review applicable React rules once with `vercel-react-best-practices` or an equivalent available skill before final verification. Run `yarn agent:verify` and `yarn doctor`. When changing layout or interaction, verify desktop and mobile behavior with `playwright-cli`.
- Prefer extending nearby tests under `src/**/__tests__/` when touching already-covered behavior.
