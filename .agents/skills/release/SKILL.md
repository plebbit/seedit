---
name: release
description: Preview, prepare, or ship a seedit release when release work is requested.
disable-model-invocation: true
---

# Release

Match the requested outcome and version. Preserve explicit limits and existing authorization; a preview, local preparation, and publication have different effects.

| Request | Guidance |
|---|---|
| Preview or dry run | Inspect history and show proposed version, release text, and changed files; do not edit, run mutating generators, commit, tag, or push |
| Prepare locally | Read [preparation](references/prepare.md) for this repository's release files and ordering |
| Ship, publish, or push | Prepare the release, then read [finalization](references/finalize.md) for the authorized Git/publication steps |

Use the preparation reference's content rules when drafting a preview as well. Keep all work within the requested scope; do not ask again for authorization already given. If required release information is missing, complete independent inspection and identify that missing choice.

Return the proposed or completed release state and relevant verification evidence. Use `docs/agent-playbooks/verification.md` to select checks rather than launching a separate mandatory verification chain.
