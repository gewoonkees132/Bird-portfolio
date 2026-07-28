#!/usr/bin/env node
/* Validate the ARRANGEMENTS table in public/app.js.
 *
 * Checks the invariants the render + focus code relies on:
 *   - every slot span comes from the near-3:2 palette
 *   - each arrangement covers all 12x8 cells exactly once, none out of bounds
 *   - slot ids are unique per arrangement (focus tracking looks slots up by id)
 *   - each photo sits in a slot matching its shape (L/V/letterbox)
 *   - no species appears more than twice in one arrangement
 *   - every slot is a photo (no brand card) with a valid ARRANGEMENT_LEAD id
 *   - TILE_W / TILE_H agree with --tile-width / --tile-height in styles.css
 *
 *   node tools/check-arrangements.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const src = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'public', 'styles.css'), 'utf8');

const ARR = eval(src.match(/const ARRANGEMENTS = (\[[\s\S]*?\n {2}\];)/)[1].replace(/;$/, ''));
const LEAD = eval('(' + src.match(/const ARRANGEMENT_LEAD = (\{[^}]*\})/)[1] + ')');
const tw = src.match(/const TILE_W =\s+(\d+) \* 88 \+\s+(\d+) \* 24/);
const th = src.match(/const TILE_H =\s+(\d+) \* 88 \+\s+(\d+) \* 24/);
const COLS = +tw[1], ROWS = +th[1];

const KIND = {
  1: 'L', 3: 'L', 5: 'L', 7: 'L', 9: 'L', 10: 'L', 11: 'L', 12: 'L', 14: 'L', 15: 'L',
  2: 'V', 6: 'V', 13: 'V', 16: 'V', 4: 'P', 8: 'P',
};
const SPECIES = {
  1: 'Robin', 14: 'Robin', 15: 'Robin', 16: 'Robin', 2: 'Weaver', 6: 'Weaver',
  3: 'Jay', 4: 'Dunnock', 5: 'Bee-eater', 8: 'Lark',
  7: 'GreatTit', 9: 'GreatTit', 10: 'GreatTit', 11: 'GreatTit', 12: 'GreatTit', 13: 'GreatTit',
};
const PALETTE = { '9x6': 'L', '6x4': 'L', '3x2': 'L', '4x6': 'V', '3x4': 'V', '2x3': 'V', '6x2': 'P' };

const fails = [];
const use = {};

const pxW = COLS * 88 + (COLS - 1) * 24;
const pxH = ROWS * 88 + (ROWS - 1) * 24;
const cssW = +css.match(/--tile-width:\s*(\d+)px/)[1];
const cssH = +css.match(/--tile-height:\s*(\d+)px/)[1];
if (pxW !== cssW) fails.push(`TILE_W ${pxW}px != --tile-width ${cssW}px`);
if (pxH !== cssH) fails.push(`TILE_H ${pxH}px != --tile-height ${cssH}px`);

ARR.forEach((a, ai) => {
  const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  const ids = new Set();
  const speciesCount = {};
  a.slots.forEach((s) => {
    const span = s.cw + 'x' + s.ch;
    if (!PALETTE[span]) fails.push(`${a.name}: span ${span} is not in the palette`);
    if (s.c < 0 || s.r < 0 || s.c + s.cw > COLS || s.r + s.ch > ROWS) {
      fails.push(`${a.name}: slot ${span}@${s.c},${s.r} out of bounds`);
      return;
    }
    for (let y = s.r; y < s.r + s.ch; y++) for (let x = s.c; x < s.c + s.cw; x++) grid[y][x]++;
    if (s.brand) { fails.push(`${a.name}: brand slot present — the plane is birds only`); return; }
    if (ids.has(s.id)) fails.push(`${a.name}: duplicate id ${s.id}`);
    ids.add(s.id);
    use[s.id] = (use[s.id] || 0) + 1;
    const sp = SPECIES[s.id];
    speciesCount[sp] = (speciesCount[sp] || 0) + 1;
    if (PALETTE[span] !== KIND[s.id]) {
      fails.push(`${a.name}: P${s.id} (${KIND[s.id]}) placed in a ${PALETTE[span]} slot ${span}`);
    }
  });
  const cover = [...new Set(grid.flat())];
  if (cover.length !== 1 || cover[0] !== 1) {
    fails.push(`${a.name}: not an exact tiling — cells covered ${cover.join('/')} times`);
  }
  Object.entries(speciesCount).forEach(([k, v]) => {
    if (v > 2) fails.push(`${a.name}: species ${k} appears ${v} times in one tile`);
  });
  if (!a.slots.some((s) => s.id === LEAD[ai])) {
    fails.push(`${a.name}: ARRANGEMENT_LEAD[${ai}] = ${LEAD[ai]} is not a slot here`);
  }
});

Object.keys(KIND).map(Number).forEach((id) => {
  if (!use[id]) fails.push(`photo P${id} never appears`);
});

const total = Object.values(use).reduce((a, b) => a + b, 0);
console.log(`tile ${COLS}x${ROWS} = ${pxW}x${pxH}px · ${ARR.length} arrangements · ${total} photo slots`);
console.log('usage per photo:', JSON.stringify(use));
if (fails.length) {
  console.error('\nFAILURES:\n  ' + fails.join('\n  '));
  process.exit(1);
}
console.log('\nall invariants pass');
