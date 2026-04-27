# Style-reference Grid Refit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refit `style-reference/index.html` and `style-reference/style.css` so every element on the specimen sheet is placed in reference to a single named modular grid (V4: `u=120 g=24` 9-col tile, plus an 8-px edge boundary), making the reference page render inside the same grid that governs the portfolio's photo plane.

**Architecture:** Add a Grid block to `:root` as the single source of truth. Replace the 12-col flex grid with a 9-col `display: grid` (`repeat(9, 120px); column-gap: 24px`). Refactor each existing section to use a new id+title+stats header anatomy and resize every component to integer cell multiples. Add a new "Grid" ruleset specimen as the first section. Add an opt-in `?grid` debug overlay and a `≤720px` mobile fallback. No build step, no JS framework.

**Tech Stack:** Vanilla HTML, CSS (CSS Custom Properties + CSS Grid), one tiny inline `<script>` for the `?grid` URL flag. No bundler. Local server via `python -m http.server`. Verification is browser-based — no test framework exists in this repo.

**Spec:** `docs/superpowers/specs/2026-04-27-style-reference-grid-design.md`

**Run/serve:**

```bash
python -m http.server
# then open http://localhost:8000/style-reference/
```

**Existing files modified:** `style-reference/index.html`, `style-reference/style.css`. No new files.

**Verification convention:** every task ends with a "verify in browser" step. Refresh `http://localhost:8000/style-reference/`. If you stopped the server, restart with `python -m http.server`.

---

## Task 1: Add the Grid block to `:root` (consolidated source of truth)

**Files:**
- Modify: `style-reference/style.css` (top of file, and the existing `/* Spatial */` block inside the existing `:root`)

The goal of this task: every spatial variable lives in *one* clearly-commented Grid block at the top of the file. No duplicates. After this task, the existing `:root`'s `/* Spatial */` block is empty and removed.

- [ ] **Step 1: Insert the Grid block at the top of `style-reference/style.css`**

Add the block immediately after the `Bird Photography Portfolio` banner comment and before the existing `:root { ... }`:

```css
/* ============================================================
   Grid — single source of truth
   Modular system inherited from the portfolio's photo plane
   (tessellation V4: u=120, g=24, 9 cols × 5 rows = 1320×744).
   The reference page renders inside this same grid.
   Edit only this block to retune the system.
   ============================================================ */
:root {
  --page-width:   1336px;    /* tile + 2 × edge */
  --tile-width:   1320px;    /* V4 tile — matches photo plane */
  --tile-height:   744px;    /* 5·u + 6·g — was 760 (math bug, off by 16) */
  --tile-margin:     0px;    /* no margin between tiles in the photo plane */
  --page-edge:       8px;    /* outer boundary on all four sides */
  --gutter:         24px;    /* g — constant inside-tile and between-tile */
  --cell:          120px;    /* u — square module */
  --cols:            9;
  --tick:            2px;    /* sub-tick: u/60, g/12 */
  --stride:        144px;    /* u + g — row pitch */
}
```

- [ ] **Step 2: Remove the moved variables from the existing `:root`**

Find the existing block (currently around lines 13-17):

```css
  /* Spatial */
  --tile-width:   1320px;
  --tile-height:   760px;
  --gutter:         24px;
  --tile-margin:     0px;
```

Delete it entirely (those four variables are now defined in the Grid block above). The existing `:root` keeps the rest: `--field`, `--blue`, `--charcoal`, `--field-overlay`, `--blue-soft`, `/* Type sizes */` block, `/* Motion */` block, `--font-stack`, `--ambient-*`.

- [ ] **Step 3: Verify in browser**

Run `python -m http.server` if not running. Open `http://localhost:8000/style-reference/`. The page should look **identical** to before — the new variables are not yet consumed. The only visible change candidate is anything that uses `--tile-height` directly; check the Spatial section's "tile-height" ruler caption — it will still say "760px" until we update HTML in Task 8.

- [ ] **Step 4: Commit**

```bash
git add style-reference/style.css
git commit -m "Add Grid CSS variables and fix tile-height math (760→744)"
```

---

## Task 2: Page shell — `.sr-page` and `.sr-section` skeleton

**Files:**
- Modify: `style-reference/style.css` (the "Style Reference — page-specific layout" block)
- Modify: `style-reference/index.html` (remove the freestanding `<hr class="sr-rule">` between sections)

- [ ] **Step 1: Replace `.sr-page` rule**

Find the existing rule in `style-reference/style.css`:

```css
.sr-page {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}
```

Replace with:

```css
.sr-page {
  width: var(--page-width);
  max-width: 100%;
  margin: 0 auto;
  padding: calc(var(--page-edge) + var(--gutter));  /* 8 + 24 = 32 */
  position: relative;
}
```

- [ ] **Step 2: Replace `.sr-section` rule**

Find:

```css
.sr-section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 48px 0;
}
```

Replace with:

```css
.sr-section {
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--cell));
  grid-auto-rows: var(--cell);
  column-gap: var(--gutter);
  row-gap: var(--gutter);
  padding: 0;
}

.sr-section + .sr-section {
  margin-top: var(--gutter);
}
```

- [ ] **Step 3: Update `.sr-rule` to live inside sections**

Find:

```css
.sr-rule {
  grid-column: 1 / -1;
  height: 1px;
  background: rgba(26, 26, 26, 0.10);
  margin: 0;
  border: 0;
}
```

Replace with:

```css
.sr-rule {
  grid-column: 1 / -1;
  height: 1px;
  background: rgba(26, 26, 26, 0.10);
  margin: 0;
  padding: 0;
  border: 0;
}
```

(Functionally similar; `grid-column: 1 / -1` already spans full width regardless of column count.)

- [ ] **Step 4: Remove freestanding `<hr class="sr-rule" />` separators from `style-reference/index.html`**

Delete every line that contains exactly:

```html
    <hr class="sr-rule" />
```

There are 8 such lines, each between two `<section>` elements. Use a single grep-and-delete pass — the line appears at lines 21, 32, 72, 117, 146, 182, 281, 291 in the current file (line numbers will shift as you delete).

The remaining `<section>` elements should sit directly adjacent to one another with no `<hr>` between them. Sections are now visually separated by the `--gutter` margin defined in Step 2.

- [ ] **Step 5: Update `.sr-section__head` to be a grid child rather than a span-12 element**

Find:

```css
.sr-section__head {
  grid-column: 1 / -1;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.6);
  margin: 0 0 8px;
  font-weight: 500;
}
```

Replace with:

```css
.sr-section__head {
  grid-column: 1 / -1;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.6);
  margin: 0;
  font-weight: 500;
  align-self: end;
}
```

(This is a temporary keep-it-rendering rule. Task 4 introduces the proper id/title/stats anatomy.)

