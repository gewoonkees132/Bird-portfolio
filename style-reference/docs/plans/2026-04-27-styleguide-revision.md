# Styleguide Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the style-reference specimen page to a Foundations / Components / Patterns trinity, add a uniform per-component anatomy template, define a new Overlays pattern (3.1), remove the Tweaks panel, and update the workspace's captions policy.

**Architecture:** Vanilla HTML/CSS only — no build step, no JavaScript dependencies for the page to render. Three files change: `index.html` (structural reorg + new sections), `style.css` (new CSS for anatomy/identity/group-marker/overlay primitives, deletion of tweaks rules, class renames), `CLAUDE.md` (captions policy + inventory). Verification is grep-based (structural correctness) + browser-eyeball (visual correctness) — there is no test suite in this workspace.

**Tech Stack:** HTML5, CSS3, `python -m http.server` for local rendering.

**Spec:** `style-reference/docs/specs/2026-04-27-styleguide-revision-design.md`

---

## File map

- **Modify:** `style-reference/index.html` — renumber/regroup all sections, insert Identity (1.2), split Components into 2.1–2.6 subsections, insert Patterns/Overlays (3.1), remove Tweaks specimen
- **Modify:** `style-reference/style.css` — add new CSS for `.sr-group`, `.sr-anatomy__*`, `.sr-identity-*`, `.sr-overlay-*`, three new tokens; remove tweaks CSS block; rename `.sr-spatial`/`.sr-layering`/`.sr-philosophy` selectors
- **Modify:** `style-reference/CLAUDE.md` — captions policy rewrite, component inventory update, anatomy-template note

## Phase ordering and rationale

Six phases ordered to keep each commit independently sensible and the page renderable at every step:

1. **Cleanup** — remove tweaks, rename three selectors. Page still renders identically except for the missing tweaks card.
2. **Group markers + Foundations renumber** — add the `.sr-group` infrastructure, renumber existing Foundation-level sections (Grid → 1.3, Color → 1.4, etc.), reorder them. No new content yet.
3. **Identity (1.2)** — insert the new foundation section.
4. **Components template + split** — split the single Components section into 2.1–2.6 subsections, add anatomy template CSS, populate callouts/legend/usage.
5. **Patterns + Overlays** — add Patterns group marker + Overlays section + overlay tokens.
6. **CLAUDE.md + final verification** — policy rewrite, inventory update, full acceptance-criteria pass.

---

## Phase 1 — Cleanup

### Task 1: Verify baseline render

**Files:**
- Read: `style-reference/index.html`
- Read: `style-reference/style.css`

- [ ] **Step 1: Start the dev server**

Run from inside `style-reference/`:
```
python -m http.server
```
Open http://localhost:8000/ and confirm the page renders. Take a mental snapshot of the section order: 01 Grid, 02 Masthead, 03 Philosophy, 04 Color, 05 Typography, 06 Spatial, 07 Motion, 08 Components (with Tweaks panel at the end), 09 Layering, 10 Colophon.

- [ ] **Step 2: Capture baseline grep counts (will compare after each phase)**

Run from `style-reference/`:
```
grep -c 'sr-section' index.html
grep -c 'sr-tweaks\|class="tweaks\|class="tw\b' index.html
grep -c 'sr-spatial\|sr-layering\|sr-philosophy' style.css
```
Expected: ~10 sections, several tweaks references in HTML, 10 occurrences of the three rename targets in CSS.

### Task 2: Remove the Tweaks panel from index.html

**Files:**
- Modify: `style-reference/index.html` — delete the `<div class="sr-cell sr-cell--9">` block containing `<span class="sr-cell__label">TWEAKS PANEL</span>` (currently lines 366–382)

- [ ] **Step 1: Delete the entire Tweaks panel cell**

In `style-reference/index.html`, delete the block that begins:
```html
      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">TWEAKS PANEL</span>
        <div class="sr-cell__body">
          <div class="tweaks is-open" role="region" aria-label="Tweaks (sample)">
```
…and ends with the matching `</div></div></div>` block (the entire 9-cell row containing all `<input type="range">` and `<input type="color">` controls).

- [ ] **Step 2: Update the Components section stats line**

Find this block in `style-reference/index.html`:
```html
      <div class="sr-section__stats">
        <span><b>9</b> components</span>
        <span>identity / labels</span>
        <span>cells / brand / panel</span>
      </div>
```
Replace with:
```html
      <div class="sr-section__stats">
        <span><b>8</b> components</span>
        <span>identity / labels</span>
        <span>cells / brand</span>
      </div>
```
(The component count and the "panel" mention will be revised again in Phase 4 when the section splits; this interim value keeps the page consistent in the meantime.)

- [ ] **Step 3: Verify the tweaks specimen is gone from HTML**

Run from `style-reference/`:
```
grep -c 'class="tweaks\|class="tw\b\|class="tw-title' index.html
```
Expected output: `0`

- [ ] **Step 4: Refresh the browser**

Reload http://localhost:8000/. The Components section now ends with the Mobile Cell card. Page otherwise unchanged.

- [ ] **Step 5: Commit**

```
git -C "style-reference/.." add style-reference/index.html
git -C "style-reference/.." commit -m "Remove Tweaks panel specimen from index.html"
```

### Task 3: Remove all Tweaks panel CSS

**Files:**
- Modify: `style-reference/style.css` — delete all `.tweaks` and `.tw*` rules (lines 408–467 plus the references in `.sr-cell__body` selectors at lines 574 and 581)

- [ ] **Step 1: Delete the standalone tweaks CSS block**

In `style-reference/style.css`, delete every rule whose selector starts with `.tweaks`. This is a contiguous block beginning at the rule:
```css
.tweaks {
```
and ending after the rule:
```css
.tweaks .tw input[type="color"] {
  …
}
```

- [ ] **Step 2: Remove `.tweaks` from the `.sr-cell__body` compound selectors**

