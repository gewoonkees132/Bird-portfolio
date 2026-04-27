---
title: Definitive Style Reference — Design Spec
date: 2026-04-27
status: draft
author: Kees Leemeijer (with Claude)
---

# Definitive Style Reference

Turn the working-draft style reference (`index.html` + `style.css`) into the document that (1) acts as the contract every future component, surface, and asset is checked against, (2) onboards a new collaborator in one read, and (3) settles design questions when they arise. The reference renders the system it documents — so making it definitive means making it *truthful* about what the system actually is, then closing the small set of system-completeness gaps that the brand already half-claims.

## Why this changes

The styleguide-revision pass landed the trinity (Foundations / Components / Patterns), the per-component anatomy template, and the Overlays pattern. The shell is sound. What remains are the leaks: drift between the written tokens and the rendered values, bodies of *what* without the *why*, accessibility values that fail at the sizes they're rendered, a responsive cliff between 1336 and 720, and a small number of out-of-system colors used as illustrative fixtures. None of these dilute the DNA — they're places where the reference documents itself imprecisely.

A new collaborator opening the page today gets the rules but cannot defend them. They cannot tell which values are tokenized and which are freehand. They cannot see how a non-focused photograph is treated by the brand even though the rule sits in `:root`. They have no way to evaluate a future surface against the contract because the contract isn't fully exposed. This pass closes those holes.

## Goals

- Every rendered value either *is* a token or *uses* a token, except for documented one-offs whose one-off-ness is named on the page
- Every canonical token is justified (the *why*) on the page, not only in code comments
- WCAG AA contrast holds for every body-text role at the size it's rendered
- The dog-food rule survives audit: the reference uses its own ladder (page-edge / gutter / cell / stride / tick) for its own paddings, gaps, and margins, and any exceptions are named exceptions
- The runtime + specimen contract inside `style.css` is mechanically obvious to a first-time reader
- One staged decision per remaining tension is captured here for Kees to settle in the user-review pass — none are resolved prematurely in the spec

## Non-goals

- Redesign. No DNA changes. Asymmetric alignment, italic blue Latin, mono utility, 1px radius, the 9 × 120 / 24 grid, the 3-layer elevation, the three-color palette — all stay
- Migration. No build step, no preprocessor, no framework, no Tailwind / shadcn / CSS-in-JS, no cascade-layers refactor, no `color-mix` rewrite. Vanilla HTML/CSS only
- Token-value changes. Hexes, type sizes, motion curves, grid dimensions are not retuned. The DNA values are canonical
- Component library expansion with generic atoms (buttons, inputs, modals) that have no role in a portfolio of bird photographs
- A separate "Surfaces" chapter. The IA closes at 1–3 + 99 (decision below); future surfaces become a sibling document, not chapter 4
- SEO, analytics, tracking, dark mode, theme variants

## Locked decisions

These are settled. Nothing in Phase 1 or Phase 2 below contradicts them.

1. **Plan shape — truth pass first, then extension.** Phase 1 makes the reference truthful. Phase 2 closes the system-completeness gaps. Each phase commits independently. The page is "definitive for what it claims" after Phase 1 and "definitive for what the brand needs" after Phase 2.

2. **CSS architecture — single file, hard internal divider.** `style.css` stays one file. The stale `// leading-source ... mirrored in the root styles.css` comment at lines 419–420 is replaced with a loud divider banner that names the contract: above the line is the runtime (the system being documented); below the line is the specimen (the document showing the system); the specimen may consume the runtime, the runtime may not reference the specimen. Splitting is correct in spirit but adds friction in a vanilla no-build workspace; revisit only if a build step or a second page appears.

3. **Out-of-palette red `#d72b2b` — removed.** The DNA has three colors. The "live" indicator was a SaaS reflex; a quiet, photographic, Steidl-style brand has nowhere to put a red blink. The indicator primitive is redrawn with on-palette parts (a `--blue` dot or a `--blue-soft` mono prefix); `style.css:1322` and `:1381` lose the red. If a future surface ever genuinely needs status, that's the moment to earn the color and the token.