- [ ] **Step 6: Verify in browser**

Refresh `http://localhost:8000/style-reference/`. Expected state:

- The page is now `1336px` wide (max-content). On a typical 1440-wide viewport you'll see equal margins around the page.
- Sections are tight against each other vertically (no rule separator between them yet — the Step 4 deletion).
- Cell content inside each section likely looks misaligned because the children still use the old `sr-cell--3 / --4 / --6 / --12` classes against the new 9-col grid (each `span 3` is now 33% of the 9-col grid instead of 25% of the old 12-col grid). This is expected interim state — Task 3 fixes the cell ladder.
- No JS errors, no layout collapse.

- [ ] **Step 7: Commit**

```bash
git add style-reference/style.css style-reference/index.html
git commit -m "Adopt 9-col grid shell on .sr-page and .sr-section"
```

---

## Task 3: Cell utility ladder (`--1` through `--9` + row spans)

**Files:**
- Modify: `style-reference/style.css`

- [ ] **Step 1: Replace the cell utility classes**

Find:

```css
.sr-cell {
  grid-column: span 12;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sr-cell--3  { grid-column: span 3; }
.sr-cell--4  { grid-column: span 4; }
.sr-cell--6  { grid-column: span 6; }
.sr-cell--12 { grid-column: span 12; }
```

Replace with:

```css
.sr-cell {
  grid-column: span 9;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
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

/* Backwards-compat alias: legacy .sr-cell--12 from the 12-col system → full width */
.sr-cell--12 { grid-column: span 9; }
```

- [ ] **Step 2: Add CSS for the new section header anatomy (id/title/stats)**

Append to the end of the page-specific layout block in `style-reference/style.css`:

```css
/* ============================================================
   Section anatomy — id + title + stats header row
   Mirrors tessellation-options.html .opt header.
   ============================================================ */
.sr-section__id {
  grid-column: 1 / span 1;
  align-self: start;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--blue);
  font-weight: 500;
  text-transform: uppercase;
}

.sr-section__title {
  grid-column: 2 / span 7;
  align-self: start;
  font-family: var(--font-stack);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--charcoal);
  margin: 0;
}

.sr-section__stats {
  grid-column: 9 / span 1;
  align-self: start;
  text-align: right;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(26, 26, 26, 0.55);
  text-transform: uppercase;
  line-height: 1.5;
}
.sr-section__stats span { display: block; }
.sr-section__stats b { color: var(--blue); font-weight: 500; }
```

- [ ] **Step 3: Verify in browser**

Refresh. Expected:

- Cells using `--3` are now `span 3` of 9 cols (= 33%, was 25%) — wider.
- Cells using `--4` are now `span 4` of 9 (= 44%, was 33%) — wider.
- Cells using `--6` are now `span 6` of 9 (= 67%, was 50%) — wider.
- `--12` (only used in the existing Spatial / Motion / Components sections) maps to full width via the backwards-compat alias.
- Sections still show the old single-line section header (we haven't added id/title/stats markup yet — that's per-section in Tasks 4-12).
- Layout looks "wide" overall but still readable.

- [ ] **Step 4: Commit**

```bash
git add style-reference/style.css
git commit -m "Replace cell utility ladder with 9-col version + row spans"
```

---

## Task 4: Migrate Masthead section (id/title/stats anatomy)

**Files:**
- Modify: `style-reference/index.html` (the `<section class="sr-section sr-masthead">` block)
- Modify: `style-reference/style.css` (`.sr-masthead*` rules)

- [ ] **Step 1: Replace the masthead HTML**

Find in `style-reference/index.html`:

```html
    <section class="sr-section sr-masthead">
      <a class="sr-masthead__wordmark" href="../" aria-label="Back to portfolio">
        <img src="../files/logo/SVG/logo.svg" alt="" aria-hidden="true" />
        <span>Kees Leemeijer<span class="dot">.</span></span>
      </a>
      <h1 class="sr-masthead__title">Style Reference</h1>
      <div class="sr-masthead__meta">v1 · 2026-04-27</div>
    </section>
```

Replace with:

```html
    <section class="sr-section sr-masthead">
      <span class="sr-section__id">02</span>
      <h2 class="sr-section__title">Masthead</h2>
      <div class="sr-section__stats">
        <span>identity</span>
        <span>title</span>
        <span>version meta</span>
      </div>
      <hr class="sr-rule" />

      <a class="sr-cell sr-cell--3 sr-masthead__wordmark" href="../" aria-label="Back to portfolio">
        <img src="../files/logo/SVG/logo.svg" alt="" aria-hidden="true" />
        <span>Kees Leemeijer<span class="dot">.</span></span>
      </a>
      <h1 class="sr-cell sr-cell--5 sr-masthead__title-display">Style Reference</h1>
      <div class="sr-cell sr-cell--1 sr-masthead__meta">v1<br>2026<br>04-27</div>

      <hr class="sr-rule" />
    </section>
```

Notes:
- The masthead's old `<h1 class="sr-masthead__title">` (the big "Style Reference" title) is preserved but its class is renamed to `sr-masthead__title-display` so it doesn't collide with the new generic `.sr-section__title`.
- Section ID `02` because the new Grid ruleset specimen (Task 13) will be `01`.
- Two `<hr class="sr-rule" />` inside the section — one under the header, one at the foot — replace the old freestanding separator.

- [ ] **Step 2: Update `.sr-masthead*` CSS**

Find:

```css
/* Masthead */
.sr-masthead { align-items: end; }
.sr-masthead__wordmark {
  grid-column: span 4;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: var(--charcoal);
  font-size: var(--wm-size-d);
  font-weight: 500;
  letter-spacing: -0.01em;
}
.sr-masthead__wordmark img {
  width: 22px;
  height: 22px;
  border-radius: 1px;
}
.sr-masthead__wordmark .dot { color: var(--blue); }
.sr-masthead__title {
  grid-column: span 6;
  font-size: 56px;
  line-height: 1;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: var(--charcoal);
  margin: 0;
}
.sr-masthead__meta {
  grid-column: span 2;
  text-align: right;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.6);
}
```

Replace with:

```css
/* Masthead */
.sr-masthead__wordmark {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: var(--charcoal);
  font-size: var(--wm-size-d);
  font-weight: 500;
  letter-spacing: -0.01em;
  align-self: center;
  text-decoration: none;
}
.sr-masthead__wordmark img {
  width: 22px;
  height: 22px;
  border-radius: 1px;
}
.sr-masthead__wordmark .dot { color: var(--blue); }

.sr-masthead__title-display {
  font-size: 56px;
  line-height: 1;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: var(--charcoal);
  margin: 0;
  align-self: center;
}

.sr-masthead__meta {
  text-align: right;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.6);
  line-height: 1.5;
  align-self: center;
}
```