Find this rule:
```css
.sr-cell__body .identity,
.sr-cell__body .compass,
.sr-cell__body .species,
.sr-cell__body .tweaks {
```
Change to:
```css
.sr-cell__body .identity,
.sr-cell__body .compass,
.sr-cell__body .species {
```

Find this rule (separate single-property override):
```css
.sr-cell__body .tweaks { display: flex; }
```
Delete the entire line.

- [ ] **Step 3: Verify no tweaks selectors remain in CSS**

Run from `style-reference/`:
```
grep -c 'tweaks\|\.tw\b\|tw-title' style.css
```
Expected output: `0`

- [ ] **Step 4: Refresh and confirm page renders normally**

Reload http://localhost:8000/. No visual change since the HTML for tweaks was already removed.

- [ ] **Step 5: Commit**

```
git add style-reference/style.css
git commit -m "Remove Tweaks panel CSS rules"
```

### Task 4: Rename selectors — Spatial → Spacing, Layering → Elevation, Philosophy → Principles

**Files:**
- Modify: `style-reference/style.css` — global rename of three CSS selector roots
- Modify: `style-reference/index.html` — global rename of corresponding section class hooks and displayed titles

- [ ] **Step 1: Rename the CSS selectors in `style.css`**

Run three sed-style replacements (or use Edit tool with `replace_all: true`):

| Find | Replace with |
| --- | --- |
| `sr-spatial` | `sr-spacing` |
| `sr-layering` | `sr-elevation` |
| `sr-philosophy` | `sr-principles` |

This catches all class hooks (`.sr-spatial`, `.sr-layering__stack`, `.sr-philosophy__quote`, etc.) since the renames preserve suffix structure (`__quote`, `__principles`, `__body`, `__stack`).

- [ ] **Step 2: Apply the same renames to `index.html` class attributes**

Use Edit with `replace_all: true` for each of the three substrings. After this step:
- `<section class="sr-section sr-spatial">` becomes `<section class="sr-section sr-spacing">`
- `<section class="sr-section sr-layering">` becomes `<section class="sr-section sr-elevation">`
- `<section class="sr-section sr-philosophy">` becomes `<section class="sr-section sr-principles">`

(Plus the BEM-style suffixes inside each section, e.g. `sr-philosophy__quote` → `sr-principles__quote`.)

- [ ] **Step 3: Update the displayed `<h2>` text for the three sections**

Find and replace exactly these three lines in `index.html`:

| Find | Replace with |
| --- | --- |
| `<h2 class="sr-section__title">Philosophy</h2>` | `<h2 class="sr-section__title">Principles</h2>` |
| `<h2 class="sr-section__title">Spatial</h2>` | `<h2 class="sr-section__title">Spacing</h2>` |
| `<h2 class="sr-section__title">Layering</h2>` | `<h2 class="sr-section__title">Elevation</h2>` |

- [ ] **Step 4: Verify zero references to the old names remain**

Run from `style-reference/`:
```
grep -E 'sr-(spatial|layering|philosophy)' index.html style.css
grep -E '>(Philosophy|Spatial|Layering)<' index.html
```
Expected: both produce no output.

- [ ] **Step 5: Refresh and confirm three section headings show new names**

Reload http://localhost:8000/. The page now shows `03 Principles`, `06 Spacing`, `09 Elevation`. All visual treatment unchanged (because BEM-suffix structures were preserved).

- [ ] **Step 6: Commit**

```
git add style-reference/style.css style-reference/index.html
git commit -m "Rename Philosophy→Principles, Spatial→Spacing, Layering→Elevation"
```

---

## Phase 2 — Group markers and Foundations renumber

### Task 5: Add group-marker CSS

**Files:**
- Modify: `style-reference/style.css` — add new rules for `.sr-group` and `.sr-group__label`

- [ ] **Step 1: Append the group-marker CSS block**

Add to `style-reference/style.css`, immediately after the `.sr-section` rule block (around line 510, before `.sr-section__head`):

```css
/* ============================================================
   Group marker — divides top-level trinity (Foundations / Components / Patterns)
   Full-bleed row, one cell tall, hairline rule, mono uppercase label
   ============================================================ */
.sr-group {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 0 8px 0;
  margin: 32px 0 8px 0;
  border-bottom: 1px solid var(--blue-soft);
}
.sr-group__label {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--blue);
  font-weight: 500;
}
.sr-group__hint {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--charcoal);
  opacity: 0.45;
}
```

- [ ] **Step 2: Refresh — should be no visual change yet (no markup uses these classes)**

Reload. The new CSS rules are inert until Task 6 introduces markup that uses them.

- [ ] **Step 3: Commit**

```
git add style-reference/style.css
git commit -m "Add group-marker CSS for trinity dividers"
```

### Task 6: Reorder and renumber sections; insert group markers

**Files:**
- Modify: `style-reference/index.html` — renumber every `.sr-section__id`, reorder sections, insert three group-marker rows

- [ ] **Step 1: Renumber existing sections per the table below**

Edit each section's `<span class="sr-section__id">` text to match the new id. For sections being relocated, this happens together with the move in Step 2.

| Current order | Section | Old id | New id |
| --- | --- | --- | --- |
| 1 | Grid | 01 | 1.3 |
| 2 | Masthead | 02 | 00 |
| 3 | Principles (was Philosophy) | 03 | 1.1 |
| 4 | Color | 04 | 1.4 |
| 5 | Typography | 05 | 1.5 |
| 6 | Spacing (was Spatial) | 06 | 1.6 |
| 7 | Motion | 07 | 1.8 |
| 8 | Components | 08 | 2.0 (interim — Phase 4 splits this) |
| 9 | Elevation (was Layering) | 09 | 1.7 |
| 10 | Colophon | 10 | 99 |

- [ ] **Step 2: Reorder sections in the file to match the new sequence**

