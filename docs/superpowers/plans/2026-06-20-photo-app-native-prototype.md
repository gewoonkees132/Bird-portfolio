# Native Android Photo App (Funding Prototype) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the native Android Kotlin/Compose funding prototype specified in [`docs/superpowers/specs/2026-06-20-photo-app-native-prototype-design.md`](../specs/2026-06-20-photo-app-native-prototype-design.md) — a zoomable density-tier Mosaic, a single-layer Living Plane, and a never-stuck Detail/Theatre, running on bundled photos, instrumented so "we hold 60fps" is a measured number.

**Architecture:** One Gradle module (`native/app`), MVVM with unidirectional data flow. Three seams drawn from day one: `PhotoSource` (data interface, `BundledAssetSource` now), `AppTheme` (guideline tokens as Compose), and one `LibraryViewModel`/`LibraryUiState` that `MosaicScreen` + `PlaneScreen` both render and `DetailOverlay` sits above. Pure logic (tier math, manifest parse, plane packing, ViewModel) is TDD'd; UI is built then guarded by instrumented Compose tests.

**Tech Stack:** Kotlin 2.3.21 · Jetpack Compose (BOM 2026.06.00, Material3 1.4.0) · Coil 3.5.0 (bundled `file:///android_asset`) · kotlinx-serialization 1.11.0 · AGP 9.2.0 / Gradle 9.4.1 / JDK 17 · Macrobenchmark + Baseline Profiles + JankStats. Package `com.keesleemeijer.photos`, Gradle root `native/`.

---

## How this plan was verified

Every version pin and API surface below was checked against current (mid-2026) docs by a fan-out of research agents, then a second adversarial pass that tried to *refute* the riskiest claims. Confirmed: the version matrix; `Modifier.animateItem()` (not the deprecated `animateItemPlacement`); `StaggeredGridItemSpan.FullLine`; `detectTransformGestures(centroid, pan, zoom, rotation)`; Coil 3 `file:///android_asset` loading; the Macrobenchmark/Baseline-Profile wiring. **One refutation applied:** shared-element transitions graduated to **stable** (animation 1.10.0-alpha05, Oct 2025), so `@OptIn(ExperimentalSharedTransitionApi::class)` is no longer required and is omitted here (`BackHandler`/`PredictiveBackHandler` confirmed current).

## Decisions taken (spec §10 + reconciliations)

- Landing tier **Overview**; canonical model = density snapping, **Living Plane secondary**; fun-fact behind **Read more**; **dark** theme only (light deferred); Plane dwell-snap + ambient dimming **deferred** (spec §10.6) — left as a marked stub.
- **Photo set:** the prototype is seeded with the **16 existing portfolio photos** (`public/files/*.webp`) so it runs end-to-end immediately; scaling to the curated ~80 is editing `assets/photos.json` + dropping files (spec §5 "expanding the demo is editing JSON"). Aspect mapping from the portfolio's shapes: `L→landscape`, `V→portrait`, `W→panorama`.
- **DRY reconciliations** (the research agents disagreed; canonical values chosen): Compose BOM `2026.06.00`; serialization `1.11.0`; activity-compose `1.13.0`; lifecycle `2.11.0`; a **single** `nextTier` in `domain/DensityTier.kt`; Application class `PhotosApp`, Compose root `LibraryRoot`; `PhotoTile`/`MosaicScreen` take **nullable** `SharedTransitionScope?`/`AnimatedVisibilityScope?` params (built plain in Task 6, morph switched on in Task 8 — no signature churn).

## File structure (created across the tasks)

```
native/
  settings.gradle.kts            gradle.properties           build.gradle.kts
  gradle/libs.versions.toml      gradle/wrapper/gradle-wrapper.properties
  app/
    build.gradle.kts   proguard-rules.pro
    src/main/AndroidManifest.xml
    src/main/assets/photos.json          src/main/assets/photos/*.webp   (16 seed)
    src/main/res/values/{themes,colors,strings}.xml
    src/main/res/mipmap-anydpi-v26/ic_launcher.xml  + drawable launcher vector
    src/main/java/com/keesleemeijer/photos/
      App.kt  MainActivity.kt
      domain/   Photo.kt (Photo, Aspect, ViewMode, PhotoSource)   DensityTier.kt (DensityTier, nextTier)
      data/     PhotoManifestParser.kt  BundledAssetSource.kt  AppContainer.kt
      ui/theme/ Color.kt  Tokens.kt  Type.kt  Shape.kt  Theme.kt
      ui/       LibraryUiState.kt  LibraryViewModel.kt  LibraryViewModelFactory.kt  LibraryRoot.kt  LibraryContent.kt
      ui/components/ PhotoTile.kt  DensityPill.kt  ModeToggle.kt
      ui/mosaic/     MosaicScreen.kt
      ui/plane/      PackPlane.kt  PlaneScreen.kt  PlaneTile.kt  ZoomControlPill.kt
      ui/detail/     DetailHost.kt  DetailOverlay.kt  DetailPhotoCard.kt  DetailParts.kt
    src/test/java/.../domain/NextTierTest.kt
    src/test/java/.../data/PhotoManifestParserTest.kt
    src/test/java/.../ui/LibraryViewModelTest.kt
    src/test/java/.../ui/plane/PackPlaneTest.kt
    src/androidTest/java/.../ui/LibraryDetailUiTest.kt  ColumnCountSemantics.kt
  macrobenchmark/
    build.gradle.kts
    src/main/java/.../macrobenchmark/{StartupBenchmark,FrameTimingBenchmark,BaselineProfileGenerator}.kt
```

> **Prerequisite:** Android Studio (Ladybug+ / AGP 9.2-compatible), JDK 17, an Android SDK with API 36 + Build-Tools 36.0.0, and an emulator or device (API 33+) for instrumented tests. Run all `./gradlew` commands from `native/`.

---

## Task 1: Project scaffold — a buildable, installable dark shell

**Files:**
- Create: `native/settings.gradle.kts`, `native/gradle.properties`, `native/build.gradle.kts`, `native/gradle/libs.versions.toml`, `native/gradle/wrapper/gradle-wrapper.properties`
- Create: `native/app/build.gradle.kts`, `native/app/proguard-rules.pro`
- Create: `native/app/src/main/AndroidManifest.xml`, `native/app/src/main/res/values/{themes,colors,strings}.xml`
- Create: `native/app/src/main/res/drawable/ic_launcher_foreground.xml`, `native/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt`

- [ ] **Step 1: Create the version catalog** `native/gradle/libs.versions.toml`

```toml
[versions]
agp = "9.2.0"
kotlin = "2.3.21"               # Compose-compiler & serialization plugins MUST equal this
compileSdk = "36"
targetSdk = "36"
minSdk = "33"                   # predictive-back (OnBackInvokedCallback) needs API 33+
composeBom = "2026.06.00"       # -> compose ui/foundation 1.11.3, material3 1.4.0
activityCompose = "1.13.0"
lifecycle = "2.11.0"
coreKtx = "1.17.0"
metricsPerformance = "1.0.0"    # JankStats
benchmark = "1.4.1"             # macrobenchmark + baselineprofile plugin
profileinstaller = "1.4.1"
coil = "3.5.0"
kotlinxSerialization = "1.11.0"
kotlinxCoroutines = "1.11.0"
junit = "4.13.2"
androidxTestExtJunit = "1.3.0"
espresso = "3.7.0"
uiautomator = "2.3.0"

[libraries]
compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
compose-ui = { group = "androidx.compose.ui", name = "ui" }
compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
compose-foundation = { group = "androidx.compose.foundation", name = "foundation" }
compose-material3 = { group = "androidx.compose.material3", name = "material3" }
compose-animation = { group = "androidx.compose.animation", name = "animation" }
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }
androidx-lifecycle-runtime-compose = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }
androidx-metrics-performance = { group = "androidx.metrics", name = "metrics-performance", version.ref = "metricsPerformance" }
androidx-profileinstaller = { group = "androidx.profileinstaller", name = "profileinstaller", version.ref = "profileinstaller" }
androidx-benchmark-macro = { group = "androidx.benchmark", name = "benchmark-macro-junit4", version.ref = "benchmark" }
androidx-uiautomator = { group = "androidx.test.uiautomator", name = "uiautomator", version.ref = "uiautomator" }
coil-compose = { group = "io.coil-kt.coil3", name = "coil-compose", version.ref = "coil" }
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerialization" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "kotlinxCoroutines" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
kotlinx-coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", version.ref = "kotlinxCoroutines" }
androidx-test-ext-junit = { group = "androidx.test.ext", name = "junit", version.ref = "androidxTestExtJunit" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espresso" }
compose-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
android-test = { id = "com.android.test", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
androidx-baselineprofile = { id = "androidx.baselineprofile", version.ref = "benchmark" }
```

- [ ] **Step 2: Create** `native/settings.gradle.kts`

```kotlin
pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "PhotosNative"
include(":app")
```

- [ ] **Step 3: Create** `native/gradle.properties`

```properties
org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8 -XX:+UseParallelGC
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true
android.useAndroidX=true
android.nonTransitiveRClass=true
android.enableR8.fullMode=true
kotlin.code.style=official
```

- [ ] **Step 4: Create** `native/gradle/wrapper/gradle-wrapper.properties`

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-9.4.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

Then generate the wrapper jar/scripts once (needs a local Gradle 9.4.1, or copy from another project): `gradle wrapper --gradle-version 9.4.1`. Expected: `native/gradlew`, `native/gradlew.bat`, `native/gradle/wrapper/gradle-wrapper.jar` appear.

- [ ] **Step 5: Create the root** `native/build.gradle.kts`

```kotlin
// Plugins declared here (apply false) so subprojects share one resolved version.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.androidx.baselineprofile) apply false
}
```

- [ ] **Step 6: Create the app module** `native/app/build.gradle.kts`

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.keesleemeijer.photos"
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        applicationId = "com.keesleemeijer.photos"
        minSdk = libs.versions.minSdk.get().toInt()
        targetSdk = libs.versions.targetSdk.get().toInt()
        versionCode = 1
        versionName = "0.1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }
    }

    buildTypes {
        debug { applicationIdSuffix = ".debug"; isMinifyEnabled = false }
        release {
            isMinifyEnabled = true       // R8
            isShrinkResources = true     // requires isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("debug") // prototype builds without a keystore
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }

    buildFeatures { compose = true; buildConfig = true }

    packaging {
        resources {
            excludes += setOf(
                "/META-INF/{AL2.0,LGPL2.1}", "/META-INF/DEPENDENCIES", "/META-INF/LICENSE*",
                "/META-INF/NOTICE*", "/META-INF/*.kotlin_module", "DebugProbesKt.bin",
            )
        }
    }
}

dependencies {
    val composeBom = platform(libs.compose.bom)
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.foundation)
    implementation(libs.compose.material3)
    implementation(libs.compose.animation)

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    implementation(libs.coil.compose)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    implementation(libs.androidx.metrics.performance)   // JankStats (wired in Task 10)
    implementation(libs.androidx.profileinstaller)      // baseline profile installer (Task 10)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)

    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.compose.ui.test.junit4)
    debugImplementation(libs.compose.ui.tooling)
    debugImplementation(libs.compose.ui.test.manifest)
}
```

- [ ] **Step 7: Create** `native/app/proguard-rules.pro` (keep rules so R8 release builds don't strip serializers)

```proguard
# kotlinx-serialization: keep generated serializers for @Serializable classes.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class **$$serializer { *; }
-keepclasseswithmembers class com.keesleemeijer.photos.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.keesleemeijer.photos.**$$serializer { *; }
# Coil 3 uses ServiceLoader-registered fetchers/decoders.
-keep class coil3.** { *; }
```

- [ ] **Step 8: Create resources** — `native/app/src/main/res/values/colors.xml`, `strings.xml`, `themes.xml`

```xml
<!-- colors.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="canvas">#161616</color> <!-- guideline §4.1 --canvas -->
    <color name="cobalt">#1635EE</color>
</resources>
```
```xml
<!-- strings.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Photos</string>
</resources>
```
```xml
<!-- themes.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Photos" parent="android:Theme.Material.NoActionBar">
        <item name="android:windowBackground">@color/canvas</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
```

- [ ] **Step 9: Create a buildable launcher icon** (no binary assets) — `native/app/src/main/res/drawable/ic_launcher_foreground.xml`

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#1635EE" android:pathData="M54,38a16,16 0 1,0 0.01,0z" />
</vector>
```
And `native/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/canvas" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
```

- [ ] **Step 10: Create** `native/app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Prototype is fully offline: photos are bundled in assets/. No permissions. -->
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:enableOnBackInvokedCallback="true"
        android:theme="@style/Theme.Photos">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|uiMode|density|smallestScreenSize"
            android:theme="@style/Theme.Photos">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

- [ ] **Step 11: Create a minimal** `native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt`

```kotlin
package com.keesleemeijer.photos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { Root() }
    }
}

// Replaced in Task 2 (AppTheme) and Task 6 (LibraryRoot). For now: a dark canvas.
@Composable
private fun Root() {
    Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF161616)) {}
}
```

- [ ] **Step 12: Build and install — verify the shell runs**

Run: `./gradlew :app:assembleDebug`
Expected: `BUILD SUCCESSFUL`. Then `./gradlew :app:installDebug` (with an emulator/device running) and launch "Photos"; expected: a solid dark `#161616` screen, edge-to-edge.

- [ ] **Step 13: Commit**

```bash
git add native/
git commit -m "feat(native): scaffold Android Compose module — buildable dark shell"
```

---

## Task 2: AppTheme — guideline tokens as Compose (SEAM #2)