The `grid-column: span N` declarations are gone — width comes from the `sr-cell--N` utility class on each element.

- [ ] **Step 3: Verify in browser**

Refresh. Masthead should now show:

- Top row: `02` · `Masthead` · `identity / title / version meta` (mono, right-aligned)
- 1px rule
- Wordmark cell (3 cells wide, 408px) on the left
- "Style Reference" big title (5 cells wide, 696px) in the middle
- "v1 / 2026 / 04-27" meta (1 cell wide, 120px) on the right
- 1px rule at the bottom

- [ ] **Step 4: Commit**

```bash
git add style-reference/index.html style-reference/style.css
git commit -m "Migrate Masthead to id/title/stats header + cell-multiple cells"
```

---

## Task 5: Migrate Philosophy section

**Files:**
- Modify: `style-reference/index.html`
- Modify: `style-reference/style.css`

- [ ] **Step 1: Replace the Philosophy HTML**

Find:

```html
    <section class="sr-section sr-philosophy">
      <h2 class="sr-section__head">Philosophy</h2>
      <p class="sr-philosophy__quote">Munich '72 spirited inheritance · alectear-feel craft</p>
      <ol class="sr-philosophy__principles">
        <li>Asymmetric alignment — top-left identity, bottom-left label, bottom-right compass.</li>
        <li>Italic blue Latin name as the sole italic accent.</li>
        <li>Mono for utility text only — compass, tweaks, placeholders.</li>
        <li>1px corner radius. Sharp, almost square; shadows do the lift.</li>
      </ol>
    </section>
```

Replace with:

```html
    <section class="sr-section sr-philosophy">
      <span class="sr-section__id">03</span>
      <h2 class="sr-section__title">Philosophy</h2>
      <div class="sr-section__stats">
        <span><b>4</b> principles</span>
        <span>quote · italic accent</span>
      </div>
      <hr class="sr-rule" />

      <p class="sr-cell sr-cell--5 sr-cell--r2 sr-philosophy__quote">Munich '72 spirited inheritance · alectear-feel craft</p>
      <ol class="sr-cell sr-cell--4 sr-cell--r2 sr-philosophy__principles">
        <li>Asymmetric alignment — top-left identity, bottom-left label, bottom-right compass.</li>
        <li>Italic blue Latin name as the sole italic accent.</li>
        <li>Mono for utility text only — compass, tweaks, placeholders.</li>
        <li>1px corner radius. Sharp, almost square; shadows do the lift.</li>
      </ol>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 2: Update `.sr-philosophy*` CSS**

Find:

```css
/* Philosophy */
.sr-philosophy__quote {
  grid-column: span 8;
  font-size: 28px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  font-weight: 500;
  color: var(--charcoal);
  margin: 0;
}
.sr-philosophy__quote em {
  font-style: italic;
  color: var(--blue);
  font-weight: 400;
}
.sr-philosophy__principles {
  grid-column: 9 / -1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 14px;
  line-height: 1.4;
  color: var(--charcoal);
  counter-reset: principle;
}
.sr-philosophy__principles li {
  counter-increment: principle;
  padding-left: 28px;
  position: relative;
}
.sr-philosophy__principles li::before {
  content: counter(principle, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: 1px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--blue-soft);
}
```

Replace with:

```css
/* Philosophy */
.sr-philosophy__quote {
  font-size: 28px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  font-weight: 500;
  color: var(--charcoal);
  margin: 0;
  align-self: start;
}
.sr-philosophy__quote em {
  font-style: italic;
  color: var(--blue);
  font-weight: 400;
}
.sr-philosophy__principles {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 14px;
  line-height: 1.4;
  color: var(--charcoal);
  counter-reset: principle;
  align-self: start;
}
.sr-philosophy__principles li {
  counter-increment: principle;
  padding-left: 28px;
  position: relative;
}
.sr-philosophy__principles li::before {
  content: counter(principle, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: 1px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--blue-soft);
}
```

The `grid-column: span 8` and `grid-column: 9 / -1` are gone — width comes from `sr-cell--5` / `sr-cell--4`.

- [ ] **Step 3: Verify in browser**

Refresh. Philosophy section shows: `03 · Philosophy · 4 principles / quote · italic accent` header, rule, quote on left (5 cells = 696, 2 rows tall = 264 height), principles on right (4 cells = 552, 2 rows tall), foot rule.

- [ ] **Step 4: Commit**

```bash
git add style-reference/index.html style-reference/style.css
git commit -m "Migrate Philosophy section to grid"
```

---

## Task 6: Migrate Color section

**Files:**
- Modify: `style-reference/index.html`
- Modify: `style-reference/style.css`

- [ ] **Step 1: Replace the Color HTML**

Find the entire `<section class="sr-section sr-color">` block (current lines 33-71) and replace with:

```html
    <section class="sr-section sr-color">
      <span class="sr-section__id">04</span>
      <h2 class="sr-section__title">Color</h2>
      <div class="sr-section__stats">
        <span><b>5</b> tokens</span>
        <span><b>2</b> alpha</span>
        <span>checker = α</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--3">
        <div class="sr-swatch">
          <div class="sr-swatch__chip" style="background:#F2EEE5"></div>
          <div class="sr-swatch__name">--field</div>
          <div class="sr-swatch__value">#F2EEE5</div>
        </div>
      </div>
      <div class="sr-cell sr-cell--3">
        <div class="sr-swatch">
          <div class="sr-swatch__chip" style="background:#1635EE"></div>
          <div class="sr-swatch__name">--blue</div>
          <div class="sr-swatch__value">#1635EE</div>
        </div>
      </div>
      <div class="sr-cell sr-cell--3">
        <div class="sr-swatch">
          <div class="sr-swatch__chip" style="background:#1A1A1A"></div>
          <div class="sr-swatch__name">--charcoal</div>
          <div class="sr-swatch__value">#1A1A1A</div>
        </div>
      </div>
      <div class="sr-cell sr-cell--4">
        <div class="sr-swatch">
          <div class="sr-swatch__chip sr-swatch__chip--checker" style="background-color:rgba(242, 238, 229, 0.95)"></div>
          <div class="sr-swatch__name">--field-overlay</div>
          <div class="sr-swatch__value">rgba(242, 238, 229, 0.95)</div>
        </div>
      </div>
      <div class="sr-cell sr-cell--4">
        <div class="sr-swatch">
          <div class="sr-swatch__chip sr-swatch__chip--checker" style="background-color:rgba(22, 53, 238, 0.6)"></div>
          <div class="sr-swatch__name">--blue-soft</div>
          <div class="sr-swatch__value">rgba(22, 53, 238, 0.6)</div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

