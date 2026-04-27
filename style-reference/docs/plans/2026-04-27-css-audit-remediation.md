# CSS Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the 29 findings from the 2026-04-27 CSS audit (3 Critical · 13 Recommended · 13 Polish) on `style.css` and `index.html`, staged in three R-Phases per spec §5. R-Phase 1 corrects two specimen-vs-token drifts and one stale banner. R-Phase 2 elevates documented conventions to CSS structure (`@layer`, derived alphas via `color-mix()`, single-source token consolidation, specimen-block reorder). R-Phase 3 ships polish — comments, naming nits, light-touch consolidations.

**Architecture:** Vanilla HTML5 + CSS3, no build, no preprocessor. Single-file `style.css` remains the system of record. Modern-CSS adoptions are Baseline Widely Available only (`@layer`, `color-mix()`, `:is()`, `:where()`). Verification by browser at `http://localhost:8000`, by grep for absence/presence of patterns, and by visual diff on the rendered specimen page. Each finding lands one focused commit so `git revert <sha>` undoes one decision cleanly. CHANGELOG rolls up per R-Phase, not per finding (per CLAUDE.md governance).

**Tech Stack:** HTML5, CSS Cascade Layers (`@layer`), `color-mix(in srgb, …)`, CSS custom properties, `:focus-visible`, `prefers-reduced-motion`, Python `http.server` for local serving.

**Spec:** `docs/specs/2026-04-27-css-audit-design.md`
**Audit:** `docs/audits/2026-04-27-css-audit.md`
**CHANGELOG:** `CHANGELOG.md` (one entry per R-Phase appended at top)

**Pre-conditions:**
- Working dir: `C:\Users\kees\Documents\GitHub\Bird portfolio\style-reference`
- Branch: `main`
- Working tree clean for `style-reference/` (parent-repo files may have uncommitted changes — leave them; they are out of scope per the workspace isolation rule)
- Local server: `python -m http.server` from this directory; reference page at `http://localhost:8000/`

**Tension-surface gates locked from the audit:**
- C-1 (`--pan-lerp`) → **PAUSE for Kees decision** between 0.02 (heavier) and 0.08 (more responsive)
- C-2 (`--focus-fade`) → **PAUSE for Kees decision** between 200ms (snappy) and 360ms (cinematic)
- All other findings proceed under the "plausibly positive" governance bar

**Out of plan (per audit out-of-scope log):**
- Bird-portfolio runtime synchronization (workspace isolation rule)
- The CLAUDE.md `alectear-feel craft` substitution (a separate sweep — flag in commit if encountered, do not fix in this plan)
- The deliberately non-token dark hexes `#4a3520` / `#3a2a18` (audit §3.4 intent-respect override)
- The `color: #fff;` photo-overlay text rule at the documented over-photo treatment

**How to use this plan — line numbers vs. anchors:**

Line numbers cited in tasks reflect the **pre-Task-0 state** of `style.css` (1591 lines) and `index.html` (805 lines). Tasks R-1 (`@layer` wrap), R-2 (preamble insert), R-7 (specimen reorder), and R-3/R-4/R-5/R-10 (token-replacement bulk edits) reshape the file substantially; later tasks' line numbers will be wrong if read literally after those land. **Always re-read the relevant region of the file before editing**, and locate the edit point by the surrounding code shown in each task's *Step 1: Locate*, not by the line number alone. The `Edit` tool's exact-string `old_string` matching is the right primitive — copy the unique surrounding markup verbatim.

**Commit-message convention:** `R-Phase N: <finding-id> · <subject>`. Example: `R-Phase 2: R-4 · Charcoal alpha ladder via color-mix()`.

---

## Task 0: Pre-flight

**Files:** none modified.

- [ ] **Step 1: Confirm clean working tree (style-reference paths only)**

Run from the repo root:
```bash
git status --porcelain -- style-reference/
```
Expected: empty. If non-empty (other than the audit/spec files already created on this branch), pause and resolve before proceeding.

- [ ] **Step 2: Start the local server**

Run from `style-reference/`:
```bash
python -m http.server
```
Open `http://localhost:8000/`. The reference page should render. Open DevTools Console — no errors.

- [ ] **Step 3: Capture pre-remediation grep baselines**

Run each and record the count — the verifications in later tasks compare against these:
```bash
# style.css line count (post-R-1/R-2/R-7 will differ; baseline is 1591)
wc -l style.css

# Charcoal alpha literals (R-4 target = 0)
grep -c "rgba(26, 26, 26," style.css

# Blue alpha literals (R-5 target = 0)
grep -c "rgba(22, 53, 238," style.css

# Field alpha literals at non-token alphas (R-10 target = 0)
grep -cE "rgba\(242, 238, 229, 0\.(85|92)\)" style.css

# Mono font-family literals (R-3 target = 0; R-3 introduces --mono-stack)
grep -c 'ui-monospace, "SF Mono"' style.css

# Lone !important (R-12 target = 0)
grep -c "!important" style.css

# Bare .dot scoped re-declarations (R-9 target: ≤ 1 global rule)
grep -nE "\.dot\s*\{" style.css

# .sr-section__head (R-6 target = 0 occurrences)
grep -n "sr-section__head" style.css index.html
```

Expected baseline counts: charcoal-rgba 34 · blue-rgba 10 · field-rgba (0.85|0.92) 4 · mono-stack-literal 38 · `!important` 1 · `.sr-section__head` defined-but-unused.

- [ ] **Step 4: Capture pre-remediation visual baseline**

In the browser, scroll the page top-to-bottom once. No DevTools Console errors. Note the rendered `--pan-lerp / 0.08` text in §1.8 Motion (this is what C-1 surfaces) and `--focus-fade / 360ms` (what C-2 surfaces). Take screenshots of §1.4 Color (alpha-ladder), §1.6 Spacing (rulers), §1.8 Motion (chips), and §3.1 Overlays for later visual-diff comparison after R-4 / R-5 / R-10.

---

# R-Phase 1 — Critical (must land before any other phase)

## Task 1: C-1 · `--pan-lerp` token value disagreement

**Why:** `style.css:54` defines `--pan-lerp: 0.02;`. `index.html:424–425` displays `0.08` and captions it `--pan-lerp / 0.08`. The specimen *is* the system per CLAUDE.md; the disagreement falsifies the file's own foundational invariant.

