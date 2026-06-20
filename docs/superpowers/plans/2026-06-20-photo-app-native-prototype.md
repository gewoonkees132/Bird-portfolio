# Native Android Photo App (Funding Prototype) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This plan is sized for **Opus 4.8 subagents**: each task is a self-contained unit one subagent can own end-to-end (read the named source-of-truth sections, write the files, run the stated verification, report back). Dispatch tasks **in order** — later tasks compile against earlier ones.

**Goal:** Build the fundable vertical slice specified in `docs/superpowers/specs/2026-06-20-photo-app-native-prototype-design.md`: a native Android (Kotlin + Jetpack Compose) photo app with a three-tier zoomable **Mosaic** (All → Some → One), a free-zoom **Living Plane**, and a **Detail / Theatre** overlay with the full never-stuck exit model — running on a set of bundled photos, offline, at a held 60fps.

**Architecture:** Approach 3 from the spec (§4) — one Gradle module, MVVM with unidirectional data flow, three explicit seams drawn from day one so Phase 2/3 growth is additive:
- **Seam #1 `PhotoSource`** (domain interface) — `BundledAssetSource` now; `MediaStoreSource` / `ImmichSource` later, zero UI change.
- **Seam #2 `AppTheme`** — every `app/designguideline.md` token lives once in Compose; nothing hardcodes cobalt or a radius.
- **Seam #3 view-mode abstraction** — one `LibraryViewModel` owns `LibraryUiState`; `MosaicScreen` and `PlaneScreen` are two renderers of that state, `DetailOverlay` sits above both.

**Tech stack:** Kotlin 2.x · Jetpack Compose (BOM) · `LazyVerticalStaggeredGrid` · `SharedTransitionLayout` · Coil 3 (`AsyncImage` from `file:///android_asset/...`) · manual DI (`AppContainer`) · JUnit + `kotlinx-coroutines-test` (JVM) + Compose UI test (instrumented) · JankStats / Macrobenchmark for the smoothness numbers · Gradle + AGP 8.x. **No** Room, Hilt, multi-module, cloud, accounts, or runtime permissions in the prototype (spec §11).

---

## Source of truth & key facts

- **Binding design reference:** `app/designguideline.md` is **normative** — tokens (§3–4.6), the All→Some→One scale model (§6), components (§9), the never-stuck doctrine (§8), a11y (§10). The guideline's three web-specific sections (§11 performance, §12 View Transitions, §14 vanilla-JS) are **translated to native equivalents** by the spec (§6) — implement the native equivalent, not the CSS.
- **Binding architecture/scope:** `docs/superpowers/specs/2026-06-20-photo-app-native-prototype-design.md` — sections referenced inline as "spec §N".
- **The web portfolio (`public/`) is a design reference, not source** (spec §3). No JS is reused; its plane mechanics/focus-tracking/label behavior *inform* the native build only.
- **There is no existing Android code in this repo.** `app/` currently holds only `designguideline.md`. This plan scaffolds a Gradle project from scratch. **Decision (verify in Task 1):** keep the guideline at `app/designguideline.md` and root the Android project at repo root with the Gradle module named **`:app`** (Android convention) — the doc and the module coexist because the doc is just a Markdown file inside the module dir. If a subagent finds this collides confusingly, the fallback is to root the Android project under `android/` and leave `app/designguideline.md` where it is; pick one in Task 1 Step 1 and record it.
- **Toolchain must be verified before building** (Task 1 Step 0). Required: JDK **17**, Android SDK (compileSdk **35**, minSdk **26** — `SharedTransitionLayout` + predictive back are comfortable there), Gradle **8.7+**, AGP **8.5+**, Kotlin **2.0+** with the Compose compiler Gradle plugin. If the toolchain is absent in the execution environment, **stop and report** — this plan produces a buildable app, and "buildable" is the only honest definition of done for the code tasks.
- **Photo seed set.** The spec calls for ~80 user-curated photos (spec §10 open decision 7, deferred to the user). The prototype is **unblocked without them**: bundle the **16 existing portfolio WebPs** from `public/files/P*.webp` as the placeholder set so every screen renders real images today. The manifest (`assets/photos.json`) is authored from the portfolio's `SPECIES` + `BIRD_FACTS` data in `public/app.js` (names, latin, vitals, fact, aspect). Swapping in the curated 80 is then *editing JSON + dropping files*, not code (spec §5).
- **Aspect → enum mapping** (spec §5, guideline §5): portfolio shape `L` → `Landscape(1.5)`, `V` → `Portrait(0.667)`, `W`/super-wide → `Panorama(2.333)`.
- **Commit policy:** each task ends with a commit step as a checkpoint. Under subagent-driven-development the **orchestrator** commits after a subagent's task verifies green (the subagent reports, the orchestrator commits). We are on branch `claude/subagents-opus-writing-plan-n9rse7`, which already carries the design spec + guideline.
- **Testing reality:** TDD only where it earns its keep (spec §9) — pure logic (manifest parse, tier math, ViewModel reductions) is unit-tested test-first on the JVM; UI behavior (Detail opens, every exit calls `close()`, pill switches columns) is covered by instrumented Compose tests; smoothness is a Macrobenchmark number, not an assertion.