Notes:
- 3 solid swatches at `--3` (= 408 wide each, total 9 cells = full row).
- 2 alpha swatches at `--4` (= 552 wide each, total 8 cells; one cell of trailing space — that's the spec-specified 2-row layout per §7).
- The chips' `aspect-ratio: 1/1` (already in `.sr-swatch__chip`) keeps them square; meta below the chip flows naturally.

- [ ] **Step 2: No CSS changes needed for `.sr-swatch*`**

The existing rules already work with the new grid (chips fill 100% of their parent cell, aspect-ratio handles height).

- [ ] **Step 3: Verify in browser**

Refresh. Color section shows: header `04 · Color · 5 tokens / 2 alpha / checker = α`, rule, then 3 swatches in row 1 (field, blue, charcoal), 2 swatches in row 2 (field-overlay, blue-soft) with one empty cell at the right, foot rule.

Each chip is square (since `aspect-ratio: 1/1`). The cell heights will vary because chip + name + value text don't sum to a clean cell-multiple. That's OK — the *cells* are on-grid; their *content* breathes inside.

- [ ] **Step 4: Commit**

```bash
git add style-reference/index.html
git commit -m "Migrate Color section to 3-cell solid + 4-cell alpha swatches"
```

---

## Task 7: Migrate Typography section

**Files:**
- Modify: `style-reference/index.html`

- [ ] **Step 1: Replace the Typography HTML**

Find `<section class="sr-section sr-typography">` and replace its entire body with:

```html
    <section class="sr-section sr-typography">
      <span class="sr-section__id">05</span>
      <h2 class="sr-section__title">Typography</h2>
      <div class="sr-section__stats">
        <span><b>6</b> sizes</span>
        <span><b>1</b> italic accent</span>
        <span>mono · utility only</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--3">
        <div class="sr-type__label">--wm-size-d / 0.95rem</div>
        <span class="sr-type__sample sr-type__sample--wm-d">Kees Leemeijer.</span>
      </div>
      <div class="sr-cell sr-cell--3">
        <div class="sr-type__label">--wm-size-m / 0.86rem</div>
        <span class="sr-type__sample sr-type__sample--wm-m">Kees Leemeijer.</span>
      </div>
      <div class="sr-cell sr-cell--3">
        <div class="sr-type__label">--label-size-d / 0.92rem</div>
        <span class="sr-type__sample sr-type__sample--lbl-d">European Bee-eater</span>
      </div>

      <div class="sr-cell sr-cell--3">
        <div class="sr-type__label">--label-size-m / 0.78rem</div>
        <span class="sr-type__sample sr-type__sample--lbl-m">European Bee-eater</span>
      </div>
      <div class="sr-cell sr-cell--5">
        <div class="sr-type__label">italic blue Latin (sole italic accent)</div>
        <span class="sr-type__sample sr-type__sample--latin">Merops apiaster</span>
      </div>
      <div class="sr-cell sr-cell--1"></div><!-- spacer -->

      <div class="sr-cell sr-cell--3">
        <div class="sr-type__label">--meta-size-d / 0.74rem</div>
        <span class="sr-type__sample sr-type__sample--meta-d">Photo 1 / 8</span>
      </div>
      <div class="sr-cell sr-cell--3">
        <div class="sr-type__label">--meta-size-m / 0.62rem</div>
        <span class="sr-type__sample sr-type__sample--meta-m">Photo 1 / 8</span>
      </div>
      <div class="sr-cell sr-cell--3"></div><!-- spacer -->

      <div class="sr-cell sr-cell--5">
        <div class="sr-type__label">mono utility / 11px / 0.06em</div>
        <span class="sr-type__sample sr-type__sample--mono">P5 · EUROPEAN BEE-EATER</span>
      </div>
      <div class="sr-cell sr-cell--4">
        <div class="sr-type__label">font stack</div>
        <div class="sr-type__stack">'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif</div>
        <div class="sr-type__label" style="margin-top:8px">mono stack</div>
        <div class="sr-type__stack">ui-monospace, "SF Mono", Menlo, Consolas, monospace</div>
      </div>

      <hr class="sr-rule" />
    </section>
```

Notes:
- Each row sums to 9 cells (or has explicit spacer cells). The `<!-- spacer -->` divs hold empty cells so each row's cells line up cleanly.
- Latin sample is `--5` (696) — slightly wider than spec's "5×1" so the italic display has room to breathe.

- [ ] **Step 2: Verify in browser**

Refresh. Typography section shows the type ladder in 4 rows of 3 / (3+5+1 spacer) / (3+3+3 spacer) / (5+4) cells. Mono stack panel sits to the right.

- [ ] **Step 3: Commit**

```bash
git add style-reference/index.html
git commit -m "Migrate Typography section to cell-multiples"
```

---

## Task 8: Migrate Spatial section

**Files:**
- Modify: `style-reference/index.html`

- [ ] **Step 1: Replace the Spatial HTML**

Find `<section class="sr-section sr-spatial">` and replace its body with:

```html
    <section class="sr-section sr-spatial">
      <span class="sr-section__id">06</span>
      <h2 class="sr-section__title">Spatial</h2>
      <div class="sr-section__stats">
        <span>tile <b>1320 × 744</b></span>
        <span>gutter <b>24</b></span>
        <span>edge <b>8</b></span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--9">
        <div class="sr-ruler">
          <div class="sr-ruler__bar" style="width:100%"></div>
          <div class="sr-ruler__caption">--tile-width / 1320px<span class="sr-ruler__note">scaled to track width</span></div>
        </div>
      </div>

      <div class="sr-cell sr-cell--3">
        <div class="sr-ruler">
          <div class="sr-ruler__bar sr-ruler__bar--vertical" style="height:120px"></div>
          <div class="sr-ruler__caption">--tile-height / 744px<span class="sr-ruler__note">5·u + 6·g</span></div>
        </div>
      </div>
      <div class="sr-cell sr-cell--3">
        <div class="sr-ruler">
          <div class="sr-ruler__bar sr-ruler__bar--gutter"></div>
          <div class="sr-ruler__caption">--gutter / 24px<span class="sr-ruler__note">actual size</span></div>
        </div>
      </div>
      <div class="sr-cell sr-cell--3">
        <div class="sr-ruler">
          <div class="sr-ruler__bar" style="width:8px; height:24px;"></div>
          <div class="sr-ruler__caption">--page-edge / 8px<span class="sr-ruler__note">outer boundary</span></div>
        </div>
      </div>

      <div class="sr-cell sr-cell--9">
        <div class="sr-ruler">
          <div class="sr-ruler__bar sr-ruler__bar--zero"></div>
          <div class="sr-ruler__caption">--tile-margin / 0px<span class="sr-ruler__note">no margin between tiles — rendered as a 1px reference line</span></div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

Notes:
- Updated tile-height ruler caption from `760px` to `744px` to match the new variable.
- Added a fourth ruler for `--page-edge` (the new variable). Three rulers in a row, each `--3`.
- First and last rulers are full-width (`--9`).

- [ ] **Step 2: Verify in browser**

Refresh. Spatial section shows: header `06 · Spatial · tile 1320 × 744 / gutter 24 / edge 8`, rule, full-width tile-width ruler, three `--3` rulers (height/gutter/edge), full-width zero-margin reference, foot rule.

- [ ] **Step 3: Commit**

```bash
git add style-reference/index.html
git commit -m "Migrate Spatial section + add page-edge ruler specimen"
```

---

## Task 9: Migrate Motion section

**Files:**
- Modify: `style-reference/index.html`

- [ ] **Step 1: Replace the Motion HTML**

Find `<section class="sr-section sr-motion">` and replace its body with:

```html
    <section class="sr-section sr-motion">
      <span class="sr-section__id">07</span>
      <h2 class="sr-section__title">Motion</h2>
      <div class="sr-section__stats">
        <span><b>4</b> demos</span>
        <span>focus-easing</span>
        <span>cubic-bezier</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--2">
        <div class="sr-motion__demo"><span class="sr-motion__value">0.08</span></div>
        <div class="sr-motion__caption">--pan-lerp / 0.08<br/>per-frame damping factor for pan velocity (JS)</div>
      </div>
      <div class="sr-cell sr-cell--2">
        <div class="sr-motion__demo"><div class="sr-motion__chip"></div></div>
        <div class="sr-motion__caption">--focus-fade / 360ms<br/>--focus-easing / cubic-bezier(0.22, 0.61, 0.36, 1)</div>
      </div>
      <div class="sr-cell sr-cell--2">
        <div class="sr-motion__demo">
          <span class="sr-motion__label">European Bee-eater<span class="latin">Merops apiaster</span></span>
        </div>
        <div class="sr-motion__caption">--label-in / 200ms ease-out<br/>--label-out / 150ms ease-in</div>
      </div>
      <div class="sr-cell sr-cell--2">
        <div class="sr-motion__demo"><div class="sr-motion__photo"></div></div>
        <div class="sr-motion__caption">--photo-decode / 200ms ease-out<br/>opacity 0 → 1, translateY(4px) → 0</div>
      </div>
      <div class="sr-cell sr-cell--1"></div><!-- spacer to fill row (4×2 + 1 = 9) -->

      <div class="sr-cell sr-cell--9">
        <div style="display:flex; align-items:center; gap:18px">
          <svg class="sr-motion__curve" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="0" y="0" width="80" height="80" fill="rgba(26,26,26,0.04)" />
            <line x1="0" y1="80" x2="80" y2="80" stroke="rgba(26,26,26,0.2)" stroke-width="0.5" />
            <line x1="0" y1="0" x2="0" y2="80" stroke="rgba(26,26,26,0.2)" stroke-width="0.5" />
            <line x1="0" y1="80" x2="80" y2="0" stroke="rgba(26,26,26,0.15)" stroke-width="0.5" stroke-dasharray="2 3" />
            <path d="M0,80 C17.6,31.2 28.8,0 80,0" stroke="#1635EE" stroke-width="1.5" fill="none" />
          </svg>
          <div class="sr-motion__caption">--focus-easing curve / cubic-bezier(0.22, 0.61, 0.36, 1) — fast start, gentle settle</div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 2: Verify in browser**

Refresh. Motion section: header, rule, 4 demo cells (`--2` each = 264 wide), 1 spacer cell, then full-width curve+caption row, foot rule.

- [ ] **Step 3: Commit**

```bash
git add style-reference/index.html
git commit -m "Migrate Motion section to 2-cell demos + 9-cell curve"
```

---

## Task 10: Migrate Components section (largest section)

**Files:**
- Modify: `style-reference/index.html`

- [ ] **Step 1: Replace the Components HTML**

Find `<section class="sr-section sr-components">` and replace its body with:

```html
    <section class="sr-section sr-components">
      <span class="sr-section__id">08</span>
      <h2 class="sr-section__title">Components</h2>
      <div class="sr-section__stats">
        <span><b>9</b> components</span>
        <span>identity / labels</span>
        <span>cells / brand / panel</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--3">
        <span class="sr-cell__label">IDENTITY</span>
        <div class="sr-cell__body">
          <a class="identity" href="../" aria-label="Identity sample (back to portfolio)">
            <img class="pictogram" src="../files/logo/SVG/logo.svg" alt="" aria-hidden="true" />
            <span><span class="name">Kees Leemeijer</span><span class="dot">.</span></span>
          </a>
        </div>
      </div>

      <div class="sr-cell sr-cell--3">
        <span class="sr-cell__label">SPECIES LABEL</span>
        <div class="sr-cell__body">
          <div class="species is-visible">
            <div class="line-name">European Bee-eater<span class="latin">Merops apiaster</span></div>
            <div class="meta">Photo 1 / 8</div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--3">
        <span class="sr-cell__label">COMPASS</span>
        <div class="sr-cell__body" style="text-align:right">
          <div class="compass">
            <div>Drag · arrow keys</div>
            <div>Arrangement <span class="arr">A</span></div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--3 sr-cell--r2">
        <span class="sr-cell__label">PHOTO CELL — DEFAULT</span>
        <div class="sr-cell__body">
          <div class="photo sr-photo" style="--ph-band-a:#3d6b8a; --ph-band-b:#4a7c9a;">
            <div class="placeholder" data-label="P1 · COMMON KINGFISHER"></div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--3 sr-cell--r2">
        <span class="sr-cell__label">PHOTO CELL — FOCUSED</span>
        <div class="sr-cell__body">
          <div class="photo sr-photo is-focused" style="--ph-band-a:#3d6b8a; --ph-band-b:#4a7c9a;">
            <div class="placeholder" data-label="P1 · COMMON KINGFISHER"></div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--3 sr-cell--r2"></div><!-- spacer to fill 9-col row -->

      <div class="sr-cell sr-cell--5 sr-cell--r3">
        <span class="sr-cell__label">BRAND CARD</span>
        <div class="sr-cell__body">
          <div class="photo sr-photo is-brand" style="aspect-ratio: 3 / 2; max-width: 696px">
            <div class="brand-inner">
              <img class="brand-picto" src="../files/logo/SVG/logo.svg" alt="" aria-hidden="true" />
              <span>Kees Leemeijer<span class="brand-dot">.</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4 sr-cell--r3">
        <span class="sr-cell__label">MOBILE CELL</span>
        <div class="sr-cell__body">
          <div class="mobile-edition">
            <div class="mcell" style="margin-bottom:0">
              <div class="mphoto" style="aspect-ratio: 3/2; --ph-band-a:#a87a3e; --ph-band-b:#b8893f;">
                <span>P5 · EUROPEAN BEE-EATER</span>
              </div>
              <div class="mlabel">European Bee-eater<span class="latin">Merops apiaster</span></div>
              <div class="mmeta">Photo 1 / 8</div>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">TWEAKS PANEL</span>
        <div class="sr-cell__body">
          <div class="tweaks is-open" role="region" aria-label="Tweaks (sample)">
            <span class="tw-title">Tweaks</span>
            <div class="tw"><label>Lerp</label><input type="range" min="0.01" max="0.40" step="0.01" value="0.08" disabled><span class="v">0.08</span></div>
            <div class="tw"><label>Zoom min</label><input type="range" min="0.1" max="1.0" step="0.05" value="0.5" disabled><span class="v">0.50</span></div>
            <div class="tw"><label>Zoom max</label><input type="range" min="1.0" max="8.0" step="0.1" value="3.0" disabled><span class="v">3.0</span></div>
            <div class="tw"><label>Ambient</label><input type="range" min="0.2" max="1" step="0.01" value="0.55" disabled><span class="v">0.55</span></div>
            <div class="tw"><label>Sat</label><input type="range" min="0" max="1" step="0.01" value="0.65" disabled><span class="v">0.65</span></div>
            <div class="tw"><label>Bri</label><input type="range" min="0.6" max="1.1" step="0.01" value="0.92" disabled><span class="v">0.92</span></div>
            <div class="tw"><label>Fade</label><input type="range" min="120" max="800" step="20" value="360" disabled><span class="v">360</span></div>
            <div class="tw"><label>Blue</label><input type="color" value="#1635EE" disabled></div>
            <div class="tw"><label>Field</label><input type="color" value="#F2EEE5" disabled></div>
          </div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

Layout summary:
- Row 1: identity / species / compass — 3 + 3 + 3 = 9
- Rows 2-3: photo default / photo focused / spacer — 3 + 3 + 3, each 2 rows tall (3:2 photos at 408 × 264)
- Rows 4-6: brand card (5×3) / mobile cell (4×3) — 5 + 4 = 9, each 3 rows tall
- Row 7: tweaks panel (9×1)

The mobile cell is `--4 --r3` instead of the spec's `3×4` because 4 cells wide × 3 rows tall gives a more honest mobile-cell aspect (552 wide × 408 tall) for a 360-wide phone scaled up. Acceptable spec deviation; document in commit.

- [ ] **Step 2: Verify in browser**

Refresh. Components section is dense. Check:
- Three label/text components in row 1 (identity, species label with italic latin, compass)
- Two photo cells in rows 2-3 (one default ambient, one focused with shadow); third cell is empty
- Brand card with picto + wordmark on left of rows 4-6
- Mobile cell preview to the right of brand
- Full-width tweaks panel at the bottom

- [ ] **Step 3: Commit**

```bash
git add style-reference/index.html
git commit -m "Migrate Components section (3:2 photos, 5x3 brand, 9x1 tweaks)"
```

---

## Task 11: Migrate Layering and Colophon sections

**Files:**
- Modify: `style-reference/index.html`
- Modify: `style-reference/style.css`

- [ ] **Step 1: Replace the Layering HTML**

Find `<section class="sr-section sr-layering">` and replace with:

```html
    <section class="sr-section sr-layering">
      <span class="sr-section__id">09</span>
      <h2 class="sr-section__title">Layering</h2>
      <div class="sr-section__stats">
        <span><b>3</b> stack levels</span>
        <span>static + dynamic</span>
      </div>
      <hr class="sr-rule" />

      <p class="sr-cell sr-cell--5 sr-cell--r2 sr-layering__body">This static grid is designed to be composed above a dynamic pannable background. Future portfolio surfaces stack from a pannable photo plane below, through this static UI grid, to focus overlays and labels on top.</p>
      <ol class="sr-cell sr-cell--3 sr-cell--r2 sr-layering__stack">
        <li>Above &mdash; focus overlays / labels</li>
        <li>Foreground &mdash; static UI grid (this)</li>
        <li>Background &mdash; pannable photo plane</li>
      </ol>
      <div class="sr-cell sr-cell--1"></div><!-- spacer -->

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 2: Replace the Colophon HTML**

Find `<section class="sr-section sr-colophon">` and replace with:

```html
    <section class="sr-section sr-colophon">
      <span class="sr-section__id">10</span>
      <h2 class="sr-section__title">Colophon</h2>
      <div class="sr-section__stats">
        <span>set in</span>
        <span>ABC Diatype</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--9 sr-colophon__body">
        <div>Set in ABC Diatype.</div>
        <div class="sr-colophon__signature">Kees Leemeijer<span class="dot">.</span></div>
        <div>2026-04-27 · v1</div>
      </div>
    </section>
```

- [ ] **Step 3: Update `.sr-layering*` and `.sr-colophon*` CSS**

Find:

```css
/* Layering note */
.sr-layering__body {
  grid-column: span 8;
  font-size: 16px;
  line-height: 1.5;
  color: var(--charcoal);
  max-width: 60ch;
}
.sr-layering__stack {
  grid-column: 9 / -1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.7);
}
```

Replace with:

```css
/* Layering note */
.sr-layering__body {
  font-size: 16px;
  line-height: 1.5;
  color: var(--charcoal);
  max-width: 60ch;
  margin: 0;
  align-self: start;
}
.sr-layering__stack {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.7);
  align-self: start;
}
```

Find:

```css
/* Colophon */
.sr-colophon { padding-top: 32px; padding-bottom: 64px; }
.sr-colophon__body {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.6);
}
```

Replace with:

```css
/* Colophon */
.sr-colophon__body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.6);
  align-self: center;
}
```

The `.sr-colophon { padding-top / bottom }` rule is removed — section margin from `.sr-section + .sr-section` handles spacing now.

- [ ] **Step 4: Verify in browser**

Refresh. Layering and Colophon both render with id/title/stats headers and rules. Layering: body text on left (5 cells), stack on right (3 cells), 1-cell spacer. Colophon: full-width meta line with three columns (Set in, signature, date).

- [ ] **Step 5: Commit**

```bash
git add style-reference/index.html style-reference/style.css
git commit -m "Migrate Layering and Colophon sections"
```

---

## Task 12: Add the new Grid ruleset section as the first specimen

**Files:**
- Modify: `style-reference/index.html` (insert new section before Masthead)
- Modify: `style-reference/style.css` (add `.sr-grid-ruleset*` rules)

- [ ] **Step 1: Insert the Grid ruleset section**

In `style-reference/index.html`, immediately after `<main class="sr-page">` and **before** `<section class="sr-section sr-masthead">`, insert:

```html
    <section class="sr-section sr-grid-ruleset">
      <span class="sr-section__id">01</span>
      <h2 class="sr-section__title">Grid</h2>
      <div class="sr-section__stats">
        <span><b>9</b> cols</span>
        <span><b>1336</b> outer</span>
        <span><b>1320</b> tile</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--page-width</div><div class="sr-token__v">1336</div></div>
      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--tile-width</div><div class="sr-token__v">1320</div></div>
      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--tile-height</div><div class="sr-token__v">744</div></div>
      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--page-edge</div><div class="sr-token__v">8</div></div>
      <div class="sr-cell sr-cell--1"></div><!-- spacer -->

      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--gutter</div><div class="sr-token__v">24</div></div>
      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--cell</div><div class="sr-token__v">120</div></div>
      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--cols</div><div class="sr-token__v">9</div></div>
      <div class="sr-cell sr-cell--2 sr-token"><div class="sr-token__k">--tick</div><div class="sr-token__v">2</div></div>
      <div class="sr-cell sr-cell--1 sr-token"><div class="sr-token__k">--stride</div><div class="sr-token__v">144</div></div>

      <div class="sr-cell sr-cell--9 sr-cell--r3 sr-grid-ruleset__diagram" aria-label="Page anatomy diagram">
        <div class="sr-anatomy">
          <div class="sr-anatomy__edge sr-anatomy__edge--l"></div>
          <div class="sr-anatomy__edge sr-anatomy__edge--r"></div>
          <div class="sr-anatomy__edge sr-anatomy__edge--t"></div>
          <div class="sr-anatomy__edge sr-anatomy__edge--b"></div>
          <div class="sr-anatomy__caption">page-edge 8 · tile 1320 · 9 × u=120 · g=24</div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 2: Add `.sr-grid-ruleset*`, `.sr-token*`, `.sr-anatomy*` CSS**

Append to the end of `style-reference/style.css`:

```css
/* ============================================================
   Grid ruleset — first specimen on the page
   ============================================================ */
.sr-token {
  background: rgba(26, 26, 26, 0.04);
  border-left: 2px solid var(--blue);
  padding: 12px 14px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  align-self: start;
}
.sr-token__k {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(26, 26, 26, 0.55);
  text-transform: uppercase;
}
.sr-token__v {
  font-size: 22px;
  color: var(--charcoal);
  font-weight: 500;
  margin-top: 4px;
}

.sr-grid-ruleset__diagram {
  position: relative;
}
.sr-anatomy {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--field);
  border: 1px solid rgba(26, 26, 26, 0.12);
  background-image:
    /* horizontal cell ticks every 144 (u + g) */
    linear-gradient(to right, rgba(22, 53, 238, 0.08) 0 1px, transparent 1px),
    /* vertical cell ticks every 144 */
    linear-gradient(to bottom, rgba(22, 53, 238, 0.08) 0 1px, transparent 1px);
  background-size: var(--stride) 100%, 100% var(--stride);
  background-position: var(--gutter) 0, 0 var(--gutter);
}
.sr-anatomy__edge {
  position: absolute;
  background: rgba(22, 53, 238, 0.18);
}
.sr-anatomy__edge--l { left: 0; top: 0; bottom: 0; width: var(--page-edge); }
.sr-anatomy__edge--r { right: 0; top: 0; bottom: 0; width: var(--page-edge); }
.sr-anatomy__edge--t { left: 0; top: 0; right: 0; height: var(--page-edge); }
.sr-anatomy__edge--b { left: 0; bottom: 0; right: 0; height: var(--page-edge); }
.sr-anatomy__caption {
  position: absolute;
  bottom: 6px;
  right: 12px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--blue);
  background: rgba(242, 238, 229, 0.92);
  padding: 2px 6px;
  text-transform: uppercase;
  border: 1px solid rgba(22, 53, 238, 0.35);
}
```

- [ ] **Step 3: Verify in browser**

Refresh. New first section "01 · Grid · 9 cols / 1336 outer / 1320 tile" appears at the top. Below the rule: 9 token cards across two rows (page-width / tile-width / tile-height / page-edge / spacer; gutter / cell / cols / tick / stride). Below them: a 9-cell-wide × 3-row anatomy diagram with subtle vertical and horizontal cell-tick lines and 8-px tinted edge strips on all four sides.

- [ ] **Step 4: Commit**

```bash
git add style-reference/index.html style-reference/style.css
git commit -m "Add Grid ruleset as first specimen section"
```

---

## Task 13: Add `?grid` debug overlay

**Files:**
- Modify: `style-reference/index.html` (small inline `<script>` at the end of `<body>`)
- Modify: `style-reference/style.css` (`.show-grid` rules)

- [ ] **Step 1: Insert the URL-flag script in `style-reference/index.html`**

Just before `</body>`, add:

```html
    <script>
      // Toggle the grid overlay via the ?grid URL flag.
      // Example: http://localhost:8000/style-reference/?grid
      if (new URLSearchParams(location.search).has('grid')) {
        document.body.classList.add('show-grid');
      }
    </script>
