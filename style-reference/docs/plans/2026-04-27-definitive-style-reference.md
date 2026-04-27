# Definitive Style Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the truth-pass and extension changes from the design spec to `style-reference/index.html` and `style.css`, turning the working draft into the definitive reference.

**Architecture:** Vanilla HTML/CSS, no build step, no framework. Single CSS file with a hard internal divider separating runtime (above) from specimen (below). Verification is browser-driven: `python -m http.server` from inside `style-reference/`, then visual + DevTools checks for contrast, focus, reduced-motion, and `?grid` debug.

**Tech Stack:** HTML5, vanilla CSS (CSS custom properties, grid, media queries, prefers-reduced-motion). No JS beyond the existing 5-line `?grid` URL flag toggle. Verification via Chrome/Firefox DevTools (Lighthouse / axe for accessibility, computed-style panel for contrast).

**Spec:** `docs/specs/2026-04-27-definitive-style-reference-design.md`

**Phasing:** Tasks 1–22 are Phase 1 (truth pass). Tasks 23–27 are Phase 2 (extension). Phase 1 commits as one logical unit; Phase 2 commits separately.

---

## Files

- **Modify:** `style-reference/style.css` — primary object of change. Tokens, runtime rules, specimen rules.
- **Modify:** `style-reference/index.html` — section landmarks, voice/copy formula additions, rationale renderings, alphas-on-page, focus-visible specimen, Photograph treatment block, colophon expansions.
- **Modify:** `style-reference/CLAUDE.md` — add Versioning section in Phase 2.
- **Create:** `style-reference/CHANGELOG.md` — seeded with 2026-04-27 entry in Phase 2.
- **Untouched:** `style-reference/files/logo.svg`, anything outside `style-reference/`.

## Conventions for this plan

- Every CSS edit shows the exact `old_string` and `new_string` for the `Edit` tool. Line numbers reference the file at plan time; if a previous task has shifted lines, find by `old_string` content.
- Every browser verification step says exactly which URL to hit and what to look for in DevTools.
- Each task ends with a commit. Commit messages follow the workspace convention (imperative subject, blank line, optional body, `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`).
- Server: run `python -m http.server` from inside `style-reference/` once at the start of the implementation; leave it running across tasks. URL: `http://localhost:8000`.

---

## Task 1: Replace stale runtime/specimen comment with divider banner

**Files:**
- Modify: `style-reference/style.css:417–421`

- [ ] **Step 1: Confirm current state**

Open `style-reference/style.css` lines 417–421. Confirm the existing block-comment claims `style.css` is "leading-source" and "mirrored in the root styles.css" — both false relative to the workspace CLAUDE.md.

- [ ] **Step 2: Replace the banner**

Edit `style-reference/style.css`:

```
old_string:
/* ============================================================
   Style Reference — page-specific layout
   (leading-source CSS; the portfolio styles above are mirrored
   in the root styles.css)
   ============================================================ */

new_string:
/* ============================================================
   ============================================================
   END RUNTIME · BEGIN SPECIMEN
   ============================================================
   Above this line: the portfolio runtime — the system being
   documented. The reference page consumes these rules to
   render its own chrome.

   Below this line: the .sr-* specimen — the document showing
   the system. The specimen may consume the runtime; the
   runtime may not reference the specimen. Keep the boundary
   one-way.

   This file is not synced anywhere. The portfolio's styles.css
   is a separate concern in a different workspace.
   ============================================================
   ============================================================ */
```

- [ ] **Step 3: Reload the page**

Browse to `http://localhost:8000`. Verify the page still renders correctly (the change is comment-only; visual output is unchanged).

- [ ] **Step 4: Commit**

```bash
git add style-reference/style.css
git commit -m "Replace stale runtime/specimen comment with divider banner

The 419-421 comment claimed leading-source/mirrored relationship to
the portfolio styles.css; both claims are false relative to the
workspace's own CLAUDE.md. Replace with an explicit one-way
runtime/specimen contract banner.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Promote `--placeholder-band-a/b` tokens; replace six hex uses

**Files:**
- Modify: `style-reference/style.css:26–61` (second `:root` block — token addition)
- Modify: `style-reference/style.css:153–155, 362–364, 853–856` (three `repeating-linear-gradient` call sites)

- [ ] **Step 1: Add tokens to second `:root`**

Edit `style-reference/style.css`:

```
old_string:
  /* Overlay system (3.1) */
  --overlay-edge:    16px;   /* distance from surface edge */
  --overlay-gap:      8px;   /* gap between primitives within a slot */
  --overlay-z:        50;    /* above content, below modals */
}

