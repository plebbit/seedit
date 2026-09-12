---
name: make-closed-issue
description: Create an issue and linked PR for completed work when that tracking workflow is requested.
disable-model-invocation: true
---

<!-- Generated from .agents/skills/make-closed-issue/SKILL.md; run yarn ai-workflow:sync. -->

# Track Completed Work

Determine whether the user wants proposed issue wording, an issue created, or the full issue/commit/PR workflow. Honor explicit limits such as no commit or no push. Closing an existing issue is not a request to create a replacement issue or publish code.

For wording only, use the requested diff/context and the `issue-format` guidance; stop with the proposed text. For the full workflow, inspect repository/branch identity and existing issues/PRs first so retries do not create duplicates.

Describe the original problem and use concise labels supported by the repository. Resolve the current contributor's login with `gh api user --jq '.login'` when assigning an issue; do not guess another account. If authentication is unavailable, prepare reviewable wording and report the unavailable operation.

Use a task branch into `master` when opening a PR. Preserve unrelated edits and staged changes, and include only the reviewed task hunks in an authorized commit. Reuse completed verification or select missing checks using `docs/agent-playbooks/verification.md`.

When creation is authorized, use `gh issue create` with the verified repository, labels and assignee. Pass multiline bodies through `--body-file`, and retain the returned issue number. If only an issue was requested, finish after creating it.

When the user authorized publishing the change, push only the intended branch and create a ready-for-review PR into `master` with `Closes #<issue>` in its body. A no-push instruction leaves publication pending even if issue creation or a local commit is authorized. Do not merge as part of issue/PR creation.

Report the actual issue, commit and PR state, including partial completion after failures. An issue linked with `Closes` remains open until its PR merges. Keep an unmerged branch/worktree; run a later review or merge workflow only when requested.