**Files:**
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/theme/Color.kt`, `Tokens.kt`, `Type.kt`, `Shape.kt`, `Theme.kt`
- Modify: `native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt`

- [ ] **Step 1: Create** `ui/theme/Color.kt` — the single source of hue (guideline §3/§4.1)

```kotlin
package com.keesleemeijer.photos.ui.theme

import androidx.compose.ui.graphics.Color

// brand (fixed, guideline §3)
val Blue = Color(0xFF1635EE)        // cobalt — the only chromatic UI color
val BlueLift = Color(0xFF4D63FF)    // cobalt lifted for legibility + glow on dark
val Field = Color(0xFFF2EEE5)
val Charcoal = Color(0xFF1A1A1A)
// dark surfaces (guideline §4.1)
val Canvas = Color(0xFF161616)
val Panel = Color.White.copy(alpha = 0.055f)
val Hairline = Color.White.copy(alpha = 0.12f)
// ink on dark
val InkOnDark = Color.White
val InkMuted = Color.White.copy(alpha = 0.60f)
val InkFaint = Color.White.copy(alpha = 0.40f)
val OnBlue = Color.White
```

- [ ] **Step 2: Create** `ui/theme/Tokens.kt` — `AppTokens` + `LocalAppTokens` (the non-Material values)

```kotlin
package com.keesleemeijer.photos.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class AppTokens(
    val colors: AppColors,
    val radii: AppRadii,
    val elevation: AppElevation,
    val motion: AppMotion,
    val spacing: AppSpacing,
)

@Immutable
data class AppColors(
    val canvas: Color = Canvas,
    val panel: Color = Panel,
    val hairline: Color = Hairline,
    val accent: Color = Blue,
    val accentLift: Color = BlueLift,
    val onAccent: Color = OnBlue,
    val ink: Color = InkOnDark,
    val inkMuted: Color = InkMuted,
    val inkFaint: Color = InkFaint,
    val field: Color = Field,
)

@Immutable
data class AppRadii(val tile: Dp = 22.dp, val card: Dp = 24.dp, val pill: Dp = 999.dp)

@Immutable
data class ShadowSpec(
    val offsetX: Dp, val offsetY: Dp, val blur: Dp, val color: Color,
    val ring: Color = Color.Unspecified,
)

@Immutable
data class AppElevation(
    val tile: ShadowSpec = ShadowSpec(0.dp, 6.dp, 18.dp, Color.Black.copy(alpha = 0.42f)),
    val card: ShadowSpec = ShadowSpec(0.dp, 14.dp, 34.dp, Color.Black.copy(alpha = 0.50f), ring = Color.White.copy(alpha = 0.05f)),
    val detail: ShadowSpec = ShadowSpec(0.dp, 22.dp, 54.dp, Color.Black.copy(alpha = 0.60f)),
)

@Immutable
data class AppMotion(
    val softEase: Easing = CubicBezierEasing(0.2f, 0f, 0f, 1f),
    val densitySnapMillis: Int = 280,
    val detailMillis: Int = 300,
    val scrollRevealMillis: Int = 240,
    val microMillis: Int = 150,
) {
    fun <T> densitySnap(): FiniteAnimationSpec<T> = tween(densitySnapMillis, easing = softEase)
    fun <T> detail(): FiniteAnimationSpec<T> = tween(detailMillis, easing = softEase)
    fun <T> scrollReveal(): FiniteAnimationSpec<T> = tween(scrollRevealMillis, easing = LinearOutSlowInEasing)
    fun <T> micro(): FiniteAnimationSpec<T> = tween(microMillis, easing = FastOutSlowInEasing)
}

@Immutable
data class AppSpacing(
    val xs: Dp = 4.dp, val s: Dp = 8.dp, val m: Dp = 12.dp, val l: Dp = 16.dp,
    val xl: Dp = 24.dp, val xxl: Dp = 32.dp, val xxxl: Dp = 48.dp, val huge: Dp = 64.dp,
    val edgeGutter: Dp = 14.dp, val tileGap: Dp = 8.dp, val detailPadding: Dp = 19.dp,
)

val LocalAppTokens = staticCompositionLocalOf {
    AppTokens(AppColors(), AppRadii(), AppElevation(), AppMotion(), AppSpacing())
}
```

- [ ] **Step 3: Create** `ui/theme/Type.kt` — two families, sizes from guideline §4.2

```kotlin
package com.keesleemeijer.photos.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp

// Prototype falls back to system fonts; structured so a bundled face (res/font) drops in unchanged.
val Grotesque: FontFamily = FontFamily.SansSerif
val InstrumentMono: FontFamily = FontFamily.Monospace

private val TrackTight = (-0.02).em
private val TrackSnug = (-0.01).em
private val TrackLabel = 0.13.em

val AppTypography: Typography = Typography(
    displayLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 40.sp, lineHeight = 44.sp, letterSpacing = TrackTight),
    headlineLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 28.sp, lineHeight = 32.sp, letterSpacing = TrackTight),
    headlineMedium = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 23.sp, lineHeight = 28.sp, letterSpacing = TrackTight),
    titleLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 20.sp, lineHeight = 24.sp, letterSpacing = TrackSnug),
    titleMedium = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.SemiBold, fontSize = 18.sp, lineHeight = 22.sp, letterSpacing = TrackSnug),
    labelLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 12.sp, lineHeight = 14.sp, letterSpacing = TrackSnug),
    bodyLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Light, fontStyle = FontStyle.Italic, fontSize = 15.sp, lineHeight = 20.sp, letterSpacing = 0.em),
    bodyMedium = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 22.sp, letterSpacing = 0.em),
    labelMedium = TextStyle(fontFamily = InstrumentMono, fontWeight = FontWeight.Medium, fontSize = 11.sp, lineHeight = 14.sp, letterSpacing = TrackLabel),
    labelSmall = TextStyle(fontFamily = InstrumentMono, fontWeight = FontWeight.Medium, fontSize = 10.sp, lineHeight = 12.sp, letterSpacing = TrackLabel),
)
```

- [ ] **Step 4: Create** `ui/theme/Shape.kt`

```kotlin
package com.keesleemeijer.photos.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val AppShapes: Shapes = Shapes(
    extraSmall = RoundedCornerShape(12.dp),
    small = RoundedCornerShape(22.dp),   // r-tile
    medium = RoundedCornerShape(24.dp),  // r-card
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(percent = 50), // r-pill
)
```

- [ ] **Step 5: Create** `ui/theme/Theme.kt` — `AppTheme` + the `AppTheme.tokens` accessor

```kotlin
package com.keesleemeijer.photos.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember

private val DarkColors: ColorScheme = darkColorScheme(
    primary = BlueLift, onPrimary = OnBlue, primaryContainer = BlueLift, onPrimaryContainer = OnBlue,
    secondary = InkMuted, onSecondary = Charcoal, tertiary = BlueLift, onTertiary = OnBlue,
    background = Canvas, onBackground = InkOnDark, surface = Canvas, onSurface = InkOnDark,
    surfaceVariant = Panel, onSurfaceVariant = InkMuted,
    surfaceContainerLowest = Canvas, surfaceContainerLow = Canvas, surfaceContainer = Panel,
    surfaceContainerHigh = Panel, surfaceContainerHighest = Panel,
    outline = Hairline, outlineVariant = Hairline, scrim = Charcoal,
    inverseSurface = Field, inverseOnSurface = Charcoal,
)

private val DarkTokens: AppTokens = AppTokens(AppColors(), AppRadii(), AppElevation(), AppMotion(), AppSpacing())

@Composable
fun AppTheme(darkTheme: Boolean = true, content: @Composable () -> Unit) {
    val tokens = remember(darkTheme) { DarkTokens } // light deferred (spec §10)
    CompositionLocalProvider(LocalAppTokens provides tokens) {
        MaterialTheme(colorScheme = DarkColors, typography = AppTypography, shapes = AppShapes, content = content)
    }
}

object AppTheme {
    val tokens: AppTokens
        @Composable @ReadOnlyComposable get() = LocalAppTokens.current
}
```

- [ ] **Step 6: Wrap the shell in `AppTheme`** — replace the `Root()` body in `MainActivity.kt`

```kotlin
import com.keesleemeijer.photos.ui.theme.AppTheme

@Composable
private fun Root() {
    AppTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = AppTheme.tokens.colors.canvas) {}
    }
}
```

- [ ] **Step 7: Build to verify the theme compiles and provides**

Run: `./gradlew :app:assembleDebug`
Expected: `BUILD SUCCESSFUL` (still a dark screen at runtime; the theme is now wired for later screens).

- [ ] **Step 8: Commit**

```bash
git add native/app/src/main/java/com/keesleemeijer/photos/ui/theme native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt
git commit -m "feat(native): AppTheme — guideline tokens, dark scheme, type, shapes (SEAM #2)"
```

---

## Task 3: Domain model + tier math (TDD)

**Files:**
- Create: `native/app/src/main/java/com/keesleemeijer/photos/domain/Photo.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/domain/DensityTier.kt`
- Test: `native/app/src/test/java/com/keesleemeijer/photos/domain/NextTierTest.kt`

> `nextTier` is the one piece of mosaic logic with real branching; it lives in `domain/` (no Android, no Compose) and is the **single** definition (the ViewModel imports it). Written test-first per spec §9.

- [ ] **Step 1: Write the failing test** `domain/NextTierTest.kt`

```kotlin
package com.keesleemeijer.photos.domain

import org.junit.Assert.assertEquals
import org.junit.Test

/** Exhaustive table for the pure tier function (spec §9). Thresholds: 0.8 (denser) / 1.25 (sparser). */
class NextTierTest {
    @Test fun pinchIn_fromFeature_goesToBrowse() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Feature, 0.7f))
    @Test fun pinchIn_fromBrowse_goesToOverview() = assertEquals(DensityTier.Overview, nextTier(DensityTier.Browse, 0.5f))
    @Test fun pinchIn_fromOverview_clampsAtOverview() = assertEquals(DensityTier.Overview, nextTier(DensityTier.Overview, 0.3f))
    @Test fun pinchOut_fromOverview_goesToBrowse() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Overview, 1.3f))
    @Test fun pinchOut_fromBrowse_goesToFeature() = assertEquals(DensityTier.Feature, nextTier(DensityTier.Browse, 2.0f))
    @Test fun pinchOut_fromFeature_clampsAtFeature() = assertEquals(DensityTier.Feature, nextTier(DensityTier.Feature, 3.0f))
    @Test fun deadZone_overview() = assertEquals(DensityTier.Overview, nextTier(DensityTier.Overview, 1.0f))
    @Test fun deadZone_browse() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Browse, 1.1f))
    @Test fun deadZone_feature() = assertEquals(DensityTier.Feature, nextTier(DensityTier.Feature, 0.9f))
    @Test fun lowerThresholdExact_isDeadZone() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Browse, 0.8f))
    @Test fun upperThresholdExact_isDeadZone() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Browse, 1.25f))
}
```

- [ ] **Step 2: Run it to confirm it fails to compile**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.domain.NextTierTest"`
Expected: FAIL — `Unresolved reference: DensityTier` / `nextTier`.

- [ ] **Step 3: Implement** `domain/DensityTier.kt`

```kotlin
package com.keesleemeijer.photos.domain

/** Three snapped density tiers (spec §5 / guideline §6). Ordinal order is DENSEST first. */
enum class DensityTier(val columns: Int) {
    Overview(3), // see ALL  — code chip only
    Browse(2),   // see SOME — name + code
    Feature(1),  // see ONE  — name + latin + code
}

private const val DENSER_THRESHOLD = 0.8f
private const val SPARSER_THRESHOLD = 1.25f

/**
 * Pure tier math (spec §7.1/§9). Maps a settled cumulative pinch scale to the tier to snap to:
 * <0.8 ⇒ one tier denser (toward Overview); >1.25 ⇒ one tier sparser (toward Feature);
 * in between ⇒ unchanged. Rubber-bands at the extremes (clamp, no hard wall). Side-effect-free.
 */
fun nextTier(current: DensityTier, cumulativeScale: Float): DensityTier {
    val entries = DensityTier.entries
    val index = current.ordinal
    return when {
        cumulativeScale < DENSER_THRESHOLD -> entries[(index - 1).coerceAtLeast(0)]
        cumulativeScale > SPARSER_THRESHOLD -> entries[(index + 1).coerceAtMost(entries.lastIndex)]
        else -> current
    }
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.domain.NextTierTest"`
Expected: PASS (11 tests).

- [ ] **Step 5: Create the rest of the domain model** `domain/Photo.kt` (verbatim spec §5)

```kotlin
package com.keesleemeijer.photos.domain

import java.time.LocalDate

data class Photo(
    val id: String,            // "P5"
    val assetPath: String,     // "photos/P5-Green_Bee-eater.webp"
    val name: String,          // "Green Bee-eater"
    val latin: String?,        // quiet secondary line; null for generic photos
    val aspect: Aspect,        // drives staggered-grid height + panorama spans
    val takenAt: LocalDate?,   // future date-sectioning (EXIF in the product)
    val vitals: Map<String, String>?, // range·size·diet — null-safe
    val fact: String?,         // the Detail lede
)

enum class Aspect(val ratio: Float) { Landscape(1.5f), Portrait(0.667f), Panorama(2.333f) }

enum class ViewMode { Mosaic, Plane }

interface PhotoSource { suspend fun photos(): List<Photo> }
```

> `java.time.LocalDate` is available from API 26; `minSdk 33` needs no desugaring.

- [ ] **Step 6: Commit**