## File structure (created by this plan)

```
settings.gradle.kts · build.gradle.kts · gradle/libs.versions.toml      [Task 1]
app/
  build.gradle.kts · proguard-rules.pro
  designguideline.md                      ← already present (binding ref)
  src/main/
    AndroidManifest.xml
    java/com/keesleemeijer/photo/
      PhotoApp.kt · MainActivity.kt
      domain/   Photo.kt Aspect.kt DensityTier.kt ViewMode.kt PhotoSource.kt   [Task 2]  SEAM #1
      domain/   TierMath.kt                                                    [Task 2]
      data/     BundledAssetSource.kt AppContainer.kt                          [Task 3]
      ui/theme/ AppTheme.kt Color.kt Type.kt Shape.kt Motion.kt Elevation.kt   [Task 4]  SEAM #2
      ui/components/ PhotoTile.kt DensityPill.kt MetaRow.kt CloseButton.kt     [Task 5]
      ui/        LibraryViewModel.kt LibraryUiState.kt                         [Task 6]  SEAM #3
      ui/mosaic/ MosaicScreen.kt                                              [Task 7]
      ui/plane/  PlaneScreen.kt                                               [Task 8]
      ui/detail/ DetailOverlay.kt                                             [Task 9]
      ui/        LibraryRoot.kt                                               [Task 10]
    assets/
      photos.json                          ← the manifest                     [Task 3]
      photos/P1..P16-*.webp                ← seed images (from public/files)   [Task 3]
  src/test/java/...                        ← JVM unit tests             [Tasks 2,3,6]
  src/androidTest/java/...                 ← Compose UI tests                 [Task 9]
benchmark/                                 ← Macrobenchmark module       [Task 11]
```

---

## Task 1: Project scaffold — Gradle, Compose, package skeleton

**Owns:** the buildable shell. Nothing renders yet; the goal is a green `:app:compileDebugKotlin`.

**Files:** `settings.gradle.kts`, root `build.gradle.kts`, `gradle/libs.versions.toml`, `app/build.gradle.kts`, `app/proguard-rules.pro`, `app/src/main/AndroidManifest.xml`, `app/src/main/java/com/keesleemeijer/photo/{PhotoApp,MainActivity}.kt`, and the empty package dirs.

- [ ] **Step 0: Verify the toolchain** (gate — do not proceed if this fails)

```bash
java -version            # expect 17.x
echo "$ANDROID_HOME/$ANDROID_SDK_ROOT"   # one must point at an SDK with platform-35 + build-tools
gradle --version 2>/dev/null || echo "will use the wrapper once generated"
```
Expected: JDK 17 and an Android SDK present. If either is missing, **stop and report** which is absent — the rest of this plan cannot be verified without it.

- [ ] **Step 1: Decide project root vs. `app/designguideline.md` coexistence**

Confirm the Gradle module dir `app/` can hold both the Android sources and the existing `designguideline.md` (it can — Gradle ignores stray `.md`). Record the decision in a one-line comment at the top of `app/build.gradle.kts`. (Fallback `android/` root only if a real collision appears — none is expected.)

- [ ] **Step 2: Version catalog** — create `gradle/libs.versions.toml` pinning: AGP 8.5+, Kotlin 2.0+, `kotlin("plugin.compose")`, Compose BOM (2024.09+), `androidx.activity:activity-compose`, `lifecycle-viewmodel-compose`, `foundation` (for staggered grid + shared transition), `coil-compose` + `coil-network`/`coil-gif` as needed (Coil 3), `junit`, `kotlinx-coroutines-test`, `androidx.compose.ui:ui-test-junit4`, `androidx.test.ext:junit`, `espresso-core`.

- [ ] **Step 3: Gradle files** — root `build.gradle.kts` (plugins `apply false`), `settings.gradle.kts` (`include(":app")`, `dependencyResolutionManagement` with `google()` + `mavenCentral()`), `app/build.gradle.kts` (`com.android.application` + `kotlin.android` + `kotlin.plugin.compose`; `compileSdk 35`, `minSdk 26`, `targetSdk 35`; `buildFeatures { compose = true }`; `buildTypes.release { isMinifyEnabled = true; proguardFiles(...) }` — R8 on for the Baseline-Profile story in Task 11).

