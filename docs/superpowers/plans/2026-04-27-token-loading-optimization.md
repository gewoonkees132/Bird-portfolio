# Token-Loading Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `CLAUDE.md`, `.gitignore`, and public `README.md`, and untrack the 172 MB `high quality/` originals folder, in a single commit.

**Architecture:** Three plain-text files at the project root, one git index operation, one commit. No code changes. Verification is by git/filesystem inspection against the spec's acceptance criteria.

**Tech Stack:** Markdown, gitignore, git CLI.

**Spec:** `docs/superpowers/specs/2026-04-27-token-loading-optimization-design.md`

---

## File Structure

All new files at project root:

- `.gitignore` — untracked patterns (new file)
- `CLAUDE.md` — project context auto-loaded by Claude Code (new file)
- `README.md` — public-facing description for GitHub (new file)

Modified via git index only (not edited):

- `high quality/**` — removed from git index, kept on disk

Out of scope for this commit (must NOT be staged):

- `app.js`, `index.html`, `styles.css` (uncommitted edits — separate concern)
- `files/logo/` (untracked — separate concern)
- `.mcp.json` (will be ignored by the new `.gitignore`)

---

## Pre-flight check

- [ ] **Step 0: Confirm starting state**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" status --short
```

Expected output (order may vary):
```
 M app.js
 M index.html
 M styles.css
?? .mcp.json
?? files/logo/
```

Confirm: HEAD is the spec commit (`dac8c0a` — "Add design spec for token-loading optimization"). If anything else is staged, stop and ask the user before proceeding.

---

### Task 1: Create `.gitignore`

**Files:**
- Create: `C:/Users/kees/Documents/GitHub/Bird portfolio/.gitignore`

- [ ] **Step 1: Write the file**

Use the Write tool. Contents (verbatim, no leading or trailing blank lines beyond the newline at EOF):

```
high quality/
.mcp.json
.DS_Store
Thumbs.db
```

- [ ] **Step 2: Verify the file is recognized and `.mcp.json` is now ignored**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" status --short
```

Expected:
- `.mcp.json` no longer appears as `??` (it is now ignored).
- `.gitignore` appears as `??`.
- The pre-existing ` M app.js`, ` M index.html`, ` M styles.css`, and `?? files/logo/` lines remain.

