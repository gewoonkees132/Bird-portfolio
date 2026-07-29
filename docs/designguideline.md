# Design Guideline — A Scalable, Touch-First Photo App

> **Purpose.** This is the design brief and guideline for a photo application built to *replace Google Photos* on the principle that browsing a photo library should be calm, photo-first, and effortless to scale from "show me everything" to "show me this one." It codifies the visual language, scalable layout, interaction model, and component system that all screens must obey.
>
> **Pilot / reference implementation:** the *Kees Leemeijer · Bird Photography* portfolio (16 curated photos). The pilot proves the language; the guideline is written to generalize to a full personal library.
>
> **Status:** Draft v1 · 2026-06-19 · derived from a brainstorming session + six research sweeps (BMW / Porsche / Audi digital design language; Apple & Google Photos scalable-zoom UX; mobile touch ergonomics; mosaic layout & vanilla implementation).
>
> **Codename:** TBD.

---

## 1. Product principles

These five principles resolve every design argument. When a decision is unclear, the earlier principle wins.

1. **The photograph speaks first.** Chrome, text, and controls recede. Imagery is the interface; everything else is a quiet caption on top of it. Color in the UI comes almost entirely from the photos themselves.
2. **One continuous act of scaling: all → some → one.** The core verb is *zoom*. The same gesture takes the user from the entire library, to a handful, to a single image — and back — without mode-switches, menus, or dead-ends.
3. **Never stuck.** Every immersive state (a zoomed photo, an open detail) is exitable at least four ways. The user can always get *out* with the first gesture they try. This is a hard requirement, not a nicety.
4. **Calm, soft, deliberate.** Rounded forms, soft shadows, slow confident motion. The app should feel like a well-damped luxury instrument — closer to a modern BMW iDrive surface than a flat utilitarian grid.
5. **Touch is the primary input.** Designed thumb-first for a phone in one hand. Pointer, keyboard, and screen-reader paths are first-class but follow the touch model, never the reverse.

---

## 2. Design heritage — *why it looks the way it does*

The language sits at the intersection of two German systematic-design traditions:

- **Munich '72 / Otl Aicher** — the systematic grid, restraint, monospaced "instrument" labels, a single confident accent. This is the pilot brand's existing DNA and the source of order.
- **Modern BMW digital (My BMW app, iDrive, iX)** — *softened* systematic design: large corner radii, dark glass surfaces, gentle elevation, a cobalt glow accent, photography presented cinematically with the subject's name set into the frame.

Porsche contributes the discipline of *negative-space restraint used sparingly* and slow easing; Audi contributes the *two-radius rhyme* (soft tile + soft pill) and width-driven type. The synthesis: **a soft, rounded, dark photo instrument that is systematic underneath.**

---

## 3. Brand & identity (fixed)

These are immutable in the pilot and define the reference theme. A productized app would tokenize them per tenant, but the *structure* below is constant.

| Element | Value | Notes |
|---|---|---|
| Wordmark | `Kees Leemeijer.` | The period is always the accent color. Top-left of the app header. |
| Pictogram | `logo.svg` | Optional, paired left of the wordmark. |
| Primary accent | Cobalt **`#1635EE`** | The *only* chromatic UI color. Used for the period, the active control, focus rings, the glow tick. Never a large fill. |
| Warm field | **`#F2EEE5`** | Light surface / letterbox / light-theme canvas. |
| Ink | Charcoal **`#1A1A1A`** | Text on light; base of all dark surfaces. |

---

## 4. Design tokens

### 4.1 Color

The app ships **dark by default** (photography reads best on dark) with a light theme available. Dark surfaces are tints of ink + white so the palette never leaves the brand family.

```css
:root{
  /* brand */
  --field:#F2EEE5;
  --blue:#1635EE;
  --blue-lift:#4d63ff;   /* cobalt lifted for legibility + glow on dark */
  --charcoal:#1A1A1A;

  /* dark theme surfaces */
  --canvas:#161616;
  --panel:rgba(255,255,255,.055);   /* lifted card on canvas */
  --hairline:rgba(255,255,255,.12);
  --ink-on-dark:#ffffff;
  --ink-muted:rgba(255,255,255,.60);
  --ink-faint:rgba(255,255,255,.40);
}
```

**Rules**
- Cobalt is a *point* color: period, active pill, focus ring, the 8px glow tick/dot. If blue covers more than ~2% of a screen, it's wrong.
- No new hues. Grays are white-over-canvas tints only.
- Photos provide all other color.

### 4.2 Typography

Two families. Hierarchy comes from **size first, weight second** (a hard 700 ↔ 300 contrast reserved for hero/detail names, à la BMW), never from color.

