# Changelog — Style Reference

Reverse-chronological. One entry per dated revision; each entry one line summarizing the change.

## 2026-04-27 — v1 · audit remediation (R-Phase 3, Polish)

R-Phase 3 (Polish) closes all thirteen polish findings; none deferred. **Comments cluster (P-1..P-5):** specimen-section markers (Masthead, Principles, Color, Typography, Spacing, Motion, Elevation note, Colophon) standardized to full `============` banner style; `(was 760, off-by-16 math bug fixed)` parentheticals removed from the Grid `:root` and `--tile-height` comment; the `(was: "alectear-feel craft" — undefined coined term, substituted)` historical note removed from the style.css head and the matching index.html HTML comment (CLAUDE.md left out of scope per audit out-of-scope log); `Print / reduced motion` banner renamed `Reduced motion` (no `@media print` rules in the file); the brittle `style.css:449` line-number reference replaced with a structural pointer to the runtime Focus block. **Naming:** P-7 renamed `.sr-sr-only` → `.sr-visually-hidden` (avoids double-prefix collision with the `.sr-only` web idiom); P-8 renamed `.sr-principles__principles` → `.sr-principles__list` (element name describes role, not echoes block). **Mobile (P-9 + P-10):** Kees ratified the BEM rename — `.mcell` → `.mobile-edition__cell`, `.mphoto` → `.mobile-edition__photo`, `.mlabel` → `.mobile-edition__label`, `.mmeta` → `.mobile-edition__meta` — and the 4-level descendant chains flattened to single-class selectors (BEM names are unique, so the ancestor scope is redundant). **Misc:** P-6 documented `@media` co-location convention as a bullet in the file preamble; P-11 consumed `--tick` in the `:focus-visible` outline (`var(--tick) solid var(--blue)` with `outline-offset: var(--tick)`) and clarified `--tile-margin` as doc-only with an inline comment; P-12 added `.sr-anatomy__usage--inline / --tight / --snug` modifier classes and replaced the recurring `style="margin-top:0|6px|8px"` inline attributes on `.sr-anatomy__usage` (one-off 10px / 12px / non-anatomy callsites left inline, per audit's "small set of modifiers" guidance); P-13 consolidated three `.sr-cell__body .identity, .compass, .species` selectors via `:is()`.

Spec: `docs/specs/2026-04-27-css-audit-design.md`.
Audit: `docs/audits/2026-04-27-css-audit.md`.
Plan: `docs/plans/2026-04-27-css-audit-remediation.md`.

## 2026-04-27 — v1 · audit remediation (R-Phase 2, Recommended)

R-Phase 2 (Recommended) closes thirteen findings from the 2026-04-27 CSS audit. **Architecture:** R-1 adopted `@layer reset, tokens, runtime, specimen, debug;` to encode the runtime/specimen contract in CSS — the specimen-side `html, body { overflow: auto }` override now wins by layer order, not source order, and the boundary the `END RUNTIME · BEGIN SPECIMEN` banner names is structural. R-2 added a top-of-file preamble (file map, conventions, edit rules) so a 1639-line single-file specimen orients an editor in seconds. R-7 reordered the specimen blocks to match HTML render order (00 Masthead → §1.1 → §1.2 → §1.3 → §1.4 → §1.5 → §1.6 → §1.7 → §1.8 → §2.x → §3.1 → §99 → below-1336 fallback); the `?grid` debug overlay sits last in its own layer. **Token discipline:** R-3 extracted `--mono-stack` and replaced 38 callsites — including 2 short-variant drifts that silently lacked Consolas; R-4 replaced 34 `rgba(26, 26, 26, …)` literals with `color-mix(in srgb, var(--charcoal) …%, transparent)`; R-5 did the same for 9 raw blue-rgba callsites (`--blue-soft` token kept as the canonical 60% alias); R-10 for 4 field-rgba literals at 0.85 / 0.92 (`--field-overlay` token kept at 0.95); R-11 replaced one `0.78rem` literal with `var(--label-size-m)`. **Naming:** R-8 renamed `.ind-dot` → `.sr-overlay-primitive__dot`, `.live` → `.sr-overlay-applied__layer__live`, `.overlay--backdrop` → `.sr-overlay-applied__layer--backdrop`; R-9 collapsed six scoped `.dot { color: var(--blue) }` re-declarations into one global rule (`.brand-dot` deliberately preserved as a distinct concept). **Cleanup:** R-6 removed dead `.sr-section__head`; R-12 removed the file's lone `!important`; R-13 merged the two adjacent `.mobile-edition .mcell .mphoto` blocks into one rule.

Spec: `docs/specs/2026-04-27-css-audit-design.md`.
Audit: `docs/audits/2026-04-27-css-audit.md`.
Plan: `docs/plans/2026-04-27-css-audit-remediation.md`.

## 2026-04-27 — v1 · audit remediation (R-Phase 1, Critical)

R-Phase 1 (Critical) closes three findings from the 2026-04-27 CSS audit. C-1 aligned `--pan-lerp` between the CSS token and the §1.8 Motion specimen — Kees ratified `0.02` (keep CSS, fix specimen); the heavier-feel runtime value is preserved and the specimen now documents it accurately. C-2 aligned `--focus-fade` — Kees ratified `200ms` (keep CSS, fix specimen); the snappier runtime value remains and the specimen's `360ms` caption is corrected. `--focus-fade` is load-bearing on `.photo` transitions, so the runtime feel is unchanged. C-3 replaced the stale `Grid ruleset — first specimen on the page` banner with an accurate `§1.3 specimen — token chips + page-anatomy diagram` header.

Spec: `docs/specs/2026-04-27-css-audit-design.md`.
Audit: `docs/audits/2026-04-27-css-audit.md`.
Plan: `docs/plans/2026-04-27-css-audit-remediation.md`.

## 2026-04-27 — v1 · close-out (Phase 3)

Close-out (Phase 3): heading-order fix (page H1 hoisted to a sibling header via `.sr-sr-only` utility; visible 56px title becomes `<p aria-hidden="true">`); skip-link added as first focusable element (#sr-1-1 target); WCAG-AA contrast re-verified post-restructure; warm-dark hex comment tightened with promotion trigger (DK1); `[edit: Kees]` markers resolved (Marker 1 rewritten — `--pan-lerp` 0.02 / `--focus-fade` 200ms tuned values; Marker 2 ratified at 18 / 22); `<b>` stat-highlight pattern documented in 1.5 Typography (system-unit only rule preserved per C1b); iconography rule rendered in 1.2 Identity (logo + U+2192, no third); photo aspect rule rendered in 1.4 Color (3:2 canonical; off-aspect cropped via `object-fit: cover`); LOADING state added as 2.4 Photo cell's third specimen (`sr-photo--loading-demo`); voice audit applied to usage bodies and principles.

Close-out polish (review-decision resolutions): `<em>` → `<b>` in 1.5 Typography emphasis (italic-blue-Latin principle); 1.5 highlighted-row specimen moves inline highlight from parent span to `<b>` (mirrors real `.sr-section__stats b`); 1.4 aspect prose corrected to runtime truth (`object-fit: cover` never letterboxes; portrait crops vertically); skip-link selector widened to `:focus, :focus-visible` (load-bearing first focusable element earns the cross-browser fallback).

Spec: `docs/specs/2026-04-27-definitive-style-reference-phase-3-design.md`.
Plan: `docs/plans/2026-04-27-definitive-style-reference-phase-3.md`.

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
