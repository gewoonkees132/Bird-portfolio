# Bird Portfolio — Notes for Claude

Vanilla HTML/CSS/JS bird-photography portfolio. No build step. Desktop is a pannable photo plane (drag / arrow keys) with a per-photo species label; mobile is a placeholder edition. Two standalone tessellation experiment pages and two JSX design-tool components live alongside the site.

## File map

- `index.html` — entry document; contains both desktop stage and mobile placeholder edition
- `app.js` — pannable plane logic, tweaks-panel wiring, photo arrangements
- `styles.css` — all styling
- `aspect-tessellation.html`, `tessellation-options.html` — standalone design experiments
- `design-canvas.jsx`, `tweaks-panel.jsx` — design-tool React components (not part of the running site)
- `files/*.webp` — web-resolution photos referenced by the site
- `files/logo/SVG/logo.svg` — site logo
- `high quality/` — full-resolution originals. **Git-ignored. Do not read.**

## Token rules

- **Never** use the Read tool on `.webp`, `.jpg`, or `.png` files. The Read tool loads images as multimodal content; the cost is large and the bytes give you no useful information about the code. To inspect imagery, open the running site in a browser.
- The `high quality/` folder is ~172 MB of originals. Do not `Glob`, `Grep`, `ls`, or descend into it. If full-resolution originals are genuinely needed, ask the user first.
- Avoid recursive `du` / `find` / globs without path filters that would walk image folders.

## How to run

```
python -m http.server
```

Then open `http://localhost:8000`.

## style-reference/ is a separate workspace

The `style-reference/` subdirectory is a self-contained workspace for refining the Kees Leemeijer brand style. It has its own `CLAUDE.md`. Open it directly when working on style; do not edit its files from this workspace, and do not assume any synchronization between `style-reference/style.css` and the portfolio's `styles.css`.
