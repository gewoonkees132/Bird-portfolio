#!/usr/bin/env node
/* Generate the ARRANGEMENTS table for public/app.js.
 *
 * Every photo slot is drawn from a palette whose spans sit close to 3:2 (or
 * 2:3 for portraits) on the 88px module / 24px gutter lattice — see
 * tools/aspect-fit.js for the derivation. Deterministic: a fixed seed means
 * re-running produces the identical table.
 *
 *   node tools/gen-arrangements.js         # print the JS block
 *   node tools/gen-arrangements.js --report  # + per-slot aspect report
 */
'use strict';

const COLS = 12, ROWS = 8, U = 88, G = 24;
const w = (c) => c * U + (c - 1) * G;
const h = (r) => r * U + (r - 1) * G;
const ar = (c, r) => w(c) / h(r);

// Landscape spans are the (3n,2n) family; portrait the (2n,3n) family plus 3x4
// (10% off 2:3, but its height of 4 divides an 8-row tile — without it the
// tiling space collapses). `P` is the letterbox slot for the two panoramic
// photos and is exempt from the 3:2 target.
const PALETTE = [
  { cw: 9, ch: 6, k: 'L' },
  { cw: 6, ch: 4, k: 'L' },
  { cw: 3, ch: 2, k: 'L' },
  { cw: 4, ch: 6, k: 'V' },
  { cw: 3, ch: 4, k: 'V' },
  { cw: 2, ch: 3, k: 'V' },
  { cw: 6, ch: 2, k: 'P' },
];

// ---------- photo inventory ----------
const SPECIES_OF = {
  1: 'Robin', 14: 'Robin', 15: 'Robin', 16: 'Robin',
  2: 'Weaver', 6: 'Weaver',
  3: 'Jay',
  4: 'Dunnock',
  5: 'Bee-eater',
  7: 'BlueTit', 9: 'BlueTit', 13: 'BlueTit',
  10: 'GreatTit', 11: 'GreatTit', 12: 'GreatTit',
  8: 'Bushlark',
};
const KIND_OF = {
  1: 'L', 3: 'L', 5: 'L', 7: 'L', 9: 'L', 10: 'L', 11: 'L', 12: 'L', 14: 'L', 15: 'L',
  2: 'V', 6: 'V', 13: 'V', 16: 'V',
  4: 'P', 8: 'P',
};
const IDS = Object.keys(KIND_OF).map(Number).sort((a, b) => a - b);
const BY_KIND = { L: [], V: [], P: [] };
IDS.forEach((id) => BY_KIND[KIND_OF[id]].push(id));

// Species coverage is uneven: Robin has 4 photos, Blue Tit and Great Tit 3
// each, while Jay, Dunnock, Bee-eater and Bushlark have one each. (Before the
// 2026-07-28 identification pass the tits were filed as one 6-photo Great Tit
// group; splitting it tightened the per-tile cap below, so re-check the
// arrangements after any further relabel.) Only 6 of the 8 species own a
// non-letterbox photo, so demanding all-distinct species per tile would force a
// letterbox slot into every single tile. Cap each species at 2 per tile
// instead — still a long way better than the old hand-built set, where
// arrangement E showed four Great Tits at once.
const MAX_PER_SPECIES_PER_TILE = 2;
// Slot-kind ceilings per tile, bounded by how many photos of each kind exist.
const MAX_PER_KIND = { L: 6, V: 4, P: 2 };

// ---------- deterministic RNG (mulberry32) ----------
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- enumerate exact tilings ----------
function tilings(nSlots) {
  const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const placed = [], out = [];
  const firstEmpty = () => {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!grid[r][c]) return [c, r];
    return null;
  };
  const fits = (c, r, cw, ch) => {
    if (c + cw > COLS || r + ch > ROWS) return false;
    for (let y = r; y < r + ch; y++) for (let x = c; x < c + cw; x++) if (grid[y][x]) return false;
    return true;
  };
  const mark = (c, r, cw, ch, v) => {
    for (let y = r; y < r + ch; y++) for (let x = c; x < c + cw; x++) grid[y][x] = v;
  };
  (function rec() {
    const cell = firstEmpty();
    if (!cell) { if (placed.length === nSlots) out.push(placed.map((p) => ({ ...p }))); return; }
    if (placed.length >= nSlots) return;
    const [c, r] = cell;
    for (const p of PALETTE) {
      if (!fits(c, r, p.cw, p.ch)) continue;
      mark(c, r, p.cw, p.ch, true);
      placed.push({ c, r, cw: p.cw, ch: p.ch, k: p.k });
      rec();
      placed.pop();
      mark(c, r, p.cw, p.ch, false);
    }
  })();
  return out;
}

// Every slot holds a photo — the plane carries no brand card. Site identity
// lives in the fixed .identity corner element in index.html instead.
function usable(t) {
  const n = { L: 0, V: 0, P: 0 };
  t.forEach((s) => n[s.k]++);
  return n.L <= MAX_PER_KIND.L && n.V <= MAX_PER_KIND.V && n.P <= MAX_PER_KIND.P
    && n.V >= 1 && n.L >= 2;
}

