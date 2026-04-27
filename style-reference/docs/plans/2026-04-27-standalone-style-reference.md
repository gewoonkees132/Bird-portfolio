# Standalone Style Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `style-reference/` into a self-contained workspace with no `../` references and its own `CLAUDE.md`, so an agent opening that folder has full context for brand-style work.

**Architecture:** Severance refactor — copy the one cross-folder asset (`logo.svg`) into the standalone workspace, rewrite all six outward references in `index.html`, add a focused `CLAUDE.md` for the workspace, mark the old parity-contract spec as superseded, and acknowledge the new boundary in the parent's `CLAUDE.md`. The CSS file is intentionally untouched except for one rule (`cursor: pointer` on `.identity`) that conflicted with the "not a link" acceptance criterion once the element stopped being an anchor.

**Tech Stack:** Vanilla HTML/CSS only. No build step, no framework, no JS for the specimen page to render. Verifications are bash commands (`grep`, `diff`, `sha256sum`, `curl`) plus a manual visual check.

---

## Spec coverage

| Spec acceptance criterion | Implemented by |
| --- | --- |
| 1. `style-reference/CLAUDE.md` with eight sections | Task 4 |
| 2. `style-reference/files/logo.svg` byte-identical copy | Task 1 |
| 3. `style-reference/docs/specs/` and `style-reference/docs/plans/` exist | Pre-task setup (this plan creates `plans/` by being saved there; `specs/` already holds the standalone spec) |
| 4. Zero `../` in `style-reference/index.html` | Tasks 2 + 3 |
| 5. `style-reference/style.css` unchanged from pre-refactor state | Task 3 deviates: removes one rule (`cursor: pointer` on `.identity`) — see "Plan deviation from spec" below |
| 6. Renders at `http://localhost:8000` with no 404s, logo visible | Task 7 verification |
| 7. Masthead wordmark and identity sample are not links (no hover underline, no cursor change, no nav) | Task 3 |
| 8. Old spec has STATUS: Superseded banner | Task 5 |
| 9. Root `CLAUDE.md` has new "style-reference/ is a separate workspace" section | Task 6 |

## Plan deviation from spec

The spec's acceptance criterion 5 says `style-reference/style.css` is unchanged. Acceptance criterion 7 says the identity sample shows "no cursor change" on hover. These conflict because `style-reference/style.css:240` currently has `cursor: pointer;` on `.identity`. Once `.identity` becomes a `<div>`, that rule still fires and the cursor *does* change on hover, violating criterion 7.

Resolution: Task 3 removes that single `cursor: pointer;` declaration. This is the one CSS edit the plan makes. The spec itself anticipated this case ("If any rule relies on the element being an anchor, it must be updated. This is a verification step in the implementation plan, not a presumed change.") — the verification surfaced this rule, and the plan resolves it.

`.sr-masthead__wordmark` does **not** need a CSS edit: it has no explicit `cursor: pointer`. Its pointer cursor today comes from `<a>`'s user-agent default. Changing the element to `<span>` removes that automatically.

## File-level changes

| File | Change |
| --- | --- |
| `style-reference/files/logo.svg` | Created (byte copy of `files/logo/SVG/logo.svg`) |
| `style-reference/index.html` | 4 asset paths rewritten + 2 anchor elements replaced (6 outward refs total) |
| `style-reference/style.css` | One line removed: `cursor: pointer;` inside `.identity { ... }` block |
| `style-reference/CLAUDE.md` | Created |
| `style-reference/docs/plans/2026-04-27-standalone-style-reference.md` | Created (this file) |
| `docs/superpowers/specs/2026-04-27-style-reference-design.md` | Superseded banner inserted after frontmatter |
| `CLAUDE.md` (root) | New "style-reference/ is a separate workspace" section appended |

---

## Task 1: Copy logo asset into workspace

**Files:**
- Read source: `files/logo/SVG/logo.svg`
- Create: `style-reference/files/logo.svg`

- [ ] **Step 1: Capture source hash for later byte-identity check**

```bash
sha256sum files/logo/SVG/logo.svg
```
Expected: hash output. Note it.

- [ ] **Step 2: Copy file (creates the destination folder)**

```bash
mkdir -p style-reference/files && cp files/logo/SVG/logo.svg style-reference/files/logo.svg
```

