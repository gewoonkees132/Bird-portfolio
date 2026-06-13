/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Vanilla JS · pan plane · focus tracking · species label
   ============================================================ */

(function () {
  'use strict';

  // ---------- Species data (16 photos) ----------
  // Shapes: L landscape 16:9 (1,3,5,7,9,10,11,12,14,15) · V portrait 2:3
  //   (2,6,13,16) · W super-wide letterbox (4,8). Repeats are intentional —
  //   Weaver appears twice (2 nest / 6 flight) and the Raw-todo batch adds more
  //   Great Tit + Robin tiles. Image assignment matches each photo's native
  //   aspect to its slot shape:
  //   L slots ← landscape photos (~3:2)   V slots ← vertical photos (~2:3)
  //   W slots ← landscape photos cropped wide via object-fit: cover
  const F = (n) => 'files/' + encodeURI(n);
  const SPECIES = [
    { id: 1, vernacular: 'European Robin',        latin: 'Erithacus rubecula',     shape: 'L',
      band_a: '#3d6b8a', band_b: '#4a7c9a',
      image: F('P1-European_Robin.webp') },
    { id: 2, vernacular: 'Weaver Bird',           latin: 'Ploceus cucullatus',     shape: 'V',
      band_a: '#c79e6e', band_b: '#b88c5e',
      image: F('P2-Weaver_Bird.webp') },
    { id: 3, vernacular: 'Eurasian Jay',          latin: 'Garrulus glandarius',    shape: 'L',
      band_a: '#7a8b76', band_b: '#8a9c86',
      image: F('P3-Eurasian_Jay.webp') },
    { id: 4, vernacular: 'Dunnock',               latin: 'Prunella modularis',     shape: 'W',
      band_a: '#3a4a3e', band_b: '#48584c',
      image: F('P4-Dunnock.webp') },
    { id: 5, vernacular: 'Green Bee-eater',       latin: 'Merops orientalis',      shape: 'L',
      band_a: '#a87a3e', band_b: '#b8893f',
      image: F('P5-Green_Bee-eater.webp') },
    { id: 6, vernacular: 'Weaver Bird',           latin: 'Ploceus cucullatus',     shape: 'V',
      band_a: '#8b7848', band_b: '#9a8758',
      image: F('P6-Weaver_Bird_flapping.webp') },
    { id: 7, vernacular: 'Great Tit',             latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P7-Great_Tit.webp') },
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

  // ---------- Bird facts (per-species lede + vitals + fun fact) ----------
  // Vitals from Cornell Lab Birds of the World, BirdLife, RSPB, BTO.
  // Lede + fun-fact prose written at CEFR B1 reading level. Sources:
  //   1 Robin       — Lack (1943) territorial decoy experiments.
  //   2 Weaver nest — Collias & Victoria (1978) on grass-freshness rejection.
  //   3 Jay         — Parnell et al. (2015, Sci Reports) structural-blue feathers.
  //   4 Dunnock     — Davies, ~600-year cuckoo-host evolutionary lag.
  //   5 Bee-eater   — Watve et al. (2002, Anim Cognition) gaze-sensitivity.
  //   6 Weaver flt  — Olaleye et al. (1982, Trop Pest Mgmt) maize-raid commute.
  //   7 Great Tit   — Estók, Zsebok & Siemers (2010, Biol Letters) bat predation.
  //   8 Skylark     — Cresswell (1994, Behav Ecol Sociobiol) merlin pursuit-deterrent song.
  // Keyed by SPECIES.id. Bespoke prose for ids 1–8; the repeated Raw-todo
  // tiles share existing per-species prose via the alias assignments after
  // the literal (Great Tit 9–13 → 7, Robin 14–16 → 1). No new prose is
  // written; the two distinct Weaver entries (2 nest / 6 flight) are preserved.
  const BIRD_FACTS = {
    1: {
      wingspan: '20–22 cm', weight: '16–22 g',
      range: 'Europe, N Africa', habitat: 'Woodland, gardens',
      lede: 'The European Robin holds its patch of garden all year, and will sing through winter nights under a streetlight. The orange breast is a flag. Show it to a rival and he reads a threat, not a bird.',
      fun_fact: 'In a famous test, a wild robin attacked a small bundle of red feathers with no head and no body. In some places, fights between robins cause about one in ten adult deaths.'
    },
    2: {
      wingspan: '24–28 cm', weight: '30–45 g',
      range: 'Sub-Saharan Africa', habitat: 'Savanna, villages',
      lede: 'A male Village Weaver is a builder who works for an audience. He strips long green strips from leaves and knots them into a hanging pouch. Then he hangs upside down beneath it, fans his wings, and waits for a female to inspect his work.',
      fun_fact: 'A female checks the grass for freshness before she moves in. In one study, scientists painted dead grass green to fool her. She still walked away. A male may build twenty nests in a season to keep her happy.'
    },
    3: {
      wingspan: '52–58 cm', weight: '140–190 g',
      range: 'Europe, Asia', habitat: 'Oak woodland',
      lede: 'The Eurasian Jay is a shy crow of the oak woods, easier to hear than to see. The give-away is the wing flash, a panel of bright sky-blue barred with black, lit up for a second as the bird crosses a clearing.',
      fun_fact: 'There is no blue paint in that wing. The colour comes from tiny sponge-like structures in the feather, about 150 nanometres across, sitting over a layer of black. Crush the feather and the blue is gone.'
    },
    4: {
      wingspan: '19–21 cm', weight: '19–24 g',
      range: 'Europe, W Asia', habitat: 'Hedgerows, gardens',
      lede: 'The Dunnock is the brown bird most people walk straight past. It shuffles under the hedge like a mouse with feathers, picking tiny seeds and insects from the leaf litter. The song is a thin, hurried warble from a low branch.',
      fun_fact: 'Common Cuckoos have laid eggs in dunnock nests for at least 600 years. The cuckoo egg is huge and bright blue. The dunnock egg is small and plain. She still sits on it as if nothing is wrong.'
    },
    5: {
      wingspan: '29–30 cm', weight: '15–20 g',
      range: 'S & SE Asia', habitat: 'Open scrub',
      lede: 'The Green Bee-eater is a small jewel of dry, open country, bright green with a long pair of tail streamers. It hunts from a bare twig, darts out to grab a bee in the air, and carries it back to the same perch to deal with it.',
      fun_fact: 'The bird seems to track what a watcher can see. In one test, it slipped into its nest tunnel far more often when the human nearby was looking the other way, as if it knew which eyes were a problem.'
    },
    6: {
      wingspan: '24–28 cm', weight: '30–45 g',
      range: 'Sub-Saharan Africa', habitat: 'Savanna, villages',
      lede: 'A Village Weaver in flight is a quick, bouncing shape against the sky, wings beating in short bursts. Birds pour from the colony tree at dawn and again in the late afternoon, all heading the same way, like workers leaving for a shift.',
      fun_fact: 'These flights run on a clock. Flocks raid the maize fields from about eight to eleven in the morning, then again from four to six in the evening, almost every day of the season. It is, quite literally, a daily commute.'
    },
    7: {
      wingspan: '22–26 cm', weight: '14–22 g',
      range: 'Europe, Asia, N Africa', habitat: 'Woodland, gardens',
      lede: 'The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries.',
      fun_fact: 'In a Hungarian cave one winter, great tits were filmed flying in to find sleeping bats. They pecked them on the head, killed them, and ate them. Eighteen times in two winters. The bird-table cutie hunts mammals.'
    },
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

  // ---------- Mobile bloom population ----------
  // Each .mcell[data-sp="N"] gets a <details> appended with the same lede /
  // vitals / fun-fact content the desktop bloom plate shows. Built from JS so
  // BIRD_FACTS stays the single source of truth; the HTML doesn't duplicate
  // the prose. Native <details> handles toggle + a11y; CSS handles motion.
  function populateMobileBloom() {
    const cells = document.querySelectorAll('.mcell[data-sp]');
    cells.forEach(cell => {
      const id = +cell.dataset.sp;
      const sp = SPECIES.find(s => s.id === id);
      const f = BIRD_FACTS[id];
      if (!sp || !f) return;

      const vitalsHtml = [
        ['Wingspan', f.wingspan],
        ['Weight',   f.weight],
        ['Range',    f.range],
        ['Habitat',  f.habitat],
      ].map(([k, v]) =>
        `<span class="stat"><span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(v)}</span></span>`
      ).join('');

      const det = document.createElement('details');
      det.className = 'mbloom';
      det.innerHTML =
        '<summary><span class="mbloom-cta"></span></summary>' +
        '<div class="mbloom-body">' +
          `<div class="mlede">${escapeHtml(f.lede)}</div>` +
          `<div class="mvitals">${vitalsHtml}</div>` +
          `<div class="mfact"><span class="fact-body">${escapeHtml(f.fun_fact)}</span></div>` +
        '</div>';
      // Pull the species label into the summary so the label row itself is the
      // toggle: label left, "Read more" right, sharing a single underline.
      const label = cell.querySelector('.mlabel');
      if (label) det.querySelector('summary').insertBefore(label, det.querySelector('summary').firstChild);
      cell.appendChild(det);
    });
  }

  // ---------- Arrangements ----------
  // Tile: 1320 x 760. 12×7 cell grid, module 88, gutter 24, no outer margin.
  // Each arrangement is an exact tiling: 6 photo slots + 1 brand slot, every
  // cell covered once. A–D draw from the original 8 ids; E–H bring the
  // Raw-todo ids (7,9–16) onto the cycle. The union of A–H references all 16
  // ids (~3 appearances each). Place V ids in tall slots, L ids in wide ones.
  const ARRANGEMENTS = [
    {
      name: 'A',
      slots: [
        { c:0, r:0, cw:7, ch:4, id: 5 },
        { c:7, r:0, cw:5, ch:3, id: 3 },
        { c:7, r:3, cw:5, ch:1, id: 4 },
        { c:0, r:4, cw:3, ch:3, id: 1 },
        { c:3, r:4, cw:6, ch:2, id: 8 },
        { c:9, r:4, cw:3, ch:3, id: 6 },
        { c:3, r:6, cw:6, ch:1, brand: true },
      ]
    },
    {
      name: 'B',
      slots: [
        { c:5, r:0, cw:7, ch:4, id: 3 },
        { c:0, r:0, cw:3, ch:4, id: 6 },
        { c:3, r:0, cw:2, ch:4, id: 2 },
        { c:0, r:4, cw:5, ch:3, id: 5 },
        { c:5, r:4, cw:7, ch:2, id: 8 },
        { c:5, r:6, cw:5, ch:1, brand: true },
        { c:10, r:6, cw:2, ch:1, id: 4 },
      ]
    },
    {
      name: 'C',
      slots: [
        { c:0, r:0, cw:6, ch:2, id: 4 },
        { c:6, r:0, cw:3, ch:3, id: 2 },
        { c:9, r:0, cw:3, ch:2, id: 6 },
        { c:9, r:2, cw:3, ch:1, id: 5 },
        { c:0, r:2, cw:6, ch:1, brand: true },
        { c:0, r:3, cw:7, ch:4, id: 7 },
        { c:7, r:3, cw:5, ch:4, id: 1 },
      ]
    },
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

  const U = 88;
  const GUT = 24;

  ARRANGEMENTS.forEach(arr => {
    arr.slots.forEach(s => {
      s.x = s.c * (U + GUT);
      s.y = s.r * (U + GUT);
      s.w = s.cw * U + (s.cw - 1) * GUT;
      s.h = s.ch * U + (s.ch - 1) * GUT;
    });
  });

  const ARRANGEMENT_LEAD = { 0: 5, 1: 3, 2: 7, 3: 1, 4: 9, 5: 16, 6: 13, 7: 11 };
  const TILE_W = 12 * 88 + 11 * 24;
  const TILE_H =  7 * 88 +  6 * 24;
  const GUTTER = 24;
  const STRIP_W = (TILE_W + GUTTER) * ARRANGEMENTS.length;

  // ---------- DOM build ----------
  const stage = document.getElementById('stage');
  const plane = document.getElementById('plane');
  const speciesEl = document.getElementById('species');
  if (!stage || !plane || !speciesEl) {
    console.error('[bird-portfolio] Missing required DOM nodes; aborting init.');
    return;
  }
  const speciesNameRest = speciesEl.querySelector('.line-name--rest');
  const speciesNameBloom = speciesEl.querySelector('.line-name--bloom');
  const speciesLede = speciesEl.querySelector('.line-lede');
  const speciesVitals = speciesEl.querySelector('.line-vitals');
  const speciesFact = speciesEl.querySelector('.line-fact');
  const speciesMeta = speciesEl.querySelector('.meta');

  // HSPAN must stay >= 3: render() pins worldX inside the *middle* strip copy
  // (middleCopyOriginX = one strip in), so a full strip is needed on BOTH sides
  // for the seamless horizontal wrap. With 8 arrangements this is 24 columns;
  // the engine is parameterized over ARRANGEMENTS.length, so nothing else
  // changes. (Dropping to 2 leaves no strip to the right of center → wrap tears.)
  const HSPAN = 3;
  const VSPAN = 5;

  const tiles = [];
  for (let row = 0; row < VSPAN; row++) {
    for (let col = 0; col < ARRANGEMENTS.length * HSPAN; col++) {
      const arr = ARRANGEMENTS[col % ARRANGEMENTS.length];
      const tx = col * (TILE_W + GUTTER);
      const ty = row * (TILE_H + GUTTER);
      const tileEl = document.createElement('div');
      tileEl.className = 'tile';
      tileEl.style.left = tx + 'px';
      tileEl.style.top  = ty + 'px';

      const photos = [];
      arr.slots.forEach((slot, i) => {
        const pEl = document.createElement('div');
        pEl.style.left   = slot.x + 'px';
        pEl.style.top    = slot.y + 'px';
        pEl.style.width  = slot.w + 'px';
        pEl.style.height = slot.h + 'px';

        if (slot.brand) {
          pEl.className = 'photo is-brand is-entering';
          pEl.innerHTML =
            '<div class="brand-inner">' +
              '<img class="brand-picto" src="files/logo/SVG/logo.svg" alt="" aria-hidden="true" />' +
              '<span class="brand-wordmark">' +
                '<span class="brand-name">Kees Leemeijer</span>' +
                '<span class="brand-dot">.</span>' +
              '</span>' +
            '</div>';
          tileEl.appendChild(pEl);
          photos.push({ el: pEl, slot, sp: null });
          return;
        }

        const sp = SPECIES.find(s => s.id === slot.id);
        if (!sp) return;
        pEl.className = 'photo is-entering';
        pEl.style.setProperty('--ph-band-a', sp.band_a);
        pEl.style.setProperty('--ph-band-b', sp.band_b);
        pEl.setAttribute('data-species', sp.vernacular);

        const ph = document.createElement('div');
        ph.className = 'placeholder';
        ph.setAttribute('data-label', `P${sp.id} · ${sp.vernacular.toUpperCase()}`);
        pEl.appendChild(ph);

        if (sp.image) {
          const img = document.createElement('img');
          img.className = 'photo-img';
          img.alt = sp.vernacular;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.draggable = false;
          img.src = sp.image;
          img.addEventListener('load', () => pEl.classList.add('has-image'), { once: true });
          img.addEventListener('error', () => {
            pEl.classList.add('img-failed');
            console.warn('[bird-portfolio] Image failed to load:', sp.image);
          }, { once: true });
          pEl.appendChild(img);
        }

        tileEl.appendChild(pEl);
        photos.push({ el: pEl, slot, sp });
      });

      plane.appendChild(tileEl);
      tiles.push({ el: tileEl, col, row, arrIndex: col % ARRANGEMENTS.length, photos, tx, ty });
    }
  }

  let entered = 0;
  const allPhotos = tiles.flatMap(t => t.photos);
  allPhotos.forEach((p, i) => {
    const delay = 60 + (i % 32) * 14;
    setTimeout(() => {
      p.el.classList.remove('is-entering');
      p.el.classList.add('is-entered');
    }, delay);
  });

  // ---------- Pan state ----------
  const PERIOD_X = (TILE_W + GUTTER) * ARRANGEMENTS.length;
  const PERIOD_Y = (TILE_H + GUTTER);

  const A = ARRANGEMENTS[0];
  const leadSlotA = A.slots.find(s => s.id === ARRANGEMENT_LEAD[0]);
  let panX_target = leadSlotA.x + leadSlotA.w / 2;
  let panY_target = leadSlotA.y + leadSlotA.h / 2;
  let panX = panX_target;
  let panY = panY_target;

  let zoom = 1.6;
  let zoom_target = 1.6;

  let lastInteractionAt = 0;
  // Single entry point for every user interaction: timestamp it, cancel any
  // in-flight dwell pull (the user is taking over), hide the dwell cue, re-arm
  // the cue + dwell timers, and make sure the render loop is awake.
  function bumpInteraction() {
    lastInteractionAt = performance.now();
    dwelling = false;
    speciesEl.classList.remove('is-dwell');
    scheduleCue();
    scheduleDwell();
    wake();
  }

  let vx = 0, vy = 0;
  let dragging = false;
  let lastPointer = null;
  let lastMoveTime = 0;

  // ---------- Tweakables (compiled-in constants; tweaks panel removed for production) ----------
  const TWEAKS = {
    lerp: 0.02,
    zoomLerp: 0.02,
    zoomMin: 1.6,
    zoomMax: 4.0,
    dwellDelay: 400,
    dwellPull: 0.0015,
    ambientOpacity: 0.9,
    ambientSaturate: 0,
    ambientBrightness: 0.81,
    focusFadeMs: 200,
    blue: '#1635ee',
    field: '#f2eee5'
  };

  function applyTweaks() {
    document.documentElement.style.setProperty('--ambient-opacity', TWEAKS.ambientOpacity);
    document.documentElement.style.setProperty('--ambient-saturate', TWEAKS.ambientSaturate);
    document.documentElement.style.setProperty('--ambient-brightness', TWEAKS.ambientBrightness);
    // Black-veil opacity that reproduces the old brightness() dim: brightness(b)
    // multiplies each channel by b, same as compositing black at (1 - b).
    document.documentElement.style.setProperty('--veil-ambient', 1 - TWEAKS.ambientBrightness);
    document.documentElement.style.setProperty('--focus-fade', TWEAKS.focusFadeMs + 'ms');
    document.documentElement.style.setProperty('--blue', TWEAKS.blue);
    document.documentElement.style.setProperty('--field', TWEAKS.field);
  }
  applyTweaks();

  // ---------- Render loop ----------
  function viewport() {
    return { w: window.innerWidth, h: window.innerHeight };
  }

  // One rAF loop drives pan/zoom/focus/compass. It SLEEPS (rafId = 0) once
  // everything is at rest and is restarted by wake() on any interaction, so an
  // untouched plane burns zero CPU instead of asymptotically chasing its target
  // for minutes. `dwelling` runs the gentle proportional recenter pull; the
  // dwell cue and dwell trigger are scheduled with setTimeout rather than polled
  // every frame.
  let rafId = 0;
  let dwelling = false;      // gentle per-frame recenter pull is active
  let dwellCx = 0, dwellCy = 0;  // fixed photo-center the pull targets
  let dwellStart = 0;        // performance.now() the pull began (for the cap)
  let dwellTimer = null;     // setTimeout id → dwell trigger
  let cueTimer = null;       // setTimeout id → dwell-cue (is-dwell) trigger

  // Idempotent: the rafId guard prevents stacking parallel rAF chains.
  function wake() {
    if (!rafId) rafId = requestAnimationFrame(render);
  }
  function settledNow() {
    return !dragging && !pinching && Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1;
  }

  function render() {
    const lerp = TWEAKS.lerp;
    panX += (panX_target - panX) * lerp;
    panY += (panY_target - panY) * lerp;

    if (!dragging && !pinching && (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05)) {
      panX_target += vx;
      panY_target += vy;
      vx *= 0.94;
      vy *= 0.94;
    } else if (!dragging && !pinching) {
      vx = 0; vy = 0;
    }

    // Dwell pull — the original gentle per-frame proportional drift of the
    // target toward the focused photo's center (smoothed again by the lerp
    // above). It approaches asymptotically and never quite arrives, so it is
    // bounded by DWELL_MAX_MS: once the cap is hit — or it's within a pixel of
    // center on screen — freeze in place and let the loop sleep, instead of
    // creeping sub-pixel for a minute and pinning the CPU.
    if (dwelling) {
      panX_target += (dwellCx - panX_target) * TWEAKS.dwellPull;
      panY_target += (dwellCy - panY_target) * TWEAKS.dwellPull;
      const gx = dwellCx - panX, gy = dwellCy - panY;
      if ((gx*gx + gy*gy) * zoom * zoom < 0.25 ||
          performance.now() - dwellStart > DWELL_MAX_MS) {
        dwelling = false;
        panX_target = panX;
        panY_target = panY;
      }
    }

    zoom += (zoom_target - zoom) * TWEAKS.zoomLerp;

    // Everything within snap thresholds and no pending motion → snap exactly,
    // paint one last frame, and stop the loop until the next wake().
    const atRest =
      !dragging && !pinching && !dwelling &&
      Math.abs(panX_target - panX) < 0.1 &&
      Math.abs(panY_target - panY) < 0.1 &&
      Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05 &&
      Math.abs(zoom_target - zoom) < 0.001;
    if (atRest) { panX = panX_target; panY = panY_target; zoom = zoom_target; }

    const vp = viewport();
    const wx = ((panX % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const wy = ((panY % PERIOD_Y) + PERIOD_Y) % PERIOD_Y;
    const middleCopyOriginX = ARRANGEMENTS.length * (TILE_W + GUTTER);
    const middleCopyOriginY = Math.floor(VSPAN / 2) * (TILE_H + GUTTER);
    const worldX = middleCopyOriginX + wx;
    const worldY = middleCopyOriginY + wy;
    const z = zoom;
    const tx = vp.w / 2 - z * worldX;
    const ty = vp.h / 2 - z * worldY;

    plane.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${z})`;

    updateFocus(panX, panY);
    updateCompass();

    if (atRest) { rafId = 0; return; }
    rafId = requestAnimationFrame(render);
  }

  // ---------- Focus tracking ----------
  let currentFocusKey = null;
  let focusedEls = new Set();
  let labelTimeout = null;

  function updateFocus(px, py) {
    const wx = ((px % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const wy = ((py % PERIOD_Y) + PERIOD_Y) % PERIOD_Y;

    let best = null;
    let bestDist = Infinity;

    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      const candidatesX = [arrOriginX, arrOriginX + PERIOD_X, arrOriginX - PERIOD_X];
      const candidatesY = [0, PERIOD_Y, -PERIOD_Y];
      for (const slot of arr.slots) {
        if (slot.brand) continue;
        const cx0 = slot.x + slot.w / 2;
        const cy0 = slot.y + slot.h / 2;
        for (const ox of candidatesX) {
          for (const oy of candidatesY) {
            const cx = ox + cx0;
            const cy = oy + cy0;
            const dx = cx - wx;
            const dy = cy - wy;
            const d = dx*dx + dy*dy;
            if (d < bestDist) {
              bestDist = d;
              best = { arrIdx, slot, cx, cy, d: Math.sqrt(d) };
            }
          }
        }
      }
    }

    if (!best) return;

    const newKey = `A${best.arrIdx}-S${best.slot.id}`;

    const vp = viewport();
    const diag = Math.sqrt(vp.w*vp.w + vp.h*vp.h);
    const hys = diag * 0.05;

    if (newKey !== currentFocusKey) {
      if (currentFocusKey === null) {
        commitFocus(newKey, best);
      } else {
        const prev = parseFocusKey(currentFocusKey);
        const prevDist = prev ? distanceToSlot(wx, wy, prev) : Infinity;
        if (prevDist - best.d > hys) {
          commitFocus(newKey, best);
        }
      }
    }
  }

  function parseFocusKey(key) {
    const m = /^A(\d+)-S(\d+)$/.exec(key);
    if (!m) return null;
    const arrIdx = +m[1];
    const slotId = +m[2];
    const arr = ARRANGEMENTS[arrIdx];
    const slot = arr.slots.find(s => s.id === slotId);
    return { arrIdx, slot };
  }

  function distanceToSlot(wx, wy, info) {
    const arrOriginX = info.arrIdx * (TILE_W + GUTTER);
    const candidatesX = [arrOriginX, arrOriginX + PERIOD_X, arrOriginX - PERIOD_X];
    const candidatesY = [0, PERIOD_Y, -PERIOD_Y];
    const cx0 = info.slot.x + info.slot.w / 2;
    const cy0 = info.slot.y + info.slot.h / 2;
    let best = Infinity;
    for (const ox of candidatesX) for (const oy of candidatesY) {
      const dx = ox + cx0 - wx;
      const dy = oy + cy0 - wy;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < best) best = d;
    }
    return best;
  }

  function commitFocus(key, info) {
    currentFocusKey = key;

    focusedEls.forEach(el => el.classList.remove('is-focused'));
    focusedEls.clear();

    tiles.forEach(t => {
      if (t.arrIndex !== info.arrIdx) return;
      t.photos.forEach(p => {
        if (p.slot.id === info.slot.id) {
          p.el.classList.add('is-focused');
          focusedEls.add(p.el);
        }
      });
    });

    const sp = SPECIES.find(s => s.id === info.slot.id);
    if (!sp) return;
    const latinHtml = escapeHtml(sp.latin).replace(/ /g, '&nbsp;');
    // Resting label (uppercased by CSS, announced via aria-live) and bloomed
    // title both get filled; the bloom is an opacity crossfade between them.
    speciesNameRest.textContent = sp.vernacular;
    speciesNameBloom.innerHTML =
      `${escapeHtml(sp.vernacular)}<span class="latin">${latinHtml}</span>`;
    speciesMeta.textContent = `Photo ${sp.id} / ${SPECIES.length} · Arrangement ${ARRANGEMENTS[info.arrIdx].name}`;

    const f = BIRD_FACTS[sp.id];
    if (f) {
      speciesLede.textContent = f.lede;
      speciesVitals.innerHTML = [
        ['Wingspan', f.wingspan],
        ['Weight',   f.weight],
        ['Range',    f.range],
        ['Habitat',  f.habitat],
      ].map(([k, v]) =>
        `<span class="stat"><span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(v)}</span></span>`
      ).join('');
      speciesFact.innerHTML = `<span class="fact-body">${escapeHtml(f.fun_fact)}</span>`;
    } else {
      speciesLede.textContent = '';
      speciesVitals.innerHTML = '';
      speciesFact.innerHTML = '';
    }

    speciesEl.classList.remove('is-visible');
    if (labelTimeout) clearTimeout(labelTimeout);
    labelTimeout = setTimeout(() => speciesEl.classList.add('is-visible'), 60);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---------- Pointer interaction (mouse + touch, with two-finger pinch-zoom) ----------
  // Strategy:
  //   1 active pointer  → drag pan
  //   2 active pointers → pinch-zoom around the touch midpoint, with translation
  //                       so the world point under that midpoint stays anchored.
  //                       Two-finger pan emerges naturally from midpoint drift.
  //   ≥3 active pointers → first two govern; extras tracked but ignored.
  const pointers = new Map();  // pointerId -> { x, y }
  let pinching = false;
  let pinchStart = null;  // { dist, midX, midY, zoom, worldX, worldY }

  function midpointOf(pts) {
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }
  function distanceOf(pts) {
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }

  function beginPinch() {
    const pts = Array.from(pointers.values()).slice(0, 2);
    const mid = midpointOf(pts);
    const dist = distanceOf(pts);
    const vp = viewport();
    const worldX = panX_target + (mid.x - vp.w / 2) / zoom_target;
    const worldY = panY_target + (mid.y - vp.h / 2) / zoom_target;
    pinchStart = { dist: Math.max(1, dist), midX: mid.x, midY: mid.y, zoom: zoom_target, worldX, worldY };
    pinching = true;
    dragging = false;
    vx = 0; vy = 0;
  }

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    bumpInteraction();

    if (pointers.size >= 2 && !pinching) {
      beginPinch();
    } else if (pointers.size === 1) {
      dragging = true;
      vx = 0; vy = 0;
      lastPointer = { x: e.clientX, y: e.clientY };
      lastMoveTime = performance.now();
    }
  });

  stage.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    bumpInteraction();

    if (pinching && pointers.size >= 2) {
      const pts = Array.from(pointers.values()).slice(0, 2);
      const mid = midpointOf(pts);
      const dist = distanceOf(pts);

      const ratio = dist / pinchStart.dist;
      let newZoom = pinchStart.zoom * ratio;
      newZoom = Math.min(TWEAKS.zoomMax, Math.max(TWEAKS.zoomMin, newZoom));

      const vp = viewport();
      // Anchor the world point that was under the original midpoint at the
      // CURRENT midpoint (so two-finger pan + zoom both feel natural).
      panX_target = pinchStart.worldX - (mid.x - vp.w / 2) / newZoom;
      panY_target = pinchStart.worldY - (mid.y - vp.h / 2) / newZoom;
      zoom_target = newZoom;
      return;
    }

    if (dragging && pointers.size === 1) {
      const now = performance.now();
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      panX_target -= dx / zoom_target;
      panY_target -= dy / zoom_target;
      const dt = Math.max(8, now - lastMoveTime);
      vx = -dx * (16 / dt) / zoom_target;
      vy = -dy * (16 / dt) / zoom_target;
      lastPointer = { x: e.clientX, y: e.clientY };
      lastMoveTime = now;
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
    bumpInteraction();

    if (pinching && pointers.size < 2) {
      pinching = false;
      pinchStart = null;
      // If a finger remains, hand back to drag from its current position
      // without injecting momentum from the pinch motion.
      if (pointers.size === 1) {
        const remaining = pointers.values().next().value;
        lastPointer = { x: remaining.x, y: remaining.y };
        lastMoveTime = performance.now();
        dragging = true;
        vx = 0; vy = 0;
      } else {
        dragging = false;
      }
      return;
    }

    if (pointers.size === 0 && dragging) {
      dragging = false;
    }
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);

  // Wheel events:
  //   - ctrlKey true   → trackpad pinch
  //   - mouse wheel    → zoom-to-cursor
  //   - trackpad two-finger swipe → pan
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    bumpInteraction();

    const isPinch = e.ctrlKey;
    const isMouseWheel =
      e.deltaMode !== 0 ||
      (Math.abs(e.deltaY) >= 50 && Math.abs(e.deltaX) < 2);

    if (isPinch || isMouseWheel) {
      const norm = isPinch ? e.deltaY * 0.012 : e.deltaY * 0.0022;
      const factor = Math.exp(-norm);
      const newZoom = Math.min(
        TWEAKS.zoomMax,
        Math.max(TWEAKS.zoomMin, zoom_target * factor)
      );

      const vp = viewport();
      const cx = e.clientX;
      const cy = e.clientY;
      const oldZ = zoom_target;
      panX_target += (cx - vp.w / 2) * (1 / oldZ - 1 / newZoom);
      panY_target += (cy - vp.h / 2) * (1 / oldZ - 1 / newZoom);

      zoom_target = newZoom;
    } else {
      panX_target += e.deltaX / zoom_target;
      panY_target += e.deltaY / zoom_target;
    }
  }, { passive: false });

  // Arrow keys — discrete jumps to nearest photo center
  document.addEventListener('keydown', (e) => {
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault();
      bumpInteraction();
      jumpToNearestInDir(e.key);
    }
  });

  function jumpToNearestInDir(dir) {
    const wx = ((panX_target % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const wy = ((panY_target % PERIOD_Y) + PERIOD_Y) % PERIOD_Y;
    let best = null;
    let bestScore = Infinity;
    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      for (const slot of arr.slots) {
        if (slot.brand) continue;
        for (const ox of [arrOriginX, arrOriginX + PERIOD_X, arrOriginX - PERIOD_X]) {
          for (const oy of [0, PERIOD_Y, -PERIOD_Y]) {
            const cx = ox + slot.x + slot.w/2;
            const cy = oy + slot.y + slot.h/2;
            const dx = cx - wx;
            const dy = cy - wy;
            if (dir === 'ArrowLeft'  && dx > -20) continue;
            if (dir === 'ArrowRight' && dx <  20) continue;
            if (dir === 'ArrowUp'    && dy > -20) continue;
            if (dir === 'ArrowDown'  && dy <  20) continue;
            let score;
            if (dir === 'ArrowLeft' || dir === 'ArrowRight') {
              score = Math.abs(dx) + Math.abs(dy) * 1.5;
            } else {
              score = Math.abs(dy) + Math.abs(dx) * 1.5;
            }
            if (score < bestScore) {
              bestScore = score;
              best = { dx, dy };
            }
          }
        }
      }
    }
    if (best) {
      panX_target += best.dx;
      panY_target += best.dy;
    }
  }

  // Compass updates — show current arrangement letter
  const compassArr = document.getElementById('compass-arr');
  let lastArr = -1;
  // Called once per render frame (folded into the single loop).
  function updateCompass() {
    if (!compassArr) return;
    const wx = ((panX % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const arrIdx = Math.floor(wx / (TILE_W + GUTTER)) % ARRANGEMENTS.length;
    if (arrIdx !== lastArr) {
      lastArr = arrIdx;
      compassArr.textContent = ARRANGEMENTS[arrIdx].name;
    }
  }

  // ---------- Species label: bloom interaction ----------
  const DWELL_CUE_MS = 1800;

  function setBloomed(b) {
    speciesEl.classList.toggle('is-blooming', b);
    if (b) speciesEl.classList.remove('is-dwell');
  }

  // Bloom open/close is UI-only — it does not move the plane, so it must NOT
  // wake the render loop (that would spin a few needless render frames). Just
  // re-arm the dwell-cue timer so the cue stays hidden while reading and
  // reappears after closing. The bloom itself animates via CSS transitions.
  function noteUiInteraction() {
    lastInteractionAt = performance.now();
    scheduleCue();
  }

  speciesEl.addEventListener('click', (e) => {
    if (!e.target.closest('.line-name')) return;
    e.stopPropagation();
    setBloomed(!speciesEl.classList.contains('is-blooming'));
    noteUiInteraction();
  });

  document.addEventListener('click', (e) => {
    if (!speciesEl.contains(e.target) && speciesEl.classList.contains('is-blooming')) {
      setBloomed(false);
      noteUiInteraction();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && speciesEl.classList.contains('is-blooming')) {
      setBloomed(false);
      noteUiInteraction();
      e.stopPropagation();
    }
  });

  // Dwell cue — scheduled from the last interaction instead of polled every
  // frame. If a re-armed timer fires while momentum is still running, it waits
  // a beat and re-checks rather than showing the cue mid-motion.
  function scheduleCue() {
    if (cueTimer) clearTimeout(cueTimer);
    cueTimer = setTimeout(fireCue, DWELL_CUE_MS);
  }
  function fireCue() {
    cueTimer = null;
    if (!settledNow()) { cueTimer = setTimeout(fireCue, 200); return; }
    if (speciesEl.classList.contains('is-blooming')) return;
    speciesEl.classList.add('is-dwell');
  }

  // Dwell pull — after dwellDelay of settled idle, start the gentle proportional
  // recenter (the render loop applies it; see the `dwelling` block there). The
  // pull approaches asymptotically and is bounded by DWELL_MAX_MS so it can
  // terminate and let the loop sleep instead of creeping sub-pixel for minutes.
  const DWELL_MAX_MS = 8000;
  function scheduleDwell() {
    if (dwellTimer) clearTimeout(dwellTimer);
    dwellTimer = setTimeout(tryDwell, TWEAKS.dwellDelay);
  }
  // Nearest non-brand photo center to a pan position, across all arrangements
  // and the wrapped tile copies. Driven by panX_target (the user's intended
  // destination) so the pull centers where the drag was headed, matching the
  // photo updateFocus will settle on once the plane catches up.
  function nearestCenterTo(px, py) {
    let bestX = px, bestY = py, bestD2 = Infinity;
    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      for (const slot of arr.slots) {
        if (slot.brand) continue;
        const cx0 = slot.x + slot.w / 2, cy0 = slot.y + slot.h / 2;
        for (const ox of [arrOriginX, arrOriginX + PERIOD_X, arrOriginX - PERIOD_X,
                          arrOriginX + 2*PERIOD_X, arrOriginX - 2*PERIOD_X]) {
          for (const oy of [0, PERIOD_Y, -PERIOD_Y, 2*PERIOD_Y, -2*PERIOD_Y]) {
            const tX = ox + cx0, tY = oy + cy0;
            const wX = tX + Math.round((px - tX) / PERIOD_X) * PERIOD_X;
            const wY = tY + Math.round((py - tY) / PERIOD_Y) * PERIOD_Y;
            const dx = wX - px, dy = wY - py, d2 = dx*dx + dy*dy;
            if (d2 < bestD2) { bestD2 = d2; bestX = wX; bestY = wY; }
          }
        }
      }
    }
    return { x: bestX, y: bestY };
  }
  function tryDwell() {
    dwellTimer = null;
    if (!settledNow()) { dwellTimer = setTimeout(tryDwell, 120); return; }
    // Kill residual sub-threshold momentum so it can't fight the pull and leave
    // a slow lerp tail that never reaches the sleep threshold.
    vx = 0; vy = 0;
    const target = nearestCenterTo(panX_target, panY_target);
    const dx = target.x - panX, dy = target.y - panY;
    if (dx*dx + dy*dy < 0.25) {                 // already centered (<0.5px): snap + sleep
      panX = panX_target = target.x;
      panY = panY_target = target.y;
      wake();
      return;
    }
    dwellCx = target.x;
    dwellCy = target.y;
    dwellStart = performance.now();
    dwelling = true;
    wake();
  }

  // ---------- Visibility pause ----------
  // Stop all RAF loops while the tab is hidden so the page does not burn
  // CPU/GPU on a backgrounded plane. Resume on focus.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      wake();   // repaint once and re-settle; the loop sleeps again if at rest
    }
  });

  // Kick off
  populateMobileBloom();
  scheduleCue();
  scheduleDwell();
  wake();

})();
