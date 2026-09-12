---
name: fix-merge-conflicts
description: Resolve requested Git conflicts while preserving both sides’ intended behavior.
disable-model-invocation: true
---

# Resolve Merge Conflicts

Inspect `git status`, unmerged index entries, and relevant history to establish the merge/rebase/cherry-pick in progress. Preserve unrelated edits and staging. Resolve routine choices from the requested intent; ask only when mutually exclusive requirements cannot be reconciled from the evidence.

Preserve both sides' intended behavior, not merely the variant that compiles. Resolve source manifests before regenerating lockfiles with Corepack Yarn. Resolve generated files through their source/generator when available. Select binary versions from their purpose and history rather than blindly preferring one side. Never commit build output.

Check the resolved paths for remaining conflict markers and inspect the resulting diff. Choose verification from `docs/agent-playbooks/verification.md`: documentation conflicts need document checks; integrated runtime/build changes need the full pass plus relevant behavior tests.

Stage only authorized resolved hunks, preserving unrelated staging. Continue the existing Git operation or create a local commit only within the requested scope; account for whether continuation itself creates a commit. Use a scoped title such as `chore(merge): resolve merge conflicts` when creating a new commit. Do not push or tag.

Report the resolved files, material choices, verification, and whether the Git operation is finished. If unresolved intent remains, return that specific decision with the safe resolutions retained.