**Files:**
- Modify: `style.css:54` *or* `index.html:424–425` (depends on Kees's call)

**This task triggers the tension-surface gate.** Two valid recommendations exist with materially different aesthetic outcomes. Do not proceed without an explicit choice.

- [ ] **Step 1: Surface the tension to Kees**

Present the two options:
- **Keep 0.02 in CSS, fix specimen to 0.02** → heavier/laggier pan feel; preserves the existing tuned runtime value
- **Adopt 0.08 in CSS, leave specimen at 0.08** → more responsive pan feel; aligns CSS to what the specimen has been documenting

Pause execution. Wait for Kees's explicit answer.

- [ ] **Step 2: Apply the chosen value**

If Kees chose **0.02 (keep CSS, fix specimen)**, edit `index.html` at L424–425:
```html
<div class="sr-cell sr-cell--2">
  <div class="sr-motion__demo"><span class="sr-motion__value">0.02</span></div>
  <div class="sr-motion__caption">--pan-lerp / 0.02<br/>per-frame damping factor for pan velocity (JS)</div>
</div>
```

If Kees chose **0.08 (adopt new value, fix CSS)**, edit `style.css:54`:
```css
  --pan-lerp:        0.08;
```
And update the inline comment at L51–53 if its rationale ("tuned empirically: low enough to feel weighty") still fits the new value; otherwise tighten the prose.

- [ ] **Step 3: Verify**

Re-grep both files; confirm both surfaces now show the same value:
```bash
grep -n "pan-lerp" style.css index.html
```
Expected: every match shows the same numeric value.

Reload `http://localhost:8000/` and scroll to §1.8 Motion. The `0.08` chip and caption should reflect the chosen value.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 1: C-1 · Align --pan-lerp value across CSS and specimen"
```
(The commit message body, if expanded with `--`, names the chosen value and Kees's call.)

---

## Task 2: C-2 · `--focus-fade` token value disagreement

**Why:** `style.css:55` defines `--focus-fade: 200ms;`. `index.html:429` captions it `--focus-fade / 360ms`. Unlike `--pan-lerp` (display-only), `--focus-fade` is consumed by `.photo` transitions at `style.css:143–146` — so changing it materially retimes runtime feel.

**Files:**
- Modify: `style.css:55` *or* `index.html:429` (depends on Kees's call)

**This task triggers the tension-surface gate.**

- [ ] **Step 1: Surface the tension to Kees**

- **Keep 200ms in CSS, fix specimen to 200ms** → snappy focus transition; preserves the existing tuned runtime value (active on `.photo`)
- **Adopt 360ms in CSS, leave specimen at 360ms** → cinematic focus transition; every `.photo` transition retimes

Pause execution. Wait for Kees's explicit answer.

- [ ] **Step 2: Apply the chosen value**

If Kees chose **200ms (keep CSS, fix specimen)**, edit `index.html:429`:
```html
        <div class="sr-motion__caption">--focus-fade / 200ms<br/>--focus-easing / cubic-bezier(0.22, 0.61, 0.36, 1)</div>
```

If Kees chose **360ms (adopt new value, fix CSS)**, edit `style.css:55`:
```css
  --focus-fade:      360ms;
```

- [ ] **Step 3: Verify**

```bash
grep -n "focus-fade" style.css index.html
```
Expected: every match shows the same value.

Reload `http://localhost:8000/`. In §1.8 Motion, the chip caption matches. Hover/focus a photo cell in any §2.x specimen and observe the transition at the new duration (the runtime CSS at L143 transitions on `--focus-fade`, so `.sr-cell__body .photo.sr-photo:hover` etc. should retime accordingly).

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 1: C-2 · Align --focus-fade value across CSS and specimen"
```

---

## Task 3: C-3 · Stale "first specimen" banner

**Why:** `style.css:1130–1132` reads `Grid ruleset — first specimen on the page`. By HTML render order Grid is the 4th specimen (00 Masthead → 1.1 Principles → 1.2 Identity → 1.3 Grid). By CSS source order Grid is the 11th specimen-cluster. Neither reading supports "first." The claim is false now; readers trust banners to orient them.

**Files:**
- Modify: `style.css:1130–1132`

- [ ] **Step 1: Locate**

```bash
grep -n "first specimen on the page" style.css
```
Expected line: 1131 (within the banner at 1130–1132). Re-read those three lines to confirm exact text.

- [ ] **Step 2: Apply**

Replace the banner block:

`old_string`:
```css
/* ============================================================
   Grid ruleset — first specimen on the page
   ============================================================ */
```

`new_string`:
```css
/* ============================================================
   Grid ruleset — §1.3 specimen — token chips + page-anatomy diagram
   ============================================================ */
```

- [ ] **Step 3: Verify**

```bash
grep -n "Grid ruleset" style.css
grep -n "first specimen" style.css
```
Expected: the new banner present, the stale phrase absent.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 1: C-3 · Replace stale Grid ruleset banner"
```

---

## Task 4: R-Phase 1 CHANGELOG entry

**Why:** Per spec §5: one CHANGELOG entry per R-Phase, not per finding. Each finding ID resolved is named in the prose for traceability.

**Files:**
- Modify: `CHANGELOG.md` (insert new entry as the first dated entry, above the existing 2026-04-27 close-out entries)

- [ ] **Step 1: Read the current CHANGELOG.md head**

```bash
head -10 CHANGELOG.md
```
Note the line where the existing first dated entry begins (`## 2026-04-27 — v1 · close-out (Phase 3)`). The new R-Phase 1 entry inserts immediately above it.

- [ ] **Step 2: Apply**

Insert the following block just below the file's H1 introduction (above `## 2026-04-27 — v1 · close-out (Phase 3)`). Use the exact dated header form already established in this file:

```markdown
## 2026-04-27 — v1 · audit remediation (R-Phase 1, Critical)

R-Phase 1 (Critical) closes three findings from the 2026-04-27 CSS audit. C-1 aligns `--pan-lerp` between the CSS token and the §1.8 Motion specimen (Kees ratified <CHOSEN-VALUE>); C-2 aligns `--focus-fade` (Kees ratified <CHOSEN-VALUE>) — `--focus-fade` is load-bearing on `.photo` transitions, so the runtime feel retimed accordingly. C-3 replaced the stale "Grid ruleset — first specimen on the page" banner with an accurate `§1.3 specimen — token chips + page-anatomy diagram` header.

Spec: `docs/specs/2026-04-27-css-audit-design.md`.
Audit: `docs/audits/2026-04-27-css-audit.md`.
Plan: `docs/plans/2026-04-27-css-audit-remediation.md`.
```

Replace the two `<CHOSEN-VALUE>` placeholders with the values Kees actually picked in Tasks 1 and 2.

- [ ] **Step 3: Verify**

```bash
head -20 CHANGELOG.md
```
Expected: the new R-Phase 1 entry is the first dated entry; placeholders all replaced with concrete values; spec/audit/plan paths present.

- [ ] **Step 4: Commit**

```bash
git add CHANGELOG.md
git commit -m "R-Phase 1: Log close-out in CHANGELOG.md"
```

---

# R-Phase 2 — Recommended (grouped by axis for coherent CHANGELOG entries)

R-Phase 2 sequences the architectural changes first (R-1 `@layer`, R-2 preamble, R-7 reorder), since they shape where every subsequent edit lands. Then token-discipline group, then naming group, then dead-code/cleanup group. One commit per finding.

## Task 5: R-1 · Adopt `@layer` to encode the cascade architecture

**Why:** The runtime/specimen split is currently maintained by source order plus a 17-line banner comment at L457–473 plus convention. The `html, body` specimen override at L475–480 wins by source order alone. Cascade Layers is Baseline Widely Available; the file is a textbook fit. The architectural intent moves from human-readable convention to CSS-encoded fact, and the boundary the L466–469 comment names becomes structural.

**Layer map:**
- `reset` — `*` (box-sizing) and the *runtime* `html, body` rule
- `tokens` — both `:root` blocks
- `runtime` — everything between L89 and L455 *except* the rules already in `reset`
- `specimen` — everything from L475 (the `html, body` specimen override) onward, *except* the `?grid` debug overlay
- `debug` — the `?grid` overlay (L1192–1239)

**Files:**
- Modify: `style.css` (top-of-file declaration + five `@layer X { … }` wraps)

- [ ] **Step 1: Add the `@layer` declaration**

Locate the brand-attribution banner at L1–5. Insert the layer declaration immediately after it, before the Grid `:root` banner at L7.

`old_string`:
```css
/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
   (was: "alectear-feel craft" — undefined coined term, substituted)
   ============================================================ */

/* ============================================================
   Grid — single source of truth
```

`new_string`:
```css
/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
   (was: "alectear-feel craft" — undefined coined term, substituted)
   ============================================================ */

/* Cascade layers — encodes the runtime/specimen contract in CSS.
   Specimen wins over runtime by layer order, not source order.
   Debug overlay is opt-in via the ?grid URL flag. */
@layer reset, tokens, runtime, specimen, debug;

/* ============================================================
   Grid — single source of truth
```

- [ ] **Step 2: Wrap both `:root` blocks in `@layer tokens`**

The two `:root` blocks span L14–87 (Grid tokens at 14–29 and Palette/etc. at 31–87). They are contiguous except for the blank line and inter-block comment. Wrap them as one `@layer tokens` block.

Locate `style.css` at the line immediately before `:root {` (the Grid `:root` opening at L14). Add an opening `@layer tokens {` line. Locate the `}` that closes the second `:root` block (currently L87) and add a closing `}` for the layer immediately after it.

Concretely, find this region:
```css
   Edit only this block to retune the system.
   ============================================================ */
:root {
  /* Grid — the photo-plane tessellation V4. ... */
```
Edit to:
```css
   Edit only this block to retune the system.
   ============================================================ */
@layer tokens {
:root {
  /* Grid — the photo-plane tessellation V4. ... */
```

And find the closing of the second `:root` (matched by surrounding context — the `--viewport-edge-corner: 22px;` line at L86 followed by `}` at L87, followed by blank line and `* { box-sizing: border-box; }` at L89):

`old_string`:
```css
  --viewport-edge-corner: 22px;   /* species (bottom-left), compass (bottom-right) */
}

* { box-sizing: border-box; }
```

`new_string`:
```css
  --viewport-edge-corner: 22px;   /* species (bottom-left), compass (bottom-right) */
}
}

@layer reset {
* { box-sizing: border-box; }
```
(The new closing `}` ends `@layer tokens`. The next `@layer reset {` opens for the box-sizing + body-base rules.)

- [ ] **Step 3: Wrap the runtime base in `@layer reset`, runtime body in `@layer runtime`**

The reset block currently spans roughly L89 (`* { box-sizing }`) and L91–103 (`html, body` runtime base). After Step 2 the `@layer reset {` is open. We need to close `@layer reset` after the runtime `html, body` rule and open `@layer runtime` for the rest.

Locate the runtime `html, body` rule and the section that follows it (`Stage — the 2D pannable plane`). Find:

`old_string`:
```css
html, body {
  margin: 0;
  background: var(--field);
  color: var(--charcoal);
  font-family: var(--font-stack);
  font-feature-settings: "ss01", "ss02";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
  height: 100%;
}

/* ============================================================
   Stage — the 2D pannable plane
   ============================================================ */
```
(Re-read the actual file to get the exact runtime `html, body` body — these are roughly L93–103. Adjust the `old_string` to the exact text.)

`new_string`:
```css
html, body {
  margin: 0;
  background: var(--field);
  color: var(--charcoal);
  font-family: var(--font-stack);
  font-feature-settings: "ss01", "ss02";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
  height: 100%;
}
}

@layer runtime {
/* ============================================================
   Stage — the 2D pannable plane
   ============================================================ */
```
(Closes `@layer reset`, opens `@layer runtime`.)

- [ ] **Step 4: Close `@layer runtime` at the END RUNTIME · BEGIN SPECIMEN divider**

Locate the divider banner at L457–473. Insert a layer-closing `}` immediately before the banner, and a layer-opening `@layer specimen {` immediately after it.

Find:
```css
:focus:not(:focus-visible) {
  outline: none;
}

/* ============================================================
   ============================================================
   END RUNTIME · BEGIN SPECIMEN
```
(The `:focus:not(:focus-visible)` rule is the last runtime rule, ending around L455.)

`old_string`:
```css
:focus:not(:focus-visible) {
  outline: none;
}

/* ============================================================
   ============================================================
   END RUNTIME · BEGIN SPECIMEN
```

`new_string`:
```css
:focus:not(:focus-visible) {
  outline: none;
}
}

/* ============================================================
   ============================================================
   END RUNTIME · BEGIN SPECIMEN
```
(Closes `@layer runtime`.)

Then locate the end of the divider banner (around L473) followed by the specimen `html, body` override:

`old_string`:
```css
   This file is not synced anywhere. The portfolio's styles.css
   is a separate concern in a different workspace.
   ============================================================
   ============================================================ */

html, body {
  /* Reference page is a scrolling document; override the portfolio's
     overflow:hidden so the specimen sheet can be read top-to-bottom. */
  overflow: auto;
  height: auto;
}
```

`new_string`:
```css
   This file is not synced anywhere. The portfolio's styles.css
   is a separate concern in a different workspace.
   ============================================================
   ============================================================ */

@layer specimen {
html, body {
  /* Reference page is a scrolling document; override the portfolio's
     overflow:hidden so the specimen sheet can be read top-to-bottom. */
  overflow: auto;
  height: auto;
}
```
(Opens `@layer specimen`. The override now beats runtime by layer order, not source order — making the comment on L476–477 still accurate but no longer load-bearing on source position.)

- [ ] **Step 5: Wrap `?grid` debug overlay in `@layer debug`**

Locate the `?grid` debug overlay banner around L1192. Insert a layer-closing `}` for `@layer specimen` before it, and a layer-opening `@layer debug {` after the banner. After the overlay block closes (around L1239), add a layer-closing `}` and re-open `@layer specimen {` for the rules that follow (Below-1336 fallback at L1241+, Identity at L1284+, anatomy template at L1375+, Overlays at L1436+).

Find the `?grid` banner (re-grep `grep -n "?grid" style.css` to find the exact line). The banner reads:
```
   ?grid debug overlay — opt-in via URL flag
```

`old_string` (use unique surrounding text):
```css
.sr-grid-anatomy__caption .blue-text { color: var(--blue); font-weight: 500; }

/* ============================================================
   ?grid debug overlay — opt-in via URL flag
```
(Adjust based on actual surrounding text — re-read L1188–1195.)

`new_string`:
```css
.sr-grid-anatomy__caption .blue-text { color: var(--blue); font-weight: 500; }
}

@layer debug {
/* ============================================================
   ?grid debug overlay — opt-in via URL flag
```

Then find the end of the debug overlay (around L1239 — last rule is something like `body.show-grid::after` or `.show-grid` rule). Re-read L1235–1245 for exact context. The overlay block ends just before the `Below-1336 fallback` banner at L1241.

`old_string` (the last debug rule + the next banner):
```css
[last-debug-rule-content]

/* ============================================================
   Below-1336 fallback — single-column flow
```

`new_string`:
```css
[last-debug-rule-content]
}

@layer specimen {
/* ============================================================
   Below-1336 fallback — single-column flow
```

(Closes `@layer debug`, re-opens `@layer specimen` for the remainder.)

- [ ] **Step 6: Close `@layer specimen` at end of file**

Locate the very last rule in `style.css` (the final `.sr-overlay-applied*` rule, around L1591). Add a closing `}` after the file's last `}`.

Read the last 10 lines of the file:
```bash
tail -10 style.css
```
(Use Read tool with offset; do not actually shell `tail`.)

Append a single `}` line at the end of the file to close `@layer specimen`.

- [ ] **Step 7: Verify**

Reload `http://localhost:8000/`. The page must render identically. Specifically:
- The page scrolls top-to-bottom (specimen `html, body { overflow: auto; }` still wins — now by layer order, not source order)
- The masthead, all sections, and the colophon render unchanged
- Open `http://localhost:8000/?grid=on` (or whatever URL flag the runtime uses; the `?grid` overlay should appear if the JS sets `body.show-grid`)
- DevTools Console: no parse errors, no warnings about unknown at-rules

Programmatic verification:
```bash
# Layer declaration present at top of file
grep -n "^@layer reset, tokens, runtime, specimen, debug;" style.css

# Each layer opens exactly once
grep -cE "^@layer (reset|tokens|runtime|specimen|debug) \{" style.css
```
Expected: layer-declaration count 1; each layer opens at least once. The `@layer specimen` opens twice (once after the divider, once after the debug block) — that's fine; CSS merges layers of the same name.

Programmatic balance check (rough — confirm no missing braces by pasting file into a CSS parser, or use the browser's CSSOM):
In DevTools Console:
```js
[...document.styleSheets[0].cssRules].filter(r => r instanceof CSSLayerBlockRule || r.constructor.name.includes('Layer')).map(r => r.name || r.cssText.slice(0, 60))
```
Expected: returns a list including all five layers. (If a brace is unbalanced the page fails to render entirely — that is the strongest signal.)

- [ ] **Step 8: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-1 · Adopt @layer to encode runtime/specimen contract"
```

---

## Task 6: R-2 · File preamble — top-of-file orientation map

**Why:** The file opens with 5 lines of brand attribution then drops into the Grid `:root` block. No section index, no runtime/specimen pointer, no banner-comment style guide. A 1591-line single-file specimen needs a preamble that orients an editor in seconds. Per spec §3 axis-2 file-preamble criteria.

**Files:**
- Modify: `style.css` (insert preamble after the brand-attribution banner, before the `@layer` declaration added in Task 5)

- [ ] **Step 1: Locate**

After Task 5, the head of the file is:
```css
/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
   (was: "alectear-feel craft" — undefined coined term, substituted)
   ============================================================ */

/* Cascade layers — encodes the runtime/specimen contract in CSS. ... */
@layer reset, tokens, runtime, specimen, debug;
```
The preamble inserts between the attribution banner and the cascade-layers block.

- [ ] **Step 2: Apply**

`old_string`:
```css
/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
   (was: "alectear-feel craft" — undefined coined term, substituted)
   ============================================================ */

/* Cascade layers — encodes the runtime/specimen contract in CSS.
```

`new_string`:
```css
/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
   (was: "alectear-feel craft" — undefined coined term, substituted)
   ============================================================ */

/* ============================================================
   File map — single-file system of record for the brand. No build,
   no preprocessor; the specimen page renders from these rules.

   Order:
     L  1– 13 · This preamble + brand attribution
     L 14– 25 · @layer declaration + tokens (`:root` × 2)
     L 26–...  · Layer 'reset'      — *, html/body base
              · Layer 'runtime'     — Stage, Tile, .photo, .identity,
                                      .species, .compass, mobile,
                                      reduced-motion, focus-visible
              · END RUNTIME · BEGIN SPECIMEN divider
              · Layer 'specimen'    — .sr-* primitives, sections in
                                      §1.1 → §1.8 → §2.x → §3.1 → §99
                                      order, then below-1336 fallback
              · Layer 'debug'       — ?grid overlay (opt-in via URL)

   Conventions:
     · Runtime classes use `.kebab-case` (`.stage`, `.photo`, `.species`).
     · Specimen classes use `.sr-block__element--modifier` (BEM).
     · Top-level dividers use the full ============= banner style.
     · The specimen may consume the runtime; the runtime may not
       reference the specimen. @layer encodes this contract.

   Edit rules:
     · Edit only the two `:root` blocks to retune the system.
     · Charcoal/blue/field alphas derive from base tokens via
       color-mix() — do not add raw rgba() literals.
     · New tokens land in the second `:root` block, grouped by role.
   ============================================================ */

/* Cascade layers — encodes the runtime/specimen contract in CSS.
```

(After R-7 specimen reorder lands, return to this preamble's section index — particularly the §1.x → §2.x → §3.1 → §99 order claim — and confirm the specimen now actually renders in that order.)

- [ ] **Step 3: Verify**

Reload `http://localhost:8000/`. The page must render identically (the preamble is a comment block; no rendered effect). Console: no errors.

```bash
head -50 style.css
```
Expected: the preamble is present, the conventions and edit-rules sections are intact.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-2 · Add top-of-file preamble"
```

---

## Task 7: R-7 · Specimen-block reorder to match HTML render order

**Why:** HTML renders 00 Masthead → 1.1 Principles → 1.2 Identity → 1.3 Grid → 1.4 Color → 1.5 Type → 1.6 Spacing → 1.7 Elevation → 1.8 Motion → 2.x components → 3.1 Overlays → 99 Colophon. CSS authors them out of order: Masthead → Principles → Color → Photo treatment → Type → Spacing → Motion → Mobile-cell → Elevation → Colophon → Grid → Identity → Anatomy → Overlays. With `@layer specimen` from R-1 wrapping these, the reorder is purely cosmetic — no specificity risk.

**Target order (post-reorder, line ranges approximate):**
1. Specimen primitives (`.sr-rule`, `.sr-cell*`, `.sr-cell__body` overrides) — unchanged position
2. Section anatomy (`.sr-section__id/title/stats`) — unchanged position
3. `/* Masthead */` — unchanged position
4. `/* Principles */` — unchanged position
5. `/* Identity (1.2) */` — **moved here** from current L1284–1373
6. `/* Grid ruleset (1.3) */` — **moved here** from current L1130–1190
7. `/* Color */` (1.4) + Photograph treatment — unchanged position (relatively)
8. `/* Typography */` (1.5) — unchanged
9. `/* Spacing */` (1.6) — unchanged
10. `/* Elevation note */` (1.7) — **moved here** from current L1054–1107
11. `/* Motion */` (1.8) — unchanged
12. Mobile-cell rendering override (2.6 specimen) — unchanged
13. Component anatomy template (`.sr-anatomy*`) — **moved here** from current L1375–1434 (just before the 2.x cells/components consume it)
14. `/* Overlays (3.1) */` — unchanged position
15. `/* Colophon */` (99) — **moved here** from current L1109–1128
16. Below-1336 fallback (`@media (max-width: 1335px)`) — moved to end of `@layer specimen` (was at L1241+)
17. `?grid` debug overlay (`@layer debug`) — last block of file

**Files:**
- Modify: `style.css` (cluster moves)

**Approach:** One coherent set of moves, executed sequentially, verified collectively. After Task 5 the rules sit inside `@layer specimen { … }`; moves stay inside that layer wrapper. Each move is a cut-from-old-position + paste-at-new-position pair.

- [ ] **Step 1: Snapshot pre-move state**

```bash
wc -l style.css  # record the count
grep -nE "^/\* (Masthead|Principles|Identity \(1\.2\)|Grid ruleset|Color|Photograph|Typography|Spacing|Motion|Mobile|Elevation|Anatomy|Overlays|Colophon|\?grid|Below-1336)" style.css
grep -nE "^\.sr-(masthead|principles|identity-mark|token|grid-anatomy|swatch|alpha-ladder|photo-treatment|type|ruler|motion|mcell|mobile-edition|elevation|focus-demo|colophon|anatomy|overlay-)" style.css | head -50
```
Record the line ranges. Each banner's start line + the start line of the next banner determines the cluster's range.

- [ ] **Step 2: Move §1.2 Identity cluster (currently L1284–1373) to follow §1.1 Principles**

Use Read to capture the exact text of the entire block:
```
/* ============================================================
   Identity (1.2) — mark at scale, clear-space, minimum size
   ============================================================ */
.sr-identity-mark { ... }
... (all .sr-identity-* rules through L1373)
```

Cut: Edit `style.css` with the entire block as `old_string` and an empty string (or a single newline) as `new_string`.

Paste: Edit `style.css` to insert the captured text immediately after the last rule of `/* Principles */` (currently at L774, but post-Tasks 5+6 the line number will differ — locate by surrounding text: the rule `.sr-principles__principles li::before { … }` block end).

`old_string` for the paste anchor (re-read to get exact text):
```css
[last rule of /* Principles */]
}

/* Color */
```

`new_string`:
```css
[last rule of /* Principles */]
}

