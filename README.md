# Kees Leemeijer — Bird Photography

A slow, pannable plane of bird photographs. Drag, pinch, or use the arrow keys to explore; each photo carries a species label that blooms into a fact card on click.

Built as vanilla HTML, CSS, and JavaScript — no build step.

**Live site:** https://verticokees.github.io/Bird-portfolio/

## Project layout

```
public/            ← what gets deployed to GitHub Pages
  index.html
  app.js
  styles.css
  files/           ← .webp photos + logo SVG
  404.html
  robots.txt
  sitemap.xml
.github/workflows/
  deploy.yml       ← pushes public/ to GitHub Pages on every push to main
```

Everything outside `public/` — `style-reference/`, `docs/`, `aspect-tessellation.html`, the `.jsx` design tools, `CLAUDE.md`, `audit.md` — stays in the repo for reference but is **not** part of the deployed site.

## Run locally

```
cd public
python -m http.server
```

Then open <http://localhost:8000>.

## Deploy

GitHub Pages, driven by `.github/workflows/deploy.yml`. The workflow uploads `public/` as the Pages artifact on every push to `main`. Pages must be configured in repo settings → Pages → Build and deployment → Source: **GitHub Actions**.

## Image rights

All photographs © Kees Leemeijer. Reach out before reuse.

## Contact

[kees_leemeijer@hotmail.com](mailto:kees_leemeijer@hotmail.com)
