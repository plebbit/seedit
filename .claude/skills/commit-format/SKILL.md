---
name: commit-format
description: Format a Conventional Commit title and optional body when the user asks for commit wording or a commit is being created.
---

<!-- Generated from .agents/skills/commit-format/SKILL.md; run yarn ai-workflow:sync. -->

# Commit Format

Use `type(scope): short description`, with a concise human-readable scope. Types: `fix`, `feat`, `perf`, `refactor`, `docs`, `chore`; use `perf` for performance changes. Add a short body only when it explains something the title cannot.

For a chat suggestion:

> **Commit title:** `type(scope): short description`
>
> Optional explanation with `code` references.

Wrap the entire title in one code span, without nested backticks. Do not append a commit suggestion to unrelated answers unless requested. These formatting instructions do not authorize a commit or push.
