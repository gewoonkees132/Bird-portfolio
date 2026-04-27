# Definitive Style Reference — Phase 3 Close-out Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Phase 3 spec — close the residual gaps in the post-Phase-1+2 style reference: WCAG-AA heading-order + skip-link, the warm-dark-hex decision, the half-finished `<b>` stat-highlight documentation, three `[edit: Kees]` rationale markers, the iconography + photo-aspect rule lines, the decode/loading state in 2.4, and a voice audit of every usage body.

**Architecture:** Vanilla HTML5 + CSS3, no build step, no preprocessor. Verification by browser at `http://localhost:8000` and keyboard-tab walkthrough. Each task lands one focused commit so `git revert <sha>` undoes one decision cleanly.

**Tech Stack:** HTML5, CSS custom properties, CSS grid, `:focus-visible`, `prefers-reduced-motion`, Python `http.server` for local serving.

**Spec:** `docs/specs/2026-04-27-definitive-style-reference-phase-3-design.md`

**Pre-conditions:**
- Working dir: `C:\Users\kees\Documents\GitHub\Bird portfolio\style-reference`
- Branch: `main`
- Working tree clean for `style-reference/` (parent-repo `app.js` / `index.html` / `files/*` are unrelated and may have uncommitted changes — leave them)
- Local server running: `python -m http.server` from this directory, then open `http://localhost:8000`

**Defaults locked from spec's tensions:**
- A1 → A1a (lift `<h1>` to a sibling `<header>`; visible "Style Reference" inside masthead becomes `<p aria-hidden="true">`)
- B1 → DK1 (keep dark hexes inline, tighten the comment)
- C1b → preserve the implicit "system-unit only" `<b>` rule and document it
- D4 → per-line voice judgment with imperative-formula exceptions preserved
- C2 → no default; the plan pauses for Kees on each marker

**Out of plan (per spec):** anti-patterns, dl/dt/dd upgrade, B&W policy, error/empty/offline states, A→B choreography, 3.0 Patterns shelf expansion, `:root` consolidation, asset inventory, runtime changes (this plan does not touch `app.js`).

**How to use this plan — line numbers vs. anchors:**

Line numbers cited in tasks reflect the **pre-Task-1 state** of `index.html` and `style.css`. Tasks 1, 2, 6 insert lines into `index.html`; later tasks' line numbers will be *wrong* if read literally after those land. **Always re-read the relevant region of the file before editing**, and locate the edit point by the surrounding code shown in each task's *Step 1: Locate*, not by the line number alone. The `Edit` tool's exact-string `old_string` matching is the right primitive — copy the unique surrounding markup verbatim.

---

## Task 0: Pre-flight

**Files:** none modified.

- [ ] **Step 1: Confirm working dir and clean tree (for style-reference paths only)**

Run:
```
git status --porcelain | grep -v "^.. \\.\\." | grep -v "^?? \\.\\."
```
Expected: empty (no style-reference/ changes pending). Parent-repo files showing in earlier `git status` are out-of-scope and may stay dirty.

- [ ] **Step 2: Start the local server**

Run:
```
python -m http.server
```
Background-friendly. Open `http://localhost:8000/` in a browser. The reference page should render. Open DevTools Console — no errors.

- [ ] **Step 3: Capture the baseline outline**

In DevTools Console paste:
```js
[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => `${h.tagName} ${h.textContent.trim().slice(0,40)}`).join('\n')
```
Expected current output (the bug): `H2 Masthead` appears before `H1 Style Reference`. Note the output for comparison after Task 1.

- [ ] **Step 4: Capture baseline keyboard tab**

Click anywhere on the page, then Tab from the very top. Note: no skip link appears; first focusable element is the masthead wordmark `<a>` (none exists today since wordmark is a `<span>`) → Tab goes nowhere visible. Confirms the gap A2 closes.

---

## Task 1: A1 — Heading-order fix (A1a default)

**Why:** `index.html:15` opens with `<h2>Masthead</h2>`; `index.html:27` later has `<h1>Style Reference</h1>`. The page-title `<h1>` therefore appears in document order *after* its parent section's `<h2>`. WCAG / outline failure.

**Approach (A1a):** Hoist the page-title `<h1>` into a sibling `<header>` placed immediately inside `<main>` before the masthead `<section>`. Visually hide that `<h1>` with an `.sr-sr-only` utility class. Convert the existing visible `<h1 class="...sr-masthead__title-display">Style Reference</h1>` to a `<p>` with `aria-hidden="true"` — visual layout unchanged, screen-reader hears the document `<h1>` once.

**Files:**
- Modify: `index.html:12` (insert `<header>` after `<main class="sr-page">`)
- Modify: `index.html:27` (downgrade visible `<h1>` to `<p aria-hidden="true">`)
- Modify: `style.css` (add `.sr-sr-only` utility — insert after the divider banner, around `style.css:476`)

- [ ] **Step 1: Verify the bug**

