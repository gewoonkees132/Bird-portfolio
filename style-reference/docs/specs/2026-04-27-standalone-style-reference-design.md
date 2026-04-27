---
title: Standalone Style Reference — Design Spec
date: 2026-04-27
status: approved
author: Kees Leemeijer (with Claude)
supersedes: docs/superpowers/specs/2026-04-27-style-reference-design.md
---

# Standalone Style Reference

Convert `style-reference/` from a co-resident folder of the bird portfolio into a self-contained workspace for refining the Kees Leemeijer brand style. The agent opening `style-reference/` as the working directory has everything it needs to do style work — and nothing it doesn't.

## Why this changes

The previous spec defined `style-reference/` as a *leading source* for the portfolio's `styles.css`, with a strict `:root` parity contract and a two-commit cadence linking the two. In practice this coupled the two repos' development together: every style iteration had to consider portfolio impact, and the agent's context for style work was diluted by portfolio concerns (photo plane, app.js, mobile fallback, full-resolution image folders).

This spec severs that coupling. The portfolio's `styles.css` is now a frozen artifact relative to style-reference; if the portfolio is ever restyled, that becomes a deliberate, separate task. Style-reference becomes its own island, opened as its own workspace.

## Goals

- Style-reference can be opened as a workspace (`cd style-reference && claude` or equivalent) with zero need to read anything in the parent directory
- `python -m http.server` run from inside `style-reference/` renders the page correctly at `http://localhost:8000` with no broken assets
- The agent's context for style work is focused: identity, principles, tokens, grid, components, isolation rules — nothing about photo planes, panning, or mobile placeholder editions
- The boundary is structural, not a convention to remember: the folder simply has no `../` references

## Non-goals

- Making style-reference a separate git repo. It stays a subdirectory of the bird-portfolio repo.
- Changing the visual design of the specimen page. This is a structural and contextual refactor; nothing about how the page looks should change.
- Defining a future restyle of the bird portfolio. Out of scope; the portfolio is frozen for the purposes of this work.
- Build tooling, preprocessing, framework adoption. Vanilla HTML/CSS only, as before.

## Folder structure

```
style-reference/
  index.html          existing — specimen page
  style.css           existing — canonical CSS (the system)
  CLAUDE.md           NEW — agent context for style work
  files/
    logo.svg          NEW — copy of files/logo/SVG/logo.svg, flat path
  docs/
    specs/            NEW — design specs land here; this spec is the first
    plans/            NEW — implementation plans land here; empty initially
```

Top level remains lean: three files (`index.html`, `style.css`, `CLAUDE.md`) plus two folders (`files/`, `docs/`). Day-to-day refinement is editing `style.css` against the live `index.html` specimen — `docs/` exists for when a change is large enough to warrant a written design.

## File-level changes

### `style-reference/index.html`

