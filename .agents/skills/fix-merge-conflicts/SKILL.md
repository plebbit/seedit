---
name: fix-merge-conflicts
description: Resolve all merge conflicts on the current branch non-interactively, validate the build, and commit. Use when the user says "fix merge conflicts", "resolve conflicts", or when git status shows conflicting files.
disable-model-invocation: true
---

# Fix Merge Conflicts

Resolve all merge conflicts on the current branch non-interactively and leave the repo buildable.

## Constraints

- Resolve routine choices from source/history and explain material decisions. Ask only when mutually exclusive requirements cannot be resolved from the requested intent.
- Prefer minimal changes that preserve both sides' intent.
- Do not push or tag — only commit locally.

## Workflow

### 1. Detect conflicts

```bash
git status --porcelain
```

Collect files with `U` statuses or containing `<<<<<<<` / `=======` / `>>>>>>>` markers.

### 2. Resolve conflicts per file

Open each conflicting file and remove conflict markers. Merge both sides logically when feasible.

**When sides are mutually exclusive**, pick the variant that:
1. Compiles and passes type checks
2. Preserves existing public APIs and behavior

**File-type strategies:**

| File type | Strategy |
|-----------|----------|
| `package.json` | Merge keys conservatively, then `corepack yarn install` to regenerate `yarn.lock` |
| `yarn.lock` | Never manually edit — regenerate with `corepack yarn install` |
| Config files (`.json`, `.yaml`) | Preserve union of safe settings; don't delete required fields |
| Markdown / text | Include both unique sections, deduplicate headings |
| Binary files | Identify the intended version from change history; do not choose a side blindly |
| Generated files | Resolve their source first and regenerate when supported; never commit local build output |

### 3. Validate

Run all three checks. Fix any failures before proceeding.

```bash
corepack yarn agent:verify
```

If `package.json` was modified, run `corepack yarn install` first.

### 4. Verify no remaining markers

```bash
git grep -n -I -E '^(<{7} |={7}$|>{7} )' -- .
```

If any markers remain, go back and resolve them.

### 5. Finalize

Stage only the resolved task hunks and inspect `git diff --cached`. Preserve unrelated edits and staging; exclude them from this commit and restore their staging afterward.

```bash
git add <resolved-task-files>
git commit -m "chore: resolve merge conflicts"
```

## Operational Guidance

- Compilation alone does not settle a behavioral conflict. Preserve both sides’ intended requirements or report the unresolved choice.
- For large refactors causing conflicts, keep consistent imports, types, and module boundaries.
- Keep edits minimal — don't reformat unrelated code.
- Format resolved files with `corepack yarn exec oxfmt <file>` if they're `.ts`/`.tsx`/`.js`.

## Deliverables

- All task conflicts resolved, with unrelated edits preserved
- Passing `corepack yarn agent:verify`
- One local commit: `chore: resolve merge conflicts`
- Brief summary of files touched and notable resolution choices
