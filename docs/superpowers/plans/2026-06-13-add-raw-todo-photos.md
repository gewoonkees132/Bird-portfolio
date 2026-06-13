# Add `Raw todo` Photos — Grow Site to 16 Photos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 9 raw JPGs in `public/files/Raw todo/` into web-resolution `.webp` tiles and wire them into the pannable plane, growing the portfolio from 8 to 16 photos (P7's image is replaced; ids become contiguous P1–P16).

**Architecture:** A committed, repeatable Pillow converter (`tools/convert-raw.py`) center-crops each raw to the site's output spec (L→2160×1215 16:9, V→~1440×2160). `public/app.js` gets 8 new `SPECIES` entries, per-species fact sharing for the repeats, and 4 new hand-authored Mondrian arrangements (E–H) that bring every new id onto the cycle. No build step; the plane engine is already parameterized over `ARRANGEMENTS.length`, so it adapts.

**Tech Stack:** Vanilla HTML/CSS/JS · Python 3.13 + Pillow (webp) · `python -m http.server` for local serving · Chrome DevTools MCP for verification.

---

## Source of truth & key facts (verified during planning)

- **Python:** use `py -3.13` (Python 3.13.13, pip 26). The bare `python` on PATH is RoboDK's 3.7 — do **not** use it (Pillow there would be ancient). Pillow is not yet installed in 3.13.
- **No webp encoder** otherwise present (`cwebp`, ImageMagick `magick`, Pillow all absent).
- **Existing output spec** to match: `public/files/*.webp` are 0.4–1.3 MB. Targets: longest edge 2160 px, webp quality 80.
- **`public/files/Raw todo/`** holds the 9 source JPGs (6–16 MB each). It is currently **untracked and NOT in `.gitignore`** — Task 1 fixes that so the 120 MB of JPGs never get committed.
- **`public/app.js` already has uncommitted changes** in the working tree (the in-progress "dwell-glide → dwell-pull" perf refactor). That work is unrelated to this feature; **leave it intact**. The line references in this plan are against that working-tree version (the one currently on disk).
- **`HSPAN` stays at `3`** — see Task 4, Step 5 for the wrap-math reason. The spec's suggestion of `HSPAN = 2` is rejected because it breaks the seamless horizontal wrap.

## File structure

- **Create** `tools/convert-raw.py` — the committed converter (reused for future batches).
- **Create** `public/files/P9..P16-*.webp` (8 files) and **overwrite** `public/files/P7-Great_Tit.webp`.
- **Modify** `public/app.js` — `SPECIES`, `BIRD_FACTS`, the `Photo n / N` meta string, `ARRANGEMENTS`, `ARRANGEMENT_LEAD`, and the related comment headers.
- **Modify** `.gitignore` — ignore `public/files/Raw todo/`.

> **Commit policy:** Each task ends with a commit step as a natural checkpoint, but **only commit when the user approves** (per project convention). We are on branch `perf/interaction-fixes`, which already holds the spec commit `f9a766e`, so commits here are consistent with where the work lives.

> **Note on testing:** this is a no-build vanilla site with no unit-test harness. "Tests" here are concrete verification commands (validation scripts, output-dimension assertions, browser smoke checks) with stated expected output — run them and confirm before claiming done.

---

## Task 1: Conversion toolchain + converter script

**Files:**
- Create: `tools/convert-raw.py`
- Modify: `.gitignore`
- Produces: `public/files/P7,P9–P16-*.webp` (9 files)

- [ ] **Step 1: Install Pillow into Python 3.13 and verify webp support**

Run:
```bash
py -3.13 -m pip install Pillow
py -3.13 -c "import PIL, PIL.features; print('Pillow', PIL.__version__, 'webp:', PIL.features.check('webp'))"
```
Expected: prints e.g. `Pillow 11.x webp: True`. If `webp: False`, stop — the wheel lacks libwebp (would need the standalone `cwebp.exe` fallback from the spec).

- [ ] **Step 2: Confirm the output targets against existing files**