```bash
git add native/app/src/main/java/com/keesleemeijer/photos/domain native/app/src/test/java/com/keesleemeijer/photos/domain
git commit -m "feat(native): domain model + pure tier math (TDD)"
```

---

## Task 4: Data layer — manifest parser (TDD), bundled assets, Coil (SEAM #1)

**Files:**
- Create: `native/app/src/main/java/com/keesleemeijer/photos/data/PhotoManifestParser.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/data/BundledAssetSource.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/data/AppContainer.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/App.kt`
- Create: `native/app/src/main/assets/photos.json` and copy 16 webp into `native/app/src/main/assets/photos/`
- Modify: `native/app/src/main/AndroidManifest.xml` (register `PhotosApp`)
- Test: `native/app/src/test/java/com/keesleemeijer/photos/data/PhotoManifestParserTest.kt`

- [ ] **Step 1: Write the failing parser test** `data/PhotoManifestParserTest.kt`

```kotlin
package com.keesleemeijer.photos.data

import com.keesleemeijer.photos.domain.Aspect
import kotlinx.serialization.SerializationException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class PhotoManifestParserTest {

    @Test fun parses_a_full_record() {
        val json = """
            {"photos":[{"id":"P5","assetPath":"photos/P5-Green_Bee-eater.webp","name":"Green Bee-eater",
            "latin":"Merops orientalis","aspect":"landscape","takenAt":"2024-05-10",
            "vitals":{"range":"S & SE Asia","size":"29-30 cm"},"fact":"Hawks bees in mid-air."}]}
        """.trimIndent()
        val photos = PhotoManifestParser.parse(json)
        assertEquals(1, photos.size)
        val p = photos.first()
        assertEquals("P5", p.id)
        assertEquals(Aspect.Landscape, p.aspect)
        assertEquals("Merops orientalis", p.latin)
        assertEquals("S & SE Asia", p.vitals?.get("range"))
        assertEquals(2024, p.takenAt?.year)
    }

    @Test fun omitted_optionals_decode_to_null() {
        val json = """{"photos":[{"id":"P1","assetPath":"photos/P1.webp","name":"Robin","aspect":"portrait"}]}"""
        val p = PhotoManifestParser.parse(json).first()
        assertNull(p.latin); assertNull(p.takenAt); assertNull(p.vitals); assertNull(p.fact)
        assertEquals(Aspect.Portrait, p.aspect)
    }

    @Test(expected = SerializationException::class)
    fun missing_required_field_throws() {
        // no assetPath -> MissingFieldException (a SerializationException).
        PhotoManifestParser.parse("""{"photos":[{"id":"P1","name":"Robin","aspect":"portrait"}]}""")
    }
}
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.data.PhotoManifestParserTest"`
Expected: FAIL — `Unresolved reference: PhotoManifestParser`.

- [ ] **Step 3: Implement** `data/PhotoManifestParser.kt` (pure JVM — no Android)

```kotlin
package com.keesleemeijer.photos.data

import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.Photo
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.time.LocalDate

@Serializable private data class PhotoManifestDto(val photos: List<PhotoDto>)

@Serializable private data class PhotoDto(
    val id: String,
    val assetPath: String,
    val name: String,
    val latin: String? = null,
    val aspect: AspectDto,
    val takenAt: String? = null,
    val vitals: Map<String, String>? = null,
    val fact: String? = null,
)

@Serializable private enum class AspectDto {
    @SerialName("landscape") Landscape,
    @SerialName("portrait") Portrait,
    @SerialName("panorama") Panorama,
}

/** Manifest JSON -> domain. PURE: same string in, same list out — unit-tested first (spec §9). */
object PhotoManifestParser {
    private val json = Json {
        ignoreUnknownKeys = true   // manifest format can grow
        explicitNulls = false      // omitted optional == null
    }

    fun parse(manifestJson: String): List<Photo> =
        json.decodeFromString(PhotoManifestDto.serializer(), manifestJson).photos.map(::toDomain)

    private fun toDomain(d: PhotoDto): Photo = Photo(
        id = d.id,
        assetPath = d.assetPath,
        name = d.name,
        latin = d.latin,
        aspect = when (d.aspect) {
            AspectDto.Landscape -> Aspect.Landscape
            AspectDto.Portrait -> Aspect.Portrait
            AspectDto.Panorama -> Aspect.Panorama
        },
        takenAt = d.takenAt?.let(LocalDate::parse),
        vitals = d.vitals,
        fact = d.fact,
    )
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.data.PhotoManifestParserTest"`
Expected: PASS (3 tests).

- [ ] **Step 5: Copy the 16 seed photos into assets** (code-only; never open the webp)

```bash
mkdir -p native/app/src/main/assets/photos
cp public/files/*.webp native/app/src/main/assets/photos/
```
Expected: 16 files (`P1-European_Robin.webp` … `P16-European_Robin.webp`) in `native/app/src/main/assets/photos/`.

- [ ] **Step 6: Create the seed manifest** `native/app/src/main/assets/photos.json`

> Derived from `public/app.js` (`SPECIES` + `BIRD_FACTS`). Shapes map `L→landscape`, `V→portrait`, `W→panorama`. `fact` = the species lede; `vitals` carries the real wingspan/weight/range/habitat.

```json
{
  "photos": [
    { "id": "P1", "assetPath": "photos/P1-European_Robin.webp", "name": "European Robin", "latin": "Erithacus rubecula", "aspect": "landscape", "vitals": { "wingspan": "20-22 cm", "weight": "16-22 g", "range": "Europe, N Africa", "habitat": "Woodland, gardens" }, "fact": "The European Robin holds its patch of garden all year, and will sing through winter nights under a streetlight. The orange breast is a flag. Show it to a rival and he reads a threat, not a bird." },
    { "id": "P2", "assetPath": "photos/P2-Weaver_Bird.webp", "name": "Weaver Bird", "latin": "Ploceus cucullatus", "aspect": "portrait", "vitals": { "wingspan": "24-28 cm", "weight": "30-45 g", "range": "Sub-Saharan Africa", "habitat": "Savanna, villages" }, "fact": "A male Village Weaver is a builder who works for an audience. He strips long green strips from leaves and knots them into a hanging pouch, then hangs upside down beneath it and fans his wings for a female to inspect his work." },
    { "id": "P3", "assetPath": "photos/P3-Eurasian_Jay.webp", "name": "Eurasian Jay", "latin": "Garrulus glandarius", "aspect": "landscape", "vitals": { "wingspan": "52-58 cm", "weight": "140-190 g", "range": "Europe, Asia", "habitat": "Oak woodland" }, "fact": "The Eurasian Jay is a shy crow of the oak woods, easier to hear than to see. The give-away is the wing flash, a panel of bright sky-blue barred with black, lit up for a second as the bird crosses a clearing." },
    { "id": "P4", "assetPath": "photos/P4-Dunnock.webp", "name": "Dunnock", "latin": "Prunella modularis", "aspect": "panorama", "vitals": { "wingspan": "19-21 cm", "weight": "19-24 g", "range": "Europe, W Asia", "habitat": "Hedgerows, gardens" }, "fact": "The Dunnock is the brown bird most people walk straight past. It shuffles under the hedge like a mouse with feathers, picking tiny seeds and insects from the leaf litter, the song a thin hurried warble from a low branch." },
    { "id": "P5", "assetPath": "photos/P5-Green_Bee-eater.webp", "name": "Green Bee-eater", "latin": "Merops orientalis", "aspect": "landscape", "vitals": { "wingspan": "29-30 cm", "weight": "15-20 g", "range": "S & SE Asia", "habitat": "Open scrub" }, "fact": "The Green Bee-eater is a small jewel of dry, open country, bright green with a long pair of tail streamers. It hunts from a bare twig, darts out to grab a bee in the air, and carries it back to the same perch." },
    { "id": "P6", "assetPath": "photos/P6-Weaver_Bird_flapping.webp", "name": "Weaver Bird", "latin": "Ploceus cucullatus", "aspect": "portrait", "vitals": { "wingspan": "24-28 cm", "weight": "30-45 g", "range": "Sub-Saharan Africa", "habitat": "Savanna, villages" }, "fact": "A Village Weaver in flight is a quick, bouncing shape against the sky, wings beating in short bursts. Birds pour from the colony tree at dawn and again in the late afternoon, all heading the same way, like workers leaving for a shift." },
    { "id": "P7", "assetPath": "photos/P7-Great_Tit.webp", "name": "Great Tit", "latin": "Parus major", "aspect": "landscape", "vitals": { "wingspan": "22-26 cm", "weight": "14-22 g", "range": "Europe, Asia, N Africa", "habitat": "Woodland, gardens" }, "fact": "The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries." },
    { "id": "P8", "assetPath": "photos/P8-Lark.webp", "name": "Lark", "latin": "Alauda arvensis", "aspect": "panorama", "vitals": { "wingspan": "30-36 cm", "weight": "33-45 g", "range": "Europe, Asia, N Africa", "habitat": "Open farmland" }, "fact": "The Eurasian Skylark is a small brown bird of open farmland with one big trick. The male climbs almost out of sight on whirring wings, then hangs there and pours out a long, bubbling song over the field below." },
    { "id": "P9", "assetPath": "photos/P9-Great_Tit.webp", "name": "Great Tit", "latin": "Parus major", "aspect": "landscape", "vitals": { "wingspan": "22-26 cm", "weight": "14-22 g", "range": "Europe, Asia, N Africa", "habitat": "Woodland, gardens" }, "fact": "The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries." },
    { "id": "P10", "assetPath": "photos/P10-Great_Tit.webp", "name": "Great Tit", "latin": "Parus major", "aspect": "landscape", "vitals": { "wingspan": "22-26 cm", "weight": "14-22 g", "range": "Europe, Asia, N Africa", "habitat": "Woodland, gardens" }, "fact": "The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries." },
    { "id": "P11", "assetPath": "photos/P11-Great_Tit.webp", "name": "Great Tit", "latin": "Parus major", "aspect": "landscape", "vitals": { "wingspan": "22-26 cm", "weight": "14-22 g", "range": "Europe, Asia, N Africa", "habitat": "Woodland, gardens" }, "fact": "The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries." },
    { "id": "P12", "assetPath": "photos/P12-Great_Tit.webp", "name": "Great Tit", "latin": "Parus major", "aspect": "landscape", "vitals": { "wingspan": "22-26 cm", "weight": "14-22 g", "range": "Europe, Asia, N Africa", "habitat": "Woodland, gardens" }, "fact": "The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries." },
    { "id": "P13", "assetPath": "photos/P13-Great_Tit.webp", "name": "Great Tit", "latin": "Parus major", "aspect": "portrait", "vitals": { "wingspan": "22-26 cm", "weight": "14-22 g", "range": "Europe, Asia, N Africa", "habitat": "Woodland, gardens" }, "fact": "The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries." },
    { "id": "P14", "assetPath": "photos/P14-European_Robin.webp", "name": "European Robin", "latin": "Erithacus rubecula", "aspect": "landscape", "vitals": { "wingspan": "20-22 cm", "weight": "16-22 g", "range": "Europe, N Africa", "habitat": "Woodland, gardens" }, "fact": "The European Robin holds its patch of garden all year, and will sing through winter nights under a streetlight. The orange breast is a flag. Show it to a rival and he reads a threat, not a bird." },
    { "id": "P15", "assetPath": "photos/P15-European_Robin.webp", "name": "European Robin", "latin": "Erithacus rubecula", "aspect": "landscape", "vitals": { "wingspan": "20-22 cm", "weight": "16-22 g", "range": "Europe, N Africa", "habitat": "Woodland, gardens" }, "fact": "The European Robin holds its patch of garden all year, and will sing through winter nights under a streetlight. The orange breast is a flag. Show it to a rival and he reads a threat, not a bird." },
    { "id": "P16", "assetPath": "photos/P16-European_Robin.webp", "name": "European Robin", "latin": "Erithacus rubecula", "aspect": "portrait", "vitals": { "wingspan": "20-22 cm", "weight": "16-22 g", "range": "Europe, N Africa", "habitat": "Woodland, gardens" }, "fact": "The European Robin holds its patch of garden all year, and will sing through winter nights under a streetlight. The orange breast is a flag. Show it to a rival and he reads a threat, not a bird." }
  ]
}
```

- [ ] **Step 7: Implement** `data/BundledAssetSource.kt`

```kotlin
package com.keesleemeijer.photos.data

import android.content.Context
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.PhotoSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** SEAM #1 — the prototype's only PhotoSource. Reads assets/photos.json, delegates to the pure parser. */
class BundledAssetSource(private val context: Context) : PhotoSource {
    override suspend fun photos(): List<Photo> = withContext(Dispatchers.IO) {
        val manifestJson = context.assets.open("photos.json").use { it.readBytes().decodeToString() }
        PhotoManifestParser.parse(manifestJson)
    }
}
```

- [ ] **Step 8: Implement** `data/AppContainer.kt` — manual DI (Coil loader + source)

```kotlin
package com.keesleemeijer.photos.data

import android.content.Context
import coil3.ImageLoader
import coil3.disk.DiskCache
import coil3.disk.directory
import coil3.memory.MemoryCache
import coil3.request.crossfade
import com.keesleemeijer.photos.domain.PhotoSource

/** Light manual DI (Hilt deferred, spec §4). Built once in PhotosApp. */
class AppContainer(context: Context) {
    private val appContext = context.applicationContext

    /** Swap to MediaStoreSource / ImmichSource later with zero UI change. */
    val photoSource: PhotoSource = BundledAssetSource(appContext)

    val imageLoader: ImageLoader = ImageLoader.Builder(appContext)
        .crossfade(true)
        .memoryCache { MemoryCache.Builder().maxSizePercent(appContext, 0.25).build() }
        .diskCache {
            DiskCache.Builder()
                .directory(appContext.cacheDir.resolve("image_cache"))
                .maxSizePercent(0.02)
                .build()
        }
        .build()
}
```

