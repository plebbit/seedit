---
name: commit
description: Commit current work by reviewing diffs, splitting into logical commits, and writing standardized messages. Use when the user says "commit", "commit this", "commit current work", or asks to create a git commit.
disable-model-invocation: true
---

<!-- Generated from .agents/skills/commit/SKILL.md; run yarn ai-workflow:sync. -->

# Commit Current Work

## Workflow

1. **Review all uncommitted changes**

   ```bash
   git status
   git diff
   git diff --cached
   ```

   Read the diffs to identify the changes authorized for this commit. Preserve unrelated work, including preexisting staged changes. A request to commit this task does not authorize committing every modification in the checkout.

2. **Group changes into logical commits**

   Within the authorized scope, split distinct changes into logical commits. Leave unrelated work out of the commit.

   Example — two unrelated changes in the working tree:
   - Modified `src/components/reply-modal.tsx` (UI fix)
   - Modified `src/stores/use-settings-store.ts` (new setting)

   These should be two separate commits, not one.

3. **Run the final advisory review**

   Before committing, use the repo-managed `code-quality-review` skill once on the final intended diff, including relevant staged, unstaged, and untracked files. Reuse a completed review for the same final state. Consider only high-confidence findings. Apply them only when the active task authorizes edits; otherwise report them and continue with the requested commit. This review is advisory and must not become a hard gate.

4. **Stage and commit each group**

   For each logical group, stage only its changes. If unrelated work is already staged, save its index patch, exclude it from this commit, and restore that staging afterward; never commit it incidentally. Use a selective index patch for mixed files, then inspect `git diff --cached` before committing:
   ```bash
   git add <relevant files>
   git commit -m "title here"
   ```

5. **Display the commit title to the user** wrapped in backticks (inline code).

## Commit Message Rules

- **Title format:** Conventional Commits with a **required scope**. The scope should be a short, human-readable name for the area of the codebase affected.

  | Pattern | Example |
  |---------|---------|
  | `type(scope): description` | `feat(reply modal): add textarea` |

- **Never omit the scope.** `feat: add textarea` is wrong. `feat(reply modal): add textarea` is correct.
- **Keep titles short.** If more context is needed, add a commit body — but don't repeat the title.
- **Use `perf:` for performance optimizations**, not `fix:`.

## Constraints

- Only commit when instructed. Do not commit subsequent changes unless explicitly told to.
- Never push — only commit locally.
- Never amend commits that have been pushed to a remote.