```

- [ ] **Step 2: Append `.show-grid` rules to `style-reference/style.css`**

Append at the end of the file:

```css
/* ============================================================
   ?grid debug overlay — opt-in via URL flag
   ============================================================ */

/* Edge strip — single border-trick draws all four sides at once */
.show-grid .sr-page::before {
  content: '';
  position: absolute;
  inset: 0;
  border: var(--page-edge) solid rgba(22, 53, 238, 0.18);
  pointer-events: none;
  z-index: 50;
}

/* Cell-grid overlay on every section: vertical lines every (cell + gutter),
   horizontal lines every stride. The background-position offset accounts for
   the section's grid not having an outer-left gutter — the first cell starts
   at x=0 inside .sr-section. */
.show-grid .sr-section {
  background-image:
    linear-gradient(to right,
      rgba(22, 53, 238, 0.10) 0 1px,
      transparent 1px),
    linear-gradient(to bottom,
      rgba(22, 53, 238, 0.05) 0 1px,
      transparent 1px);
  background-size: var(--stride) 100%, 100% var(--stride);
  background-position: 0 0, 0 0;
  background-repeat: repeat;
}

/* Fixed bottom-right legend */
body.show-grid::after {
  content: 'u 120 · g 24 · edge 8 · tick 2';
  position: fixed;
  right: 16px;
  bottom: 16px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--blue);
  background: rgba(242, 238, 229, 0.92);
  padding: 4px 8px;
  border: 1px solid rgba(22, 53, 238, 0.35);
  text-transform: uppercase;
  z-index: 60;
  pointer-events: none;
}
```

- [ ] **Step 3: Verify in browser (default mode)**

Open `http://localhost:8000/style-reference/`. No grid overlay should appear. Page reads as before (clean specimen).