- [ ] **Step 3: Verify byte-identical copy**

```bash
diff -q files/logo/SVG/logo.svg style-reference/files/logo.svg && sha256sum style-reference/files/logo.svg
```
Expected: no diff output; hash matches Step 1.

- [ ] **Step 4: Commit**

```bash
git add style-reference/files/logo.svg
git commit -m "Add standalone logo asset to style-reference workspace

Byte-identical copy of files/logo/SVG/logo.svg, flattened to
style-reference/files/logo.svg. The deeper SVG/ structure exists
to organise variants in the parent repo and is not relevant to
the standalone workspace."
```

## Task 2: Rewrite asset paths in `index.html` (4 places)

After Task 1, the asset exists at the new path. This task points the HTML at it. Until both this task and Task 3 land, `index.html` still has `../` references; that's expected mid-flight.

**Files:**
- Modify: `style-reference/index.html` (lines 8, 58, 293, 344)

- [ ] **Step 1: Rewrite favicon link (line 8)**

Use Edit to change:
```html
<link rel="icon" type="image/svg+xml" href="../files/logo/SVG/logo.svg" />
```
To:
```html
<link rel="icon" type="image/svg+xml" href="files/logo.svg" />
```

- [ ] **Step 2: Rewrite masthead wordmark `<img>` (line 58)**

Use Edit to change:
```html
        <img src="../files/logo/SVG/logo.svg" alt="" aria-hidden="true" />
```
To:
```html
        <img src="files/logo.svg" alt="" aria-hidden="true" />
```

(The leading 8 spaces are part of the existing indentation — preserve exactly.)

- [ ] **Step 3: Rewrite identity-sample pictogram `<img>` (line 293)**

Use Edit to change:
```html
            <img class="pictogram" src="../files/logo/SVG/logo.svg" alt="" aria-hidden="true" />
```
To:
```html
            <img class="pictogram" src="files/logo.svg" alt="" aria-hidden="true" />
```

- [ ] **Step 4: Rewrite brand-card pictogram `<img>` (line 344)**

Use Edit to change:
```html
              <img class="brand-picto" src="../files/logo/SVG/logo.svg" alt="" aria-hidden="true" />
```
To:
```html
              <img class="brand-picto" src="files/logo.svg" alt="" aria-hidden="true" />
```

- [ ] **Step 5: Verify zero `logo/SVG/` paths remain and four `files/logo.svg` references exist**

```bash
grep -n "logo/SVG/" style-reference/index.html
```
Expected: no output.

```bash
grep -c "files/logo.svg" style-reference/index.html
```
Expected: `4`.

- [ ] **Step 6: Commit**

```bash
git add style-reference/index.html
git commit -m "Point style-reference asset paths at the local logo

Four references — favicon link, masthead wordmark img, components
identity-sample img, brand-card img — now resolve to
files/logo.svg inside the workspace instead of ../files/logo/SVG/
in the parent repo."
```

## Task 3: Replace anchor elements with non-link elements + remove `cursor: pointer`

The masthead wordmark and identity sample currently link back to the parent portfolio (`href="../"`). The standalone workspace has no parent to link to; the elements become inert containers. Class names are preserved so all visual styling continues to apply.

The `cursor: pointer` removal lands in the same commit because it's the half of the change that completes acceptance criterion 7 — without it, the new `<div>` still shows the pointer cursor on hover (link-like).

**Files:**
- Modify: `style-reference/index.html` (lines 57+60, 292+295)
- Modify: `style-reference/style.css:240`

- [ ] **Step 1: Replace masthead wordmark `<a>` with `<span>`**

Use Edit to change:
```html
      <a class="sr-cell sr-cell--3 sr-masthead__wordmark" href="../" aria-label="Back to portfolio">
        <img src="files/logo.svg" alt="" aria-hidden="true" />
        <span>Kees Leemeijer<span class="dot">.</span></span>
      </a>
```
To:
```html
      <span class="sr-cell sr-cell--3 sr-masthead__wordmark">
        <img src="files/logo.svg" alt="" aria-hidden="true" />
        <span>Kees Leemeijer<span class="dot">.</span></span>
      </span>
```

(Opening `<a ...>` becomes `<span class="sr-cell sr-cell--3 sr-masthead__wordmark">` — `href` and `aria-label` removed. Closing `</a>` becomes `</span>`. Inner two lines unchanged.)

