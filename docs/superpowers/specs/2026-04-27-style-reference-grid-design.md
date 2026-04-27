# Style-reference grid refit — design spec

- Date: 2026-04-27
- Scope: refactor `style-reference/index.html` and `style-reference/style.css` so every element on the specimen sheet is placed in reference to a single, named modular grid — the same grid that governs the portfolio's photo plane.
- Status: design approved, ready for implementation plan.

## 1 · Goal

The reference page documents the portfolio's design system. Today its layout uses a generic 12-column flex grid (`repeat(12, 1fr); gap: 24px`) that is unrelated to the portfolio's actual production grid (the V4 tessellation: `u=120 g=24` 9-column tile, 1320 px wide).

Make the reference page render *inside* the production grid. Adopt the V4 ruleset, add an explicit edge boundary derived to make the existing overlay-text positions logical, and re-size every component to integer cell multiples. The grid becomes one named, targetable section of the CSS, easy to find and easy to modify in future iterations.

## 2 · Locked ruleset

| token | value | role |
| --- | --- | --- |
| `--page-width` | `1336px` | outer canvas (V4 tile 1320 + 2 × edge 8) |
| `--tile-width` | `1320px` | V4 tile inside the edge — mirrors the photo plane |
| `--tile-height` | `744px` | V4 tile (5 × 120 + 6 × 24 = 744). Replaces `760` (math bug, off by 16). |
| `--page-edge` | `8px` | edge boundary on all four sides of the outer canvas |
| `--gutter` | `24px` | constant gutter, inside-tile and between-tile |
| `--cell` | `120px` | square module `u` |
| `--cols` | `9` | columns across the tile |
| `--tick` | `2px` | sub-tick. Cell ÷ 60, gutter ÷ 12. Used for fine paddings inside cells. |
| `--stride` | `144px` | row pitch (`--cell + --gutter`) |

Span widths follow `n · 120 + (n − 1) · 24`:

| span | px |
| --- | --- |
| 1 | 120 |
| 2 | 264 |
| 3 | 408 |
| 4 | 552 |
| 5 | 696 |
| 6 | 840 |
| 7 | 984 |
| 8 | 1128 |
| 9 | 1272 |

Cell origin in the tile (zero-indexed): `(g + c · stride, g + r · stride)` = `(24 + c · 144, 24 + r · 144)`.

Overlay text positions (`identity` 18,18 / `species` 22,22 / `compass` 22,22) decompose under this system as `edge + n · tick`:

- `18 = 8 + 5 · 2`
- `22 = 8 + 7 · 2`

These are not snapped further — the values are the system. Later edits to those positions should change `--tick` multiples, not invent new constants.

## 3 · CSS organization

The grid lives in its own clearly-labelled section of `style-reference/style.css`, separate from the portfolio-mirrored rules. The block below is the *single source of truth* for the ruleset and is the section a future edit should target.

```css
/* ============================================================
   Grid — single source of truth
   Modular system inherited from the portfolio's photo plane
   (tessellation V4: u=120, g=24, 9 cols × 5 rows = 1320×744).
   The reference page renders inside this same grid.
   Edit only this block to retune the system.
   ============================================================ */
:root {
  --page-width:  1336px;     /* tile + 2 × edge */
  --tile-width:  1320px;     /* V4 tile (matches photo plane) */
  --tile-height:  744px;     /* 5·u + 6·g */
  --page-edge:      8px;     /* outer boundary on all four sides */
  --gutter:        24px;     /* g — constant everywhere */
  --cell:         120px;     /* u — square module */
  --cols:           9;
  --tick:           2px;     /* sub-tick: u/60, g/12 */
  --stride:       144px;     /* u + g — row pitch */
}
```

The existing portfolio-mirrored variables in `:root` (`--field`, `--blue`, type sizes, motion durations) stay where they are. The Grid section is added at the top of the file and references it by name in comments where the variables are consumed.

## 4 · Page anatomy

