#!/usr/bin/env python3
"""Convert a dropped batch of photographs into one of the site's collections.

Sibling of convert-raw.py, which handles the bird batches. This one handles the
events and products sets: same output spec, but it writes into a per-collection
subfolder of public/files and never upscales.

  py -3.13 tools/convert-collection.py events
  py -3.13 tools/convert-collection.py products
  py -3.13 tools/convert-collection.py events --dry-run

Output spec:
  longest edge 2160 px, webp quality 80, method 6 (max compression effort)
  L (landscape): centre crop to 3:2   -> up to 2160 x 1440
  V (portrait):  centre crop to 2:3   -> up to 1440 x 2160
The landscape slots on the plane come from the (3n,2n) span family (3x2, 6x4,
9x6 — all within 4% of 3:2), so a 3:2 export very nearly fills its slot instead
of being cropped to fit by object-fit: cover. See tools/aspect-fit.js.

Unlike convert-raw.py this NEVER upscales: several of the source files arrived
already resized to a 2048-pixel long edge, and stretching them to 2160 would
add nothing but bytes. The webp then carries its native size and the layout is
unaffected — the slots are sized in CSS, not by the file.

The 2026-07-29 run was done with a throwaway sharp script under local-scratch/
because the photographer's machine had no Python on PATH. The output spec is
the same; this file is the reproducible, dependency-declared version, and the
JOBS tables below are the record of which source file became which frame.

After a re-run, update public/app.js (EVENTS / PRODUCTS), regenerate the
arrangements and re-run both checks:

  node tools/gen-arrangements.js --collection=events
  node tools/check-arrangements.js
  node tools/check-species.js
"""
import os
import sys
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LONGEST = 2160
QUALITY = 80

# Sources live outside public/ — public/ is the deployed artifact and anything
# unreferenced sitting there ships to visitors for free. The originals were
# parked in local-scratch/source-sets/ (git-ignored) after the first conversion.
SRC_ROOT = os.path.join(ROOT, 'local-scratch', 'source-sets')
OUT_ROOT = os.path.join(ROOT, 'public', 'files')

# (source file, output name, shape). Shape drives the crop: L -> 3:2, V -> 2:3.
#
# Two duplicates were dropped when this batch came in, and both are worth
# recording so a re-run does not resurrect them:
#   - Secondset_Product/20260624_Bouwen-met-Aarde_91-4-scaled.jpg was
#     byte-identical to the Thirdset_Events copy. It is an event frame; the
#     products copy went.
#   - Thirdset_Events/f46c7e63-… was byte-identical to 9e1f82e2-….
COLLECTIONS = {
    'products': {
        'src': 'Secondset_Product',
        'out': 'products',
        'jobs': [
            # The 2026-07-30 cull: the photographer retired R1-R3 (the SIKA 2K
            # column series) and R12-R13 (sources 10.webp and 14.webp) when the
            # Fourthset batch below arrived. Their ids are not reused; a re-run
            # must not resurrect them.
            ('References Colour printing Vertico (5).jpg', 'R4-Colour_Printing.webp',    'L'),
            ('Addidex2026-033.jpg',                        'R5-Addidex_Showpiece.webp',  'L'),
            ('Addidex2026-089.jpg',                        'R6-Addidex_Showpiece.webp',  'V'),
            ('20.jpeg',                                    'R7-Studio_Piece.webp',       'L'),
            ('1.webp',                                     'R8-Printed_Piece.webp',      'L'),
            ('3.webp',                                     'R9-Printed_Piece.webp',      'L'),
            ('4.webp',                                     'R10-Printed_Piece.webp',     'L'),
            ('5.webp',                                     'R11-Printed_Piece.webp',     'L'),
            ('15.webp',                                    'R14-Printed_Piece.webp',     'V'),
        ],
    },
    # The 2026-07-30 products drop: eight frames from one sitting on the
    # afternoon of 2026-07-29 (Sony α7R V, 50 mm f/1.2 Art), delivered as bare
    # DSC numbers. Converted that day with a sharp equivalent under
    # local-scratch/imgtools/ (convert-fourthset.js) for the same no-Python
    # reason as the 2026-07-29 run. Ids continue after the retired ones; order
    # is shooting order.
    'products-2026-07': {
        'src': 'Fourthset_Product',
        'out': 'products',
        'jobs': [
            ('DSC07063.jpg',                               'R15-Studio_Session.webp',    'V'),
            ('DSC07107.jpg',                               'R16-Studio_Session.webp',    'V'),
            ('DSC07189.jpg',                               'R17-Studio_Session.webp',    'V'),
            ('DSC07193.jpg',                               'R18-Studio_Session.webp',    'L'),
            ('DSC07220.jpg',                               'R19-Studio_Session.webp',    'V'),
            ('DSC07251.jpg',                               'R20-Studio_Session.webp',    'V'),
            ('DSC07252.jpg',                               'R21-Studio_Session.webp',    'V'),
            ('DSC07260.jpg',                               'R22-Studio_Session.webp',    'L'),
            # Two more frames from the same sitting, dropped a day after the
            # first eight — appended, so these two sit out of shooting order.
            ('DSC07214.jpg',                               'R23-Studio_Session.webp',    'V'),
            ('DSC07222.jpg',                               'R24-Studio_Session.webp',    'V'),
        ],
    },
    'events': {
        'src': 'Thirdset_Events',
        'out': 'events',
        'jobs': [
            ('20260624_Bouwen-met-Aarde_91-4-scaled.jpg',  'E1-Bouwen_met_Aarde.webp',  'L'),
            ('20260624_Bouwen-met-Aarde_91-7-scaled.jpg',  'E2-Bouwen_met_Aarde.webp',  'L'),
            ('20260624_Bouwen-met-Aarde_92-29-scaled.jpg', 'E3-Bouwen_met_Aarde.webp',  'L'),
            ('20260624_Bouwen-met-Aarde_92-6-scaled.jpg',  'E4-Bouwen_met_Aarde.webp',  'V'),
            ('20260625_Bouwen-met-Aarde_91-34-scaled.jpg', 'E5-Bouwen_met_Aarde.webp',  'L'),
            ('20260625_Bouwen-met-Aarde_91-55-scaled.jpg', 'E6-Bouwen_met_Aarde.webp',  'V'),
            ('20260625_Bouwen-met-Aarde_92-6-scaled.jpg',  'E7-Bouwen_met_Aarde.webp',  'L'),
            ('Addidex2026-004.jpg',                        'E8-Addidex_2026.webp',      'L'),
            ('Addidex2026-005.jpg',                        'E9-Addidex_2026.webp',      'L'),
            ('Addidex2026-011.jpg',                        'E10-Addidex_2026.webp',     'V'),
            ('Addidex2026-012.jpg',                        'E11-Addidex_2026.webp',     'L'),
            ('Addidex2026-021.jpg',                        'E12-Addidex_2026.webp',     'L'),
            ('Addidex2026-036.jpg',                        'E13-Addidex_2026.webp',     'L'),
            ('Addidex2026-043.jpg',                        'E14-Addidex_2026.webp',     'L'),
            ('Addidex2026-069.jpg',                        'E15-Addidex_2026.webp',     'L'),
            ('Addidex2026-074.jpg',                        'E16-Addidex_2026.webp',     'L'),
            ('54264fd6-6b5d-4709-82ee-3b8304962d76.jpg',   'E17-Italian_Wedding.webp',  'L'),
            ('6d371d88-b48e-4647-8123-c4457a6bba24.jpg',   'E18-Italian_Wedding.webp',  'L'),
            ('9ffbba4a-6c87-4dec-bd4b-6e2f47b64f16.jpg',   'E19-Italian_Wedding.webp',  'L'),
            ('19eec97d-0637-4d9f-8fdb-bb58a75fa8a5.jpg',   'E20-Italian_Wedding.webp',  'V'),
            ('4059d499-304f-4f71-ad36-07fc7c79e377.jpg',   'E21-Italian_Wedding.webp',  'V'),
            ('9e1f82e2-b1ce-4547-9464-824170b08d57.jpg',   'E22-Italian_Wedding.webp',  'V'),
            ('fba3029a-aaad-4cde-885b-fe1b40640488.jpg',   'E23-Italian_Wedding.webp',  'V'),
        ],
    },
}


