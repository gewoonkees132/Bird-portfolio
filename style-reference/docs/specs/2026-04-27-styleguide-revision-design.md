---
title: Styleguide Revision — Design Spec
date: 2026-04-27
status: draft
author: Kees Leemeijer (with Claude)
---

# Styleguide Revision

Restructure the standalone style-reference specimen page to follow conventional design-system documentation patterns: a Foundations / Components / Patterns trinity, a consistent per-component template that allows anatomy callouts and short usage notes, and a new Overlay positioning system as the seed component of the Patterns group. Remove the Tweaks panel component. Update the workspace's captions policy to match.

CSS modernization is explicitly *not* in this spec — it is a separate follow-up effort.

## Why this changes

The current page is a flat 01–10 list of sections that grew organically. It mixes three different concerns at the same depth — foundational tokens (Color, Typography), composed components (Components), and meta-context (Masthead, Colophon) — and gives no slot for page-chrome patterns. The "specimen IS the spec" rule, while distinctive, makes some components ambiguous to a reader who didn't author them: the species label, for instance, has three named parts that aren't legible from the rendered form alone.

A conventional Foundations / Components / Patterns split makes the taxonomy obvious, gives every component a uniform anatomy + usage frame, and creates a natural place for the new Overlay system to live.

## Goals

- Top-level structure follows the Foundations / Components / Patterns convention used in mainstream design-system documentation
- Every component renders into the same template — specimen, numbered anatomy callouts, legend, one-line usage
- Overlays are defined as a complete pattern: 8 anchor slots, 6 content primitives, three positioning tokens, default contrast treatment
- The Tweaks panel component is removed from the specimen
- The CLAUDE.md isolation rule on captions is rewritten to permit anatomy + usage while still forbidding do/don't tables and marketing prose

## Non-goals

- CSS modernization (cascade layers, nesting, logical properties, color-mix, container queries, token consolidation) — separate spec
- Mobile redesign — the single-column fallback below 720px stays as-is; anatomy callouts collapse to legend-only at narrow widths
- Changing the values of any design token (colors, type scale, grid dimensions, motion curves) — this is a structural and content pass, not a visual identity revision
- Removing or visually changing the Motion section — the user has explicitly chosen to keep it
- Adding interactivity or JavaScript — the page stays vanilla HTML/CSS, no scripts required to render
- Documenting misuse / "don't" panels for any component, including the brand mark
- Building actual page chrome on the portfolio side — the overlay system is *defined* here, not *applied* here

## Section structure

The new top-level structure:

```
00  Masthead                    (specimen header — id/title/stats)

1.0 Foundations
    1.1 Principles              (was: Philosophy)
    1.2 Identity                (NEW — mark at scale, clear-space, min-size)
    1.3 Grid
    1.4 Color
    1.5 Typography
    1.6 Spacing                 (was: Spatial)
    1.7 Elevation               (was: Layering)
    1.8 Motion

2.0 Components
    2.1 Wordmark / dot          (was: Identity sample inside Components)
    2.2 Species label
    2.3 Compass
    2.4 Photo cell
    2.5 Brand card
    2.6 Mobile cell
                                (Tweaks panel removed)

3.0 Patterns                    (NEW)
    3.1 Overlays

99  Colophon
```

Numbering: top-level groups use `N.0`, subsections use `N.M`. The Masthead retains a numeric id (`00`) for visual rhythm with the other section ids, but it is the specimen header rather than a body section. The Colophon retains its outlier `99` to bookend the page.

Renames are deliberate moves toward conventional design-system vocabulary:

| Was | Becomes | Reason |
| --- | --- | --- |
| Philosophy | Principles | Standard term; "Philosophy" reads as essay, "Principles" reads as ruleset |
| Spatial | Spacing | Convention; describes what tokens contain (gaps, padding) |
| Layering | Elevation | Convention; "Layering" suggests z-stack, "Elevation" matches what shadow tokens encode |

## Per-component template — Format B

Every component in section 2.0 renders into the same template:

```
[ Component title + slug ]

[ Rendered specimen with numbered ① ② ③ callouts on anatomy parts ]

[ Numbered legend — one row per callout: "① part-name (token / treatment)" ]

[ One-line usage note — when this component is used, in plain prose ]
```

Specifics:

