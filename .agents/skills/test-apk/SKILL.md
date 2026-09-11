---
name: test-apk
description: Test a seedit Android APK workflow with an emulator, focused logcat, and screenshots. Use when the user asks to test APK behavior, Android uploads, or an emulator flow.
---

# Test the Android APK

Establish the requested behavior and acceptance criteria. Run a small check directly, or delegate a substantial independent flow to the `test-apk` role with the exact scope, device serial, task paths, and evidence to return. One owner coordinates Android builds with other heavyweight verification.

## Repository facts to verify before a build

- `capacitor.config.json` sets `appId` to `seedit.android` and `webDir` to `build`.
- `android/app/build.gradle` has an unflavored app; debug output is `android/app/build/outputs/apk/debug/app-debug.apk`.
- `android/app/src/main/java/seedit/android/MainActivity.java` registers the upload plugin.
- `FileUploaderPlugin.java` and `FileUtils.java` in that directory handle media upload and URI resolution.
- There is no functional upload instrumentation suite. The committed `ExampleInstrumentedTest.java` is a template and still asserts `com.getcapacitor.app`, which differs from this app's ID. Do not report that template as coverage for an upload flow.

Recheck these facts against source when running the workflow. Do not copy commands for another project's Android flavors, automation-only plugin, or Gradle test filters.

## Device ownership

1. Inspect `adb devices -l`, `ANDROID_HOME`, available AVDs, and installed SDK images before creating or starting anything. Use a compatible installed system image and device profile; do not assume a particular API level or ABI is installed.
2. Select one device and use `adb -s SERIAL` for every command. Preserve preexisting emulators, data, and device settings. Do not drive a physical device unless that device is within the user's request.
3. If starting an emulator is necessary, use a task-specific AVD name, record its name/serial/process, and wait for boot with a bounded timeout. Do not overwrite an existing AVD with `--force`.
4. Clean up an emulator you started after verification unless the user wants it kept for iteration. Leave preexisting emulators running. Restore any task-changed settings when reusing a device.

## Build and install only when needed

Reuse an installed APK only when it represents the code under test. Rebuild after relevant changes or when required by the request. These commands are sequential heavyweight work:

```bash
corepack yarn build
corepack yarn exec cap sync android
# From android/:
./gradlew assembleDebug
# From the repository root, after confirming the output path:
adb -s SERIAL install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s SERIAL shell am start -n seedit.android/.MainActivity
```

Capture the build result and installed version; a successful build is not evidence that the requested UI flow works. Keep generated build output out of commits and preserve preexisting files during cleanup.

## Exercise the assigned flow

For uploads, navigate to a submit form, choose a task-owned media fixture, and observe progress, completion, and the returned URL/error. If submitting would publish content, do so only when publication was explicitly authorized; test selection/upload and stop before the submit action otherwise.

Record the failure steps and focused logcat around the run. Prefer timestamp/process filters to clearing shared device logs. Quote wildcard filters so the shell does not expand them:

```bash
adb -s SERIAL logcat -d -t 300 'FileUploaderPlugin:*' 'Capacitor:*' 'chromium:*' '*:S'
adb -s SERIAL exec-out screencap -p > /tmp/TASK-screenshot.png
```

Use a unique task screenshot path. Diagnose from current logs and source: failed uploads can involve network responses or picked-URI access, so do not assume the cause from a generic failure message.

Return the device/ownership state, build and install status, exact tested flow, results, relevant diagnostics, screenshot paths, and remaining uncertainty. Do not modify application code unless that responsibility was assigned.