Also run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" check-ignore -v "high quality/" ".mcp.json"
```

Expected: two lines, each pointing at `.gitignore:<line>` showing the matched pattern.

- [ ] **Step 3: Do NOT commit yet** — bundled into the final commit in Task 5.

---

### Task 2: Untrack `high quality/` from git

**Files:**
- Modify (git index only): `high quality/**` (no on-disk changes)

- [ ] **Step 1: Remove from index**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" rm --cached -r "high quality"
```

Expected: a long list of `rm 'high quality/...'` lines (one per file).

- [ ] **Step 2: Verify files still on disk**

Run:
```bash
ls "C:/Users/kees/Documents/GitHub/Bird portfolio/high quality/" | head -3
```

Expected: at least one `.webp` filename listed. The originals are still present on disk.

- [ ] **Step 3: Verify staging shows deletions, not the working tree**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" status --short | head -10
```

Expected: lines beginning with `D ` (capital D in column 1, space in column 2 = staged deletion, not on-disk deletion). No `?? high quality/...` lines (because the folder is now ignored by Task 1's `.gitignore`).

- [ ] **Step 4: Do NOT commit yet** — bundled into the final commit in Task 5.

---

### Task 3: Create `CLAUDE.md`

**Files:**
- Create: `C:/Users/kees/Documents/GitHub/Bird portfolio/CLAUDE.md`

- [ ] **Step 1: Write the file**

Use the Write tool. Contents (verbatim):

````markdown
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
````

- [ ] **Step 2: Verify**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" status --short | grep CLAUDE.md
```

Expected: `?? CLAUDE.md`

- [ ] **Step 3: Do NOT commit yet** — bundled into the final commit in Task 5.

---

### Task 4: Create `README.md`

**Files:**
- Create: `C:/Users/kees/Documents/GitHub/Bird portfolio/README.md`

- [ ] **Step 1: Write the file**

Use the Write tool. Contents (verbatim):

````markdown
# Kees Leemeijer — Bird Photography

A slow, pannable plane of bird photographs. Drag or use the arrow keys to explore; each photo carries a species label.

Built as vanilla HTML, CSS, and JavaScript — no build step.

## Run locally

```
python -m http.server
```

Then open <http://localhost:8000>.

## Contact

[kees_leemeijer@hotmail.com](mailto:kees_leemeijer@hotmail.com)
````

- [ ] **Step 2: Verify**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" status --short | grep README.md
```

Expected: `?? README.md`

- [ ] **Step 3: Do NOT commit yet** — bundled into the final commit in Task 5.

---

### Task 5: Stage and commit

- [ ] **Step 1: Stage the new files explicitly**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" add .gitignore CLAUDE.md README.md
```

Do NOT use `git add -A` or `git add .` — the uncommitted edits to `app.js` / `index.html` / `styles.css` and the new `files/logo/` directory must stay out of this commit. The `git rm --cached` from Task 2 already staged the deletions.

- [ ] **Step 2: Verify staging is correct**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" status --short
```

Expected (order may vary):
- `A  .gitignore`
- `A  CLAUDE.md`
- `A  README.md`
- Many `D  high quality/...` lines (staged deletions from Task 2)
- Unstaged-only: ` M app.js`, ` M index.html`, ` M styles.css`, `?? files/logo/`

If any of `app.js`, `index.html`, `styles.css`, `files/logo/`, or `.mcp.json` appears with a capital letter in column 1 (staged), stop and unstage them with `git restore --staged <path>` before committing.

- [ ] **Step 3: Commit**

Run:
```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" commit -m "$(cat <<'EOF'
Add CLAUDE.md, README.md, .gitignore; untrack high-quality originals

- CLAUDE.md: project overview, file map, and token rules so future Claude
  Code sessions don't read image bytes or walk into the 172 MB originals folder.
- README.md: short public-facing description and run instructions.
- .gitignore: keeps high quality/, .mcp.json, .DS_Store, Thumbs.db out.
- git rm --cached -r "high quality": stops tracking the originals (kept on disk).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds; output reports something like `4 files changed` plus a long deletion count.

- [ ] **Step 4: Verify acceptance criteria from the spec**

Run each:

```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" ls-files | grep "high quality"
```
Expected: empty output (exit code 1 from grep is fine — no match means success).

```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" status --short
```
Expected: only the pre-existing unstaged changes remain — ` M app.js`, ` M index.html`, ` M styles.css`, `?? files/logo/`. No `?? high quality/`, no `?? .mcp.json`.

```bash
git -C "C:/Users/kees/Documents/GitHub/Bird portfolio" check-ignore -v "high quality/"
```
Expected: one line showing `.gitignore:1:high quality/	high quality/`.

```bash
ls "C:/Users/kees/Documents/GitHub/Bird portfolio/high quality/" | head -3
```
Expected: webp files still listed — the originals are still on disk.

- [ ] **Step 5: Smoke-test the running site**

In a separate terminal, run from the project root:
```bash
python -m http.server
```

Open `http://localhost:8000` in a browser. Expected: the site loads as before; the desktop pannable plane appears and photographs render. Check the browser console — no 404s for image paths or the logo. Stop the server with Ctrl+C.

If the site is broken, the cause is unrelated to this change set (no source files were modified) — check that the server's CWD is the project root.

---

## Notes for the executing engineer

- **Auto mode** is on. Proceed task-by-task without pausing for confirmation between tasks; pause only if a verification step fails or staging contains unexpected files.
- **No tests are written here** because the deliverables are configuration and content. Verification is done by `git status` / `git ls-files` / `check-ignore` and a manual smoke test, all listed in Step 4 of Task 5.
- **No worktree** was created for this work; it is being executed directly on `main` per the user's instruction.
- **Do not** rewrite git history (`filter-repo`, `filter-branch`, `reset --hard`) — out of scope.