- [ ] **Step 9: Implement** `App.kt` — custom Application + Coil singleton

```kotlin
package com.keesleemeijer.photos

import android.app.Application
import coil3.ImageLoader
import coil3.PlatformContext
import coil3.SingletonImageLoader
import com.keesleemeijer.photos.data.AppContainer

/** Owns AppContainer for the process and feeds Coil's singleton from it. Registered in the manifest. */
class PhotosApp : Application(), SingletonImageLoader.Factory {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }

    override fun newImageLoader(context: PlatformContext): ImageLoader = container.imageLoader
}
```

- [ ] **Step 10: Register the Application** — in the `AndroidManifest.xml` from Task 1, insert one attribute as the first line of the `<application>` tag (everything else in that tag stays exactly as written in Task 1, Step 10):

```xml
    <application
        android:name=".PhotosApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:enableOnBackInvokedCallback="true"
        android:theme="@style/Theme.Photos">
```

- [ ] **Step 11: Verify everything still builds**

Run: `./gradlew :app:testDebugUnitTest :app:assembleDebug`
Expected: `BUILD SUCCESSFUL`; the parser tests pass; the apk now bundles the 16 photos + manifest.

- [ ] **Step 12: Commit**

```bash
git add native/app/src/main/java/com/keesleemeijer/photos/data native/app/src/main/java/com/keesleemeijer/photos/App.kt native/app/src/main/assets native/app/src/main/AndroidManifest.xml native/app/src/test/java/com/keesleemeijer/photos/data
git commit -m "feat(native): data layer — manifest parser (TDD), BundledAssetSource, Coil, 16 seed photos (SEAM #1)"
```

---

## Task 5: LibraryViewModel + state (TDD, SEAM #3)

**Files:**
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/LibraryUiState.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/LibraryViewModel.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/LibraryViewModelFactory.kt`
- Test: `native/app/src/test/java/com/keesleemeijer/photos/ui/LibraryViewModelTest.kt`

- [ ] **Step 1: Write the failing test** `ui/LibraryViewModelTest.kt`

```kotlin
package com.keesleemeijer.photos.ui

import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.PhotoSource
import com.keesleemeijer.photos.domain.ViewMode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

private class FakePhotoSource(private val data: List<Photo>) : PhotoSource {
    override suspend fun photos(): List<Photo> = data
}

private fun photo(id: String) = Photo(id, "photos/$id.webp", "Photo $id", null, Aspect.Landscape, null, null, null)

@OptIn(ExperimentalCoroutinesApi::class)
class LibraryViewModelTest {
    private val dispatcher = StandardTestDispatcher()
    private val sample = listOf(photo("P1"), photo("P2"), photo("P3"))

    @Before fun setUp() = Dispatchers.setMain(dispatcher)
    @After fun tearDown() = Dispatchers.resetMain()
    private fun newVm() = LibraryViewModel(FakePhotoSource(sample))

    @Test fun photos_load_into_state() = runTest {
        val vm = newVm()
        assertTrue(vm.uiState.value.isLoading)
        advanceUntilIdle()
        assertEquals(sample, vm.uiState.value.photos)
        assertFalse(vm.uiState.value.isLoading)
    }

    @Test fun onTileTap_focuses_and_opens_detail() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[1])
        assertSame(sample[1], vm.uiState.value.focused)
        assertTrue(vm.uiState.value.detailOpen)
    }

    @Test fun onModeToggle_flips_mode_but_keeps_focused() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[0])
        assertEquals(ViewMode.Mosaic, vm.uiState.value.mode)
        vm.onModeToggle()
        assertEquals(ViewMode.Plane, vm.uiState.value.mode)
        assertSame(sample[0], vm.uiState.value.focused) // focus survives the switch (spec §6.4)
    }

    @Test fun close_clears_detailOpen_but_keeps_focus() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[0]); assertTrue(vm.uiState.value.detailOpen)
        vm.close(); assertFalse(vm.uiState.value.detailOpen)
        assertSame(sample[0], vm.uiState.value.focused)
    }

    @Test fun onPinchSettle_steps_tier_via_nextTier() = runTest {
        val vm = newVm(); advanceUntilIdle()
        assertEquals(DensityTier.Overview, vm.uiState.value.tier)
        vm.onPinchSettle(2.0f); assertEquals(DensityTier.Browse, vm.uiState.value.tier)
        vm.onPinchSettle(2.0f); assertEquals(DensityTier.Feature, vm.uiState.value.tier)
        vm.onPinchSettle(2.0f); assertEquals(DensityTier.Feature, vm.uiState.value.tier) // rubber-band
        vm.onPinchSettle(0.5f); assertEquals(DensityTier.Browse, vm.uiState.value.tier)
    }

    @Test fun selectTier_sets_tier_directly() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.selectTier(DensityTier.Feature)
        assertEquals(DensityTier.Feature, vm.uiState.value.tier)
    }

    @Test fun onDetailPage_moves_focus_to_index() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[0])
        vm.onDetailPage(2)
        assertSame(sample[2], vm.uiState.value.focused)
    }
}
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.ui.LibraryViewModelTest"`
Expected: FAIL — `Unresolved reference: LibraryViewModel`.

- [ ] **Step 3: Implement** `ui/LibraryUiState.kt`

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.runtime.Immutable
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.ViewMode

/** Single source of truth (SEAM #3). MosaicScreen/PlaneScreen read [mode]; DetailOverlay reads [focused]+[detailOpen]. */
@Immutable
data class LibraryUiState(
    val photos: List<Photo> = emptyList(),
    val mode: ViewMode = ViewMode.Mosaic,
    val tier: DensityTier = DensityTier.Overview,
    val focused: Photo? = null,
    val detailOpen: Boolean = false,
    val isLoading: Boolean = true,
) {
    /** Index of [focused] in [photos]; -1 when none. Drives Detail paging. */
    val focusedIndex: Int get() = focused?.let { f -> photos.indexOfFirst { it.id == f.id } } ?: -1
}
```

- [ ] **Step 4: Implement** `ui/LibraryViewModel.kt` (imports the single `nextTier` from `domain`)

```kotlin
package com.keesleemeijer.photos.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.PhotoSource
import com.keesleemeijer.photos.domain.ViewMode
import com.keesleemeijer.photos.domain.nextTier
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Owns LibraryUiState. The only place business logic lives; renderers are pure functions of [uiState]. */
class LibraryViewModel(private val source: PhotoSource) : ViewModel() {

    private val _uiState = MutableStateFlow(LibraryUiState())
    val uiState: StateFlow<LibraryUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val loaded = source.photos()
            _uiState.update { it.copy(photos = loaded, isLoading = false) }
        }
    }

    /** Pinch released: delegate to the pure [nextTier]; no-op when unchanged. */
    fun onPinchSettle(cumulativeScale: Float) = _uiState.update { s ->
        val next = nextTier(s.tier, cumulativeScale)
        if (next == s.tier) s else s.copy(tier = next)
    }

    /** Density-pill tap — the second route to the same tier state (guideline §9.3). */
    fun selectTier(tier: DensityTier) = _uiState.update { it.copy(tier = tier) }

    fun onTileTap(photo: Photo) = _uiState.update { it.copy(focused = photo, detailOpen = true) }

    /** Flip Mosaic<->Plane. Focus is DELIBERATELY preserved (spec §6.4). */
    fun onModeToggle() = _uiState.update {
        it.copy(mode = if (it.mode == ViewMode.Mosaic) ViewMode.Plane else ViewMode.Mosaic)
    }

    /** The ONE close routine every never-stuck exit funnels into. Keeps focus for the morph-out. */
    fun close() = _uiState.update { it.copy(detailOpen = false) }

    /** Detail pager reports an absolute index -> move focus there. */
    fun onDetailPage(index: Int) = _uiState.update { s ->
        if (index in s.photos.indices) s.copy(focused = s.photos[index]) else s
    }
}
```

- [ ] **Step 5: Run the test to confirm it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.ui.LibraryViewModelTest"`
Expected: PASS (7 tests).

- [ ] **Step 6: Implement** `ui/LibraryViewModelFactory.kt`

```kotlin
package com.keesleemeijer.photos.ui

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.keesleemeijer.photos.PhotosApp

/** Builds LibraryViewModel from the Application's AppContainer. Use: viewModel(factory = LibraryViewModelFactory). */
val LibraryViewModelFactory: ViewModelProvider.Factory = viewModelFactory {
    initializer {
        val app = this[APPLICATION_KEY] as PhotosApp
        LibraryViewModel(source = app.container.photoSource)
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add native/app/src/main/java/com/keesleemeijer/photos/ui native/app/src/test/java/com/keesleemeijer/photos/ui
git commit -m "feat(native): LibraryViewModel + LibraryUiState + factory (TDD, SEAM #3)"
```

---

## Task 6: Mosaic spine — the app shows photos, pinch snaps tiers

After this task the app renders the real 16-photo staggered grid; pinch snaps Overview↔Browse↔Feature with the FLIP tile-travel; the density pill is the second route to the same tier. (Tap focuses a photo in state but the Theatre arrives in Task 8.)

**Files:**
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/components/PhotoTile.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/components/GridSemantics.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/components/DensityPill.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/mosaic/MosaicScreen.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/LibraryContent.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/LibraryRoot.kt`
- Modify: `native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt`

- [ ] **Step 1: Create** `ui/components/GridSemantics.kt` (in main so MosaicScreen can write it; the test reads it)

```kotlin
package com.keesleemeijer.photos.ui.components

import androidx.compose.ui.semantics.SemanticsPropertyKey
import androidx.compose.ui.semantics.SemanticsPropertyReceiver

/** Test-only semantics so UI tests read the grid's live column count without touching layout internals. */
val ColumnCountKey = SemanticsPropertyKey<Int>("ColumnCount")
var SemanticsPropertyReceiver.columnCount: Int by ColumnCountKey
```

- [ ] **Step 2: Create** `ui/components/PhotoTile.kt` (caption density per tier + the **one** `sharedKey`; scopes nullable so the morph switches on in Task 8 with no signature change)

```kotlin
package com.keesleemeijer.photos.ui.components

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.request.crossfade
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo

private val TILE_RADIUS = 22.dp

private val DensityTier.decodeEdgePx: Int
    get() = when (this) {
        DensityTier.Overview -> 400   // ~110px cell
        DensityTier.Browse -> 800     // ~172px cell
        DensityTier.Feature -> 1600   // full-width pre-detail
    }

/** ONE canonical shared-element key — PhotoTile and DetailPhotoCard MUST call this identically. */
fun sharedKey(photoId: String): String = "photo-$photoId"

