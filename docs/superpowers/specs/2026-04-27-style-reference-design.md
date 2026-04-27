---
title: Style Reference — Design Spec
date: 2026-04-27
status: approved
author: Kees Leemeijer (with Claude)
---

# Style Reference

A canonical, single-page specimen sheet that codifies the design system extracted from the existing bird portfolio. Becomes the leading source for all future design work under the Kees Leemeijer identity.

## Purpose

- **Source of truth.** All design iterations land here first; the portfolio follows.
- **Specimen, not documentation.** The reference *is* the system — every artifact is rendered live in real CSS. No code snippets, no captions, no anti-patterns. Style is implicit in the rendering.
- **Foundation for the layered architecture.** Establishes the static modular grid that future portfolio surfaces will sit on (above a pannable background layer).

## Scope

### In scope (v1)

- Visual tokens — color, typography, spatial, motion
- Components — every UI piece currently in the portfolio, rendered live
- Voice / identity — the philosophy line and a small set of terse principles
- The static 12-column grid system, codified for the first time
- A short layering note acknowledging future composition over a pannable background

### Out of scope (v1)

- Pannable background layer on the reference page itself
- Code snippets or markup listings
- Usage notes, "do/don't" examples, anti-patterns
- Working interactive controls (e.g. an embedded live tweaks panel)
- Multiple pages, navigation, or anchor links
- Build tooling, preprocessing, or CSS imports

## Folder & files

```
style-reference/
  index.html
  style.css
```

- **Path:** `style-reference/` (hyphenated). The displayed page title and product name remain "Style Reference" with a space.
- **Why hyphenated:** spaces in folder names cause friction with `python -m http.server` URLs (require `%20` encoding), git operations, and CLI tools. The hyphen keeps the path clean without compromising the brand presentation.
- **Run:** served at `http://localhost:8000/style-reference/` from the existing `python -m http.server` workflow.

## The static grid (codified here for the first time)

This is the foundation for the future static UI layer that will sit above the pannable background in the portfolio.

- **12 columns**
- **24px gutter** — matches the existing `--gutter` token
- **Max content width: 1320px** (matches `--tile-width`), centered, with 24px viewport margins below that breakpoint
- **Section heads** span 12 columns
- **Artifacts** span 3 / 4 / 6 / 12 columns as their content demands
- **Hairline rules** between sections — `1px solid rgba(26, 26, 26, 0.10)`, full-bleed across the 12-column track, Vignelli-style
- **Vertical rhythm** anchored to the existing type scale; no new spacing units introduced. Section vertical padding: 48px above and below each section's content

## Page structure (one continuous specimen sheet, top to bottom)

1. **Masthead** — wordmark, "Style Reference" title, version/date
2. **Philosophy** — opening type sets `Munich '72 spirited inheritance · alectear-feel craft`, followed by exactly 4 terse principles:
   - Asymmetric alignment (top-left identity, bottom-left label, bottom-right compass)
   - Italic blue Latin name as the sole italic accent
   - Mono for utility text only (compass, tweaks, placeholders)
   - 1px corner radius — sharp, almost square; shadows do the lift
3. **Color** — five tokens as large flat swatches with hex + token name:
   - `--field` `#F2EEE5`
   - `--blue` `#1635EE`
   - `--charcoal` `#1A1A1A`
   - `--field-overlay` `rgba(242,238,229,0.95)`
   - `--blue-soft` `rgba(22,53,238,0.6)`
4. **Typography** — live samples of every type pattern:
   - Wordmark scale (desktop / mobile pair)
   - Species line-name (desktop / mobile pair)
   - Italic blue Latin
   - Uppercase blue-soft meta (with 0.08em letter-spacing)
   - Mono utility (10–11px, SF Mono / Menlo / Consolas stack)
   - Font stack listed: ABC Diatype, system-ui, -apple-system, Segoe UI, sans-serif
5. **Spatial** — visual rulers for `--tile-width` (1320), `--tile-height` (760), `--gutter` (24), `--tile-margin` (0)
6. **Motion** — every duration/easing token with a small live demo:
   - `--pan-lerp` (0.08) — value shown
   - `--focus-fade` (360ms) with `--focus-easing` `cubic-bezier(0.22, 0.61, 0.36, 1)` — looping swatch demo
   - `--label-in` (200ms ease-out) / `--label-out` (150ms ease-in) — asymmetric pair demo
   - `--photo-decode` (200ms ease-out) — entrance demo
   - The `cubic-bezier` easing curve plotted as an inline 80×80px SVG
7. **Components** — live renderings of every piece (real CSS, not screenshots). Components that are normally `position: fixed` in the portfolio (identity, species, compass, tweaks) render *in-flow* inside their grid cell on the reference page; their visual properties (size, color, weight, spacing) match the portfolio exactly. Each component sits inside a labelled cell — the cell label uses the mono utility style and names the component (e.g. `IDENTITY`, `SPECIES LABEL`).
   - Identity (wordmark + pictogram + blue dot)
   - Species label (line-name + italic blue Latin + uppercase blue-soft meta) — shown in its visible state
   - Compass (mono uppercase pan affordance)
   - Photo cell (placeholder striped fill at default `--ph-band-a` `#d9d3c5` / `--ph-band-b` `#cfc7b6`; rendered at a representative 3:2 aspect; focus-state shadow shown on a second cell so both states are visible side by side)
   - Brand card (large wordmark + pictogram, slot-replacement)
   - Tweaks panel (dark, mono, blur, sliders + color inputs) — rendered as if `.is-open`; controls visible but are not wired up
   - Mobile cell (stacked photo + label + meta) — rendered at mobile width inside its cell
