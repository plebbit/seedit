# Review feedback and checks

Read the PR's head/base, diff, required checks, issue comments, reviews, and inline threads. Resolve the repository and PR number from the current task rather than assuming a fixed repository. Paginate results when necessary.

```bash
gh pr view PR --json number,title,url,headRefName,headRefOid,baseRefName,isDraft,reviewDecision,mergeStateStatus
gh pr diff PR
gh pr checks PR
gh api --paginate repos/OWNER/REPO/issues/NUMBER/comments
gh api --paginate repos/OWNER/REPO/pulls/NUMBER/reviews
gh api --paginate repos/OWNER/REPO/pulls/NUMBER/comments
```

Cursor Bugbot, CodeRabbit, human reviews, and CI are evidence sources. Verify a finding before accepting it: read the relevant code and tests, check whether it still applies to the current head, and distinguish a reproducible defect from a style preference. An independent reviewer should receive the artifact and contract without the parent's verdict.

Apply fixes only within the active authorization. Keep edits on an appropriate checkout of the PR head, stage task-owned hunks, and inspect the index before any authorized commit. A fix request alone does not authorize pushing, merging, or posting a comment; reuse authorization already given for those actions without another pause.

Return the high-confidence issues and disposition of relevant feedback. Report unresolved correctness/security failures as merge blockers; do not turn every suggestion or unrelated follow-up into one. If an external update is requested, write the exact content to a temporary file and use `gh pr comment PR --body-file FILE`, then remove only that task-owned file.