/* ============================================================
   Identity (1.2) — mark at scale, clear-space, minimum size
   ============================================================ */
.sr-identity-mark { ... }
... (full block here)

/* Color */
```

- [ ] **Step 3: Move §1.3 Grid ruleset cluster (currently L1130–1190) to follow §1.2 Identity**

The Grid ruleset block was renamed in C-3 to "§1.3 specimen — token chips + page-anatomy diagram". Capture the entire block (banner + all `.sr-token*` and `.sr-grid-anatomy*` rules).

Cut from old position, paste between Identity and Color (now adjacent after Step 2's move).

Paste anchor:
```css
[last .sr-identity-* rule]
}

/* Color */
```

becomes:

```css
[last .sr-identity-* rule]
}

/* ============================================================
   Grid ruleset — §1.3 specimen — token chips + page-anatomy diagram
   ============================================================ */
.sr-token { ... }
... (full block here)

/* Color */
```

- [ ] **Step 4: Move §1.7 Elevation cluster (currently L1054–1107) to follow §1.6 Spacing**

Capture the `/* Elevation note */` block (banner + `.sr-elevation*` and `.sr-focus-demo*` rules).

Cut from old position. Paste between the end of `/* Spacing */` block and the start of `/* Motion */`.

Paste anchor (post Step 3, re-locate by surrounding text):
```css
[last .sr-ruler* rule]
}