The new file order, top to bottom, must be:

1. `<section class="sr-section sr-masthead">` — id `00`
2. `<!-- Foundations group marker -->` (added in Step 3)
3. `<section class="sr-section sr-principles">` — id `1.1`
4. (Identity 1.2 — added in Phase 3)
5. `<section class="sr-section sr-grid-ruleset">` — id `1.3`
6. `<section class="sr-section sr-color">` — id `1.4`
7. `<section class="sr-section sr-typography">` — id `1.5`
8. `<section class="sr-section sr-spacing">` — id `1.6`
9. `<section class="sr-section sr-elevation">` — id `1.7`
10. `<section class="sr-section sr-motion">` — id `1.8`
11. `<!-- Components group marker -->` (added in Step 3)
12. `<section class="sr-section sr-components">` — id `2.0` (interim)
13. (Patterns group marker + Overlays 3.1 — added in Phase 5)
14. `<section class="sr-section sr-colophon">` — id `99`

Cut and paste each `<section>…</section>` block in `index.html` to achieve this order. Do not modify any inner content yet (apart from the `.sr-section__id` text changes from Step 1).

- [ ] **Step 3: Insert two group markers (Patterns marker comes in Phase 5)**

Insert immediately before the `<section class="sr-section sr-principles">` block:
```html
    <div class="sr-group">
      <span class="sr-group__label">1.0 · Foundations</span>
      <span class="sr-group__hint">tokens, principles, identity rules</span>
    </div>
```

Insert immediately before the `<section class="sr-section sr-components">` block:
```html
    <div class="sr-group">
      <span class="sr-group__label">2.0 · Components</span>
      <span class="sr-group__hint">composable atoms with anatomy + usage</span>
    </div>
```

- [ ] **Step 4: Verify file structure with grep**

Run from `style-reference/`:
```
grep -c 'sr-section__id' index.html
grep -c 'sr-group__label' index.html
grep -E '<span class="sr-section__id">' index.html
```
Expected: 10 section ids (Identity 1.2 not yet inserted, Components 2.0 still singular), 2 group markers, ids in this exact top-to-bottom order: `00, 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.0, 99`.

- [ ] **Step 5: Refresh the browser**

Reload http://localhost:8000/. Verify visually:
- Masthead is the first section, labeled `00`
- A `1.0 · Foundations` divider appears before Principles
- Sections appear in this top-to-bottom order: Masthead, [Foundations divider], Principles `1.1`, Grid `1.3`, Color `1.4`, Typography `1.5`, Spacing `1.6`, Elevation `1.7`, Motion `1.8`, [Components divider], Components `2.0`, Colophon `99`
- No section content is broken (every section still renders its specimen cells)

- [ ] **Step 6: Commit**

```
git add style-reference/index.html
git commit -m "Renumber and reorder sections to trinity structure (sans 1.2/3.1)"
```

---

## Phase 3 — Identity (1.2) foundation

### Task 7: Add Identity section CSS

**Files:**
- Modify: `style-reference/style.css` — append `.sr-identity-*` rule block

- [ ] **Step 1: Append the Identity CSS block at the end of `style.css`**

```css
/* ============================================================
   Identity (1.2) — mark at scale, clear-space, minimum size
   ============================================================ */
.sr-identity-mark {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
}
.sr-identity-mark__wordmark {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  font-size: 2.2rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--charcoal);
}
.sr-identity-mark__wordmark img {
  width: 32px;
  height: 32px;
}
.sr-identity-mark__wordmark .dot { color: var(--blue); }
.sr-identity-mark__dot-only {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--blue);
}

.sr-identity-clearspace {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 1em;                        /* 1× cap-height ≈ 1em on the rendered face */
  border: 1px dashed var(--blue-soft);
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--charcoal);
}
.sr-identity-clearspace .dot { color: var(--blue); }
.sr-identity-clearspace__edge {
  position: absolute;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue);
  opacity: 0.6;
  background: var(--field);
  padding: 0 4px;
  white-space: nowrap;
}
.sr-identity-clearspace__edge--top    { top: -7px; left: 50%; transform: translateX(-50%); }
.sr-identity-clearspace__edge--bottom { bottom: -7px; left: 50%; transform: translateX(-50%); }
.sr-identity-clearspace__edge--left   { left: -7px; top: 50%; transform: translate(-50%, -50%) rotate(-90deg); transform-origin: center; }
.sr-identity-clearspace__edge--right  { right: -7px; top: 50%; transform: translate(50%, -50%) rotate(90deg); transform-origin: center; }

.sr-identity-min {
  display: flex;
  align-items: flex-end;
  gap: 32px;
}
.sr-identity-min__wordmark {
  display: inline-flex;
  align-items: baseline;
  width: 96px;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--charcoal);
}
.sr-identity-min__wordmark .dot { color: var(--blue); }
.sr-identity-min__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--blue);
}
.sr-identity-min__caption {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--charcoal);
  opacity: 0.55;
  margin-top: 6px;
}
```

- [ ] **Step 2: Commit**

```
git add style-reference/style.css
git commit -m "Add Identity (1.2) section CSS"
```

### Task 8: Insert Identity (1.2) section in HTML

**Files:**
- Modify: `style-reference/index.html` — insert new `<section class="sr-section sr-identity">` between Principles (1.1) and Grid (1.3)

- [ ] **Step 1: Insert the section markup**

Add this block immediately after the closing `</section>` of Principles (`sr-principles`) and before the `<section class="sr-section sr-grid-ruleset">` opening tag:

```html
    <section class="sr-section sr-identity">
      <span class="sr-section__id">1.2</span>
      <h2 class="sr-section__title">Identity</h2>
      <div class="sr-section__stats">
        <span>mark at scale</span>
        <span>clear-space</span>
        <span>min size</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--5 sr-cell--r2">
        <span class="sr-cell__label">MARK AT SCALE</span>
        <div class="sr-cell__body">
          <div class="sr-identity-mark">
            <span class="sr-identity-mark__wordmark">
              <img src="files/logo.svg" alt="" aria-hidden="true" />
              <span>Kees Leemeijer<span class="dot">.</span></span>
            </span>
            <span class="sr-identity-mark__dot-only" aria-label="Dot-only mark"></span>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4 sr-cell--r2">
        <span class="sr-cell__label">CLEAR-SPACE — 1× CAP-H</span>
        <div class="sr-cell__body">
          <span class="sr-identity-clearspace">
            Kees Leemeijer<span class="dot">.</span>
            <span class="sr-identity-clearspace__edge sr-identity-clearspace__edge--top">1× cap-h</span>
            <span class="sr-identity-clearspace__edge sr-identity-clearspace__edge--right">1× cap-h</span>
            <span class="sr-identity-clearspace__edge sr-identity-clearspace__edge--bottom">1× cap-h</span>
            <span class="sr-identity-clearspace__edge sr-identity-clearspace__edge--left">1× cap-h</span>
          </span>
        </div>
      </div>

      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">MINIMUM SIZE</span>
        <div class="sr-cell__body">
          <div class="sr-identity-min">
            <div>
              <span class="sr-identity-min__wordmark">Kees Leemeijer<span class="dot">.</span></span>
              <div class="sr-identity-min__caption">min 96px</div>
            </div>
            <div>
              <span class="sr-identity-min__dot" aria-label="Dot-only minimum"></span>
              <div class="sr-identity-min__caption">min 8px</div>
            </div>
          </div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 2: Verify**

Run from `style-reference/`:
```
grep -c 'sr-identity' index.html
grep '>1\.2<' index.html
```
Expected: at least 5 `sr-identity*` matches; `<span class="sr-section__id">1.2</span>` present.

- [ ] **Step 3: Refresh and verify visually**

Reload http://localhost:8000/. Verify a new `1.2 Identity` section appears between Principles and Grid, with three rendered cells: Mark at Scale (large wordmark + dot-only), Clear-Space (wordmark inside a dashed rectangle with `1× cap-h` labels top-left and bottom-right), Minimum Size (96px wordmark + 8px dot side by side, each with caption).

- [ ] **Step 4: Commit**

```
git add style-reference/index.html
git commit -m "Add Identity (1.2) foundation section"
```

---

## Phase 4 — Components template + split into 2.1–2.6

### Task 9: Add component anatomy template CSS

**Files:**
- Modify: `style-reference/style.css` — append `.sr-anatomy__*` rule block; also a media query for the mobile fallback

- [ ] **Step 1: Append the anatomy CSS block**

```css
/* ============================================================
   Component anatomy template — numbered callouts + legend + usage
   Used inside every 2.x Component section
   ============================================================ */
.sr-anatomy {
  position: relative;
  display: inline-block;
}
.sr-anatomy__num {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: middle;
  background: var(--blue);
  color: #fff;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  border-radius: 1px;
  line-height: 1;
}
.sr-anatomy__legend {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--blue-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.5;
  color: var(--charcoal);
  opacity: 0.75;
}
.sr-anatomy__legend-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.sr-anatomy__usage {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 400;
  color: var(--charcoal);
  opacity: 0.55;
  line-height: 1.5;
  font-style: normal;
}

/* Mobile: hide the inline callouts; legend rows stay so the parts are still named */
@media (max-width: 720px) {
  .sr-anatomy__num { display: none; }
}
```

- [ ] **Step 2: Commit**

```
git add style-reference/style.css
git commit -m "Add component anatomy template CSS"
```

### Task 10: Replace single Components section with six numbered subsections

**Files:**
- Modify: `style-reference/index.html` — delete the entire current `<section class="sr-section sr-components">` block (id `2.0`) and replace it with six independent `<section class="sr-section">` blocks for 2.1–2.6

- [ ] **Step 1: Delete the existing single Components section**

Remove the entire `<section class="sr-section sr-components">…</section>` block currently at id `2.0`. It contains the six surviving cells (Identity, Species Label, Compass, Photo Cell Default, Photo Cell Focused, Brand Card, Mobile Cell). Keep the `<div class="sr-group">` Components marker that precedes it — it stays.

- [ ] **Step 2: Insert section 2.1 — Wordmark / dot**

```html
    <section class="sr-section sr-component sr-component--wordmark">
      <span class="sr-section__id">2.1</span>
      <h2 class="sr-section__title">Wordmark / dot</h2>
      <div class="sr-section__stats">
        <span>identity atom</span>
        <span>2 parts</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--5 sr-cell--r2">
        <span class="sr-cell__label">SPECIMEN</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy">
            <div class="identity">
              <img class="pictogram" src="files/logo.svg" alt="" aria-hidden="true" />
              <span><span class="anatomy-num-anchor"><span class="sr-anatomy__num">1</span></span><span class="name">Kees Leemeijer</span><span class="sr-anatomy__num">2</span><span class="dot">.</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4 sr-cell--r2">
        <span class="sr-cell__label">ANATOMY</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy__legend">
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">1</span> wordmark — sans 500, charcoal</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">2</span> dot — blue terminal mark</div>
          </div>
          <p class="sr-anatomy__usage">Used as the persistent identity atom across surfaces.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 3: Insert section 2.2 — Species label**

