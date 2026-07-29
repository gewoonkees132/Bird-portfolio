# Kees Leemeijer — Bird Photography

A slow, pannable plane of bird photographs. Drag, pinch, or use the arrow keys to explore; each photo carries a species label that blooms into a fact card on click.

Built as vanilla HTML, CSS, and JavaScript — no build step.

**Live site:** https://gewoonkees132.github.io/Bird-portfolio/

## Project layout

```
public/            ← what gets deployed to GitHub Pages
  index.html
  app.js
  styles.css
  files/           ← .webp photos + logo.svg
  404.html
  robots.txt
  sitemap.xml
tools/             ← arrangement + species validators, generator, RAW→webp converter
docs/              ← design guideline, plans, specs
design/            ← standalone tessellation + design-tool experiments
brand/logo/        ← logo variants the site does not use
native/            ← Android/Compose photo-app prototype
style-reference/   ← separate workspace for the brand style
.github/workflows/
  deploy.yml       ← pushes public/ to GitHub Pages on every push to main
```

Everything outside `public/` stays in the repo for reference but is **not** part of the deployed site.

## Run locally

```
cd public
python -m http.server
```

Then open <http://localhost:8000>.

## Checks

No test runner and no build step — two validators guard the invariants that are
easy to break by hand. Both must pass before a change to the layout or the
species data is committed.

```
node tools/check-arrangements.js   # tiling, slot ids, shape/slot agreement, tile size
node tools/check-species.js        # species data agrees across every copy of it
```

## Deploy

GitHub Pages, driven by `.github/workflows/deploy.yml`. The workflow uploads `public/` as the Pages artifact on every push to `main`. Pages must be configured in repo settings → Pages → Build and deployment → Source: **GitHub Actions**.

## Image rights

All photographs © Kees Leemeijer. Reach out before reuse.

## Contact

[kees_leemeijer@hotmail.com](mailto:kees_leemeijer@hotmail.com)
