# Finalize the authorized release

Inspect the intended release diff and select verification under `docs/agent-playbooks/verification.md`. Stage only reviewed release hunks, including any required lockfile/generated docs. Preserve unrelated edits and staging. Confirm `git diff --cached` contains exactly the intended commit.

Commit and create the exact version tag only within the requested authorization. Verify the tag is unused and targets the intended release commit. When shipping/pushing was requested, push only the intended branch and tag refs:

```bash
git push origin HEAD
git push origin refs/tags/vVERSION
```

A pushed `v*` tag starts release publication in GitHub Actions. A preparation request alone does not authorize it. Explicit no-push limits remain in force. After an uncertain push, inspect the remote refs before retrying; do not push every local tag or force-update an existing release.

Report which local changes, commits, tags, and external actions actually completed. Reuse existing authorization without asking again for an approved necessary step.