// ---------- pick 8 structurally distinct tilings ----------
const shapeSig = (t) => t.map((s) => s.cw + 'x' + s.ch).sort().join(',');
const layoutSig = (t) => t.map((s) => s.cw + 'x' + s.ch + '@' + s.c + ',' + s.r).sort().join('|');

// Signatures and per-tiling stats are recomputed on every scored candidate
// otherwise — 8 slots x ~800 tilings x thousands of seeds of string joins.
function annotate(pool) {
  return pool.map((t) => {
    const big = t.reduce((a, b) => (a.cw * a.ch >= b.cw * b.ch ? a : b));
    return {
      t,
      lsig: layoutSig(t),
      ssig: shapeSig(t),
      ax: big.c + big.cw / 2,
      ay: big.r + big.ch / 2,
      nP: t.filter((s) => s.k === 'P').length,
      n34: t.filter((s) => s.cw === 3 && s.ch === 4).length,
      len: t.length,
    };
  });
}

function pickTilings(pool, want, rand) {
  // Only 5 shape-multisets exist at 7 slots, so dedupe on the full layout
  // (shapes AND positions) and merely *prefer* an unseen shape-multiset.
  // Also spread the big-slot anchor so consecutive arrangements don't rhyme.
  const cands = pool;
  const chosen = [], seenLayout = new Set(), seenShape = new Set();
  const anchors = [];
  // Only P4 and P8 can fill a letterbox slot. Too many and those two photos
  // dominate the strip; too few and P8 never appears at all. Five across the
  // eight tiles puts each of them on screen two or three times.
  const PANO_TARGET = 5;
  let panoSoFar = 0;
  while (chosen.length < want) {
    let best = null, bestScore = -Infinity;
    for (const a of cands) {
      if (seenLayout.has(a.lsig)) continue;
      let score = seenShape.has(a.ssig) ? 0 : 12;
      for (let idx = Math.max(0, anchors.length - 3); idx < anchors.length; idx++) {
        const p = anchors[idx];
        score += Math.hypot(a.ax - p[0], a.ay - p[1]) * (idx + 1) * 0.4;
      }
      score += a.len === 7 ? 2 : 0;   // keep 6-photo tiles the norm
      const remainingTiles = want - chosen.length;
      const needPano = Math.max(0, PANO_TARGET - panoSoFar);
      score += a.nP > 0 && needPano >= remainingTiles ? 8 : 0;
      score -= Math.max(0, panoSoFar + a.nP - PANO_TARGET) * 8;
      // 4x6 and 2x3 are true (2n,3n) spans (-1.9% / -3.8% off 2:3); 3x4 is the
      // 10.4% compromise that exists only because its height divides 8 rows.
      score -= a.n34 * 2.5;
      score += rand() * 3;
      if (score > bestScore) { bestScore = score; best = a; }
    }
    if (!best) break;
    panoSoFar += best.nP;
    chosen.push(best.t);
    seenLayout.add(best.lsig);
    seenShape.add(best.ssig);
    anchors.push([best.ax, best.ay]);
  }
  return chosen;
}

// ---------- assign photos ----------
function assign(tiles, rand) {
  const use = Object.fromEntries(IDS.map((id) => [id, 0]));
  const result = [];
  let prevIds = new Set();

  for (const t of tiles) {
    // order slots most-constrained-first (P, then V, then L)
    const order = ['P', 'V', 'L'];
    const slots = t.map((s, i) => ({ ...s, i }))
      .sort((a, b) => order.indexOf(a.k) - order.indexOf(b.k));

    const speciesCount = new Map();
    const usedIds = new Set();
    const chosen = new Map();
    const ok = (function place(n) {
      if (n >= slots.length) return true;
      const slot = slots[n];
      const cands = BY_KIND[slot.k]
        .filter((id) => !usedIds.has(id))
        .filter((id) => (speciesCount.get(SPECIES_OF[id]) || 0) < MAX_PER_SPECIES_PER_TILE)
        // Global balance dominates. Preferring an unseen species first instead
        // would pick Jay and Bee-eater — the two species with a single photo
        // each — in every tile, burning them 8 times while Lark never appears.
        .sort((a, b) =>
          (use[a] - use[b])
          || ((speciesCount.get(SPECIES_OF[a]) || 0) - (speciesCount.get(SPECIES_OF[b]) || 0))
          || ((prevIds.has(a) ? 1 : 0) - (prevIds.has(b) ? 1 : 0))
          || (rand() - 0.5));
      for (const id of cands) {
        const sp = SPECIES_OF[id];
        speciesCount.set(sp, (speciesCount.get(sp) || 0) + 1);
        usedIds.add(id);
        chosen.set(slot.i, id);
        use[id]++;
        if (place(n + 1)) return true;
        use[id]--;
        chosen.delete(slot.i);
        usedIds.delete(id);
        speciesCount.set(sp, speciesCount.get(sp) - 1);
      }
      return false;
    })(0);
    if (!ok) return null;

    prevIds = new Set(chosen.values());
    result.push({ slots: t, ids: chosen });
  }
  return { result, use };
}

