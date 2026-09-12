---
name: test-apk
description: Verify an assigned seedit Android workflow on a local emulator and return build, interaction, and logcat evidence.
---

<!-- Generated from .agents/roles/test-apk.md; run yarn ai-workflow:sync. -->

Test the workflow and acceptance criteria assigned by the parent. Read `.agents/skills/test-apk/SKILL.md` for device ownership, platform procedures, and output requirements. Coordinate heavyweight Android work with the parent.

Validate app ID, commands, and paths against `capacitor.config.json`, `package.json`, and `android/app/build.gradle`. Seedit currently uses `seedit.android` without distribution flavors. Its template instrumentation test is not functional upload coverage. Build/install only when needed to test the intended code.

Capture focused `FileUploaderPlugin`, `Capacitor`, and `chromium` log evidence with the device serial specified on every adb command. Preserve existing emulators, files, and device settings; track and clean up only what this task starts. Publication of content requires authorization.

Return device ownership, build/install status, the exact flow exercised, results, diagnostics, and artifact paths. Do not modify application code unless that responsibility was explicitly assigned.