@Composable
fun PhotoTile(
    photo: Photo,
    tier: DensityTier,
    onTap: () -> Unit,
    modifier: Modifier = Modifier,
    sharedScope: SharedTransitionScope? = null, // non-null in Task 8 to enable the tile->fullscreen morph
    avScope: AnimatedVisibilityScope? = null,
) {
    val context = LocalContext.current

    val sharedModifier =
        if (sharedScope != null && avScope != null) {
            with(sharedScope) {
                Modifier.sharedElement(
                    sharedContentState = rememberSharedContentState(key = sharedKey(photo.id)),
                    animatedVisibilityScope = avScope,
                )
            }
        } else Modifier

    Box(
        modifier = modifier
            .then(sharedModifier)
            .clip(RoundedCornerShape(TILE_RADIUS))
            .clickable(onClick = onTap),
    ) {
        AsyncImage(
            model = ImageRequest.Builder(context)
                .data("file:///android_asset/${photo.assetPath}")
                .size(tier.decodeEdgePx)
                .crossfade(true)
                .build(),
            contentDescription = photo.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        // Scrim so white caption text clears 4.5:1 (guideline §10).
        Box(Modifier.fillMaxSize().background(
            Brush.verticalGradient(0.55f to Color.Transparent, 1f to Color.Black.copy(alpha = 0.62f)),
        ))
        Column(
            modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp),
        ) {
            if (tier == DensityTier.Feature && photo.latin != null) {
                Text(photo.latin, color = Color.White.copy(alpha = 0.60f), fontStyle = FontStyle.Italic,
                    fontWeight = FontWeight.Light, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            if (tier != DensityTier.Overview) {
                Text(photo.name, color = Color.White, fontWeight = FontWeight.Bold,
                    fontSize = if (tier == DensityTier.Feature) 24.sp else 18.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text(photo.id, color = Color.White.copy(alpha = 0.80f), fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Medium, fontSize = 11.sp, letterSpacing = 1.7.sp)
        }
    }
}
```

- [ ] **Step 3: Create** `ui/components/DensityPill.kt`

```kotlin
package com.keesleemeijer.photos.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.ui.theme.AppTheme

/** Floating segmented control: All·Some·One. Active segment filled cobalt (guideline §9.3). */
@Composable
fun DensityPill(tier: DensityTier, onSelect: (DensityTier) -> Unit, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    val items = listOf("All" to DensityTier.Overview, "Some" to DensityTier.Browse, "One" to DensityTier.Feature)
    Row(
        modifier = modifier.clip(RoundedCornerShape(percent = 50)).background(tokens.colors.panel).padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        items.forEach { (label, t) ->
            val active = t == tier
            Text(
                text = label,
                color = if (active) tokens.colors.onAccent else tokens.colors.inkMuted,
                style = MaterialTheme.typography.labelMedium,
                modifier = Modifier
                    .clip(RoundedCornerShape(percent = 50))
                    .background(if (active) tokens.colors.accentLift else Color.Transparent)
                    .clickable { onSelect(t) }
                    .padding(horizontal = 16.dp, vertical = 8.dp),
            )
        }
    }
}
```

- [ ] **Step 4: Create** `ui/mosaic/MosaicScreen.kt` (verified: `animateItem`, `FullLine`, `detectTransformGestures`)

```kotlin
package com.keesleemeijer.photos.ui.mosaic

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.staggeredgrid.LazyVerticalStaggeredGrid
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridCells
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridItemSpan
import androidx.compose.foundation.lazy.staggeredgrid.items
import androidx.compose.foundation.lazy.staggeredgrid.rememberLazyStaggeredGridState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.components.PhotoTile
import com.keesleemeijer.photos.ui.components.columnCount

/**
 * The mosaic spine (spec §6.1). Column count IS the tier. A pinch tracks live as one graphicsLayer
 * scale on the container (one composited layer); on gesture end the cumulative scale goes UP to the
 * ViewModel via [onPinchSettle] — the pure nextTier decides the snap there (no business logic here).
 */
@Composable
fun MosaicScreen(
    photos: List<Photo>,
    tier: DensityTier,
    onPinchSettle: (Float) -> Unit,
    onPhotoTap: (Photo) -> Unit,
    modifier: Modifier = Modifier,
    sharedScope: SharedTransitionScope? = null,
    avScope: AnimatedVisibilityScope? = null,
) {
    val gridState = rememberLazyStaggeredGridState()
    var liveScale by remember { mutableFloatStateOf(1f) }

    val fadeSnap = remember { tween<Float>(280, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f)) }
    val placementSnap = remember { tween<IntOffset>(280, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f)) }

    LazyVerticalStaggeredGrid(
        columns = StaggeredGridCells.Fixed(tier.columns),
        state = gridState,
        modifier = modifier
            .fillMaxSize()
            .testTag("mosaic_grid")
            .semantics { columnCount = tier.columns }
            .graphicsLayer { scaleX = liveScale; scaleY = liveScale }
            .pointerInput(tier) {
                var cumulative = 1f
                detectTransformGestures(panZoomLock = true) { _, _, zoom, _ ->
                    cumulative *= zoom
                    liveScale = cumulative.coerceIn(0.6f, 1.6f) // rubber-band the live feel only
                }
                liveScale = 1f                  // release the live transform; columns carry the change
                onPinchSettle(cumulative)        // VM runs nextTier
            },
        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 12.dp),
        verticalItemSpacing = 8.dp,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(
            items = photos,
            key = { it.id },
            span = { photo ->
                if (photo.aspect == Aspect.Panorama) StaggeredGridItemSpan.FullLine
                else StaggeredGridItemSpan.SingleLane
            },
        ) { photo ->
            PhotoTile(
                photo = photo,
                tier = tier,
                onTap = { onPhotoTap(photo) },
                sharedScope = sharedScope,
                avScope = avScope,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(photo.aspect.ratio)
                    .animateItem(fadeInSpec = fadeSnap, placementSpec = placementSnap, fadeOutSpec = fadeSnap),
            )
        }
    }
}
```

- [ ] **Step 5: Create** `ui/LibraryContent.kt` (Task 6 version — Mosaic + pill; superseded in Tasks 7–8)

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.components.DensityPill
import com.keesleemeijer.photos.ui.mosaic.MosaicScreen

@Composable
fun LibraryContent(
    state: LibraryUiState,
    onTileTap: (Photo) -> Unit,
    onPinchSettle: (Float) -> Unit,
    onSelectTier: (DensityTier) -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        MosaicScreen(
            photos = state.photos,
            tier = state.tier,
            onPinchSettle = onPinchSettle,
            onPhotoTap = onTileTap,
        )
        DensityPill(
            tier = state.tier,
            onSelect = onSelectTier,
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp),
        )
    }
}
```

- [ ] **Step 6: Create** `ui/LibraryRoot.kt` (Task 6 version; extended in Task 8)

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun LibraryRoot(viewModel: LibraryViewModel = viewModel(factory = LibraryViewModelFactory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LibraryContent(
        state = state,
        onTileTap = viewModel::onTileTap,
        onPinchSettle = viewModel::onPinchSettle,
        onSelectTier = viewModel::selectTier,
    )
}
```

- [ ] **Step 7: Wire `LibraryRoot` into `MainActivity`** — replace the `Root()` composable

```kotlin
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.platform.testTagsAsResourceId
import androidx.compose.ui.semantics.semantics
import com.keesleemeijer.photos.ui.LibraryRoot
import com.keesleemeijer.photos.ui.theme.AppTheme

@OptIn(ExperimentalComposeUiApi::class)
@Composable
private fun Root() {
    AppTheme {
        Surface(
            modifier = Modifier.fillMaxSize().semantics { testTagsAsResourceId = true }, // UiAutomator By.res (Task 10)
            color = AppTheme.tokens.colors.canvas,
        ) {
            LibraryRoot()
        }
    }
}
```

- [ ] **Step 8: Build, install, and verify the mosaic by hand**

Run: `./gradlew :app:installDebug` (emulator/device running). Launch "Photos". Expected:
- A 3-column staggered grid of the 16 photos, panorama tiles (P4, P8) spanning full width, only mono `P#` chips visible.
- Pinch out → snaps to 2 columns (names appear), then 1 column (names + latin); pinch in reverses; tiles glide (FLIP).
- The bottom pill highlights All/Some/One in sync; tapping a segment switches columns.

- [ ] **Step 9: Commit**

```bash
git add native/app/src/main/java/com/keesleemeijer/photos/ui native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt
git commit -m "feat(native): Mosaic spine — staggered grid, pinch-to-snap, density pill"
```

---

## Task 7: Living Plane — single-layer zoom/pan (TDD packer) + mode toggle

After this task a quiet `MOSAIC`/`PLANE` toggle flips renderers; the Plane shows all photos fit-to-screen, free pinch-zoom + pan on **one** composited layer, tap hit-tests through the transform.

**Files:**
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/plane/PackPlane.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/plane/PlaneScreen.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/plane/PlaneTile.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/plane/ZoomControlPill.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/components/ModeToggle.kt`
- Modify: `native/app/src/main/java/com/keesleemeijer/photos/ui/LibraryContent.kt`, `LibraryRoot.kt`
- Test: `native/app/src/test/java/com/keesleemeijer/photos/ui/plane/PackPlaneTest.kt`

- [ ] **Step 1: Write the failing packer test** `ui/plane/PackPlaneTest.kt`

```kotlin
package com.keesleemeijer.photos.ui.plane

import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.Photo
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

private fun library(n: Int = 80): List<Photo> = (1..n).map { i ->
    val aspect = when (i % 5) { 0 -> Aspect.Panorama; 1, 2 -> Aspect.Portrait; else -> Aspect.Landscape }
    Photo("P$i", "photos/P$i.webp", "Photo $i", null, aspect, null, null, null)
}

class PackPlaneTest {
    @Test fun `no two placements overlap`() {
        val ps = packPlane(library(), containerWidth = 1080f).placements
        val eps = 0.5f
        for (i in ps.indices) for (j in i + 1 until ps.size) {
            val a = ps[i]; val b = ps[j]
            val separated = a.right <= b.left + eps || b.right <= a.left + eps ||
                a.bottom <= b.top + eps || b.bottom <= a.top + eps
            assertTrue("${a.photo.id} and ${b.photo.id} overlap", separated)
        }
    }

    @Test fun `every placement stays within bounds`() {
        val layout = packPlane(library(), containerWidth = 1080f)
        assertEquals(80, layout.placements.size)
        for (p in layout.placements) {
            assertTrue(p.left >= -0.5f); assertTrue(p.top >= -0.5f)
            assertTrue(p.right <= layout.contentWidth + 0.5f)
            assertTrue(p.bottom <= layout.contentHeight + 0.5f)
            assertTrue(p.width > 0f && p.height > 0f)
        }
    }

    @Test fun `justified rows fill the container width`() {
        val w = 1000f
        val rows = packPlane(library(120), containerWidth = w, gap = 8f)
            .placements.groupBy { it.top }.values.sortedBy { it.first().top }
        assertTrue(rows.size >= 3)
        for (row in rows.dropLast(1)) assertEquals(w, row.maxOf { it.right }, 2f)
    }
}
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.ui.plane.PackPlaneTest"`
Expected: FAIL — `Unresolved reference: packPlane`.

- [ ] **Step 3: Implement** `ui/plane/PackPlane.kt`

```kotlin
package com.keesleemeijer.photos.ui.plane

import com.keesleemeijer.photos.domain.Photo

const val DEFAULT_TARGET_ROW_HEIGHT = 320f
const val DEFAULT_GAP = 8f

data class PlacedPhoto(val photo: Photo, val left: Float, val top: Float, val width: Float, val height: Float) {
    val right: Float get() = left + width
    val bottom: Float get() = top + height
}

data class PlaneLayout(val placements: List<PlacedPhoto>, val contentWidth: Float, val contentHeight: Float)

/** Justified-rows packing (guideline §5). PURE: no Android, no time. */
fun packPlane(
    photos: List<Photo>,
    containerWidth: Float,
    targetRowHeight: Float = DEFAULT_TARGET_ROW_HEIGHT,
    gap: Float = DEFAULT_GAP,
): PlaneLayout {
    require(containerWidth > 0f); require(targetRowHeight > 0f); require(gap >= 0f)
    if (photos.isEmpty()) return PlaneLayout(emptyList(), 0f, 0f)
    val placements = ArrayList<PlacedPhoto>(photos.size)
    var maxRowRight = 0f; var y = 0f; var rowStart = 0; var rowNaturalWidth = 0f
    fun aspectWidthAt(h: Float, p: Photo) = p.aspect.ratio * h
    fun commitRow(endExclusive: Int, justify: Boolean) {
        val count = endExclusive - rowStart; if (count <= 0) return
        val totalGap = gap * (count - 1)
        val rowHeight = if (justify && rowNaturalWidth > 0f) {
            val available = (containerWidth - totalGap).coerceAtLeast(1f)
            targetRowHeight * (available / rowNaturalWidth)
        } else targetRowHeight
        var x = 0f
        for (i in rowStart until endExclusive) {
            val w = aspectWidthAt(rowHeight, photos[i])
            placements += PlacedPhoto(photos[i], x, y, w, rowHeight); x += w + gap
        }
        val rowRight = (x - gap).coerceAtLeast(0f); if (rowRight > maxRowRight) maxRowRight = rowRight
        y += rowHeight + gap; rowStart = endExclusive; rowNaturalWidth = 0f
    }
    for (i in photos.indices) {
        rowNaturalWidth += aspectWidthAt(targetRowHeight, photos[i])
        val totalGap = gap * (i - rowStart)
        if (rowNaturalWidth + totalGap >= containerWidth) commitRow(i + 1, justify = true)
    }
    commitRow(photos.size, justify = false) // trailing partial row at target height (never stretched)
    return PlaneLayout(placements, maxRowRight, (y - gap).coerceAtLeast(0f))
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `./gradlew :app:testDebugUnitTest --tests "com.keesleemeijer.photos.ui.plane.PackPlaneTest"`
Expected: PASS (3 tests).

- [ ] **Step 5: Create** `ui/plane/PlaneTile.kt`

```kotlin
package com.keesleemeijer.photos.ui.plane

import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.request.crossfade
import kotlin.math.roundToInt

@Composable
fun PlaneTile(placed: PlacedPhoto, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val density = LocalDensity.current
    val xDp = with(density) { placed.left.toDp() }
    val yDp = with(density) { placed.top.toDp() }
    AsyncImage(
        model = ImageRequest.Builder(context)
            .data("file:///android_asset/${placed.photo.assetPath}")
            .size(placed.width.roundToInt().coerceAtLeast(1), placed.height.roundToInt().coerceAtLeast(1))
            .crossfade(true)
            .build(),
        contentDescription = placed.photo.name,
        contentScale = ContentScale.Crop,
        modifier = modifier
            .offset(x = xDp, y = yDp)
            .size(with(density) { placed.width.toDp() }, with(density) { placed.height.toDp() })
            .clip(RoundedCornerShape(18.dp)),
    )
}
```

- [ ] **Step 6: Create** `ui/plane/ZoomControlPill.kt`

```kotlin
package com.keesleemeijer.photos.ui.plane

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.ui.theme.AppTheme
import java.util.Locale

internal fun zoomLabel(zoom: Float, minZoom: Float): String =
    if (zoom <= minZoom + 0.02f) "fit" else String.format(Locale.US, "%.1f×", zoom)

/** Frosted glass pill: − [label] [slider] + . Glyphs are mono Text (Material Icons removed in M3 1.4). */
@Composable
fun ZoomControlPill(
    zoom: Float, minZoom: Float, maxZoom: Float, onZoomChange: (Float) -> Unit, modifier: Modifier = Modifier,
) {
    val tokens = AppTheme.tokens
    Row(
        modifier = modifier.clip(RoundedCornerShape(percent = 50)).background(tokens.colors.panel).padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text("−", color = tokens.colors.ink, modifier = Modifier.clickable { onZoomChange((zoom - 0.5f).coerceAtLeast(minZoom)) })
        Text(zoomLabel(zoom, minZoom), color = tokens.colors.inkMuted, style = MaterialTheme.typography.labelMedium)
        Slider(
            value = zoom.coerceIn(minZoom, maxZoom),
            onValueChange = onZoomChange,
            valueRange = minZoom..maxZoom,
            colors = SliderDefaults.colors(thumbColor = tokens.colors.accentLift, activeTrackColor = tokens.colors.accentLift, inactiveTrackColor = tokens.colors.hairline),
            modifier = Modifier.width(140.dp),
        )
        Text("+", color = tokens.colors.ink, modifier = Modifier.clickable { onZoomChange((zoom + 0.5f).coerceAtMost(maxZoom)) })
    }
}
```

- [ ] **Step 7: Create** `ui/plane/PlaneScreen.kt` — one `graphicsLayer`, free zoom/pan, tap hit-test

```kotlin
package com.keesleemeijer.photos.ui.plane

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.theme.AppTheme

private const val MAX_ZOOM = 6f

@Composable
fun PlaneScreen(photos: List<Photo>, onOpenDetail: (Photo) -> Unit, modifier: Modifier = Modifier) {
    val density = LocalDensity.current
    var viewport by remember { mutableStateOf(IntSize.Zero) }

    val layout = remember(photos, viewport.width) {
        if (viewport.width == 0) null
        else packPlane(photos, containerWidth = viewport.width.toFloat(), targetRowHeight = viewport.width / 3.2f)
    }
    val fitScale = remember(layout, viewport) {
        val l = layout ?: return@remember 1f
        if (l.contentWidth <= 0f || l.contentHeight <= 0f) 1f
        else minOf(viewport.width / l.contentWidth, viewport.height / l.contentHeight)
    }

    var zoom by remember { mutableFloatStateOf(1f) } // 1f == fit; effective scale = fitScale * zoom
    var panX by remember { mutableFloatStateOf(0f) }
    var panY by remember { mutableFloatStateOf(0f) }

    fun clamp() = layout?.let { l ->
        panX = constrainPan(panX, l.contentWidth * fitScale * zoom, viewport.width.toFloat())
        panY = constrainPan(panY, l.contentHeight * fitScale * zoom, viewport.height.toFloat())
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .testTag("plane")
            .background(AppTheme.tokens.colors.canvas)
            .onSizeChanged { viewport = it }
            .pointerInput(layout, fitScale) {
                detectTransformGestures(panZoomLock = true) { centroid, pan, gestureZoom, _ ->
                    val old = zoom
                    val next = rubberBandZoom(old * gestureZoom, minZoom = 1f, maxZoom = MAX_ZOOM)
                    val f = next / old
                    panX = (panX - centroid.x) * f + centroid.x + pan.x // anchor centroid while scaling
                    panY = (panY - centroid.y) * f + centroid.y + pan.y
                    zoom = next
                    clamp()
                }
            }
            .pointerInput(layout, fitScale, zoom, panX, panY) {
                detectTapGestures { tap ->
                    val l = layout ?: return@detectTapGestures
                    val s = fitScale * zoom
                    val px = (tap.x - panX) / s; val py = (tap.y - panY) / s
                    l.placements.firstOrNull { px in it.left..it.right && py in it.top..it.bottom }
                        ?.let { onOpenDetail(it.photo) }
                }
            },
    ) {
        layout?.let { l ->
            Box(
                Modifier
                    .size(with(density) { l.contentWidth.toDp() }, with(density) { l.contentHeight.toDp() })
                    .graphicsLayer { // ONE block, ONE composited layer (spec §6.2 / §7.3)
                        scaleX = fitScale * zoom; scaleY = fitScale * zoom
                        translationX = panX; translationY = panY
                        transformOrigin = TransformOrigin(0f, 0f)
                    },
            ) {
                for (placed in l.placements) PlaneTile(placed = placed)
            }
        }
        ZoomControlPill(
            zoom = zoom, minZoom = 1f, maxZoom = MAX_ZOOM,
            onZoomChange = { target ->
                val old = zoom; val next = target.coerceIn(1f, MAX_ZOOM)
                val cx = viewport.width / 2f; val cy = viewport.height / 2f
                val f = next / old
                panX = (panX - cx) * f + cx; panY = (panY - cy) * f + cy
                zoom = next; clamp()
            },
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp),
        )
    }
}

/** guideline §6: rubber-band past extremes; never a hard wall. */
internal fun rubberBandZoom(proposed: Float, minZoom: Float, maxZoom: Float): Float {
    val resistance = 0.30f
    return when {
        proposed < minZoom -> minZoom - (minZoom - proposed) * resistance
        proposed > maxZoom -> maxZoom + (proposed - maxZoom) * resistance
        else -> proposed
    }
}

internal fun constrainPan(pan: Float, contentSize: Float, viewportSize: Float): Float =
    if (contentSize <= viewportSize) (viewportSize - contentSize) / 2f   // centre small content
    else pan.coerceIn(viewportSize - contentSize, 0f)                    // no empty edges revealed

// ─────────────────────────────────────────────────────────────────────────────────────────
// DEFERRED (spec §10.6): dwell-snap-to-center + ambient dimming of unfocused tiles.
// Intentionally NOT implemented. Free pan/zoom + tap-to-Detail is the agreed funding-demo scope.
//   stub: dwellSnapToCenter(focused, plane) — animate pan so the dwelt tile centres.
//   stub: ambientDim(focused, placements)   — alpha-fade tiles by distance from focus.
// ─────────────────────────────────────────────────────────────────────────────────────────
```

- [ ] **Step 8: Create** `ui/components/ModeToggle.kt`

```kotlin
package com.keesleemeijer.photos.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.ViewMode
import com.keesleemeijer.photos.ui.theme.AppTheme

/** Quiet pill flipping Mosaic<->Plane; reads the label of the mode you'd switch TO. */
@Composable
fun ModeToggle(mode: ViewMode, onToggle: () -> Unit, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    Text(
        text = if (mode == ViewMode.Mosaic) "PLANE" else "MOSAIC",
        color = tokens.colors.inkMuted,
        style = MaterialTheme.typography.labelMedium,
        modifier = modifier
            .clip(RoundedCornerShape(percent = 50))
            .background(tokens.colors.panel)
            .clickable(onClick = onToggle)
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .testTag("mode_toggle"),
    )
}
```

- [ ] **Step 9: Update** `ui/LibraryContent.kt` — crossfade between the two renderers + the toggle

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.ViewMode
import com.keesleemeijer.photos.ui.components.DensityPill
import com.keesleemeijer.photos.ui.components.ModeToggle
import com.keesleemeijer.photos.ui.mosaic.MosaicScreen
import com.keesleemeijer.photos.ui.plane.PlaneScreen

/** Task 7 version: Mosaic↔Plane crossfade + toggle. Wrapped by DetailHost in Task 8. */
@Composable
fun LibraryContent(
    state: LibraryUiState,
    onTileTap: (Photo) -> Unit,
    onPinchSettle: (Float) -> Unit,
    onSelectTier: (DensityTier) -> Unit,
    onModeToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        AnimatedContent(
            targetState = state.mode,
            transitionSpec = { fadeIn(tween(280)) togetherWith fadeOut(tween(280)) },
            label = "mode",
        ) { mode ->
            when (mode) {
                ViewMode.Mosaic -> MosaicScreen(state.photos, state.tier, onPinchSettle, onTileTap)
                ViewMode.Plane -> PlaneScreen(state.photos, onOpenDetail = onTileTap)
            }
        }
        if (state.mode == ViewMode.Mosaic) {
            DensityPill(state.tier, onSelectTier, Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp))
        }
        ModeToggle(state.mode, onModeToggle, Modifier.align(Alignment.BottomStart).padding(16.dp))
    }
}
```

- [ ] **Step 10: Update** `ui/LibraryRoot.kt` — pass `onModeToggle`

```kotlin
    LibraryContent(
        state = state,
        onTileTap = viewModel::onTileTap,
        onPinchSettle = viewModel::onPinchSettle,
        onSelectTier = viewModel::selectTier,
        onModeToggle = viewModel::onModeToggle,
    )
```

- [ ] **Step 11: Build, install, verify the Plane by hand**

Run: `./gradlew :app:testDebugUnitTest :app:installDebug`
Expected: unit tests green; in the app, tap `PLANE` → all photos fit-to-screen on one plane; pinch zooms and pans smoothly (one layer, no relayout); the zoom pill reads `fit` → `1.4×` …; tap `MOSAIC` returns. (Tapping a photo focuses it; the Theatre arrives next.)

- [ ] **Step 12: Commit**

```bash
git add native/app/src/main/java/com/keesleemeijer/photos/ui native/app/src/test/java/com/keesleemeijer/photos/ui/plane
git commit -m "feat(native): Living Plane — single-layer zoom/pan (TDD packer) + mode toggle"
```

---

## Task 8: Detail / Theatre — shared-element morph + never-stuck exits

The headline interaction. Tapping a mosaic tile morphs it into a fullscreen Theatre (shared element, soft 300ms); every never-stuck exit (swipe-down, ✕, backdrop, hardware/predictive Back, Esc) funnels through the one `close()`; a `HorizontalPager` inside the content pages prev/next.

> **Shared-element notes (applied from adversarial verdict 2):** the API is **stable** — no `@OptIn(ExperimentalSharedTransitionApi)`. The bounds (position+size) morph; a pixel-perfect corner-radius lerp (22→0) would read the transition fraction and is a later polish item — the bounds morph is the funding moment. Plane→Detail opens as a fade (the morph source key only exists on mosaic tiles in the prototype); morph-from-Plane is a noted polish item (spec §6.4 ideal).

**Files:**
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/detail/DetailParts.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/detail/DetailPhotoCard.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/detail/DetailOverlay.kt`
- Create: `native/app/src/main/java/com/keesleemeijer/photos/ui/detail/DetailHost.kt`
- Modify: `native/app/src/main/java/com/keesleemeijer/photos/ui/LibraryContent.kt`, `LibraryRoot.kt`

- [ ] **Step 1: Create** `ui/detail/DetailParts.kt` — backdrop, ✕, meta row, fun-fact

```kotlin
package com.keesleemeijer.photos.ui.detail

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.theme.AppTheme

/** Dimmed backdrop — tap outside the card closes (never-stuck #3). */
@Composable
fun DetailBackdrop(alpha: Float, onTap: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier
            .fillMaxSize()
            .testTag("backdrop")
            .background(Color.Black.copy(alpha = 0.72f * alpha))
            .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }, onClick = onTap),
    )
}

