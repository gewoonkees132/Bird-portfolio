# Changelog — Style Reference

Reverse-chronological. One entry per dated revision; each entry one line summarizing the change.

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