```html
    <section class="sr-section sr-component sr-component--species">
      <span class="sr-section__id">2.2</span>
      <h2 class="sr-section__title">Species label</h2>
      <div class="sr-section__stats">
        <span>caption atom</span>
        <span>3 parts</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--5 sr-cell--r2">
        <span class="sr-cell__label">SPECIMEN</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy">
            <div class="species is-visible">
              <div class="line-name"><span class="sr-anatomy__num">1</span>European Bee-eater<span class="sr-anatomy__num">2</span><span class="latin">Merops apiaster</span></div>
              <div class="meta"><span class="sr-anatomy__num">3</span>Photo 1 / 8</div>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4 sr-cell--r2">
        <span class="sr-cell__label">ANATOMY</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy__legend">
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">1</span> line-name — sans 500, charcoal</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">2</span> latin — italic blue (sole italic accent)</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">3</span> meta — mono utility, blue-soft</div>
          </div>
          <p class="sr-anatomy__usage">Captions a single bird photograph. One per cell, anchored bottom-left.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 4: Insert section 2.3 — Compass**

```html
    <section class="sr-section sr-component sr-component--compass">
      <span class="sr-section__id">2.3</span>
      <h2 class="sr-section__title">Compass</h2>
      <div class="sr-section__stats">
        <span>nav atom</span>
        <span>2 parts</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--5 sr-cell--r2">
        <span class="sr-cell__label">SPECIMEN</span>
        <div class="sr-cell__body" style="text-align:right">
          <div class="sr-anatomy">
            <div class="compass">
              <div><span class="sr-anatomy__num">1</span>Drag · arrow keys</div>
              <div><span class="sr-anatomy__num">2</span>Arrangement <span class="arr">A</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4 sr-cell--r2">
        <span class="sr-cell__label">ANATOMY</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy__legend">
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">1</span> instruction — mono utility, charcoal-soft</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">2</span> state — arrangement letter in blue</div>
          </div>
          <p class="sr-anatomy__usage">Tells the visitor how to navigate the photo plane and where they currently are.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 5: Insert section 2.4 — Photo cell**

```html
    <section class="sr-section sr-component sr-component--photo">
      <span class="sr-section__id">2.4</span>
      <h2 class="sr-section__title">Photo cell</h2>
      <div class="sr-section__stats">
        <span>display atom</span>
        <span>2 states</span>
        <span>2 parts</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--3 sr-cell--r2">
        <span class="sr-cell__label">DEFAULT</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy">
            <div class="photo sr-photo" style="--ph-band-a:#3d6b8a; --ph-band-b:#4a7c9a;">
              <div class="placeholder" data-label="P1 · COMMON KINGFISHER"></div>
              <span class="sr-anatomy__num" style="position:absolute; top:8px; left:8px;">1</span>
              <span class="sr-anatomy__num" style="position:absolute; bottom:8px; left:8px;">2</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--3 sr-cell--r2">
        <span class="sr-cell__label">FOCUSED</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy">
            <div class="photo sr-photo is-focused" style="--ph-band-a:#3d6b8a; --ph-band-b:#4a7c9a;">
              <div class="placeholder" data-label="P1 · COMMON KINGFISHER"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--3 sr-cell--r2">
        <span class="sr-cell__label">ANATOMY</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy__legend">
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">1</span> placeholder slug — mono uppercase</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">2</span> photo body — band gradient until image loads</div>
          </div>
          <p class="sr-anatomy__usage">A single photograph in the pannable plane. Adopts focused state when centered.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 6: Insert section 2.5 — Brand card** (no anatomy callouts; usage only)

```html
    <section class="sr-section sr-component sr-component--brand">
      <span class="sr-section__id">2.5</span>
      <h2 class="sr-section__title">Brand card</h2>
      <div class="sr-section__stats">
        <span>identity surface</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--5 sr-cell--r3">
        <span class="sr-cell__label">SPECIMEN</span>
        <div class="sr-cell__body">
          <div class="photo sr-photo is-brand" style="aspect-ratio: 3 / 2; max-width: 696px">
            <div class="brand-inner">
              <img class="brand-picto" src="files/logo.svg" alt="" aria-hidden="true" />
              <span>Kees Leemeijer<span class="brand-dot">.</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4 sr-cell--r3">
        <span class="sr-cell__label">USAGE</span>
        <div class="sr-cell__body">
          <p class="sr-anatomy__usage">Used as a full-bleed identity surface in the pannable plane (one per arrangement).</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 7: Insert section 2.6 — Mobile cell** (no anatomy callouts; usage only)

```html
    <section class="sr-section sr-component sr-component--mobile">
      <span class="sr-section__id">2.6</span>
      <h2 class="sr-section__title">Mobile cell</h2>
      <div class="sr-section__stats">
        <span>narrow-viewport surface</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--4 sr-cell--r3">
        <span class="sr-cell__label">SPECIMEN</span>
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

      <div class="sr-cell sr-cell--5 sr-cell--r3">
        <span class="sr-cell__label">USAGE</span>
        <div class="sr-cell__body">
          <p class="sr-anatomy__usage">Single-column placeholder edition shown below 720px viewport width.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 8: Verify all six subsections present and old single section gone**

Run from `style-reference/`:
```
grep -E '<span class="sr-section__id">2\.[1-6]</span>' index.html
grep -c 'sr-component--' index.html
grep -c 'class="sr-section sr-components"' index.html
```
Expected: six matching ids (2.1–2.6); six `sr-component--` class hooks; zero matches for the old singular `sr-components` class.

- [ ] **Step 9: Refresh the browser and verify visually**

Reload http://localhost:8000/. Verify:
- The Components group divider is followed by six numbered subsections in order: 2.1 Wordmark/dot, 2.2 Species label, 2.3 Compass, 2.4 Photo cell, 2.5 Brand card, 2.6 Mobile cell.
- Sections 2.1, 2.2, 2.3, 2.4 each render numbered blue callouts (small white-on-blue numerals) on the specimen, plus a dashed legend block beneath listing what each number names.
- Sections 2.5 and 2.6 omit callouts but each carry a one-line usage note.
- Every component subsection ends with the same hairline rule pattern as the foundation sections.

- [ ] **Step 10: Verify mobile fallback by resizing window below 720px**

Resize browser narrower than 720px. Confirm:
- Single-column layout still renders correctly.
- Numbered callouts (`.sr-anatomy__num`) are hidden inline on the specimens, but the legend rows beneath still render their numbers — so part names remain visible.

- [ ] **Step 11: Commit**

```
git add style-reference/index.html
git commit -m "Split Components into 2.1-2.6 subsections with anatomy template"
```

---

## Phase 5 — Patterns + Overlays (3.1)

### Task 11: Add overlay tokens and CSS

**Files:**
- Modify: `style-reference/style.css` — append three new tokens to the second `:root` block; append overlay specimen CSS

- [ ] **Step 1: Add the three overlay tokens to the second `:root` block**

Find the second `:root { ... }` block (the one starting with `--field: #F2EEE5;` around line 26–56). Inside that block, immediately before the closing `}`, add:

```css
  /* Overlay system (3.1) */
  --overlay-edge:    16px;   /* distance from surface edge */
  --overlay-gap:      8px;   /* gap between primitives within a slot */
  --overlay-z:        50;    /* above content, below modals */
```

- [ ] **Step 2: Append overlay specimen CSS at the end of `style.css`**

```css
/* ============================================================
   Overlays (3.1) — page-chrome positioning system
   8 named anchor slots on a 3×3 grid, center reserved for content
   ============================================================ */
.sr-overlay-diagram {
  position: relative;
  aspect-ratio: 3 / 2;
  background: linear-gradient(135deg, #1a3a5a 0%, #2a5a7a 35%, #5a9ab0 70%, #c8d4a0 100%);
  border: 1px solid var(--blue-soft);
  border-radius: 1px;
  overflow: hidden;
}
.sr-overlay-slot {
  position: absolute;
  padding: 4px 8px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.sr-overlay-slot--tl { top: var(--overlay-edge); left: var(--overlay-edge); }
.sr-overlay-slot--tc { top: var(--overlay-edge); left: 50%; transform: translateX(-50%); }
.sr-overlay-slot--tr { top: var(--overlay-edge); right: var(--overlay-edge); }
.sr-overlay-slot--ml { top: 50%; left: var(--overlay-edge); transform: translateY(-50%); }
.sr-overlay-slot--mr { top: 50%; right: var(--overlay-edge); transform: translateY(-50%); }
.sr-overlay-slot--bl { bottom: var(--overlay-edge); left: var(--overlay-edge); }
.sr-overlay-slot--bc { bottom: var(--overlay-edge); left: 50%; transform: translateX(-50%); }
.sr-overlay-slot--br { bottom: var(--overlay-edge); right: var(--overlay-edge); }
.sr-overlay-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.sr-overlay-primitive {
  display: flex;
  align-items: center;
  gap: var(--overlay-gap);
  padding: 12px 14px;
  border: 1px solid var(--blue-soft);
  border-radius: 1px;
  background: rgba(26, 26, 26, 0.04);
}
.sr-overlay-primitive__name {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue);
  opacity: 0.7;
  min-width: 96px;
}
.sr-overlay-primitive__sample { font-size: 13px; color: var(--charcoal); }
.sr-overlay-primitive__sample .ind-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #d72b2b;
  margin-right: 6px;
  vertical-align: middle;
  box-shadow: 0 0 6px rgba(215, 43, 43, 0.6);
}

.sr-overlay-applied {
  position: relative;
  aspect-ratio: 3 / 2;
  background: linear-gradient(135deg, #2a1a0a 0%, #5a3a1a 40%, #8a5a2a 80%);
  border-radius: 1px;
  overflow: hidden;
  z-index: 0;
}
.sr-overlay-applied::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 60%, rgba(255, 200, 100, 0.18), transparent 60%);
  pointer-events: none;
}
.sr-overlay-applied__layer {
  position: absolute;
  z-index: var(--overlay-z);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  font-family: var(--font-stack);
}
.sr-overlay-applied__layer--tl {
  top: var(--overlay-edge);
  left: var(--overlay-edge);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}
.sr-overlay-applied__layer--tl .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--blue);
}
.sr-overlay-applied__layer--bl {
  bottom: var(--overlay-edge);
  left: var(--overlay-edge);
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.sr-overlay-applied__layer--bl .live {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #d72b2b;
  box-shadow: 0 0 6px rgba(215, 43, 43, 0.7);
}
.sr-overlay-applied__layer--br {
  bottom: var(--overlay-edge);
  right: var(--overlay-edge);
  text-align: right;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.5;
}

/* Backdrop-blur opt-in (used only when text-shadow is insufficient) */
.sr-overlay-applied__layer.overlay--backdrop {
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  border-radius: 1px;
}
```

- [ ] **Step 3: Verify the three tokens are present**

Run from `style-reference/`:
```
grep -E '\-\-overlay-(edge|gap|z)' style.css
```
Expected: three matches in the `:root` block (definitions) plus several inside `.sr-overlay-*` rules (consumers).

- [ ] **Step 4: Commit**

```
git add style-reference/style.css
git commit -m "Add overlay tokens and pattern CSS"
```

### Task 12: Insert Patterns group marker and Overlays (3.1) section

**Files:**
- Modify: `style-reference/index.html` — insert a Patterns group marker and the Overlays section between the last 2.x component (`2.6 Mobile cell`) and the Colophon (99)

- [ ] **Step 1: Insert the Patterns group marker**

Add immediately before the Colophon section opening tag:

```html
    <div class="sr-group">
      <span class="sr-group__label">3.0 · Patterns</span>
      <span class="sr-group__hint">composed page-chrome systems</span>
    </div>
```

- [ ] **Step 2: Insert the Overlays (3.1) section, immediately after the Patterns group marker and before the Colophon**