/** Persistent ✕, 48dp, never auto-hidden (never-stuck #2). */
@Composable
fun CloseButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(Color.White.copy(alpha = 0.12f))
            .clickable(onClick = onClick)
            .semantics { contentDescription = "Close" },
        contentAlignment = Alignment.Center,
    ) { Text("✕", color = Color.White, fontSize = 20.sp) }
}

/** cobalt glow tick · name (700) · latin (300 italic) · mono code · mono vitals (guideline §9.5). */
@Composable
fun MetaRow(photo: Photo, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    Column(modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(8.dp).clip(CircleShape).background(tokens.colors.accentLift))
            Spacer(Modifier.width(8.dp))
            Text(photo.name, style = MaterialTheme.typography.headlineMedium, color = tokens.colors.ink)
        }
        photo.latin?.let { Text(it, style = MaterialTheme.typography.bodyLarge, color = tokens.colors.inkMuted) }
        Spacer(Modifier.height(6.dp))
        Row {
            Text(photo.id, style = MaterialTheme.typography.labelMedium, color = tokens.colors.inkFaint)
            photo.vitals?.takeIf { it.isNotEmpty() }?.let {
                Spacer(Modifier.width(10.dp))
                Text(it.values.joinToString("  ·  "), style = MaterialTheme.typography.labelMedium, color = tokens.colors.inkMuted)
            }
        }
    }
}

/** Fun-fact lede behind "Read more" (spec §10.3). */
@Composable
fun FunFactLede(fact: String, expanded: Boolean, onToggle: () -> Unit, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    Column(modifier.clickable(onClick = onToggle)) {
        Text(fact, style = MaterialTheme.typography.bodyMedium, color = tokens.colors.inkMuted,
            maxLines = if (expanded) Int.MAX_VALUE else 2, overflow = TextOverflow.Ellipsis)
        Text(if (expanded) "Read less" else "Read more", style = MaterialTheme.typography.labelMedium, color = tokens.colors.accentLift)
    }
}
```

- [ ] **Step 2: Create** `ui/detail/DetailPhotoCard.kt` — the morph target (no `@OptIn`)

```kotlin
package com.keesleemeijer.photos.ui.detail

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.BoundsTransform
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shadow
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.request.crossfade
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.components.sharedKey

private val SoftEasing = CubicBezierEasing(0.2f, 0f, 0f, 1f)
private val DetailBoundsTransform = BoundsTransform { _, _ -> tween(durationMillis = 300, easing = SoftEasing) }