In the browser DevTools Console, confirm baseline output from Task 0 Step 3 still reads `H2 Masthead` before `H1 Style Reference`. (Re-run if needed.)

- [ ] **Step 2: Add the `.sr-sr-only` utility to `style.css`**

Locate the divider banner and the `html, body { overflow: auto; }` reset around `style.css:476–481`. Immediately *before* `.sr-page` (around line 483), insert:

```css
/* Visually hidden but accessible to assistive tech.
   Used for: page-level <h1>, skip-link in its un-focused state. */
.sr-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
```

- [ ] **Step 3: Hoist the `<h1>` into `<main>`**

In `index.html`, replace:
```html
<body>
  <main class="sr-page">
    <section class="sr-section sr-masthead" aria-labelledby="sr-00">
```
with:
```html
<body>
  <main class="sr-page">
    <header>
      <h1 class="sr-sr-only">Style Reference</h1>
    </header>
    <section class="sr-section sr-masthead" aria-labelledby="sr-00">
```

- [ ] **Step 4: Downgrade the visible title**

In `index.html`, replace line 27:
```html
      <h1 class="sr-cell sr-cell--5 sr-masthead__title-display">Style Reference</h1>
```
with:
```html
      <p class="sr-cell sr-cell--5 sr-masthead__title-display" aria-hidden="true">Style Reference</p>
```

- [ ] **Step 5: Verify in browser**

Reload `http://localhost:8000/`. Visual: identical to baseline (the giant "Style Reference" still renders at 56px in the masthead row). Re-run the DevTools snippet from Task 0 Step 3:

Expected new output: `H1 Style Reference` (top, sr-only) → `H2 Masthead` → `H2 Principles` → `H2 Identity` → … No skipped levels; `H1` precedes all `H2`.

- [ ] **Step 6: Commit**

```
git add index.html style.css
git commit -m "$(cat <<'EOF'
Phase 3: Fix heading order — H1 first via sr-only utility

H2 Masthead at index.html:15 preceded H1 Style Reference at :27,
violating the document outline. A1a (default): hoist a page-level
H1 into a <header> immediately inside <main>, hidden with the new
.sr-sr-only utility. The visible 56px Style Reference text in the
masthead row becomes <p aria-hidden="true"> with the same display
class — visual layout unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: A2 — Skip link

**Why:** Nine sections plus colophon; keyboard / screen-reader users have no shortcut past the masthead. Add a skip link as the first focusable element.

**Approach:** `<a class="sr-skip" href="#sr-1-1">Skip to content</a>` immediately after `<body>` opening. Visually hidden by reusing `.sr-sr-only` (additive class), but `.sr-skip:focus-visible` swaps to a visible on-palette button at the top-left.

**Files:**
- Modify: `index.html:11` (insert skip-link as first child of `<body>`)
- Modify: `style.css` (add `.sr-skip` rules near `.sr-sr-only`)

- [ ] **Step 1: Verify the gap**

On a fresh page load, click the URL bar then Tab. Note: there is no visible focus indication anywhere near the top.

- [ ] **Step 2: Add the skip-link markup**

In `index.html`, replace:
```html
<body>
  <main class="sr-page">
    <header>
      <h1 class="sr-sr-only">Style Reference</h1>
    </header>
```
with:
```html
<body>
  <a class="sr-skip sr-sr-only" href="#sr-1-1">Skip to content</a>
  <main class="sr-page">
    <header>
      <h1 class="sr-sr-only">Style Reference</h1>
    </header>
```

Note: `#sr-1-1` is the heading id of section 1.1 Principles — sends keyboard users past the masthead chrome into the brand's first substantive content.

- [ ] **Step 3: Add the focus-visible styles to `style.css`**

Immediately after the `.sr-sr-only` block added in Task 1 Step 2:

```css
/* Skip-link — first focusable element; reveals on keyboard focus.
   Anchors to #sr-1-1 (1.1 Principles) so keyboard users land in
   substantive content, not the masthead label. */
.sr-skip:focus-visible {
  position: fixed;
  top: var(--page-edge);
  left: var(--page-edge);
  width: auto;
  height: auto;
  margin: 0;
  padding: 8px 16px;
  clip: auto;
  clip-path: none;
  background: var(--field);
  color: var(--charcoal);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 1px;
  z-index: 100;
  /* The global :focus-visible rule at style.css:449 supplies the outline. */
}
```

- [ ] **Step 4: Verify in browser**

Reload. Click the URL bar, then Tab. The skip link should appear at the top-left with the blue focus ring. Press Enter — the page should scroll to 1.1 Principles. Tab again from the URL bar — the link should disappear after losing focus.

- [ ] **Step 5: Verify ?grid still works**

Open `http://localhost:8000/?grid` — the cell grid + page-edge strip should render. No regression from skip-link styles.

- [ ] **Step 6: Commit**

