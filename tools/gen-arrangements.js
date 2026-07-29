#!/usr/bin/env node
/* Generate an ARRANGEMENTS table for public/app.js.
 *
 * Every photo slot is drawn from a palette whose spans sit close to 3:2 (or
 * 2:3 for portraits) on the 88px module / 24px gutter lattice — see
 * tools/aspect-fit.js for the derivation. Deterministic: a fixed seed means
 * re-running produces the identical table.
 *
 *   node tools/gen-arrangements.js                        # birds (default)
 *   node tools/gen-arrangements.js --collection=events
 *   node tools/gen-arrangements.js --collection=products
 *   node tools/gen-arrangements.js --collection=all       # all three blocks
 *   node tools/gen-arrangements.js --report               # + per-slot aspects
 *
 * The photo inventory is READ OUT OF public/app.js — SPECIES, EVENTS and
 * PRODUCTS — rather than restated here. Until 2026-07-29 this file carried its
 * own hand-written SPECIES_OF / KIND_OF maps, which drifted the moment a photo
 * was re-identified; tools/check-species.js existed partly to police them.
 * There is nothing left to police: shape and series come straight from the
 * source of truth.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const COLS = 12, ROWS = 8, U = 88, G = 24;
const w = (c) => c * U + (c - 1) * G;
const h = (r) => r * U + (r - 1) * G;
const ar = (c, r) => w(c) / h(r);

// Landscape spans are the (3n,2n) family; portrait the (2n,3n) family plus 3x4
// (10% off 2:3, but its height of 4 divides an 8-row tile — without it the
// tiling space collapses). `P` is the letterbox slot for panoramic photos and
// is exempt from the 3:2 target; a collection that owns no panorama drops it
// from the palette entirely (see PALETTE_FOR).
const PALETTE = [
  { cw: 9, ch: 6, k: 'L' },
  { cw: 6, ch: 4, k: 'L' },
  { cw: 3, ch: 2, k: 'L' },
  { cw: 4, ch: 6, k: 'V' },
  { cw: 3, ch: 4, k: 'V' },
  { cw: 2, ch: 3, k: 'V' },
  { cw: 6, ch: 2, k: 'P' },
];

// ---------- photo inventory, lifted from public/app.js ----------
const ROOT = path.dirname(__dirname);
const appJs = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const from = appJs.indexOf('const F = (n) =>');
const to = appJs.indexOf('const vitalRows');
if (from < 0 || to < 0 || to < from) {
  console.error('could not locate the inventory block in public/app.js');
  process.exit(1);
}
const inventory = new Function(
  appJs.slice(from, to) + '\nreturn { SPECIES, EVENTS, PRODUCTS };'
)();

// app.js writes the letterbox shape as W; the tiling code calls that kind P.
const KIND_FOR = { L: 'L', V: 'V', W: 'P' };

// Per-collection knobs. `maxPerSeries` is how often one subject may repeat
// inside a single tile, `maxPerKind` the slot-kind ceiling per tile, and
// `balance` the global use-count window every photo has to land in.
//
//   birds     16 photos over 8 subjects, 2 of them panoramic.
//   events    23 photos over 3 series, none panoramic. Only three series exist,
//             so a cap of 2 would hold every tile to six slots; 3 lets the
//             seven- and eight-slot tilings back in. With 23 photos and ~56
//             slots the floor drops to one appearance — a few frames show up
//             once across the whole plane rather than never.
//   products  14 photos over 5 series, none panoramic. Two of those series hold
//             a single photo each, so a cap of 2 leaves them carrying ~7 tiles
//             apiece while the seven-photo series is held to 16 appearances —
//             the balance window is unreachable. 3 fixes it, at 3-5 uses each.
const SETS = {
  birds: {
    varName: 'ARR_BIRDS', leadName: 'LEAD_BIRDS', items: inventory.SPECIES,
    maxPerSeries: 2, maxPerKind: { L: 6, V: 4, P: 2 }, panoTarget: 5,
    balance: { min: 2, max: 5, spread: 3 },
  },
  events: {
    varName: 'ARR_EVENTS', leadName: 'LEAD_EVENTS', items: inventory.EVENTS,
    maxPerSeries: 3, maxPerKind: { L: 6, V: 4, P: 0 }, panoTarget: 0,
    balance: { min: 1, max: 4, spread: 3 },
  },
  products: {
    varName: 'ARR_PRODUCTS', leadName: 'LEAD_PRODUCTS', items: inventory.PRODUCTS,
    maxPerSeries: 3, maxPerKind: { L: 6, V: 4, P: 0 }, panoTarget: 0,
    balance: { min: 2, max: 5, spread: 4 },
  },
};

const PALETTE_FOR = (set) => PALETTE.filter((p) => set.maxPerKind[p.k] > 0);

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
function tilings(nSlots, palette) {
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
    for (const p of palette) {
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
function usable(t, max) {
  const n = { L: 0, V: 0, P: 0 };
  t.forEach((s) => n[s.k]++);
  return n.L <= max.L && n.V <= max.V && n.P <= max.P && n.V >= 1 && n.L >= 2;
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

function pickTilings(pool, want, rand, PANO_TARGET) {
  // Only 5 shape-multisets exist at 7 slots, so dedupe on the full layout
  // (shapes AND positions) and merely *prefer* an unseen shape-multiset.
  // Also spread the big-slot anchor so consecutive arrangements don't rhyme.
  const cands = pool;
  const chosen = [], seenLayout = new Set(), seenShape = new Set();
  const anchors = [];
  // Only the panoramic photos can fill a letterbox slot. Too many and those few
  // photos dominate the strip; too few and one of them never appears at all.
  // A collection with no panorama passes 0 and the term drops out.
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
function assign(tiles, rand, inv) {
  const use = Object.fromEntries(inv.ids.map((id) => [id, 0]));
  const result = [];
  let prevIds = new Set();

  for (const t of tiles) {
    // order slots most-constrained-first (P, then V, then L)
    const order = ['P', 'V', 'L'];
    const slots = t.map((s, i) => ({ ...s, i }))
      .sort((a, b) => order.indexOf(a.k) - order.indexOf(b.k));

    const seriesCount = new Map();
    const usedIds = new Set();
    const chosen = new Map();
    const ok = (function place(n) {
      if (n >= slots.length) return true;
      const slot = slots[n];
      const cands = inv.byKind[slot.k]
        .filter((id) => !usedIds.has(id))
        .filter((id) => (seriesCount.get(inv.seriesOf[id]) || 0) < inv.maxPerSeries)
        // Global balance dominates. Preferring an unseen series first instead
        // would pick the one-photo series in every tile, burning them 8 times
        // while a well-stocked series never appears.
        .sort((a, b) =>
          (use[a] - use[b])
          || ((seriesCount.get(inv.seriesOf[a]) || 0) - (seriesCount.get(inv.seriesOf[b]) || 0))
          || ((prevIds.has(a) ? 1 : 0) - (prevIds.has(b) ? 1 : 0))
          || (rand() - 0.5));
      for (const id of cands) {
        const sp = inv.seriesOf[id];
        seriesCount.set(sp, (seriesCount.get(sp) || 0) + 1);
        usedIds.add(id);
        chosen.set(slot.i, id);
        use[id]++;
        if (place(n + 1)) return true;
        use[id]--;
        chosen.delete(slot.i);
        usedIds.delete(id);
        seriesCount.set(sp, seriesCount.get(sp) - 1);
      }
      return false;
    })(0);
    if (!ok) return null;

    prevIds = new Set(chosen.values());
    result.push({ slots: t, ids: chosen });
  }
  return { result, use };
}

// ---------- drive one collection ----------
function build(name) {
  const set = SETS[name];
  const seriesOf = {}, kindOf = {};
  set.items.forEach((it) => {
    seriesOf[it.id] = it.vernacular;
    kindOf[it.id] = KIND_FOR[it.shape];
  });
  const ids = set.items.map((it) => it.id).sort((a, b) => a - b);
  const byKind = { L: [], V: [], P: [] };
  ids.forEach((id) => byKind[kindOf[id]].push(id));
  const inv = { ids, byKind, seriesOf, maxPerSeries: set.maxPerSeries };

  // 6-, 7- and 8-slot tilings all qualify. Mixing the three widens the
  // structural variety a long way past the 5 shape-multisets that 7-slot
  // tilings alone can offer.
  const palette = PALETTE_FOR(set);
  const pool = annotate(
    [...tilings(6, palette), ...tilings(7, palette), ...tilings(8, palette)]
      .filter((t) => usable(t, set.maxPerKind))
  );
  if (pool.length < 8) {
    console.error(`${name}: only ${pool.length} usable tilings; widen the palette`);
    process.exit(1);
  }

  let out = null, seed = 1;
  const fail = { short: 0, assign: 0, balance: 0 };
  let bestBalance = null;
  for (; seed < 4000; seed++) {
    const rand = rng(seed);
    const tiles = pickTilings(pool, 8, rand, set.panoTarget);
    if (tiles.length < 8) { fail.short++; continue; }
    const a = assign(tiles, rand, inv);
    if (!a) { fail.assign++; continue; }
    // Every photo appears at least `min` and at most `max` times across the
    // eight tiles, and the gap between the busiest and the quietest is bounded.
    const counts = Object.values(a.use);
    const spread = Math.max(...counts) - Math.min(...counts);
    if (!bestBalance || spread < bestBalance.spread) {
      bestBalance = { spread, use: a.use, min: Math.min(...counts), max: Math.max(...counts) };
    }
    const b = set.balance;
    if (Math.min(...counts) < b.min || Math.max(...counts) > b.max || spread > b.spread) {
      fail.balance++; continue;
    }
    out = { tiles, ...a };
    break;
  }
  if (!out) {
    console.error(`${name}: no assignment found; failures:`, JSON.stringify(fail));
    if (bestBalance) console.error('closest balance:', JSON.stringify(bestBalance));
    process.exit(1);
  }
  return { name, set, out, seed, pool, seriesOf };
}

// ---------- report / emit ----------
const NAMES = 'ABCDEFGH';

function report({ name, out, seed, pool, seriesOf }) {
  console.log(`=== ${name} · seed ${seed}  ·  usable tilings: ${pool.length}\n`);
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
      console.log(`   ${String(id).padEnd(3)} ${String(seriesOf[id]).padEnd(18)} ${s.cw}x${s.ch}  ar ${a.toFixed(3)}  ${e}`);
    });
    console.log('');
  });
  console.log(`mean |aspect error| over ${n} non-letterbox slots: ${(sum / n * 100).toFixed(1)}%`);
  console.log('slots >5% off target:', worst.length ? worst.join(', ') : 'none');
  console.log('photo usage:', JSON.stringify(out.use));
  console.log('');
}

function emit({ set, out }) {
  const lines = [];
  lines.push(`  const ${set.varName} = [`);
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
  lines.push(`  const ${set.leadName} = { ` +
    leads.map((id, i) => `${i}: ${id}`).join(', ') + ' };');
  console.log(lines.join('\n'));
}

const arg = (process.argv.find((a) => a.startsWith('--collection=')) || '').split('=')[1] || 'birds';
const which = arg === 'all' ? Object.keys(SETS) : [arg];
which.forEach((k) => {
  if (!SETS[k]) { console.error(`unknown collection "${k}"`); process.exit(1); }
});
const built = which.map(build);
if (process.argv.includes('--report')) built.forEach(report);
else built.forEach((b, i) => { if (i) console.log(''); emit(b); });