4. **3.1 illustrative gradients — replaced with placeholder bands.** The cool-toned gradient at `style.css:1261` and the warm-toned gradient at `style.css:1331` (plus the radial highlight at `:1340`) are replaced with the system's existing photo-placeholder bands (`repeating-linear-gradient` of `--ph-band-a` / `--ph-band-b`). Cool-vs-warm tonal contrast is carried by varying band-color pairs across the slot-diagram and applied-example surfaces. The reference stays image-free (only `files/logo.svg`).

5. **IA closed at 1–3 + 99.** No 4.x reservation. The reference is a closed document about Foundations, Components, and Patterns plus a colophon. Surfaces become a sibling document or a future-earned chapter, not an empty room rendered in this one.

6. **Photography treatment folds into 1.4 Color.** The `--ambient-opacity` / `--ambient-saturate` / `--ambient-brightness` ladder is rendered as a sub-block under 1.4, after the swatch grid. A pair of placeholder-band cells shows the rule (ambient on the left, focused on the right). The Foundations count stays at eight.

## Phase 1 — Truth pass

Findings are grouped by file area and ordered P0 → P1 → P2 within each. Every finding cites a line or selector.

### A. Token discipline

**P0 — promote 2 tokens; pay down 6 hardcodes**

- Add `--placeholder-band-a: #d9d3c5` and `--placeholder-band-b: #cfc7b6` to the second `:root` block. Replace the six raw hex occurrences in the `repeating-linear-gradient` calls at `style.css:154–155`, `:363–364`, and `:855–856` with `var(--placeholder-band-a)` / `var(--placeholder-band-b)`. The bands are a brand fixture (the photo-loading skeleton); naming them earns its keep.

**P0 — replace 1 drift bug**

- `style.css:926` uses `#f0eadf` — a near-but-not-equal `--field`. Replace with `var(--field)` or, if a deliberate slight offset is desired for the inverted-stack readability, justify it with a code comment and tokenize as `--field-inverted`. Default action: replace with `var(--field)` (the difference is below the threshold of intent).

**P0 — remove 1 dead alias**