new_string:
  /* Overlay system (3.1) */
  --overlay-edge:    16px;   /* distance from surface edge */
  --overlay-gap:      8px;   /* gap between primitives within a slot */
  --overlay-z:        50;    /* above content, below modals */

  /* Placeholder bands — photo-loading skeleton fixture, also reused
     as illustrative photo stand-in inside the 3.1 Overlays specimens */
  --placeholder-band-a: #d9d3c5;
  --placeholder-band-b: #cfc7b6;
}
```

- [ ] **Step 2: Replace hex use #1 — `.photo .placeholder` (lines 153–155)**

Edit `style-reference/style.css`:

```
old_string:
  background:
    repeating-linear-gradient(
      0deg,
      var(--ph-band-a, #d9d3c5) 0 14px,
      var(--ph-band-b, #cfc7b6) 14px 28px
    );

new_string:
  background:
    repeating-linear-gradient(
      0deg,
      var(--ph-band-a, var(--placeholder-band-a)) 0 14px,
      var(--ph-band-b, var(--placeholder-band-b)) 14px 28px
    );
```

- [ ] **Step 3: Replace hex use #2 — `.mobile-edition .mcell .mphoto` (lines 362–364)**

Edit `style-reference/style.css`:

```
old_string:
  background:
    repeating-linear-gradient(0deg,
      var(--ph-band-a, #d9d3c5) 0 14px,
      var(--ph-band-b, #cfc7b6) 14px 28px);

new_string:
  background:
    repeating-linear-gradient(0deg,
      var(--ph-band-a, var(--placeholder-band-a)) 0 14px,
      var(--ph-band-b, var(--placeholder-band-b)) 14px 28px);
```

- [ ] **Step 4: Replace hex use #3 — `.sr-motion__photo` (lines 853–856)**

Edit `style-reference/style.css`:

```
old_string:
  background: repeating-linear-gradient(
    0deg,
    #d9d3c5 0 8px,
    #cfc7b6 8px 16px
  );

new_string:
  background: repeating-linear-gradient(
    0deg,
    var(--placeholder-band-a) 0 8px,
    var(--placeholder-band-b) 8px 16px
  );
```

- [ ] **Step 5: Verify**

Browse to `http://localhost:8000`. Sections affected: 1.8 Motion (the photo-decode demo chip), 2.4 Photo cell (default + focused states), 2.6 Mobile cell. The bands should render visually identical to before.

Grep check:

```bash
grep -nE '#d9d3c5|#cfc7b6' style-reference/style.css
```

Expected: no matches (all six hexes replaced).

- [ ] **Step 6: Commit**

```bash
git add style-reference/style.css
git commit -m "Promote placeholder-band tokens

Add --placeholder-band-a (#d9d3c5) and --placeholder-band-b (#cfc7b6)
to the second :root block. Replace six raw hex occurrences across
.photo .placeholder, .mobile-edition .mphoto, and .sr-motion__photo.
The bands are a brand fixture (the photo-loading skeleton); naming
them earns its keep, especially with the 3.1 gradient replacements
landing next.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Delete drift — `.sr-cell--12` and `#f0eadf`

**Files:**
- Modify: `style-reference/style.css:522–523` (delete legacy alias)
- Modify: `style-reference/style.css:924–927` (replace `#f0eadf` with `var(--field)`)

- [ ] **Step 1: Confirm `.sr-cell--12` is unused**

```bash
grep -rn "sr-cell--12" style-reference/
```

Expected: only one match — the rule definition at `style.css:523`. No usage in `index.html`.

- [ ] **Step 2: Delete `.sr-cell--12`**

Edit `style-reference/style.css`:

```
old_string:
/* Backwards-compat alias: legacy .sr-cell--12 from the 12-col system → full width */
.sr-cell--12 { grid-column: span 9; }

new_string:
```

(Replace with empty string — line collapses.)

- [ ] **Step 3: Replace `#f0eadf` near-field with `var(--field)`**

Edit `style-reference/style.css`:

```
old_string:
.sr-elevation__stack li:last-child {
  background: var(--blue);
  color: #f0eadf;
}

new_string:
.sr-elevation__stack li:last-child {
  background: var(--blue);
  color: var(--field);
}
```

- [ ] **Step 4: Verify**

Browse to `http://localhost:8000` and scroll to 1.7 Elevation. The "Above — focus overlays / labels" item is the topmost of the three stacked boxes, with the blue background. Verify the text is readable cream-on-blue (the visual difference between `#f0eadf` and `#F2EEE5` is below the threshold of intent — should look identical).

- [ ] **Step 5: Commit**

```bash
git add style-reference/style.css
git commit -m "Delete .sr-cell--12 alias; replace #f0eadf with var(--field)

The .sr-cell--12 rule was a 12-col system carryover; grep confirms
zero usages anywhere. The #f0eadf in .sr-elevation__stack last-child
was a one-off color visually indistinguishable from --field; promote
to the token to remove drift.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Add inline rationale comments to canonical tokens

**Files:**
- Modify: `style-reference/style.css:13–24` (first `:root` block — grid)
- Modify: `style-reference/style.css:26–61` (second `:root` block — color, type, motion, ambient, overlay)

These are inline code comments (the `*on the page*` rationale rendering happens in Task 16). Tokens whose rationale is inferred get an `[edit: Kees]` marker so the user-review pass catches them.

- [ ] **Step 1: Annotate the grid `:root`**

Edit `style-reference/style.css`:

```
old_string:
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

new_string:
:root {
  /* Grid — the photo-plane tessellation V4. u=120, g=24, 9 cols × 5 rows
     hold an integer count of 3:2 photographs at the brand's intended
     scale. Tile is 1320 × 744; 744 = 5·u + 6·g (was 760, off-by-16
     math bug fixed). All other spacing on the page derives from these. */
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

- [ ] **Step 2: Annotate the second `:root` (color + type + motion + ambient)**

Edit `style-reference/style.css`:

```
old_string:
:root {
  --field:         #F2EEE5;
  --blue:          #1635EE;
  --charcoal:      #1A1A1A;
  --field-overlay: rgba(242, 238, 229, 0.95);
  --blue-soft:     rgba(22, 53, 238, 0.6);

  /* Type sizes */
  --wm-size-d:    0.95rem;
  --wm-size-m:    0.86rem;
  --label-size-d: 0.92rem;
  --label-size-m: 0.78rem;
  --meta-size-d:  0.74rem;
  --meta-size-m:  0.62rem;

  /* Motion */
  --pan-lerp:        0.08;
  --focus-fade:      360ms;
  --focus-easing:    cubic-bezier(0.22, 0.61, 0.36, 1);
  --label-in:        200ms;
  --label-out:       150ms;
  --photo-decode:    200ms;

  /* Substitute for ABC Diatype */
  --font-stack: 'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif;

  /* Tweakable */
  --ambient-opacity: 0.55;
  --ambient-saturate: 0.65;
  --ambient-brightness: 0.92;

new_string:
:root {
  /* Palette — three colors, locked. --field is uncoated-paper cream
     (Steidl monograph stock, not a screen background). --blue is
     Munich '72 lineage: high-saturation structural blue. --charcoal
     is quiet ink (photographic neutral, not pure black) so type sits
     at the same density as photographic shadows. */
  --field:         #F2EEE5;
  --blue:          #1635EE;
  --charcoal:      #1A1A1A;
  --field-overlay: rgba(242, 238, 229, 0.95);
  --blue-soft:     rgba(22, 53, 238, 0.6);

  /* Type sizes — display roles named in 1.5 Typography on the page */
  --wm-size-d:    0.95rem;
  --wm-size-m:    0.86rem;
  --label-size-d: 0.92rem;
  --label-size-m: 0.78rem;
  --meta-size-d:  0.74rem;
  --meta-size-m:  0.62rem;

  /* Motion — fast start, gentle settle: the photograph emerges before
     the chrome resolves. --pan-lerp tuned empirically: low enough to
     feel weighty, high enough not to lag the user's intent.
     [edit: Kees] confirm 360ms / 0.08 are the right values, not 320/0.1. */
  --pan-lerp:        0.08;
  --focus-fade:      360ms;
  --focus-easing:    cubic-bezier(0.22, 0.61, 0.36, 1);
  --label-in:        200ms;
  --label-out:       150ms;
  --photo-decode:    200ms;

  /* Substitute for ABC Diatype */
  --font-stack: 'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif;

  /* Photograph treatment — non-focused photos recede in attention but
     do not disappear: the photograph in focus is the subject; everything
     else is evidence. Rendered as a specimen in 1.4 Color (Phase 2). */
  --ambient-opacity: 0.55;
  --ambient-saturate: 0.65;
  --ambient-brightness: 0.92;
```

- [ ] **Step 3: Verify file compiles**

Browse to `http://localhost:8000`. Visual output unchanged (all changes are comments). Confirm no console errors.

- [ ] **Step 4: Commit**

```bash
git add style-reference/style.css
git commit -m "Annotate canonical tokens with inline rationale

Add inline comments to the two :root blocks naming the why behind
each canonical token. Munich '72 lineage on --blue, Steidl stock on
--field, photographic neutral on --charcoal, photo-emerges-first on
the motion ladder, subject-vs-evidence on the ambient ladder. The
[edit: Kees] markers flag values where the rationale is inferred and
needs the user-review pass to confirm.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Remove red `#d72b2b` indicator; redraw with on-palette parts

**Files:**
- Modify: `style-reference/style.css:1317–1326` (`.sr-overlay-primitive__sample .ind-dot`)
- Modify: `style-reference/style.css:1377–1383` (`.sr-overlay-applied__layer--bl .live`)
- Modify: `style-reference/index.html:631–633` (indicator primitive sample)
- Modify: `style-reference/index.html:648–650` (applied-overlay bl slot)

The "live" semantic is removed entirely. The indicator primitive is renamed to a brand-meaningful state (`recording` — light/time-code adjacent, on-palette).

- [ ] **Step 1: Replace `.ind-dot` styles with on-palette dot**

Edit `style-reference/style.css`:

```
old_string:
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

new_string:
.sr-overlay-primitive__sample .ind-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--blue);
  margin-right: 6px;
  vertical-align: middle;
}
```

(Box-shadow glow removed — it was part of the alarm semantic the brand is rejecting.)

- [ ] **Step 2: Replace `.sr-overlay-applied__layer--bl .live` with on-palette dot**

Edit `style-reference/style.css`:

```
old_string:
.sr-overlay-applied__layer--bl .live {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #d72b2b;
  box-shadow: 0 0 6px rgba(215, 43, 43, 0.7);
}

new_string:
.sr-overlay-applied__layer--bl .live {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--blue);
}
```

- [ ] **Step 3: Update the indicator primitive in `index.html` — rename "live" to "banded"**

The `live` semantic is replaced with `banded` (a domain-language word the brand already uses in time-codes — `banded 06:12`). Edit `style-reference/index.html`:

```
old_string:
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">indicator</span>
            <span class="sr-overlay-primitive__sample" style="font-family:ui-monospace,monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase;"><span class="ind-dot"></span>live</span>
          </div>

new_string:
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">indicator</span>
            <span class="sr-overlay-primitive__sample" style="font-family:ui-monospace,monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase;"><span class="ind-dot"></span>banded</span>
          </div>
```

- [ ] **Step 4: Update the applied-overlay bl slot in `index.html`**

Edit `style-reference/index.html`:

```
old_string:
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--bl">
              <span class="live"></span>live · banded 06:12
            </div>

new_string:
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--bl">
              <span class="live"></span>banded 06:12
            </div>
```

(The `.live` class name is kept on the dot span — renaming the class is bigger blast radius for no semantic gain. The displayed text loses "live ·".)

- [ ] **Step 5: Verify**

Browse to `http://localhost:8000` and scroll to 3.1 Overlays. The indicator primitive now shows a blue dot followed by "BANDED" in mono caps. The applied-overlay's bottom-left now shows a blue dot followed by "BANDED 06:12". No red anywhere on the page.

Grep check:

```bash
grep -nE '#d72b2b|d72b2b|>live<' style-reference/
```

Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add style-reference/style.css style-reference/index.html
git commit -m "Remove red live indicator; redraw with on-palette banded marker

The red #d72b2b was the only out-of-palette color in the system and
the only SaaS-aesthetic reflex left in the document — a quiet
photographic brand has nowhere to put a blinking red dot. Replace
with --blue and rename the semantic from 'live' to 'banded' (a
domain-language word the brand already uses in time-codes).

The brief flagged this as a brand decision; locked at C in the
brainstorm.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Replace 3.1 illustrative gradients with placeholder-band fixtures

**Files:**
- Modify: `style-reference/style.css:1258–1265` (`.sr-overlay-diagram` background)
- Modify: `style-reference/style.css:1271–1276` (`.sr-overlay-slot` text color — adjust for new bg)
- Modify: `style-reference/style.css:1286–1296` (`.sr-overlay-center` text color)
- Modify: `style-reference/style.css:1328–1342` (`.sr-overlay-applied` background + radial highlight)
- Modify: `style-reference/style.css:1343–1349` (`.sr-overlay-applied__layer` text color — adjust)

The two surfaces use different band-color pairs to carry cool/warm tonal contrast. The slot diagram uses the system's default (cool-cream) bands. The applied example uses a darker, warmer band pair to demonstrate overlays over a dark photograph.

- [ ] **Step 1: Replace the slot diagram background**

Edit `style-reference/style.css`:

```
old_string:
.sr-overlay-diagram {
  position: relative;
  aspect-ratio: 3 / 2;
  background: linear-gradient(135deg, #1a3a5a 0%, #2a5a7a 35%, #5a9ab0 70%, #c8d4a0 100%);
  border: 1px solid var(--blue-soft);
  border-radius: 1px;
  overflow: hidden;
}

new_string:
.sr-overlay-diagram {
  position: relative;
  aspect-ratio: 3 / 2;
  /* Cool-toned placeholder bands — stand-in for an over-water photograph */
  background: repeating-linear-gradient(
    0deg,
    var(--placeholder-band-a) 0 14px,
    var(--placeholder-band-b) 14px 28px
  );
  border: 1px solid var(--blue-soft);
  border-radius: 1px;
  overflow: hidden;
}
```

- [ ] **Step 2: Adjust slot label colors for the new (lighter) bg**

The cool-cream band is much lighter than the previous gradient; white-on-band fails. Slot labels become charcoal. Edit `style-reference/style.css`:

```
old_string:
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

new_string:
.sr-overlay-slot {
  position: absolute;
  padding: 4px 8px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--charcoal);
  background: var(--field-overlay);
  border: 1px dashed var(--blue-soft);
  border-radius: 1px;
}
```

- [ ] **Step 3: Adjust slot-center caption for the new bg**

Edit `style-reference/style.css`:

```
old_string:
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

new_string:
.sr-overlay-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.45);
}
```

- [ ] **Step 4: Replace the applied-example background with a darker warm band pair**

The applied example needs to remain a dark surface so the white-text-with-shadow rule (the system's default for overlays over photographs) is demonstrable. Use darker, warmer band colors as a local override (these are illustrative — *not* promoted to tokens, since they're specific to this one demo).

Edit `style-reference/style.css`:

```
old_string:
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

new_string:
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
  border-radius: 1px;
  overflow: hidden;
  z-index: 0;
}
```

(The `::after` radial highlight is removed — the band pattern provides enough texture; the radial added a third color outside the system.)

- [ ] **Step 5: Verify the applied-overlay text still passes contrast over the new dark band**

Browse to `http://localhost:8000` and scroll to 3.1 Overlays "applied example." The three white text layers (top-left identity, bottom-left banded marker, bottom-right coords/gear) should remain legible on the warm-dark band background. The text-shadow rule (`0 1px 2px rgba(0,0,0,0.4)`) is unchanged at `style.css:1347`.

DevTools: inspect `.sr-overlay-applied__layer--tl`. Confirm color `#fff` over the band-pattern background. The bands at `#4a3520` / `#3a2a18` are dark enough for white-with-text-shadow to be legible.

- [ ] **Step 6: Verify the slot diagram still reads**

Scroll to 3.1 Overlays "slot diagram." All eight slot labels (`tl tc tr ml mr bl bc br`) should be visible as charcoal-on-cream-band text inside dashed-blue boxes. The "— content —" caption should be visible in the center.

- [ ] **Step 7: Commit**

```bash
git add style-reference/style.css
git commit -m "Replace 3.1 gradient stand-ins with placeholder-band fixtures

Both 3.1 specimens used literal pseudo-photograph gradients to imply
photographs sat behind the overlays. For a photographer's brand
reference, that's the awkward middle. Replace with the system's
existing repeating-linear-gradient placeholder pattern.

The slot diagram uses --placeholder-band-a/b (cool cream — the
system default). The applied example uses local warm-dark band
hexes (#4a3520 / #3a2a18) since a dark surface is needed to
demonstrate the white-text-shadow overlay rule. Slot labels and
center caption switch to charcoal-on-cream for the lighter slot
diagram. Radial highlight removed (third color outside the system).

Locked at B in the brainstorm.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Bump charcoal-alpha text values to pass WCAG AA

**Files:**
- Modify: `style-reference/style.css:530` (`.sr-cell__label`)
- Modify: `style-reference/style.css:594` (`.sr-section__stats`)
- Modify: `style-reference/style.css:1241` (`.sr-anatomy__usage` opacity)
- Modify: `style-reference/style.css:967` (`.sr-token__k`)
- Modify: `style-reference/style.css:163` (`.photo .placeholder::after`)
- Modify: `style-reference/style.css:353` (`.mobile-edition .mobile-note`)
- Modify: `style-reference/style.css:384` (`.mobile-edition .mcell .mphoto span`)
- Modify: `style-reference/style.css:722` (`.sr-type__label`)
- Modify: `style-reference/style.css:736` (`.sr-type__sample--mono`)
- Modify: `style-reference/style.css:787` (`.sr-ruler__caption .sr-ruler__note`)
- Modify: `style-reference/style.css:802` (`.sr-motion__caption`)

The math: charcoal `rgba(26,26,26,α)` on field `#F2EEE5` reaches WCAG AA (4.5:1) at α ≥ ~0.62. Bump 0.5 and 0.55 values to 0.65; bump anything-on-tint-bg cases to 0.7 for safety margin.

- [ ] **Step 1: Bump `.sr-cell__label` from 0.5 → 0.65**

Edit `style-reference/style.css`:

```
old_string:
.sr-cell__label {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.5);
}

new_string:
.sr-cell__label {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.65);
}
```

- [ ] **Step 2: Bump `.sr-section__stats` from 0.55 → 0.65**

Edit `style-reference/style.css`:

```
old_string:
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

new_string:
.sr-section__stats {
  grid-column: 9 / span 1;
  align-self: start;
  text-align: right;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(26, 26, 26, 0.65);
  text-transform: uppercase;
  line-height: 1.5;
}
```

- [ ] **Step 3: Bump `.sr-anatomy__usage` opacity from 0.55 → 0.7**

Edit `style-reference/style.css`:

```
old_string:
.sr-anatomy__usage {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 400;
  color: var(--charcoal);
  opacity: 0.55;
  line-height: 1.5;
  font-style: normal;
}

new_string:
.sr-anatomy__usage {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 400;
  color: var(--charcoal);
  opacity: 0.7;
  line-height: 1.5;
  font-style: normal;
}
```

(0.7 chosen because usage is body-text-adjacent at 12px and benefits from extra contrast headroom.)

- [ ] **Step 4: Bump `.sr-token__k` from 0.55 → 0.7**

Edit `style-reference/style.css`:

```
old_string:
.sr-token__k {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(26, 26, 26, 0.55);
  text-transform: uppercase;
}

new_string:
.sr-token__k {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(26, 26, 26, 0.7);
  text-transform: uppercase;
}
```

(0.7 chosen because the token-key sits over a 0.04 charcoal-on-field bg fill; the slightly muddier background needs more headroom.)

- [ ] **Step 5: Bump remaining 0.5 charcoal-on-field text values to 0.65**

Edit `style-reference/style.css` — five more sites:

```
old_string:
.photo .placeholder::after {
  content: attr(data-label);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(26, 26, 26, 0.5);

new_string:
.photo .placeholder::after {
  content: attr(data-label);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(26, 26, 26, 0.65);
```

```
old_string:
.mobile-edition .mobile-note {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: rgba(26, 26, 26, 0.5);

new_string:
.mobile-edition .mobile-note {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: rgba(26, 26, 26, 0.65);
```

```
old_string:
.mobile-edition .mcell .mphoto span {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(26, 26, 26, 0.5);

new_string:
.mobile-edition .mcell .mphoto span {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(26, 26, 26, 0.65);
```

```
old_string:
.sr-type__label {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.5);
  margin-bottom: 6px;
}

new_string:
.sr-type__label {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.65);
  margin-bottom: 6px;
}
```

```
old_string:
.sr-type__sample--mono   { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.06em; color: rgba(26,26,26,0.5); text-transform: uppercase; }

new_string:
.sr-type__sample--mono   { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.06em; color: rgba(26,26,26,0.65); text-transform: uppercase; }
```

```
old_string:
.sr-ruler__caption .sr-ruler__note {
  color: rgba(26, 26, 26, 0.5);
  margin-left: 8px;
}

new_string:
.sr-ruler__caption .sr-ruler__note {
  color: rgba(26, 26, 26, 0.65);
  margin-left: 8px;
}
```

```
old_string:
.sr-motion__caption {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.5);
  line-height: 1.5;
}

new_string:
.sr-motion__caption {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.65);
  line-height: 1.5;
}
```

- [ ] **Step 6: Verify with DevTools**

Browse to `http://localhost:8000`. Open DevTools → Elements panel. Inspect `.sr-section__stats` (any section). The Computed Styles panel shows the color and contrast badge. Confirm the badge reads "AA" or higher (Chrome shows it in the color picker: target ≥ 4.5:1 for normal text).

Repeat for `.sr-cell__label`, `.sr-anatomy__usage`, `.sr-token__k`. All should clear AA.

- [ ] **Step 7: Commit**

```bash
git add style-reference/style.css
git commit -m "Bump charcoal-alpha text values to clear WCAG AA

Eleven selectors had charcoal text at alpha 0.5 or 0.55, computing
to ~3.0–3.5:1 contrast against --field at the 10–12px sizes they
render — fails AA for normal text. Bump body-text roles to 0.65
(clears 4.5:1) and bg-overlapping roles (sr-anatomy__usage,
sr-token__k) to 0.7 for headroom over the 0.04 fill. The visual
shift is small; the contrast headroom is real.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Resolve `--blue-soft` text use (default C1 — move text uses to `--blue`)

**Files:**
- Modify: `style-reference/style.css:289` (`.species .meta`)
- Modify: `style-reference/style.css:307` (`.compass`)
- Modify: `style-reference/style.css:399` (`.mobile-edition .mcell .mmeta`)
- Modify: `style-reference/style.css:734–735` (`.sr-type__sample--meta-d/m`)
- Modify: `style-reference/style.css:1009` (`.sr-grid-anatomy__caption`)
- Modify: `style-reference/style.css:1056` (`body.show-grid::after` — debug-overlay legend)

**Decision:** If Kees has stated otherwise in the user-review pass on the spec, override the default. Otherwise apply C1 below.

C1: Keep `--blue-soft` for non-text roles (dashed borders in 1.2 Identity, the `.sr-rule` divider, section-stats `<b>` is unaffected — already full `--blue`). Move text uses to full `--blue`.

- [ ] **Step 1: Move `.species .meta` from `--blue-soft` to `--blue`**

Edit `style-reference/style.css`:

```
old_string:
.species .meta {
  margin-top: 6px;
  font-size: var(--meta-size-d);
  color: var(--blue-soft);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

new_string:
.species .meta {
  margin-top: 6px;
  font-size: var(--meta-size-d);
  color: var(--blue);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

- [ ] **Step 2: Move `.compass` from `--blue-soft` to `--blue`**

Edit `style-reference/style.css`:

```
old_string:
.compass {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 10;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue-soft);
  text-align: right;
  line-height: 1.5;
  opacity: 0;
  animation: fadeIn 200ms ease-out 280ms forwards;
}

new_string:
.compass {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 10;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue);
  text-align: right;
  line-height: 1.5;
  opacity: 0;
  animation: fadeIn 200ms ease-out 280ms forwards;
}
```

- [ ] **Step 3: Move `.mobile-edition .mcell .mmeta` from `--blue-soft` to `--blue`**

Edit `style-reference/style.css`:

```
old_string:
.mobile-edition .mcell .mmeta {
  margin-top: 4px;
  font-size: var(--meta-size-m);
  color: var(--blue-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}

new_string:
.mobile-edition .mcell .mmeta {
  margin-top: 4px;
  font-size: var(--meta-size-m);
  color: var(--blue);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}
```

- [ ] **Step 4: Move type samples from `--blue-soft` to `--blue`**

Edit `style-reference/style.css`:

```
old_string:
.sr-type__sample--meta-d { font-size: var(--meta-size-d); color: var(--blue-soft); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
.sr-type__sample--meta-m { font-size: var(--meta-size-m); color: var(--blue-soft); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }

new_string:
.sr-type__sample--meta-d { font-size: var(--meta-size-d); color: var(--blue); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
.sr-type__sample--meta-m { font-size: var(--meta-size-m); color: var(--blue); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
```

- [ ] **Step 5: Move grid-anatomy caption and `?grid` legend to `--blue`**

These already use full `--blue` (lines 1009, 1056). Confirm by inspection — no edit needed if already `var(--blue)`.

```bash
grep -n "color: var(--blue)" style-reference/style.css
```

If the grid-anatomy caption (line ~1009) and the `body.show-grid::after` legend (line ~1056) already use `--blue`, this step is a no-op. They were already on the strong color.

- [ ] **Step 6: Verify**

Browse to `http://localhost:8000`. Visual check: the meta line in 2.2 Species label specimen ("Photo 1 / 8") now reads in full `--blue` rather than the soft variant. Same in 1.5 Typography meta samples and 2.3 Compass instruction. Section-stats `<b>` highlights are unchanged.

DevTools: inspect `.species .meta` text — confirm computed color is `rgb(22, 53, 238)` and contrast ratio against `#F2EEE5` is ~6.5:1 (clears AA AAA easily).

The `--blue-soft` token is still alive and used for:
- `.sr-group` border-bottom (line 462)
- `.sr-anatomy__legend` border-top dashed (line 1222)
- `.sr-overlay-primitive` border (line 1303)
- `.sr-overlay-diagram` border (line 1262)
- `.sr-overlay-slot` border (post-Task 6)
- `.sr-identity-clearspace` border (line 1141)

These are all surface roles (borders, rules, dashed lines) — no text contrast concern.

- [ ] **Step 7: Commit**

```bash
git add style-reference/style.css
git commit -m "Move --blue-soft text uses to --blue (C1 default)

Math says alpha-bump alone can't reach AA at meta sizes (12px, 11px):
--blue-soft at 0.6 hits ~3.05:1; bumping to 0.75 only reaches ~4.2:1;
~0.83+ is needed to pass and at that point it's visually --blue
anyway. Cleanest fix is moving text roles to full --blue and keeping
--blue-soft for surfaces (dashed borders, rules, soft separators).

Affected text roles: .species .meta, .compass, .mobile-edition .mmeta,
.sr-type__sample--meta-d/m. Section-stats <b> already used full --blue.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Add `aria-labelledby` to all `<section>` elements

**Files:**
- Modify: `style-reference/index.html` — every `<section>` opening tag and the corresponding section-id `<span>` and heading

The pattern: each section gets `aria-labelledby="sr-{id}"`; the heading inside (currently the `.sr-section__title <h2>`) carries `id="sr-{id}"`. The `.sr-section__id <span>` is decorative and doesn't need an id, but for the masthead's `<h1>` we use `id="sr-00"` on the title element.

There are 13 sections in `index.html`: masthead (00), 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 99.

Wait — counting: masthead (1) + 1.1–1.8 (8) + 2.1–2.6 (6) + 3.1 (1) + 99 (1) = **17 sections**.

- [ ] **Step 1: Edit each `<section>` opening to add `aria-labelledby`**

For each `<section class="sr-section ...">`, add `aria-labelledby="sr-{id}"` and add `id="sr-{id}"` to the heading inside (`<h1>` for masthead, `<h2>` elsewhere).

Section list with target IDs:

| Section class | aria-labelledby | id on heading |
| --- | --- | --- |
| `sr-masthead` | `sr-00` | `sr-00` (on `<h1>`) |
| `sr-principles` | `sr-1-1` | `sr-1-1` |
| `sr-identity` | `sr-1-2` | `sr-1-2` |
| `sr-grid-ruleset` | `sr-1-3` | `sr-1-3` |
| `sr-color` | `sr-1-4` | `sr-1-4` |
| `sr-typography` | `sr-1-5` | `sr-1-5` |
| `sr-spacing` | `sr-1-6` | `sr-1-6` |
| `sr-elevation` | `sr-1-7` | `sr-1-7` |
| `sr-motion` | `sr-1-8` | `sr-1-8` |
| `sr-component--wordmark` | `sr-2-1` | `sr-2-1` |
| `sr-component--species` | `sr-2-2` | `sr-2-2` |
| `sr-component--compass` | `sr-2-3` | `sr-2-3` |
| `sr-component--photo` | `sr-2-4` | `sr-2-4` |
| `sr-component--brand` | `sr-2-5` | `sr-2-5` |
| `sr-component--mobile` | `sr-2-6` | `sr-2-6` |
| `sr-pattern--overlays` | `sr-3-1` | `sr-3-1` |
| `sr-colophon` | `sr-99` | `sr-99` |

Process these one at a time. For each section, two edits: the `<section>` opener and the heading.

Example for the masthead (line 13–15):

```
old_string:
    <section class="sr-section sr-masthead">
      <span class="sr-section__id">00</span>
      <h2 class="sr-section__title">Masthead</h2>

new_string:
    <section class="sr-section sr-masthead" aria-labelledby="sr-00">
      <span class="sr-section__id">00</span>
      <h1 id="sr-00" class="sr-section__title sr-masthead__title-display">Style Reference</h1>
```

Wait — the masthead is a special case: it carries TWO headings. The current `<h2>Masthead</h2>` at line 15 and the `<h1>Style Reference</h1>` at line 27. Per the styleguide-revision spec, the `<h1>` is the page title; the `<h2>` is the section header. The masthead section's accessible label should be "Masthead" (the section header), not "Style Reference" (the page title).

Revise: keep the `<h2>Masthead</h2>` carrying `id="sr-00"`. The `<h1>Style Reference</h1>` is the page title — it already carries semantic weight as the document's `<h1>`; no id needed on it for the masthead's section label.

For the masthead specifically:

```
old_string:
    <section class="sr-section sr-masthead">
      <span class="sr-section__id">00</span>
      <h2 class="sr-section__title">Masthead</h2>

new_string:
    <section class="sr-section sr-masthead" aria-labelledby="sr-00">
      <span class="sr-section__id">00</span>
      <h2 id="sr-00" class="sr-section__title">Masthead</h2>
```

For each remaining section, follow the pattern: add `aria-labelledby="sr-{N-M}"` to `<section>`, add `id="sr-{N-M}"` to the `<h2>`.

Example for 1.1 Principles:

```
old_string:
    <section class="sr-section sr-principles">
      <span class="sr-section__id">1.1</span>
      <h2 class="sr-section__title">Principles</h2>

new_string:
    <section class="sr-section sr-principles" aria-labelledby="sr-1-1">
      <span class="sr-section__id">1.1</span>
      <h2 id="sr-1-1" class="sr-section__title">Principles</h2>
```

Repeat the pattern for sections 1.2 through 99. **Be careful with the ID formatting:** dots don't validate cleanly in HTML id attributes when used in JS selectors; hyphens are safer (`sr-1-1` not `sr-1.1`).

- [ ] **Step 2: Verify with DevTools**

Browse to `http://localhost:8000`. Open DevTools → Elements. Inspect any `<section class="sr-section …">`. The Accessibility tab (in Chrome: Elements → Accessibility) should show "Name: {section title}" derived from `aria-labelledby`. Repeat for two random sections.

Use the axe DevTools extension or Lighthouse Accessibility audit: should report no `aria-labelledby` violations and no missing-landmark violations.

- [ ] **Step 3: Commit**

```bash
git add style-reference/index.html
git commit -m "Add aria-labelledby to all sections

Each <section.sr-section> now carries aria-labelledby pointing to
the heading inside (h2 with matching id). Pattern: sr-{id} where
id is hyphen-separated (sr-1-1, sr-2-4, sr-3-1) to avoid CSS-selector
issues with dots. Seventeen sections total — masthead (sr-00),
1.1–1.8 (Foundations), 2.1–2.6 (Components), 3.1 (Patterns),
99 (Colophon).

The masthead's <h1>Style Reference</h1> remains the document's
sole h1; the section's accessible label is the <h2>Masthead</h2>.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Extend `prefers-reduced-motion` to `.identity` and `.compass`

**Files:**
- Modify: `style-reference/style.css:413–415` (existing reduced-motion rule)

Both `.identity` (line 244) and `.compass` (line 311) use `animation: fadeIn 200ms ease-out … forwards`. The current reduced-motion rule covers transitions on `.photo` and `.species` but doesn't disable these two `fadeIn` animations.

- [ ] **Step 1: Extend the reduced-motion media query**

Edit `style-reference/style.css`:

```
old_string:
@media (prefers-reduced-motion: reduce) {
  .photo, .species { transition-duration: 0ms; }
}

new_string:
@media (prefers-reduced-motion: reduce) {
  .photo, .species { transition-duration: 0ms; }
  .identity, .compass { animation: none; opacity: 1; }
}
```

(Setting `opacity: 1` ensures the elements are visible immediately when the fade-in is disabled — without this, they'd remain at the keyframe's start opacity of 0.)

- [ ] **Step 2: Verify in browser**

In Chrome DevTools: open Rendering tab (three-dot menu → More tools → Rendering). Set "Emulate CSS media feature prefers-reduced-motion" to "reduce." Reload `http://localhost:8000`.

The page itself doesn't render `.identity` and `.compass` (those are runtime selectors, not specimen — they're position:fixed in the runtime, but inside `.sr-cell__body` overrides reset position to static and animation:none, line 542-550). So this change doesn't visually affect the specimen page; it only affects future runtime rendering. Confirm no console errors.

- [ ] **Step 3: Commit**

```bash
git add style-reference/style.css
git commit -m "Extend prefers-reduced-motion to .identity and .compass

Both selectors use animation: fadeIn ... forwards which the existing
reduced-motion rule didn't cover (it disabled transitions, not
keyframe animations). Add animation: none + opacity: 1 to make them
appear immediately for users with the preference set.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Add `:focus-visible` specimen to 1.7 Elevation

**Files:**
- Modify: `style-reference/style.css` — add `:focus-visible` rule and a small specimen-only `.sr-focus-demo` selector
- Modify: `style-reference/index.html:294–312` (1.7 Elevation section — add a Focus block)

The runtime's pannable plane advertises "Drag · arrow keys" but no `:focus-visible` style is documented. Add the rule and render an example focusable element on the page.

- [ ] **Step 1: Add the runtime `:focus-visible` rule near the bottom of the runtime block**

Edit `style-reference/style.css` — add the rule just before the runtime/specimen divider banner (so it sits with the runtime):

```
old_string:
@media (prefers-reduced-motion: reduce) {
  .photo, .species { transition-duration: 0ms; }
  .identity, .compass { animation: none; opacity: 1; }
}

/* ============================================================

new_string:
@media (prefers-reduced-motion: reduce) {
  .photo, .species { transition-duration: 0ms; }
  .identity, .compass { animation: none; opacity: 1; }
}

/* ============================================================
   Focus — keyboard-visible focus rings throughout the runtime
   2px solid --blue, 2px offset, 1px corner radius (matches the system).
   ============================================================ */
:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
  border-radius: 1px;
}
:focus:not(:focus-visible) {
  outline: none;
}

/* ============================================================
```

- [ ] **Step 2: Add a specimen demo selector below the runtime/specimen divider**

Edit `style-reference/style.css` — add to the specimen section, near the elevation styles (around line 906, after `.sr-elevation__body`):

```
old_string:
.sr-elevation__body {
  font-size: 16px;
  line-height: 1.5;
  color: var(--charcoal);
  max-width: 60ch;
  margin: 0;
  align-self: start;
}

new_string:
.sr-elevation__body {
  font-size: 16px;
  line-height: 1.5;
  color: var(--charcoal);
  max-width: 60ch;
  margin: 0;
  align-self: start;
}
.sr-focus-demo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--charcoal);
  background: rgba(26, 26, 26, 0.04);
  border: 0;
  border-radius: 1px;
  cursor: pointer;
}
.sr-focus-demo:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}
```

- [ ] **Step 3: Add the Focus block to 1.7 Elevation in `index.html`**

Edit `style-reference/index.html`. The current Elevation section (lines 294–312) has body + stack + spacer cells. Add a fourth cell with the focus demo after the spacer:

```
old_string:
      <p class="sr-cell sr-cell--5 sr-cell--r2 sr-elevation__body">This static grid is designed to be composed above a dynamic pannable background. Future portfolio surfaces stack from a pannable photo plane below, through this static UI grid, to focus overlays and labels on top.</p>
      <ol class="sr-cell sr-cell--3 sr-cell--r2 sr-elevation__stack">
        <li>Above &mdash; focus overlays / labels</li>
        <li>Foreground &mdash; static UI grid (this)</li>
        <li>Background &mdash; pannable photo plane</li>
      </ol>
      <div class="sr-cell sr-cell--1"></div><!-- spacer -->

new_string:
      <p class="sr-cell sr-cell--5 sr-cell--r2 sr-elevation__body">This static grid is designed to be composed above a dynamic pannable background. Future portfolio surfaces stack from a pannable photo plane below, through this static UI grid, to focus overlays and labels on top.</p>
      <ol class="sr-cell sr-cell--3 sr-cell--r2 sr-elevation__stack">
        <li>Above &mdash; focus overlays / labels</li>
        <li>Foreground &mdash; static UI grid (this)</li>
        <li>Background &mdash; pannable photo plane</li>
      </ol>
      <div class="sr-cell sr-cell--1"></div><!-- spacer -->

      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">FOCUS — KEYBOARD-VISIBLE</span>
        <div class="sr-cell__body">
          <button type="button" class="sr-focus-demo">Tab to focus<span class="dot" style="color:var(--blue)">.</span></button>
          <p class="sr-anatomy__usage" style="margin-top:10px">2px solid <code>var(--blue)</code> outline at <code>2px</code> offset, <code>1px</code> radius. Applied via <code>:focus-visible</code> on the runtime root so mouse clicks don't trigger the ring; only keyboard focus does.</p>
        </div>
      </div>
```

- [ ] **Step 4: Verify with keyboard**

Browse to `http://localhost:8000`. Scroll to 1.7 Elevation. Click on the page (anywhere outside the button), then press Tab repeatedly. The focus should land on the "Tab to focus." button. Confirm a 2px blue ring with 2px offset appears.

Click the button with the mouse: no ring should appear (`:focus:not(:focus-visible)` rule strips it).

- [ ] **Step 5: Commit**

```bash
git add style-reference/style.css style-reference/index.html
git commit -m "Document :focus-visible spec in 1.7 Elevation

The runtime's pannable plane advertises Drag/arrow-keys navigation
but the focus-ring spec was unwritten. Add the :focus-visible rule
to the runtime (2px solid --blue, 2px offset, 1px radius) and render
a focusable specimen button in 1.7 Elevation so the spec is on the
page. Click-focus is suppressed via :focus:not(:focus-visible).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Resolve responsive cliff — close the 720–1335 middle (D1 default)

**Files:**
- Modify: `style-reference/style.css:1068` (`@media (max-width: 720px)` — bump breakpoint)
- Modify: `style-reference/style.css:405–408` (runtime `@media (max-width: 720px)` — leave as-is, runtime concern)
- Modify: `style-reference/style.css:1247` (anatomy callouts collapse — bump breakpoint)
- Modify: `style-reference/style.css:874` (reduced-motion specimen demos — leave, not breakpoint-related)

**Decision:** If Kees has overridden the default in user-review, apply that. Otherwise apply D1: move the specimen's single-column fallback breakpoint from 720 to 1335. The runtime breakpoint (line 405) stays at 720 — the runtime is its own concern.

- [ ] **Step 1: Bump the specimen mobile-fallback breakpoint**

Edit `style-reference/style.css`:

```
old_string:
/* ============================================================
   Mobile fallback — single-column flow below 720px
   ============================================================ */
@media (max-width: 720px) {
  .sr-page {
    width: 100%;
    padding: var(--page-edge);
  }

new_string:
/* ============================================================
   Below-1336 fallback — single-column flow when the 1320 grid
   can't fit. The reference is authored for 1336; below that, the
   page reflows to a single column rather than scaling the 9-col
   grid (which would drift the cell from the documented 120px).
   ============================================================ */
@media (max-width: 1335px) {
  .sr-page {
    width: 100%;
    padding: var(--page-edge);
  }
```

- [ ] **Step 2: Bump the anatomy-callouts collapse breakpoint to match**

Edit `style-reference/style.css`:

```
old_string:
/* Mobile: anatomy callouts collapse to legend-only; overlay edge tightens to 12px */
@media (max-width: 720px) {
  :root {
    --overlay-edge: 12px;
  }
  .sr-anatomy__num { display: none; }
}

new_string:
/* Below 1336: anatomy callouts collapse to legend-only (no room for inline numerals);
   overlay edge tightens to 12px below 720px (true mobile only). */
@media (max-width: 1335px) {
  .sr-anatomy__num { display: none; }
}
@media (max-width: 720px) {
  :root {
    --overlay-edge: 12px;
  }
}
```

(The overlay-edge tightening stays at 720 — that's a true-mobile concern; the anatomy callouts collapse triggers earlier because the single-column flow makes inline numerals visually noisy.)

- [ ] **Step 3: Verify the cliff is closed**

Browse to `http://localhost:8000`. Open DevTools → Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M). Resize the viewport from 1336 down through 1024, 800, 600, 400 — at every width below 1336, the page should be single-column with no horizontal scrollbar.

At exactly 1336+ the 9-col grid renders. At 1335 and below it's single-column. No middle.

- [ ] **Step 4: Commit**

```bash
git add style-reference/style.css
git commit -m "Close responsive cliff — single-column below 1336 (D1 default)

The 9-col grid is authored for 1336; below that, repeat(9, 120px)
overflows on most viewports (scrollbar takes ~15px, breaking the
exact-fit math). Bump the single-column fallback from 720 to 1335
so the reference is single-column at any sub-1336 width. The 1320px
cell ladder is documented in 1.6 Spacing as the spec value, regardless
of rendered width.

Anatomy callouts collapse at the same breakpoint (single-column flow
makes inline numerals noisy). The overlay-edge tightening stays at
720 — that's a true-mobile concern.

Locked at D1 default per the spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Rename demo keyframes to `sr-demo-*`; add Motion section callout

**Files:**
- Modify: `style-reference/style.css:820–826` (`.sr-motion__chip` + `@keyframes sr-focus-fade`)
- Modify: `style-reference/style.css:828–847` (`.sr-motion__label` + `@keyframes sr-label-cycle`)
- Modify: `style-reference/style.css:849–866` (`.sr-motion__photo` + `@keyframes sr-photo-decode`)
- Modify: `style-reference/style.css:874–878` (reduced-motion rule — selector list unchanged but animation names referenced are renamed via cascade — selectors not animations)
- Modify: `style-reference/index.html:313–357` (1.8 Motion section — add callout note)

The keyframe names are renamed to `sr-demo-*` so a copy-paste collaborator gets a loop, not the runtime's transition-based motion.

- [ ] **Step 1: Rename `sr-focus-fade` → `sr-demo-focus-fade`**

Edit `style-reference/style.css`:

```
old_string:
.sr-motion__chip {
  width: 32px;
  height: 32px;
  background: var(--blue);
  border-radius: 1px;
  animation: sr-focus-fade 1800ms var(--focus-easing) infinite;
}
@keyframes sr-focus-fade {
  0%   { opacity: 0.5; }
  50%  { opacity: 1; }
  100% { opacity: 0.5; }
}

new_string:
.sr-motion__chip {
  width: 32px;
  height: 32px;
  background: var(--blue);
  border-radius: 1px;
  animation: sr-demo-focus-fade 1800ms var(--focus-easing) infinite;
}
@keyframes sr-demo-focus-fade {
  0%   { opacity: 0.5; }
  50%  { opacity: 1; }
  100% { opacity: 0.5; }
}
```

- [ ] **Step 2: Rename `sr-label-cycle` → `sr-demo-label-cycle`**

Edit `style-reference/style.css`:

```
old_string:
.sr-motion__label {
  font-size: var(--label-size-d);
  font-weight: 500;
  color: var(--charcoal);
  animation: sr-label-cycle 1600ms infinite;
}
.sr-motion__label .latin {
  font-style: italic;
  color: var(--blue);
  font-weight: 400;
  margin-left: 0.4em;
}
@keyframes sr-label-cycle {
  0%   { opacity: 0; }
  12.5% { opacity: 1; animation-timing-function: ease-out; } /* 200ms in */
  75%  { opacity: 1; }                                       /* hold */
  84.4% { opacity: 0; animation-timing-function: ease-in; }   /* 150ms out */
  100% { opacity: 0; }
}

new_string:
.sr-motion__label {
  font-size: var(--label-size-d);
  font-weight: 500;
  color: var(--charcoal);
  animation: sr-demo-label-cycle 1600ms infinite;
}
.sr-motion__label .latin {
  font-style: italic;
  color: var(--blue);
  font-weight: 400;
  margin-left: 0.4em;
}
@keyframes sr-demo-label-cycle {
  0%   { opacity: 0; }
  12.5% { opacity: 1; animation-timing-function: ease-out; } /* 200ms in */
  75%  { opacity: 1; }                                       /* hold */
  84.4% { opacity: 0; animation-timing-function: ease-in; }   /* 150ms out */
  100% { opacity: 0; }
}
```

- [ ] **Step 3: Rename `sr-photo-decode` → `sr-demo-photo-decode`**

Edit `style-reference/style.css`:

```
old_string:
.sr-motion__photo {
  width: 60px;
  height: 40px;
  background: repeating-linear-gradient(
    0deg,
    var(--placeholder-band-a) 0 8px,
    var(--placeholder-band-b) 8px 16px
  );
  border-radius: 1px;
  animation: sr-photo-decode 1400ms infinite;
}
@keyframes sr-photo-decode {
  0%   { opacity: 0; transform: translateY(4px); animation-timing-function: ease-out; }
  14%  { opacity: 1; transform: translateY(0); }   /* 200ms in */
  85%  { opacity: 1; transform: translateY(0); }   /* hold */
  100% { opacity: 0; transform: translateY(4px); }  /* reset */
}

new_string:
.sr-motion__photo {
  width: 60px;
  height: 40px;
  background: repeating-linear-gradient(
    0deg,
    var(--placeholder-band-a) 0 8px,
    var(--placeholder-band-b) 8px 16px
  );
  border-radius: 1px;
  animation: sr-demo-photo-decode 1400ms infinite;
}
@keyframes sr-demo-photo-decode {
  0%   { opacity: 0; transform: translateY(4px); animation-timing-function: ease-out; }
  14%  { opacity: 1; transform: translateY(0); }   /* 200ms in */
  85%  { opacity: 1; transform: translateY(0); }   /* hold */
  100% { opacity: 0; transform: translateY(4px); }  /* reset */
}
```

- [ ] **Step 4: Add the loud-distinction callout to the 1.8 Motion section**

Edit `style-reference/index.html`. The Motion section (lines 313–357) currently has the four demo cells in a row plus the easing-curve plot. Add a one-line callout after the easing-curve cell:

```
old_string:
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

new_string:
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

      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">Demos loop for legibility. The runtime transitions once on focus change — these are not the animations themselves, they're the feel of them. Keyframes carry the <code>sr-demo-</code> prefix to make the distinction loud.</p>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 5: Verify**

Grep check:

```bash
grep -nE 'sr-(focus-fade|label-cycle|photo-decode)' style-reference/style.css
```

Expected: no matches without the `sr-demo-` prefix. All three keyframe names should be `sr-demo-*`.

Browse to `http://localhost:8000` and scroll to 1.8 Motion. The four demo animations should still loop correctly (chip pulse, label fade in/out cycle, photo emerge cycle). The new callout sentence appears below the easing-curve plot.

- [ ] **Step 6: Commit**

```bash
git add style-reference/style.css style-reference/index.html
git commit -m "Rename demo keyframes to sr-demo-* with loud-distinction note

The three demo keyframes (sr-focus-fade, sr-label-cycle, sr-photo-decode)
imitate the runtime's transition-based motion as loops. A copy-paste
collaborator copying the keyframe gets a 1.6-second cycle, not the
runtime's once-on-focus-change behavior. Rename to sr-demo-* prefix
and add a one-line callout in 1.8 Motion making the distinction
explicit on the page.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Snap drift values to the page-edge / gutter / sub-tick ladder

**Files:**
- Modify: `style-reference/style.css:1209` (`.sr-anatomy__num` margin-right)
- Modify: `style-reference/style.css:960` (`.sr-token` padding)
- Modify: `style-reference/style.css:461` (`.sr-group` margin)

The system's spacing ladder: tick=2, sub-tick=4 (implicit, =tick×2), 8 (page-edge), 12 (sub-tick × 3), 16 (overlay-edge), 24 (gutter), 32 (page-edge + gutter), 144 (stride). Values not on this ladder are drift.

- [ ] **Step 1: Snap `.sr-anatomy__num` margin-right from 6px → 8px**

Edit `style-reference/style.css`:

```
old_string:
.sr-anatomy__num {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: middle;

new_string:
.sr-anatomy__num {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  vertical-align: middle;
```

- [ ] **Step 2: Snap `.sr-token` padding from `12px 14px` → `12px 16px`**

Edit `style-reference/style.css`:

```
old_string:
.sr-token {
  background: rgba(26, 26, 26, 0.04);
  border-left: 2px solid var(--blue);
  padding: 12px 14px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  align-self: start;
}

new_string:
.sr-token {
  background: rgba(26, 26, 26, 0.04);
  border-left: 2px solid var(--blue);
  padding: 12px 16px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  align-self: start;
}
```

(12 = sub-tick × 3, 16 = overlay-edge / sub-tick × 4. Both ladder-snapped.)

- [ ] **Step 3: Confirm `.sr-group` margin already uses ladder values**

`.sr-group` margin is `32px 0 8px 0` at line 461. 32 = page-edge + gutter; 8 = page-edge. Both on ladder — no change needed.

For maximum dog-food, optionally express 32 as `calc(var(--page-edge) + var(--gutter))`:

```
old_string:
.sr-group {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 0 8px 0;
  margin: 32px 0 8px 0;
  border-bottom: 1px solid var(--blue-soft);
}

new_string:
.sr-group {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 0 var(--page-edge) 0;
  margin: calc(var(--page-edge) + var(--gutter)) 0 var(--page-edge) 0;
  border-bottom: 1px solid var(--blue-soft);
}
```

- [ ] **Step 4: Verify**

Browse to `http://localhost:8000`. Visual inspection:
- Anatomy callout numerals (the small blue squares with "1" / "2" / "3") have a tiny bit more breathing room next to their labeled element.
- Token cards in 1.3 Grid have slightly wider horizontal padding.
- Group markers ("1.0 · Foundations" etc.) render with the same vertical rhythm as before (the calc result is identical to the prior literal `32px`).

- [ ] **Step 5: Commit**

```bash
git add style-reference/style.css
git commit -m "Snap drift values to the spacing ladder

sr-anatomy__num margin-right 6 → 8 (sub-tick × 2 = overlay-gap value).
sr-token padding 12px 14px → 12px 16px (12 = sub-tick × 3; 16 =
overlay-edge). sr-group margin 32 expressed as calc(page-edge +
gutter) to make the relationship mechanical instead of coincidental.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Tokenize runtime offsets — `--viewport-edge-d` and `--viewport-edge-corner`

**Files:**
- Modify: `style-reference/style.css:26–61` (second `:root` — token addition)
- Modify: `style-reference/style.css:232–233` (`.identity` top/left)
- Modify: `style-reference/style.css:261–262` (`.species` bottom/left)
- Modify: `style-reference/style.css:300–301` (`.compass` bottom/right)

**Decision:** If Kees has chosen "align to 32" in user-review, apply that instead. Default: tokenize the existing 18/22 values (don't change runtime feel without an explicit brand decision).

- [ ] **Step 1: Add the two tokens**

Edit `style-reference/style.css` — append to the `--overlay-z` block:

```
old_string:
  /* Placeholder bands — photo-loading skeleton fixture, also reused
     as illustrative photo stand-in inside the 3.1 Overlays specimens */
  --placeholder-band-a: #d9d3c5;
  --placeholder-band-b: #cfc7b6;
}

new_string:
  /* Placeholder bands — photo-loading skeleton fixture, also reused
     as illustrative photo stand-in inside the 3.1 Overlays specimens */
  --placeholder-band-a: #d9d3c5;
  --placeholder-band-b: #cfc7b6;

  /* Viewport edges — the runtime's identity/species/compass offsets from
     the viewport edge. Not on the page-edge / gutter ladder; the runtime
     wanted a softer offset than the canonical 32 (page-edge + gutter)
     would give. [edit: Kees] confirm 18 / 22 are the right values. */
  --viewport-edge-d:      18px;   /* identity (top-left) */
  --viewport-edge-corner: 22px;   /* species (bottom-left), compass (bottom-right) */
}
```

- [ ] **Step 2: Replace `.identity` literal `18px` with token**

Edit `style-reference/style.css`:

```
old_string:
.identity {
  position: fixed;
  top: 18px;
  left: 18px;

new_string:
.identity {
  position: fixed;
  top: var(--viewport-edge-d);
  left: var(--viewport-edge-d);
```

- [ ] **Step 3: Replace `.species` literal `22px` with token**

Edit `style-reference/style.css`:

```
old_string:
.species {
  position: fixed;
  bottom: 22px;
  left: 22px;

new_string:
.species {
  position: fixed;
  bottom: var(--viewport-edge-corner);
  left: var(--viewport-edge-corner);
```

- [ ] **Step 4: Replace `.compass` literal `22px` with token**

Edit `style-reference/style.css`:

```
old_string:
.compass {
  position: fixed;
  bottom: 22px;
  right: 22px;

new_string:
.compass {
  position: fixed;
  bottom: var(--viewport-edge-corner);
  right: var(--viewport-edge-corner);
```

- [ ] **Step 5: Verify**

This is a runtime-only change; the specimen page renders these selectors inside `.sr-cell__body` overrides (lines 542–550) which reset `position: static`. Visual output on the reference page is unchanged.

Grep check:

```bash
grep -nE '(top|left|right|bottom):\s*(18|22)px' style-reference/style.css
```

Expected: no matches in runtime selectors. (Ignore matches inside the `.show-grid` debug rules at lines 1051–1052 — those use `16px` for the legend, on the ladder.)

- [ ] **Step 6: Commit**

```bash
git add style-reference/style.css
git commit -m "Tokenize runtime viewport offsets (default: existing values)

The .identity / .species / .compass viewport offsets (18/22px) were
not on the page-edge / gutter ladder. Default action per the spec
is to tokenize the existing values rather than change the runtime
feel: --viewport-edge-d (18px) for the top-left identity,
--viewport-edge-corner (22px) for bottom corners. The [edit: Kees]
marker on the inline comment flags the user-review pass to confirm
or override.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: Render token rationales on the page

**Files:**
- Modify: `style-reference/index.html:111–144` (1.3 Grid section — add why line)
- Modify: `style-reference/index.html:145–192` (1.4 Color section — add why lines for the three palette colors)
- Modify: `style-reference/index.html:193–248` (1.5 Typography section — add type-stack section + why)
- Modify: `style-reference/index.html:313–357` (1.8 Motion section — add why for focus-fade, pan-lerp)

The mission: rationales live *on the page*, not only in code comments. Add one-line rationales as small mono-utility captions beneath the relevant specimens.

- [ ] **Step 1: Add the why-line for the grid in 1.3**

Edit `style-reference/index.html`. The grid section currently has tokens + diagram + caption. Add a why-line after the diagram, before the closing `<hr>`:

```
old_string:
      <div class="sr-cell sr-cell--9 sr-cell--r3 sr-grid-ruleset__diagram" aria-label="Page anatomy diagram">
        <div class="sr-grid-anatomy">
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--l"></div>
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--r"></div>
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--t"></div>
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--b"></div>
          <div class="sr-grid-anatomy__caption">page-edge 8 · tile 1320 · 9 × u=120 · g=24</div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-color">

new_string:
      <div class="sr-cell sr-cell--9 sr-cell--r3 sr-grid-ruleset__diagram" aria-label="Page anatomy diagram">
        <div class="sr-grid-anatomy">
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--l"></div>
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--r"></div>
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--t"></div>
          <div class="sr-grid-anatomy__edge sr-grid-anatomy__edge--b"></div>
          <div class="sr-grid-anatomy__caption">page-edge 8 · tile 1320 · 9 × u=120 · g=24</div>
        </div>
      </div>

      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">u=120 / g=24 inherited from the photo-plane tessellation (V4): a 9-col tile holds an integer count of 3:2 photographs at the brand's intended scale. tile-height = 5·u + 6·g = 744 (was 760, off by 16). All page spacing derives from this ladder.</p>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-color">
```

- [ ] **Step 2: Add why-lines for the three palette colors in 1.4**

Edit `style-reference/index.html`. After the current swatches, before the `<hr>`:

```
old_string:
      <div class="sr-cell sr-cell--4">
        <div class="sr-swatch">
          <div class="sr-swatch__chip sr-swatch__chip--checker" style="background-color:rgba(22, 53, 238, 0.6)"></div>
          <div class="sr-swatch__name">--blue-soft</div>
          <div class="sr-swatch__value">rgba(22, 53, 238, 0.6)</div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-typography">

new_string:
      <div class="sr-cell sr-cell--4">
        <div class="sr-swatch">
          <div class="sr-swatch__chip sr-swatch__chip--checker" style="background-color:rgba(22, 53, 238, 0.6)"></div>
          <div class="sr-swatch__name">--blue-soft</div>
          <div class="sr-swatch__value">rgba(22, 53, 238, 0.6)</div>
        </div>
      </div>

      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">--field is uncoated-paper cream (Steidl monograph stock, not a screen background). --blue is Munich '72 lineage: high-saturation structural blue. --charcoal is quiet ink — photographic neutral, not pure black, so type sits at the same density as photographic shadows. --blue-soft is reserved for surfaces (borders, rules, dividers); for text use full --blue.</p>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-typography">
```

- [ ] **Step 3: Add why-line in 1.8 Motion**

Edit `style-reference/index.html`. The motion section already had a callout added in Task 13. Append the rationale to that callout, OR add a separate one. Cleanest is to expand the existing callout. The `style.css` comments already carry the `[edit: Kees]` marker; on-page text states it confidently:

```
old_string:
      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">Demos loop for legibility. The runtime transitions once on focus change — these are not the animations themselves, they're the feel of them. Keyframes carry the <code>sr-demo-</code> prefix to make the distinction loud.</p>

new_string:
      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">Fast start, gentle settle: the photograph emerges before the chrome resolves. --pan-lerp tuned empirically — low enough to feel weighty, high enough not to lag. Demos loop for legibility; the runtime transitions once on focus change. Keyframes carry the <code>sr-demo-</code> prefix to make the distinction loud.</p>
```

- [ ] **Step 4: Verify**

Browse to `http://localhost:8000`. Scroll through 1.3 Grid, 1.4 Color, 1.8 Motion. Each should now have a small mono-utility rationale paragraph below the specimens. The rationale text should be in the `.sr-anatomy__usage` style (charcoal at 0.7 opacity, 12px, normal weight).

- [ ] **Step 5: Commit**

```bash
git add style-reference/index.html
git commit -m "Render canonical token rationales on the page

The why-stories for grid (u=120, g=24, tile math), color (Munich '72
blue, Steidl cream, photographic-neutral charcoal, blue-soft for
surfaces), and motion (photo-emerges-first; pan-lerp empirical) now
appear in the rendered reference, not only as code comments. Phase 1
acceptance #2: rationale on the page, not just in :root.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 17: Render the alpha-step ladder table inside 1.4 Color

**Files:**
- Modify: `style-reference/index.html:145–192` (1.4 Color — add alpha ladder table after the why-line)
- Modify: `style-reference/style.css` — append `.sr-alpha-ladder` styles to the specimen section

The alpha ladder consolidates the charcoal-on-field and blue-on-field opacity steps used throughout the system, named by role.

- [ ] **Step 1: Add the alpha-ladder CSS**

Edit `style-reference/style.css` — append after the `.sr-swatch__value` block (line 714):

```
old_string:
.sr-swatch__value {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.6);
}

new_string:
.sr-swatch__value {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.6);
}

.sr-alpha-ladder {
  display: grid;
  grid-template-columns: auto auto 1fr;
  column-gap: 16px;
  row-gap: 6px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(26, 26, 26, 0.7);
}
.sr-alpha-ladder__chip {
  width: 16px;
  height: 16px;
  border-radius: 1px;
  align-self: center;
}
.sr-alpha-ladder__value {
  color: var(--charcoal);
  font-weight: 500;
}
.sr-alpha-ladder__role {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  color: rgba(26, 26, 26, 0.65);
  align-self: center;
}
```

- [ ] **Step 2: Add the rendered ladder to 1.4 Color**

Edit `style-reference/index.html` — insert after the why-line added in Task 16, before the `<hr>`:

```
old_string:
      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">--field is uncoated-paper cream (Steidl monograph stock, not a screen background). --blue is Munich '72 lineage: high-saturation structural blue. --charcoal is quiet ink — photographic neutral, not pure black, so type sits at the same density as photographic shadows. --blue-soft is reserved for surfaces (borders, rules, dividers); for text use full --blue.</p>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-typography">

new_string:
      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">--field is uncoated-paper cream (Steidl monograph stock, not a screen background). --blue is Munich '72 lineage: high-saturation structural blue. --charcoal is quiet ink — photographic neutral, not pure black, so type sits at the same density as photographic shadows. --blue-soft is reserved for surfaces (borders, rules, dividers); for text use full --blue.</p>

      <div class="sr-cell sr-cell--5">
        <span class="sr-cell__label">CHARCOAL ALPHA LADDER</span>
        <div class="sr-cell__body">
          <div class="sr-alpha-ladder">
            <div class="sr-alpha-ladder__chip" style="background:rgba(26,26,26,0.04)"></div><span class="sr-alpha-ladder__value">0.04</span><span class="sr-alpha-ladder__role">subtle bg fill</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(26,26,26,0.06)"></div><span class="sr-alpha-ladder__value">0.06</span><span class="sr-alpha-ladder__role">hairline border</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(26,26,26,0.10)"></div><span class="sr-alpha-ladder__value">0.10</span><span class="sr-alpha-ladder__role">section rule</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(26,26,26,0.65)"></div><span class="sr-alpha-ladder__value">0.65</span><span class="sr-alpha-ladder__role">utility text — AA</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(26,26,26,0.7)"></div><span class="sr-alpha-ladder__value">0.70</span><span class="sr-alpha-ladder__role">body text — AA</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(26,26,26,0.75)"></div><span class="sr-alpha-ladder__value">0.75</span><span class="sr-alpha-ladder__role">legend body</span>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--4">
        <span class="sr-cell__label">BLUE ALPHA LADDER</span>
        <div class="sr-cell__body">
          <div class="sr-alpha-ladder">
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.18)"></div><span class="sr-alpha-ladder__value">0.18</span><span class="sr-alpha-ladder__role">debug edge / dashed</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.35)"></div><span class="sr-alpha-ladder__value">0.35</span><span class="sr-alpha-ladder__role">debug border</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.6)"></div><span class="sr-alpha-ladder__value">0.60</span><span class="sr-alpha-ladder__role">--blue-soft (surfaces)</span>
          </div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-typography">
```

- [ ] **Step 3: Verify**

Browse to `http://localhost:8000`. Scroll to 1.4 Color. Below the swatches and the why-line, two new ladder blocks should render side by side: a charcoal ladder with six rows and a blue ladder with three rows. Each row shows a chip, a numeric alpha, and a role name in mono-utility caps.

- [ ] **Step 4: Commit**

```bash
git add style-reference/style.css style-reference/index.html
git commit -m "Render charcoal & blue alpha ladders inside 1.4 Color

The alpha ladder was implicit across ~25 hardcoded uses. After Task 7
& 8 contrast fixes, it consolidated to six charcoal roles and three
blue roles. Render the consolidated ladder on the page so future use
is constrained by what's documented — no new tokens, no token tax,
just naming the de-facto roles.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 18: Render display-roles table in 1.5 Typography

**Files:**
- Modify: `style-reference/index.html:193–248` (1.5 Typography — append display-roles table)

The body-type non-token sizes (56, 28, 26, 22, 16, 14, 13) are display roles, not a reusable scale. Naming them by role on the page constrains future use.

- [ ] **Step 1: Append display-roles to 1.5 Typography**

Edit `style-reference/index.html`. Before the closing `<hr>` of the typography section:

```
old_string:
      <div class="sr-cell sr-cell--4">
        <div class="sr-type__label">font stack</div>
        <div class="sr-type__stack">'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif</div>
        <div class="sr-type__label" style="margin-top:8px">mono stack</div>
        <div class="sr-type__stack">ui-monospace, "SF Mono", Menlo, Consolas, monospace</div>
      </div>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-spacing">

new_string:
      <div class="sr-cell sr-cell--4">
        <div class="sr-type__label">font stack</div>
        <div class="sr-type__stack">'ABC Diatype', system-ui, -apple-system, 'Segoe UI', sans-serif</div>
        <div class="sr-type__label" style="margin-top:8px">mono stack</div>
        <div class="sr-type__stack">ui-monospace, "SF Mono", Menlo, Consolas, monospace</div>
      </div>

      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">DISPLAY ROLES — ONE-OFF SIZES, NAMED</span>
        <div class="sr-cell__body">
          <div class="sr-alpha-ladder" style="grid-template-columns: auto auto 1fr">
            <span class="sr-alpha-ladder__value">56px</span><span></span><span class="sr-alpha-ladder__role">masthead title — page heading</span>
            <span class="sr-alpha-ladder__value">28px</span><span></span><span class="sr-alpha-ladder__role">principles quote</span>
            <span class="sr-alpha-ladder__value">26px</span><span></span><span class="sr-alpha-ladder__role">brand-card wordmark</span>
            <span class="sr-alpha-ladder__value">22px</span><span></span><span class="sr-alpha-ladder__role">section title — sr-section__title</span>
            <span class="sr-alpha-ladder__value">22px</span><span></span><span class="sr-alpha-ladder__role">token value — sr-token__v</span>
            <span class="sr-alpha-ladder__value">16px</span><span></span><span class="sr-alpha-ladder__role">elevation body</span>
            <span class="sr-alpha-ladder__value">14px</span><span></span><span class="sr-alpha-ladder__role">colophon signature, principles list</span>
            <span class="sr-alpha-ladder__value">13px</span><span></span><span class="sr-alpha-ladder__role">overlay sample, applied identity</span>
          </div>
        </div>
      </div>

      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0">Tokenized type sizes (--wm-size, --label-size, --meta-size) are reusable across components; the display roles above are one-offs for specific rendered moments. New display roles earn their place by being named here first; freelance sizes elsewhere are drift.</p>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-spacing">
```

- [ ] **Step 2: Verify**

Browse to `http://localhost:8000`. Scroll to 1.5 Typography. Below the existing samples and font stacks, the display-roles table renders as a two-column grid (px value, role description) listing all eight named one-offs with a usage rationale beneath.

- [ ] **Step 3: Commit**

```bash
git add style-reference/index.html
git commit -m "Render display-roles table in 1.5 Typography

The body-type sizes (56, 28, 26, 22, 16, 14, 13) are one-offs, not a
reusable scale. Promoting them to tokens creates more debt than it
pays. Naming each by role on the page constrains future use without
a token tax: new display roles earn their place by being named here
first; freelance sizes elsewhere are drift.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 19: Add voice/copy formulas to 2.2 Species, 2.3 Compass, 3.1 Overlays

**Files:**
- Modify: `style-reference/index.html:399–433` (2.2 Species label anatomy block)
- Modify: `style-reference/index.html:435–468` (2.3 Compass anatomy block)
- Modify: `style-reference/index.html:584–656` (3.1 Overlays — extend mono-utility primitive)

- [ ] **Step 1: Add the species naming formula to 2.2's anatomy**

Edit `style-reference/index.html`:

```
old_string:
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

    <section class="sr-section sr-component sr-component--compass" aria-labelledby="sr-2-3">

new_string:
      <div class="sr-cell sr-cell--4 sr-cell--r2">
        <span class="sr-cell__label">ANATOMY</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy__legend">
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">1</span> line-name — sans 500, charcoal</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">2</span> latin — italic blue (sole italic accent)</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">3</span> meta — mono utility, --blue</div>
          </div>
          <p class="sr-anatomy__usage">Captions a single bird photograph. One per cell, anchored bottom-left. <b>Formula —</b> line-name in English title-case; latin in lowercase scientific binomial form (Genus species, italic, --blue); meta as <code>Photo X / N</code> with non-breaking spaces. If no settled binomial exists, use the most-recent published name; never coin one.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>

    <section class="sr-section sr-component sr-component--compass" aria-labelledby="sr-2-3">
```

(Note: I changed `meta — mono utility, blue-soft` to `meta — mono utility, --blue` to reflect the C1 decision from Task 8.)

- [ ] **Step 2: Add the compass copy formula to 2.3's anatomy**

Edit `style-reference/index.html`:

```
old_string:
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

    <section class="sr-section sr-component sr-component--photo" aria-labelledby="sr-2-4">

new_string:
      <div class="sr-cell sr-cell--4 sr-cell--r2">
        <span class="sr-cell__label">ANATOMY</span>
        <div class="sr-cell__body">
          <div class="sr-anatomy__legend">
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">1</span> instruction — mono utility, --blue</div>
            <div class="sr-anatomy__legend-row"><span class="sr-anatomy__num">2</span> state — arrangement letter in --blue, +0.04em letter-spacing</div>
          </div>
          <p class="sr-anatomy__usage">Tells the visitor how to navigate the photo plane and where they currently are. <b>Formula —</b> instruction line: imperative verbs separated by a middle-dot (<code>Drag · arrow keys</code>); state line: <code>Arrangement {single uppercase letter}</code> with the letter in <code>.arr</code> at the wider tracking. No emoji; no icons.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>

    <section class="sr-section sr-component sr-component--photo" aria-labelledby="sr-2-4">
```

(Note: legend now references `--blue` not `charcoal-soft` — reflecting Task 8 C1 decision.)

- [ ] **Step 3: Extend the mono-utility primitive in 3.1 with formulas**

Edit `style-reference/index.html`. The mono-utility primitive currently shows `v.2026.04 · 52.37°N`. Add a small caption clarifying the three formulas the brand uses for utility text:

```
old_string:
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">mono-utility</span>
            <span class="sr-overlay-primitive__sample" style="font-family:ui-monospace,monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.7;">v.2026.04 · 52.37°N</span>
          </div>

new_string:
          <div class="sr-overlay-primitive">
            <span class="sr-overlay-primitive__name">mono-utility</span>
            <span class="sr-overlay-primitive__sample" style="font-family:ui-monospace,monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; opacity:0.7;">v.2026.04 · 52.37°N</span>
          </div>
```

(No change to that primitive itself — the formulas go into a footer note for the section. Add after the applied-example block:)

```
old_string:
      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">APPLIED EXAMPLE — TL: IDENTITY · BL: INDICATOR · BR: STACK</span>
        <div class="sr-cell__body">
          <div class="sr-overlay-applied">
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--tl">
              Kees Leemeijer<span class="dot"></span>
            </div>
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--bl">
              <span class="live"></span>banded 06:12
            </div>
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--br">
              52.37°N · 4.89°E<br>nikon z9 · 600mm f/4
            </div>
          </div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>

new_string:
      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">APPLIED EXAMPLE — TL: IDENTITY · BL: INDICATOR · BR: STACK</span>
        <div class="sr-cell__body">
          <div class="sr-overlay-applied">
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--tl">
              Kees Leemeijer<span class="dot"></span>
            </div>
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--bl">
              <span class="live"></span>banded 06:12
            </div>
            <div class="sr-overlay-applied__layer sr-overlay-applied__layer--br">
              52.37°N · 4.89°E<br>nikon z9 · 600mm f/4
            </div>
          </div>
        </div>
      </div>

      <p class="sr-cell sr-cell--9 sr-anatomy__usage" style="margin-top:0"><b>Mono-utility formulas —</b> coordinates: <code>52.37°N · 4.89°E</code> (decimal, ° suffix, middle-dot separator); gear: <code>nikon z9 · 600mm f/4</code> (lowercase, middle-dot separator); time-codes: <code>banded 06:12</code> (lowercase verb · 24h time). Default contrast over photographs: <code>color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.4);</code>. Backdrop-blur opt-in via <code>.overlay--backdrop</code> only when text-shadow is insufficient.</p>

      <hr class="sr-rule" />
    </section>
```

- [ ] **Step 4: Verify**

Browse to `http://localhost:8000`. Scroll through 2.2 Species label, 2.3 Compass, 3.1 Overlays. Each anatomy/applied block now carries an italic-prefixed `Formula —` line spelling out the writing convention.

- [ ] **Step 5: Commit**

```bash
git add style-reference/index.html
git commit -m "Add voice/copy formulas to 2.2 Species, 2.3 Compass, 3.1 Overlays

The brief flagged species naming, meta string, coordinate notation,
camera/lens, light/time codes as gaps. Per the closed IA, they live
where they're used: in the anatomy of the components and primitives
that render them. Three short formulas added to the existing usage
notes; no new sections.

Also: legends in 2.2 / 2.3 updated from blue-soft / charcoal-soft to
--blue to reflect Task 8's C1 decision (text uses on full --blue).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 20: Resolve "alectear-feel craft" (default G2 — substitute "hand-crafted")

**Files:**
- Modify: `style-reference/index.html:47` (Principles quote)
- Modify: `style-reference/style.css:1–4` (top-of-file comment that quotes the line)

**Decision:** If Kees has chosen G1 (define) in user-review, apply that. Default G2: substitute "hand-crafted." Preserve the original line in a code comment for archival reasons.

- [ ] **Step 1: Update the rendered quote**

Edit `style-reference/index.html`:

```
old_string:
      <p class="sr-cell sr-cell--5 sr-cell--r2 sr-principles__quote">Munich '72 spirited inheritance · alectear-feel craft</p>

new_string:
      <!-- Originally: "Munich '72 spirited inheritance · alectear-feel craft" — alectear undefined; substituted per spec G2 default. Restore via spec G1 if Kees defines the term. -->
      <p class="sr-cell sr-cell--5 sr-cell--r2 sr-principles__quote">Munich '72 spirited inheritance · hand-crafted</p>
```

- [ ] **Step 2: Update the top-of-file CSS comment**

Edit `style-reference/style.css`:

```
old_string:
/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · alectear-feel craft
   ============================================================ */

new_string:
/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Munich '72 spirited inheritance · hand-crafted
   (was: "alectear-feel craft" — undefined coined term, substituted)
   ============================================================ */
```

- [ ] **Step 3: Verify**

Browse to `http://localhost:8000`. Section 1.1 Principles quote now reads "Munich '72 spirited inheritance · hand-crafted." The display-spacing and visual weight are unchanged.

- [ ] **Step 4: Commit**

```bash
git add style-reference/index.html style-reference/style.css
git commit -m "Substitute 'alectear-feel craft' with 'hand-crafted' (G2 default)

'alectear' was a coined term, undefined anywhere in code or docs.
Per the spec's G2 default, substitute 'hand-crafted' (carries the
same sense — naturalist, hands-on, editorial). Original preserved in
HTML and CSS comments so the user-review pass can restore via G1 if
Kees wants to define the original term.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 21: Document `?grid` debug overlay in colophon

**Files:**
- Modify: `style-reference/index.html:660–674` (Colophon)

- [ ] **Step 1: Add the `?grid` reference to the colophon body**

Edit `style-reference/index.html`:

```
old_string:
      <div class="sr-cell sr-cell--9 sr-colophon__body">
        <div>Set in ABC Diatype.</div>
        <div class="sr-colophon__signature">Kees Leemeijer<span class="dot">.</span></div>
        <div>2026-04-27 · v1</div>
      </div>
    </section>

new_string:
      <div class="sr-cell sr-cell--9 sr-colophon__body">
        <div>Set in ABC Diatype.</div>
        <div class="sr-colophon__signature">Kees Leemeijer<span class="dot">.</span></div>
        <div>2026-04-27 · v1</div>
      </div>
      <div class="sr-cell sr-cell--9" style="margin-top:8px">
        <p class="sr-anatomy__usage" style="margin-top:0">Debug overlay: append <code>?grid</code> to the URL to see the cell-grid and page-edge strip rendered over the page (e.g. <code>localhost:8000/?grid</code>).</p>
      </div>
    </section>
```

- [ ] **Step 2: Verify**

Browse to `http://localhost:8000`. Scroll to the bottom (Colophon). Below the version line, a small mono-utility note describes the `?grid` flag.

Test the flag itself: visit `http://localhost:8000/?grid`. The page should render with blue grid lines and a fixed bottom-right legend `u 120 · g 24 · edge 8 · tick 2`.

- [ ] **Step 3: Commit**

```bash
git add style-reference/index.html
git commit -m "Document ?grid debug flag in Colophon

The URL-flag-toggled grid overlay (style.css:1017–1063) was
production-safe but undiscoverable. Document it in the colophon so
the next collaborator can find it.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 22: Comment the mobile-rendering technique

**Files:**
- Modify: `style-reference/style.css:880–895` (the `.sr-cell__body .mobile-edition` override)

- [ ] **Step 1: Add an explanatory comment**

Edit `style-reference/style.css`:

```
old_string:
/* Mobile-cell rendering inside the reference page.
   The portfolio's .mobile-edition is display:none on desktop and only
   shows below 720px. Inside an .sr-cell__body we force it visible at
   a constrained width so the mobile cell renders at its real type sizes. */
.sr-cell__body .mobile-edition {

new_string:
/* Mobile-cell rendering inside the reference page.
   The portfolio's .mobile-edition is display:none on desktop and only
   shows below 720px (style.css:328, :405). Inside an .sr-cell__body
   we force it visible at a constrained width so the mobile cell
   specimen (2.6) renders at its real type sizes. This is a clean
   specimen technique, not a hack: the override IS the documented way
   to render the mobile cell inside the desktop document flow without
   duplicating styles. The constrained max-width and bordered frame
   make the override explicit visually; in the runtime, .mobile-edition
   occupies the full viewport. */
.sr-cell__body .mobile-edition {
```

- [ ] **Step 2: Commit**

```bash
git add style-reference/style.css
git commit -m "Document the mobile-rendering specimen technique

The .sr-cell__body .mobile-edition override forces .mobile-edition
visible inside the desktop document flow so the 2.6 Mobile cell
specimen can render at its real type sizes. Without an explanation
this looks like a hack; with one, it's a clean specimen technique.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 23: Phase 1 verification — full render check

**Files:** none (verification only)

- [ ] **Step 1: Confirm dev server is running**

If the server isn't running, from `style-reference/`:

```bash
python -m http.server
```

- [ ] **Step 2: Render at 1336px+**

Browse to `http://localhost:8000`. Scroll the entire document end-to-end. Check:
- No console errors (DevTools → Console)
- No broken images (DevTools → Network → filter by "img"; no 404s)
- The 9-col grid renders correctly across all sections
- Section landmarks land via Tab navigation (Tab through the page; the focus button in 1.7 Elevation should receive focus visibly)
- Anatomy callouts (the small numbered chips) appear on 2.1 / 2.2 / 2.3 / 2.4

- [ ] **Step 3: Render at 1335px and below**

DevTools → device toolbar. Set viewport to 1200px wide, then 800px, then 400px. At every sub-1336 width:
- Single-column flow
- No horizontal scrollbar
- Anatomy callouts hidden (the legend rows still visible)

- [ ] **Step 4: Test `?grid` flag**

Visit `http://localhost:8000/?grid`. The grid overlay renders with:
- 8px blue page-edge strip on all four sides
- Cell-stride lines every 144px on all sections
- Bottom-right fixed legend `u 120 · g 24 · edge 8 · tick 2`

- [ ] **Step 5: Test reduced-motion**

DevTools → Rendering → "Emulate CSS prefers-reduced-motion" set to "reduce." Reload. The 1.8 Motion specimens should now be static (no looping animations). Check no console errors.

- [ ] **Step 6: Test contrast in DevTools**

Inspect any `.sr-section__stats`, `.sr-cell__label`, `.sr-anatomy__usage`, `.sr-token__k` element. The Computed Styles panel's color picker should show the contrast ratio against the background. All should report ≥4.5:1 (AA pass for normal text).

- [ ] **Step 7: Run Lighthouse Accessibility audit**

DevTools → Lighthouse → run with Accessibility category checked. Score should be 95+ with no critical landmark or contrast violations.

- [ ] **Step 8: Mark Phase 1 complete**

If all eight verification steps pass, Phase 1 is complete. No commit needed for verification — the prior 22 commits constitute Phase 1.

If any step fails, stop and remediate before starting Phase 2. Common remediation patterns: contrast still failing on a specific selector → revisit Task 7/8 with the specific selector; landmark error → revisit Task 9.

---

## Task 24: Phase 2 — Add Photograph treatment sub-block to 1.4 Color

**Files:**
- Modify: `style-reference/index.html:145–192` (1.4 Color — append photograph treatment block)
- Modify: `style-reference/style.css` — append `.sr-photo-treatment` styles

The ambient ladder (`--ambient-opacity 0.55`, `--ambient-saturate 0.65`, `--ambient-brightness 0.92`) is rendered as a side-by-side specimen. Two `.photo` cells using `--placeholder-band-a/b` — left at ambient, right at focused.

- [ ] **Step 1: Add the treatment-block CSS**

Edit `style-reference/style.css` — append after `.sr-alpha-ladder` styles (added in Task 17):

```
old_string:
.sr-alpha-ladder__role {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  color: rgba(26, 26, 26, 0.65);
  align-self: center;
}

new_string:
.sr-alpha-ladder__role {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 10px;
  color: rgba(26, 26, 26, 0.65);
  align-self: center;
}

/* Photograph treatment specimen — ambient (non-focused) vs focused.
   Reuses .photo runtime styles; the .sr-photo class scopes them to
   in-flow rendering inside .sr-cell__body. */
.sr-photo-treatment {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gutter);
}
.sr-photo-treatment .photo {
  position: relative;
  aspect-ratio: 3 / 2;
  width: 100%;
}
.sr-photo-treatment__caption {
  margin-top: 6px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.65);
}
```

- [ ] **Step 2: Add the treatment block to 1.4 Color**

Edit `style-reference/index.html` — insert after the alpha ladders added in Task 17, before the closing `<hr>` of 1.4 Color:

```
old_string:
      <div class="sr-cell sr-cell--4">
        <span class="sr-cell__label">BLUE ALPHA LADDER</span>
        <div class="sr-cell__body">
          <div class="sr-alpha-ladder">
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.18)"></div><span class="sr-alpha-ladder__value">0.18</span><span class="sr-alpha-ladder__role">debug edge / dashed</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.35)"></div><span class="sr-alpha-ladder__value">0.35</span><span class="sr-alpha-ladder__role">debug border</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.6)"></div><span class="sr-alpha-ladder__value">0.60</span><span class="sr-alpha-ladder__role">--blue-soft (surfaces)</span>
          </div>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-typography" aria-labelledby="sr-1-5">

new_string:
      <div class="sr-cell sr-cell--4">
        <span class="sr-cell__label">BLUE ALPHA LADDER</span>
        <div class="sr-cell__body">
          <div class="sr-alpha-ladder">
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.18)"></div><span class="sr-alpha-ladder__value">0.18</span><span class="sr-alpha-ladder__role">debug edge / dashed</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.35)"></div><span class="sr-alpha-ladder__value">0.35</span><span class="sr-alpha-ladder__role">debug border</span>
            <div class="sr-alpha-ladder__chip" style="background:rgba(22,53,238,0.6)"></div><span class="sr-alpha-ladder__value">0.60</span><span class="sr-alpha-ladder__role">--blue-soft (surfaces)</span>
          </div>
        </div>
      </div>

      <div class="sr-cell sr-cell--9">
        <span class="sr-cell__label">PHOTOGRAPH TREATMENT — AMBIENT VS FOCUSED</span>
        <div class="sr-cell__body">
          <div class="sr-photo-treatment">
            <div>
              <div class="photo sr-photo" style="--ph-band-a:#3d6b8a; --ph-band-b:#4a7c9a;">
                <div class="placeholder" data-label="P5 · COMMON KINGFISHER"></div>
              </div>
              <div class="sr-photo-treatment__caption">ambient — opacity 0.55 · saturate 0.65 · brightness 0.92</div>
            </div>
            <div>
              <div class="photo sr-photo is-focused" style="--ph-band-a:#3d6b8a; --ph-band-b:#4a7c9a;">
                <div class="placeholder" data-label="P5 · COMMON KINGFISHER"></div>
              </div>
              <div class="sr-photo-treatment__caption">focused — opacity 1 · no filter · shadow lift</div>
            </div>
          </div>
          <p class="sr-anatomy__usage" style="margin-top:12px">Non-focused photographs recede in attention but do not disappear: the photograph in focus is the subject; everything else is evidence. The ambient state is set on every <code>.photo</code> by default; <code>.is-focused</code> overrides it.</p>
        </div>
      </div>

      <hr class="sr-rule" />
    </section>
    <section class="sr-section sr-typography" aria-labelledby="sr-1-5">
```

- [ ] **Step 3: Verify**

Browse to `http://localhost:8000`. Scroll to 1.4 Color. Below the alpha ladders, the Photograph treatment block renders two side-by-side band cells: the left visibly dimmer/desaturated (ambient), the right at full visibility with a soft drop shadow (focused).

- [ ] **Step 4: Commit**

```bash
git add style-reference/style.css style-reference/index.html
git commit -m "Phase 2: Add Photograph treatment sub-block to 1.4 Color

The --ambient-opacity / --ambient-saturate / --ambient-brightness
ladder lived only in :root; the rule it encodes (non-focused photos
recede; the focused photo is the subject) was the single most
important rule in a photographer's brand reference and was invisible
on the page. Render it as a side-by-side specimen using the system's
own placeholder-band fixtures.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 25: Phase 2 — Expand Colophon version line; create CHANGELOG.md

**Files:**
- Modify: `style-reference/index.html` (Colophon version line)
- Create: `style-reference/CHANGELOG.md`

- [ ] **Step 1: Expand the Colophon version line**

Edit `style-reference/index.html`:

```
old_string:
      <div class="sr-cell sr-cell--9 sr-colophon__body">
        <div>Set in ABC Diatype.</div>
        <div class="sr-colophon__signature">Kees Leemeijer<span class="dot">.</span></div>
        <div>2026-04-27 · v1</div>
      </div>

new_string:
      <div class="sr-cell sr-cell--9 sr-colophon__body">
        <div>Set in ABC Diatype.</div>
        <div class="sr-colophon__signature">Kees Leemeijer<span class="dot">.</span></div>
        <div>2026-04-27 · v1 · revisions logged in CHANGELOG.md</div>
      </div>
```

- [ ] **Step 2: Create CHANGELOG.md**

Create `style-reference/CHANGELOG.md`:

```markdown
# Changelog — Style Reference

Reverse-chronological. One entry per dated revision; each entry one line summarizing the change.

## 2026-04-27 — v1: Definitive Style Reference (truth pass + extension)

Truth pass (Phase 1): token discipline (placeholder-band, viewport-edge tokens promoted; #f0eadf and `.sr-cell--12` deleted; six raw hex placeholder-band uses replaced); brand decisions (red `#d72b2b` removed, 3.1 illustrative gradients replaced with placeholder-band fixtures); accessibility (charcoal-alpha contrast bumps, `--blue-soft` text uses moved to full `--blue`, `aria-labelledby` on every section, `:focus-visible` spec rendered, `prefers-reduced-motion` extended to `.identity` / `.compass`); responsive cliff closed at 1335px; demo keyframes renamed `sr-demo-*`; drift snapped to ladder; runtime/specimen divider banner; rationales rendered on the page; voice/copy formulas distributed to 2.2 / 2.3 / 3.1; "alectear-feel craft" substituted with "hand-crafted"; `?grid` flag documented; mobile-rendering technique commented.

Extension (Phase 2): Photograph treatment sub-block in 1.4 Color (ambient vs focused specimen); Colophon version line expanded; this CHANGELOG seeded; CLAUDE.md gains a Versioning section; Colophon gains a `surfaces — see surfaces.html (forthcoming)` forward-reference.

Spec: `docs/specs/2026-04-27-definitive-style-reference-design.md`.
Plan: `docs/plans/2026-04-27-definitive-style-reference.md`.

## 2026-04-27 — Styleguide revision

Trinity restructure (Foundations / Components / Patterns); per-component anatomy template; 3.1 Overlays pattern seeded; Tweaks panel removed.

Spec: `docs/specs/2026-04-27-styleguide-revision-design.md`.

## 2026-04-27 — Standalone style-reference workspace

Isolation pass: style-reference/ becomes self-contained (own CLAUDE.md, no `../` references), severs the parity contract with the portfolio's `styles.css`.

Spec: `docs/specs/2026-04-27-standalone-style-reference-design.md`.
```

- [ ] **Step 3: Verify**

Browse to `http://localhost:8000`. Scroll to Colophon. The version line now includes "revisions logged in CHANGELOG.md."

Confirm `style-reference/CHANGELOG.md` exists and has the seeded content.

- [ ] **Step 4: Commit**

```bash
git add style-reference/index.html style-reference/CHANGELOG.md
git commit -m "Phase 2: Expand Colophon version line; seed CHANGELOG.md

Version line in Colophon now points to CHANGELOG.md. The new file
is reverse-chronological, one entry per dated revision, seeded with
the three 2026-04-27 entries (this work + the styleguide revision +
the standalone workspace pass).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 26: Phase 2 — Add Versioning section to CLAUDE.md

**Files:**
- Modify: `style-reference/CLAUDE.md`

- [ ] **Step 1: Add the Versioning section**

Edit `style-reference/CLAUDE.md` — append before the "How to run" section (or wherever the rhythm reads cleanly):

```
old_string:
## How to run

```
python -m http.server
```

Then open `http://localhost:8000`.

new_string:
## Versioning

The reference is versioned by date in the masthead and Colophon (e.g. `v1 · 2026-04-27`). Cadence is event-driven, not periodic: a revision lands when a brand decision is made, a token changes, or a component is added/removed. Routine maintenance (typo fixes, comment updates) does not trigger a version bump.

- **Cadence:** event-driven. No fixed schedule. Major decisions land as a new dated entry in `CHANGELOG.md`.
- **Ownership:** Kees is the sole arbiter of brand decisions. The agent's role is to surface tensions, propose options, and stage decisions — never to silently change a token value or rename a brand concept without a flagged decision and Kees's approval.
- **Semver criteria:** the reference uses simple integer versions (`v1`, `v2`, `v3`...). A new major version is cut when the DNA changes — a palette member added or removed, the grid retuned, the elevation model expanded. Sub-major changes (token-discipline cleanups, accessibility fixes, voice clarifications) bump the date but stay on the same major.
- **Deprecation policy:** when a token, class, or rule is removed, it leaves immediately — no graveyard list, no temporary aliases. Old code in dependent surfaces (the bird-portfolio runtime) is downstream and gets updated separately. The reference's job is to be definitive *now*; deprecation lists become drift.

## How to run

```
python -m http.server
```

Then open `http://localhost:8000`.
```

- [ ] **Step 2: Commit**

```bash
git add style-reference/CLAUDE.md
git commit -m "Phase 2: Add Versioning section to CLAUDE.md

Cadence (event-driven), ownership (Kees), semver criteria (integer
majors on DNA changes), and deprecation policy (immediate removal
over graveyard lists). Lives in CLAUDE.md as agent context, not as
rendered content — versioning rules are about how the document is
maintained, not about the brand itself.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 27: Phase 2 — Add surfaces forward-reference to Colophon

**Files:**
- Modify: `style-reference/index.html` (Colophon — append forward-reference)

- [ ] **Step 1: Append the forward-reference to Colophon**

Edit `style-reference/index.html`:

```
old_string:
      <div class="sr-cell sr-cell--9 sr-colophon__body">
        <div>Set in ABC Diatype.</div>
        <div class="sr-colophon__signature">Kees Leemeijer<span class="dot">.</span></div>
        <div>2026-04-27 · v1 · revisions logged in CHANGELOG.md</div>
      </div>
      <div class="sr-cell sr-cell--9" style="margin-top:8px">
        <p class="sr-anatomy__usage" style="margin-top:0">Debug overlay: append <code>?grid</code> to the URL to see the cell-grid and page-edge strip rendered over the page (e.g. <code>localhost:8000/?grid</code>).</p>
      </div>

new_string:
      <div class="sr-cell sr-cell--9 sr-colophon__body">
        <div>Set in ABC Diatype.</div>
        <div class="sr-colophon__signature">Kees Leemeijer<span class="dot">.</span></div>
        <div>2026-04-27 · v1 · revisions logged in CHANGELOG.md</div>
      </div>
      <div class="sr-cell sr-cell--9" style="margin-top:8px">
        <p class="sr-anatomy__usage" style="margin-top:0">Surfaces — about, contact, single-photo viewer, and other applied page chrome — see <code>surfaces.html</code> (forthcoming). The reference defines the system; the surfaces document applies it.</p>
        <p class="sr-anatomy__usage" style="margin-top:6px">Debug overlay: append <code>?grid</code> to the URL to see the cell-grid and page-edge strip rendered over the page (e.g. <code>localhost:8000/?grid</code>).</p>
      </div>
```

- [ ] **Step 2: Verify**

Browse to `http://localhost:8000`. Scroll to Colophon. Below the version line, two notes now: the surfaces forward-reference and the `?grid` debug instruction.

- [ ] **Step 3: Phase 2 verification**

Re-run the Phase 1 verification steps (Task 23) to confirm Phase 2 additions don't regress anything:
1. Server is running.
2. Render at 1336px+ — page renders end-to-end, no console errors.
3. Render at 1335px and below — single-column, no horizontal scrollbar.
4. `?grid` flag works.
5. Reduced-motion still works.
6. Contrast still passes on the new Photograph treatment captions.
7. Lighthouse Accessibility still 95+.

- [ ] **Step 4: Commit**

```bash
git add style-reference/index.html
git commit -m "Phase 2: Add surfaces forward-reference to Colophon

The IA closed at 1–3 + 99 (no chapter 4); future surfaces (about,
contact, single-photo viewer, OG card, etc.) become a sibling
document. Add a forward-reference line in the Colophon so the
relationship is on the page: this reference defines the system;
surfaces.html (forthcoming) applies it.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Self-review checklist

After all 27 tasks land:

1. **Spec coverage** — verify each Phase 1 acceptance criterion (#1–17) and each Phase 2 acceptance criterion (#18–21) maps to at least one task. Quick map:
   - #1 (`:root` rationale comments) → Task 4
   - #2 (rationales on the page) → Task 16
   - #3 (placeholder-band tokens + replacements) → Task 2
   - #4 (red removed; on-palette indicator) → Task 5
   - #5 (3.1 gradients replaced with bands) → Task 6
   - #6 (runtime/specimen divider banner) → Task 1
   - #7 (`.sr-cell--12` deleted; `#f0eadf` replaced) → Task 3
   - #8 (`aria-labelledby` everywhere) → Task 9
   - #9 (WCAG AA contrast) → Tasks 7 + 8
   - #10 (`:focus-visible` rendered) → Task 11
   - #11 (reduced-motion extended) → Task 10
   - #12 (responsive cliff resolved) → Task 12
   - #13 (demo keyframes renamed; callout) → Task 13
   - #14 (drift snapped to ladder) → Tasks 14 + 15
   - #15 (alpha ladder + display roles rendered) → Tasks 17 + 18
   - #16 (voice/copy formulas in 2.2 / 2.3 / 3.1) → Task 19
   - #17 (server check, no errors) → Task 23
   - #18 (Photograph treatment sub-block) → Task 24
   - #19 (Colophon version line + CHANGELOG.md) → Task 25
   - #20 (CLAUDE.md Versioning section) → Task 26
   - #21 (surfaces forward-reference) → Task 27

2. **Placeholder scan** — search the plan for "TBD" / "TODO" / "implement later" / "appropriate error handling" / "similar to Task N." None should appear.

3. **Type/name consistency** — verify `--placeholder-band-a/b`, `--viewport-edge-d`, `--viewport-edge-corner`, `sr-demo-focus-fade`, `sr-demo-label-cycle`, `sr-demo-photo-decode`, `.sr-focus-demo`, `.sr-alpha-ladder`, `.sr-photo-treatment` are spelled identically across every task that references them.
