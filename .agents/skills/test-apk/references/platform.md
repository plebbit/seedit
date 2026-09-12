# Seedit Android procedures

Verify these facts against current `capacitor.config.json`, `package.json`, and `android/app/build.gradle` before choosing commands:

- App ID/namespace: `seedit.android`; web output: `build`.
- The app is unflavored; debug output is `android/app/build/outputs/apk/debug/app-debug.apk`.
- `android/app/src/main/java/seedit/android/MainActivity.java` registers the upload plugin; `FileUploaderPlugin.java` and `FileUtils.java` there handle uploads and picked-URI resolution.

Rebuild only when the installed APK does not represent the code under test or the request requires a build. From the repository root, build web assets and sync Capacitor; then build from `android/`:

```bash
corepack yarn build
corepack yarn exec cap sync android
# From android/:
./gradlew assembleDebug
# From the repository root, after verifying the output:
adb -s SERIAL install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s SERIAL shell am start -n seedit.android/.MainActivity
```

## Upload diagnostics

There is no functional upload instrumentation suite. The committed `ExampleInstrumentedTest.java` is a template that asserts `com.getcapacitor.app`, different from this app's ID; do not claim it verifies upload behavior.

For an assigned upload flow, navigate to the submit form, select a task-owned fixture, and observe progress, completion, and the returned URL/error. Catbox uploads send data to a third party; run them only when that external upload is part of the requested test. Do not publish a post unless that action is authorized.

Capture focused `FileUploaderPlugin`, `Capacitor`, and `chromium` logs with the selected serial. Check the current plugin source and response details before diagnosing network failure, provider rejection, or URI permission issues. Return the actual interaction result and remaining uncertainty; do not substitute another project's automation test classes.