def process(src, out, shape, dry_run):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)            # honour camera orientation flag
    w, h = im.size
    target = 3 / 2 if shape == 'L' else 2 / 3
    if w / h > target:                          # too wide -> crop width
        nw, nh = round(h * target), h
    else:                                       # too tall -> crop height
        nw, nh = w, round(w / target)
    x, y = (w - nw) // 2, (h - nh) // 2         # centred crop
    im = im.crop((x, y, x + nw, y + nh))
    scale = min(1.0, LONGEST / max(im.size))    # never upscale
    ow, oh = round(im.size[0] * scale), round(im.size[1] * scale)
    if not dry_run:
        im = im.resize((ow, oh), Image.LANCZOS).convert('RGB')
        im.save(out, 'WEBP', quality=QUALITY, method=6)
    nbytes = os.path.getsize(out) if os.path.isfile(out) else 0
    return (w, h), (ow, oh), nbytes


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry_run = '--dry-run' in sys.argv
    if len(args) != 1 or args[0] not in COLLECTIONS:
        sys.exit('usage: convert-collection.py {%s} [--dry-run]' % '|'.join(COLLECTIONS))
    coll = COLLECTIONS[args[0]]

    src_dir = os.path.join(SRC_ROOT, coll['src'])
    out_dir = os.path.join(OUT_ROOT, coll['out'])
    if not os.path.isdir(src_dir):
        sys.exit('Source dir not found: ' + src_dir +
                 '\n(the originals are git-ignored; they live on the photographer\'s machine)')
    if not dry_run:
        os.makedirs(out_dir, exist_ok=True)

    print('%-28s %12s %4s %12s %9s' % ('output', 'native', '', 'webp px', 'KB'))
    for src_name, out_name, shape in coll['jobs']:
        src = os.path.join(src_dir, src_name)
        out = os.path.join(out_dir, out_name)
        if not os.path.isfile(src):
            print('  MISSING ' + src_name)
            continue
        native, outsz, nbytes = process(src, out, shape, dry_run)
        print('%-28s %5dx%-6d [%s] %5dx%-6d %8.1f' % (
            out_name, native[0], native[1], shape, outsz[0], outsz[1], nbytes / 1024))


if __name__ == '__main__':
    main()