- **Callout numerals** are rendered as a small uppercase mono character inside a 16px square in the brand blue (`--blue` family). They sit at the visual start of the part they label.
- **Legend rows** use the mono utility face. Tokens referenced by name (e.g. `--type-line-name`) so the link from rendered form to source-of-truth is explicit.
- **Usage note** is one sentence, plain sans, low-opacity. No "use when / don't use when" tables — if the rendered specimen and the legend don't make it clear, the component spec should be tighter, not longer.
- Components 2.5 Brand card and 2.6 Mobile cell skip the callouts and legend (no distinct named parts) but still carry a usage note.

Foundations sections are not bound to this template; they retain their existing per-section formats (color swatches, type scale, motion curves, etc.).

## Overlays (3.1) — pattern spec

Overlays are a page-chrome positioning pattern: persistent UI anchored to the edges of any full-bleed surface (a photo, a section background, a future page). They are *defined* in this styleguide as a system; *application* to specific surfaces (portfolio photo plane, future site pages) is downstream work.

### Anchor slots

Eight named slots on a 3×3 grid, with the center reserved for content:

```
tl  tc  tr
ml  ··  mr
bl  bc  br
```

- `tl` / `tr` / `bl` / `br` — corners, the primary slots; suitable for any primitive
- `tc` — reserved for nav (only); avoids collision with corner content
- `bc` — reserved for pagination / status (only); avoids collision with corner content
- `ml` / `mr` — edge centers; suitable for vertical-rhythm chrome (e.g. side rail, scroll cue)

Slots are named, not numbered, because their role-by-position is part of the system.

### Content primitives

Six primitives are the only content that goes into a slot. Each is a reusable atom from the brand vocabulary; an overlay is always one or more primitives, never freeform HTML.

| Primitive | Content | Example use |
| --- | --- | --- |
| `identity` | Wordmark + dot, or dot alone | Persistent brand mark, top-left |
| `text-line` | Single line, sans regular | Tagline, status sentence |
| `mono-utility` | Uppercase mono, low opacity | Coordinates, timestamp, version |
| `link` | Inline anchor with arrow | Contact, next-page link |
| `indicator` | Colored dot + mono label | Live, recording, paused |
| `stack` | Two stacked lines | Multi-line meta (coords + gear) |

If a need arises for a seventh primitive, it is added here first, then to the rendered specimen — never invented inline at a use site.

### Tokens

```
--overlay-edge: 16px       (distance from surface edge; 12px below 720px)
--overlay-gap:  8px        (between primitives within a slot)
--overlay-z:    50         (above content, below modals)
```

### Treatment

- Default contrast: `text-shadow: 0 1px 2px rgba(0,0,0,0.4)` on overlay text. Cheap, robust against unpredictable photo backgrounds, no layout cost.
- Backdrop-blur is opt-in via a class (e.g. `.overlay--backdrop`), used only when text-shadow is insufficient.
- Color: overlays default to white text on dark surfaces; brand blue is permitted for `link` and `indicator` primitives.

### Specimen rendering

The Overlays section in the styleguide renders three things in order:

1. **Slot diagram** — a 3:2 placeholder rectangle with all eight slots labeled in dashed outlines, center marked "content". Same diagram used in the brainstorm.
2. **Primitive grid** — six primitives, one per cell, each rendered against a neutral background with its slug.
3. **Live applied example** — a 3:2 surface (placeholder photo or gradient) with three primitives applied: `identity` at `tl`, `indicator` at `bl`, `stack` at `br`. Caption identifies the configuration.

## Identity (1.2) — foundation spec

A new foundational section between Principles (1.1) and Grid (1.3). Three subsections:

1. **Mark at scale** — the wordmark + dot rendered large (≥ 2 cells wide), then the dot-only variant rendered at component scale. No callouts.
2. **Clear-space** — the wordmark with a 1× cap-height padding ruler drawn around it. The ruler is rendered in a hairline blue, label `1× cap-h` on each edge.
3. **Minimum size** — wordmark rendered at 96px width with the label `min 96px`; dot-only rendered at 8px diameter with the label `min 8px`. Both side by side.

The Components section's Wordmark / dot (2.1) atom is the *usable* form — it inherits everything defined here. Components 2.1 carries the standard anatomy + usage template; Identity 1.2 carries the rules.

## Captions policy — CLAUDE.md change

The current isolation rule:

> The specimen IS the spec. Don't add anti-patterns, captions, or do/don't comparisons; the rendered system speaks for itself.

Becomes:

> The specimen leads. Anatomy callouts and one-line usage notes are allowed where rendered form alone is ambiguous. No do/don't tables, no marketing copy, no anti-pattern panels — restraint over verbosity.

The companion mission paragraph at the top of CLAUDE.md retains "if it's not visible on the page, it's not part of the brand" — that rule is unchanged. Restraint is the throughline; the loosening is targeted at component anatomy specifically.

