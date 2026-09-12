# Authorized merge and cleanup

Before merging, confirm that the PR's current head is the version reviewed, required checks pass, it is mergeable into the intended base, and no established correctness/security blocker remains. Required branch protections and explicit human review requirements still apply. A draft/readiness change is an external mutation; perform it only as part of the authorized scope.

Use existing final-state verification evidence. A new head or relevant fix may require renewed checks under `docs/agent-playbooks/verification.md`; an unchanged PR does not automatically require another full local build.

Merge using the repository-supported method consistent with the request. Do not bundle branch deletion into the merge command unless cleanup is also intended. For this repository's usual squash merge:

```bash
gh pr merge PR --squash
```

Verify the reported merge result before cleanup. Do not retry an uncertain merge blindly; inspect the current PR state first.

For authorized cleanup, verify that the local branch tip matches the PR's merged head and no later commits, uncommitted edits, or active worktree users would be removed. Preserve any work that fails those checks. Leave a worktree before removing it, use non-forced removal, and delete only the exact verified task branch. A squash merge may lack ancestry; prove the merged-head match before considering a forced branch deletion. Never suppress a failed safety check or clean up a branch by naming convention alone.

Report merge status and any retained branch/worktree. Cleanup is conditional on ownership and scope, not a reason to stop otherwise completed work for another approval.
