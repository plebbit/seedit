# Bug Investigation Workflow

Use this when a bug is reported in a specific file/line/code block.

## Mandatory First Step

Before editing, check git history for the relevant code. Previous contributors may have introduced behavior for an edge case/workaround.

## Workflow

1. Scan recent commit titles (titles only) for the file/area:

```bash
# Recent commit titles for a specific file
git log --oneline -10 -- src/components/post-desktop/post-desktop.tsx

# Recent commit titles for a specific line range
git blame -L 120,135 src/components/post-desktop/post-desktop.tsx
```

2. Inspect only relevant commits with scoped diffs:

```bash
# Show commit message + diff for one file
git show <commit-hash> -- path/to/file.tsx
```

3. Continue with reproduction and fix after understanding the history context.

## Troubleshooting Rule

Search current documentation or upstream issues when the blocker concerns a dependency or platform behavior. If access to private source or a user-only reproduction step is missing, report that specific gap instead of doing an unrelated web search.
