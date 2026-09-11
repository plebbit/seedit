# Agent Verification

Use checks that establish the requested behavior. Record commands and outcomes so the next agent does not repeat a successful check without a reason.

## Code changes

1. Inspect existing workloads. Coordinate with other agents before heavy work; never stop an unfamiliar process.
2. Run focused behavior tests when applicable. For Vitest use `corepack yarn exec vitest run --passWithNoTests --maxWorkers=2 [paths]`.
3. One owner runs `corepack yarn agent:verify`: build, lint, then type-check, sequentially. It uses a machine-wide lock and reports contention rather than starting another build. Direct manual commands still require coordination.
4. Add `yarn doctor` for React UI logic and advisory `yarn knip` for dependency/import changes. Investigate newly introduced findings rather than preexisting scores.
5. Perform one advisory `code-quality-review` on the final diff. Apply only high-confidence findings within scope.

Repeat a check only if relevant files changed after it passed, it failed, or new evidence raises a concern. No lifecycle hook runs builds, installs, audits, or Git cleanup. Security audits and coverage remain explicit, task-driven checks.

Builds can refresh generated assets and write `build/`. Inspect status before and after verification, preserve preexisting changes/artifacts, and clean up only output created by this task. The verifier never restores or deletes output directories for you.

## Workflow and document changes

For shared instructions, skills, roles, or hooks run `yarn ai-workflow:sync`, `yarn ai-workflow:check`, and `yarn ai-workflow:test`. The test command uses Node's test runner on isolated fixtures, without launching an app or browser. Run `yarn llms:generate` after changing public English docs or AI context. Application builds are unnecessary for documentation-only changes.

## Browser verification

Read the `playwright-cli` skill. Use Chrome for iteration, then verify the final affected flow in Chrome/Blink, Firefox/Gecko, and WebKit/Safari sequentially. Include desktop and mobile when layout, responsiveness, or touch behavior changed.

All sessions use `./scripts/pw-session.sh`; close the exact session in a finally-style cleanup before opening the next engine. Use `./scripts/pw-throttle.sh <session> mid` for a Chromium low-spec pass when loading, navigation, or interaction speed matters. The [low-spec playbook](low-spec-verification.md) describes the procedure.

Use a fresh isolated profile unless current-session access is already authorized and required. Do not attach to a personal browser or silently switch an explicitly requested session mode. Reuse a compatible server in the task worktree, or record and stop a task-owned server when finished.

## Durable evidence

For a real handoff, record acceptance criteria, changed files, check results, limitations, and next steps using the [long-running workflow](long-running-agent-workflow.md). A single delegated task does not itself require a persistent task board or smoke server.
