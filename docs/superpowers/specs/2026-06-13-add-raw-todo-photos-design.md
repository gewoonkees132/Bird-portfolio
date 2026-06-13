# Add `Raw todo` photos — grow site to 16 photos

**Date:** 2026-06-13
**Status:** Approved design, ready for implementation plan

## Goal

Process the 9 raw JPGs in `public/files/Raw todo/` into web-resolution `.webp`
images and include them on the site, growing the photo plane from 8 to 16
photos. The original `P7-Great_Tit.webp` is retired and replaced by shots from
this batch.

## Source batch

9 full-resolution JPGs (~6–16 MB each), two species only:

| File | Native px | Aspect | Orientation → shape |
|------|-----------|--------|---------------------|
| `European_Robin (1).jpg` | 4075×6113 | 0.67 | portrait → `V` |
| `European_Robin (2).jpg` | 5395×3597 | 1.50 | landscape → `L` |
| `European_Robin (3).jpg` | 3667×2445 | 1.50 | landscape → `L` |
| `Great_Tit (1).jpg` | 3982×5973 | 0.67 | portrait → `V` |
| `Great_Tit (2).jpg` | 5451×3634 | 1.50 | landscape → `L` |
| `Great_Tit (3).jpg` | 5588×3725 | 1.50 | landscape → `L` |
| `Great_Tit (4).jpg` | 7752×5168 | 1.50 | landscape → `L` |
| `Great_Tit (5).jpg` | 7581×5054 | 1.50 | landscape → `L` |
| `Great_Tit (6).jpg` | 7428×4952 | 1.50 | landscape → `L` |

Result: 6 Great Tit + 3 Robin → 7 landscape (`L`), 2 portrait (`V`).

## Decisions (from brainstorming)

- **Grow the site** to 16 photos (not a 1:1 swap). All 9 raw shots are in.
- **Repeated species are fine** — the site already shows Weaver Bird twice
  (`P2` nest / `P6` flight), so multiple Great Tit / Robin tiles fit the
  established pattern.
- **Facts shared per species.** All Great Tit tiles resolve to the existing
  Great Tit prose (current `BIRD_FACTS[7]`); all Robin tiles to the existing
  Robin prose (`BIRD_FACTS[1]`). The two bespoke Weaver entries (`P2`/`P6`)
  are left untouched — current variation preserved.
- **Band colors reused per species** — new Great Tits inherit `P7`'s browns,
  new Robins inherit `P1`'s blues.
- **Crop = automated center-crop now; refine later.** No per-image
  browser crop pass this session. The user will refine crops in a later pass.
- **Layout approach A** — add 4 new arrangements (E–H), keeping the calm
  6-photo-per-tile Mondrian density. Not denser tiles, not a bigger module.

## 1. Conversion pipeline

No webp encoder is installed (`cwebp`, ImageMagick, Pillow, sharp all absent;
the `convert` on PATH is the Windows disk tool, not ImageMagick).

- **Tool:** install **Pillow** (`python -m pip install Pillow`). Python 3.7 is
  available. Fallback if pip is blocked: download standalone `cwebp.exe`
  (libwebp) and shell out.
- **Script:** a small, repeatable converter (e.g. `tools/convert-raw.py`),
  committed so future batches reuse it.
- **Output spec (match existing files):**
  - Longest edge **2160 px**, webp **quality ~80**.
  - `L` (landscape): center-crop native 3:2 → **16:9**, output `2160×1215`.
  - `V` (portrait): native 2:3 needs **no crop**, output `1440×2160`
    (matches existing `P6`).
  - Center-crop is the default anchor; refinement deferred.
- Source JPGs remain in `Raw todo/` (untracked). Only `.webp` outputs are
  committed. `Raw todo/` stays git-ignored or is left untracked.

## 2. Naming & id assignment → contiguous `P1–P16`

Old `P7-Great_Tit.webp` retired; **id 7 reused** to keep ids contiguous.
Existing keepers unchanged: ids `1,2,3,4,5,6,8`.

