# Style Reference — Notes for Claude

## Mission

This is a self-contained workspace for refining the Kees Leemeijer brand style. The specimen page at `index.html` *is* the system; if it's not visible on the page, it's not part of the brand.

## Identity

Munich '72 spirited inheritance · alectear-feel craft

## Principles

1. Asymmetric alignment.
2. Italic blue Latin as the sole italic accent.
3. Mono for utility text only.
4. 1px corner radius — sharp, almost square; shadows do the lift.

## Grid

9 columns × 120px cell × 24px gutter on a 1320px tile, 8px page-edge, 1336px outer. Token names: `--cols`, `--cell`, `--gutter`, `--tile-width`, `--page-edge`, `--page-width`, `--stride` (= `--cell` + `--gutter`).

## Tokens

Defined in the two `:root` blocks at the top of `style.css`. Read them there — values are not duplicated here (drift risk).

## Component inventory

- 2.1 Wordmark + dot
- 2.2 Species label (line-name + italic blue Latin + uppercase blue-soft meta)
- 2.3 Compass
- 2.4 Photo cell (default + `.is-focused`)
- 2.5 Brand card
- 2.6 Mobile cell

Patterns:
- 3.1 Overlays (8 anchor slots × 6 content primitives)

Each component renders into a uniform template — specimen with numbered anatomy callouts, legend, one-line usage. Components 2.5 and 2.6 omit callouts (no distinct named parts) but still carry a usage note.

## Versioning

The reference is versioned by date in the masthead and Colophon (e.g. `v1 · 2026-04-27`). Cadence is event-driven, not periodic: a revision lands when a brand decision is made, a token changes, or a component is added/removed. Routine maintenance (typo fixes, comment updates) does not trigger a version bump.

- **Cadence:** event-driven. No fixed schedule. Major decisions land as a new dated entry in `CHANGELOG.md`.
- **Ownership:** Kees is the sole arbiter of brand decisions, but holds a rollback veto rather than a pre-approval gate. The agent may proceed with changes that are plausibly positive for the overall style — token tweaks, renames, structural cleanups — provided the work is recorded in `CHANGELOG.md` (one rolled-up entry per remediation phase, not per individual change). Surface genuine tensions or ambiguous trade-offs before acting; for the rest, act and let rollback be the safety net.
- **Semver criteria:** the reference uses simple integer versions (`v1`, `v2`, `v3`...). A new major version is cut when the DNA changes — a palette member added or removed, the grid retuned, the elevation model expanded. Sub-major changes (token-discipline cleanups, accessibility fixes, voice clarifications) bump the date but stay on the same major.
- **Deprecation policy:** when a token, class, or rule is removed, it leaves immediately — no graveyard list, no temporary aliases. Old code in dependent surfaces (the bird-portfolio runtime) is downstream and gets updated separately. The reference's job is to be definitive *now*; deprecation lists become drift.

## How to run

```
python -m http.server
```

Then open `http://localhost:8000`.

## Isolation rules

- Vanilla HTML/CSS only. No build, no framework, no preprocessor, no JS dependency for the page to render.
- The specimen leads. Anatomy callouts and one-line usage notes are allowed where rendered form alone is ambiguous. No do/don't tables, no marketing copy, no anti-pattern panels — restraint over verbosity.
- Do not reach above this folder. The bird-portfolio repo containing this directory is unrelated to brand-style work.
- This folder is not synced to anything. There is no parity contract; do not attempt to update or check the portfolio's `styles.css`.
- Specs and plans land in `docs/specs/` and `docs/plans/` (not the superpowers default of `docs/superpowers/specs/` / `docs/superpowers/plans/`).
