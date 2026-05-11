/* ============================================================
   Bird Photography Portfolio — Kees Leemeijer
   Vanilla JS · pan plane · focus tracking · species label
   ============================================================ */

(function () {
  'use strict';

  // ---------- Species data (8 photos) ----------
  // Crops: 4 landscape (P1,P3,P5,P7) · 2 vertical (P2,P6) · 2 super-wide (P4,P8)
  // Image assignment matches each photo's native aspect to its slot shape:
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
  // Keyed by SPECIES.id (1–8).
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

  // ---------- Arrangements ----------
  // Tile: 1320 x 760. 12×7 cell grid, module 88, gutter 24, no outer margin.
  // Each arrangement uses 7 of 8 photos in a hand-designed Mondrian.
  // The four arrangements use overlapping photo sets in different permutations.

  // ============================================================
  // STRICT MODULAR GRID — gutter is ALWAYS exactly 24px
  //   u=88, g=24, C=12, R=7
  //   Tile = 12*88 + 11*24 = 1320 wide; 7*88 + 6*24 = 760 tall.
  //   Cell (c,r) -> pixel (c*(u+g), r*(u+g))
  //   Span n cells = n*u + (n-1)*g
  //
  //   12×7 grid lets photos sit at honest aspect ratios:
  //     L (landscape, ~3:2): 7×4=1.75, 5×3=1.67, 6×4=1.5
  //     V (vertical, ~2:3):  3×4=0.75, 2×4=0.5, 3×3 (squarer)
  //     W (wide, ~3:1):      6×2=3.0, 7×2=3.5, 9×2=4.5
  //   Each arrangement: 7 photos (one of 8 sits out per tile).
  //   Lead rotates: A→P5, B→P3, C→P7, D→P1.
  //
  //   Hand-designed so NO photo is adjacent to itself across any seam:
  //     horizontal (right col of tile N vs left col of tile N+1)
  //     vertical   (bottom row of tile N vs top row of same tile,
  //                 since tiles duplicate vertically).
  // ============================================================
  // Per arrangement, the slot with the highest aspect ratio (the "long box")
  // becomes a wordmark + pictogram brand card instead of a photograph.
  const ARRANGEMENTS = [
    {
      // A — lead P5 top-left
      name: 'A',
      slots: [
        { c:0, r:0, cw:7, ch:4, id: 5 },  // LEAD 7×4 (1.75)
        { c:7, r:0, cw:5, ch:3, id: 3 },  // L 5×3 (1.67)
        { c:7, r:3, cw:5, ch:1, id: 4 },  // W 5×1 strip
        { c:0, r:4, cw:3, ch:3, id: 1 },  // L 3×3 squarer crop
        { c:3, r:4, cw:6, ch:2, id: 8 },  // W 6×2 (3.0) ✓
        { c:9, r:4, cw:3, ch:3, id: 6 },  // V 3×3 squarer crop
        { c:3, r:6, cw:6, ch:1, brand: true },  // BRAND 6×1 (6.0) — longest
      ]
    },
    {
      // B — lead P3 top-right
      name: 'B',
      slots: [
        { c:5, r:0, cw:7, ch:4, id: 3 },  // LEAD 7×4 (1.75)
        { c:0, r:0, cw:3, ch:4, id: 6 },  // V 3×4 (0.75) ✓
        { c:3, r:0, cw:2, ch:4, id: 2 },  // V 2×4 (0.5) tall vert
        { c:0, r:4, cw:5, ch:3, id: 5 },  // L 5×3 (1.67) ✓
        { c:5, r:4, cw:7, ch:2, id: 8 },  // W 7×2 (3.5)
        { c:5, r:6, cw:5, ch:1, brand: true }, // BRAND 5×1 (5.0) — longest
        { c:10, r:6, cw:2, ch:1, id: 4 }, // W 2×1 small strip
      ]
    },
    {
      // C — lead P7 bottom-left
      name: 'C',
      slots: [
        { c:0, r:0, cw:6, ch:2, id: 4 },  // W 6×2 (3.0) ✓
        { c:6, r:0, cw:3, ch:3, id: 2 },  // V 3×3 squarer
        { c:9, r:0, cw:3, ch:2, id: 6 },  // V 3×2 (1.5) — squarer crop
        { c:9, r:2, cw:3, ch:1, id: 5 },  // L 3×1 strip
        { c:0, r:2, cw:6, ch:1, brand: true },  // BRAND 6×1 (6.0) — longest
        { c:0, r:3, cw:7, ch:4, id: 7 },  // LEAD 7×4 (1.75)
        { c:7, r:3, cw:5, ch:4, id: 1 },  // L 5×4 (1.25) squarer crop
      ]
    },
    {
      // D — lead P1 mid-center (floats in the middle so left+right edges vary)
      name: 'D',
      slots: [
        { c:0, r:0, cw:6, ch:2, id: 8 },  // W 6×2 (3.0) ✓
        { c:6, r:0, cw:6, ch:2, id: 4 },  // W 6×2 (3.0) ✓
        { c:0, r:2, cw:2, ch:4, id: 6 },  // V 2×4 (0.5) tall vert
        { c:2, r:2, cw:7, ch:4, id: 1 },  // LEAD 7×4 (1.75)
        { c:9, r:2, cw:3, ch:4, id: 2 },  // V 3×4 (0.75) ✓
        { c:0, r:6, cw:6, ch:1, brand: true },  // BRAND 6×1 (6.0) — longest
        { c:6, r:6, cw:6, ch:1, id: 3 },  // L 6×1 strip
      ]
    },
  ];

  // Grid params (used to expand cell coords to pixels)
  const U = 88;      // module (12×7 grid)
  const GUT = 24;    // gutter (constant — DO NOT change without changing CSS too)

  // Expand each slot from cell coords to absolute pixel rect within the tile.
  // Outer margin = 0 so seam between tiles = exactly one gutter (24px).
  ARRANGEMENTS.forEach(arr => {
    arr.slots.forEach(s => {
      s.x = s.c * (U + GUT);
      s.y = s.r * (U + GUT);
      s.w = s.cw * U + (s.cw - 1) * GUT;
      s.h = s.ch * U + (s.ch - 1) * GUT;
    });
  });

  // Lead photo per arrangement (the focused-on-load id)
  const ARRANGEMENT_LEAD = { 0: 5, 1: 3, 2: 7, 3: 1 };

  // Tile = inner-only (no outer margin). Between tiles we add one gutter
  // so the seam reads identically to internal gutters.
  const TILE_W = 12 * 88 + 11 * 24;  // = 1320
  const TILE_H =  7 * 88 +  6 * 24;  // =  760
  const GUTTER = 24;

  // Strip width: 4 arrangements + gutters between them
  const STRIP_W = (TILE_W + GUTTER) * ARRANGEMENTS.length; // each arrangement + trailing gutter

  // ---------- DOM build ----------
  const stage = document.getElementById('stage');
  const plane = document.getElementById('plane');
  const speciesEl = document.getElementById('species');
  const speciesName = speciesEl.querySelector('.line-name');
  const speciesLede = speciesEl.querySelector('.line-lede');
  const speciesVitals = speciesEl.querySelector('.line-vitals');
  const speciesFact = speciesEl.querySelector('.line-fact');
  const speciesMeta = speciesEl.querySelector('.meta');

  // We render a buffer of tiles around the visitor.
  // Horizontally: 3 strip-copies (left, center, right) -> 12 arrangements visible band.
  // Vertically: 3 rows (above, center, below).
  // The center "world" is large enough that we don't hit edges in normal use; we wrap on the GPU side via modulo translation.

  // Actually, simpler: we compute pan -> world coords with modulo on STRIP_W (horizontal) and (TILE_H + GUTTER) (vertical).
  // We then render a fixed 5x3 grid of arrangements positioned such that the center always covers the viewport.
  // The plane translates by -(pan modulo periodicity), and we add an offset of one period so wrap is invisible.

  // Buffer must cover the viewport at minimum zoom (0.4× default).
  // At z=0.4, world-space visible ≈ viewport / z, so up to ~5000×3000 px.
  // PERIOD_X = 4 × (1320+24) = 5376; PERIOD_Y = 784. So we need ~5 vertical
  // copies and 3 horizontal copies to comfortably tile any viewport at min zoom.
  const HSPAN = 3; // # of strip copies horizontally (arrangements * HSPAN tiles wide)
  const VSPAN = 5; // # of vertical copies

  // Build the tile buffer DOM.
  // We create ARRANGEMENTS.length * HSPAN tiles per row, VSPAN rows.
  // Tile at (col, row) shows ARRANGEMENTS[col % ARRANGEMENTS.length].
  const tiles = []; // {el, photos: [{el, slot, sp}]}
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
        pEl.className = 'photo is-entering';
        pEl.style.setProperty('--ph-band-a', sp.band_a);
        pEl.style.setProperty('--ph-band-b', sp.band_b);

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
          pEl.appendChild(img);
        }

        tileEl.appendChild(pEl);
        photos.push({ el: pEl, slot, sp });
      });

      plane.appendChild(tileEl);
      tiles.push({ el: tileEl, col, row, arrIndex: col % ARRANGEMENTS.length, photos, tx, ty });
    }
  }

  // Per-photo entrance fade (staggered subtly)
  let entered = 0;
  const allPhotos = tiles.flatMap(t => t.photos);
  // Only animate the first "ring" — the rest just inherit final state.
  allPhotos.forEach((p, i) => {
    const delay = 60 + (i % 32) * 14;
    setTimeout(() => {
      p.el.classList.remove('is-entering');
      p.el.classList.add('is-entered');
    }, delay);
  });

  // ---------- Pan state ----------
  // Pan position in "world" units: pan represents the world point at the viewport center.
  // The plane translation = -(pan - viewport/2 - offset) mod period.

  const PERIOD_X = (TILE_W + GUTTER) * ARRANGEMENTS.length;
  const PERIOD_Y = (TILE_H + GUTTER);

  // Initial pan: center of Arrangement A's lead
  const A = ARRANGEMENTS[0];
  const leadSlotA = A.slots.find(s => s.id === ARRANGEMENT_LEAD[0]);
  let panX_target = leadSlotA.x + leadSlotA.w / 2;
  let panY_target = leadSlotA.y + leadSlotA.h / 2;
  let panX = panX_target;
  let panY = panY_target;

  // Zoom state. Scale is applied around viewport center (zoom-to-center).
  let zoom = 1.6;
  let zoom_target = 1.6;

  // Magnetic dwell state. After `dwellDelay` ms of no user interaction
  // and settled velocity, the plane gently tugs toward the nearest photo
  // center. Tracked here:
  let lastInteractionAt = 0;

  function bumpInteraction() {
    lastInteractionAt = performance.now();
  }

  // Velocity for momentum after release
  let vx = 0, vy = 0;
  let dragging = false;
  let lastPointer = null;
  let lastMoveTime = 0;
  let inertiaActive = false;

  // ---------- Tweakables (live) ----------
  const TWEAKS = /*EDITMODE-BEGIN*/{
    "lerp": 0.02,
    "zoomLerp": 0.02,
    "zoomMin": 1.6,
    "zoomMax": 4.0,
    "dwellDelay": 400,
    "dwellPull": 0.0015,
    "ambientOpacity": 0.9,
    "ambientSaturate": 0,
    "ambientBrightness": 0.81,
    "focusFadeMs": 200,
    "blue": "#1635ee",
    "field": "#f2eee5"
  }/*EDITMODE-END*/;

  // ---------- Persist tweaks internally (localStorage) ----------
  const LS_KEY = 'kl-portfolio.tweaks.v4';
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved && typeof saved === 'object') Object.assign(TWEAKS, saved);
  } catch(_) {}
  function persistTweaks() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(TWEAKS)); } catch(_) {}
  }

  function applyTweaks() {
    document.documentElement.style.setProperty('--ambient-opacity', TWEAKS.ambientOpacity);
    document.documentElement.style.setProperty('--ambient-saturate', TWEAKS.ambientSaturate);
    document.documentElement.style.setProperty('--ambient-brightness', TWEAKS.ambientBrightness);
    document.documentElement.style.setProperty('--focus-fade', TWEAKS.focusFadeMs + 'ms');
    document.documentElement.style.setProperty('--blue', TWEAKS.blue);
    document.documentElement.style.setProperty('--field', TWEAKS.field);
  }
  applyTweaks();

  // ---------- Render loop ----------
  function viewport() {
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function render() {
    // Smooth toward target
    const lerp = TWEAKS.lerp;
    panX += (panX_target - panX) * lerp;
    panY += (panY_target - panY) * lerp;
    zoom += (zoom_target - zoom) * TWEAKS.zoomLerp;

    // Apply momentum if not dragging
    if (!dragging && (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05)) {
      panX_target += vx;
      panY_target += vy;
      vx *= 0.94;
      vy *= 0.94;
    } else if (!dragging) {
      vx = 0; vy = 0;
    }

    // ----- Magnetic dwell -----
    // After idle threshold + settled velocity, gently pull pan toward
    // the focused photo's center. The pull is small (TWEAKS.dwellPull)
    // so it feels like the plane is breathing, not snapping.
    const now = performance.now();
    const idleMs = now - lastInteractionAt;
    const settled = !dragging && Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1;
    if (settled && idleMs > TWEAKS.dwellDelay && currentFocusKey) {
      const fk = parseFocusKey(currentFocusKey);
      if (fk) {
        // Find the nearest copy of the focused photo's center to current pan_target.
        const arrOriginX = fk.arrIdx * (TILE_W + GUTTER);
        const cx0 = fk.slot.x + fk.slot.w / 2;
        const cy0 = fk.slot.y + fk.slot.h / 2;
        // Wrap pan_target into world coords:
        const px = panX_target;
        const py = panY_target;
        // Find closest copy by trying each periodicity offset:
        let bestDx = 0, bestDy = 0, bestD2 = Infinity;
        for (const ox of [arrOriginX, arrOriginX + PERIOD_X, arrOriginX - PERIOD_X,
                          arrOriginX + 2*PERIOD_X, arrOriginX - 2*PERIOD_X]) {
          for (const oy of [0, PERIOD_Y, -PERIOD_Y, 2*PERIOD_Y, -2*PERIOD_Y]) {
            // Account for buffer's modulo: pan is wrapped via wx/wy, so
            // we compare against arrangement origin in WORLD (unwrapped) space.
            // Simpler: we need the offset that minimizes distance from
            // px to (ox + cx0). The pan periodicity allows infinite copies.
            const targetX = ox + cx0;
            const targetY = oy + cy0;
            // Project px to nearest period:
            const wrappedTargetX = targetX +
              Math.round((px - targetX) / PERIOD_X) * PERIOD_X;
            const wrappedTargetY = targetY +
              Math.round((py - targetY) / PERIOD_Y) * PERIOD_Y;
            const dx = wrappedTargetX - px;
            const dy = wrappedTargetY - py;
            const d2 = dx*dx + dy*dy;
            if (d2 < bestD2) { bestD2 = d2; bestDx = dx; bestDy = dy; }
          }
        }
        // Pull. Use a soft easing so the pull weakens as we approach.
        // (multiplying by dwellPull each frame would slow asymptotically anyway,
        //  but cap the pull to avoid jitter when distance is large)
        const dist = Math.sqrt(bestD2);
        if (dist > 0.5) {
          // Soft envelope: start gently, fade out near zero
          panX_target += bestDx * TWEAKS.dwellPull;
          panY_target += bestDy * TWEAKS.dwellPull;
        }
      }
    }

    // Plane transform: translate so world point (panX,panY) lands at
    // viewport center, then scale around plane origin (which is fine
    // because we computed translation accordingly).
    //   screen = translate(tx,ty) * scale(z) * planeOrigin
    //   want world point P to land at viewport center:
    //     z*P + (tx,ty) = (vp.w/2, vp.h/2)
    //     (tx,ty) = (vp.w/2 - z*P.x, vp.h/2 - z*P.y)
    const vp = viewport();
    const wx = ((panX % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const wy = ((panY % PERIOD_Y) + PERIOD_Y) % PERIOD_Y;
    const middleCopyOriginX = ARRANGEMENTS.length * (TILE_W + GUTTER);
    const middleCopyOriginY = Math.floor(VSPAN / 2) * (TILE_H + GUTTER); // middle row of buffer
    const worldX = middleCopyOriginX + wx;
    const worldY = middleCopyOriginY + wy;
    const z = zoom;
    const tx = vp.w / 2 - z * worldX;
    const ty = vp.h / 2 - z * worldY;

    plane.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${z})`;

    // Focus tracking
    updateFocus(panX, panY);

    requestAnimationFrame(render);
  }

  // ---------- Focus tracking ----------
  let currentFocusKey = null;
  let focusedEls = new Set(); // dom elements currently marked focused
  let labelTimeout = null;

  function updateFocus(px, py) {
    // Map pan into the periodic world coordinates relative to the plane buffer.
    // We compute distance from `(px, py)` (the world point at viewport center)
    // to each photo's center, considering wrap.

    // Wrap pan to "primary" cell of the period:
    const wx = ((px % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const wy = ((py % PERIOD_Y) + PERIOD_Y) % PERIOD_Y;

    // For each arrangement, find candidate photos.
    // Each photo's center in world = arrangement origin (varies by which copy)
    // + slot center. We test the closest copy.
    let best = null;
    let bestDist = Infinity;

    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      // Candidates: this copy and adjacent (left/right wrap)
      const candidatesX = [arrOriginX, arrOriginX + PERIOD_X, arrOriginX - PERIOD_X];
      const candidatesY = [0, PERIOD_Y, -PERIOD_Y];
      for (const slot of arr.slots) {
        if (slot.brand) continue;  // brand cards aren't focus targets
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

    // Hysteresis: 5% of viewport diagonal
    const vp = viewport();
    const diag = Math.sqrt(vp.w*vp.w + vp.h*vp.h);
    const hys = diag * 0.05;

    if (newKey !== currentFocusKey) {
      // Only switch if best is meaningfully closer than the previous
      if (currentFocusKey === null) {
        commitFocus(newKey, best);
      } else {
        // find prev's distance
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

    // Update DOM: clear previous focused elements, mark all matching photos
    focusedEls.forEach(el => el.classList.remove('is-focused'));
    focusedEls.clear();

    // Mark every visible photo across all tiles that matches the (arrIdx, slotId)
    tiles.forEach(t => {
      if (t.arrIndex !== info.arrIdx) return;
      t.photos.forEach(p => {
        if (p.slot.id === info.slot.id) {
          p.el.classList.add('is-focused');
          focusedEls.add(p.el);
        }
      });
    });

    // Update label
    const sp = SPECIES.find(s => s.id === info.slot.id);
    // Non-breaking space inside the binomial keeps Genus species on one line.
    const latinHtml = escapeHtml(sp.latin).replace(/ /g, '&nbsp;');
    speciesName.innerHTML =
      `${escapeHtml(sp.vernacular)}<span class="latin">${latinHtml}</span>`;
    speciesMeta.textContent = `Photo ${sp.id} / 8 · Arrangement ${ARRANGEMENTS[info.arrIdx].name}`;

    // Fun-read content (visible only when the plate is bloomed)
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

    // Fade label in (it may already be visible — OK)
    speciesEl.classList.remove('is-visible');
    if (labelTimeout) clearTimeout(labelTimeout);
    labelTimeout = setTimeout(() => speciesEl.classList.add('is-visible'), 60);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---------- Pointer interaction ----------
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging = true;
    inertiaActive = false;
    vx = 0; vy = 0;
    lastPointer = { x: e.clientX, y: e.clientY };
    lastMoveTime = performance.now();
    bumpInteraction();
    stage.classList.add('is-dragging');
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    // Drag distance in screen px must translate to world-px / zoom
    panX_target -= dx / zoom_target;
    panY_target -= dy / zoom_target;
    // Track velocity (px per frame approximately)
    const dt = Math.max(8, now - lastMoveTime);
    vx = -dx * (16 / dt) / zoom_target;
    vy = -dy * (16 / dt) / zoom_target;
    lastPointer = { x: e.clientX, y: e.clientY };
    lastMoveTime = now;
    bumpInteraction();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
    bumpInteraction();
    // velocity continues until damped in render()
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // Wheel events:
  //   - ctrlKey true   → trackpad pinch (browsers map pinch to wheel+ctrl)
  //   - mouse wheel    → deltaMode 1 (lines) OR deltaMode 0 with large |deltaY| & deltaX==0
  //     → ZOOM (zoom-to-cursor: world point under cursor stays under cursor)
  //   - trackpad two-finger swipe (small deltas, no ctrl) → PAN
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    bumpInteraction();

    const isPinch = e.ctrlKey;  // trackpad pinch
    const isMouseWheel =
      e.deltaMode !== 0 ||
      (Math.abs(e.deltaY) >= 50 && Math.abs(e.deltaX) < 2);

    if (isPinch || isMouseWheel) {
      // Zoom-to-cursor. Pinch dy is small (~5–20); mouse wheel dy is bigger (~100).
      // Normalize so both feel similar.
      const norm = isPinch ? e.deltaY * 0.012 : e.deltaY * 0.0022;
      // dy positive = scroll down = zoom OUT (matches macOS pinch convention)
      const factor = Math.exp(-norm);
      const newZoom = Math.min(
        TWEAKS.zoomMax,
        Math.max(TWEAKS.zoomMin, zoom_target * factor)
      );
      const actualFactor = newZoom / zoom_target;

      // Cursor position in viewport (screen) coords
      const vp = viewport();
      const cx = e.clientX;
      const cy = e.clientY;

      // Math:
      //   screen = z * world + tx,  tx = vp.w/2 - z * worldCenter
      //   so screen = z * (world - worldCenter) + vp.w/2
      //   => world - worldCenter = (screen - vp.w/2) / z
      // The world point under cursor BEFORE zoom = panX_target + (cx - vp.w/2) / zoom_target
      // After zoom we want THAT world point to still be under cursor:
      //   newWorldCenter + (cx - vp.w/2)/newZoom = oldWorldCenter + (cx - vp.w/2)/oldZoom
      //   => panX_target_new = panX_target + (cx - vp.w/2) * (1/oldZoom - 1/newZoom)
      const oldZ = zoom_target;
      panX_target += (cx - vp.w / 2) * (1 / oldZ - 1 / newZoom);
      panY_target += (cy - vp.h / 2) * (1 / oldZ - 1 / newZoom);

      zoom_target = newZoom;
    } else {
      // Trackpad pan
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
    // Build list of all photo centers within a generous neighborhood of pan
    const wx = ((panX_target % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const wy = ((panY_target % PERIOD_Y) + PERIOD_Y) % PERIOD_Y;
    let best = null;
    let bestScore = Infinity;
    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      for (const slot of arr.slots) {
        if (slot.brand) continue;  // arrow nav skips brand cards
        for (const ox of [arrOriginX, arrOriginX + PERIOD_X, arrOriginX - PERIOD_X]) {
          for (const oy of [0, PERIOD_Y, -PERIOD_Y]) {
            const cx = ox + slot.x + slot.w/2;
            const cy = oy + slot.y + slot.h/2;
            const dx = cx - wx;
            const dy = cy - wy;
            // direction filter
            if (dir === 'ArrowLeft'  && dx > -20) continue;
            if (dir === 'ArrowRight' && dx <  20) continue;
            if (dir === 'ArrowUp'    && dy > -20) continue;
            if (dir === 'ArrowDown'  && dy <  20) continue;
            // score: dominant axis distance + small penalty for cross-axis
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

  // ---------- Tweaks panel toggle ----------
  const tweaksPanel = document.getElementById('tweaks');
  let tweaksOpen = false;

  function setTweaksOpen(v) {
    tweaksOpen = v;
    tweaksPanel.classList.toggle('is-open', v);
    if (!v) {
      try { window.parent.postMessage({type: '__edit_mode_dismissed'}, '*'); } catch(_) {}
    }
  }

  // Listen for host messages first, THEN announce availability.
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') setTweaksOpen(true);
    if (d.type === '__deactivate_edit_mode') setTweaksOpen(false);
  });
  try { window.parent.postMessage({type: '__edit_mode_available'}, '*'); } catch(_) {}

  // Wire tweak controls
  function bindRange(id, key, fmt) {
    const input = document.getElementById(id);
    const v = input.parentElement.querySelector('.v');
    input.value = TWEAKS[key];
    v.textContent = fmt ? fmt(TWEAKS[key]) : TWEAKS[key];
    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      TWEAKS[key] = val;
      v.textContent = fmt ? fmt(val) : val;
      applyTweaks();
      persistTweaks();
      try { window.parent.postMessage({type:'__edit_mode_set_keys', edits: { [key]: val }}, '*'); } catch(_) {}
    });
  }
  function bindColor(id, key) {
    const input = document.getElementById(id);
    input.value = TWEAKS[key];
    input.addEventListener('input', () => {
      TWEAKS[key] = input.value;
      applyTweaks();
      persistTweaks();
      try { window.parent.postMessage({type:'__edit_mode_set_keys', edits: { [key]: input.value }}, '*'); } catch(_) {}
    });
  }
  bindRange('tw-lerp',     'lerp',           v => v.toFixed(2));
  bindRange('tw-zlerp',    'zoomLerp',       v => v.toFixed(2));
  bindRange('tw-zmin',     'zoomMin',        v => v.toFixed(2) + '×');
  bindRange('tw-zmax',     'zoomMax',        v => v.toFixed(2) + '×');
  bindRange('tw-dwell',    'dwellDelay',     v => v + 'ms');
  bindRange('tw-pull',     'dwellPull',      v => v.toFixed(4));
  bindRange('tw-amb',      'ambientOpacity', v => v.toFixed(2));
  bindRange('tw-sat',      'ambientSaturate',v => v.toFixed(2));
  bindRange('tw-bri',      'ambientBrightness', v => v.toFixed(2));
  bindRange('tw-fade',     'focusFadeMs',    v => v + 'ms');
  bindColor('tw-blue',     'blue');
  bindColor('tw-field',    'field');

  document.getElementById('tweaks-close').addEventListener('click', () => setTweaksOpen(false));

  // Compass updates — show current arrangement letter
  const compassArr = document.getElementById('compass-arr');
  let lastArr = -1;
  function updateCompass() {
    const wx = ((panX % PERIOD_X) + PERIOD_X) % PERIOD_X;
    const arrIdx = Math.floor(wx / (TILE_W + GUTTER)) % ARRANGEMENTS.length;
    if (arrIdx !== lastArr) {
      lastArr = arrIdx;
      compassArr.textContent = ARRANGEMENTS[arrIdx].name;
    }
    requestAnimationFrame(updateCompass);
  }
  updateCompass();

  // ---------- Species label: bloom interaction ----------
  // Click the small-caps mark to expand into the full cream plate.
  // Click outside (or press Escape) to collapse. The hover affordance
  // (logo glyph appearing left of the name) is pure CSS. After
  // DWELL_CUE_MS of stillness, the resting label gets a gentle opacity
  // breath via .is-dwell to invite a click.
  const DWELL_CUE_MS = 1800;

  function setBloomed(b) {
    speciesEl.classList.toggle('is-blooming', b);
    if (b) speciesEl.classList.remove('is-dwell');
  }

  speciesEl.addEventListener('click', (e) => {
    // Only the visible text (.line-name) toggles bloom — empty plate area is inert.
    if (!e.target.closest('.line-name')) return;
    e.stopPropagation();
    setBloomed(!speciesEl.classList.contains('is-blooming'));
    bumpInteraction();
  });

  document.addEventListener('click', (e) => {
    if (!speciesEl.contains(e.target) && speciesEl.classList.contains('is-blooming')) {
      setBloomed(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && speciesEl.classList.contains('is-blooming')) {
      setBloomed(false);
      e.stopPropagation();
    }
  });

  function updateDwellCue() {
    const idle = performance.now() - lastInteractionAt;
    const settled = !dragging && Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1;
    const blooming = speciesEl.classList.contains('is-blooming');
    const shouldShow = settled && idle > DWELL_CUE_MS && !blooming;
    speciesEl.classList.toggle('is-dwell', shouldShow);
    requestAnimationFrame(updateDwellCue);
  }
  updateDwellCue();

  // Kick off
  requestAnimationFrame(render);

  // First focus settle (after a tick so DOM is laid out)
  setTimeout(() => {
    updateFocus(panX, panY);
  }, 240);

})();
