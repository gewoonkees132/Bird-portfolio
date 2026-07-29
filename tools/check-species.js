#!/usr/bin/env node
/* Validate that every copy of the photo data still agrees.
 *
 * Names, latin names / subtitles, vitals and filenames are duplicated across
 * several places, and no generator ties them together:
 *
 *   public/app.js                            SPECIES / EVENTS / PRODUCTS and
 *                                            their facts tables (authoritative)
 *   public/index.html                        schema.org gallery, .mcell tiles,
 *                                            collection switcher buttons
 *   native/app/src/main/assets/photos.json   the Android prototype's manifest
 *                                            (birds only)
 *   tools/check-arrangements.js              derives its maps from app.js
 *   tools/gen-arrangements.js                derives its maps from app.js
 *
 * Renaming or re-identifying a photograph means editing all of them by hand.
 * This script is what catches the one you forgot — it treats public/app.js as
 * the source of truth and asserts the rest match, including the files on disk.
 *
 * Prose is deliberately NOT compared: the native manifest carries shortened
 * ledes written for a phone screen. Identity fields (name, latin, shape,
 * filename, vitals) must match exactly.
 *
 *   node tools/check-species.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

const appJs = read('public', 'app.js');
const html = read('public', 'index.html');
const manifest = JSON.parse(read('native', 'app', 'src', 'main', 'assets', 'photos.json'));

const fails = [];
const fail = (msg) => fails.push(msg);

// ---------- source of truth: lift the inventory out of app.js ----------
// The slice runs from the `F` filename helper to `vitalRows`, so it carries the
// literals AND the alias assignments that share one subject's prose across its
// repeat photos (BIRD_FACTS[9] = BIRD_FACTS[13] = BIRD_FACTS[7], etc).
const from = appJs.indexOf('const F = (n) =>');
const to = appJs.indexOf('const vitalRows');
if (from < 0 || to < 0 || to < from) {
  console.error('FAILURE: could not locate the inventory block in public/app.js');
  process.exit(1);
}
const { SPECIES, BIRD_FACTS, EVENTS, EVENT_FACTS, PRODUCTS, PRODUCT_FACTS } = new Function(
  appJs.slice(from, to) +
  '\nreturn { SPECIES, BIRD_FACTS, EVENTS, EVENT_FACTS, PRODUCTS, PRODUCT_FACTS };'
)();

// The two later collections share the record shape but not the bird-specific
// vitals fields; `dir` is their subfolder under public/files and `prefix` the
// letter their filenames carry. Birds sit at the root of public/files with no
// subfolder, which is why they are described separately below.
const EXTRA = [
  { key: 'events',   label: 'Events',   dir: 'events',   prefix: 'E', items: EVENTS,   facts: EVENT_FACTS },
  { key: 'products', label: 'Products', dir: 'products', prefix: 'R', items: PRODUCTS, facts: PRODUCT_FACTS },
];

// Typographic variants are allowed to differ between platforms (the JSON
// manifest uses ASCII hyphens where the web copy uses en dashes). Compare on a
// normalized form so a real rename still fails but punctuation does not.
const norm = (s) => String(s).replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").trim();
const same = (a, b) => norm(a) === norm(b);

// ---------- app.js internal consistency ----------
const byId = new Map();
SPECIES.forEach((sp) => {
  if (byId.has(sp.id)) fail(`app.js: duplicate SPECIES id ${sp.id}`);
  byId.set(sp.id, sp);
  if (!/^files\/P\d+-/.test(sp.image)) fail(`app.js: P${sp.id} image "${sp.image}" is not a files/P<id>- path`);
  const filePrefix = 'files/P' + sp.id + '-';
  if (!sp.image.startsWith(filePrefix)) fail(`app.js: P${sp.id} image "${sp.image}" does not match its id`);
  if (!'LVW'.includes(sp.shape)) fail(`app.js: P${sp.id} has unknown shape "${sp.shape}"`);
  if (!BIRD_FACTS[sp.id]) fail(`app.js: P${sp.id} (${sp.vernacular}) has no BIRD_FACTS entry`);
});

// One vernacular must always carry one latin name, and vice versa.
const latinOf = new Map();
const vernOf = new Map();
SPECIES.forEach((sp) => {
  if (latinOf.has(sp.vernacular) && latinOf.get(sp.vernacular) !== sp.latin) {
    fail(`app.js: "${sp.vernacular}" is both ${latinOf.get(sp.vernacular)} and ${sp.latin}`);
  }
  latinOf.set(sp.vernacular, sp.latin);
  if (vernOf.has(sp.latin) && vernOf.get(sp.latin) !== sp.vernacular) {
    fail(`app.js: ${sp.latin} is both "${vernOf.get(sp.latin)}" and "${sp.vernacular}"`);
  }
  vernOf.set(sp.latin, sp.vernacular);
});

// Repeat photos of one species must share the same facts object, or the plane
// would state different vitals for the same bird depending on which tile you
// happen to be standing on.
SPECIES.forEach((sp) => {
  const f = BIRD_FACTS[sp.id];
  SPECIES.forEach((other) => {
    if (other.vernacular !== sp.vernacular || other.id === sp.id) return;
    const g = BIRD_FACTS[other.id];
    ['wingspan', 'length', 'weight', 'range', 'habitat'].forEach((k) => {
      if (!same(f[k] || '', g[k] || '')) {
        fail(`app.js: ${sp.vernacular} P${sp.id} and P${other.id} disagree on ${k}`);
      }
    });
  });
});

// A species carries wingspan OR length, never both and never neither — vitalRows
// picks the row label off exactly that.
Object.keys(BIRD_FACTS).forEach((id) => {
  const f = BIRD_FACTS[id];
  if (!!f.wingspan === !!f.length) {
    fail(`app.js: BIRD_FACTS[${id}] must carry exactly one of wingspan / length`);
  }
  ['weight', 'range', 'habitat', 'lede', 'fun_fact'].forEach((k) => {
    if (!f[k]) fail(`app.js: BIRD_FACTS[${id}] is missing ${k}`);
  });
});

// ---------- the later collections: shape, ids, filenames, facts ----------
// Same record shape as SPECIES, so the same identity rules apply. What differs
// is the facts object: these carry an explicit four-row `vitals` array instead
// of the wingspan/weight/range/habitat fields vitalRows() was written around.
EXTRA.forEach((coll) => {
  const seenIds = new Set();
  coll.items.forEach((it) => {
    if (seenIds.has(it.id)) fail(`app.js: duplicate ${coll.key} id ${it.id}`);
    seenIds.add(it.id);
    const want = `files/${coll.dir}/${coll.prefix}${it.id}-`;
    if (!decodeURI(it.image).startsWith(want)) {
      fail(`app.js: ${coll.key} ${it.id} image "${it.image}" does not start with ${want}`);
    }
    // No letterbox photograph exists outside the birds, so W is not allowed
    // here — a W would ask for a 6x2 slot the generator never emits.
    if (!'LV'.includes(it.shape)) fail(`app.js: ${coll.key} ${it.id} has shape "${it.shape}", expected L or V`);
    ['vernacular', 'latin', 'band_a', 'band_b'].forEach((k) => {
      if (!it[k]) fail(`app.js: ${coll.key} ${it.id} is missing ${k}`);
    });
    const f = coll.facts[it.id];
    if (!f) return fail(`app.js: ${coll.key} ${it.id} (${it.vernacular}) has no facts entry`);
    if (!Array.isArray(f.vitals) || f.vitals.length !== 4 ||
        f.vitals.some((r) => !Array.isArray(r) || r.length !== 2 || !r[0] || !r[1])) {
      fail(`app.js: ${coll.key} ${it.id} vitals must be four [label, value] pairs`);
    }
    ['lede', 'fun_fact'].forEach((k) => {
      if (!f[k]) fail(`app.js: ${coll.key} ${it.id} is missing ${k}`);
    });
  });

  // One title carries one subtitle, and every frame of one series shares one
  // facts object — otherwise the plate would state two different dates for the
  // same shoot depending on which tile you are standing on.
  const latinOfIt = new Map();
  const factsOf = new Map();
  coll.items.forEach((it) => {
    if (latinOfIt.has(it.vernacular) && latinOfIt.get(it.vernacular) !== it.latin) {
      fail(`app.js: ${coll.key} "${it.vernacular}" is both "${latinOfIt.get(it.vernacular)}" and "${it.latin}"`);
    }
    latinOfIt.set(it.vernacular, it.latin);
    const f = coll.facts[it.id];
    if (factsOf.has(it.vernacular) && factsOf.get(it.vernacular) !== f) {
      fail(`app.js: ${coll.key} "${it.vernacular}" frames do not share one facts object ` +
           `(${it.id} differs) — alias them as EVENT_FACTS[n] = EVENT_FACTS[m]`);
    }
    factsOf.set(it.vernacular, f);
  });
});

// ---------- photographs on disk ----------
// public/ is the deployed artifact, so anything unreferenced sitting there
// ships to visitors for free. The tree is exactly: the bird .webp files and
// logo.svg at the root, plus one folder per later collection holding only its
// own .webp files.
const webDir = path.join(ROOT, 'public', 'files');
const ALLOWED_DIRS = EXTRA.map((c) => c.dir);

const checkDir = (dir, wantedNames, label) => {
  const onDisk = fs.readdirSync(dir).filter((f) => f.endsWith('.webp'));
  wantedNames.forEach((f) => {
    if (!onDisk.includes(f)) fail(`${label}: ${f} is referenced but not on disk`);
  });
  onDisk.forEach((f) => {
    if (!wantedNames.includes(f)) fail(`${label}: ${f} is on disk but nothing references it`);
  });
};

checkDir(webDir, SPECIES.map((sp) => decodeURI(sp.image).replace(/^files\//, '')), 'public/files/');
fs.readdirSync(webDir, { withFileTypes: true }).forEach((e) => {
  if (e.isDirectory()) {
    if (!ALLOWED_DIRS.includes(e.name)) {
      fail(`public/files/: unexpected directory "${e.name}" — only ${ALLOWED_DIRS.join(', ')} ship`);
    }
  } else if (!e.name.endsWith('.webp') && e.name !== 'logo.svg') {
    fail(`public/files/: unexpected file "${e.name}" — only photographs and logo.svg ship`);
  }
});

EXTRA.forEach((coll) => {
  const dir = path.join(webDir, coll.dir);
  if (!fs.existsSync(dir)) return fail(`public/files/${coll.dir}/ does not exist`);
  checkDir(dir, coll.items.map((it) => decodeURI(it.image).replace(`files/${coll.dir}/`, '')),
           `public/files/${coll.dir}/`);
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    if (e.isDirectory() || !e.name.endsWith('.webp')) {
      fail(`public/files/${coll.dir}/: unexpected entry "${e.name}" — only photographs ship`);
    }
  });
});

// ---------- public/index.html: canonical host ----------
const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
if (!canonical) fail('index.html: no <link rel="canonical">');
else {
  const sitemap = read('public', 'sitemap.xml');
  const loc = (sitemap.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  if (loc !== canonical) fail(`index.html canonical ${canonical} != sitemap.xml <loc> ${loc}`);
  const robots = read('public', 'robots.txt');
  const sm = (robots.match(/Sitemap:\s*(\S+)/) || [])[1];
  if (sm && !sm.startsWith(new URL(canonical).origin)) {
    fail(`robots.txt sitemap ${sm} is not on the canonical origin`);
  }
  ['og:url'].forEach((p) => {
    const v = (html.match(new RegExp(`property="${p}" content="([^"]+)"`)) || [])[1];
    if (v && v !== canonical) fail(`index.html ${p} ${v} != canonical ${canonical}`);
  });
}

// ---------- public/index.html: schema.org gallery ----------
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!ld) fail('index.html: no application/ld+json block');
else {
  let graph;
  try {
    graph = JSON.parse(ld[1]);
  } catch (e) {
    fail('index.html: the ld+json block is not valid JSON — ' + e.message);
  }
  const gallery = graph && (graph['@graph'] || []).find((n) => n['@type'] === 'ImageGallery');
  if (!gallery) fail('index.html: ld+json has no ImageGallery node');
  else {
    const imgs = gallery.image || [];
    if (imgs.length !== SPECIES.length) {
      fail(`index.html: ld+json gallery lists ${imgs.length} images, SPECIES has ${SPECIES.length}`);
    }
    SPECIES.forEach((sp, i) => {
      const img = imgs[i];
      if (!img) return;
      const file = decodeURI(sp.image).replace(/^files\//, '');
      if (!decodeURI(img.contentUrl || '').endsWith('/files/' + file)) {
        fail(`index.html: ld+json image ${i + 1} contentUrl does not end with files/${file}`);
      }
      if (!same(img.name, sp.vernacular)) {
        fail(`index.html: ld+json image ${i + 1} name "${img.name}" != "${sp.vernacular}"`);
      }
    });
  }
}

// ---------- public/index.html: mobile .mcell tiles ----------
// The mobile edition is hand-written markup, one block per photograph. Every
// SPECIES id must appear exactly once, pointing at the same file with the same
// label — populateMobileBloom() only supplies the prose.
//
// Since the mobile set switcher landed, each tile also carries data-cat naming
// the body of work it belongs to. That attribute is load-bearing: the switcher
// hides every [data-cat] that does not match .mobile-edition[data-set], so a
// tile that omits it matches no hide rule and would bleed into all three sets.
const cells = [...html.matchAll(
  /<div class="mcell"([^>]*)>([\s\S]*?)<div class="mlabel">([\s\S]*?)<\/div>/g
)];
const catCounts = {};
const seen = new Set();
cells.forEach(([, attrs, body, label]) => {
  const cat = (attrs.match(/data-cat="([^"]+)"/) || [])[1];
  const idStr = (attrs.match(/data-sp="(\d+)"/) || [])[1];
  if (!cat) {
    return fail(`index.html: .mcell data-sp="${idStr}" has no data-cat — it would show in every set`);
  }
  catCounts[cat] = (catCounts[cat] || 0) + 1;

  // Only the birds set is SPECIES-backed. The events and products tiles carry
  // their own titles and no data-sp, so there is nothing to cross-check them
  // against beyond the per-set totals asserted below.
  if (cat !== 'birds') return;
  if (!idStr) return fail('index.html: a birds .mcell carries no data-sp');

  const id = +idStr;
  const sp = byId.get(id);
  if (!sp) return fail(`index.html: .mcell data-sp="${id}" has no SPECIES entry`);
  if (seen.has(id)) fail(`index.html: .mcell data-sp="${id}" appears more than once`);
  seen.add(id);

  const src = (body.match(/<img src="([^"]+)"/) || [])[1];
  if (decodeURI(src || '') !== decodeURI(sp.image)) {
    fail(`index.html: .mcell ${id} img src "${src}" != "${sp.image}"`);
  }
  const bandA = (body.match(/--ph-band-a:\s*([^;"]+)/) || [])[1];
  const bandB = (body.match(/--ph-band-b:\s*([^;"]+)/) || [])[1];
  if (bandA && bandA.trim() !== sp.band_a) fail(`index.html: .mcell ${id} band-a ${bandA.trim()} != ${sp.band_a}`);
  if (bandB && bandB.trim() !== sp.band_b) fail(`index.html: .mcell ${id} band-b ${bandB.trim()} != ${sp.band_b}`);

  // Entities are decoded before comparing — the markup writes &rsquo; where the
  // JS literal carries a real ’.
  const text = (s) => s.replace(/&rsquo;/g, '\u2019').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '|');
  const [vern, latin] = text(label).split('|').filter(Boolean).map((s) => s.trim());
  if (!same(vern, sp.vernacular)) fail(`index.html: .mcell ${id} label "${vern}" != "${sp.vernacular}"`);
  if (latin && !same(latin, sp.latin)) fail(`index.html: .mcell ${id} latin "${latin}" != "${sp.latin}"`);
});
SPECIES.forEach((sp) => {
  if (!seen.has(sp.id)) fail(`index.html: no .mcell tile for P${sp.id} (${sp.vernacular})`);
});

// The switcher writes its own counts from the DOM at runtime, so the menu can
// never lie about these — but a set the mobile edition never got is silently
// short rather than visibly broken, so assert each one arrived whole.
[['birds', SPECIES], ...EXTRA.map((c) => [c.key, c.items])].forEach(([key, items]) => {
  const got = catCounts[key] || 0;
  if (got !== items.length) {
    fail(`index.html: ${got} .mcell tiles for data-cat="${key}", app.js has ${items.length}`);
  }
});

// ---------- native/app/src/main/assets/photos.json ----------
const ASPECT_OF = { L: 'landscape', V: 'portrait', W: 'panorama' };
const nativePhotos = manifest.photos || [];
if (nativePhotos.length !== SPECIES.length) {
  fail(`photos.json: ${nativePhotos.length} entries, SPECIES has ${SPECIES.length}`);
}
const nativeById = new Map(nativePhotos.map((p) => [p.id, p]));
SPECIES.forEach((sp) => {
  const p = nativeById.get('P' + sp.id);
  if (!p) return fail(`photos.json: no entry for P${sp.id} (${sp.vernacular})`);
  const file = decodeURI(sp.image).replace(/^files\//, '');
  if (p.assetPath !== 'photos/' + file) {
    fail(`photos.json: P${sp.id} assetPath "${p.assetPath}" != "photos/${file}"`);
  }
  if (!same(p.name, sp.vernacular)) fail(`photos.json: P${sp.id} name "${p.name}" != "${sp.vernacular}"`);
  if (!same(p.latin, sp.latin)) fail(`photos.json: P${sp.id} latin "${p.latin}" != "${sp.latin}"`);
  if (p.aspect !== ASPECT_OF[sp.shape]) {
    fail(`photos.json: P${sp.id} aspect "${p.aspect}" != "${ASPECT_OF[sp.shape]}" (shape ${sp.shape})`);
  }
  const f = BIRD_FACTS[sp.id];
  const v = p.vitals || {};
  // The native side renders vitals as a generic key/value map, so the KEYS are
  // what decide whether it shows "Wingspan" or "Length" — they have to match.
  const wantKeys = [f.length ? 'length' : 'wingspan', 'weight', 'range', 'habitat'];
  const gotKeys = Object.keys(v);
  if (wantKeys.join(',') !== gotKeys.join(',')) {
    fail(`photos.json: P${sp.id} vitals keys [${gotKeys}] != [${wantKeys}]`);
  }
  wantKeys.forEach((k) => {
    if (v[k] !== undefined && !same(v[k], f[k])) {
      fail(`photos.json: P${sp.id} ${k} "${v[k]}" != app.js "${f[k]}"`);
    }
  });
  if (!p.fact) fail(`photos.json: P${sp.id} has no fact`);
});

// native assets on disk
const nativeDir = path.join(ROOT, 'native', 'app', 'src', 'main', 'assets', 'photos');
const nativeDisk = fs.readdirSync(nativeDir);
nativePhotos.forEach((p) => {
  const f = p.assetPath.replace(/^photos\//, '');
  if (!nativeDisk.includes(f)) fail(`native assets: ${p.id} references ${f}, which is not on disk`);
});
nativeDisk.forEach((f) => {
  if (!nativePhotos.some((p) => p.assetPath === 'photos/' + f)) {
    fail(`native assets: ${f} is on disk but photos.json does not reference it`);
  }
});

// ---------- public/index.html: the collection switcher ----------
// The buttons are hand-written markup so the labels are in the document without
// JS; app.js binds them by data-collection. A key typo there is a button that
// silently does nothing, which is exactly the failure this catches.
const collM = appJs.match(/const COLLECTIONS = \[([\s\S]*?)\n {2}\];/);
if (!collM) fail('app.js: could not find the COLLECTIONS registry');
else {
  const declared = [...collM[1].matchAll(/key: '([^']+)',\s*label: '([^']+)'/g)]
    .map((m) => ({ key: m[1], label: m[2] }));
  const buttons = [...html.matchAll(/data-collection="([^"]+)"[^>]*>([^<]*)</g)]
    .map((m) => ({ key: m[1], label: m[2].trim() }));
  if (!declared.length) fail('app.js: COLLECTIONS declares no key/label pairs');
  if (declared.length !== buttons.length) {
    fail(`index.html: ${buttons.length} switcher buttons, app.js declares ${declared.length} collections`);
  }
  declared.forEach((c, i) => {
    const b = buttons[i];
    if (!b) return fail(`index.html: no switcher button for collection "${c.key}"`);
    if (b.key !== c.key) fail(`index.html: switcher button ${i + 1} is "${b.key}", app.js has "${c.key}"`);
    if (!same(b.label, c.label)) fail(`index.html: switcher button "${b.key}" reads "${b.label}", app.js label is "${c.label}"`);
  });
  // Every collection the registry names must have an inventory behind it.
  const known = ['birds', ...EXTRA.map((c) => c.key)];
  declared.forEach((c) => {
    if (!known.includes(c.key)) fail(`app.js: COLLECTIONS names "${c.key}", which this check does not know about`);
  });
}

// ---------- report ----------
const species = [...new Set(SPECIES.map((s) => s.vernacular))];
console.log(`birds     ${SPECIES.length} photographs · ${species.length} species`);
console.log('  ' + species.map((v) => `${v} (${SPECIES.filter((s) => s.vernacular === v).length})`).join(', '));
EXTRA.forEach((coll) => {
  const names = [...new Set(coll.items.map((i) => i.vernacular))];
  console.log(`${coll.key.padEnd(9)} ${coll.items.length} photographs · ${names.length} series`);
  console.log('  ' + names.map((v) => `${v} (${coll.items.filter((i) => i.vernacular === v).length})`).join(', '));
});
if (fails.length) {
  console.error('\nFAILURES:\n  ' + fails.join('\n  '));
  process.exit(1);
}
console.log('\nall species data agrees');
