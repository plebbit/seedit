# Skills and Tools

Shared skills live in `.agents/skills/`. Edit these sources, then run `yarn ai-workflow:sync` to generate `.claude/skills/` for Claude Code. Codex and Cursor discover `.agents/skills/` directly; do not restore the duplicate `.codex/skills/` or `.cursor/skills/` roots.

Shared role prompts live in `.agents/roles/*.md`. The same generator produces standalone Codex TOMLs and Claude/Cursor Markdown agents. Generated files identify their source. After removing a source, remove its obsolete generated outputs explicitly; the validator reports them rather than silently deleting files.

The AI directories use LF line endings through `.gitattributes` so generated text stays identical across platforms. Supporting skill assets are copied as bytes.

## Skills

| Skill | Purpose |
|---|---|
| `commit` | Create authorized, scoped local commits |
| `commit-format`, `issue-format` | Format suggestions when requested |
| `make-closed-issue` | Create an authorized issue, scoped commit and PR |
| `review-and-merge-pr` | Triage PR feedback; fix/publish/merge only within the requested scope |
| `fix-merge-conflicts` | Resolve conflicts and verify the merged result |
| `release`, `release-description` | Prepare changelog/release wording and perform authorized release steps |
| `code-quality-review` | One advisory review of the final diff |
| `refactor-pass`, `deslop` | Requested cleanup of existing changes |
| `debug-agent` | Evidence-based debugging, with instrumentation when needed |
| `you-might-not-need-an-effect` | Focused effect/memo review |
| `vercel-react-best-practices` | Applicable React performance guidance; skip Next.js/server-only rules for this Vite client |
| `translate` | Generate translations, then apply maps through a single writer |
| `playwright-cli`, `inspect-elements` | Browser verification and DOM-to-source mapping |
| `profile-browsing` | Scoped browser and React profiling |
| `test-apk` | Local Android emulator procedures |
| `implement-plan` | Execute a plan with optional bounded delegation |
| `readme` | Maintain verified project documentation |
| `context7` | Retrieve version-appropriate library documentation |
| `find-skills` | Find additional skills when explicitly requested |

## Roles and models

Keep custom roles for `browser-check`, `profiler`, `test-apk`, `translator`, and `reviewer`. Use the harness's built-in worker/general-purpose or explorer role for ordinary implementation and code discovery. The parent assigns acceptance criteria and ownership; one owner runs heavyweight checks.

Codex agent files include `name`, `description`, and `developer_instructions`. Leave model and reasoning unset to inherit the session. `.codex/config.toml` caps concurrent children at four using `max_concurrent_threads_per_session`. Source role metadata may specify `claude-model` and `cursor-model` for intentional, harness-supported cost choices; these are not copied into Codex configs. `sandbox-mode: read-only` maps to Codex's sandbox and Cursor's `readonly`; Claude's tool list and the role instructions restrict its review workflow, but Bash access is not an OS-level sandbox.

Shared skill frontmatter uses `disable-model-invocation: true` for user-invoked workflows where applicable. Codex's corresponding setting lives in `agents/openai.yaml` as `policy.allow_implicit_invocation: false`; the validator requires both. Invocation metadata supplements explicit authorization rules; a review request never authorizes publication merely because a skill includes publishing steps.

## Checks and discovery

- `yarn ai-workflow:sync` regenerates compatibility outputs using installed `js-yaml` and `smol-toml`.
- `yarn ai-workflow:check` parses source/frontmatter/configs, checks generated outputs, invocation metadata, role models, and the formatter-only hook wiring.
- `yarn ai-workflow:test` runs isolated Node fixtures for hook payloads, verification ownership, translation writers, and workflow generation/validation.
- After upgrading an agent application, verify skill/role discovery in that application. Syntax/parity checks do not replace a loader check. Reload the application if an existing session retains an old catalog.
- Hooks require the harness's project trust and hook review; do not bypass trust to make a check pass. See [hooks-setup.md](hooks-setup.md).

Current format references (reviewed 2026-09-11): [Codex skills](https://learn.chatgpt.com/docs/build-skills), [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Cursor skills](https://cursor.com/docs/skills), [Claude skills](https://code.claude.com/docs/en/skills).

## Tools and browser ownership

Prefer the existing skill/tool catalog and installed project CLIs. Use `gh` for GitHub, `playwright-cli` for browser verification, and official/version-specific documentation when library behavior matters. Avoid installing duplicate skills or fetching an unpinned package merely to run an existing formatter.

MCP overhead depends on the harness: deferred tool loading can avoid loading every schema upfront. Keep integrations relevant rather than treating MCP itself as obsolete. Existing CLI choices remain useful for reproducibility and resource control.

All browser sessions use `./scripts/pw-session.sh`, which enforces one active browser machine-wide. Default to a fresh isolated session. Current personal-browser access needs explicit authorization; reuse that authorization in subsequent steps. Run desktop/mobile in each engine sequentially, close the exact named session in cleanup, and never use `close-all`/`kill-all`. See the `playwright-cli` skill and [verification.md](verification.md).