- [ ] **Step 4: Generate the Gradle wrapper** so subagents have a hermetic build:
```bash
gradle wrapper --gradle-version 8.7
```
Expected: `gradlew`, `gradlew.bat`, `gradle/wrapper/*` created.

- [ ] **Step 5: Manifest + Application + Activity** — `AndroidManifest.xml` (single `MainActivity`, `android:theme` a thin Material3 splash, **no** permissions — bundled assets need none, spec §2.1); `PhotoApp : Application` (holds the `AppContainer`, created in Task 3 — stub the field for now); `MainActivity` sets `enableEdgeToEdge()` + an empty `setContent { }` placeholder.

- [ ] **Step 6: Create the empty package directories** listed in File structure (so later tasks drop files into a known tree).

- [ ] **Step 7: Verify it compiles**
```bash
./gradlew :app:compileDebugKotlin --console=plain
```
Expected: `BUILD SUCCESSFUL`. (Full `assembleDebug` is deferred until assets exist in Task 3.)

- [ ] **Step 8: Commit (checkpoint)** — `git add` the scaffold; `git commit -m "Scaffold native photo app: Gradle + Compose + package skeleton"`.

---

## Task 2: Domain model + tier math (`PhotoSource` seam #1) — TDD

**Owns:** the pure, framework-free core. Fully JVM-unit-testable; no Android types.

**Files:** `domain/{Photo,Aspect,DensityTier,ViewMode,PhotoSource}.kt`, `domain/TierMath.kt`, plus `app/src/test/.../TierMathTest.kt`.

- [ ] **Step 1: Model types** (spec §5, verbatim shape):
```kotlin
data class Photo(
  val id: String, val assetPath: String, val name: String,
  val latin: String?, val aspect: Aspect, val takenAt: LocalDate?,
  val vitals: Map<String, String>?, val fact: String?,
)
enum class Aspect(val ratio: Float) { Landscape(1.5f), Portrait(0.667f), Panorama(2.333f) }
enum class DensityTier(val columns: Int) { Overview(3), Browse(2), Feature(1) }
enum class ViewMode { Mosaic, Plane }
interface PhotoSource { suspend fun photos(): List<Photo> }   // SEAM #1 — the whole interface
```

- [ ] **Step 2: Write `TierMathTest` FIRST** (spec §9 "write test-first"). The pure function maps a cumulative pinch-scale to the next `DensityTier` using guideline §6 thresholds (`<0.8` → denser, `>1.25` → sparser) with rubber-band clamping at the extremes. Cases: `0.7` from `Browse` → `Browse-then-denser` step toward `Feature`? — encode the guideline's direction precisely (**pinch-out / scale-up → sparser → Overview**; **pinch-in / scale-down → denser → Feature**, then Detail). Test the thresholds, the clamp at `Overview`/`Feature`, and that a scale inside `[0.8, 1.25]` is a no-op (snaps back to current).

- [ ] **Step 3: Implement `TierMath.nextTier(current: DensityTier, cumulativeScale: Float): DensityTier`** to make the test green. Keep it a top-level pure function (no Compose, no Android).

- [ ] **Step 4: Run the tests**
```bash
./gradlew :app:testDebugUnitTest --tests '*TierMathTest' --console=plain
```
Expected: green. Re-run `:app:compileDebugKotlin` to confirm the module still builds.

- [ ] **Step 5: Commit** — `"Domain model + PhotoSource seam + test-driven tier math"`.

---

## Task 3: Data layer — `BundledAssetSource`, manifest, seed photos, DI — TDD

**Owns:** filling the photo list from bundled assets. The prototype's only `PhotoSource` implementation.

**Files:** `data/BundledAssetSource.kt`, `data/AppContainer.kt`, `app/src/main/assets/photos.json`, `app/src/main/assets/photos/P*.webp`, `app/src/test/.../BundledAssetSourceTest.kt`. Wires `PhotoApp.container`.

- [ ] **Step 1: Author the manifest** `assets/photos.json` from the portfolio data. Read `public/app.js` `SPECIES` (id, vernacular→`name`, latin, shape→`aspect`) and `BIRD_FACTS` (vitals → `range·size·diet`-style map, `lede`/`fun_fact` → `fact`). 16 entries, ids `P1`–`P16` (no `P8` species gap — match the portfolio). Shape→aspect per the key-facts mapping. Example entry:
```json
{ "id": "P5", "assetPath": "photos/P5-Green_Bee-eater.webp",
  "name": "Green Bee-eater", "latin": "Merops orientalis", "aspect": "Landscape",
  "takenAt": null, "vitals": { "range": "S. Asia", "size": "21 cm", "diet": "insects" },
  "fact": "Sallies from a perch to hawk bees and dragonflies in mid-air." }
```
Use `null` for unknown `latin`/`takenAt`/`vitals`/`fact` so the **null-safe rendering** path is exercised (spec §5).