Six outward-pointing references must be rewritten. Four are asset paths to the logo (rewrite to `files/logo.svg`); two are `href="../"` anchors back to the portfolio (replace the anchor element entirely, since there is no portfolio in this workspace's frame of reference).

**Asset path rewrites** (`../files/logo/SVG/logo.svg` → `files/logo.svg`):

| Line | Element |
| --- | --- |
| 8 | `<link rel="icon" type="image/svg+xml" href="...">` |
| 58 | Masthead wordmark `<img>` |
| 293 | Components-section identity-sample `<img class="pictogram">` |
| 344 | Components-section brand-card `<img class="brand-picto">` |

**Anchor replacements** (`<a href="../">` → non-link element, preserving classes):

| Line | Before | After |
| --- | --- | --- |
| 57 | `<a class="sr-cell sr-cell--3 sr-masthead__wordmark" href="../" aria-label="Back to portfolio">` | `<span class="sr-cell sr-cell--3 sr-masthead__wordmark">` (closing `</a>` becomes `</span>`) |
| 292 | `<a class="identity" href="../" aria-label="Identity sample (back to portfolio)">` | `<div class="identity">` (closing `</a>` becomes `</div>`) |

Visual treatment must stay identical — both replacements preserve the existing class names so all `.sr-masthead__wordmark` and `.identity` CSS rules continue to apply. If any rule relies on the element being an anchor (`a:hover`, `a` default colour inheritance), it must be updated to use the class selector instead. This is a verification step in the implementation plan, not a presumed change.

### `style-reference/files/logo.svg`

Copy of `files/logo/SVG/logo.svg` from the bird-portfolio repo. Path is flattened (`files/logo.svg`, not `files/logo/SVG/logo.svg`) because the deeper structure exists to organise SVG/PNG/etc. variants in the portfolio repo, which is not a concern for the standalone reference.

### `style-reference/CLAUDE.md`

New file. Substantive but tight. Sections, in order:

1. **One-paragraph mission.** This is a self-contained workspace for refining the Kees Leemeijer brand style. The specimen page at `index.html` *is* the system; if it's not visible on the page, it's not part of the brand.
2. **Identity (verbatim).** `Munich '72 spirited inheritance · alectear-feel craft`
3. **Four principles (verbatim from the prior spec).** Asymmetric alignment · Italic blue Latin as the sole italic accent · Mono for utility text only · 1px corner radius (sharp, almost square; shadows do the lift).
4. **Grid.** 9 columns × 120px cell × 24px gutter on a 1320px tile, 8px page-edge, 1336px outer. Token names: `--cols`, `--cell`, `--gutter`, `--tile-width`, `--page-edge`, `--page-width`, `--stride` (= `--cell` + `--gutter`).
5. **Tokens.** Defined in the two `:root` blocks at the top of `style.css`. Pointer only; CLAUDE.md does not duplicate values (drift risk).
6. **Component inventory.** Identity (wordmark + dot), species label (line-name + italic blue Latin + uppercase blue-soft meta), compass, photo cell (placeholder + `.is-focused`), brand card, tweaks panel (rendered open, controls inert), mobile cell.
7. **How to run.** `python -m http.server` from this folder; open `http://localhost:8000`.
8. **Isolation rules.**
   - Vanilla HTML/CSS only. No build, no framework, no preprocessor, no JS dependency for the page to render.
   - The specimen IS the spec. Don't add anti-patterns, captions, or do/don't comparisons; the rendered system speaks for itself.
   - Do not reach above this folder. The bird-portfolio repo containing this directory is unrelated to brand-style work.
   - This folder is not synced to anything. There is no parity contract; do not attempt to update or check the portfolio's `styles.css`.

### `style-reference/docs/specs/`, `style-reference/docs/plans/`

Empty folders to be created. The brainstorming and writing-plans skills default to `docs/superpowers/specs/` and `docs/superpowers/plans/`; the simpler `docs/specs/` and `docs/plans/` paths are a deliberate, user-preferred override (consistent with "as clean as possible"). The CLAUDE.md notes this so the agent writes specs/plans to the simpler paths.

### `docs/superpowers/specs/2026-04-27-style-reference-design.md` (the old spec, in the parent repo)

Marked superseded. Add a header at the top, immediately under the existing frontmatter:

```
> **STATUS: Superseded (2026-04-27).** This spec encoded a "leading source / portfolio follows" model that was severed. The current source of truth lives at `style-reference/docs/specs/2026-04-27-standalone-style-reference-design.md`.
```

The old spec is preserved (not deleted) for historical context — it documents what the parity-contract era looked like.

### `CLAUDE.md` (root, in the parent repo)

Add a single short section acknowledging the boundary. Append after the existing "How to run" block:

```
## style-reference/ is a separate workspace

The `style-reference/` subdirectory is a self-contained workspace for refining the Kees Leemeijer brand style. It has its own `CLAUDE.md`. Open it directly when working on style; do not edit its files from this workspace, and do not assume any synchronization between `style-reference/style.css` and the portfolio's `styles.css`.
```

## What is intentionally *not* in CLAUDE.md

- Token *values*. They live in `style.css :root`. Duplicating invites drift.
- The full component spec (sizes, spacing, exact colours per component). Visible on the rendered specimen; reading the CSS or the page is faster than reading prose.
- A list of every section on the page. The HTML structure is the source.
- Acceptance criteria for the specimen itself. That's the prior spec's job; superseded but archived.

## Acceptance criteria

The refactor is complete when all of the following hold:

1. `style-reference/CLAUDE.md` exists and contains the eight sections listed above.
2. `style-reference/files/logo.svg` exists and is a byte-identical copy of `files/logo/SVG/logo.svg`.
3. `style-reference/docs/specs/` and `style-reference/docs/plans/` exist (the specs folder contains this spec; plans is empty).
4. `style-reference/index.html` contains zero occurrences of `../` (verifiable via grep).
5. `style-reference/style.css` is unchanged from its pre-refactor state (the `:root` block and all rules untouched).
6. Running `python -m http.server` from inside `style-reference/` and opening `http://localhost:8000` renders the page with no 404s in the network panel and the wordmark logo visible in the masthead.
7. Neither the masthead wordmark nor the components-section identity sample is a link (no underline-on-hover, no cursor change, no navigation on click). Visual appearance of both is otherwise identical to before.
8. The old spec at `docs/superpowers/specs/2026-04-27-style-reference-design.md` has the **STATUS: Superseded** banner.
9. Root `CLAUDE.md` contains the new "style-reference/ is a separate workspace" section.

## Out of scope (explicitly)

- Updating any file under bird-portfolio root other than `CLAUDE.md` and the old spec. The portfolio's `index.html`, `app.js`, `styles.css` are not touched.
- Adding new components, tokens, sections, or visual treatments to the specimen.
- Migrating other docs (token-loading-optimization, style-reference-grid) into the new location. Those remain in the parent repo.
- Setting up CI, linting, or test infrastructure inside `style-reference/`. Vanilla project, no tooling layer.

## Open questions

None. All decisions captured during brainstorming.