- [ ] **Step 4: Verify in browser (debug mode)**

Open `http://localhost:8000/style-reference/?grid`. Now you should see:
- Tinted blue strips along the top and bottom edges of `.sr-page` (the 8-px edge boundary)
- Subtle dashed-feel column ticks behind each section
- Fixed bottom-right legend reading `u 120 · g 24 · edge 8 · tick 2`

- [ ] **Step 5: Commit**

```bash
git add style-reference/index.html style-reference/style.css
git commit -m "Add ?grid debug overlay"
```

---

## Task 14: Add mobile fallback (≤ 720)

**Files:**
- Modify: `style-reference/style.css` (append a new `@media` block at the end)

- [ ] **Step 1: Append the mobile rules**

Append at the end of `style-reference/style.css`:

```css
/* ============================================================
   Mobile fallback — single-column flow below 720px
   ============================================================ */
@media (max-width: 720px) {
  .sr-page {
    width: 100%;
    padding: var(--page-edge);
  }

  .sr-section {
    display: block;
  }

  .sr-section__id,
  .sr-section__title,
  .sr-section__stats {
    display: block;
    text-align: left;
    margin: 0 0 8px;
  }
  .sr-section__title { font-size: 18px; }
  .sr-section__stats { margin-top: 4px; }

  .sr-cell,
  [class*="sr-cell--"] {
    display: block;
    width: 100% !important;
    margin-bottom: var(--gutter);
  }

  .sr-rule {
    display: block;
    margin: 12px 0;
  }

  /* Disable the ?grid overlay on mobile — it doesn't make sense without the cell grid */
  body.show-grid::after { display: none; }
  .show-grid .sr-section { background-image: none; }
}
```