| id | Species | Shape | Source file | Output file |
|----|---------|-------|-------------|-------------|
| 7  | Great Tit     | L | `Great_Tit (2).jpg`     | `P7-Great_Tit.webp` (overwrite) |
| 9  | Great Tit     | L | `Great_Tit (3).jpg`     | `P9-Great_Tit.webp` |
| 10 | Great Tit     | L | `Great_Tit (4).jpg`     | `P10-Great_Tit.webp` |
| 11 | Great Tit     | L | `Great_Tit (5).jpg`     | `P11-Great_Tit.webp` |
| 12 | Great Tit     | L | `Great_Tit (6).jpg`     | `P12-Great_Tit.webp` |
| 13 | Great Tit     | V | `Great_Tit (1).jpg`     | `P13-Great_Tit.webp` |
| 14 | European Robin | L | `European_Robin (2).jpg` | `P14-European_Robin.webp` |
| 15 | European Robin | L | `European_Robin (3).jpg` | `P15-European_Robin.webp` |
| 16 | European Robin | V | `European_Robin (1).jpg` | `P16-European_Robin.webp` |

Total photos: 7 existing (`1,2,3,4,5,6,8`) + 9 new (`7,9–16`) = **16**.
Tile labels render `P{id}`, so the site shows `P1`–`P16` (no `P7` gap since it
is reused).

## 3. Data model changes (`public/app.js`)

- **`SPECIES`** — add 8 new entries (ids `9–16`) and overwrite the `id:7`
  entry's image/source. Each entry: `id`, `vernacular`, `latin`, `shape`,
  `band_a`, `band_b`, `image`.
  - Great Tit entries: `latin: 'Parus major'`, browns from `P7`.
  - Robin entries: `latin: 'Erithacus rubecula'`, blues from `P1`.
- **`BIRD_FACTS`** — resolve facts **per species**, not per id. Implementation
  options (pick simplest at plan time):
  - (a) a `vernacular → facts` lookup with a per-id override map that retains
    the two distinct Weaver entries, **or**
  - (b) keep id-keyed `BIRD_FACTS` but point every Great Tit id at the existing
    Great Tit fact object and every Robin id at the existing Robin object.
  - Either way: no new prose is written; no fabrication. Weaver `P2`/`P6`
    bespoke text is preserved verbatim.

## 4. Layout — 4 new arrangements E–H

- Each new arrangement: **12×7 cell grid, module 88, gutter 24**, **6 photo
  slots + 1 brand slot**, exact tiling (every cell covered once, no overlaps) —
  matching A–D's construction and calm density.
- **Coverage requirement:** the union of arrangements A–H must reference **all
  16 ids** (`1–16`). New ids `7,9–16` must appear; existing ids may recur for
  balance. Target ~3 appearances per photo across the full cycle.
- **Shape fidelity:** place each photo in a slot whose cell aspect suits its
  shape (`L` wide-ish, `V` tall, `W` super-wide) so `object-fit: cover` crops
  sensibly. New photos are only `L` or `V`.
- **Cycle retune:** the plane cycles columns through `ARRANGEMENTS` via
  `col % ARRANGEMENTS.length`; `PERIOD_X` already keys off
  `ARRANGEMENTS.length`, so it adapts. Re-tune `HSPAN` (currently 3) so total
  columns and plane width stay sensible with 8 arrangements (e.g. `HSPAN = 2`
  → 16 columns). Verify pan wrap and arrow-key nav still feel right.
- Exact slot coordinates for E–H are authored during implementation (with the
  site open in the browser to eyeball the Mondrian balance), not in this spec.

## 5. Verification

Run `python -m http.server`, open `http://localhost:8000`, confirm:

- All 16 photos load; no `img-failed` / broken slots in console.
- Labels read `P1`–`P16` with correct species names.
- Facts panel shows the shared per-species prose; Weaver tiles keep their two
  distinct texts.
- Arrangements E–H tile cleanly (no gaps/overlaps); plane pans and wraps
  smoothly; arrow-key navigation lands on photo centers across all 8
  arrangements.
- New `.webp` files are ~2160 px longest edge and comparable in file size to
  existing ones (~0.4–1.3 MB).

## Out of scope / deferred

- Tight per-image crop refinement (user will do later).
- Mobile placeholder edition (unchanged).
- Any new fun-fact prose for repeated species.
- `style-reference/` workspace (separate, untouched).