/* Motion */
```

becomes:

```css
[last .sr-ruler* rule]
}

/* Elevation note */
.sr-elevation__body { ... }
... (full block here)

/* Motion */
```

- [ ] **Step 5: Move component anatomy template (currently L1375–1434) to just before `/* Overlays (3.1) */`**

Capture the `/* Component anatomy template */` block (banner + `.sr-anatomy*` rules + the two media-query blocks at the end of the cluster). Re-read the original block carefully — it includes the `(max-width: 1335px)` and `(max-width: 720px)` media-query blocks at L1427+ which are scoped to anatomy.

Cut from old position. Paste immediately before the `Overlays (3.1)` banner (currently at L1436).

The anatomy template lives at the boundary between §1.x foundations and §2.x components / §3.1 patterns. Placing it just before §3.1 is a defensible "common-ancestor" position — it's used by every 2.x component cell that calls `.sr-anatomy__diagram`, and by 3.1 overlay slots.

- [ ] **Step 6: Move `/* Colophon */` (currently L1109–1128) to follow `/* Overlays (3.1) */`**

Capture the colophon block. Cut from old position. Paste at the end of the specimen content, immediately after the last `.sr-overlay-*` rule and before the layer-closing `}` (or before the `@layer debug` block, depending on file state).

- [ ] **Step 7: Move `?grid` debug overlay + Below-1336 fallback to the end of the specimen layer**

After Tasks 5 + previous moves, `@layer debug` already wraps the `?grid` overlay. The `Below-1336 fallback` is currently at L1241+ (specimen layer). Confirm its position post-moves by grep:
```bash
grep -n "Below-1336 fallback" style.css
```

Move the Below-1336 fallback block to immediately precede the `@layer debug { … }` block, so the specimen layer ends with the fallback rules and the debug layer is the last block of the file.

- [ ] **Step 8: Update R-2 preamble's section index**

Open the preamble inserted in Task 6. The section index claimed `§1.1 → §1.8 → §2.x → §3.1 → §99` order. After Steps 2–7, this is now actually true. Update the indented section index lines if needed to reflect any final-position adjustments (e.g., the anatomy template's resting position, the debug layer at end). Confirm the order claim is accurate.

- [ ] **Step 9: Verify**

```bash
# Line count: total lines should equal pre-Task-7 baseline (no rules added or removed)
wc -l style.css

# Every cluster banner is present exactly once
grep -cE "^/\* (Masthead|Principles|Color|Photograph|Typography|Spacing|Motion|Mobile|Elevation|Anatomy|Overlays|Colophon)" style.css
grep -cE "Identity \(1\.2\) — mark at scale" style.css
grep -cE "Grid ruleset — §1\.3 specimen" style.css
grep -cE "\?grid debug overlay" style.css
grep -cE "Below-1336 fallback" style.css

# Layer wraps still balance (declaration + 5 @layer X { openings, balanced closings)
grep -n "^@layer " style.css
```
Expected: every named cluster present exactly once; line count unchanged; layer declarations balanced.

Reload `http://localhost:8000/`. The page must render identically — same sections, same order on the page, same visual treatment. The reorder is in CSS only; the HTML render order does not change. Open `?grid=on` flag — the debug overlay should still activate.

Walk through the file top-to-bottom in a code editor and confirm the new order matches the target order in this task's preamble.

- [ ] **Step 10: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-7 · Reorder specimen blocks to match HTML render order"
```

---

## Task 8: R-3 · Extract `--mono-stack` token; replace 38 callsites

**Why:** The mono font stack `ui-monospace, "SF Mono", Menlo, Consolas, monospace;` appears 38 times across `style.css`. Two callsites (L186 `.photo .placeholder::after`, L329 `.compass`) use a SHORT variant without "Consolas" — silent drift. Single-source-of-truth violation.

**Files:**
- Modify: `style.css` (add token; replace all 38 callsites; align the 2 short-variant callsites)

- [ ] **Step 1: Locate all callsites**

```bash
grep -n 'ui-monospace, "SF Mono"' style.css
```
Expected: ~38 matches. Note which 2 lines use the short variant (no `Consolas` between `Menlo` and `monospace`).

- [ ] **Step 2: Add the token**

Locate the second `:root` block (palette/type/motion). Find the comment block `/* Substitute for ABC Diatype */` and the `--font-stack` declaration:

`old_string`:
```css
  /* Substitute for ABC Diatype */
  --font-stack: 'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif;
```

`new_string`:
```css
  /* Substitute for ABC Diatype */
  --font-stack: 'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono-stack: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

- [ ] **Step 3: Replace all long-variant callsites**

Use Edit with `replace_all`:

`old_string`:
```css
font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

`new_string`:
```css
font-family: var(--mono-stack);
```

Set `replace_all: true`. All 36 long-variant callsites convert in one shot.

- [ ] **Step 4: Align and replace the 2 short-variant callsites**

Re-grep for the short variant (no Consolas):
```bash
grep -n 'ui-monospace, "SF Mono", Menlo, monospace' style.css
```
Expected: 2 matches. These were silent drift; align them to the canonical stack.

`old_string` (use replace_all):
```css
font-family: ui-monospace, "SF Mono", Menlo, monospace;
```

`new_string`:
```css
font-family: var(--mono-stack);
```

- [ ] **Step 5: Verify**

```bash
grep -c 'ui-monospace, "SF Mono"' style.css
```
Expected: 1 (the token definition itself). Every callsite now references `var(--mono-stack)`.

```bash
grep -c "var(--mono-stack)" style.css
```
Expected: 38.

Reload `http://localhost:8000/`. Inspect a mono utility surface (e.g., `.sr-cell__label`, `.sr-section__stats`, `.sr-skip:focus`) in DevTools. The computed font-family should resolve to the same five-font stack. The two formerly short-variant surfaces (`.photo .placeholder::after`, `.compass`) now also include Consolas — visually identical on systems where SF Mono / Menlo / ui-monospace already win.

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-3 · Extract --mono-stack token, replace 38 callsites"
```

---

## Task 9: R-4 · Charcoal alpha ladder via `color-mix()`

**Why:** `--charcoal: #1A1A1A;` is a locked identity token, but the file has 34 `rgba(26, 26, 26, X)` literals — 34 secondary copies of the same rgb. The §1.4 alpha ladder documents the brand roles (0.04, 0.06, 0.10, 0.65, 0.70, 0.75); CSS also uses 0.12, 0.45, 0.60 (undocumented drift). `color-mix(in srgb, var(--charcoal) (A·100)%, transparent)` derives every alpha from the one source token.

**Files:**
- Modify: `style.css` (replace 34 rgba literals)

- [ ] **Step 1: Enumerate all charcoal-rgba alpha values**

```bash
grep -oE "rgba\(26, 26, 26, 0\.[0-9]+\)" style.css | sort | uniq -c
```
Expected output (counts approximate, total 34): `0.04`, `0.06`, `0.10`, `0.12`, `0.45`, `0.60`, `0.65`, `0.70`, `0.75`.

- [ ] **Step 2: Replace each alpha value with the equivalent `color-mix()` call**

Use Edit with `replace_all` once per alpha value. The mapping:

| rgba | color-mix |
|------|-----------|
| `rgba(26, 26, 26, 0.04)` | `color-mix(in srgb, var(--charcoal) 4%, transparent)` |
| `rgba(26, 26, 26, 0.06)` | `color-mix(in srgb, var(--charcoal) 6%, transparent)` |
| `rgba(26, 26, 26, 0.10)` | `color-mix(in srgb, var(--charcoal) 10%, transparent)` |
| `rgba(26, 26, 26, 0.12)` | `color-mix(in srgb, var(--charcoal) 12%, transparent)` |
| `rgba(26, 26, 26, 0.45)` | `color-mix(in srgb, var(--charcoal) 45%, transparent)` |
| `rgba(26, 26, 26, 0.60)` | `color-mix(in srgb, var(--charcoal) 60%, transparent)` |
| `rgba(26, 26, 26, 0.65)` | `color-mix(in srgb, var(--charcoal) 65%, transparent)` |
| `rgba(26, 26, 26, 0.70)` | `color-mix(in srgb, var(--charcoal) 70%, transparent)` |
| `rgba(26, 26, 26, 0.75)` | `color-mix(in srgb, var(--charcoal) 75%, transparent)` |

For each row, run an Edit with `replace_all: true`. Example for the first row:

`old_string`: `rgba(26, 26, 26, 0.04)`
`new_string`: `color-mix(in srgb, var(--charcoal) 4%, transparent)`
`replace_all`: `true`

Repeat for each alpha value above.

- [ ] **Step 3: Verify**

```bash
grep -c "rgba(26, 26, 26," style.css
```
Expected: 0.

```bash
grep -c "color-mix(in srgb, var(--charcoal)" style.css
```
Expected: 34.

Reload `http://localhost:8000/`. Visual diff against the §1.4 Color screenshot taken in Task 0 / Step 4: the alpha-ladder swatches should appear pixel-identical (`color-mix` in sRGB with `transparent` produces the same composited color as `rgba(R,G,B,A)` over the same backdrop). Walk every section and confirm no perceptible change to hairlines, captions, swatches, rule lines, or stats text.