Run:
```bash
py -3.13 -c "from PIL import Image; import os; d='public/files'; [print(f, Image.open(os.path.join(d,f)).size) for f in ('P1-European_Robin.webp','P6-Weaver_Bird_flapping.webp')]"
```
Expected: an `L` file ~`(2160, 1215)` and the `V` file `P6` ~`(1440, 2160)`. This grounds the converter's target dims.

- [ ] **Step 3: Write the converter script**

Create `tools/convert-raw.py`:
```python
#!/usr/bin/env python3
"""Convert the Raw todo/ JPG batch into web-resolution .webp tiles.

Repeatable: edit JOBS for a future batch and re-run.
  py -3.13 tools/convert-raw.py

Output spec (matches existing public/files/*.webp):
  longest edge 2160 px, webp quality 80, method 6 (max compression effort)
  L (landscape): center-crop native 3:2 -> 16:9 -> 2160 x 1215
  V (portrait):  no crop, longest edge -> 2160  (~1440 x 2160)
Center-crop is the default anchor; per-image crop refinement is deferred.
"""
import os
import sys
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC_DIR = os.path.join(ROOT, 'public', 'files', 'Raw todo')
OUT_DIR = os.path.join(ROOT, 'public', 'files')
LONGEST = 2160
QUALITY = 80

# (source jpg, output webp, shape)  shape: 'L' landscape 16:9, 'V' portrait 2:3
JOBS = [
    ('Great_Tit (2).jpg',      'P7-Great_Tit.webp',       'L'),  # overwrite retired P7
    ('Great_Tit (3).jpg',      'P9-Great_Tit.webp',       'L'),
    ('Great_Tit (4).jpg',      'P10-Great_Tit.webp',      'L'),
    ('Great_Tit (5).jpg',      'P11-Great_Tit.webp',      'L'),
    ('Great_Tit (6).jpg',      'P12-Great_Tit.webp',      'L'),
    ('Great_Tit (1).jpg',      'P13-Great_Tit.webp',      'V'),
    ('European_Robin (2).jpg', 'P14-European_Robin.webp', 'L'),
    ('European_Robin (3).jpg', 'P15-European_Robin.webp', 'L'),
    ('European_Robin (1).jpg', 'P16-European_Robin.webp', 'V'),
]


def process(src, out, shape):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)            # honour camera orientation flag
    w, h = im.size
    if shape == 'L':
        target = 16 / 9
        cur = w / h
        if cur > target:                        # too wide -> crop width
            nw, nh = round(h * target), h
        else:                                   # too tall (native 3:2) -> crop height
            nw, nh = w, round(w / target)
        x, y = (w - nw) // 2, (h - nh) // 2     # centered crop
        im = im.crop((x, y, x + nw, y + nh))
        scale = LONGEST / im.size[0]            # longest edge is width for 16:9
    else:                                       # 'V' -> no crop
        scale = LONGEST / max(im.size)          # longest edge is height
    ow, oh = round(im.size[0] * scale), round(im.size[1] * scale)
    im = im.resize((ow, oh), Image.LANCZOS).convert('RGB')
    im.save(out, 'WEBP', quality=QUALITY, method=6)
    return (w, h), (ow, oh), os.path.getsize(out)


def main():
    if not os.path.isdir(SRC_DIR):
        sys.exit('Source dir not found: ' + SRC_DIR)
    print('%-26s %12s %4s %12s %9s' % ('output', 'native', '', 'webp px', 'KB'))
    for src_name, out_name, shape in JOBS:
        src = os.path.join(SRC_DIR, src_name)
        out = os.path.join(OUT_DIR, out_name)
        if not os.path.isfile(src):
            print('  MISSING ' + src_name)
            continue
        native, outsz, nbytes = process(src, out, shape)
        print('%-26s %5dx%-6d [%s] %5dx%-6d %8.1f' % (
            out_name, native[0], native[1], shape, outsz[0], outsz[1], nbytes / 1024))


if __name__ == '__main__':
    main()
```

- [ ] **Step 4: Run the converter**

Run:
```bash
py -3.13 tools/convert-raw.py
```
Expected: 9 rows, no `MISSING`. Every `[L]` row reads `2160x1215`; every `[V]` row reads `1440x2160` (±1 px). KB values land roughly 300–1500.

- [ ] **Step 5: Assert outputs landed correctly**

