# Android Toolchain Setup — ready to execute the native photo-app plan

> Companion to [`plans/2026-06-20-photo-app-native-prototype.md`](plans/2026-06-20-photo-app-native-prototype.md).
> Written 2026-06-20. This machine had **no** JDK / Gradle / Android SDK / Android Studio at the start.
> Everything below was installed **user-scope (no admin)** and **verified end-to-end**, so a fresh
> session can run the plan's `./gradlew` gates for real.

---

## TL;DR — one thing the plan must change before Task 1

**AGP 9 has built-in Kotlin.** Applying `org.jetbrains.kotlin.android` is now a hard build error:

```
The 'org.jetbrains.kotlin.android' plugin is no longer required for Kotlin support since AGP 9.0.
Solution: Remove the 'org.jetbrains.kotlin.android' plugin from this project's build file.
```

The plan applies `alias(libs.plugins.kotlin.android)` in the root, `:app`, and `:macrobenchmark`.
**Delete every `kotlin.android` plugin application** (and the catalog alias). Keep the Compose and
serialization compiler plugins — those are separate and still required. Concretely:

- **`native/build.gradle.kts`** (Task 1 Step 5) — remove the line `alias(libs.plugins.kotlin.android) apply false`.
- **`native/app/build.gradle.kts`** (Task 1 Step 6) — remove the line `alias(libs.plugins.kotlin.android)`.
- **`native/macrobenchmark/build.gradle.kts`** (Task 10 Step 2) — remove the line `alias(libs.plugins.kotlin.android)`.
- **`native/gradle/libs.versions.toml`** (Task 1 Step 1) — the `kotlin-android` entry under `[plugins]` is now unused; leave it or delete it (it just must not be *applied*).

Everything else in the plan's plugin/DSL approach is **validated working** (see "Smoke build" below):
`com.android.application` 9.2.0, `org.jetbrains.kotlin.plugin.compose` 2.3.21,
`org.jetbrains.kotlin.plugin.serialization` 2.3.21, and the
`kotlin { compilerOptions { jvmTarget.set(JvmTarget.JVM_17) } }` block all work **without** the
`kotlin.android` plugin.

> Note for the `:macrobenchmark` module: AGP 9 built-in Kotlin covers `com.android.test` too, so
> removing `kotlin.android` there is correct. If a build ever says otherwise, the error message is
> explicit and self-correcting.

---

## What was installed (all under the local, non-OneDrive profile)

| Component | Version | Location |
|---|---|---|
| JDK (Temurin) | 17.0.19+10 | `C:\Users\kees_\AppData\Local\Java\jdk-17.0.19+10` |
| Android SDK root | — | `C:\Users\kees_\AppData\Local\Android\Sdk` |
| · cmdline-tools | `latest` (15641748) | `…\Sdk\cmdline-tools\latest` |
| · platform-tools | 37.0.0 (adb 1.0.41) | `…\Sdk\platform-tools` |
| · platforms | `android-36` | `…\Sdk\platforms\android-36` |
| · build-tools | `36.0.0` | `…\Sdk\build-tools\36.0.0` |
| · emulator | 36.6.11 | `…\Sdk\emulator` |
| · system image | `system-images;android-34;aosp_atd;x86_64` | `…\Sdk\system-images\android-34\aosp_atd\x86_64` |
| Gradle (standalone) | 9.4.1 | `C:\Users\kees_\AppData\Local\Gradle\gradle-9.4.1` |
| AVD | `photos_pixel6_api34` (Pixel 6, API 34, aosp_atd) | `C:\Users\kees_\.android\avd\photos_pixel6_api34.avd` |

The standalone Gradle exists only to **generate the wrapper** (Task 1 Step 4). Once `native/gradlew`
exists, prefer `./gradlew`.

## Environment variables (persisted to **User** scope)