```html
    <section class="sr-section sr-pattern sr-pattern--overlays">
      <span class="sr-section__id">3.1</span>
      <h2 class="sr-section__title">Overlays</h2>
      <div class="sr-section__stats">
        <span><b>8</b> slots</span>
        <span><b>6</b> primitives</span>
        <span><b>3</b> tokens</span>
      </div>
      <hr class="sr-rule" />

      <div class="sr-cell sr-cell--5 sr-cell--r3">
        <span class="sr-cell__label">SLOT DIAGRAM — 8 ANCHORS, CENTER RESERVED</span>
        <div class="sr-cell__body">
          <div class="sr-overlay-diagram">
            <span class="sr-overlay-slot sr-overlay-slot--tl">tl</span>
            <span class="sr-overlay-slot sr-overlay-slot--tc">tc</span>
            <span class="sr-overlay-slot sr-overlay-slot--tr">tr</span>
            <span class="sr-overlay-slot sr-overlay-slot--ml">ml</span>
            <span class="sr-overlay-slot sr-overlay-slot--mr">mr</span>
            <span class="sr-overlay-slot sr-overlay-slot--bl">bl</span>
            <span class="sr-overlay-slot sr-overlay-slot--bc">bc</span>
            <span class="sr-overlay-slot sr-overlay-slot--br">br</span>
            <span class="sr-overlay-center">— content —</span>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4 sr-cell--r3">
        <span class="sr-cell__label">CONTENT PRIMITIVES</span>
        <div class="sr-cell__body" style="display:flex; flex-direction:column; gap:8px;">
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">identity</span>
            <span class="sr-overlay-primitive__sample">Kees Leemeijer<span style="color:var(--blue)">.</span></span>
          </div>
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">text-line</span>
            <span class="sr-overlay-primitive__sample">Available for assignments</span>
          </div>
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">mono-utility</span>
            <span class="sr-overlay-primitive__sample" style="font-family:ui-monospace,monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.7;">v.2026.04 · 52.37°N</span>
          </div>
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">link</span>
            <span class="sr-overlay-primitive__sample" style="color:var(--blue); text-decoration:underline; text-underline-offset:3px;">contact →</span>
          </div>
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">indicator</span>
            <span class="sr-overlay-primitive__sample" style="font-family:ui-monospace,monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase;"><span class="ind-dot"></span>live</span>
          </div>
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">stack</span>
            <span class="sr-overlay-primitive__sample" style="font-family:ui-monospace,monospace; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.7; line-height:1.4;">two lines<br>like this</span>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">APPLIED EXAMPLE — TL: IDENTITY · BL: INDICATOR · BR: STACK</span>
        <div class="sr-cell__body">
          <div class="sr-overlay-applied">
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--tl">
              Kees Leemeijer<span class="dot"></span>
            </div>
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--bl">
              <span class="live"></span>live · banded 06:12
            </div>
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--br">
              52.37°N · 4.89°E<br>nikon z9 · 600mm f/4
            </div>
          </div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 3: Verify**

Run from `style-reference/`:
```
grep -E '<span class="sr-section__id">3\.1</span>' index.html
grep -c 'sr-overlay-slot--' index.html
grep -c 'sr-overlay-primitive' index.html
grep -c 'sr-group__label' index.html
```
Expected: one 3.1 id; eight slot class hooks (tl, tc, tr, ml, mr, bl, bc, br); six primitive rows; three group markers (Foundations, Components, Patterns).

- [ ] **Step 4: Refresh and verify visually**

Reload http://localhost:8000/. Verify:
- A `3.0 · Patterns` divider precedes a new section `3.1 Overlays`
- The slot diagram shows a 3:2 surface with 8 dashed labels (`tl`, `tc`, `tr`, `ml`, `mr`, `bl`, `bc`, `br`) and `— content —` in the center
- The primitives column lists six rows (identity, text-line, mono-utility, link, indicator, stack)
- The applied example shows a warm gradient with three overlays: identity top-left, indicator bottom-left, stack bottom-right
- Colophon (`99`) follows immediately after the Overlays section

- [ ] **Step 5: Commit**

```
git add style-reference/index.html
git commit -m "Add Patterns group + Overlays (3.1) section"
```

---

## Phase 6 — CLAUDE.md update + final verification

### Task 13: Update CLAUDE.md captions policy and component inventory

**Files:**
- Modify: `style-reference/CLAUDE.md` — replace the captions sentence in **Isolation rules**, update **Component inventory**, add an anatomy-template note

- [ ] **Step 1: Replace the captions sentence in Isolation rules**

In `style-reference/CLAUDE.md`, find this exact line:
```
- The specimen IS the spec. Don't add anti-patterns, captions, or do/don't comparisons; the rendered system speaks for itself.
```
Replace with:
```
- The specimen leads. Anatomy callouts and one-line usage notes are allowed where rendered form alone is ambiguous. No do/don't tables, no marketing copy, no anti-pattern panels — restraint over verbosity.
```

- [ ] **Step 2: Update the Component inventory list to match the new structure**

In `style-reference/CLAUDE.md`, find the Component inventory section and replace its bullet list with:

```
- 2.1 Wordmark + dot
- 2.2 Species label (line-name + italic blue Latin + uppercase blue-soft meta)
- 2.3 Compass
- 2.4 Photo cell (default + `.is-focused`)
- 2.5 Brand card
- 2.6 Mobile cell