In DevTools, inspect a hairline rule (`.sr-rule`) and a utility caption (`.sr-cell__label`). The computed `background` / `color` should resolve to a charcoal color with the expected alpha.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-4 · Charcoal alpha ladder via color-mix()"
```

---

## Task 10: R-5 · Blue alpha ladder via `color-mix()`

**Why:** `--blue: #1635EE;` is a locked identity token. The file has 10 `rgba(22, 53, 238, X)` literals. `--blue-soft` already covers 0.60; the others (0.05, 0.08, 0.10, 0.12, 0.18, 0.35) are raw.

**Files:**
- Modify: `style.css` (replace 10 rgba literals; keep `--blue-soft` token)

- [ ] **Step 1: Enumerate**

```bash
grep -oE "rgba\(22, 53, 238, 0\.[0-9]+\)" style.css | sort | uniq -c
```
Expected: 0.05, 0.08, 0.10, 0.12, 0.18, 0.35 (and any 0.60 instances are already tokenized via `--blue-soft`; verify none remain raw).

- [ ] **Step 2: Replace**

For each alpha value, Edit with `replace_all: true`:

| rgba | color-mix |
|------|-----------|
| `rgba(22, 53, 238, 0.05)` | `color-mix(in srgb, var(--blue) 5%, transparent)` |
| `rgba(22, 53, 238, 0.08)` | `color-mix(in srgb, var(--blue) 8%, transparent)` |
| `rgba(22, 53, 238, 0.10)` | `color-mix(in srgb, var(--blue) 10%, transparent)` |
| `rgba(22, 53, 238, 0.12)` | `color-mix(in srgb, var(--blue) 12%, transparent)` |
| `rgba(22, 53, 238, 0.18)` | `color-mix(in srgb, var(--blue) 18%, transparent)` |
| `rgba(22, 53, 238, 0.35)` | `color-mix(in srgb, var(--blue) 35%, transparent)` |

If any `rgba(22, 53, 238, 0.6)` (or `0.60`) remains raw, replace it with `var(--blue-soft)` (the existing dedicated alias).

- [ ] **Step 3: Verify**

```bash
grep -c "rgba(22, 53, 238," style.css
```
Expected: 0.

```bash
grep -nE "var\(--blue-soft\)" style.css | wc -l
```
Expected: ≥ pre-Task count (every formerly raw 0.60 is now `var(--blue-soft)`).

Reload. Visual diff: the `?grid=on` debug overlay (which uses 0.18 dashed and 0.35 borders) and §3.1 Overlays should appear unchanged.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-5 · Blue alpha ladder via color-mix()"
```

---

## Task 11: R-10 · Field-derived alpha literals via `color-mix()`

**Why:** `--field: #F2EEE5;` is a locked identity token. Three field-alpha values exist (0.85 placeholder caption, 0.92 grid-debug caption, 0.95 overlay) but only 0.95 is tokenized as `--field-overlay`.

**Files:**
- Modify: `style.css` at L192, L413, L1186, L1233 (post-R-7 line numbers will differ; locate by surrounding context)

- [ ] **Step 1: Locate**

```bash
grep -n "rgba(242, 238, 229," style.css
```
Expected: 4 matches (two at 0.85, two at 0.92). Token-block `--field-overlay` line excluded if you grep with a stricter pattern — note that the `:root` block defines `rgba(242, 238, 229, 0.95)` as the value of `--field-overlay`; that one we keep.

- [ ] **Step 2: Replace**

Use Edit with `replace_all: true` for each:

`old_string`: `rgba(242, 238, 229, 0.85)`
`new_string`: `color-mix(in srgb, var(--field) 85%, transparent)`
`replace_all`: `true`

`old_string`: `rgba(242, 238, 229, 0.92)`
`new_string`: `color-mix(in srgb, var(--field) 92%, transparent)`
`replace_all`: `true`

Do **not** change the 0.95 literal inside the `:root` `--field-overlay` definition — that is the canonical token, and the file already documents the field-overlay alpha as a named alias.

- [ ] **Step 3: Verify**

```bash
grep -n "rgba(242, 238, 229," style.css
```
Expected: exactly 1 match — the `--field-overlay` token definition in `:root`.

Reload. Visual diff on placeholder captions and grid-debug captions — should appear identical.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-10 · Field-derived alphas via color-mix()"
```

---

## Task 12: R-11 · `.sr-identity-min__wordmark` font-size token

**Why:** `style.css:1351` (pre-R-7 line) declares `font-size: 0.78rem;` — exact value of `--label-size-m`. `.sr-identity-min__wordmark` ("minimum-size identity wordmark at min 96px width") is conceptually adjacent to a label.

**Files:**
- Modify: `style.css` at the `.sr-identity-min__wordmark` rule

- [ ] **Step 1: Locate**

```bash
grep -nE "0\.78rem" style.css
```
Expected: 1–2 matches inside `.sr-identity-min__wordmark` (the rule has the wordmark + an inner hardcoded `font-size: 0.78rem;` per the audit).

- [ ] **Step 2: Apply**

`old_string` (use replace_all if both lines match the same literal):
```css
font-size: 0.78rem;
```

`new_string`:
```css
font-size: var(--label-size-m);
```

If the two callsites have different surrounding context (verify via `grep -B 2 -A 2 "0.78rem" style.css`), do them as separate Edit calls.

- [ ] **Step 3: Verify**

```bash
grep -c "0.78rem" style.css
```
Expected: 0. (Other tokens may declare 0.78rem; if so, leave those — only the `.sr-identity-min__wordmark` callsite is in scope.)

Reload, scroll to §1.2 Identity. The min-size wordmark at the right edge of the §1.2 demo should appear unchanged (`--label-size-m` resolves to 0.78rem).

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-11 · Use --label-size-m for sr-identity-min__wordmark"
```

---

## Task 13: R-8 · `sr-` prefix on three orphan classes (`.ind-dot`, `.live`, `.overlay--backdrop`)

**Why:** All three are scoped under `.sr-overlay-*` blocks but break the `sr-` prefix discipline.

**Files:**
- Modify: `style.css` at L1504 (`.ind-dot`), L1568 (`.live`), L1586 (`.overlay--backdrop`) — post-R-7 line numbers will differ
- Modify: `index.html` at L747 (`.ind-dot`), L764 (`.live`), L773 (caption text demonstrates `.overlay--backdrop` modifier name)

**Renames:**
- `.ind-dot` → `.sr-overlay-primitive__dot`
- `.live` → `.sr-overlay-applied__layer__live`
- `.overlay--backdrop` → `.sr-overlay-applied__layer--backdrop`

- [ ] **Step 1: Locate all callsites in CSS and HTML**

```bash
grep -nE "(^|\s|\.)ind-dot" style.css index.html
grep -nE "(^|\s|\.)live[\s\{,]" style.css index.html  # narrower to avoid matching 'alive', etc.
grep -nE "overlay--backdrop" style.css index.html
```
Re-read each match in surrounding context — confirm each is the class-name use and not a coincidental substring.

- [ ] **Step 2: Apply renames**

Three independent Edit operations, each with `replace_all: true` where safe:

`.ind-dot` (rare token, low collision risk):
- `old_string`: `ind-dot`
- `new_string`: `sr-overlay-primitive__dot`

`.live` (common-word token — DO NOT replace_all). Locate each callsite individually and Edit with full surrounding selector context:
- In CSS: e.g. `old_string`: `.sr-overlay-applied__layer .live` → `new_string`: `.sr-overlay-applied__layer .sr-overlay-applied__layer__live`
  (Or simplify to `.sr-overlay-applied__layer__live` if the parent scope is unnecessary post-rename.)
- In HTML: `old_string`: `class="… live …"` → `new_string`: `class="… sr-overlay-applied__layer__live …"` (preserve the surrounding class list)

`.overlay--backdrop`:
- `old_string`: `overlay--backdrop`
- `new_string`: `sr-overlay-applied__layer--backdrop`
- `replace_all`: `true`

- [ ] **Step 3: Verify**

```bash
grep -nE "(^|\s|\.|\W)ind-dot|overlay--backdrop" style.css index.html
grep -nE "\.sr-overlay-primitive__dot|\.sr-overlay-applied__layer__live|\.sr-overlay-applied__layer--backdrop" style.css
```
Expected: old names absent; new names present in CSS and (for `.ind-dot` and `.live`) HTML.

Reload `http://localhost:8000/`. §3.1 Overlays must render identically — every layer that previously matched the old class is now matching the new one.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 2: R-8 · sr- prefix on three orphan overlay classes"
```

---

## Task 14: R-9 · Single global `.dot` rule (replace 6 scoped re-declarations)

**Why:** `.dot { color: var(--blue); }` is re-declared in 6 ancestor-scoped rules: `.identity .dot`, `.sr-masthead__wordmark .dot`, `.sr-colophon__signature .dot`, `.sr-identity-mark__wordmark .dot`, `.sr-identity-clearspace .dot`, `.sr-identity-min__wordmark .dot`. Six rules say the same thing; adding a 7th surface requires a 7th re-declaration. `.brand-dot` (L243) is a deliberately different class — keep it distinct.

**Files:**
- Modify: `style.css` (delete 6 scoped rules; add 1 global rule)

- [ ] **Step 1: Locate all six**

```bash
grep -nE "\.dot\s*\{\s*color:\s*var\(--blue\)" style.css
```
Expected: 6 matches at the lines named in the audit. Re-read surrounding context to confirm each is a single-property rule (or a one-line rule embedded in a larger ancestor-scoped block — these are single-rule lines per the audit).

- [ ] **Step 2: Add the global rule**

In the runtime layer (logically — the `.dot` class is a brand-atomic runtime concern), add a single global rule. Place it adjacent to where `.identity .dot` currently lives — after the `.identity .name` rule at L279 — so the dot's brand-atomic role is co-located with the wordmark's other brand atoms.

`old_string`:
```css
.identity .name { color: var(--charcoal); }
.identity .dot  { color: var(--blue); }
```

`new_string`:
```css
.identity .name { color: var(--charcoal); }
.dot { color: var(--blue); } /* brand-atomic — every wordmark surface */
```

- [ ] **Step 3: Remove the five remaining scoped re-declarations**

Each is a one-line rule. Edit each separately (do not `replace_all` because surrounding context differs). Examples:

`old_string`:
```css
.sr-masthead__wordmark .dot { color: var(--blue); }
```
`new_string`: (empty string — delete the line)

Repeat for `.sr-colophon__signature .dot`, `.sr-identity-mark__wordmark .dot`, `.sr-identity-clearspace .dot`, `.sr-identity-min__wordmark .dot`.

- [ ] **Step 4: Verify**

```bash
grep -nE "\.dot\s*\{\s*color" style.css
```
Expected: 1 match (the global rule).

```bash
grep -nE "\.brand-dot\s*\{" style.css
```
Expected: still present — `.brand-dot` is intentionally distinct (audit notes this).

Reload. Walk every wordmark surface (00 Masthead, 1.2 Identity, 99 Colophon, the runtime `.identity` chrome) — every dot still renders blue.

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-9 · Single global .dot rule (collapse 6 re-declarations)"
```