- [ ] **Step 2: Replace identity-sample `<a>` with `<div>`**

Use Edit to change:
```html
          <a class="identity" href="../" aria-label="Identity sample (back to portfolio)">
            <img class="pictogram" src="files/logo.svg" alt="" aria-hidden="true" />
            <span><span class="name">Kees Leemeijer</span><span class="dot">.</span></span>
          </a>
```
To:
```html
          <div class="identity">
            <img class="pictogram" src="files/logo.svg" alt="" aria-hidden="true" />
            <span><span class="name">Kees Leemeijer</span><span class="dot">.</span></span>
          </div>
```

(Opening becomes `<div class="identity">`. Closing becomes `</div>`. Inner two lines unchanged.)

- [ ] **Step 3: Remove `cursor: pointer;` from `.identity` block in `style.css`**

The `.identity` block in `style-reference/style.css` (around line 225–241) currently ends:

```css
  opacity: 0;
  animation: fadeIn 200ms ease-out 80ms forwards;
  cursor: pointer;
}
```

Use Edit to change:
```css
  opacity: 0;
  animation: fadeIn 200ms ease-out 80ms forwards;
  cursor: pointer;
}
```
To:
```css
  opacity: 0;
  animation: fadeIn 200ms ease-out 80ms forwards;
}
```

(The five-line context anchors the change so it doesn't ambiguously match the other `cursor: pointer` at line 466 — different block.)

- [ ] **Step 4: Verify zero `../` references in `index.html` and exactly one `cursor: pointer` left in `style.css`**

```bash
grep -n "\.\./" style-reference/index.html
```
Expected: no output.

```bash
grep -n "Back to portfolio\|back to portfolio" style-reference/index.html
```
Expected: no output (both old aria-labels gone).

```bash
grep -c "cursor: pointer" style-reference/style.css
```
Expected: `1` (only the unrelated rule at line 466 remains).

- [ ] **Step 5: Smoke-test the page renders without 404s**

Start the server in the standalone folder, hit three URLs, then stop the server.

```bash
(cd style-reference && python -m http.server 8765 &) ; sleep 2
curl -s -o /dev/null -w "/ %{http_code}\n" http://localhost:8765/
curl -s -o /dev/null -w "/files/logo.svg %{http_code}\n" http://localhost:8765/files/logo.svg
curl -s -o /dev/null -w "/style.css %{http_code}\n" http://localhost:8765/style.css
pkill -f "http.server 8765" 2>/dev/null || true
```
Expected: three `200` lines.

- [ ] **Step 6: Commit**

```bash
git add style-reference/index.html style-reference/style.css
git commit -m "Sever style-reference's parent-portfolio links

The masthead wordmark and components-section identity sample
no longer link to ../. The <a> elements become a <span> and
<div> respectively; class names are preserved so visual styling
is identical. Drop cursor:pointer on .identity so the now-non-
link element doesn't pretend to be clickable."
```

## Task 4: Create `style-reference/CLAUDE.md`

Eight sections, content quoted verbatim from the spec where the spec marks it verbatim. The mission paragraph is the lead-in (no `##` heading); the remaining seven sections are headed.

**Files:**
- Create: `style-reference/CLAUDE.md`

- [ ] **Step 1: Write the file**

Content (exact bytes):

```markdown
# Style Reference — Notes for Claude

This is a self-contained workspace for refining the Kees Leemeijer brand style. The specimen page at `index.html` *is* the system; if it's not visible on the page, it's not part of the brand.

## Identity

Munich '72 spirited inheritance · alectear-feel craft

## Principles

- Asymmetric alignment
- Italic blue Latin as the sole italic accent
- Mono for utility text only
- 1px corner radius (sharp, almost square; shadows do the lift)

## Grid

9 columns × 120px cell × 24px gutter on a 1320px tile, 8px page-edge, 1336px outer.

Token names: `--cols`, `--cell`, `--gutter`, `--tile-width`, `--page-edge`, `--page-width`, `--stride` (= `--cell` + `--gutter`).

## Tokens

Defined in the two `:root` blocks at the top of `style.css`. This file does not duplicate the values — drift risk.

## Component inventory

- Identity (wordmark + dot)
- Species label (line-name + italic blue Latin + uppercase blue-soft meta)
- Compass
- Photo cell (placeholder + `.is-focused`)
- Brand card
- Tweaks panel (rendered open, controls inert)
- Mobile cell

## How to run

\`\`\`
python -m http.server
\`\`\`

Then open `http://localhost:8000`.

## Isolation rules

- Vanilla HTML/CSS only. No build, no framework, no preprocessor, no JS dependency for the page to render.
- The specimen IS the spec. Don't add anti-patterns, captions, or do/don't comparisons; the rendered system speaks for itself.
- Do not reach above this folder. The bird-portfolio repo containing this directory is unrelated to brand-style work.
- This folder is not synced to anything. There is no parity contract; do not attempt to update or check the portfolio's `styles.css`.
- Specs go in `docs/specs/`, plans in `docs/plans/` (simpler than the default `docs/superpowers/specs|plans/`).
```

(Note for the executing agent: the lines `\`\`\`` above are escaped here so this plan renders in markdown. In the actual `CLAUDE.md` file, write three real backticks each — the standard fenced code block. There should be exactly one fenced block in the file, around `python -m http.server`.)

