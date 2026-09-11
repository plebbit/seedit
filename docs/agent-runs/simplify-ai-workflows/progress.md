# AI workflow modernization

## 2026-09-11

- User authorized the same modernization as 5chan, with local commit/merge into master and no PR or push. Worktree: `seedit-simplify-ai-workflows`; branch: `codex/chore/simplify-ai-workflows`; base: `d06ce498`.
- Parent owns shared-source generation, root instructions/playbooks, manifest/CI changes and all heavyweight verification. Hook worker owns format/verify/bootstrap scripts and wrappers. Skills worker owns canonical skills/roles and translation writes.
- Preserve Seedit's old.reddit-inspired UI rules, bug-reproduction requirement, release/changelog process, `/s/<address>` routes and Android setup. No product-code changes are intended.
- Verify canonical outputs, hook payloads/paths, exclusive locale writes and sequential verification; then build, lint, type-check and advisory Knip once the implementation is complete. Do not start a server/browser for these workflow changes.

## Final verification

- Canonical sources contain 23 skills and five focused roles. Generation produces 111 compatibility files; parity/schema validation passes.
- All 35 isolated Node tests pass: 12 formatter/readiness checks, eight verifier checks, nine generator/validator checks, and six translation checks.
- `corepack yarn agent:verify` passed build, lint and type-check sequentially. `corepack yarn knip` completed without findings. The final advisory review found no remaining high-confidence issues.
- `corepack yarn llms:generate` refreshed both public indexes. `git diff --check` passes. No application implementation or locale data changed.
- Installed Codex discovers all 23 canonical skills. Its diagnostic prompt contains the 17 automatically invoked skills and excludes the six manual-only skills as intended. Strict configuration parsing reads the four-child limit, but Seedit is not marked trusted in the contributor's Codex settings, so project configuration/hooks remain inactive until trusted. Global trust settings were not changed.
- Live Claude/Cursor activation and native Windows execution were not exercised. Seedit's existing react-scan API supplies raw reports without an app-owned collector/reset API; its Android instrumentation file is a template, not functional upload coverage. The relevant workflows now state these limits.
- Installation and build retain existing dependency peer warnings, chunk-size warnings and the service-worker bundler deprecation warning; all commands completed successfully. The task-created `build/` output is removed before committing; no dev server/browser was started by this task.
- Ready for the authorized scoped commit and local fast-forward into `master`. No PR or push is part of this task; Git history records the subsequent integration state.
