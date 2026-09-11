---
name: deslop
description: Review recent task changes for unnecessary comments, casts, abstractions, and defensive code, then simplify only where behavior is preserved. Use when the user asks to deslop or clean up AI-generated code.
disable-model-invocation: true
---

# Remove Unnecessary AI-Generated Code

1. Identify the authorized diff against its base, including relevant staged, unstaged, and untracked files. Preserve unrelated work.
2. Read surrounding source and tests before deciding anything is redundant. Check history when the reason for a guard or workaround is unclear.
3. Remove comments that restate obvious code, avoidable `any` casts, unused helpers, and speculative abstractions only when there is evidence they add no value. Preserve comments explaining constraints, tradeoffs, or non-obvious behavior.
4. Simplify defensive code only after verifying its input/error contract. Do not assume a library always catches errors or uses a particular loading sentinel. Never remove boundary validation, accessibility, data-loss protection, or useful error handling to make a diff shorter.
5. Match nearby style without reformatting adjacent code. An abstraction with one caller can still clarify a complex boundary; a repeated expression does not automatically need a shared helper.
6. Run the repository's applicable checks once for the final state (`yarn agent:verify` for code), and report what changed and why. Reuse existing final-state verification when unchanged; do not rebuild for a review-only or documentation-only result.

When evidence is insufficient, keep the code and report the uncertainty. Do not invent cleanup work to fill a quota.