```
git add index.html style.css
git commit -m "$(cat <<'EOF'
Phase 3: Add skip-to-content link

Nine sections; keyboard-only users had no shortcut past the
masthead. The skip link is the first focusable element, hidden
via .sr-sr-only by default and revealed on :focus-visible at the
top-left in on-palette styling. Anchor target is #sr-1-1 (the
first substantive content), not the masthead label.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: A3 — Verify post-restructure contrast

**Why:** Phase 1 bumped charcoal-alpha values to AA at the rendered sizes. After the masthead restructure, re-measure to confirm no regression.

**Files:** none modified (verification-only task; result recorded in commit body).

- [ ] **Step 1: Measure with browser DevTools**

For each of the following selectors, in DevTools → Inspect element → Accessibility pane (or Lighthouse audit), record the contrast ratio against `--field` (`#F2EEE5`):

- `.sr-section__stats` — color `rgba(26,26,26,0.65)` at 10px
- `.sr-cell__label` — color `rgba(26,26,26,0.65)` at 10px
- `.sr-anatomy__usage` — color `var(--charcoal)` at 12px, opacity inherited from parent
- `.sr-token__k` — color `rgba(26,26,26,0.7)` over `rgba(26,26,26,0.04)` background
- meta-line role: full `--blue` `#1635EE` on `--field` (per C1 default; phase-1 commit `42189fd` moved meta uses to full --blue)

Expected: all ≥ 4.5:1 (WCAG AA normal text). Record the actual ratios.

- [ ] **Step 2: Run a Lighthouse Accessibility audit**

DevTools → Lighthouse → Accessibility only → Analyze. Record the score and any new findings beyond what Phase 1 anticipated.

- [ ] **Step 3: Commit (empty commit recording the verification)**

If all measurements pass, commit an empty marker commit so the audit is in the history:

```
git commit --allow-empty -m "$(cat <<'EOF'
Phase 3: Verify post-restructure WCAG AA contrast (no regressions)

Re-measured after Task 1 masthead restructure:
- .sr-section__stats (rgba 0.65 @ 10px on --field): [ratio] (≥4.5)
- .sr-cell__label (rgba 0.65 @ 10px): [ratio]
- .sr-anatomy__usage (--charcoal @ 12px): [ratio]
- .sr-token__k (rgba 0.7 on rgba 0.04 bg): [ratio]
- meta-line (--blue on --field): [ratio]

Lighthouse Accessibility: [score].

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

If a measurement fails, STOP. Open a new task above this one to fix the regression before continuing.

---

## Task 4: B1 — DKHex (DK1 default: keep inline + tighten comment)

**Why:** Phase 1 introduced `#4a3520` and `#3a2a18` at `style.css:1473–1474` for the warm-toned applied-overlay specimen. Comment names them as local-not-promoted; per spec default DK1, tighten the comment to forbid silent reuse.

**Files:** Modify `style.css:1467–1475`.

- [ ] **Step 1: Locate the current comment**

Read `style.css:1464–1480` to confirm the existing comment text:
```css
.sr-overlay-applied {
  position: relative;
  aspect-ratio: 3 / 2;
  /* Warm dark placeholder bands — stand-in for a golden-hour photograph,
     intentionally darker than --placeholder-band-a/b so the white-on-photo
     overlay treatment (text-shadow rule) is demonstrable. Local to this
     demo; not promoted to tokens. */
  background: repeating-linear-gradient(
    0deg,
    #4a3520 0 14px,
    #3a2a18 14px 28px
  );
```

- [ ] **Step 2: Replace the comment**

Replace the four-line comment block with the tightened version:
```css
  /* Warm dark placeholder bands — stand-in for a golden-hour photograph,
     intentionally darker than --placeholder-band-a/b so the white-on-photo
     overlay treatment (text-shadow rule) is demonstrable. Demo-local
     fixtures, not brand colors. PROMOTION TRIGGER: if a second warm-dark
     photographic stand-in appears anywhere in the brand, that is the
     moment to promote --placeholder-band-warm-a/b and rename the existing
     --placeholder-band-a/b to --placeholder-band-cool-a/b. Until then,
     these two hexes do not earn a token. */
```

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8000/`. Visual: identical (comment-only change). The 3.1 applied-overlay specimen still renders the warm-dark bands.

- [ ] **Step 4: Commit**

```
git add style.css
git commit -m "$(cat <<'EOF'
Phase 3: Tighten warm-dark-hex comment with promotion trigger