- `.sr-cell--12` at `style.css:523` is the legacy 12-col system carryover. Grep confirms zero usages anywhere in `index.html`. Delete the rule outright. (Not "deprecate" — the workspace has no deprecation policy and adding one for a single rule is debt for debt's sake.)

**P0 — replace 1 stale comment**

- The block comment at `style.css:417–421` claims `style.css` is leading-source and mirrored to the portfolio. Both claims are false relative to the workspace's own `CLAUDE.md`. Replace with the runtime/specimen divider banner described in locked decision 2.

**P1 — document the alpha ladder, do not tokenize it**

- Charcoal-on-field alpha values appearing in the file: `0.04` (subtle bg fill, 5 uses), `0.06` (1px borders, 2 uses), `0.10` / `0.12` (rules and checker fills, 5 uses), `0.50` / `0.55` / `0.60` (utility text, 7 uses), `0.70` / `0.75` (legend body, 2 uses). Blue-on-field alpha values: `0.05` / `0.08` / `0.10` / `0.12` / `0.18` / `0.35` (debug overlays, grid diagrams, dashed borders).
- Promoting these to tokens (`--charcoal-04`, `--charcoal-50`, etc.) would create ~10 new tokens to pay down ~25 hardcodes. The brief's working principle "no new tokens unless mathematically required" applies. The cleaner move is to *document the ladder as deliberate*: add a small "Alpha steps" table inside 1.4 Color showing the four roles charcoal-alpha plays (`bg-04`, `border-06/12`, `text-50/55/60`, `text-emphasis-70/75`) and the two roles blue-alpha plays (`grid-08/10`, `border-18/35`). Once the ladder is on the page, future use is constrained by what's documented; no token tax.

**P1 — name the body-type sizes as one-offs, not a ladder**

- Sizes appearing once each: `56px` (masthead title, `style.css:621`), `28px` (principles quote, `:643`), `22px` (section title, `:580`; token value display, `:971`), `26px` (brand-card font, `:205`), `16px` (elevation body, `:899`), `14px` (colophon signature, `:947`), `13px` (overlay sample, `:1316`). These are display roles, not a reusable scale. Promoting to tokens creates more debt than it pays.
- Action: add a "Display roles" sub-block inside 1.5 Typography listing each size by role. The role names anchor the values; new uses are constrained by the named role set.

**P1 — `#fff` over photographs is a documented rule**

- The two `#fff` occurrences at `style.css:1212` (anatomy callout glyph color, on a `--blue` chip) and `:1346` (overlay-applied layer text, on a dark photo) are the same logic: white over a dark plate. They don't tokenize cleanly (their meaning *is* "white," and white-on-blue is not a token). Document the rule in 3.1 Overlays' treatment block: "default inverse text over dark photo surfaces is `#fff` with `text-shadow 0 1px 2px rgba(0,0,0,0.4)`; backdrop-blur opt-in via `.overlay--backdrop` only when text-shadow is insufficient." This is the logic at `style.css:1395–1401` that already exists; surface it on the rendered page.

**P2 — magic spacing values**

- `0 18px 48px -12px rgba(0,0,0,0.18)` (focus shadow, `style.css:128`) — the system's only deep shadow. Token candidate `--shadow-focus`. Defer unless a second use appears.
- `60vw` species max-width (`style.css:267`) — viewport-relative. Document as "label may consume up to 60% of viewport width before clipping" in 2.2 Species label's anatomy block.
- `--gutter`-derived offsets (`32px` margin-top on group at `:461`) — replace with `calc(var(--page-edge) + var(--gutter))` so the relationship is mechanical rather than coincidental.

### B. The why — rationale on the page

**P1 — annotate every canonical token**

The DNA values are stated; almost none are justified. Add a one-line rationale to each, rendered beneath the token's specimen (not in code comments — *on the page*). Drafted by me; Kees revises voice in user-review.

- `u = 120, g = 24` — inherited from the photo-plane tessellation V4; chosen so a 9-col tile (1320×744) holds an integer count of 3:2 photographs at the brand's intended scale
- `tile-height = 5·u + 6·g = 744` — the off-by-16 fix (was 760) recorded in the code comment at `style.css:16`; surface it in 1.3 Grid as a worked equation
- `--focus-fade = 360ms`, `--focus-easing cubic-bezier(0.22, 0.61, 0.36, 1)` — fast start, gentle settle: the photograph emerges before the chrome resolves
- `--pan-lerp = 0.08` — empirically tuned; low enough to feel weighty, high enough not to lag the user's intent
- `#1635EE` (blue) — Munich '72 lineage; the games' graphic system used a high-saturation blue as a structural color
- `#F2EEE5` (field) — uncoated-paper cream; reference is Steidl monograph stock, not a screen background
- `#1A1A1A` (charcoal) — quiet ink; photographic neutral, not pure black, so type sits at the same density as photographic shadows
- `3:2` photo aspect — 35mm full-frame standard; the dominant aspect of the source images; the tile/grid math is built around it
- `--ambient-opacity 0.55, --ambient-saturate 0.65, --ambient-brightness 0.92` — non-focused photographs recede in attention but do not disappear; the rule says "the photograph in focus is the subject; everything else is evidence"

These rationales are flagged for Kees in user-review (see *Tensions flagged for Kees*). Some are confident (Munich '72 lineage on the blue); others are inferred and need Kees's voice.

### C. Accessibility

**P0 — contrast failures at the size rendered**

Measured against `--field` `#F2EEE5`:

- `.sr-section__stats` color `rgba(26,26,26,0.55)` at 10px (`style.css:594`) — effective contrast ~3.4:1, fails WCAG AA for normal text (needs 4.5:1). Bump to `0.65` or above; recompute.
- `.sr-cell__label` color `rgba(26,26,26,0.5)` at 10px (`style.css:530`) — same problem. Bump to `0.65`.
- `.sr-anatomy__usage` `opacity: 0.55; color: var(--charcoal)` at 12px (`style.css:1241`) — same problem. Bump opacity to `0.65` or use `rgba(26,26,26,0.65)` directly.
- `.sr-token__k` `rgba(26,26,26,0.55)` over `rgba(26,26,26,0.04)` background (`style.css:967`, `:958`) — slightly worse contrast due to the bg fill. Bump to `0.7`.
- `--blue-soft` `rgba(22,53,238,0.6)` on field for body-text use (`style.css:289`, `:307`, `:734`) — measured contrast ~3.05:1. Used at `--meta-size-d 0.74rem` (~12px), which is normal-text territory (large-text qualification needs ≥18pt regular or ≥14pt bold). The math is harsher than charcoal-on-field: bumping the alpha to 0.75 only reaches ~4.2:1 (still fails AA); reaching ~4.5:1 needs ~0.83+ alpha, at which point the swatch is visually indistinguishable from full `--blue`. *Tension:* `--blue-soft` is a canonical token, and the soft-vs-strong contrast between `--blue` and `--blue-soft` is part of the type ladder. Two on-brand options, neither painless:
  - **C1.** Keep `--blue-soft` at 0.6 for *non-text* roles only (the dashed border in 1.2 Identity, the section-stats `<b>` highlight color is full `--blue` already so unaffected, the rule under group markers). Move text roles (`.species .meta`, `.compass`, `.sr-type__sample--meta-d/m`, `.sr-overlay-primitive__name`) to full `--blue`. *Brand cost:* the meta line and compass instruction lose the soft character that distinguished them from the line-name. *Mitigation:* the mono face + uppercase + 0.08em letterspacing already differentiate meta from line-name; the color difference was secondary.
  - **C2.** Retire `--blue-soft` text-color usage as a token-text rule and add an explicit "Soft blue is for surfaces, not text" line in 1.4 Color. Internally identical to C1, but framed as a brand rule rather than a per-site fix. Also requires renaming or re-scoping `--blue-soft` so its name matches its new role (e.g., `--blue-rule` for the 0.6-alpha border / divider role).

This is flagged for Kees. Default if silent: **C1** (smallest blast radius; preserves token names).

**P0 — `:focus-visible` is unspecified**

The runtime advertises "Drag · arrow keys" via the compass but there is no documented focus-ring style. This is a P0 for the *runtime portfolio* even if the reference page is non-interactive. Add a small "Focus" sub-block inside 1.2 Identity or 1.7 Elevation:

```
:focus-visible — outline: 2px solid var(--blue);
                outline-offset: 2px;
                border-radius: 1px;
```

Render it on a dummy focusable element (a `<button>` with the rule applied) so the spec is on the page.

**P1 — landmarks**

Each `.sr-section` becomes `<section aria-labelledby="sr-{id}">` with the heading carrying that `id`. Mechanical change; touches every section in `index.html`.

**P1 — reduced-motion completeness**

`@media (prefers-reduced-motion: reduce)` covers the `.photo` / `.species` transitions (`style.css:413`) and the demo keyframes (`:874`), but not the `fadeIn` keyframe used by `.identity` (`:244`) and `.compass` (`:311`). Extend the rule to set `animation: none` on those two selectors.

### D. Responsive — the 1024px middle

**P1 — diagnose and document the cliff**

The page is `width: 1336px; max-width: 100%` (`style.css:432`) and the section grid is `grid-template-columns: repeat(9, 120px)` with `column-gap: 24px` (`:440–442`). At a 1024px viewport the cells (1080px) plus gutters (192px) plus padding (64px) overshoots the viewport; horizontal scroll appears or the inner layout breaks. The mobile fallback (`:1068`) hard-cuts to single-column at 720, leaving 720–1336 undocumented.

Two on-brand options, both viable:

- **D1. Author for 1336.** Document the reference as an authored-for-1336 artifact. Below 1336 the page is a single-column flow (move the existing `@media (max-width: 720px)` rule up to `(max-width: 1335px)`). Cleanest story; matches the photographer-monograph lineage (a printed page has one author width).
- **D2. Fluid mid-tier.** Replace `repeat(9, 120px)` with `repeat(9, minmax(0, 1fr))` and let the cells scale fluidly between 720 and 1336. Keep the absolute 120px ruler in 1.6 Spacing (the spec value); the rendered page just samples it. *Cost:* the rendered cell-width drifts from the documented 120px below 1336, which is itself a small dog-food violation.

This is flagged for Kees. Default action if no preference: **D1** (closes the cliff with one line; preserves the spec value across all rendered widths).

### E. Dog-food / self-consistency

**P1 — non-ladder spacing values inside `sr-*`**

- `.sr-anatomy__num` margin-right `6px` (`style.css:1209`) — not on the 2/4/24 ladder. Change to `8px` (sub-tick × 2 = the existing overlay-gap value).
- `.sr-principles__principles li` padding-left `28px` (`:671`) — chosen to fit the counter glyph; not on ladder. Document as "counter-glyph allowance" or change to `32px` (`page-edge + gutter`).
- `.sr-token` padding `12px 14px` (`:960`) — `12` is on the ladder (sub-tick × 3); `14` is not. Change to `12px 16px` or `12px 12px` so both axes ladder-snap.
- Identity / Species / Compass viewport offsets `18px` and `22px` (`style.css:232–233`, `:261–262`, `:300–301`) — these are *runtime* values, not specimen values. They are *not* on the page-edge / gutter ladder (which would give 8 or 32). **This is a runtime spec question** flagged for Kees: tokenize as `--viewport-edge` to encode the existing runtime feel, *or* align the runtime to `32 = page-edge + gutter`. Default action if no preference: tokenize at the existing values (don't change runtime feel without an explicit brand decision).

**P1 — rename demo keyframes for loud distinction**

`@keyframes sr-focus-fade` (`style.css:822`), `sr-label-cycle` (`:841`), `sr-photo-decode` (`:861`) are *demo-only loops* that imitate the runtime's transition-based motion. A copy-paste collaborator gets the loop, not the system. Rename to `sr-demo-focus-fade`, `sr-demo-label-cycle`, `sr-demo-photo-decode`. Add a one-line callout in 1.8 Motion: "demos loop for legibility; the runtime transitions once on focus change."

**P2 — `<b>` inside section-stats**

Used at multiple sites (`index.html:42, 115–117, 149–150, 197–198, 253–255, 297–298, 367, 402–404, 438–440, 472–477, 521, 551, 587–590, 663–665`) as a stat-highlight marker. `<b>` is unsemantic. Two options:

- **E1.** Keep `<b>` and document the pattern (`<b>` = "stat highlight"). One-line note in 1.5 Typography.
- **E2.** Rename to `<span class="sr-stat__count">`. BEM-correct; touches every section-stats site.

Default: **E1** (the rendered behavior is correct; renaming for semantic purity is debt-for-debt).

**P2 — mobile-rendering inside specimen, document the technique**

`style.css:884–895` forces `.mobile-edition` visible inside an `.sr-cell__body` so the mobile-cell specimen renders on desktop. This is a clean technique (specimen overrides the runtime's `display:none`), not a hack. Add a 2-line code comment explaining the override; flag in 2.6 Mobile cell's anatomy that "this cell renders here in a constrained frame; in the runtime it occupies the full viewport below 720px."

**P2 — `?grid` debug overlay**

`style.css:1017–1063` ships a URL-flag-toggled grid overlay. Production-safe (no styles unless `?grid` is in the URL). Document in the colophon as `?grid · debug overlay (URL flag)` so the next collaborator can find it.

### F. Voice & copy formulas — distributed, not centralized

The brief lists species naming, meta string, coordinate notation, camera/lens notation, light/time codes as gaps. Because the IA is closed at 1–3 + 99, none get a new section. They live where they're *used*:

- **Species label (2.2)** — anatomy block expands one line: `line-name: English title-case; latin: lowercase scientific binomial (Genus species), italic, --blue`. Accepted edge case: "if no settled binomial, use the most-recent published name; never coin one."
- **Compass (2.3)** — anatomy block expands one line: `instruction line: imperative · separator dot; state line: Arrangement {single uppercase letter}`.
- **Overlays (3.1)** — primitive table expands the `mono-utility` row: `coords: 52.37°N · 4.89°E (decimal, ° suffix, dot separator); gear: nikon z9 · 600mm f/4 (lowercase, dot separator); time-codes: banded 06:12 (lowercase verb · 24h)`.

This is Phase 1, not Phase 2 — these formulas are *anatomy* of components that already render, not new content.

### G. The "alectear" line

The masthead's principles quote at `index.html:47` reads `Munich '72 spirited inheritance · alectear-feel craft`. "alectear" is a coined term, not defined anywhere in code or docs. Two options:

- **G1.** Define it. Add a one-line gloss inside 1.1 Principles below the quote (e.g., `alectear — [Kees's definition]`). The brand owns the word.
- **G2.** Strike it. Replace with a defined word that carries the same sense (`hand-crafted`, `editorial-feel`, `naturalist-feel`).

Flagged for Kees. Default action if no preference: **G2** with `hand-crafted` as the substitute, with the original line preserved in a code comment for archival reasons.

## Phase 2 — Extension

### H. 1.4 Color — Photograph treatment sub-block

Adds the rendered ambient ladder per locked decision 6. Two `.photo` cells side-by-side, both using `--placeholder-band-a/b` (no real images). Left cell renders at ambient (`opacity 0.55`, `saturate 0.65`, `brightness 0.92`); right cell renders focused (no filter, full opacity). Caption: `non-focused — opacity 0.55 · saturate 0.65 · brightness 0.92 · subject becomes evidence`. Flag in 2.4 Photo cell's anatomy that "ambient is defined in 1.4 Color — Photograph treatment."

### I. Versioning — small Colophon expansion

The masthead's `v1 · 2026 · 04-27` says nothing about cadence, ownership, or changelog. The colophon already carries the version line. Expand to:

```
99 Colophon
   Set in ABC Diatype.
   Kees Leemeijer.
   v1 · 2026-04-27 · revisions logged in CHANGELOG.md
```

Create `style-reference/CHANGELOG.md` as a sibling to `CLAUDE.md`. Format: reverse-chronological, one entry per dated revision, each entry a one-line summary. Seed with the brainstorm-decision history in this spec.

Versioning rules (cadence, semver criteria, deprecation policy) move to `style-reference/CLAUDE.md` under a new "Versioning" section — they are agent-context, not rendered content.

### J. Sibling document — `surfaces.html` (not in this pass)

Per locked decision 5, surfaces (about / contact / single-photo viewer / OG card / business card / exhibition wall label / print zine) become a sibling document, not chapter 4. Phase 2 in *this* spec does not write that document; it adds a single colophon line: `surfaces — see surfaces.html (forthcoming)`. The actual surfaces document earns its own spec when its first concrete surface is needed.

## Tensions flagged for Kees

These are not resolved in this spec. Each gets a P0 user-review pass before writing-plans converts the spec into the ordered task list.

1. **`--blue-soft` contrast — split text/non-text uses (C1) or rename and rescope (C2).** Bumping the alpha alone does not reach AA at the meta size; the only honest fixes are moving text uses to full `--blue` (C1) or formalizing the new role under a renamed token (C2). The section-stats `<b>` already uses full `--blue` and is unaffected. Default if silent: **C1**.
2. **Responsive 1024px cliff — author-for-1336 (D1) or fluid mid-tier (D2).** Default if silent: D1.
3. **Runtime offsets 18 / 22px — tokenize as-is or align to 32.** Default if silent: tokenize as `--viewport-edge-d 18px` and `--viewport-edge-corner 22px` (don't change runtime feel without an explicit brand decision).
4. **"alectear-feel craft" — define (G1) or substitute (G2).** Default if silent: G2 with `hand-crafted`.
5. **`--ambient-*` rationales (and the rest of section B) — Kees's voice.** I draft confident copy where the lineage is clear (`#1635EE` Munich '72, `#F2EEE5` Steidl stock); I leave inline `[edit: Kees]` markers on `--focus-fade` choice, `--pan-lerp` choice, and the off-by-16 history. Default if silent: keep my drafts with the markers visible until Kees overwrites.
6. **`<b>` in section-stats — keep with documentation (E1) or rename to `<span class="sr-stat__count">` (E2).** Default if silent: E1.

## Acceptance criteria

The truth-pass is complete when all of the following hold. Phase 2 acceptance criteria are listed separately at the end.

### Phase 1

1. The two `:root` blocks at `style.css:13–24` and `:26–61` carry inline rationales (one line per token) for `--cell`, `--gutter`, `--tile-width`, `--tile-height`, `--focus-fade`, `--focus-easing`, `--pan-lerp`, `--blue`, `--field`, `--charcoal`, `--ambient-opacity`, `--ambient-saturate`, `--ambient-brightness`. The `[edit: Kees]` markers are present where the rationale is inferred.
2. The same rationales render on the page (1.3 Grid, 1.4 Color, 1.5 Typography, 1.8 Motion) — not only in code comments.
3. `--placeholder-band-a` and `--placeholder-band-b` exist in the second `:root`. The six raw `#d9d3c5` / `#cfc7b6` occurrences (`style.css:154–155`, `:363–364`, `:855–856`) reference them by `var()`.
4. `#d72b2b` and the `live` indicator are absent from `style.css` and `index.html`. The 3.1 Overlays primitive table renders an `indicator` example using `--blue` or `--blue-soft` only. The applied-overlay's `bl` slot uses an on-palette dot.
5. The two literal photo-stand-in gradients at `style.css:1261` and `:1331` (and the radial highlight at `:1340`) are replaced with `repeating-linear-gradient` calls using `--placeholder-band-a/b`. Cool-vs-warm contrast is achieved by varying the band-color pairs across the two surfaces.
6. The stale comment at `style.css:419–421` is replaced with a divider banner explicitly naming the runtime/specimen contract.
7. `.sr-cell--12` is absent from `style.css`. `#f0eadf` is absent (replaced by `var(--field)`).
8. Every `<section>` in `index.html` carries `aria-labelledby="sr-{id}"` and the corresponding heading carries the matching `id`.
9. WCAG AA contrast holds at the rendered size for `.sr-section__stats`, `.sr-cell__label`, `.sr-anatomy__usage`, `.sr-token__k`, and the meta-line role (per the Kees-resolved option for `--blue-soft`).
10. `:focus-visible` is documented on the rendered page with an example focusable element. The rule uses `--blue` and `--page-edge` (not magic numbers).
11. `prefers-reduced-motion` extends to `.identity` and `.compass` — both have `animation: none` inside the existing media query.
12. The `@media (max-width: 720px)` rule has been resolved per Kees's option D1/D2.
13. Demo keyframes are renamed `sr-demo-*`. 1.8 Motion carries the one-line callout distinguishing demos from runtime transitions.
14. Drift fixes: `sr-anatomy__num margin-right`, `sr-token padding`, `sr-group margin-top` all snap to the page-edge / gutter / sub-tick ladder.
15. The alpha-step ladder is rendered as a small table inside 1.4 Color (charcoal × 6 roles, blue × 2 roles). The display-roles table is rendered inside 1.5 Typography listing each one-off size by role.
16. The voice/copy formulas are added to the anatomy blocks of 2.2 Species label, 2.3 Compass, and 3.1 Overlays.
17. `style-reference/index.html` and `style.css` render correctly at `http://localhost:8000` with no console errors. `?grid` flag still works.

### Phase 2

18. 1.4 Color contains a `Photograph treatment` sub-block rendering the ambient-vs-focused contrast on two side-by-side placeholder-band cells with the rule captioned beneath.
19. The colophon's version line includes `revisions logged in CHANGELOG.md`. `style-reference/CHANGELOG.md` exists, seeded with the 2026-04-27 entry naming this spec.
20. `style-reference/CLAUDE.md` carries a new "Versioning" section with cadence, ownership, semver criteria, and deprecation policy.
21. The colophon includes a forward-reference line: `surfaces — see surfaces.html (forthcoming)`.

## Out of scope (explicitly)

- CSS modernization (cascade layers, nesting, logical properties, `color-mix`, `light-dark`, container queries, modern reset, framework adoption). The styleguide-revision spec already names this as a separate effort; nothing changes here.
- Token-value retuning. No hex / size / curve / dimension is changed. The DNA stays.
- Component library expansion (buttons, inputs, modals, toggles).
- Surfaces document. Phase 2 adds the colophon forward-reference; the surfaces document itself is a future spec.
- Bird-portfolio repo. The workspace's isolation rule holds: nothing above `style-reference/` is touched.
- SEO / analytics / tracking / theming / dark-mode.

## Open questions

The six tensions in *Tensions flagged for Kees* above. Each carries a default action if Kees declines to choose; the user-review pass on this spec is the resolution moment.
