# Bird Portfolio — Notes for Claude

Vanilla HTML/CSS/JS photography portfolio. No build step, no dependencies.
Desktop is a pannable, infinitely-tiling photo plane (drag / pinch / arrow keys)
with a per-photo caption label that blooms into a fact card, and a five-button
switcher top-right for the five collections — **birds, events, products,
portraits, lifestyle**;
mobile is a placeholder editorial scroll with its own set switcher. Alongside
the site live a set of Node/Python authoring tools, an Android prototype, and reference material.

The repo is still called Bird-portfolio and the birds are still the front door;
events and products were added on 2026-07-29 from two batches the photographer
dropped into `public/files/`; portraits and lifestyle followed on 2026-08-15 from a
`TEMP Portrait/` and a `Lifestyle/` batch (originals now in
`local-scratch/source-sets/Portraits/` and `local-scratch/source-sets/Lifestyle/`).

Deployed to GitHub Pages from `public/` — see `.github/workflows/deploy.yml`.
**Only `public/` ships.** Everything else is repo-local.

## Repo layout

```
public/          ← the deployed site; nothing outside this folder is served
  index.html       entry document: desktop stage, collection switcher,
                   mobile placeholder edition
  app.js           four inventories + their facts, four arrangement tables,
                   the COLLECTIONS registry, pan/zoom/focus loop,
                   full-screen viewer, bloom interaction, collection switching
  styles.css       all styling; :root holds the design tokens
  404.html  robots.txt  sitemap.xml
  files/           the 19 bird .webp photographs + logo.svg
    events/        23 .webp — and nothing else
    products/      13 .webp — and nothing else
    portraits/     17 .webp — and nothing else
    lifestyle/     16 .webp — and nothing else
tools/           ← authoring + validation scripts (Node 18+, Python 3 + Pillow)
docs/            ← designguideline.md (normative) + superpowers/ plans & specs
design/          ← standalone design experiments; not part of any build
brand/logo/      ← logo variants the site does not use (kept out of public/)
native/          ← Android/Compose photo-app prototype (Kotlin, Gradle)
style-reference/ ← separate workspace, see below
local-scratch/   ← git-ignored parking for unrelated files; never in public/
  source-sets/     the events / products / portraits originals
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

## The five collections

`COLLECTIONS` in `public/app.js` is the registry: one entry per collection,
each pairing an inventory, a facts table, an arrangement table and a lead map.

| collection | inventory | facts | arrangements | ids | files |
| --- | --- | --- | --- | --- | --- |
| birds | `SPECIES` (19) | `BIRD_FACTS` | `ARR_BIRDS` / `LEAD_BIRDS` | `P1`–`P20`, no `P3` | `public/files/P*.webp` |
| events | `EVENTS` (23) | `EVENT_FACTS` | `ARR_EVENTS` / `LEAD_EVENTS` | `E1`–`E23` | `public/files/events/` |
| products | `PRODUCTS` (13) | `PRODUCT_FACTS` | `ARR_PRODUCTS` / `LEAD_PRODUCTS` | `R1`–`R14`, no `R4` | `public/files/products/` |
| portraits | `PORTRAITS` (17) | `PORTRAIT_FACTS` | `ARR_PORTRAITS` / `LEAD_PORTRAITS` | `T1`–`T17` | `public/files/portraits/` |
| lifestyle | `LIFESTYLE` (16) | `LIFESTYLE_FACTS` | `ARR_LIFESTYLE` / `LEAD_LIFESTYLE` | `L1`–`L16` | `public/files/lifestyle/` |

Ids restart at 1 in each collection — the focus key is scoped to the active
table, so they never collide.

The engine reads four rebindable bindings (`ITEMS`, `FACTS`, `ARRANGEMENTS`,
`ARRANGEMENT_LEAD`) and knows nothing else about collections; `setCollection()`
swaps them, calls `buildPlane()`, drops focus and lands on the new opening
photograph. `#events` / `#products` / `#portraits` / `#lifestyle` in the URL
opens straight into a collection.

**Every collection must be exactly 8 arrangements long.** `PERIOD_X`, the shear
and the tile grid are all sized once at boot from `ARRANGEMENTS.length`; a
different length tears the wrap. `check-arrangements.js` enforces it.

Birds keep the wingspan/weight/range/habitat vitals fields (the native manifest
is written around them, and a species with no published wingspan carries
`length` instead so the row relabels itself). Events, products, portraits and
lifestyle carry an explicit four-row `vitals: [[label, value], …]` array instead.
`vitalRows()` takes either.

The mobile placeholder edition carries all five sets as hand-written `.mcell`
markup, each tile tagged `data-cat`, with the set switcher choosing between
them. Only the birds tiles carry `data-sp` and get their prose from
`populateMobileBloom()`; the other collections' tiles are title and subtitle
only, so a rename has to be typed into both `app.js` and the markup.

## The layout invariant

Each arrangement table is 8 tilings of a 12x8 cell grid (88px module, 24px
gutter). The render and focus code depend on invariants that are easy to break
by hand, so after **any** edit to an `ARR_*` table, an inventory, a `LEAD_*`
map, `TILE_W`/`TILE_H`, or the `--tile-width` / `--tile-height` tokens:

```
node tools/check-arrangements.js     # must print "all invariants pass"
```

It verifies exact 12x8 coverage, unique slot ids, photo-shape/slot-kind
agreement, per-series repeat limits, valid lead ids, equal collection lengths,
and that app.js and styles.css still agree on tile size.

## tools/