Patterns:
- 3.1 Overlays (8 anchor slots × 6 content primitives)
```

(Tweaks panel is removed from the inventory entirely.)

- [ ] **Step 3: Add a one-line anatomy-template note**

Append to the **Component inventory** section, immediately after the new list:

```
Each component renders into a uniform template — specimen with numbered anatomy callouts, legend, one-line usage. Components 2.5 and 2.6 omit callouts (no distinct named parts) but still carry a usage note.
```

- [ ] **Step 4: Verify**

Run from `style-reference/`:
```
grep -c 'tweaks panel' CLAUDE.md
grep 'specimen leads' CLAUDE.md
grep '3\.1 Overlays' CLAUDE.md
```
Expected: zero `tweaks panel` matches; one `specimen leads` line; one `3.1 Overlays` line.

- [ ] **Step 5: Commit**

```
git add style-reference/CLAUDE.md
git commit -m "Update CLAUDE.md captions policy and inventory"
```

### Task 14: Full acceptance-criteria pass

**Files:**
- Read-only verification across `style-reference/`

- [ ] **Step 1: Verify section ordering and ids (acceptance criterion 1)**

Run from `style-reference/`:
```
grep -nE '<span class="sr-section__id">' index.html
```
Expected order, top to bottom:
```
00, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 99
```
That is 17 sections total (1 masthead + 8 foundations + 6 components + 1 pattern + 1 colophon).

- [ ] **Step 2: Verify Tweaks specimen absent (acceptance criterion 2)**

Run from `style-reference/`:
```
grep -E 'tweaks|tw-title|class="tw\b' index.html style.css
grep -E '>Tweaks<' index.html
```
Expected: both produce no output.

- [ ] **Step 3: Verify anatomy callouts on 2.1–2.4 (acceptance criterion 3)**

Run from `style-reference/`:
```
grep -E 'sr-component--(wordmark|species|compass|photo)' index.html
```
For each of the four matched sections, manually scan the surrounding HTML to confirm both an `sr-anatomy__num` element and an `sr-anatomy__legend` block are present.

```
grep -E 'sr-component--(brand|mobile)' index.html
```
For each of those two sections, confirm there is an `sr-anatomy__usage` block but NO `sr-anatomy__num` and NO `sr-anatomy__legend`.

- [ ] **Step 4: Verify usage note on every component (acceptance criterion 4)**

Run from `style-reference/`:
```
grep -c 'sr-anatomy__usage' index.html
```
Expected: exactly 6 (one per component subsection 2.1–2.6).

- [ ] **Step 5: Verify Identity (1.2) subsections (acceptance criterion 5)**

Run from `style-reference/`:
```
grep -E 'sr-identity-(mark|clearspace|min)' index.html
```
Expected: at least three matches — one `sr-identity-mark`, one `sr-identity-clearspace`, one `sr-identity-min` (plus their `__*` descendants).

- [ ] **Step 6: Verify Overlays (3.1) renders all parts (acceptance criterion 6)**

Run from `style-reference/`:
```
grep -c 'sr-overlay-slot--' index.html
grep -c 'sr-overlay-primitive' index.html
grep -c 'sr-overlay-applied__layer--' index.html
```
Expected: 8 slot hooks; ≥6 primitive rows; ≥3 applied layers (tl/bl/br).

- [ ] **Step 7: Verify overlay tokens in `:root` (acceptance criterion 7)**

Run from `style-reference/`:
```
grep -E ':root|--overlay-(edge|gap|z)' style.css
```
Confirm the three `--overlay-*` definitions appear inside one of the two `:root` blocks (the second one, alongside other component tokens).

- [ ] **Step 8: Verify CLAUDE.md changes (acceptance criterion 8)**

Run from `style-reference/`:
```
grep 'specimen leads' CLAUDE.md
grep 'restraint over verbosity' CLAUDE.md
grep -E '2\.1 Wordmark' CLAUDE.md
grep -E '3\.1 Overlays' CLAUDE.md
grep -ic 'tweaks' CLAUDE.md
```
Expected: first four return one match each; the last returns `0`.

- [ ] **Step 9: Verify the page renders and assets resolve (acceptance criterion 9)**

Reload http://localhost:8000/ in a fresh tab. Open the browser network panel; confirm:
- Page loads with HTTP 200
- `style.css` loads with HTTP 200
- `files/logo.svg` loads with HTTP 200
- No 404 entries in the network panel
- Browser console shows no errors

- [ ] **Step 10: Verify mobile fallback (acceptance criterion 10)**

Resize browser narrower than 720px (or use device emulation). Confirm:
- Page collapses to single-column layout (existing fallback still works)
- Numbered anatomy callouts (`.sr-anatomy__num` inside specimens) are hidden
- Legend rows beneath specimens still render their numbered tags so the parts remain named
- All 2.x sections still render their usage notes

- [ ] **Step 11: Final commit (no code changes — verification only)**

If any verification step in this task surfaced a discrepancy, fix it inline (return to the relevant Phase task), commit the fix, then re-run the affected verification step. If no discrepancies were found, this task ends without a commit.

---

## Self-review notes

Spec coverage check (every acceptance criterion mapped to a task):

| Criterion | Task |
| --- | --- |
| 1 — section ordering with ids/titles | Tasks 6 (renumber), 8 (Identity), 10 (Components split), 12 (Overlays); verified Task 14.1 |
| 2 — Tweaks absent | Tasks 2 (HTML), 3 (CSS); verified Task 14.2 |
| 3 — Anatomy callouts on 2.1–2.4 | Tasks 9 (CSS) + 10 (HTML); verified Task 14.3 |
| 4 — Usage note on every 2.x | Task 10; verified Task 14.4 |
| 5 — Identity 1.2 with three subsections | Tasks 7 (CSS), 8 (HTML); verified Task 14.5 |
| 6 — Overlays 3.1 with three rendered parts | Tasks 11 (CSS), 12 (HTML); verified Task 14.6 |
| 7 — Three overlay tokens in `:root` | Task 11.1; verified Task 14.7 |
| 8 — CLAUDE.md updates | Task 13; verified Task 14.8 |
| 9 — Page renders, no 404 | Task 14.9 |
| 10 — Mobile fallback + anatomy collapse | Tasks 9 (media query), 10.10 (verify); verified Task 14.10 |

Renames (Spatial → Spacing, Layering → Elevation, Philosophy → Principles): Task 4. Group markers (Foundations / Components / Patterns): Tasks 5 (CSS), 6.3 + 12.1 (HTML).