Run:
```bash
py -3.13 -c "from PIL import Image; import os; d='public/files'; \
ids=[7,9,10,11,12,13,14,15,16]; \
import glob; \
[print(f, Image.open(f).size, round(os.path.getsize(f)/1024,1),'KB') for f in sorted(glob.glob(d+'/P*-*.webp'))]"
```
Expected: 16 files total (P1–P16, no P8 gap, no missing). P7,P9–P12,P14,P15 are `(2160, 1215)`; P13,P16 are `(1440, 2160)`.

- [ ] **Step 6: Keep raw JPGs out of git**

Edit `.gitignore` — add under the `high quality/` line (or anywhere top-level):
```
public/files/Raw todo/
```
Then confirm:
```bash
git status --porcelain "public/files/Raw todo/"
```
Expected: **no output** (the folder is now ignored). And `git status --porcelain public/files/*.webp` shows the new/overwritten webp files as the only image changes to stage.

- [ ] **Step 7: Commit (when approved)**

```bash
git add tools/convert-raw.py .gitignore public/files/P7-Great_Tit.webp \
  public/files/P9-Great_Tit.webp public/files/P10-Great_Tit.webp \
  public/files/P11-Great_Tit.webp public/files/P12-Great_Tit.webp \
  public/files/P13-Great_Tit.webp public/files/P14-European_Robin.webp \
  public/files/P15-European_Robin.webp public/files/P16-European_Robin.webp
git commit -m "Add converter + 9 web-res webp from Raw todo batch"
```

---

## Task 2: SPECIES — add ids 9–16

**Files:**
- Modify: `public/app.js` (the `SPECIES` array and its header comment)

- [ ] **Step 1: Update the SPECIES header comment**

Replace the comment block above `const F = ...` (currently "Species data (8 photos)" and the crop tally) with an accurate 16-photo version.

Old:
```javascript
  // ---------- Species data (8 photos) ----------
  // Crops: 4 landscape (P1,P3,P5,P7) · 2 vertical (P2,P6) · 2 super-wide (P4,P8)
  // Image assignment matches each photo's native aspect to its slot shape:
  //   L slots ← landscape photos (~3:2)   V slots ← vertical photos (~2:3)
  //   W slots ← landscape photos cropped wide via object-fit: cover
```
New:
```javascript
  // ---------- Species data (16 photos) ----------
  // Shapes: L landscape 16:9 (1,3,5,7,9,10,11,12,14,15) · V portrait 2:3
  //   (2,6,13,16) · W super-wide letterbox (4,8). Repeats are intentional —
  //   Weaver appears twice (2 nest / 6 flight) and the Raw-todo batch adds more
  //   Great Tit + Robin tiles. Image assignment matches each photo's native
  //   aspect to its slot shape:
  //   L slots ← landscape photos (~3:2)   V slots ← vertical photos (~2:3)
  //   W slots ← landscape photos cropped wide via object-fit: cover
```

- [ ] **Step 2: Add the 8 new SPECIES entries**

Insert the new entries between the `id: 8` (Lark) entry and the array's closing `];`.

Old:
```javascript
    { id: 8, vernacular: 'Lark',                  latin: 'Alauda arvensis',        shape: 'W',
      band_a: '#cdc4b0', band_b: '#bdb4a0',
      image: F('P8-Lark.webp') },
  ];
```
New:
```javascript
    { id: 8, vernacular: 'Lark',                  latin: 'Alauda arvensis',        shape: 'W',
      band_a: '#cdc4b0', band_b: '#bdb4a0',
      image: F('P8-Lark.webp') },
    // Raw-todo batch (2026-06-13). Great Tit reuses P7's browns + Parus major;
    // Robin reuses P1's blues + Erithacus rubecula. Facts shared per species
    // below. id 7's image was replaced in the same batch (entry unchanged).
    { id: 9,  vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P9-Great_Tit.webp') },
    { id: 10, vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P10-Great_Tit.webp') },
    { id: 11, vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P11-Great_Tit.webp') },
    { id: 12, vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P12-Great_Tit.webp') },
    { id: 13, vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'V',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P13-Great_Tit.webp') },
    { id: 14, vernacular: 'European Robin',       latin: 'Erithacus rubecula',     shape: 'L',
      band_a: '#3d6b8a', band_b: '#4a7c9a',
      image: F('P14-European_Robin.webp') },
    { id: 15, vernacular: 'European Robin',       latin: 'Erithacus rubecula',     shape: 'L',
      band_a: '#3d6b8a', band_b: '#4a7c9a',
      image: F('P15-European_Robin.webp') },
    { id: 16, vernacular: 'European Robin',       latin: 'Erithacus rubecula',     shape: 'V',
      band_a: '#3d6b8a', band_b: '#4a7c9a',
      image: F('P16-European_Robin.webp') },
  ];
```

