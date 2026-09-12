---
name: test-apk
description: Verify a requested seedit Android APK interaction or diagnose a specific emulator/upload failure.
---

<!-- Generated from .agents/skills/test-apk/SKILL.md; run yarn ai-workflow:sync. -->

# Android APK Verification

Establish the requested flow, code/APK version, device, and acceptance criteria. A small check can stay local; delegate a substantial independent flow to the available `test-apk` role when useful, with the same scope and evidence requirements.

Read [device ownership](references/device-ownership.md) when selecting, starting, or reusing an emulator. Read [platform procedures](references/platform.md) for build/install commands, instrumentation, or upload diagnosis. Build only when needed to test the intended code, and coordinate heavyweight work with the verification owner.

Verify the interaction itself and report device/build status, observed behavior, relevant diagnostics, and artifact paths. Preserve existing devices and data; clean up task-owned resources. Retain existing authorization without extra pauses, while keeping live uploads and content publication within the requested scope.

Use `docs/agent-playbooks/verification.md` for any broader check selection. Do not run a second full verification chain or modify application code merely because this testing skill was selected.
