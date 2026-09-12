---
name: readme
description: Create, rewrite, or edit the requested README content, verifying relevant commands and project facts.
---

# README

Update the requested section in place, preserving the existing tone, structure, and unrelated content. A narrow edit needs only the sources that support it; a full project overview is appropriate when a new README or rewrite is requested.

Verify changed claims against relevant manifests, source, or runtime evidence. For setup commands, check `package.json` and the applicable launcher; inspect Android, Electron, deployment, or architecture files only when documenting that topic. Use Corepack-managed Yarn commands and the repository's actual configuration filenames.

Explain the outcome for the intended reader, with copyable commands where useful. Link maintained design, product, contribution, or release docs instead of duplicating their policies. Do not invent troubleshooting advice or expand a small correction into a new documentation structure.

Follow `docs/agent-playbooks/verification.md` for affected documentation checks and regenerate `public/llms*.txt` when required. Include generated changes in the deliverable; commit or publish only within the user's authorization. Report the edited scope and any claim that could not be verified.