8. **Layering note** — one paragraph: this static grid is designed to be composed *above* a dynamic pannable background. Future portfolio surfaces stack:
   - Background: pannable photo plane
   - Foreground: static UI grid (this)
   - Above that: focus overlays / labels
9. **Colophon** — type credit (ABC Diatype), signature, date

## Process / source-of-truth rules

- **Leading source.** `style-reference/style.css` is the canonical CSS. All design iterations land here first.
- **Portfolio follows.** Changes propagate to the root `styles.css` as a deliberate, manual sync step. No build pipeline; this remains a vanilla project.
- **Token parity contract.** The `:root` block — colors, type sizes, motion, spatial — must be byte-identical between `style-reference/style.css` and `styles.css` after every sync. Drift in `:root` is treated as a bug.
- **Commit cadence.** A design iteration is two commits: first the change in `style-reference/`, then the sync into the portfolio. This makes the leading-vs-following relationship visible in git history.

## Identity / voice (preserved verbatim from the existing system)

> **Munich '72 spirited inheritance · alectear-feel craft**

This line opens the philosophy section and is the canonical articulation of the design intent. It is not paraphrased, summarized, or expanded.

## Inventory captured from the existing portfolio (reference)

This is what the spec is codifying — the source extracted from `styles.css` and `index.html` as of `2026-04-27`.

### Color tokens

| Token             | Value                              |
| ----------------- | ---------------------------------- |
| `--field`         | `#F2EEE5`                          |
| `--blue`          | `#1635EE`                          |
| `--charcoal`      | `#1A1A1A`                          |
| `--field-overlay` | `rgba(242, 238, 229, 0.95)`        |
| `--blue-soft`     | `rgba(22, 53, 238, 0.6)`           |

### Spatial tokens

| Token            | Value     |
| ---------------- | --------- |
| `--tile-width`   | `1320px`  |
| `--tile-height`  | `760px`   |
| `--gutter`       | `24px`    |
| `--tile-margin`  | `0px`     |

### Type tokens

| Token            | Value      | Use                  |
| ---------------- | ---------- | -------------------- |
| `--wm-size-d`    | `0.95rem`  | Wordmark (desktop)   |
| `--wm-size-m`    | `0.86rem`  | Wordmark (mobile)    |
| `--label-size-d` | `0.92rem`  | Species (desktop)    |
| `--label-size-m` | `0.78rem`  | Species (mobile)     |
| `--meta-size-d`  | `0.74rem`  | Meta (desktop)       |
| `--meta-size-m`  | `0.62rem`  | Meta (mobile)        |

Font stack: `'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif`
Mono stack: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`

### Motion tokens

| Token            | Value                                 |
| ---------------- | ------------------------------------- |
| `--pan-lerp`     | `0.08`                                |
| `--focus-fade`   | `360ms`                               |
| `--focus-easing` | `cubic-bezier(0.22, 0.61, 0.36, 1)`   |
| `--label-in`     | `200ms`                               |
| `--label-out`    | `150ms`                               |
| `--photo-decode` | `200ms`                               |

### Components present in current portfolio

- `.identity` — wordmark + pictogram + blue dot, fixed top-left
- `.species` — line-name + italic blue Latin + uppercase blue-soft meta, fixed bottom-left
- `.compass` — mono uppercase pan affordance, fixed bottom-right
- `.photo` — placeholder + image, with `.is-focused` and `.is-entering`/`.is-entered` states
- `.photo.is-brand` — brand card replacing one slot in the plane
- `.tweaks` — dark blurred panel with sliders + color inputs (mono)
- `.mobile-edition .mcell` — stacked mobile placeholder cells

## Acceptance criteria

The reference is complete when:

1. `style-reference/index.html` and `style-reference/style.css` exist and render at `http://localhost:8000/style-reference/`.
2. All five color tokens render as flat swatches, each labelled with its CSS variable name and value.
3. All six type tokens render as live samples in their actual font, size, weight, and color.
4. All six motion tokens have a corresponding live visual demo on the page.
5. Each component listed in section 7 renders in its real CSS, visually identical to its appearance in the portfolio.
6. The philosophy line appears verbatim.
7. The layering note is present.
8. The `:root` block in `style-reference/style.css` is byte-identical to `:root` in `styles.css`.
9. The page is built on the documented 12-column / 24px-gutter grid.
10. No JavaScript is required for the page to render correctly (motion demos may use CSS animation; no JS file is added).

## Open questions

None. All decisions captured during brainstorming.

## Future work (not in this spec)

- Pannable background layer composed beneath the static grid
- Rebuilding the portfolio surface on the static-grid foundation defined here
- Component variants beyond what currently exists in the portfolio
