---
title: Definitive Style Reference — Phase 3 (close-out) — Design Spec
date: 2026-04-27
status: draft
author: Kees Leemeijer (with Claude)
predecessor: docs/specs/2026-04-27-definitive-style-reference-design.md
---

# Definitive Style Reference — Phase 3

Phase 1 (truth pass) and Phase 2 (extension) of the predecessor spec are shipped — see `CHANGELOG.md` and the 25 commits between `81e37d2` and `b5eb1aa`. This Phase 3 closes the residual gaps that the second-read brief surfaces against the post-execution state. It is purely additive: no decision from the predecessor spec is reopened.

## Why this changes

After Phase 1+2, the reference is truthful about what it claims and the system-completeness gaps it can close without inventing have been closed. A second-read against the brief still finds three flavors of remaining work:

- **Net-new findings.** A heading-order violation, a missing skip link, a new pair of dark photographic stand-in hexes added during Phase 1's gradient replacement, three runtime states (`.is-entering` / `.is-entered`) that exist but aren't documented, an undocumented typographic arrow in the overlay primitives.
- **Half-finished prior items.** The stat-highlight `<b>` pattern that Phase 1 resolved (E1: keep + document) had its decision land but not its documentation. A handful of `[edit: Kees]` markers were left in `style.css` for review.
- **System-completeness gaps the predecessor deferred but the brief reopens.** Iconography rule, photo aspect rule. Both close a one-line ambiguity rendered on the page; neither requires inventing brand behavior the runtime doesn't already exhibit.

Items that *would* require the reference to lead the runtime (inter-arrangement transition choreography, error/empty/offline states, B&W permissibility, image min-resolution) stay deferred. The reference's job is to be definitive about what the brand *does*, not to coin behavior the runtime doesn't perform.

## Goals