---

## Task 15: R-6 · Remove `.sr-section__head` dead code

**Why:** `.sr-section__head` is defined as a full rule (L573–583) but `index.html` has 0 matches. Naming overlaps semantically with `.sr-section__title` and `.sr-cell__label`. Leftover from earlier iteration.

**Files:**
- Modify: `style.css` (delete the rule block)

- [ ] **Step 1: Confirm dead**

```bash
grep -n "sr-section__head" style.css index.html
```
Expected: matches only in `style.css` (the rule definition); zero in `index.html`.

- [ ] **Step 2: Delete**

`old_string`:
```css
.sr-section__head {
  grid-column: 1 / -1;
  font-family: var(--mono-stack);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--charcoal) 60%, transparent);
  margin: 0;
  font-weight: 500;
  align-self: end;
}

```
(After R-3 the `font-family` is `var(--mono-stack)`; after R-4 the `color` is `color-mix(...)`. Re-read the actual rule to get the exact text.)

`new_string`: (empty string — delete the entire block including the trailing blank line)

- [ ] **Step 3: Verify**

```bash
grep -n "sr-section__head" style.css index.html
```
Expected: 0 matches.

Reload. The page renders identically — the rule was dead, removing it has no visible effect.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-6 · Remove .sr-section__head (dead code)"
```

---

## Task 16: R-12 · Remove the lone `!important`

**Why:** `style.css:1270` (pre-R-7) declares `width: 100% !important` inside the 1335px fallback for `.sr-cell, [class*="sr-cell--"]`. The same rule already sets `display: block` — block elements span their container by default. The `!important` is the file's only one. Remove it; root-cause if a regression appears.

**Files:**
- Modify: `style.css` at the Below-1336 fallback rule

- [ ] **Step 1: Locate**

```bash
grep -n "!important" style.css
```
Expected: exactly 1 match — the `width: 100% !important` line.

- [ ] **Step 2: Apply**

`old_string`:
```css
  .sr-cell,
  [class*="sr-cell--"] {
    display: block;
    width: 100% !important;
    margin-bottom: var(--gutter);
  }
```

`new_string`:
```css
  .sr-cell,
  [class*="sr-cell--"] {
    display: block;
    width: 100%;
    margin-bottom: var(--gutter);
  }
```

(`width: 100%` is kept explicit — `display: block` makes it implicit, but explicit is clearer in a fallback rule whose whole job is single-column flow at narrow widths.)

- [ ] **Step 3: Verify**

```bash
grep -c "!important" style.css
```
Expected: 0.

Resize the browser below 1336px (or open DevTools responsive mode at 1024px). Every section should still flow as a single column with cells stacking full-width and gutter spacing between them. The `?grid=on` overlay (which is disabled at this breakpoint per existing rule) should remain disabled.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-12 · Remove lone !important from below-1336 fallback"
```

---

## Task 17: R-13 · Merge duplicate `.mobile-edition .mcell .mphoto` rules

**Why:** Two consecutive rule blocks at L385–393 and L394 both target `.mobile-edition .mcell .mphoto`. The first sets gradient/grid/place-items; the second adds `overflow: hidden;`. Reads as an oversight from a later edit.

**Files:**
- Modify: `style.css` at L385–394 (pre-R-7)

- [ ] **Step 1: Locate**

```bash
grep -n "\.mobile-edition \.mcell \.mphoto" style.css
```
Expected: ≥ 2 matches — the first the multi-property block, the second the `overflow: hidden;` follow-up. Confirm they are adjacent (no other rule between them).

- [ ] **Step 2: Apply**

`old_string` (re-read for exact content; rough shape):
```css
.mobile-edition .mcell .mphoto {
  background: linear-gradient(180deg, var(--placeholder-band-a), var(--placeholder-band-b));
  display: grid;
  place-items: center;
}

.mobile-edition .mcell .mphoto {
  overflow: hidden;
}
```

`new_string`:
```css
.mobile-edition .mcell .mphoto {
  background: linear-gradient(180deg, var(--placeholder-band-a), var(--placeholder-band-b));
  display: grid;
  place-items: center;
  overflow: hidden;
}
```

- [ ] **Step 3: Verify**

```bash
grep -nE "^\.mobile-edition \.mcell \.mphoto \{" style.css
```
Expected: 1 match.

Resize browser to 720px or below. The mobile-edition placeholder block at the bottom of the page should render identically (gradient + clipped overflow).

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 2: R-13 · Merge duplicate .mobile-edition .mcell .mphoto rules"
```

---

## Task 18: R-Phase 2 CHANGELOG entry

**Why:** Per spec §5: one entry per phase; finding IDs named in prose for traceability.

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Apply**

Insert immediately above the R-Phase 1 entry (added in Task 4):

```markdown
## 2026-04-27 — v1 · audit remediation (R-Phase 2, Recommended)

R-Phase 2 (Recommended) closes thirteen findings. **Architecture:** R-1 adopted `@layer reset, tokens, runtime, specimen, debug;` to encode the runtime/specimen contract in CSS — the specimen-side `html, body { overflow: auto }` override now wins by layer order, not source order; the boundary the END RUNTIME · BEGIN SPECIMEN banner names is structural. R-2 added a 30-line top-of-file preamble (file map, conventions, edit rules). R-7 reordered the specimen blocks to match HTML render order (00 → §1.1 → §1.2 → §1.3 → §1.4 → §1.5 → §1.6 → §1.7 → §1.8 → §2.x → §3.1 → §99); the `?grid` debug overlay and below-1336 fallback now live at the end, in their own layer where appropriate. **Token discipline:** R-3 extracted `--mono-stack` and replaced 38 callsites (including 2 short-variant drifts that silently lacked Consolas); R-4 replaced 34 `rgba(26, 26, 26, …)` literals with `color-mix(in srgb, var(--charcoal) …%, transparent)`; R-5 did the same for 10 blue-rgba literals; R-10 for 4 field-rgba literals at 0.85 / 0.92; R-11 replaced one `0.78rem` literal with `var(--label-size-m)`. **Naming:** R-8 renamed `.ind-dot`, `.live`, `.overlay--backdrop` to `sr-` prefixed BEM-conformant names; R-9 collapsed six scoped `.dot { color: var(--blue) }` re-declarations into one global rule (`.brand-dot` deliberately preserved as a distinct concept). **Cleanup:** R-6 removed dead `.sr-section__head`; R-12 removed the file's lone `!important`; R-13 merged duplicate `.mobile-edition .mcell .mphoto` rules.

Spec: `docs/specs/2026-04-27-css-audit-design.md`.
Audit: `docs/audits/2026-04-27-css-audit.md`.
Plan: `docs/plans/2026-04-27-css-audit-remediation.md`.
```

- [ ] **Step 2: Verify**

```bash
head -30 CHANGELOG.md
```
Expected: R-Phase 2 entry is now first; R-Phase 1 second; pre-existing close-out entries follow.

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "R-Phase 2: Log close-out in CHANGELOG.md"
```

---

# R-Phase 3 — Polish (ship-or-skip)

R-Phase 3 is governed by audit §5: "Polish findings: ship-or-skip, no obligation." Each task below is independent. Skip any whose payoff feels marginal at execution time and note the deferral in the R-Phase 3 CHANGELOG entry. The audit groups them: comments cluster (P-1..P-5) is one fast batch; P-9 / P-10 are paired; the rest can fall to a future close-out.

## Task 19: P-1 + P-2 + P-3 + P-4 + P-5 · Comments cluster

**Why:** Five separate comment-discipline findings — banner-style consistency (P-1), expired graveyard parentheticals (P-2, P-3), an over-promising banner (P-4), a brittle line-number reference (P-5). Bundled into one commit because they all live in comments and have zero behavioral effect.

**Files:**
- Modify: `style.css` (comment edits throughout)
- Modify: `index.html` (the parallel "alectear" historical comment in P-3)

- [ ] **Step 1: P-1 — Standardize specimen-section markers to banner style**

Single-line markers are at L692 (`/* Masthead */`), L732 (`/* Principles */`), L776 (`/* Color */`), L857 (`/* Typography */`), L889 (`/* Spacing */`), L932 (`/* Motion */`), L1054 (`/* Elevation note */`), L1109 (`/* Colophon */`). The slightly larger photo-treatment marker at L835 already approaches banner style.

For each, expand to the full banner:

`old_string`:
```css
/* Masthead */
```

`new_string`:
```css
/* ============================================================
   Masthead
   ============================================================ */
```

Repeat the pattern for Principles, Color, Typography, Spacing, Motion, Elevation note, Colophon. (The Photograph treatment marker at L835 may already be in banner style — leave if so; tighten if half-banner.)

- [ ] **Step 2: P-2 — Remove `(was 760, off-by-16 math bug fixed)` parentheticals**

Find:
```bash
grep -n "was 760" style.css
```
Expected: 2 matches at L17–18 and L21.

`old_string`:
```css
     hold an integer count of 3:2 photographs at the brand's intended
     scale. Tile is 1320 × 744; 744 = 5·u + 6·g (was 760, off-by-16
     math bug fixed). All other spacing on the page derives from these. */
```

`new_string`:
```css
     hold an integer count of 3:2 photographs at the brand's intended
     scale. Tile is 1320 × 744; 744 = 5·u + 6·g. All other spacing on
     the page derives from these. */
```

`old_string`:
```css
  --tile-height:   744px;    /* 5·u + 6·g — was 760 (math bug, off by 16) */
```

`new_string`:
```css
  --tile-height:   744px;    /* 5·u + 6·g */
```

- [ ] **Step 3: P-3 — Remove `(was: "alectear-feel craft" — undefined coined term, substituted)` from both files**

`style.css` head:
`old_string`:
```css
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
   (was: "alectear-feel craft" — undefined coined term, substituted)
```