- [ ] **Step 3: Verify the array parses (no browser yet)**

Run:
```bash
node -e "require('fs').readFileSync('public/app.js','utf8'); console.log('read ok')" && \
node --check public/app.js && echo "syntax ok"
```
Expected: `syntax ok`. (`node --check` parses the file; it does not execute the IIFE.)

- [ ] **Step 4: Commit (when approved)**

```bash
git add public/app.js
git commit -m "SPECIES: add Great Tit + Robin ids 9-16"
```

---

## Task 3: BIRD_FACTS — share prose per species; fix photo count

**Files:**
- Modify: `public/app.js` (the `BIRD_FACTS` block + the `Photo n / N` meta string)

- [ ] **Step 1: Update the BIRD_FACTS "keyed by" comment**

Old (the line just above `const BIRD_FACTS = {`):
```javascript
  // Keyed by SPECIES.id (1–8).
```
New:
```javascript
  // Keyed by SPECIES.id. Bespoke prose for ids 1–8; the repeated Raw-todo
  // tiles share existing per-species prose via the alias assignments after
  // the literal (Great Tit 9–13 → 7, Robin 14–16 → 1). No new prose is
  // written; the two distinct Weaver entries (2 nest / 6 flight) are preserved.
```

- [ ] **Step 2: Add per-species alias assignments after the BIRD_FACTS literal**

The literal currently closes with the `8: { ... }` entry then `};` (around line 103). Insert the aliases immediately after that closing `};`.

Old:
```javascript
    8: {
      wingspan: '30–36 cm', weight: '33–45 g',
      range: 'Europe, Asia, N Africa', habitat: 'Open farmland',
      lede: 'The Eurasian Skylark is a small brown bird of open farmland with one big trick. The male climbs almost out of sight on whirring wings, then hangs there and pours out a long, bubbling song over the field below.',
      fun_fact: 'When a merlin gives chase, the skylark sings while it flees. The better the song in mid-air, the sooner the falcon gives up and turns away. The song is not for show. It is a message that says, save your effort, you will not catch me.'
    }
  };
```
New:
```javascript
    8: {
      wingspan: '30–36 cm', weight: '33–45 g',
      range: 'Europe, Asia, N Africa', habitat: 'Open farmland',
      lede: 'The Eurasian Skylark is a small brown bird of open farmland with one big trick. The male climbs almost out of sight on whirring wings, then hangs there and pours out a long, bubbling song over the field below.',
      fun_fact: 'When a merlin gives chase, the skylark sings while it flees. The better the song in mid-air, the sooner the falcon gives up and turns away. The song is not for show. It is a message that says, save your effort, you will not catch me.'
    }
  };

  // Repeated Raw-todo species reuse the existing per-species prose (shared
  // object reference — facts are read-only). All Great Tit ids point at the
  // Great Tit entry (7); all Robin ids at the Robin entry (1).
  BIRD_FACTS[9] = BIRD_FACTS[10] = BIRD_FACTS[11] = BIRD_FACTS[12] = BIRD_FACTS[13] = BIRD_FACTS[7];
  BIRD_FACTS[14] = BIRD_FACTS[15] = BIRD_FACTS[16] = BIRD_FACTS[1];
```

This keeps every `BIRD_FACTS[sp.id]` / `BIRD_FACTS[id]` lookup (in `commitFocus` and `populateMobileBloom`) working unchanged.

- [ ] **Step 3: Fix the hardcoded photo count in the label meta**

