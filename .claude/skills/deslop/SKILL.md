---
name: deslop
description: Simplify unnecessary code in the requested diff when the user asks to deslop or clean up AI-generated code.
disable-model-invocation: true
---

<!-- Generated from .agents/skills/deslop/SKILL.md; run yarn ai-workflow:sync. -->

# Remove Unnecessary AI-Generated Code

Inspect the task-owned diff and nearby source/tests. Remove obvious restatements, avoidable casts, dead helpers, or speculative abstractions only where their purpose and behavior are understood. Preserve unrelated work.

Check history when a guard or workaround's purpose is unclear. Simplify defensive code only after verifying its input/error contract; retain boundary validation, accessibility, data-loss protection, and useful error handling. A one-caller helper can clarify a real boundary, and a repeated expression does not automatically need abstraction.

Match nearby style without reformatting adjacent code. Preserve comments explaining constraints or tradeoffs. When evidence is insufficient, retain the code and report the uncertainty instead of inventing cleanup work.

Verify affected behavior using `docs/agent-playbooks/verification.md`, reuse existing checks for unchanged code, and report the useful simplifications.
