#!/usr/bin/env node
/* Validate that every copy of the species data still agrees.
 *
 * Species names, latin names, vitals and photo filenames are duplicated across
 * five places, and no generator ties them together:
 *
 *   public/app.js                            SPECIES + BIRD_FACTS  (authoritative)
 *   public/index.html                        schema.org gallery + .mcell tiles
 *   native/app/src/main/assets/photos.json   the Android prototype's manifest
 *   tools/gen-arrangements.js                SPECIES_OF + KIND_OF
 *   tools/check-arrangements.js              derives its maps from app.js
 *
 * Renaming or re-identifying a species means editing all of them by hand. This
 * script is what catches the one you forgot — it treats public/app.js as the
 * source of truth and asserts the rest match, including the files on disk.
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
const genJs = read('tools', 'gen-arrangements.js');

const fails = [];
const fail = (msg) => fails.push(msg);

// ---------- source of truth: lift SPECIES + BIRD_FACTS out of app.js ----------
// The slice runs from the `F` filename helper to `vitalRows`, so it carries the
// literals AND the alias assignments that share one species' prose across its
// repeat photos (BIRD_FACTS[9] = BIRD_FACTS[13] = BIRD_FACTS[7], etc).
const from = appJs.indexOf('const F = (n) =>');
const to = appJs.indexOf('const vitalRows');
if (from < 0 || to < 0 || to < from) {
  console.error('FAILURE: could not locate the SPECIES / BIRD_FACTS block in public/app.js');
  process.exit(1);
}
const { SPECIES, BIRD_FACTS } = new Function(
  appJs.slice(from, to) + '\nreturn { SPECIES, BIRD_FACTS };'
)();

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

// ---------- photographs on disk ----------
const webDir = path.join(ROOT, 'public', 'files');
const onDisk = fs.readdirSync(webDir).filter((f) => f.endsWith('.webp'));
const wanted = SPECIES.map((sp) => decodeURI(sp.image).replace(/^files\//, ''));
wanted.forEach((f, i) => {
  if (!onDisk.includes(f)) fail(`public/files/: P${SPECIES[i].id} references ${f}, which is not on disk`);
});
onDisk.forEach((f) => {
  if (!wanted.includes(f)) fail(`public/files/: ${f} is on disk but no SPECIES entry references it`);
});
// public/ is the deployed artifact — anything unreferenced there ships for free.
fs.readdirSync(webDir, { withFileTypes: true }).forEach((e) => {
  if (e.isDirectory()) fail(`public/files/: unexpected directory "${e.name}" — only photographs and logo.svg ship`);
  else if (!e.name.endsWith('.webp') && e.name !== 'logo.svg') {
    fail(`public/files/: unexpected file "${e.name}" — only photographs and logo.svg ship`);
  }
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
const cells = [...html.matchAll(
  /<div class="mcell" data-sp="(\d+)">([\s\S]*?)<div class="mlabel">([\s\S]*?)<\/div>/g
)];
const seen = new Set();
cells.forEach(([, idStr, body, label]) => {
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

// ---------- tools/gen-arrangements.js ----------
// The generator groups photos by species and by slot kind. Both maps are hand
// written, so they drift the moment a photo is re-identified — which is exactly
// what happened when the Great Tit batch turned out to hold Blue Tits.
const evalMap = (name) => {
  const m = genJs.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\n\\};)`));
  return m ? new Function('return ' + m[1].replace(/;$/, ''))() : null;
};
const KIND_OF = evalMap('KIND_OF');
const SPECIES_OF = evalMap('SPECIES_OF');
if (!KIND_OF || !SPECIES_OF) fail('gen-arrangements.js: could not read KIND_OF / SPECIES_OF');
else {
  // KIND_OF uses P for the letterbox photos where SPECIES uses W.
  const KIND_FOR = { L: 'L', V: 'V', W: 'P' };
  SPECIES.forEach((sp) => {
    if (KIND_OF[sp.id] !== KIND_FOR[sp.shape]) {
      fail(`gen-arrangements.js: KIND_OF[${sp.id}] = ${KIND_OF[sp.id]}, app.js shape is ${sp.shape}`);
    }
    if (!SPECIES_OF[sp.id]) fail(`gen-arrangements.js: SPECIES_OF has no entry for ${sp.id}`);
  });
  Object.keys(KIND_OF).forEach((id) => {
    if (!byId.has(+id)) fail(`gen-arrangements.js: KIND_OF has id ${id}, which app.js does not define`);
  });
  // The generator's species labels are short codes, not vernaculars, so check
  // the PARTITION rather than the names: two photos share a code iff they share
  // a vernacular.
  SPECIES.forEach((a) => SPECIES.forEach((b) => {
    if (a.id >= b.id) return;
    const sameCode = SPECIES_OF[a.id] === SPECIES_OF[b.id];
    const sameBird = a.vernacular === b.vernacular;
    if (sameCode !== sameBird) {
      fail(`gen-arrangements.js: P${a.id}/P${b.id} grouped as ` +
           `${SPECIES_OF[a.id]}/${SPECIES_OF[b.id]} but named "${a.vernacular}"/"${b.vernacular}"`);
    }
  }));
}

// ---------- report ----------
const species = [...new Set(SPECIES.map((s) => s.vernacular))];
console.log(`${SPECIES.length} photographs · ${species.length} species · 5 copies cross-checked`);
console.log('  ' + species.map((v) => `${v} (${SPECIES.filter((s) => s.vernacular === v).length})`).join(', '));
if (fails.length) {
  console.error('\nFAILURES:\n  ' + fails.join('\n  '));
  process.exit(1);
}
console.log('\nall species data agrees');