- [ ] **Step 2: Copy the seed images** from `public/files/P*.webp` into `app/src/main/assets/photos/` (16 files; do **not** read the bytes — copy by path). Confirm the filenames in the manifest's `assetPath` match exactly.
```bash
mkdir -p app/src/main/assets/photos && cp public/files/P*.webp app/src/main/assets/photos/
ls app/src/main/assets/photos | wc -l   # expect 16
```

- [ ] **Step 3: Write `BundledAssetSourceTest` FIRST** — parse a small fixture JSON (place under `src/test/resources/`), assert: count, a fully-populated entry, and an entry with **all four nullable fields null** renders to a valid `Photo` (no crash, nulls preserved). This is the spec §9 "manifest → List<Photo>, null-field handling" guard. Parse via `org.json` (no new dep) or `kotlinx.serialization` (add to the catalog if chosen — justify the dep per guideline §14's "justify any dependency" spirit; `org.json` is dependency-free and preferred here).

- [ ] **Step 4: Implement `BundledAssetSource(assets: AssetManager) : PhotoSource`** — `suspend fun photos()` reads `assets.open("photos.json")` on `Dispatchers.IO`, parses to `List<Photo>`. Map the `aspect` string to the enum; tolerate missing optional keys.

- [ ] **Step 5: `AppContainer`** — manual DI (Hilt deferred, spec §4): exposes `photoSource: PhotoSource = BundledAssetSource(context.assets)` and a `LibraryViewModel` factory (filled in Task 6). Instantiate it in `PhotoApp.onCreate()`.

- [ ] **Step 6: Verify**
```bash
./gradlew :app:testDebugUnitTest --tests '*BundledAssetSourceTest' --console=plain
./gradlew :app:assembleDebug --console=plain      # assets now exist → full apk builds
```
Expected: tests green; `BUILD SUCCESSFUL`; the debug apk is produced (sanity-check size is sane, ~tens of MB).

- [ ] **Step 7: Commit** — `"Data layer: BundledAssetSource + photos.json manifest + 16 seed images + AppContainer"`.

---

## Task 4: Theme seam #2 — `AppTheme` from the guideline tokens

**Owns:** every design token, once. After this, no later task hardcodes a color, radius, or duration — they read `AppTheme`.

**Files:** `ui/theme/{AppTheme,Color,Type,Shape,Motion,Elevation}.kt`. Source of truth: `app/designguideline.md` §3–4.6.

- [ ] **Step 1: `Color.kt`** — the dark-theme surface set verbatim from guideline §4.1: `field #F2EEE5`, `blue #1635EE`, `blueLift #4d63ff`, `charcoal #1A1A1A`, `canvas #161616`, `panel white@5.5%`, `hairline white@12%`, `inkOnDark`, `inkMuted white@60%`, `inkFaint white@40%`. Build a Material3 `darkColorScheme` mapping (`background=canvas`, `surface=panel`, `primary=blueLift`), but expose the raw brand tokens too — **cobalt is a point color, never a large fill** (guideline §4.1 rule).

- [ ] **Step 2: `Type.kt`** — the six roles from guideline §4.2 as a `Typography` + named extra styles (`heroName` 700 −0.02em, `browseName` 600/700, `captionName` 700, `latin` 300 *italic*, `body` 400/1.55, `codeMono` 500 0.12–0.14em UPPERCASE). Use a grotesque family with `system-ui` fallback; declare a `mono` `FontFamily(Monospace)`. **Hierarchy is size-first, weight-second — never color** (guideline §4.2).

- [ ] **Step 3: `Shape.kt`** — the two-radius rhyme (guideline §4.4): `rTile = 18.dp` (range 16–22), `rCard = 24.dp`, `rPill = 999.dp` via `RoundedCornerShape(percent = 50)`. Nothing else is rounded.

- [ ] **Step 4: `Elevation.kt`** — the three soft shadows (guideline §4.5) as reusable `Modifier`s (`Modifier.softTileShadow()`, `…softCardShadow()`, `…softDetailShadow()`) using `shadow(elevation, shape, ambientColor, spotColor)` tuned soft/wide/low-opacity; the card adds the 1px inner white ring.

- [ ] **Step 5: `Motion.kt`** — the §4.6 motion table as Compose specs: `densitySnap = tween(280, CubicBezierEasing(.2f,0f,0f,1f))`, `detailMorph = tween(300, same easing)`, `scrollReveal` (220–260ms ease-out, opacity+12dp translate), micro 150ms. Add a `rememberReducedMotion()` reading the system animator scale → callers crossfade instead of scale/slide (guideline §4.6, §10).

- [ ] **Step 6: `AppTheme.kt`** — a `@Composable fun AppTheme(content)` that installs the color scheme, typography, shapes, and a `CompositionLocal` for the extra tokens (elevation modifiers, motion specs, brand colors). Default dark (spec §10 decision 4); leave a `light` flag wired but unused.

- [ ] **Step 7: Verify** — `./gradlew :app:compileDebugKotlin`. Add a trivial `@Preview` of a swatch row if useful, but no test (tokens are declarations).

- [ ] **Step 8: Commit** — `"Theme seam: AppTheme from designguideline tokens (color/type/shape/elevation/motion)"`.

---

## Task 5: Components — `PhotoTile`, `DensityPill`, `MetaRow`, `CloseButton`

**Owns:** the reusable Compose pieces from guideline §9. Each reads `AppTheme` only.

**Files:** `ui/components/{PhotoTile,DensityPill,MetaRow,CloseButton}.kt`.

- [ ] **Step 1: `PhotoTile`** (guideline §9.2) — rounded (`rTile`) `overflow:clip` box at the photo's `aspect.ratio`; Coil `AsyncImage(model = "file:///android_asset/${photo.assetPath}", contentScale = Crop)`; bottom scrim gradient + caption. **Caption density is a parameter** driven by tier: `Overview` → mono code chip only; `Browse` → + name (`browseName`); `Feature` → + latin. Soft tile shadow. `onClick` → open Detail.

- [ ] **Step 2: `DensityPill`** (guideline §9.3) — bottom-center frosted glass pill (`rPill`, `Modifier.blur`/`graphicsLayer` backdrop approximation), segmented **All · Some · One**, active segment filled cobalt. Emits `onSelect(DensityTier)`. (It and pinch are two routes to the same tier state — spec §6.1.)

- [ ] **Step 3: `MetaRow`** (guideline §9.5) — cobalt **glow tick** (8px dot) · name 700 · latin 300 italic · mono code · mono vitals (`range · size · diet`). Null-safe: skip latin/vitals when null.

- [ ] **Step 4: `CloseButton`** — pill ✕, **≥48dp** hit target (guideline §10 / §8.2), high contrast, never auto-hidden. `onClick = close`.

- [ ] **Step 5: Verify + `@Preview`** each component over a canvas background; `./gradlew :app:compileDebugKotlin`. Eyeball previews if an interactive environment is available (else rely on Task 12's on-device pass).

- [ ] **Step 6: Commit** — `"Components: PhotoTile, DensityPill, MetaRow, CloseButton (guideline §9)"`.

---

## Task 6: `LibraryViewModel` + `LibraryUiState` (seam #3) — TDD

**Owns:** the single source of UI truth and the unidirectional event reducer. No business logic lives in composables (spec §4).

**Files:** `ui/LibraryViewModel.kt`, `ui/LibraryUiState.kt`, `app/src/test/.../LibraryViewModelTest.kt`. Updates `AppContainer` factory.

- [ ] **Step 1: `LibraryUiState`** (spec §4 seam #3) — `photos: List<Photo>`, `mode: ViewMode = Mosaic`, `tier: DensityTier = Overview` (spec §10 decision 2), `focusedId: String? = null`, `detailOpen: Boolean = false`, plus `loading: Boolean`.

- [ ] **Step 2: Write `LibraryViewModelTest` FIRST** (spec §9) using `kotlinx-coroutines-test` + a fake `PhotoSource`. Assert the event→state reductions: `load()` fills `photos` and clears `loading`; `onPinchSettle(scale)` routes through `TierMath` to update `tier`; `onModeToggle()` flips `Mosaic↔Plane` **without losing `focusedId`** (the cross-mode continuity, spec §6.4); `onTileTap(id)` sets `focusedId` + `detailOpen=true`; `close()` sets `detailOpen=false` (keeps `focusedId` for the restore-focus a11y, guideline §10); `onPage(delta)` moves `focusedId` along the list with clamping.

- [ ] **Step 3: Implement `LibraryViewModel`** — exposes `StateFlow<LibraryUiState>`; `init { load() }` collects `photoSource.photos()`; the events above mutate state via `update {}`. Add the factory to `AppContainer`.

- [ ] **Step 4: Verify** — `./gradlew :app:testDebugUnitTest --tests '*LibraryViewModelTest'` green; module compiles.

- [ ] **Step 5: Commit** — `"ViewModel seam: LibraryViewModel + LibraryUiState with test-driven reductions"`.

---

## Task 7: `MosaicScreen` — the spine (three-tier staggered grid + pinch-to-snap)

**Owns:** the All→Some→One grid (spec §6.1, guideline §5–6).

**Files:** `ui/mosaic/MosaicScreen.kt`.

- [ ] **Step 1: Grid** — `LazyVerticalStaggeredGrid(columns = StaggeredGridCells.Fixed(state.tier.columns))`, tight gap (6–10dp, guideline §4.3); each item a `PhotoTile` at `photo.aspect.ratio`; `Panorama` → `StaggeredGridItemSpan.FullLine` and **never first/last** (guideline §5 — if a panorama would bookend, the layout pass nudges it inward).

- [ ] **Step 2: Pinch-to-snap** — wrap the grid container in `Modifier.pointerInput { detectTransformGestures { _, _, zoom, _ -> live cumulative scale } }`; apply the live `zoom` as a `graphicsLayer { scaleX = scaleY = liveScale }` on the container (transform-only, guideline §11); on gesture **end**, call `vm.onPinchSettle(cumulativeScale)` → column count changes → reset live scale to 1.

- [ ] **Step 3: FLIP travel** — give each item `Modifier.animateItem(placementSpec = AppTheme.motion.densitySnap)` so tiles glide to new slots on a tier change (the §6 FLIP, native).

- [ ] **Step 4: Rubber-band + reveal** — clamp past Overview/Feature with a soft over-scale (no hard wall, guideline §6); item-enter uses the §4.6 scroll-reveal (opacity 0→1, translateY 12dp→0). Honor `rememberReducedMotion()` → crossfade.

- [ ] **Step 5: Wire** the `DensityPill` (bottom-center) to `vm.onTier(...)`; tap a tile → `vm.onTileTap(id)`.

- [ ] **Step 6: Verify** — compiles; if an emulator/device is available, run and confirm pinch snaps between 3/2/1 columns with tiles traveling. Otherwise defer the live check to Task 12.

- [ ] **Step 7: Commit** — `"MosaicScreen: staggered three-tier grid with pinch-to-snap FLIP"`.

---

## Task 8: `PlaneScreen` — the Living Plane (the smoothness showcase)

**Owns:** the free-zoom spatial mode (spec §6.2, guideline §6 "Living Plane").

**Files:** `ui/plane/PlaneScreen.kt`.

- [ ] **Step 1: Layout** — pack all photos into one plane sized to fit-to-screen at min zoom (compute a simple shelf/justified packing from aspect ratios; exact algorithm is the screen's own concern, but every photo visible at `zoom = min`).

- [ ] **Step 2: Single composited transform** — one content layer with `Modifier.graphicsLayer { scaleX = zoom; scaleY = zoom; translationX = panX; translationY = panY }`; `detectTransformGestures` drives continuous pinch-zoom + pan. **One layer, GPU-cheap** — the visible proof native is silk (spec §6.2, §7.3). `touch-action` equivalent: consume gestures so nothing underneath scrolls.

- [ ] **Step 3: Tap → Detail** — hit-test the tapped photo in plane space → `vm.onTileTap(id)` (morph handled in Task 9/10).

- [ ] **Step 4: Defer the optional polish** — dwell-snap-to-center + ambient dimming of unfocused tiles are **out of the prototype** (spec §10 decision 6: free pan/zoom + tap-to-Detail is enough for the demo). Leave a `// PLANE POLISH (deferred): dwell-snap, ambient dim — spec §6.2` marker.

- [ ] **Step 5: Verify** — compiles; live smoothness check in Task 12.

- [ ] **Step 6: Commit** — `"PlaneScreen: single-layer free-zoom Living Plane"`.

---

## Task 9: `DetailOverlay` — the Theatre + never-stuck exits — UI-tested

**Owns:** the immersive single-photo view and the hard requirement that it is **never stuck** (guideline §8, spec §6.3). This is the task with the automated guard.

**Files:** `ui/detail/DetailOverlay.kt`, `app/src/androidTest/.../DetailOverlayTest.kt`.

- [ ] **Step 1: Anatomy** (guideline §9.5 / spec §6.3) — dimmed+blurred backdrop · rounded photo card (`rCard`, deepest soft shadow, radius morph 22→0) · `MetaRow` · expandable fun-fact lede behind a "Read more" (spec §10 decision 3) · persistent `CloseButton` · `HorizontalPager` for prev/next **inside content** (clear of the predictive-back edge zone, spec §7.2).

- [ ] **Step 2: The five never-stuck exits, all calling one `close()`** (guideline §8, spec §6.3):
  1. **Swipe-down-to-dismiss** — `Modifier.pointerInput` vertical drag; photo tracks the finger 1:1, alpha eases toward 0; commits past **~110–120dp / 25% / fast-flick velocity**, else snaps back.
  2. **Persistent ✕** (the Task 5 `CloseButton`, ≥48dp).
  3. **Tap backdrop** — any tap outside the photo card.
  4. **Hardware Back** — `BackHandler { close() }` (+ predictive-back friendly).
  5. **Esc** — `onKeyEvent` Key.Escape → `close()` (keyboard parity).
  Every path invokes the **same** `close` lambda (`vm.close()`).

- [ ] **Step 3: a11y** (guideline §10) — `Modifier.semantics { role = Dialog; …}`, move focus to ✕ on open, restore to the originating tile on close, live-announce the photo name on open/page, `contentDescription` carries the name, decorative chrome `clearAndSetSemantics {}`.

- [ ] **Step 4: Write `DetailOverlayTest` (instrumented Compose)** — the spec §9 guard: open Detail on tile tap; then assert **each of the five exits invokes `close()`** (drive ✕ click, backdrop tap, simulated back, Esc key, and a swipe-down past threshold; assert the overlay leaves composition / the `close` spy fires). Also assert the density pill switches columns (can live here or in a `MosaicScreenTest`).

- [ ] **Step 5: Verify**
```bash
./gradlew :app:connectedDebugAndroidTest --console=plain   # requires an emulator/device
```
Expected: green — **every never-stuck exit calls `close()`**. If no device is attached in the environment, report that the instrumented test is written and pending a device; do not mark Step 5 done on a green compile alone.

- [ ] **Step 6: Commit** — `"DetailOverlay: Theatre + five never-stuck exits, UI-tested"`.

---

## Task 10: Wire the modes — shared Detail morph + cross-mode continuity

**Owns:** assembling Mosaic, Plane, and Detail into one app with the shared-element morph and place-survives-mode-switch behavior (spec §6.4, guideline §12 native).

**Files:** `ui/LibraryRoot.kt`, `MainActivity.kt` (`setContent`).

- [ ] **Step 1: `LibraryRoot`** — collect `LibraryUiState`; wrap in `SharedTransitionLayout`. Render `AnimatedContent(targetState = state.mode)` crossfading `MosaicScreen` ↔ `PlaneScreen`; render `DetailOverlay` **above** the `AnimatedContent` (top-level) so it morphs from *either* mode (spec §6.4).

- [ ] **Step 2: Shared-element morph** — give the tapped `PhotoTile` and the Detail photo a shared `rememberSharedContentState(key = photo.id)` + `sharedElement(...)` so Compose morphs position/size/radius (22→0) in one soft 300ms move (`AppTheme.motion.detailMorph`). Reverse on swipe-down (the shared element runs backward automatically).

- [ ] **Step 3: Mode toggle + continuity** — a quiet control (or the zoom-pill `fit` affordance) calls `vm.onModeToggle()`; because `focusedId` lives in `LibraryUiState`, your place survives the Mosaic↔Plane switch (spec §6.4).

- [ ] **Step 4: `MainActivity.setContent { AppTheme { LibraryRoot(vm) } }`**, vm from `AppContainer`.

- [ ] **Step 5: Verify** — `./gradlew :app:assembleDebug`; install + launch on a device if available: tap a tile in **both** modes → it morphs to Detail; toggle modes with Detail's focus preserved.

- [ ] **Step 6: Commit** — `"Wire modes: SharedTransitionLayout morph + cross-mode focus continuity"`.

---

## Task 11: Performance instrumentation — the pitch is a number

**Owns:** the spec §7.3 budget made measurable (this *is* the funding evidence), plus the release-build jank fixes.

**Files:** `app/build.gradle.kts` (R8 already on from Task 1; add Baseline Profile + `androidx.profileinstaller`), `benchmark/` Macrobenchmark module, JankStats wiring in `PhotoApp`.

- [ ] **Step 1: Coil display-size per tier** — confirm each tier requests its display size, not 1600px (Overview ~110px) via Coil `size`/`ImageRequest`; enable Coil memory+disk cache; neighbor preload for Plane pan and Detail paging (spec §5, §7.3, guideline §11 native).

- [ ] **Step 2: Baseline Profile** — add the `androidx.baselineprofile` plugin + a `:benchmark` module; generate a profile over a scripted scroll/pinch so first-run jank is killed in release (spec §7.3).

- [ ] **Step 3: Macrobenchmark / JankStats** — a `MacrobenchmarkRule` test scripting a full pinch-zoom + scroll + Detail morph, capturing frame timing; wire `JankStats` in `PhotoApp` to log jank in debug. Goal asserted as a number: **hold 60fps through a full pinch-zoom** (spec §7.3) — the slide line.

- [ ] **Step 4: Verify**
```bash
./gradlew :app:assembleRelease --console=plain
./gradlew :benchmark:connectedBenchmarkAndroidTest --console=plain   # device required
```
Expected: release builds with R8 + Baseline Profile; the benchmark emits frame-timing numbers. Report the measured fps. (No device → report the harness is in place, numbers pending.)

- [ ] **Step 5: Commit** — `"Perf: Coil per-tier sizing, R8 + Baseline Profile, Macrobenchmark/JankStats"`.

---

## Task 12: Acceptance — the 90-second demo walkthrough

**Files:** none modified. This is the spec's "make an investor *feel* the wedge in ~90 seconds" acceptance pass (spec §1, §2.1) on a real device.

- [ ] **Step 1: Install + launch** the release build on a device/emulator (90/120Hz panel if available, spec §7.3).

- [ ] **Step 2: The spine** — land on **Overview** (3-col, all visible). Pinch-out/in steps Overview ↔ Browse ↔ Feature; each release **snaps** to a tier and tiles **travel** (FLIP); captions thicken with tier (code → +name → +latin). Rubber-band past the extremes, no hard wall. No dropped frames.

- [ ] **Step 3: The Theatre** — tap a tile → shared-element morph into Detail (radius 22→0, soft 300ms). Meta row reads correctly; "Read more" expands the fact. Then exercise **all five** never-stuck exits and confirm each returns you cleanly: swipe-down, ✕, backdrop tap, hardware Back, Esc. Page prev/next inside content without Back fighting the pager.

- [ ] **Step 4: The showcase** — switch to the **Living Plane**: all photos fit-to-screen, free continuous pinch-zoom + pan, silky on one layer. Tap a photo → morph to Detail. Toggle back to Mosaic — your **focused photo is preserved** (cross-mode continuity).

- [ ] **Step 5: a11y + reduced motion** — enable TalkBack: Detail is a dialog, focus lands on ✕, name announced, Esc/arrows work. Turn animation scale off → scale/slide become crossfades, drag-dismiss still works.

- [ ] **Step 6: Capture the number** — record the Macrobenchmark fps through a full pinch-zoom for the pitch deck. Screenshot Overview, a Detail, and the Plane for the record.

- [ ] **Step 7: Report** — summarize what passed, the measured fps, and any deviations. Stop the emulator.

---

## Self-review — spec & guideline coverage

| Spec / guideline section | Covered by |
|---|---|
| Spec §2.1 prototype scope (Mosaic + Plane + Detail, ~80 bundled, offline) | Tasks 3,7,8,9,10 (16 seed photos now; curated 80 = JSON edit later) |
| Spec §3 stack (native Kotlin/Compose, local-first, Android-only) | Task 1 |
| Spec §4 architecture — one module, MVVM/UDF, the **three seams** | Seam #1 Task 2 · Seam #2 Task 4 · Seam #3 Task 6 |
| Spec §5 data model + `PhotoSource` + bundling (manifest, Coil) | Tasks 2,3,11 |
| Spec §6.1 Mosaic spine / pinch-to-snap / FLIP / caption density | Task 7 |
| Spec §6.2 Living Plane (single layer, fit-to-screen) | Task 8 (polish deferred per §10.6) |
| Spec §6.3 Detail/Theatre + §6.4 shared state across modes | Tasks 9,10 |
| Spec §7 motion / gestures / **performance budget** | Tasks 4 (motion), 7–9 (gestures), 11 (perf numbers) |
| Spec §8 roadmap (seams *are* the funding story) | The seams ship in Tasks 2,4,6 — Phase 2/3 unblocked, not built |
| Spec §9 testing (TDD where it earns its keep, the exit guard) | Tasks 2,3,6 (JVM TDD) · Task 9 (instrumented exit guard) |
| Guideline §3–4.6 tokens | Task 4 |
| Guideline §8 never-stuck (≥4 exits, one `close()`) | Task 9 (5 exits, UI-tested) |
| Guideline §9 components | Task 5 |
| Guideline §10 accessibility | Tasks 5 (targets), 9 (dialog/focus/live region), 12 (TalkBack pass) |
| Guideline §11–12 (web perf / View Transitions) → native | Tasks 11 (perf), 10 (`SharedTransitionLayout` = native View Transitions) |

**Out of scope (spec §2.2, §11 — narrated in the roadmap, not built):** search · albums · people/faces · map · light theme · upload/cloud sync · multi-select · date-sectioned timeline · Room · Hilt · multi-module · permissions · device-library access.

**Deviations / decisions to flag to the user:**
- **Seed set:** ships the 16 portfolio WebPs as placeholders, not the curated ~80 (spec §10 open decision 7 is the user's). Every screen renders real images today; curation is a later JSON+assets edit.
- **Project root:** Android module rooted at `:app`, coexisting with `app/designguideline.md` (Task 1 Step 1) — `android/` fallback documented if a collision appears.
- **Device-gated steps:** the instrumented tests (Task 9 Step 5), benchmarks (Task 11 Step 4), and the acceptance pass (Task 12) require an emulator/device. On a headless executor, those subagents must report "written, pending device" rather than claim green on a compile.
- **Package name `com.keesleemeijer.photo`** is a placeholder pending the codename (spec §10 decision 5).