```
┌──────────────────────────────────────────────────────────────┐  ← page edge
│  ▓▓ 8px edge boundary (rendered as subtle inset frame) ▓▓    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │  ← V4 tile starts
│  │  24px gutter  │  9 cells × 120  │  24px gutter         │  │
│  │  ┌──┐ ┌──┐ ┌──┐ ... 9 of these                         │  │
│  │  │  │ │  │ │  │                                        │  │
│  │  └──┘ └──┘ └──┘                                        │  │
│  │                                                        │  │
│  │  (rows continue — page scrolls)                        │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│  ▓▓ 8px edge boundary ▓▓                                     │
└──────────────────────────────────────────────────────────────┘
                       1336px outer width
```

Total inset from outer page edge to first cell: `8 + 24 = 32` on the left and top.

### Width arithmetic

```
1336  outer canvas (.sr-page)
−  16  2 × 8 edge boundary
= 1320  V4 tile zone
−  48  2 × 24 V4 outer gutter
= 1272  cell-grid content (= 9 × 120 + 8 × 24)
```

The 8 edge and the 24 V4 outer gutter are conceptually distinct (edge is the page frame; the 24 is *the same* gutter that runs between cells), but in the box model they collapse into a single horizontal padding of `8 + 24 = 32` on `.sr-page`. The same applies to the top of the page (between the page edge and the first section's first row of cells).

### DOM

```html
<body>
  <main class="sr-page">           <!-- 1336 wide, centered, padding 32 -->
    <section class="sr-section sr-grid-ruleset"> ... </section>
    <section class="sr-section sr-masthead"> ... </section>
    <section class="sr-section sr-philosophy"> ... </section>
    <section class="sr-section sr-color"> ... </section>
    ...
  </main>
</body>
```

No intermediate `.sr-grid` / `.sr-tile` element — the V4 tile zone is implicit, defined by the 32 padding on `.sr-page` and the 1336 outer width.

### Layout rules

```css
.sr-page {
  width: var(--page-width);                         /* 1336 */
  margin: 0 auto;
  padding: calc(var(--page-edge) + var(--gutter));  /* 8 + 24 = 32 */
  position: relative;                               /* anchor for ?grid overlay */
}

.sr-section {
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--cell));
  grid-auto-rows: var(--cell);
  column-gap: var(--gutter);
  row-gap: var(--gutter);
}

/* Section vertical separation = one gutter */
.sr-section + .sr-section { margin-top: var(--gutter); }
```

The cell grid inside a section is exactly 1272 wide (9 × 120 + 8 × 24), which fits inside the 1272-wide content area of `.sr-page` (1336 − 64 padding). No leftover space.

## 5 · Section anatomy (the tessellation-options pattern)

Each section follows the `tessellation-options.html` `.opt` model: a header row (id + title + stats), then content laid out on the cell grid, then a 1-px rule under the section.

```
┌─ id ─┬─────── title ─────────────────────┬─ stats ─┐   ← header row, 1c tall
│  02  │  Color                            │ 5 tokens │
│      │                                   │ 2 swatches │
│      │                                   │ checker = α │
├──────┴────────────────────────────────────┴──────────┤   ← 1px rule
│                                                       │
│           content cells (variable height)             │
│                                                       │
└───────────────────────────────────────────────────────┘   ← 1px rule
```

Header row layout (using the section grid defined in §4):

- `.sr-section__id`: `grid-column: 1 / span 1` — 02-style numeric prefix in mono.
- `.sr-section__title`: `grid-column: 2 / span 7` — section name in display weight.
- `.sr-section__stats`: `grid-column: 9 / span 1` — right-aligned count/notes in mono.

The 1-px rule is the existing `<hr class="sr-rule">` element, but moved *inside* the section as a child (`grid-column: 1 / -1`) rather than sitting between sections. Two rules per section: one under the header, one at the foot. The implicit gutter between sections (set in §4) replaces the freestanding `<hr>` separator.

## 6 · Cell utility ladder

Replace the 12-column `.sr-cell--3 / --4 / --6 / --12` ladder with a 9-column ladder.

```css
.sr-cell--1 { grid-column: span 1; }
.sr-cell--2 { grid-column: span 2; }
.sr-cell--3 { grid-column: span 3; }
.sr-cell--4 { grid-column: span 4; }
.sr-cell--5 { grid-column: span 5; }
.sr-cell--6 { grid-column: span 6; }
.sr-cell--7 { grid-column: span 7; }
.sr-cell--8 { grid-column: span 8; }
.sr-cell--9 { grid-column: span 9; }

.sr-cell--r1 { grid-row: span 1; }
.sr-cell--r2 { grid-row: span 2; }
.sr-cell--r3 { grid-row: span 3; }
.sr-cell--r4 { grid-row: span 4; }
```

Migration of existing classes (12-col → 9-col):

| was | becomes | reason |
| --- | --- | --- |
| `--3` (25 %) | `--3` (33 %) | wider, breathes more |
| `--4` (33 %) | `--3` (33 %) | exact match |
| `--6` (50 %) | `--5` (≈ 55 %) | closest visual half |
| `--12` (100 %) | `--9` (100 %) | full width |

## 7 · Component refits

Every existing component re-snaps to integer cell multiples. Heights set explicitly so cells have predictable vertical rhythm.

| section | component | size (cols × rows) | px (w × h) |
| --- | --- | --- | --- |
| Grid ruleset | token cards (9 of them) | 2 × 1 | 264 × 120 |
| Grid ruleset | anatomy diagram | 9 × 3 | 1272 × 408 |
| Masthead | wordmark | 3 × 1 | 408 × 120 |
| Masthead | title | 5 × 1 | 696 × 120 |
| Masthead | meta | 1 × 1 | 120 × 120 |
| Philosophy | quote | 5 × 2 | 696 × 264 |
| Philosophy | principles | 4 × 2 | 552 × 264 |
| Color | each swatch (5 total) | 3 × 1 | 408 × 120 (chip) + caption row beneath |
| Typography | wm/lbl/meta samples | 3 × 1 | 408 × 120 |
| Typography | latin / mono / stack | 5 × 1 | 696 × 120 |
| Spatial | tile-width ruler | 9 × 1 | 1272 × 120 |
| Spatial | tile-height ruler | 3 × 1 | 408 × 120 |
| Spatial | gutter chip | 3 × 1 | 408 × 120 |
| Spatial | tile-margin rule | 9 × 1 | 1272 × 120 |
| Motion | each demo (4 total) | 2 × 1 | 264 × 120 |
| Motion | curve plot + caption | 9 × 1 | 1272 × 120 |
| Components | identity | 3 × 1 | 408 × 120 |
| Components | species | 3 × 1 | 408 × 120 |
| Components | compass | 3 × 1 | 408 × 120 |
| Components | photo cell (default) | 3 × 2 | 408 × 264 (3:2 ratio, on-grid) |
| Components | photo cell (focused) | 3 × 2 | 408 × 264 |
| Components | brand card | 5 × 3 | 696 × 408 (≈ 5:3) |
| Components | tweaks panel | 9 × 1 | 1272 × 120 |
| Components | mobile cell | 3 × 4 | 408 × 552 |
| Layering | body text | 5 × 2 | 696 × 264 |
| Layering | stack diagram | 3 × 2 | 408 × 264 |
| Colophon | meta line | 9 × 1 | 1272 × 120 |

Photo cells at 3 × 2 give the canonical 3:2 aspect on-grid (408 / 264 = 1.545, V4 calls this "landscape"). Brand card at 5 × 3 gives 696 / 408 = 1.71 (close to 5:3). These ratios match the portfolio's own slot definitions.

## 8 · Grid as its own visible section

The reference page gains a new first content section, `.sr-grid-ruleset`, before Masthead. It documents the grid the same way Color documents tokens:

- header: `01` · `Grid` · `9 cols · 1336w · 1320 tile`
- token cards (one per variable): `--page-width 1336`, `--tile-width 1320`, `--tile-height 744`, `--page-edge 8`, `--gutter 24`, `--cell 120`, `--cols 9`, `--tick 2`, `--stride 144`
- a small inline diagram (the page anatomy from §4) rendered as DOM at 0.5× scale, sitting in a `9 × 3` region

This is the section the user explicitly asked to be "its own clear section so future modification or targetings can be easy." Class hook: `.sr-grid-ruleset`. CSS comment block: `/* Grid ruleset — first specimen on the page */`.

The Spatial section continues to exist for tile-width / tile-height / gutter / tile-margin specimens, but the *cardinal* ruleset is now the Grid section above it.

## 9 · Visible grid (debug overlay)

Default state: grid invisible — the rules govern but don't shout.

`?grid` URL flag adds `.show-grid` to `<body>`. CSS rules under `.show-grid` render:

- the 8-edge boundary as a tinted inset rule (`rgba(22,53,238,0.18)` strip on each side)
- each `.sr-section` gets a dashed cell outline overlay via a `::before` background-image of repeating linear gradients sized to `120 / 24`
- a fixed bottom-right legend reading `u 120 · g 24 · edge 8 · tick 2`

Identical visual language to `tessellation-options.html`. Toggle is a query parameter, not a saved preference, so it doesn't pollute the default reading experience.

## 10 · Mobile fallback (≤ 720)

Below 720 px viewport, the 1336-wide canvas can't fit. Single-column flow:

- `.sr-page` width becomes `100%`, padding becomes `var(--page-edge)` (no V4 outer-gutter add — there's no V4 tile metaphor at narrow widths)
- `.sr-section` becomes `display: block`
- Every `.sr-cell--N` becomes `width: 100%; margin-bottom: var(--gutter)` regardless of N
- The `mobile-cell` component's `max-width: 360px` already sets the right scale for the mobile presentation reference

`identity`, `species`, `compass` overlays are not part of the reference page's running chrome (they only render inline as specimens), so the 18 / 22 corner positions don't propagate to mobile.

## 11 · Discrepancies fixed in this pass

- `--tile-height: 760px` → `744px`. The 760 was off by 16 from the V4 math (`5 · 120 + 6 · 24 = 744`).
- The `padding: 0 24px` on `.sr-page` (acting as an implicit edge gutter) is replaced by the explicit `padding: calc(var(--page-edge) + var(--gutter))` (= 32) defined in §4. The split into 8 + 24 is documented but collapses into one padding value at runtime.
- The freestanding `<hr class="sr-rule">` separators between sections are removed; section-internal rules under each header and at each foot replace them.
- Inline magic numbers in the Motion demo (`80`, `60`, `40`, `32`) are noted but **not** rewritten in this refactor — they're internal to the demo elements, not layout. Out of scope.
- Existing portfolio styles (`.stage`, `.tile`, `.photo`, `.identity`, `.species`, `.compass`, `.mobile-edition`, `.tweaks`) are left untouched. Only the `Style Reference — page-specific layout` block at the bottom of `style-reference/style.css` is refactored.

## 12 · Out of scope

- Rewriting the portfolio's own `index.html` / `app.js` / root `styles.css` to use the new Grid variables. The portfolio already encodes V4 implicitly via `--tile-width: 1320`; lifting the new variables into it is a future task.
- Real photographs replacing placeholder swatches in the reference's photo cells.
- New components or new specimen sections beyond those listed in §7 (the existing nine sections plus the new Grid ruleset section).
- The Spatial section's content. It continues to specimen `--tile-width` / `--tile-height` / `--gutter` / `--tile-margin` — it just sits inside the new grid like every other section.

## 13 · Acceptance

The refit is done when:

1. Every element on `style-reference/index.html` has a `grid-column` and `grid-row` (or is inside a parent that does), or is positioned via `--page-edge` / `--gutter` / `--cell` / `--tick` (no other length values for layout).
2. The CSS has one prominently-commented Grid block at the top of the file, and the index.html has one specimen section dedicated to the Grid ruleset.
3. `?grid` renders the V4 cell overlay over the page.
4. `--tile-height` is `744px`.
5. The page reads cleanly at 1336 wide and reflows to single-column below 720.
