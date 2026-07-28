#!/usr/bin/env node
/* Research tool: find tile arrangements whose every slot sits close to 3:2 (or 2:3).
 *
 * Grid model matches app.js: module U px, gutter G px, so a slot spanning
 * cw x ch cells measures  W = cw*U + (cw-1)*G,  H = ch*U + (ch-1)*G.
 * Merging two adjacent slots across a gutter yields exactly (cw1+cw2) cells,
 * so every merge stays on the lattice and the gutter stays uniform at G.
 *
 * Usage:  node tools/aspect-fit.js [cols] [rows]
 */
'use strict';

const U = 88, G = 24;
const COLS = +process.argv[2] || 12;
const ROWS = +process.argv[3] || 8;

const w = (cw) => cw * U + (cw - 1) * G;
const h = (ch) => ch * U + (ch - 1) * G;
const ar = (cw, ch) => w(cw) / h(ch);
const err = (a, target) => a / target - 1;

// Palette. Landscape pieces are the (3n,2n) family — the only spans that
// converge on 3:2 (+4.0% at 3x2, +1.9% at 6x4, +1.2% at 9x6). Portrait pieces
// are the (2n,3n) family plus 3x4; 3x4 is 10% off 2:3 but its height of 4
// divides an 8-row tile, and without it the tiling space collapses from 768
// usable layouts to 24. `pano` is the deliberate letterbox slot for the two
// panoramic photos (P4 3.00, P8 3.80) and is exempt from the 3:2 target.
const PALETTE = [
  { cw: 9, ch: 6, kind: 'L' },
  { cw: 6, ch: 4, kind: 'L' },
  { cw: 3, ch: 2, kind: 'L' },
  { cw: 4, ch: 6, kind: 'V' },
  { cw: 3, ch: 4, kind: 'V' },
  { cw: 2, ch: 3, kind: 'V' },
  { cw: 6, ch: 2, kind: 'pano' },
];

// Slot count per tile. Pinning this to exactly 7 (6 photos + brand, as today)
// leaves only 2 distinct shape-sets; allowing 6-8 opens 30.
const MAX_PIECES = 8;
const MIN_PIECES = 6;

function solve(limit) {
  const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const placed = [];
  const out = [];

  function firstEmpty() {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) if (!grid[r][c]) return [c, r];
    return null;
  }
  function fits(c, r, cw, ch) {
    if (c + cw > COLS || r + ch > ROWS) return false;
    for (let y = r; y < r + ch; y++)
      for (let x = c; x < c + cw; x++) if (grid[y][x]) return false;
    return true;
  }
  function mark(c, r, cw, ch, v) {
    for (let y = r; y < r + ch; y++)
      for (let x = c; x < c + cw; x++) grid[y][x] = v;
  }

  (function rec() {
    if (out.length >= limit) return;
    const cell = firstEmpty();
    if (!cell) {
      if (placed.length >= MIN_PIECES && placed.length <= MAX_PIECES) {
        out.push(placed.map((p) => ({ ...p })));
      }
      return;
    }
    if (placed.length >= MAX_PIECES) return;
    const [c, r] = cell;
    for (const p of PALETTE) {
      if (!fits(c, r, p.cw, p.ch)) continue;
      mark(c, r, p.cw, p.ch, true);
      placed.push({ c, r, cw: p.cw, ch: p.ch, kind: p.kind });
      rec();
      placed.pop();
      mark(c, r, p.cw, p.ch, false);
      if (out.length >= limit) return;
    }
  })();

  return out;
}

// Signature of the multiset of piece shapes, used to pick visually distinct tilings.
const shapeSig = (t) =>
  t.map((p) => p.cw + 'x' + p.ch).sort().join(',');

function score(t) {
  // Prefer: some portrait, some size variety, no more than one panorama.
  const kinds = t.map((p) => p.kind);
  const nV = kinds.filter((k) => k === 'V').length;
  const nPano = kinds.filter((k) => k === 'pano').length;
  const sizes = new Set(t.map((p) => p.cw * p.ch)).size;
  return (nV >= 1 ? 2 : 0) + (nPano <= 1 ? 1 : -3) + sizes;
}

function render(t) {
  const g = Array.from({ length: ROWS }, () => new Array(COLS).fill('.'));
  t.forEach((p, i) => {
    const ch2 = 'ABCDEFGH'[i];
    for (let y = p.r; y < p.r + p.ch; y++)
      for (let x = p.c; x < p.c + p.cw; x++) g[y][x] = ch2;
  });
  return g.map((row) => '  ' + row.join(' ')).join('\n');
}

const all = solve(400000);
console.log(`grid ${COLS}x${ROWS} (${w(COLS)}x${h(ROWS)} px, tile ar ${ar(COLS, ROWS).toFixed(3)})`);
console.log(`exact tilings with ${MIN_PIECES}-${MAX_PIECES} palette pieces: ${all.length}`);

const seen = new Set();
const distinct = [];
for (const t of all.sort((a, b) => score(b) - score(a))) {
  const sig = shapeSig(t);
  if (seen.has(sig)) continue;
  seen.add(sig);
  distinct.push(t);
}
console.log(`distinct shape-multisets: ${distinct.length}\n`);

const SHOW = +process.env.SHOW || 8;
distinct.slice(0, SHOW).forEach((t, i) => {
  console.log(`--- candidate ${i + 1} — ${t.length} slots ---`);
  console.log(render(t));
  t.forEach((p, j) => {
    const a = ar(p.cw, p.ch);
    const target = p.kind === 'V' ? 2 / 3 : 1.5;
    const e = p.kind === 'pano' ? '   (panorama slot)' :
      `   ${(err(a, target) * 100 >= 0 ? '+' : '')}${(err(a, target) * 100).toFixed(1)}% off ${p.kind === 'V' ? '2:3' : '3:2'}`;
    console.log(`   ${'ABCDEFGH'[j]}  ${p.cw}x${p.ch} @ (${p.c},${p.r})  ${w(p.cw)}x${h(p.ch)}px  ar ${a.toFixed(3)}${e}`);
  });
  console.log('');
});
