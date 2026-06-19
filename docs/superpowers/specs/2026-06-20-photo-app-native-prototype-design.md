# Design Spec — Native Android Photo App (Funding Prototype)

> **Status:** Draft v1 · 2026-06-20
> **Codename:** TBD
> **Binding design reference:** [`app/designguideline.md`](../../../app/designguideline.md) — the visual/interaction language is normative; this spec covers the native build and architecture only.
> **Origin:** Distilled from a grilling + brainstorming session over the *Kees Leemeijer · Bird Photography* portfolio (`public/`), which serves as the experiential pilot.

---

## 1. Vision & wedge

**The product (eventual):** a personal photo platform that replaces Google Photos for the people it has failed — a calm, photo-first, *lovable* way to actually re-experience a library, with ownership of your own data.

**Why it can exist next to Google/Apple Photos and free self-hosted Immich:** none of them win on *experience*. The thesis:

> Infinite-scroll grids have failed the 40,000-photo camera roll — nobody revisits their memories. The fix is **one continuous, calm act of scaling — All → Some → One** — photo-first, luxury-grade, and *silky*. Not a database you search; a place you move through.

- **Wedge (headline):** the experience — calm, scalable, photo-first browsing that feels like a well-damped luxury instrument.
- **Beachhead:** photographers & creatives, who feel presentation pain most and will pay.
- **Supporting pillar:** ownership ("and you own it all") — not the lead, because Immich already owns that story for free.

**What makes it lovable, specifically:** native smoothness. The app holds frame rate through every pinch, zoom, and morph. Craft is the moat. This is why the stack is native (§3), not a webview.

**This document's job:** specify a **fundable prototype** — a vertical slice that makes an investor *feel* the wedge in ~90 seconds — and prove the architecture grows into the full product. It doubles as the technical backbone of the funding narrative.

---

## 2. Scope

### 2.1 In scope (the prototype)

Prototype scope **B** — the spine plus the showcase:

- **The spine:** a zoomable mosaic with three density tiers (**Overview / Browse / Feature** = All / Some / One), pinch-to-snap between them, and a **Detail / Theatre** overlay with the full never-stuck exit model.
- **The Living Plane:** a secondary spatial mode — all photos fit-to-screen, free continuous zoom/pan on a single composited layer. The clearest demonstration of native smoothness.
- Runs on **~80 curated photos, bundled in the app** (offline, portable, no permissions).

### 2.2 Explicitly deferred (narrated in the roadmap, not built)

Search · albums · people/faces · map · light theme · upload/cloud sync · multi-select & batch · date-sectioned timeline. These are guideline §15 "beyond v1"; they add nothing to the funding moment.

### 2.3 Design language

Governed verbatim by `app/designguideline.md`: the All→Some→One scale model (§6), the soft dark "BMW-instrument over an Aicher grid" aesthetic, tokens (§3–4.6), components (§9), the never-stuck exit doctrine (§8), accessibility (§10). The guideline's three web-specific sections (§11 performance, §12 transitions, §14 vanilla-JS) are **translated to native equivalents** here (§6 below).

---

## 3. Strategy & stack

| Decision | Choice | Rationale |
|---|---|---|
| Product depth | Full platform ("D"), **phased** | Buildable only as a sequence; see §8 roadmap. |
| Build vs borrow | **Build the experience/client; borrow the engine (Immich) later** | Backup/sync/transcoding/ML/sharing are undifferentiated and brutal solo; Immich gives them away. The novel part is the experience. |
| Backend (prototype) | **Local-first**, swappable | A curated bundled set; cloud comes via the `PhotoSource` seam later. |
| Platform | **Android only** | Focused; multi-device is post-funding. |
| Stack | **Native Kotlin + Jetpack Compose** | Smoothness is the product; a webview can't carry the daily-driver grid, the Plane's silk, or background backup. Native is the point, not an optimization. |