- [ ] **Step 2: Verify in browser (mobile width)**

Resize the browser window to <720px width, OR use devtools device emulation. The page should:

- Stack to a single column
- Each cell becomes full-width
- Section header (id / title / stats) reads top-down rather than as a row
- Mobile cell component (already inline) renders at its 360px max-width
- No horizontal scroll

- [ ] **Step 3: Commit**

```bash
git add style-reference/style.css
git commit -m "Add mobile fallback (single-column below 720)"
```

---

## Task 15: Final verification + cleanup

**Files:**
- Read-only: visual check of `style-reference/index.html` rendering
- Modify (only if issues found): the affected file

- [ ] **Step 1: Full-page browser walkthrough at 1440 wide**

Open `http://localhost:8000/style-reference/`. Walk through every section top-to-bottom. Confirm:

- 01 Grid — token cards + anatomy diagram
- 02 Masthead — id/title/stats, then wordmark + display title + meta
- 03 Philosophy — quote left, principles right
- 04 Color — 3 solid swatches + 2 alpha swatches
- 05 Typography — type ladder
- 06 Spatial — rulers
- 07 Motion — 4 demos + curve plot
- 08 Components — identity/species/compass row, photo cells, brand + mobile cell, tweaks
- 09 Layering — body + stack
- 10 Colophon — meta line