| Role | Family | Size (px @390) | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Hero / detail name | grotesque | 23–40 | 700 | -0.02em | bird/photo name in detail & feature tiers |
| Section / browse name | grotesque | 18–22 | 600–700 | -0.01em | name on Browse/Feature tiles |
| Caption name | grotesque | 11–13 | 700 | -0.01em | overlay name on small tiles |
| Latin / secondary | grotesque | 13–16 | 300 *italic* | 0 | the quiet line under the name |
| Body / lede | grotesque | 14 / 1.55 | 400 | 0 | fun-fact / description |
| Spec label · code | **mono** | 9–12 | 500 | 0.12–0.14em, UPPERCASE | P-code, aspect, vitals — the "instrument readout" |

Font stack: `'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif` · mono `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`.

### 4.3 Spacing — 8px base

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Edge gutter **12–16px**. Tile gap **6–10px** (tight, so the mosaic packs). Detail padding **18–20px**.

### 4.4 Radii — the two-radius rhyme

| Token | Value | Applies to |
|---|---|---|
| `--r-tile` | **16–22px** | every photo tile & the detail photo |
| `--r-card` | **24px** | grouped cards / detail surfaces |
| `--r-pill` | **999px** | every control: density pill, zoom buttons, close ✕, chips |

Nothing else is rounded. Square corners barely exist; sharp corners are reserved for full-bleed edges of the screen itself.

### 4.5 Elevation (soft)

```
tile:    0 6px 18px rgba(0,0,0,.42)
card:    0 14px 34px rgba(0,0,0,.5),  0 0 0 1px rgba(255,255,255,.05)
detail:  0 22px 54px rgba(0,0,0,.6)
```
Soft, wide, low-opacity. The 1px inner white ring gives a card a *soft edge* on dark without a hard border.

### 4.6 Motion

| Event | Duration | Easing | What moves |
|---|---|---|---|
| Density snap (tier change) | 280ms | `cubic-bezier(.2,0,0,1)` | tiles glide to new slots (FLIP) — `transform` only |
| Detail open / close | 300ms | `cubic-bezier(.2,0,0,1)` (soft, barely-bounce) | shared photo scales tile→fullscreen; radius 22→0 |
| Scroll reveal | 220–260ms | ease-out | `opacity 0→1, translateY 12px→0` |
| Swipe-to-dismiss | 1:1 live | — | photo tracks the finger; opacity eases toward 0 |
| Micro (press / hover) | 150ms | ease | — |

**Animate `transform` and `opacity` only.** Never animate `width`, `height`, `grid-template`, or `top/left` (they reflow and jank on mobile). `prefers-reduced-motion` → replace scale/slide with a cross-fade; keep user-driven drag.

---

## 5. Layout system — the scalable mosaic

A **packed mosaic** of mixed-aspect photos with no ugly gaps, sized so heights are intrinsic to each photo's aspect ratio.

- **Mechanism (pilot, fixed set):** masonry via CSS multicolumn (`column-count` + `break-inside:avoid`) — gapless, and the column count *is* the zoom tier. **Mechanism (large library):** a hand-authored / justified-rows grid with virtualization (see §13).
- **Aspect handling — make odd ratios deliberate:**
  - **Landscape `3/2`** — the default tile.
  - **Portrait `2/3`** — taller tiles; the height difference is the rhythm, not a defect.
  - **Panorama `21/9`** — **full-width "chapter breaks"** (`column-span:all`). Never let a panorama start or end the grid; bookend with a strong landscape lead.
- **Caption density scales with tier:** at the densest overview the tile shows only a mono code chip; names appear as tiles grow.

---

## 6. The scalability model (canonical)

**Three snapped density tiers + a Detail overlay.** Pinch tracks the fingers live, then *springs to the nearest tier* on release — the Apple Photos feel — so the user never lands on a broken in-between density.

| Tier | Columns | Tile @390px | Captions | Purpose |
|---|---|---|---|---|
| **Overview** | 3 | ~110px | code chip only | *see ALL at once* — the default landing |
| **Browse** | 2 | ~172px | name + code | *see SOME* — names become legible |
| **Feature** | 1 | full-width | name + latin + code | *see ONE in context* — pre-detail |
| **Detail** *(overlay)* | — | fullscreen | full meta + actions | *the one photo, immersive* (the "Theatre") |

**Behavior**
- Pinch-out steps toward Overview; pinch-in steps toward Feature, then a continued pinch-in (or a tap) opens **Detail**.
- On release, map cumulative scale to a tier (`<0.8` denser, `>1.25` sparser) and run a FLIP transition so tiles travel to their new positions.
- Rubber-band past the extremes so the user never hits a hard wall.

