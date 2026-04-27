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