/** Shares a content-state key with the tapped PhotoTile so Compose morphs position+size (soft 300ms). */
@Composable
fun DetailPhotoCard(
    photo: Photo,
    sharedTransitionScope: SharedTransitionScope,
    animatedVisibilityScope: AnimatedVisibilityScope,
    isActivePage: Boolean,
    modifier: Modifier = Modifier,
) = with(sharedTransitionScope) {
    var factExpanded by remember { mutableStateOf(false) }
    Column(modifier.fillMaxWidth().padding(horizontal = 18.dp), verticalArrangement = Arrangement.Center) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(photo.aspect.ratio)
                .shadow(elevation = 22.dp, shape = RoundedCornerShape(0.dp), ambientColor = Color.Black, spotColor = Color.Black)
                .then(
                    if (isActivePage) Modifier.sharedElement(
                        sharedContentState = rememberSharedContentState(key = sharedKey(photo.id)),
                        animatedVisibilityScope = animatedVisibilityScope,
                        boundsTransform = DetailBoundsTransform,
                    ) else Modifier
                )
                .clip(RoundedCornerShape(0.dp)),
        ) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data("file:///android_asset/${photo.assetPath}")
                    .crossfade(true)
                    .build(),
                contentDescription = photo.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        Spacer(Modifier.height(16.dp))
        MetaRow(photo)
        photo.fact?.let { fact ->
            Spacer(Modifier.height(12.dp))
            FunFactLede(fact = fact, expanded = factExpanded, onToggle = { factExpanded = !factExpanded })
        }
    }
}
```

- [ ] **Step 3: Create** `ui/detail/DetailOverlay.kt` — the Theatre + all exits through one `close()`

```kotlin
package com.keesleemeijer.photos.ui.detail

import androidx.activity.compose.BackHandler
import androidx.activity.compose.PredictiveBackHandler
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.paneTitle
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.Photo
import kotlin.coroutines.cancellation.CancellationException
import kotlin.math.abs

@Composable
fun SharedTransitionScope.DetailOverlay(
    photos: List<Photo>,
    startIndex: Int,
    animatedVisibilityScope: AnimatedVisibilityScope,
    onPageChanged: (Int) -> Unit,
    close: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val density = LocalDensity.current
    val dismissThresholdPx = with(density) { 116.dp.toPx() } // ~110–120dp commit point
    val closeFocus = remember { FocusRequester() }
    val pagerState = rememberPagerState(initialPage = startIndex) { photos.size }
    val currentPhoto = photos[pagerState.currentPage]

    var dragOffsetY by remember { mutableFloatStateOf(0f) }
    val progress = (abs(dragOffsetY) / dismissThresholdPx).coerceIn(0f, 1f)
    val contentAlpha = 1f - 0.45f * progress
    val backdropAlpha = 1f - 0.65f * progress

    LaunchedEffect(pagerState) { snapshotFlow { pagerState.currentPage }.collect(onPageChanged) }
    LaunchedEffect(Unit) { closeFocus.requestFocus() } // a11y: focus to ✕ on open (guideline §10)

    // Never-stuck: hardware Back + predictive Back.
    BackHandler(enabled = true) { close() }
    PredictiveBackHandler(enabled = true) { backProgress ->
        try {
            backProgress.collect { e -> dragOffsetY = dismissThresholdPx * e.progress }
            close()
        } catch (e: CancellationException) {
            dragOffsetY = 0f; throw e
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .testTag("detail")
            .onPreviewKeyEvent { ev ->
                if (ev.type == KeyEventType.KeyUp && ev.key == Key.Escape) { close(); true } else false
            }
            .semantics { paneTitle = currentPhoto.name; liveRegion = LiveRegionMode.Assertive },
        contentAlignment = Alignment.Center,
    ) {
        DetailBackdrop(alpha = backdropAlpha, onTap = close, modifier = Modifier.fillMaxSize())

        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer { translationY = dragOffsetY; this.alpha = contentAlpha }
                .pointerInput(pagerState.currentPage) {
                    detectVerticalDragGestures(
                        onDragEnd = { if (abs(dragOffsetY) >= dismissThresholdPx) close() else dragOffsetY = 0f },
                        onDragCancel = { dragOffsetY = 0f },
                        onVerticalDrag = { change, delta ->
                            dragOffsetY = (dragOffsetY + delta).coerceAtLeast(0f) // only down-drag dismisses
                            change.consume()
                        },
                    )
                },
        ) { page ->
            DetailPhotoCard(
                photo = photos[page],
                sharedTransitionScope = this@DetailOverlay,
                animatedVisibilityScope = animatedVisibilityScope,
                isActivePage = page == pagerState.currentPage,
            )
        }

        CloseButton(
            onClick = close,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
                .focusRequester(closeFocus)
                .graphicsLayer { this.alpha = contentAlpha },
        )
    }
}
```

- [ ] **Step 4: Create** `ui/detail/DetailHost.kt` — `SharedTransitionLayout` over both modes + the overlay

```kotlin
package com.keesleemeijer.photos.ui.detail

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionLayout
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.ViewMode

/**
 * Top-level composition root that makes the Detail morph work from either mode (spec §6.4):
 *   SharedTransitionLayout
 *     ├─ AnimatedContent(mode)         — Mosaic ↔ Plane crossfade (both expose the shared keys)
 *     └─ AnimatedContent(detailIndex)  — DetailOverlay above; supplies the AnimatedVisibilityScope.
 */