`new_string`:
```css
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
```

`index.html` (find the parallel comment near L51):
```bash
grep -n "alectear" index.html
```
Remove the corresponding HTML comment block. Keep the visible "hand-crafted" prose intact.

(Note: `style-reference/CLAUDE.md` may also still have the historical phrase. Audit's out-of-scope log flagged it as out of scope for this CSS audit — leave the CLAUDE.md alone.)

- [ ] **Step 4: P-4 — Rename "Print / reduced motion" banner to "Reduced motion"**

`old_string`:
```css
/* ============================================================
   Print / reduced motion
   ============================================================ */
```

`new_string`:
```css
/* ============================================================
   Reduced motion
   ============================================================ */
```

- [ ] **Step 5: P-5 — Replace brittle line-number reference with a structural one**

Find:
```bash
grep -n "style.css:449" style.css
```
Expected: 1 match (the comment in `.sr-skip:focus`).

`old_string`:
```css
  /* The global :focus-visible rule at style.css:449 supplies the outline. */
```

`new_string`:
```css
  /* The global :focus-visible rule (in the runtime Focus block above)
     supplies the outline. */
```

- [ ] **Step 6: Verify**

```bash
grep -c "was 760" style.css        # expected 0
grep -c "alectear" style.css index.html  # expected 0 (CLAUDE.md may still have it; out of scope)
grep -c "Print / reduced motion" style.css  # expected 0
grep -c "style.css:449" style.css  # expected 0
grep -nE "^/\* \w+ \*/$" style.css  # expected 0 (every section banner now full-form)
```

Reload `http://localhost:8000/`. Page renders identically — comment-only changes have no visible effect.

- [ ] **Step 7: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 3: P-1..P-5 · Comments cluster (banner consistency, graveyard removals, brittle ref)"
```

---

## Task 20: P-7 · Rename `.sr-sr-only` → `.sr-visually-hidden`

**Why:** Double prefix collides with the well-known `.sr-only` web idiom. Reads as "specimen-reference screen-reader-only".

**Files:**
- Modify: `style.css` at the `.sr-sr-only` rule
- Modify: `index.html` at L12, L15

- [ ] **Step 1: Locate**

```bash
grep -nE "sr-sr-only" style.css index.html
```

- [ ] **Step 2: Apply**

Edit with `replace_all: true`:

- `old_string`: `sr-sr-only`
- `new_string`: `sr-visually-hidden`
- `replace_all`: `true`

(Single token; safe across both files.)

- [ ] **Step 3: Verify**

```bash
grep -c "sr-sr-only" style.css index.html
grep -c "sr-visually-hidden" style.css index.html
```
Expected: 0 of the old; ≥ 3 of the new (1 CSS rule + 2 HTML callsites).

Reload. Open DevTools → Accessibility tree. The screen-reader-only `<h1>Style Reference</h1>` and skip-link's pre-focus state should still be properly visually hidden but reachable to assistive tech.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 3: P-7 · Rename .sr-sr-only → .sr-visually-hidden"
```

---

## Task 21: P-8 · Rename `.sr-principles__principles` → `.sr-principles__list`

**Why:** Block name `sr-principles`; element name `principles` — self-reference reads as `.sr-principles__principles`. Element name should describe role, not echo the block.

**Files:**
- Modify: `style.css` at L747, L760, L765
- Modify: `index.html` at L53

- [ ] **Step 1: Locate**

```bash
grep -nE "sr-principles__principles" style.css index.html
```

- [ ] **Step 2: Apply**

Edit with `replace_all: true`:

- `old_string`: `sr-principles__principles`
- `new_string`: `sr-principles__list`
- `replace_all`: `true`

- [ ] **Step 3: Verify**

```bash
grep -c "sr-principles__principles" style.css index.html
grep -c "sr-principles__list" style.css index.html
```
Expected: 0 of the old; ≥ 4 of the new.

Reload. Scroll to §1.1 Principles — the four-line ordered list (asymmetric alignment / italic blue Latin / mono utility / 1px corner) renders identically with its blue-counter prefix.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 3: P-8 · Rename .sr-principles__principles → .sr-principles__list"
```

---

## Task 22: P-9 + P-10 · Mobile-edition naming + descendant-chain flattening (paired)

**Why:** P-9 — the m-prefix (`mcell`, `mphoto`, `mlabel`, `mmeta`) doesn't match either the runtime's full descriptive names or the specimen's BEM. P-10 — chains like `.mobile-edition .mcell .mphoto img` (4 levels) flatten to one class with BEM names. Audit recommends "rename then flatten" as a single coherent change, OR accept m-prefix as a deliberate choice (placeholder edition → tighter naming → temporary status) and document it.

**Decision required at execution time** (light-touch tension surface — both choices are defensible):
- (a) **Accept m-prefix.** Add a comment at the `.mobile-edition` banner explaining the deliberate choice. P-10 becomes a no-op or a `:is()` consolidation only.
- (b) **Rename to BEM.** `.mcell` → `.mobile-edition__cell`, `.mphoto` → `.mobile-edition__photo`, `.mlabel` → `.mobile-edition__label`, `.mmeta` → `.mobile-edition__meta`. Then flatten: `.mobile-edition .mcell .mphoto img` → `.mobile-edition__photo-img` (or keep one level: `.mobile-edition__photo img`).

**If choice (a):**
- Modify: `style.css` at the mobile-edition banner — append a one-line note: `/* m-prefix is deliberate — placeholder edition, tighter naming reflects temporary status */`
- Skip the rename entirely.
- Optionally consolidate the 4-level chains via `:is()` for modest payoff: `.mobile-edition :is(.mcell, .mphoto, .mlabel, .mmeta)` patterns.

**If choice (b):**

- [ ] **Step 1: Locate every callsite**

```bash
grep -nE "\.(mcell|mphoto|mlabel|mmeta)" style.css index.html
```

- [ ] **Step 2: Apply renames (one Edit per token)**

Edit with `replace_all: true` for each:

- `mcell` → `mobile-edition__cell`
- `mphoto` → `mobile-edition__photo`
- `mlabel` → `mobile-edition__label`
- `mmeta` → `mobile-edition__meta`

(Note: `replace_all` on a 5-character token like `mcell` is safe only if no other word contains the substring — confirm via `grep -E "[a-z]mcell|mcell[a-z]" style.css index.html` first.)

- [ ] **Step 3: Flatten descendant chains**

For each 3- or 4-level chain, collapse using BEM names. Examples:

`old_string`: `.mobile-edition .mobile-edition__cell .mobile-edition__photo img`
`new_string`: `.mobile-edition__photo img`

`old_string`: `.mobile-edition .mobile-edition__cell .mobile-edition__label .latin`
`new_string`: `.mobile-edition__label .latin`

(BEM elements are uniquely-named — the `.mobile-edition` ancestor scope is redundant once the element class is unique.)

- [ ] **Step 4: Verify**

```bash
grep -cE "\.(mcell|mphoto|mlabel|mmeta)" style.css index.html  # expected 0
```

Resize browser to 720px or below. The mobile-edition placeholder block renders identically: same gradient placeholders, same italic-blue Latin labels, same uppercase mono meta text.

- [ ] **Step 5: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 3: P-9 + P-10 · Mobile-edition rename to BEM, flatten descendant chains"
```

(Or, for choice (a): `git commit -m "R-Phase 3: P-9 · Document m-prefix as deliberate"`.)

---

## Task 23: P-6 · `@media` block strategy

**Why:** `@media (prefers-reduced-motion: reduce)` appears at three locations; below-1336 at two; below-720 at two. Co-located with the rule each qualifies — defensible — but the strategy is unstated. Pick one (keep co-located, or consolidate to bottom-of-file) and document.

**Files:**
- Modify: `style.css` (preamble update or media-block consolidation)

**Decision at execution time:** light-touch. Audit recommends "either keep co-located and add a top-of-file note, or consolidate". Recommended choice: keep co-located (avoids a bigger rearrangement after R-7) and add one line to R-2's preamble.

- [ ] **Step 1: Apply**

Open the R-2 preamble inserted in Task 6. In the "Conventions" section, add a bullet:

`old_string` (within the Conventions block):
```
   Conventions:
     · Runtime classes use `.kebab-case` (`.stage`, `.photo`, `.species`).
     · Specimen classes use `.sr-block__element--modifier` (BEM).
     · Top-level dividers use the full ============= banner style.
```

`new_string`:
```
   Conventions:
     · Runtime classes use `.kebab-case` (`.stage`, `.photo`, `.species`).
     · Specimen classes use `.sr-block__element--modifier` (BEM).
     · Top-level dividers use the full ============= banner style.
     · @media blocks are co-located with the rules they qualify, not
       consolidated at end-of-file.
```

- [ ] **Step 2: Verify**

```bash
grep -A 1 "@media blocks are co-located" style.css
```
Expected: the bullet is present in the preamble.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "R-Phase 3: P-6 · Document @media co-location as deliberate"
```

---

## Task 24: P-11 · `--tile-margin` and `--tick` consume-or-document

**Why:** Both tokens render in HTML §1.6 Spacing but never appear as `var(...)` references in CSS. `--tile-margin` is conceptually correct as 0; `--tick` is the documented sub-tick (`u/60`, `g/12`) and the canonical 2px outline width.

**Files:**
- Modify: `style.css` at L449 (focus-visible outline) and the `:root` block

**Decision at execution time:**
(a) Consume `--tick` for the focus-visible outline (the canonical 2px case); add a comment on `--tile-margin` clarifying it is doc-only.
(b) Accept both as doc-only and add a `:root` comment.

Recommended: (a) — consume where it matches the documented role.

- [ ] **Step 1: Apply**

Find the focus-visible outline rule:
```bash
grep -nE ":focus-visible \{" style.css
grep -nE "outline: 2px" style.css
```

`old_string`:
```css
:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
  border-radius: 1px;
}
```

`new_string`:
```css
:focus-visible {
  outline: var(--tick) solid var(--blue);
  outline-offset: var(--tick);
  border-radius: 1px;
}
```

(`--tick` is `2px`. Outline-offset of `var(--tick)` matches the existing 2px value.)

For `--tile-margin`, add a clarifying comment in the Grid `:root` block:

`old_string`:
```css
  --tile-margin:     0px;    /* no margin between tiles in the photo plane */