- The reference passes a fresh accessibility read at WCAG AA, including heading order and skip-to-content navigation.
- Every hardcoded value in `style.css` either is a token, uses a token, or carries an inline justification that names what would trigger promotion.
- Every state the runtime exhibits visually (default, focused, ambient, decode/loading) is rendered as a specimen on the page.
- Every typographic glyph the brand uses on rendered surfaces (the dot, the trailing arrow) is acknowledged as part of the system or absent from it.
- Voice across `.sr-anatomy__usage` bodies is uniform: third-person systemic, descriptive present tense, ~30-word soft cap.
- Every `[edit: Kees]` marker remaining in `style.css` is either resolved (Kees's voice replaces the draft) or explicitly held over.

## Non-goals

- Reopening any of the six tensions resolved in the predecessor (C1, D1, E1, G2, viewport-edge tokenization, Claude rationale drafts). The defaults stand.
- Per-component anti-patterns / "do/don't" panels — the restraint principle holds.
- Semantic upgrade of token cells from `<div>` to `<dl>/<dt>/<dd>`. Render is the contract.
- Coining brand behavior the runtime doesn't perform: B&W policy, error/empty/offline states, A→B inter-arrangement choreography, image min-resolution, crop policy details.
- 3.0 Patterns shelf expansion. A candidate (`Photo focus choreography`) is named in `## Future candidates`; not shipped here.
- Two `:root` blocks → merge. Neither change is high-leverage; the split is at worst neutral.
- CSS modernization (cascade layers, nesting, logical properties, `color-mix`, `light-dark`, container queries, framework adoption).
- Surfaces document. The colophon's forward-reference earned in Phase 2 is sufficient.

## Locked decisions

These are settled going in. Nothing in `## Phase 3` contradicts them.

1. **Phase 3 is additive only.** No decision from the predecessor spec is reopened. The defaults from the predecessor's *Tensions flagged for Kees* stand as commits `42189fd` (C1), `759c88d` (D1), the documented-but-not-rendered E1 (corrected here), `58c2758` (G2), `60c0e55` (viewport-edge tokenized), and the `[edit: Kees]` markers preserved as-is in code.
2. **Reference cannot lead the runtime.** Any state, transition, or behavior the runtime does not exhibit is out of scope for the reference. If it appears in `app.js`, the reference may render it; if not, it stays out until the runtime ships it.
3. **D3 — Decode/loading state lives in 2.4 Photo cell** as a third specimen alongside default + focused, not in 1.7 or 1.8. It is a *state of a component*, not a motion primitive or an elevation rule. The `sr-demo-photo-decode` keyframe exists; reuse it.
4. **D1 — Iconography rule:** the brand permits exactly two glyph kinds. The `files/logo.svg` pictogram (the only image asset) and the typographic right-arrow (`→`, U+2192) for inline links. Anything else — SVG chevrons, lucide/feather icons, emoji — is absent from the system. The rule is rendered as one line in 1.2 Identity.
5. **D2 — Photo aspect rule:** 3:2 is *canonical, others permitted*. The grid math is built around 3:2 (35mm full-frame); other aspects render at the same height — landscape crops horizontally via `object-fit: cover`, portrait band-pads with the placeholder gradient. Square crops are disallowed (they break the 3:2 tessellation math). One line in 1.4 Color → Photograph treatment.

## Phase 3 — Close-out

Findings grouped by category, ordered P0 → P1 → P2 within each. Every finding cites a line or selector against the post-execution state of `style.css` and `index.html`.

### A. Accessibility

**A1 — P0 — Heading-order violation.** `index.html:15` opens with `<h2 id="sr-00" class="sr-section__title">Masthead</h2>`. `index.html:27` then introduces `<h1 class="sr-cell sr-cell--5 sr-masthead__title-display">Style Reference</h1>` *inside* that section, after the `<h2>`. The page-title `<h1>` therefore appears in document order *after* its parent section's `<h2>`. Two on-brand fixes:

- **A1a (proposed).** Lift `<h1>Style Reference</h1>` out of the masthead `<section>` into a sibling `<header>` block placed immediately before it inside `<main>`. The masthead's `<h2>Masthead</h2>` keeps its tag — it is now correctly preceded by the document's `<h1>`. Visual layout: the `<header>` carries `.sr-masthead__title-display` styling and renders identically; the masthead `<section>` retains `00`, the `<h2>`, and the version-meta cell, but no longer carries the page title. Touches `index.html:13–31` and adds one `<header>` block; CSS unchanged. This is the smallest semantic shift.
- **A1b.** Restructure: the entire masthead becomes a `<header>` (not a `<section>`), `<h2>Masthead</h2>` becomes the page's `<h1>Style Reference</h1>`, and "00 Masthead" is a numeric label that does not need its own heading. Larger restructure; touches more of `index.html:13–31` and the `.sr-masthead` selector chain.

Default if silent: **A1a**. Tension flagged.

**A2 — P0 — Skip link absent.** Nine sections plus colophon; keyboard-only and screen-reader users land on the masthead with no shortcut to content. Add `<a class="sr-skip" href="#sr-1-1">Skip to content</a>` as the first focusable element inside `<body>`. The link is visually hidden by default (`position: absolute; clip: rect(0 0 0 0);` etc.) and reveals on `:focus-visible` with on-palette styling: `--charcoal` text on `--field`, 1px radius, the existing `:focus-visible` outline rule applies (`style.css:449–453`).

The skip target — `#sr-1-1` (1.1 Principles, the first content section) rather than `#sr-00` — sends keyboard users past the masthead chrome and into the brand's first substantive content. Document the chosen anchor in a CSS comment.

**A3 — P1 — Verify post-execution contrast did not regress.** Phase 1 bumped charcoal-alpha values to AA at the rendered sizes. Re-measure after the masthead restructure: `.sr-section__stats`, `.sr-cell__label`, `.sr-anatomy__usage`, `.sr-token__k` all read against `--field`. No change expected; record the measurements as a one-paragraph note inside the spec for traceability.

### B. Token discipline

**B1 — P1 — DKHex decision.** The dark stand-in hexes at `style.css:1473–1474` (`#4a3520`, `#3a2a18`) were introduced by Phase 1's gradient-replacement (commit `24336bf`) to power the warm-toned applied-overlay specimen. The inline comment names them as local-not-promoted; the brief surfaces this as a decision that warrants explicit framing.

- **DK1 (proposed default).** Keep inline. Tighten the comment to forbid silent reuse: "if a second warm-dark photographic stand-in appears anywhere in the brand, that is the moment to promote `--placeholder-band-warm-a/b`. Until then, these are demo-local fixtures, not brand colors."
- **DK2.** Promote now. Rename existing `--placeholder-band-a/b` → `--placeholder-band-cool-a/b`; add `--placeholder-band-warm-a/b: #4a3520 / #3a2a18`. Symmetric and future-proof. Pays one debt to incur a rename across `style.css:181–183, 391, 956–958, 1397, 1398` and `index.html:226, 232, 563, 576, 640`.

Tension flagged. Default if silent: DK1.

### C. Half-finished prior items

**C1 — P2 — Stat-highlight `<b>` pattern not rendered as documented, and applied inconsistently.** Predecessor spec finding E resolved E1: "keep `<b>` and document the pattern in 1.5 Typography." The keep-in-place was implicit (no rename happened), but the documentation step never landed on the page. Two related closures:

- **C1a.** Add a one-line note inside 1.5 Typography's "Display roles" sub-block: `<b>` — section-stat highlight; renders the numeric in `--blue` 500. Render an example beside it (e.g., the literal `<b>9</b> cols` shown in mono).
- **C1b.** The pattern is currently applied to *system-unit counts* (`<b>4</b> principles` at `index.html:42`, `<b>9</b> cols` at `:116`, `<b>5</b> tokens` at `:152`, `<b>6</b> sizes` at `:248`, `<b>3</b> stack levels` at `:367`, `<b>4</b> demos` at `:394`, `<b>8</b> slots` at `:667`, etc.) but skipped for *anatomical part counts* (`2 parts` at `:448`, `3 parts` at `:484`, `2 states` and `2 parts` at `:553–555`). The implicit rule reads as: "highlight the count when it refers to a *system* unit the brand catalogues; leave plain when it refers to *anatomical* subdivisions of one specimen." Document this distinction in the C1a note, or apply `<b>` uniformly to every numeric.

Tension flagged: **C1b — preserve the implicit rule (proposed) or apply uniformly?** Default if silent: preserve and document the rule.

**C2 — P2 — `[edit: Kees]` markers in `style.css`.** Three remaining: `style.css:54` (`--focus-fade` / `--pan-lerp` confirm), `style.css:86–88` (`--viewport-edge-d` / `--viewport-edge-corner` confirm). For each, Kees either:

- (a) ratifies the value and Claude removes the marker;
- (b) replaces the rationale with Kees's voice and Claude removes the marker;
- (c) explicitly holds the marker over to a future decision.

This step is a Kees-in-the-loop sweep, not a Claude edit. Spec captures the three markers; plan steps Kees through each.

### D. System completeness — additive only

**D1 — P2 — Iconography rule rendered.** Per locked decision 4. Add one line to 1.2 Identity (anatomy block of the existing "MARK AT SCALE" cell or as a new caption underneath the minimum-size cell): "Icons — the pictogram is the only image asset; inline arrows in links use the typographic `→` (U+2192). No SVG chevrons, no icon set." This closes the undocumented `→` at `index.html:707` (overlay primitive `link`) without banning it.

**D2 — P2 — Photo aspect rule rendered.** Per locked decision 5. Add one line to 1.4 Color → Photograph treatment, beneath the existing ambient-vs-focused caption: "Aspect — 3:2 canonical (35mm full-frame; the grid math is built around it). Other aspects render at the same height: landscape crops, portrait band-pads. Square crops disallowed."

**D3 — P2 — Decode/loading state as 2.4's third specimen.** Per locked decision 3. Restructure 2.4 Photo cell to render three cells side-by-side at `sr-cell--3 sr-cell--r2`: DEFAULT (existing), FOCUSED (existing), LOADING (new). The LOADING cell uses `.photo.is-entering` styling — opacity 0, translateY(4px) — and animates via the existing `sr-demo-photo-decode` keyframe (`style.css:962`). Caption: "loading — opacity 0 → 1, translateY(4px) → 0, 200ms ease-out." The ANATOMY cell's legend gains one row: `(3) loading — placeholder visible, photo decoding`.

ANATOMY cell width adjusts from `sr-cell--3` to `sr-cell--3` unchanged; row layout becomes `[default, focused, loading] / [anatomy spans 3, … spans 6]` or similar — exact grid math worked in the plan.

**D4 — P2 — Voice audit (sweep).** Read every `.sr-anatomy__usage` body across the page and the `.sr-principles__principles` list items. Confirm three properties:

- Person: third-person systemic. No "you" / "we" / "I."
- Tense: descriptive present ("Used as", "Captions", "Tells the visitor"). No imperative ("Use this", "Do not").
- Length: ~30-word soft cap. Longer lines either split or trim.

Edits land directly on lines that drift. The plan carries a punch-list of every line I'd touch; Kees signs off on the diff during user-review.

Note: `index.html:507` and `:542` use imperative voice for the formula clauses ("If no settled binomial exists, use…" / "No emoji; no icons"). These are *normative formulas*, not descriptive prose — they may legitimately stay imperative. The audit decides per-line; flagged here so the rule is not applied mechanically.

### E. Future candidates (named, not shipped)

The brief surfaces a handful of items that defend themselves as plausible-but-not-Phase-3:

- **3.2 Pattern — Photo focus choreography.** Composes `.is-focused` (photo) + `.is-visible` (species) + ambient drop on neighbors as one named pattern. Defends itself; the runtime exhibits this composition; rendering it would close the "3.0 Patterns shelf only has one entry" tension. Held back to keep Phase 3 lean; revisit when a second component-composing pattern emerges (overlay → species cross-fade is a candidate).
- **`:root` consolidation.** Merging the two blocks into one would preserve the rationale comments and remove a small surprise for a first-read code archeologist. Cosmetic; no rendered impact. Held.
- **Asset inventory in 99 Colophon.** Today: `files/logo.svg` only. A one-line `assets — files/logo.svg (pictogram, only image asset)` would be definitive about what the brand owns. Held; small enough to fold in if Phase 3 grows trivially.

These items are flagged so the next reference revision has a head start.

## Tensions flagged for Kees

These are not resolved in this spec. Each gets a P0 user-review pass before writing-plans converts the spec into the ordered task list.

1. **A1 heading-order fix — A1a (lift `<h1>` outside the masthead section, smallest semantic shift) or A1b (masthead becomes `<header>`, `<h2>Masthead</h2>` becomes the page `<h1>`).** Default if silent: **A1a**.
2. **DKHex (B1) — DK1 (keep inline, tighten comment) or DK2 (promote, rename).** Default if silent: **DK1**.
3. **C1b stat-highlight `<b>` rule — preserve the implicit "system-unit only" distinction (and document it) or apply uniformly to every numeric.** Default if silent: **preserve + document**.
4. **C2 `[edit: Kees]` markers** — three rationales (`--focus-fade` / `--pan-lerp` at `style.css:54`, `--viewport-edge-d` / `--viewport-edge-corner` at `style.css:86–88`). For each: ratify, rewrite, or hold. *No default* — Kees must touch each one; the plan steps through them.
5. **D4 voice audit — apply mechanically or per-line judgment?** Default if silent: **per-line judgment**, with the imperative-formula exception at `index.html:507, 542` preserved.

## Acceptance criteria

The Phase 3 close-out is complete when all of the following hold.

1. `index.html` has exactly one `<h1>`, in document order before any `<h2>`. The masthead's `<h2>Masthead</h2>` (or its replacement) follows the `<h1>` in source order. Verified by running an outline-extractor (or by manual read).
2. A skip-link is the first focusable element of `<body>`, visually hidden until `:focus-visible`. Anchor target is `#sr-1-1`. Tested with Tab from a fresh page load.
3. WCAG AA contrast holds for `.sr-section__stats`, `.sr-cell__label`, `.sr-anatomy__usage`, `.sr-token__k`, and the meta-line role at the rendered size. Measurements recorded in the spec or plan as a one-paragraph note.
4. Per Kees's resolution of B1 (DK1 or DK2), the warm-dark stand-in hexes at `style.css:1473–1474` are either: (DK1) flanked by a tightened comment naming the promotion-trigger; or (DK2) replaced by `var(--placeholder-band-warm-a/b)` references with the corresponding `:root` additions and the `cool` rename applied across both files.
5. 1.5 Typography's "Display roles" sub-block carries one line documenting the `<b>` stat-highlight pattern, with a rendered example. Per Kees's C1b resolution, either the implicit system-unit-only rule is named in that line, or `<b>` is applied uniformly across every numeric in section-stats and the rule line is omitted.
6. The three `[edit: Kees]` markers in `style.css:54, 86–88` are each resolved: removed (ratified), rewritten (Kees's voice), or explicitly held over with a dated note.
7. 1.2 Identity carries the iconography rule line per locked decision 4.
8. 1.4 Color → Photograph treatment carries the aspect rule line per locked decision 5.
9. 2.4 Photo cell renders three states: DEFAULT, FOCUSED, LOADING. The LOADING cell animates via `sr-demo-photo-decode`. The ANATOMY legend gains the loading row.
10. Every `.sr-anatomy__usage` body and `.sr-principles__principles` item that violates the voice audit (third-person systemic, descriptive present, ~30-word soft cap) is corrected, with the imperative-formula exception preserved.
11. `style-reference/index.html` and `style.css` render at `http://localhost:8000` with no console errors. `?grid` flag still works. Skip-link reveals on Tab.
12. `CHANGELOG.md` carries a new dated entry for Phase 3 summarizing the close-out.

## Out of scope (explicitly)

- Anything in the predecessor spec's "Out of scope" list — that scope holds.
- Reopening any of the predecessor's six locked tensions.
- Inventing brand behavior the runtime does not exhibit (B&W policy, error/empty/offline states, A→B choreography, image min-resolution, crop policy details).
- 3.0 Patterns shelf expansion (named in *Future candidates*; not shipped).
- `:root` block consolidation (named in *Future candidates*; not shipped).
- Asset inventory expansion in 99 Colophon (named in *Future candidates*; held unless Phase 3 grows trivially).
- CSS modernization, framework adoption, build-step introduction.
- Bird-portfolio repo. The workspace's isolation rule holds.

## Open questions

The five tensions in *Tensions flagged for Kees* above. Four carry defaults if Kees declines to choose; the C2 marker sweep has no default and must be walked through.