## File-level changes

### `style-reference/index.html`

- **Renumber and regroup all sections** per the structure table above. Each section retains its existing class hooks (`sr-color`, `sr-typography`, etc.) so CSS rules continue to apply unchanged; only the `.sr-section__id` and `.sr-section__title` text changes, plus the addition of group markers between sections.
- **Add group markers** between sections (Foundations begins, Components begins, Patterns begins). Visual treatment: a full-bleed row at one cell tall, mono uppercase label, hairline rule. Not numbered.
- **Insert section 1.2 Identity** with the three subsections (mark at scale, clear-space, min-size) described above.
- **Add per-component template** to all sections under 2.0 Components: numbered anatomy markup, legend block, usage note. The species label, photo cell, and compass have clear named parts; the brand card and mobile cell may skip callouts but still carry usage notes.
- **Remove the Tweaks panel** specimen from Components entirely. The 9-cell tweaks demo is deleted.
- **Insert section 3.0 Patterns** with subsection 3.1 Overlays containing the slot diagram, primitive grid, and live applied example.

### `style-reference/style.css`

- Add component-template CSS: `.sr-anatomy__num`, `.sr-anatomy__legend`, `.sr-anatomy__usage`. Tokenize the callout color and size.
- Add identity section CSS: `.sr-identity-mark`, `.sr-identity-clearspace` (with the hairline ruler), `.sr-identity-min`.
- Add group-marker CSS: `.sr-group`, `.sr-group__label`.
- Add overlay-system CSS: `.sr-overlay-diagram`, `.sr-overlay-slot`, `.sr-overlay-primitive`, `.sr-overlay-applied`, plus the three new tokens `--overlay-edge`, `--overlay-gap`, `--overlay-z` in `:root`.
- Remove all Tweaks-panel CSS rules (selectors prefixed `.sr-tweaks-*` or similar).
- All renames (Spatial → Spacing, Layering → Elevation, Philosophy → Principles) update both the displayed text in `index.html` and any class names in `style.css` whose names refer to the old terms (e.g. `.sr-spatial` → `.sr-spacing`).

### `style-reference/CLAUDE.md`

- Replace the captions sentence in the **Isolation rules** section with the rewritten policy above.
- Update the **Component inventory** list: remove "tweaks panel"; rename and reorder to match the new structure.
- Add a one-line note in the document's structure section pointing readers to the per-component anatomy template.

## Acceptance criteria

The revision is complete when all of the following hold:

1. `style-reference/index.html` contains exactly one section per row of the structure table above, in that order, with the listed numeric ids and titles.
2. The Tweaks panel specimen is absent from the rendered page (verifiable by grep: no `tweaks` class names, no Tweaks heading).
3. Components 2.1 Wordmark / dot, 2.2 Species label, 2.3 Compass, and 2.4 Photo cell render with numbered callouts on the specimen and a matching legend block beneath. Components 2.5 Brand card and 2.6 Mobile cell may omit callouts but still carry a usage note.
4. Every component under 2.0 carries a one-line usage note rendered beneath its specimen.
5. Section 1.2 Identity exists and contains the three named subsections (mark at scale, clear-space, minimum size), each rendered as described.
6. Section 3.1 Overlays exists and contains the three rendered parts (slot diagram with all 8 slots labeled, primitive grid with all 6 primitives, live applied example).
7. The three overlay tokens (`--overlay-edge`, `--overlay-gap`, `--overlay-z`) are defined in `style.css :root`.
8. CLAUDE.md's isolation rules contain the rewritten captions policy verbatim, and the Component inventory matches the new structure.
9. Running `python -m http.server` from inside `style-reference/` and opening `http://localhost:8000` renders the page with no broken assets and no console errors.
10. The single-column mobile fallback below 720px still renders; anatomy callouts collapse to legend-only at narrow widths (callouts hidden, legend retains its rows).

## Out of scope (explicitly)

- CSS modernization — cascade layers, nesting, logical properties, color-mix, light-dark, container queries, modern reset, token consolidation. A follow-up spec will cover this once the structural pass lands.
- Any change to design token *values* — color hexes, type sizes, motion curves, grid dimensions all unchanged.
- Misuse / "don't" panels for the brand mark or any other component.
- Building actual overlay chrome on the portfolio's photo plane — definition only, application is downstream.
- Mobile redesign beyond the documented anatomy-callout collapse rule.
- Changes to the bird portfolio repo above this folder (per workspace isolation rules).

## Open questions

None. All decisions captured during brainstorming.
