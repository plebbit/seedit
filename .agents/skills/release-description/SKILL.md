---
name: release-description
description: Draft or update the user-facing release one-liner when release wording is requested.
---

# Release Description

Inspect the applicable version tag and commits since it, then verify source changes when a title does not establish user-visible behavior. Prefer `git describe --tags --match 'v*' --abbrev=0` on the intended release branch; if no applicable tag exists, use the repository's release history to establish the range. Report when there is no unreleased work.

Write one plain-language sentence beginning with “This version” or “This release” and ending with a period. Lead with the most useful visible changes. Avoid a commit inventory, internal library names, Markdown, or claims unsupported by the actual diff.

For a preview, return the proposed wording. For an authorized update, edit only `oneLinerDescription` in `scripts/release-body.js` and inspect the final diff. This does not authorize version bumps, tagging, pushing, or a full release; use the `release` skill when those steps are requested.