- [ ] **Step 2: Verify section count and absence of duplicated token values**

```bash
grep -c "^## " style-reference/CLAUDE.md
```
Expected: `7` (mission paragraph has no `##` heading; seven `##` sections follow).

```bash
grep -E "#[0-9a-fA-F]{6}|rgb\(|rgba\(|var\(--" style-reference/CLAUDE.md
```
Expected: no output (no token values duplicated; only token *names* in the Grid section).

- [ ] **Step 3: Commit**

```bash
git add style-reference/CLAUDE.md
git commit -m "Add CLAUDE.md for style-reference workspace

Eight-section context doc: mission paragraph, identity, four
principles, grid math, token pointer, component inventory, run
instruction, and isolation rules. Token values stay in style.css
to avoid drift. Adds the simpler docs/specs and docs/plans
convention so future specs/plans land in the right place."
```

## Task 5: Mark old spec as superseded

**Files:**
- Modify: `docs/superpowers/specs/2026-04-27-style-reference-design.md` (insert banner immediately under frontmatter)

- [ ] **Step 1: Confirm current head of file**

```bash
head -8 docs/superpowers/specs/2026-04-27-style-reference-design.md
```
Expected:
```
---
title: Style Reference — Design Spec
date: 2026-04-27
status: approved
author: Kees Leemeijer (with Claude)
---

# Style Reference
```

- [ ] **Step 2: Insert the superseded banner between the closing `---` and the `# Style Reference` heading**

Use Edit to change:
```
author: Kees Leemeijer (with Claude)
---

# Style Reference
```
To:
```
author: Kees Leemeijer (with Claude)
---

> **STATUS: Superseded (2026-04-27).** This spec encoded a "leading source / portfolio follows" model that was severed. The current source of truth lives at `style-reference/docs/specs/2026-04-27-standalone-style-reference-design.md`.

# Style Reference
```

(Frontmatter `status:` field is intentionally left as `approved` — the spec only asked for the banner; do not modify the frontmatter.)

- [ ] **Step 3: Verify the banner is in place**

```bash
grep -n "STATUS: Superseded" docs/superpowers/specs/2026-04-27-style-reference-design.md
```
Expected: one match.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-27-style-reference-design.md
git commit -m "Mark style-reference parity-contract spec as superseded

The leading-source / portfolio-follows model is replaced by the
standalone-workspace model in style-reference/docs/specs/
2026-04-27-standalone-style-reference-design.md. The old spec
is preserved for historical context."
```

## Task 6: Add boundary section to root `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md` (append section after "How to run")

- [ ] **Step 1: Confirm current tail of file**

```bash
tail -10 CLAUDE.md
```
Expected (last lines):
```
## How to run

```
python -m http.server
```

Then open `http://localhost:8000`.
```

- [ ] **Step 2: Append the new section**

Use Edit to change the existing tail:
```
Then open `http://localhost:8000`.
```
To:
```
Then open `http://localhost:8000`.

## style-reference/ is a separate workspace