The dark hexes at style.css:1473-1474 (#4a3520 / #3a2a18) added
in Phase 1's gradient replacement remain demo-local. DK1 default
keeps them inline; the comment now names the exact promotion
trigger (a second warm-dark stand-in appearing anywhere in the
brand) so future readers know when the rule changes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: C2 — `[edit: Kees]` marker sweep (Kees-in-the-loop)

**Why:** Three rationales drafted by Claude in Phase 1 still carry `[edit: Kees]` markers. Each must be ratified, rewritten in Kees's voice, or held over.

**Files:** Modify `style.css:54` and `style.css:85`.

**This task pauses execution at each marker.** The implementing agent must wait for Kees's input on each before editing.

- [ ] **Step 1: Read marker 1 and pause for Kees**

Read `style.css:51–60` and present this to Kees:

```
Marker 1 — style.css:54

  /* Motion — fast start, gentle settle: the photograph emerges before
     the chrome resolves. --pan-lerp tuned empirically: low enough to
     feel weighty, high enough not to lag the user's intent.
     [edit: Kees] confirm 360ms / 0.08 are the right values, not 320/0.1. */

Decision needed:
  (a) RATIFY — the values 360ms / 0.08 are correct as-is. Remove just the
      [edit: Kees] sentence; keep the rest of the comment.
  (b) REWRITE — replace the rationale with Kees's voice (provide the new text).
  (c) HOLD — leave the marker for a future revision (no edit; record decision).
```

Wait for Kees. Apply the decision:
- (a) Delete the line `[edit: Kees] confirm 360ms / 0.08 are the right values, not 320/0.1.`
- (b) Replace the entire comment with Kees's text.
- (c) No edit; record in the task notes that marker 1 is held.

- [ ] **Step 2: Read marker 2 and pause for Kees**

Read `style.css:82–88` and present:

```
Marker 2 — style.css:85 (covers --viewport-edge-d AND --viewport-edge-corner)

  /* Viewport edges — the runtime's identity/species/compass offsets from
     the viewport edge. Not on the page-edge / gutter ladder; the runtime
     wanted a softer offset than the canonical 32 (page-edge + gutter)
     would give. [edit: Kees] confirm 18 / 22 are the right values. */

Decision needed: ratify / rewrite / hold (same options as marker 1).
```

Wait for Kees. Apply.

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8000/`. Comments are non-rendering; visual unchanged. Confirm no syntax errors in DevTools Console.

- [ ] **Step 4: Commit**

Compose the commit body to reflect Kees's decisions per marker:

```
git add style.css
git commit -m "$(cat <<'EOF'
Phase 3: Resolve [edit: Kees] markers in style.css

Marker 1 (style.css:54, --focus-fade / --pan-lerp): [decision]
Marker 2 (style.css:85, --viewport-edge-d / --viewport-edge-corner): [decision]

[Replace each [decision] with: ratified / rewritten / held until <date>.]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

If any marker is held, the commit body still records that fact so the next reader knows it was an explicit deferral, not an oversight.

---

## Task 6: C1 — Document the `<b>` stat-highlight pattern (C1b default: preserve + document)

**Why:** Phase 1 spec resolved E1 (keep `<b>` and document the pattern), but the documentation never landed in 1.5 Typography. The pattern is also applied inconsistently — present in foundation/pattern section-stats, absent in component anatomical-part-counts. Default per C1b: preserve the implicit "system-unit only" rule and document it.

**Files:** Modify `index.html` (1.5 Typography section, after the existing "Display roles" sub-block).

- [ ] **Step 1: Locate the Display roles sub-block**

Read `index.html:298–315`. The sub-block is wrapped in `<div class="sr-cell sr-cell--9">` and ends with the closing `</div>` of `.sr-alpha-ladder` and the `</div>` of `.sr-cell__body`.

- [ ] **Step 2: Insert the new sub-cell after Display roles**

After `index.html:312` (the `</div>` closing `.sr-cell__body` of the Display roles cell) and before line 314 (the existing `<p class="sr-cell sr-cell--9 sr-anatomy__usage">…`), insert a new cell:

```html
      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">SECTION-STAT HIGHLIGHT — &lt;b&gt; PATTERN</span>
        <div class="sr-cell__body">
          <div class="sr-alpha-ladder" style="grid-template-columns: auto 1fr">
            <span class="sr-alpha-ladder__value" style="color:var(--blue); font-weight:500"><b>9</b> cols</span><span class="sr-alpha-ladder__role">system-unit count — highlighted</span>
            <span class="sr-alpha-ladder__value">2 parts</span><span class="sr-alpha-ladder__role">anatomical subdivision — plain</span>
          </div>
          <p class="sr-anatomy__usage" style="margin-top:8px"><code>&lt;b&gt;</code> wraps the numeric in section-stats when the count refers to a <em>system unit the brand catalogues</em> (cols, tokens, sizes, slots, primitives, demos, principles). When the count refers to <em>anatomical subdivisions of one specimen</em> (parts, states), the numeric stays plain. Color is <code>--blue</code> 500 via the <code>.sr-section__stats b</code> rule.</p>
        </div>
      </div>
```

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8000/`. Scroll to 1.5 Typography. The new sub-block "SECTION-STAT HIGHLIGHT — <b> PATTERN" should render below "DISPLAY ROLES" and above the closing `.sr-anatomy__usage` paragraph. The `<b>9</b>` example should render in `--blue`; the `2 parts` example should render in default color.

Note: the `<em>` inside the usage paragraph will render in italic. Per the brand's "italic blue Latin = sole italic accent" rule, italic-non-blue is technically a violation. If the verifier judges this jars, replace `<em>` tags with plain prose: "the count refers to a system unit (cols, tokens…)." The choice is editorial; default keeps the `<em>` because it carries semantic emphasis and the existing 3.1 usage at `index.html:737` already uses unscoped emphasis (`<b>Mono-utility formulas —</b>`). Flag for Kees in user-review if uncertain.

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "$(cat <<'EOF'
Phase 3: Document <b> stat-highlight pattern in 1.5 Typography

Phase 1 E1 resolved to "keep <b>, document the pattern" but the
doc never landed. C1b default preserves the implicit rule: <b>
highlights system-unit counts (9 cols, 5 tokens, 8 slots) but not
anatomical part-counts (2 parts, 3 states). The new sub-block
under Display Roles renders one example of each and names the
distinction.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: D1 — Iconography rule line in 1.2 Identity

**Why:** The brand uses exactly two glyph kinds — the `files/logo.svg` pictogram and the typographic right-arrow `→` (U+2192) at `index.html:707`. Today neither is documented as the rule.

**Files:** Modify `index.html` 1.2 Identity section.

- [ ] **Step 1: Locate the closing of 1.2 Identity**

Read `index.html:94–110`. The "MINIMUM SIZE" cell ends with `</div>` at line 108. The closing `<hr class="sr-rule" />` is at line 110, then `</section>` at 111.

- [ ] **Step 2: Insert the iconography cell**

After line 108 (the closing `</div>` of the MINIMUM SIZE cell) and before line 110 (the `<hr>`), insert:

```html
      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">ICONOGRAPHY</span>
        <div class="sr-cell__body">
          <p class="sr-anatomy__usage" style="margin-top:0">The pictogram (<code>files/logo.svg</code>) is the only image asset in the system. Inline arrows in links use the typographic right-arrow <code>→</code> (U+2192) — never an SVG chevron, never an icon set, never emoji. Two glyph kinds, no third.</p>
        </div>
      </div>
```

- [ ] **Step 3: Verify in browser**

Reload. Scroll to 1.2 Identity. The new "ICONOGRAPHY" sub-cell renders below "MINIMUM SIZE" and above the section's closing rule. Cross-check: the overlay primitive `link` at `index.html:707` (visible in 3.1 Overlays) uses the typographic `→` — the rule matches.

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "$(cat <<'EOF'
Phase 3: Render iconography rule in 1.2 Identity

The brand uses two glyph kinds: the files/logo.svg pictogram and
the typographic right-arrow (U+2192) for inline links. The arrow
appears in 3.1 Overlays (link primitive at index.html:707) but
the rule was never documented. One line in 1.2 Identity closes
the ambiguity without banning the arrow.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: D2 — Photo aspect rule line in 1.4 Color

**Why:** Every `.sr-photo` and runtime `.photo` is implicitly 3:2 (the grid math is built around 35mm full-frame). The rule exists in the math but never on the page.

**Files:** Modify `index.html` 1.4 Color → Photograph treatment cell.

- [ ] **Step 1: Locate the Photograph treatment caption**

Read `index.html:221–240`. The cell wrapping "PHOTOGRAPH TREATMENT" ends with the existing usage paragraph at line 238: `<p class="sr-anatomy__usage" style="margin-top:12px">Non-focused photographs recede in attention…</p>` followed by the cell's closing `</div></div>` at 239–240.

- [ ] **Step 2: Add the aspect rule to the existing usage paragraph**

Replace `index.html:238`:
```html
          <p class="sr-anatomy__usage" style="margin-top:12px">Non-focused photographs recede in attention but do not disappear: the photograph in focus is the subject; everything else is evidence. The ambient state is set on every <code>.photo</code> by default; <code>.is-focused</code> overrides it.</p>
```
with:
```html
          <p class="sr-anatomy__usage" style="margin-top:12px">Non-focused photographs recede in attention but do not disappear: the photograph in focus is the subject; everything else is evidence. The ambient state is set on every <code>.photo</code> by default; <code>.is-focused</code> overrides it.</p>
          <p class="sr-anatomy__usage" style="margin-top:8px"><b>Aspect —</b> 3:2 is canonical (35mm full-frame; the grid math is built around it). Other aspects render at the same height: landscape crops horizontally via <code>object-fit: cover</code>; portrait band-pads with the placeholder gradient. Square crops are disallowed (they break the 3:2 tessellation math).</p>
```

- [ ] **Step 3: Verify in browser**

Reload. Scroll to 1.4 Color → Photograph treatment. Two paragraphs now render below the ambient/focused specimen. The `<b>Aspect —</b>` lead-in matches the existing `<b>Formula —</b>` pattern at `index.html:507, 542`.

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "$(cat <<'EOF'
Phase 3: Render photo aspect rule in 1.4 Color

3:2 was implicit in every .sr-photo and runtime .photo (the grid
math is 35mm full-frame), but never on the page. One paragraph
under Photograph treatment names 3:2 canonical, describes how
landscape and portrait render, disallows square (breaks tessellation).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: D3 — Decode/loading state in 2.4 Photo cell

**Why:** The runtime exhibits `.is-entering` → `.is-entered` (decode fade-in at `style.css:160–169`). The reference renders DEFAULT and FOCUSED but not LOADING. The `sr-demo-photo-decode` keyframe (`style.css:962`) already exists.

**Files:** Modify `index.html` 2.4 Photo cell section.

**Layout note:** Section 2.4 currently has three `sr-cell--3 sr-cell--r2` cells: DEFAULT, FOCUSED, ANATOMY (`index.html:559–592`). Adding a LOADING cell makes four cells × 3 cols = 12 cols, overflowing the 9-col grid by 3. Two layout options:

- **L1 (proposed).** Drop each cell from `sr-cell--3` to `sr-cell--2`: DEFAULT, FOCUSED, LOADING, ANATOMY all at 2 cols → 8 cols + 1 spacer. Tighter specimens; ANATOMY legend may need to wrap to two rows.
- **L2.** Keep three specimen cells at `sr-cell--3` and put ANATOMY on its own row at `sr-cell--9`: DEFAULT (3) + FOCUSED (3) + LOADING (3) on row 1; ANATOMY (9) on row 2.

L2 preserves the specimen scale and gives ANATOMY room to breathe. **Plan executes L2.**

- [ ] **Step 1: Restructure 2.4 Photo cell**

Replace `index.html:549–595` (the entire `<section class="sr-section sr-component sr-component--photo">`) with:

```html
    <section class="sr-section sr-component sr-component--photo" aria-labelledby="sr-2-4">
      <span class="sr-section__id">2.4</span>
      <h2 id="sr-2-4" class="sr-section__title">Photo cell</h2>
      <div class="sr-section__stats">
        <span>display atom</span>
        <span><b>3</b> states</span>
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
        <span class="sr-cell__label">LOADING</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy">
            <div class="photo sr-photo sr-photo--loading-demo" style="--ph-band-a:#3d6b8a; --ph-band-b:#4a7c9a;">
              <div class="placeholder" data-label="P1 · COMMON KINGFISHER"></div>
              <span class="sr-anatomy__num" style="position:absolute; top:8px; left:8px;">3</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">ANATOMY</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy__legend">
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">1</span> placeholder slug — mono uppercase</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">2</span> photo body — band gradient until image loads</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">3</span> loading — opacity 0 → 1, translateY(4px) → 0, 200ms ease-out (.is-entering → .is-entered)</div>
          </div>
          <p class="sr-anatomy__usage">A single photograph in the pannable plane. Adopts focused state when centered. Decode entrance is the runtime's <code>.is-entering</code> → <code>.is-entered</code> transition; the LOADING specimen above loops the entrance for legibility.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 2: Add the loading-demo loop styles to `style.css`**

The existing `sr-demo-photo-decode` keyframe (`style.css:962`) drives a small 60×40 chip. For the larger photo-cell specimen, a dedicated rule is needed. Add after the existing `.sr-motion__photo` block (around `style.css:967`):

```css
/* 2.4 Photo cell — LOADING specimen loop. Reuses the
   sr-demo-photo-decode keyframe at the larger photo-cell scale.
   Loops 1400ms for legibility; the runtime transitions once. */
.sr-photo.sr-photo--loading-demo {
  animation: sr-demo-photo-decode 1400ms infinite;
}
@media (prefers-reduced-motion: reduce) {
  .sr-photo.sr-photo--loading-demo { animation: none; }
}
```

- [ ] **Step 3: Update the 2.4 stats line**

(Already updated in Step 1 — section-stats now reads `<b>3</b> states` per the C1b rule. Confirm visually in Step 4.)

- [ ] **Step 4: Verify in browser**

Reload. Scroll to 2.4 Photo cell. Three specimen cells render in row 1: DEFAULT (with anatomy callouts 1, 2), FOCUSED (with shadow lift), LOADING (with anatomy callout 3, looping fade-in/out). The ANATOMY cell on row 2 spans 9 cols and lists three legend rows. Section-stats top reads `display atom · 3 states · 2 parts` with the `3` highlighted in `--blue`.

Toggle `prefers-reduced-motion` in DevTools (Rendering pane → Emulate CSS prefers-reduced-motion: reduce). The LOADING specimen should freeze. Toggle off; loop resumes.

- [ ] **Step 5: Commit**

```
git add index.html style.css
git commit -m "$(cat <<'EOF'
Phase 3: Render LOADING state as 2.4's third specimen

The runtime exhibits .is-entering → .is-entered (decode fade-in
at style.css:160-169) but the reference rendered only DEFAULT and
FOCUSED. New LOADING cell sits beside them, looping the existing
sr-demo-photo-decode keyframe at photo-cell scale (1400ms). The
ANATOMY cell moves to its own 9-col row with three legend entries.
Section-stats updated from "2 states" to "3 states" per the C1b
system-unit highlight rule.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: D4 — Voice audit (per-line, sweep)

**Why:** Phase 1's new `.sr-anatomy__usage` bodies were drafted by Claude. The rule per spec D4: third-person systemic, descriptive present tense, ~30-word soft cap. Imperative formula clauses (`If no settled binomial exists, use…` / `No emoji; no icons`) at `index.html:507, 542` are exempt.

**Files:** Modify `index.html` (only lines that drift).

- [ ] **Step 1: Enumerate every usage body and principles item**

The audit targets:
- `index.html:48` — principles quote
- `index.html:50–53` — principles list (4 items)
- `index.html:144` — 1.3 Grid usage
- `index.html:194` — 1.4 Color usage
- `index.html:238` — 1.4 ambient/focused usage
- `index.html:239` (new) — 1.4 aspect rule (added in Task 8)
- `index.html:314` — 1.5 Typography usage
- `index.html:384` — 1.7 Elevation focus usage
- `index.html:433` — 1.8 Motion usage
- `index.html:471` — 2.1 Wordmark usage
- `index.html:507` — 2.2 Species (contains imperative formula — exempt below the formula split)
- `index.html:542` — 2.3 Compass (same — exempt below the split)
- `index.html:590` (new, after Task 9) — 2.4 Photo cell usage
- `index.html:620` — 2.5 Brand card usage
- `index.html:653` — 2.6 Mobile cell usage
- `index.html:737` — 3.1 Overlays usage (contains imperative-style formula labels — exempt below the split)
- `index.html:756–757` — Colophon surfaces + grid-flag notes
- Any added in Tasks 6–9 (1.5 `<b>` block usage, 1.2 iconography rule, 2.4 anatomy usage)

- [ ] **Step 2: Apply the audit to each line**

For each line above:

**Check three properties:**
- Person: third-person systemic. Reject "you" / "we" / "I". Pass "the visitor", "the reference", "the photograph", "users", named system parts.
- Tense: descriptive present ("Used as", "Captions", "Tells the visitor"). Imperative ("Use this", "Do not") only inside a formula clause introduced by `<b>Formula —</b>` or similar normative-rule lead-in.
- Length: ~30-word soft cap per single sentence; the whole paragraph may exceed if it is a list of distinct rules.

**For each line that fails:** Edit the line in place. Show the diff (before / after) in the implementing agent's narration so Kees can review per-edit if executing inline.

**For each line that passes:** No edit; record in the task's commit body that the line was audited and held.

- [ ] **Step 3: Verify in browser**

Reload. Skim every section — usage bodies should read consistently. Page length unchanged (edits should be tightening, not removal).

- [ ] **Step 4: Commit**

```
git add index.html
git commit -m "$(cat <<'EOF'
Phase 3: Voice audit — sweep all usage bodies and principles

Per D4: third-person systemic, descriptive present tense, ~30-word
soft cap. Imperative-formula exceptions preserved at index.html:507,
542, 737 (Species, Compass, Overlays formulas).

Audited [N] usage bodies and principles. Edits applied to:
  - [list lines and one-word reason: "tense", "person", "length"]
Held without edit:
  - [list lines that already passed]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: CHANGELOG entry

**Why:** Phase 2 commit `32fc676` established the convention: each dated revision gets a summary entry in `CHANGELOG.md`. Phase 3 needs its entry.

**Files:** Modify `CHANGELOG.md`.

- [ ] **Step 1: Insert the Phase 3 entry**

Open `CHANGELOG.md`. Read the existing structure: header on line 1, blank, intro paragraph, blank, then `## 2026-04-27 — v1: Definitive Style Reference (truth pass + extension)` and the entries that follow.

Phase 3 is *also* a 2026-04-27 entry (same date as Phases 1+2). To keep entries chronological-by-revision-not-by-date, insert the Phase 3 entry as a new top-level dated section above the existing 2026-04-27 v1 entry. Use a sub-version marker `v1.1` or just `v1 · close-out`.

Insert before the existing `## 2026-04-27 — v1:` line:

```
## 2026-04-27 — v1 · close-out (Phase 3)

Close-out (Phase 3): heading-order fix (page H1 hoisted to a sibling header via .sr-sr-only utility; visible 56px title becomes <p aria-hidden="true">); skip-link added as first focusable element (#sr-1-1 target); warm-dark hex comment tightened with promotion trigger (DK1); [edit: Kees] markers resolved (--focus-fade / --pan-lerp / --viewport-edge-d / --viewport-edge-corner); <b> stat-highlight pattern documented in 1.5 Typography (system-unit only rule preserved per C1b); iconography rule rendered in 1.2 Identity; photo aspect rule rendered in 1.4 Color; LOADING state added as 2.4 Photo cell's third specimen (sr-photo--loading-demo); voice audit applied to usage bodies and principles.

Spec: `docs/specs/2026-04-27-definitive-style-reference-phase-3-design.md`.
Plan: `docs/plans/2026-04-27-definitive-style-reference-phase-3.md`.

```

- [ ] **Step 2: Verify**

Read `CHANGELOG.md` top-to-bottom. The new entry sits above the original v1 entry; both 2026-04-27 entries are present. Markdown renders cleanly (preview in editor).

- [ ] **Step 3: Commit**

```
git add CHANGELOG.md
git commit -m "$(cat <<'EOF'
Phase 3: Log close-out in CHANGELOG.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Final smoke test

**Why:** Acceptance criteria 11 from the spec — the page renders, no console errors, skip link works, `?grid` flag still works.

**Files:** none modified.

- [ ] **Step 1: Hard reload at /**

Open `http://localhost:8000/`. Hard-reload (Ctrl+Shift+R). DevTools Console — zero errors, zero warnings (other than the existing `?grid` info if any).

- [ ] **Step 2: Verify outline**

In DevTools Console:
```js
[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => `${h.tagName} ${h.textContent.trim().slice(0,40)}`).join('\n')
```
Expected: `H1 Style Reference` first; then `H2 Masthead`, `H2 Principles`, `H2 Identity`, `H2 Grid`, `H2 Color`, `H2 Typography`, `H2 Spacing`, `H2 Elevation`, `H2 Motion`, `H2 Wordmark / dot`, `H2 Species label`, `H2 Compass`, `H2 Photo cell`, `H2 Brand card`, `H2 Mobile cell`, `H2 Overlays`, `H2 Colophon`. No skipped levels.

- [ ] **Step 3: Verify skip-link**

Click URL bar; press Tab. Skip-link reveals at top-left with blue focus ring. Press Enter; page scrolls to 1.1 Principles. URL hash is `#sr-1-1`.

- [ ] **Step 4: Verify Tab order through main content**

From the skip link, keep tabbing. Focus should move through any focusable element on the page: the `Tab to focus.` button at 1.7 Elevation should receive `:focus-visible` outline (2px solid `--blue`, 2px offset).

- [ ] **Step 5: Verify `?grid` flag**

Open `http://localhost:8000/?grid`. Cell-grid + page-edge strip + bottom-right legend (`u 120 · g 24 · edge 8 · tick 2`) all render. Skip link still works on this URL.

- [ ] **Step 6: Verify reduced-motion**

DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce. Reload. The 1.8 Motion specimens (focus-fade chip, label-cycle, photo-decode) and the new 2.4 LOADING specimen should freeze. Identity / compass animations should not run. Toggle off; loops resume.

- [ ] **Step 7: Verify mobile fallback**

DevTools → Device emulation → 375px viewport. The reference page reflows to single-column at <1336px (per Phase 1 D1). At <720px the placeholder mobile-edition behavior is unchanged. Skip link still visible-on-focus.

- [ ] **Step 8: Final commit (empty marker)**

```
git commit --allow-empty -m "$(cat <<'EOF'
Phase 3: Smoke test — page renders clean, skip-link works, outline OK

Verified at http://localhost:8000/:
- Outline: H1 Style Reference precedes all H2s
- Skip-link reveals on Tab; Enter scrolls to #sr-1-1
- :focus-visible on the 1.7 button
- ?grid flag still renders cell grid
- prefers-reduced-motion freezes all sr-demo-* loops + LOADING
- Mobile fallback at 375px reflows; skip-link still functional

Phase 3 close-out complete.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-review notes (from the writing-plans skill)

**Spec coverage:**
- Goal 1 (a11y AA + heading + skip) → Tasks 1, 2, 3
- Goal 2 (every hex tokenized or justified) → Task 4 (DKHex tightening)
- Goal 3 (every runtime state rendered) → Task 9 (LOADING)
- Goal 4 (every glyph acknowledged) → Task 7 (iconography)
- Goal 5 (uniform usage voice) → Task 10
- Goal 6 (markers resolved) → Task 5
- Acceptance criteria 1–12 → mapped one-to-one across Tasks 1–12

**Type / name consistency:**
- `.sr-sr-only` introduced in Task 1 Step 2; reused in Task 1 Step 3 (page H1) and Task 2 Step 2 (skip-link base class). Same name throughout.
- `.sr-skip` defined in Task 2 Step 3; used in Task 2 Step 2 markup. Same name.
- `.sr-photo--loading-demo` defined in Task 9 Step 1 (markup) and Task 9 Step 2 (CSS). Same name.
- `sr-demo-photo-decode` keyframe — pre-existing at `style.css:962`; Task 9 Step 2 references the same name, no redefinition.

**No placeholders:** every code block above contains the literal text to insert. Verification steps name the exact DOM selectors and console snippets. Commit messages use HEREDOC with the literal body.

---

## Open items deferred to user-review-after-execution (not in this plan)

- The 3.2 Pattern candidate (Photo focus choreography) — flagged in spec's *Future candidates*; not built here.
- `:root` consolidation — flagged; not built.
- Asset inventory line in Colophon — flagged; not built.
- Any of the predecessor's six locked tensions — explicitly not reopened.