```

`new_string`:
```css
  --tile-margin:     0px;    /* no margin between tiles; doc-only token —
                                 rendered in §1.6 spec, not consumed in CSS */
```

- [ ] **Step 2: Verify**

```bash
grep -nE "var\(--tick\)" style.css
```
Expected: 2 matches inside the `:focus-visible` rule.

Reload. Tab through the page — focus rings on every focusable element (skip-link, focus-demo button, anchors) should appear identical (still 2px solid blue with 2px offset and 1px radius).

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "R-Phase 3: P-11 · Consume --tick in focus outline; document --tile-margin"
```

---

## Task 25: P-12 · Add `.sr-anatomy__usage--inline` modifier; replace inline margin-top styles

**Why:** Repeated `style="margin-top:0"`, `style="margin-top:6px"`, `style="margin-top:8px"` on `.sr-anatomy__usage` (and similar). Soft drift signal — class inviting a CSS hook.

**Files:**
- Modify: `style.css` (add modifier classes)
- Modify: `index.html` (replace inline styles)

- [ ] **Step 1: Locate**

```bash
grep -nE "style=\"margin-top:" index.html
```
Note the distinct values (likely 0, 6px, 8px).

- [ ] **Step 2: Apply**

Add to the anatomy template block in `style.css` (after R-7 it lives just before §3.1 Overlays):

```css
.sr-anatomy__usage--inline { margin-top: 0; }
.sr-anatomy__usage--tight  { margin-top: 6px; }
.sr-anatomy__usage--snug   { margin-top: 8px; }
```

(Names reflect tightening progression: inline → tight → snug. If a modifier doesn't earn its keep semantically, leave the inline style and don't add a class — the audit specifies "or a small set of margin-top modifiers" deliberately.)

In `index.html`, replace each `style="margin-top:0"` with `class="… sr-anatomy__usage sr-anatomy__usage--inline"` (preserving the existing class list). Similarly for the other values.

- [ ] **Step 3: Verify**

```bash
grep -cE "style=\"margin-top:" index.html
```
Expected: 0 (or as close to 0 as the modifier set allows; remaining inline styles are deliberately bespoke and out of scope for the modifier set).

Reload. Visual diff on the anatomy usage lines across §1.x and §2.x — vertical spacing between the anatomy diagram and the usage caption should be unchanged.

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "R-Phase 3: P-12 · Add .sr-anatomy__usage--inline modifiers; remove inline margin-top styles"
```

---

## Task 26: P-13 · `:is()` consolidation in hot selector lists (light touch)

**Why:** `.sr-cell__body .identity, .sr-cell__body .compass, .sr-cell__body .species` repeats the parent three times. `:is()` shortens.

**Files:**
- Modify: `style.css` at L633–641 (pre-R-7)

- [ ] **Step 1: Locate**

```bash
grep -nE "\.sr-cell__body \.identity" style.css
```

- [ ] **Step 2: Apply**

`old_string`:
```css
.sr-cell__body .identity,
.sr-cell__body .compass,
.sr-cell__body .species {
  position: static;
  top: auto; left: auto; right: auto; bottom: auto;
  transform: none;
  opacity: 1;
  animation: none;
}
.sr-cell__body .species { max-width: none; }
```

`new_string`:
```css
.sr-cell__body :is(.identity, .compass, .species) {
  position: static;
  top: auto; left: auto; right: auto; bottom: auto;
  transform: none;
  opacity: 1;
  animation: none;
}
.sr-cell__body .species { max-width: none; }
```

(`:is()` keeps specificity at the level of the highest-specificity selector inside it — here, all three are single class selectors, so total specificity matches the three-selector list. Behavioral equivalence is exact.)

Audit notes: don't chase across the file. Apply only where it shortens; skip if the existing form is already idiomatic.

- [ ] **Step 3: Verify**

Reload. The §2.x cells that render runtime components (identity / compass / species) inside `.sr-cell__body` should appear identical — same in-flow positioning, same opacity/animation reset.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "R-Phase 3: P-13 · :is() consolidation on .sr-cell__body component reset"
```

---

## Task 27: R-Phase 3 CHANGELOG entry

**Why:** Per spec §5.

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Apply**

Insert immediately above the R-Phase 2 entry:

```markdown
## 2026-04-27 — v1 · audit remediation (R-Phase 3, Polish)

R-Phase 3 (Polish) closes <N>/13 polish findings; <13–N> deferred to a future close-out per ship-or-skip discretion. **Comments cluster (P-1..P-5):** specimen-section markers standardized to full banner style; "(was 760, off-by-16 math bug fixed)" parentheticals removed from style.css L17–18 / L21 and the parallel "alectear-feel craft" historical note removed from style.css head + the matching index.html comment; "Print / reduced motion" banner renamed "Reduced motion" (no @media print rules); brittle `style.css:449` line-number reference replaced with a structural pointer. **Naming:** P-7 renamed `.sr-sr-only` → `.sr-visually-hidden` (avoids double-prefix collision with the .sr-only web idiom); P-8 renamed `.sr-principles__principles` → `.sr-principles__list`. **Mobile (P-9 + P-10):** <chosen path: m-prefix accepted-and-documented OR renamed to BEM with descendant chains flattened>. **Misc:** P-6 documented `@media` co-location convention in the file preamble; P-11 consumed `--tick` in the focus-visible outline and clarified `--tile-margin` as doc-only; P-12 added `.sr-anatomy__usage--inline` modifier replacing inline margin-top styles; P-13 consolidated three `.sr-cell__body` selectors via `:is()`.

Spec: `docs/specs/2026-04-27-css-audit-design.md`.
Audit: `docs/audits/2026-04-27-css-audit.md`.
Plan: `docs/plans/2026-04-27-css-audit-remediation.md`.
```

Replace `<N>` with the actual count of executed P-tasks; replace `<chosen path>` with the actual mobile-edition decision; remove any line whose finding was deferred (and add a `Deferred:` line listing them for traceability).

- [ ] **Step 2: Verify**

```bash
head -50 CHANGELOG.md
```
Expected: R-Phase 3 entry first; R-Phase 2 second; R-Phase 1 third; close-out entries follow.

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "R-Phase 3: Log close-out in CHANGELOG.md"
```

---

# Final smoke test

## Task 28: Smoke test — programmatic + browser

**Files:** none modified.

- [ ] **Step 1: Programmatic invariants**

```bash
# No raw alpha literals against locked palette tokens
grep -c "rgba(26, 26, 26," style.css                              # expected 0
grep -c "rgba(22, 53, 238," style.css                              # expected 0
grep -cE "rgba\(242, 238, 229, 0\.(85|92)\)" style.css             # expected 0

# Mono stack consolidated
grep -c 'ui-monospace, "SF Mono"' style.css                        # expected 1 (token)
grep -c "var(--mono-stack)" style.css                              # expected ≥ 38

# !important removed
grep -c "!important" style.css                                     # expected 0

# .sr-section__head removed
grep -c "sr-section__head" style.css index.html                    # expected 0

# Old class names absent
grep -c "sr-sr-only" style.css index.html                          # expected 0
grep -c "sr-principles__principles" style.css index.html           # expected 0
grep -cE "(\.|\s)ind-dot" style.css index.html                     # expected 0
grep -c "overlay--backdrop" style.css index.html                   # expected 0

# @layer architecture present
grep -c "^@layer reset, tokens, runtime, specimen, debug;" style.css  # expected 1

# Single global .dot rule
grep -cE "^\.dot \{ color: var\(--blue\)" style.css                # expected 1

# Specimen vs token alignment (post C-1, C-2)
grep -n "pan-lerp" style.css index.html                            # values agree
grep -n "focus-fade" style.css index.html                          # values agree

# CHANGELOG has all three R-Phase entries
grep -c "audit remediation (R-Phase " CHANGELOG.md                 # expected 3
```

- [ ] **Step 2: Browser smoke**

Reload `http://localhost:8000/`:
- DevTools Console: no errors, no warnings
- Page renders top-to-bottom: 00 Masthead → 1.1 Principles → 1.2 Identity → 1.3 Grid → 1.4 Color → 1.5 Type → 1.6 Spacing → 1.7 Elevation → 1.8 Motion → 2.x components → 3.1 Overlays → 99 Colophon
- Every section's specimen renders unchanged from the Task-0 baseline screenshots
- Tab through the page — skip-link appears first and is keyboard-reachable; focus rings render correctly on every focusable element (now using `var(--tick)` per P-11)
- Open `?grid=on` flag — debug overlay activates; close with `?grid=off`
- Resize below 1336px — single-column fallback activates; below 720px — mobile-edition placeholder renders
- Inspect any specimen using `--charcoal` derived alpha (e.g., `.sr-rule`) in DevTools — computed `background` resolves correctly via `color-mix()`

- [ ] **Step 3: Commit (smoke-test note)**

If everything passes, no further commit needed. If a regression is found, root-cause it (DO NOT mask with `!important`), fix, and commit under the relevant R-Phase. If browser checks are deferred (no browser access at execution time), commit a smoke-test note:

```bash
git commit --allow-empty -m "R-Phase post: Smoke test — programmatic checks pass; browser checks deferred"
```

---

# Definition of done (per spec §5)

- [ ] All 3 Critical findings resolved (or for C-1/C-2: one tension surfaced and decided per Kees, then aligned)
- [ ] All 13 Recommended findings resolved
- [ ] Polish findings: ship-or-skip per discretion; deferred ones noted in CHANGELOG R-Phase 3 entry
- [ ] One CHANGELOG entry per R-Phase executed (3 total expected; R-Phase 3 entry may say "deferred" if no polish work landed)
- [ ] Spec, audit, and this plan all committed
- [ ] No new `!important`s introduced; no new raw alpha literals against locked palette tokens introduced

---

## Plan-execution sequencing summary

```
R-Phase 1  →  Tasks 1–4   →  one CHANGELOG entry      →  Critical (must precede everything)
R-Phase 2  →  Tasks 5–18  →  one CHANGELOG entry      →  R-1 / R-2 / R-7 first; tokens; naming; cleanup
R-Phase 3  →  Tasks 19–27 →  one CHANGELOG entry      →  ship-or-skip
Final      →  Task 28     →  programmatic + browser   →  smoke test
```

Total: 28 tasks. Most are 2–5 minutes; R-1, R-7, and the comments-cluster bundle are 15–30 minutes each.