In `commitFocus`, the meta string hardcodes `/ 8`. Make it track the real count.

Old:
```javascript
    speciesMeta.textContent = `Photo ${sp.id} / 8 · Arrangement ${ARRANGEMENTS[info.arrIdx].name}`;
```
New:
```javascript
    speciesMeta.textContent = `Photo ${sp.id} / ${SPECIES.length} · Arrangement ${ARRANGEMENTS[info.arrIdx].name}`;
```

- [ ] **Step 4: Verify syntax**

Run:
```bash
node --check public/app.js && echo "syntax ok"
```
Expected: `syntax ok`.

- [ ] **Step 5: Commit (when approved)**

```bash
git add public/app.js
git commit -m "BIRD_FACTS: share prose per species; photo count tracks SPECIES.length"
```

---

## Task 4: Arrangements E–H + keep HSPAN at 3

**Files:**
- Modify: `public/app.js` (`ARRANGEMENTS` array, its header comment, `ARRANGEMENT_LEAD`, and a clarifying comment at `HSPAN`)

The four new arrangements were validated during planning as **exact 12×7 tilings** (7 rects each = 6 photo + 1 brand, every cell covered once), with every `V` id in a tall slot and every `L` id in a wide/square slot. Across A–H every id 1–16 appears (~3× each; new ids 7,9–16 all present).

- [ ] **Step 1: Update the ARRANGEMENTS header comment**

Old:
```javascript
  // ---------- Arrangements ----------
  // Tile: 1320 x 760. 12×7 cell grid, module 88, gutter 24, no outer margin.
  // Each arrangement uses 7 of 8 photos in a hand-designed Mondrian.
  // The four arrangements use overlapping photo sets in different permutations.
```
New:
```javascript
  // ---------- Arrangements ----------
  // Tile: 1320 x 760. 12×7 cell grid, module 88, gutter 24, no outer margin.
  // Each arrangement is an exact tiling: 6 photo slots + 1 brand slot, every
  // cell covered once. A–D draw from the original 8 ids; E–H bring the
  // Raw-todo ids (7,9–16) onto the cycle. The union of A–H references all 16
  // ids (~3 appearances each). Place V ids in tall slots, L ids in wide ones.
```

- [ ] **Step 2: Append arrangements E–H**

The `ARRANGEMENTS` array currently closes after arrangement `D` with `  ];`. Insert E–H between `D` and that closing bracket.

Old (tail of arrangement D):
```javascript
    {
      name: 'D',
      slots: [
        { c:0, r:0, cw:6, ch:2, id: 8 },
        { c:6, r:0, cw:6, ch:2, id: 4 },
        { c:0, r:2, cw:2, ch:4, id: 6 },
        { c:2, r:2, cw:7, ch:4, id: 1 },
        { c:9, r:2, cw:3, ch:4, id: 2 },
        { c:0, r:6, cw:6, ch:1, brand: true },
        { c:6, r:6, cw:6, ch:1, id: 3 },
      ]
    },
  ];
```
New:
```javascript
    {
      name: 'D',
      slots: [
        { c:0, r:0, cw:6, ch:2, id: 8 },
        { c:6, r:0, cw:6, ch:2, id: 4 },
        { c:0, r:2, cw:2, ch:4, id: 6 },
        { c:2, r:2, cw:7, ch:4, id: 1 },
        { c:9, r:2, cw:3, ch:4, id: 2 },
        { c:0, r:6, cw:6, ch:1, brand: true },
        { c:6, r:6, cw:6, ch:1, id: 3 },
      ]
    },
    {
      name: 'E',
      slots: [
        { c:0, r:0, cw:8, ch:3, id: 9 },
        { c:8, r:0, cw:4, ch:3, id: 14 },
        { c:0, r:3, cw:3, ch:4, id: 13 },   // V
        { c:3, r:3, cw:5, ch:2, id: 7 },
        { c:8, r:3, cw:4, ch:3, id: 15 },
        { c:3, r:5, cw:5, ch:2, id: 10 },
        { c:8, r:6, cw:4, ch:1, brand: true },
      ]
    },
    {
      name: 'F',
      slots: [
        { c:0, r:0, cw:3, ch:5, id: 16 },   // V
        { c:3, r:0, cw:9, ch:2, id: 11 },
        { c:3, r:2, cw:4, ch:2, id: 12 },
        { c:7, r:2, cw:5, ch:2, id: 15 },
        { c:3, r:4, cw:9, ch:2, id: 14 },
        { c:0, r:5, cw:3, ch:2, id: 9 },
        { c:3, r:6, cw:9, ch:1, brand: true },
      ]
    },
    {
      name: 'G',
      slots: [
        { c:0, r:0, cw:3, ch:4, id: 13 },   // V
        { c:9, r:0, cw:3, ch:4, id: 16 },   // V
        { c:3, r:0, cw:6, ch:2, id: 11 },
        { c:3, r:2, cw:6, ch:2, id: 12 },
        { c:0, r:4, cw:7, ch:3, id: 10 },
        { c:7, r:4, cw:5, ch:2, id: 7 },
        { c:7, r:6, cw:5, ch:1, brand: true },
      ]
    },
    {
      name: 'H',
      slots: [
        { c:0, r:0, cw:4, ch:2, id: 11 },
        { c:4, r:0, cw:5, ch:2, id: 12 },
        { c:9, r:0, cw:3, ch:4, id: 13 },   // V
        { c:0, r:2, cw:3, ch:4, id: 16 },   // V
        { c:3, r:2, cw:6, ch:2, id: 14 },
        { c:3, r:4, cw:9, ch:2, id: 15 },
        { c:0, r:6, cw:12, ch:1, brand: true },
      ]
    },
  ];
```