**Consequence:** the existing web portfolio (`public/`) is a **design reference, not source**. Its plane mechanics, focus tracking, and label behavior inform the native implementation; none of the JS is reused.

---

## 4. Architecture (Approach 3 — lean core, explicit seams)

One Gradle module, layered by responsibility, **MVVM with unidirectional data flow**. Lean now, but the three seams that the roadmap needs are drawn cleanly from day one — so growth is additive, not surgery.

```
ui/
  theme/      ← AppTheme: guideline tokens (color, type, radii, motion) as Compose      [SEAM #2]
  components/ ← PhotoTile, DensityPill, MetaRow, CloseButton (guideline §9)
  mosaic/     ← MosaicScreen  (density-tier grid)
  plane/      ← PlaneScreen   (Living Plane)
  detail/     ← DetailOverlay (the Theatre)
  LibraryViewModel + LibraryUiState                                                       [SEAM #3]
domain/
  Photo, Aspect, DensityTier, ViewMode   ← model types
  PhotoSource                            ← data interface                                 [SEAM #1]
data/
  BundledAssetSource : PhotoSource       ← the prototype's only implementation
  AppContainer                           ← light manual DI (Hilt deferred)
```

### The three seams

1. **`PhotoSource`** (data interface) — `BundledAssetSource` now; `MediaStoreSource` / `ImmichSource` drop in later with **zero UI change**.
2. **`AppTheme`** (design tokens) — every guideline token lives here once; "tokenize per tenant" (guideline §3) becomes real. Nothing hardcodes cobalt or a radius.
3. **View-mode abstraction** — one `LibraryViewModel` owns `LibraryUiState` (photo list, current `ViewMode`, current `DensityTier`, focused photo, detail-open). `MosaicScreen` and `PlaneScreen` are two *renderers* of that one state; `DetailOverlay` sits above both.

### Deferred but unblocked

Room (local index), Hilt (DI), and multi-module are **not** built in the prototype. The seams mean adding them is additive. Manual DI via `AppContainer` and no database keep the prototype lean.

### State flow

Composables emit events up (`onPinch`, `onTileTap`, `onModeToggle`, `close`) → `LibraryViewModel` updates `LibraryUiState` → Compose recomposes. No business logic in composables.

---

## 5. Data model & the `PhotoSource` seam

Optional fields are nullable, so a generic photo renders cleanly — the bird metadata works now, EXIF/filename works in the product.

```kotlin
data class Photo(
  val id: String,              // "P5"
  val assetPath: String,       // "photos/P5-green-bee-eater.webp"
  val name: String,            // "Green Bee-eater"  (filename-derived in the product)
  val latin: String?,          // quiet secondary line — null for generic photos
  val aspect: Aspect,          // drives staggered-grid height + panorama spans
  val takenAt: LocalDate?,     // future date-sectioning (EXIF in the product)
  val vitals: Map<String, String>?,  // range·size·diet — null-safe
  val fact: String?,           // the Detail lede
)

enum class Aspect(val ratio: Float) { Landscape(1.5f), Portrait(0.667f), Panorama(2.333f) }
enum class DensityTier(val columns: Int) { Overview(3), Browse(2), Feature(1) }
enum class ViewMode { Mosaic, Plane }

interface PhotoSource { suspend fun photos(): List<Photo> }   // the whole interface
```

### Bundling — data, not code