| script | what it does |
| --- | --- |
| `check-arrangements.js` | validates the layout invariants above, all five collections — run it |
| `check-species.js` | validates that every copy of the photo data agrees — run it |
| `gen-arrangements.js` | regenerates an `ARR_*` block (`--collection=birds\|events\|products\|all`, deterministic; `--report` for aspect detail) |
| `aspect-fit.js` | research tool: derives which cell spans land near 3:2 / 2:3 |
| `convert-raw.py` | converts a `Raw todo/` JPG batch to web-resolution bird .webp |
| `convert-collection.py` | converts an events / products / portraits / lifestyle source batch into `public/files/<collection>/` |

`gen-arrangements.js` reads its inventory straight out of `public/app.js`, so
its per-collection knobs (`maxPerSeries`, `maxPerKind`, the balance window) are
the only thing to touch there. A collection with no panoramic photograph drops
the 6x2 letterbox span from the palette automatically.

Note: `ARR_BIRDS` was hand-preserved from an older generator for a long time.
That ended on 2026-08-09, when four photographs took the collection from 16 to
20 and the table was regenerated — so all five `ARR_*` tables are now plain
generator output and re-running reproduces them. Still leave a table alone
unless its layout is deliberately being changed.

## Photo data lives in several places

Names, latin names / subtitles, vitals and filenames are duplicated across
`public/app.js` (the five inventories + facts tables), `public/index.html`
(schema.org block, `.mcell` mobile tiles, the switcher buttons) and
`native/app/src/main/assets/photos.json` (birds only). No generator ties them
together — when a photograph is renamed or re-identified, all of them must be
updated by hand, plus the filenames under `public/files/` and
`native/app/src/main/assets/photos/`.

`public/app.js` is the source of truth, and this is the check that catches the
copy you forgot:

```
node tools/check-species.js          # must print "all species data agrees"
```

It reads the inventories straight out of `app.js` and asserts the other copies
match on every identity field — name, latin name, shape/aspect, band colours,
vitals keys and values — plus that the referenced photographs exist on disk with
no orphans, that the switcher buttons in index.html match `COLLECTIONS`, and
that the canonical URL, `og:url` and `sitemap.xml` still name one host. Prose is
deliberately *not* compared: the native manifest carries shortened ledes written
for a phone screen. Typographic variants (en dash vs hyphen, curly vs straight
apostrophe) are normalised before comparison, so only real renames fail.

`check-arrangements.js` and `gen-arrangements.js` both derive their shape and
series maps from `app.js` for the same reason, so they need no hand-syncing.

## The events / products / portraits / lifestyle captions

Events are three bodies of work: **Bouwen met Aarde** (building with earth),
**Addidex 2026**, and a **wedding in Italy**. Products are pieces that were
designed and then printed; the seven that arrived nameless are titled `Printed
Piece` for that reason. The photographer named all of this on 2026-07-29 — the
two series that used to read `Untitled Event` / `Untitled Piece` were renamed
then, along with their files under `public/files/`.

Beyond those names, the prose is still written from what the *files* record —
frame counts, dates and the EXIF that survived the export — because the token
rules above forbid opening the imagery, and a plausible invention would be worse
than a visible gap. Nothing in the structure depends on what the prose says, so
replace it freely as real captions arrive.

Portraits are one body of work split into three series along what the EXIF
records — three eras of lens and body (85 mm 2021–2024, 50 mm on the α7 III,
50 mm on the α7R V). The sitters are deliberately unnamed for privacy; the
prose says so once, and the placeholder captions are built from the EXIF the
files kept, which for this batch is complete.

Lifestyle is sixteen frames of life around the work, 2022–2025, split into
three chronological series (`Lifestyle I/II/III`) the way portraits are. The
source filenames name most of the occasions — a tournament called archicup, an
afternoon in Lisbon, Albania, a bouldering hall — and those names are carried
in the prose, not invented. `Portrait (14).jpg` looks like a stray from the
portraits batch but its EXIF places it in Lisbon with the Lissabon frames, so
it lives in series II; `tools/convert-collection.py` records the full
source-to-frame mapping.

One voice runs across these collections, and it is worth keeping:

- **vitals** — the same four labels in the same order, `Frames · Shot · Format ·
  Camera`, with `Not recorded` where the export stripped it.
- **lede** — what the shoot or the piece is, subject first, then when.
- **fun fact** — one concrete thing worth knowing: from the shoot where the
  files record one (the aperture left alone for two days at Addidex), from the
  subject where they do not (what Italian confetti actually are).

What the files *happen to be* — pixel dimensions, UUID names, dropped EXIF
blocks — is archive bookkeeping and stays out of the prose. On a fact card it
reads as an apology for the photograph rather than a caption for it. The one
exception is a genuine gap the visitor can see for themselves, like an undated
series, which is stated plainly and once.

Presentation values (ambient dim, focus-fade, brand colours) belong in
`styles.css` only. `app.js` deliberately does **not** mirror them into custom
properties at boot — that bridge existed until 2026-07-29 and its two copies had
drifted apart.

## How to run

```
cd public && python -m http.server
```

Then open <http://localhost:8000>. The photographer's Windows machine has no
Python on `PATH` (only the Store stub), so `npx http-server -p 8000 -c-1` from
`public/` is the working fallback there — and the same reason the `.py` tools
above cannot be run from that machine as written.

## style-reference/ is a separate workspace

`style-reference/` is a self-contained workspace for refining the Kees Leemeijer
brand style, with its own `CLAUDE.md`. Open it directly when working on style; do
not edit its files from this workspace, and do not assume any synchronization
between `style-reference/style.css` and the portfolio's `public/styles.css`.
