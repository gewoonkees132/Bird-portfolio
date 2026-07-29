/* ============================================================
   Photography Portfolio — Kees Leemeijer
   Vanilla JS · pan plane · focus tracking · caption label
   ============================================================ */

(function () {
  'use strict';

  // ---------- Species data (16 photos) ----------
  // Shapes: L landscape (1,3,5,7,9,10,11,12,14,15) · V portrait 2:3
  //   (2,6,13,16) · W super-wide letterbox (4,8). Repeats are intentional —
  //   Baya Weaver appears twice (2 nest / 6 display) and the Raw-todo batch
  //   adds Blue Tit, Great Tit and Robin tiles. The shape decides which slots a
  //   photo can occupy; tools/gen-arrangements.js reads the same mapping when it
  //   builds ARRANGEMENTS, so the two must agree — tools/check-species.js
  //   asserts it, along with the copies in index.html and the native manifest.
  //   Note the L files are currently 16:9 (2160x1215), not 3:2 — they were
  //   cropped that way by tools/convert-raw.py. Slots now target 3:2, so an L
  //   photo loses a sliver of its sides to object-fit: cover until the batch is
  //   re-exported at 3:2 from the originals.
  const F = (n) => 'files/' + encodeURI(n);
  const SPECIES = [
    { id: 1, vernacular: 'European Robin',        latin: 'Erithacus rubecula',     shape: 'L',
      band_a: '#3d6b8a', band_b: '#4a7c9a',
      image: F('P1-European_Robin.webp') },
    { id: 2, vernacular: 'Baya Weaver',           latin: 'Ploceus philippinus',    shape: 'V',
      band_a: '#c79e6e', band_b: '#b88c5e',
      image: F('P2-Baya_Weaver.webp') },
    { id: 3, vernacular: 'Eurasian Jay',          latin: 'Garrulus glandarius',    shape: 'L',
      band_a: '#7a8b76', band_b: '#8a9c86',
      image: F('P3-Eurasian_Jay.webp') },
    { id: 4, vernacular: 'Dunnock',               latin: 'Prunella modularis',     shape: 'W',
      band_a: '#3a4a3e', band_b: '#48584c',
      image: F('P4-Dunnock.webp') },
    { id: 5, vernacular: 'Asian Green Bee-eater', latin: 'Merops orientalis',      shape: 'L',
      band_a: '#a87a3e', band_b: '#b8893f',
      image: F('P5-Green_Bee-eater.webp') },
    { id: 6, vernacular: 'Baya Weaver',           latin: 'Ploceus philippinus',    shape: 'V',
      band_a: '#8b7848', band_b: '#9a8758',
      image: F('P6-Baya_Weaver_display.webp') },
    { id: 7, vernacular: 'Eurasian Blue Tit',     latin: 'Cyanistes caeruleus',    shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P7-Eurasian_Blue_Tit.webp') },
    { id: 8, vernacular: 'Jerdon’s Bushlark',     latin: 'Plocealauda affinis',    shape: 'W',
      band_a: '#cdc4b0', band_b: '#bdb4a0',
      image: F('P8-Jerdons_Bushlark.webp') },
    // Raw-todo batch (2026-06-13). The batch arrived filed as Great Tit and
    // Robin; a 2026-07-28 identification pass found 7, 9 and 13 are Blue Tits.
    // Band colours are sampled per photo, so they stayed put through the
    // relabel. Facts shared per species below. id 7's image was replaced in the
    // same batch (entry unchanged).
    { id: 9,  vernacular: 'Eurasian Blue Tit',    latin: 'Cyanistes caeruleus',    shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P9-Eurasian_Blue_Tit.webp') },
    { id: 10, vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P10-Great_Tit.webp') },
    { id: 11, vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P11-Great_Tit.webp') },
    { id: 12, vernacular: 'Great Tit',            latin: 'Parus major',            shape: 'L',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P12-Great_Tit.webp') },
    { id: 13, vernacular: 'Eurasian Blue Tit',    latin: 'Cyanistes caeruleus',    shape: 'V',
      band_a: '#6e5444', band_b: '#7e6454',
      image: F('P13-Eurasian_Blue_Tit.webp') },
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
  //   2 Weaver nest — Davis (1973, JBNHS) and Pandian (2022, J Threat Taxa
  //                   14(5): 20970) mud plastering, 90% of helmet-stage nests.
  //   3 Jay         — Parnell et al. (2015, Sci Reports) structural-blue feathers.
  //   4 Dunnock     — Davies, ~600-year cuckoo-host evolutionary lag.
  //   5 Bee-eater   — Watve et al. (2002, Anim Cognition) gaze-sensitivity.
  //   6 Weaver dsp  — Quader (2006, The Auk 123: 475) nest site beats structure.
  //   7 Blue Tit    — Petit et al. (2002, Ecology Letters 5: 585) aromatic herbs.
  //   8 Bushlark    — Alström (1998, Forktail 13: 97) four-way species split.
  //  10 Great Tit   — Estók, Zsebok & Siemers (2010, Biol Letters) bat predation.
  // Keyed by SPECIES.id. Bespoke prose for ids 1–8 and 10; the remaining
  // Raw-todo tiles share per-species prose via the alias assignments after the
  // literal (Blue Tit 9, 13 → 7, Great Tit 11, 12 → 10, Robin 14–16 → 1). The
  // two Baya Weaver entries stay distinct (2 nest-building / 6 display).
  // A species with no published wingspan carries `length` instead, and the
  // vitals row relabels itself — see vitalRows().
  const BIRD_FACTS = {
    1: {
      wingspan: '20–22 cm', weight: '16–22 g',
      range: 'Europe, N Africa', habitat: 'Woodland, gardens',
      lede: 'The European Robin holds its patch of garden all year, and will sing through winter nights under a streetlight. The orange breast is a flag. Show it to a rival and he reads a threat, not a bird.',
      fun_fact: 'In a famous test, a wild robin attacked a small bundle of red feathers with no head and no body. In some places, fights between robins cause about one in ten adult deaths.'
    },
    2: {
      length: '15 cm', weight: '18–27 g',
      range: 'S & SE Asia', habitat: 'Grassland, farmland',
      lede: 'The male Baya Weaver weaves the nest alone, tearing long strips from grass and palm leaves and knotting them into a hanging flask. He works at one nest for over two weeks, flying hundreds of trips to a single branch. The bright yellow crown appears only for the breeding season.',
      fun_fact: 'Male Bayas plaster wet mud and dung onto the inside walls of the unfinished nest. It is not decoration. In one survey of Tamil Nadu colonies, nine in ten half-built nests carried clay on the inner wall, and the weight is thought to steady the nest in wind.'
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
      lede: 'The Asian Green Bee-eater is a small jewel of dry, open country, bright green with a long pair of tail streamers. It hunts from a bare twig, darts out to grab a bee in the air, and carries it back to the same perch to deal with it.',
      fun_fact: 'The bird seems to track what a watcher can see. In one test, it slipped into its nest tunnel far more often when the human nearby was looking the other way, as if it knew which eyes were a problem.'
    },
    6: {
      length: '15 cm', weight: '18–27 g',
      range: 'S & SE Asia', habitat: 'Grassland, farmland',
      lede: 'A male stops building at the half-made stage and hangs beneath the shell to advertise it. He throws his wings open, quivers them, and sings a fast rattle that runs into a long wheeze. Females come to inspect, and only when one accepts does he finish the entrance tube.',
      fun_fact: 'A male may build several nests in a season and pair with more than one female. In a study of Indian colonies, where he put the nest predicted his success slightly better than how well he had woven it. Address beat architecture.'
    },
    7: {
      wingspan: '17–20 cm', weight: '9–13 g',
      range: 'Europe, W Asia', habitat: 'Woodland, gardens',
      lede: 'The Eurasian Blue Tit is a small, restless bird with a sky-blue cap, white cheeks and a dark line through the eye. The belly is yellow. It feeds hanging upside down from a twig or a peanut feeder, hardly ever sitting still, and it nests happily in a garden box.',
      fun_fact: 'Female blue tits on Corsica line the nest with scraps of lavender, mint and other strong-smelling herbs, and add fresh pieces almost every day. When researchers stripped the plants out, the females put them back. They were working by smell, in a bird long thought to have almost none.'
    },
    8: {
      length: '14–15 cm', weight: '25–26 g',
      range: 'S India, Sri Lanka', habitat: 'Scrub, fallow fields',
      lede: 'Jerdon’s Bushlark is a stocky brown lark of dry, open ground in southern India and Sri Lanka. It has a heavy, blunt bill and a patch of warm rust in the wing. The male climbs a few metres into the air, then floats back down with his wings held in a shallow V, legs dangling, singing all the way.',
      fun_fact: 'For most of the twentieth century these bushlarks were filed as one species. In 1998 Per Alström showed there were four, separated less by their feathers than by their songs and their display flights. A silent bird in a photograph can still be hard to name.'
    },
    10: {
      wingspan: '22–26 cm', weight: '14–22 g',
      range: 'Europe, Asia, N Africa', habitat: 'Woodland, gardens',
      lede: 'The Great Tit is the loud yellow bird at the garden feeder, with a black cap and a black stripe down its belly. It is bold and clever, and will pull the lid off a milk bottle or work out a puzzle box in a few tries.',
      fun_fact: 'In a Hungarian cave one winter, great tits were filmed flying in to find sleeping bats. They pecked them on the head, killed them, and ate them. Eighteen times in two winters. The bird-table cutie hunts mammals.'
    }
  };

  // Repeated Raw-todo species reuse the existing per-species prose (shared
  // object reference — facts are read-only). Blue Tit ids point at the Blue Tit
  // entry (7), the remaining Great Tit ids at the Great Tit entry (10), and all
  // Robin ids at the Robin entry (1).
  BIRD_FACTS[9] = BIRD_FACTS[13] = BIRD_FACTS[7];
  BIRD_FACTS[11] = BIRD_FACTS[12] = BIRD_FACTS[10];
  BIRD_FACTS[14] = BIRD_FACTS[15] = BIRD_FACTS[16] = BIRD_FACTS[1];

  // ============================================================
  // Events (23 photos) and Products (14 photos)
  // ------------------------------------------------------------
  // Two further collections, added 2026-07-29 from the batches the photographer
  // dropped into public/files/ as Thirdset_Events and Secondset_Product. They
  // carry the SAME record shape as SPECIES so one render engine serves all three:
  //
  //   vernacular  the title on the resting label and the bloom heading
  //   latin       the italic blue subtitle under it (a date or a material here,
  //               not a binomial — the field name is kept so the shared label
  //               code, the mobile bloom and the checks stay one path)
  //   shape       L landscape 3:2 · V portrait 2:3 · W letterbox (birds only)
  //   band_a/b    the pre-decode placeholder stripes, sampled from each file
  //
  // The facts objects differ in ONE way: birds carry the wingspan/weight/range/
  // habitat fields the vitals row was written around, while these two carry an
  // explicit `vitals` array of [label, value] pairs. vitalRows() below takes
  // either.
  //
  // -- On the captions -------------------------------------------------------
  // Every lede and fun fact below is written from what the files themselves
  // record: the file names, the frame counts, the EXIF where it survived the
  // export. Nothing describes what is actually IN the photograph, because the
  // repo's token rules forbid opening the imagery (see CLAUDE.md), and a
  // plausible invention is worse than a visible gap. The two series named
  // "Untitled" arrived with no name, date or camera data at all, and their
  // subtitle says so. Replace these with real captions when you have them —
  // the structure does not care what the prose says.
  // ============================================================

  // Repeat frames of one series share a facts object, exactly as repeat photos
  // of one bird species do, so the plate never states two different dates for
  // the same shoot. The aliases follow each literal.
  const EVENTS = [
    // Bouwen met Aarde — 24-25 June 2026. EXIF stripped by the export; the file
    // names keep the dates and the 91/92 sequence.
    { id: 1, vernacular: 'Bouwen met Aarde',  latin: '24–25 June 2026',        shape: 'L',
      band_a: '#885838', band_b: '#784d31',
      image: F('events/E1-Bouwen_met_Aarde.webp') },
    { id: 2, vernacular: 'Bouwen met Aarde',  latin: '24–25 June 2026',        shape: 'L',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E2-Bouwen_met_Aarde.webp') },
    { id: 3, vernacular: 'Bouwen met Aarde',  latin: '24–25 June 2026',        shape: 'L',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E3-Bouwen_met_Aarde.webp') },
    { id: 4, vernacular: 'Bouwen met Aarde',  latin: '24–25 June 2026',        shape: 'V',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E4-Bouwen_met_Aarde.webp') },
    { id: 5, vernacular: 'Bouwen met Aarde',  latin: '24–25 June 2026',        shape: 'L',
      band_a: '#180808', band_b: '#150707',
      image: F('events/E5-Bouwen_met_Aarde.webp') },
    { id: 6, vernacular: 'Bouwen met Aarde',  latin: '24–25 June 2026',        shape: 'V',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E6-Bouwen_met_Aarde.webp') },
    { id: 7, vernacular: 'Bouwen met Aarde',  latin: '24–25 June 2026',        shape: 'L',
      band_a: '#180808', band_b: '#150707',
      image: F('events/E7-Bouwen_met_Aarde.webp') },
    // Addidex 2026 — 30 June / 1 July, Sony a7R V, one 50 mm for both days.
    { id: 8, vernacular: 'Addidex 2026',      latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#e8e8f8', band_b: '#ccccda',
      image: F('events/E8-Addidex_2026.webp') },
    { id: 9, vernacular: 'Addidex 2026',      latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E9-Addidex_2026.webp') },
    { id: 10, vernacular: 'Addidex 2026',     latin: '30 June – 1 July 2026',  shape: 'V',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E10-Addidex_2026.webp') },
    { id: 11, vernacular: 'Addidex 2026',     latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E11-Addidex_2026.webp') },
    { id: 12, vernacular: 'Addidex 2026',     latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E12-Addidex_2026.webp') },
    { id: 13, vernacular: 'Addidex 2026',     latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#281818', band_b: '#231515',
      image: F('events/E13-Addidex_2026.webp') },
    { id: 14, vernacular: 'Addidex 2026',     latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E14-Addidex_2026.webp') },
    { id: 15, vernacular: 'Addidex 2026',     latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E15-Addidex_2026.webp') },
    { id: 16, vernacular: 'Addidex 2026',     latin: '30 June – 1 July 2026',  shape: 'L',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E16-Addidex_2026.webp') },
    // The wedding in Italy — seven frames that arrived as bare UUIDs with every
    // field stripped. The photographer named the occasion on 2026-07-29; the
    // files still carry no date, which is why the subtitle says so.
    { id: 17, vernacular: 'Italian Wedding',  latin: 'Italy · undated',        shape: 'L',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E17-Italian_Wedding.webp') },
    { id: 18, vernacular: 'Italian Wedding',  latin: 'Italy · undated',        shape: 'L',
      band_a: '#e8e8f8', band_b: '#ccccda',
      image: F('events/E18-Italian_Wedding.webp') },
    { id: 19, vernacular: 'Italian Wedding',  latin: 'Italy · undated',        shape: 'L',
      band_a: '#283828', band_b: '#233123',
      image: F('events/E19-Italian_Wedding.webp') },
    { id: 20, vernacular: 'Italian Wedding',  latin: 'Italy · undated',        shape: 'V',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E20-Italian_Wedding.webp') },
    { id: 21, vernacular: 'Italian Wedding',  latin: 'Italy · undated',        shape: 'V',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E21-Italian_Wedding.webp') },
    { id: 22, vernacular: 'Italian Wedding',  latin: 'Italy · undated',        shape: 'V',
      band_a: '#181818', band_b: '#151515',
      image: F('events/E22-Italian_Wedding.webp') },
    { id: 23, vernacular: 'Italian Wedding',  latin: 'Italy · undated',        shape: 'V',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('events/E23-Italian_Wedding.webp') },
  ];

  // One voice across events and products, so a visitor moving between the two
  // never feels the register change:
  //   vitals   the same four labels in the same order — Frames / Shot / Format
  //            / Camera — with 'Not recorded' where the export stripped it
  //   lede     what the shoot was and when, subject first
  //   fun_fact one concrete thing worth knowing: taken from the shoot itself
  //            where the files record one, and from the subject where they do not
  // What the files happen to be — pixel sizes, UUID names, dropped EXIF blocks —
  // is archive bookkeeping and stays out of the prose. It reads as an apology
  // for the photograph rather than a caption for it.
  const EVENT_FACTS = {
    1: {
      vitals: [['Frames', '7'], ['Shot', '24–25 Jun 2026'],
               ['Format', '3:2 · 2:3'], ['Camera', 'Not recorded']],
      lede: 'Bouwen met Aarde — building with earth — over two days, the 24th and 25th of June 2026. Seven frames from the two days are held here, five landscape and two upright, taken while the work was going on rather than after it.',
      fun_fact: 'Earth is the oldest building material still in daily use, and by most estimates around a third of the world still lives in a house made of it. A wall built this way can be taken down, wetted, and mixed straight into the next one.'
    },
    8: {
      vitals: [['Frames', '9'], ['Shot', '30 Jun – 1 Jul 2026'],
               ['Format', '3:2 · 2:3'], ['Camera', 'Sony α7R V · 50 mm']],
      lede: 'Two days on the floor at Addidex 2026, the 30th of June and the 1st of July, working a single 50 mm lens. Nine frames are held here; the timestamps run from a quarter past nine in the morning to twenty to five in the afternoon.',
      fun_fact: 'Every one of them sits between f/2 and f/2.2 on a lens that opens to f/1.2. The aperture was set two thirds of a stop down on the first morning and left there for two days — one decision made once, instead of again at every stand.'
    },
    17: {
      vitals: [['Frames', '7'], ['Shot', 'Not recorded'],
               ['Format', '3:2 · 2:3'], ['Camera', 'Not recorded']],
      lede: 'A wedding in Italy. Seven frames, three landscape and four upright, held in the order they arrived. No date and no camera came with them, so what is known about the day is what is in the pictures.',
      fun_fact: 'In Italy the confetti are not paper. They are sugared almonds, handed to each guest in odd numbers — five of them, for health, wealth, happiness, fertility and long life. The paper kind thrown at the couple is coriandoli.'
    }
  };
  EVENT_FACTS[2] = EVENT_FACTS[3] = EVENT_FACTS[4] = EVENT_FACTS[1];
  EVENT_FACTS[5] = EVENT_FACTS[6] = EVENT_FACTS[7] = EVENT_FACTS[1];
  EVENT_FACTS[9] = EVENT_FACTS[10] = EVENT_FACTS[11] = EVENT_FACTS[12] = EVENT_FACTS[8];
  EVENT_FACTS[13] = EVENT_FACTS[14] = EVENT_FACTS[15] = EVENT_FACTS[16] = EVENT_FACTS[8];
  EVENT_FACTS[18] = EVENT_FACTS[19] = EVENT_FACTS[20] = EVENT_FACTS[17];
  EVENT_FACTS[21] = EVENT_FACTS[22] = EVENT_FACTS[23] = EVENT_FACTS[17];

  const PRODUCTS = [
    // Sika 2K column production — 26 June 2024, a7 III, 85 mm f/1.4 throughout.
    { id: 1, vernacular: 'Sika 2K Column',    latin: 'Two-component mortar · 2024', shape: 'L',
      band_a: '#483838', band_b: '#3f3131',
      image: F('products/R1-Sika_2K_Column.webp') },
    { id: 2, vernacular: 'Sika 2K Column',    latin: 'Two-component mortar · 2024', shape: 'V',
      band_a: '#181818', band_b: '#151515',
      image: F('products/R2-Sika_2K_Column.webp') },
    { id: 3, vernacular: 'Sika 2K Column',    latin: 'Two-component mortar · 2024', shape: 'V',
      band_a: '#888878', band_b: '#78786a',
      image: F('products/R3-Sika_2K_Column.webp') },
    { id: 4, vernacular: 'Colour Printing',   latin: 'Reference sheet',             shape: 'L',
      band_a: '#181818', band_b: '#151515',
      image: F('products/R4-Colour_Printing.webp') },
    { id: 5, vernacular: 'Addidex Showpiece', latin: 'Stand piece · Addidex 2026',  shape: 'L',
      band_a: '#281818', band_b: '#231515',
      image: F('products/R5-Addidex_Showpiece.webp') },
    { id: 6, vernacular: 'Addidex Showpiece', latin: 'Stand piece · Addidex 2026',  shape: 'V',
      band_a: '#180808', band_b: '#150707',
      image: F('products/R6-Addidex_Showpiece.webp') },
    { id: 7, vernacular: 'Studio Piece',      latin: 'Studio frame · 2021',         shape: 'L',
      band_a: '#583838', band_b: '#4d3131',
      image: F('products/R7-Studio_Piece.webp') },
    // Seven frames that arrived numbered 1, 3, 4, 5, 10, 14, 15 and nothing
    // else. The photographer confirmed on 2026-07-29 that the pieces are
    // designed and printed, which is what they are named for until the
    // individual captions exist.
    { id: 8, vernacular: 'Printed Piece',     latin: 'Designed and printed',        shape: 'L',
      band_a: '#281818', band_b: '#231515',
      image: F('products/R8-Printed_Piece.webp') },
    { id: 9, vernacular: 'Printed Piece',     latin: 'Designed and printed',        shape: 'L',
      band_a: '#281818', band_b: '#231515',
      image: F('products/R9-Printed_Piece.webp') },
    { id: 10, vernacular: 'Printed Piece',    latin: 'Designed and printed',        shape: 'L',
      band_a: '#f8f8f8', band_b: '#dadada',
      image: F('products/R10-Printed_Piece.webp') },
    { id: 11, vernacular: 'Printed Piece',    latin: 'Designed and printed',        shape: 'L',
      band_a: '#181818', band_b: '#151515',
      image: F('products/R11-Printed_Piece.webp') },
    { id: 12, vernacular: 'Printed Piece',    latin: 'Designed and printed',        shape: 'L',
      band_a: '#483838', band_b: '#3f3131',
      image: F('products/R12-Printed_Piece.webp') },
    { id: 13, vernacular: 'Printed Piece',    latin: 'Designed and printed',        shape: 'V',
      band_a: '#483838', band_b: '#3f3131',
      image: F('products/R13-Printed_Piece.webp') },
    { id: 14, vernacular: 'Printed Piece',    latin: 'Designed and printed',        shape: 'V',
      band_a: '#585858', band_b: '#4d4d4d',
      image: F('products/R14-Printed_Piece.webp') },
  ];

  // Same four labels, same order, same voice as EVENT_FACTS above — see the
  // note there. A product lede says what the piece is and when it was
  // photographed; the fun fact takes one thing further, either from the shoot
  // or from how the piece was made.
  const PRODUCT_FACTS = {
    1: {
      vitals: [['Frames', '3'], ['Shot', '26 Jun 2024'],
               ['Format', '3:2 · 2:3'], ['Camera', 'Sony α7 III · 85 mm']],
      lede: 'A column in Sika’s two-component mortar, photographed on the afternoon of 26 June 2024 while the run was still going. Thirty-nine frames were shot that day; three are held here, taken either side of half past two.',
      fun_fact: 'Two-component means the mortar meets its accelerator at the nozzle, a second or two before it is laid down — loose enough to pump along the hose, stiff enough to carry the next layer as soon as it arrives.'
    },
    4: {
      vitals: [['Frames', '1'], ['Shot', 'Not recorded'],
               ['Format', '3:2 landscape'], ['Camera', 'Not recorded']],
      lede: 'A single frame of a colour reference sheet: printed colour kept as a physical thing, because a printed surface is the only place it can honestly be judged. The sheet is filed as reference number five — the other four are not in this batch.',
      fun_fact: 'Colour on a screen is light added together. Colour on a printed surface is what is left over once the pigment has taken the rest away. The two ranges overlap but never meet, which is why the sheet exists at all.'
    },
    5: {
      vitals: [['Frames', '2'], ['Shot', '30 Jun – 1 Jul 2026'],
               ['Format', '3:2 · 2:3'], ['Camera', 'Sony α7R V · 50 mm']],
      lede: 'A piece made for the Addidex 2026 stand, photographed on two days running with the same 50 mm — once on the Tuesday afternoon at f/2.2, once late on the Wednesday, wide open at f/1.2.',
      fun_fact: 'The Wednesday frame is 1/4000 of a second at f/1.2 and ISO 125: bright daylight through a very fast lens, with almost nothing behind the piece left in focus. On a trade floor, that is one way to take the hall out of the photograph.'
    },
    7: {
      vitals: [['Frames', '1'], ['Shot', '14 May 2021'],
               ['Format', '3:2 landscape'], ['Camera', 'Sony α7 · 85 mm']],
      lede: 'A single piece, photographed where it was made on 14 May 2021 — the oldest frame in the portfolio outside the birds, taken on the original α7 body with an 85 mm wide open.',
      fun_fact: 'ISO 500 at f/1.4 and 1/160 of a second puts this indoors under mixed light: a working room with whatever was already switched on, rather than a lit set.'
    },
    8: {
      vitals: [['Frames', '7'], ['Shot', 'Not recorded'],
               ['Format', '3:2 · 2:3'], ['Camera', 'Not recorded']],
      lede: 'Seven frames of pieces that were designed first and printed second — five landscape, two upright, held in the order they arrived. No names, dates or camera data came with them, so the work stands on its own until each one is captioned.',
      fun_fact: 'What they have in common is the order of things: the drawing exists before the object does, and the object is made straight from the drawing, at the size it will be used.'
    }
  };
  PRODUCT_FACTS[2] = PRODUCT_FACTS[3] = PRODUCT_FACTS[1];
  PRODUCT_FACTS[6] = PRODUCT_FACTS[5];
  PRODUCT_FACTS[9] = PRODUCT_FACTS[10] = PRODUCT_FACTS[11] = PRODUCT_FACTS[8];
  PRODUCT_FACTS[12] = PRODUCT_FACTS[13] = PRODUCT_FACTS[14] = PRODUCT_FACTS[8];

  // Wingspan is the first vitals row for every European species here, but no
  // wingspan has ever been published for Baya Weaver or for any Asian bushlark
  // — the literature records body length and wing chord only. Those entries
  // carry `length`, and the row relabels rather than printing a number the
  // sources do not support.
  // Events and products carry an explicit `vitals` array instead — four rows
  // whose LABELS differ per collection, so there is nothing for a fixed row
  // order to key off. Birds keep the named fields the native manifest and
  // tools/check-species.js are written around.
  const vitalRows = (f) => f.vitals || [
    f.length ? ['Length', f.length] : ['Wingspan', f.wingspan],
    ['Weight',  f.weight],
    ['Range',   f.range],
    ['Habitat', f.habitat],
  ];

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

      const vitalsHtml = vitalRows(f).map(([k, v]) =>
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
  // Tile: 1320 x 872. 12×8 cell grid, module 88, gutter 24, no outer margin.
  // GENERATED — do not hand-edit. Regenerate with:
  //     node tools/gen-arrangements.js --collection=birds|events|products
  //
  // One table per collection. All three are 8 arrangements long, and the render
  // engine leans on that: PERIOD_X, the tile grid and the shear are all sized
  // from ARRANGEMENTS.length once, at boot, and switching collections only swaps
  // the table. tools/check-arrangements.js enforces the count.
  //
  // Every slot span is drawn from a palette that lands near 3:2 on this
  // lattice. With a square module and one uniform gutter no span is EXACTLY
  // 3:2 (it would need gutter/pitch to be an integer), but the (3n,2n) family
  // converges on it: 3×2 is +4.0%, 6×4 +1.9%, 9×6 +1.2%. Portrait mirrors it
  // with (2n,3n): 2×3 −3.8%, 4×6 −1.9%. 3×4 (+10.4%) is the one compromise —
  // its height of 4 divides an 8-row tile, and without it the tiling space
  // collapses from 768 usable layouts to 24. 6×2 is the deliberate letterbox
  // for the two panoramic photos (P4 3.00, P8 3.80) and is exempt.
  //
  // The 8-row tile is what makes this work: the old 12×7 tile admits exactly
  // ONE layout from this palette, because 7 rows cannot carry a 2-row rhythm.
  //
  // Each arrangement is an exact tiling of all 96 cells — 6 to 8 photo slots,
  // every one a bird. There is no brand card on the plane; site identity is the
  // fixed .identity corner element in index.html. Slot ids are unique within an
  // arrangement (focus tracking looks slots up by id) and no species appears
  // more than twice in one tile. Across the eight, each photo appears 2–5 times.
  const ARR_BIRDS = [
    {
      name: 'A',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id:  5 },
        { c: 3, r:0, cw: 3, ch:2, id:  3 },
        { c: 6, r:0, cw: 6, ch:4, id:  9 },
        { c: 0, r:2, cw: 2, ch:3, id:  6 },  // V
        { c: 2, r:2, cw: 4, ch:6, id: 13 },  // V
        { c: 6, r:4, cw: 6, ch:4, id:  1 },
        { c: 0, r:5, cw: 2, ch:3, id: 16 },  // V
      ]
    },
    {
      name: 'B',
      slots: [
        { c: 0, r:0, cw: 4, ch:6, id:  2 },  // V
        { c: 4, r:0, cw: 4, ch:6, id: 13 },  // V
        { c: 8, r:0, cw: 4, ch:6, id: 16 },  // V
        { c: 0, r:6, cw: 3, ch:2, id: 14 },
        { c: 3, r:6, cw: 3, ch:2, id: 11 },
        { c: 6, r:6, cw: 3, ch:2, id:  5 },
        { c: 9, r:6, cw: 3, ch:2, id:  3 },
      ]
    },
    {
      name: 'C',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 15 },
        { c: 3, r:0, cw: 3, ch:2, id:  7 },
        { c: 6, r:0, cw: 6, ch:2, id:  8 },  // letterbox
        { c: 0, r:2, cw: 6, ch:2, id:  4 },  // letterbox
        { c: 6, r:2, cw: 2, ch:3, id:  6 },  // V
        { c: 8, r:2, cw: 4, ch:6, id:  2 },  // V
        { c: 0, r:4, cw: 6, ch:4, id:  1 },
        { c: 6, r:5, cw: 2, ch:3, id: 13 },  // V
      ]
    },
    {
      name: 'D',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 12 },
        { c: 3, r:0, cw: 3, ch:2, id: 10 },
        { c: 6, r:0, cw: 6, ch:2, id:  8 },  // letterbox
        { c: 0, r:2, cw: 4, ch:6, id: 16 },  // V
        { c: 4, r:2, cw: 4, ch:6, id:  2 },  // V
        { c: 8, r:2, cw: 4, ch:6, id:  6 },  // V
      ]
    },
    {
      name: 'E',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 15 },
        { c: 3, r:0, cw: 3, ch:4, id: 13 },  // V
        { c: 6, r:0, cw: 6, ch:4, id:  9 },
        { c: 0, r:2, cw: 3, ch:2, id: 14 },
        { c: 0, r:4, cw: 6, ch:4, id:  5 },
        { c: 6, r:4, cw: 6, ch:2, id:  4 },  // letterbox
        { c: 6, r:6, cw: 6, ch:2, id:  8 },  // letterbox
      ]
    },
    {
      name: 'F',
      slots: [
        { c: 0, r:0, cw: 6, ch:4, id:  7 },
        { c: 6, r:0, cw: 6, ch:4, id: 11 },
        { c: 0, r:4, cw: 6, ch:4, id:  1 },
        { c: 6, r:4, cw: 3, ch:2, id:  3 },
        { c: 9, r:4, cw: 3, ch:4, id:  6 },  // V
        { c: 6, r:6, cw: 3, ch:2, id: 15 },
      ]
    },
    {
      name: 'G',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 10 },
        { c: 3, r:0, cw: 3, ch:2, id: 12 },
        { c: 6, r:0, cw: 3, ch:2, id: 14 },
        { c: 9, r:0, cw: 3, ch:2, id:  5 },
        { c: 0, r:2, cw: 3, ch:4, id:  2 },  // V
        { c: 3, r:2, cw: 9, ch:6, id:  3 },
        { c: 0, r:6, cw: 3, ch:2, id:  1 },
      ]
    },
    {
      name: 'H',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 11 },
        { c: 3, r:0, cw: 3, ch:4, id:  6 },  // V
        { c: 6, r:0, cw: 3, ch:2, id:  9 },
        { c: 9, r:0, cw: 3, ch:4, id:  2 },  // V
        { c: 0, r:2, cw: 3, ch:2, id: 15 },
        { c: 6, r:2, cw: 3, ch:2, id: 14 },
        { c: 0, r:4, cw: 6, ch:4, id:  5 },
        { c: 6, r:4, cw: 6, ch:4, id:  3 },
      ]
    },
  ];

  const LEAD_BIRDS = { 0: 9, 1: 2, 2: 2, 3: 16, 4: 9, 5: 7, 6: 3, 7: 5 };

  // Events: 23 photographs over 3 series, no panorama, so no letterbox slot
  // appears here. A series may take up to 3 slots in one tile — with only three
  // series a cap of 2 would hold every tile to six slots.
  const ARR_EVENTS = [
    {
      name: 'A',
      slots: [
        { c: 0, r:0, cw: 6, ch:4, id: 19 },
        { c: 6, r:0, cw: 3, ch:2, id:  2 },
        { c: 9, r:0, cw: 3, ch:2, id:  9 },
        { c: 6, r:2, cw: 2, ch:3, id:  4 },  // V
        { c: 8, r:2, cw: 4, ch:6, id: 10 },  // V
        { c: 0, r:4, cw: 6, ch:4, id: 18 },
        { c: 6, r:5, cw: 2, ch:3, id: 23 },  // V
      ]
    },
    {
      name: 'B',
      slots: [
        { c: 0, r:0, cw: 4, ch:6, id: 20 },  // V
        { c: 4, r:0, cw: 4, ch:6, id:  6 },  // V
        { c: 8, r:0, cw: 4, ch:6, id: 22 },  // V
        { c: 0, r:6, cw: 3, ch:2, id: 16 },
        { c: 3, r:6, cw: 3, ch:2, id:  3 },
        { c: 6, r:6, cw: 3, ch:2, id: 14 },
        { c: 9, r:6, cw: 3, ch:2, id:  1 },
      ]
    },
    {
      name: 'C',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id:  5 },
        { c: 3, r:0, cw: 9, ch:6, id:  8 },
        { c: 0, r:2, cw: 3, ch:4, id: 21 },  // V
        { c: 0, r:6, cw: 3, ch:2, id: 11 },
        { c: 3, r:6, cw: 3, ch:2, id: 17 },
        { c: 6, r:6, cw: 3, ch:2, id:  7 },
        { c: 9, r:6, cw: 3, ch:2, id: 12 },
      ]
    },
    {
      name: 'D',
      slots: [
        { c: 0, r:0, cw: 3, ch:4, id: 22 },  // V
        { c: 3, r:0, cw: 3, ch:2, id: 15 },
        { c: 6, r:0, cw: 6, ch:4, id: 13 },
        { c: 3, r:2, cw: 3, ch:2, id:  1 },
        { c: 0, r:4, cw: 6, ch:4, id:  3 },
        { c: 6, r:4, cw: 6, ch:4, id: 18 },
      ]
    },
    {
      name: 'E',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 19 },
        { c: 3, r:0, cw: 3, ch:4, id:  4 },  // V
        { c: 6, r:0, cw: 3, ch:4, id: 21 },  // V
        { c: 9, r:0, cw: 3, ch:4, id: 10 },  // V
        { c: 0, r:2, cw: 3, ch:2, id:  5 },
        { c: 0, r:4, cw: 6, ch:4, id: 12 },
        { c: 6, r:4, cw: 6, ch:4, id:  2 },
      ]
    },
    {
      name: 'F',
      slots: [
        { c: 0, r:0, cw: 6, ch:4, id: 14 },
        { c: 6, r:0, cw: 6, ch:4, id: 16 },
        { c: 0, r:4, cw: 3, ch:2, id: 17 },
        { c: 3, r:4, cw: 3, ch:2, id:  7 },
        { c: 6, r:4, cw: 3, ch:4, id:  6 },  // V
        { c: 9, r:4, cw: 3, ch:4, id: 23 },  // V
        { c: 0, r:6, cw: 3, ch:2, id: 15 },
        { c: 3, r:6, cw: 3, ch:2, id:  3 },
      ]
    },
    {
      name: 'G',
      slots: [
        { c: 0, r:0, cw: 3, ch:4, id: 20 },  // V
        { c: 3, r:0, cw: 3, ch:2, id:  8 },
        { c: 6, r:0, cw: 3, ch:2, id: 11 },
        { c: 9, r:0, cw: 3, ch:2, id: 13 },
        { c: 3, r:2, cw: 9, ch:6, id:  1 },
        { c: 0, r:4, cw: 3, ch:4, id:  4 },  // V
      ]
    },
    {
      name: 'H',
      slots: [
        { c: 0, r:0, cw: 3, ch:4, id:  6 },  // V
        { c: 3, r:0, cw: 3, ch:4, id: 23 },  // V
        { c: 6, r:0, cw: 6, ch:4, id:  9 },
        { c: 0, r:4, cw: 3, ch:4, id: 10 },  // V
        { c: 3, r:4, cw: 6, ch:4, id:  5 },
        { c: 9, r:4, cw: 3, ch:4, id: 21 },  // V
      ]
    },
  ];

  const LEAD_EVENTS = { 0: 19, 1: 20, 2: 8, 3: 13, 4: 12, 5: 14, 6: 1, 7: 9 };

  // Products: 14 photographs over 5 series, no panorama. Two of those series
  // hold one photo each, which is why the per-tile cap is 3 rather than 2 —
  // see the note in tools/gen-arrangements.js.
  const ARR_PRODUCTS = [
    {
      name: 'A',
      slots: [
        { c: 0, r:0, cw: 6, ch:4, id:  4 },
        { c: 6, r:0, cw: 3, ch:2, id:  7 },
        { c: 9, r:0, cw: 3, ch:2, id:  1 },
        { c: 6, r:2, cw: 2, ch:3, id:  2 },  // V
        { c: 8, r:2, cw: 4, ch:6, id:  6 },  // V
        { c: 0, r:4, cw: 6, ch:4, id: 10 },
        { c: 6, r:5, cw: 2, ch:3, id: 14 },  // V
      ]
    },
    {
      name: 'B',
      slots: [
        { c: 0, r:0, cw: 4, ch:6, id:  3 },  // V
        { c: 4, r:0, cw: 4, ch:6, id: 13 },  // V
        { c: 8, r:0, cw: 4, ch:6, id:  6 },  // V
        { c: 0, r:6, cw: 3, ch:2, id:  9 },
        { c: 3, r:6, cw: 3, ch:2, id:  5 },
        { c: 6, r:6, cw: 3, ch:2, id:  8 },
        { c: 9, r:6, cw: 3, ch:2, id:  4 },
      ]
    },
    {
      name: 'C',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 11 },
        { c: 3, r:0, cw: 9, ch:6, id: 12 },
        { c: 0, r:2, cw: 3, ch:4, id: 14 },  // V
        { c: 0, r:6, cw: 3, ch:2, id:  1 },
        { c: 3, r:6, cw: 3, ch:2, id:  7 },
        { c: 6, r:6, cw: 3, ch:2, id:  5 },
        { c: 9, r:6, cw: 3, ch:2, id:  4 },
      ]
    },
    {
      name: 'D',
      slots: [
        { c: 0, r:0, cw: 3, ch:4, id:  2 },  // V
        { c: 3, r:0, cw: 3, ch:2, id: 10 },
        { c: 6, r:0, cw: 6, ch:4, id:  8 },
        { c: 3, r:2, cw: 3, ch:2, id:  9 },
        { c: 0, r:4, cw: 6, ch:4, id:  7 },
        { c: 6, r:4, cw: 6, ch:4, id:  5 },
      ]
    },
    {
      name: 'E',
      slots: [
        { c: 0, r:0, cw: 3, ch:2, id: 11 },
        { c: 3, r:0, cw: 3, ch:4, id: 13 },  // V
        { c: 6, r:0, cw: 3, ch:4, id:  3 },  // V
        { c: 9, r:0, cw: 3, ch:4, id:  6 },  // V
        { c: 0, r:2, cw: 3, ch:2, id: 12 },
        { c: 0, r:4, cw: 6, ch:4, id:  1 },
        { c: 6, r:4, cw: 6, ch:4, id:  4 },
      ]
    },
    {
      name: 'F',
      slots: [
        { c: 0, r:0, cw: 6, ch:4, id: 10 },
        { c: 6, r:0, cw: 6, ch:4, id:  8 },
        { c: 0, r:4, cw: 3, ch:2, id:  7 },
        { c: 3, r:4, cw: 3, ch:2, id:  5 },
        { c: 6, r:4, cw: 3, ch:4, id: 14 },  // V
        { c: 9, r:4, cw: 3, ch:4, id:  2 },  // V
        { c: 0, r:6, cw: 3, ch:2, id:  1 },
        { c: 3, r:6, cw: 3, ch:2, id:  4 },
      ]
    },
    {
      name: 'G',
      slots: [
        { c: 0, r:0, cw: 3, ch:4, id:  3 },  // V
        { c: 3, r:0, cw: 3, ch:2, id: 11 },
        { c: 6, r:0, cw: 3, ch:2, id:  9 },
        { c: 9, r:0, cw: 3, ch:2, id:  7 },
        { c: 3, r:2, cw: 9, ch:6, id:  5 },
        { c: 0, r:4, cw: 3, ch:4, id: 13 },  // V
      ]
    },
    {
      name: 'H',
      slots: [
        { c: 0, r:0, cw: 3, ch:4, id:  2 },  // V
        { c: 3, r:0, cw: 3, ch:4, id:  6 },  // V
        { c: 6, r:0, cw: 6, ch:4, id: 12 },
        { c: 0, r:4, cw: 3, ch:4, id: 14 },  // V
        { c: 3, r:4, cw: 6, ch:4, id:  1 },
        { c: 9, r:4, cw: 3, ch:4, id: 13 },  // V
      ]
    },
  ];

  const LEAD_PRODUCTS = { 0: 4, 1: 3, 2: 12, 3: 8, 4: 1, 5: 10, 6: 5, 7: 12 };

  // The 88px module and 24px gutter of the cell grid. TILE_W / TILE_H restate
  // them as literals rather than referencing the constants because
  // tools/check-arrangements.js parses that exact form out of this file to
  // cross-check --tile-width / --tile-height in styles.css.
  const MODULE = 88;
  const GUTTER = 24;
  const TILE_W = 12 * 88 + 11 * 24;
  const TILE_H =  8 * 88 +  7 * 24;

  // ---------- Collections ----------
  // Three bodies of work on one plane. The engine below is written against the
  // ACTIVE collection only — it reads ITEMS / FACTS / ARRANGEMENTS / LEAD, which
  // the switcher rebinds — so the pan, focus, viewer and label code has no idea
  // there is more than one. Order here is the order of the buttons top-right.
  // `prefix` is the letter the placeholder plate prints before the id (P7, E12,
  // R3) and the letter the photo filenames carry.
  const COLLECTIONS = [
    { key: 'birds',    label: 'Birds',    prefix: 'P',
      items: SPECIES,  facts: BIRD_FACTS,    arrangements: ARR_BIRDS,    lead: LEAD_BIRDS },
    { key: 'events',   label: 'Events',   prefix: 'E',
      items: EVENTS,   facts: EVENT_FACTS,   arrangements: ARR_EVENTS,   lead: LEAD_EVENTS },
    { key: 'products', label: 'Products', prefix: 'R',
      items: PRODUCTS, facts: PRODUCT_FACTS, arrangements: ARR_PRODUCTS, lead: LEAD_PRODUCTS },
  ];

  // Pixel geometry is derived once for every slot in every collection, so a
  // switch is a table swap and not a recomputation.
  COLLECTIONS.forEach(c => c.arrangements.forEach(arr => arr.slots.forEach(s => {
    s.x = s.c * (MODULE + GUTTER);
    s.y = s.r * (MODULE + GUTTER);
    s.w = s.cw * MODULE + (s.cw - 1) * GUTTER;
    s.h = s.ch * MODULE + (s.ch - 1) * GUTTER;
  })));

  // Every collection is exactly N_ARR arrangements long. The lattice constants
  // below (PERIOD_X, SHEAR_X, the tile grid) are computed once from that count,
  // so a collection of a different length would silently tear the wrap.
  // tools/check-arrangements.js enforces it; this is the runtime backstop.
  const N_ARR = COLLECTIONS[0].arrangements.length;
  COLLECTIONS.forEach(c => {
    if (c.arrangements.length !== N_ARR) {
      console.error(`[portfolio] collection "${c.key}" has ${c.arrangements.length} ` +
                    `arrangements, expected ${N_ARR}`);
    }
  });

  // The active collection, and the four bindings the engine actually reads.
  let collection       = COLLECTIONS[0];
  let ITEMS            = collection.items;
  let FACTS            = collection.facts;
  let ARRANGEMENTS     = collection.arrangements;
  let ARRANGEMENT_LEAD = collection.lead;

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

  // HSPAN must stay >= 3: render() pins worldX inside the *middle* strip copy
  // (middleCopyOriginX = one strip in), so a full strip is needed on BOTH sides
  // for the seamless horizontal wrap. With 8 arrangements this is 24 columns;
  // the engine is parameterized over ARRANGEMENTS.length, so nothing else
  // changes. (Dropping to 2 leaves no strip to the right of center → wrap tears.)
  const HSPAN = 3;
  const VSPAN = 5;
  const MIDROW = Math.floor(VSPAN / 2);

  // Rows are SHEARED: each row down starts SHEAR arrangements further along the
  // cycle, so panning straight down walks A→D→G→B→E→H→C→F before it repeats,
  // instead of redrawing the same tile forever. Constraints on SHEAR:
  //   · coprime with ARRANGEMENTS.length, or the vertical cycle is shorter than
  //     the full set — leaves 1, 3, 5, 7;
  //   · not 1 or 7, because those put an exact copy of a tile diagonally
  //     adjacent to it (offset ±1 row, ∓1 column), which reads worse than the
  //     vertical repeat it replaces.
  // 3 and 5 are mirror images of each other; 3 it is. A tile then shares 2–4 of
  // its 6–8 photos with the tile below, on par with the 1–4 it already shared
  // with the tile to its right, and against all of them before this change.
  //
  // Row MIDROW is the identity row: render() pins the viewport into it, so its
  // arrangement order must stay the plain col % N that the fundamental-domain
  // math below (updateFocus, updateCompass) assumes.
  const SHEAR = 3;
  const arrIndexAt = (col, row) => {
    const n = ARRANGEMENTS.length;
    return (((col + SHEAR * (row - MIDROW)) % n) + n) % n;
  };

  // Every tile copy on the plane, rebuilt from scratch whenever the collection
  // changes. `tiles` is reassigned rather than mutated in place because the
  // focus code holds no reference to it beyond the current frame.
  let tiles = [];
  let enterTimers = [];

  function buildPlane() {
    // Drop the previous plane whole. Cancelling the staggered entrance timers
    // first matters: a switch during the fade would otherwise fire them against
    // elements that are no longer in the document.
    enterTimers.forEach(clearTimeout);
    enterTimers = [];
    plane.textContent = '';
    tiles = [];

    for (let row = 0; row < VSPAN; row++) {
      for (let col = 0; col < ARRANGEMENTS.length * HSPAN; col++) {
        const arr = ARRANGEMENTS[arrIndexAt(col, row)];
        const tx = col * (TILE_W + GUTTER);
        const ty = row * (TILE_H + GUTTER);
        const tileEl = document.createElement('div');
        tileEl.className = 'tile';
        tileEl.style.left = tx + 'px';
        tileEl.style.top  = ty + 'px';

        const photos = [];
        arr.slots.forEach((slot) => {
          const pEl = document.createElement('div');
          pEl.style.left   = slot.x + 'px';
          pEl.style.top    = slot.y + 'px';
          pEl.style.width  = slot.w + 'px';
          pEl.style.height = slot.h + 'px';

          const sp = ITEMS.find(s => s.id === slot.id);
          if (!sp) return;
          pEl.className = 'photo is-entering';
          pEl.style.setProperty('--ph-band-a', sp.band_a);
          pEl.style.setProperty('--ph-band-b', sp.band_b);
          pEl.setAttribute('data-species', sp.vernacular);

          const ph = document.createElement('div');
          ph.className = 'placeholder';
          ph.setAttribute('data-label', `${collection.prefix}${sp.id} · ${sp.vernacular.toUpperCase()}`);
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
              console.warn('[portfolio] Image failed to load:', sp.image);
            }, { once: true });
            pEl.appendChild(img);
          }

          tileEl.appendChild(pEl);
          photos.push({ el: pEl, slot, sp });
        });

        plane.appendChild(tileEl);
        tiles.push({ el: tileEl, col, row, arrIndex: arrIndexAt(col, row), photos, tx, ty });
      }
    }

    tiles.flatMap(t => t.photos).forEach((p, i) => {
      const delay = 60 + (i % 32) * 14;
      enterTimers.push(setTimeout(() => {
        p.el.classList.remove('is-entering');
        p.el.classList.add('is-entered');
      }, delay));
    });
  }

  // ---------- Pan state ----------
  const PERIOD_X = (TILE_W + GUTTER) * ARRANGEMENTS.length;
  const PERIOD_Y = (TILE_H + GUTTER);
  const SHEAR_X  = SHEAR * (TILE_W + GUTTER);

  // The plane repeats on a SHEARED lattice now, generated by
  //     u = ( PERIOD_X, 0       )  — the full cycle of arrangements across
  //     v = (-SHEAR_X,  PERIOD_Y)  — one row down, SHEAR tiles left
  // v is exactly the invariance of arrIndexAt: arrangement(col, row) equals
  // arrangement(col - SHEAR, row + 1). The fundamental domain is unchanged —
  // still [0, PERIOD_X) x [0, PERIOD_Y), one row of every arrangement, with
  // arrangement i at x = i * (TILE_W + GUTTER) — so slot enumeration below is
  // untouched. What changes is how a point wraps *out* of that domain: y and x
  // no longer wrap independently.

  // Reduce a pan position into the fundamental domain. Crossing n rows in y
  // drags x along by n * SHEAR_X; that compensation is what keeps the vertical
  // seam invisible now that the tile below is not a copy of the tile above.
  function wrapWorld(px, py) {
    const n  = Math.floor(py / PERIOD_Y);
    const wy = py - n * PERIOD_Y;
    const sx = px + n * SHEAR_X;
    return { wx: ((sx % PERIOD_X) + PERIOD_X) % PERIOD_X, wy };
  }

  // Where a collection opens: the centre of arrangement A's lead slot, which
  // gen-arrangements picks as that tile's largest photograph. Recomputed on a
  // switch, because the lead of the new collection is a different slot.
  function openingCenter() {
    const A = ARRANGEMENTS[0];
    const lead = A.slots.find(s => s.id === ARRANGEMENT_LEAD[0]) || A.slots[0];
    return { x: lead.x + lead.w / 2, y: lead.y + lead.h / 2 };
  }

  const opening = openingCenter();
  let panX_target = opening.x;
  let panY_target = opening.y;
  let panX = panX_target;
  let panY = panY_target;

  let zoom = 1.6;
  let zoom_target = 1.6;

  // Single entry point for every user interaction: cancel any in-flight dwell
  // pull (the user is taking over), hide the dwell cue, re-arm the cue + dwell
  // timers, and make sure the render loop is awake.
  function bumpInteraction() {
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
  // Motion/zoom constants the render loop reads. Anything purely presentational
  // (ambient dim, focus-fade duration, brand colours) lives in styles.css — this
  // object used to mirror those into custom properties at boot, which meant two
  // sources of truth that had quietly drifted apart. Keep it to values JS uses.
  const TWEAKS = {
    lerp: 0.02,
    zoomLerp: 0.02,
    zoomMin: 1.6,   // the authored floor; zoomFloor() goes under it on small screens
    zoomMax: 4.0,
    dwellDelay: 400,
    dwellPull: 0.0015
  };

  // ---------- How far the plane can pull back ----------
  // The plane is drawn at an absolute scale, so how much of a photograph fits is
  // entirely a question of the screen. The largest slot in the palette is 984x648
  // world px, which at the authored floor of 1.6 wants 1574x1037 CSS px to be seen
  // whole: a 1080p monitor has that, a laptop or a tablet does not. And 1.6 was
  // also as far back as the plane would go, so on those screens no gesture could
  // take the photograph in — including the opening one, which gen-arrangements
  // picks as its tile's largest.
  //
  // So the floor is per screen: the zoom at which the largest slot fits inside the
  // viewport. Never tighter than 1.6, so a screen that already had the room keeps
  // exactly the composition it was authored with; never below ZOOM_HARD_FLOOR,
  // which is a rail against a freak viewport (a 200px-tall window would otherwise
  // shrink the plane to thumbnails), not a design value — every real screen down to
  // a landscape phone fits well above it.
  const ZOOM_HARD_FLOOR = 0.5;

  // Slot extents are a property of the arrangement palette rather than of any one
  // table — all three collections top out at the same 9x6 — so this is measured
  // across every collection once, and the floor then stays put when the collection
  // switches instead of re-zooming the visitor.
  const LARGEST_SLOT = (() => {
    let w = 0, h = 0;
    for (const c of COLLECTIONS) {
      for (const arr of c.arrangements) {
        for (const slot of arr.slots) {
          if (slot.w > w) w = slot.w;
          if (slot.h > h) h = slot.h;
        }
      }
    }
    return { w, h };
  })();

  function zoomFloor() {
    const vp = viewport();
    const fit = Math.min(vp.w / LARGEST_SLOT.w, vp.h / LARGEST_SLOT.h);
    return Math.max(ZOOM_HARD_FLOOR, Math.min(TWEAKS.zoomMin, fit));
  }

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
    const { wx, wy } = wrapWorld(panX, panY);
    const middleCopyOriginX = ARRANGEMENTS.length * (TILE_W + GUTTER);
    const middleCopyOriginY = MIDROW * (TILE_H + GUTTER);
    const worldX = middleCopyOriginX + wx;
    const worldY = middleCopyOriginY + wy;
    const z = zoom;
    const tx = vp.w / 2 - z * worldX;
    const ty = vp.h / 2 - z * worldY;

    plane.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${z})`;

    // Over the plane, focus follows what is on screen — the label should name
    // the photograph you can see, not the one you are heading for. Behind the
    // viewer's backdrop there is nothing to see, so it follows intent instead:
    // reading the mid-lerp position there would find the photograph you just
    // stepped away from still nearest, and the viewer would flick backwards
    // before arriving.
    const byIntent = isFullscreen();
    updateFocus(byIntent ? panX_target : panX, byIntent ? panY_target : panY);
    updateCompass();

    if (atRest) { rafId = 0; return; }
    rafId = requestAnimationFrame(render);
  }

  // ---------- Focus tracking ----------
  let currentFocusKey = null;
  let focusedEls = new Set();
  let labelTimeout = null;
  let focusedSpecies = null;   // the SPECIES record behind the label — what the full-screen viewer shows

  function updateFocus(px, py) {
    const { wx, wy } = wrapWorld(px, py);

    let best = null;
    let bestDist = Infinity;

    // Same 3x3 neighbourhood of wrapped copies as before, except the row
    // offset b now drags the x offset with it (lattice vector v, above).
    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      for (const slot of arr.slots) {
        const cx0 = slot.x + slot.w / 2;
        const cy0 = slot.y + slot.h / 2;
        for (let b = -1; b <= 1; b++) {
          const cy = cy0 + b * PERIOD_Y;
          const cxb = arrOriginX + cx0 - b * SHEAR_X;
          for (let a = -1; a <= 1; a++) {
            const cx = cxb + a * PERIOD_X;
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
    const cx0 = info.slot.x + info.slot.w / 2;
    const cy0 = info.slot.y + info.slot.h / 2;
    // Unlike the searches above, this one is handed ONE named slot, so its
    // nearest copy can be tiles away — and on a sheared lattice a row further
    // off can hold the closer copy, because each row drags x by SHEAR_X. Sweep
    // a full cycle of rows either side and take the nearest x copy in each;
    // beyond that cycle the x offsets repeat against a strictly larger y, so
    // no further row can win. (Only matters past ~900px, but this is the input
    // to the focus hysteresis and cheap to keep exact.)
    let best = Infinity;
    for (let b = -4; b <= 4; b++) {
      const dy = cy0 + b * PERIOD_Y - wy;
      let dx = arrOriginX + cx0 - b * SHEAR_X - wx;
      dx -= Math.round(dx / PERIOD_X) * PERIOD_X;
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

    const sp = ITEMS.find(s => s.id === info.slot.id);
    if (!sp) return;
    focusedSpecies = sp;
    // The viewer is a window onto whatever the plane is focused on, so it
    // follows focus rather than keeping a selection of its own.
    if (isFullscreen()) showInViewer(sp);
    const latinHtml = escapeHtml(sp.latin).replace(/ /g, '&nbsp;');
    // Resting label (uppercased by CSS, announced via aria-live) and bloomed
    // title both get filled; the bloom is an opacity crossfade between them.
    speciesNameRest.textContent = sp.vernacular;
    speciesNameBloom.innerHTML =
      `${escapeHtml(sp.vernacular)}<span class="latin">${latinHtml}</span>`;

    const f = FACTS[sp.id];
    if (f) {
      speciesLede.textContent = f.lede;
      speciesVitals.innerHTML = vitalRows(f).map(([k, v]) =>
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
      newZoom = Math.min(TWEAKS.zoomMax, Math.max(zoomFloor(), newZoom));

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
        Math.max(zoomFloor(), zoom_target * factor)
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

  // Arrow keys — discrete jumps to nearest photo center. They work over the
  // plane and inside the full-screen viewer alike. The viewer shows whatever
  // the plane is focused on, so a step there moves the plane behind the
  // backdrop and the photograph on screen follows; close it and you are
  // standing on the photograph you navigated to.
  document.addEventListener('keydown', (e) => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    step(e.key);
  });

  // One directional step, from either input and in either view. bumpInteraction
  // wakes the render loop, which resolves the new focus on the next frame and —
  // if the viewer is open — hands it the photograph to show.
  function step(dir) {
    bumpInteraction();
    jumpToNearestInDir(dir);
  }

  function jumpToNearestInDir(dir) {
    const { wx, wy } = wrapWorld(panX_target, panY_target);
    let best = null;
    let bestScore = Infinity;
    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      for (const slot of arr.slots) {
        for (let b = -1; b <= 1; b++) {
          const cy = slot.y + slot.h/2 + b * PERIOD_Y;
          const cxb = arrOriginX + slot.x + slot.w/2 - b * SHEAR_X;
          for (let a = -1; a <= 1; a++) {
            const cx = cxb + a * PERIOD_X;
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
    const { wx } = wrapWorld(panX, panY);
    const arrIdx = Math.floor(wx / (TILE_W + GUTTER)) % ARRANGEMENTS.length;
    if (arrIdx !== lastArr) {
      lastArr = arrIdx;
      compassArr.textContent = ARRANGEMENTS[arrIdx].name;
    }
  }

  // ---------- Full-screen viewer ----------
  // One control, top-right, for the photograph the plane is focused on. It does
  // not move or get replaced when the viewer opens — the same button becomes the
  // ✕, so the thing you pressed is the thing that closes. The species opener sits
  // above the viewer (z-index in styles.css) and keeps working over the image.
  const fsToggle = document.getElementById('fs-toggle');
  const fsLayer  = document.getElementById('fullscreen');
  const fsImg    = document.getElementById('fs-img');
  const FS_FADE_OUT_MS = 150;   // matches --label-out
  let fsHideTimer = null;

  function isFullscreen() {
    return !!fsLayer && !fsLayer.hidden;
  }

  // Swapping .src on the live <img> leaves it blank until the new file decodes,
  // which shows as a black flash mid-navigation. Every one of these files is
  // already in cache from the plane, so decoding an off-screen copy first costs
  // next to nothing and the swap lands on a frame that can paint immediately.
  let fsShownSrc = null;
  let fsSwapToken = 0;
  function showInViewer(sp) {
    if (!fsImg || !sp || !sp.image || sp.image === fsShownSrc) return;
    fsShownSrc = sp.image;
    const token = ++fsSwapToken;
    const src = sp.image;
    const alt = sp.vernacular;
    const swap = () => {
      if (token !== fsSwapToken) return;   // a later step overtook this one
      fsImg.src = src;
      fsImg.alt = alt;
    };
    const pre = new Image();
    pre.src = src;
    if (pre.decode) pre.decode().then(swap, swap); else swap();
  }

  function openFullscreen() {
    if (!fsLayer || !fsImg || !fsToggle) return;
    if (!focusedSpecies || !focusedSpecies.image) return;   // nothing focused yet, or a slot with no photo
    if (fsHideTimer) { clearTimeout(fsHideTimer); fsHideTimer = null; }

    // Straight assignment on open rather than showInViewer's decode round-trip:
    // the layer fades up from nothing, so there is no old frame to protect.
    fsSwapToken++;
    fsShownSrc = focusedSpecies.image;
    fsImg.src = focusedSpecies.image;
    fsImg.alt = focusedSpecies.vernacular;
    fsLayer.hidden = false;
    // A frame between `hidden` coming off and .is-open going on, or the two
    // style changes collapse into one and the fade never runs.
    requestAnimationFrame(() => fsLayer.classList.add('is-open'));

    fsToggle.classList.add('is-open');
    fsToggle.setAttribute('aria-expanded', 'true');
    fsToggle.setAttribute('aria-label', 'Close full screen');
  }

  function closeFullscreen() {
    if (!isFullscreen() || !fsToggle) return;
    fsLayer.classList.remove('is-open');
    fsToggle.classList.remove('is-open');
    fsToggle.setAttribute('aria-expanded', 'false');
    fsToggle.setAttribute('aria-label', 'View this photograph full screen');
    // Hold the node until the fade finishes, then take it out of the tree so it
    // cannot swallow pointer events from the plane.
    if (fsHideTimer) clearTimeout(fsHideTimer);
    fsHideTimer = setTimeout(() => {
      fsHideTimer = null;
      fsLayer.hidden = true;
      fsSwapToken++;              // strand any decode still in flight
      fsShownSrc = null;
      fsImg.removeAttribute('src');
    }, FS_FADE_OUT_MS);
    fsWheelReset();
    // A finger can still be down when the ✕ is tapped, and its pointerup will
    // land on a hidden layer. Forget the gesture here so the next open starts
    // clean instead of locked.
    fsPointers.clear();
    fsSwipeRelease();
  }

  // ---------- Viewer: wheel / trackpad navigation ----------
  // One photograph per gesture. A trackpad flick delivers a long momentum tail
  // and a spun mouse wheel a long burst of clicks; stepping on every event
  // would fly past a dozen photographs. So accumulate to a threshold, fire
  // once, then stay locked until the wheel has been quiet for a beat — the
  // gesture ends when the hand stops, not when the events do.
  const FS_WHEEL_STEP = 80;       // accumulated px before a step fires
  const FS_WHEEL_QUIET_MS = 180;  // silence that closes out a gesture
  let fsAccX = 0, fsAccY = 0;
  let fsWheelLocked = false;
  let fsWheelTimer = null;

  function fsWheelReset() {
    if (fsWheelTimer) { clearTimeout(fsWheelTimer); fsWheelTimer = null; }
    fsWheelLocked = false;
    fsAccX = 0; fsAccY = 0;
  }

  if (fsLayer) {
    fsLayer.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey) return;      // trackpad pinch — the viewer has no zoom

      if (fsWheelTimer) clearTimeout(fsWheelTimer);
      fsWheelTimer = setTimeout(fsWheelReset, FS_WHEEL_QUIET_MS);
      if (fsWheelLocked) return;

      // deltaMode 1 (lines) / 2 (pages) come from mice and older engines; the
      // threshold above is in pixels, so bring them onto that scale first. 33
      // rather than a true line height: Firefox reports 3 lines per wheel notch
      // where Chrome reports 100px, and one notch should be one photograph on
      // both — a literal 16 would leave a slowly turned wheel stepping never,
      // because the quiet timer clears the accumulator between notches.
      const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? window.innerHeight : 1;
      fsAccX += e.deltaX * unit;
      fsAccY += e.deltaY * unit;

      const vertical = Math.abs(fsAccY) >= Math.abs(fsAccX);
      const acc = vertical ? fsAccY : fsAccX;
      if (Math.abs(acc) < FS_WHEEL_STEP) return;

      fsWheelLocked = true;
      fsAccX = 0; fsAccY = 0;
      step(vertical
        ? (acc > 0 ? 'ArrowDown'  : 'ArrowUp')
        : (acc > 0 ? 'ArrowRight' : 'ArrowLeft'));
    }, { passive: false });
  }

  // ---------- Viewer: touch navigation ----------
  // Past 720px a touchscreen gets the desktop plane, so the viewer has to be
  // navigable by hand as well as by wheel. Same contract as the wheel above —
  // one photograph per gesture, then locked until the fingers lift — with the
  // image trailing the finger a damped fraction of the way first, so a swipe is
  // visibly taken before it fires and a short one that fires nothing snaps back
  // rather than reading as a dead layer.
  //
  // Two fingers govern nothing: a pinch is a zoom request the viewer has no
  // answer for, and whichever finger travelled furthest must not be mistaken
  // for a swipe. The mouse keeps the wheel and is left out of this entirely.
  const FS_SWIPE_STEP = 48;      // px of travel before a step fires
  const FS_SWIPE_FOLLOW = 0.32;  // how far the image trails the finger
  const fsPointers = new Set();  // ids down on the layer — the count is the question
  let fsSwipe = null;            // { id, x, y } of the one pointer that can navigate
  let fsSwipeSpent = false;      // this gesture already stepped

  // Offset lives on the element rather than in the render loop: the viewer is a
  // still image over a backdrop, not part of the plane's transform chain.
  function fsFollow(dx, dy) {
    if (!fsImg) return;
    fsImg.style.transform = (dx || dy)
      ? `translate3d(${dx * FS_SWIPE_FOLLOW}px, ${dy * FS_SWIPE_FOLLOW}px, 0)`
      : '';
  }

  // Drop the gesture and ease the photograph back to centre. Taking .is-swiping
  // off first is what restores the transition, so the release animates where the
  // follow did not.
  function fsSwipeRelease() {
    fsSwipe = null;
    fsSwipeSpent = false;
    if (fsLayer) fsLayer.classList.remove('is-swiping');
    fsFollow(0, 0);
  }

  if (fsLayer) {
    fsLayer.addEventListener('pointerdown', (e) => {
      fsPointers.add(e.pointerId);
      if (fsPointers.size > 1) { fsSwipeRelease(); return; }
      if (e.pointerType === 'mouse') return;
      fsSwipe = { id: e.pointerId, x: e.clientX, y: e.clientY };
      fsSwipeSpent = false;
      fsLayer.classList.add('is-swiping');
      // Capture so a swipe that runs off the image — or under the corner
      // controls layered above it — still reports its own pointerup.
      try { fsLayer.setPointerCapture(e.pointerId); } catch (_) {}
    });

    fsLayer.addEventListener('pointermove', (e) => {
      if (!fsSwipe || e.pointerId !== fsSwipe.id) return;
      if (fsSwipeSpent || fsPointers.size > 1) return;
      const dx = e.clientX - fsSwipe.x;
      const dy = e.clientY - fsSwipe.y;

      const vertical = Math.abs(dy) >= Math.abs(dx);
      const travel = vertical ? dy : dx;
      if (Math.abs(travel) < FS_SWIPE_STEP) { fsFollow(dx, dy); return; }

      // Against the travel, the way the plane moves under a drag: pulling the
      // photograph up asks for the one below it. Fire the moment the threshold
      // is crossed rather than on release — the swap is the feedback, and the
      // hand is still moving when it lands.
      fsSwipeSpent = true;
      fsLayer.classList.remove('is-swiping');
      fsFollow(0, 0);
      step(vertical
        ? (travel < 0 ? 'ArrowDown'  : 'ArrowUp')
        : (travel < 0 ? 'ArrowRight' : 'ArrowLeft'));
    });

    const fsPointerEnd = (e) => {
      fsPointers.delete(e.pointerId);
      try { fsLayer.releasePointerCapture(e.pointerId); } catch (_) {}
      // A gesture abandoned to a pinch does not resume from the finger left
      // behind — the next swipe starts on a fresh touch.
      if (fsPointers.size === 0 || (fsSwipe && e.pointerId === fsSwipe.id)) fsSwipeRelease();
    };
    fsLayer.addEventListener('pointerup', fsPointerEnd);
    fsLayer.addEventListener('pointercancel', fsPointerEnd);
  }

  if (fsToggle) {
    fsToggle.addEventListener('click', (e) => {
      // Keep this click away from the document handler below, which closes the
      // bloom on any outside click — the plate is meant to stay open over the viewer.
      e.stopPropagation();
      if (isFullscreen()) closeFullscreen(); else openFullscreen();
      noteUiInteraction();
    });
  }

  // Escape closes the viewer, but only once the bloom is down, so one press
  // never dismisses two layers. Registered ahead of the bloom's own Escape
  // handler so it reads the bloom state before that handler clears it.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !isFullscreen()) return;
    if (speciesEl.classList.contains('is-blooming')) return;
    closeFullscreen();
  });

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
  // Nearest photo center to a pan position, across all arrangements
  // and the wrapped tile copies. Driven by panX_target (the user's intended
  // destination) so the pull centers where the drag was headed, matching the
  // photo updateFocus will settle on once the plane catches up.
  function nearestCenterTo(px, py) {
    // Work in the fundamental domain and keep the winning *delta*, then apply it
    // to the caller's absolute position — the sheared lattice no longer lets you
    // round x and y to the nearest period independently.
    const { wx, wy } = wrapWorld(px, py);
    let bestDx = 0, bestDy = 0, bestD2 = Infinity;
    for (let arrIdx = 0; arrIdx < ARRANGEMENTS.length; arrIdx++) {
      const arr = ARRANGEMENTS[arrIdx];
      const arrOriginX = arrIdx * (TILE_W + GUTTER);
      for (const slot of arr.slots) {
        const cx0 = slot.x + slot.w / 2, cy0 = slot.y + slot.h / 2;
        for (let b = -1; b <= 1; b++) {
          const dy = cy0 + b * PERIOD_Y - wy;
          const dxb = arrOriginX + cx0 - b * SHEAR_X - wx;
          for (let a = -1; a <= 1; a++) {
            const dx = dxb + a * PERIOD_X;
            const d2 = dx*dx + dy*dy;
            if (d2 < bestD2) { bestD2 = d2; bestDx = dx; bestDy = dy; }
          }
        }
      }
    }
    return { x: px + bestDx, y: py + bestDy };
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

  // ---------- Mobile set switcher ----------
  // The whole feature is one attribute. `data-set` on .mobile-edition says what
  // is on screen; CSS hides every [data-cat] that does not match. Switching is
  // an attribute write — nothing re-renders, nothing rebuilds, and the images of
  // an unvisited set are never fetched because a display:none cell never
  // intersects the viewport for its loading="lazy" to resolve against.
  //
  // Header and menu read that same attribute, so "where am I" and "where can I
  // go" cannot contradict each other.
  const SET_LABELS = { birds: 'Birds', products: 'Products', events: 'Events' };

  const mobileEdition = document.getElementById('mobile-edition');
  const setToggle     = document.getElementById('set-toggle');
  const setMenu       = document.getElementById('set-menu');
  const setBackdrop   = document.getElementById('set-backdrop');
  const mobileCount   = document.getElementById('mobile-count');
  const setOpts       = setMenu ? Array.from(setMenu.querySelectorAll('.set-opt')) : [];

  let setMenuOpen = false;
  let setMenuHideTimer = null;

  // Counted from the DOM rather than hardcoded, so adding a cell to a set can
  // never leave the menu or the header lying about how many there are.
  function countOf(set) {
    return mobileEdition
      ? mobileEdition.querySelectorAll('.mcell[data-cat="' + set + '"]').length
      : 0;
  }

  function applySet(set) {
    if (!mobileEdition || !SET_LABELS[set]) return;
    mobileEdition.dataset.set = set;
    if (mobileCount) mobileCount.textContent = SET_LABELS[set] + ' · ' + countOf(set);
    setOpts.forEach((opt) => {
      const active = opt.dataset.setOpt === set;
      // aria-current, not aria-pressed: these are not toggles, they name the
      // one body of work you are currently reading.
      if (active) opt.setAttribute('aria-current', 'true');
      else opt.removeAttribute('aria-current');
      // Same source as the header count — the numbers in the HTML are only a
      // no-JS fallback and get overwritten from the DOM on first paint.
      const n = opt.querySelector('.set-n');
      if (n) n.textContent = countOf(opt.dataset.setOpt);
    });
  }

  function openSetMenu() {
    if (setMenuOpen || !setMenu || !setBackdrop || !setToggle) return;
    setMenuOpen = true;
    if (setMenuHideTimer) { clearTimeout(setMenuHideTimer); setMenuHideTimer = null; }

    setBackdrop.hidden = false;
    setMenu.hidden = false;
    // A frame between `hidden` coming off and .is-open going on, or the two
    // style changes collapse into one and the transition never runs.
    requestAnimationFrame(() => {
      setBackdrop.classList.add('is-open');
      setMenu.classList.add('is-open');
    });

    setToggle.classList.add('is-open');
    setToggle.setAttribute('aria-expanded', 'true');
    setToggle.setAttribute('aria-label', 'Close the set menu');

    const current = setOpts.find((o) => o.hasAttribute('aria-current'));
    (current || setOpts[0])?.focus();

    // So the hardware/browser back gesture dismisses the panel instead of
    // leaving the site — the thing a visitor expects from an open sheet.
    history.pushState({ setMenu: true }, '');
  }

  // fromPop: the entry is already off the stack, so do not pop it again.
  function closeSetMenu(opts) {
    if (!setMenuOpen || !setMenu || !setBackdrop || !setToggle) return;
    const fromPop = !!(opts && opts.fromPop);
    const restoreFocus = !(opts && opts.restoreFocus === false);
    setMenuOpen = false;

    setMenu.classList.remove('is-open');
    setBackdrop.classList.remove('is-open');
    setToggle.classList.remove('is-open');
    setToggle.setAttribute('aria-expanded', 'false');
    setToggle.setAttribute('aria-label', 'Choose a body of work');

    // Focus would otherwise be stranded on a button that is about to leave the
    // tree, which drops the caret to the top of the document.
    if (restoreFocus && setMenu.contains(document.activeElement)) setToggle.focus();

    // Hold the nodes until the fade finishes, then take them out of the tree so
    // the backdrop cannot swallow taps meant for the photographs.
    if (setMenuHideTimer) clearTimeout(setMenuHideTimer);
    setMenuHideTimer = setTimeout(() => {
      setMenuHideTimer = null;
      setMenu.hidden = true;
      setBackdrop.hidden = true;
    }, 200);

    if (!fromPop && history.state && history.state.setMenu) history.back();
  }

  if (setToggle && setMenu && mobileEdition) {
    setToggle.addEventListener('click', () => {
      if (setMenuOpen) closeSetMenu();
      else openSetMenu();
    });

    setBackdrop?.addEventListener('click', () => closeSetMenu());

    setOpts.forEach((opt) => {
      opt.addEventListener('click', () => {
        const set = opt.dataset.setOpt;
        const changed = mobileEdition.dataset.set !== set;
        applySet(set);
        // A new body of work starts at its beginning, not at the scroll depth
        // of the one before it. .mobile-edition is its own scroll container.
        if (changed) mobileEdition.scrollTop = 0;
        // Focus goes back to the corner control, which is where the visitor's
        // thumb already is and the only thing left on screen.
        closeSetMenu({ restoreFocus: false });
        setToggle.focus();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && setMenuOpen) {
        e.preventDefault();
        closeSetMenu();
      }
    });

    window.addEventListener('popstate', () => {
      if (setMenuOpen) closeSetMenu({ fromPop: true });
    });

    // Crossing up past the breakpoint hands navigation back to the plane; a
    // panel left open would be hidden by CSS but still holding a history entry.
    window.addEventListener('resize', () => {
      if (setMenuOpen && window.innerWidth > 720) closeSetMenu();
    });

    applySet(mobileEdition.dataset.set || 'birds');
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

  // ---------- Resize / rotation ----------
  // Rotating a tablet fires this, and it changes both what fits on screen and
  // where the centre of it is. render() reads viewport() every frame, but the loop
  // sleeps once the plane settles, so one wake() is what actually re-pins the
  // plane to the new centre.
  window.addEventListener('resize', () => {
    // Shrinking only lowers the floor, which needs no correction. Growing raises
    // it, and can leave the plane pulled further back than a screen with that
    // much room is allowed to go.
    const floor = zoomFloor();
    if (zoom_target < floor) zoom_target = floor;
    wake();
  });

  // ---------- Collection switcher ----------
  // Three buttons stacked down the right edge, under the viewer toggle. The
  // markup lives in index.html so the labels are in the document without JS;
  // this only wires them up and keeps the pressed state honest.
  const switcherEl = document.getElementById('collections');
  const switchBtns = switcherEl
    ? Array.from(switcherEl.querySelectorAll('[data-collection]'))
    : [];

  function syncSwitcher() {
    switchBtns.forEach(b => {
      const on = b.dataset.collection === collection.key;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // A switch tears the plane down and rebuilds it from the new table. Focus is
  // keyed by arrangement index + slot id, and both mean something else now, so
  // it is dropped rather than re-resolved — otherwise the label would keep
  // naming a photograph from the collection you just left until the plane
  // happened to move.
  function setCollection(key, opts) {
    const next = COLLECTIONS.find(c => c.key === key);
    if (!next || next === collection) return;

    collection       = next;
    ITEMS            = next.items;
    FACTS            = next.facts;
    ARRANGEMENTS     = next.arrangements;
    ARRANGEMENT_LEAD = next.lead;

    buildPlane();

    focusedEls.forEach(el => el.classList.remove('is-focused'));
    focusedEls.clear();
    currentFocusKey = null;
    focusedSpecies  = null;
    fsShownSrc      = null;
    lastArr         = -1;
    if (labelTimeout) { clearTimeout(labelTimeout); labelTimeout = null; }
    speciesEl.classList.remove('is-visible');
    setBloomed(false);

    // Land on the new collection's opening photograph rather than lerping there
    // from a position that meant something in the old table.
    const c = openingCenter();
    panX = panX_target = c.x;
    panY = panY_target = c.y;
    vx = 0; vy = 0;
    dwelling = false;

    syncSwitcher();
    if (!opts || !opts.silent) {
      try {
        history.replaceState(null, '', key === COLLECTIONS[0].key ? location.pathname : '#' + key);
      } catch (_) { /* file:// and sandboxed frames refuse this; the switch still works */ }
    }
    bumpInteraction();
  }

  switchBtns.forEach(b => {
    b.addEventListener('click', (e) => {
      // Same reason as the viewer toggle: keep this away from the document
      // handler that closes the bloom on any outside click.
      e.stopPropagation();
      setCollection(b.dataset.collection);
      noteUiInteraction();
    });
  });

  // Kick off
  // A #events / #products fragment opens straight into that collection; the
  // switcher is bound before the first plane is built so there is only ever one
  // build on load, not one per collection visited.
  const fromHash = (location.hash || '').replace(/^#/, '');
  if (COLLECTIONS.some(c => c.key === fromHash)) {
    const next = COLLECTIONS.find(c => c.key === fromHash);
    collection = next;
    ITEMS = next.items; FACTS = next.facts;
    ARRANGEMENTS = next.arrangements; ARRANGEMENT_LEAD = next.lead;
    const c = openingCenter();
    panX = panX_target = c.x;
    panY = panY_target = c.y;
  }
  syncSwitcher();
  buildPlane();
  populateMobileBloom();
  scheduleCue();
  scheduleDwell();
  wake();

})();