- ~80 photos in `assets/photos/` (WebP, ~1600px long edge).
- Metadata in **`assets/photos.json`** — a manifest `BundledAssetSource` parses into `List<Photo>`.
- Keeping the set as manifest + folder (not a hardcoded Kotlin array like the portfolio's `app.js`) means expanding the demo is editing JSON, and "swap to `MediaStoreSource`" is visibly *replacing the source that fills the same list*.
- Expected apk: **~20–30 MB** — fine for a hand-to-investor build.

### Image pipeline — Coil

- `AsyncImage` loads from `file:///android_asset/...`; `PhotoSource` never touches bitmaps.
- Each tier requests its **display size** (Overview ~110px, not 1600px) — guideline §11 responsive sources, native form. Full-res only in Feature/Detail.
- Coil memory/disk cache + neighbor preload (Plane, Detail paging) for smoothness.

### Aspect is deliberate (guideline §5)

`Landscape` = default cell · `Portrait` = the rhythm · `Panorama` = full-width chapter break (never bookending the grid).

---

## 6. View modes & Detail overlay

### 6.1 Mosaic (the spine)

- `LazyVerticalStaggeredGrid(columns = StaggeredGridCells.Fixed(tier.columns))`. Cell height from `aspect.ratio`; `Panorama` → `StaggeredGridItemSpan.FullLine`.
- **Pinch-to-snap:** `detectTransformGestures` tracks zoom live as a `graphicsLayer` scale on the grid container; on release, cumulative scale maps to a tier (`<0.8` denser, `>1.25` sparser — guideline §6), the column count changes, and `Modifier.animateItem()` glides every tile to its new slot (the FLIP "tiles travel" motion, native).
- **Caption density scales with tier** inside `PhotoTile`: Overview = mono code chip only → Browse adds name → Feature adds latin.
- Rubber-band past Overview/Feature — no hard wall.

### 6.2 Living Plane (the showcase)

- All ~80 photos packed into one plane, **fit-to-screen at min zoom** (guideline §6 "Living Plane"), then free continuous pinch-zoom + pan via a single `graphicsLayer { scaleX = scaleY = zoom; translationX; translationY }` on the content layer.
- **One composited layer, GPU-cheap** — the §11 transform-only path, and the visible proof that native is silk.
- Tap any photo → morph into Detail.
- *Optional polish (not load-bearing):* dwell-snap-to-center and ambient dimming of unfocused tiles, ported from the portfolio.

### 6.3 Detail / Theatre

- `SharedTransitionLayout` wraps the active screen + overlay; the tapped tile and the Detail photo share a `rememberSharedContentState` key → Compose morphs position, size, and radius (22→0) in one soft 300ms move (guideline §12, natively).
- **Anatomy:** blurred/dimmed backdrop · rounded photo card with the deepest soft shadow · meta row (cobalt glow tick · name 700 · latin 300 italic · mono vitals) · expandable fun-fact lede.
- **Never-stuck (guideline §8), every path calling one `close()`:**
  1. Swipe-down-to-dismiss (photo tracks the finger, alpha eases; commits past ~110–120px / 25% / fast flick).
  2. Persistent ✕ (≥48px).
  3. Tap backdrop.
  4. Hardware **Back** (`BackHandler` / predictive back).
  5. Esc (keyboard parity).
- **Paging:** prev/next via a `HorizontalPager` *inside* the content, clear of the edge-back zone.

### 6.4 Shared state

`DetailOverlay` renders at the top level, above an `AnimatedContent(mode)` crossfade — so it morphs from *either* mode, and `LibraryViewModel`'s focused-photo means your place survives a Mosaic↔Plane switch (the All→Some→One continuity works *across* modes).

---

## 7. Motion, gestures & performance

### 7.1 Motion (guideline §4.6 → Compose; transform/alpha only)

| Event | Spec |
|---|---|
| Density snap | `tween(280, CubicBezierEasing(.2f,0f,0f,1f))` + `animateItem()` |
| Detail open/close | shared-element transition, soft 300ms |
| Scroll reveal | item enter: `opacity 0→1`, `translationY 12.dp→0`, 220–260ms ease-out |
| Swipe-dismiss | 1:1 live offset; alpha eased toward 0 |
| Reduced motion | read system animation-scale / a11y setting → crossfade instead of scale/slide; keep user-driven drag |

### 7.2 Gestures (guideline §7; native anti-conflict)

- **Mosaic:** vertical scroll + pinch (tier). **Plane:** pan + pinch (zoom). **Detail:** pinch (magnify), vertical drag (dismiss), horizontal pager (page).
- Pager kept inside content, clear of the predictive-back edge, so Back never fights paging.
- Detail consumes its own drags so the grid underneath can't scroll through it.
- Hardware Back is a first-class exit — cleaner than the iOS edge-swipe problem the web guideline had to dodge.

### 7.3 Performance budget (this is the pitch — measured, not asserted)

- **Hold 60fps through every pinch / zoom / morph**; ride 90/120Hz where the panel allows.
- Transform-only animations on isolated `graphicsLayer`s; the Plane is a *single* composited layer.
- Coil decodes at display size per tier; memory+disk cache; neighbor preload.
- Lazy layouts virtualize for free (guideline §11 `content-visibility`, native).
- Release builds: **R8 + a Baseline Profile** to kill first-run jank.
- **JankStats / Macrobenchmark** instrumented so smoothness is a number on a slide ("we hold 60fps through a full pinch-zoom").

---

## 8. Roadmap to D — the seams *are* the funding story

| Phase | Delivers | Seam that enables it |
|---|---|---|
| **1 — Prototype (this spec)** | Native Mosaic + Plane + Detail on 80 bundled photos. Offline, demoable, silky. Proves experience + craft. | `BundledAssetSource : PhotoSource` |
| **2 — Real library** | `MediaStoreSource : PhotoSource` (`READ_MEDIA_IMAGES`) + date-sectioning onto the same tiers + Room index for library-scale scroll/search + thumbnail cache + background scan. Becomes the daily local gallery. **UI untouched.** | `PhotoSource` swap; Room added behind it |
| **3 — Ownership / cloud** | `ImmichSource : PhotoSource` → self-hosted backup, sync across devices, ML search, sharing. D's backend, **borrowed not built**. | `PhotoSource` swap |
| **4+ — Beyond** | Albums, people, editing, multi-select, light theme, tablet/desktop. Each reuses mosaic + theatre. | `AppTheme` tokens; component reuse |

Each phase is additive because Phase 1 built exactly the seams the roadmap needs — the line a technical funder respects.

---

## 9. Testing

Approach 3's seams make the load-bearing logic pure and testable; TDD where it earns its keep.

- **`BundledAssetSource`** — manifest → `List<Photo>`, null-field handling. JVM unit test.
- **Tier math** — pure function mapping cumulative pinch-scale → `DensityTier` (0.8 / 1.25 thresholds, rubber-band). Write test-first.
- **`LibraryViewModel`** — events produce expected `LibraryUiState`; coroutines test dispatcher.
- **Compose UI tests** (instrumented) — Detail opens on tap; **every never-stuck exit invokes `close()`** (the automated guard on guideline §8); tier pill switches columns.
- **Smoothness** — JankStats / Macrobenchmark over scripted pinch/scroll/morph.

---

## 10. Open decisions

Inherited from guideline §16, plus prototype-specific:

1. **Canonical scale model** — density-tier snapping default, Living Plane secondary. *Recommended:* confirmed as designed.
2. **Default landing tier** — *Recommended:* Overview (all visible).
3. **Fun-fact in Detail** — *Recommended:* behind a "Read more" expand.
4. **Default theme** — *Recommended:* dark, light deferred.
5. **Codename / product name** — TBD.
6. **Plane polish** — ship dwell-snap + ambient dimming in the prototype, or defer? *Recommended:* defer; free pan/zoom + tap-to-Detail is enough for the demo.
7. **Sourcing the 80 photos** — user to curate from own library.

---

## 11. Constraints & non-goals

- **Android only**, native Kotlin/Compose, single Gradle module.
- **No** Room, Hilt, multi-module, cloud, accounts, permissions, or device-library access in the prototype.
- The design language is **not** re-litigated here — `app/designguideline.md` is binding.
- The prototype is a **funding artifact**, optimized for felt experience + demonstrated architecture, not production robustness at scale.
