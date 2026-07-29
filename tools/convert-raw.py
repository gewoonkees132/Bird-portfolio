#!/usr/bin/env python3
"""Convert the Raw todo/ JPG batch into web-resolution .webp tiles.

Repeatable: edit JOBS for a future batch and re-run.
  py -3.13 tools/convert-raw.py

Output spec:
  longest edge 2160 px, webp quality 80, method 6 (max compression effort)
  L (landscape): 3:2 -> 2160 x 1440   (no crop at all from a native-3:2 camera)
  V (portrait):  no crop, longest edge -> 2160  (~1440 x 2160)
Center-crop is the default anchor; per-image crop refinement is deferred.

The L target was 16:9 until 2026-07-28, which threw away 15.6% of every
landscape frame before it ever reached a slot. The desktop layout now sizes its
landscape slots on the (3n,2n) span family — 3x2, 6x4, 9x6, all within 4% of
3:2 — so a 3:2 export very nearly fills its slot instead of being cropped to
fit. See tools/aspect-fit.js for the lattice derivation.

The public/files/*.webp landscapes still on disk are the older 16:9 exports;
they lose a sliver of their sides to object-fit: cover until someone re-runs
this script over the original JPGs. Doing that needs the originals, which are
not in the repo (the 'Raw todo' batch was deleted after conversion and the
git-ignored 'high quality/' folder is absent), plus Python with Pillow.
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

# (source jpg, output webp, shape)  shape: 'L' landscape 3:2, 'V' portrait uncropped
JOBS = [
    ('Great_Tit (2).jpg',      'P7-Eurasian_Blue_Tit.webp',       'L'),  # overwrite retired P7
    ('Great_Tit (3).jpg',      'P9-Eurasian_Blue_Tit.webp',       'L'),
    ('Great_Tit (4).jpg',      'P10-Great_Tit.webp',      'L'),
    ('Great_Tit (5).jpg',      'P11-Great_Tit.webp',      'L'),
    ('Great_Tit (6).jpg',      'P12-Great_Tit.webp',      'L'),
    ('Great_Tit (1).jpg',      'P13-Eurasian_Blue_Tit.webp',      'V'),
    ('European_Robin (2).jpg', 'P14-European_Robin.webp', 'L'),
    ('European_Robin (3).jpg', 'P15-European_Robin.webp', 'L'),
    ('European_Robin (1).jpg', 'P16-European_Robin.webp', 'V'),
]


def process(src, out, shape):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)            # honour camera orientation flag
    w, h = im.size
    if shape == 'L':
        target = 3 / 2                          # matches the layout's landscape slots
        cur = w / h
        if cur > target:                        # too wide -> crop width
            nw, nh = round(h * target), h
        else:                                   # too tall -> crop height
            nw, nh = w, round(w / target)
        x, y = (w - nw) // 2, (h - nh) // 2     # centered crop
        im = im.crop((x, y, x + nw, y + nh))
        scale = LONGEST / im.size[0]            # longest edge is width for 3:2
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