// ---------- drive ----------
// 6-, 7- and 8-slot tilings all qualify (5, 6 or 7 photos per tile plus the
// brand). Mixing the three widens the structural variety a long way past the
// 5 shape-multisets that 7-slot tilings alone can offer.
const pool = annotate([...tilings(6), ...tilings(7), ...tilings(8)].filter(usable));
if (pool.length < 8) {
  console.error(`only ${pool.length} usable tilings; widen the palette`);
  process.exit(1);
}

let out = null, seed = 1;
const fail = { short: 0, assign: 0, balance: 0 };
let bestBalance = null;
for (; seed < 4000; seed++) {
  const rand = rng(seed);
  const tiles = pickTilings(pool, 8, rand);
  if (tiles.length < 8) { fail.short++; continue; }
  const a = assign(tiles, rand);
  if (!a) { fail.assign++; continue; }
  // Every photo appears at least twice and at most five times. Five rather than
  // four because the palette supplies ~17 portrait slots but the collection
  // holds only four portrait photos, so one of them has to carry a fifth turn.
  const counts = Object.values(a.use);
  const spread = Math.max(...counts) - Math.min(...counts);
  if (!bestBalance || spread < bestBalance.spread) bestBalance = { spread, use: a.use, min: Math.min(...counts), max: Math.max(...counts) };
  if (Math.min(...counts) < 2 || Math.max(...counts) > 5 || spread > 3) { fail.balance++; continue; }
  out = { tiles, ...a };
  break;
}
if (!out) {
  console.error('no assignment found; failures:', JSON.stringify(fail));
  if (bestBalance) console.error('closest balance:', JSON.stringify(bestBalance));
  process.exit(1);
}

const NAMES = 'ABCDEFGH';
const report = process.argv.includes('--report');

if (report) {
  console.log(`seed ${seed}  ·  usable 7-slot tilings: ${pool.length}\n`);
  let sum = 0, n = 0, worst = [];
  out.result.forEach((tile, ti) => {
    const g = Array.from({ length: ROWS }, () => new Array(COLS).fill('.'));
    tile.slots.forEach((s, j) => {
      const ch = 'abcdefgh'[j];
      for (let y = s.r; y < s.r + s.ch; y++) for (let x = s.c; x < s.c + s.cw; x++) g[y][x] = ch;
    });
    console.log(`--- ${NAMES[ti]} ---`);
    console.log(g.map((r) => '  ' + r.join(' ')).join('\n'));
    tile.slots.forEach((s, j) => {
      const id = tile.ids.get(j);
      const a = ar(s.cw, s.ch);
      const target = s.k === 'V' ? 2 / 3 : s.k === 'P' ? null : 1.5;
      const e = target ? `${((a / target - 1) * 100).toFixed(1)}% off ${s.k === 'V' ? '2:3' : '3:2'}` : 'letterbox';
      if (target) { sum += Math.abs(a / target - 1); n++; if (Math.abs(a / target - 1) > 0.05) worst.push(`${NAMES[ti]} ${s.cw}x${s.ch}`); }
      console.log(`   P${String(id).padEnd(2)} ${SPECIES_OF[id].padEnd(9)} ${s.cw}x${s.ch}  ar ${a.toFixed(3)}  ${e}`);
    });
    console.log('');
  });
  console.log(`mean |aspect error| over ${n} non-letterbox slots: ${(sum / n * 100).toFixed(1)}%`);
  console.log('slots >5% off target:', worst.length ? worst.join(', ') : 'none');
  console.log('photo usage:', JSON.stringify(out.use));
  process.exit(0);
}

// ---------- emit ----------
const lines = [];
lines.push('  const ARRANGEMENTS = [');
out.result.forEach((tile, ti) => {
  lines.push('    {');
  lines.push(`      name: '${NAMES[ti]}',`);
  lines.push('      slots: [');
  const ordered = tile.slots.map((s, j) => ({ s, j })).sort((a, b) => a.s.r - b.s.r || a.s.c - b.s.c);
  ordered.forEach(({ s, j }) => {
    const pos = `{ c:${String(s.c).padStart(2)}, r:${s.r}, cw:${String(s.cw).padStart(2)}, ch:${s.ch}, `;
    const id = tile.ids.get(j);
    const note = s.k === 'P' ? '  // letterbox' : s.k === 'V' ? '  // V' : '';
    lines.push(`        ${pos}id: ${String(id).padStart(2)} },${note}`);
  });
  lines.push('      ]');
  lines.push(`    },`);
});
lines.push('  ];');

const leads = out.result.map((tile) => {
  let best = null, bestA = -1;
  tile.slots.forEach((s, j) => {
    const a = s.cw * s.ch;
    if (a > bestA) { bestA = a; best = tile.ids.get(j); }
  });
  return best;
});
lines.push('');
lines.push('  const ARRANGEMENT_LEAD = { ' +
  leads.map((id, i) => `${i}: ${id}`).join(', ') + ' };');

console.log(lines.join('\n'));