Each section has: id + title + stats header, top rule, content cells, foot rule.

- [ ] **Step 2: Confirm `?grid` overlay**

Open `http://localhost:8000/style-reference/?grid`. Confirm edge strips, cell tick overlay, bottom-right legend.

- [ ] **Step 3: Confirm mobile**

Resize <720px. Single-column flow, headers stack, cells full-width.

- [ ] **Step 4: Search for stale `sr-cell--` classes**

Run from project root:

```bash
grep -nE "sr-cell--(12|0|1[0-9])" style-reference/index.html
```

Expected output: empty (no `--12` left after migration; legacy aliasing in CSS still handles any stragglers but no usages should remain).

If anything is found, replace `--12` with `--9` and recommit.

- [ ] **Step 5: Search for stale `<hr class="sr-rule" />` outside of sections**

Run from project root:

```bash
grep -nE '^\s*<hr class="sr-rule"' style-reference/index.html
```

Every match should be inside a `<section>` (between the header and content, or at the section foot). If any are between sections, delete them.

- [ ] **Step 6: Run a quick visual diff against the spec acceptance criteria (§13)**

Per spec §13:

1. Every element has `grid-column` and `grid-row` (or is inside a parent that does), or is positioned via `--page-edge` / `--gutter` / `--cell` / `--tick`. **Spot-check:** open devtools, click any cell, verify `grid-column` is set.
2. CSS has one prominently-commented Grid block at top — confirm by opening `style.css` line 1.
3. `?grid` renders the V4 cell overlay — confirmed in Step 2.
4. `--tile-height` is `744px` — confirm via `grep "tile-height" style-reference/style.css`.
5. Page reads cleanly at 1336 wide and reflows below 720 — confirmed in Steps 1, 3.

- [ ] **Step 7: Final commit (only if any cleanup was needed)**

If any of Steps 4-6 surfaced a fix:

```bash
git add style-reference/
git commit -m "Cleanup: stale cell classes and stray separators"
```

If no fixes were needed, skip this step.

---

## Self-review notes

**Spec coverage:**

- §2 Locked ruleset → Task 1 (variables), Task 12 (token cards reference)
- §3 CSS organization → Task 1 (Grid block at top of file)
- §4 Page anatomy → Task 2 (`.sr-page` padding, layout rules)
- §5 Section anatomy → Task 3 (CSS), Tasks 4-12 (per-section markup)
- §6 Cell utility ladder → Task 3
- §7 Component refits → Tasks 4-12 (each section)
- §8 Grid ruleset specimen → Task 12
- §9 `?grid` debug overlay → Task 13
- §10 Mobile fallback → Task 14
- §11 Discrepancies fixed → Task 1 (`--tile-height` 760→744), Task 2 (`<hr>` removal, padding rewrite)
- §13 Acceptance → Task 15

**Type/name consistency:**

- `.sr-section__id`, `.sr-section__title`, `.sr-section__stats` are introduced in Task 3 CSS and used identically in Tasks 4-12.
- `.sr-cell--N` and `.sr-cell--rN` are introduced in Task 3 and used throughout.
- `--page-edge`, `--gutter`, `--cell`, `--cols`, `--tick`, `--stride` are introduced in Task 1 and consumed in Tasks 2, 3, 12, 13, 14.
- The mobile-cell deviation in Task 10 (4×3 instead of spec's 3×4) is documented in the task body and commit message.

**Out-of-scope reminders:**

- Don't touch the portfolio's own `index.html`, `app.js`, root `styles.css`. Those keep using the existing `--tile-width: 1320px` etc.
- Don't replace placeholder swatches with real photos in the photo cells.
- Don't rewrite the motion demo's internal magic numbers (`80`, `60`, `40`, `32`).