**Optional advanced mode — "Living Plane."** A continuous `transform: scale()` plane (no tier snapping) that starts fit-to-screen (all photos visible) and zooms/pans freely — a spatial, map-like browse. Cheaper on the GPU and evocative, but less legible for large libraries. Ship as a secondary view, not the default. *(This is the main open decision — see §16.)*

---

## 7. Interaction & gesture model

| Gesture | Action | Anti-conflict note |
|---|---|---|
| **Tap** tile | open Detail | — |
| **Double-tap** | zoom toward the tapped point (toggle in Detail) | — |
| **Pinch-spread** | change density tier (snap) / magnify in Detail | `touch-action:none` on the zoom surface so the page's own pinch never fires |
| **Vertical swipe** (in Detail) | swipe-down-to-dismiss | engages after ~10px; commits past threshold |
| **Horizontal swipe** (in Detail) | previous / next photo | keep *inside* content, not from the screen edge (avoids iOS back-swipe) |
| **Drag** (Plane mode) | pan the plane | — |
| **Long-press** | quick actions (share/info) — *future* | never the only path to anything |

**Global guards**
```css
html,body{ overscroll-behavior:none; height:100dvh; }   /* kill pull-to-refresh; tame the address bar */
.grid   { touch-action:pan-y; overscroll-behavior-y:contain; }
.detail { touch-action:none; }                            /* own the gestures */
```

---

## 8. Never-stuck exit (the priority)

Every immersive view wires **all** of these simultaneously, each calling the *same* close routine. Ranked by how a user will reach for them:

1. **Swipe down to dismiss** — the muscle-memory gesture. Photo tracks the finger; commits past **~110–120px or 25% of height, or a fast flick**; otherwise snaps back.
2. **Persistent close ✕** — top-right, **≥44×44px** hit area (build 48px), high contrast, *never* auto-hidden.
3. **Tap the dimmed backdrop** — any tap outside the photo closes.
4. **Hardware / browser Back** — push a history state on open so Android back and the iOS back-swipe close Detail instead of leaving the app.
5. **Esc** — keyboard / desktop parity.

> Rule: shipping fewer than these four-plus paths is a bug. The cost is trivial; the payoff is that no one is ever trapped.

---

## 9. Components

### 9.1 App header / identity
Fixed top, over a `canvas→transparent` gradient so it never hard-edges the photos. Wordmark left (accent period), a mono count/context right (e.g. `16 SPECIES`). `pointer-events:none` except interactive bits.

### 9.2 Photo tile
Rounded (`--r-tile`), `overflow:hidden`, soft tile shadow. `<img object-fit:cover>` absolutely filling an aspect-ratio box. Overlay caption = bottom gradient + name (`b`) and mono code (`span`); name hidden at Overview density.

### 9.3 Density control pill
Floating bottom-center; frosted-glass pill (`--r-pill`, `backdrop-filter:blur`). Segmented **All · Some · One**; active segment filled cobalt. The pinch gesture and this control are two routes to the same tier state.

### 9.4 Zoom control (Plane mode)
`− [value] +` plus a range slider, same glass pill. Label reads `fit` at minimum, then `1.4×`, `2.0×`…

### 9.5 Detail / Theatre view
Anatomy, top to bottom:
- Dimmed, blurred **backdrop** (tap to close).
- **Photo** in a rounded card with the deepest soft shadow, sized to the photo's aspect.
- **Meta row:** cobalt glow tick · name (700) · latin (300 italic) · mono code · mono vitals (`range · size · diet`). Optional expandable **fun-fact** lede.
- **Persistent ✕** (top-right), **‹ ›** pagers (inside content), and a quiet mono exit hint.
All four exits from §8 are active.

---

## 10. Accessibility

- **Tap targets:** 44×44 CSS px minimum (Apple HIG; WCAG **2.5.5** AAA — use for the close ✕). 24px is the absolute AA floor (WCAG **2.5.8**). Build to **48px** with **≥8px** gaps.
- **Detail is a dialog:** `role="dialog"` `aria-modal="true"`; **trap focus**, move focus to ✕ on open, restore to the originating tile on close; Esc closes; arrows page.
- **Live region:** announce the current photo's name when Detail opens or pages.
- **Alt text** carries the species/photo label; decorative chrome is `aria-hidden`.
- **`prefers-reduced-motion`** → cross-fades, no scale/slide/rubber-band; keep drag-dismiss (user-driven).
- **Contrast:** captions sit on a scrim gradient so white text always clears 4.5:1 over imagery.

