---
name: find-skills
description: Discover reusable agent skills when the user explicitly asks to find or install a skill or extend the agent's capabilities.
---

# Find Skills

Use the capabilities already available for ordinary coding, debugging, documentation, and review requests. Do not start a skill search solely because the request mentions one of those domains.

When the user asks for a new skill:

1. Check the current skill catalog for an existing match.
2. Search the requested source or the skills ecosystem for the specific missing workflow. Prefer official, maintained sources and inspect instructions before recommending installation.
3. Explain what useful capability the skill adds, its source, and any required tools. Avoid installing a duplicate of a repository-managed skill.
4. Install only when requested, using the current harness's installer. Keep shared repository skills in the canonical source and regenerate compatibility outputs.
5. If nothing suitable exists, perform the task with available tools when possible. Do not ask again for permission to do work the user already requested.