@Composable
fun DetailHost(
    mode: ViewMode,
    photos: List<Photo>,
    detailIndex: Int?, // null == closed
    onDetailPageChanged: (Int) -> Unit,
    close: () -> Unit,
    mosaic: @Composable (SharedTransitionScope, AnimatedVisibilityScope) -> Unit,
    plane: @Composable (SharedTransitionScope, AnimatedVisibilityScope) -> Unit,
    modifier: Modifier = Modifier,
) {
    SharedTransitionLayout(modifier = modifier.fillMaxSize()) {
        val sts = this
        Box(Modifier.fillMaxSize()) {
            AnimatedContent(
                targetState = mode,
                transitionSpec = { fadeIn(tween(280)) togetherWith fadeOut(tween(280)) },
                label = "mode",
            ) { targetMode ->
                when (targetMode) {
                    ViewMode.Mosaic -> mosaic(sts, this@AnimatedContent)
                    ViewMode.Plane -> plane(sts, this@AnimatedContent)
                }
            }
            AnimatedContent(
                targetState = detailIndex,
                transitionSpec = { fadeIn(tween(300)) togetherWith fadeOut(tween(300)) },
                label = "detail",
            ) { index ->
                if (index != null && index in photos.indices) {
                    with(sts) {
                        DetailOverlay(
                            photos = photos,
                            startIndex = index,
                            animatedVisibilityScope = this@AnimatedContent,
                            onPageChanged = onDetailPageChanged,
                            close = close,
                        )
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 5: Replace** `ui/LibraryContent.kt` — wrap renderers in `DetailHost`

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.ViewMode
import com.keesleemeijer.photos.ui.components.DensityPill
import com.keesleemeijer.photos.ui.components.ModeToggle
import com.keesleemeijer.photos.ui.detail.DetailHost
import com.keesleemeijer.photos.ui.mosaic.MosaicScreen
import com.keesleemeijer.photos.ui.plane.PlaneScreen

@Composable
fun LibraryContent(
    state: LibraryUiState,
    onTileTap: (Photo) -> Unit,
    onPinchSettle: (Float) -> Unit,
    onSelectTier: (DensityTier) -> Unit,
    onModeToggle: () -> Unit,
    onDetailPage: (Int) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        DetailHost(
            mode = state.mode,
            photos = state.photos,
            detailIndex = if (state.detailOpen) state.focusedIndex.takeIf { it >= 0 } else null,
            onDetailPageChanged = onDetailPage,
            close = onClose,
            mosaic = { sts, av ->
                MosaicScreen(state.photos, state.tier, onPinchSettle, onTileTap, sharedScope = sts, avScope = av)
            },
            plane = { _, _ -> PlaneScreen(state.photos, onOpenDetail = onTileTap) },
        )
        if (!state.detailOpen) {
            if (state.mode == ViewMode.Mosaic) {
                DensityPill(state.tier, onSelectTier, Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp))
            }
            ModeToggle(state.mode, onModeToggle, Modifier.align(Alignment.BottomStart).padding(16.dp))
        }
    }
}
```

- [ ] **Step 6: Replace** `ui/LibraryRoot.kt` — wire `onDetailPage` + `onClose` (DetailOverlay owns Back)

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun LibraryRoot(viewModel: LibraryViewModel = viewModel(factory = LibraryViewModelFactory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LibraryContent(
        state = state,
        onTileTap = viewModel::onTileTap,
        onPinchSettle = viewModel::onPinchSettle,
        onSelectTier = viewModel::selectTier,
        onModeToggle = viewModel::onModeToggle,
        onDetailPage = viewModel::onDetailPage,
        onClose = viewModel::close,
    )
}
```

- [ ] **Step 7: Build, install, verify the full experience by hand**

Run: `./gradlew :app:assembleDebug :app:installDebug`
Expected: tap a mosaic tile → it morphs into the Theatre (soft 300ms); name/latin/code/vitals show; "Read more" expands the fact; swipe horizontally pages prev/next; swipe down past ~116dp dismisses (tracks the finger); ✕, backdrop tap, hardware Back, and (with a keyboard) Esc all close. Switch to Plane, tap a photo → Detail opens (fade); close → you return to Plane with your place preserved.

- [ ] **Step 8: Commit**

```bash
git add native/app/src/main/java/com/keesleemeijer/photos/ui
git commit -m "feat(native): Detail/Theatre — shared-element morph + never-stuck exits + pager"
```

---

## Task 9: Instrumented UI tests — the never-stuck guard (spec §9)

Compose UI tests that prove Detail opens on tap, **every** never-stuck exit invokes `close()`, and the density pill switches the column count. Requires an emulator/device (API 33+).

**Files:**
- Modify: `native/app/src/main/java/com/keesleemeijer/photos/ui/mosaic/MosaicScreen.kt` (per-tile test tag)
- Create: `native/app/src/androidTest/java/com/keesleemeijer/photos/ui/ColumnCountSemantics.kt`
- Create: `native/app/src/androidTest/java/com/keesleemeijer/photos/ui/LibraryDetailUiTest.kt`

- [ ] **Step 1: Add a per-tile test tag** in `MosaicScreen.kt` — add `.testTag("tile_${photo.id}")` to the `PhotoTile` modifier chain

```kotlin
            PhotoTile(
                photo = photo,
                tier = tier,
                onTap = { onPhotoTap(photo) },
                sharedScope = sharedScope,
                avScope = avScope,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(photo.aspect.ratio)
                    .testTag("tile_${photo.id}")   // <-- add this line (import androidx.compose.ui.platform.testTag)
                    .animateItem(fadeInSpec = fadeSnap, placementSpec = placementSnap, fadeOutSpec = fadeSnap),
            )
```

(The grid already has `testTag("mosaic_grid")` + the `columnCount` semantics; the ✕ already carries `contentDescription = "Close"`; the backdrop and overlay already carry `testTag("backdrop")`/`"detail"`; the pill already renders the texts All/Some/One.)

- [ ] **Step 2: Create the column-count assertion helper** `androidTest/.../ui/ColumnCountSemantics.kt`

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.SemanticsNodeInteraction
import com.keesleemeijer.photos.ui.components.ColumnCountKey // defined in main (ui/components/GridSemantics.kt)

fun SemanticsNodeInteraction.assertColumnCountEquals(expected: Int): SemanticsNodeInteraction =
    assert(SemanticsMatcher.expectValue(ColumnCountKey, expected))
```

- [ ] **Step 3: Write the instrumented test** `androidTest/.../ui/LibraryDetailUiTest.kt`

```kotlin
package com.keesleemeijer.photos.ui

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTouchInput
import androidx.compose.ui.test.swipeDown
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.keesleemeijer.photos.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Proves (spec §9 / guideline §8): Detail opens on tap; EVERY never-stuck exit invokes close() and
 * dismisses Detail; the density pill switches columns. Tiles tag as tile_${id}; ✕ has cd "Close".
 */
@RunWith(AndroidJUnit4::class)
class LibraryDetailUiTest {

    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    private fun openDetail() {
        rule.onNodeWithTag("tile_P1").performClick()
        rule.onNodeWithTag("detail").assertIsDisplayed()
    }

    @Test fun tapTile_opensDetail() = openDetail()

    @Test fun closeButton_dismissesDetail() {
        openDetail()
        rule.onNodeWithContentDescription("Close").performClick()
        rule.onNodeWithTag("detail").assertDoesNotExist()
    }

    @Test fun tapBackdrop_dismissesDetail() {
        openDetail()
        rule.onNodeWithTag("backdrop").performClick()
        rule.onNodeWithTag("detail").assertDoesNotExist()
    }

    @Test fun swipeDown_dismissesDetail() {
        openDetail()
        rule.onNodeWithTag("detail").performTouchInput { swipeDown() }
        rule.onNodeWithTag("detail").assertDoesNotExist()
    }

    @Test fun back_dismissesDetail() {
        openDetail()
        InstrumentationRegistry.getInstrumentation().runOnMainSync {
            rule.activity.onBackPressedDispatcher.onBackPressed()
        }
        rule.waitForIdle()
        rule.onNodeWithTag("detail").assertDoesNotExist()
    }

    @Test fun densityPill_switchesColumnCount() {
        rule.onNodeWithTag("mosaic_grid").assertColumnCountEquals(3)  // Overview default
        rule.onNodeWithText("Some").performClick()
        rule.onNodeWithTag("mosaic_grid").assertColumnCountEquals(2)  // Browse
    }
}
```

- [ ] **Step 4: Run the instrumented tests on an emulator/device**

Run (emulator/device API 33+ connected): `./gradlew :app:connectedDebugAndroidTest`
Expected: all 6 tests PASS — the never-stuck doctrine is now an automated guard.

- [ ] **Step 5: Commit**

```bash
git add native/app/src/androidTest native/app/src/main/java/com/keesleemeijer/photos/ui/mosaic/MosaicScreen.kt
git commit -m "test(native): instrumented never-stuck exit guard + density-pill column count"
```

---

## Task 10: Performance instrumentation — make "we hold 60fps" a number

The funding pitch surface (spec §7.3): a `:macrobenchmark` module measuring startup + scroll/pinch frame timing, Baseline Profiles to kill first-run jank, R8 on release, and JankStats logging in debug.

**Files:**
- Modify: `native/settings.gradle.kts` (register `:macrobenchmark`)
- Modify: `native/app/build.gradle.kts` (baselineprofile plugin, benchmark buildType, consume profile)
- Modify: `native/app/src/main/AndroidManifest.xml` (`<profileable>`)
- Modify: `native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt` (JankStats)
- Create: `native/macrobenchmark/build.gradle.kts`
- Create: `native/macrobenchmark/src/main/java/com/keesleemeijer/photos/macrobenchmark/{StartupBenchmark,FrameTimingBenchmark,BaselineProfileGenerator}.kt`

> The catalog already carries every coordinate (`android-test` plugin, `androidx-baselineprofile` plugin, `androidx-benchmark-macro`, `androidx-uiautomator`, `metrics-performance`, `profileinstaller`) from Task 1.

- [ ] **Step 1: Register the module** — append to `native/settings.gradle.kts`

```kotlin
include(":macrobenchmark")
```

- [ ] **Step 2: Create** `native/macrobenchmark/build.gradle.kts` (catalog aliases — not hardcoded Kotlin)

```kotlin
import com.android.build.api.dsl.ManagedVirtualDevice

plugins {
    alias(libs.plugins.android.test)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.androidx.baselineprofile)
}

android {
    namespace = "com.keesleemeijer.photos.macrobenchmark"
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        minSdk = 28 // Baseline Profiles apply from API 28
        targetSdk = libs.versions.targetSdk.get().toInt()
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    targetProjectPath = ":app"
    experimentalProperties["android.experimental.self-instrumenting"] = true

    buildTypes {
        create("benchmark") { matchingFallbacks += listOf("release") }
    }

    testOptions.managedDevices.allDevices {
        create<ManagedVirtualDevice>("pixel6Api34") {
            device = "Pixel 6"; apiLevel = 34; systemImageSource = "aosp-atd"
        }
    }
}

baselineProfile {
    managedDevices += "pixel6Api34"
    useConnectedDevices = false // reproducible in CI; set true for a rooted/API33+ device
}

dependencies {
    implementation(libs.androidx.benchmark.macro)
    implementation(libs.androidx.test.ext.junit)
    implementation(libs.androidx.espresso.core)
    implementation(libs.androidx.uiautomator)
}
```

- [ ] **Step 3: Create** `macrobenchmark/.../StartupBenchmark.kt`

```kotlin
package com.keesleemeijer.photos.macrobenchmark

import androidx.benchmark.macro.BaselineProfileMode
import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.StartupTimingMetric
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/** Cold-start time measured three ways so the slide shows the R8 + Baseline-Profile win. */
@RunWith(AndroidJUnit4::class)
class StartupBenchmark {
    @get:Rule val benchmarkRule = MacrobenchmarkRule()

    @Test fun startupNoCompilation() = startup(CompilationMode.None())
    @Test fun startupBaselineProfile() = startup(CompilationMode.Partial(baselineProfileMode = BaselineProfileMode.Require))
    @Test fun startupFullCompilation() = startup(CompilationMode.Full())

    private fun startup(compilationMode: CompilationMode) = benchmarkRule.measureRepeated(
        packageName = TARGET_PACKAGE,
        metrics = listOf(StartupTimingMetric()),
        iterations = 10,
        startupMode = StartupMode.COLD,
        compilationMode = compilationMode,
        setupBlock = { pressHome() },
    ) {
        startActivityAndWait()
        device.waitForIdle()
    }
}

/** applicationId of the app under test. */
const val TARGET_PACKAGE = "com.keesleemeijer.photos"
```

- [ ] **Step 4: Create** `macrobenchmark/.../FrameTimingBenchmark.kt` — the headline metric

```kotlin
package com.keesleemeijer.photos.macrobenchmark

import androidx.benchmark.macro.BaselineProfileMode
import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.FrameTimingMetric
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Direction
import androidx.test.uiautomator.Until
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * The pitch metric. FrameTimingMetric reports frameDurationCpuMs P50/P90/P95/P99 — anything under
 * the frame budget (16.6ms@60Hz) is a frame we did not drop. Scripts a fling-scroll + a pinch across
 * the density tiers: exactly the gestures we claim are silky.
 *
 * Run: ./gradlew :macrobenchmark:connectedBenchmarkAndroidTest \
 *   -P android.testInstrumentationRunnerArguments.class=com.keesleemeijer.photos.macrobenchmark.FrameTimingBenchmark
 */
@RunWith(AndroidJUnit4::class)
class FrameTimingBenchmark {
    @get:Rule val benchmarkRule = MacrobenchmarkRule()

    @Test fun mosaicScrollAndPinch() = benchmarkRule.measureRepeated(
        packageName = TARGET_PACKAGE,
        metrics = listOf(FrameTimingMetric()),
        iterations = 10,
        startupMode = StartupMode.WARM,
        compilationMode = CompilationMode.Partial(baselineProfileMode = BaselineProfileMode.Require),
        setupBlock = { pressHome(); startActivityAndWait() },
    ) {
        val grid = device.wait(Until.findObject(By.res("mosaic_grid")), 5_000)
            ?: error("mosaic_grid not found — is Modifier.testTag(\"mosaic_grid\") + testTagsAsResourceId set?")
        grid.setGestureMargin(device.displayWidth / 5)
        repeat(3) { grid.fling(Direction.DOWN); device.waitForIdle() }
        grid.fling(Direction.UP); device.waitForIdle()
        grid.pinchClose(0.6f); device.waitForIdle()  // toward Feature
        grid.pinchOpen(0.6f); device.waitForIdle()   // toward Overview
    }
}
```

- [ ] **Step 5: Create** `macrobenchmark/.../BaselineProfileGenerator.kt`

```kotlin
package com.keesleemeijer.photos.macrobenchmark

import androidx.benchmark.macro.junit4.BaselineProfileRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Direction
import androidx.test.uiautomator.Until
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Walks the critical user journey so R8 pre-compiles those classes: launch → scroll → pinch tiers →
 * open Detail. Generate: ./gradlew :app:generateBaselineProfile
 */
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule val baselineProfileRule = BaselineProfileRule()

    @Test fun generate() = baselineProfileRule.collect(
        packageName = TARGET_PACKAGE,
        includeInStartupProfile = true,
    ) {
        pressHome()
        startActivityAndWait()
        val grid = device.wait(Until.findObject(By.res("mosaic_grid")), 5_000) ?: return@collect
        grid.setGestureMargin(device.displayWidth / 5)
        repeat(3) { grid.fling(Direction.DOWN); device.waitForIdle() }
        grid.pinchOpen(0.6f); device.waitForIdle()
        grid.pinchClose(0.6f); device.waitForIdle()
        // Open Detail (the Theatre) so the shared-element transition is profiled.
        device.findObject(By.res("mosaic_grid"))?.children?.firstOrNull()?.click()
        device.wait(Until.hasObject(By.res("detail")), 3_000)
        device.waitForIdle()
    }
}
```

- [ ] **Step 6: Modify** `native/app/build.gradle.kts` — apply the plugin, add the benchmark buildType, consume the profile

In the `plugins { }` block add:
```kotlin
    alias(libs.plugins.androidx.baselineprofile)
```
In `buildTypes { release { ... } }`, add as the last line inside `release`:
```kotlin
            baselineProfile.automaticGenerationDuringBuild = true // bake the profile into release
```
Add a `benchmark` buildType after `release`:
```kotlin
        create("benchmark") {
            initWith(buildTypes.getByName("release"))
            signingConfig = signingConfigs.getByName("debug")
            matchingFallbacks += listOf("release")
            isDebuggable = false
            baselineProfile.automaticGenerationDuringBuild = false // measured via CompilationMode in tests
        }
```
In `dependencies { }`, add:
```kotlin
    baselineProfile(project(":macrobenchmark"))
```

- [ ] **Step 7: Modify** `native/app/src/main/AndroidManifest.xml` — add the `tools` namespace and `<profileable>`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
```
Inside `<application>` (first child):
```xml
        <!-- Lets Macrobenchmark read trace sections from a non-debuggable build. -->
        <profileable android:shell="true" tools:targetApi="29" />
```

- [ ] **Step 8: Replace** `native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt` — wire JankStats (debug only)

```kotlin
package com.keesleemeijer.photos

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTagsAsResourceId
import androidx.compose.ui.semantics.semantics
import androidx.metrics.performance.JankStats
import androidx.metrics.performance.PerformanceMetricsState
import com.keesleemeijer.photos.ui.LibraryRoot
import com.keesleemeijer.photos.ui.theme.AppTheme

class MainActivity : ComponentActivity() {

    private lateinit var jankStats: JankStats
    private lateinit var metricsStateHolder: PerformanceMetricsState.Holder

    private val jankListener = JankStats.OnFrameListener { frameData ->
        if (frameData.isJank) {
            Log.w("JankStats", "JANK ${"%.1f".format(frameData.frameDurationUiNanos / 1_000_000.0)}ms states=${frameData.states}")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { Root() }

        metricsStateHolder = PerformanceMetricsState.getHolderForHierarchy(window.decorView)
        jankStats = JankStats.createAndTrack(window, jankListener)
        jankStats.isTrackingEnabled = BuildConfig.DEBUG  // development microscope; authoritative numbers come from :macrobenchmark
        metricsStateHolder.state?.putState("Activity", javaClass.simpleName)
    }

    override fun onResume() { super.onResume(); jankStats.isTrackingEnabled = BuildConfig.DEBUG }
    override fun onPause() { super.onPause(); jankStats.isTrackingEnabled = false }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
private fun Root() {
    AppTheme {
        Surface(
            modifier = Modifier.fillMaxSize().semantics { testTagsAsResourceId = true },
            color = AppTheme.tokens.colors.canvas,
        ) { LibraryRoot() }
    }
}
```

- [ ] **Step 9: Generate the profile, build release, and capture the numbers**

Run (managed device downloads on first run):
```
./gradlew :app:generateBaselineProfile
./gradlew :app:assembleRelease
./gradlew :macrobenchmark:connectedBenchmarkAndroidTest
```
Expected: a baseline profile is generated and baked into the release apk; `assembleRelease` succeeds with R8 + resource shrinking (apk in the ~20–30 MB target); the benchmark prints `frameDurationCpuMs` P50/P90/P99 and `timeToInitialDisplayMs` — the slide numbers ("we hold 60fps through a full pinch-zoom").

- [ ] **Step 10: Commit**

```bash
git add native/settings.gradle.kts native/app/build.gradle.kts native/app/src/main/AndroidManifest.xml native/app/src/main/java/com/keesleemeijer/photos/MainActivity.kt native/macrobenchmark
git commit -m "feat(native): perf — macrobenchmark, baseline profiles, JankStats, R8 release"
```

---

## Self-review (run against the spec)

- **§2 scope:** Mosaic spine (Tasks 6) ✓ · density tiers + pinch-snap (3, 6) ✓ · Detail/Theatre never-stuck (8) ✓ · Living Plane (7) ✓ · ~80 bundled photos — seeded with 16, JSON scales (4) ✓.
- **§4 architecture / 3 seams:** `PhotoSource`+`BundledAssetSource` (4) ✓ · `AppTheme` tokens (2) ✓ · one `LibraryViewModel`/`LibraryUiState` rendered by Mosaic+Plane with Detail above (5, 8) ✓ · `AppContainer` manual DI (4) ✓.
- **§5 data model:** `Photo`/`Aspect`/`DensityTier`/`ViewMode`/`PhotoSource` verbatim (3) · `photos.json` manifest + Coil `file:///android_asset` per-tier sizing (4, 6) ✓.
- **§6 view modes:** staggered grid, FullLine panoramas, `animateItem` FLIP, pinch→`nextTier` (6) · single-layer Plane (7) · `SharedTransitionLayout` morph + `AnimatedContent(mode)` so place survives a mode switch (8) ✓.
- **§7 motion/gestures/perf:** soft-ease tweens in tokens (2) · `detectTransformGestures` (6, 7) · BackHandler/PredictiveBackHandler/Esc/swipe/backdrop/✕ (8) · Macrobenchmark/Baseline Profile/JankStats/R8 (10) ✓.
- **§9 testing:** `PhotoManifestParserTest` (4) · `NextTierTest` (3) · `LibraryViewModelTest` (5) · `PackPlaneTest` (7) · instrumented never-stuck guard + tier-pill (9) · smoothness benchmarks (10) ✓.
- **§10 decisions:** Overview landing · density-snap canonical, Plane secondary · Read-more fun-fact · dark only · Plane dwell/ambient deferred (stub in 7) ✓.
- **§11 constraints:** Android-only, native Kotlin/Compose, single app module + a test-only `:macrobenchmark` · no Room/Hilt/cloud/permissions ✓.

**Placeholder scan:** no `TODO`/"add error handling"/"similar to Task N" — every code step is complete. The Plane deferred polish is an explicit, spec-sanctioned stub (§10.6), not a gap. **Type consistency:** one `nextTier` (domain); `sharedKey` defined once and imported by tile + card; `PhotoTile`/`MosaicScreen` keep stable nullable-scope signatures across Tasks 6→8; `close()`/`onDetailPage`/`selectTier` names match between ViewModel, `LibraryContent`, and tests.

**Known polish items (noted, out of prototype scope):** pixel-perfect radius lerp 22→0 during the morph; morph-from-Plane (needs the shared key on plane tiles); bundled `ABC Diatype` font (system fallback ships).

