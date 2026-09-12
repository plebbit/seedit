---
name: commit
description: Create scoped local commits when the user asks to commit changes.
disable-model-invocation: true
---

# Commit

Review the requested diff, including staged and untracked files, and preserve unrelated work. Group independently useful changes into separate commits; do not split one coherent change merely by file type.

Use the existing final-state verification and review evidence when still applicable. Follow `docs/agent-playbooks/verification.md` for any missing checks. A completed review does not need to be repeated just to commit the same diff.

Stage only task-owned hunks and inspect `git diff --cached` before committing. For mixed files, use an index patch. Exclude unrelated staged changes from the commit and restore their staging afterward.

Use a Conventional Commit with a required human-readable scope: `type(scope): concise description`. Use `perf` for performance work. A body is optional when the title is insufficient; see `commit-format` for wording requests.

Use `corepack yarn exec git commit -m 'type(scope): description'` so the repository's Git hooks inherit Corepack Yarn rather than a global Yarn version. Report the resulting hash and title.

Only commit within the user's authorization. Do not push, tag, or amend published history as part of this skill. Explicitly requested later actions retain their own scope.