- [ ] **Step 3: Extend ARRANGEMENT_LEAD for the new arrangements**

`ARRANGEMENT_LEAD[0]` is the only entry currently read (for the initial pan center), but keep the map complete so it isn't a half-filled lookup. Give each new arrangement a sensible hero id.

Old:
```javascript
  const ARRANGEMENT_LEAD = { 0: 5, 1: 3, 2: 7, 3: 1 };
```
New:
```javascript
  const ARRANGEMENT_LEAD = { 0: 5, 1: 3, 2: 7, 3: 1, 4: 9, 5: 16, 6: 13, 7: 11 };
```

- [ ] **Step 4: Add a comment at HSPAN explaining why it stays 3**

This pre-empts a future reader "fixing" `HSPAN` to 2 (which the spec suggested) and breaking the wrap.

Old:
```javascript
  const HSPAN = 3;
  const VSPAN = 5;
```
New:
```javascript
  // HSPAN must stay >= 3: render() pins worldX inside the *middle* strip copy
  // (middleCopyOriginX = one strip in), so a full strip is needed on BOTH sides
  // for the seamless horizontal wrap. With 8 arrangements this is 24 columns;
  // the engine is parameterized over ARRANGEMENTS.length, so nothing else
  // changes. (Dropping to 2 leaves no strip to the right of center → wrap tears.)
  const HSPAN = 3;
  const VSPAN = 5;
```

- [ ] **Step 5: Verify syntax + re-validate tilings**

Run:
```bash
node --check public/app.js && echo "syntax ok"
```
Expected: `syntax ok`.

Then re-confirm the four tilings programmatically (guards against a typo in the coordinates):
```bash
py -3.13 - <<'PY'
import re
src = open('public/app.js', encoding='utf-8').read()
# pull each named arrangement's slot list
for name in ['E','F','G','H']:
    block = re.search(r"name:\s*'%s',\s*slots:\s*\[(.*?)\]" % name, src, re.S).group(1)
    slots = re.findall(r"c:\s*(\d+),\s*r:\s*(\d+),\s*cw:\s*(\d+),\s*ch:\s*(\d+)", block)
    cover = {}
    ok = True
    for c, r, cw, ch in slots:
        c, r, cw, ch = int(c), int(r), int(cw), int(ch)
        for x in range(c, c + cw):
            for y in range(r, r + ch):
                if (x, y) in cover or not (0 <= x < 12 and 0 <= y < 7):
                    ok = False
                cover[(x, y)] = True
    full = len(cover) == 84 and ok and len(slots) == 7
    print(name, 'OK' if full else 'FAIL', 'slots=%d cells=%d' % (len(slots), len(cover)))
PY
```
Expected: `E OK ...`, `F OK ...`, `G OK ...`, `H OK ...` (each slots=7 cells=84).

