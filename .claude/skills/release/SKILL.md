---
name: release
description: Prepare or ship a seedit release by updating its description, version, and changelog. Use when the user asks for release work; preview stays read-only and publication follows the requested scope.
disable-model-invocation: true
---

<!-- Generated from .agents/skills/release/SKILL.md; run yarn ai-workflow:sync. -->

# Release

Determine whether the user wants a preview, local preparation, or a release to ship. Honor explicit limits such as no commit or no push. Reuse authorization already given; do not insert an extra approval pause before an authorized action. If the version or bump is unspecified, infer it only when the requested changes make it unambiguous; otherwise ask for that choice.

## Inspect and preview

1. Inspect `git status`, the branch, `package.json`, `scripts/release-body.js`, and `.github/workflows/release.yml`. Preserve unrelated edits and staged changes.
2. Identify the latest applicable version tag with `git describe --tags --match 'v*' --abbrev=0` and inspect `git log --oneline <tag>..HEAD`. If no applicable tag exists, inspect release history before choosing a comparison range. Report when there are no unreleased commits.
3. Propose the version and one-sentence user-facing description. Use `patch`, `minor`, `major`, or the explicit requested `x.y.z`; do not silently pick a different release version.

A preview or dry run ends here with proposed content and the files that would change. It does not edit files, run `yarn changelog`, install dependencies, commit, tag, or push.

## Prepare locally

1. Edit only `oneLinerDescription` in `scripts/release-body.js`: start with "This version..." or "This release...", lead with the most useful visible changes, keep one sentence, and end with a period.
2. Update the version in `package.json`, then run `corepack yarn install` to synchronize `yarn.lock`.
3. Run `corepack yarn changelog` to regenerate `CHANGELOG.md` from Conventional Commits. Inspect the resulting diff and follow the repository's required checks for the final change once. Reuse verification evidence for unchanged code.
4. Review exactly the intended release files and any required generated context changes. Preserve build output and unrelated modifications outside the release commit.

Seedit's GitHub release workflow runs on `v*` tags, builds platform artifacts, signs the release manifest in CI, and finalizes the release body from uploaded assets. Never print or copy release signing secrets.

## Finalize within the requested scope

Only commit or tag when that action is authorized. Stage the reviewed release hunks, including any changed lockfile or required generated docs, and inspect `git diff --cached`. Never use `git add -A` or include unrelated staged work. For mixed files, use a selective index patch. Preserve and restore unrelated staging when excluding it from the release commit.

```bash
git add package.json scripts/release-body.js CHANGELOG.md
# Include other reviewed release files only when changed.
git diff --cached
git commit -m "chore(release): v<version>"
git tag v<version>
```

Confirm the tag does not already exist and points to the intended release commit. When shipping/pushing is authorized, push only the intended branch and tag refs:

```bash
git push origin HEAD
git push origin refs/tags/v<version>
```

A pushed release tag triggers publication; a local preparation request does not authorize it. With a no-push instruction, stop after the authorized local work and report the local commit/tag state.
