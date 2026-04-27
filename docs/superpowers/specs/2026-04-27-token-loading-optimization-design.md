# Token-Loading Optimization — Design

Date: 2026-04-27

## Context

The Bird Portfolio repo contains a vanilla HTML/CSS/JS site plus several large image folders. Without guidance, a Claude Code session can accidentally load image bytes via the Read tool (which treats images as multimodal content) or walk into the 172 MB `high quality/` folder via Glob/Grep/ls. This spec defines a small set of files and one git operation that prevent unnecessary token spend in future Claude sessions, clean up repo bloat, and give visitors a public README.

## Goals

- Stop Claude sessions from loading image bytes by default.
- Stop tracking the 172 MB `high quality/` originals folder in git.
- Give the GitHub page a short, public-facing README.

## Non-goals

- Rewriting git history to purge the existing 172 MB from past commits (needs `git filter-repo`; can be done later if asked).
- Cleaning up the nested `high quality/high quality/` duplicate of originals.
- Any change to the running site (`app.js`, `styles.css`, `index.html`, the tessellation pages, or the JSX design components).
- Touching the existing uncommitted edits to `app.js` / `index.html` / `styles.css` or the new `files/logo/` directory — those stay out of this commit.

## Deliverables

### 1. `CLAUDE.md` (project root)

Auto-loaded by Claude Code at session start. Three short sections:

**Project overview** — one paragraph: vanilla HTML/CSS/JS, no build step, a pannable desktop photo plane (drag / arrow keys) with a per-photo species label, a mobile placeholder edition, plus tessellation experiment pages and JSX design-tool components.

**File map** — what each source file is for:

- `index.html` — entry document, contains both desktop stage and mobile placeholder
- `app.js` — pannable plane logic, tweaks-panel wiring, image arrangements
- `styles.css` — all styling
- `aspect-tessellation.html`, `tessellation-options.html` — standalone design experiments
- `design-canvas.jsx`, `tweaks-panel.jsx` — design-tool React components (not part of the running site)
- `files/*.webp` — web-resolution photos referenced by the site
- `files/logo/SVG/logo.svg` — site logo
- `high quality/` — full-resolution originals, **git-ignored, do not read**

**Token rules for Claude** — explicit don'ts:

- Do not use `Read` on `.webp`, `.jpg`, or `.png` files. The Read tool loads images as multimodal content; cost is large and the bytes give Claude no useful information about the code. To inspect images, open the running site in a browser.
- The `high quality/` folder is ~172 MB of originals. Do not `Glob`, `Grep`, `ls`, or descend into it. If full-resolution originals are genuinely needed, ask the user first.
- Avoid recursive `du` / `find` / globs without path filters that would walk image folders.

**How to run** — one line: serve the directory statically (`python -m http.server`), open `http://localhost:8000`.

### 2. `.gitignore` (project root, new file)

```
high quality/
.mcp.json
.DS_Store
Thumbs.db
```

`.mcp.json` is ignored because this is a solo repo and the file can carry local paths.

### 3. Untrack `high quality/` from git

Run once:

```
git rm --cached -r "high quality"
```

Keeps files on disk; removes them from the git index so the next commit stops tracking them. History still contains them — out of scope for this spec.

### 4. `README.md` (project root, public-facing)

Short and factual. Sections:

- Title: **Kees Leemeijer — Bird Photography**
- One-paragraph description: a slow, pannable plane of bird photographs that you explore by dragging or with arrow keys; each photo carries a species label.
- Tech: vanilla HTML/CSS/JS, no build step.
- Run locally: `python -m http.server` and open `http://localhost:8000`.
- Contact: email link to `kees_leemeijer@hotmail.com` (matches the email already used in `index.html`).

No screenshot, no license block.

## Order of operations

1. Write `CLAUDE.md`.
2. Write `.gitignore`.
3. Run `git rm --cached -r "high quality"`.
4. Write `README.md`.
5. Stage and commit the four changes together:
   `Add CLAUDE.md, README.md, .gitignore; untrack high-quality originals`

The commit excludes the existing uncommitted edits to `app.js` / `index.html` / `styles.css` and the new `files/logo/` directory.

## Acceptance criteria

- Opening a fresh Claude Code session in this repo auto-loads `CLAUDE.md`; file map and token rules are visible at session start.
- `git ls-files | grep "high quality"` returns nothing after the commit.
- `git status` shows `high quality/` ignored, not tracked.
- `README.md` renders as the project description on GitHub.
- The website still runs locally; no source files modified.