- [ ] **Step 6: Commit (when approved)**

```bash
git add public/app.js
git commit -m "Arrangements: add E-H to bring all 16 photos onto the cycle"
```

---

## Task 5: Browser verification (the real test)

**Files:** none modified. This is the spec's §5 acceptance pass.

- [ ] **Step 1: Serve the site**

Run (background):
```bash
python -m http.server 8000 --directory public
```
(Plain `python` is fine here — it's only an HTTP server, not Pillow.)

- [ ] **Step 2: Load and check the console**

Use Chrome DevTools MCP: `new_page` → `http://localhost:8000` → `list_console_messages`.
Expected: no `[bird-portfolio] Image failed to load` warnings, no errors. (Each such warning names a broken `src` → fix the corresponding `SPECIES.image` path.)

- [ ] **Step 3: Confirm all 16 images resolve**

In the page, evaluate:
```javascript
[...document.querySelectorAll('.photo-img')]
  .reduce((m, img) => { const ok = img.complete && img.naturalWidth > 0;
    m.total++; if (!ok) m.broken.push(img.getAttribute('src')); return m; },
    { total: 0, broken: [] });
```
Note: lazy-loaded off-screen imgs may not have loaded yet — pan/zoom out first, or check `.has-image` count grows as you pan. The key signal is **zero entries with a unique broken src** among on-screen tiles, and no `img-failed` class anywhere.

- [ ] **Step 4: Walk all 8 arrangements**

Pan across (drag / arrow keys) so the compass cycles `A B C D E F G H A …`. For each new arrangement E–H confirm:
- Tiles fill the 12×7 grid with no gaps or overlapping photos.
- The plane pans and wraps smoothly with no tear/blank gutter at the wrap seam (this is the HSPAN=3 check).
- Arrow-key nav lands on photo centers (no dead jumps), and the species label updates with the right name + `P{id}`.

- [ ] **Step 5: Spot-check the facts panel**

- Focus a new Great Tit tile (e.g. P9–P13) → lede/vitals/fun-fact match the existing Great Tit text (the bat-predation fun fact).
- Focus a new Robin tile (P14–P16) → matches the existing Robin text (red-feather decoy fun fact).
- Focus a Weaver tile (P2 then P6) → the **two distinct** Weaver texts are preserved (nest-building vs daily-commute).
- Label meta reads `Photo n / 16`.

- [ ] **Step 6: Screenshot for the record**

`take_screenshot` (full page) of at least one E–H arrangement centered, to confirm Mondrian balance reads well. If a brand bar or a slot looks visually off, tweak the relevant `cw/ch/c/r` (keeping the tiling exact — re-run Task 4 Step 5's validator) and reload. This is the spec's intended "eyeball in the browser" refinement.

- [ ] **Step 7: Stop the server**

Stop the background `http.server`.

---

## Self-review (spec coverage)

| Spec section | Covered by |
|---|---|
| §1 Conversion pipeline (Pillow, script, output spec, raw stays ignored) | Task 1 |
| §2 Naming → contiguous P1–P16, P7 reused/overwritten | Task 1 JOBS + Task 2 |
| §3 SPECIES +8 entries; BIRD_FACTS per-species (option b) | Tasks 2, 3 |
| §4 Layout: 4 arrangements E–H, exact tiling, coverage of all 16, shape fidelity, cycle retune | Task 4 |
| §4 HSPAN retune | Task 4 Step 4 — **deviation:** kept at 3 (the spec's HSPAN=2 breaks the middle-copy wrap; documented in code) |
| §5 Verification | Task 5 |
| Out of scope (crop refinement, mobile, new prose, style-reference) | Untouched |

**Deviation to flag to the user:** the spec proposed `HSPAN = 2`. Implementation keeps `HSPAN = 3` because the wrap engine pins the viewport inside the middle of three strip copies and needs a full strip on each side; `2` would tear the right edge. Net effect: 24 tile-columns instead of 16. Everything else follows the spec.