---

## 11. Performance

- **Responsive sources:** per-tile `srcset`/`sizes`. At Overview a tile is ~110–190px wide → ship a ~400px WebP, not full-res. Biggest decode/memory win.
- `loading="lazy"` + `decoding="async"` on all but the first ~3; the lead image keeps `fetchpriority="high"`.
- **`content-visibility:auto`** + `contain-intrinsic-size` on offscreen tiles — skip their layout/paint until near.
- **`will-change:transform`** on the zoom plane *only during* an active gesture; remove on end.
- **Transform-only** zoom: scale the container (one composited layer), never re-decode per frame; optionally swap to a larger source on *settle* (debounced), not mid-gesture.
- Read all geometry before writing transforms (no layout thrash).

---

## 12. Tile → fullscreen transition

**View Transitions API** (same-document; Baseline newly-available Oct 2025) with a **FLIP fallback**:
- On tap, give the tapped tile and the Detail photo the *same* `view-transition-name`, then `document.startViewTransition(openDetail)`. The browser morphs position, size, and `border-radius` (22→0) automatically — the tile expands into the rounded theatre.
- `if (!document.startViewTransition)` → 5-line FLIP: measure tile rect (First), open overlay (Last), apply inverted transform (Invert), transition to identity (Play). Same hero image, identical motion. Reverse on swipe-down.

---

## 13. Content & data model

```js
const Photo = {
  id:    'P5',
  name:  'Green Bee-eater',
  latin: 'Merops orientalis',
  aspect:'3/2',                 // '3/2' | '2/3' | '21/9' | …
  src:   'files/P5-Green_Bee-eater.webp',
  srcset:'…-400.webp 400w, …-800.webp 800w, …-1600.webp 1600w',
  vitals:{ range:'S. Asia', size:'21 cm', diet:'insects' },
  fact:  'Sallies from a perch to hawk bees and dragonflies in mid-air.',
  takenAt: '2024-05-10',        // for timeline sectioning at library scale
};
```
For a **full library** (the Google Photos replacement proper), photos group into **date sections** (Day → Month → Year), which map naturally onto the same three density tiers — Google Photos' own model. Albums, search, and people are *additional surfaces* that reuse this mosaic + theatre, out of scope for v1 (see §15).

---

## 14. Implementation constraints

- **Vanilla HTML / CSS / JS, no build step.** No framework, no bundler. Any dependency must be justified; the pilot needs none (Flickr `justified-layout` is the only library worth *considering*, and only at large scale).
- **Progressive enhancement:** the mosaic and tap-to-open must work without JS-heavy zoom; gestures and View Transitions enhance on top.
- **Single source of truth:** one photo array renders every tier and the Detail view.

---

## 15. Scope — v1 vs. beyond

**In v1 (this guideline fully covers):**
- The scalable mosaic, three density tiers + Theatre, the full touch/exit model, the dark soft-rounded language, tokens, components, a11y, performance.

**Beyond v1 (needs additional patterns, not yet specified):**
- Date-sectioned timeline & **list virtualization** for thousands of photos.
- Albums, search, people/faces, map view.
- Upload, cloud sync, sharing, multi-select & batch actions.
- Light theme parity, tablet/desktop multi-pane layouts.

These extend the language; they do not change §1–§12.

---

## 16. Open decisions

1. **Canonical scale model** — *Recommended:* Density-tier snapping (§6) as default, Living Plane as a secondary view. Confirm, or promote the Plane.
2. **Default landing tier** — Overview (all visible) vs. Browse (names showing). *Recommended:* Overview.
3. **Fun-fact in Detail** — show the lede inline, or behind a "Read more" expand. *Recommended:* expand.
4. **Default theme** — dark (current) vs. light field. *Recommended:* dark, with light as an explicit toggle.
5. **Codename / product name.**

---

## 17. References

Research underpinning this guideline:
- Apple Photos pinch-to-zoom density (iOS 14 / iOS 26 grid zoom); Google Photos justified web layout.
- Touch targets: Apple HIG 44pt · Material 48dp · WCAG 2.5.5 (AAA 44px) & 2.5.8 (AA 24px).
- Gesture isolation: MDN `touch-action`, `overscroll-behavior`; Chrome overscroll guidance.
- Layout: Flickr justified-layout; CSS multicolumn / `column-span`; CSS-Tricks masonry approaches.
- Motion/perf: Smashing "GPU Animation Doing It Right"; MDN View Transitions API; FLIP technique.
- Aesthetic: BMW digital (My BMW app, iDrive), Porsche Design System, Audi UI system.
