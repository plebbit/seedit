# Device ownership and diagnostics

Inspect `adb devices -l`, `ANDROID_HOME`, available AVDs, and installed SDK images before starting anything. Select one device and pass `-s SERIAL` on every adb command. Do not assume a particular API level, ABI, or device profile is installed.

Reuse a compatible emulator without resetting its data or changing its settings unnecessarily. A physical device must be within the user's requested scope. If a new emulator is needed, give it a task-specific name, record the process/serial, and use a bounded boot wait; never overwrite an existing AVD with `--force`.

Keep builds, installs, and other heavyweight verification serialized with the parent/verification owner. Preserve preexisting emulators and files. Clean up only an emulator this task started unless the user wants it kept, and restore task-changed settings on reused devices.

Capture the specific failure steps and focused logs. Prefer timestamps/process filters over clearing shared logs. Quote wildcard filters and use a task-specific screenshot path:

```bash
adb -s SERIAL logcat -d -t 300 'FileUploaderPlugin:*' 'Capacitor:*' 'chromium:*' '*:S'
adb -s SERIAL exec-out screencap -p > /tmp/TASK-screenshot.png
```

Capture additional tags named by the platform reference when relevant. Report what actually ran, device ownership, skipped/unavailable checks, useful logs, and artifacts. A successful build or skipped test is not evidence that the interaction works.
