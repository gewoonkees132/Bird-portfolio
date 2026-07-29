# Bird Portfolio — Notes for Claude

Vanilla HTML/CSS/JS bird-photography portfolio. No build step, no dependencies.
Desktop is a pannable, infinitely-tiling photo plane (drag / pinch / arrow keys)
with a per-photo species label that blooms into a fact card; mobile is a
placeholder editorial scroll. Alongside the site live a set of Node/Python
authoring tools, an Android prototype, and reference material.

Deployed to GitHub Pages from `public/` — see `.github/workflows/deploy.yml`.
**Only `public/` ships.** Everything else is repo-local.

## Repo layout

```
public/          ← the deployed site; nothing outside this folder is served
  index.html       entry document: desktop stage + mobile placeholder edition
  app.js           species data, bird facts, arrangements, pan/zoom/focus loop,
                   full-screen viewer, bloom interaction
  styles.css       all styling; :root holds the design tokens
  404.html  robots.txt  sitemap.xml
  files/           the 16 .webp photographs + logo.svg — and nothing else
tools/           ← authoring + validation scripts (Node 18+, Python 3 + Pillow)
docs/            ← designguideline.md (normative) + superpowers/ plans & specs
design/          ← standalone design experiments; not part of any build
brand/logo/      ← logo variants the site does not use (kept out of public/)
native/          ← Android/Compose photo-app prototype (Kotlin, Gradle)
style-reference/ ← separate workspace, see below
local-scratch/   ← git-ignored parking for unrelated files; never in public/
```

`public/` is the deployed artifact, so anything unreferenced sitting in it ships
to visitors for free. `tools/check-species.js` fails on any file under
`public/files/` that is not a referenced photograph or `logo.svg` — park stray
material in `local-scratch/` instead.

## Token rules — read before touching images

- **Never** use the Read tool on `.webp`, `.jpg`, or `.png`. The Read tool loads
  images as multimodal content; the cost is large and the bytes tell you nothing
  about the code. To inspect imagery, open the running site in a browser.
- Avoid recursive `du` / `find` / globs without path filters that would walk
  `public/files/` or `native/app/src/main/assets/photos/`.
- `high quality/` (full-resolution originals) and `public/files/Raw todo/`
  (unconverted batches) are git-ignored and **absent from this checkout**. They
  come and go on the photographer's machine. Do not read or enumerate them; if
  originals are genuinely needed, ask first.

## The layout invariant

`ARRANGEMENTS` in `public/app.js` is a table of 8 tilings of a 12x8 cell grid
(88px module, 24px gutter). The render and focus code depend on invariants that
are easy to break by hand, so after **any** edit to `ARRANGEMENTS`, `SPECIES`,
`ARRANGEMENT_LEAD`, `TILE_W`/`TILE_H`, or the `--tile-width` / `--tile-height`
tokens:

```
node tools/check-arrangements.js     # must print "all invariants pass"
```

It verifies exact 12x8 coverage, unique slot ids, photo-shape/slot-kind
agreement, species repeat limits, valid lead ids, and that app.js and styles.css
still agree on tile size.

## tools/

| script | what it does |
| --- | --- |
| `check-arrangements.js` | validates the layout invariants above — run it |
| `check-species.js` | validates that every copy of the species data agrees — run it |
| `gen-arrangements.js` | regenerates the `ARRANGEMENTS` block (deterministic; `--report` for aspect detail) |
| `aspect-fit.js` | research tool: derives which cell spans land near 3:2 / 2:3 |
| `convert-raw.py` | converts a `Raw todo/` JPG batch to web-resolution .webp |

## Species data lives in four places

Species names, latin names, vitals and photo filenames are duplicated across
`public/app.js` (`SPECIES` + `BIRD_FACTS`), `public/index.html` (schema.org
block + `.mcell` mobile tiles), `native/app/src/main/assets/photos.json`, and
the `SPECIES_OF` / `KIND_OF` maps in `tools/gen-arrangements.js`. No generator
ties them together — when a species is renamed or re-identified, all four must
be updated by hand, plus the filenames under `public/files/` and
`native/app/src/main/assets/photos/`.

`public/app.js` is the source of truth, and this is the check that catches the
copy you forgot:

```
node tools/check-species.js          # must print "all species data agrees"
```

It reads `SPECIES` / `BIRD_FACTS` straight out of `app.js` and asserts the other
copies match on every identity field — name, latin name, shape/aspect, band
colours, vitals keys and values — plus that the referenced photographs exist on
disk with no orphans, and that the canonical URL, `og:url` and `sitemap.xml`
still name one host. Prose is deliberately *not* compared: the native manifest
carries shortened ledes written for a phone screen. Typographic variants
(en dash vs hyphen, curly vs straight apostrophe) are normalised before
comparison, so only real renames fail.

`check-arrangements.js` derives its shape and species maps from `app.js` for the
same reason, so those two no longer need hand-syncing at all.

A species with no published wingspan carries `length` instead; the vitals row
relabels itself (`vitalRows()` in app.js; the native side reads vitals as a
generic key/value map, so it needs no change).

Presentation values (ambient dim, focus-fade, brand colours) belong in
`styles.css` only. `app.js` deliberately does **not** mirror them into custom
properties at boot — that bridge existed until 2026-07-29 and its two copies had
drifted apart.

## How to run

```
cd public && python -m http.server
```

Then open <http://localhost:8000>.

## style-reference/ is a separate workspace

`style-reference/` is a self-contained workspace for refining the Kees Leemeijer
brand style, with its own `CLAUDE.md`. Open it directly when working on style; do
not edit its files from this workspace, and do not assume any synchronization
between `style-reference/style.css` and the portfolio's `public/styles.css`.