`JAVA_HOME`, `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and `Path` (+ the JDK/SDK/Gradle `bin` dirs) are set
in the user registry. A **freshly launched** shell / Android Studio / Claude session inherits them.

⚠️ If the Claude harness was **not** restarted, an in-session shell still has the *old* environment
(child processes inherited the env block from before these vars were set). In that case, set them
inline at the top of each command:

```powershell
# PowerShell
$env:JAVA_HOME="C:\Users\kees_\AppData\Local\Java\jdk-17.0.19+10"
$env:ANDROID_HOME="C:\Users\kees_\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:PATH="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\emulator;C:\Users\kees_\AppData\Local\Gradle\gradle-9.4.1\bin;$env:PATH"
```

```bash
# Git Bash
export JAVA_HOME="/c/Users/kees_/AppData/Local/Java/jdk-17.0.19+10"
export ANDROID_HOME="/c/Users/kees_/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:/c/Users/kees_/AppData/Local/Gradle/gradle-9.4.1/bin:$PATH"
```

A `native/local.properties` with `sdk.dir` is **not required** (ANDROID_HOME is set), but harmless to add.

---

## Verification evidence (all green)

- `java -version` → `openjdk version "17.0.19" … Temurin-17.0.19+10`
- `gradle -version` → `Gradle 9.4.1`
- `adb --version` → `1.0.41 (37.0.0)`
- `emulator -accel-check` → **`WHPX(10.0.26200) is installed and usable`** (HW accel works, no admin needed)
- AVD `photos_pixel6_api34` boots headless → `sys.boot_completed=1`, Android 14, `emulator-5554`
  (so instrumented Tasks 9 & 10 will run locally)
- **Plan version matrix all resolve (HTTP 200):** Gradle 9.4.1, AGP 9.2.0, Kotlin 2.3.21,
  Compose BOM 2026.06.00, material3 1.4.0, Coil3 3.5.0, kotlinx-serialization 1.11.0,
  kotlinx-coroutines 1.11.0, benchmark-macro 1.4.1, activity-compose 1.13.0, lifecycle 2.11.0.
- **Smoke build** (`C:\Users\kees_\AppData\Local\agp-smoke`, a throwaway minimal app) →
  `BUILD SUCCESSFUL`, `app-debug.apk` produced. It uses the **corrected** AGP-9 plugin set
  (`com.android.application` + `kotlin.plugin.compose` + `kotlin.plugin.serialization`, **no**
  `kotlin.android`) and compiles a real `@Composable` and `@Serializable`. Keep it as a known-good
  reference for the corrected plugin block; it can be deleted any time.

---

## How the next session should proceed

1. **Restart the Claude harness** (or use the inline env snippet above) so the toolchain is on PATH.
2. Execute the plan with **subagent-driven-development** (opus 4.8 subagents), Task 1 → Task 10.
3. Apply the **kotlin.android removal** (top of this doc) when writing Task 1 and Task 10 build files —
   otherwise Task 1 Step 12 (`assembleDebug`) fails.
4. Task 1 Step 4: generate the wrapper from `native/` with the staged Gradle:
   `gradle wrapper --gradle-version 9.4.1` (then use `./gradlew`).
5. Run all gates for real:
   - Pure-JVM unit tests (Tasks 3/4/5/7): `./gradlew :app:testDebugUnitTest`
   - Builds (Tasks 1/2/6/7/8): `./gradlew :app:assembleDebug`
   - Instrumented tests (Task 9): start the AVD, then `./gradlew :app:connectedDebugAndroidTest`
     - Headless boot: `emulator -avd photos_pixel6_api34 -no-window -no-audio -no-snapshot -gpu swiftshader_indirect`
   - Macrobenchmark (Task 10): the `pixel6Api34` managed device image is already installed; the
     `aosp_atd` API 34 image is on disk so the managed-device run won't need to download it.
6. The 16 seed photos still live at `public/files/*.webp` (Task 4 Step 5 copies them into assets).

`native/` was wiped per decision; start it fresh from the plan.