The `style-reference/` subdirectory is a self-contained workspace for refining the Kees Leemeijer brand style. It has its own `CLAUDE.md`. Open it directly when working on style; do not edit its files from this workspace, and do not assume any synchronization between `style-reference/style.css` and the portfolio's `styles.css`.
```

(Result: file ends with the new section. No trailing fenced block; the new section is plain prose.)

- [ ] **Step 3: Verify the section is present**

```bash
grep -n "style-reference/ is a separate workspace" CLAUDE.md
```
Expected: one match.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "Acknowledge style-reference/ boundary in root CLAUDE.md

A short section telling agents in the parent repo that
style-reference/ is its own workspace, has its own CLAUDE.md,
and is not synced with the portfolio's styles.css."
```

## Task 7: Final acceptance verification (no commit)

Walk every acceptance criterion from the spec and confirm.

- [ ] **Step 1: Acceptance 1 — `style-reference/CLAUDE.md` exists with eight sections**

```bash
test -f style-reference/CLAUDE.md && grep -c "^## " style-reference/CLAUDE.md
```
Expected: `7` (plus the mission paragraph = 8 total).

- [ ] **Step 2: Acceptance 2 — `style-reference/files/logo.svg` byte-identical to source**

```bash
diff -q files/logo/SVG/logo.svg style-reference/files/logo.svg
```
Expected: no output.

- [ ] **Step 3: Acceptance 3 — `style-reference/docs/specs/` and `style-reference/docs/plans/` exist**

```bash
test -d style-reference/docs/specs && test -d style-reference/docs/plans && echo OK
```
Expected: `OK`.

- [ ] **Step 4: Acceptance 4 — zero `../` in `style-reference/index.html`**

```bash
grep -c "\.\./" style-reference/index.html
```
Expected: `0`.

- [ ] **Step 5: Acceptance 5 — `style-reference/style.css` only changed by removing one `cursor: pointer;` line**

Find the commit just before the plan started (the most recent commit on `main` before Task 1's logo commit). At plan-write time the branch tip was `f32161e Add standalone style-reference design spec`, so use that as the baseline.

```bash
git diff f32161e -- style-reference/style.css
```
Expected: a single removed line:
```
-  cursor: pointer;
```
…and nothing else. (If the diff is empty, Task 3 Step 3 was skipped. If it shows other changes, investigate before declaring done.)

- [ ] **Step 6: Acceptance 6 — server renders, no 404s, logo visible**

```bash
(cd style-reference && python -m http.server 8765 &) ; sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/files/logo.svg
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/style.css
pkill -f "http.server 8765" 2>/dev/null || true
```
Expected: three `200`s.

Then open `http://localhost:8000` (after restarting the server on port 8000) in a browser and visually confirm:
- Masthead wordmark logo + "Kees Leemeijer." text visible top-left of the masthead area.
- In the Components section, the IDENTITY tile shows the same wordmark inline with no underline-on-hover and a default (not pointer) cursor.
- The BRAND CARD tile's pictogram is visible.

- [ ] **Step 7: Acceptance 7 — neither replaced element is a link**

```bash
grep -E "<a [^>]*sr-masthead__wordmark|<a [^>]*identity" style-reference/index.html
```
Expected: no output.

Manual: hover the masthead wordmark and the identity tile in the browser. The cursor must remain the default (text/arrow) cursor; no underline appears; clicking does nothing.

- [ ] **Step 8: Acceptance 8 — old spec has Superseded banner**

```bash
grep -n "STATUS: Superseded" docs/superpowers/specs/2026-04-27-style-reference-design.md
```
Expected: one match.

- [ ] **Step 9: Acceptance 9 — root `CLAUDE.md` has new boundary section**

```bash
grep -n "style-reference/ is a separate workspace" CLAUDE.md
```
Expected: one match.

- [ ] **Step 10: Confirm nothing else was committed by accident**

```bash
git status
git log --oneline -7
```
Expected: clean working tree; the last 6 commits are the ones from Tasks 1–6 (in order: logo, asset paths, sever links, CLAUDE.md, supersede banner, root boundary). Anything else means a stray change slipped in — investigate before declaring done.

---

## Out of scope (re-stated from spec)

- Do **not** touch the portfolio's `index.html`, `app.js`, `styles.css`, or `tessellation-options.html` / `aspect-tessellation.html`.
- Do **not** add new components, tokens, sections, or visual treatments to the specimen.
- Do **not** migrate other docs (token-loading-optimization, style-reference-grid) into the new location.
- Do **not** set up CI, linting, or test infrastructure inside `style-reference/`.
